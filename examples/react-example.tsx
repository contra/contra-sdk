import React, { useState } from 'react';
import { 
  ContraProvider, 
  ExpertList, 
  ExpertCard,
  StarRating,
  type ContraFilters 
} from '@contra/contra-react-framer';

// Custom Expert Card Component
function CustomExpertCard({ expert }: { expert: any }) {
  return (
    <div style={{
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '24px',
      background: 'white',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      transition: 'transform 0.2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
        <img 
          src={expert.avatarUrl} 
          alt={expert.name}
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            objectFit: 'cover',
            marginRight: '16px'
          }}
        />
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>
            {expert.name}
          </h3>
          <StarRating score={expert.averageReviewScore} />
          <p style={{ margin: '4px 0 0 0', color: '#2563eb', fontWeight: '600' }}>
            ${expert.hourlyRateUSD}/hr
          </p>
        </div>
      </div>
      
      {expert.bio && (
        <p style={{ color: '#64748b', marginBottom: '16px', lineHeight: '1.5' }}>
          {expert.bio}
        </p>
      )}
      
      {expert.location && (
        <p style={{ color: '#64748b', marginBottom: '16px' }}>
          📍 {expert.location}
        </p>
      )}
      
      {expert.skills && expert.skills.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600' }}>
            Skills
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {expert.skills.slice(0, 5).map((skill: string) => (
              <span
                key={skill}
                style={{
                  background: '#f1f5f9',
                  color: '#475569',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {expert.projects && expert.projects.length > 0 && (
        <div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600' }}>
            Recent Projects
          </h4>
          <div style={{ display: 'flex', gap: '8px' }}>
            {expert.projects.slice(0, 4).map((project: any) => (
              <img
                key={project.id}
                src={project.coverUrl}
                alt={project.title}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '6px',
                  objectFit: 'cover'
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Filter Controls Component
function FilterControls({ filters, onFiltersChange }: {
  filters: ContraFilters;
  onFiltersChange: (filters: ContraFilters) => void;
}) {
  return (
    <div style={{
      background: '#f8fafc',
      padding: '24px',
      borderRadius: '12px',
      marginBottom: '24px'
    }}>
      <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '600' }}>
        Filter Experts
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
            Languages
          </label>
          <select
            multiple
            value={filters.languages || []}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, option => option.value);
              onFiltersChange({ ...filters, languages: selected });
            }}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              minHeight: '80px'
            }}
          >
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="German">German</option>
            <option value="Portuguese">Portuguese</option>
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
            Min Rate ($)
          </label>
          <input
            type="number"
            value={filters.minRate || ''}
            onChange={(e) => onFiltersChange({ 
              ...filters, 
              minRate: e.target.value ? Number(e.target.value) : undefined 
            })}
            placeholder="25"
            min="0"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '6px'
            }}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
            Max Rate ($)
          </label>
          <input
            type="number"
            value={filters.maxRate || ''}
            onChange={(e) => onFiltersChange({ 
              ...filters, 
              maxRate: e.target.value ? Number(e.target.value) : undefined 
            })}
            placeholder="200"
            min="0"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '6px'
            }}
          />
        </div>
        
        <div>
          <label style={{ display: 'flex', alignItems: 'center', marginTop: '28px' }}>
            <input
              type="checkbox"
              checked={filters.available || false}
              onChange={(e) => onFiltersChange({ 
                ...filters, 
                available: e.target.checked || undefined 
              })}
              style={{ marginRight: '8px' }}
            />
            Available only
          </label>
        </div>
      </div>
    </div>
  );
}

// Main App Component
export default function ContraExpertsApp() {
  const [filters, setFilters] = useState<ContraFilters>({
    languages: ['English'],
    minRate: 25
  });

  return (
    <ContraProvider apiKey="your-api-key-here">
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '24px' }}>
          Contra Experts Showcase
        </h1>
        
        <FilterControls 
          filters={filters} 
          onFiltersChange={setFilters} 
        />
        
        <ExpertList
          program="spline_expert"
          filters={filters}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '24px'
          }}
          renderExpert={(expert) => (
            <CustomExpertCard key={expert.id} expert={expert} />
          )}
          renderLoading={() => (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px',
              color: '#64748b',
              fontSize: '18px'
            }}>
              🔄 Loading experts...
            </div>
          )}
          renderEmpty={() => (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px',
              color: '#64748b',
              fontSize: '18px'
            }}>
              😔 No experts found matching your criteria
            </div>
          )}
          renderError={(error) => (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px',
              color: '#dc2626',
              fontSize: '18px',
              background: '#fef2f2',
              borderRadius: '12px',
              border: '1px solid #fecaca'
            }}>
              ❌ Error: {error.message}
            </div>
          )}
        />
      </div>
    </ContraProvider>
  );
}

// Framer Code Component Example
export function FramerContraExperts({ 
  apiKey = "your-api-key", 
  program = "spline_expert",
  minRate = 25,
  maxRate = 200,
  languages = "English"
}: {
  apiKey?: string;
  program?: string;
  minRate?: number;
  maxRate?: number;
  languages?: string;
}) {
  const filters: ContraFilters = {
    minRate,
    maxRate,
    languages: languages.split(',').map(lang => lang.trim())
  };

  return (
    <ContraProvider apiKey={apiKey}>
      <ExpertList
        program={program}
        filters={filters}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px'
        }}
      />
    </ContraProvider>
  );
}

// For Framer, you would add property controls like this:
/*
import { addPropertyControls, ControlType } from "framer"

addPropertyControls(FramerContraExperts, {
  apiKey: { 
    type: ControlType.String, 
    title: "API Key",
    defaultValue: "your-api-key"
  },
  program: { 
    type: ControlType.String, 
    title: "Program",
    defaultValue: "spline_expert"
  },
  minRate: { 
    type: ControlType.Number, 
    title: "Min Rate",
    defaultValue: 25,
    min: 0
  },
  maxRate: { 
    type: ControlType.Number, 
    title: "Max Rate",
    defaultValue: 200,
    min: 0
  },
  languages: { 
    type: ControlType.String, 
    title: "Languages (comma-separated)",
    defaultValue: "English"
  }
})
*/ 