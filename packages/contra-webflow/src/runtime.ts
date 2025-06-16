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
 * Features: Performance optimization, filtering, error handling, loading states
 */

// Configuration interface
interface RuntimeConfig {
  apiKey: string;
  program?: string;  // Program ID from config
  debug?: boolean;
  loadingClass?: string;
  errorClass?: string;
  emptyClass?: string;
  autoReload?: boolean;
  debounceDelay?: number;
  maxRetries?: number;
  
  // Pagination Configuration
  paginationMode?: 'traditional' | 'infinite' | 'hybrid';
  infiniteScrollThreshold?: number;        // Pixels from bottom to trigger load
  preloadNextPage?: boolean;              // Preload next page for performance
  maxCachedPages?: number;                // Max pages to keep in memory
  smoothScrollBehavior?: 'auto' | 'smooth';
  loadMoreText?: string;                  // Custom "Load More" button text
  
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
  
  // Filter attributes
  available: 'available',
  
  // Sorting and pagination
  sort: 'sort',
  page: 'page',
  limit: 'limit',
  
  // Pagination mode and controls
  paginationMode: 'pagination-mode',
  infiniteLoading: 'infinite-loading',
  paginationInfo: 'pagination-info',
  
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
    // Advanced pagination state
    cachedPages: Map<number, ExpertProfile[]>;
    loadingPages: Set<number>;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    isInfiniteLoading: boolean;
    lastScrollPosition: number;
    paginationMode: 'traditional' | 'infinite' | 'hybrid';
  }>();

  getState(programId: string) {
    if (!this.states.has(programId)) {
      this.states.set(programId, {
        filters: {},
        experts: [],
        loading: false,
        error: null,
        currentPage: 1,
        totalCount: 0,
        // Advanced pagination defaults
        cachedPages: new Map(),
        loadingPages: new Set(),
        hasNextPage: false,
        hasPreviousPage: false,
        isInfiniteLoading: false,
        lastScrollPosition: 0,
        paginationMode: 'traditional'
      });
    }
    return this.states.get(programId)!;
  }

  updateState(programId: string, updates: Partial<ReturnType<RuntimeState['getState']>>) {
    const state = this.getState(programId);
    Object.assign(state, updates);
    this.states.set(programId, state);
  }

  // Advanced pagination helpers
  cachePage(programId: string, pageNumber: number, experts: ExpertProfile[]) {
    const state = this.getState(programId);
    state.cachedPages.set(pageNumber, experts);
    
    // Implement LRU cache cleanup
    if (state.cachedPages.size > 5) { // maxCachedPages from config
      const oldestPage = Math.min(...state.cachedPages.keys());
      state.cachedPages.delete(oldestPage);
    }
  }

  getCachedPage(programId: string, pageNumber: number): ExpertProfile[] | null {
    const state = this.getState(programId);
    return state.cachedPages.get(pageNumber) || null;
  }

  setPageLoading(programId: string, pageNumber: number, loading: boolean) {
    const state = this.getState(programId);
    if (loading) {
      state.loadingPages.add(pageNumber);
    } else {
      state.loadingPages.delete(pageNumber);
    }
  }

  isPageLoading(programId: string, pageNumber: number): boolean {
    const state = this.getState(programId);
    return state.loadingPages.has(pageNumber);
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
      program: '',  // Default empty program
      loadingClass: 'loading',
      errorClass: 'error',
      emptyClass: 'empty',
      autoReload: true,
      debounceDelay: 300,
      maxRetries: 3,
      // Pagination Configuration defaults
      paginationMode: 'traditional',
      infiniteScrollThreshold: 500,
      preloadNextPage: true,
      maxCachedPages: 5,
      smoothScrollBehavior: 'auto',
      loadMoreText: 'Load More',
      // Video configuration defaults
      videoAutoplay: false,      // No autoplay by default (better UX)
      videoHoverPlay: true,       // Hover to play by default
      videoMuted: true,           // Muted for autoplay compatibility
      videoLoop: true,            // Loop videos
      videoControls: false,       // No controls for cleaner look
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
      const allContainers = this.findExpertContainers();
      // Filter out already initialized containers
      const containers = allContainers.filter(container => 
        !container.hasAttribute('data-contra-initialized')
      );
      
      this.log(`Found ${containers.length} uninitialised expert containers (${allContainers.length} total)`);

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
    // Get program ID from config instead of element attribute
    const programId = this.config.program;
    if (!programId) {
      this.log('No program ID found in config', container);
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
    
    // Add runtime classes and unique identifier
    element.classList.add('contra-runtime');
    element.setAttribute('data-contra-initialized', 'true');
    element.setAttribute('data-program-id', programId); // Still set this for internal use
    
    // Parse initial filters from attributes
    const initialFilters = this.parseFiltersFromElement(container);
    
    // Determine pagination mode
    const paginationMode = this.determinePaginationMode(container);
    
    this.state.updateState(programId, { 
      filters: initialFilters,
      paginationMode: paginationMode
    });
    
    // Setup pagination
    this.setupPagination(container, programId, paginationMode);
    
    // Create debounced reload function
    const debouncedReload = utils.debounce(() => {
      this.loadExperts(container, programId);
    }, this.config.debounceDelay);
    
    this.debouncedReload.set(programId, debouncedReload);
    
    this.log(`Container setup complete for program: ${programId}`, { initialFilters, paginationMode });
  }

  /**
   * Determine pagination mode from container attributes or config
   */
  private determinePaginationMode(container: Element): 'traditional' | 'infinite' | 'hybrid' {
    const explicitMode = this.getAttr(container, 'pagination-mode') as 'traditional' | 'infinite' | 'hybrid';
    return explicitMode || this.config.paginationMode;
  }

  /**
   * Setup pagination system based on mode
   */
  private setupPagination(container: Element, programId: string, mode: 'traditional' | 'infinite' | 'hybrid'): void {
    this.log(`Setting up ${mode} pagination for program: ${programId}`);
    
    if (mode === 'infinite' || mode === 'hybrid') {
      this.setupInfiniteScroll(container, programId);
    }
    
    if (mode === 'traditional' || mode === 'hybrid') {
      this.setupTraditionalPagination(container, programId);
    }
    
    // Setup load more button for hybrid/infinite modes
    if (mode === 'infinite' || mode === 'hybrid') {
      this.setupLoadMoreButton(container, programId);
    }
  }

  /**
   * Setup infinite scroll functionality
   */
  private setupInfiniteScroll(container: Element, programId: string): void {
    let isScrolling = false;
    
    const handleScroll = utils.throttle(() => {
      if (isScrolling) return;
      
      const state = this.state.getState(programId);
      if (state.isInfiniteLoading || !state.hasNextPage) return;
      
      const scrollPosition = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const threshold = this.config.infiniteScrollThreshold;
      
      if (scrollPosition >= documentHeight - threshold) {
        isScrolling = true;
        this.loadNextPageInfinite(container, programId).finally(() => {
          isScrolling = false;
        });
      }
    }, 100);
    
    window.addEventListener('scroll', handleScroll);
    
    // Store cleanup function
    (container as any).__infiniteScrollCleanup = () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }

  /**
   * Setup traditional pagination button states
   */
  private setupTraditionalPagination(container: Element, programId: string): void {
    // Will be handled in updatePaginationControls
    this.updatePaginationControls(container, programId);
  }

  /**
   * Setup load more button for infinite scroll
   */
  private setupLoadMoreButton(container: Element, programId: string): void {
    const loadMoreButtons = this.querySelectorAll(container, '[data-contra-action="load-more"]');
    
    loadMoreButtons.forEach(button => {
      if (!button.textContent?.trim()) {
        button.textContent = this.config.loadMoreText;
      }
    });
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
  private async loadExperts(container: Element, programId: string, isPageNavigation = false): Promise<void> {
    const state = this.state.getState(programId);
    
    this.log(`Loading experts for program: ${programId}`, state.filters);

    try {
      // Show loading state
      this.showLoading(container, true);
      this.state.updateState(programId, { loading: true, error: null });

      // Check cache first for page navigation
      const currentPage = Math.floor((state.filters.offset || 0) / (state.filters.limit || 20)) + 1;
      if (isPageNavigation && state.paginationMode === 'traditional') {
        const cachedExperts = this.state.getCachedPage(programId, currentPage);
        if (cachedExperts) {
          this.log(`Using cached page ${currentPage}`);
          this.renderExperts(container, cachedExperts);
          this.state.updateState(programId, { 
            experts: cachedExperts, 
            currentPage: currentPage,
            loading: false 
          });
          this.updatePaginationControls(container, programId);
          this.showLoading(container, false);
          return;
        }
      }

      // Fetch experts
      const response = await this.client.listExperts(programId, state.filters);
      
      this.log(`Loaded ${response.data.length} experts`, response);

      // Calculate pagination state - simplified to match React implementation
      const limit = state.filters.limit || 20;
      const offset = state.filters.offset || 0;
      const page = Math.floor(offset / limit) + 1;
      const totalPages = Math.ceil(response.totalCount / limit);
      
      // Simple pagination logic like React: if we got a full page, there might be more
      const hasNextPage = response.data.length === limit;
      const hasPreviousPage = page > 1;

      // Update state with pagination info
      this.state.updateState(programId, {
        experts: response.data,
        totalCount: response.totalCount,
        currentPage: page,
        hasNextPage: hasNextPage,
        hasPreviousPage: hasPreviousPage,
        loading: false
      });

      // Cache the page
      this.state.cachePage(programId, page, response.data);

      // Render experts
      this.renderExperts(container, response.data);
      
      // Update UI states including pagination
      this.updateUIStates(container, programId);
      this.updatePaginationControls(container, programId);
      
      // Dispatch event
      this.dispatchEvent(container, 'expertsLoaded', {
        experts: response.data,
        totalCount: response.totalCount,
        filters: state.filters,
        page: page,
        totalPages: totalPages,
        hasNextPage: hasNextPage,
        hasPreviousPage: hasPreviousPage
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
      if (!element.textContent?.trim()) {
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

  /**
   * Handle action buttons (pagination, sorting, etc.)
   */
  private handleAction(programId: string, action: string, _target?: string | null, button?: Element): void {
    const state = this.state.getState(programId);
    const container = document.querySelector(`[data-program-id="${programId}"]`);
    
    if (!container) {
      this.log(`Container not found for program: ${programId}`);
      return;
    }

    // Show button feedback
    if (button && button instanceof HTMLButtonElement) {
      const originalText = button.textContent;
      button.disabled = true;
    }
    
    switch (action) {
      case 'next-page':
        const limit = state.filters.limit || 20;
        const nextOffset = (state.filters.offset || 0) + limit;
        
        if (nextOffset < state.totalCount) {
          this.updateFilter(programId, 'offset', nextOffset);
          // Use page navigation mode for caching
          setTimeout(() => {
            this.loadExperts(container as Element, programId, true);
          }, 0);
        }
        break;
        
      case 'prev-page':
        const prevOffset = Math.max(0, (state.filters.offset || 0) - (state.filters.limit || 20));
        this.updateFilter(programId, 'offset', prevOffset);
        // Use page navigation mode for caching
        setTimeout(() => {
          this.loadExperts(container as Element, programId, true);
        }, 0);
        break;
        
      case 'load-more':
        // Handle load more for all pagination modes
        this.loadMoreExperts(container as Element, programId).finally(() => {
          if (button && button instanceof HTMLButtonElement) {
            button.disabled = false;
          }
        });
        return; // Exit early to avoid re-enabling button
        
      case 'first-page':
        this.updateFilter(programId, 'offset', 0);
        setTimeout(() => {
          this.loadExperts(container as Element, programId, true);
        }, 0);
        break;
        
      case 'last-page':
        const lastPageOffset = Math.max(0, Math.floor((state.totalCount - 1) / (state.filters.limit || 20)) * (state.filters.limit || 20));
        this.updateFilter(programId, 'offset', lastPageOffset);
        setTimeout(() => {
          this.loadExperts(container as Element, programId, true);
        }, 0);
        break;
        
      case 'clear-filters':
        // Reset pagination when clearing filters
        this.state.updateState(programId, { 
          filters: { limit: state.filters.limit }, // Keep limit
          currentPage: 1,
          cachedPages: new Map() // Clear cache
        });
        if (this.config.autoReload) {
          this.debouncedReload.get(programId)?.();
        }
        break;
        
      case 'reload':
        // Clear cache and reload
        this.state.updateState(programId, { cachedPages: new Map() });
        this.client.clearCache(`experts:${programId}`);
        if (this.config.autoReload) {
          this.debouncedReload.get(programId)?.();
        }
        break;
    }
    
    // Re-enable button after action completes
    if (button && button instanceof HTMLButtonElement && action !== 'load-more') {
      setTimeout(() => {
        button.disabled = false;
      }, 100);
    }
  }

  /**
   * Load more experts - unified method for all pagination modes
   */
  private async loadMoreExperts(container: Element, programId: string): Promise<void> {
    const state = this.state.getState(programId);
    const limit = state.filters.limit || 20;
    
    // Calculate next offset based on currently loaded experts
    const currentOffset = state.experts.length;
    
    this.log(`Loading more experts: currentOffset=${currentOffset}, limit=${limit}`);

    try {
      this.state.updateState(programId, { isInfiniteLoading: true });
      this.updateLoadMoreButtonState(container, programId, true);

      // Fetch next batch - use current expert count as offset
      const response = await this.client.listExperts(programId, {
        ...state.filters,
        offset: currentOffset,
        limit: limit
      });

      this.log(`Loaded ${response.data.length} more experts from offset ${currentOffset}`);

      // Append new experts to existing ones (like React implementation)
      const allExperts = [...state.experts, ...response.data];
      
      // Simple pagination logic: if we got a full page, there might be more
      const hasNextPage = response.data.length === limit;
      
      this.state.updateState(programId, {
        experts: allExperts,
        totalCount: response.totalCount,
        hasNextPage: hasNextPage,
        isInfiniteLoading: false
      });

      // Render only the new experts (append mode)
      this.renderNewExperts(container, response.data);
      
      // Update pagination controls
      this.updatePaginationControls(container, programId);

      // Dispatch event
      this.dispatchEvent(container, 'expertsLoaded', {
        experts: response.data,
        totalExperts: allExperts,
        totalCount: response.totalCount,
        isLoadMore: true
      });

    } catch (error) {
      this.log(`Failed to load more experts`, error);
      this.state.updateState(programId, { isInfiniteLoading: false });
      
      // Show error in load more button
      this.updateLoadMoreButtonState(container, programId, false, 'Error loading more');
      
      setTimeout(() => {
        this.updateLoadMoreButtonState(container, programId, false);
      }, 3000);
    } finally {
      this.updateLoadMoreButtonState(container, programId, false);
    }
  }

  /**
   * Update load more button state
   */
  private updateLoadMoreButtonState(container: Element, programId: string, loading: boolean, errorText?: string): void {
    const loadMoreButtons = this.querySelectorAll(container, '[data-contra-action="load-more"]');
    const state = this.state.getState(programId);
    
    loadMoreButtons.forEach(button => {
      const btnElement = button as HTMLButtonElement;
      
      if (errorText) {
        btnElement.textContent = errorText;
        btnElement.disabled = true;
        btnElement.classList.add('error');
        return;
      }
      
      btnElement.classList.remove('error');
      
      if (loading) {
        btnElement.textContent = 'Loading...';
        btnElement.disabled = true;
        btnElement.classList.add('loading');
      } else {
        btnElement.classList.remove('loading');
        const hasMore = state.experts.length < state.totalCount;
        
        if (hasMore) {
          btnElement.textContent = this.config.loadMoreText;
          btnElement.disabled = false;
        } else {
          btnElement.textContent = 'All experts loaded';
          btnElement.disabled = true;
          btnElement.classList.add('disabled');
        }
      }
    });
  }

  /**
   * Load next page for infinite scroll
   */
  private async loadNextPageInfinite(container: Element, programId: string): Promise<void> {
    // Use the unified loadMoreExperts method
    return this.loadMoreExperts(container, programId);
  }

  /**
   * Update pagination control states
   */
  private updatePaginationControls(container: Element, programId: string): void {
    const state = this.state.getState(programId);
    const limit = state.filters.limit || 20;
    const totalPages = Math.ceil(state.totalCount / limit);
    
    // Update button states
    const prevButtons = this.querySelectorAll(container, '[data-contra-action="prev-page"]');
    const nextButtons = this.querySelectorAll(container, '[data-contra-action="next-page"]');

    // Previous page buttons
    prevButtons.forEach(button => {
      const btnElement = button as HTMLButtonElement;
      btnElement.disabled = state.currentPage <= 1;
      btnElement.classList.toggle('disabled', state.currentPage <= 1);
    });

    // Next page buttons
    nextButtons.forEach(button => {
      const btnElement = button as HTMLButtonElement;
      btnElement.disabled = state.currentPage >= totalPages;
      btnElement.classList.toggle('disabled', state.currentPage >= totalPages);
    });

    // Update load more buttons
    this.updateLoadMoreButtonState(container, programId, state.isInfiniteLoading);

    // Update pagination info elements
    const paginationInfoElements = this.querySelectorAll(container, '[data-contra-pagination-info]');
    paginationInfoElements.forEach(element => {
      const loadedCount = state.experts.length;
      const totalCount = state.totalCount;
      
      // Different info based on pagination mode
      if (state.paginationMode === 'infinite' || state.paginationMode === 'hybrid') {
        element.textContent = `Showing ${loadedCount} of ${totalCount} experts`;
      } else {
        element.textContent = `Page ${state.currentPage} of ${totalPages} (${totalCount} total)`;
      }
    });

    this.log(`Pagination controls updated: loaded ${state.experts.length}/${state.totalCount}, hasNext: ${state.hasNextPage}`);
  }

  /**
   * Update infinite loading state
   */
  private updateInfiniteLoadingState(container: Element, loading: boolean): void {
    const loadingIndicators = this.querySelectorAll(container, '[data-contra-infinite-loading]');
    
    loadingIndicators.forEach(indicator => {
      (indicator as HTMLElement).style.display = loading ? '' : 'none';
    });
  }

  /**
   * Render new experts for infinite scroll (append mode)
   */
  private renderNewExperts(container: Element, newExperts: ExpertProfile[]): void {
    const template = this.querySelector(container, `[${ATTR_PREFIX}${ATTRS.template}]`);
    if (!template) {
      this.log('No template found for rendering new experts', container);
      return;
    }

    // Create a document fragment for efficient DOM manipulation
    const fragment = document.createDocumentFragment();

    newExperts.forEach(expert => {
      const expertCard = this.populateExpertCard(template, expert);
      fragment.appendChild(expertCard);
    });

    // Append all new cards at once
    container.appendChild(fragment);

    this.log(`Rendered ${newExperts.length} new expert cards for load more`);
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
    this.log('Looking for expert containers...');
    
    // Simple and reliable approach: look for any element with key contra attributes
    const selectors = [
      '[data-contra-limit]',
      '[data-contra-pagination-mode]', 
      '[data-contra-template]'
    ];
    
    const foundElements: Element[] = [];
    
    for (const selector of selectors) {
      const elements = Array.from(document.querySelectorAll(selector));
      this.log(`Found ${elements.length} elements with selector: ${selector}`, elements);
      foundElements.push(...elements);
    }
    
    // Get unique containers
    const containers = new Set<Element>();
    
    for (const element of foundElements) {
      // If element has limit or pagination-mode, it's a container
      if (element.hasAttribute('data-contra-limit') || element.hasAttribute('data-contra-pagination-mode')) {
        containers.add(element);
        this.log('Found container (has limit/pagination):', element);
      } 
      // If element is a template, its parent is the container
      else if (element.hasAttribute('data-contra-template')) {
        const parent = element.parentElement;
        if (parent) {
          containers.add(parent);
          this.log('Found container (template parent):', parent);
        }
      }
    }
    
    const uniqueContainers = Array.from(containers);
    this.log(`Total unique containers found: ${uniqueContainers.length}`, uniqueContainers);
    
    return uniqueContainers;
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
    
    if (!config.program) {
      console.error('[ContraWebflow] Program ID is required in config.');
      return;
    }
    
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