import React from 'react';
import type { CSSProperties } from 'react';

export interface StarRatingProps {
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
export function StarRating({
  rating,
  maxRating = 5,
  size = 16,
  color = '#FBBF24',
  emptyColor = '#E5E7EB',
  showValue = false,
  ariaLabel,
  className = '',
  style,
}: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);
  
  const starStyle: CSSProperties = {
    width: size,
    height: size,
    display: 'inline-block',
    marginRight: size * 0.125,
  };

  const renderStar = (type: 'full' | 'half' | 'empty', key: number) => {
    const id = `star-gradient-${key}-${Math.random().toString(36).substr(2, 9)}`;
    
    return (
      <svg
        key={key}
        style={starStyle}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {type === 'half' && (
          <defs>
            <linearGradient id={id}>
              <stop offset="50%" stopColor={color} />
              <stop offset="50%" stopColor={emptyColor} />
            </linearGradient>
          </defs>
        )}
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill={
            type === 'full' ? color :
            type === 'half' ? `url(#${id})` :
            emptyColor
          }
        />
      </svg>
    );
  };

  const stars = [
    ...Array(fullStars).fill('full'),
    ...(hasHalfStar ? ['half'] : []),
    ...Array(emptyStars).fill('empty'),
  ];

  const computedAriaLabel = ariaLabel || `Rating: ${rating} out of ${maxRating} stars`;

  return (
    <div
      className={`contra-star-rating ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '2px',
        ...style,
      }}
      role="img"
      aria-label={computedAriaLabel}
    >
      {stars.map((type, index) => renderStar(type as any, index))}
      {showValue && (
        <span
          style={{
            marginLeft: size * 0.25,
            fontSize: size * 0.875,
            color: 'currentColor',
            fontWeight: 500,
          }}
        >
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
} 