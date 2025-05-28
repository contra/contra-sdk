/**
 * Generate star rating SVG based on score (0-5)
 */
export function starSVG(score: number): string {
  const fullStars = Math.floor(score);
  const hasHalfStar = score % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  let html = '';
  
  // Full stars
  for (let i = 0; i < fullStars; i++) {
    html += `<svg width="16" height="16" viewBox="0 0 24 24" fill="#FFD700" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>`;
  }
  
  // Half star
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
  
  // Empty stars
  for (let i = 0; i < emptyStars; i++) {
    html += `<svg width="16" height="16" viewBox="0 0 24 24" fill="#E5E5E5" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>`;
  }
  
  return html;
}

/**
 * Build query string from object
 */
export function buildQueryString(params: Record<string, any>): string {
  const filtered = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map(v => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`).join('&');
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    });
  
  return filtered.length > 0 ? `?${filtered.join('&')}` : '';
} 