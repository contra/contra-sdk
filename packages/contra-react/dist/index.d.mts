import * as react_jsx_runtime from 'react/jsx-runtime';
import React, { ReactNode, CSSProperties } from 'react';
import * as _contra_client from '@contra/client';
import { ContraClient } from '@contra/client';
import { ClientConfig, ExpertProfile, ExpertFilters, ListResponse } from '@contra/types';
export * from '@contra/types';

/**
 * Enterprise-grade Context Provider for Contra SDK
 * Manages configuration, client instance, and global state
 */
interface ContraConfig extends ClientConfig {
    videoAutoplay?: boolean;
    videoHoverPlay?: boolean;
    videoMuted?: boolean;
    videoLoop?: boolean;
    videoControls?: boolean;
    enableVirtualization?: boolean;
    cacheStrategy?: 'aggressive' | 'normal' | 'minimal';
    theme?: 'light' | 'dark' | 'auto';
    locale?: string;
}
interface ContraContextValue {
    client: ContraClient;
    config: ContraConfig;
    isInitialized: boolean;
}
interface ContraProviderProps {
    config: ContraConfig;
    children: ReactNode;
}
/**
 * ContraProvider - Root provider for all Contra components
 *
 * @example
 * ```tsx
 * <ContraProvider config={{ apiKey: 'your-key', program: 'your-program' }}>
 *   <ExpertGrid />
 * </ContraProvider>
 * ```
 */
declare function ContraProvider({ config, children }: ContraProviderProps): react_jsx_runtime.JSX.Element;
/**
 * Hook to access Contra context
 * Throws if used outside of ContraProvider
 */
declare function useContraContext(): ContraContextValue;

interface ExpertCardProps {
    expert: ExpertProfile;
    layout?: 'vertical' | 'horizontal';
    showProjects?: boolean;
    maxProjects?: number;
    showStats?: boolean;
    showAvailability?: boolean;
    showRate?: boolean;
    showActions?: boolean;
    className?: string;
    style?: CSSProperties;
    onContactClick?: () => void;
    onProfileClick?: () => void;
}
/**
 * Professional Expert Card Component
 * Displays comprehensive expert information with flexible layout options
 */
declare function ExpertCard({ expert, layout, showProjects, maxProjects, showStats, showAvailability, showRate, showActions, className, style, onContactClick, onProfileClick, }: ExpertCardProps): react_jsx_runtime.JSX.Element;

interface ExpertGridProps {
    experts: ExpertProfile[];
    columns?: number | 'auto';
    gap?: string | number;
    loading?: boolean;
    error?: Error | null;
    emptyMessage?: string;
    loadingComponent?: React.ReactNode;
    errorComponent?: React.ReactNode;
    emptyComponent?: React.ReactNode;
    className?: string;
    style?: CSSProperties;
    cardProps?: Partial<ExpertCardProps>;
    onCardClick?: (expert: ExpertProfile) => void;
    onLoadMore?: () => void;
    hasMore?: boolean;
    loadMoreThreshold?: number;
}
/**
 * Professional Expert Grid Component
 * Displays experts in a responsive grid with loading states and infinite scroll
 */
declare function ExpertGrid({ experts, columns, gap, loading, error, emptyMessage, loadingComponent, errorComponent, emptyComponent, className, style, cardProps, onCardClick, onLoadMore, hasMore, loadMoreThreshold, }: ExpertGridProps): react_jsx_runtime.JSX.Element;

declare function ExpertList(): null;

declare function FilterPanel(): null;

interface StarRatingProps {
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
/**
 * Professional Star Rating Component
 * Supports fractional ratings, customizable colors, and accessibility
 */
declare function StarRating({ rating, maxRating, size, color, emptyColor, showValue, ariaLabel, className, style, }: StarRatingProps): react_jsx_runtime.JSX.Element;

interface MediaRendererProps {
    src: string | null | undefined;
    alt?: string;
    className?: string;
    style?: CSSProperties;
    loading?: 'lazy' | 'eager';
    aspectRatio?: string;
    objectFit?: CSSProperties['objectFit'];
    onError?: () => void;
    autoplay?: boolean;
    muted?: boolean;
    loop?: boolean;
    controls?: boolean;
    playsInline?: boolean;
}
/**
 * Enterprise Media Renderer
 * Automatically detects media type and renders appropriate element
 * Supports images, videos, and professional fallbacks
 */
declare function MediaRenderer({ src, alt, className, style, loading, aspectRatio, objectFit, onError, ...videoProps }: MediaRendererProps): react_jsx_runtime.JSX.Element;

declare function FilterPanelFramer(): null;

/**
 * Primary hook for accessing Contra SDK functionality
 * Provides client instance and configuration
 */
declare function useContra(): {
    client: _contra_client.ContraClient;
    config: ContraConfig;
    isInitialized: boolean;
    clearCache: (pattern?: string) => void;
    getCacheStats: () => {
        size: number;
        entries: Array<{
            key: string;
            age: number;
            ttl: number;
        }>;
    };
};

interface UseExpertsOptions {
    programId: string;
    filters?: ExpertFilters;
    enabled?: boolean;
    onSuccess?: (data: ListResponse<ExpertProfile>) => void;
    onError?: (error: Error) => void;
}
interface UseExpertsResult {
    experts: ExpertProfile[];
    totalCount: number;
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
    hasMore: boolean;
    loadMore: () => Promise<void>;
}
/**
 * Enterprise-grade hook for fetching and managing expert data
 * Features: Caching, error handling, pagination, real-time updates
 */
declare function useExperts({ programId, filters, enabled, onSuccess, onError, }: UseExpertsOptions): UseExpertsResult;

declare function useFilters(): null;

declare function useMediaDetection(): null;

/**
 * Formatting utilities for Contra Expert data
 */
declare function formatEarnings(amount: number): string;
declare function formatRate(rate: number | null): string;
declare function formatNumber(num: number): string;
declare function truncateText(text: string, maxLength?: number): string;

/**
 * Media utility functions
 */
declare function detectMediaType(url: string): 'image' | 'video';
declare function extractVideoThumbnail(videoUrl: string): string | null;
declare function getMediaErrorPlaceholder(type: 'image' | 'video'): string;

export { type ContraConfig, ContraProvider, type ContraProviderProps, ExpertCard, type ExpertCardProps, ExpertGrid, type ExpertGridProps, ExpertList, FilterPanel, FilterPanelFramer, MediaRenderer, StarRating, type StarRatingProps, type UseExpertsOptions, type UseExpertsResult, detectMediaType, extractVideoThumbnail, formatEarnings, formatNumber, formatRate, getMediaErrorPlaceholder, truncateText, useContra, useContraContext, useExperts, useFilters, useMediaDetection };
