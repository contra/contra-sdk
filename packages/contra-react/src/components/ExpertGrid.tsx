import React from 'react';
import type { CSSProperties } from 'react';
import type { ExpertProfile } from '@contra/types';
import { ExpertCard } from './ExpertCard';
import type { ExpertCardProps } from './ExpertCard';

export interface ExpertGridProps {
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
  // Card customization
  cardProps?: Partial<ExpertCardProps>;
  onCardClick?: (expert: ExpertProfile) => void;
  // Infinite scroll
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadMoreThreshold?: number;
}

/**
 * Professional Expert Grid Component
 * Displays experts in a responsive grid with loading states and infinite scroll
 */
export function ExpertGrid({
  experts,
  columns = 'auto',
  gap = '1.5rem',
  loading = false,
  error = null,
  emptyMessage = 'No experts found.',
  loadingComponent,
  errorComponent,
  emptyComponent,
  className = '',
  style,
  cardProps = {},
  onCardClick,
  onLoadMore,
  hasMore = false,
  loadMoreThreshold = 200,
}: ExpertGridProps) {
  const observerRef = React.useRef<IntersectionObserver>();
  const loadMoreRef = React.useRef<HTMLDivElement>(null);

  // Setup infinite scroll
  React.useEffect(() => {
    if (!onLoadMore || !hasMore || loading) return;

    const options = {
      root: null,
      rootMargin: `${loadMoreThreshold}px`,
      threshold: 0.1,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        onLoadMore();
      }
    }, options);

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [onLoadMore, hasMore, loading, loadMoreThreshold]);

  // Compute grid template columns
  const gridTemplateColumns = columns === 'auto' 
    ? 'repeat(auto-fill, minmax(320px, 1fr))'
    : `repeat(${columns}, 1fr)`;

  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns,
    gap,
    ...style,
  };

  // Render error state
  if (error && !loading && experts.length === 0) {
    if (errorComponent) return <>{errorComponent}</>;
    
    return (
      <div className="contra-expert-grid__error" style={{
        background: '#fee2e2',
        color: '#dc2626',
        padding: '1rem',
        borderRadius: '8px',
        textAlign: 'center',
      }}>
        {error.message || 'An error occurred while loading experts.'}
      </div>
    );
  }

  // Render empty state
  if (!loading && !error && experts.length === 0) {
    if (emptyComponent) return <>{emptyComponent}</>;
    
    return (
      <div className="contra-expert-grid__empty" style={{
        textAlign: 'center',
        padding: '3rem',
        color: '#6b7280',
        background: '#f9fafb',
        borderRadius: '8px',
      }}>
        {emptyMessage}
      </div>
    );
  }

  // Render loading state (initial load)
  if (loading && experts.length === 0) {
    if (loadingComponent) return <>{loadingComponent}</>;
    
    return (
      <div className="contra-expert-grid__loading" style={{
        display: 'grid',
        gridTemplateColumns,
        gap,
      }}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="contra-expert-grid__skeleton"
            style={{
              height: '400px',
              background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              borderRadius: '16px',
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className={`contra-expert-grid ${className}`} style={gridStyle}>
        {experts.map((expert) => (
          <ExpertCard
            key={expert.id}
            expert={expert}
            {...cardProps}
            onContactClick={cardProps.onContactClick}
            onProfileClick={() => {
              cardProps.onProfileClick?.();
              onCardClick?.(expert);
            }}
          />
        ))}
      </div>
      
      {/* Load more trigger */}
      {hasMore && (
        <div
          ref={loadMoreRef}
          className="contra-expert-grid__load-more"
          style={{
            height: '1px',
            marginTop: '2rem',
          }}
        />
      )}
      
      {/* Loading more indicator */}
      {loading && experts.length > 0 && (
        <div className="contra-expert-grid__loading-more" style={{
          textAlign: 'center',
          padding: '2rem',
          color: '#6b7280',
        }}>
          <div style={{
            display: 'inline-block',
            width: '32px',
            height: '32px',
            border: '3px solid #f3f4f6',
            borderTop: '3px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
        </div>
      )}
      
      {/* CSS for animations */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
} 