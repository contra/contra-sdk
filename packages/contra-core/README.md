# @contra/contra-core

Typed fetch wrapper and core API client for Contra's expert marketplace.

## Installation

```bash
npm install @contra/contra-core
```

## Quick Start

```typescript
import { ContraClient } from '@contra/contra-core';

const client = new ContraClient({
  apiKey: 'your-api-key'
});

// List experts in a program
const response = await client.listExperts('spline_expert', {
  languages: ['English', 'Spanish'],
  minRate: 50,
  maxRate: 150,
  available: true
});

console.log(response.data); // Array of ContraExpert objects
```

## API Reference

### ContraClient

#### Constructor

```typescript
new ContraClient(config: ContraClientConfig)
```

**Config Options:**
- `apiKey: string` - Your Contra API key (required)
- `baseUrl?: string` - Custom API base URL (default: 'https://api.contra.com/v1')
- `timeout?: number` - Request timeout in milliseconds (default: 10000)

#### Methods

##### `listExperts(program, filters?, page?, limit?)`

List experts in a specific program with optional filtering.

```typescript
await client.listExperts('spline_expert', {
  languages: ['English'],
  minRate: 25,
  maxRate: 100,
  location: 'United States',
  available: true,
  sortBy: 'rating'
}, 1, 20);
```

**Parameters:**
- `program: string` - Program identifier (e.g., 'spline_expert')
- `filters?: ContraFilters` - Optional filters object
- `page?: number` - Page number (default: 1)
- `limit?: number` - Results per page (default: 20)

**Returns:** `Promise<ContraApiResponse<ContraExpert[]>>`

##### `getExpert(expertId)`

Get a single expert by their ID.

```typescript
const expert = await client.getExpert('expert-123');
```

**Parameters:**
- `expertId: string` - The expert's unique identifier

**Returns:** `Promise<ContraExpert>`

##### `searchExperts(query, filters?, page?, limit?)`

Search experts by query string with optional filtering.

```typescript
await client.searchExperts('3D designer', {
  minRate: 30,
  available: true
});
```

**Parameters:**
- `query: string` - Search query
- `filters?: ContraFilters` - Optional filters object
- `page?: number` - Page number (default: 1)
- `limit?: number` - Results per page (default: 20)

**Returns:** `Promise<ContraApiResponse<ContraExpert[]>>`

## Types

### ContraFilters

```typescript
interface ContraFilters {
  languages?: string[];
  minRate?: number;
  maxRate?: number;
  location?: string;
  available?: boolean;
  sortBy?: 'newest' | 'oldest' | 'rating' | 'rate_low' | 'rate_high';
}
```

### ContraExpert

```typescript
interface ContraExpert {
  id: string;
  name: string;
  avatarUrl: string;
  bio?: string;
  hourlyRateUSD: number;
  location?: string;
  languages: string[];
  available: boolean;
  averageReviewScore: number;
  totalReviews: number;
  projects: ContraProject[];
  profileUrl: string;
  skills: string[];
}
```

### ContraProject

```typescript
interface ContraProject {
  id: string;
  title: string;
  coverUrl: string;
  projectUrl: string;
  description?: string;
}
```

## Utilities

### `starSVG(score: number): string`

Generate star rating SVG markup based on a score (0-5).

```typescript
import { starSVG } from '@contra/contra-core';

const starsHTML = starSVG(4.5); // Renders 4.5 stars as SVG
```

### `buildQueryString(params: Record<string, any>): string`

Build URL query string from parameters object.

```typescript
import { buildQueryString } from '@contra/contra-core';

const qs = buildQueryString({ page: 1, limit: 20 }); // "?page=1&limit=20"
```

## Error Handling

The client throws errors for:
- Network failures
- API errors (non-2xx status codes)
- Request timeouts
- Invalid responses

```typescript
try {
  const experts = await client.listExperts('invalid_program');
} catch (error) {
  console.error('API call failed:', error.message);
}
``` 