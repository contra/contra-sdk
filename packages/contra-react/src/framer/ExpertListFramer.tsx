import React, { useState, useEffect, useMemo } from 'react';
import type { CSSProperties } from 'react';
import { addPropertyControls, ControlType } from "framer"

// Helper function to get global configuration
const getContraConfig = () => {
  try {
    const windowConfig = (window as any).contraConfig;
    if (windowConfig && windowConfig.apiKey && windowConfig.programId) {
      return windowConfig;
    }
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

// Types
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
  socialLinks: Array<{
    label: string | null;
    url: string;
  }>;
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

// Project Media Component
function ProjectMedia({ src, alt, title }: { src: string; alt: string; title: string }) {
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Detect if the source is a video file
  const isVideo = src && (
    src.toLowerCase().includes('.mp4') || 
    src.toLowerCase().includes('.webm') || 
    src.toLowerCase().includes('.mov') ||
    src.toLowerCase().includes('video') ||
    src.toLowerCase().includes('.m4v')
  );

  if (error || !src) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#F3F4F6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#9CA3AF',
        fontSize: '12px',
        borderRadius: '8px'
      }}>
        {isVideo ? '🎬' : '🖼️'}
      </div>
    );
  }

  const commonStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    borderRadius: '8px',
    transition: 'transform 0.2s ease',
  };

  if (isVideo) {
    return (
      <video
        src={src}
        style={commonStyle}
        muted
        loop
        playsInline
        onLoadStart={() => setIsLoading(true)}
        onLoadedData={() => setIsLoading(false)}
        onError={() => setError(true)}
        onMouseEnter={(e) => {
          // Auto-play on hover for better UX
          (e.target as HTMLVideoElement).play().catch(() => {
            // Silent fail if autoplay is blocked
          });
        }}
        onMouseLeave={(e) => {
          // Pause when not hovering
          (e.target as HTMLVideoElement).pause();
          (e.target as HTMLVideoElement).currentTime = 0;
        }}
      >
        <source src={src} type="video/mp4" />
        {/* Fallback for unsupported video */}
        <div style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#F3F4F6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#9CA3AF',
          fontSize: '12px'
        }}>
          🎬 Video
        </div>
      </video>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      style={commonStyle}
      onLoad={() => setIsLoading(false)}
      onError={() => setError(true)}
    />
  );
}

