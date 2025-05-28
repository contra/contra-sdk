import { ContraClient, utils } from '@contra/client';
import type {
  ExpertProfile,
  ExpertFilters,
  FilterChangeEvent,
  ExpertLoadEvent,
  ErrorEvent,
  ExpertField
} from '@contra/types';

/**
 * Professional Webflow Runtime for Contra Experts
 * Features: Performance optimization, advanced filtering, error handling, loading states
 */

// Configuration interface
interface RuntimeConfig {
  apiKey: string;
  debug?: boolean;
  loadingClass?: string;
  errorClass?: string;
  emptyClass?: string;
  autoReload?: boolean;
  debounceDelay?: number;
  maxRetries?: number;
}

// Attribute constants
const ATTR_PREFIX = 'data-contra-';
const ATTRS = {
  // Core attributes
  program: 'program',
  template: 'template',
  loading: 'loading',
  error: 'error',
  empty: 'empty',
  
  // Field binding
  field: 'field',
  format: 'format',
  
  // Repeating elements
  repeat: 'repeat',
  max: 'max',
  
  // Filter controls
  filter: 'filter',
  filterType: 'filter-type',
  
  // Sorting and pagination
  sort: 'sort',
  page: 'page',
  limit: 'limit',
  
  // UI states
  showWhen: 'show-when',
  hideWhen: 'hide-when',
  
  // Actions
  action: 'action',
  target: 'target'
} as const;

// State management
class RuntimeState {
  private states = new Map<string, {
    filters: ExpertFilters;
    experts: ExpertProfile[];
    loading: boolean;
    error: Error | null;
    currentPage: number;
    totalCount: number;
  }>();

  getState(programId: string) {
    if (!this.states.has(programId)) {
      this.states.set(programId, {
        filters: {},
        experts: [],
        loading: false,
        error: null,
        currentPage: 1,
        totalCount: 0
      });
    }
    return this.states.get(programId)!;
  }

  updateState(programId: string, updates: Partial<ReturnType<RuntimeState['getState']>>) {
    const state = this.getState(programId);
    Object.assign(state, updates);
    this.states.set(programId, state);
  }
}

/**
 * Main Runtime Class
 */
export class ContraWebflowRuntime {
  private client: ContraClient;
  private config: Required<RuntimeConfig>;
  private state = new RuntimeState();
  private debouncedReload: Map<string, () => void> = new Map();

  constructor(config: RuntimeConfig) {
    this.config = {
      debug: false,
      loadingClass: 'loading',
      errorClass: 'error',
      emptyClass: 'empty',
      autoReload: true,
      debounceDelay: 300,
      maxRetries: 3,
      ...config
    };

    this.client = new ContraClient({
      apiKey: this.config.apiKey,
      debug: this.config.debug
    });

    this.log('Runtime initialized', this.config);
  }

  /**
   * Initialize the runtime and find all expert containers
   */
  async init(): Promise<void> {
    this.log('Initializing runtime...');

    try {
      // Find all expert containers
      const containers = this.findExpertContainers();
      this.log(`Found ${containers.length} expert containers`);

      // Initialize each container
      for (const container of containers) {
        await this.initContainer(container);
      }

      this.log('Runtime initialization complete');
    } catch (error) {
      this.log('Runtime initialization failed', error);
      throw error;
    }
  }

  /**
   * Initialize a single expert container
   */
  private async initContainer(container: Element): Promise<void> {
    const programId = this.getAttr(container, ATTRS.program);
    if (!programId) {
      this.log('Container missing program ID', container);
      return;
    }

    this.log(`Initializing container for program: ${programId}`);

    try {
      // Setup container state
      this.setupContainer(container, programId);
      
      // Wire up filter controls
      this.wireFilterControls(container, programId);
      
      // Wire up action buttons
      this.wireActionButtons(container, programId);
      
      // Load initial data
      await this.loadExperts(container, programId);

    } catch (error) {
      this.log(`Failed to initialize container for program ${programId}`, error);
      this.showError(container, error as Error);
    }
  }

