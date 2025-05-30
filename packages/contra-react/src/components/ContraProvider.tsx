import React, { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { ContraClient } from '@contra/client';
import type { ClientConfig } from '@contra/types';

/**
 * Enterprise-grade Context Provider for Contra SDK
 * Manages configuration, client instance, and global state
 */

export interface ContraConfig extends ClientConfig {
  // Media configuration
  videoAutoplay?: boolean;
  videoHoverPlay?: boolean;
  videoMuted?: boolean;
  videoLoop?: boolean;
  videoControls?: boolean;
  
  // Performance
  enableVirtualization?: boolean;
  cacheStrategy?: 'aggressive' | 'normal' | 'minimal';
  
  // UI Configuration
  theme?: 'light' | 'dark' | 'auto';
  locale?: string;
}

interface ContraContextValue {
  client: ContraClient;
  config: ContraConfig;
  isInitialized: boolean;
}

const ContraContext = createContext<ContraContextValue | null>(null);

export interface ContraProviderProps {
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
export function ContraProvider({ config, children }: ContraProviderProps) {
  // Create memoized client instance
  const client = useMemo(() => {
    return new ContraClient({
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      timeout: config.timeout,
      debug: config.debug,
    });
  }, [config.apiKey, config.baseUrl, config.timeout, config.debug]);

  // Memoize context value
  const contextValue = useMemo<ContraContextValue>(() => ({
    client,
    config: {
      // Default media settings for enterprise UX
      videoAutoplay: false,
      videoHoverPlay: true,
      videoMuted: true,
      videoLoop: true,
      videoControls: false,
      enableVirtualization: true,
      cacheStrategy: 'normal',
      theme: 'light',
      ...config,
    },
    isInitialized: true,
  }), [client, config]);

  return (
    <ContraContext.Provider value={contextValue}>
      {children}
    </ContraContext.Provider>
  );
}

/**
 * Hook to access Contra context
 * Throws if used outside of ContraProvider
 */
export function useContraContext() {
  const context = useContext(ContraContext);
  
  if (!context) {
    throw new Error(
      'useContraContext must be used within a ContraProvider. ' +
      'Make sure to wrap your component tree with <ContraProvider>.'
    );
  }
  
  return context;
} 