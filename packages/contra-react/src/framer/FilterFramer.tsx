import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { CSSProperties } from 'react';
import { addPropertyControls, ControlType } from "framer"
import { motion, AnimatePresence } from "framer-motion"

// Types
interface FilterState {
  sortBy: string;
  minRate: number;
  maxRate: number;
  location: string;
  languages: string[];
  available?: boolean;
}

// Modern Dropdown Component with inline expansion
function ModernDropdown({ 
  value, 
  options, 
  onChange, 
  placeholder = "Select...",
  colors
}: {
  value: string;
  options: Array<{label: string, value: string}>;
  onChange: (value: string) => void;
  placeholder?: string;
  colors: any;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div 
      ref={dropdownRef} 
      style={{ 
        position: 'relative',
        width: '100%',
      }}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '16px',
          backgroundColor: colors.inputBackground,
          border: `1px solid ${colors.inputBorder}`,
          borderRadius: isOpen ? '8px 8px 0 0' : '8px',
          fontSize: '16px',
          color: colors.textColor,
          textAlign: 'left',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          outline: 'none',
          transition: 'all 0.2s ease',
          borderBottomColor: isOpen ? 'transparent' : colors.inputBorder,
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {selectedOption?.label || placeholder}
        </span>
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 16 16" 
          fill="none"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            flexShrink: 0,
          }}
        >
          <path 
            d="M4 6L8 10L12 6" 
            stroke={colors.textMutedColor} 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </button>
      
      {/* Inline dropdown options that push content down */}
      <div
            style={{
          width: '100%',
              backgroundColor: colors.backgroundColor,
          border: isOpen ? `1px solid ${colors.inputBorder}` : 'none',
          borderTop: 'none',
          borderRadius: '0 0 8px 8px',
          maxHeight: isOpen ? '200px' : '0',
          overflowY: isOpen ? 'auto' : 'hidden',
          transition: 'max-height 0.3s ease, border 0.2s ease',
          WebkitOverflowScrolling: 'touch',
          boxShadow: isOpen ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
            }}
          >
        {options.map((option) => (
          <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
              backgroundColor: value === option.value ? colors.hoverBackground : 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  fontSize: '16px',
                  color: colors.textColor,
                  cursor: 'pointer',
                  outline: 'none',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              transition: 'background-color 0.2s ease',
              borderBottom: `1px solid ${colors.inputBorder}20`,
            }}
            onMouseEnter={(e) => {
              if (value !== option.value) {
                e.currentTarget.style.backgroundColor = colors.hoverBackground;
              }
            }}
            onMouseLeave={(e) => {
              if (value !== option.value) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
                }}
              >
                {option.label}
            {value === option.value && (
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 16 16" 
                fill="none"
                style={{ marginLeft: 'auto', flexShrink: 0 }}
              >
                <path 
                  d="M13 4L6 11L3 8" 
                  stroke={colors.sliderActive} 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
            ))}
      </div>
    </div>
  );
}

