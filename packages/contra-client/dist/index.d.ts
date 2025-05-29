import { ClientConfig, ProgramSummary, ExpertFilters, ListResponse, ExpertProfile, FilterListResponse } from '@contra/types';
export * from '@contra/types';

/**
 * Professional Contra API Client
 * Features: Caching, retry logic, error handling, request deduplication
 */
declare class ContraClient {
    private config;
    private cache;
    private pendingRequests;
    private static readonly CACHE_TTL;
    constructor(config: ClientConfig);
    /**
     * Core fetch method with retry logic and error handling
     */
    private fetch;
    /**
     * Get from cache or fetch with request deduplication
     */
    private fetchWithCache;
    /**
     * Build query string from filters
     */
    private buildQueryString;
    /**
     * Get program information
     */
    getProgram(programNid: string): Promise<ProgramSummary>;
    /**
     * List experts with advanced filtering and caching
     */
    listExperts(programNid: string, filters?: ExpertFilters): Promise<ListResponse<ExpertProfile>>;
    /**
     * Search experts (using the main experts endpoint with filters)
     */
    searchExperts(programNid: string, query: string, filters?: ExpertFilters): Promise<ListResponse<ExpertProfile>>;
    /**
     * Get available filter options for a program
     */
    getFilterOptions(programNid: string): Promise<FilterListResponse>;
    /**
     * Clear cache (useful for forced refreshes)
     */
    clearCache(pattern?: string): void;
    /**
     * Get cache statistics
     */
    getCacheStats(): {
        size: number;
        entries: Array<{
            key: string;
            age: number;
            ttl: number;
        }>;
    };
}
/**
 * Custom error class for API errors
 */
declare class ContraAPIError extends Error {
    code: string;
    status?: number | undefined;
    constructor(message: string, code: string, status?: number | undefined);
}
/**
 * Utility functions
 */
declare const utils: {
    /**
     * Format hourly rate with proper handling of null values
     */
    formatRate(rate: number | null): string;
    /**
     * Generate star rating HTML
     */
    renderStars(rating: number): string;
    /**
     * Debounce function for search inputs
     */
    debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
    /**
     * Throttle function for scroll events
     */
    throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void;
};

export { ContraAPIError, ContraClient, utils };
