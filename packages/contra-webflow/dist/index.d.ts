/**
 * Webflow Runtime for Contra Experts
 * Simplified for flexibility and predictability.
 */
interface RuntimeConfig {
    apiKey: string;
    debug?: boolean;
    loadingClass?: string;
    errorClass?: string;
    emptyClass?: string;
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
    private filterNameMap;
    private filterOptionLabels;
    constructor(config: RuntimeConfig);
    /**
     * Initialize the runtime by finding and setting up all lists.
     */
    init(): Promise<void>;
    /**
     * Initialize a single expert list.
     */
    private initList;
    /**
     * Wire up all action buttons on the page.
     */
    private wireActionButtons;
    /**
     * Load experts for a given list.
     */
    private loadExperts;
    /**
     * Render experts into the container. Can clear or append.
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
     * Update UI states based on current data for a specific list.
     */
    private updateUIStates;
    /**
     * Handle action buttons (just load-more for now).
     */
    private handleAction;
    private clearFilters;
    private resetControlValue;
    private updateFilterAndReload;
    private wireFilterControls;
    private debounce;
    /**
     * Utility Methods
     */
    private getAttr;
    private querySelector;
    private querySelectorAll;
    private parseFiltersFromElement;
    private getControlValue;
    private showLoading;
    private showError;
    private dispatchEvent;
    private log;
    private getAvailableFilters;
    private getFilterOptionLabel;
    private populateAllFilterControls;
    private populateSelectControl;
    private populateDatalistControl;
}

export { ContraWebflowRuntime };
