import React, { useState, useEffect, useMemo } from 'react';
import type { CSSProperties } from 'react';
import { addPropertyControls, ControlType } from "framer";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

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

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05
    }
  }
};

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
      duration: 0.3
    }
  }
};

// Project Media Component
function ProjectMedia({ src, alt, title }: { src: string; alt: string; title: string }) {
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isVideo = src && (
    src.toLowerCase().includes('.mp4') || 
    src.toLowerCase().includes('.webm') || 
    src.toLowerCase().includes('.mov') ||
    src.toLowerCase().includes('video') ||
    src.toLowerCase().includes('.m4v')
  );

  if (error || !src) {
    return (
      <div className="project-placeholder">
        {isVideo ? '🎬' : '🖼️'}
      </div>
    );
  }

  const commonProps = {
    onLoad: () => setIsLoading(false),
    onError: () => setError(true),
    onLoadStart: () => setIsLoading(true)
  };

  if (isVideo) {
    return (
      <video
        src={src}
        muted
        loop
        playsInline
        {...commonProps}
        onMouseEnter={(e) => {
          (e.target as HTMLVideoElement).play().catch(() => {});
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLVideoElement).pause();
          (e.target as HTMLVideoElement).currentTime = 0;
        }}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      >
        <div className="project-placeholder">🎬 Video</div>
      </video>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      {...commonProps}
    />
  );
}

