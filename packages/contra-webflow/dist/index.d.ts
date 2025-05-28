/**
 * Professional Webflow Runtime for Contra Experts
 * Features: Performance optimization, advanced filtering, error handling, loading states
 */
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
     * Wire up filter controls to auto-update
     */
    private wireFilterControls;
    /**
     * Wire up action buttons (pagination, sorting, etc.)
     */
    private wireActionButtons;
    /**
     * Load experts for a program
     */
    private loadExperts;
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
     * Utility Methods
     */
    private getAttr;
    private querySelector;
    private querySelectorAll;
    private findExpertContainers;
    private parseFiltersFromElement;
    private getControlValue;
    private updateFilter;
    private handleAction;
    private showLoading;
    private showError;
    private dispatchEvent;
    private log;
}

export { ContraWebflowRuntime };
