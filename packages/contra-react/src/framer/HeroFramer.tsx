import React, { useState, useEffect, useMemo } from 'react';
import type { CSSProperties } from 'react';
import { addPropertyControls, ControlType } from "framer"

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

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 300
 */
export default function HeroFramer(props: any) {
  const {
    // Theme Colors (using global styles)
    backgroundColor,
    textColor,
    textSecondaryColor,
    
    // Content
    title = 'Replo Experts',
    subtitle = 'Discover trusted freelancers and agencies\nto build and optimize your Shopify page.',
    
    // Actions
    showActions = true,
    primaryAction = 'Get matched',
    secondaryAction = 'Become an expert',
    primaryActionUrl = '#',
    secondaryActionUrl = '#',
    
    // Button Colors
    buttonPrimaryBackground,
    buttonPrimaryText,
    buttonSecondaryBackground,
    buttonSecondaryText,
    buttonSecondaryBorder,
    
    // API Configuration (now optional - will use global config if available)
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
    maxWidth = '1206px',
    spacing = '80px',
    
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

  // Listen for configuration updates
  useEffect(() => {
    const handleConfigUpdate = () => {
      // Force re-evaluation of configuration
      const newConfig = getActiveConfig();
      if (debugMode) {
        console.log('[HeroFramer] Configuration updated, source:', newConfig.source);
      }
    };

    window.addEventListener('contraConfigUpdated', handleConfigUpdate);
    return () => window.removeEventListener('contraConfigUpdated', handleConfigUpdate);
  }, []);

  // Fetch expert avatars from API
  useEffect(() => {
    if (!enableApiAvatars || !apiKey || !programId) {
      if (debugMode && enableApiAvatars) {
        console.log('[HeroFramer] API avatars requested but missing apiKey or programId. Config source:', activeConfig.source);
      }
      return;
    }

    const fetchExpertAvatars = async () => {
      setIsLoading(true);
      setApiError(null);

      try {
        const endpoint = `${apiBaseUrl}/public-api/programs/${programId}/experts?limit=5`;
        if (debugMode) {
          console.log(`[HeroFramer] Fetching avatars from: ${endpoint} (config source: ${activeConfig.source})`);
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
          if (debugMode) {
            console.log('[HeroFramer] Successfully fetched avatars:', avatars);
          }
        } else {
          throw new Error('No expert data received from API');
        }
      } catch (err: any) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch expert avatars';
        setApiError(errorMessage);
        if (debugMode) {
          console.error('[HeroFramer] API Error:', errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpertAvatars();
  }, [enableApiAvatars, apiKey, programId, apiBaseUrl, debugMode, activeConfig.source]);

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

  const containerStyle: CSSProperties = {
    backgroundColor: backgroundColor,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '80px 32px',
    width: width || '100%',
    height: height || 'auto',
    ...style,
  };

  const innerContainerStyle: CSSProperties = {
    display: 'flex',
    width: maxWidth,
    maxWidth: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing,
  };

  const avatarSectionStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: '24px',
  };

  const titleStyle: CSSProperties = {
    fontSize: '48px',
    fontWeight: '700',
    lineHeight: '1.1',
    color: textColor,
    margin: '0 0 16px 0',
  };

  const subtitleStyle: CSSProperties = {
    fontSize: '18px',
    lineHeight: '1.6',
    color: textSecondaryColor,
    margin: '0 0 32px 0',
    whiteSpace: 'pre-line',
  };

  const actionsStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  };

  const primaryButtonStyle: CSSProperties = {
    backgroundColor: buttonPrimaryBackground,
    color: buttonPrimaryText,
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
  };

  const secondaryButtonStyle: CSSProperties = {
    backgroundColor: buttonSecondaryBackground || 'transparent',
    color: buttonSecondaryText,
    border: `1px solid ${buttonSecondaryBorder}`,
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
  };

  return (
    <section style={containerStyle} {...otherProps}>
      {/* Debug indicator for configuration source */}
      {debugMode && (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          fontSize: '10px',
          padding: '4px 8px',
          backgroundColor: activeConfig.source === 'global' ? '#10B981' : '#F59E0B',
          color: 'white',
          borderRadius: '4px',
          zIndex: 10
        }}>
          Config: {activeConfig.source === 'global' ? '🌐 Global' : '⚙️ Local'}
        </div>
      )}
      
      <div style={innerContainerStyle}>
        {/* Expert Avatars */}
        <div style={avatarSectionStyle}>
          {finalAvatars.map((avatar, index) => (
            <div
              key={index}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: '2px solid white',
                overflow: 'hidden',
                marginLeft: index > 0 ? '-12px' : '0',
                position: 'relative',
                zIndex: 5 - index,
              }}
            >
              <img
                src={avatar}
                alt={`Expert ${index + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=expert${index}`;
                }}
              />
            </div>
          ))}
        </div>

        {/* Content */}
        <div>
          <h1 style={titleStyle}>{title}</h1>
          <p style={subtitleStyle}>{subtitle}</p>
        </div>

        {/* Actions */}
        {showActions && (
          <div style={actionsStyle}>
            <a href={primaryActionUrl} style={primaryButtonStyle}>
              {primaryAction}
            </a>
            <a href={secondaryActionUrl} style={secondaryButtonStyle}>
              {secondaryAction}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

// Property Controls
addPropertyControls(HeroFramer, {
  // === COLORS ===
  backgroundColor: { 
    type: ControlType.Color, 
    title: "Background", 
    defaultValue: "#FFFFFF",
    description: "Hero section background color"
  },
  textColor: { 
    type: ControlType.Color, 
    title: "Title Color", 
    defaultValue: "#111827",
    description: "Main title text color"
  },
  textSecondaryColor: { 
    type: ControlType.Color, 
    title: "Subtitle Color", 
    defaultValue: "#6B7280",
    description: "Subtitle text color"
  },
  
  // === BUTTON COLORS ===
  buttonPrimaryBackground: { 
    type: ControlType.Color, 
    title: "Primary Button Background", 
    defaultValue: "#111827",
    description: "Primary button background color",
    hidden: (props: any) => !props.showActions
  },
  buttonPrimaryText: { 
    type: ControlType.Color, 
    title: "Primary Button Text", 
    defaultValue: "#FFFFFF",
    description: "Primary button text color",
    hidden: (props: any) => !props.showActions
  },
  buttonSecondaryBackground: { 
    type: ControlType.Color, 
    title: "Secondary Button Background", 
    defaultValue: "rgba(0,0,0,0)",
    description: "Secondary button background color",
    hidden: (props: any) => !props.showActions
  },
  buttonSecondaryText: { 
    type: ControlType.Color, 
    title: "Secondary Button Text", 
    defaultValue: "#111827",
    description: "Secondary button text color",
    hidden: (props: any) => !props.showActions
  },
  buttonSecondaryBorder: { 
    type: ControlType.Color, 
    title: "Secondary Button Border", 
    defaultValue: "#E5E7EB",
    description: "Secondary button border color",
    hidden: (props: any) => !props.showActions
  },

  // === CONTENT ===
  title: { type: ControlType.String, title: "Title", defaultValue: "Replo Experts" },
  subtitle: { 
    type: ControlType.String, 
    title: "Subtitle", 
    defaultValue: "Discover trusted freelancers and agencies\nto build and optimize your Shopify page.",
    displayTextArea: true
  },

  // === ACTIONS ===
  showActions: { type: ControlType.Boolean, title: "Show Actions", defaultValue: true },
  primaryAction: { type: ControlType.String, title: "Primary Action", defaultValue: "Get matched", hidden: (props: any) => !props.showActions },
  secondaryAction: { type: ControlType.String, title: "Secondary Action", defaultValue: "Become an expert", hidden: (props: any) => !props.showActions },
  primaryActionUrl: { type: ControlType.String, title: "Primary URL", defaultValue: "#", hidden: (props: any) => !props.showActions },
  secondaryActionUrl: { type: ControlType.String, title: "Secondary URL", defaultValue: "#", hidden: (props: any) => !props.showActions },

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
  customAvatar1: { type: ControlType.ResponsiveImage, title: "Custom Avatar 1" },
  customAvatar2: { type: ControlType.ResponsiveImage, title: "Custom Avatar 2" },
  customAvatar3: { type: ControlType.ResponsiveImage, title: "Custom Avatar 3" },
  customAvatar4: { type: ControlType.ResponsiveImage, title: "Custom Avatar 4" },
  customAvatar5: { type: ControlType.ResponsiveImage, title: "Custom Avatar 5" },

  // === LAYOUT ===
  maxWidth: { type: ControlType.String, title: "Max Width", defaultValue: "1206px" },
  spacing: { type: ControlType.String, title: "Section Spacing", defaultValue: "80px" },
}); 