// Modern Range Slider Component
function ModernRangeSlider({ 
  min, 
  max, 
  value, 
  onChange, 
  colors,
  step = 1 
}: {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  colors: any;
  step?: number;
}) {
  const [minVal, maxVal] = value;
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const getPercent = useCallback((value: number) => 
    Math.round(((value - min) / (max - min)) * 100), [min, max]);

  const minPercent = getPercent(minVal);
  const maxPercent = getPercent(maxVal);

  const getValueFromPosition = (clientX: number) => {
    if (!sliderRef.current) return minVal;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const rawValue = min + percent * (max - min);
    return Math.round(rawValue / step) * step;
  };

  const handleMouseDown = (thumb: 'min' | 'max') => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(thumb);
  };

  const handleTrackClick = (e: React.MouseEvent) => {
    if (isDragging) return;
    
    const newValue = getValueFromPosition(e.clientX);
    const minDistance = Math.abs(newValue - minVal);
    const maxDistance = Math.abs(newValue - maxVal);
    
    if (minDistance < maxDistance) {
      const newMin = Math.min(newValue, maxVal - step);
      onChange([newMin, maxVal]);
    } else {
      const newMax = Math.max(newValue, minVal + step);
    onChange([minVal, newMax]);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const newValue = getValueFromPosition(e.clientX);

      if (isDragging === 'min') {
        const newMin = Math.min(newValue, maxVal - step);
        const clampedMin = Math.max(min, Math.min(newMin, max));
        onChange([clampedMin, maxVal]);
      } else if (isDragging === 'max') {
        const newMax = Math.max(newValue, minVal + step);
        const clampedMax = Math.max(min, Math.min(newMax, max));
        onChange([minVal, clampedMax]);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(null);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isDragging, minVal, maxVal, min, max, step, onChange]);

  return (
      <div style={{
      position: 'relative', 
      margin: '20px 0',
      isolation: 'isolate', // Prevent stacking context issues
    }}>
      {/* Track */}
      <div 
        ref={sliderRef}
        onClick={handleTrackClick}
        style={{
        height: '4px',
        backgroundColor: colors.sliderTrack,
        borderRadius: '2px',
        position: 'relative',
          cursor: 'pointer',
        }}
      >
        {/* Active range */}
        <div 
          style={{
            height: '4px',
            backgroundColor: colors.sliderActive,
            borderRadius: '2px',
            position: 'absolute',
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
            pointerEvents: 'none',
          }} 
        />
      </div>

      {/* Min Thumb */}
      <div
        onMouseDown={handleMouseDown('min')}
        style={{
          position: 'absolute',
          top: '-8px',
          left: `${minPercent}%`,
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: colors.sliderThumb,
          border: '3px solid #ffffff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          cursor: isDragging === 'min' ? 'grabbing' : 'grab',
          transition: isDragging === 'min' ? 'none' : 'transform 0.2s ease',
          transform: `translateX(-50%) ${isDragging === 'min' ? 'scale(1.2)' : 'scale(1)'}`,
          zIndex: isDragging === 'min' ? 3 : 2,
        }}
      />

      {/* Max Thumb */}
      <div
        onMouseDown={handleMouseDown('max')}
        style={{
          position: 'absolute',
          top: '-8px',
          left: `${maxPercent}%`,
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: colors.sliderThumb,
          border: '3px solid #ffffff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          cursor: isDragging === 'max' ? 'grabbing' : 'grab',
          transition: isDragging === 'max' ? 'none' : 'transform 0.2s ease',
          transform: `translateX(-50%) ${isDragging === 'max' ? 'scale(1.2)' : 'scale(1)'}`,
          zIndex: isDragging === 'max' ? 3 : 1,
        }}
      />
    </div>
  );
}

/**
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 120
 * @framerIntrinsicHeight 48
 */
