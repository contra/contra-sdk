# Contra Expert Directory SDK - React & Framer

**Enterprise-grade React components for Contra expert directories with Framer optimization**

Version: 1.0.0 | License: MIT | Status: Production Ready

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Framer Integration](#framer-integration)
3. [Core Components](#core-components)
4. [Hooks & APIs](#hooks--apis)
5. [Video & Media Handling](#video--media-handling)
6. [Styling & Customization](#styling--customization)
7. [Performance Optimization](#performance-optimization)
8. [TypeScript Support](#typescript-support)
9. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Installation

```bash
npm install @contra/react
# or
yarn add @contra/react
```

### Basic React Usage

```tsx
import { ContraProvider, ExpertGrid } from '@contra/react';

function App() {
  return (
    <ContraProvider config={{ 
      apiKey: 'your-api-key',
      program: 'your-program-id' 
    }}>
      <ExpertGrid 
        programId="your-program-id"
        columns={3}
        showProjects={true}
      />
    </ContraProvider>
  );
}
```

---

## 🎨 Framer Integration

### 1. Import Component in Framer

Copy this URL into any Framer project:

```
https://framer.com/m/ExpertGrid-xxxx.js
```

### 2. Available Framer Components

#### ExpertGridFramer
**Main component for displaying expert directories**

```tsx
// Automatically configured with Property Controls
// Just drag onto canvas and configure via UI
```

**Property Controls:**
- **API Configuration**: API Key, Program ID, Debug mode
- **Layout**: Columns, Gap, Items per page
- **Filtering**: Sort by, Location, Languages, Rate range
- **Display Options**: Projects, Stats, Availability, Actions
- **Video Settings**: Autoplay, Hover play, Controls
- **Performance**: Infinite scroll, Canvas optimization

#### ExpertCardFramer
**Individual expert card for custom layouts**

```tsx
// Perfect for creating custom expert showcases
// All fields configurable via Property Controls
```

### 3. Framer-Specific Features

```tsx
/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any-prefer-fixed
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 800
 */
```

- **Auto-sizing**: Components adapt to Framer's layout system
- **Canvas Performance**: Optimized placeholders on canvas
- **Property Controls**: Visual configuration without code
- **Component Sharing**: Share via unique URLs

---

## 🧩 Core Components

### ContraProvider

**Required wrapper providing configuration and context**

```tsx
import { ContraProvider } from '@contra/react';

<ContraProvider config={{
  apiKey: 'your-api-key',
  program: 'your-program-id',
  // Optional configurations
  videoAutoplay: false,
  videoHoverPlay: true,
  videoMuted: true,
  videoLoop: true,
  videoControls: false,
  enableVirtualization: true,
  cacheStrategy: 'normal',
  theme: 'light'
}}>
  {/* Your app components */}
</ContraProvider>
```

### ExpertCard

**Displays individual expert information**

```tsx
import { ExpertCard } from '@contra/react';

<ExpertCard
  expert={expertData}
  layout="vertical" // or "horizontal"
  showProjects={true}
  maxProjects={4}
  showStats={true}
  showAvailability={true}
  showRate={true}
  showActions={true}
  onContactClick={() => console.log('Contact clicked')}
  onProfileClick={() => console.log('Profile clicked')}
/>
```

### ExpertGrid

**Responsive grid layout with infinite scroll**

```tsx
import { ExpertGrid } from '@contra/react';

<ExpertGrid
  experts={experts}
  columns="auto" // or 1, 2, 3, 4
  gap="1.5rem"
  loading={loading}
  error={error}
  hasMore={hasMore}
  onLoadMore={loadMore}
  cardProps={{
    showProjects: true,
    maxProjects: 4,
    showStats: true
  }}
/>
```

### StarRating

**Professional star rating display**

```tsx
import { StarRating } from '@contra/react';

<StarRating
  rating={4.8}
  maxRating={5}
  size={16}
  color="#FBBF24"
  emptyColor="#E5E7EB"
  showValue={true}
/>
```

### MediaRenderer

**Intelligent media component with video detection**

```tsx
import { MediaRenderer } from '@contra/react';

<MediaRenderer
  src={mediaUrl}
  alt="Project media"
  aspectRatio="16/9"
  objectFit="cover"
  loading="lazy"
/>
```

---

## 🪝 Hooks & APIs

### useContra

**Access SDK configuration and client**

```tsx
import { useContra } from '@contra/react';

function MyComponent() {
  const { client, config, isInitialized } = useContra();
  
  // Clear cache
  client.clearCache();
  
  // Get cache stats
  const stats = client.getCacheStats();
}
```

### useExperts

**Fetch and manage expert data**

```tsx
import { useExperts } from '@contra/react';

function ExpertList() {
  const {
    experts,
    totalCount,
    loading,
    error,
    refresh,
    hasMore,
    loadMore
  } = useExperts({
    programId: 'your-program-id',
    filters: {
      available: true,
      location: 'San Francisco',
      sortBy: 'relevance'
    },
    onSuccess: (data) => console.log('Loaded:', data),
    onError: (error) => console.error('Error:', error)
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {experts.map(expert => (
        <ExpertCard key={expert.id} expert={expert} />
      ))}
      {hasMore && (
        <button onClick={loadMore}>Load More</button>
      )}
    </div>
  );
}
```

---

## 🎬 Video & Media Handling

### Automatic Video Detection

The SDK automatically detects and handles video content:

```tsx
// Automatically becomes <video> element for MP4s
<MediaRenderer src="https://example.com/project.mp4" />

// Remains <img> element for images
<MediaRenderer src="https://example.com/project.jpg" />
```

### Supported Video Formats
- `.mp4`, `.webm`, `.mov`, `.avi`, `.mkv`, `.ogg`
- Cloudinary video URLs

### Video Configuration

```tsx
<ContraProvider config={{
  videoAutoplay: false,    // Auto-play videos
  videoHoverPlay: true,    // Play on hover
  videoMuted: true,        // Mute by default
  videoLoop: true,         // Loop playback
  videoControls: false     // Show controls
}}>
```

### Professional Features
- **Hover-to-play**: Engaging UX without autoplay
- **Fallback handling**: Thumbnail extraction for failed videos
- **Performance**: Lazy loading and preload metadata
- **Cloudinary support**: Special handling for Cloudinary URLs

---

## 🎨 Styling & Customization

### CSS Classes

All components use BEM methodology:

```css
.contra-expert-card { }
.contra-expert-card__header { }
.contra-expert-card__avatar { }
.contra-expert-card__stats { }
.contra-expert-card--horizontal { }

.contra-expert-grid { }
.contra-expert-grid__loading { }
.contra-expert-grid__error { }
.contra-expert-grid__empty { }

.contra-star-rating { }
.contra-media-container { }
.contra-media-error { }
```

### Inline Styles

Components accept standard React style props:

```tsx
<ExpertCard
  expert={expert}
  style={{
    border: '2px solid #e5e7eb',
    borderRadius: '20px',
    padding: '2rem'
  }}
  className="custom-expert-card"
/>
```

### Theme Support

```tsx
<ContraProvider config={{
  theme: 'dark' // 'light' | 'dark' | 'auto'
}}>
```

---

## ⚡ Performance Optimization

### Virtualization

Enable for large lists:

```tsx
<ContraProvider config={{
  enableVirtualization: true
}}>
```

### Caching Strategies

```tsx
<ContraProvider config={{
  cacheStrategy: 'aggressive' // 'aggressive' | 'normal' | 'minimal'
}}>
```

**Cache TTLs:**
- Experts: 5 minutes
- Program: 30 minutes  
- Filters: 60 minutes

### Infinite Scroll

```tsx
<ExpertGrid
  experts={experts}
  hasMore={hasMore}
  onLoadMore={loadMore}
  loadMoreThreshold={200} // pixels before bottom
/>
```

### Canvas Optimization (Framer)

```tsx
// Automatically shows placeholders on Framer canvas
// Real data loads in preview/published site
```

---

## 📘 TypeScript Support

Full TypeScript support with exported types:

```tsx
import type {
  ExpertProfile,
  ExpertFilters,
  ContraConfig,
  ExpertCardProps,
  ExpertGridProps,
  UseExpertsOptions,
  UseExpertsResult
} from '@contra/react';
```

### Custom Expert Types

```tsx
interface CustomExpert extends ExpertProfile {
  customField: string;
}

const expert: CustomExpert = {
  ...baseExpert,
  customField: 'value'
};
```

---

## 🛠️ Troubleshooting

### Common Issues

#### 1. "useContraContext must be used within ContraProvider"

**Solution**: Wrap your app with ContraProvider:

```tsx
<ContraProvider config={config}>
  <YourApp />
</ContraProvider>
```

#### 2. Videos not playing

**Solution**: Check video configuration:

```tsx
{
  videoMuted: true,     // Required for autoplay
  videoHoverPlay: true  // Or videoAutoplay: true
}
```

#### 3. Framer component not updating

**Solution**: 
- Check API key and program ID
- Enable debug mode
- Verify network requests in console

### Debug Mode

```tsx
<ContraProvider config={{
  debug: true // Enables console logging
}}>
```

### Error Boundaries

Wrap components for production:

```tsx
import { ErrorBoundary } from 'react-error-boundary';

<ErrorBoundary fallback={<div>Something went wrong</div>}>
  <ExpertGrid programId={programId} />
</ErrorBoundary>
```

---

## 📞 Support

### Resources

- **Documentation**: Full API reference
- **Examples**: Code samples and demos
- **Issues**: GitHub issue tracker

### Reporting Issues

Include:
1. React/Framer version
2. Component configuration
3. Console errors
4. Network requests
5. Expected vs actual behavior

---

## 📄 License

MIT License - See LICENSE file for details.

---

*Built with ❤️ for the top 0.1% of implementations* 