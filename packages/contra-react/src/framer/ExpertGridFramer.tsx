import React from 'react';
import { ContraProvider } from '../components/ContraProvider';
import { ExpertGrid } from '../components/ExpertGrid';
import { useExperts } from '../hooks/useExperts';
import type { ExpertFilters } from '@contra/types';

// Framer types
declare const addPropertyControls: any;
declare const ControlType: any;
declare const RenderTarget: any;

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any-prefer-fixed
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 800
 */
export function ExpertGridFramer(props: any) {
  // Detect if we're on Canvas for performance optimization
  const isCanvas = typeof RenderTarget !== 'undefined' && RenderTarget.current() === RenderTarget.canvas;
  
  // Build filters from props
  const filters: ExpertFilters = {};
  
  if (props.filterAvailable) filters.available = true;
  if (props.filterLocation) filters.location = props.filterLocation;
  if (props.filterLanguages?.length > 0) filters.languages = props.filterLanguages;
  if (props.filterMinRate > 0) filters.minRate = props.filterMinRate;
  if (props.filterMaxRate < 1000) filters.maxRate = props.filterMaxRate;
  if (props.sortBy) filters.sortBy = props.sortBy;
  filters.limit = props.limit;

  // Configuration
  const config = {
    apiKey: props.apiKey,
    program: props.programId,
    debug: props.debug,
    videoAutoplay: props.videoAutoplay,
    videoHoverPlay: props.videoHoverPlay,
    videoMuted: props.videoMuted,
    videoLoop: props.videoLoop,
    videoControls: props.videoControls,
  };

  // Use placeholder data on canvas for better performance
  if (isCanvas && props.useCanvasData) {
    return (
      <ExpertGridPlaceholder
        columns={props.columns}
        gap={props.gap}
        count={props.canvasItemCount}
      />
    );
  }

  return (
    <ContraProvider config={config}>
      <ExpertGridContent
        programId={props.programId}
        filters={filters}
        columns={props.columns}
        gap={props.gap}
        showProjects={props.showProjects}
        maxProjects={props.maxProjects}
        showStats={props.showStats}
        showAvailability={props.showAvailability}
        showRate={props.showRate}
        showActions={props.showActions}
        enableInfiniteScroll={props.enableInfiniteScroll}
      />
    </ContraProvider>
  );
}

// Inner component that uses hooks
function ExpertGridContent(props: any) {
  const {
    experts,
    loading,
    error,
    hasMore,
    loadMore
  } = useExperts({
    programId: props.programId,
    filters: props.filters,
  });

  return (
    <ExpertGrid
      experts={experts}
      columns={props.columns}
      gap={props.gap}
      loading={loading}
      error={error}
      hasMore={hasMore && props.enableInfiniteScroll}
      onLoadMore={props.enableInfiniteScroll ? loadMore : undefined}
      cardProps={{
        showProjects: props.showProjects,
        maxProjects: props.maxProjects,
        showStats: props.showStats,
        showAvailability: props.showAvailability,
        showRate: props.showRate,
        showActions: props.showActions,
      }}
    />
  );
}

// Placeholder component for canvas
function ExpertGridPlaceholder({ columns, gap, count }: any) {
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: columns === 'auto' 
      ? 'repeat(auto-fill, minmax(320px, 1fr))'
      : `repeat(${columns}, 1fr)`,
    gap,
  };

  return (
    <div style={gridStyle}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
            borderRadius: '16px',
            height: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            color: '#6b7280',
          }}
        >
          Expert {i + 1}
        </div>
      ))}
    </div>
  );
}

