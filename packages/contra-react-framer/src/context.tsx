import { createContext, useContext, useMemo } from 'react';
import { ContraClient } from '@contra/contra-core';
import type { ContraProviderProps } from './types';

const ContraContext = createContext<ContraClient | null>(null);

export function ContraProvider({ apiKey, baseUrl, children }: ContraProviderProps) {
  const client = useMemo(() => {
    return new ContraClient({ apiKey, baseUrl });
  }, [apiKey, baseUrl]);

  return (
    <ContraContext.Provider value={client}>
      {children}
    </ContraContext.Provider>
  );
}

export function useContra(): ContraClient {
  const client = useContext(ContraContext);
  if (!client) {
    throw new Error('useContra must be used within a ContraProvider');
  }
  return client;
} 