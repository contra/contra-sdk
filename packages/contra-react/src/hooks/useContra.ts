import { useContraContext } from '../components/ContraProvider';

/**
 * Primary hook for accessing Contra SDK functionality
 * Provides client instance and configuration
 */
export function useContra() {
  const { client, config, isInitialized } = useContraContext();
  
  return {
    client,
    config,
    isInitialized,
    // Convenience methods
    clearCache: (pattern?: string) => client.clearCache(pattern),
    getCacheStats: () => client.getCacheStats(),
  };
} 