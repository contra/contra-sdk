# Contra SDK for Webflow

A lightweight, attribute-driven SDK for integrating Contra expert data into Webflow projects. Build expert directories using only HTML attributes - no JavaScript required.

## Overview

This SDK provides a runtime script that scans your Webflow site for `data-contra-*` attributes, fetches expert data from the Contra API, and renders it into your HTML elements. It handles everything from initial data loading to dynamic filtering and pagination.

**Core Features:**

*   **Zero-Code Integration:** Build complete expert directories using only HTML attributes
*   **Multi-List Support:** Display multiple independent expert lists from different programs on the same page
*   **Dynamic Filtering:** Connect form elements to lists for live filtering and sorting with automatic option population
*   **Smart Caching:** Optimized API requests with intelligent caching and request deduplication
*   **Advanced Media Handling:** Automatic video/image detection with Cloudinary optimizations
*   **Mobile-Optimized:** Responsive design with touch-friendly interactions

---

## Quick Start

### 1. Add the Runtime Script

Add this script to your Webflow project's custom code (Footer Code section):

```html
<script defer src="https://cdn.jsdelivr.net/gh/contra/contra-sdk@v1.0.0/dist/runtime.min.js"></script>
```

**Version Control:**
- **Recommended:** Use specific version tags (e.g., `@v1.0.0`) for production
- **Latest:** Use `@latest` for automatic updates (may introduce breaking changes)

### 2. Configure the SDK

Add your API configuration:

```html
<script id="contra-config" type="application/json">
{
  "apiKey": "YOUR_CONTRA_API_KEY",
  "debug": false
}
</script>
```

### 3. Create Your Expert Directory

```html
<!-- Expert List Container -->
<div data-contra-list-id="main-directory" data-contra-program="your-program-id">
  
  <!-- Expert Card Template (hidden by default) -->
  <div data-contra-template style="display: none;">
    <img data-contra-field="avatarUrl" alt="Expert Avatar">
    <h3 data-contra-field="name"></h3>
    <p data-contra-field="oneLiner"></p>
    <div data-contra-field="hourlyRateUSD" data-contra-format="rate"></div>
    <div data-contra-stars></div>
    <a data-contra-field="profileUrl" target="_blank">View Profile</a>
  </div>
  
  <!-- State Elements -->
  <div data-contra-loading style="display: none;">Loading experts...</div>
  <div data-contra-empty style="display: none;">No experts found.</div>
  <div data-contra-error style="display: none;">Error loading experts.</div>
</div>
```

---

## Configuration Options

Configure the SDK with a JSON object in a script tag with ID `contra-config`:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | `string` | **Required** | Your Contra API key |
| `debug` | `boolean` | `false` | Enable console logging |
| `loadingClass` | `string` | `'loading'` | CSS class added to containers during loading |
| `errorClass` | `string` | `'error'` | CSS class added to containers on error |
| `emptyClass` | `string` | `'empty'` | CSS class added to containers when no results |
| `videoAutoplay` | `boolean` | `false` | Autoplay videos in project galleries |
| `videoHoverPlay` | `boolean` | `true` | Play videos on hover |
| `videoMuted` | `boolean` | `true` | Mute video playback |
| `videoLoop` | `boolean` | `true` | Loop video content |
| `videoControls` | `boolean` | `false` | Show video controls |
| `imageTransformations` | `string` | `f_auto,q_auto:eco,c_limit,w_800` | Cloudinary image transformations |
| `videoTransformations` | `string` | `fl_progressive,f_auto,q_auto:eco,vc_auto,c_limit,h_720` | Cloudinary video transformations |
| `optimizeGifsAsVideo` | `boolean` | `true` | Convert GIF files to MP4 videos for better performance |
| `contraAnalytics` | `boolean` | `true` | Append analytics parameters to expert URLs |

---

## HTML Attributes Reference

### List Container Attributes

| Attribute | Description |
|-----------|-------------|
| `data-contra-list-id` | **Required.** Unique identifier for the list |
| `data-contra-program` | **Required.** Contra program ID to fetch experts from |
| `data-contra-limit` | Number of experts per page (default: 20) |
| `data-contra-available` | Filter to available experts only (`true`/`false`) |
| `data-contra-location` | Default location filter |
| `data-contra-languages` | Default language filter (comma-separated) |
| `data-contra-min-rate` | Default minimum hourly rate |
| `data-contra-max-rate` | Default maximum hourly rate |
| `data-contra-sort` | Default sort order (`relevance`, `oldest`, `newest`, `rate_asc`, `rate_desc`) |
| `data-contra-offset` | Starting offset for pagination (default: 0) |
| `data-contra-prerender-placeholders` | Render placeholder cards before data loads |

### Template & State Attributes

