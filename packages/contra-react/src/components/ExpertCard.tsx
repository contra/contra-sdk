import React from 'react';
import type { CSSProperties } from 'react';
import type { ExpertProfile } from '@contra/types';
import { StarRating } from './StarRating';
import { MediaRenderer } from './MediaRenderer';

export interface ExpertCardProps {
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
export function ExpertCard({
  expert,
  layout = 'vertical',
  showProjects = true,
  maxProjects = 4,
  showStats = true,
  showAvailability = true,
  showRate = true,
  showActions = true,
  className = '',
  style,
  onContactClick,
  onProfileClick,
}: ExpertCardProps) {
  const handleContactClick = (e: React.MouseEvent) => {
    if (onContactClick) {
      e.preventDefault();
      onContactClick();
    } else if (expert.inquiryUrl) {
      window.open(expert.inquiryUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    if (onProfileClick) {
      e.preventDefault();
      onProfileClick();
    } else if (expert.profileUrl) {
      window.open(expert.profileUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const formatEarnings = (amount: number): string => {
    if (amount >= 1000000) {
      return `$${Math.floor(amount / 1000000)}M+`;
    } else if (amount >= 1000) {
      return `$${Math.floor(amount / 1000)}k+`;
    }
    return `$${amount}`;
  };

  const formatRate = (rate: number | null): string => {
    return rate ? `$${rate}/hr` : 'Rate on request';
  };

  return (
    <article
      className={`contra-expert-card contra-expert-card--${layout} ${className}`}
      style={{
        border: '1px solid #e4e7ec',
        borderRadius: '16px',
        padding: '1.5rem',
        backgroundColor: 'white',
        transition: 'all 0.2s ease',
        ...style,
      }}
    >
      {/* Header Section */}
      <header className="contra-expert-card__header" style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        marginBottom: '1rem',
      }}>
        <img
          src={expert.avatarUrl}
          alt={`${expert.name} avatar`}
          className="contra-expert-card__avatar"
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            objectFit: 'cover',
            flexShrink: 0,
          }}
        />
        
        <div className="contra-expert-card__info" style={{ flex: 1 }}>
          <h3 className="contra-expert-card__name" style={{
            margin: 0,
            fontSize: '1.125rem',
            fontWeight: 600,
            color: '#111827',
          }}>
            {expert.name}
          </h3>
          
          <p className="contra-expert-card__location" style={{
            margin: '0.25rem 0 0',
            fontSize: '0.875rem',
            color: '#6b7280',
          }}>
            {expert.location}
          </p>
          
          {expert.oneLiner && (
            <p className="contra-expert-card__bio" style={{
              margin: '0.5rem 0 0',
              fontSize: '0.875rem',
              color: '#374151',
              lineHeight: 1.5,
            }}>
              {expert.oneLiner}
            </p>
          )}
        </div>

        {showAvailability && (
          <div className="contra-expert-card__availability" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            flexShrink: 0,
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: expert.available ? '#10b981' : '#9ca3af',
            }} />
            <span style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: expert.available ? '#10b981' : '#9ca3af',
            }}>
              {expert.available ? 'Available' : 'Unavailable'}
            </span>
          </div>
        )}
      </header>

      {/* Stats Section */}
      {showStats && (
        <div className="contra-expert-card__stats" style={{
          display: 'flex',
          gap: '1.5rem',
          padding: '1rem 0',
          borderTop: '1px solid #f3f4f6',
          borderBottom: '1px solid #f3f4f6',
          flexWrap: 'wrap',
        }}>
          <div className="contra-expert-card__stat">
            <span style={{ fontWeight: 600, color: '#111827' }}>
              {formatEarnings(expert.earningsUSD)}
            </span>
            <span style={{ marginLeft: '0.25rem', color: '#6b7280' }}>Earned</span>
          </div>
          
          <div className="contra-expert-card__stat">
            <span style={{ fontWeight: 600, color: '#111827' }}>
              {expert.projectsCompletedCount}x
            </span>
            <span style={{ marginLeft: '0.25rem', color: '#6b7280' }}>Hired</span>
          </div>
          
          <div className="contra-expert-card__stat" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <StarRating rating={expert.averageReviewScore} size={14} />
            <span style={{ fontWeight: 600, color: '#111827' }}>
              {expert.averageReviewScore.toFixed(1)}
            </span>
            <span style={{ color: '#6b7280' }}>
              ({expert.reviewsCount} reviews)
            </span>
          </div>
          
          <div className="contra-expert-card__stat">
            <span style={{ fontWeight: 600, color: '#111827' }}>
              {expert.followersCount.toLocaleString()}
            </span>
            <span style={{ marginLeft: '0.25rem', color: '#6b7280' }}>Followers</span>
          </div>
        </div>
      )}

      {/* Rate Section */}
      {showRate && expert.hourlyRateUSD !== null && (
        <div className="contra-expert-card__rate" style={{
          margin: '1rem 0',
          fontSize: '1rem',
        }}>
          <span style={{ fontWeight: 600, color: '#111827' }}>
            {formatRate(expert.hourlyRateUSD)}
          </span>
          <span style={{ marginLeft: '0.5rem', color: '#6b7280' }}>
            Hourly rate
          </span>
        </div>
      )}

      {/* Projects Grid */}
      {showProjects && expert.projects && expert.projects.length > 0 && (
        <div className="contra-expert-card__projects" style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(maxProjects, 4)}, 1fr)`,
          gap: '0.5rem',
          margin: '1rem 0',
        }}>
          {expert.projects.slice(0, maxProjects).map((project, index) => (
            <a
              key={index}
              href={project.projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="contra-expert-card__project"
              style={{
                display: 'block',
                borderRadius: '8px',
                overflow: 'hidden',
                transition: 'transform 0.2s ease',
              }}
              title={project.title}
            >
              <MediaRenderer
                src={project.coverUrl}
                alt={project.title}
                aspectRatio="4/3"
              />
            </a>
          ))}
          
          {expert.projects.length > maxProjects && (
            <a
              href={expert.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="contra-expert-card__more-projects"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                aspectRatio: '4/3',
                border: '1px dashed #d0d5dd',
                borderRadius: '8px',
                color: '#475467',
                fontSize: '0.875rem',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
            >
              +{expert.projects.length - maxProjects} more
            </a>
          )}
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <footer className="contra-expert-card__actions" style={{
          display: 'flex',
          gap: '0.75rem',
          marginTop: '1.5rem',
        }}>
          <button
            onClick={handleProfileClick}
            className="contra-expert-card__profile-btn"
            style={{
              flex: 1,
              padding: '0.625rem 1.25rem',
              border: '1px solid #d0d5dd',
              borderRadius: '24px',
              backgroundColor: 'white',
              color: '#374151',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            View Profile
          </button>
          
          <button
            onClick={handleContactClick}
            className="contra-expert-card__contact-btn"
            style={{
              flex: 1,
              padding: '0.625rem 1.25rem',
              border: 'none',
              borderRadius: '24px',
              backgroundColor: '#111827',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Contact
          </button>
        </footer>
      )}
    </article>
  );
} 