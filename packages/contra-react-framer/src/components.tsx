import { useEffect, useState } from 'react';
import type { ContraExpert } from '@contra/contra-core';
import { useContra } from './context';
import type { ExpertListProps, ExpertCardProps, StarRatingProps } from './types';

export function StarRating({ score, maxStars = 5, className, style }: StarRatingProps) {
  const fullStars = Math.floor(score);
  const hasHalfStar = score % 1 >= 0.5;
  const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={className} style={style}>
      {Array.from({ length: fullStars }, (_, i) => (
        <span key={`full-${i}`} style={{ color: '#FFD700' }}>★</span>
      ))}
      {hasHalfStar && <span style={{ color: '#FFD700' }}>☆</span>}
      {Array.from({ length: emptyStars }, (_, i) => (
        <span key={`empty-${i}`} style={{ color: '#E5E5E5' }}>☆</span>
      ))}
    </div>
  );
}

export function ExpertCard({ expert, className, style, showProjects = true, maxProjects = 4 }: ExpertCardProps) {
  return (
    <div className={className} style={style}>
      <img src={expert.avatarUrl} alt={expert.name} />
      <h3>{expert.name}</h3>
      <StarRating score={expert.averageReviewScore} />
      <p>${expert.hourlyRateUSD}/hr</p>
      {expert.bio && <p>{expert.bio}</p>}
      {expert.location && <p>{expert.location}</p>}
      
      {showProjects && expert.projects.length > 0 && (
        <div>
          <h4>Recent Projects</h4>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {expert.projects.slice(0, maxProjects).map(project => (
              <div key={project.id} style={{ width: '60px', height: '60px' }}>
                <img 
                  src={project.coverUrl} 
                  alt={project.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ExpertList({ 
  program, 
  filters, 
  className, 
  style, 
  renderExpert,
  renderEmpty,
  renderLoading,
  renderError 
}: ExpertListProps) {
  const client = useContra();
  const [experts, setExperts] = useState<ContraExpert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function fetchExperts() {
      try {
        setLoading(true);
        setError(null);
        const response = await client.listExperts(program, filters);
        
        if (!isCancelled) {
          setExperts(response.data);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err : new Error('Failed to fetch experts'));
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    fetchExperts();

    return () => {
      isCancelled = true;
    };
  }, [client, program, filters]);

  if (loading) {
    return renderLoading ? renderLoading() : <div>Loading experts...</div>;
  }

  if (error) {
    return renderError ? renderError(error) : <div>Error: {error.message}</div>;
  }

  if (experts.length === 0) {
    return renderEmpty ? renderEmpty() : <div>No experts found</div>;
  }

  return (
    <div className={className} style={style}>
      {experts.map(expert => 
        renderExpert ? 
        renderExpert(expert) : 
        <ExpertCard key={expert.id} expert={expert} />
      )}
    </div>
  );
} 