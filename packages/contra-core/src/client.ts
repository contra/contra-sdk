import type { ContraClientConfig, ContraFilters, ContraExpert, ContraApiResponse } from './types.js';
import { buildQueryString } from './utils.js';

export class ContraClient {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;

  constructor(config: ContraClientConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.contra.com/v1';
    this.timeout = config.timeout || 10000;
  }

  /**
   * Generic fetch wrapper with authentication and error handling
   */
  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.timeout}ms`);
      }
      throw error;
    }
  }

  /**
   * List experts with optional filters
   */
  async listExperts(
    program: string,
    filters: ContraFilters = {},
    page = 1,
    limit = 20
  ): Promise<ContraApiResponse<ContraExpert[]>> {
    const queryParams = {
      program,
      page,
      limit,
      ...filters,
    };

    const queryString = buildQueryString(queryParams);
    const response = await this.fetch<ContraApiResponse<ContraExpert[]>>(`/experts${queryString}`);
    
    return response;
  }

  /**
   * Get a single expert by ID
   */
  async getExpert(expertId: string): Promise<ContraExpert> {
    const response = await this.fetch<{ data: ContraExpert }>(`/experts/${expertId}`);
    return response.data;
  }

  /**
   * Search experts by query string
   */
  async searchExperts(
    query: string,
    filters: ContraFilters = {},
    page = 1,
    limit = 20
  ): Promise<ContraApiResponse<ContraExpert[]>> {
    const queryParams = {
      q: query,
      page,
      limit,
      ...filters,
    };

    const queryString = buildQueryString(queryParams);
    const response = await this.fetch<ContraApiResponse<ContraExpert[]>>(`/experts/search${queryString}`);
    
    return response;
  }
} 