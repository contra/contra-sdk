# Contra Webflow SDK

JavaScript runtime for embedding Contra expert directories in Webflow projects.

Version: 1.0.0 | License: MIT

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Configuration](#configuration)
3. [Attributes Reference](#attributes-reference)
4. [Advanced Features](#advanced-features)
5. [Media Handling](#media-handling)
6. [Filtering & Search](#filtering--search)
7. [Styling & Customization](#styling--customization)
8. [Events & JavaScript API](#events--javascript-api)
9. [Performance & Caching](#performance--caching)
10. [Troubleshooting](#troubleshooting)
11. [Best Practices](#best-practices)
12. [Support](#support)

---

## 🚀 Quick Start

### 1. Basic Implementation

Add this HTML structure to your Webflow page:

```html
<!-- Configuration Script (Required) -->
<script id="contra-config" type="application/json">
{
  "apiKey": "your_api_key",           // Required: Your API key
  "debug": false,                     // Optional: Enable debug logging
  "autoReload": true,                 // Optional: Auto-reload on filter changes
  "debounceDelay": 300,              // Optional: Filter debounce delay (ms)
  "maxRetries": 3,                   // Optional: API retry attempts
  
  // Video Configuration
  "videoAutoplay": false,            // Optional: Auto-play videos
  "videoHoverPlay": true,            // Optional: Play on hover
  "videoMuted": true,               // Optional: Mute videos
  "videoLoop": true,                // Optional: Loop videos
  "videoControls": false            // Optional: Show video controls
}
</script>

<!-- Program ID is specified on the container element -->
<div data-contra-program="your_program_id">
  <!-- Expert Directory Container -->
  <div data-contra-program="your_program_id" data-contra-limit="20">
    <!-- Expert Card Template -->
    <article data-contra-template class="expert-card" style="display: none;">
      <header class="expert-header">
        <img data-contra-field="avatarUrl" class="expert-avatar" alt="Expert Profile" loading="lazy">
        <div class="expert-info">
          <h3 data-contra-field="name" class="expert-name">Expert Name</h3>
          <p data-contra-field="location" class="expert-location">Location</p>
          <p data-contra-field="oneLiner" class="expert-bio">Expert Bio</p>
        </div>
        <span data-contra-show-when="available:true" class="availability-badge">
          Available
        </span>
      </header>
      
      <div class="expert-stats">
        <div class="stat">
          <span data-contra-field="earningsUSD" data-contra-format="earnings" class="stat-value">$0</span>
          <span class="stat-label">Earned</span>
        </div>
        <div class="stat">
          <div data-contra-stars class="star-rating"></div>
          <span data-contra-field="averageReviewScore" class="rating-value">0</span>
        </div>
      </div>
      
      <footer class="expert-actions">
        <a data-contra-field="profileUrl" class="profile-link" target="_blank" rel="noopener">
          View Profile
        </a>
        <a data-contra-field="inquiryUrl" class="contact-btn" target="_blank" rel="noopener">
          Contact Expert
        </a>
      </footer>
    </article>
    
    <!-- Loading State -->
    <div data-contra-loading class="loading-state" style="display: none;">
      <div class="loading-spinner"></div>
      <p>Loading experts...</p>
    </div>
    
    <!-- Error State -->
    <div data-contra-error class="error-state" style="display: none;"></div>
    
    <!-- Empty State -->
    <div data-contra-empty class="empty-state" style="display: none;">
      <p>No experts found matching your criteria.</p>
    </div>
  </div>

<!-- SDK Runtime (Required) -->
<script src="https://unpkg.com/@contra/webflow@latest/dist/runtime.min.js"></script>
```

### 2. Get Your Credentials

Contact Contra to obtain:
- **Program ID**: Your unique program identifier
- **API Key**: Authentication key for API access

---

## ⚙️ Configuration

### Global Configuration

Configure the SDK via a JSON script tag with ID `contra-config`:

```html
<script id="contra-config" type="application/json">
{
  "apiKey": "your_api_key",           // Required: Your API key
  "debug": false,                     // Optional: Enable debug logging
  "autoReload": true,                 // Optional: Auto-reload on filter changes
  "debounceDelay": 300,              // Optional: Filter debounce delay (ms)
  "maxRetries": 3,                   // Optional: API retry attempts
  
  // Video Configuration
  "videoAutoplay": false,            // Optional: Auto-play videos
  "videoHoverPlay": true,            // Optional: Play on hover
  "videoMuted": true,               // Optional: Mute videos
  "videoLoop": true,                // Optional: Loop videos
  "videoControls": false            // Optional: Show video controls
}
</script>
```

### Configuration Options Reference

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | `string` | **Required** | Your API authentication key |
| `debug` | `boolean` | `false` | Enable console debugging |
| `autoReload` | `boolean` | `true` | Auto-refresh when filters change |
| `debounceDelay` | `number` | `300` | Delay before applying filter changes (ms) |
| `maxRetries` | `number` | `3` | Number of API retry attempts |
| `videoAutoplay` | `boolean` | `false` | Auto-play video content |
| `videoHoverPlay` | `boolean` | `true` | Play videos on hover |
| `videoMuted` | `boolean` | `true` | Mute video playback |
| `videoLoop` | `boolean` | `true` | Loop video content |
| `videoControls` | `boolean` | `false` | Show video player controls |

---

## 📖 Attributes Reference

### Container Attributes

#### `data-contra-program`
**Required on container element**
```html
<div data-contra-program="your_program_id">
  <!-- Expert cards will be populated here -->
</div>
```

#### `data-contra-limit`
**Optional pagination control**
```html
<div data-contra-program="your_program_id" data-contra-limit="10">
```

### Template & Display Attributes

#### `data-contra-template`
**Required on template element**
```html
<div data-contra-template class="expert-card" style="display: none;">
  <!-- This element will be cloned for each expert -->
</div>
```

#### `data-contra-loading`
**Loading state element**
```html
<div data-contra-loading class="loading-spinner">
  Loading experts...
</div>
```

#### `data-contra-error`
**Error state element**
```html
<div data-contra-error class="error-message">
  <!-- Error messages will appear here -->
</div>
```

#### `data-contra-empty`
**Empty state element**
```html
<div data-contra-empty class="empty-state">
  No experts match your criteria.
</div>
```

### Field Binding Attributes

#### `data-contra-field`
**Bind data fields to elements**

**Available Fields:**
- `name` - Expert name
- `profileUrl` - Link to expert profile
- `inquiryUrl` - Link to send inquiry
- `avatarUrl` - Profile image
- `tagline` - Professional tagline
- `location` - Geographic location
- `hourlyRateUSD` - Hourly rate in USD
- `earningsUSD` - Total earnings
- `projectsCompletedCount` - Number of completed projects
- `averageReviewScore` - Star rating (1-5)
- `followersCount` - Number of followers
- `available` - Availability status (boolean)

**Project Fields:**
- `title` - Project name/title
- `projectUrl` - Link to project
- `coverUrl` - Project image/video

**Social Link Fields:**
- `url` - Social platform URL
- `label` - Platform name

```html
<!-- Text content -->
<h3 data-contra-field="name">Expert Name</h3>
<p data-contra-field="oneLiner">Expert Bio</p>
<span data-contra-field="location">Location</span>

<!-- Links -->
<a data-contra-field="profileUrl" target="_blank">View Profile</a>
<a data-contra-field="inquiryUrl" target="_blank">Contact Expert</a>

<!-- Images -->
<img data-contra-field="avatarUrl" alt="Expert Avatar">

<!-- Numbers -->
<span data-contra-field="hourlyRateUSD">$0</span>
<span data-contra-field="followersCount">0</span>
```

#### `data-contra-format`
**Format field values**

**Available Formats:**
- `rate` - Format hourly rate (`$150/hr` or `Rate on request`)
- `earnings` - Format earnings (`$25k+`, `$1M+`)
- `rating` - Format rating to one decimal place (`5.0`, `4.9`)
- `currency` - Add dollar sign prefix
- `number` - Add thousand separators
- `boolean` - Convert to Yes/No
- `availability` - Convert to Available/Not Available
- `truncate` - Limit to 100 characters

```html
<span data-contra-field="hourlyRateUSD" data-contra-format="rate">$0/hr</span>
<span data-contra-field="earningsUSD" data-contra-format="earnings">$0</span>
<span data-contra-field="averageReviewScore" data-contra-format="rating">0.0</span>
<span data-contra-field="followersCount" data-contra-format="number">0</span>
<span data-contra-field="available" data-contra-format="availability">Available</span>
```

### Repeating Elements

#### `data-contra-repeat`
**Display arrays of data**

**Available Collections:**
- `projects` - Expert's project portfolio
- `skillTags` - Skill/technology tags
- `socialLinks` - Social media links

```html
<!-- Projects Grid -->
<div data-contra-repeat="projects" data-contra-max="4" class="projects-grid">
  <a data-contra-field="projectUrl" class="project-link" target="_blank" rel="noopener">
    <img data-contra-field="coverUrl" class="project-image" alt="Project">
    <h4 data-contra-field="title" class="project-title">Project Title</h4>
  </a>
</div>

<!-- Skill Tags -->
<div data-contra-repeat="skillTags" data-contra-max="6" class="skill-tags">
  <span data-contra-field="name" class="skill-tag">Skill</span>
</div>

<!-- Social Links -->
<div data-contra-repeat="socialLinks" class="social-links">
  <a data-contra-field="url" target="_blank">
    <span data-contra-field="label">Social Platform</span>
  </a>
</div>
```

#### `data-contra-max`
**Limit number of repeated items**
```html
<div data-contra-repeat="projects" data-contra-max="4">
  <!-- Shows maximum 4 projects -->
</div>
```

### Conditional Display

#### `data-contra-show-when`
**Show element when condition is met**
```html
<!-- Show availability indicator when expert is available -->
<span data-contra-show-when="available:true" class="available-badge">
  🟢 Available Now
</span>

<!-- Show premium badge for high earners -->
<span data-contra-show-when="earningsUSD:>100000" class="premium-badge">
  Top Earner
</span>
```

**Availability Examples:**
```html
<!-- Simple availability text (recommended) -->
<span data-contra-show-when="available:true" class="availability-text">
  Available
</span>

<!-- With styling -->
<span data-contra-show-when="available:true" class="availability-badge">
  🟢 Available Now
</span>

<!-- Custom availability message -->
<div data-contra-show-when="available:true" class="availability-card">
  <p>This expert is currently available for new projects!</p>
</div>
```

**Debug Availability:**
To troubleshoot availability display, enable debug mode:
```json
{
  "debug": true
}
```
This will log condition evaluations in the browser console.

#### `data-contra-hide-when`
**Hide element when condition is met**
```html
<!-- Hide rate if not specified -->
<div data-contra-hide-when="hourlyRateUSD:null" class="rate-section">
  <span data-contra-field="hourlyRateUSD" data-contra-format="rate"></span>
</div>
```

**Condition Operators:**
- `field:value` - Exact match (case-insensitive)
- `field:>value` - Greater than (numeric)
- `field:<value` - Less than (numeric)
- `field:>=value` - Greater than or equal (numeric)
- `field:<=value` - Less than or equal (numeric)

**Examples:**
```html
<!-- Show for available experts -->
<span data-contra-show-when="available:true">Available Now</span>

<!-- Show for high earners -->
<span data-contra-show-when="earningsUSD:>100000">Top Earner</span>

<!-- Hide if no rate specified -->
<div data-contra-hide-when="hourlyRateUSD:null">Rate info</div>
```

### Special Features

#### `data-contra-stars`
**Display star rating**
```html
<div data-contra-stars class="star-rating">
  <!-- Automatically filled with star rating based on averageReviewScore -->
</div>
```

#### `data-contra-rating-text`
**Display rating as formatted text**
```html
<!-- Displays "5.0", "4.9", etc. with one decimal place -->
<span data-contra-rating-text class="rating-text">0.0</span>

<!-- Combined star and text rating -->
<div class="rating-display">
  <div data-contra-stars class="star-rating"></div>
  <span data-contra-rating-text class="rating-score">0.0</span>
</div>
```

#### `data-contra-pagination-info`
**Display pagination information**
```html
<div data-contra-pagination-info class="pagination-info">
  <!-- Automatically shows "Page X of Y (Z total)" -->
</div>
```

#### `data-contra-filter-summary`
**Display active filters summary**
```html
<div data-contra-filter-summary class="filter-summary">
  <!-- Shows currently applied filters -->
</div>
```

### Action Buttons

#### `data-contra-action`
**Interactive action buttons**
```html
<!-- Pagination Actions -->
<button data-contra-action="next-page">Next Page</button>
<button data-contra-action="prev-page">Previous Page</button>

<!-- Filter Actions -->
<button data-contra-action="clear-filters">Clear All Filters</button>
<button data-contra-action="reload">Reload Data</button>
```

**Available Actions:**
- `next-page` - Load next page of results
- `prev-page` - Load previous page of results
- `clear-filters` - Remove all applied filters
- `reload` - Clear cache and reload data

---

## 🎯 Advanced Features

### Project Layouts

#### Standard 4-Column Grid
```html
<div data-contra-repeat="projects" data-contra-max="4" class="projects-grid">
  <a data-contra-field="projectUrl" class="project-link" target="_blank" rel="noopener">
    <img data-contra-field="coverUrl" class="project-thumbnail" loading="lazy" alt="Project">
  </a>
</div>
```

#### Detailed Project Cards
```html
<div data-contra-repeat="projects" data-contra-max="3" class="detailed-projects">
  <div class="project-card">
    <a data-contra-field="projectUrl" target="_blank" rel="noopener">
      <img data-contra-field="coverUrl" class="project-image" loading="lazy" alt="Project">
    </a>
    <div class="project-info">
      <h4 data-contra-field="title" class="project-title">Project Title</h4>
      <a data-contra-field="projectUrl" class="project-link" target="_blank" rel="noopener">
        View Project
      </a>
    </div>
  </div>
</div>
```

### Stats Layout

```html
<div class="expert-stats">
  <div class="stat">
    <span data-contra-field="earningsUSD" data-contra-format="earnings" class="stat-value">$0</span>
    <span class="stat-label">Earned</span>
  </div>
  <div class="stat">
    <span data-contra-field="projectsCompletedCount" class="stat-value">0</span>
    <span class="stat-label">Projects</span>
  </div>
  <div class="stat">
    <div data-contra-stars class="star-rating"></div>
    <span data-contra-field="averageReviewScore" class="stat-value">0</span>
    <span class="stat-label">Rating</span>
  </div>
  <div class="stat">
    <span data-contra-field="followersCount" data-contra-format="number" class="stat-value">0</span>
    <span class="stat-label">Followers</span>
  </div>
</div>
```

---

## 🎬 Media Handling

The SDK automatically detects and handles different media types with fallbacks.

### Automatic Video Detection

The SDK automatically converts video URLs to proper `<video>` elements for project cover images:

```html
<!-- This will become a video element if coverUrl is a video -->
<img data-contra-field="coverUrl" class="project-media" alt="Project Media">

<!-- Avatar images remain as regular images -->
<img data-contra-field="avatarUrl" class="avatar" alt="Expert Avatar">
```

**Video Detection:**
- **Applies to**: `coverUrl` fields only (project media)
- **Image fields**: `avatarUrl` and other image fields remain as standard images
- **Supported formats**: `.mp4`, `.webm`, `.mov`, `.avi`, `.mkv`, `.ogg`
- **Cloudinary**: Special handling for Cloudinary video URLs

### Video Configuration

Configure video behavior globally:

```json
{
  "videoAutoplay": false,     // Recommended: false for better UX
  "videoHoverPlay": true,     // Play videos on hover
  "videoMuted": true,         // Required for autoplay in browsers
  "videoLoop": true,          // Loop video content
  "videoControls": false      // Hide/show video controls
}
```

### Video Features

- **Hover-to-Play**: Videos play on mouse hover (default behavior)
- **Autoplay Support**: Configurable autoplay with mute
- **Fallback Handling**: Automatic thumbnail extraction for failed videos
- **Cloudinary Integration**: Special handling for Cloudinary video URLs
- **Performance Optimized**: Lazy loading and metadata preloading

### Media Best Practices

```html
<!-- Recommended: Use aspect-ratio containers -->
<div class="media-container" style="aspect-ratio: 16/9;">
  <img data-contra-field="coverUrl" class="media-fill" loading="lazy" alt="Project Media">
</div>

<!-- CSS for responsive media -->
<style>
.media-container {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
}

.media-fill {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
```

---

## 🔍 Filtering & Search

### Filter Controls

Add filter controls that automatically update the expert list:

```html
<!-- Dropdown Filters -->
<select data-contra-filter="sortBy">
  <option value="relevance">Most Relevant</option>
  <option value="newest">Newest</option>
  <option value="oldest">Oldest</option>
</select>

<!-- Checkbox Filters -->
<label>
  <input type="checkbox" data-contra-filter="available" value="true">
  Available Only
</label>

<!-- Range Filters -->
<div class="rate-filter">
  <input type="number" data-contra-filter="minRate" placeholder="Min Rate">
  <input type="number" data-contra-filter="maxRate" placeholder="Max Rate">
</div>

<!-- Text Filters -->
<input type="text" data-contra-filter="location" placeholder="Location">

<!-- Multi-Select Filters -->
<select data-contra-filter="languages" multiple>
  <option value="English">English</option>
  <option value="Spanish">Spanish</option>
  <option value="French">French</option>
</select>
```

### Available Filters

**Supported Filters:**

| Filter | Input Type | Description | Values |
|--------|------------|-------------|---------|
| `available` | checkbox | Availability status | `true`, `false` |
| `location` | text | Geographic location | Any string |
| `languages` | select/checkbox | Spoken languages | Language codes |
| `minRate` | number | Minimum hourly rate | Number in USD |
| `maxRate` | number | Maximum hourly rate | Number in USD |

### Filter Attributes

You can also set default filters directly on the container:

```html
<!-- Show only available experts by default -->
<div data-contra-program="spline_expert" data-contra-available="true" data-contra-limit="20">
  <!-- Expert cards -->
</div>

<!-- Set default location filter -->
<div data-contra-program="spline_expert" data-contra-location="New York" data-contra-limit="20">
  <!-- Expert cards -->
</div>
```

### Filter Types

#### `data-contra-filter-type`
**Control filter behavior**

```html
<!-- Replace filter value (default) -->
<input data-contra-filter="skillTags" data-contra-filter-type="replace">

<!-- Append to filter array -->
<input data-contra-filter="skillTags" data-contra-filter-type="append">
```

### Advanced Filter Modal

```html
<!-- Filter Modal -->
<div id="filter-modal" class="modal">
  <div class="modal-content">
    <h3>Filter Experts</h3>
    
    <div class="filter-group">
      <label>Sort by</label>
      <select data-contra-filter="sortBy">
        <option value="relevance">Relevance</option>
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
      </select>
    </div>
    
    <div class="filter-group">
      <label>Hourly Rate Range</label>
      <div class="rate-inputs">
        <input type="number" data-contra-filter="minRate" placeholder="Min $">
        <input type="number" data-contra-filter="maxRate" placeholder="Max $">
      </div>
    </div>
    
    <div class="filter-group">
      <label>
        <input type="checkbox" data-contra-filter="available" value="true">
        Available Only
      </label>
    </div>
    
    <div class="filter-group">
      <label>Location</label>
      <input data-contra-filter="location" placeholder="e.g. San Francisco">
    </div>
    
    <div class="filter-group">
      <label>Languages</label>
      <select data-contra-filter="languages" multiple size="4">
        <option value="English">English</option>
        <option value="Spanish">Spanish</option>
        <option value="French">French</option>
        <option value="German">German</option>
      </select>
    </div>
    
    <div class="modal-actions">
      <button id="clear-filters">Clear All</button>
      <button id="apply-filters">Apply Filters</button>
    </div>
  </div>
</div>
```

---

## 🎨 Styling & Customization

### CSS Classes

The SDK adds these classes automatically:

| Class | Applied To | Purpose |
|-------|------------|---------|
| `.contra-runtime` | Container | Indicates SDK is active |
| `.loading` | Container | During data loading |
| `.error` | Container | When errors occur |
| `.empty` | Container | When no results found |

### Responsive Design Example

```css
/* Expert Cards */
.expert-card {
  border: 1px solid #e4e7ec;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  background: white;
  transition: all 0.2s ease;
}

.expert-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transform: translateY(-2px);
}

/* Avatar */
.expert-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
}

/* Stats Grid */
.expert-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  padding: 1rem 0;
  border-top: 1px solid #f3f4f6;
  border-bottom: 1px solid #f3f4f6;
}

.stat {
  text-align: center;
}

.stat-value {
  display: block;
  font-weight: 600;
  font-size: 1.25rem;
  color: #111827;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
}

/* Projects Grid */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  margin-top: 1rem;
}

.project-thumbnail {
  width: 100%;
  aspect-ratio: 4/3;
  object-fit: cover;
  border-radius: 8px;
  transition: transform 0.2s ease;
}

.project-thumbnail:hover {
  transform: scale(1.02);
}

/* Star Rating */
.star-rating {
  display: inline-flex;
  gap: 2px;
}

.contra-star {
  font-size: 14px;
}

.contra-star-full {
  color: #fbbf24;
}

.contra-star-half {
  color: #fbbf24;
}

.contra-star-empty {
  color: #e5e7eb;
}

/* Responsive Breakpoints */
@media (max-width: 768px) {
  .projects-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .expert-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .expert-card {
    padding: 1rem;
  }
  
  .projects-grid {
    grid-template-columns: 1fr;
  }
}
```

### Loading States

```css
/* Loading Animation */
.loading-state {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.loading-spinner {
  display: inline-block;
  width: 32px;
  height: 32px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error States */
.error-state {
  background: #fee2e2;
  color: #dc2626;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
}

/* Empty States */
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
  background: #f9fafb;
  border-radius: 8px;
}
```

---

## 🔌 Events & JavaScript API

### Custom Events

The SDK dispatches custom events for integration:

```javascript
// Expert data loaded successfully
document.addEventListener('contra:expertsLoaded', (event) => {
  console.log('Experts loaded:', event.detail);
  // event.detail.experts - Array of expert data
  // event.detail.totalCount - Total number of experts
  // event.detail.filters - Applied filters
});

// Error occurred
document.addEventListener('contra:expertsError', (event) => {
  console.error('SDK Error:', event.detail);
  // event.detail.error - Error object
  // event.detail.context - Error context
});

// Filter changed
document.addEventListener('contra:filterChange', (event) => {
  console.log('Filters changed:', event.detail);
  // event.detail.filters - New filter values
  // event.detail.element - Container element
});
```

### JavaScript API

Access the runtime programmatically:

```javascript
// Access the global runtime instance (available after auto-initialization)
const runtime = window.contraRuntime;

// Clear cache for a specific program
runtime.client.clearCache('experts:your_program_id');

// Clear all cache
runtime.client.clearCache();

// Manual initialization (if needed)
const customRuntime = new ContraWebflowRuntime({
  apiKey: 'your-api-key',
  debug: true,
  videoAutoplay: false
});

// Initialize manually
customRuntime.init();
```

**Available Methods:**
- `runtime.client.clearCache(key?)` - Clear cached data
- `runtime.init()` - Initialize the runtime
- `runtime.log(message, ...args)` - Debug logging (when debug enabled)

**Configuration:**
The runtime is automatically initialized from the `#contra-config` script tag and exposed as `window.contraRuntime`.

### Debugging

Enable debug mode for detailed logging:

```json
{
  "debug": true
}
```

Debug output includes:
- API requests and responses
- Cache hits and misses
- Filter changes
- Media type detection
- Error details

---

## ⚡ Performance & Caching

### Intelligent Caching

The SDK implements caching via the underlying Contra client:

- **Request Deduplication**: Prevents duplicate API calls during the same session
- **Cache Management**: Programmatic cache clearing for fresh data
- **Performance**: Reduces API calls for repeated requests

### Cache Management

```javascript
// Clear specific cache
runtime.client.clearCache('experts:program_id');

// Clear all cache
runtime.client.clearCache();
```

### Performance Features

- **Request Deduplication**: Prevents duplicate API calls
- **Debounced Filters**: Prevents excessive API calls during filtering (configurable delay)
- **Lazy Loading**: Images and videos load on demand
- **Error Handling**: Graceful fallbacks for failed media
- **Auto-retry Logic**: Configurable retry attempts for failed requests

### Best Practices

1. **Limit Results**: Use `data-contra-limit` to control page size
2. **Optimize Images**: Project images are automatically optimized
3. **Lazy Loading**: Always include `loading="lazy"` on images
4. **Cache Strategy**: Configure appropriate TTL for your use case

---

## 🛠️ Troubleshooting

### Common Issues

#### 1. No Experts Loading

**Problem**: Container shows loading state indefinitely

**Solutions**:
```html
<!-- Check configuration -->
<script id="contra-config" type="application/json">
{
  "apiKey": "valid_api_key",
  "debug": true
}
</script>

<!-- Verify container has program attribute -->
<div data-contra-program="correct_program_id">
```

#### 2. Template Not Rendering

**Problem**: Template doesn't clone for experts

**Solutions**:
```html
<!-- Ensure template has required attributes -->
<div data-contra-template style="display: none;">
  <!-- Template content -->
</div>

<!-- Check for JavaScript errors in console -->
```

#### 3. Filters Not Working

**Problem**: Filter controls don't update results

**Solutions**:
```html
<!-- Verify filter attributes -->
<select data-contra-filter="sortBy">
  <option value="relevance">Relevance</option>
</select>

<!-- Check autoReload setting -->
<script id="contra-config" type="application/json">
{
  "autoReload": true
}
</script>
```

#### 4. Media Not Loading

**Problem**: Images or videos don't display

**Solutions**:
```html
<!-- Add proper alt attributes -->
<img data-contra-field="avatarUrl" alt="Expert Avatar">

<!-- Check network tab for failed requests -->
<!-- Verify image URLs are accessible -->
```

### Debug Mode

Enable detailed logging:

```json
{
  "debug": true
}
```

Check browser console for:
- API request/response details
- Cache status
- Configuration validation
- Error messages

### Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Features**: ES2020, Fetch API, Custom Elements
- **Fallbacks**: Automatic error handling and graceful degradation

---

## 📝 Best Practices

### Implementation

1. **Configuration First**: Always set up configuration before loading the SDK
2. **Semantic HTML**: Use proper HTML structure and accessibility attributes
3. **Progressive Enhancement**: Design works without JavaScript, enhanced with SDK
4. **Error Handling**: Include loading, error, and empty states
5. **Performance**: Optimize images and limit results per page

### Template Design

```html
<!-- ✅ Good: Semantic, accessible template -->
<article data-contra-template class="expert-card" style="display: none;">
  <header class="expert-header">
    <img data-contra-field="avatarUrl" class="expert-avatar" alt="Expert Profile" loading="lazy">
    <div class="expert-info">
      <h3 data-contra-field="name" class="expert-name">Expert Name</h3>
      <p data-contra-field="location" class="expert-location">Location</p>
      <span data-contra-show-when="available:true" class="availability-badge" aria-label="Available">
        🟢 Available
      </span>
    </div>
  </header>
  
  <div class="expert-bio">
    <p data-contra-field="oneLiner" class="bio-text">Expert bio</p>
  </div>
  
  <div class="expert-stats" role="group" aria-label="Expert Statistics">
    <div class="stat">
      <span data-contra-field="earningsUSD" data-contra-format="earnings" class="stat-value">$0</span>
      <span class="stat-label">Earned</span>
    </div>
    <div class="stat">
      <div data-contra-stars class="star-rating" role="img" aria-label="Star rating"></div>
      <span data-contra-field="averageReviewScore" class="stat-value">0</span>
    </div>
  </div>
  
  <footer class="expert-actions">
    <a data-contra-field="profileUrl" class="profile-link" target="_blank" rel="noopener">
      View Profile
    </a>
    <a data-contra-field="inquiryUrl" class="cta-button" target="_blank" rel="noopener">
      Contact Expert
    </a>
  </footer>
</article>
```

### CSS Architecture

```css
/* Use BEM methodology for consistent naming */
.expert-card { }
.expert-card__header { }
.expert-card__info { }
.expert-card__stats { }
.expert-card--featured { }

/* Responsive design with mobile-first approach */
.expert-card {
  /* Mobile styles */
}

@media (min-width: 768px) {
  .expert-card {
    /* Tablet styles */
  }
}

@media (min-width: 1024px) {
  .expert-card {
    /* Desktop styles */
  }
}
```

### Security

1. **Content Security Policy**: Configure CSP to allow SDK domain
2. **HTTPS Only**: Always use HTTPS in production
3. **API Key Security**: Never expose API keys in client-side code for public APIs
4. **Link Security**: Use `rel="noopener"` on external links

### Accessibility

```html
<!-- Proper ARIA labels -->
<div data-contra-stars role="img" aria-label="5 star rating"></div>

<!-- Semantic HTML -->
<main role="main">
  <section aria-label="Expert Directory">
    <h2>Find Experts</h2>
    <div data-contra-program="your_program">
      <!-- Expert cards -->
    </div>
  </section>
</main>

<!-- Keyboard navigation -->
<a data-contra-field="profileUrl" class="expert-link" tabindex="0">
  View Expert Profile
</a>
```

---

## 📞 Support

### Getting Help

1. **Documentation**: Review this complete guide
2. **Debug Mode**: Enable debug logging for detailed information
3. **Browser Console**: Check for error messages and warnings
4. **Network Tab**: Verify API requests are successful

### Contact Information

- **Technical Support**: Contact your Contra integration manager
- **API Issues**: Verify API key and program ID with Contra
- **Implementation Help**: Share your HTML structure and configuration

### Reporting Issues

When reporting issues, include:

1. **Configuration**: Your `contra-config` JSON
2. **HTML Structure**: Relevant template and container HTML
3. **Browser Console**: Any error messages
4. **Network Tab**: Failed API requests
5. **Expected vs Actual**: What should happen vs what's happening

### Version Information

- **SDK Version**: 1.0.0
- **API Version**: 1.0.0
- **Last Updated**: 2024
- **Compatibility**: Webflow, HTML, modern browsers

---

## 📄 License

MIT License - See LICENSE file for details.

---

*This documentation covers the complete Contra Expert Directory SDK for Webflow. For the latest updates and support, contact your Contra integration manager.* 