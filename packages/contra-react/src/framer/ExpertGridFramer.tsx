import React, { useState, useEffect, useCallback, createContext, useContext, useMemo, useRef } from 'react';
import type { CSSProperties, ImgHTMLAttributes, VideoHTMLAttributes } from 'react';
import { addPropertyControls, ControlType } from "framer"

// --- Inlined Type Definitions (derived from @contra/types and OpenAPI spec) ---
interface SocialLink {
  label: string | null;
  url: string;
}

interface ProjectSample {
  title: string;
  projectUrl: string;
  coverUrl: string;
}

// This is the primary data structure for an expert
interface InlinedExpertProfile {
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
  socialLinks: SocialLink[];
  projects: ProjectSample[];
}

// For the API response structure
interface ExpertProfileListResponse {
  data: InlinedExpertProfile[];
  totalCount: number;
}

// Define APIExpertFilters locally based on OpenAPI spec and usage
interface InlinedAPIExpertFilters {
  available?: boolean;
  languages?: string | string[];
  limit?: number;
  location?: string;
  maxRate?: number;
  minRate?: number;
  offset?: number;
  sortBy?: 'relevance' | 'oldest' | 'newest';
  // Allow any other string-keyed properties for extensibility if needed
  [key: string]: string | number | boolean | string[] | undefined;
}
// --- End Inlined Type Definitions ---

// --- Inlined StarRating Logic ---
interface InlinedStarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  color?: string;
  emptyColor?: string;
  showValue?: boolean;
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
}

