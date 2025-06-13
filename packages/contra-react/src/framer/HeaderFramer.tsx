import React from 'react';
import type { CSSProperties } from 'react';
import { addPropertyControls, ControlType } from "framer"

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 80
 */
export default function HeaderFramer(props: any) {
  const {
    // Theme Colors (using global styles)
    backgroundColor,
    textColor,
    textSecondaryColor,
    borderColor,
    
    // Branding
    logoText = 'Replo',
    logoUrl,
    homeUrl = '/',
    
    // Navigation
    showNavigation = true,
    navItems = ['Navigation1', 'Navigation2', 'Navigation3', 'Navigation4'],
    
    // Actions
    showActions = true,
    primaryAction = 'Call to action',
    secondaryAction = 'Call to action',
    primaryActionUrl = '#',
    secondaryActionUrl = '#',
    
    // Button Colors
    buttonPrimaryBackground,
    buttonPrimaryText,
    buttonSecondaryBackground,
    buttonSecondaryText,
    buttonSecondaryBorder,
    
    // Layout
    maxWidth = '100%',
    padding = '16px 32px',
    
    // Framer props
    style,
    width,
    height,
    ...otherProps
  } = props;

  // Figma dev specs for header
  const headerStyle: CSSProperties = {
    display: 'flex',
    padding, // Exact Figma specs
    justifyContent: 'space-between', // Exact Figma specs
    alignItems: 'center', // Exact Figma specs
    borderBottom: `1px solid ${borderColor}`,
    backgroundColor: backgroundColor,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    width: width || '100%',
    height: height || 'auto',
    maxWidth,
    margin: '0 auto',
    ...style,
  };

  const logoStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    color: textColor,
    fontSize: '20px',
    fontWeight: '600',
  };

  const navStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
    listStyle: 'none',
    margin: 0,
    padding: 0,
  };

  const navItemStyle: CSSProperties = {
    color: textSecondaryColor,
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'color 0.2s ease',
    cursor: 'pointer',
  };

  const actionsStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  };

  const primaryButtonStyle: CSSProperties = {
    backgroundColor: buttonPrimaryBackground,
    color: buttonPrimaryText,
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
  };

  const secondaryButtonStyle: CSSProperties = {
    backgroundColor: buttonSecondaryBackground || 'transparent',
    color: buttonSecondaryText,
    border: `1px solid ${buttonSecondaryBorder}`,
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (homeUrl && homeUrl !== '#') {
      window.open(homeUrl, '_self');
    }
  };

  const handleNavClick = (item: string, index: number) => {
    console.log(`Navigate to: ${item}`);
    // In a real app, this would handle navigation
  };

  const handlePrimaryAction = (e: React.MouseEvent) => {
    e.preventDefault();
    if (primaryActionUrl && primaryActionUrl !== '#') {
      window.open(primaryActionUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSecondaryAction = (e: React.MouseEvent) => {
    e.preventDefault();
    if (secondaryActionUrl && secondaryActionUrl !== '#') {
      window.open(secondaryActionUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <header style={headerStyle} {...otherProps}>
      {/* Logo */}
      <a
        href={homeUrl}
        onClick={handleLogoClick}
        style={logoStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '0.8';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '1';
        }}
      >
        {logoUrl ? (
          <img
            src={logoUrl.src || logoUrl}
            alt={logoText}
            style={{
              height: '32px',
              width: 'auto',
              objectFit: 'contain',
              marginRight: '8px',
            }}
          />
        ) : (
          logoText
        )}
      </a>

      {/* Navigation */}
      {showNavigation && navItems.length > 0 && (
        <nav>
          <ul style={navStyle}>
            {navItems.map((item, index) => (
              <li key={index}>
                <a
                  href="#"
                  onClick={() => handleNavClick(item, index)}
                  style={navItemStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = textColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = textSecondaryColor;
                  }}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Actions */}
      {showActions && (
        <div style={actionsStyle}>
          <a
            href={secondaryActionUrl}
            style={secondaryButtonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = textColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = buttonSecondaryBackground || 'transparent';
            }}
          >
            {secondaryAction}
          </a>
          <a
            href={primaryActionUrl}
            style={primaryButtonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {primaryAction}
          </a>
        </div>
      )}
    </header>
  );
}

// Property Controls
addPropertyControls(HeaderFramer, {
  // === COLORS ===
  backgroundColor: { 
    type: ControlType.Color, 
    title: "Background", 
    defaultValue: "#FFFFFF",
    description: "Header background color"
  },
  textColor: { 
    type: ControlType.Color, 
    title: "Text Color", 
    defaultValue: "#111827",
    description: "Primary text color for logo"
  },
  textSecondaryColor: { 
    type: ControlType.Color, 
    title: "Nav Text Color", 
    defaultValue: "#6B7280",
    description: "Navigation text color"
  },
  borderColor: { 
    type: ControlType.Color, 
    title: "Border Color", 
    defaultValue: "#E5E7EB",
    description: "Bottom border color"
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
  logoText: { type: ControlType.String, title: "Logo Text", defaultValue: "Replo" },
  logoUrl: { type: ControlType.ResponsiveImage, title: "Logo Image" },
  homeUrl: { type: ControlType.String, title: "Home URL", defaultValue: "/" },

  // === NAVIGATION ===
  showNavigation: { type: ControlType.Boolean, title: "Show Navigation", defaultValue: true },
  navItems: { 
    type: ControlType.Array,
    title: "Navigation Items",
    control: { type: ControlType.String },
    defaultValue: ['Navigation1', 'Navigation2', 'Navigation3', 'Navigation4'],
    hidden: (props: any) => !props.showNavigation
  },

  // === ACTIONS ===
  showActions: { type: ControlType.Boolean, title: "Show Actions", defaultValue: true },
  primaryAction: { type: ControlType.String, title: "Primary Action", defaultValue: "Call to action", hidden: (props: any) => !props.showActions },
  secondaryAction: { type: ControlType.String, title: "Secondary Action", defaultValue: "Call to action", hidden: (props: any) => !props.showActions },
  primaryActionUrl: { type: ControlType.String, title: "Primary URL", defaultValue: "#", hidden: (props: any) => !props.showActions },
  secondaryActionUrl: { type: ControlType.String, title: "Secondary URL", defaultValue: "#", hidden: (props: any) => !props.showActions },

  // === LAYOUT ===
  maxWidth: { type: ControlType.String, title: "Max Width", defaultValue: "100%" },
  padding: { type: ControlType.String, title: "Padding", defaultValue: "16px 32px" },
}); 