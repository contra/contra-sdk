// src/utils.ts
function starSVG(score) {
  const fullStars = Math.floor(score);
  const hasHalfStar = score % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  let html = "";
  for (let i = 0; i < fullStars; i++) {
    html += `<svg width="16" height="16" viewBox="0 0 24 24" fill="#FFD700" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>`;
  }
  if (hasHalfStar) {
    html += `<svg width="16" height="16" viewBox="0 0 24 24" fill="url(#half)" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="half">
          <stop offset="50%" stop-color="#FFD700"/>
          <stop offset="50%" stop-color="#E5E5E5"/>
        </linearGradient>
      </defs>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>`;
  }
  for (let i = 0; i < emptyStars; i++) {
    html += `<svg width="16" height="16" viewBox="0 0 24 24" fill="#E5E5E5" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>`;
  }
  return html;
}
function buildQueryString(params) {
  const filtered = Object.entries(params).filter(([_, value]) => value !== void 0 && value !== null && value !== "").map(([key, value]) => {
    if (Array.isArray(value)) {
      return value.map((v) => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`).join("&");
    }
    return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
  });
  return filtered.length > 0 ? `?${filtered.join("&")}` : "";
}

// src/client.ts
var ContraClient = class {
  constructor(config) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || "https://api.contra.com/v1";
    this.timeout = config.timeout || 1e4;
  }
  /**
   * Generic fetch wrapper with authentication and error handling
   */
  async fetch(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          ...options.headers
        }
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(`Request timeout after ${this.timeout}ms`);
      }
      throw error;
    }
  }
  /**
   * List experts with optional filters
   */
  async listExperts(program, filters = {}, page = 1, limit = 20) {
    const queryParams = {
      program,
      page,
      limit,
      ...filters
    };
    const queryString = buildQueryString(queryParams);
    const response = await this.fetch(`/experts${queryString}`);
    return response;
  }
  /**
   * Get a single expert by ID
   */
  async getExpert(expertId) {
    const response = await this.fetch(`/experts/${expertId}`);
    return response.data;
  }
  /**
   * Search experts by query string
   */
  async searchExperts(query, filters = {}, page = 1, limit = 20) {
    const queryParams = {
      q: query,
      page,
      limit,
      ...filters
    };
    const queryString = buildQueryString(queryParams);
    const response = await this.fetch(`/experts/search${queryString}`);
    return response;
  }
};
export {
  ContraClient,
  buildQueryString,
  starSVG
};
//# sourceMappingURL=index.mjs.map