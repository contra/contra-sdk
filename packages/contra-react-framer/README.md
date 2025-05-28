# @contra/contra-react-framer

React wrapper components optimized for Framer projects. Build expert showcases with minimal code.

## Installation

```bash
npm install @contra/contra-react-framer @contra/contra-core
```

## Quick Start

```tsx
import { ContraProvider, ExpertList } from '@contra/contra-react-framer';

function App() {
  return (
    <ContraProvider apiKey="your-api-key">
      <ExpertList 
        program="spline_expert"
        filters={{ languages: ['English'], minRate: 50 }}
      />
    </ContraProvider>
  );
}
```

## Components

### ContraProvider

Provides the Contra API client to child components via React context.

```tsx
<ContraProvider apiKey="your-api-key" baseUrl="https://api.contra.com/v1">
  {/* Your components */}
</ContraProvider>
```

**Props:**
- `apiKey: string` - Your Contra API key (required)
- `baseUrl?: string` - Custom API base URL (optional)
- `children: ReactNode` - Child components

### ExpertList

Renders a list of experts with automatic data fetching and error handling.

```tsx
<ExpertList 
  program="spline_expert"
  filters={{ available: true, minRate: 25 }}
  className="expert-grid"
  renderExpert={(expert) => (
    <CustomExpertCard key={expert.id} expert={expert} />
  )}
  renderLoading={() => <div>Loading experts...</div>}
  renderEmpty={() => <div>No experts found</div>}
  renderError={(error) => <div>Error: {error.message}</div>}
/>
```

**Props:**
- `program: string` - Program identifier (required)
- `filters?: ContraFilters` - Filtering options
- `className?: string` - CSS class name
- `style?: CSSProperties` - Inline styles
- `renderExpert?: (expert: ContraExpert) => ReactNode` - Custom expert renderer
- `renderEmpty?: () => ReactNode` - Custom empty state renderer
- `renderLoading?: () => ReactNode` - Custom loading state renderer
- `renderError?: (error: Error) => ReactNode` - Custom error state renderer

### ExpertCard

Pre-built expert card component with avatar, name, rating, and projects.

```tsx
<ExpertCard 
  expert={expert}
  className="expert-card"
  showProjects={true}
  maxProjects={3}
/>
```

**Props:**
- `expert: ContraExpert` - Expert data object (required)
- `className?: string` - CSS class name
- `style?: CSSProperties` - Inline styles
- `showProjects?: boolean` - Whether to show recent projects (default: true)
- `maxProjects?: number` - Maximum number of projects to show (default: 4)

### StarRating

Star rating component for displaying review scores.

```tsx
<StarRating 
  score={4.5}
  maxStars={5}
  className="rating"
/>
```

**Props:**
- `score: number` - Rating score (required)
- `maxStars?: number` - Maximum number of stars (default: 5)
- `className?: string` - CSS class name
- `style?: CSSProperties` - Inline styles

## Hooks

### useContra

Access the Contra API client from any component within a ContraProvider.

```tsx
import { useContra } from '@contra/contra-react-framer';

function CustomComponent() {
  const client = useContra();
  
  const fetchExpert = async (id: string) => {
    const expert = await client.getExpert(id);
    return expert;
  };
  
  // ...
}
```

## Advanced Usage

### Custom Expert Renderer

```tsx
<ExpertList 
  program="spline_expert"
  renderExpert={(expert) => (
    <div className="custom-card">
      <img src={expert.avatarUrl} alt={expert.name} />
      <h3>{expert.name}</h3>
      <StarRating score={expert.averageReviewScore} />
      <p>${expert.hourlyRateUSD}/hr</p>
      <div className="skills">
        {expert.skills.map(skill => (
          <span key={skill} className="skill-tag">{skill}</span>
        ))}
      </div>
    </div>
  )}
/>
```

### Error Handling

```tsx
<ExpertList 
  program="spline_expert"
  renderError={(error) => (
    <div className="error-state">
      <h3>Oops! Something went wrong</h3>
      <p>{error.message}</p>
      <button onClick={() => window.location.reload()}>
        Try Again
      </button>
    </div>
  )}
/>
```

### Filtering

```tsx
const filters = {
  languages: ['English', 'Spanish'],
  minRate: 50,
  maxRate: 150,
  location: 'United States',
  available: true,
  sortBy: 'rating' as const
};

<ExpertList program="spline_expert" filters={filters} />
```

## Framer Integration

These components work seamlessly in Framer projects:

1. Add the package to your Framer project
2. Create a code component that wraps ExpertList
3. Expose props like `program` and `apiKey` to the Framer interface
4. Style with Framer's visual editor

```tsx
// Framer Code Component
import { addPropertyControls, ControlType } from "framer"
import { ContraProvider, ExpertList } from '@contra/contra-react-framer'

export function ContraExperts({ apiKey, program, ...props }) {
  return (
    <ContraProvider apiKey={apiKey}>
      <ExpertList program={program} {...props} />
    </ContraProvider>
  )
}

addPropertyControls(ContraExperts, {
  apiKey: { type: ControlType.String, title: "API Key" },
  program: { type: ControlType.String, title: "Program" },
})
```

## TypeScript Support

Full TypeScript support with comprehensive type definitions:

```tsx
import type { ContraExpert, ContraFilters } from '@contra/contra-react-framer';

interface CustomProps {
  expert: ContraExpert;
  filters: ContraFilters;
}
``` 