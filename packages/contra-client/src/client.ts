import type {
  ClientConfig,
  ExpertProfile,
  ExpertFilters,
  ProgramSummary,
  ListResponse,
  ApiResponse,
  ErrorResponse,
  Filter,
  FilterListResponse
} from '@contra/types';

/**
 * Professional Contra API Client
 * Features: Caching, retry logic, error handling, request deduplication
 */
export class ContraClient {
  private config: Required<ClientConfig>;
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private pendingRequests = new Map<string, Promise<any>>();
  
  // Cache TTL settings (in milliseconds)
  private static readonly CACHE_TTL = {
    experts: 5 * 60 * 1000,      // 5 minutes for expert lists
    expert: 10 * 60 * 1000,     // 10 minutes for individual experts
    program: 30 * 60 * 1000,    // 30 minutes for program info
    filters: 60 * 60 * 1000,    // 1 hour for available filters
  };

  constructor(config: ClientConfig) {
    this.config = {
      baseUrl: 'https://contra.com',
      timeout: 10000,
      debug: false,
      ...config,
    };

    if (this.config.debug) {
      console.log('[ContraClient] Initialized with config:', this.config);
    }
  }

  /**
   * Core fetch method with retry logic and error handling
   */
  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {},
    retries = 3
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    const requestOptions: RequestInit = {
      ...options,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'X-API-key': this.config.apiKey,
        ...options.headers,
      },
    };

    try {
      if (this.config.debug) {
        console.log(`[ContraClient] Fetching: ${url}`, requestOptions);
      }

      const response = await fetch(url, requestOptions);
      clearTimeout(timeoutId);

      if (!response.ok) {
        // Try to parse error response
        let errorData: ErrorResponse;
        try {
          errorData = await response.json();
        } catch {
          errorData = {
            code: `HTTP_${response.status}`,
            message: response.statusText || 'Unknown error'
          };
        }

        // Retry on 5xx errors or rate limits
        if ((response.status >= 500 || response.status === 429) && retries > 0) {
          const delay = Math.pow(2, 3 - retries) * 1000; // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.fetch<T>(endpoint, options, retries - 1);
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

      if (error instanceof Error && error.name === 'AbortError') {
        throw new ContraAPIError(`Request timeout after ${this.config.timeout}ms`, 'TIMEOUT');
      }

      // Network or other errors - retry if we have retries left
      if (retries > 0) {
        const delay = Math.pow(2, 3 - retries) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.fetch<T>(endpoint, options, retries - 1);
      }

      throw new ContraAPIError(
        error instanceof Error ? error.message : 'Unknown error',
        'NETWORK_ERROR'
      );
    }
  }

  /**
   * Get from cache or fetch with request deduplication
   */
  private async fetchWithCache<T>(
    cacheKey: string,
    endpoint: string,
    ttl: number,
    options?: RequestInit
  ): Promise<T> {
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      if (this.config.debug) {
        console.log(`[ContraClient] Cache hit: ${cacheKey}`);
      }
      return cached.data;
    }

    // Check for pending request (deduplication)
    const pendingKey = `${endpoint}${JSON.stringify(options)}`;
    if (this.pendingRequests.has(pendingKey)) {
      if (this.config.debug) {
        console.log(`[ContraClient] Request deduplication: ${pendingKey}`);
      }
      return this.pendingRequests.get(pendingKey)!;
    }

    // Make the request
    const requestPromise = this.fetch<T>(endpoint, options);
    this.pendingRequests.set(pendingKey, requestPromise);

    try {
      const data = await requestPromise;
      
      // Cache the result
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
  private buildQueryString(filters: ExpertFilters): string {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value != null && value !== '') {
        if (Array.isArray(value)) {
          params.set(key, value.join(','));
        } else {
          params.set(key, String(value));
        }
      }
    });

    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  }

  /**
   * Get program information
   */
  async getProgram(programNid: string): Promise<ProgramSummary> {
    const cacheKey = `program:${programNid}`;
    const endpoint = `/public-api/programs/${programNid}`;
    
    const response = await this.fetchWithCache<ApiResponse<ProgramSummary>>(
      cacheKey,
      endpoint,
      ContraClient.CACHE_TTL.program
    );
    
    return response.data;
  }

  /**
   * List experts with advanced filtering and caching
   */
  async listExperts(
    programNid: string,
    filters: ExpertFilters = {}
  ): Promise<ListResponse<ExpertProfile>> {
    const queryString = this.buildQueryString(filters);
    const cacheKey = `experts:${programNid}:${JSON.stringify(filters)}`;
    const endpoint = `/public-api/programs/${programNid}/experts${queryString}`;
    
    return this.fetchWithCache<ListResponse<ExpertProfile>>(
      cacheKey,
      endpoint,
      ContraClient.CACHE_TTL.experts
    );
  }

  /**
   * Search experts (using the main experts endpoint with filters)
   */
  async searchExperts(
    programNid: string,
    query: string,
    filters: ExpertFilters = {}
  ): Promise<ListResponse<ExpertProfile>> {
    // Search is handled by client-side filtering since API doesn't support text search
    const experts = await this.listExperts(programNid, filters);
    
    // Client-side filtering for search (since API doesn't support text search)
    if (query.trim()) {
      const searchTerm = query.toLowerCase();
      experts.data = experts.data.filter(expert => 
        (expert.name && expert.name.toLowerCase().includes(searchTerm)) ||
        (expert.oneLiner && expert.oneLiner.toLowerCase().includes(searchTerm)) ||
        (expert.skillTags && expert.skillTags.some(tag => tag && tag.toLowerCase().includes(searchTerm)))
      );
    }
    
    return experts;
  }

  /**
   * Get available filter options for a program
   */
  async getFilterOptions(programNid: string): Promise<FilterListResponse> {
    const cacheKey = `filters:${programNid}`;
    const endpoint = `/public-api/programs/${programNid}/filters`;
    
    return this.fetchWithCache<FilterListResponse>(
      cacheKey,
      endpoint,
      ContraClient.CACHE_TTL.filters
    );
  }

  /**
   * Clear cache (useful for forced refreshes)
   */
  clearCache(pattern?: string): void {
    if (pattern) {
      // Clear specific cache entries
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      // Clear all cache
      this.cache.clear();
    }

    if (this.config.debug) {
      console.log(`[ContraClient] Cache cleared${pattern ? ` (pattern: ${pattern})` : ''}`);
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    entries: Array<{ key: string; age: number; ttl: number }>;
  } {
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
}

/**
 * Custom error class for API errors
 */
export class ContraAPIError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number
  ) {
    super(message);
    this.name = 'ContraAPIError';
  }
}

/**
 * Utility functions
 */
export const utils = {
  /**
   * Format hourly rate with proper handling of null values
   */
  formatRate(rate: number | null): string {
    return rate ? `$${rate}/hr` : 'Rate on request';
  },

  /**
   * Generate star rating HTML
   */
  renderStars(rating: number): string {
    const fullStars = Math.floor(rating);
    const hasHalfStar = (rating % 1) >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let html = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
      html += `<svg class="star star-full" width="16" height="16" viewBox="0 0 24 24" fill="#FFD700">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>`;
    }
    
    // Half star
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
    
    // Empty stars
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
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  /**
   * Throttle function for scroll events
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}; 