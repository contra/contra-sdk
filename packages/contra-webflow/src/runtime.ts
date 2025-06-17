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
 * Webflow Runtime for Contra Experts
 * Simplified for flexibility and predictability.
 */

// Simplified configuration
interface RuntimeConfig {
  apiKey: string;
  debug?: boolean;
  loadingClass?: string;
  errorClass?: string;
  emptyClass?: string;
  // Video configuration
  videoAutoplay?: boolean;
  videoHoverPlay?: boolean;
  videoMuted?: boolean;
  videoLoop?: boolean;
  videoControls?: boolean;
}

// Attribute constants
const ATTR_PREFIX = 'data-contra-';
const ATTRS = {
  // Core list attributes
  listId: 'list-id',
  program: 'program',
  template: 'template',
  
  // States
  loading: 'loading',
  error: 'error',
  empty: 'empty',
  
  // Field binding
  field: 'field',
  format: 'format',
  
  // Repeating elements
  repeat: 'repeat',
  max: 'max',
  
  // Sorting and pagination
  limit: 'limit',
  
  // Actions
  action: 'action',
  listTarget: 'list-target',

  // Conditional display
  showWhen: 'show-when',
  hideWhen: 'hide-when'
} as const;

// State management is now keyed by the list's unique ID
class RuntimeState {
  private states = new Map<string, {
    filters: ExpertFilters;
    experts: ExpertProfile[];
    loading: boolean;
    error: Error | null;
    offset: number;
    limit: number;
    totalCount: number;
    hasNextPage: boolean;
  }>();

  getState(listId: string) {
    if (!this.states.has(listId)) {
      this.states.set(listId, {
        filters: {},
        experts: [],
        loading: false,
        error: null,
        offset: 0,
        limit: 20, // Default limit
        totalCount: 0,
        hasNextPage: false
      });
    }
    return this.states.get(listId)!;
  }

  updateState(listId: string, updates: Partial<ReturnType<RuntimeState['getState']>>) {
    const state = this.getState(listId);
    Object.assign(state, updates);
    this.states.set(listId, state);
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
      // Video configuration defaults
      videoAutoplay: false,
      videoHoverPlay: true,
      videoMuted: true,
      videoLoop: true,
      videoControls: false,
      ...config
    };

    this.client = new ContraClient({
      apiKey: this.config.apiKey,
      debug: this.config.debug
    });

