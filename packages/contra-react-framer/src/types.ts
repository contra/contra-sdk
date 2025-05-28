import type { ContraFilters, ContraExpert } from '@contra/contra-core';
import type { ReactNode } from 'react';

export interface ContraProviderProps {
  apiKey: string;
  baseUrl?: string;
  children: ReactNode;
}

export interface ExpertListProps {
  program: string;
  filters?: ContraFilters;
  className?: string;
  style?: React.CSSProperties;
  renderExpert?: (expert: ContraExpert) => ReactNode;
  renderEmpty?: () => ReactNode;
  renderLoading?: () => ReactNode;
  renderError?: (error: Error) => ReactNode;
}

export interface ExpertCardProps {
  expert: ContraExpert;
  className?: string;
  style?: React.CSSProperties;
  showProjects?: boolean;
  maxProjects?: number;
}

export interface StarRatingProps {
  score: number;
  maxStars?: number;
  className?: string;
  style?: React.CSSProperties;
} 