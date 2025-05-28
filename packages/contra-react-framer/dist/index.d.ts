import * as react from 'react';
import { ReactNode } from 'react';
import * as react_jsx_runtime from 'react/jsx-runtime';
import { ContraFilters, ContraExpert, ContraClient } from '@contra/contra-core';
export { ContraApiResponse, ContraExpert, ContraFilters, ContraProject } from '@contra/contra-core';

interface ContraProviderProps {
    apiKey: string;
    baseUrl?: string;
    children: ReactNode;
}
interface ExpertListProps {
    program: string;
    filters?: ContraFilters;
    className?: string;
    style?: React.CSSProperties;
    renderExpert?: (expert: ContraExpert) => ReactNode;
    renderEmpty?: () => ReactNode;
    renderLoading?: () => ReactNode;
    renderError?: (error: Error) => ReactNode;
}
interface ExpertCardProps {
    expert: ContraExpert;
    className?: string;
    style?: React.CSSProperties;
    showProjects?: boolean;
    maxProjects?: number;
}
interface StarRatingProps {
    score: number;
    maxStars?: number;
    className?: string;
    style?: React.CSSProperties;
}

declare function StarRating({ score, maxStars, className, style }: StarRatingProps): react_jsx_runtime.JSX.Element;
declare function ExpertCard({ expert, className, style, showProjects, maxProjects }: ExpertCardProps): react_jsx_runtime.JSX.Element;
declare function ExpertList({ program, filters, className, style, renderExpert, renderEmpty, renderLoading, renderError }: ExpertListProps): string | number | boolean | Iterable<react.ReactNode> | react_jsx_runtime.JSX.Element | null | undefined;

declare function ContraProvider({ apiKey, baseUrl, children }: ContraProviderProps): react_jsx_runtime.JSX.Element;
declare function useContra(): ContraClient;

export { ContraProvider, type ContraProviderProps, ExpertCard, type ExpertCardProps, ExpertList, type ExpertListProps, StarRating, type StarRatingProps, useContra };