| Attribute | Description |
|-----------|-------------|
| `data-contra-template` | **Required.** Template element (must be `display: none;`) |
| `data-contra-loading` | Loading state element |
| `data-contra-empty` | Empty state element |
| `data-contra-error` | Error state element |

### Data Binding Attributes

| Attribute | Description |
|-----------|-------------|
| `data-contra-field` | Binds expert data field to element |
| `data-contra-format` | Formats the bound data (see format options below) |
| `data-contra-stars` | Renders 5-star rating from `averageReviewScore` |
| `data-contra-rating-text` | Updates with rating text when stars are rendered |

**Available Fields:**
`id`, `name`, `oneLiner`, `avatarUrl`, `profileUrl`, `inquiryUrl`, `hourlyRateUSD`, `location`, `available`, `averageReviewScore`, `reviewsCount`, `projectsCompletedCount`, `followersCount`, `earningsUSD`, `skillTags`, `socialLinks`, `projects`

**Format Options:**

| Format | Description | Example |
|--------|-------------|---------|
| `rate` | Hourly rate format | `$150/hr` |
| `currency` | Currency format | `$100` |
| `earnings` | Compact earnings | `$25k+` |
| `rating` | One decimal rating | `4.9` |
| `number` | Thousand separators | `10,000` |
| `truncate` | Truncate to 100 chars | `long text...` |
| `boolean` | Yes/No format | `Yes` |
| `availability` | Available/Not Available | `Available` |

### Structural Attributes

| Attribute | Description |
|-----------|-------------|
| `data-contra-repeat` | Repeat element for each item in collection |
| `data-contra-max` | Limit repeated items (use with `data-contra-repeat`) |
| `data-contra-show-when` | Show element when condition is met |
| `data-contra-hide-when` | Hide element when condition is met |

**Repeat Types:**
- `projects` - Expert's project portfolio
- `socialLinks` - Social media links
- `skillTags` - Skill/technology tags

**Conditional Logic:**
- `field:value` - Exact match
- `field:>value` - Greater than
- `field:>=value` - Greater than or equal
- `field:<value` - Less than
- `field:<=value` - Less than or equal

### Filter & Action Attributes

| Attribute | Description |
|-----------|-------------|
| `data-contra-filter` | Makes input/select a live filter |
| `data-contra-action` | Makes button an action trigger |
| `data-contra-list-target` | **Required.** Target list ID for filters/actions |

**Filter Types:**
- `q` - Text search (searches across expert data)
- `sortBy` - Sort options (populated automatically)
- `location` - Location filter (populated automatically)
- `available` - Availability checkbox
- `minRate` - Minimum rate (number/range input)
- `maxRate` - Maximum rate (number/range input)
- `languages` - Language filter (populated automatically)

**Action Types:**
- `load-more` - Load next page of results
- `clear-filters` - Reset all filters for target list

---

## Advanced Examples

### Complete Expert Card

```html
<div data-contra-template style="display: none;">
  <!-- Header -->
  <div class="expert-header">
    <img data-contra-field="avatarUrl" alt="Expert Avatar">
    <div>
      <h3 data-contra-field="name"></h3>
      <p data-contra-field="location"></p>
      <span data-contra-show-when="available:true" class="available-badge">Available</span>
    </div>
  </div>

  <!-- Bio -->
  <p data-contra-field="oneLiner" data-contra-format="truncate"></p>

  <!-- Stats -->
  <div class="stats">
    <div data-contra-stars></div>
    <span data-contra-rating-text></span>
    <span data-contra-field="hourlyRateUSD" data-contra-format="rate"></span>
  </div>

  <!-- Skills -->
  <div class="skills" data-contra-repeat="skillTags" data-contra-max="5">
    <span data-contra-field="name" class="skill-tag"></span>
  </div>
  
  <!-- Projects -->
  <div class="projects" data-contra-repeat="projects" data-contra-max="3">
    <div class="project-card">
      <div data-contra-field="coverUrl" class="project-cover"></div>
      <h4 data-contra-field="title"></h4>
    </div>
  </div>

  <!-- Social Links -->
  <div class="social-links" data-contra-repeat="socialLinks" data-contra-max="4">
    <a data-contra-field="url" target="_blank">
      <span data-contra-field="label"></span>
    </a>
  </div>

  <!-- Actions -->
  <a data-contra-field="profileUrl" target="_blank">View Profile</a>
</div>
```

### Filter Controls

