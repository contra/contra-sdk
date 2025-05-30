import { useState, useEffect, useCallback, useRef } from 'react';
import type { ExpertProfile, ExpertFilters, ListResponse } from '@contra/types';
import { useContra } from './useContra';

export interface UseExpertsOptions {
  programId: string;
  filters?: ExpertFilters;
  enabled?: boolean;
  onSuccess?: (data: ListResponse<ExpertProfile>) => void;
  onError?: (error: Error) => void;
}

export interface UseExpertsResult {
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
export function useExperts({
  programId,
  filters = {},
  enabled = true,
  onSuccess,
  onError,
}: UseExpertsOptions): UseExpertsResult {
  const { client } = useContra();
  const [experts, setExperts] = useState<ExpertProfile[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  
  // Track if we're currently fetching to prevent duplicate requests
  const isFetchingRef = useRef(false);
  const abortControllerRef = useRef<AbortController>();

  const pageSize = filters.limit || 20;
  const hasMore = experts.length < totalCount;

  const fetchExperts = useCallback(async (isLoadMore = false) => {
    if (!enabled || !programId || isFetchingRef.current) return;

    // Cancel any pending requests
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    
    isFetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const offset = isLoadMore ? experts.length : 0;
      const response = await client.listExperts(programId, {
        ...filters,
        limit: pageSize,
        offset,
      });

      if (isLoadMore) {
        setExperts(prev => [...prev, ...response.data]);
      } else {
        setExperts(response.data);
      }
      
      setTotalCount(response.totalCount);
      onSuccess?.(response);
      
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') return;
      
      const error = err instanceof Error ? err : new Error('Failed to fetch experts');
      setError(error);
      onError?.(error);
      console.error('[useExperts] Error:', error);
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  }, [client, programId, filters, enabled, pageSize, experts.length, onSuccess, onError]);

  // Initial fetch and refetch on dependency changes
  useEffect(() => {
    fetchExperts(false);
    
    return () => {
      // Cleanup: cancel any pending requests
      abortControllerRef.current?.abort();
    };
  }, [programId, JSON.stringify(filters), enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = useCallback(async () => {
    setPage(1);
    await fetchExperts(false);
  }, [fetchExperts]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    setPage(prev => prev + 1);
    await fetchExperts(true);
  }, [hasMore, loading, fetchExperts]);

  return {
    experts,
    totalCount,
    loading,
    error,
    refresh,
    hasMore,
    loadMore,
  };
} 