export default function FilterFramer(props: any) {
  const {
    // Button Theme Colors
    buttonBackgroundColor,
    buttonBorderColor,
    buttonTextColor,
    buttonIconColor,
    buttonHoverBackground,
    
    // Modal Theme Colors
    modalBackgroundColor,
    modalBorderColor,
    modalTextColor,
    modalTextMutedColor,
    modalInputBackground,
    modalInputBorder,
    modalSliderTrack,
    modalSliderActive,
    modalSliderThumb,
    modalButtonPrimaryBackground,
    modalButtonPrimaryText,
    modalOverlayColor,
    modalHoverBackground,
    
    // Button Content
    buttonText = 'Filters',
    showButtonIcon = true,
    
    // Button Styling
    buttonBorderRadius = '24px',
    buttonPadding = '12px 20px',
    buttonFontSize = '16px',
    buttonFontWeight = '500',
    
    // Filter Options
    minRateLimit = 0,
    maxRateLimit = 1000,
    defaultMinRate = 25,
    defaultMaxRate = 500,
    
    // Animation Settings
    enableAnimations = true,
    animationDuration = 0.3,
    animationEasing = "easeOut",
    
    // Theme Detection
    isDarkMode = false,
    
    // Framer props
    style,
    width,
    height,
    ...otherProps
  } = props;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    sortBy: 'relevance',
    minRate: defaultMinRate,
    maxRate: defaultMaxRate,
    location: '',
    languages: [],
  });

  // Color system
  const colors = {
    // Button colors
    buttonBackground: buttonBackgroundColor || '#FFFFFF',
    buttonBorder: buttonBorderColor || '#E5E7EB',
    buttonText: buttonTextColor || '#374151',
    buttonIcon: buttonIconColor || buttonTextColor || '#374151',
    buttonHover: buttonHoverBackground || '#F9FAFB',
    
    // Modal colors
    backgroundColor: modalBackgroundColor || (isDarkMode ? '#1F2937' : '#FFFFFF'),
    borderColor: modalBorderColor || (isDarkMode ? '#374151' : '#E5E7EB'),
    textColor: modalTextColor || (isDarkMode ? '#F9FAFB' : '#111827'),
    textMutedColor: modalTextMutedColor || (isDarkMode ? '#9CA3AF' : '#6B7280'),
    inputBackground: modalInputBackground || (isDarkMode ? '#111827' : '#FFFFFF'),
    inputBorder: modalInputBorder || (isDarkMode ? '#374151' : '#D1D5DB'),
    sliderTrack: modalSliderTrack || (isDarkMode ? '#374151' : '#E5E7EB'),
    sliderActive: modalSliderActive || (isDarkMode ? '#F9FAFB' : '#111827'),
    sliderThumb: modalSliderThumb || (isDarkMode ? '#F9FAFB' : '#111827'),
    buttonPrimaryBackground: modalButtonPrimaryBackground || (isDarkMode ? '#F9FAFB' : '#111827'),
    buttonPrimaryText: modalButtonPrimaryText || (isDarkMode ? '#111827' : '#FFFFFF'),
    overlayColor: modalOverlayColor || 'rgba(0, 0, 0, 0.5)',
    hoverBackground: modalHoverBackground || (isDarkMode ? '#374151' : '#F9FAFB'),
  };

  // Handlers
  const handleButtonClick = () => setIsModalOpen(true);
  const handleModalClose = () => setIsModalOpen(false);
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleModalClose();
  };

  const handleSaveFilters = () => {
    const event = new CustomEvent('contra:filterChange', {
      detail: { filters }
    });
    window.dispatchEvent(event);
    handleModalClose();
  };

  const handleClearFilters = () => {
    setFilters({
      sortBy: 'relevance',
      minRate: defaultMinRate,
      maxRate: defaultMaxRate,
      location: '',
      languages: [],
    });
  };

  // Options
  const sortOptions = [
    { label: 'Relevance', value: 'relevance' },
    { label: 'Newest', value: 'newest' },
    { label: 'Oldest', value: 'oldest' },
  ];

  const languageOptions = [
    { label: 'English', value: 'english' },
    { label: 'Spanish', value: 'spanish' },
    { label: 'French', value: 'french' },
    { label: 'German', value: 'german' },
    { label: 'Italian', value: 'italian' },
    { label: 'Portuguese', value: 'portuguese' },
    { label: 'Mandarin', value: 'mandarin' },
    { label: 'Japanese', value: 'japanese' },
  ];

  return (
    <>
      {/* Filter Button */}
      <motion.button
        style={{
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    backgroundColor: colors.buttonBackground,
    border: `1px solid ${colors.buttonBorder}`,
    borderRadius: buttonBorderRadius,
    padding: buttonPadding,
    fontSize: buttonFontSize,
    fontWeight: buttonFontWeight,
    color: colors.buttonText,
    cursor: 'pointer',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    outline: 'none',
    userSelect: 'none',
    width: width || 'auto',
    height: height || 'auto',
    ...style,
        }}
        onClick={handleButtonClick}
        whileHover={enableAnimations ? { 
          scale: 1.05, 
          backgroundColor: colors.buttonHover,
        } : {}}
        whileTap={enableAnimations ? { scale: 0.95 } : {}}
        {...otherProps}
      >
        {showButtonIcon && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            width: '16px',
            height: '12px',
          }}>
            <div style={{ width: '16px', height: '2px', backgroundColor: colors.buttonIcon, borderRadius: '1px' }} />
            <div style={{ width: '12px', height: '2px', backgroundColor: colors.buttonIcon, borderRadius: '1px' }} />
            <div style={{ width: '8px', height: '2px', backgroundColor: colors.buttonIcon, borderRadius: '1px' }} />
          </div>
        )}
        {buttonText}
      </motion.button>

      {/* Filter Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: colors.overlayColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 50000, // Very high z-index for modal
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
            onClick={handleBackdropClick}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              style={{
                backgroundColor: colors.backgroundColor,
                borderRadius: '16px',
                padding: '0', // Remove padding to control it internally
                width: '90%',
                maxWidth: '600px',
                maxHeight: '90vh',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden', // Prevent any overflow issues
              }}
            >
              {/* Fixed Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                padding: '32px 32px 0 32px',
                borderBottom: `1px solid ${colors.borderColor}`,
                paddingBottom: '20px',
                marginBottom: '0',
                }}>
                <h2 style={{
                      margin: 0,
                      fontSize: '24px',
                      fontWeight: '600',
                      color: colors.textColor,
                }}>
                    Filters
                </h2>
                <button
                    onClick={handleModalClose}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '24px',
                      color: colors.textMutedColor,
                      cursor: 'pointer',
                      padding: '8px',
                      borderRadius: '4px',
                      outline: 'none',
                    minWidth: '44px',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.hoverBackground;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    ×
                </button>
                </div>

              {/* Scrollable Content */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '32px',
                WebkitOverflowScrolling: 'touch',
              }}>
                {/* Sort by */}
                <div style={{ marginBottom: '32px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '12px',
                    fontSize: '16px',
                    fontWeight: '500',
                    color: colors.textColor,
                  }}>
                    Sort by
                  </label>
                  <ModernDropdown
                    value={filters.sortBy}
                    options={sortOptions}
                    onChange={(value) => setFilters({ ...filters, sortBy: value })}
                    colors={colors}
                  />
                </div>

                {/* Hourly rate */}
                <div style={{ marginBottom: '32px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '12px',
                    fontSize: '16px',
                    fontWeight: '500',
                    color: colors.textColor,
                  }}>
                    Hourly rate
                  </label>
                  
                  <ModernRangeSlider
                    min={minRateLimit}
                    max={maxRateLimit}
                    value={[filters.minRate, filters.maxRate]}
                    onChange={([minRate, maxRate]) => setFilters({ ...filters, minRate, maxRate })}
                    colors={colors}
                    step={5}
                  />

                  <div style={{
                      display: 'flex',
                      gap: '16px',
                      marginTop: '16px',
                  }}>
                    <div style={{ flex: 1 }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: colors.textMutedColor,
                      }}>
                        Minimum
                      </label>
                      <div style={{
                          backgroundColor: colors.inputBackground,
                          border: `1px solid ${colors.inputBorder}`,
                          borderRadius: '8px',
                          padding: '16px',
                          fontSize: '16px',
                          color: colors.textColor,
                          display: 'flex',
                          alignItems: 'center',
                      }}>
                        ${filters.minRate}
                      </div>
                    </div>

                    <div style={{
                      width: '40px',
                      height: '1px',
                      backgroundColor: colors.inputBorder,
                      alignSelf: 'center',
                      marginTop: '20px',
                    }} />

                    <div style={{ flex: 1 }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: colors.textMutedColor,
                      }}>
                        Maximum
                      </label>
                      <div style={{
                          backgroundColor: colors.inputBackground,
                          border: `1px solid ${colors.inputBorder}`,
                          borderRadius: '8px',
                          padding: '16px',
                          fontSize: '16px',
                          color: colors.textColor,
                          display: 'flex',
                          alignItems: 'center',
                      }}>
                        ${filters.maxRate}{filters.maxRate >= maxRateLimit ? '+' : ''}
                    </div>
                    </div>
                  </div>
                </div>

                {/* Location and Languages */}
                <div style={{
                    display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '24px',
                  marginBottom: '32px',
                }}>
                  {/* Location */}
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '12px',
                      fontSize: '16px',
                      fontWeight: '500',
                      color: colors.textColor,
                    }}>
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. San Francisco"
                      value={filters.location}
                      onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '16px',
                        backgroundColor: colors.inputBackground,
                        border: `1px solid ${colors.inputBorder}`,
                        borderRadius: '8px',
                        fontSize: '16px',
                        color: colors.textColor,
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s ease',
                      }}
                    />
                  </div>

                  {/* Languages */}
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '12px',
                      fontSize: '16px',
                      fontWeight: '500',
                      color: colors.textColor,
                    }}>
                      Languages
                    </label>
                    <ModernDropdown
                      value=""
                      options={languageOptions}
                      onChange={(value) => {
                        console.log('Selected language:', value);
                      }}
                      placeholder="Search for languages"
                      colors={colors}
                    />
                  </div>
                </div>
              </div>

              {/* Fixed Footer */}
              <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                padding: '20px 32px 32px 32px',
                borderTop: `1px solid ${colors.borderColor}`,
                gap: '16px',
                flexWrap: 'wrap',
              }}>
                <button
                    onClick={handleClearFilters}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: colors.textColor,
                      fontSize: '16px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      padding: '12px 0',
                      outline: 'none',
                    minHeight: '44px',
                    transition: 'opacity 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.7';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                    }}
                  >
                    Clear all filters
                </button>

                <button
                    onClick={handleSaveFilters}
                    style={{
                      backgroundColor: colors.buttonPrimaryBackground,
                      color: colors.buttonPrimaryText,
                      border: 'none',
                      borderRadius: '8px',
                      padding: '16px 32px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      outline: 'none',
                    minHeight: '44px',
                    whiteSpace: 'nowrap',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    Save filters
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global styles for mobile responsiveness */}
      <style>{`
        @media (max-width: 768px) {
          /* Mobile adjustments would go here if needed */
        }
      `}</style>
    </>
  );
}

