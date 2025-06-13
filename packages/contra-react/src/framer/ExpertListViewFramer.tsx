import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import type { CSSProperties } from 'react';
import { addPropertyControls, ControlType } from "framer"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"

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

// Animation variants for mobile-first design
const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.98
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
      duration: 0.4
    }
  }
};

const buttonVariants = {
  idle: { scale: 1 },
  hover: { 
    scale: 1.02,
    transition: { type: "spring", stiffness: 400, damping: 25 }
  },
  tap: { 
    scale: 0.98,
    transition: { type: "spring", stiffness: 500, damping: 30 }
  }
};

// Performance-optimized ProjectMedia Component
function ProjectMedia({ src, alt, title }: { src: string; alt: string; title: string }) {
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [networkError, setNetworkError] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [isInViewport, setIsInViewport] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadTimeoutRef = useRef<NodeJS.Timeout>();
  const maxRetries = 2; // Reduced retries for performance

  // Comprehensive mobile detection (memoized)
  const isMobileDevice = useMemo(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm/i.test(userAgent) ||
           /mobile|tablet|kindle|silk|gt-|sm-|lg-/i.test(userAgent) ||
           window.innerWidth <= 768;
  }, []);

  useEffect(() => {
    setIsMobile(isMobileDevice);
  }, [isMobileDevice]);

  // Enhanced video detection (memoized)
  const isVideo = useMemo(() => {
    if (!src || typeof src !== 'string') return false;
    
    const urlLower = src.toLowerCase();
    const videoExtensions = ['.mp4', '.webm', '.mov', '.m4v'];
    return videoExtensions.some(ext => urlLower.includes(ext)) ||
           (urlLower.includes('cloudinary.com/') && urlLower.includes('/video/')) ||
           urlLower.includes('video');
  }, [src]);

  // Performance-optimized viewport detection
  useEffect(() => {
    if (!containerRef.current) return;

    const checkViewport = () => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      
      // Less aggressive viewport detection - load when element is visible or close
      const isVisible = rect.top < windowHeight + 500 && 
                       rect.bottom > -500 && 
                       rect.left < windowWidth + 500 && 
                       rect.right > -500;
      
      setIsInViewport(isVisible);
      
      // Load video immediately when in viewport
      if (isVisible && isVideo && !shouldLoadVideo) {
        setShouldLoadVideo(true);
      }
    };

    // Initial check
    checkViewport();

    // Throttled scroll listener for performance
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          checkViewport();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Debounced resize listener
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkViewport, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
      clearTimeout(resizeTimeout);
    };
  }, [isVideo, shouldLoadVideo]);

  // Generate optimized fallback image URL (memoized)
  const fallbackImageUrl = useMemo(() => {
    if (!src || !isVideo) return null;
    
    // For Cloudinary videos, convert to optimized image
    if (src.includes('cloudinary.com/') && src.includes('/video/')) {
      return src
        .replace('/video/', '/image/')
        .replace(/\.(mp4|webm|mov|avi|mkv)$/i, '.jpg')
        .replace('fl_progressive', 'f_auto,q_auto,c_fill,w_300,h_225,dpr_auto');
    }
    
    // For other video URLs, try to generate a thumbnail
    const baseUrl = src.substring(0, src.lastIndexOf('.'));
    return `${baseUrl}.jpg`;
  }, [src, isVideo]);

  // Optimized retry mechanism
  const retryLoad = useCallback(() => {
    if (retryCount < maxRetries && videoRef.current && shouldLoadVideo) {
      setRetryCount(prev => prev + 1);
      setError(false);
      setNetworkError(false);
      setIsLoading(true);
      
      // Progressive delay with jitter to avoid thundering herd
      const baseDelay = isMobile ? 1500 : 800;
      const jitter = Math.random() * 500;
      const delay = baseDelay * (retryCount + 1) + jitter;
      
      setTimeout(() => {
        if (videoRef.current && shouldLoadVideo) {
          videoRef.current.load();
        }
      }, delay);
    } else {
      setError(true);
      setNetworkError(true);
      setIsLoading(false);
    }
  }, [retryCount, maxRetries, isMobile, shouldLoadVideo]);

  // Mobile-specific video loading trigger
  useEffect(() => {
    if (isMobile && shouldLoadVideo && videoRef.current && isVideo) {
      const video = videoRef.current;
      
      // Force load on mobile
      const triggerLoad = () => {
        if (video.readyState === HTMLMediaElement.HAVE_NOTHING) {
          video.load();
        }
      };
      
      // Trigger load immediately and after a short delay
      triggerLoad();
      const timeout = setTimeout(triggerLoad, 100);
      
      return () => clearTimeout(timeout);
    }
  }, [isMobile, shouldLoadVideo, isVideo]);

  // Optimized video event handlers
  const handleVideoLoadStart = useCallback(() => {
    setIsLoading(true);
    setError(false);
    setNetworkError(false);
  }, []);

  const handleVideoLoadedData = useCallback(() => {
    setIsLoading(false);
    setVideoLoaded(true);
    setError(false);
    setNetworkError(false);
    setRetryCount(0);
    
    // Auto-play when loaded
    if (videoRef.current) {
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.play().catch(() => {
            // Silent fail - don't retry for autoplay failures
          });
        }
      });
    }
  }, []);

  const handleVideoError = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.target as HTMLVideoElement;
    const error = video.error;
    
    const isNetworkError = error?.code === MediaError.MEDIA_ERR_NETWORK || 
                          error?.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED ||
                          video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE;
    
    if (isNetworkError && retryCount < maxRetries) {
      retryLoad();
    } else {
      setError(true);
      setNetworkError(isNetworkError);
      setIsLoading(false);
      setVideoLoaded(false);
    }
  }, [retryCount, maxRetries, retryLoad]);

  const handleVideoCanPlay = useCallback(() => {
    setIsLoading(false);
    setVideoLoaded(true);
    setError(false);
    setNetworkError(false);
    
    // Auto-play when ready
    if (videoRef.current) {
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.play().catch(() => {
            // Silent fail
          });
        }
      });
    }
  }, []);

  // Optimized hover handlers with debouncing
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();
  
  const handleMouseEnter = useCallback(() => {
    if (isMobile || !videoRef.current || !videoLoaded) return;
    
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    
    hoverTimeoutRef.current = setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {
          // Silent fail
        });
      }
    }, 50); // Small delay to avoid excessive triggering
  }, [isMobile, videoLoaded]);

  const handleMouseLeave = useCallback(() => {
    if (isMobile || !videoRef.current) return;
    
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
  }, [isMobile]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
      
      // Cleanup video resources
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.removeAttribute('src');
        videoRef.current.load();
      }
    };
  }, []);

  // Common styles (memoized)
  const commonStyle: CSSProperties = useMemo(() => ({
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    borderRadius: '8px',
    display: 'block',
  }), []);

  // Error state with optimized fallback
  if (error || !src) {
    // Show fallback image for video errors if available
    if (fallbackImageUrl && networkError && isVideo) {
      return (
        <img
          src={fallbackImageUrl}
          alt={alt}
          style={commonStyle}
          loading="lazy"
          onError={() => {
            // If fallback also fails, will show placeholder on next render
          }}
        />
      );
    }
    
    // Minimal error state
    return (
      <div style={{
        ...commonStyle,
        backgroundColor: '#F3F4F6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#9CA3AF',
        fontSize: '12px',
      }}>
        {isVideo ? '🎬' : '🖼️'}
      </div>
    );
  }

  // Performance-optimized video rendering
  if (isVideo) {
    // Show fallback image until video loads, but start loading immediately if in viewport
    if (!shouldLoadVideo) {
      return (
        <div 
          ref={containerRef}
          style={{
            ...commonStyle,
            backgroundColor: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {fallbackImageUrl ? (
            <img
              src={fallbackImageUrl}
              alt={alt}
              style={commonStyle}
              loading="lazy"
            />
          ) : (
            <div style={{
              width: '24px',
              height: '24px',
              border: '2px solid rgba(255,255,255,0.3)',
              borderTop: '2px solid #fff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
          )}
        </div>
      );
    }

    return (
      <div 
        ref={containerRef}
        style={{
          position: 'relative',
    width: '100%',
    height: '100%',
    borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: '#000',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
      <video
          ref={videoRef}
          style={{
            ...commonStyle,
            backgroundColor: '#000',
          }}
          // Mobile-optimized attributes
          playsInline
        muted
        loop
          autoPlay
          preload={isMobile ? "none" : "metadata"} // Mobile-specific preload strategy
          webkit-playsinline="true"
          // Android WeChat specific attributes
          x5-video-player-type="h5-page"
          x5-video-player-fullscreen="true"
          x5-video-orientation="portraint"
          // Event handlers
          onLoadStart={handleVideoLoadStart}
          onLoadedData={handleVideoLoadedData}
          onCanPlay={handleVideoCanPlay}
          onError={handleVideoError}
          disablePictureInPicture
      >
        <source src={src} type="video/mp4" />
        </video>

        {/* Show fallback image on mobile while video loads */}
        {isMobile && isLoading && fallbackImageUrl && (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#000',
          }}>
            <img
              src={fallbackImageUrl}
              alt={alt}
              style={commonStyle}
              loading="lazy"
            />
          </div>
        )}

        {/* Minimal loading overlay */}
        {isLoading && (!isMobile || !fallbackImageUrl) && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          }}>
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid rgba(255,255,255,0.3)',
              borderTop: '2px solid #fff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
        </div>
        )}

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Optimized image rendering
  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
    <img
      src={src}
      alt={alt}
      style={commonStyle}
        loading="lazy"
      onLoad={() => setIsLoading(false)}
      onError={() => setError(true)}
    />
    </div>
  );
}

// Unified Responsive Expert Card Component
function ResponsiveExpertCard({
    expert,
    colors,
    enableAnimations,
    showDescription,
    showSkills,
    maxSkills,
    showProjects,
    maxProjects
}: {
    expert: ExpertProfile;
    colors: any;
    enableAnimations: boolean;
    showDescription: boolean;
    showSkills: boolean;
    maxSkills: number;
    showProjects: boolean;
    maxProjects: number;
}) {
    const shouldReduceMotion = useReducedMotion();
    const motionEnabled = enableAnimations && !shouldReduceMotion;

    const formatNumber = (num: number): string => {
        if (num >= 1000000) return `${Math.floor(num / 1000000)}M`;
        if (num >= 1000) return `${Math.floor(num / 1000)}k`;
        return num.toString();
    };

    const formatEarnings = (amount: number): string => {
        if (amount >= 1000000) return `$${Math.floor(amount / 1000000)}M+`;
        if (amount >= 1000) return `$${Math.floor(amount / 1000)}k+`;
        return `$${amount}+`;
    };

    const handleContactClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (expert.inquiryUrl) window.open(expert.inquiryUrl, '_blank', 'noopener,noreferrer');
    };

    const handleProfileClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (expert.profileUrl) window.open(expert.profileUrl, '_blank', 'noopener,noreferrer');
    };
    
    const handleProjectClick = (e: React.MouseEvent, projectUrl: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (projectUrl) window.open(projectUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <motion.div
            style={{
                backgroundColor: colors.cardBackground,
                border: `1px solid ${colors.borderColor}`,
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '16px',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                position: 'relative',
                overflow: 'visible',
                display: 'flex',
                flexDirection: 'column',
                gap: '0px',
                minWidth: 0,
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box',
            }}
            variants={motionEnabled ? itemVariants : {}}
        >
            {/* Desktop: Horizontal Layout | Mobile: Will stack via CSS */}
            <div 
                style={{
                    display: 'flex',
                    gap: '20px',
                    alignItems: 'center',
                    marginBottom: '16px',
                    width: '100%',
                }}
                className="main-header"
            >
                {/* Left: Avatar + Name/Location */}
                    <div style={{ 
                        display: 'flex', 
                        gap: '12px', 
                        alignItems: 'center',
                    flex: '0 0 auto',
                        minWidth: 0,
                    }}>
                        <img
                            src={expert.avatarUrl}
                            alt={expert.name}
                            onClick={handleProfileClick}
                            style={{
                            width: '56px',
                            height: '56px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                flexShrink: 0,
                                cursor: 'pointer',
                                border: `2px solid ${colors.avatarBorder}`,
                            }}
                            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                const target = e.target as HTMLImageElement;
                                target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${expert.name}`;
                            }}
                        />
                        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                            <h3 onClick={handleProfileClick} style={{
                                margin: 0,
                            fontSize: '20px',
                                fontWeight: 600,
                                color: colors.textPrimary,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                cursor: 'pointer',
                            lineHeight: '1.2',
                            }}>
                                {expert.name}
                            </h3>
                            <p style={{
                            margin: '4px 0 0 0',
                                fontSize: '14px',
                                color: colors.textSecondary,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>
                                {expert.location}
                            </p>
                        </div>
                    </div>

                {/* Vertical Divider */}
                <div 
                    style={{
                        width: '1px',
                        height: '40px',
                        backgroundColor: colors.borderColor,
                        flexShrink: 0,
                    }}
                    className="vertical-divider"
                />

                    {/* Stats Row */}
                <div 
                    style={{
                        display: 'flex',
                        gap: '20px',
                        flex: '1',
                        minWidth: 0,
                        alignItems: 'center',
                    }}
                    className="stats-section"
                >
                        {[
                            { label: 'Earned', value: formatEarnings(expert.earningsUSD) },
                            { label: 'Hired', value: `${formatNumber(expert.projectsCompletedCount)}×` },
                            { label: 'Rating', value: `★ ${expert.averageReviewScore.toFixed(1)}` },
                        { label: 'Followers', value: formatNumber(expert.followersCount) },
                        { label: 'Hourly rate', value: expert.hourlyRateUSD ? `$${expert.hourlyRateUSD}/hr` : 'N/A' }
                        ].map((stat) => (
                            <div key={stat.label} style={{ 
                                minWidth: 0,
                                overflow: 'hidden',
                            flex: '0 0 auto',
                            }}>
                                <div style={{
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    color: colors.textPrimary,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                lineHeight: '1.2',
                                }}>
                                    {stat.value}
                                </div>
                                <div style={{
                                fontSize: '11px',
                                    color: colors.textSecondary,
                                    marginTop: '2px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                </div>

                {/* Right: Available Badge + Message Button (Desktop) */}
                <div 
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        flexShrink: 0,
                    }}
                    className="action-section"
                >
                    {expert.available && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: colors.availableBackground,
                            padding: '8px 12px',
                            borderRadius: '16px',
                            flexShrink: 0,
                        }}>
                            <div style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: colors.availableText,
                            }} />
                            <span style={{
                                fontSize: '12px',
                                color: colors.availableText,
                                fontWeight: 500,
                                whiteSpace: 'nowrap',
                            }}>
                                Available Now
                            </span>
                        </div>
                    )}

                    <motion.button
                        onClick={handleContactClick}
                        style={{
                            backgroundColor: colors.buttonPrimary,
                            color: colors.buttonText,
                            padding: '12px 24px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: 600,
                            border: 'none',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                        }}
                        className="message-button"
                        variants={motionEnabled ? buttonVariants : {}}
                        initial="idle"
                        whileHover="hover"
                        whileTap="tap"
                    >
                        Message
                    </motion.button>
                </div>
                    </div>

                    {/* Description */}
                    {showDescription && expert.oneLiner && (
                        <p style={{
                    margin: '0 0 16px 0',
                    fontSize: '15px',
                            color: colors.textSecondary,
                    lineHeight: 1.5,
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                        }}>
                            {expert.oneLiner}
                        </p>
                    )}

                    {/* Skills */}
                    {showSkills && expert.skillTags && expert.skillTags.length > 0 && (
                        <div style={{ 
                            display: 'flex', 
                            gap: '8px', 
                            flexWrap: 'wrap',
                            width: '100%',
                    marginBottom: showProjects && expert.projects && expert.projects.length > 0 ? '16px' : '0px',
                        }}>
                            {expert.skillTags.slice(0, maxSkills).map((skill) => (
                                <span key={skill} style={{
                                    backgroundColor: colors.skillBackground,
                                    color: colors.skillText,
                            padding: '6px 12px',
                                    borderRadius: '16px',
                                    fontSize: '12px',
                                    fontWeight: 500,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth: '120px',
                                }}>
                                    {skill}
                                </span>
                            ))}
                            {expert.skillTags.length > maxSkills && (
                                <span style={{
                                    backgroundColor: colors.textSecondary,
                                    color: colors.cardBackground,
                            padding: '6px 12px',
                                    borderRadius: '16px',
                                    fontSize: '12px',
                                    fontWeight: 500,
                                }}>
                                    +{expert.skillTags.length - maxSkills}
                                </span>
                            )}
                        </div>
                    )}

            {/* Projects - Full Width Container */}
                    {showProjects && expert.projects && expert.projects.length > 0 && (
                        <div style={{
                    width: 'calc(100% + 40px)',
                    marginLeft: '-20px',
                    marginRight: '-20px',
                    marginBottom: '-20px',
                    paddingLeft: '20px',
                    paddingBottom: '20px',
                    overflow: 'hidden',
                }}>
                    {/* Desktop/Tablet: Grid Layout */}
                    <div 
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: '12px',
                            paddingRight: '20px',
                        }}
                        className="projects-grid"
                    >
                        {expert.projects.slice(0, 4).map((project, i) => (
                            <div
                                key={project.projectUrl}
                                onClick={(e) => handleProjectClick(e, project.projectUrl)}
                                style={{
                            width: '100%',
                                    aspectRatio: '4/3',
                                    borderRadius: '8px',
                            overflow: 'hidden',
                                    cursor: 'pointer',
                                    border: `1px solid ${colors.borderColor}`,
                                    transition: 'transform 0.2s ease',
                                    position: 'relative',
                                }}
                            >
                                <ProjectMedia
                                    src={project.coverUrl}
                                    alt={project.title}
                                    title={project.title}
                                />
                                {i === 3 && expert.projects.length > 4 && (
                                    <div style={{
                                        position: 'absolute',
                                        inset: 0,
                                        backgroundColor: 'rgba(0,0,0,0.7)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '14px',
                                        fontWeight: 600
                                    }}>
                                        +{expert.projects.length - 4} more
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Mobile: Horizontal Scroll */}
                            <div 
                                style={{
                                    display: 'flex',
                            gap: '12px',
                                    overflowX: 'auto',
                                    overflowY: 'hidden',
                                    scrollbarWidth: 'none',
                                    msOverflowStyle: 'none',
                                    WebkitOverflowScrolling: 'touch',
                                    paddingBottom: '2px',
                            paddingRight: '20px',
                                }}
                                className="projects-scroll"
                            >
                                {expert.projects.slice(0, Math.max(maxProjects, 6)).map((project, i) => (
                                    <div
                                        key={project.projectUrl}
                                        onClick={(e) => handleProjectClick(e, project.projectUrl)}
                                        style={{
                                    width: '120px',
                                            flexShrink: 0,
                                            aspectRatio: '4/3',
                                            borderRadius: '8px',
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                            border: `1px solid ${colors.borderColor}`,
                                            transition: 'transform 0.2s ease',
                                            position: 'relative',
                                        }}
                                    >
                                        <ProjectMedia
                                            src={project.coverUrl}
                                            alt={project.title}
                                            title={project.title}
                                        />
                                        {i === Math.max(maxProjects, 6) - 1 && expert.projects.length > Math.max(maxProjects, 6) && (
                                            <div style={{
                                                position: 'absolute',
                                                inset: 0,
                                                backgroundColor: 'rgba(0,0,0,0.7)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontSize: '12px',
                                                fontWeight: 600
                                            }}>
                                                +{expert.projects.length - Math.max(maxProjects, 6)}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

            {/* Mobile Message Button - Only visible on mobile */}
                <motion.button
                    onClick={handleContactClick}
                    style={{
                        backgroundColor: colors.buttonPrimary,
                        color: colors.buttonText,
                    padding: '12px 24px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                    width: '100%',
                    marginTop: '16px',
                    display: 'none',
                    }}
                className="mobile-message-button"
                    variants={motionEnabled ? buttonVariants : {}}
                    initial="idle"
                    whileHover="hover"
                    whileTap="tap"
                >
                Message
                </motion.button>

            {/* Add CSS for responsive behavior */}
            <style>{`
                @media (max-width: 768px) {
                    .main-header {
                        flex-direction: column !important;
                        align-items: flex-start !important;
                        gap: 16px !important;
                    }
                    
                    .vertical-divider {
                        display: none !important;
                    }
                    
                    .stats-section {
                        display: grid !important;
                        grid-template-columns: repeat(3, 1fr) !important;
                        gap: 16px !important;
                        width: 100% !important;
                        text-align: center !important;
                    }
                    
                    .action-section .message-button {
                        display: none !important;
                    }
                    
                    .mobile-message-button {
                        display: block !important;
                    }
                    
                    .projects-grid {
                        display: none !important;
                    }
                    
                    .projects-scroll {
                        display: flex !important;
                    }
                }
                
                @media (min-width: 769px) {
                    .projects-grid {
                        display: grid !important;
                    }
                    
                    .projects-scroll {
                        display: none !important;
                    }
                }
                
                @media (max-width: 1024px) and (min-width: 769px) {
                    .projects-grid {
                        grid-template-columns: repeat(3, 1fr) !important;
                    }
                }
                
                @media (max-width: 480px) {
                    .stats-section {
                        grid-template-columns: repeat(2, 1fr) !important;
                    }
                    
                    .projects-scroll > div {
                        width: 90px !important;
                    }
                }
                
                .projects-scroll::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </motion.div>
    );
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 200
 * @framerIntrinsicHeight 200
 */
export default function ExpertListViewFramer(props: any) {
  const {
    // Theme Colors
    cardBackground,
    borderColor,
    borderHover,
    textPrimary,
    textSecondary,
    avatarBorder,
    availableBackground,
    availableBorder,
    availableText,
    skillBackground,
    skillText,
    buttonPrimary,
    buttonText,
    
    // API Configuration
    apiKey: propApiKey,
    programId: propProgramId,
    apiBaseUrl: propApiBaseUrl = 'https://contra.com',
    debugMode: propDebugMode = false,
    enableApiData = true,

    // Layout
    maxWidth = '100%',
    
    // Display Options
    showDescription = true,
    showSkills = true,
    maxSkills = 4,
    showProjects = true,
    maxProjects = 4,
    itemsPerPage = 10,
    
    // Animation
    enableAnimations = true,

    // Filtering
    availableOnly = false,
    locationFilter = '',
    minRate = 0,
    maxRate = 0,
    sortBy = 'relevance',

    // Mock Data
    showMockData = true,
    mockItemCount = 5,

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
  const [filteredExperts, setFilteredExperts] = useState<ExpertProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [activeFilters, setActiveFilters] = useState<any>({});
  const [hasMoreResults, setHasMoreResults] = useState(true);

  // Client-side filtering and sorting function
  const applyClientSideFiltering = (expertsToFilter: ExpertProfile[], filters: any) => {
    console.log(`🎯 [CLIENT FILTER] Starting with ${expertsToFilter.length} experts`);
    console.log(`🎯 [CLIENT FILTER] Applying filters:`, filters);
    
    let filtered = [...expertsToFilter];
    let appliedFilters = [];

    // Apply sorting
    if (filters.sortBy) {
      appliedFilters.push(`sortBy: ${filters.sortBy}`);
      switch (filters.sortBy) {
        case 'newest':
          // Sort by some date field if available, or keep original order
          console.log(`🔄 [SORT] Applied newest sort (no change - no date field)`);
          break;
        case 'oldest':
          // Sort by some date field if available, or reverse order
          filtered = filtered.reverse();
          console.log(`🔄 [SORT] Applied oldest sort (reversed order)`);
          break;
        case 'relevance':
        default:
          // Keep original API order for relevance
          console.log(`🔄 [SORT] Applied relevance sort (original order)`);
          break;
      }
    }

    // Apply rate filtering
    if (filters.minRate || filters.maxRate) {
      const beforeCount = filtered.length;
      filtered = filtered.filter(expert => {
        if (!expert.hourlyRateUSD) return false;
        const minOk = !filters.minRate || expert.hourlyRateUSD >= parseInt(filters.minRate);
        const maxOk = !filters.maxRate || expert.hourlyRateUSD <= parseInt(filters.maxRate);
        return minOk && maxOk;
      });
      appliedFilters.push(`rate: $${filters.minRate || 0}-$${filters.maxRate || '∞'}`);
      console.log(`💰 [RATE FILTER] ${beforeCount} → ${filtered.length} experts (min: ${filters.minRate}, max: ${filters.maxRate})`);
    }

    // Apply availability filtering
    if (filters.available === 'true' || filters.available === true) {
      const beforeCount = filtered.length;
      filtered = filtered.filter(expert => expert.available);
      appliedFilters.push(`available: true`);
      console.log(`✅ [AVAILABILITY FILTER] ${beforeCount} → ${filtered.length} experts (available only)`);
    }

    // Apply location filtering (simple text search)
    if (filters.location) {
      const beforeCount = filtered.length;
      const locationSearch = filters.location.toLowerCase();
      filtered = filtered.filter(expert => 
        expert.location.toLowerCase().includes(locationSearch)
      );
      appliedFilters.push(`location: contains "${filters.location}"`);
      console.log(`📍 [LOCATION FILTER] ${beforeCount} → ${filtered.length} experts (location contains "${filters.location}")`);
    }

    console.log(`🎯 [CLIENT FILTER] Final result: ${expertsToFilter.length} → ${filtered.length} experts`);
    console.log(`🎯 [CLIENT FILTER] Applied filters: ${appliedFilters.length > 0 ? appliedFilters.join(', ') : 'None'}`);
    
    return filtered;
  };

  // Apply filters to current experts whenever filters or experts change
  useEffect(() => {
    const filtered = applyClientSideFiltering(experts, activeFilters);
    setFilteredExperts(filtered);
    
    if (debugMode) {
      console.log(`🎯 [CLIENT FILTER] Applied filters to ${experts.length} experts → ${filtered.length} visible`);
      console.log(`🎛️ [CLIENT FILTER] Active filters:`, activeFilters);
    }
  }, [experts, activeFilters, debugMode]);

  // Color system with mobile-first defaults
  const colors = {
    cardBackground: cardBackground || '#FFFFFF',
    borderColor: borderColor || '#E5E7EB',
    borderHover: borderHover || '#D1D5DB',
    textPrimary: textPrimary || '#111827',
    textSecondary: textSecondary || '#6B7280',
    avatarBorder: avatarBorder || '#F3F4F6',
    availableBackground: availableBackground || '#ECFDF5',
    availableBorder: availableBorder || '#D1FAE5',
    availableText: availableText || '#059669',
    skillBackground: skillBackground || '#F3F4F6',
    skillText: skillText || '#374151',
    buttonPrimary: buttonPrimary || '#111827',
    buttonText: buttonText || '#FFFFFF',
  };

  // Listen for config updates
  useEffect(() => {
    const handleConfigUpdate = () => {
      if (debugMode) {
        console.log('[ExpertListViewFramer] Configuration updated, source:', getActiveConfig().source);
      }
    };
    window.addEventListener('contraConfigUpdated', handleConfigUpdate);
    return () => window.removeEventListener('contraConfigUpdated', handleConfigUpdate);
  }, [debugMode]);

  // Listen for filter events
  useEffect(() => {
    const handleFilterChange = (event: any) => {
      console.log(`🎛️ [FILTER EVENT] Raw event received:`, event);
      console.log(`🎛️ [FILTER EVENT] Event detail:`, event.detail);
      
      const { filters } = event.detail;
      console.log(`🎛️ [FILTER EVENT] Extracted filters:`, filters);
      console.log(`📊 [FILTER EVENT] Current experts loaded: ${experts.length}`);
      console.log(`📊 [FILTER EVENT] Current filtered experts: ${filteredExperts.length}`);
      console.log(`📍 [FILTER EVENT] Current offset: ${currentOffset}`);
      
      // Just update filters - don't reset pagination or experts!
      // This will trigger client-side filtering via useEffect
      setActiveFilters(filters);
      
      console.log(`✨ [FILTER EVENT] Applied filters client-side. Pagination preserved.`);
      console.log(`✨ [FILTER EVENT] New activeFilters state:`, filters);
    };
    
    console.log(`🔗 [SETUP] Adding event listener for 'contra:filterChange'`);
    window.addEventListener('contra:filterChange', handleFilterChange);
    
    return () => {
      console.log(`🔗 [CLEANUP] Removing event listener for 'contra:filterChange'`);
      window.removeEventListener('contra:filterChange', handleFilterChange);
    };
  }, [apiKey, programId, apiBaseUrl, debugMode, experts.length, currentOffset, filteredExperts.length]);

  // Fetch experts with proper API pagination
  const fetchExperts = async (additionalFilters = {}, isFirstPage = false) => {
    if (!enableApiData || !apiKey || !programId) return;

    if (isFirstPage) {
    setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      const offset = isFirstPage ? 0 : currentOffset;
      const params = new URLSearchParams();
      
      // API parameters per documentation
      params.append('limit', itemsPerPage.toString());
      params.append('offset', offset.toString());
      
      // Combine component props + stored active filters + additional filters
      const allFilters = { 
        // Component props
        ...(sortBy && { sortBy }),
        ...(availableOnly && { available: 'true' }),
        ...(locationFilter && { location: locationFilter }),
        ...(minRate > 0 && { minRate: minRate.toString() }),
        ...(maxRate > 0 && { maxRate: maxRate.toString() }),
        // Active filters from FilterFramer
        ...activeFilters,
        // Any additional filters passed in
        ...additionalFilters
      };

      // Apply all filters to params
      Object.entries(allFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });

      const endpoint = `${apiBaseUrl}/public-api/programs/${programId}/experts?${params}`;
      
      if (debugMode) {
        console.log(`🔍 [DEBUG] Making API Call:`);
        console.log(`📍 URL: ${endpoint}`);
        console.log(`📊 Pagination: offset=${offset}, limit=${itemsPerPage}`);
        console.log(`🎯 All Filters Applied:`, allFilters);
        console.log(`📋 URL Params:`, params.toString());
      }

      // Test call without filters to see true total
      if (isFirstPage && debugMode) {
        try {
          const testParams = new URLSearchParams();
          testParams.append('limit', '1');
          testParams.append('offset', '0');
          const testEndpoint = `${apiBaseUrl}/public-api/programs/${programId}/experts?${testParams}`;
          console.log(`🧪 [TEST] Calling API without filters to see true total: ${testEndpoint}`);
          
          const testResponse = await fetch(testEndpoint, {
            method: 'GET',
            headers: {
              'Authorization': `${apiKey}`,
              'X-API-Key': `${apiKey}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (testResponse.ok) {
            const testResult = await testResponse.json();
            console.log(`🧪 [TEST] Total experts WITHOUT filters: ${testResult.totalCount}`);
          }
        } catch (testError) {
          console.log(`🧪 [TEST] Error testing without filters:`, testError);
        }
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
      
      if (debugMode) {
        console.log(`📦 [DEBUG] API Response:`);
        console.log(`📈 Data Length: ${result.data?.length || 0}`);
        console.log(`🔢 Total Count: ${result.totalCount}`);
        console.log(`📋 Full Response:`, result);
      }
      
      if (result && result.data) {
        if (isFirstPage) {
        setExperts(result.data);
          setCurrentOffset(itemsPerPage);
        } else {
          setExperts(prev => [...prev, ...result.data]);
          setCurrentOffset(prev => prev + itemsPerPage);
        }
        
        setTotalCount(result.totalCount);
        
        // Standard pagination logic: if we got fewer results than requested, we've reached the end
        const gotFullPage = result.data.length === itemsPerPage;
        setHasMoreResults(gotFullPage);
        
        if (debugMode) {
          console.log(`✅ [DEBUG] Results processed:`);
          console.log(`📊 Experts loaded this call: ${result.data.length}`);
          console.log(`📈 Total experts now loaded: ${isFirstPage ? result.data.length : experts.length + result.data.length}`);
          console.log(`🔢 API says totalCount: ${result.totalCount}`);
          console.log(`🎯 Got full page (${itemsPerPage})? ${gotFullPage ? 'YES - More likely available' : 'NO - Reached end'}`);
          console.log(`🔘 hasMoreResults set to: ${gotFullPage}`);
        }
      } else {
        throw new Error('No expert data received from API');
      }
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch experts';
      setError(errorMessage);
      if (debugMode) {
        console.error('[ExpertListViewFramer] Error:', errorMessage);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Load more experts - now properly uses stored filters
  const loadMoreExperts = () => {
    if (debugMode) {
      console.log('[ExpertListViewFramer] Load More clicked, using active filters:', activeFilters);
    }
    fetchExperts(); // This will now use activeFilters from state
  };

  // Check if more experts available - use proper pagination logic
  const hasMore = hasMoreResults && !loadingMore;

  // Test function to verify filter communication
  const testFilterCommunication = () => {
    console.log(`🧪 [TEST] Manually dispatching filter change event`);
    const testFilters = {
      sortBy: 'oldest',
      minRate: 100,
      maxRate: 200,
      location: 'San Francisco',
    };
    const event = new CustomEvent('contra:filterChange', {
      detail: { filters: testFilters }
    });
    window.dispatchEvent(event);
    console.log(`🧪 [TEST] Dispatched test filters:`, testFilters);
  };

  // Initial fetch
  useEffect(() => {
    setCurrentOffset(0);
    setExperts([]);
    setFilteredExperts([]); // Reset filtered experts too
    setActiveFilters({}); // Reset filters on component mount
    setHasMoreResults(true); // Reset pagination state
    fetchExperts({}, true);
  }, [enableApiData, apiKey, programId, apiBaseUrl, itemsPerPage, sortBy, availableOnly, locationFilter, minRate, maxRate]);

  // Mock data - set both experts and filteredExperts when using mock data
  const mockExperts: ExpertProfile[] = useMemo(() => 
    Array.from({ length: mockItemCount }, (_, i) => ({
      id: `mock-${i}`,
      name: `Expert Designer ${i + 1}`,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=Expert${i}`,
      location: ['San Francisco, CA', 'New York, NY', 'London, UK', 'Berlin, DE', 'Tokyo, JP'][i % 5],
      oneLiner: 'Crafting beautiful digital experiences with modern design principles and user-centered approach',
      available: i % 3 === 0,
      profileUrl: '#',
      inquiryUrl: '#',
      hourlyRateUSD: 80 + i * 20,
      earningsUSD: 45000 + i * 12000,
      projectsCompletedCount: 12 + i * 4,
      followersCount: 89 + i * 30,
      reviewsCount: 18 + i * 6,
      averageReviewScore: 4.7 + (i % 4) * 0.1,
      skillTags: [
        ['UI/UX Design', 'Figma', 'Prototyping', 'Design Systems'],
        ['React', 'TypeScript', 'Next.js', 'Node.js'],
        ['Brand Design', 'Illustration', 'Motion Graphics', 'Adobe CC'],
        ['Product Strategy', 'User Research', 'Analytics', 'A/B Testing'],
        ['Mobile Design', 'iOS', 'Android', 'React Native']
      ][i % 5],
      socialLinks: [
        { label: 'LinkedIn', url: '#' },
        { label: 'Portfolio', url: '#' }
      ],
      projects: Array.from({length: 5}).map((_, pIndex) => ({
        title: `Project ${i+1}-${pIndex+1}`,
        projectUrl: '#',
        coverUrl: `https://via.placeholder.com/300x200/${['4F46E5', '7C3AED', 'DC2626', '059669', 'F59E0B'][pIndex]}/ffffff?text=P${i+1}${pIndex+1}`
      })),
    }))
  , [mockItemCount]);

  // Handle mock data - apply to both experts and filteredExperts
  useEffect(() => {
    if (showMockData && (!enableApiData || !apiKey || !programId || error)) {
      setExperts(mockExperts);
      setFilteredExperts(mockExperts); // Set filtered experts too for mock data
    }
  }, [mockExperts, showMockData, enableApiData, apiKey, programId, error]);

  // Determine data to show - use filtered experts for display
  const shouldShowMockData = showMockData && (!enableApiData || !apiKey || !programId || error);
  const displayExperts = filteredExperts;

  // Improved container styles - mobile-first with proper constraints
  const containerStyle: CSSProperties = {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    width: '100%',
    maxWidth: maxWidth,
    minWidth: 0, // Critical for flex children
    height: height || 'auto',
    padding: '16px', // Desktop default
    position: 'relative',
    boxSizing: 'border-box',
    overflow: 'visible',
    ...style,
  };

  // Loading state
  if (loading && experts.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px 0',
          color: colors.textSecondary,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              border: `2px solid ${colors.borderColor}`,
              borderTop: `2px solid ${colors.textPrimary}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
            Loading experts...
          </div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }
  
  if (error && !shouldShowMockData) return <div style={containerStyle}>Error: {error}</div>;
  if (displayExperts.length === 0) return <div style={containerStyle}>No experts found.</div>;

  return (
    <div className="expert-container" style={containerStyle} {...otherProps}>
      {/* Global responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .expert-container {
            padding: 12px !important;
          }
        }
        
        @media (max-width: 480px) {
          .expert-container {
            padding: 8px !important;
          }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      {/* List */}
      <motion.div variants={listVariants} initial="hidden" animate="visible">
        {displayExperts.map((expert) => {
          return (
            <ResponsiveExpertCard
              key={expert.id}
              expert={expert}
              colors={colors}
              enableAnimations={enableAnimations}
              showDescription={showDescription}
              showSkills={showSkills}
              maxSkills={maxSkills}
              showProjects={showProjects}
              maxProjects={maxProjects}
            />
          );
        })}
      </motion.div>

      {/* Loading More Indicator */}
      {enableApiData && !shouldShowMockData && (
        <>
          {/* Debug Info */}
          {debugMode && (
            <div style={{
              backgroundColor: '#f0f0f0',
              padding: '10px',
              margin: '10px 0',
              fontSize: '12px',
              fontFamily: 'monospace',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}>
              <div><strong>🔍 SMART PAGINATION + FILTERING:</strong></div>
              <div>📦 experts.length (raw loaded): {experts?.length || 0}</div>
              <div>🎯 filteredExperts.length (displayed): {filteredExperts?.length || 0}</div>
              <div>🔢 totalCount (from API): {totalCount || 0}</div>
              <div>📍 currentOffset: {currentOffset}</div>
              <div>🎯 hasMoreResults: {String(hasMoreResults)} (got full page last time?)</div>
              <div>⏳ loadingMore: {String(loadingMore)}</div>
              <div>📄 itemsPerPage: {itemsPerPage}</div>
              <div style={{ marginTop: '8px' }}>
                <strong>🎛️ Active Filters:</strong> {Object.keys(activeFilters).length > 0 ? JSON.stringify(activeFilters) : 'None'}
              </div>
              <div style={{ marginTop: '8px' }}>
                <strong>⚙️ Component Props:</strong> {JSON.stringify({
                  sortBy,
                  availableOnly,
                  locationFilter: locationFilter || 'None',
                  minRate: minRate || 0,
                  maxRate: maxRate || 0
                })}
              </div>
              <div style={{ marginTop: '8px', fontWeight: 'bold', color: hasMore ? 'green' : 'red' }}>
                🔘 Load More Button Should Show: {String(hasMore)} (hasMoreResults && !loadingMore)
              </div>
              <div style={{ marginTop: '8px', backgroundColor: '#e6f3ff', padding: '8px', borderRadius: '4px' }}>
                <strong>💡 NEW BEHAVIOR:</strong> Filters apply instantly to loaded experts ({experts.length}). 
                Load More gets next {itemsPerPage} with current filters applied.
              </div>
              <div style={{ marginTop: '8px' }}>
                <button 
                  onClick={testFilterCommunication}
                  style={{
                    backgroundColor: '#ff6b6b',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '11px'
                  }}
                >
                  🧪 Test Filter Communication
                </button>
              </div>
            </div>
          )}

          {loadingMore && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '20px 0',
              color: colors.textSecondary,
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: `2px solid ${colors.borderColor}`,
                  borderTop: `2px solid ${colors.textPrimary}`,
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }} />
                Loading more experts...
              </div>
            </div>
          )}

          {/* Load More Button */}
          {hasMore && !loadingMore && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '24px 0',
            }}>
              <motion.button
                onClick={loadMoreExperts}
                style={{
                  backgroundColor: colors.cardBackground,
                  color: colors.textPrimary,
                  border: `2px solid ${colors.borderColor}`,
                  padding: '12px 32px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                whileHover={{
                  backgroundColor: colors.borderColor,
                  borderColor: colors.borderHover,
                  scale: 1.02,
                }}
                whileTap={{ scale: 0.98 }}
              >
                Load More Experts
                <span style={{
                  fontSize: '12px',
                  opacity: 0.7,
                  fontWeight: 400,
                }}>
                  (showing {filteredExperts.length} of {experts.length} loaded)
                </span>
              </motion.button>
            </div>
          )}

          {/* End of Results Message */}
          {!hasMore && experts.length > 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '20px 0',
              color: colors.textSecondary,
              fontSize: '14px',
            }}>
              You've reached the end! (showing {filteredExperts.length} of {experts.length} total loaded)
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Property Controls
addPropertyControls(ExpertListViewFramer, {
  // === LAYOUT ===
  maxWidth: { type: ControlType.String, title: "Max Width", defaultValue: "100%", description: "Maximum container width (use 100% for full width, or specify like '1200px')" },

  // === THEME COLORS ===
  cardBackground: { type: ControlType.Color, title: "Card Background", defaultValue: "#FFFFFF" },
  borderColor: { type: ControlType.Color, title: "Border Color", defaultValue: "#E5E7EB" },
  borderHover: { type: ControlType.Color, title: "Border Hover", defaultValue: "#D1D5DB" },
  textPrimary: { type: ControlType.Color, title: "Primary Text", defaultValue: "#111827" },
  textSecondary: { type: ControlType.Color, title: "Secondary Text", defaultValue: "#6B7280" },
  avatarBorder: { type: ControlType.Color, title: "Avatar Border", defaultValue: "#F3F4F6" },
  availableBackground: { type: ControlType.Color, title: "Available Badge Background", defaultValue: "#ECFDF5", },
  availableText: { type: ControlType.Color, title: "Available Badge Text", defaultValue: "#059669", },
  skillBackground: { type: ControlType.Color, title: "Skill Background", defaultValue: "#F3F4F6" },
  skillText: { type: ControlType.Color, title: "Skill Text", defaultValue: "#374151" },
  buttonPrimary: { type: ControlType.Color, title: "Button Background", defaultValue: "#111827" },
  buttonText: { type: ControlType.Color, title: "Button Text", defaultValue: "#FFFFFF" },

  // === API CONFIGURATION ===
  enableApiData: { type: ControlType.Boolean, title: "Use API Data", defaultValue: true },
  apiKey: { type: ControlType.String, title: "API Key (Override)", placeholder: "csk_...", hidden: (props: any) => !props.enableApiData },
  programId: { type: ControlType.String, title: "Program ID (Override)", placeholder: "program_...", hidden: (props: any) => !props.enableApiData },
  apiBaseUrl: { type: ControlType.String, title: "API Base URL (Override)", defaultValue: "https://contra.com", hidden: (props: any) => !props.enableApiData },
  debugMode: { type: ControlType.Boolean, title: "Debug Mode (Override)", defaultValue: false, hidden: (props: any) => !props.enableApiData },

  // === DISPLAY OPTIONS ===
  showDescription: { type: ControlType.Boolean, title: "Show Description", defaultValue: true },
  showSkills: { type: ControlType.Boolean, title: "Show Skills", defaultValue: true },
  maxSkills: { type: ControlType.Number, title: "Max Skills", defaultValue: 4, min: 1, max: 8, hidden: (props: any) => !props.showSkills },
  showProjects: { type: ControlType.Boolean, title: "Show Projects", defaultValue: true },
  maxProjects: { type: ControlType.Number, title: "Max Projects", defaultValue: 4, min: 1, max: 8, hidden: (props: any) => !props.showProjects },
  itemsPerPage: { type: ControlType.Number, title: "Items Per Page", defaultValue: 10, min: 1, max: 50 },

  // === ANIMATION ===
  enableAnimations: { type: ControlType.Boolean, title: "Enable Animations", defaultValue: true },

  // === FILTERING ===
  sortBy: { type: ControlType.Enum, title: "Sort By", options: ["relevance", "newest", "oldest"], defaultValue: "relevance" },
  availableOnly: { type: ControlType.Boolean, title: "Available Only", defaultValue: false },
  locationFilter: { type: ControlType.String, title: "Location Filter", placeholder: "e.g. San Francisco" },
  minRate: { type: ControlType.Number, title: "Min Rate", defaultValue: 0, min: 0 },
  maxRate: { type: ControlType.Number, title: "Max Rate", defaultValue: 0, min: 0 },

  // === MOCK DATA ===
  showMockData: { type: ControlType.Boolean, title: "Show Mock Data", defaultValue: true },
  mockItemCount: { type: ControlType.Number, title: "Mock Item Count", defaultValue: 5, min: 1, max: 15, hidden: (props: any) => !props.showMockData },
}); 