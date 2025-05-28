// Components
export { ExpertList, ExpertCard, StarRating } from './components';

// Context and hooks
export { ContraProvider, useContra } from './context';

// Types
export type {
  ContraProviderProps,
  ExpertListProps,
  ExpertCardProps,
  StarRatingProps,
} from './types';

// Re-export core types
export type {
  ContraFilters,
  ContraExpert,
  ContraProject,
  ContraApiResponse,
} from '@contra/contra-core'; 