// Property Controls
addPropertyControls(FilterFramer, {
  // === BUTTON COLORS ===
  buttonBackgroundColor: { 
    type: ControlType.Color, 
    title: "Button Background", 
    defaultValue: "#FFFFFF",
    description: "Filter button background color"
  },
  buttonBorderColor: { 
    type: ControlType.Color, 
    title: "Button Border", 
    defaultValue: "#E5E7EB",
    description: "Filter button border color"
  },
  buttonTextColor: { 
    type: ControlType.Color, 
    title: "Button Text", 
    defaultValue: "#374151",
    description: "Filter button text color"
  },
  buttonIconColor: { 
    type: ControlType.Color, 
    title: "Button Icon", 
    defaultValue: "#374151",
    description: "Hamburger icon color"
  },
  buttonHoverBackground: { 
    type: ControlType.Color, 
    title: "Button Hover", 
    defaultValue: "#F9FAFB",
    description: "Filter button hover background"
  },

  // === MODAL COLORS ===
  modalBackgroundColor: { 
    type: ControlType.Color, 
    title: "Modal Background", 
    defaultValue: "#FFFFFF",
    description: "Modal background color"
  },
  modalTextColor: { 
    type: ControlType.Color, 
    title: "Modal Text", 
    defaultValue: "#111827",
    description: "Modal primary text color"
  },
  modalTextMutedColor: { 
    type: ControlType.Color, 
    title: "Modal Muted Text", 
    defaultValue: "#6B7280",
    description: "Modal muted text color"
  },
  modalInputBackground: { 
    type: ControlType.Color, 
    title: "Input Background", 
    defaultValue: "#FFFFFF",
    description: "Modal input field background"
  },
  modalInputBorder: { 
    type: ControlType.Color, 
    title: "Input Border", 
    defaultValue: "#D1D5DB",
    description: "Modal input field border"
  },
  modalSliderTrack: { 
    type: ControlType.Color, 
    title: "Slider Track", 
    defaultValue: "#E5E7EB",
    description: "Range slider track color"
  },
  modalSliderActive: { 
    type: ControlType.Color, 
    title: "Slider Active", 
    defaultValue: "#111827",
    description: "Range slider active color"
  },
  modalSliderThumb: { 
    type: ControlType.Color, 
    title: "Slider Thumb", 
    defaultValue: "#111827",
    description: "Range slider thumb color"
  },
  modalButtonPrimaryBackground: { 
    type: ControlType.Color, 
    title: "Save Button Background", 
    defaultValue: "#111827",
    description: "Save button background"
  },
  modalButtonPrimaryText: { 
    type: ControlType.Color, 
    title: "Save Button Text", 
    defaultValue: "#FFFFFF",
    description: "Save button text"
  },
  modalOverlayColor: { 
    type: ControlType.Color, 
    title: "Modal Overlay", 
    defaultValue: "rgba(0, 0, 0, 0.5)",
    description: "Modal overlay background"
  },
  modalHoverBackground: { 
    type: ControlType.Color, 
    title: "Modal Hover Background", 
    defaultValue: "#F9FAFB",
    description: "Modal hover background color for interactive elements"
  },

  // === BUTTON CONTENT ===
  buttonText: { 
    type: ControlType.String, 
    title: "Button Text", 
    defaultValue: "Filters",
    description: "Text displayed in the filter button"
  },
  showButtonIcon: { 
    type: ControlType.Boolean, 
    title: "Show Button Icon", 
    defaultValue: true,
    description: "Show hamburger menu icon in button"
  },

  // === BUTTON STYLING ===
  buttonBorderRadius: { 
    type: ControlType.String, 
    title: "Button Border Radius", 
    defaultValue: "24px",
    description: "Filter button border radius"
  },
  buttonPadding: { 
    type: ControlType.String, 
    title: "Button Padding", 
    defaultValue: "12px 20px",
    description: "Filter button padding"
  },
  buttonFontSize: { 
    type: ControlType.String, 
    title: "Button Font Size", 
    defaultValue: "16px",
    description: "Filter button font size"
  },
  buttonFontWeight: { 
    type: ControlType.String, 
    title: "Button Font Weight", 
    defaultValue: "500",
    description: "Filter button font weight"
  },

  // === FILTER SETTINGS ===
  minRateLimit: { 
    type: ControlType.Number, 
    title: "Min Rate Limit", 
    defaultValue: 0,
    description: "Minimum rate slider limit"
  },
  maxRateLimit: { 
    type: ControlType.Number, 
    title: "Max Rate Limit", 
    defaultValue: 1000,
    description: "Maximum rate slider limit"
  },
  defaultMinRate: { 
    type: ControlType.Number, 
    title: "Default Min Rate", 
    defaultValue: 25,
    description: "Default minimum rate"
  },
  defaultMaxRate: { 
    type: ControlType.Number, 
    title: "Default Max Rate", 
    defaultValue: 500,
    description: "Default maximum rate"
  },

  // === ANIMATION SETTINGS ===
  enableAnimations: { 
    type: ControlType.Boolean, 
    title: "Enable Animations", 
    defaultValue: true,
    description: "Enable smooth animations for interactions"
  },
  animationDuration: { 
    type: ControlType.Number, 
    title: "Animation Duration", 
    defaultValue: 0.3,
    min: 0.1,
    max: 1.0,
    step: 0.1,
    hidden: (props: any) => !props.enableAnimations,
    description: "Duration of animations in seconds"
  },
  animationEasing: { 
    type: ControlType.Enum, 
    title: "Animation Easing", 
    options: ["easeOut", "easeIn", "easeInOut", "linear"],
    defaultValue: "easeOut",
    hidden: (props: any) => !props.enableAnimations,
    description: "Animation easing function"
  },

  // === THEME ===
  isDarkMode: { 
    type: ControlType.Boolean, 
    title: "Dark Mode", 
    defaultValue: false,
    description: "Enable dark mode styling"
  },
}); 