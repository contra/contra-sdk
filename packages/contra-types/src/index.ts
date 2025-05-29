/**
 * Contra API Types
 * Generated from OpenAPI 3.0.3 specification
 */

// Core Expert Profile (exactly from OpenAPI spec)
export interface ExpertProfile {
  /** Expert identifier */
  id: string;
  /** Full name */
  name: string;
  /** Short bio tagline */
  oneLiner: string;
  /** URL to avatar image */
  avatarUrl: string;
  /** Contra profile URL */
  profileUrl: string;
  /** Inquiry modal URL */
  inquiryUrl: string;
  /** Rate per hour in USD */
  hourlyRateUSD: number | null;
  /** Country or region */
  location: string;
  /** Availability status */
  available: boolean;
  /** Average review score */
  averageReviewScore: number;
  /** Total reviews */
  reviewsCount: number;
  /** Completed projects count */
  projectsCompletedCount: number;
  /** Followers count */
  followersCount: number;
  /** Total earnings on Contra (USD) */
  earningsUSD: number;
  /** Skills or technologies */
  skillTags: string[];
  /** Social platform links */
  socialLinks: Array<{
    /** Social platform */
    label: string | null;
    /** Social URL */
    url: string;
  }>;
  /** Project samples */
  projects: ProjectSample[];
}

// Project Sample
export interface ProjectSample {
  /** Project title */
  title: string;
  /** Cover image URL */
  coverUrl: string;
  /** Project page URL */
  projectUrl: string;
}

// Program Summary
export interface ProgramSummary {
  /** Program identifier */
  id: string;
  /** Program title */
  title: string;
  /** Program subheader */
  subheader: string;
  /** Program logo URL */
  logoUrl: string;
  /** Number of experts in program */
  expertsCount: number;
  /** Total hires made */
  totalHires: number;
  /** Total value of hires (USD) */
  totalHireValue: number;
  /** Total reviews received */
  totalReviews: number;
  /** Apply to program URL */
  applyUrl: string;
  /** Hire from program URL */
  hireUrl: string;
}

// API Response Wrapper
export interface ApiResponse<T> {
  data: T;
}

// List Response with Pagination
export interface ListResponse<T> {
  data: T[];
  totalCount: number;
  page?: number;
  limit?: number;
  hasMore?: boolean;
}

// Error Response
export interface ErrorResponse {
  /** Error code */
  code: string;
  /** Error message */
  message: string;
}

// Filter Types for Expert Search (exact from OpenAPI spec)
export interface ExpertFilters {
  /** Filter by availability (string enum in API) */
  available?: boolean;
  /** Filter by languages/skills (comma-separated string or array) */
  languages?: string | string[];
  /** Filter by location (with Google Place ID) */
  location?: string;
  /** Minimum hourly rate in USD */
  minRate?: number;
  /** Maximum hourly rate in USD */
  maxRate?: number;
  /** Sort order (exact from OpenAPI) */
  sortBy?: 'relevance' | 'oldest' | 'newest';
  /** Number of results per page */
  limit?: number;
  /** Page offset for pagination */
  offset?: number;
}

// Filter Definition from OpenAPI
export interface Filter {
  /** Field name to filter by */
  name: string;
  /** Data type of the filter */
  type: 'string' | 'number' | 'boolean';
  /** Human-readable description of the filter */
  description: string;
  /** Allowed values (for enum filters) */
  options?: string[];
  /** Minimum allowable value (for range filters) */
  minimum?: number;
  /** Maximum allowable value (for range filters) */
  maximum?: number;
}

// Filter List Response from OpenAPI
export interface FilterListResponse {
  data: Filter[];
}

// Client Configuration
export interface ClientConfig {
  /** API key for authentication */
  apiKey: string;
  /** Base URL for API (defaults to https://contra.com) */
  baseUrl?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Enable debug logging */
  debug?: boolean;
}

// Event Types for Runtime
export interface FilterChangeEvent {
  filters: ExpertFilters;
  element: HTMLElement;
}

export interface ExpertLoadEvent {
  experts: ExpertProfile[];
  totalCount: number;
  filters: ExpertFilters;
}

export interface ErrorEvent {
  error: Error;
  context: string;
}

// Webflow Attribute Configuration
export interface WebflowConfig {
  /** Program ID to load experts from */
  program: string;
  /** Initial filters to apply */
  filters?: ExpertFilters;
  /** Auto-reload when filters change */
  autoReload?: boolean;
  /** Show loading states */
  showLoading?: boolean;
  /** Error handling mode */
  errorMode?: 'console' | 'display' | 'throw';
}

// React Component Props
export interface ExpertListProps {
  /** Program ID */
  programId: string;
  /** Initial filters */
  filters?: ExpertFilters;
  /** Custom expert card component */
  expertComponent?: React.ComponentType<{ expert: ExpertProfile }>;
  /** Loading component */
  loadingComponent?: React.ComponentType;
  /** Error component */
  errorComponent?: React.ComponentType<{ error: Error }>;
  /** Pagination settings */
  pagination?: {
    enabled: boolean;
    pageSize: number;
  };
  /** Virtual scrolling for performance */
  virtualScrolling?: boolean;
  /** Event handlers */
  onLoad?: (data: ExpertLoadEvent) => void;
  onError?: (error: ErrorEvent) => void;
  onFilterChange?: (event: FilterChangeEvent) => void;
}

export interface ExpertCardProps {
  /** Expert data */
  expert: ExpertProfile;
  /** Show projects */
  showProjects?: boolean;
  /** Maximum projects to show */
  maxProjects?: number;
  /** Show star rating */
  showRating?: boolean;
  /** Show social links */
  showSocials?: boolean;
  /** Custom CSS classes */
  className?: string;
  /** Click handler */
  onClick?: (expert: ExpertProfile) => void;
}

export interface FilterControlsProps {
  /** Current filters */
  filters: ExpertFilters;
  /** Available filter options (from API) */
  filterOptions?: {
    languages: string[];
    locations: string[];
    rateRanges: Array<{ min: number; max: number; label: string }>;
  };
  /** Filter change handler */
  onFilterChange: (filters: ExpertFilters) => void;
  /** Show specific controls */
  showControls?: {
    availability?: boolean;
    languages?: boolean;
    location?: boolean;
    rate?: boolean;
    sort?: boolean;
  };
}

// Utility Types
export type SortOption = ExpertFilters['sortBy'];
export type ExpertField = keyof ExpertProfile;
export type FilterKey = keyof ExpertFilters;

// Type Guards
export const isExpertProfile = (obj: any): obj is ExpertProfile => {
  return obj && typeof obj.id === 'string' && typeof obj.name === 'string';
};

export const isErrorResponse = (obj: any): obj is ErrorResponse => {
  return obj && typeof obj.code === 'string' && typeof obj.message === 'string';
};

// Constants
export const EXPERT_FIELDS = [
  'id', 'name', 'oneLiner', 'avatarUrl', 'profileUrl', 'inquiryUrl',
  'hourlyRateUSD', 'location', 'available', 'averageReviewScore',
  'reviewsCount', 'projectsCompletedCount', 'followersCount', 
  'earningsUSD', 'skillTags', 'socialLinks', 'projects'
] as const;

export const FILTER_KEYS = [
  'available', 'languages', 'location', 'minRate', 'maxRate', 
  'sortBy', 'limit', 'offset'
] as const;

export const SORT_OPTIONS = [
  'relevance', 'oldest', 'newest'
] as const; 