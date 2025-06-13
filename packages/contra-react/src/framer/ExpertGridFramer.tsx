import React, { useState, useEffect, useMemo } from 'react';
import type { CSSProperties } from 'react';
import { addPropertyControls, ControlType } from "framer"

// Helper function to get global configuration
const getContraConfig = () => {
  try {
    // Try window global first (fastest)
    const windowConfig = (window as any).contraConfig;
    if (windowConfig && windowConfig.apiKey && windowConfig.programId) {
      return windowConfig;
    }

    // Fallback to localStorage
    const storedConfig = localStorage.getItem('contraConfig');
    if (storedConfig) {
      const parsed = JSON.parse(storedConfig);
      if (parsed.apiKey && parsed.programId) {
        return parsed;
      }
    }

    return null;
  } catch (error) {
    return null;
  }
};

// --- Inlined Types ---
interface ExpertProfile {
  id: string;
  name: string;
  avatarUrl: string;
  location: string;
  oneLiner: string;
  available: boolean;
  profileUrl: string;
  inquiryUrl: string;
  hourlyRateUSD: number | null;
  earningsUSD: number;
  projectsCompletedCount: number;
  followersCount: number;
  reviewsCount: number;
  averageReviewScore: number;
  skillTags: string[];
  projects: Array<{
    title: string;
    projectUrl: string;
    coverUrl: string;
  }>;
}

interface ExpertProfileListResponse {
  data: ExpertProfile[];
  totalCount: number;
}

// --- Inlined StarRating Component ---
function InlinedStarRating({ rating, size = 12, showValue = true }: { rating: number; size?: number; showValue?: boolean }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  const renderStar = (type: 'full' | 'half' | 'empty', key: number) => {
    const id = `star-${key}-${Math.random().toString(36).substr(2, 9)}`;
    return (
      <svg key={key} width={size} height={size} viewBox="0 0 24 24" fill="none">
        {type === 'half' && (
          <defs>
            <linearGradient id={id}>
              <stop offset="50%" stopColor="#FFC107" />
              <stop offset="50%" stopColor="#E5E7EB" />
            </linearGradient>
          </defs>
        )}
        <path 
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill={type === 'full' ? '#FFC107' : type === 'half' ? `url(#${id})` : '#E5E7EB'}
        />
      </svg>
    );
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <div style={{ display: 'flex', gap: '1px' }}>
        {Array(fullStars).fill('full').map((_, i) => renderStar('full', i))}
        {hasHalfStar && renderStar('half', fullStars)}
        {Array(emptyStars).fill('empty').map((_, i) => renderStar('empty', fullStars + (hasHalfStar ? 1 : 0) + i))}
      </div>
      {showValue && (
        <span style={{ fontSize: size, fontWeight: 600, color: '#374151' }}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

// --- Inlined MediaRenderer Component ---
function InlinedMediaRenderer({ src, alt = 'Project image', aspectRatio = '1/1' }: { src: string; alt?: string; aspectRatio?: string }) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div style={{ 
        width: '100%', 
        aspectRatio, 
        backgroundColor: '#F3F4F6', 
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#9CA3AF',
        fontSize: '12px'
      }}>
        🖼️
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: '8px',
      }}
      onError={() => setError(true)}
    />
  );
}