// Expert Card Component
function ExpertCard({ 
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

  const handleSocialClick = (e: React.MouseEvent, socialUrl: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (socialUrl) window.open(socialUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.article
      className="expert-card"
      style={{
        '--card-bg': colors.cardBackground,
        '--border-color': colors.borderColor,
        '--text-primary': colors.textPrimary,
        '--text-secondary': colors.textSecondary,
        '--avatar-border': colors.avatarBorder,
        '--available-bg': colors.availableBackground,
        '--available-text': colors.availableText,
        '--skill-bg': colors.skillBackground,
        '--skill-text': colors.skillText,
        '--button-bg': colors.buttonPrimary,
        '--button-text': colors.buttonText,
      } as CSSProperties}
      variants={motionEnabled ? cardVariants : {}}
      whileHover={motionEnabled ? { y: -2 } : {}}
    >
      {/* Header */}
      <header className="expert-header">
        <div className="expert-info" onClick={handleProfileClick}>
          <img
            src={expert.avatarUrl}
            alt={`${expert.name} avatar`}
            className="expert-avatar"
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${expert.name}`;
            }}
          />
          <div className="expert-details">
            <h2 className="expert-name">{expert.name}</h2>
            <p className="expert-location">{expert.location}</p>
          </div>
        </div>
        
        {expert.available && (
          <div className="availability-badge">
            <div className="availability-dot"></div>
            <span className="availability-text">Available</span>
          </div>
        )}
      </header>

      {/* Stats */}
      <section className="expert-stats">
        <div className="stat">
          <div className="stat-value">{formatEarnings(expert.earningsUSD)}</div>
          <div className="stat-label">Earned</div>
        </div>
        <div className="stat">
          <div className="stat-value">{formatNumber(expert.projectsCompletedCount)}×</div>
          <div className="stat-label">Hired</div>
        </div>
        <div className="stat">
          <div className="stat-value">★ {expert.averageReviewScore.toFixed(1)}</div>
          <div className="stat-label">Rating</div>
        </div>
        <div className="stat">
          <div className="stat-value">{expert.hourlyRateUSD ? `$${expert.hourlyRateUSD}` : 'N/A'}</div>
          <div className="stat-label">Hourly</div>
        </div>
      </section>

      {/* Description */}
      {showDescription && expert.oneLiner && (
        <p className="expert-description">{expert.oneLiner}</p>
      )}

      {/* Skills */}
      {showSkills && expert.skillTags && expert.skillTags.length > 0 && (
        <section className="expert-skills">
          {expert.skillTags.slice(0, maxSkills).map((skill) => (
            <span key={skill} className="skill-tag">{skill}</span>
          ))}
          {expert.skillTags.length > maxSkills && (
            <span className="skill-more">+{expert.skillTags.length - maxSkills}</span>
          )}
        </section>
      )}

      {/* Projects */}
      {showProjects && expert.projects && expert.projects.length > 0 && (
        <section className="expert-projects">
          <div className="projects-scroll">
            {expert.projects.slice(0, Math.max(maxProjects, 6)).map((project, i) => (
              <div
                key={project.projectUrl}
                className="project-item"
                onClick={(e) => handleProjectClick(e, project.projectUrl)}
              >
                <ProjectMedia
                  src={project.coverUrl}
                  alt={project.title}
                  title={project.title}
                />
                {i === Math.max(maxProjects, 6) - 1 && expert.projects.length > Math.max(maxProjects, 6) && (
                  <div className="project-overlay">
                    +{expert.projects.length - Math.max(maxProjects, 6)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Social Links */}
      {expert.socialLinks && expert.socialLinks.length > 0 && (
        <section className="expert-social">
          {expert.socialLinks.slice(0, 3).map((link, i) => (
            <button
              key={i}
              className="social-link"
              onClick={(e) => handleSocialClick(e, link.url)}
              title={link.label || 'Social link'}
            >
              {link.label || 'Link'}
            </button>
          ))}
        </section>
      )}

      {/* Action */}
      <motion.button
        className="contact-button"
        onClick={handleContactClick}
        whileHover={motionEnabled ? { scale: 1.02 } : {}}
        whileTap={motionEnabled ? { scale: 0.98 } : {}}
      >
        Send Message
      </motion.button>
    </motion.article>
  );
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicHeight 300
 */
export default function ContraExpertGrid(props: any) {
  const {
    // Theme Colors
    cardBackground = '#FFFFFF',
    borderColor = '#E5E7EB',
    textPrimary = '#111827',
    textSecondary = '#6B7280',
    avatarBorder = '#F3F4F6',
    availableBackground = '#ECFDF5',
    availableText = '#059669',
    skillBackground = '#F3F4F6',
    skillText = '#374151',
    buttonPrimary = '#111827',
    buttonText = '#FFFFFF',
    
    // API Configuration
    apiKey: propApiKey,
    programId: propProgramId,
    apiBaseUrl: propApiBaseUrl = 'https://contra.com',
    debugMode: propDebugMode = false,
    enableApiData = true,

    // Layout
    gap = 16,
    
    // Display Options
    showDescription = true,
    showSkills = true,
    maxSkills = 4,
    showProjects = true,
    maxProjects = 4,
    itemsPerPage = 12,
    
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
    mockItemCount = 6,

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
    cardBackground,
    borderColor,
    textPrimary,
    textSecondary,
    avatarBorder,
    availableBackground,
    availableText,
    skillBackground,
    skillText,
    buttonPrimary,
    buttonText,
  };

  // Fetch experts
  const fetchExperts = async (filters = {}) => {
    if (!enableApiData || !apiKey || !programId) {
      if (debugMode && enableApiData) {
        console.log('[ContraExpertGrid] API data requested but missing config. Config source:', activeConfig.source);
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
        console.log(`[ContraExpertGrid] Fetching from: ${endpoint} (config source: ${activeConfig.source})`);
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
          console.log('[ContraExpertGrid] Successfully fetched experts:', result.data.length);
        }
      } else {
        throw new Error('No expert data received from API');
      }
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch experts';
      setError(errorMessage);
      if (debugMode) {
        console.error('[ContraExpertGrid] API Error:', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchExperts();
  }, [enableApiData, apiKey, programId, apiBaseUrl, itemsPerPage, sortBy, availableOnly, locationFilter, minRate, maxRate]);

  // Listen for filter events
  useEffect(() => {
    const handleFilterChange = (event: any) => {
      const { filters } = event.detail;
      if (debugMode) {
        console.log('[ContraExpertGrid] Received filter change:', filters);
      }
      fetchExperts(filters);
    };
    window.addEventListener('contra:filterChange', handleFilterChange);
    return () => window.removeEventListener('contra:filterChange', handleFilterChange);
  }, [apiKey, programId, apiBaseUrl, debugMode]);

  // Mock data
  const mockExperts: ExpertProfile[] = useMemo(() => 
    Array.from({ length: mockItemCount }, (_, i) => ({
      id: `mock-${i}`,
      name: `Expert ${i + 1}`,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=Expert${i}`,
      location: ['San Francisco, CA', 'New York, NY', 'London, UK', 'Berlin, DE', 'Tokyo, JP', 'Austin, TX'][i % 6],
      oneLiner: 'Crafting exceptional digital experiences with modern design principles and user-centered methodologies.',
      available: i % 3 === 0,
      profileUrl: '#',
      inquiryUrl: '#',
      hourlyRateUSD: 75 + i * 25,
      earningsUSD: 35000 + i * 15000,
      projectsCompletedCount: 8 + i * 3,
      followersCount: 150 + i * 50,
      reviewsCount: 25 + i * 8,
      averageReviewScore: 4.6 + (i % 5) * 0.08,
      skillTags: [
        ['UI/UX Design', 'Figma', 'Prototyping', 'Design Systems', 'User Research'],
        ['React', 'TypeScript', 'Next.js', 'Node.js', 'GraphQL'],
        ['Brand Design', 'Illustration', 'Motion Graphics', 'Adobe CC', 'Webflow'],
        ['Product Strategy', 'Analytics', 'A/B Testing', 'Growth Marketing', 'SEO'],
        ['Mobile Design', 'iOS', 'Android', 'React Native', 'Flutter'],
        ['Backend', 'Python', 'PostgreSQL', 'AWS', 'Docker']
      ][i % 6],
      socialLinks: [
        { label: 'LinkedIn', url: '#' },
        { label: 'Portfolio', url: '#' },
        { label: 'Dribbble', url: '#' }
      ],
      projects: Array.from({length: 4}).map((_, pIndex) => ({
        title: `Project ${i+1}-${pIndex+1}`,
        projectUrl: '#',
        coverUrl: `https://picsum.photos/300/200?random=${i * 10 + pIndex}`
      })),
    }))
  , [mockItemCount]);

  // Determine data to show
  const shouldShowMockData = showMockData && (!enableApiData || !apiKey || !programId || error);
  const displayExperts = shouldShowMockData ? mockExperts : experts;

  // Container styles
  const containerStyle: CSSProperties = {
    '--grid-gap': `${gap}px`,
    width: '100%',
    maxWidth: 'none',
    minWidth: 0,
    flex: '1 1 auto',
    height: height || 'auto',
    position: 'relative',
    boxSizing: 'border-box',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    ...style,
  } as CSSProperties;

  // Loading state
  if (loading && experts.length === 0) {
    return (
      <div style={containerStyle} {...otherProps}>
        <div className="loading-state">Loading experts...</div>
      </div>
    );
  }

  if (error && !shouldShowMockData) {
    return (
      <div style={containerStyle} {...otherProps}>
        <div className="error-state">Error: {error}</div>
      </div>
    );
  }

  if (displayExperts.length === 0) {
    return (
      <div style={containerStyle} {...otherProps}>
        <div className="empty-state">No experts found.</div>
      </div>
    );
  }

  return (
    <div className="contra-expert-grid" style={containerStyle} {...otherProps}>
      {/* CSS Styles */}
      <style>{`
        /* Force 100% width - override any Framer constraints */
        .contra-expert-grid, .contra-expert-grid * {
          max-width: none !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }
        
        .expert-grid, .expert-card {
          width: 100% !important;
          max-width: none !important;
          min-width: 0 !important;
        }
        
        .contra-expert-grid {
          padding: 16px;
          width: 100% !important;
          max-width: none !important;
          min-width: 0 !important;
        }

        .expert-grid {
          display: flex;
          flex-direction: column;
          gap: var(--grid-gap);
          width: 100%;
        }

        .expert-card {
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: all 0.2s ease;
          width: 100%;
          box-sizing: border-box;
        }

        .expert-card:hover {
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          border-color: var(--border-color);
        }

        .expert-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .expert-info {
          display: flex;
          gap: 12px;
          align-items: center;
          cursor: pointer;
          flex: 1;
          min-width: 0;
        }

        .expert-avatar {
          width: 3em;
          height: 3em;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--avatar-border);
          flex-shrink: 0;
        }

        .expert-details {
          min-width: 0;
          flex: 1;
        }

        .expert-name {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .expert-location {
          margin: 2px 0 0 0;
          font-size: 0.875rem;
          color: var(--text-secondary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .availability-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--available-bg);
          padding: 0.375rem 0.625rem;
          border-radius: 12px;
          flex-shrink: 0;
        }

        .availability-dot {
          width: 0.375rem;
          height: 0.375rem;
          border-radius: 50%;
          background: var(--available-text);
        }

        .availability-text {
          font-size: 0.75rem;
          color: var(--available-text);
          font-weight: 500;
          white-space: nowrap;
        }

        .expert-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.75rem;
          text-align: center;
        }

        .stat {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .stat-value {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .stat-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .expert-description {
          margin: 0;
          font-size: 0.875rem;
          line-height: 1.4;
          color: var(--text-secondary);
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .expert-skills {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .skill-tag {
          background: var(--skill-bg);
          color: var(--skill-text);
          padding: 0.375rem 0.625rem;
          border-radius: 16px;
          font-size: 0.75rem;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .skill-more {
          background: var(--text-secondary);
          color: var(--card-bg);
          padding: 0.375rem 0.625rem;
          border-radius: 16px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .expert-projects {
          width: 100%;
          overflow: hidden;
        }

        .projects-scroll {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          overflow-y: hidden;
          scrollbar-width: none;
          -ms-overflow-style: none;
          -webkit-overflow-scrolling: touch;
          padding-bottom: 2px;
        }

        .projects-scroll::-webkit-scrollbar {
          display: none;
        }

        .project-item {
          width: 6.25rem;
          flex-shrink: 0;
          aspect-ratio: 4/3;
          border-radius: 0.5rem;
          overflow: hidden;
          cursor: pointer;
          border: 1px solid var(--border-color);
          transition: transform 0.2s ease;
          position: relative;
        }

        .project-item:hover {
          transform: scale(1.02);
        }

        .project-placeholder {
          width: 100%;
          height: 100%;
          background: var(--skill-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          font-size: 0.75rem;
        }

        .project-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .expert-social {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .social-link {
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          padding: 0.375rem 0.75rem;
          border-radius: 0.5rem;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .social-link:hover {
          background: var(--skill-bg);
          border-color: var(--text-secondary);
        }

        .contact-button {
          background: var(--button-bg);
          color: var(--button-text);
          border: none;
          padding: 0.75rem 1.25rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
        }

        .contact-button:hover {
          opacity: 0.9;
        }

        .loading-state, .error-state, .empty-state {
          padding: 2.5rem 1.25rem;
          text-align: center;
          color: var(--text-secondary);
          font-size: 1rem;
        }

        /* Mobile Optimizations */
        @media (max-width: 768px) {
          .contra-expert-grid {
            padding: 1rem;
          }
          
          .expert-card {
            padding: 1rem;
            gap: 0.75rem;
          }
          
          .expert-stats {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.5rem;
          }
          
          .project-item {
            width: 5rem;
          }
        }

        @media (max-width: 480px) {
          .contra-expert-grid {
            padding: 0.75rem;
          }
          
          .expert-card {
            padding: 0.75rem;
          }
          
          .project-item {
            width: 4.375rem;
          }
          
          .expert-avatar {
            width: 2.5rem;
            height: 2.5rem;
          }
          
          .expert-name {
            font-size: 1rem;
          }
          
          .expert-location {
            font-size: 0.75rem;
          }
        }
      `}</style>

      {/* Grid */}
      <motion.div 
        className="expert-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {displayExperts.map((expert) => (
          <ExpertCard
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
        ))}
      </motion.div>
    </div>
  );
}