// Expert Card Component - Horizontal Layout
function ExpertCard({ 
  expert, 
  colors, 
  showSkills, 
  showProjects, 
  showDescription,
  maxSkills, 
  maxProjects 
}: {
  expert: ExpertProfile;
  colors: any;
  showSkills: boolean;
  showProjects: boolean;
  showDescription: boolean;
  maxSkills: number;
  maxProjects: number;
}) {
  // Formatting utilities
  const formatEarnings = (amount: number): string => {
    if (amount >= 1000000) return `$${Math.floor(amount / 1000000)}M+`;
    if (amount >= 1000) return `$${Math.floor(amount / 1000)}k+`;
    return `$${amount}+`;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${Math.floor(num / 1000000)}M`;
    if (num >= 1000) return `${Math.floor(num / 1000)}k`;
    return num.toString();
  };

  // Click handlers
  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (expert.inquiryUrl) window.open(expert.inquiryUrl, '_blank', 'noopener,noreferrer');
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (expert.profileUrl) window.open(expert.profileUrl, '_blank', 'noopener,noreferrer');
  };

  const handleProjectClick = (projectUrl: string) => {
    if (projectUrl) window.open(projectUrl, '_blank', 'noopener,noreferrer');
  };

  const cardStyle: CSSProperties = {
    border: `1px solid ${colors.borderColor}`,
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '16px',
    backgroundColor: colors.backgroundColor,
    transition: 'all 0.2s ease',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  };

  return (
    <article
      style={cardStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Main Horizontal Layout */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '24px',
        marginBottom: (showSkills || showProjects) ? '20px' : '0'
      }}>
        {/* Left: Avatar & Basic Info */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', minWidth: '240px' }}>
          <img
            src={expert.avatarUrl}
            alt={`${expert.name} avatar`}
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              objectFit: 'cover',
              flexShrink: 0,
              cursor: 'pointer'
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${expert.name}`;
            }}
            onClick={handleProfileClick}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 600,
              color: colors.textColor,
              lineHeight: 1.2,
              cursor: 'pointer'
            }}
            onClick={handleProfileClick}
            >
              {expert.name}
            </h3>
            <div style={{
              margin: '4px 0 0 0',
              fontSize: '12px',
              color: colors.textMutedColor,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span>📍</span>
              <span>{expert.location}</span>
            </div>
            {/* Expert Description - Optional */}
            {showDescription && expert.oneLiner && (
              <p style={{
                margin: '8px 0 0 0',
                fontSize: '14px',
                color: colors.textMutedColor,
                lineHeight: 1.4,
                wordWrap: 'break-word',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}>
                {expert.oneLiner}
              </p>
            )}
          </div>
        </div>

        {/* Center: Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '24px',
          flex: 1,
          minWidth: '500px'
        }}>
          {/* Total Earned */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '18px',
              fontWeight: 700,
              color: colors.textColor,
              lineHeight: 1
            }}>
              {formatEarnings(expert.earningsUSD)}
            </div>
            <div style={{
              fontSize: '12px',
              color: colors.textMutedColor,
              marginTop: '2px',
              fontWeight: 500
            }}>
              Total earned
            </div>
          </div>

          {/* Projects Count */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '18px',
              fontWeight: 700,
              color: colors.textColor,
              lineHeight: 1
            }}>
              {formatNumber(expert.projectsCompletedCount)}
            </div>
            <div style={{
              fontSize: '12px',
              color: colors.textMutedColor,
              marginTop: '2px',
              fontWeight: 500
            }}>
              Projects
            </div>
          </div>

          {/* Star Rating */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '18px',
              fontWeight: 700,
              color: colors.textColor,
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}>
              <span style={{ color: '#FFC107', fontSize: '16px' }}>★</span>
              <span>{expert.averageReviewScore.toFixed(1)}</span>
            </div>
            <div style={{
              fontSize: '12px',
              color: colors.textMutedColor,
              marginTop: '2px',
              fontWeight: 500
            }}>
              Rating
            </div>
          </div>

          {/* Followers */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '18px',
              fontWeight: 700,
              color: colors.textColor,
              lineHeight: 1
            }}>
              {formatNumber(expert.followersCount)}
            </div>
            <div style={{
              fontSize: '12px',
              color: colors.textMutedColor,
              marginTop: '2px',
              fontWeight: 500
            }}>
              Followers
            </div>
          </div>

          {/* Hourly Rate or Reviews */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '18px',
              fontWeight: 700,
              color: colors.textColor,
              lineHeight: 1
            }}>
              {expert.hourlyRateUSD ? `$${expert.hourlyRateUSD}` : formatNumber(expert.reviewsCount)}
            </div>
            <div style={{
              fontSize: '12px',
              color: colors.textMutedColor,
              marginTop: '2px',
              fontWeight: 500
            }}>
              {expert.hourlyRateUSD ? 'Per hour' : 'Reviews'}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          minWidth: '200px',
          justifyContent: 'flex-end'
        }}>
          {expert.available && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: '#ECFDF5',
              border: '1px solid #D1FAE5',
              borderRadius: '20px'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                backgroundColor: colors.accentSuccessColor,
                borderRadius: '50%'
              }} />
              <span style={{
                fontSize: '12px',
                color: '#059669',
                fontWeight: 600
              }}>
                Available Now
              </span>
            </div>
          )}

          <button
            onClick={handleContactClick}
            style={{
              backgroundColor: colors.buttonPrimaryBackground,
              color: colors.buttonPrimaryText,
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.buttonPrimaryHover;
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.buttonPrimaryBackground;
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Send Message
          </button>
        </div>
      </div>

      {/* Bottom Section: Skills & Projects */}
      {(showSkills || showProjects) && (
        <div>
          {/* Skills Row */}
          {showSkills && expert.skillTags && expert.skillTags.length > 0 && (
            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: showProjects ? '16px' : '0',
              flexWrap: 'wrap'
            }}>
              {expert.skillTags.slice(0, maxSkills).map((skill, index) => (
                <span
                  key={index}
                  style={{
                    backgroundColor: '#F3F4F6',
                    color: '#374151',
                    padding: '6px 12px',
                    borderRadius: '16px',
                    fontSize: '13px',
                    fontWeight: 500,
                    border: '1px solid #E5E7EB'
                  }}
                >
                  {skill}
                </span>
              ))}
              {expert.skillTags.length > maxSkills && (
                <span
                  style={{
                    backgroundColor: colors.textMutedColor,
                    color: colors.backgroundColor,
                    padding: '6px 12px',
                    borderRadius: '16px',
                    fontSize: '13px',
                    fontWeight: 500
                  }}
                >
                  +{expert.skillTags.length - maxSkills} more
                </span>
              )}
            </div>
          )}

          {/* Projects Grid */}
          {showProjects && expert.projects && expert.projects.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(maxProjects, 4)}, 1fr)`,
              gap: '12px'
            }}>
              {expert.projects.slice(0, maxProjects).map((project, index) => {
                const showViewMore = index === maxProjects - 1 && expert.projects.length > maxProjects;
                
                return (
                  <div
                    key={index}
                    style={{
                      position: 'relative',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      aspectRatio: '4/3',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      const img = e.currentTarget.querySelector('img') as HTMLImageElement;
                      if (img) img.style.transform = 'scale(1.05)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      const img = e.currentTarget.querySelector('img') as HTMLImageElement;
                      if (img) img.style.transform = 'scale(1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    onClick={() => handleProjectClick(project.projectUrl)}
                  >
                    <ProjectMedia
                      src={project.coverUrl}
                      alt={project.title}
                      title={project.title}
                    />
                    {showViewMore && (
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 600
                      }}>
                        +{expert.projects.length - maxProjects} more →
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

/**
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 400
 */
export default function ExpertListFramer(props: any) {
  const {
    // Theme Colors
    backgroundColor,
    borderColor,
    textColor,
    textMutedColor,
    accentSuccessColor,
    buttonPrimaryBackground,
    buttonPrimaryText,
    buttonPrimaryHover,
    
    // API Configuration
    apiKey: propApiKey,
    programId: propProgramId,
    apiBaseUrl: propApiBaseUrl = 'https://contra.com',
    debugMode: propDebugMode = false,
    enableApiData = true,

    // Display Options
    showDescription = false,
    showSkills = false,
    showProjects = true,
    maxSkills = 5,
    maxProjects = 4,
    itemsPerPage = 10,
    spacing = '16px',

    // Filtering
    availableOnly = false,
    locationFilter = '',
    minRate = 0,
    maxRate = 0,
    sortBy = 'relevance',

    // Mock Data
    showMockData = true,
    mockItemCount = 3,

    // Framer props
    style,
    width,
    height,
    ...otherProps
  } = props;

  // Get configuration
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

  // State
  const [experts, setExperts] = useState<ExpertProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Color system
  const colors = {
    backgroundColor: backgroundColor || '#FFFFFF',
    borderColor: borderColor || '#E5E7EB',
    textColor: textColor || '#111827',
    textMutedColor: textMutedColor || '#6B7280',
    accentSuccessColor: accentSuccessColor || '#10B981',
    buttonPrimaryBackground: buttonPrimaryBackground || '#111827',
    buttonPrimaryText: buttonPrimaryText || '#FFFFFF',
    buttonPrimaryHover: buttonPrimaryHover || '#374151',
  };

  // Listen for config updates
  useEffect(() => {
    const handleConfigUpdate = () => {
      if (debugMode) {
        console.log('[ExpertListFramer] Configuration updated, source:', getActiveConfig().source);
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
        console.log('[ExpertListFramer] Received filter change:', filters);
      }
      fetchExperts(filters);
    };
    window.addEventListener('contra:filterChange', handleFilterChange);
    return () => window.removeEventListener('contra:filterChange', handleFilterChange);
  }, [apiKey, programId, apiBaseUrl, debugMode]);

  // Fetch experts
  const fetchExperts = async (filters = {}) => {
    if (!enableApiData || !apiKey || !programId) {
      if (debugMode && enableApiData) {
        console.log('[ExpertListFramer] API data requested but missing config. Config source:', activeConfig.source);
      }
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('limit', itemsPerPage.toString());
      
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
        console.log(`[ExpertListFramer] Fetching from: ${endpoint} (config source: ${activeConfig.source})`);
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
          console.log('[ExpertListFramer] Successfully fetched experts:', result.data.length);
        }
      } else {
        throw new Error('No expert data received from API');
      }
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch experts';
      setError(errorMessage);
      if (debugMode) {
        console.error('[ExpertListFramer] API Error:', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchExperts();
  }, [enableApiData, apiKey, programId, apiBaseUrl, itemsPerPage, sortBy, availableOnly, locationFilter, minRate, maxRate]);

  // Mock data
  const mockExperts: ExpertProfile[] = useMemo(() => 
    Array.from({ length: mockItemCount }, (_, i) => ({
      id: `mock-${i}`,
      name: `Andrew Ehrensperger`,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=Expert${i}`,
      location: 'Bath, UK',
      oneLiner: 'Expert designer crafting scroll-driven luxury experiences with advanced animations',
      available: i % 2 === 0,
      profileUrl: '#',
      inquiryUrl: '#',
      hourlyRateUSD: 75 + i * 25,
      earningsUSD: 66000 + i * 15000,
      projectsCompletedCount: 16 + i * 5,
      followersCount: 109 + i * 50,
      reviewsCount: 25 + i * 10,
      averageReviewScore: 5.0,
      skillTags: ['Scroll-Story', 'Luxury Design', 'Live 3D', 'Animation', 'Branding', 'Interactive', 'WebGL'],
      socialLinks: [
        { label: 'LinkedIn', url: '#' },
        { label: 'Portfolio', url: '#' }
      ],
      projects: Array.from({length: 6}).map((_, pIndex) => ({
        title: `Luxury Project ${i+1}-${pIndex+1}`,
        projectUrl: '#',
        coverUrl: `https://via.placeholder.com/400x300/${['4F46E5', '7C3AED', 'DC2626', '059669', 'F59E0B', '3B82F6'][pIndex]}/ffffff?text=P${i+1}${pIndex+1}`
      })),
    }))
  , [mockItemCount]);

  // Determine data to show
  const shouldShowMockData = showMockData && (!enableApiData || !apiKey || !programId || error);
  const displayExperts = shouldShowMockData ? mockExperts : experts;

  const containerStyle: CSSProperties = {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    width: width || 'fit-content',
    height: height || 'auto',
    position: 'relative',
    ...style,
  };

  // Loading state
  if (loading && experts.length === 0) {
    return (
      <div style={{ 
        ...containerStyle, 
        textAlign: 'center', 
        padding: '48px 24px', 
        color: colors.textMutedColor,
        backgroundColor: '#F9FAFB',
        borderRadius: '12px',
        margin: '16px 0',
        border: `1px solid ${colors.borderColor}`
      }}>
        <div style={{ fontSize: '24px', marginBottom: '12px' }}>⏳</div>
        <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Loading experts...</div>
        <div>Finding the best matches for you</div>
      </div>
    );
  }

  // Error state
  if (error && !shouldShowMockData) {
    return (
      <div style={{ 
        ...containerStyle,
        textAlign: 'center', 
        padding: '48px 24px', 
        backgroundColor: '#FEF2F2',
        color: '#DC2626',
        borderRadius: '12px',
        margin: '16px 0',
        border: '1px solid #FECACA'
      }}>
        <div style={{ fontSize: '24px', marginBottom: '12px' }}>❌</div>
        <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Error loading experts</div>
        <div>{error}</div>
      </div>
    );
  }

  // Empty state
  if (displayExperts.length === 0) {
    return (
      <div style={{ 
        ...containerStyle,
        textAlign: 'center', 
        padding: '48px 24px', 
        color: colors.textMutedColor,
        backgroundColor: '#F9FAFB',
        borderRadius: '12px',
        margin: '16px 0',
        border: `1px solid ${colors.borderColor}`
      }}>
        <div style={{ fontSize: '24px', marginBottom: '12px' }}>🔍</div>
        <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No experts found</div>
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
          zIndex: 10,
          fontWeight: 600
        }}>
          {shouldShowMockData ? '🎭 Mock Data' : `Config: ${activeConfig.source === 'global' ? '🌐 Global' : '⚙️ Local'}`}
        </div>
      )}

      {/* Expert List */}
      <div style={{ gap: spacing }}>
        {displayExperts.map((expert) => (
          <ExpertCard
            key={expert.id}
            expert={expert}
            colors={colors}
            showDescription={showDescription}
            showSkills={showSkills}
            showProjects={showProjects}
            maxSkills={maxSkills}
            maxProjects={maxProjects}
          />
        ))}
      </div>
    </div>
  );
}

