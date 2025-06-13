import React, { useState, useEffect, useMemo } from 'react';
import type { CSSProperties } from 'react';
import { addPropertyControls, ControlType } from "framer"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"

// --- Inlined Types for API Integration ---
interface ExpertProfile {
  id: string;
  name: string;
  avatarUrl: string;
  location: string;
  oneLiner: string;
  available: boolean;
  profileUrl: string;
  averageReviewScore: number;
  reviewsCount: number;
}

interface ExpertProfileListResponse {
  data: ExpertProfile[];
  totalCount: number;
}
// --- End Inlined Types ---

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

// Animation variants for professional motion design
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

const avatarVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.6,
    y: 20,
    filter: "blur(8px)"
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
      mass: 1,
      duration: 0.6
    }
  },
  hover: {
    scale: 1.1,
    y: -4,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 20,
      duration: 0.2
    }
  },
  tap: {
    scale: 0.95,
    transition: {
      type: "spring",
      stiffness: 600,
      damping: 25,
      duration: 0.1
    }
  }
};

const loadingVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25
    }
  },
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const errorVariants = {
  hidden: { opacity: 0, scale: 0, rotate: -180 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
      duration: 0.7
    }
  },
  shake: {
    x: [-4, 4, -4, 4, 0],
    transition: {
      duration: 0.5,
      ease: "easeInOut"
    }
  }
};

/**
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 240
 * @framerIntrinsicHeight 48
 */