// Property Controls
addPropertyControls(ContraExpertGrid, {
  // === THEME COLORS ===
  cardBackground: { type: ControlType.Color, title: "Card Background", defaultValue: "#FFFFFF" },
  borderColor: { type: ControlType.Color, title: "Border Color", defaultValue: "#E5E7EB" },
  textPrimary: { type: ControlType.Color, title: "Primary Text", defaultValue: "#111827" },
  textSecondary: { type: ControlType.Color, title: "Secondary Text", defaultValue: "#6B7280" },
  avatarBorder: { type: ControlType.Color, title: "Avatar Border", defaultValue: "#F3F4F6" },
  availableBackground: { type: ControlType.Color, title: "Available Badge Background", defaultValue: "#ECFDF5" },
  availableText: { type: ControlType.Color, title: "Available Badge Text", defaultValue: "#059669" },
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

  // === LAYOUT ===
  gap: { type: ControlType.Number, title: "Card Gap", defaultValue: 16, min: 8, max: 32 },

  // === DISPLAY OPTIONS ===
  showDescription: { type: ControlType.Boolean, title: "Show Description", defaultValue: true },
  showSkills: { type: ControlType.Boolean, title: "Show Skills", defaultValue: true },
  maxSkills: { type: ControlType.Number, title: "Max Skills", defaultValue: 4, min: 1, max: 8, hidden: (props: any) => !props.showSkills },
  showProjects: { type: ControlType.Boolean, title: "Show Projects", defaultValue: true },
  maxProjects: { type: ControlType.Number, title: "Max Projects", defaultValue: 4, min: 1, max: 8, hidden: (props: any) => !props.showProjects },
  itemsPerPage: { type: ControlType.Number, title: "Items Per Page", defaultValue: 12, min: 1, max: 50 },

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
  mockItemCount: { type: ControlType.Number, title: "Mock Item Count", defaultValue: 6, min: 1, max: 20, hidden: (props: any) => !props.showMockData },
}); 