// --- Inlined ExpertCard Component (matching your design specs) ---
function InlinedExpertCard({ expert, colors }: { expert: ExpertProfile; colors: any }) {
  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (expert.inquiryUrl) window.open(expert.inquiryUrl, '_blank', 'noopener,noreferrer');
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (expert.profileUrl) window.open(expert.profileUrl, '_blank', 'noopener,noreferrer');
  };

  const cardStyle: CSSProperties = {
    backgroundColor: colors.backgroundColor,
    border: `1px solid ${colors.borderColor}`,
    borderRadius: '12px',
    padding: '24px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    height: 'fit-content',
  };

  return (
    <article
      style={cardStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px 0 rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
      }}
    >
      {/* Header with Avatar and Basic Info */}
      <header style={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        justifyContent: 'space-between',
        marginBottom: '16px' 
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
          <img
            src={expert.avatarUrl}
            alt={`${expert.name} avatar`}
            style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '50%', 
              objectFit: 'cover',
              flexShrink: 0 
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${expert.name}`;
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ 
              margin: 0, 
              fontSize: '16px', 
              fontWeight: 600, 
              color: colors.textColor,
              lineHeight: '20px'
            }}>
              {expert.name}
            </h3>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px', 
              margin: '4px 0' 
            }}>
              <InlinedStarRating rating={expert.averageReviewScore} size={12} showValue={true} />
            </div>
            {expert.hourlyRateUSD && (
              <div style={{ 
                fontSize: '14px', 
                color: colors.textSecondaryColor,
                fontWeight: 500
              }}>
                ${expert.hourlyRateUSD}/hr
              </div>
            )}
          </div>
        </div>
        
        {expert.available && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px',
            backgroundColor: colors.accentSuccessColor || '#10B981',
            color: '#065F46',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 500,
            flexShrink: 0
          }}>
            <span style={{ 
              width: '6px', 
              height: '6px', 
              borderRadius: '50%', 
              backgroundColor: '#10B981'
            }} />
            Available Now
          </div>
        )}
      </header>

      {/* Projects Grid - 2x2 layout exactly like your design */}
      {expert.projects && expert.projects.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '8px'
          }}>
            {expert.projects.slice(0, 4).map((project, index) => {
              const showViewMore = index === 3 && expert.projects.length > 4;
              
              return (
                <div
                  key={index}
                  style={{ 
                    position: 'relative',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    transition: 'transform 0.2s ease',
                    cursor: 'pointer',
                    aspectRatio: '1/1'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  onClick={handleProfileClick}
                >
                  <InlinedMediaRenderer 
                    src={project.coverUrl} 
                    alt={project.title} 
                    aspectRatio="1/1"
                  />
                  {showViewMore && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 500
                    }}>
                      View more →
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Message Button */}
      <button 
        onClick={handleContactClick} 
        style={{
          width: '100%',
          backgroundColor: colors.buttonPrimaryBackground || '#111827',
          color: colors.buttonPrimaryText || '#FFFFFF',
          border: 'none',
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        Message
      </button>
    </article>
  );
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 600
 */
export default function ExpertGridFramer(props: any) {
  const {
    // Theme Colors (using global styles)
    backgroundColor,
    borderColor,
    textColor,
    textSecondaryColor,
    accentSuccessColor,
    buttonPrimaryBackground,
    buttonPrimaryText,

    // API Configuration (optional - will use global config if available)
    apiKey: propApiKey,
    programId: propProgramId,
    apiBaseUrl: propApiBaseUrl = 'https://contra.com',
    debugMode: propDebugMode = false,
    enableApiData = true,

    // Grid Layout
    columns = 'auto-fit',
    minCardWidth = '300px',
    maxCardWidth = '400px',
    gap = '24px',
    itemsPerPage = 20,

    // Filtering
    availableOnly = false,
    locationFilter = '',
    minRate = 0,
    maxRate = 0,
    sortBy = 'relevance',

    // Mock Data for Canvas
    showMockData = true,
    mockItemCount = 6,

    // Framer props
    style,
    width,
    height,
    ...otherProps
  } = props;

  // Get configuration from global config or props
  const getActiveConfig = () => {
    const globalConfig = getContraConfig();
    
    if (globalConfig) {
      return {
        apiKey: globalConfig.apiKey,
        programId: globalConfig.programId,
        apiBaseUrl: globalConfig.apiBaseUrl,
        debugMode: globalConfig.debugMode,
        source: 'global'
      };
    }
    
    return {
      apiKey: propApiKey,
      programId: propProgramId,
      apiBaseUrl: propApiBaseUrl,
      debugMode: propDebugMode,
      source: 'props'
    };
  };

  const activeConfig = getActiveConfig();
  const { apiKey, programId, apiBaseUrl, debugMode } = activeConfig;

  // State for API data
  const [experts, setExperts] = useState<ExpertProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Colors system
  const colors = {
    backgroundColor: backgroundColor || '#FFFFFF',
    borderColor: borderColor || '#E5E7EB',
    textColor: textColor || '#111827',
    textSecondaryColor: textSecondaryColor || '#6B7280',
    accentSuccessColor: accentSuccessColor || '#10B981',
    buttonPrimaryBackground: buttonPrimaryBackground || '#111827',
    buttonPrimaryText: buttonPrimaryText || '#FFFFFF',
  };

  // Listen for configuration updates
  useEffect(() => {
    const handleConfigUpdate = () => {
      if (debugMode) {
        console.log('[ExpertGridFramer] Configuration updated, source:', getActiveConfig().source);
      }
    };

    window.addEventListener('contraConfigUpdated', handleConfigUpdate);
    return () => window.removeEventListener('contraConfigUpdated', handleConfigUpdate);
  }, [debugMode]);

  // Listen for filter events
  useEffect(() => {
    const handleFilterChange = (event: any) => {
      const { filters } = event.detail;
      if (debugMode) {
        console.log('[ExpertGridFramer] Received filter change:', filters);
      }
      // Update filters and refetch data
      fetchExperts(filters);
    };

    window.addEventListener('contra:filterChange', handleFilterChange);
    return () => window.removeEventListener('contra:filterChange', handleFilterChange);
  }, [apiKey, programId, apiBaseUrl, debugMode]);

  // Fetch experts from API
  const fetchExperts = async (filters = {}) => {
    if (!enableApiData || !apiKey || !programId) {
      if (debugMode && enableApiData) {
        console.log('[ExpertGridFramer] API data requested but missing config. Config source:', activeConfig.source);
      }
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('limit', itemsPerPage.toString());
      
      // Apply filters
      const allFilters = { 
        sortBy, 
        available: availableOnly || undefined,
        location: locationFilter || undefined,
        minRate: minRate > 0 ? minRate : undefined,
        maxRate: maxRate > 0 ? maxRate : undefined,
        ...filters 
      };

      Object.entries(allFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });

      const endpoint = `${apiBaseUrl}/public-api/programs/${programId}/experts?${params}`;
      
      if (debugMode) {
        console.log(`[ExpertGridFramer] Fetching from: ${endpoint} (config source: ${activeConfig.source})`);
      }

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `${apiKey}`,
          'X-API-Key': `${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const result: ExpertProfileListResponse = await response.json();
      
      if (result && result.data) {
        setExperts(result.data);
        if (debugMode) {
          console.log('[ExpertGridFramer] Successfully fetched experts:', result.data.length);
        }
      } else {
        throw new Error('No expert data received from API');
      }
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch experts';
      setError(errorMessage);
      if (debugMode) {
        console.error('[ExpertGridFramer] API Error:', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchExperts();
  }, [enableApiData, apiKey, programId, apiBaseUrl, itemsPerPage, sortBy, availableOnly, locationFilter, minRate, maxRate]);

  // Mock data for canvas/preview
  const mockExperts: ExpertProfile[] = useMemo(() => 
    Array.from({ length: mockItemCount }, (_, i) => ({
      id: `mock-${i}`,
      name: `Expert ${i + 1}`,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=Expert${i}`,
      location: 'San Francisco, CA',
      oneLiner: 'Creative designer & developer',
      available: i % 2 === 0,
      profileUrl: '#',
      inquiryUrl: '#',
      hourlyRateUSD: 100 + i * 25,
      earningsUSD: 5000 + i * 1000,
      projectsCompletedCount: 5 + i,
      followersCount: 100 + i * 10,
      reviewsCount: 10 + i * 2,
      averageReviewScore: Math.min(5, 4.5 + (i % 5) * 0.1),
      skillTags: ['Design', 'Development'],
      projects: Array.from({length: 4}).map((_, pIndex) => ({
        title: `Project ${i+1}-${pIndex+1}`,
        projectUrl: '#',
        coverUrl: `https://via.placeholder.com/200x200/${['4F46E5', '7C3AED', 'DC2626', '059669'][pIndex]}/ffffff?text=P${i+1}${pIndex+1}`
      })),
    }))
  , [mockItemCount]);

  // Determine which data to show
  const shouldShowMockData = showMockData && (!enableApiData || !apiKey || !programId || error);
  const displayExperts = shouldShowMockData ? mockExperts : experts;

  const containerStyle: CSSProperties = {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    width: width || '100%',
    height: height || 'auto',
    position: 'relative',
    ...style,
  };

  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: columns === 'auto-fit' 
      ? `repeat(auto-fit, minmax(${minCardWidth}, ${maxCardWidth}))` 
      : `repeat(${columns}, 1fr)`,
    gap,
    width: '100%',
  };

  // Loading state
  if (loading && experts.length === 0) {
    return (
      <div style={{ ...containerStyle, padding: '48px', textAlign: 'center', color: colors.textSecondaryColor }}>
        <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>⏳ Loading experts...</div>
        <div>Finding the best matches for you</div>
      </div>
    );
  }

  // Error state (when not showing mock data)
  if (error && !shouldShowMockData) {
    return (
      <div style={{ 
        ...containerStyle, 
        padding: '48px', 
        textAlign: 'center', 
        color: '#DC2626',
        backgroundColor: '#FEF2F2',
        border: '1px solid #DC2626',
        borderRadius: '12px' 
      }}>
        <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>❌ Error loading experts</div>
        <div>{error}</div>
      </div>
    );
  }

  // No results state
  if (displayExperts.length === 0) {
    return (
      <div style={{ ...containerStyle, padding: '48px', textAlign: 'center', color: colors.textSecondaryColor }}>
        <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>🔍 No experts found</div>
        <div>Try adjusting your filters or search criteria</div>
      </div>
    );
  }

  return (
    <div style={containerStyle} {...otherProps}>
      {/* Debug indicator */}
      {debugMode && (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          fontSize: '10px',
          padding: '4px 8px',
          backgroundColor: shouldShowMockData ? '#F59E0B' : activeConfig.source === 'global' ? '#10B981' : '#6366F1',
          color: 'white',
          borderRadius: '4px',
          zIndex: 10
        }}>
          {shouldShowMockData ? '🎭 Mock' : `Config: ${activeConfig.source === 'global' ? '🌐 Global' : '⚙️ Local'}`}
        </div>
      )}

      {/* Expert Grid */}
      <div style={gridStyle}>
        {displayExperts.map((expert) => (
          <InlinedExpertCard
            key={expert.id}
            expert={expert}
            colors={colors}
          />
        ))}
      </div>
    </div>
  );
}