  /**
   * Setup container with initial state and classes
   */
  private setupContainer(container: Element, programId: string): void {
    const element = container as HTMLElement;
    
    // Add runtime classes
    element.classList.add('contra-runtime');
    element.setAttribute('data-program-id', programId);
    
    // Parse initial filters from attributes
    const initialFilters = this.parseFiltersFromElement(container);
    this.state.updateState(programId, { filters: initialFilters });
    
    // Create debounced reload function
    const debouncedReload = utils.debounce(() => {
      this.loadExperts(container, programId);
    }, this.config.debounceDelay);
    
    this.debouncedReload.set(programId, debouncedReload);
    
    this.log(`Container setup complete for program: ${programId}`, initialFilters);
  }

  /**
   * Wire up filter controls to auto-update
   */
  private wireFilterControls(container: Element, programId: string): void {
    const filterControls = this.querySelectorAll(container, `[${ATTR_PREFIX}${ATTRS.filter}]`);
    
    this.log(`Found ${filterControls.length} filter controls for program: ${programId}`);

    filterControls.forEach(control => {
      const filterKey = this.getAttr(control, ATTRS.filter);
      const filterType = this.getAttr(control, ATTRS.filterType) || 'replace';
      
      if (!filterKey) return;

      // Add event listeners based on control type
      if (control instanceof HTMLInputElement) {
        const eventType = control.type === 'range' || control.type === 'number' ? 'input' : 'change';
        
        control.addEventListener(eventType, () => {
          this.updateFilter(programId, filterKey, this.getControlValue(control), filterType);
          if (this.config.autoReload) {
            this.debouncedReload.get(programId)?.();
          }
        });
        
      } else if (control instanceof HTMLSelectElement) {
        control.addEventListener('change', () => {
          this.updateFilter(programId, filterKey, this.getControlValue(control), filterType);
          if (this.config.autoReload) {
            this.debouncedReload.get(programId)?.();
          }
        });
      }
      
      this.log(`Wired filter control: ${filterKey} (${filterType})`, control);
    });
  }

