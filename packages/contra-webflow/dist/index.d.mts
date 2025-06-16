/**
 * Webflow Runtime for Contra Experts
 * Features: Performance optimization, filtering, error handling, loading states
 */
interface RuntimeConfig {
    apiKey: string;
    program?: string;
    debug?: boolean;
    loadingClass?: string;
    errorClass?: string;
    emptyClass?: string;
    autoReload?: boolean;
    debounceDelay?: number;
    maxRetries?: number;
    paginationMode?: 'traditional' | 'infinite' | 'hybrid';
    infiniteScrollThreshold?: number;
    preloadNextPage?: boolean;
    maxCachedPages?: number;
    smoothScrollBehavior?: 'auto' | 'smooth';
    loadMoreText?: string;
    videoAutoplay?: boolean;
    videoHoverPlay?: boolean;
    videoMuted?: boolean;
    videoLoop?: boolean;
    videoControls?: boolean;
}
/**
 * Main Runtime Class
 */
declare class ContraWebflowRuntime {
    private client;
    private config;
    private state;
    private debouncedReload;
    constructor(config: RuntimeConfig);
    /**
     * Initialize the runtime and find all expert containers
     */
    init(): Promise<void>;
    /**
     * Initialize a single expert container
     */
    private initContainer;
    /**
     * Setup container with initial state and classes
     */
    private setupContainer;
    /**
     * Determine pagination mode from container attributes or config
     */
    private determinePaginationMode;
    /**
     * Setup pagination system based on mode
     */
    private setupPagination;
    /**
     * Setup infinite scroll functionality
     */
    private setupInfiniteScroll;
    /**
     * Setup traditional pagination button states
     */
    private setupTraditionalPagination;
    /**
     * Setup load more button for infinite scroll
     */
    private setupLoadMoreButton;
    /**
     * Wire up filter controls to auto-update
     */
    private wireFilterControls;
    /**
     * Wire up action buttons (pagination, sorting, etc.)
     */
    private wireActionButtons;
    /**
     * Load experts for a program with proper pagination handling
     */
    private loadExperts;
    /**
     * Handle traditional pagination response (page-based navigation)
     */
    private handleTraditionalPaginationResponse;
    /**
     * Handle infinite pagination response (cumulative loading)
     */
    private handleInfinitePaginationResponse;
    /**
     * Calculate current page from filters
     */
    private calculateCurrentPage;
    /**
     * Update pagination state consistently
     */
    private updatePaginationState;
    /**
     * Render experts into the container
     */
    private renderExperts;
    /**
     * Populate expert card from template
     */
    private populateExpertCard;
    /**
     * Populate data fields in the card
     */
    private populateFields;
    /**
     * Set element value with proper formatting
     */
    private setElementValue;
    /**
     * Star rating rendering with optional text display
     */
    private renderStarRating;
    /**
     * Media type detection and element handling
     */
    private isMediaField;
    /**
     * Media value setting with automatic type detection
     */
    private setMediaValue;
    /**
     * Detect media type from URL
     */
    private detectMediaType;
    /**
     * Create video element with fallback
     */
    private createVideoElement;
    /**
     * Create image element with error handling
     */
    private createImageElement;
    /**
     * Extract video thumbnail from Cloudinary URL
     */
    private extractVideoThumbnail;
    /**
     * Transfer attributes and classes from old element to new
     */
    private transferAttributes;
    /**
     * Handle repeating elements (projects, social links)
     */
    private populateRepeatingElements;
    /**
     * Populate a repeating container with items
     */
    private populateRepeatingContainer;
    /**
     * Handle conditional display based on data
     */
    private handleConditionalDisplay;
    /**
     * Evaluate a condition against expert data
     */
    private evaluateCondition;
    /**
     * Update UI states based on current data
     */
    private updateUIStates;
    /**
     * Handle action buttons with proper pagination logic
     */
    private handleAction;
    /**
     * Load more experts for infinite scroll mode
     */
    private loadMoreExperts;
    /**
     * Update load more button state
     */
    private updateLoadMoreButtonState;
    /**
     * Load next page for infinite scroll
     */
    private loadNextPageInfinite;
    /**
     * Update pagination control states based on current mode and state
     */
    private updatePaginationControls;
    /**
     * Update traditional pagination controls (Previous/Next buttons, page numbers)
     */
    private updateTraditionalPaginationControls;
    /**
     * Update infinite pagination controls (Load More button)
     */
    private updateInfinitePaginationControls;
    /**
     * Update infinite loading state
     */
    private updateInfiniteLoadingState;
    /**
     * Render new experts for infinite scroll (append mode)
     */
    private renderNewExperts;
    /**
     * Utility Methods
     */
    private getAttr;
    private querySelector;
    private querySelectorAll;
    private findExpertContainers;
    private parseFiltersFromElement;
    private getControlValue;
    private updateFilter;
    private showLoading;
    private showError;
    private dispatchEvent;
    private log;
}

export { ContraWebflowRuntime };