// Property Controls
addPropertyControls(ExpertListFramer, {
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
  textMutedColor: { 
    type: ControlType.Color, 
    title: "Muted Text Color", 
    defaultValue: "#6B7280",
    description: "Muted text color"
  },
  accentSuccessColor: { 
    type: ControlType.Color, 
    title: "Available Badge Color", 
    defaultValue: "#10B981",
    description: "Available badge accent color"
  },
  buttonPrimaryBackground: { 
    type: ControlType.Color, 
    title: "Button Background", 
    defaultValue: "#111827",
    description: "Message button background"
  },
  buttonPrimaryText: { 
    type: ControlType.Color, 
    title: "Button Text", 
    defaultValue: "#FFFFFF",
    description: "Message button text"
  },
  buttonPrimaryHover: { 
    type: ControlType.Color, 
    title: "Button Hover", 
    defaultValue: "#374151",
    description: "Message button hover background"
  },

  // === API CONFIGURATION ===
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

  // === DISPLAY OPTIONS ===
  showDescription: { 
    type: ControlType.Boolean, 
    title: "Show Description", 
    defaultValue: false,
    description: "Display expert one-liner description with text wrapping"
  },
  showSkills: { 
    type: ControlType.Boolean, 
    title: "Show Skill Tags", 
    defaultValue: false,
    description: "Display expert skill tags"
  },
  showProjects: { 
    type: ControlType.Boolean, 
    title: "Show Projects", 
    defaultValue: true,
    description: "Display recent work projects grid"
  },
  maxSkills: { 
    type: ControlType.Number, 
    title: "Max Skills", 
    defaultValue: 5, 
    min: 1, 
    max: 10,
    hidden: (props: any) => !props.showSkills,
    description: "Maximum skill tags to display"
  },
  maxProjects: { 
    type: ControlType.Number, 
    title: "Max Projects", 
    defaultValue: 4, 
    min: 1, 
    max: 8,
    hidden: (props: any) => !props.showProjects,
    description: "Maximum projects to display"
  },
  itemsPerPage: { 
    type: ControlType.Number, 
    title: "Items Per Page", 
    defaultValue: 10, 
    min: 1, 
    max: 50,
    description: "Number of experts to fetch from API"
  },
  spacing: { 
    type: ControlType.String, 
    title: "Card Spacing", 
    defaultValue: "16px",
    description: "Space between expert cards"
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
    defaultValue: 3, 
    min: 1, 
    max: 10,
    hidden: (props: any) => !props.showMockData,
    description: "Number of mock expert cards to show"
  },
}); 