```html
<!-- Search -->
<input type="text" data-contra-filter="q" data-contra-list-target="main-directory" placeholder="Search experts...">

<!-- Sort -->
<select data-contra-filter="sortBy" data-contra-list-target="main-directory">
  <option value="">Sort by...</option>
  <!-- Options populated automatically -->
</select>

<!-- Location -->
<select data-contra-filter="location" data-contra-list-target="main-directory">
  <option value="">All Locations</option>
  <!-- Options populated automatically -->
</select>

<!-- Languages -->
<select data-contra-filter="languages" data-contra-list-target="main-directory">
  <option value="">All Languages</option>
  <!-- Options populated automatically -->
</select>

<!-- Rate Range -->
<input type="range" data-contra-filter="minRate" data-contra-list-target="main-directory" min="0" max="500">
<input type="range" data-contra-filter="maxRate" data-contra-list-target="main-directory" min="0" max="500">

<!-- Availability -->
<label>
  <input type="checkbox" data-contra-filter="available" data-contra-list-target="main-directory" value="true">
  Available Now
</label>

<!-- Actions -->
<button data-contra-action="load-more" data-contra-list-target="main-directory">Load More</button>
<button data-contra-action="clear-filters" data-contra-list-target="main-directory">Clear Filters</button>
```

### Multiple Lists

```html
<!-- Flutter Experts -->
<div data-contra-list-id="flutter-experts" data-contra-program="flutter-program-id">
  <div data-contra-template style="display: none;">
    <!-- Template content -->
  </div>
</div>

<!-- React Experts -->
<div data-contra-list-id="react-experts" data-contra-program="react-program-id">
  <div data-contra-template style="display: none;">
    <!-- Template content -->
  </div>
</div>

<!-- Independent filters for each list -->
<select data-contra-filter="sortBy" data-contra-list-target="flutter-experts">
  <option value="">Sort Flutter Experts</option>
</select>

<select data-contra-filter="sortBy" data-contra-list-target="react-experts">
  <option value="">Sort React Experts</option>
</select>
```

---

## Advanced Features

### Video & Media Handling

The SDK automatically detects and handles video content in project galleries:

- **Auto-detection**: Differentiates between images and videos
- **Cloudinary optimization**: Applies transformations for optimal performance
- **GIF to MP4 conversion**: Converts GIFs to MP4 for better performance
- **Hover-to-play**: Videos play on hover (configurable)
- **Fallback handling**: Graceful fallback for failed video loads

### Star Rating System

Use `data-contra-stars` to render visual star ratings:

```html
<div data-contra-stars></div>
<span data-contra-rating-text></span>
```

This creates:
- Visual 5-star rating display
- Automatic rating text updates
- Half-star support
- CSS classes for styling: `contra-star`, `contra-star-full`, `contra-star-half`, `contra-star-empty`

### Analytics Integration

When `contraAnalytics` is enabled, the SDK automatically appends tracking parameters to expert URLs:

- `contra_source=webflow_sdk`
- `contra_program_id=<program-id>`
- `contra_list_id=<list-id>`
- `contra_filters=<serialized-filters>`

### Conditional Display

Show/hide elements based on expert data:

```html
<!-- Show only for available experts -->
<div data-contra-show-when="available:true">Available now!</div>

<!-- Show for highly rated experts -->
<div data-contra-show-when="averageReviewScore:>=4.5">Top Rated</div>

<!-- Hide for experts with low rates -->
<div data-contra-hide-when="hourlyRateUSD:<50">Premium Expert</div>
```

### CSS Classes

The SDK automatically adds CSS classes for styling and behavior:

**Container Classes:**
- `contra-list` - Added to all list containers during initialization
- `loading` - Added during loading states (configurable via `loadingClass`)
- `error` - Added when errors occur (configurable via `errorClass`)
- `empty` - Added when no results found (configurable via `emptyClass`)

**Item Classes:**
- `contra-placeholder-item` - Added to placeholder cards during prerendering
- `contra-rendered-item` - Added to actual expert cards after rendering

**Star Rating Classes:**
- `contra-star` - Base class for all star elements
- `contra-star-full` - Full star (★)
- `contra-star-half` - Half star (★)
- `contra-star-empty` - Empty star (☆)

---

## Development

This project uses TypeScript and tsup for building:

```bash
# Install dependencies
npm install

# Development with watch mode
npm run dev

# Build for production
npm run build
```

### Project Structure

```
src/
├── index.ts          # NPM package entry point
├── runtime.ts        # Webflow runtime (builds to runtime.min.js)
├── client.ts         # API client with caching
└── types.ts          # TypeScript definitions

dist/
├── runtime.min.js    # CDN runtime script
├── index.js          # NPM CommonJS build
└── index.mjs         # NPM ES module build
```

### Publishing

New versions are published via Git tags (see [CONTRIBUTING.md](./CONTRIBUTING.md)):

1. Build the project: `npm run build`
2. Commit built files: `git add dist/ && git commit -m "build: vX.X.X"`
3. Tag the release: `git tag vX.X.X`
4. Push: `git push && git push --tags`
5. CDN available at: `https://cdn.jsdelivr.net/gh/contra/contra-sdk@vX.X.X/dist/runtime.min.js`

---

## License

MIT 