  /**
   * Wire up action buttons (pagination, sorting, etc.)
   */
  private wireActionButtons(container: Element, programId: string): void {
    const actionButtons = this.querySelectorAll(container, `[${ATTR_PREFIX}${ATTRS.action}]`);
    
    actionButtons.forEach(button => {
      const action = this.getAttr(button, ATTRS.action);
      const target = this.getAttr(button, ATTRS.target);
      
      if (!action) return;

      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleAction(programId, action, target, button);
      });
    });
  }

  /**
   * Load experts for a program
   */
  private async loadExperts(container: Element, programId: string): Promise<void> {
    const state = this.state.getState(programId);
    
    this.log(`Loading experts for program: ${programId}`, state.filters);

    try {
      // Show loading state
      this.showLoading(container, true);
      this.state.updateState(programId, { loading: true, error: null });

      // Fetch experts
      const response = await this.client.listExperts(programId, state.filters);
      
      this.log(`Loaded ${response.data.length} experts`, response);

      // Update state
      this.state.updateState(programId, {
        experts: response.data,
        totalCount: response.totalCount,
        loading: false
      });

      // Render experts
      this.renderExperts(container, response.data);
      
      // Update UI states
      this.updateUIStates(container, programId);
      
      // Dispatch event
      this.dispatchEvent(container, 'expertsLoaded', {
        experts: response.data,
        totalCount: response.totalCount,
        filters: state.filters
      } as ExpertLoadEvent);

    } catch (error) {
      this.log(`Failed to load experts for program: ${programId}`, error);
      
      this.state.updateState(programId, { 
        loading: false, 
        error: error as Error 
      });
      
      this.showError(container, error as Error);
      
      // Dispatch error event
      this.dispatchEvent(container, 'expertsError', {
        error: error as Error,
        context: `Loading experts for program ${programId}`
      } as ErrorEvent);
    } finally {
      this.showLoading(container, false);
    }
  }

  /**
   * Render experts into the container
   */
  private renderExperts(container: Element, experts: ExpertProfile[]): void {
    const template = this.querySelector(container, `[${ATTR_PREFIX}${ATTRS.template}]`);
    if (!template) {
      this.log('No template found in container', container);
      return;
    }

    // Clear existing expert cards (keep template)
    const existingCards = this.querySelectorAll(container, ':scope > *:not([data-contra-template]):not([data-contra-loading]):not([data-contra-error]):not([data-contra-empty])');
    existingCards.forEach(card => card.remove());

    // Render expert cards
    experts.forEach(expert => {
      const expertCard = this.populateExpertCard(template, expert);
      container.appendChild(expertCard);
    });

    this.log(`Rendered ${experts.length} expert cards`);
  }

  /**
   * Populate expert card from template
   */
  private populateExpertCard(template: Element, expert: ExpertProfile): Element {
    const card = template.cloneNode(true) as Element;
    
    // Remove template attribute and show the card
    card.removeAttribute(`${ATTR_PREFIX}${ATTRS.template}`);
    (card as HTMLElement).style.display = '';

    // Populate field bindings
    this.populateFields(card, expert);
    
    // Handle repeating elements (projects, social links)
    this.populateRepeatingElements(card, expert);
    
    // Handle conditional display
    this.handleConditionalDisplay(card, expert);

    return card;
  }

  /**
   * Populate data fields in the card
   */
  private populateFields(card: Element, expert: ExpertProfile): void {
    const fieldElements = this.querySelectorAll(card, `[${ATTR_PREFIX}${ATTRS.field}]`);
    
    fieldElements.forEach(element => {
      const fieldName = this.getAttr(element, ATTRS.field) as ExpertField;
      const format = this.getAttr(element, ATTRS.format);
      
      if (!fieldName || !(fieldName in expert)) return;

      const value = expert[fieldName];
      this.setElementValue(element, value, format);
    });

    // Handle star ratings
    const starsElements = this.querySelectorAll(card, '[data-contra-stars]');
    starsElements.forEach(element => {
      if (expert.averageReviewScore) {
        element.innerHTML = utils.renderStars(expert.averageReviewScore);
      }
    });
  }

  /**
   * Set element value with proper formatting
   */
  private setElementValue(element: Element, value: any, format?: string | null): void {
    if (value == null) return;

    if (element instanceof HTMLImageElement) {
      element.src = String(value);
      element.alt = element.alt || 'Image';
    } else if (element instanceof HTMLAnchorElement) {
      element.href = String(value);
      if (!element.textContent?.trim()) {
        element.textContent = String(value);
      }
    } else if (element instanceof HTMLInputElement) {
      element.value = String(value);
    } else {
      // Text content with formatting
      let displayValue = String(value);
      
      if (format) {
        switch (format) {
          case 'currency':
            displayValue = typeof value === 'number' ? `$${value}` : displayValue;
            break;
          case 'rate':
            displayValue = utils.formatRate(typeof value === 'number' ? value : null);
            break;
          case 'number':
            displayValue = typeof value === 'number' ? value.toLocaleString() : displayValue;
            break;
          case 'truncate':
            displayValue = displayValue.length > 100 ? displayValue.substring(0, 97) + '...' : displayValue;
            break;
        }
      }
      
      element.textContent = displayValue;
    }
  }

  /**
   * Handle repeating elements (projects, social links)
   */
  private populateRepeatingElements(card: Element, expert: ExpertProfile): void {
    const repeatElements = this.querySelectorAll(card, `[${ATTR_PREFIX}${ATTRS.repeat}]`);
    
    repeatElements.forEach(container => {
      const repeatType = this.getAttr(container, ATTRS.repeat);
      const maxItems = parseInt(this.getAttr(container, ATTRS.max) || '10');
      
      if (repeatType === 'projects' && expert.projects) {
        this.populateRepeatingContainer(container, expert.projects.slice(0, maxItems));
      } else if (repeatType === 'socialLinks' && expert.socialLinks) {
        this.populateRepeatingContainer(container, expert.socialLinks.slice(0, maxItems));
      } else if (repeatType === 'skillTags' && expert.skillTags) {
        this.populateRepeatingContainer(container, expert.skillTags.slice(0, maxItems).map((tag: string) => ({ name: tag })));
      }
    });
  }

  /**
   * Populate a repeating container with items
   */
  private populateRepeatingContainer(container: Element, items: any[]): void {
    const template = container.firstElementChild;
    if (!template) return;

    // Clear existing items
    container.innerHTML = '';
    
    // Create items from template
    items.forEach(item => {
      const itemElement = template.cloneNode(true) as Element;
      this.populateFields(itemElement, item);
      container.appendChild(itemElement);
    });
    
    // Hide container if no items
    if (items.length === 0) {
      (container as HTMLElement).style.display = 'none';
    }
  }

  /**
   * Handle conditional display based on data
   */
  private handleConditionalDisplay(card: Element, expert: ExpertProfile): void {
    const conditionalElements = this.querySelectorAll(card, `[${ATTR_PREFIX}${ATTRS.showWhen}], [${ATTR_PREFIX}${ATTRS.hideWhen}]`);
    
    conditionalElements.forEach(element => {
      const showWhen = this.getAttr(element, ATTRS.showWhen);
      const hideWhen = this.getAttr(element, ATTRS.hideWhen);
      
      let shouldShow = true;
      
      if (showWhen) {
        shouldShow = this.evaluateCondition(expert, showWhen);
      }
      
      if (hideWhen) {
        shouldShow = shouldShow && !this.evaluateCondition(expert, hideWhen);
      }
      
      (element as HTMLElement).style.display = shouldShow ? '' : 'none';
    });
  }

  /**
   * Evaluate a condition against expert data
   */
  private evaluateCondition(expert: ExpertProfile, condition: string): boolean {
    // Simple condition evaluation (can be extended)
    // Format: "field:value" or "field:>value" or "field:<value"
    const [field, operator, value] = condition.split(':');
    const expertValue = (expert as any)[field];
    
    if (expertValue == null) return false;
    
    switch (operator) {
      case '>':
        return Number(expertValue) > Number(value);
      case '<':
        return Number(expertValue) < Number(value);
      case '>=':
        return Number(expertValue) >= Number(value);
      case '<=':
        return Number(expertValue) <= Number(value);
      default:
        return String(expertValue).toLowerCase() === value.toLowerCase();
    }
  }

  /**
   * Update UI states based on current data
   */
  private updateUIStates(container: Element, programId: string): void {
    const state = this.state.getState(programId);
    
    // Show/hide empty state
    const emptyElement = this.querySelector(container, `[${ATTR_PREFIX}${ATTRS.empty}]`);
    if (emptyElement) {
      (emptyElement as HTMLElement).style.display = state.experts.length === 0 ? '' : 'none';
    }
    
    // Update pagination info
    const paginationElements = this.querySelectorAll(container, '[data-contra-pagination-info]');
    paginationElements.forEach(element => {
      const { currentPage, totalCount } = state;
      const pageSize = state.filters.limit || 20;
      const totalPages = Math.ceil(totalCount / pageSize);
      
      element.textContent = `Page ${currentPage} of ${totalPages} (${totalCount} total)`;
    });
    
    // Update filter summaries
    const filterSummaries = this.querySelectorAll(container, '[data-contra-filter-summary]');
    filterSummaries.forEach(element => {
      const activeFilters = Object.entries(state.filters)
        .filter(([_key, value]) => value != null && value !== '')
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
      
      element.textContent = activeFilters || 'No filters applied';
    });
  }

  // ... (utility methods continue below)

  /**
   * Utility Methods
   */
  private getAttr(element: Element, name: string): string | null {
    return element.getAttribute(`${ATTR_PREFIX}${name}`);
  }

  private querySelector(element: Element, selector: string): Element | null {
    return element.querySelector(selector);
  }

  private querySelectorAll(element: Element, selector: string): Element[] {
    return Array.from(element.querySelectorAll(selector));
  }

  private findExpertContainers(): Element[] {
    return Array.from(document.querySelectorAll(`[${ATTR_PREFIX}${ATTRS.program}]`));
  }

  private parseFiltersFromElement(element: Element): ExpertFilters {
    const filters: ExpertFilters = {};
    
    // Parse filter attributes
    const filterMap = {
      'available': 'available',
      'languages': 'languages', 
      'location': 'location',
      'min-rate': 'minRate',
      'max-rate': 'maxRate',
      'sort': 'sortBy',
      'limit': 'limit',
      'offset': 'offset'
    };

    Object.entries(filterMap).forEach(([attr, filterKey]) => {
      const value = this.getAttr(element, attr);
      if (value != null) {
        if (filterKey === 'available') {
          (filters as any)[filterKey] = value === 'true';
        } else if (filterKey === 'languages') {
          (filters as any)[filterKey] = value.split(',').map(v => v.trim());
        } else if (['minRate', 'maxRate', 'limit', 'offset'].includes(filterKey)) {
          (filters as any)[filterKey] = parseInt(value);
        } else {
          (filters as any)[filterKey] = value;
        }
      }
    });

    return filters;
  }

  private getControlValue(control: HTMLInputElement | HTMLSelectElement): any {
    if (control instanceof HTMLInputElement) {
      switch (control.type) {
        case 'checkbox':
          return control.checked;
        case 'number':
        case 'range':
          return control.valueAsNumber;
        default:
          return control.value;
      }
    } else if (control instanceof HTMLSelectElement) {
      if (control.multiple) {
        return Array.from(control.selectedOptions).map(option => option.value);
      }
      return control.value;
    }
    return null;
  }

  private updateFilter(programId: string, filterKey: string, value: any, type: string = 'replace'): void {
    const state = this.state.getState(programId);
    const newFilters = { ...state.filters };

    if (type === 'append' && Array.isArray(newFilters[filterKey as keyof ExpertFilters])) {
      const currentArray = newFilters[filterKey as keyof ExpertFilters] as any[];
      newFilters[filterKey as keyof ExpertFilters] = [...currentArray, value] as any;
    } else {
      (newFilters as any)[filterKey] = value;
    }

    this.state.updateState(programId, { filters: newFilters });
    
    // Dispatch filter change event
    const event: FilterChangeEvent = {
      filters: newFilters,
      element: document.querySelector(`[data-program-id="${programId}"]`) as HTMLElement
    };
    
    this.dispatchEvent(document as any, 'filterChange', event);
  }

  private handleAction(programId: string, action: string, _target?: string | null, _button?: Element): void {
    const state = this.state.getState(programId);
    
    switch (action) {
      case 'next-page':
        this.updateFilter(programId, 'offset', (state.filters.offset || 0) + (state.filters.limit || 20));
        break;
      case 'prev-page':
        this.updateFilter(programId, 'offset', Math.max(0, (state.filters.offset || 0) - (state.filters.limit || 20)));
        break;
      case 'clear-filters':
        this.state.updateState(programId, { filters: {} });
        break;
      case 'reload':
        this.client.clearCache(`experts:${programId}`);
        break;
    }
    
    if (this.config.autoReload) {
      this.debouncedReload.get(programId)?.();
    }
  }

  private showLoading(container: Element, show: boolean): void {
    const loadingElement = this.querySelector(container, `[${ATTR_PREFIX}${ATTRS.loading}]`);
    if (loadingElement) {
      (loadingElement as HTMLElement).style.display = show ? '' : 'none';
    }
    
    (container as HTMLElement).classList.toggle(this.config.loadingClass, show);
  }

  private showError(container: Element, error: Error): void {
    const errorElement = this.querySelector(container, `[${ATTR_PREFIX}${ATTRS.error}]`);
    if (errorElement) {
      errorElement.textContent = error.message;
      (errorElement as HTMLElement).style.display = '';
    }
    
    (container as HTMLElement).classList.add(this.config.errorClass);
    this.log('Error displayed', error);
  }

  private dispatchEvent(target: Element | Document, eventName: string, detail: any): void {
    const event = new CustomEvent(`contra:${eventName}`, { detail });
    target.dispatchEvent(event);
  }

  private log(message: string, ...args: any[]): void {
    if (this.config.debug) {
      console.log(`[ContraWebflow] ${message}`, ...args);
    }
  }
}

/**
 * Auto-initialize runtime when DOM is ready
 */
function autoInit(): void {
  const configElement = document.getElementById('contra-config');
  if (!configElement) {
    console.warn('[ContraWebflow] No config element found. Runtime not initialized.');
    return;
  }

  try {
    const config = JSON.parse(configElement.textContent || '{}');
    const runtime = new ContraWebflowRuntime(config);
    
    // Expose runtime globally for debugging
    (window as any).contraRuntime = runtime;
    
    runtime.init().catch(error => {
      console.error('[ContraWebflow] Runtime initialization failed:', error);
    });
    
  } catch (error) {
    console.error('[ContraWebflow] Failed to parse config:', error);
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', autoInit);
} else {
  autoInit();
}

// Export runtime class for manual initialization
export { ContraWebflowRuntime as default }; 