// Add Property Controls
if (typeof addPropertyControls !== 'undefined' && typeof ControlType !== 'undefined') {
  addPropertyControls(ExpertGridFramer, {
    // API Configuration
    apiKey: {
      type: ControlType.String,
      title: "API Key",
      defaultValue: "",
      description: "Your Contra API key",
    },
    programId: {
      type: ControlType.String,
      title: "Program ID",
      defaultValue: "",
      description: "Your Contra program ID",
    },
    debug: {
      type: ControlType.Boolean,
      title: "Debug Mode",
      defaultValue: false,
      description: "Enable console logging",
    },
    
    // Layout
    columns: {
      type: ControlType.Enum,
      title: "Columns",
      options: ["auto", "1", "2", "3", "4"],
      optionTitles: ["Auto", "1", "2", "3", "4"],
      defaultValue: "auto",
    },
    gap: {
      type: ControlType.String,
      title: "Gap",
      defaultValue: "1.5rem",
      description: "Space between cards",
    },
    limit: {
      type: ControlType.Number,
      title: "Items per Page",
      defaultValue: 20,
      min: 1,
      max: 100,
      step: 1,
    },
    
    // Filtering
    sortBy: {
      type: ControlType.Enum,
      title: "Sort By",
      options: ["", "relevance", "newest", "oldest"],
      optionTitles: ["Default", "Relevance", "Newest", "Oldest"],
      defaultValue: "",
    },
    filterAvailable: {
      type: ControlType.Boolean,
      title: "Available Only",
      defaultValue: false,
    },
    filterLocation: {
      type: ControlType.String,
      title: "Location Filter",
      defaultValue: "",
      placeholder: "e.g. San Francisco",
    },
    filterLanguages: {
      type: ControlType.Array,
      title: "Languages",
      control: {
        type: ControlType.String,
      },
      defaultValue: [],
    },
    filterMinRate: {
      type: ControlType.Number,
      title: "Min Rate",
      defaultValue: 0,
      min: 0,
      max: 1000,
      step: 10,
      displayStepper: true,
    },
    filterMaxRate: {
      type: ControlType.Number,
      title: "Max Rate",
      defaultValue: 1000,
      min: 0,
      max: 1000,
      step: 10,
      displayStepper: true,
    },
    
    // Display Options
    showProjects: {
      type: ControlType.Boolean,
      title: "Show Projects",
      defaultValue: true,
    },
    maxProjects: {
      type: ControlType.Number,
      title: "Max Projects",
      defaultValue: 4,
      min: 1,
      max: 8,
      step: 1,
      hidden: (props: any) => !props.showProjects,
    },
    showStats: {
      type: ControlType.Boolean,
      title: "Show Stats",
      defaultValue: true,
    },
    showAvailability: {
      type: ControlType.Boolean,
      title: "Show Availability",
      defaultValue: true,
    },
    showRate: {
      type: ControlType.Boolean,
      title: "Show Rate",
      defaultValue: true,
    },
    showActions: {
      type: ControlType.Boolean,
      title: "Show Actions",
      defaultValue: true,
    },
    
    // Video Configuration
    videoAutoplay: {
      type: ControlType.Boolean,
      title: "Video Autoplay",
      defaultValue: false,
      description: "Auto-play project videos",
    },
    videoHoverPlay: {
      type: ControlType.Boolean,
      title: "Video Hover Play",
      defaultValue: true,
      description: "Play videos on hover",
      hidden: (props: any) => props.videoAutoplay,
    },
    videoMuted: {
      type: ControlType.Boolean,
      title: "Video Muted",
      defaultValue: true,
      description: "Mute video playback",
    },
    videoLoop: {
      type: ControlType.Boolean,
      title: "Video Loop",
      defaultValue: true,
      description: "Loop video playback",
    },
    videoControls: {
      type: ControlType.Boolean,
      title: "Video Controls",
      defaultValue: false,
      description: "Show video controls",
    },
    
    // Performance
    enableInfiniteScroll: {
      type: ControlType.Boolean,
      title: "Infinite Scroll",
      defaultValue: true,
      description: "Load more experts on scroll",
    },
    useCanvasData: {
      type: ControlType.Boolean,
      title: "Use Canvas Data",
      defaultValue: true,
      description: "Show placeholder data on canvas",
    },
    canvasItemCount: {
      type: ControlType.Number,
      title: "Canvas Items",
      defaultValue: 6,
      min: 1,
      max: 20,
      step: 1,
      hidden: (props: any) => !props.useCanvasData,
    },
  });
} 