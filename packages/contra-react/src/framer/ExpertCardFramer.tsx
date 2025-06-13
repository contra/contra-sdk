import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { CSSProperties, ImgHTMLAttributes, VideoHTMLAttributes } from 'react';
import { addPropertyControls, ControlType } from "framer"

// --- Inlined Type Definitions (derived from @contra/types and OpenAPI spec) ---
interface SocialLink {
  label: string | null;
  url: string;
}

// Replacing local Project to match more of ExpertProfile.projects structure
interface ProjectSample { // Renamed from Project to align with potential full ExpertProfile
  title: string;
  projectUrl: string;
  coverUrl: string; // Kept as string, assuming placeholders ensure this
}

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
  socialLinks: SocialLink[]; // Added for completeness, though might not be used in mock
  projects: ProjectSample[]; // Uses the inlined ProjectSample
}
// --- End Inlined Type Definitions ---

// --- Inlined StarRating Logic (Enhanced to match WebFlow) ---
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
  theme?: 'light' | 'dark';
}

function InlinedStarRating({
  rating,
  maxRating = 5,
  size = 12,
  color = '#FFC107',
  emptyColor,
  showValue = false,
  ariaLabel,
  className = '',
  style,
  theme = 'light'
}: InlinedStarRatingProps) {
  const defaultEmptyColor = theme === 'dark' ? '#374151' : '#E5E7EB';
  const actualEmptyColor = emptyColor || defaultEmptyColor;
  
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);
  
  const starStyle: CSSProperties = {
    width: size,
    height: size,
    display: 'inline-block',
    marginRight: 2,
  };

  const renderStar = (type: 'full' | 'half' | 'empty', key: number) => {
    const id = `star-gradient-${key}-${Math.random().toString(36).substr(2, 9)}`;
    return (
      <svg key={key} style={starStyle} viewBox="0 0 24 24" fill="none">
        {type === 'half' && (
          <defs>
            <linearGradient id={id}>
              <stop offset="50%" stopColor={color} />
              <stop offset="50%" stopColor={actualEmptyColor} />
            </linearGradient>
          </defs>
        )}
        <path 
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill={type === 'full' ? color : type === 'half' ? `url(#${id})` : actualEmptyColor}
        />
      </svg>
    );
  };

  const stars = [
    ...Array(fullStars).fill('full'),
    ...(hasHalfStar ? ['half'] : []),
    ...Array(emptyStars).fill('empty'),
  ];

  return (
    <div 
      className={`contra-star-rating ${className}`} 
      style={{ display: 'inline-flex', alignItems: 'center', gap: '1px', ...style }} 
      role="img" 
      aria-label={ariaLabel || `Rating: ${rating} out of ${maxRating} stars`}
    >
      {stars.map((type, index) => renderStar(type as any, index))}
      {showValue && (
        <span style={{ 
          marginLeft: 4, 
          fontSize: size, 
          color: theme === 'dark' ? '#E5E7EB' : '#374151', 
          fontWeight: 600 
        }}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
// --- End Inlined StarRating Logic ---

// --- Enhanced MediaRenderer Logic (matches WebFlow) ---
interface InlinedMediaRendererProps {
  src: string | null | undefined;
  alt?: string;
  className?: string;
  style?: CSSProperties;
  loading?: 'lazy' | 'eager';
  aspectRatio?: string;
  objectFit?: CSSProperties['objectFit'];
  onError?: () => void;
  // Video-specific props from Framer props
  videoConfig?: {
    autoplay?: boolean;
    muted?: boolean;
    loop?: boolean;
    controls?: boolean;
    hoverPlay?: boolean;
  };
  theme?: 'light' | 'dark';
}

function InlinedMediaRenderer({
  src,
  alt = 'Media content',
  className = '',
  style,
  loading = 'lazy',
  aspectRatio = '1/1',
  objectFit = 'cover',
  onError,
  videoConfig = {},
  theme = 'light'
}: InlinedMediaRendererProps) {
  const [error, setError] = useState(false);
  const [isVideo, setIsVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  // Enhanced video detection (matches WebFlow)
  useEffect(() => {
    if (!src) { setError(true); return; }
    const urlLower = src.toLowerCase();
    const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.ogg'];
    const isVideoFile = videoExtensions.some(ext => urlLower.includes(ext));
    const isCloudinaryVideo = urlLower.includes('cloudinary.com/') && urlLower.includes('/video/');
    setIsVideo(isVideoFile || isCloudinaryVideo);
    setError(false);
  }, [src]);

  // Enhanced hover play functionality (matches WebFlow)
  useEffect(() => {
    if (!videoRef.current || !videoConfig.hoverPlay || videoConfig.autoplay) return;
    const video = videoRef.current;
    if (isHovering) {
      video.currentTime = 0;
      video.play().catch(() => {});
    } else { 
      video.pause(); 
      video.currentTime = 0; 
    }
  }, [isHovering, videoConfig.hoverPlay, videoConfig.autoplay]);

  const handleError = () => { setError(true); onError?.(); };

  const containerStyle: CSSProperties = { 
    position: 'relative', 
    width: '100%', 
    aspectRatio, 
    overflow: 'hidden', 
    borderRadius: '8px',
    backgroundColor: error ? (theme === 'dark' ? '#1F2937' : '#F3F4F6') : 'transparent',
    ...style 
  };
  const mediaStyle: CSSProperties = { width: '100%', height: '100%', objectFit, display: 'block' };

  if (error || !src) {
    return (
      <div className={`contra-media-error ${className}`} style={containerStyle}>
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)', 
          color: theme === 'dark' ? '#6B7280' : '#9CA3AF', 
          fontSize: '12px', 
          textAlign: 'center' 
        }}>
          {isVideo ? '🎬' : '🖼️'}
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
      <div className="contra-media-container" style={containerStyle} 
           onMouseEnter={() => setIsHovering(true)} 
           onMouseLeave={() => setIsHovering(false)}>
        <video ref={videoRef} {...videoAttributes} />
      </div>
    );
  }

  const imgAttributes: ImgHTMLAttributes<HTMLImageElement> = { 
    src, alt, className: `contra-media-image ${className}`, style: mediaStyle, loading, onError: handleError 
  };
  return (
    <div className="contra-media-container" style={containerStyle}>
      <img {...imgAttributes} />
    </div>
  );
}
// --- End Enhanced MediaRenderer Logic ---

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 320
 * @framerIntrinsicHeight 400
 */
export default function ExpertCardFramer(props: any) {
  const {
    // Theme Colors (using global styles)
    backgroundColor,
    borderColor,
    textColor,
    textSecondaryColor,
    textMutedColor,
    accentSuccessColor,
    buttonPrimaryBackground,
    buttonPrimaryText,
    surfaceHoverColor,

    // Expert Data
    name = 'Patrick Mullinga',
    bio = 'Speaks Zambia',
    location = 'Speaks Zambia',
    avatarUrl,
    hourlyRate = 25,
    currency = '$',
    projectsCompleted = 12,
    rating = 5.0,
    reviews = 17,
    earnings = 100,
    followers = 150,
    available = true,
    profileUrl = '#',
    inquiryUrl = '#',
    skills = ['Brand Strategy', 'Logo Design'],
    
    // Display options
    showProjects = true,
    maxProjects = 4,
    showStats = false, // Simplified for Replo design
    showSkills = false, // Simplified for Replo design
    showAvailability = true,
    showRate = true,
    showActions = true,
    
    // Projects
    project1Image,
    project2Image,
    project3Image,
    project4Image,
    
    // Video config
    videoAutoplay = false,
    videoHoverPlay = true,
    videoMuted = true,
    videoLoop = true,
    videoControls = false,
    
    // Framer props
    style,
    width,
    height,
    ...otherProps
  } = props;

  // Create mock expert data from props or use default for Framer canvas
  const expertDataProjects: ProjectSample[] = [];
  if (showProjects) {
    const projectMocks = [
      { title: 'E-commerce Platform', defaultCover: 'https://via.placeholder.com/200x200/4F46E5/ffffff?text=Project+1', propImage: project1Image },
      { title: 'Mobile App Design', defaultCover: 'https://via.placeholder.com/200x200/7C3AED/ffffff?text=Project+2', propImage: project2Image },
      { title: 'Web Application', defaultCover: 'https://via.placeholder.com/200x200/DC2626/ffffff?text=Project+3', propImage: project3Image },
      { title: 'Brand Identity', defaultCover: 'https://via.placeholder.com/200x200/059669/ffffff?text=Project+4', propImage: project4Image },
    ];

    for (let i = 0; i < Math.min(projectMocks.length, maxProjects); i++) {
      const mock = projectMocks[i];
      expertDataProjects.push({
        title: mock.title,
        projectUrl: profileUrl,
        coverUrl: mock.propImage?.src || mock.propImage || mock.defaultCover,
      });
    }
  }

  // Enhanced expert data with more fields matching WebFlow
  const expert: InlinedExpertProfile = {
    id: 'demo-expert',
    name,
    avatarUrl: avatarUrl?.src || avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    location,
    oneLiner: bio,
    available,
    profileUrl,
    inquiryUrl,
    hourlyRateUSD: hourlyRate,
    earningsUSD: earnings,
    projectsCompletedCount: projectsCompleted,
    followersCount: followers,
    reviewsCount: reviews,
    averageReviewScore: rating,
    skillTags: skills || [],
    socialLinks: [], // Mock data for social links
    projects: expertDataProjects,
  };
  
  const videoConfigForMediaRenderer = {
      autoplay: videoAutoplay,
      muted: videoMuted,
      loop: videoLoop,
      controls: videoControls,
      hoverPlay: videoHoverPlay,
  };

  // Theme colors using global styles
  const colors = {
    background: backgroundColor || '#FFFFFF',
    border: borderColor || '#E5E7EB',
    text: textColor || '#111827',
    textSecondary: textSecondaryColor || '#6B7280',
    textMuted: textMutedColor || '#9CA3AF',
    available: accentSuccessColor || '#10B981',
    unavailable: '#EF4444',
    hover: surfaceHoverColor || '#F9FAFB',
    buttonPrimary: buttonPrimaryBackground || '#111827',
    buttonPrimaryText: buttonPrimaryText || '#FFFFFF',
  };

  const cardStyle: CSSProperties = {
    backgroundColor: colors.background,
    border: `1px solid ${colors.border}`,
    borderRadius: '12px',
    padding: '24px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    width: width || '100%',
    height: height || 'auto',
    boxSizing: 'border-box',
    ...style,
  };

  // --- Enhanced Display Logic (matches WebFlow) ---
  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (expert.inquiryUrl) window.open(expert.inquiryUrl, '_blank', 'noopener,noreferrer');
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (expert.profileUrl) window.open(expert.profileUrl, '_blank', 'noopener,noreferrer');
  };

  // Professional earnings formatting (matches WebFlow)
  const formatEarnings = (amount: number): string => {
    if (amount >= 1000000) return `$${Math.floor(amount / 1000000)}M+`;
    if (amount >= 1000) return `$${Math.floor(amount / 1000)}k+`;
    return `$${amount}`;
  };

  const formatRate = (rate: number | null): string => rate ? `$${rate}/hr` : 'Rate on request';
  
  // Professional number formatting
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${Math.floor(num / 1000000)}M`;
    if (num >= 1000) return `${Math.floor(num / 1000)}k`;
    return num.toString();
  };

  // Message button style
  const messageButtonStyle: CSSProperties = {
    width: '100%',
    backgroundColor: colors.buttonPrimary,
    color: colors.buttonPrimaryText,
    border: 'none',
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  // Evaluate conditional display (matches WebFlow functionality)
  const evaluateCondition = (condition: string): boolean => {
    if (!condition) return true;
    // Simple condition evaluation: "field:value" format
    const [field, value] = condition.split(':');
    const expertValue = (expert as any)[field];
    
    if (field === 'available') return expertValue === (value === 'true');
    if (field === 'hasProjects') return expert.projects.length > 0;
    if (field === 'hasRate') return expert.hourlyRateUSD !== null;
    
    return true;
  };
  // --- End Enhanced Display Logic ---

  // Main render for the card itself
  return (
    <article
      className={`contra-expert-card replo-design ${backgroundColor ? `${backgroundColor}-mode` : ''}`}
      style={cardStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = backgroundColor ? '0 4px 12px 0 rgba(0, 0, 0, 0.15)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = backgroundColor ? '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
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
          <InlinedMediaRenderer
            src={expert.avatarUrl}
            alt={`${expert.name} avatar`}
            style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '50%', 
              flexShrink: 0 
            }}
            aspectRatio="1/1"
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ 
              margin: 0, 
              fontSize: '16px', 
              fontWeight: 600, 
              color: colors.text,
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
              <InlinedStarRating 
                rating={expert.averageReviewScore} 
                size={12} 
                theme={backgroundColor ? 'dark' : 'light'}
                showValue={true}
              />
            </div>
            {showRate && expert.hourlyRateUSD && (
              <div style={{ 
                fontSize: '14px', 
                color: colors.textSecondary,
                fontWeight: 500
              }}>
                {formatRate(expert.hourlyRateUSD)}
              </div>
            )}
          </div>
        </div>
        
        {showAvailability && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px',
            backgroundColor: expert.available ? colors.available : colors.unavailable,
            color: expert.available ? '#065F46' : '#991B1B',
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
              backgroundColor: expert.available ? colors.available : colors.unavailable
            }} />
            Available Now
          </div>
        )}
      </header>

      {/* Projects Grid - 2x2 layout like Replo */}
      {showProjects && expert.projects && expert.projects.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '8px'
          }}>
            {expert.projects.slice(0, 4).map((project, index) => {
              // Show "View more" overlay on 4th item if there are more projects
              const showViewMore = index === 3 && expert.projects.length > 4;
              
              return (
                <div
                  key={index}
                  style={{ 
                    position: 'relative',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    transition: 'transform 0.2s ease',
                    cursor: 'pointer'
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
                    theme={backgroundColor ? 'dark' : 'light'}
                    videoConfig={videoConfigForMediaRenderer}
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

      {/* Action Button */}
      {showActions && (
        <button 
          onClick={handleContactClick} 
          style={messageButtonStyle}
        >
          Message
        </button>
      )}
    </article>
  );
}

// Property Controls
addPropertyControls(ExpertCardFramer, {
  // === COLORS ===
  backgroundColor: { 
    type: ControlType.Color, 
    title: "Background", 
    defaultValue: "#FFFFFF",
    description: "Card background color"
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
  textMutedColor: { 
    type: ControlType.Color, 
    title: "Muted Text Color", 
    defaultValue: "#9CA3AF",
    description: "Muted text color"
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
    description: "Message button background color",
    hidden: (props: any) => !props.showActions
  },
  buttonPrimaryText: { 
    type: ControlType.Color, 
    title: "Button Text Color", 
    defaultValue: "#FFFFFF",
    description: "Message button text color",
    hidden: (props: any) => !props.showActions
  },
  surfaceHoverColor: { 
    type: ControlType.Color, 
    title: "Hover Color", 
    defaultValue: "#F9FAFB",
    description: "Card hover background color"
  },

  // === EXPERT DATA ===
  name: { type: ControlType.String, title: "Name", defaultValue: "Patrick Mullinga" },
  bio: { type: ControlType.String, title: "Bio", defaultValue: "Speaks Zambia" },
  location: { type: ControlType.String, title: "Location", defaultValue: "Speaks Zambia" },
  avatarUrl: { type: ControlType.ResponsiveImage, title: "Avatar" },
  hourlyRate: { type: ControlType.Number, title: "Hourly Rate", defaultValue: 25, min: 0 },
  currency: { type: ControlType.String, title: "Currency", defaultValue: "$" },
  projectsCompleted: { type: ControlType.Number, title: "Projects Completed", defaultValue: 12, min: 0 },
  rating: { type: ControlType.Number, title: "Rating", defaultValue: 5.0, min: 0, max: 5, step: 0.1 },
  reviews: { type: ControlType.Number, title: "Reviews", defaultValue: 17, min: 0 },
  earnings: { type: ControlType.Number, title: "Earnings", defaultValue: 100, min: 0 },
  followers: { type: ControlType.Number, title: "Followers", defaultValue: 150, min: 0 },
  available: { type: ControlType.Boolean, title: "Available", defaultValue: true },
  profileUrl: { type: ControlType.String, title: "Profile URL", defaultValue: "#" },
  inquiryUrl: { type: ControlType.String, title: "Inquiry URL", defaultValue: "#" },
  skills: { 
    type: ControlType.Array,
    title: "Skills",
    control: { type: ControlType.String },
    defaultValue: ['Brand Strategy', 'Logo Design']
  },

  // === LAYOUT & DISPLAY ===
  showActions: { type: ControlType.Boolean, title: "Show Actions", defaultValue: true },
  showStats: { type: ControlType.Boolean, title: "Show Stats", defaultValue: true },
  showProjects: { type: ControlType.Boolean, title: "Show Projects", defaultValue: true },
  showSkills: { type: ControlType.Boolean, title: "Show Skills", defaultValue: true },

  // === PROJECTS ===
  project1Image: { type: ControlType.ResponsiveImage, title: "Project 1", hidden: (props: any) => !props.showProjects || props.maxProjects < 1 },
  project2Image: { type: ControlType.ResponsiveImage, title: "Project 2", hidden: (props: any) => !props.showProjects || props.maxProjects < 2 },
  project3Image: { type: ControlType.ResponsiveImage, title: "Project 3", hidden: (props: any) => !props.showProjects || props.maxProjects < 3 },
  project4Image: { type: ControlType.ResponsiveImage, title: "Project 4", hidden: (props: any) => !props.showProjects || props.maxProjects < 4 },

  // === VIDEO ===
  videoAutoplay: { type: ControlType.Boolean, title: "Video: Autoplay", defaultValue: false },
  videoHoverPlay: { type: ControlType.Boolean, title: "Video: Hover Play", defaultValue: true, hidden: (props: any) => props.videoAutoplay },
  videoMuted: { type: ControlType.Boolean, title: "Video: Muted", defaultValue: true },
  videoLoop: { type: ControlType.Boolean, title: "Video: Loop", defaultValue: true },
  videoControls: { type: ControlType.Boolean, title: "Video: Controls", defaultValue: false },

  // === MAX PROJECTS ===
  maxProjects: { type: ControlType.Number, title: "Max Projects", defaultValue: 4, min: 1, max: 8, hidden: (props: any) => !props.showProjects },
}); 