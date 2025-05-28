export interface ContraFilters {
  languages?: string[];
  minRate?: number;
  maxRate?: number;
  location?: string;
  available?: boolean;
  sortBy?: 'newest' | 'oldest' | 'rating' | 'rate_low' | 'rate_high';
}

export interface ContraProject {
  id: string;
  title: string;
  coverUrl: string;
  projectUrl: string;
  description?: string;
}

export interface ContraExpert {
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

export interface ContraApiResponse<T> {
  data: T;
  meta: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

export interface ContraClientConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
} 