export default function ExpertAvatarsFramer(props: any) {
  const {
    // Avatar Styling
    avatarSize = 48,
    borderWidth = 2,
    borderColor = '#FFFFFF',
    overlapOffset = -12,
    
    // Background
    backgroundColor = 'transparent',
    
    // Animation Settings
    enableAnimations = true,
    animationDuration = 0.6,
    staggerDelay = 0.1,
    hoverEnabled = true,
    
    // API Configuration (optional - will use global config if available)
    apiKey: propApiKey,
    programId: propProgramId,
    apiBaseUrl: propApiBaseUrl = 'https://contra.com',
    debugMode: propDebugMode = false,
    enableApiAvatars = true,
    
    // Custom Avatars (override)
    customAvatar1,
    customAvatar2,
    customAvatar3,
    customAvatar4,
    customAvatar5,
    
    // Layout
    direction = 'horizontal',
    alignment = 'center',
    spacing = '0px',
    
    // Framer props
    style,
    width,
    height,
    ...otherProps
  } = props;

  // Respect user's motion preferences
  const shouldReduceMotion = useReducedMotion();
  const motionEnabled = enableAnimations && !shouldReduceMotion;

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
    
    // Fallback to individual props
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

  // State for API-fetched avatars
  const [apiAvatars, setApiAvatars] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Listen for configuration updates
  useEffect(() => {
    const handleConfigUpdate = () => {
      // Force re-evaluation of configuration
      const newConfig = getActiveConfig();
      if (debugMode) {
        console.log('[ExpertAvatarsFramer] Configuration updated, source:', newConfig.source);
      }
    };

    window.addEventListener('contraConfigUpdated', handleConfigUpdate);
    return () => window.removeEventListener('contraConfigUpdated', handleConfigUpdate);
  }, []);

  // Fetch expert avatars from API with retry logic
  useEffect(() => {
    if (!enableApiAvatars || !apiKey || !programId) {
      if (debugMode && enableApiAvatars) {
        console.log('[ExpertAvatarsFramer] API avatars requested but missing apiKey or programId. Config source:', activeConfig.source);
      }
      return;
    }

    const fetchExpertAvatars = async () => {
      setIsLoading(true);
      setApiError(null);

      try {
        const endpoint = `${apiBaseUrl}/public-api/programs/${programId}/experts?limit=5`;
        if (debugMode) {
          console.log(`[ExpertAvatarsFramer] Fetching avatars from: ${endpoint} (config source: ${activeConfig.source})`);
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
        
        if (result && result.data && result.data.length > 0) {
          const avatars = result.data.slice(0, 5).map(expert => expert.avatarUrl);
          setApiAvatars(avatars);
          setRetryCount(0); // Reset retry count on success
          if (debugMode) {
            console.log('[ExpertAvatarsFramer] Successfully fetched avatars:', avatars);
          }
        } else {
          throw new Error('No expert data received from API');
        }
      } catch (err: any) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch expert avatars';
        setApiError(errorMessage);
        if (debugMode) {
          console.error('[ExpertAvatarsFramer] API Error:', errorMessage);
        }
        
        // Auto-retry logic (up to 2 times)
        if (retryCount < 2) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 2000 * (retryCount + 1)); // Exponential backoff
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpertAvatars();
  }, [enableApiAvatars, apiKey, programId, apiBaseUrl, debugMode, activeConfig.source, retryCount]);

  // Determine which avatars to use - priority: custom > API > fallback
  const finalAvatars = useMemo(() => {
    const customAvatars = [customAvatar1, customAvatar2, customAvatar3, customAvatar4, customAvatar5];
    
    // If we have API avatars and should use them, merge with custom overrides
    if (enableApiAvatars && apiAvatars.length > 0) {
      return apiAvatars.map((apiAvatar, index) => {
        const customAvatar = customAvatars[index];
        return customAvatar?.src || customAvatar || apiAvatar;
      });
    }
    
    // Fall back to provided fallback avatars with custom overrides
    return [
      customAvatar1?.src || customAvatar1 || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Expert1',
      customAvatar2?.src || customAvatar2 || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Expert2',
      customAvatar3?.src || customAvatar3 || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Expert3',
      customAvatar4?.src || customAvatar4 || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Expert4',
      customAvatar5?.src || customAvatar5 || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Expert5'
    ];
  }, [enableApiAvatars, apiAvatars, customAvatar1, customAvatar2, customAvatar3, customAvatar4, customAvatar5]);

  // Dynamic animation variants based on props
  const dynamicContainerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: motionEnabled ? staggerDelay : 0,
        delayChildren: motionEnabled ? 0.1 : 0,
        duration: motionEnabled ? animationDuration * 0.6 : 0,
        ease: "easeOut"
      }
    }
  }), [motionEnabled, staggerDelay, animationDuration]);

  const dynamicAvatarVariants = useMemo(() => ({
    hidden: motionEnabled ? { 
      opacity: 0, 
      scale: 0.6,
      y: 20,
      filter: "blur(8px)"
    } : {},
    visible: motionEnabled ? { 
      opacity: 1, 
      scale: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        mass: 1,
        duration: animationDuration
      }
    } : { opacity: 1, scale: 1, y: 0 },
    hover: motionEnabled && hoverEnabled ? {
      scale: 1.1,
      y: -4,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 20,
        duration: 0.2
      }
    } : {},
    tap: motionEnabled ? {
      scale: 0.95,
      transition: {
        type: "spring",
        stiffness: 600,
        damping: 25,
        duration: 0.1
      }
    } : {}
  }), [motionEnabled, hoverEnabled, animationDuration]);

  // Container styles based on direction
  const containerStyle: CSSProperties = {
    backgroundColor,
    display: 'flex',
    flexDirection: direction === 'vertical' ? 'column' : 'row',
    alignItems: alignment === 'start' ? 'flex-start' : alignment === 'end' ? 'flex-end' : 'center',
    justifyContent: alignment === 'start' ? 'flex-start' : alignment === 'end' ? 'flex-end' : 'center',
    gap: spacing !== '0px' ? spacing : undefined,
    position: 'relative',
    width: width || 'auto',
    height: height || 'auto',
    ...style,
  };

  // Individual avatar styles
  const getAvatarStyle = (index: number): CSSProperties => {
    const baseStyle: CSSProperties = {
      width: `${avatarSize}px`,
      height: `${avatarSize}px`,
      borderRadius: '50%',
      border: `${borderWidth}px solid ${borderColor}`,
      overflow: 'hidden',
      position: 'relative',
      flexShrink: 0,
      zIndex: 5 - index, // First avatar has highest z-index
      cursor: hoverEnabled ? 'pointer' : 'default',
    };

    // Add overlap if spacing is 0px (overlapping mode)
    if (spacing === '0px' && index > 0) {
      if (direction === 'horizontal') {
        baseStyle.marginLeft = `${overlapOffset}px`;
      } else {
        baseStyle.marginTop = `${overlapOffset}px`;
      }
    }

    return baseStyle;
  };

  // Loading skeleton component
  const LoadingSkeleton = ({ index }: { index: number }) => (
    <motion.div
      key={`loading-${index}`}
      style={getAvatarStyle(index)}
      variants={loadingVariants}
      initial="hidden"
      animate={["visible", "pulse"]}
      exit="hidden"
    >
      <div style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <motion.div 
          style={{
            width: '60%',
            height: '60%',
            backgroundColor: '#d0d0d0',
            borderRadius: '50%',
          }}
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
    </motion.div>
  );

  // Error component with retry functionality
  const ErrorDisplay = () => (
    <motion.div
      style={{
        ...getAvatarStyle(0),
        backgroundColor: '#FEF2F2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        border: `${borderWidth}px solid #FECACA`,
      }}
      variants={errorVariants}
      initial="hidden"
      animate={["visible", "shake"]}
      exit="hidden"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setRetryCount(prev => prev + 1)}
      title={`Error: ${apiError}. Click to retry.`}
    >
      <span style={{ fontSize: `${avatarSize * 0.4}px` }}>⚠️</span>
    </motion.div>
  );

  return (
    <motion.div 
      style={containerStyle} 
      variants={dynamicContainerVariants}
      initial="hidden"
      animate="visible"
      {...otherProps}
    >
      {/* Debug indicator for configuration source */}
      {debugMode && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: 'absolute',
            top: '-20px',
            right: '0px',
            fontSize: '10px',
            padding: '2px 6px',
            backgroundColor: activeConfig.source === 'global' ? '#10B981' : '#F59E0B',
            color: 'white',
            borderRadius: '3px',
            zIndex: 10,
            whiteSpace: 'nowrap'
          }}
        >
          {activeConfig.source === 'global' ? '🌐' : '⚙️'} {isLoading ? 'Loading...' : apiError ? 'Error' : 'OK'}
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {/* Loading State */}
        {isLoading && enableApiAvatars && (
          <>
            {[...Array(5)].map((_, index) => (
              <LoadingSkeleton key={`loading-${index}`} index={index} />
            ))}
          </>
        )}

        {/* Error State */}
        {apiError && enableApiAvatars && !isLoading && retryCount >= 2 && (
          <ErrorDisplay />
        )}

        {/* Avatar Images */}
        {!isLoading && (!apiError || !enableApiAvatars || retryCount < 2) && finalAvatars.map((avatar, index) => (
          <motion.div
            key={`avatar-${index}-${avatar}`}
            style={getAvatarStyle(index)}
            variants={dynamicAvatarVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            whileTap="tap"
            layout
          >
            <motion.img
              src={avatar}
              alt={`Expert ${index + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=expert${index}`;
              }}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* CSS for shimmer effect */}
      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </motion.div>
  );
}

