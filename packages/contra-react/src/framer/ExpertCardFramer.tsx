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
}

function InlinedStarRating({
  rating,
  maxRating = 5,
  size = 16,
  color = '#FBBF24',
  emptyColor = '#E5E7EB',
  showValue = false,
  ariaLabel,
  className = '',
  style,
}: InlinedStarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);
  
  const starStyle: CSSProperties = {
    width: size,
    height: size,
    display: 'inline-block',
    marginRight: size * 0.125, /* 2px for 16px size */
  };

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
          fill={type === 'full' ? color : type === 'half' ? `url(#${id})` : emptyColor}
        />
      </svg>
    );
  };

  const stars = [
    ...Array(fullStars).fill('full'),
    ...(hasHalfStar ? ['half'] : []),
    ...Array(emptyStars).fill('empty'),
  ];
  const computedAriaLabel = ariaLabel || `Rating: ${rating} out of ${maxRating} stars`;

  return (
    <div className={`contra-star-rating ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', ...style }} role="img" aria-label={computedAriaLabel}>
      {stars.map((type, index) => renderStar(type as any, index))}
      {showValue && (
        <span style={{ marginLeft: size * 0.25, fontSize: size * 0.875, color: 'currentColor', fontWeight: 500 }}>
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
}

function InlinedMediaRenderer({
  src,
  alt = 'Media content',
  className = '',
  style,
  loading = 'lazy',
  aspectRatio,
  objectFit = 'cover',
  onError,
  videoConfig = {},
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
    borderRadius: 'inherit', 
    backgroundColor: error ? '#f3f4f6' : undefined, 
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
          color: '#9ca3af', 
          fontSize: '12px', 
          textAlign: 'center' 
        }}>
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
 * @framerIntrinsicWidth 380
 * @framerIntrinsicHeight 500
 */
export function ExpertCardFramer(props: any) {
  // Create mock expert data from props or use default for Framer canvas
  const expertDataProjects: ProjectSample[] = [];
  if (props.showProjects) {
    const projectMocks = [
      { title: 'Interactive Landing Page', defaultCover: 'https://via.placeholder.com/400x300/0055FF/ffffff?text=Framer+Project+1', propImage: props.project1Image },
      { title: 'Mobile App Prototype', defaultCover: 'https://via.placeholder.com/400x300/22CC99/ffffff?text=Framer+Project+2', propImage: props.project2Image },
      { title: 'Design System UI Kit', defaultCover: 'https://via.placeholder.com/400x300/FF8800/ffffff?text=Framer+Project+3', propImage: props.project3Image },
      { title: 'Web Animation Showcase', defaultCover: 'https://via.placeholder.com/400x300/FF0055/ffffff?text=Framer+Project+4', propImage: props.project4Image },
    ];

    for (let i = 0; i < Math.min(projectMocks.length, props.maxProjects ?? 4); i++) {
      const mock = projectMocks[i];
      expertDataProjects.push({
        title: mock.title,
        projectUrl: '#',
        coverUrl: mock.propImage?.src || mock.propImage || mock.defaultCover,
      });
    }
  }

  // Enhanced expert data with more fields matching WebFlow
  const expert: InlinedExpertProfile = {
    id: props.expertId || 'demo-expert-framer',
    name: props.name || 'Alex Johnson (Framer)',
    avatarUrl: props.avatarUrl?.src || props.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=AlexFramer',
    location: props.location || 'Framer City, FS',
    oneLiner: props.bio || 'Creative designer & Framer expert, building interactive prototypes.',
    available: props.available ?? true,
    profileUrl: props.profileUrl || 'https://framer.com',
    inquiryUrl: props.inquiryUrl || 'https://framer.com/contact',
    hourlyRateUSD: props.hourlyRate ?? 120,
    earningsUSD: props.earnings ?? 95000,
    projectsCompletedCount: props.projectsCompleted ?? 35,
    followersCount: props.followers ?? 550,
    reviewsCount: props.reviews ?? 22,
    averageReviewScore: props.rating ?? 4.9,
    skillTags: props.skills && props.skills.length > 0 ? props.skills : ['Framer', 'UI/UX Design', 'Prototyping', 'Interaction Design'],
    socialLinks: [], // Mock data for social links
    projects: expertDataProjects,
  };
  
  const videoConfigForMediaRenderer = {
      autoplay: props.videoAutoplay,
      muted: props.videoMuted,
      loop: props.videoLoop,
      controls: props.videoControls,
      hoverPlay: props.videoHoverPlay,
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
      className={`contra-expert-card contra-expert-card--${props.layout || 'vertical'} framer-component`}
      style={{
        border: '1px solid #e4e7ec', 
        borderRadius: '16px', 
        padding: '1.5rem',
        backgroundColor: 'white', 
        transition: 'all 0.2s ease', 
        fontFamily: 'system-ui, -apple-system, sans-serif',
        width: props.width, 
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

// Enhanced Property Controls (matches WebFlow capabilities)
addPropertyControls(ExpertCardFramer, {
  // Section: Data Source (Mock Data for Canvas)
  name: { type: ControlType.String, title: "Name", defaultValue: "Alex Johnson (Framer)" },
  avatarUrl: { type: ControlType.ResponsiveImage, title: "Avatar" },
  location: { type: ControlType.String, title: "Location", defaultValue: "Framer City, FS" },
  bio: { type: ControlType.String, title: "Bio", defaultValue: "Creative designer & Framer expert.", displayTextArea: true },
  available: { type: ControlType.Boolean, title: "Available", defaultValue: true },
  profileUrl: { type: ControlType.String, title: "Profile URL", defaultValue: "https://framer.com" },
  inquiryUrl: { type: ControlType.String, title: "Inquiry URL", defaultValue: "https://framer.com/contact" },

  // Section: Stats Configuration
  hourlyRate: { type: ControlType.Number, title: "Hourly Rate", defaultValue: 120, min: 0, displayStepper: true },
  earnings: { type: ControlType.Number, title: "Earnings", defaultValue: 95000, min: 0 },
  projectsCompleted: { type: ControlType.Number, title: "Projects Done", defaultValue: 35, min: 0 },
  followers: { type: ControlType.Number, title: "Followers", defaultValue: 550, min: 0 },
  reviews: { type: ControlType.Number, title: "Reviews Count", defaultValue: 22, min: 0 },
  rating: { type: ControlType.Number, title: "Avg. Rating", defaultValue: 4.9, min: 0, max: 5, step: 0.1 },
  skills: { type: ControlType.Array, title: "Skills", control: { type: ControlType.String }, defaultValue: ['Framer', 'UI/UX', 'Prototyping'] },

  // Section: Display Options (Enhanced)
  layout: { type: ControlType.Enum, title: "Layout", options: ["vertical", "horizontal"], optionTitles: ["Vertical", "Horizontal"], defaultValue: "vertical" },
  showProjects: { type: ControlType.Boolean, title: "Show Projects", defaultValue: true },
  maxProjects: { type: ControlType.Number, title: "Max Projects", defaultValue: 4, min: 1, max: 8, step: 1, hidden: (props: any) => !props.showProjects },
  showStats: { type: ControlType.Boolean, title: "Show Stats", defaultValue: true },
  showSkills: { type: ControlType.Boolean, title: "Show Skills", defaultValue: true },
  maxSkills: { type: ControlType.Number, title: "Max Skills", defaultValue: 6, min: 1, max: 20, step: 1, hidden: (props: any) => !props.showSkills },
  showAvailability: { type: ControlType.Boolean, title: "Show Availability", defaultValue: true },
  showRate: { type: ControlType.Boolean, title: "Show Rate", defaultValue: true },
  showActions: { type: ControlType.Boolean, title: "Show Actions", defaultValue: true },

  // Section: Project Images (Mock Data)
  project1Image: { type: ControlType.ResponsiveImage, title: "Project 1 Image", hidden: (props: any) => !props.showProjects || (props.maxProjects ?? 4) < 1 },
  project2Image: { type: ControlType.ResponsiveImage, title: "Project 2 Image", hidden: (props: any) => !props.showProjects || (props.maxProjects ?? 4) < 2 },
  project3Image: { type: ControlType.ResponsiveImage, title: "Project 3 Image", hidden: (props: any) => !props.showProjects || (props.maxProjects ?? 4) < 3 },
  project4Image: { type: ControlType.ResponsiveImage, title: "Project 4 Image", hidden: (props: any) => !props.showProjects || (props.maxProjects ?? 4) < 4 },
      
  // Section: Video Player Configuration (Enhanced)
  videoAutoplay: { type: ControlType.Boolean, title: "Video: Autoplay", defaultValue: false, description: "Autoplay project videos" },
  videoHoverPlay: { type: ControlType.Boolean, title: "Video: Play on Hover", defaultValue: true, description: "Play videos on hover", hidden: (props: any) => props.videoAutoplay },
  videoMuted: { type: ControlType.Boolean, title: "Video: Muted", defaultValue: true, description: "Mute video playback (required for autoplay)" },
  videoLoop: { type: ControlType.Boolean, title: "Video: Loop", defaultValue: true, description: "Loop video playback" },
  videoControls: { type: ControlType.Boolean, title: "Video: Show Controls", defaultValue: false, description: "Show native video controls" },
}); 