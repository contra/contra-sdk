// Core exports
export * from './components/ContraProvider';
export { ExpertCard } from './components/ExpertCard';
export type { ExpertCardProps } from './components/ExpertCard';
export * from './components/ExpertGrid';
export * from './components/ExpertList';
export * from './components/FilterPanel';
export * from './components/StarRating';
export { MediaRenderer } from './components/MediaRenderer';

// Framer-specific exports
export * from './framer/ExpertCardFramer';
export * from './framer/ExpertGridFramer';
export * from './framer/ExpertListFramer';
export * from './framer/FilterPanelFramer';

// Hooks
export * from './hooks/useContra';
export * from './hooks/useExperts';
export * from './hooks/useFilters';
export * from './hooks/useMediaDetection';

// Utilities
export * from './utils/formatting';
export { detectMediaType, extractVideoThumbnail, getMediaErrorPlaceholder } from './utils/media';

// Re-export types
export type * from '@contra/types'; 