// Property Controls
addPropertyControls(ExpertAvatarsFramer, {
  // === AVATAR STYLING ===
  avatarSize: { 
    type: ControlType.Number, 
    title: "Avatar Size", 
    defaultValue: 48,
    min: 24,
    max: 120,
    step: 4,
    description: "Size of each avatar in pixels"
  },
  borderWidth: { 
    type: ControlType.Number, 
    title: "Border Width", 
    defaultValue: 2,
    min: 0,
    max: 8,
    step: 1,
    description: "Width of avatar border"
  },
  borderColor: { 
    type: ControlType.Color, 
    title: "Border Color", 
    defaultValue: "#FFFFFF",
    description: "Color of avatar borders"
  },
  overlapOffset: { 
    type: ControlType.Number, 
    title: "Overlap Offset", 
    defaultValue: -12,
    min: -50,
    max: 0,
    step: 2,
    hidden: (props: any) => props.spacing !== '0px',
    description: "How much avatars overlap (negative values)"
  },

  // === BACKGROUND ===
  backgroundColor: { 
    type: ControlType.Color, 
    title: "Background Color", 
    defaultValue: "rgba(0,0,0,0)",
    description: "Container background color"
  },

  // === ANIMATION SETTINGS ===
  enableAnimations: { 
    type: ControlType.Boolean, 
    title: "Enable Animations", 
    defaultValue: true,
    description: "Enable Framer Motion animations (respects user's motion preferences)"
  },
  animationDuration: { 
    type: ControlType.Number, 
    title: "Animation Duration", 
    defaultValue: 0.6,
    min: 0.2,
    max: 2.0,
    step: 0.1,
    hidden: (props: any) => !props.enableAnimations,
    description: "Duration of entrance animations in seconds"
  },
  staggerDelay: { 
    type: ControlType.Number, 
    title: "Stagger Delay", 
    defaultValue: 0.1,
    min: 0,
    max: 0.5,
    step: 0.05,
    hidden: (props: any) => !props.enableAnimations,
    description: "Delay between each avatar animation"
  },
  hoverEnabled: { 
    type: ControlType.Boolean, 
    title: "Hover Effects", 
    defaultValue: true,
    hidden: (props: any) => !props.enableAnimations,
    description: "Enable hover animations and cursor pointer"
  },

  // === LAYOUT ===
  direction: { 
    type: ControlType.Enum, 
    title: "Direction", 
    options: ["horizontal", "vertical"],
    defaultValue: "horizontal",
    description: "Layout direction"
  },
  alignment: { 
    type: ControlType.Enum, 
    title: "Alignment", 
    options: ["start", "center", "end"],
    defaultValue: "center",
    description: "Avatar alignment"
  },
  spacing: { 
    type: ControlType.String, 
    title: "Spacing", 
    defaultValue: "0px",
    description: "Space between avatars (use 0px for overlapping)"
  },

  // === API CONFIGURATION (Optional - uses global config if available) ===
  enableApiAvatars: { 
    type: ControlType.Boolean, 
    title: "Use API Avatars", 
    defaultValue: true,
    description: "Fetch real expert avatars from API (uses global config from ContraConfigFramer if available)"
  },
  apiKey: { 
    type: ControlType.String, 
    title: "API Key (Override)", 
    placeholder: "csk_...", 
    hidden: (props: any) => !props.enableApiAvatars,
    description: "Override global API key (leave empty to use ContraConfigFramer)"
  },
  programId: { 
    type: ControlType.String, 
    title: "Program ID (Override)", 
    placeholder: "program_...", 
    hidden: (props: any) => !props.enableApiAvatars,
    description: "Override global program ID (leave empty to use ContraConfigFramer)"
  },
  apiBaseUrl: { 
    type: ControlType.String, 
    title: "API Base URL (Override)", 
    defaultValue: "https://contra.com", 
    hidden: (props: any) => !props.enableApiAvatars,
    description: "Override global API base URL"
  },
  debugMode: { 
    type: ControlType.Boolean, 
    title: "Debug Mode (Override)", 
    defaultValue: false, 
    hidden: (props: any) => !props.enableApiAvatars,
    description: "Override global debug mode setting"
  },

  // === CUSTOM AVATARS ===
  customAvatar1: { 
    type: ControlType.ResponsiveImage, 
    title: "Custom Avatar 1",
    description: "Override first avatar"
  },
  customAvatar2: { 
    type: ControlType.ResponsiveImage, 
    title: "Custom Avatar 2",
    description: "Override second avatar"
  },
  customAvatar3: { 
    type: ControlType.ResponsiveImage, 
    title: "Custom Avatar 3",
    description: "Override third avatar"
  },
  customAvatar4: { 
    type: ControlType.ResponsiveImage, 
    title: "Custom Avatar 4",
    description: "Override fourth avatar"
  },
  customAvatar5: { 
    type: ControlType.ResponsiveImage, 
    title: "Custom Avatar 5",
    description: "Override fifth avatar"
  },
}); 