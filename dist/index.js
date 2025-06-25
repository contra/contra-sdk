"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  ContraWebflowRuntime: () => ContraWebflowRuntime
});
module.exports = __toCommonJS(index_exports);

// src/client.ts
var _ContraClient = class _ContraClient {
  constructor(config) {
    this.cache = /* @__PURE__ */ new Map();
    this.pendingRequests = /* @__PURE__ */ new Map();
    this.config = {
      baseUrl: "https://contra.com",
      timeout: 1e4,
      debug: false,
      ...config
    };
    if (this.config.debug) {
      console.log("[ContraClient] Initialized with config:", this.config);
    }
  }
  /**
   * Core fetch method with retry logic and error handling
   */
  async fetch(endpoint, options = {}, retries = 3) {
    const url = `${this.config.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
    const requestOptions = {
      ...options,
      signal: controller.signal,
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": this.config.apiKey,
        "X-API-Key": this.config.apiKey,
        ...options.headers
      }
    };
    try {
      if (this.config.debug) {
        console.log(`[ContraClient] Fetching: ${url}`, requestOptions);
      }
      const response = await fetch(url, requestOptions);
      clearTimeout(timeoutId);
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = {
            code: `HTTP_${response.status}`,
            message: response.statusText || "Unknown error"
          };
        }
        if ((response.status >= 500 || response.status === 429) && retries > 0) {
          const delay = Math.pow(2, 3 - retries) * 1e3;
          await new Promise((resolve) => setTimeout(resolve, delay));
          return this.fetch(endpoint, options, retries - 1);
        }
        throw new ContraAPIError(errorData.message, errorData.code, response.status);
      }
      const data = await response.json();
      if (this.config.debug) {
        console.log(`[ContraClient] Response:`, data);
      }
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof ContraAPIError) {
        throw error;
      }
      if (error instanceof Error && error.name === "AbortError") {
        throw new ContraAPIError(`Request timeout after ${this.config.timeout}ms`, "TIMEOUT");
      }
      if (retries > 0) {
        const delay = Math.pow(2, 3 - retries) * 1e3;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.fetch(endpoint, options, retries - 1);
      }
      throw new ContraAPIError(
        error instanceof Error ? error.message : "Unknown error",
        "NETWORK_ERROR"
      );
    }
  }
  /**
   * Get from cache or fetch with request deduplication
   */
  async fetchWithCache(cacheKey, endpoint, ttl, options) {
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      if (this.config.debug) {
        console.log(`[ContraClient] Cache hit: ${cacheKey}`);
      }
      return cached.data;
    }
    const pendingKey = `${endpoint}${JSON.stringify(options)}`;
    if (this.pendingRequests.has(pendingKey)) {
      if (this.config.debug) {
        console.log(`[ContraClient] Request deduplication: ${pendingKey}`);
      }
      return this.pendingRequests.get(pendingKey);
    }
    const requestPromise = this.fetch(endpoint, options);
    this.pendingRequests.set(pendingKey, requestPromise);
    try {
      const data = await requestPromise;
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        ttl
      });
      return data;
    } finally {
      this.pendingRequests.delete(pendingKey);
    }
  }
  /**
   * Build query string from filters
   */
  buildQueryString(filters) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value != null && value !== "") {
        if (Array.isArray(value)) {
          params.set(key, value.join(","));
        } else {
          params.set(key, String(value));
        }
      }
    });
    const queryString = params.toString();
    return queryString ? `?${queryString}` : "";
  }
  /**
   * Get program information
   */
  async getProgram(programNid) {
    const cacheKey = `program:${programNid}`;
    const endpoint = `/public-api/programs/${programNid}`;
    const response = await this.fetchWithCache(
      cacheKey,
      endpoint,
      _ContraClient.CACHE_TTL.program
    );
    return response.data;
  }
  /**
   * List experts with advanced filtering and caching
   */
  async listExperts(programNid, filters = {}) {
    const queryString = this.buildQueryString(filters);
    const cacheKey = `experts:${programNid}:${JSON.stringify(filters)}`;
    const endpoint = `/public-api/programs/${programNid}/experts${queryString}`;
    return this.fetchWithCache(
      cacheKey,
      endpoint,
      _ContraClient.CACHE_TTL.experts
    );
  }
  /**
   * Search experts (using the main experts endpoint with filters)
   */
  async searchExperts(programNid, query, filters = {}) {
    const experts = await this.listExperts(programNid, filters);
    if (query.trim()) {
      const searchTerm = query.toLowerCase();
      experts.data = experts.data.filter(
        (expert) => expert.name && expert.name.toLowerCase().includes(searchTerm) || expert.oneLiner && expert.oneLiner.toLowerCase().includes(searchTerm) || expert.skillTags && expert.skillTags.some((tag) => tag && tag.toLowerCase().includes(searchTerm))
      );
    }
    return experts;
  }
  /**
   * Get available filter options for a program
   */
  async getFilterOptions(programNid) {
    const cacheKey = `filters:${programNid}`;
    const endpoint = `/public-api/programs/${programNid}/filters`;
    return this.fetchWithCache(
      cacheKey,
      endpoint,
      _ContraClient.CACHE_TTL.filters
    );
  }
  /**
   * Clear cache (useful for forced refreshes)
   */
  clearCache(pattern) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
    if (this.config.debug) {
      console.log(`[ContraClient] Cache cleared${pattern ? ` (pattern: ${pattern})` : ""}`);
    }
  }
  /**
   * Get cache statistics
   */
  getCacheStats() {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([key, value]) => ({
      key,
      age: now - value.timestamp,
      ttl: value.ttl
    }));
    return {
      size: this.cache.size,
      entries
    };
  }
};
// Cache TTL settings (in milliseconds)
_ContraClient.CACHE_TTL = {
  experts: 5 * 60 * 1e3,
  // 5 minutes for expert lists
  expert: 10 * 60 * 1e3,
  // 10 minutes for individual experts
  program: 30 * 60 * 1e3,
  // 30 minutes for program info
  filters: 60 * 60 * 1e3
  // 1 hour for available filters
};
var ContraClient = _ContraClient;
var ContraAPIError = class extends Error {
  constructor(message, code, status) {
    super(message);
    this.code = code;
    this.status = status;
    this.name = "ContraAPIError";
  }
};
var utils = {
  /**
   * Format hourly rate with proper handling of null values
   */
  formatRate(rate) {
    return rate ? `$${rate}/hr` : "Rate on request";
  },
  /**
   * Generate star rating HTML
   */
  renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    let html = "";
    for (let i = 0; i < fullStars; i++) {
      html += `<svg class="star star-full" width="16" height="16" viewBox="0 0 24 24" fill="#FFD700">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>`;
    }
    if (hasHalfStar) {
      html += `<svg class="star star-half" width="16" height="16" viewBox="0 0 24 24">
        <defs>
          <linearGradient id="half-${rating}">
            <stop offset="50%" stop-color="#FFD700"/>
            <stop offset="50%" stop-color="#E5E5E5"/>
          </linearGradient>
        </defs>
        <path fill="url(#half-${rating})" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>`;
    }
    for (let i = 0; i < emptyStars; i++) {
      html += `<svg class="star star-empty" width="16" height="16" viewBox="0 0 24 24" fill="#E5E5E5">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>`;
    }
    return html;
  },
  /**
   * Debounce function for search inputs
   */
  debounce(func, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },
  /**
   * Throttle function for scroll events
   */
  throttle(func, limit) {
    let inThrottle;
    return (...args) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};

// src/runtime.ts
var CLOUDINARY_TRANSFORM_PREFIXES = [
  "w_",
  "h_",
  "c_",
  "f_",
  "q_",
  "fl_",
  "vc_",
  "b_",
  "e_",
  "o_",
  "a_",
  "dpr_",
  "ar_"
];
var ATTR_PREFIX = "data-contra-";
var ATTRS = {
  // Core list attributes
  listId: "list-id",
  program: "program",
  template: "template",
  // States
  loading: "loading",
  error: "error",
  empty: "empty",
  // Field binding
  field: "field",
  format: "format",
  // Repeating elements
  repeat: "repeat",
  max: "max",
  // Sorting and pagination
  limit: "limit",
  // Actions
  action: "action",
  listTarget: "list-target",
  // Conditional display
  showWhen: "show-when",
  hideWhen: "hide-when",
  prerenderPlaceholders: "prerender-placeholders"
};
var RuntimeState = class {
  constructor() {
    this.states = /* @__PURE__ */ new Map();
  }
  getState(listId) {
    if (!this.states.has(listId)) {
      this.states.set(listId, {
        filters: {},
        experts: [],
        loading: false,
        error: null,
        offset: 0,
        limit: 20,
        // Default limit
        totalCount: 0,
        hasNextPage: false
      });
    }
    return this.states.get(listId);
  }
  updateState(listId, updates) {
    const state = this.getState(listId);
    Object.assign(state, updates);
    this.states.set(listId, state);
  }
};
var ContraWebflowRuntime = class {
  constructor(config) {
    this.state = new RuntimeState();
    this.debouncedReload = /* @__PURE__ */ new Map();
    this.filterNameMap = {
      locations: "location"
    };
    this.filterOptionLabels = {
      sortBy: {
        relevance: "Relevance",
        oldest: "Oldest",
        newest: "Newest",
        rate_asc: "Rate (Low to High)",
        rate_desc: "Rate (High to Low)"
      }
    };
    this.config = {
      debug: false,
      loadingClass: "loading",
      errorClass: "error",
      emptyClass: "empty",
      // Video configuration defaults
      videoAutoplay: false,
      videoHoverPlay: true,
      videoMuted: true,
      videoLoop: true,
      videoControls: false,
      // Cloudinary transformation defaults
      imageTransformations: "f_auto,q_auto:eco,c_limit,w_800",
      videoTransformations: "fl_progressive,f_auto,q_auto:eco,vc_auto,c_limit,h_720",
      optimizeGifsAsVideo: true,
      contraAnalytics: true,
      ...config
    };
    this.client = new ContraClient({
      apiKey: this.config.apiKey,
      debug: this.config.debug
    });
    this.log("Runtime initialized", this.config);
  }
  /**
   * Initialize the runtime by finding and setting up all lists.
   */
  async init() {
    this.log("Initializing runtime...");
    try {
      const listElements = this.querySelectorAll(document.body, `[${ATTR_PREFIX}${ATTRS.listId}]`);
      this.log(`Found ${listElements.length} lists to initialize.`);
      const programFilters = /* @__PURE__ */ new Map();
      for (const listElement of listElements) {
        const programId = this.getAttr(listElement, ATTRS.program);
        if (programId && !programFilters.has(programId)) {
          this.log(`Fetching filters for program: ${programId}`);
          programFilters.set(programId, await this.getAvailableFilters(programId));
        }
      }
      this.populateAllFilterControls(programFilters);
      for (const listElement of listElements) {
        await this.initList(listElement);
      }
      this.wireActionButtons();
      this.wireFilterControls();
      this.log("Runtime initialization complete");
    } catch (error) {
      this.log("Runtime initialization failed", error);
      throw error;
    }
  }
  /**
   * Initialize a single expert list.
   */
  async initList(listElement) {
    const listId = this.getAttr(listElement, ATTRS.listId);
    const programId = this.getAttr(listElement, ATTRS.program);
    if (!listId || !programId) {
      this.log("List element is missing required attributes `data-contra-list-id` or `data-contra-program`.", listElement);
      return;
    }
    this.log(`Initializing list: ${listId} for program: ${programId}`);
    try {
      listElement.setAttribute("data-contra-initialized", "true");
      listElement.classList.add("contra-list");
      const limit = parseInt(this.getAttr(listElement, ATTRS.limit) || "20", 10);
      const template = this.querySelector(listElement, `[${ATTR_PREFIX}${ATTRS.template}]`);
      if (template && listElement.hasAttribute(`${ATTR_PREFIX}${ATTRS.prerenderPlaceholders}`)) {
        this.log(`Prerendering ${limit} placeholders for list: ${listId}`);
        for (let i = 0; i < limit; i++) {
          const placeholder = template.cloneNode(true);
          placeholder.removeAttribute(`${ATTR_PREFIX}${ATTRS.template}`);
          placeholder.classList.add("contra-placeholder-item");
          placeholder.style.display = "";
          listElement.appendChild(placeholder);
        }
      }
      if (template) {
        template.style.display = "none";
        this.log(`Template found and hidden for list: ${listId}`);
      }
      const loadingEl = this.querySelector(listElement, `[${ATTR_PREFIX}${ATTRS.loading}]`);
      if (loadingEl) loadingEl.style.removeProperty("display");
      const emptyEl = this.querySelector(listElement, `[${ATTR_PREFIX}${ATTRS.empty}]`);
      if (emptyEl) emptyEl.style.removeProperty("display");
      const initialFilters = this.parseFiltersFromElement(listElement);
      this.state.updateState(listId, {
        filters: initialFilters,
        limit,
        offset: initialFilters.offset || 0
      });
      this.state.updateState(listId, { loading: true, error: null });
      this.showLoading(listElement, true);
      const response = await this.client.listExperts(programId, initialFilters);
      this.log(`Loaded ${response.data.length} experts for list ${listId}`, response);
      const newExperts = response.data;
      const allExperts = newExperts;
      this.state.updateState(listId, {
        experts: allExperts,
        totalCount: response.totalCount,
        offset: initialFilters.offset || 0 + newExperts.length,
        hasNextPage: newExperts.length === limit,
        loading: false
      });
      this.renderExperts(listElement, newExperts, false);
      this.updateUIStates(listElement, listId);
    } catch (error) {
      this.log(`Failed to initialize list ${listId}`, error);
      this.state.updateState(listId, { loading: false, error });
      this.showError(listElement, error);
    } finally {
      this.showLoading(listElement, false);
    }
  }
  /**
   * Wire up all action buttons on the page.
   */
  wireActionButtons() {
    const actionButtons = this.querySelectorAll(document.body, `[${ATTR_PREFIX}${ATTRS.action}]`);
    actionButtons.forEach((button) => {
      const action = this.getAttr(button, ATTRS.action);
      const targetListId = this.getAttr(button, ATTRS.listTarget);
      if (!action || !targetListId) {
        this.log("Action button is missing required `data-contra-action` or `data-contra-list-target` attributes.", button);
        return;
      }
      button.addEventListener("click", (e) => {
        e.preventDefault();
        this.handleAction(action, targetListId, button);
      });
    });
  }
  /**
   * Load experts for a given list.
   */
  async loadExperts(listId, programId, append = false) {
    const listElement = this.querySelector(document.body, `[${ATTR_PREFIX}${ATTRS.listId}="${listId}"]`);
    if (!listElement) {
      this.log(`Cannot find list element with ID: ${listId}`);
      return;
    }
    const emptyElement = this.querySelector(listElement, `[${ATTR_PREFIX}${ATTRS.empty}]`);
    if (!append && emptyElement) {
      emptyElement.style.display = "none";
    }
    const state = this.state.getState(listId);
    const filters = {
      ...state.filters,
      limit: state.limit,
      offset: state.offset
    };
    this.log(`Loading experts for list: ${listId}`, filters);
    try {
      this.showLoading(listElement, true);
      this.state.updateState(listId, { loading: true, error: null });
      const response = await this.client.listExperts(programId, filters);
      this.log(`Loaded ${response.data.length} experts for list ${listId}`, response);
      const newExperts = response.data;
      const allExperts = append ? [...state.experts, ...newExperts] : newExperts;
      this.state.updateState(listId, {
        experts: allExperts,
        totalCount: response.totalCount,
        offset: state.offset + newExperts.length,
        hasNextPage: newExperts.length === state.limit,
        loading: false
      });
      this.renderExperts(listElement, newExperts, append);
      this.updateUIStates(listElement, listId);
    } catch (error) {
      this.log(`Failed to load experts for list: ${listId}`, error);
      this.state.updateState(listId, { loading: false, error });
      this.showError(listElement, error);
    } finally {
      this.showLoading(listElement, false);
    }
  }
  /**
   * Render experts into the container. Can clear or append.
   */
  renderExperts(listElement, experts, append) {
    const template = this.querySelector(listElement, `[${ATTR_PREFIX}${ATTRS.template}]`);
    if (!template) {
      this.log("No template found in list", listElement);
      return;
    }
    const listId = this.getAttr(listElement, ATTRS.listId);
    const placeholders = this.querySelectorAll(listElement, ".contra-placeholder-item");
    if (!append && placeholders.length > 0) {
      this.log(`Populating ${experts.length} of ${placeholders.length} placeholders for list.`);
      experts.forEach((expert, i) => {
        const placeholder = placeholders[i];
        if (placeholder) {
          this._configureCard(placeholder, expert, listId);
          placeholder.classList.remove("contra-placeholder-item");
        }
      });
      if (experts.length < placeholders.length) {
        this.log(`Removing ${placeholders.length - experts.length} unused placeholders.`);
        for (let i = experts.length; i < placeholders.length; i++) {
          placeholders[i].remove();
        }
      }
      this.log(`Finished rendering placeholders for list`, listElement);
      return;
    }
    if (!append) {
      const existingCards = this.querySelectorAll(listElement, ".contra-rendered-item");
      existingCards.forEach((card) => card.remove());
    }
    const fragment = document.createDocumentFragment();
    experts.forEach((expert) => {
      const expertCard = this.populateExpertCard(template, expert, listId);
      fragment.appendChild(expertCard);
    });
    listElement.appendChild(fragment);
    this.log(`Rendered ${experts.length} expert cards into list`, listElement);
  }
  /**
   * Populate expert card from template
   */
  populateExpertCard(template, expert, listId) {
    const card = template.cloneNode(true);
    this._configureCard(card, expert, listId);
    return card;
  }
  /**
   * Configures an existing card element with expert data, including all sub-fields and repeaters.
   * This is the core rendering logic for a single item.
   */
  _configureCard(card, expert, listId) {
    card.classList.add("contra-rendered-item");
    card.removeAttribute(`${ATTR_PREFIX}${ATTRS.template}`);
    card.style.display = "";
    const repeatContainers = this.querySelectorAll(card, `[${ATTR_PREFIX}${ATTRS.repeat}]`);
    const detachedTemplates = /* @__PURE__ */ new Map();
    repeatContainers.forEach((container) => {
      const fragment = document.createDocumentFragment();
      while (container.firstChild) {
        fragment.appendChild(container.firstChild);
      }
      detachedTemplates.set(container, fragment);
    });
    this.populateFields(card, expert, listId);
    detachedTemplates.forEach((fragment, container) => {
      container.appendChild(fragment);
    });
    this.populateRepeatingElements(card, expert, listId);
    this.handleConditionalDisplay(card, expert);
  }
  /**
   * Populate data fields in the card
   */
  populateFields(card, expert, listId) {
    const fieldElements = this.querySelectorAll(card, `[${ATTR_PREFIX}${ATTRS.field}]`);
    fieldElements.forEach((element) => {
      const fieldName = this.getAttr(element, ATTRS.field);
      const format = this.getAttr(element, ATTRS.format);
      if (!fieldName || !(fieldName in expert)) return;
      const value = expert[fieldName];
      this.setElementValue(element, value, format, listId);
    });
    const starsElements = this.querySelectorAll(card, "[data-contra-stars]");
    starsElements.forEach((element) => {
      if (expert.averageReviewScore) {
        this.renderStarRating(element, expert.averageReviewScore);
      }
    });
  }
  /**
   * Set element value with proper formatting
   */
  setElementValue(element, value, format, listId) {
    if (value == null || value === "") return;
    if (this.isMediaField(element) && typeof value === "string" && value.trim()) {
      this.setMediaValue(element, value);
      return;
    }
    if (element instanceof HTMLAnchorElement) {
      let href = String(value);
      if (listId) {
        href = this._appendContraAnalytics(href, listId);
      }
      element.href = href;
      if (element.children.length === 0 && !element.textContent?.trim()) {
        element.textContent = String(value);
      }
    } else if (element instanceof HTMLInputElement) {
      element.value = String(value);
    } else if (element instanceof HTMLImageElement) {
      const mediaType = this.detectMediaType(String(value));
      const transformedUrl = this.transformMediaUrl(String(value), mediaType);
      element.src = transformedUrl;
      element.alt = element.alt || "Image";
    } else {
      let displayValue = String(value);
      if (format) {
        switch (format) {
          case "currency":
            displayValue = typeof value === "number" ? `$${value}` : displayValue;
            break;
          case "rate":
            displayValue = utils.formatRate(typeof value === "number" ? value : null);
            break;
          case "rating":
            displayValue = typeof value === "number" ? value.toFixed(1) : displayValue;
            break;
          case "earnings":
            if (typeof value === "number") {
              if (value >= 1e6) {
                displayValue = `$${Math.floor(value / 1e6)}M+`;
              } else if (value >= 1e3) {
                displayValue = `$${Math.floor(value / 1e3)}k+`;
              } else {
                displayValue = `$${value}`;
              }
            }
            break;
          case "number":
            displayValue = typeof value === "number" ? value.toLocaleString() : displayValue;
            break;
          case "truncate":
            displayValue = displayValue.length > 100 ? displayValue.substring(0, 97) + "..." : displayValue;
            break;
          case "boolean":
            displayValue = value ? "Yes" : "No";
            break;
          case "availability":
            displayValue = value ? "Available" : "Not Available";
            break;
        }
      }
      element.textContent = displayValue;
    }
  }
  /**
   * Star rating rendering with optional text display
   */
  renderStarRating(element, rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    let starsHtml = "";
    for (let i = 0; i < fullStars; i++) {
      starsHtml += '<span class="contra-star contra-star-full">\u2605</span>';
    }
    if (hasHalfStar) {
      starsHtml += '<span class="contra-star contra-star-half">\u2605</span>';
    }
    for (let i = 0; i < emptyStars; i++) {
      starsHtml += '<span class="contra-star contra-star-empty">\u2606</span>';
    }
    element.innerHTML = starsHtml;
    const card = element.closest("[data-contra-template]") || element.closest(".expert-card");
    if (card) {
      const ratingTextElements = this.querySelectorAll(card, "[data-contra-rating-text]");
      ratingTextElements.forEach((textElement) => {
        textElement.textContent = rating.toFixed(1);
      });
    }
  }
  /**
   * Media type detection and element handling
   */
  isMediaField(element) {
    const field = this.getAttr(element, ATTRS.field);
    return field === "coverUrl";
  }
  /**
   * Media value setting with automatic type detection
   */
  setMediaValue(element, url) {
    const mediaType = this.detectMediaType(url);
    const parent = element.parentElement;
    if (!parent) {
      this.log("Media element has no parent for replacement", element);
      return;
    }
    element.remove();
    let mediaElement;
    switch (mediaType) {
      case "video":
        const transformedVideoUrl = this.transformMediaUrl(url, "video");
        mediaElement = this.createVideoElement(transformedVideoUrl, element);
        break;
      case "image":
      default:
        const transformedImageUrl = this.transformMediaUrl(url, "image");
        mediaElement = this.createImageElement(transformedImageUrl, element);
        break;
    }
    this.transferAttributes(element, mediaElement);
    parent.appendChild(mediaElement);
    this.log(`Created ${mediaType} element for URL: ${url}`);
  }
  /**
   * Detect media type from URL
   */
  detectMediaType(url) {
    if (!url || typeof url !== "string") {
      this.log("Invalid URL provided to detectMediaType:", url);
      return "image";
    }
    const urlLower = url.toLowerCase();
    if (this.config.optimizeGifsAsVideo && urlLower.endsWith(".gif")) {
      return "video";
    }
    const videoExtensions = [".mp4", ".webm", ".mov", ".avi", ".mkv", ".ogg"];
    const isVideoExtension = videoExtensions.some((ext) => urlLower.endsWith(ext));
    const isCloudinaryVideo = urlLower.includes("cloudinary.com/") && urlLower.includes("/video/");
    if (isVideoExtension || isCloudinaryVideo) {
      return "video";
    }
    return "image";
  }
  /**
   * Create video element with fallback
   */
  createVideoElement(url, originalElement) {
    const video = document.createElement("video");
    video.src = url;
    video.loop = this.config.videoLoop;
    video.playsInline = true;
    video.preload = "metadata";
    video.controls = this.config.videoControls;
    const posterUrl = this.extractVideoThumbnail(url);
    if (posterUrl) {
      video.poster = posterUrl;
      this.log(`Set poster for video ${url}: ${posterUrl}`);
    }
    if (this.config.videoMuted) {
      video.muted = true;
      video.setAttribute("muted", "");
    }
    video.style.width = "100%";
    video.style.height = "100%";
    video.style.objectFit = "cover";
    video.style.borderRadius = "inherit";
    if (this.config.videoAutoplay) {
      video.autoplay = true;
      video.setAttribute("autoplay", "");
      const playPromise = video.play();
      if (playPromise !== void 0) {
        playPromise.catch((error) => {
          this.log("Autoplay was prevented.", { error, videoUrl: url });
        });
      }
    }
    video.onerror = () => {
      this.log(`Video failed to load: ${url}`);
      const fallbackImg = this.createImageElement(posterUrl || url, originalElement);
      if (video.parentElement) {
        video.parentElement.replaceChild(fallbackImg, video);
      }
    };
    if (this.config.videoHoverPlay && !this.config.videoAutoplay) {
      video.addEventListener("mouseenter", () => {
        video.currentTime = 0;
        video.play().catch(() => {
        });
      });
      video.addEventListener("mouseleave", () => {
        video.pause();
        video.currentTime = 0;
      });
      video.addEventListener("click", (e) => {
        e.preventDefault();
        if (video.paused) {
          video.currentTime = 0;
          video.play().catch((err) => this.log("Video play failed on click", err));
        } else {
          video.pause();
        }
      });
    }
    return video;
  }
  /**
   * Create image element with error handling
   */
  createImageElement(url, originalElement) {
    const img = document.createElement("img");
    img.src = url;
    img.alt = originalElement.getAttribute("alt") || "Media content";
    img.loading = "lazy";
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "cover";
    img.style.borderRadius = "inherit";
    img.onerror = () => {
      this.log(`Image failed to load: ${url}`);
      img.style.background = "#f3f4f6";
      img.style.opacity = "0.5";
      img.alt = "Image unavailable";
      img.style.position = "relative";
      const placeholder = document.createElement("div");
      placeholder.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #9ca3af;
        font-size: 12px;
        text-align: center;
      `;
      placeholder.textContent = "\u{1F5BC}\uFE0F Image unavailable";
      img.parentElement?.appendChild(placeholder);
    };
    return img;
  }
  /**
   * Extract video thumbnail from Cloudinary URL
   */
  extractVideoThumbnail(videoUrl) {
    if (!videoUrl.includes("/upload/")) {
      this.log("URL does not appear to be a Cloudinary video, cannot generate poster.", videoUrl);
      return null;
    }
    let posterUrl = videoUrl.replace(/\.(mp4|webm|mov|avi|mkv|ogg|gif)$/i, ".jpg");
    const uploadMarker = "/upload/";
    const parts = posterUrl.split(uploadMarker);
    if (parts.length !== 2) {
      this.log(`Could not parse URL for thumbnail generation: ${videoUrl}`);
      return posterUrl;
    }
    const [baseUrl, path] = parts;
    let pathComponents = path.split("/");
    const firstPathComponent = pathComponents[0];
    const hasTransformations = CLOUDINARY_TRANSFORM_PREFIXES.some((prefix) => firstPathComponent.includes(prefix));
    if (!hasTransformations) {
      this.log(`No Cloudinary transformations found, returning basic .jpg poster URL for: ${videoUrl}`);
      return posterUrl;
    }
    let transformations = pathComponents.shift() || "";
    const params = transformations.split(",");
    const filteredParams = params.filter(
      (param) => !param.startsWith("fl_") && param !== "f_auto"
    );
    const newTransformations = filteredParams.join(",");
    if (newTransformations) {
      pathComponents.unshift(newTransformations);
    }
    const newPath = pathComponents.join("/");
    const finalUrl = `${baseUrl}${uploadMarker}${newPath}`;
    this.log(`Generated poster URL: ${finalUrl} from video URL: ${videoUrl}`);
    return finalUrl;
  }
  /**
   * Transfer attributes and classes from old element to new
   */
  transferAttributes(from, to) {
    if (from.className) {
      to.className = from.className;
    }
    Array.from(from.attributes).forEach((attr) => {
      if (attr.name.startsWith("data-") && attr.name !== `${ATTR_PREFIX}${ATTRS.field}`) {
        to.setAttribute(attr.name, attr.value);
      }
    });
    if (from.getAttribute("style")) {
      const existingStyle = to.getAttribute("style") || "";
      to.setAttribute("style", existingStyle + "; " + from.getAttribute("style"));
    }
  }
  /**
   * Handle repeating elements (projects, social links)
   */
  populateRepeatingElements(card, expert, listId) {
    const repeatElements = this.querySelectorAll(card, `[${ATTR_PREFIX}${ATTRS.repeat}]`);
    repeatElements.forEach((container) => {
      const repeatType = this.getAttr(container, ATTRS.repeat);
      const maxItems = parseInt(this.getAttr(container, ATTRS.max) || "10");
      if (repeatType === "projects" && expert.projects) {
        this.populateRepeatingContainer(container, expert.projects.slice(0, maxItems), listId);
      } else if (repeatType === "socialLinks" && expert.socialLinks) {
        this.populateRepeatingContainer(container, expert.socialLinks.slice(0, maxItems), listId);
      } else if (repeatType === "skillTags" && expert.skillTags) {
        this.populateRepeatingContainer(container, expert.skillTags.slice(0, maxItems).map((tag) => ({ name: tag })), listId);
      }
    });
  }
  /**
   * Populate a repeating container with items
   */
  populateRepeatingContainer(container, items, listId) {
    const template = container.firstElementChild;
    if (!template) return;
    container.innerHTML = "";
    items.forEach((item) => {
      const itemElement = template.cloneNode(true);
      this.populateFields(itemElement, item, listId);
      container.appendChild(itemElement);
    });
    if (items.length === 0) {
      container.style.display = "none";
    }
  }
  /**
   * Handle conditional display based on data
   */
  handleConditionalDisplay(card, expert) {
    const conditionalElements = this.querySelectorAll(card, `[${ATTR_PREFIX}${ATTRS.showWhen}], [${ATTR_PREFIX}${ATTRS.hideWhen}]`);
    conditionalElements.forEach((element) => {
      const showWhen = this.getAttr(element, ATTRS.showWhen);
      const hideWhen = this.getAttr(element, ATTRS.hideWhen);
      let shouldShow = true;
      if (showWhen) {
        shouldShow = this.evaluateCondition(expert, showWhen);
      }
      if (hideWhen) {
        shouldShow = shouldShow && !this.evaluateCondition(expert, hideWhen);
      }
      element.style.display = shouldShow ? "" : "none";
    });
  }
  /**
   * Evaluate a condition against expert data
   */
  evaluateCondition(expert, condition) {
    if (!condition || typeof condition !== "string") {
      this.log("Invalid condition provided:", condition);
      return false;
    }
    const parts = condition.split(":");
    if (parts.length < 2) {
      this.log("Invalid condition format:", condition);
      return false;
    }
    const field = parts[0];
    const restOfCondition = parts.slice(1).join(":");
    const expertValue = expert[field];
    this.log(`Evaluating condition: ${field} (${expertValue}, type: ${typeof expertValue}) against ${restOfCondition}`);
    if (expertValue == null) {
      this.log(`Field '${field}' is null/undefined, condition fails`);
      return false;
    }
    if (restOfCondition.startsWith(">=")) {
      const value = restOfCondition.substring(2);
      const result = Number(expertValue) >= Number(value);
      this.log(`Comparison: ${expertValue} >= ${value} = ${result}`);
      return result;
    } else if (restOfCondition.startsWith("<=")) {
      const value = restOfCondition.substring(2);
      const result = Number(expertValue) <= Number(value);
      this.log(`Comparison: ${expertValue} <= ${value} = ${result}`);
      return result;
    } else if (restOfCondition.startsWith(">")) {
      const value = restOfCondition.substring(1);
      const result = Number(expertValue) > Number(value);
      this.log(`Comparison: ${expertValue} > ${value} = ${result}`);
      return result;
    } else if (restOfCondition.startsWith("<")) {
      const value = restOfCondition.substring(1);
      const result = Number(expertValue) < Number(value);
      this.log(`Comparison: ${expertValue} < ${value} = ${result}`);
      return result;
    } else {
      let result = false;
      if (typeof expertValue === "boolean") {
        if (restOfCondition.toLowerCase() === "true") {
          result = expertValue === true;
        } else if (restOfCondition.toLowerCase() === "false") {
          result = expertValue === false;
        } else {
          result = false;
        }
        this.log(`Boolean comparison: ${expertValue} === ${restOfCondition.toLowerCase() === "true"} = ${result}`);
      } else if (typeof expertValue === "number") {
        const numValue = Number(restOfCondition);
        result = !isNaN(numValue) && expertValue === numValue;
        this.log(`Number comparison: ${expertValue} === ${numValue} = ${result}`);
      } else {
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
  updateUIStates(listElement, listId) {
    const state = this.state.getState(listId);
    const emptyElement = this.querySelector(listElement, `[${ATTR_PREFIX}${ATTRS.empty}]`);
    if (emptyElement) {
      const showEmpty = !state.loading && state.experts.length === 0;
      const display = showEmpty ? "block" : "none";
      emptyElement.style.setProperty("display", display, "important");
      this.log(`List ${listId}: Empty state display set to '${display}'.`);
    }
    const loadMoreButton = this.querySelector(document.body, `[${ATTR_PREFIX}${ATTRS.action}="load-more"][${ATTR_PREFIX}${ATTRS.listTarget}="${listId}"]`);
    if (loadMoreButton) {
      const btn = loadMoreButton;
      const hasMore = !state.loading && state.hasNextPage;
      const display = hasMore ? "inline-block" : "none";
      loadMoreButton.style.setProperty("display", display, "important");
      btn.disabled = state.loading;
      btn.textContent = state.loading ? "Loading..." : "Load More";
    }
  }
  /**
   * Handle action buttons (just load-more for now).
   */
  handleAction(action, targetListId, button) {
    if (action === "load-more") {
      const listElement = this.querySelector(document.body, `[${ATTR_PREFIX}${ATTRS.listId}="${targetListId}"]`);
      const programId = this.getAttr(listElement, ATTRS.program);
      if (listElement && programId) {
        this.loadExperts(targetListId, programId, true);
      } else {
        this.log(`Could not find list or program for target: ${targetListId}`);
      }
    } else if (action === "clear-filters") {
      this.clearFilters(targetListId);
    }
  }
  clearFilters(targetListId) {
    const listElement = this.querySelector(document.body, `[${ATTR_PREFIX}${ATTRS.listId}="${targetListId}"]`);
    if (!listElement) {
      this.log(`Cannot find list element with ID: ${targetListId} to clear filters.`);
      return;
    }
    const programId = this.getAttr(listElement, ATTRS.program);
    if (!programId) {
      this.log(`Cannot find programId for list: ${targetListId}`);
      return;
    }
    this.log(`Clearing filters for list: ${targetListId}`);
    this.state.updateState(targetListId, { filters: {}, offset: 0 });
    const filterControls = this.querySelectorAll(document.body, `[data-contra-filter][data-contra-list-target="${targetListId}"]`);
    filterControls.forEach((control) => {
      this.resetControlValue(control);
    });
    this.loadExperts(targetListId, programId, false);
  }
  resetControlValue(control) {
    if (control instanceof HTMLInputElement) {
      switch (control.type) {
        case "checkbox":
        case "radio":
          control.checked = false;
          break;
        case "number":
        case "range":
          control.value = "";
          break;
        default:
          control.value = "";
          break;
      }
    } else if (control instanceof HTMLSelectElement) {
      control.selectedIndex = 0;
    }
  }
  updateFilterAndReload(listId, programId, filterKey, value) {
    const state = this.state.getState(listId);
    const newFilters = { ...state.filters };
    let processedValue = value;
    if (filterKey === "available") {
      processedValue = value ? true : void 0;
    } else if (["minRate", "maxRate"].includes(filterKey)) {
      processedValue = value === "" || value === null ? void 0 : Number(value);
    } else if (filterKey === "languages" && typeof value === "string") {
      processedValue = value.split(",").map((v) => v.trim()).filter((v) => v);
      if (processedValue.length === 0) {
        processedValue = void 0;
      }
    }
    if (processedValue !== void 0 && processedValue !== "") {
      const apiKey = this.filterNameMap[filterKey] || filterKey;
      newFilters[apiKey] = processedValue;
    } else {
      const apiKey = this.filterNameMap[filterKey] || filterKey;
      delete newFilters[apiKey];
    }
    this.state.updateState(listId, { filters: newFilters, offset: 0 });
    this.log(`Filter updated for list ${listId}, reloading. New filters:`, newFilters);
    this.loadExperts(listId, programId, false);
  }
  wireFilterControls() {
    const filterControls = this.querySelectorAll(document.body, `[data-contra-filter]`);
    this.log(`Found ${filterControls.length} filter controls to wire.`);
    filterControls.forEach((control) => {
      const filterKey = control.getAttribute("data-contra-filter");
      const targetListId = control.getAttribute("data-contra-list-target");
      if (!filterKey || !targetListId) {
        this.log("Filter control missing required attributes: data-contra-filter or data-contra-list-target", control);
        return;
      }
      const listElement = this.querySelector(document.body, `[${ATTR_PREFIX}list-id="${targetListId}"]`);
      if (!listElement) return;
      const programId = this.getAttr(listElement, ATTRS.program);
      if (!programId) return;
      const debounceTime = control instanceof HTMLInputElement && ["text", "search"].includes(control.type) ? 300 : 0;
      const handler = () => {
        const value = this.getControlValue(control);
        this.updateFilterAndReload(targetListId, programId, filterKey, value);
      };
      const debouncedHandler = this.debounce(handler, debounceTime);
      const eventType = control instanceof HTMLInputElement && ["text", "search"].includes(control.type) ? "input" : "change";
      control.addEventListener(eventType, debouncedHandler);
    });
  }
  debounce(func, delay) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      if (delay > 0) {
        timeoutId = window.setTimeout(() => func.apply(this, args), delay);
      } else {
        func.apply(this, args);
      }
    };
  }
  /**
   * Utility Methods
   */
  getAttr(element, name) {
    return element.getAttribute(`${ATTR_PREFIX}${name}`);
  }
  querySelector(element, selector) {
    return element.querySelector(selector);
  }
  querySelectorAll(element, selector) {
    return Array.from(element.querySelectorAll(selector));
  }
  parseFiltersFromElement(element) {
    const filters = {};
    const filterMap = {
      "available": "available",
      "languages": "languages",
      "location": "location",
      "min-rate": "minRate",
      "max-rate": "maxRate",
      "sort": "sortBy",
      "limit": "limit",
      "offset": "offset"
    };
    Object.entries(filterMap).forEach(([attr, filterKey]) => {
      const value = this.getAttr(element, attr);
      if (value != null) {
        if (filterKey === "available") {
          filters[filterKey] = value === "true";
        } else if (filterKey === "languages") {
          filters[filterKey] = value.split(",").map((v) => v.trim());
        } else if (["minRate", "maxRate", "limit", "offset"].includes(filterKey)) {
          filters[filterKey] = parseInt(value);
        } else {
          filters[filterKey] = value;
        }
      }
    });
    if (filters.offset === void 0) {
      filters.offset = 0;
    }
    return filters;
  }
  getControlValue(control) {
    if (control instanceof HTMLInputElement) {
      switch (control.type) {
        case "checkbox":
          return control.checked;
        case "number":
        case "range":
          return control.valueAsNumber;
        default:
          return control.value;
      }
    } else if (control instanceof HTMLSelectElement) {
      if (control.multiple) {
        return Array.from(control.selectedOptions).map((option) => option.value);
      }
      return control.value;
    }
    return null;
  }
  showLoading(container, show) {
    const loadingElement = this.querySelector(container, `[${ATTR_PREFIX}${ATTRS.loading}]`);
    if (loadingElement) {
      const display = show ? "block" : "none";
      loadingElement.style.setProperty("display", display, "important");
    }
  }
  showError(container, error) {
    const errorElement = this.querySelector(container, `[${ATTR_PREFIX}${ATTRS.error}]`);
    if (errorElement) {
      errorElement.textContent = error.message;
      errorElement.style.setProperty("display", "block", "important");
    }
    container.classList.add(this.config.errorClass);
    this.log("Error displayed", error);
  }
  dispatchEvent(target, eventName, detail) {
    const event = new CustomEvent(`contra:${eventName}`, { detail });
    target.dispatchEvent(event);
  }
  log(message, ...args) {
    if (this.config.debug) {
      console.log(`[ContraWebflow] ${message}`, ...args);
    }
  }
  async getAvailableFilters(programId) {
    const url = `https://contra.com/public-api/programs/${programId}/filters`;
    this.log(`Fetching available filters for program: ${programId}`);
    try {
      const response = await fetch(url, {
        headers: {
          "X-API-Key": this.config.apiKey,
          "Accept": "application/json"
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch filters: ${response.statusText}`);
      }
      const data = await response.json();
      this.log("Successfully fetched filters", data.data);
      return data.data || [];
    } catch (error) {
      this.log("Error fetching available filters", error);
      return [];
    }
  }
  getFilterOptionLabel(filterKey, value) {
    const labels = this.filterOptionLabels[filterKey];
    if (labels && labels[value]) {
      return labels[value];
    }
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }
  populateAllFilterControls(programFilters) {
    this.log("Populating all filter controls on the page...");
    const allControls = this.querySelectorAll(document.body, `[data-contra-filter]`);
    allControls.forEach((control) => {
      const targetListId = control.getAttribute("data-contra-list-target");
      if (!targetListId) return;
      const targetList = this.querySelector(document.body, `[data-contra-list-id="${targetListId}"]`);
      if (!targetList) return;
      const programId = this.getAttr(targetList, ATTRS.program);
      if (!programId) return;
      const filters = programFilters.get(programId);
      if (!filters) return;
      const filterKey = control.getAttribute("data-contra-filter");
      const filterDef = filters.find((f) => f.name === filterKey);
      if (!filterDef) return;
      if (filterDef.type === "number" && control instanceof HTMLInputElement) {
        if (filterDef.minimum !== void 0) control.min = String(filterDef.minimum);
        if (filterDef.maximum !== void 0) control.max = String(filterDef.maximum);
      }
      if (filterDef.options) {
        if (control instanceof HTMLSelectElement) {
          this.populateSelectControl(control, filterKey, filterDef.options);
        } else if (control instanceof HTMLInputElement && control.getAttribute("list")) {
          this.populateDatalistControl(control, filterKey, filterDef.options);
        }
      }
    });
  }
  populateSelectControl(control, filterKey, options) {
    this.log(`Populating options for filter '${filterKey}' on control`, control);
    const placeholder = control.firstElementChild?.cloneNode(true);
    control.innerHTML = "";
    if (placeholder && placeholder.getAttribute("value") === "") {
      control.appendChild(placeholder);
    }
    options.forEach((option) => {
      const optionElement = document.createElement("option");
      const value = typeof option === "object" && option.value !== void 0 ? option.value : String(option);
      optionElement.value = value;
      let label;
      if (filterKey === "locations") {
        const labelMatch = value.match(/^(.*?)\s*\(/);
        label = labelMatch ? labelMatch[1].trim() : value;
      } else {
        label = this.getFilterOptionLabel(filterKey, value);
      }
      optionElement.textContent = label;
      if (filterKey === "sortBy" && value === "relevance") {
        optionElement.selected = true;
      }
      control.appendChild(optionElement);
    });
  }
  populateDatalistControl(control, filterKey, options) {
    const datalistId = control.getAttribute("list");
    if (!datalistId) return;
    const datalist = document.getElementById(datalistId);
    if (!datalist) {
      this.log(`Datalist with id '${datalistId}' not found for input control.`, control);
      return;
    }
    this.log(`Populating datalist '#${datalistId}' for filter '${filterKey}'`);
    datalist.innerHTML = "";
    options.forEach((option) => {
      const optionElement = document.createElement("option");
      const value = typeof option === "object" && option.value !== void 0 ? option.value : String(option);
      let displayValue = value;
      if (filterKey === "locations") {
        const labelMatch = value.match(/^(.*?)\s*\(/);
        displayValue = labelMatch ? labelMatch[1].trim() : value;
      }
      optionElement.value = displayValue;
      datalist.appendChild(optionElement);
    });
  }
  transformMediaUrl(url, mediaType) {
    if (!url || !url.includes("cloudinary.com/") && !url.includes("media.contra.com/")) {
      return url;
    }
    const transformations = mediaType === "image" ? this.config.imageTransformations : this.config.videoTransformations;
    if (!transformations) {
      return url;
    }
    let processedUrl = url;
    if (mediaType === "video" && url.toLowerCase().endsWith(".gif")) {
      processedUrl = url.replace(/\.gif$/i, ".mp4");
      this.log(`Converting GIF to MP4: ${processedUrl}`);
    }
    const uploadMarker = "/upload/";
    const parts = processedUrl.split(uploadMarker);
    if (parts.length !== 2) {
      this.log(`Could not apply transformations, URL format unexpected: ${processedUrl}`);
      return processedUrl;
    }
    const [baseUrl, path] = parts;
    let pathComponents = path.split("/");
    const firstPathComponent = pathComponents[0];
    const hasExistingTransformations = CLOUDINARY_TRANSFORM_PREFIXES.some((prefix) => firstPathComponent.includes(prefix));
    if (hasExistingTransformations) {
      this.log(`Removing existing transformations from URL: ${processedUrl}`);
      pathComponents.shift();
    }
    const cleanPath = pathComponents.join("/");
    const finalUrl = `${baseUrl}${uploadMarker}${transformations}/${cleanPath}`;
    this.log(`Transformed ${mediaType} URL from "${url}" to "${finalUrl}"`);
    return finalUrl;
  }
  _stringifyFilters(filters) {
    return Object.entries(filters).filter(([, value]) => {
      if (value === null || value === void 0) return false;
      if (Array.isArray(value) && value.length === 0) return false;
      if (typeof value === "string" && value.trim() === "") return false;
      return true;
    }).map(([key, value]) => {
      const stringValue = Array.isArray(value) ? value.join(",") : String(value);
      return `${key}:${stringValue}`;
    }).join("|");
  }
  _appendContraAnalytics(url, listId) {
    if (!this.config.contraAnalytics || !url) {
      return url;
    }
    try {
      const listElement = document.querySelector(`[${ATTR_PREFIX}${ATTRS.listId}="${listId}"]`);
      if (!listElement) return url;
      const programId = this.getAttr(listElement, ATTRS.program);
      const state = this.state.getState(listId);
      const filters = state.filters;
      const params = new URLSearchParams();
      params.set("contra_source", "webflow_sdk");
      if (programId) params.set("contra_program_id", programId);
      if (listId) params.set("contra_list_id", listId);
      const filterString = this._stringifyFilters(filters);
      if (filterString) {
        params.set("contra_filters", filterString);
      }
      if (!url.startsWith("http")) {
        this.log("Cannot append analytics to a relative or invalid URL", { url });
        return url;
      }
      const urlObject = new URL(url);
      params.forEach((value, key) => {
        urlObject.searchParams.set(key, value);
      });
      return urlObject.toString();
    } catch (error) {
      this.log("Failed to append Contra analytics to URL.", { url, error });
      return url;
    }
  }
};
function autoInit() {
  const configElement = document.getElementById("contra-config");
  if (!configElement) {
    console.warn("[ContraWebflow] No config element found. Runtime not initialized.");
    return;
  }
  try {
    const config = JSON.parse(configElement.textContent || "{}");
    if (!config.apiKey) {
      console.error("[ContraWebflow] API key is required in config.");
      return;
    }
    const initializeRuntime = () => {
      const runtime = new ContraWebflowRuntime(config);
      window.contraRuntime = runtime;
      runtime.init().catch((error) => {
        console.error("[ContraWebflow] Runtime initialization failed:", error);
      });
    };
    setTimeout(initializeRuntime, 100);
  } catch (error) {
    console.error("[ContraWebflow] Failed to parse config:", error);
  }
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", autoInit);
} else if (document.readyState === "interactive") {
  setTimeout(autoInit, 50);
} else {
  autoInit();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ContraWebflowRuntime
});
//# sourceMappingURL=index.js.map