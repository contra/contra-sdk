import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { CSSProperties } from 'react';
import { addPropertyControls, ControlType } from "framer"

// --- Inlined Filter Types ---
interface ExpertFilters {
  available?: boolean;
  languages?: string | string[];
  location?: string;
  minRate?: number;
  maxRate?: number;
  sortBy?: 'relevance' | 'oldest' | 'newest';
  limit?: number;
  offset?: number;
  [key: string]: string | number | boolean | string[] | undefined;
}

interface FilterChangeEvent {
  filters: ExpertFilters;
  element: HTMLElement;
}
// --- End Inlined Filter Types ---

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 320
 * @framerIntrinsicHeight 400
 */
export function ExpertFilterFramer(props: any) {
  const {
    // Filter state
    showAvailableFilter = true,
    showLocationFilter = true,
    showLanguageFilter = true,
    showRateFilter = true,
    showSortFilter = true,
    showClearButton = true,
    
    // Filter values
    availableOnly = false,
    location = '',
    languages = [],
    minRate = 0,
    maxRate = 500,
    sortBy = 'relevance',
    
    // Styling
    backgroundColor = '#ffffff',
    borderColor = '#e5e7eb',
    borderRadius = '12px',
    padding = '1.5rem',
    gap = '1rem',
    
    // Labels
    titleText = 'Filter Experts',
    availableLabel = 'Available Only',
    locationLabel = 'Location',
    locationPlaceholder = 'City, State or Country',
    languageLabel = 'Languages',
    rateLabel = 'Hourly Rate Range',
    sortLabel = 'Sort By',
    clearButtonText = 'Clear Filters',
    
    // Event handlers
    onFiltersChange,
    
    // Framer props
    style,
    width,
    height,
    ...otherProps
  } = props;

  // Internal filter state
  const [internalFilters, setInternalFilters] = useState<ExpertFilters>({
    available: availableOnly,
    location: location,
    languages: languages,
    minRate: minRate,
    maxRate: maxRate,
    sortBy: sortBy,
  });

  // Debounced filter change handler - move outside useCallback to avoid recreation
  const debouncedOnChange = useMemo(() => 
    debounce((filters: ExpertFilters) => {
      if (onFiltersChange) {
        onFiltersChange(filters);
      }
      
      // Dispatch custom event for grid component to listen to
      const event = new CustomEvent('contra:filterChange', {
        detail: { filters, element: document.body } as FilterChangeEvent
      });
      window.dispatchEvent(event);
    }, 300),
    [onFiltersChange]
  );

  // Update internal filters and notify
  const updateFilter = useCallback((key: string, value: any) => {
    const newFilters = { ...internalFilters, [key]: value };
    setInternalFilters(newFilters);
    debouncedOnChange(newFilters);
  }, [internalFilters, debouncedOnChange]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    const clearedFilters: ExpertFilters = {
      available: false,
      location: '',
      languages: [],
      minRate: 0,
      maxRate: 500,
      sortBy: 'relevance',
    };
    setInternalFilters(clearedFilters);
    debouncedOnChange(clearedFilters);
  }, [debouncedOnChange]);

  // Sync with prop changes - fix infinite loop by using refs for stable comparison
  const prevProps = useRef({ availableOnly, location, languages, minRate, maxRate, sortBy });
  useEffect(() => {
    const prev = prevProps.current;
    const hasChanged = (
      prev.availableOnly !== availableOnly ||
      prev.location !== location ||
      JSON.stringify(prev.languages) !== JSON.stringify(languages) ||
      prev.minRate !== minRate ||
      prev.maxRate !== maxRate ||
      prev.sortBy !== sortBy
    );

    if (hasChanged) {
      setInternalFilters({
        available: availableOnly,
        location: location,
        languages: languages,
        minRate: minRate,
        maxRate: maxRate,
        sortBy: sortBy,
      });
      
      // Update the ref
      prevProps.current = { availableOnly, location, languages, minRate, maxRate, sortBy };
    }
  }, [availableOnly, location, languages, minRate, maxRate, sortBy]);

  const containerStyle: CSSProperties = {
    backgroundColor,
    border: `1px solid ${borderColor}`,
    borderRadius,
    padding,
    display: 'flex',
    flexDirection: 'column',
    gap,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    width,
    height,
    ...style,
  };

  const titleStyle: CSSProperties = {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: '#111827',
    margin: 0,
    marginBottom: '0.5rem',
  };

  const labelStyle: CSSProperties = {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#374151',
    marginBottom: '0.5rem',
    display: 'block',
  };

  const inputStyle: CSSProperties = {
    width: '100%',
    padding: '0.625rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '0.875rem',
    color: '#111827',
    backgroundColor: '#ffffff',
    transition: 'border-color 0.2s ease',
  };

  const selectStyle: CSSProperties = {
    ...inputStyle,
    cursor: 'pointer',
  };

  const checkboxStyle: CSSProperties = {
    width: '1rem',
    height: '1rem',
    marginRight: '0.5rem',
    cursor: 'pointer',
  };

  const rangeContainerStyle: CSSProperties = {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
  };

  const rangeInputStyle: CSSProperties = {
    flex: 1,
    padding: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '0.875rem',
    textAlign: 'center',
  };

  const clearButtonStyle: CSSProperties = {
    padding: '0.625rem 1rem',
    backgroundColor: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#374151',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'center',
  };

  const languageSelectStyle: CSSProperties = {
    ...selectStyle,
    minHeight: '2.5rem',
  };

  return (
    <div className="contra-expert-filter framer-component" style={containerStyle}>
      <h3 style={titleStyle}>{titleText}</h3>
      
      {showAvailableFilter && (
        <div className="filter-group">
          <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={internalFilters.available || false}
              onChange={(e) => updateFilter('available', e.target.checked)}
              style={checkboxStyle}
            />
            {availableLabel}
          </label>
        </div>
      )}

      {showLocationFilter && (
        <div className="filter-group">
          <label style={labelStyle}>{locationLabel}</label>
          <input
            type="text"
            value={internalFilters.location || ''}
            onChange={(e) => updateFilter('location', e.target.value)}
            placeholder={locationPlaceholder}
            style={inputStyle}
          />
        </div>
      )}

      {showLanguageFilter && (
        <div className="filter-group">
          <label style={labelStyle}>{languageLabel}</label>
          <select
            multiple
            value={Array.isArray(internalFilters.languages) ? internalFilters.languages : []}
            onChange={(e) => {
              const values = Array.from(e.target.selectedOptions, option => option.value);
              updateFilter('languages', values);
            }}
            style={languageSelectStyle}
          >
            <option value="english">English</option>
            <option value="spanish">Spanish</option>
            <option value="french">French</option>
            <option value="german">German</option>
            <option value="italian">Italian</option>
            <option value="portuguese">Portuguese</option>
            <option value="japanese">Japanese</option>
            <option value="korean">Korean</option>
            <option value="chinese">Chinese</option>
            <option value="russian">Russian</option>
            <option value="arabic">Arabic</option>
            <option value="hindi">Hindi</option>
          </select>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
            Hold Ctrl/Cmd to select multiple
          </div>
        </div>
      )}

      {showRateFilter && (
        <div className="filter-group">
          <label style={labelStyle}>{rateLabel}</label>
          <div style={rangeContainerStyle}>
            <input
              type="number"
              value={internalFilters.minRate || 0}
              onChange={(e) => updateFilter('minRate', parseInt(e.target.value) || 0)}
              placeholder="Min"
              min="0"
              max="1000"
              style={rangeInputStyle}
            />
            <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>to</span>
            <input
              type="number"
              value={internalFilters.maxRate || 500}
              onChange={(e) => updateFilter('maxRate', parseInt(e.target.value) || 500)}
              placeholder="Max"
              min="0"
              max="1000"
              style={rangeInputStyle}
            />
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
            ${internalFilters.minRate || 0} - ${internalFilters.maxRate || 500} per hour
          </div>
        </div>
      )}

      {showSortFilter && (
        <div className="filter-group">
          <label style={labelStyle}>{sortLabel}</label>
          <select
            value={internalFilters.sortBy || 'relevance'}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
            style={selectStyle}
          >
            <option value="relevance">Most Relevant</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      )}

      {showClearButton && (
        <button
          onClick={clearFilters}
          style={clearButtonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#e5e7eb';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
          }}
        >
          {clearButtonText}
        </button>
      )}

      <div className="filter-summary" style={{ fontSize: '0.75rem', color: '#6b7280', paddingTop: '0.5rem', borderTop: '1px solid #f3f4f6' }}>
        Active filters: {Object.entries(internalFilters).filter(([_, value]) => {
          if (Array.isArray(value)) return value.length > 0;
          if (typeof value === 'boolean') return value;
          if (typeof value === 'string') return value.trim() !== '';
          if (typeof value === 'number') return value > 0;
          return false;
        }).length}
      </div>
    </div>
  );
}

