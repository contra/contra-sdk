interface ContraFilters {
    languages?: string[];
    minRate?: number;
    maxRate?: number;
    location?: string;
    available?: boolean;
    sortBy?: 'newest' | 'oldest' | 'rating' | 'rate_low' | 'rate_high';
}
interface ContraProject {
    id: string;
    title: string;
    coverUrl: string;
    projectUrl: string;
    description?: string;
}
interface ContraExpert {
    id: string;
    name: string;
    avatarUrl: string;
    bio?: string;
    hourlyRateUSD: number;
    location?: string;
    languages: string[];
    available: boolean;
    averageReviewScore: number;
    totalReviews: number;
    projects: ContraProject[];
    profileUrl: string;
    skills: string[];
}
interface ContraApiResponse<T> {
    data: T;
    meta: {
        total: number;
        page: number;
        limit: number;
        hasMore: boolean;
    };
}
interface ContraClientConfig {
    apiKey: string;
    baseUrl?: string;
    timeout?: number;
}

declare class ContraClient {
    private apiKey;
    private baseUrl;
    private timeout;
    constructor(config: ContraClientConfig);
    /**
     * Generic fetch wrapper with authentication and error handling
     */
    private fetch;
    /**
     * List experts with optional filters
     */
    listExperts(program: string, filters?: ContraFilters, page?: number, limit?: number): Promise<ContraApiResponse<ContraExpert[]>>;
    /**
     * Get a single expert by ID
     */
    getExpert(expertId: string): Promise<ContraExpert>;
    /**
     * Search experts by query string
     */
    searchExperts(query: string, filters?: ContraFilters, page?: number, limit?: number): Promise<ContraApiResponse<ContraExpert[]>>;
}

/**
 * Generate star rating SVG based on score (0-5)
 */
declare function starSVG(score: number): string;
/**
 * Build query string from object
 */
declare function buildQueryString(params: Record<string, any>): string;

export { type ContraApiResponse, ContraClient, type ContraClientConfig, type ContraExpert, type ContraFilters, type ContraProject, buildQueryString, starSVG };