// Property Controls
addPropertyControls(ExpertGridFramer, {
  // === COLORS ===
  backgroundColor: { 
    type: ControlType.Color, 
    title: "Card Background", 
    defaultValue: "#FFFFFF",
    description: "Expert card background color"
  },
  borderColor: { 
    type: ControlType.Color, 
    title: "Border Color", 
    defaultValue: "#E5E7EB",
    description: "Card border color"
  },
  textColor: { 
    type: ControlType.Color, 
    title: "Text Color", 
    defaultValue: "#111827",
    description: "Primary text color"
  },
  textSecondaryColor: { 
    type: ControlType.Color, 
    title: "Secondary Text Color", 
    defaultValue: "#6B7280",
    description: "Secondary text color"
  },
  accentSuccessColor: { 
    type: ControlType.Color, 
    title: "Available Badge Color", 
    defaultValue: "#10B981",
    description: "Available badge color"
  },
  buttonPrimaryBackground: { 
    type: ControlType.Color, 
    title: "Button Background", 
    defaultValue: "#111827",
    description: "Message button background color"
  },
  buttonPrimaryText: { 
    type: ControlType.Color, 
    title: "Button Text Color", 
    defaultValue: "#FFFFFF",
    description: "Message button text color"
  },

  // === API CONFIGURATION (Optional - uses global config if available) ===
  enableApiData: { 
    type: ControlType.Boolean, 
    title: "Use API Data", 
    defaultValue: true,
    description: "Fetch real expert data from API (uses global config from ContraConfigFramer if available)"
  },
  apiKey: { 
    type: ControlType.String, 
    title: "API Key (Override)", 
    placeholder: "csk_...", 
    hidden: (props: any) => !props.enableApiData,
    description: "Override global API key (leave empty to use ContraConfigFramer)"
  },
  programId: { 
    type: ControlType.String, 
    title: "Program ID (Override)", 
    placeholder: "program_...", 
    hidden: (props: any) => !props.enableApiData,
    description: "Override global program ID (leave empty to use ContraConfigFramer)"
  },
  apiBaseUrl: { 
    type: ControlType.String, 
    title: "API Base URL (Override)", 
    defaultValue: "https://contra.com", 
    hidden: (props: any) => !props.enableApiData,
    description: "Override global API base URL"
  },
  debugMode: { 
    type: ControlType.Boolean, 
    title: "Debug Mode (Override)", 
    defaultValue: false, 
    hidden: (props: any) => !props.enableApiData,
    description: "Override global debug mode setting"
  },

  // === GRID LAYOUT ===
  columns: { 
    type: ControlType.Enum, 
    title: "Columns", 
    options: ["auto-fit", "1", "2", "3", "4"], 
    optionTitles: ["Auto Fit", "1", "2", "3", "4"],
    defaultValue: "auto-fit",
    description: "Number of columns in the grid"
  },
  minCardWidth: { 
    type: ControlType.String, 
    title: "Min Card Width", 
    defaultValue: "300px",
    description: "Minimum width for each card"
  },
  maxCardWidth: { 
    type: ControlType.String, 
    title: "Max Card Width", 
    defaultValue: "400px",
    description: "Maximum width for each card"
  },
  gap: { 
    type: ControlType.String, 
    title: "Gap", 
    defaultValue: "24px",
    description: "Space between cards"
  },
  itemsPerPage: { 
    type: ControlType.Number, 
    title: "Items Per Page", 
    defaultValue: 20, 
    min: 1, 
    max: 100,
    description: "Number of experts to fetch from API"
  },

  // === FILTERING ===
  sortBy: { 
    type: ControlType.Enum, 
    title: "Sort By", 
    options: ["relevance", "newest", "oldest"], 
    defaultValue: "relevance",
    description: "Sort order for results"
  },
  availableOnly: { 
    type: ControlType.Boolean, 
    title: "Available Only", 
    defaultValue: false,
    description: "Show only available experts"
  },
  locationFilter: { 
    type: ControlType.String, 
    title: "Location Filter", 
    placeholder: "e.g. San Francisco",
    description: "Filter by location"
  },
  minRate: { 
    type: ControlType.Number, 
    title: "Min Rate", 
    defaultValue: 0, 
    min: 0,
    description: "Minimum hourly rate filter"
  },
  maxRate: { 
    type: ControlType.Number, 
    title: "Max Rate", 
    defaultValue: 0, 
    min: 0,
    description: "Maximum hourly rate filter (0 = no limit)"
  },

  // === MOCK DATA ===
  showMockData: { 
    type: ControlType.Boolean, 
    title: "Show Mock Data", 
    defaultValue: true,
    description: "Show placeholder data when API is not configured"
  },
  mockItemCount: { 
    type: ControlType.Number, 
    title: "Mock Item Count", 
    defaultValue: 6, 
    min: 1, 
    max: 20,
    hidden: (props: any) => !props.showMockData,
    description: "Number of mock expert cards to show"
  },
}); 