function InlinedStarRating({
  rating, maxRating = 5, size = 16, color = '#FBBF24', emptyColor = '#E5E7EB',
  showValue = false, ariaLabel, className = '', style,
}: InlinedStarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);
  const starStyle: CSSProperties = { width: size, height: size, display: 'inline-block', marginRight: size * 0.125 };
  const renderStar = (type: 'full' | 'half' | 'empty', key: number) => {
    const id = `star-gradient-${key}-${Math.random().toString(36).substr(2, 9)}`;
    return (
      <svg key={key} style={starStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        {type === 'half' && (
          <defs>
            <linearGradient id={id}>
              <stop offset="50%" stopColor={color} />
              <stop offset="50%" stopColor={emptyColor} />
            </linearGradient>
          </defs>
        )}
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill={type === 'full' ? color : type === 'half' ? `url(#${id})` : emptyColor} />
      </svg>
    );
  };
  const stars = [...Array(fullStars).fill('full'), ...(hasHalfStar ? ['half'] : []), ...Array(emptyStars).fill('empty')];
  const computedAriaLabel = ariaLabel || `Rating: ${rating} out of ${maxRating} stars`;
  return (
    <div className={`contra-star-rating ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', ...style }} role="img" aria-label={computedAriaLabel}>
      {stars.map((type, index) => renderStar(type as any, index))}
      {showValue && <span style={{ marginLeft: size * 0.25, fontSize: size * 0.875, color: 'currentColor', fontWeight: 500 }}>{rating.toFixed(1)}</span>}
    </div>
  );
}
// --- End Inlined StarRating Logic ---

// --- Inlined MediaRenderer Logic ---
interface InlinedMediaRendererProps {
  src: string | null | undefined;
  alt?: string;
  className?: string;
  style?: CSSProperties;
  loading?: 'lazy' | 'eager';
  aspectRatio?: string;
  objectFit?: CSSProperties['objectFit'];
  onError?: () => void;
  videoConfig?: { autoplay?: boolean; muted?: boolean; loop?: boolean; controls?: boolean; hoverPlay?: boolean; };
}

function InlinedMediaRenderer({
  src, alt = 'Media content', className = '', style, loading = 'lazy', aspectRatio, objectFit = 'cover', onError, videoConfig = {},
}: InlinedMediaRendererProps) {
  const [error, setError] = useState(false);
  const [isVideo, setIsVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  useEffect(() => {
    if (!src) { setError(true); return; }
    const urlLower = src.toLowerCase();
    const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.ogg'];
    const isVideoFile = videoExtensions.some(ext => urlLower.includes(ext));
    const isCloudinaryVideo = urlLower.includes('cloudinary.com/') && urlLower.includes('/video/');
    setIsVideo(isVideoFile || isCloudinaryVideo);
    setError(false);
  }, [src]);
  useEffect(() => {
    if (!videoRef.current || !videoConfig.hoverPlay || videoConfig.autoplay) return;
    const video = videoRef.current;
    if (isHovering) video.play().catch(() => {});
    else { video.pause(); video.currentTime = 0; }
  }, [isHovering, videoConfig.hoverPlay, videoConfig.autoplay]);
  const handleError = () => { setError(true); onError?.(); };
  const containerStyle: CSSProperties = { position: 'relative', width: '100%', aspectRatio, overflow: 'hidden', borderRadius: 'inherit', backgroundColor: error ? '#f3f4f6' : undefined, ...style };
  const mediaStyle: CSSProperties = { width: '100%', height: '100%', objectFit, display: 'block' };
  if (error || !src) {
    return (
      <div className={`contra-media-error ${className}`} style={containerStyle}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#9ca3af', fontSize: '12px', textAlign: 'center' }}>
          {isVideo ? '🎬 Video unavailable' : '🖼️ Image unavailable'}
        </div>
      </div>
    );
  }
  if (isVideo) {
    const videoAttributes: VideoHTMLAttributes<HTMLVideoElement> = {
      src, className: `contra-media-video ${className}`, style: mediaStyle, onError: handleError,
      autoPlay: videoConfig.autoplay, muted: videoConfig.muted ?? true, loop: videoConfig.loop ?? true,
      controls: videoConfig.controls ?? false, playsInline: true, preload: 'metadata',
    };
    return (
      <div className="contra-media-container" style={containerStyle} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
        <video ref={videoRef} {...videoAttributes} />
      </div>
    );
  }
  const imgAttributes: ImgHTMLAttributes<HTMLImageElement> = { src, alt, className: `contra-media-image ${className}`, style: mediaStyle, loading, onError: handleError };
  return <div className="contra-media-container" style={containerStyle}><img {...imgAttributes} /></div>;
}
// --- End Inlined MediaRenderer Logic ---

// --- InlinedExpertCardRenderer ---
interface InlinedExpertCardRendererProps {
  expert: InlinedExpertProfile;
  showProjects?: boolean;
  maxProjects?: number;
  showStats?: boolean;
  showSkills?: boolean;
  maxSkills?: number;
  showAvailability?: boolean;
  showRate?: boolean;
  showActions?: boolean;
  videoConfig?: { autoplay?: boolean; muted?: boolean; loop?: boolean; controls?: boolean; hoverPlay?: boolean; };
  style?: CSSProperties; 
  width?: string | number;
  height?: string | number;
}

function InlinedExpertCardRenderer({ expert, ...props }: InlinedExpertCardRendererProps) {
  const videoConfigForMediaRenderer = props.videoConfig || {};
  const handleContactClick = (e: React.MouseEvent) => { e.preventDefault(); if (expert.inquiryUrl) window.open(expert.inquiryUrl, '_blank', 'noopener,noreferrer'); };
  const handleProfileClick = (e: React.MouseEvent) => { e.preventDefault(); if (expert.profileUrl) window.open(expert.profileUrl, '_blank', 'noopener,noreferrer'); };
  
  // Professional formatting functions (matches WebFlow)
  const formatEarnings = (amount: number): string => {
    if (amount >= 1000000) return `$${Math.floor(amount / 1000000)}M+`;
    if (amount >= 1000) return `$${Math.floor(amount / 1000)}k+`;
    return `$${amount}`;
  };
  const formatRate = (rate: number | null): string => rate ? `$${rate}/hr` : 'Rate on request';
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${Math.floor(num / 1000000)}M`;
    if (num >= 1000) return `${Math.floor(num / 1000)}k`;
    return num.toString();
  };

  return (
    <article
      className={'contra-expert-card framer-component'}
      style={{
        border: '1px solid #e4e7ec', 
        borderRadius: '16px', 
        padding: '1.5rem',
        backgroundColor: 'white', 
        transition: 'all 0.2s ease', 
        fontFamily: 'system-ui, -apple-system, sans-serif',
        width: props.width || '100%', 
        height: props.height, 
        ...props.style,
      }}
    >
      {/* Header with Avatar and Basic Info */}
      <header style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
        <InlinedMediaRenderer
            src={expert.avatarUrl} 
            alt={`${expert.name} avatar`}
            style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
            videoConfig={videoConfigForMediaRenderer} 
        />
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: '#111827' }}>{expert.name}</h3>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#6b7280' }}>{expert.location}</p>
          {expert.oneLiner && <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: '#374151', lineHeight: 1.5 }}>{expert.oneLiner}</p>}
        </div>
        {props.showAvailability && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexShrink: 0 }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: expert.available ? '#10b981' : '#9ca3af' }} />
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: expert.available ? '#10b981' : '#9ca3af' }}>
              {expert.available ? 'Available' : 'Unavailable'}
            </span>
          </div>
        )}
      </header>

      {/* Enhanced Stats Section (matches WebFlow) */}
      {props.showStats && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '1rem', 
          padding: '1rem 0', 
          borderTop: '1px solid #f3f4f6', 
          borderBottom: '1px solid #f3f4f6', 
          fontSize: '0.875rem' 
        }}>
          <div>
            <span style={{ fontWeight: 600, color: '#111827' }}>{formatEarnings(expert.earningsUSD)}</span>
            <span style={{ color: '#6b7280', display: 'block', fontSize: '0.75rem' }}>Earned</span>
          </div>
          <div>
            <span style={{ fontWeight: 600, color: '#111827' }}>{expert.projectsCompletedCount}</span>
            <span style={{ color: '#6b7280', display: 'block', fontSize: '0.75rem' }}>Projects</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', gridColumn: '1 / -1' }}>
            <InlinedStarRating rating={expert.averageReviewScore} size={14} />
            <span style={{ fontWeight: 600, color: '#111827' }}>{expert.averageReviewScore.toFixed(1)}</span>
            <span style={{ color: '#6b7280' }}>({expert.reviewsCount})</span>
          </div>
          <div>
            <span style={{ fontWeight: 600, color: '#111827' }}>{formatNumber(expert.followersCount)}</span>
            <span style={{ color: '#6b7280', display: 'block', fontSize: '0.75rem' }}>Followers</span>
          </div>
        </div>
      )}

      {/* Skill Tags Section (new, matches WebFlow) */}
      {props.showSkills && expert.skillTags && expert.skillTags.length > 0 && (
        <div style={{ margin: '1rem 0' }}>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '0.5rem',
            marginTop: '0.5rem'
          }}>
            {expert.skillTags.slice(0, props.maxSkills ?? 6).map((skill, index) => (
              <span
                key={index}
                style={{
                  padding: '0.25rem 0.75rem',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                }}
              >
                {skill}
              </span>
            ))}
            {expert.skillTags.length > (props.maxSkills ?? 6) && (
              <span style={{
                padding: '0.25rem 0.75rem',
                backgroundColor: '#f9fafb',
                color: '#6b7280',
                fontSize: '0.75rem',
                fontWeight: 500,
                borderRadius: '12px',
                border: '1px dashed #d1d5db',
              }}>
                +{expert.skillTags.length - (props.maxSkills ?? 6)} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Rate Display */}
      {props.showRate && expert.hourlyRateUSD !== null && (
        <div style={{ margin: '1rem 0', fontSize: '1rem' }}>
          <span style={{ fontWeight: 600, color: '#111827' }}>{formatRate(expert.hourlyRateUSD)}</span>
          <span style={{ marginLeft: '0.5rem', color: '#6b7280' }}>Hourly rate</span>
        </div>
      )}

      {/* Enhanced Projects Section (matches WebFlow) */}
      {props.showProjects && expert.projects && expert.projects.length > 0 && (
        <div style={{ margin: '1rem 0' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(${Math.min(expert.projects.length, props.maxProjects ?? 4, 4)}, 1fr)`, 
            gap: '0.5rem'
          }}>
            {expert.projects.slice(0, props.maxProjects ?? 4).map((project, index) => (
              <a 
                key={index} 
                href={project.projectUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                title={project.title}
                style={{ 
                  display: 'block', 
                  borderRadius: '8px', 
                  overflow: 'hidden', 
                  transition: 'transform 0.2s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <InlinedMediaRenderer 
                  src={project.coverUrl} 
                  alt={project.title} 
                  aspectRatio="4/3" 
                  videoConfig={videoConfigForMediaRenderer} 
                />
              </a>
            ))}
            {expert.projects.length > (props.maxProjects ?? 4) && (
              <a 
                href={expert.profileUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  aspectRatio: '4/3', 
                  border: '1px dashed #d0d5dd', 
                  borderRadius: '8px', 
                  color: '#475467', 
                  fontSize: '0.875rem', 
                  textDecoration: 'none', 
                  transition: 'all 0.2s ease',
                  backgroundColor: '#fafafa'
                }}
              >
                +{expert.projects.length - (props.maxProjects ?? 4)} more
              </a>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Action Buttons (matches WebFlow) */}
      {props.showActions && (
        <footer style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button 
            onClick={handleProfileClick} 
            style={{ 
              flex: 1, 
              padding: '0.625rem 1.25rem', 
              border: '1px solid #d0d5dd', 
              borderRadius: '24px', 
              backgroundColor: 'white', 
              color: '#374151', 
              fontSize: '0.875rem', 
              fontWeight: 600, 
              cursor: 'pointer', 
              transition: 'all 0.2s ease' 
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
              e.currentTarget.style.borderColor = '#9ca3af';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.borderColor = '#d0d5dd';
            }}
          >
            View Profile
          </button>
          <button 
            onClick={handleContactClick} 
            style={{ 
              flex: 1, 
              padding: '0.625rem 1.25rem', 
              border: 'none', 
              borderRadius: '24px', 
              backgroundColor: '#111827', 
              color: 'white', 
              fontSize: '0.875rem', 
              fontWeight: 600, 
              cursor: 'pointer', 
              transition: 'all 0.2s ease' 
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#374151';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#111827';
            }}
          >
            Contact
          </button>
        </footer>
      )}
    </article>
  );
}
// --- End InlinedExpertCardRenderer ---

// --- Simplified Context for API Config ---
interface ApiConfigContextType {
  apiKey: string | null;
  programId: string | null;
  debug: boolean;
  baseUrl: string;
}
const ApiConfigContext = createContext<ApiConfigContextType | undefined>(undefined);

const InlinedApiConfigProvider: React.FC<{
  apiKey: string | null;
  programId: string | null;
  debug?: boolean;
  baseUrl?: string;
  children: React.ReactNode;
}> = ({ apiKey, programId, debug = false, baseUrl = 'https://contra.com', children }) => {
  const contextValue = useMemo(() => ({
    apiKey,
    programId,
    debug,
    baseUrl,
  }), [apiKey, programId, debug, baseUrl]);

  if (debug) {
    console.log('[InlinedApiConfigProvider] Initialized. API Key present:', !!apiKey, 'Program ID:', programId);
  }
  return <ApiConfigContext.Provider value={contextValue}>{children}</ApiConfigContext.Provider>;
};

const useApiConfig = () => {
  const context = useContext(ApiConfigContext);
  if (context === undefined) {
    throw new Error('useApiConfig must be used within an InlinedApiConfigProvider');
  }
  return context;
};
// --- End Simplified Context ---


// --- Inlined useExperts Hook Logic (using fetch) ---
interface UseInlinedExpertsOptions {
  filters?: Partial<InlinedAPIExpertFilters>;
  limit?: number;
}

interface UseInlinedExpertsResult {
  experts: InlinedExpertProfile[];
  loading: boolean;
  error: Error | null;
  fetchMore: () => void;
  hasMore: boolean;
  totalCount: number;
  filters: Partial<InlinedAPIExpertFilters>;
  setFilters: React.Dispatch<React.SetStateAction<Partial<InlinedAPIExpertFilters>>>;
}

const useInlinedExpertsFetcher = (options?: UseInlinedExpertsOptions): UseInlinedExpertsResult => {
  const { apiKey, programId, debug, baseUrl } = useApiConfig();

  const [experts, setExperts] = useState<InlinedExpertProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [offset, setOffset] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [internalFilters, setInternalFilters] = useState<Partial<InlinedAPIExpertFilters>>(options?.filters || {});

  const limit = options?.limit || 20;

  const fetchExpertsData = useCallback(async (currentOffset: number, currentFilters: Partial<InlinedAPIExpertFilters>) => {
    if (!apiKey) {
      if (debug) console.warn("[useInlinedExpertsFetcher] No API key provided. Cannot fetch.");
      setError(new Error("API Key is missing."));
      setLoading(false);
      setHasMore(false);
      return;
    }
    if (!programId) {
      if (debug) console.warn("[useInlinedExpertsFetcher] No Program ID provided. Cannot fetch.");
      setError(new Error("Program ID is missing."));
      setLoading(false);
      setHasMore(false);
      return;
    }

    setLoading(true);
    setError(null);

    const queryParams = new URLSearchParams();
    if (limit) queryParams.append('limit', String(limit));
    queryParams.append('offset', String(currentOffset));

    for (const key in currentFilters) {
      if (Object.prototype.hasOwnProperty.call(currentFilters, key) && currentFilters[key] !== undefined) {
        const filterValue = currentFilters[key];
        if (Array.isArray(filterValue)) {
          queryParams.append(key, filterValue.join(','));
        } else {
          queryParams.append(key, String(filterValue));
        }
      }
    }
    
    const endpoint = `${baseUrl}/public-api/programs/${programId}/experts?${queryParams.toString()}`;
    if (debug) console.log(`[Fetcher] GET ${endpoint}`, currentFilters);
    if (debug) console.log(`[Fetcher] API Key:`, apiKey ? `${apiKey.substring(0, 20)}...` : 'MISSING');
    try {
      const response = await fetch(endpoint, { 
        method: 'GET', 
        headers: { 
          'Authorization': `${apiKey}`, // Try without 'Bearer' prefix
          'X-API-Key': `${apiKey}`, // Also try as X-API-Key header
          'Content-Type': 'application/json' 
        } 
      });

      if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch(e) {
            // Ignore if response is not json
        }
        if (debug) console.error("[useInlinedExpertsFetcher] API Error Response:", response.status, errorData);
        throw new Error(errorData?.message || `API request failed with status ${response.status}`);
      }

      const result: ExpertProfileListResponse = await response.json();
      if (debug) console.log("[useInlinedExpertsFetcher] API Success Response:", result);

      if (result && result.data) {
        setExperts(prev => currentOffset === 0 ? result.data : [...prev, ...result.data]);
        setTotalCount(result.totalCount || 0);
        const newTotalFetched = currentOffset + result.data.length;
        setHasMore(result.data.length === limit && newTotalFetched < (result.totalCount || 0));
        setOffset(newTotalFetched);
      } else {
        setHasMore(false);
        if (currentOffset === 0) setExperts([]);
      }
    } catch (err: any) {
      if (debug) console.error("[useInlinedExpertsFetcher] Fetch Error:", err);
      setError(err instanceof Error ? err : new Error(String(err.message || "An unknown error occurred during fetch")));
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [apiKey, programId, limit, debug, baseUrl]);

  useEffect(() => {
    setExperts([]);
    setOffset(0);
    setHasMore(true); // Assume more until first fetch
    if (apiKey && programId) { // Only fetch if core dependencies for API call are present
        fetchExpertsData(0, internalFilters);
    } else {
        if(debug) console.log("[useInlinedExpertsFetcher] Skipping initial fetch as API key or Program ID is missing.");
        setLoading(false); // Ensure loading is false if not fetching
        setHasMore(false);
    }
  }, [internalFilters, apiKey, programId, fetchExpertsData, debug]); // Add apiKey, programId, fetchExpertsData, debug

  const fetchMoreCallback = useCallback(() => {
    if (!loading && hasMore && apiKey && programId) {
      if (debug) console.log("[useInlinedExpertsFetcher] Fetching more...");
      fetchExpertsData(offset, internalFilters);
    } else if (debug) {
      console.log("[useInlinedExpertsFetcher] Cannot fetch more.", { loading, hasMore, apiKey_present: !!apiKey, programId_present: !!programId });
    }
  }, [loading, hasMore, apiKey, programId, offset, internalFilters, fetchExpertsData, debug]);

  return { experts, loading, error, fetchMore: fetchMoreCallback, hasMore, totalCount, filters: internalFilters, setFilters: setInternalFilters };
};
// --- End Inlined useExperts Hook Logic ---

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 */
export function ExpertGridFramer(props: any) {
  const { 
    apiKey, programId, debugMode, baseUrl, // API Config
    columns = 'auto', gap = '1.5rem', itemsPerPage = 20, // Layout
    infiniteScroll = true, useCanvasData = true, canvasItems = 6, // Performance & Canvas
    // Filtering options from props
    sortBy, availableOnly, locationFilter, languages, minRate, maxRate,
    // Display options for cards (passed down)
    showProjects, maxProjects, showStats, showSkills, showAvailability, showRate, showActions,
    // Video config for cards (passed down)
    videoAutoplay, videoHoverPlay, videoMuted, videoLoop, videoControls,
    // Framer injected style, width, height
    style, width, height,
    ...otherProps // Catch any other props Framer might pass
  } = props;

  const initialFilters: Partial<InlinedAPIExpertFilters> = useMemo(() => ({
    sortBy,
    available: availableOnly,
    location: locationFilter,
    languages: languages,
    minRate: minRate,
    maxRate: maxRate,
  }), [sortBy, availableOnly, locationFilter, languages, minRate, maxRate]);
  
  const videoConfigForCards: InlinedMediaRendererProps['videoConfig'] = useMemo(() => ({ 
    autoplay: videoAutoplay, 
    hoverPlay: videoHoverPlay, 
    muted: videoMuted, 
    loop: videoLoop, 
    controls: videoControls 
  }), [videoAutoplay, videoHoverPlay, videoMuted, videoLoop, videoControls]);

  const GridContent = () => {
    const { experts, loading, error, fetchMore, hasMore, totalCount, filters, setFilters } = useInlinedExpertsFetcher({
      filters: initialFilters,
      limit: itemsPerPage
    });

    // Effect to update internal hook filters when props change
    useEffect(() => {
      setFilters(prevFilters => {
        // Simple stringify for deep comparison, might need more robust for complex objects
        if (JSON.stringify(prevFilters) !== JSON.stringify(initialFilters)) {
          if(debugMode) console.log("[GridContent] Filters changed, re-evaluating internal filters.", initialFilters)
          return initialFilters;
        }
        return prevFilters;
      });
    }, [initialFilters, setFilters, debugMode]);

    // Listen for filter events from ExpertFilterFramer component
    useEffect(() => {
      const handleFilterChange = (event: any) => {
        const { filters: newFilters } = event.detail;
        if (debugMode) console.log("[GridContent] Received filter change event:", newFilters);
        setFilters(newFilters);
      };

      window.addEventListener('contra:filterChange', handleFilterChange);
      return () => window.removeEventListener('contra:filterChange', handleFilterChange);
    }, [setFilters, debugMode]);

    const handleScroll = useCallback(() => {
      if (infiniteScroll && !loading && hasMore &&
        (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 200)) {
        if(debugMode) console.log("[GridContent] Scroll threshold reached, fetching more.");
        fetchMore();
      }
    }, [infiniteScroll, loading, hasMore, fetchMore, debugMode]);

    useEffect(() => {
      if (typeof window !== 'undefined' && infiniteScroll) {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
      }
    }, [handleScroll, infiniteScroll]);

    // Check for API key and Program ID at the GridContent level (after provider)
    const apiConfig = useApiConfig();
    if (!apiConfig.apiKey || !apiConfig.programId) {
      return (
        <div style={{
          textAlign: 'center', 
          padding: '3rem 2rem', 
          color: '#f59e0b', 
          backgroundColor: '#fef3c7',
          border:'1px solid #f59e0b', 
          borderRadius:'12px',
          fontSize: '0.875rem'
        }}>
          <div style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>⚙️ Configuration Required</div>
          <div>API Key or Program ID is missing.</div>
          <div style={{ fontSize: '0.75rem', color: '#92400e', marginTop: '0.5rem' }}>
            Please configure them in the properties panel.
          </div>
        </div>
      );
    }
    
    if (loading && experts.length === 0 && !error) {
      return (
        <div style={{
          textAlign: 'center', 
          padding: '3rem 2rem', 
          color: '#6b7280',
          fontSize: '0.875rem'
        }}>
          <div style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>⏳ Loading experts...</div>
          <div>Finding the best matches for you</div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div style={{
          textAlign: 'center', 
          padding: '3rem 2rem', 
          color: '#dc2626',
          backgroundColor: '#fef2f2',
          border: '1px solid #dc2626',
          borderRadius: '12px',
          fontSize: '0.875rem'
        }}>
          <div style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>❌ Error loading experts</div>
          <div>{error.message}</div>
          <div style={{ fontSize: '0.75rem', color: '#991b1b', marginTop: '0.5rem' }}>
            Check console for details or try refreshing.
          </div>
        </div>
      );
    }
    
    if (experts.length === 0 && !loading) {
      return (
        <div style={{
          textAlign: 'center', 
          padding: '3rem 2rem', 
          color: '#6b7280',
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          fontSize: '0.875rem'
        }}>
          <div style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>🔍 No experts found</div>
          <div>Try adjusting your filters or search criteria.</div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>
            {Object.keys(filters).length > 0 ? 'Some filters are applied' : 'No filters active'}
          </div>
        </div>
      );
    }

    return (
      <>
        {/* Results Summary */}
        {totalCount > 0 && (
          <div style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            marginBottom: '1rem',
            padding: '0.75rem',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            Showing {experts.length} of {totalCount} experts
            {Object.keys(filters).filter(key => {
              const value = filters[key];
              if (Array.isArray(value)) return value.length > 0;
              if (typeof value === 'boolean') return value;
              if (typeof value === 'string') return value.trim() !== '';
              if (typeof value === 'number') return value > 0;
              return false;
            }).length > 0 && ' (filtered)'}
          </div>
        )}

        <div
          className="contra-expert-grid framer-component"
          style={{
            display: 'grid',
            gridTemplateColumns: columns === 'auto' ? 'repeat(auto-fit, minmax(320px, 1fr))' : `repeat(${columns}, 1fr)`,
            gap: gap,
            width: width, // Framer injected
            height: height, // Framer injected
            ...style, // Framer injected
          }}
        >
          {experts.map(expert => (
            <InlinedExpertCardRenderer
              key={expert.id}
              expert={expert}
              showProjects={showProjects}
              maxProjects={maxProjects}
              showStats={showStats}
              showSkills={showSkills}
              showAvailability={showAvailability}
              showRate={showRate}
              showActions={showActions}
              videoConfig={videoConfigForCards}
            />
          ))}
        </div>
        
        {/* Loading More Indicator */}
        {loading && experts.length > 0 && (
          <div style={{
            textAlign: 'center', 
            padding: '1.5rem', 
            color: '#6b7280',
            fontSize: '0.875rem'
          }}>
            <div style={{ marginBottom: '0.5rem' }}>⏳ Loading more experts...</div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
              Please wait while we fetch additional results
            </div>
          </div>
        )}
        
        {/* End of Results */}
        {!loading && !hasMore && experts.length > 0 && totalCount > 0 && (
          <div style={{
            textAlign: 'center', 
            padding: '1.5rem', 
            color: '#6b7280',
            fontSize: '0.875rem',
            borderTop: '1px solid #e5e7eb',
            marginTop: '1rem'
          }}>
            <div style={{ marginBottom: '0.5rem' }}>✅ All {totalCount} experts loaded</div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
              You've reached the end of the results
            </div>
          </div>
        )}
        
        {/* Manual Load More Button */}
        {!infiniteScroll && hasMore && !loading && (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button 
              onClick={fetchMore} 
              disabled={loading} 
              style={{
                padding: '0.75rem 1.5rem', 
                fontSize: '0.875rem', 
                fontWeight: 600,
                backgroundColor: '#111827',
                color: 'white',
                border: 'none',
                borderRadius: '24px',
                cursor: loading ? 'default': 'pointer', 
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#374151';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#111827';
              }}
            >
              Load More Experts ({totalCount - experts.length} remaining)
            </button>
          </div>
        )}
      </>
    );
  };

  const mockExpertsForCanvas: InlinedExpertProfile[] = useMemo(() => {
    const isFramerCanvas = typeof window !== 'undefined' && (window as any).Framer?.isPreview === true;
    if (!useCanvasData || !isFramerCanvas) return [];
    
    return Array.from({ length: canvasItems > 0 ? canvasItems : 6 }).map((_, i) => ({
      id: `mock-expert-${i}`,
      name: `Canvas Expert ${i + 1}`,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=CanvasExpert${i}`,
      location: 'Framer Studio',
      oneLiner: 'Designing on the canvas, live!',
      available: i % 2 === 0,
      profileUrl: '#',
      inquiryUrl: '#',
      hourlyRateUSD: 100 + i * 10,
      earningsUSD: 5000 + i * 1000,
      projectsCompletedCount: 5 + i,
      followersCount: 100 + i * 10,
      reviewsCount: 10 + i * 2,
      averageReviewScore: Math.min(5, 4.5 + (i % 5) * 0.1),
      skillTags: ['Framer', 'Canvas', 'Mock Data', `Tag ${i+1}`],
      socialLinks: [],
      projects: showProjects ? Array.from({length: Math.min(maxProjects ?? 2, 4)}).map((__, pjIndex) => ({ title: `Mock Project ${i+1}-${String.fromCharCode(65+pjIndex)}`, projectUrl: '#', coverUrl: `https://via.placeholder.com/400x300/777777/ffffff?text=Mock+${i+1}${String.fromCharCode(65+pjIndex)}` })) : [],
    }));
  }, [useCanvasData, canvasItems, showProjects, maxProjects]);
  
  const isActuallyOnFramerCanvas = typeof window !== 'undefined' && (window as any).Framer?.isPreview === true;
  const showMockGrid = isActuallyOnFramerCanvas && useCanvasData && (!apiKey || !programId);

  return (
    <InlinedApiConfigProvider apiKey={apiKey} programId={programId} debug={debugMode} baseUrl={baseUrl}>
      {showMockGrid ? (
        <div
          className="contra-expert-grid framer-component mock-data-mode"
          style={{
            display: 'grid',
            gridTemplateColumns: columns === 'auto' ? 'repeat(auto-fit, minmax(320px, 1fr))' : `repeat(${columns}, 1fr)`,
            gap, width, height, ...style,
          }}
        >
          {mockExpertsForCanvas.map((expertMock) => (
            <InlinedExpertCardRenderer
              key={expertMock.id}
              expert={expertMock}
              showProjects={showProjects}
              maxProjects={maxProjects}
              showStats={showStats}
              showSkills={showSkills}
              showAvailability={showAvailability}
              showRate={showRate}
              showActions={showActions}
              videoConfig={videoConfigForCards}
            />
          ))}
        </div>
      ) : (
        <GridContent />
      )}
    </InlinedApiConfigProvider>
  );
}