    this.log('Runtime initialized', this.config);
  }

  /**
   * Initialize the runtime by finding and setting up all lists.
   */
  async init(): Promise<void> {
    this.log('Initializing runtime...');

    try {
      // 1. Discover all lists on the page
      const listElements = this.querySelectorAll(document.body, `[${ATTR_PREFIX}${ATTRS.listId}]`);
      this.log(`Found ${listElements.length} lists to initialize.`);

      // 2. Initialize each list
      for (const listElement of listElements) {
        await this.initList(listElement);
      }

      // 3. Wire up all action buttons
      this.wireActionButtons();

      this.log('Runtime initialization complete');
    } catch (error) {
      this.log('Runtime initialization failed', error);
      throw error;
    }
  }

  /**
   * Initialize a single expert list.
   */
  private async initList(listElement: Element): Promise<void> {
    const listId = this.getAttr(listElement, ATTRS.listId);
    const programId = this.getAttr(listElement, ATTRS.program);

    if (!listId || !programId) {
      this.log('List element is missing required attributes `data-contra-list-id` or `data-contra-program`.', listElement);
      return;
    }

    this.log(`Initializing list: ${listId} for program: ${programId}`);

    try {
      // Mark as initialized
      (listElement as HTMLElement).setAttribute('data-contra-initialized', 'true');

      // Parse initial filters from the list element itself
      const initialFilters = this.parseFiltersFromElement(listElement);
      const limit = parseInt(this.getAttr(listElement, ATTRS.limit) || '20', 10);
      
      // Update state with these initial settings
      this.state.updateState(listId, { 
        filters: initialFilters,
        limit: limit,
        offset: initialFilters.offset || 0,
      });
      
      this.log(`List setup complete for: ${listId}`, { initialFilters, limit });
      
      // Load initial data for the list
      await this.loadExperts(listId, programId);

    } catch (error) {
      this.log(`Failed to initialize list ${listId}`, error);
      this.showError(listElement, error as Error);
    }
  }

  /**
   * Wire up all action buttons on the page.
   */
  private wireActionButtons(): void {
    const actionButtons = this.querySelectorAll(document.body, `[${ATTR_PREFIX}${ATTRS.action}]`);
    
    actionButtons.forEach(button => {
      const action = this.getAttr(button, ATTRS.action);
      const targetListId = this.getAttr(button, ATTRS.listTarget);
      
      if (!action || !targetListId) {
        this.log('Action button is missing required `data-contra-action` or `data-contra-list-target` attributes.', button);
        return;
      }

      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleAction(action, targetListId, button);
      });
    });
  }

  /**
   * Load experts for a given list.
   */
  private async loadExperts(listId: string, programId: string, append = false): Promise<void> {
    const listElement = this.querySelector(document.body, `[${ATTR_PREFIX}${ATTRS.listId}="${listId}"]`);
    if (!listElement) {
      this.log(`Cannot find list element with ID: ${listId}`);
      return;
    }

    const state = this.state.getState(listId);
    const filters = {
      ...state.filters,
      limit: state.limit,
      offset: state.offset,
    };
    
    this.log(`Loading experts for list: ${listId}`, filters);

    try {
      this.showLoading(listElement, true);
      this.state.updateState(listId, { loading: true, error: null });

      const response = await this.client.listExperts(programId, filters);
      
      this.log(`Loaded ${response.data.length} experts for list ${listId}`, response);

      const newExperts = response.data;
      const allExperts = append ? [...state.experts, ...newExperts] : newExperts;

      // Update state
      this.state.updateState(listId, {
        experts: allExperts,
        totalCount: response.totalCount,
        offset: state.offset + newExperts.length,
        hasNextPage: newExperts.length === state.limit,
        loading: false
      });

      // Render experts
      this.renderExperts(listElement, newExperts, append);
      
      // Update UI states
      this.updateUIStates(listElement, listId);

    } catch (error) {
      this.log(`Failed to load experts for list: ${listId}`, error);
      
      this.state.updateState(listId, { 
        loading: false, 
        error: error as Error 
      });
      
      this.showError(listElement, error as Error);
      
    } finally {
      this.showLoading(listElement, false);
    }
  }

  /**
   * Render experts into the container. Can clear or append.
   */
  private renderExperts(listElement: Element, experts: ExpertProfile[], append: boolean): void {
    const template = this.querySelector(listElement, `[${ATTR_PREFIX}${ATTRS.template}]`);
    if (!template) {
      this.log('No template found in list', listElement);
      return;
    }

    if (!append) {
      // Clear only previously rendered expert cards
      const existingCards = this.querySelectorAll(listElement, '.contra-rendered-item');
      existingCards.forEach(card => card.remove());
    }

    const fragment = document.createDocumentFragment();
    experts.forEach(expert => {
      const expertCard = this.populateExpertCard(template, expert);
      fragment.appendChild(expertCard);
    });
    listElement.appendChild(fragment);

    this.log(`Rendered ${experts.length} expert cards into list`, listElement);
  }

  /**
   * Populate expert card from template
   */
  private populateExpertCard(template: Element, expert: ExpertProfile): Element {
    const card = template.cloneNode(true) as Element;
    
    // Add a marker class to identify this as a rendered card
    card.classList.add('contra-rendered-item');
    
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
        this.renderStarRating(element, expert.averageReviewScore);
      }
    });
  }

  /**
   * Set element value with proper formatting
   */
  private setElementValue(element: Element, value: any, format?: string | null): void {
    if (value == null || value === '') return;

    // Media type detection and handling
    if (this.isMediaField(element) && typeof value === 'string' && value.trim()) {
      this.setMediaValue(element, value);
      return;
    }

    if (element instanceof HTMLAnchorElement) {
      element.href = String(value);
      if (element.children.length === 0 && !element.textContent?.trim()) {
        element.textContent = String(value);
      }
    } else if (element instanceof HTMLInputElement) {
      element.value = String(value);
    } else if (element instanceof HTMLImageElement) {
      // Regular image handling for avatars and other images
      element.src = String(value);
      element.alt = element.alt || 'Image';
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
          case 'rating':
            // Format rating to one decimal place (5.0, 4.9, etc.)
            displayValue = typeof value === 'number' ? value.toFixed(1) : displayValue;
            break;
          case 'earnings':
            // Format earnings like $25k+
            if (typeof value === 'number') {
              if (value >= 1000000) {
                displayValue = `$${Math.floor(value / 1000000)}M+`;
              } else if (value >= 1000) {
                displayValue = `$${Math.floor(value / 1000)}k+`;
              } else {
                displayValue = `$${value}`;
              }
            }
            break;
          case 'number':
            displayValue = typeof value === 'number' ? value.toLocaleString() : displayValue;
            break;
          case 'truncate':
            displayValue = displayValue.length > 100 ? displayValue.substring(0, 97) + '...' : displayValue;
            break;
          case 'boolean':
            displayValue = value ? 'Yes' : 'No';
            break;
          case 'availability':
            displayValue = value ? 'Available' : 'Not Available';
            break;
        }
      }
      
      element.textContent = displayValue;
    }
  }

  /**
   * Star rating rendering with optional text display
   */
  private renderStarRating(element: Element, rating: number): void {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let starsHtml = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
      starsHtml += '<span class="contra-star contra-star-full">★</span>';
    }
    
    // Half star
    if (hasHalfStar) {
      starsHtml += '<span class="contra-star contra-star-half">★</span>';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      starsHtml += '<span class="contra-star contra-star-empty">☆</span>';
    }
    
    element.innerHTML = starsHtml;
    
    // Also update any rating text elements in the same card
    const card = element.closest('[data-contra-template]') || element.closest('.expert-card');
    if (card) {
      const ratingTextElements = this.querySelectorAll(card, '[data-contra-rating-text]');
      ratingTextElements.forEach(textElement => {
        textElement.textContent = rating.toFixed(1);
      });
    }
  }

  /**
   * Media type detection and element handling
   */
  private isMediaField(element: Element): boolean {
    const field = this.getAttr(element, ATTRS.field);
    // Only apply advanced media handling to project cover URLs, not avatars
    return field === 'coverUrl';
  }

  /**
   * Media value setting with automatic type detection
   */
  private setMediaValue(element: Element, url: string): void {
    const mediaType = this.detectMediaType(url);
    const parent = element.parentElement;
    
    if (!parent) {
      this.log('Media element has no parent for replacement', element);
      return;
    }

    // Remove existing media element
    element.remove();

    // Create appropriate media element
    let mediaElement: HTMLElement;
    
    switch (mediaType) {
      case 'video':
        mediaElement = this.createVideoElement(url, element);
        break;
      case 'image':
      default:
        mediaElement = this.createImageElement(url, element);
        break;
    }

    // Preserve classes and attributes from original element
    this.transferAttributes(element, mediaElement);
    
    // Insert new media element
    parent.appendChild(mediaElement);
    
    this.log(`Created ${mediaType} element for URL: ${url}`);
  }

  /**
   * Detect media type from URL
   */
  private detectMediaType(url: string): 'image' | 'video' {
    if (!url || typeof url !== 'string') {
      this.log('Invalid URL provided to detectMediaType:', url);
      return 'image';
    }
    
    const urlLower = url.toLowerCase();
    
    // Video formats
    const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.ogg'];
    const isVideo = videoExtensions.some(ext => urlLower.includes(ext));
    
    // Special handling for Cloudinary video URLs
    const isCloudinaryVideo = urlLower.includes('cloudinary.com/') && urlLower.includes('/video/');
    
    return (isVideo || isCloudinaryVideo) ? 'video' : 'image';
  }

  /**
   * Create video element with fallback
   */
  private createVideoElement(url: string, originalElement: Element): HTMLVideoElement {
    const video = document.createElement('video');
    
    // Video attributes
    video.src = url;
    video.muted = this.config.videoMuted;
    video.loop = this.config.videoLoop;
    video.playsInline = true;
    video.preload = 'metadata';
    video.controls = this.config.videoControls;
    
    // Maintain aspect ratio and object-fit from original
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.objectFit = 'cover';
    video.style.borderRadius = 'inherit';
    
    // Autoplay configuration
    if (this.config.videoAutoplay) {
      video.autoplay = true;
      video.setAttribute('autoplay', '');
    }
    
    // Error handling with fallback to poster or placeholder
    video.onerror = () => {
      this.log(`Video failed to load: ${url}`);
      // Try to extract a thumbnail from Cloudinary video URL
      const posterUrl = this.extractVideoThumbnail(url);
      if (posterUrl) {
        const fallbackImg = this.createImageElement(posterUrl, originalElement);
        video.parentElement?.replaceChild(fallbackImg, video);
      } else {
        // Show placeholder
        video.style.background = '#f3f4f6';
        video.style.position = 'relative';
        video.innerHTML = '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#9ca3af;font-size:12px;">Video unavailable</div>';
      }
    };

    // Hover-to-play functionality (if enabled and not autoplay)
    if (this.config.videoHoverPlay && !this.config.videoAutoplay) {
      video.addEventListener('mouseenter', () => {
        video.currentTime = 0;
        video.play().catch(() => {
          // Ignore play errors (browser policies)
        });
      });

      video.addEventListener('mouseleave', () => {
        video.pause();
        video.currentTime = 0;
      });
    }

    return video;
  }

  /**
   * Create image element with error handling
   */
  private createImageElement(url: string, originalElement: Element): HTMLImageElement {
    const img = document.createElement('img');
    
    img.src = url;
    img.alt = originalElement.getAttribute('alt') || 'Media content';
    img.loading = 'lazy';
    
    // Maintain styling
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.style.borderRadius = 'inherit';
    
    // Error handling
    img.onerror = () => {
      this.log(`Image failed to load: ${url}`);
      img.style.background = '#f3f4f6';
      img.style.opacity = '0.5';
      img.alt = 'Image unavailable';
      
      // Add broken image icon
      img.style.position = 'relative';
      const placeholder = document.createElement('div');
      placeholder.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #9ca3af;
        font-size: 12px;
        text-align: center;
      `;
      placeholder.textContent = '🖼️ Image unavailable';
      img.parentElement?.appendChild(placeholder);
    };

    return img;
  }

  /**
   * Extract video thumbnail from Cloudinary URL
   */
  private extractVideoThumbnail(videoUrl: string): string | null {
    if (videoUrl.includes('cloudinary.com/') && videoUrl.includes('/video/')) {
      // Convert video URL to image thumbnail
      return videoUrl
        .replace('/video/', '/image/')
        .replace(/\.(mp4|webm|mov|avi|mkv)$/i, '.jpg')
        .replace('fl_progressive', 'f_auto,q_auto,c_fill');
    }
    return null;
  }

  /**
   * Transfer attributes and classes from old element to new
   */
  private transferAttributes(from: Element, to: HTMLElement): void {
    // Transfer classes
    if (from.className) {
      to.className = from.className;
    }
    
    // Transfer data attributes (except contra-field)
    Array.from(from.attributes).forEach(attr => {
      if (attr.name.startsWith('data-') && attr.name !== `${ATTR_PREFIX}${ATTRS.field}`) {
        to.setAttribute(attr.name, attr.value);
      }
    });
    
    // Transfer style
    if (from.getAttribute('style')) {
      const existingStyle = to.getAttribute('style') || '';
      to.setAttribute('style', existingStyle + '; ' + from.getAttribute('style'));
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
    if (!condition || typeof condition !== 'string') {
      this.log('Invalid condition provided:', condition);
      return false;
    }
    
    // Parse condition: "field:value" or "field:>value" etc.
    const parts = condition.split(':');
    if (parts.length < 2) {
      this.log('Invalid condition format:', condition);
      return false;
    }
    
    const field = parts[0];
    const restOfCondition = parts.slice(1).join(':'); // Handle colons in values
    const expertValue = (expert as any)[field];
    
    this.log(`Evaluating condition: ${field} (${expertValue}, type: ${typeof expertValue}) against ${restOfCondition}`);
    
    if (expertValue == null) {
      this.log(`Field '${field}' is null/undefined, condition fails`);
      return false;
    }
    
    // Check for comparison operators
    if (restOfCondition.startsWith('>=')) {
      const value = restOfCondition.substring(2);
      const result = Number(expertValue) >= Number(value);
      this.log(`Comparison: ${expertValue} >= ${value} = ${result}`);
      return result;
    } else if (restOfCondition.startsWith('<=')) {
      const value = restOfCondition.substring(2);
      const result = Number(expertValue) <= Number(value);
      this.log(`Comparison: ${expertValue} <= ${value} = ${result}`);
      return result;
    } else if (restOfCondition.startsWith('>')) {
      const value = restOfCondition.substring(1);
      const result = Number(expertValue) > Number(value);
      this.log(`Comparison: ${expertValue} > ${value} = ${result}`);
      return result;
    } else if (restOfCondition.startsWith('<')) {
      const value = restOfCondition.substring(1);
      const result = Number(expertValue) < Number(value);
      this.log(`Comparison: ${expertValue} < ${value} = ${result}`);
      return result;
    } else {
      // Direct value comparison with type-aware handling
      let result = false;
      
      // Handle boolean fields specially
      if (typeof expertValue === 'boolean') {
        // Convert string condition to boolean for comparison
        if (restOfCondition.toLowerCase() === 'true') {
          result = expertValue === true;
        } else if (restOfCondition.toLowerCase() === 'false') {
          result = expertValue === false;
        } else {
          result = false;
        }
        this.log(`Boolean comparison: ${expertValue} === ${restOfCondition.toLowerCase() === 'true'} = ${result}`);
      } else if (typeof expertValue === 'number') {
        // Handle numeric comparisons
        const numValue = Number(restOfCondition);
        result = !isNaN(numValue) && expertValue === numValue;
        this.log(`Number comparison: ${expertValue} === ${numValue} = ${result}`);
      } else {
        // String comparison (case-insensitive)
        const expertStr = String(expertValue);
        const valueStr = String(restOfCondition);
        result = expertStr.toLowerCase() === valueStr.toLowerCase();
        this.log(`String comparison: '${expertStr}' === '${valueStr}' = ${result}`);
      }
      
      return result;
    }
  }

  /**
   * Update UI states based on current data for a specific list.
   */
  private updateUIStates(listElement: Element, listId: string): void {
    const state = this.state.getState(listId);
    
    // Show/hide empty state
    const emptyElement = this.querySelector(listElement, `[${ATTR_PREFIX}${ATTRS.empty}]`);
    if (emptyElement) {
      (emptyElement as HTMLElement).style.display = state.experts.length === 0 && !state.loading ? '' : 'none';
    }

    // Update and control visibility of the load more button
    const loadMoreButton = this.querySelector(document.body, `[${ATTR_PREFIX}${ATTRS.listTarget}="${listId}"]`);
    if (loadMoreButton) {
      const btn = loadMoreButton as HTMLButtonElement;
      const hasMore = state.hasNextPage;

      btn.style.display = hasMore ? '' : 'none';
      btn.disabled = state.loading;
      btn.textContent = state.loading ? 'Loading...' : 'Load More';
    }
  }

  /**
   * Handle action buttons (just load-more for now).
   */
  private handleAction(action: string, targetListId: string, button: Element): void {
    if (action === 'load-more') {
      const listElement = this.querySelector(document.body, `[${ATTR_PREFIX}${ATTRS.listId}="${targetListId}"]`);
      const programId = this.getAttr(listElement!, ATTRS.program);
      if (listElement && programId) {
        this.loadExperts(targetListId, programId, true); // `true` to append
      } else {
        this.log(`Could not find list or program for target: ${targetListId}`);
      }
    }
  }

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

    // Ensure offset defaults to 0 if not specified
    if (filters.offset === undefined) {
      filters.offset = 0;
    }

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

    // Handle special cases for filter value conversion
    let processedValue = value;
    
    if (filterKey === 'available') {
      // Convert string values to boolean for availability filter
      if (typeof value === 'string') {
        if (value === 'true') {
          processedValue = true;
        } else if (value === 'false') {
          processedValue = false;
        } else if (value === '' || value === null) {
          processedValue = undefined; // No filter
        }
      }
    } else if (filterKey === 'minRate' || filterKey === 'maxRate') {
      // Convert empty strings to undefined for rate filters
      if (value === '' || value === null) {
        processedValue = undefined;
      } else {
        processedValue = Number(value);
      }
    }

    if (type === 'append' && Array.isArray(newFilters[filterKey as keyof ExpertFilters])) {
      const currentArray = newFilters[filterKey as keyof ExpertFilters] as any[];
      newFilters[filterKey as keyof ExpertFilters] = [...currentArray, processedValue] as any;
    } else {
      (newFilters as any)[filterKey] = processedValue;
    }

    // Reset offset to 0 when any filter changes (except offset itself)
    // This ensures we start from the beginning when filters change
    if (filterKey !== 'offset') {
      newFilters.offset = 0;
    }

    this.state.updateState(programId, { filters: newFilters });
    
    this.log(`Filter updated: ${filterKey} = ${processedValue} (original: ${value})`);
    
    // Dispatch filter change event
    const event: FilterChangeEvent = {
      filters: newFilters,
      element: document.querySelector(`[data-program-id="${programId}"]`) as HTMLElement
    };
    
    this.dispatchEvent(document as any, 'filterChange', event);
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
    
    // Validate required config
    if (!config.apiKey) {
      console.error('[ContraWebflow] API key is required in config.');
      return;
    }
    
    const initializeRuntime = () => {
      const runtime = new ContraWebflowRuntime(config);
      
      // Expose runtime globally for debugging
      (window as any).contraRuntime = runtime;
      
      runtime.init().catch(error => {
        console.error('[ContraWebflow] Runtime initialization failed:', error);
      });
    };
    
    // Use setTimeout to ensure DOM is fully ready
    setTimeout(initializeRuntime, 100);
    
  } catch (error) {
    console.error('[ContraWebflow] Failed to parse config:', error);
  }
}

// Auto-initialize when DOM is ready with multiple fallbacks
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', autoInit);
} else if (document.readyState === 'interactive') {
  // DOM is ready but resources might still be loading
  setTimeout(autoInit, 50);
} else {
  // DOM and resources are ready
  autoInit();
}

// Export runtime class for manual initialization
export { ContraWebflowRuntime as default }; 