// Simple debounce utility
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  }) as T;
}

// Property Controls for ExpertFilterFramer
addPropertyControls(ExpertFilterFramer, {
  // Display Options
  showAvailableFilter: { type: ControlType.Boolean, title: "Show Available Filter", defaultValue: true },
  showLocationFilter: { type: ControlType.Boolean, title: "Show Location Filter", defaultValue: true },
  showLanguageFilter: { type: ControlType.Boolean, title: "Show Language Filter", defaultValue: true },
  showRateFilter: { type: ControlType.Boolean, title: "Show Rate Filter", defaultValue: true },
  showSortFilter: { type: ControlType.Boolean, title: "Show Sort Filter", defaultValue: true },
  showClearButton: { type: ControlType.Boolean, title: "Show Clear Button", defaultValue: true },
  
  // Initial Values
  availableOnly: { type: ControlType.Boolean, title: "Available Only", defaultValue: false },
  location: { type: ControlType.String, title: "Default Location", defaultValue: "" },
  languages: { type: ControlType.Array, title: "Default Languages", control: { type: ControlType.String } },
  minRate: { type: ControlType.Number, title: "Min Rate", defaultValue: 0, min: 0, max: 1000, step: 5 },
  maxRate: { type: ControlType.Number, title: "Max Rate", defaultValue: 500, min: 0, max: 1000, step: 5 },
  sortBy: { type: ControlType.Enum, title: "Default Sort", options: ["relevance", "newest", "oldest"], optionTitles: ["Most Relevant", "Newest First", "Oldest First"], defaultValue: "relevance" },
  
  // Styling
  backgroundColor: { type: ControlType.Color, title: "Background Color", defaultValue: "#ffffff" },
  borderColor: { type: ControlType.Color, title: "Border Color", defaultValue: "#e5e7eb" },
  borderRadius: { type: ControlType.String, title: "Border Radius", defaultValue: "12px" },
  padding: { type: ControlType.String, title: "Padding", defaultValue: "1.5rem" },
  gap: { type: ControlType.String, title: "Gap", defaultValue: "1rem" },
  
  // Labels
  titleText: { type: ControlType.String, title: "Title Text", defaultValue: "Filter Experts" },
  availableLabel: { type: ControlType.String, title: "Available Label", defaultValue: "Available Only" },
  locationLabel: { type: ControlType.String, title: "Location Label", defaultValue: "Location" },
  locationPlaceholder: { type: ControlType.String, title: "Location Placeholder", defaultValue: "City, State or Country" },
  languageLabel: { type: ControlType.String, title: "Language Label", defaultValue: "Languages" },
  rateLabel: { type: ControlType.String, title: "Rate Label", defaultValue: "Hourly Rate Range" },
  sortLabel: { type: ControlType.String, title: "Sort Label", defaultValue: "Sort By" },
  clearButtonText: { type: ControlType.String, title: "Clear Button Text", defaultValue: "Clear Filters" },
}); 