// Property Controls for ExpertGridFramer
addPropertyControls(ExpertGridFramer, {
  // Section: API Configuration
  apiKey: { type: ControlType.String, title: "API Key", placeholder: "csk_...", description: "Your Contra API key" },
  programId: { type: ControlType.String, title: "Program ID", placeholder: "YOUR_PROGRAM_ID", description: "Your Contra Program ID" },
  baseUrl: { type: ControlType.String, title: "API Base URL", defaultValue: "https://contra.com", description: "(Advanced) Override API base URL" },
  debugMode: { type: ControlType.Boolean, title: "Debug Mode", defaultValue: false, description: "Show console logs" },

  // Section: Layout Options
  columns: { type: ControlType.Enum, title: "Columns", options: ["auto", "1", "2", "3", "4"], optionTitles: ["Auto", "1", "2", "3", "4"], defaultValue: "auto" },
  gap: { type: ControlType.String, title: "Gap", defaultValue: "1.5rem", description: "Space between cards" },
  itemsPerPage: { type: ControlType.Number, title: "Items per Page", defaultValue: 20, min: 1, max: 100, step: 1 },

  // Section: Filter Options (Initial Values)
  sortBy: { type: ControlType.Enum, title: "Sort By", options: ["relevance", "newest", "oldest"], optionTitles: ["Most Relevant", "Newest First", "Oldest First"], defaultValue: "relevance" },
  availableOnly: { type: ControlType.Boolean, title: "Available Only", defaultValue: false, description: "Show only available experts" },
  locationFilter: { type: ControlType.String, title: "Location Filter", defaultValue: "", placeholder: "e.g. San Francisco" },
  languages: { type: ControlType.Array, title: "Languages", control: { type: ControlType.String }, description: "Filter by languages" },
  minRate: { type: ControlType.Number, title: "Min Rate", defaultValue: 0, min: 0, max: 1000, step: 5, description: "Minimum hourly rate" },
  maxRate: { type: ControlType.Number, title: "Max Rate", defaultValue: 0, min: 0, max: 1000, step: 5, description: "Maximum hourly rate (0 = no limit)" },

  // Section: Display Options
  showProjects: { type: ControlType.Boolean, title: "Show Projects", defaultValue: true, description: "Display project grid" },
  maxProjects: { type: ControlType.Number, title: "Max Projects", defaultValue: 4, min: 1, max: 8, step: 1, description: "Projects shown per card", hidden: (props: any) => !props.showProjects },
  showStats: { type: ControlType.Boolean, title: "Show Stats", defaultValue: true, description: "Earnings, reviews, etc" },
  showSkills: { type: ControlType.Boolean, title: "Show Skills", defaultValue: true, description: "Display skill tags" },
  showAvailability: { type: ControlType.Boolean, title: "Show Availability", defaultValue: true, description: "Green/gray indicator" },
  showRate: { type: ControlType.Boolean, title: "Show Rate", defaultValue: true, description: "Hourly rate" },
  showActions: { type: ControlType.Boolean, title: "Show Actions", defaultValue: true, description: "Contact/Profile buttons" },

  // Section: Video Configuration
  videoAutoplay: { type: ControlType.Boolean, title: "Video: Autoplay", defaultValue: false, description: "Auto-play project videos" },
  videoHoverPlay: { type: ControlType.Boolean, title: "Video: Hover Play", defaultValue: true, description: "Play on mouse hover", hidden: (props: any) => props.videoAutoplay },
  videoMuted: { type: ControlType.Boolean, title: "Video: Muted", defaultValue: true, description: "Mute video playback (required for autoplay)" },
  videoLoop: { type: ControlType.Boolean, title: "Video: Loop", defaultValue: true, description: "Loop videos" },
  videoControls: { type: ControlType.Boolean, title: "Video: Controls", defaultValue: false, description: "Show player controls" },

  // Section: Performance
  infiniteScroll: { type: ControlType.Boolean, title: "Infinite Scroll", defaultValue: true, description: "Load more on scroll" },
  useCanvasData: { type: ControlType.Boolean, title: "Use Canvas Data", defaultValue: true, description: "Show placeholders on canvas" },
  canvasItems: { type: ControlType.Number, title: "Canvas Items", defaultValue: 6, min: 1, max: 20, step: 1, description: "Placeholder count", hidden: (props: any) => !props.useCanvasData },
}); 