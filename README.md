# Contra SDK v2.0 🚀

**Professional-grade SDK for integrating Contra experts into Webflow and Framer projects**

[![npm version](https://badge.fury.io/js/%40contra%2Fwebflow.svg)](https://badge.fury.io/js/%40contra%2Fwebflow)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![CDN Ready](https://img.shields.io/badge/CDN-jsDelivr-orange.svg)](https://www.jsdelivr.com/)

## 🌟 **What Makes This Special**

This is a **complete rewrite** designed by top-tier engineers with enterprise-grade features:

- **🎯 Zero-Code Webflow Integration** - Just add attributes to your design
- **⚡ Performance Optimized** - Caching, debouncing, virtual scrolling
- **🔧 Professional Architecture** - Modular packages, TypeScript, proper error handling
- **🎨 Attribute-Driven** - No coding required for Webflow users
- **⚛️ React Components** - Full Framer support with property controls
- **📱 Production Ready** - Used by professional teams

---

## 🚀 **Quick Start**

### **For Webflow (No Coding Required)**

1. **Add the script to your site:**
```html
<script src="https://cdn.jsdelivr.net/gh/javron/contra-sdk@main/packages/contra-webflow/dist/runtime.min.js"></script>
```

2. **Add your API configuration:**
```html
<script id="contra-config" type="application/json">
{
  "apiKey": "your-contra-api-key",
  "debug": false
}
</script>
```

3. **Design your expert card and add attributes:**
```html
<div data-contra-program="your-program-nid">
  <!-- Expert card template (hidden by default) -->
  <div data-contra-template style="display: none;">
    <img data-contra-field="avatarUrl" alt="Expert Avatar">
    <h3 data-contra-field="name"></h3>
    <p data-contra-field="oneLiner"></p>
    <div data-contra-field="hourlyRateUSD" data-contra-format="rate"></div>
    <div data-contra-stars></div>
    
    <!-- Projects -->
    <div data-contra-repeat="projects" data-contra-max="3">
      <div>
        <img data-contra-field="coverUrl" alt="Project">
        <a data-contra-field="projectUrl">
          <span data-contra-field="title"></span>
        </a>
      </div>
    </div>
  </div>
  
  <!-- Loading state -->
  <div data-contra-loading style="display: none;">Loading experts...</div>
  
  <!-- Error state -->
  <div data-contra-error style="display: none;"></div>
  
  <!-- Empty state -->
  <div data-contra-empty style="display: none;">No experts found.</div>
</div>
```

**Note:** Use your actual program NID (node ID) from Contra, not a generic program ID.

4. **Add filter controls (optional):**
```html
<select data-contra-filter="location">
  <option value="">All Locations</option>
  <option value="United States">United States</option>
  <option value="United Kingdom">United Kingdom</option>
</select>

<input type="range" data-contra-filter="minRate" min="0" max="200" step="10">
<input type="checkbox" data-contra-filter="available" value="true">
```

**That's it!** Your expert directory is live with filtering, pagination, and real-time updates.

---

### **For Framer (React Components)**

1. **Install the package:**
```bash
npm install @contra/react
```

2. **Use in your Framer code component:**
```tsx
import { ExpertListFramer } from "@contra/react"

export default function ContraExperts(props) {
  return (
    <ExpertListFramer
      programId={props.programId}
      apiKey={props.apiKey}
      showFilters={props.showFilters}
      maxExperts={props.maxExperts}
    />
  )
}

// Property controls for Framer
ExpertListFramer.defaultProps = {
  programId: "your-program-id",
  apiKey: "your-api-key",
  showFilters: true,
  maxExperts: 20
}
```

---

## 📦 **Package Architecture**

```
contra-sdk/
├── @contra/types          # TypeScript definitions from OpenAPI
├── @contra/client         # Core API client with caching
├── @contra/webflow        # Attribute-driven Webflow runtime  
└── @contra/react          # React components for Framer
```

### **🎯 @contra/webflow** - *The Star of the Show*

**CDN URL:** `https://cdn.jsdelivr.net/gh/javron/contra-sdk@main/packages/contra-webflow/dist/runtime.min.js`

**Features:**
- ✅ **Zero JavaScript knowledge required**
- ✅ **Automatic data binding** with `data-contra-field`
- ✅ **Smart filtering** with `data-contra-filter`
- ✅ **Template cloning** with `data-contra-template`
- ✅ **Repeating elements** with `data-contra-repeat`
- ✅ **Conditional display** with `data-contra-show-when`
- ✅ **Loading/error states** built-in
- ✅ **Performance optimized** (caching, debouncing)
- ✅ **Mobile responsive** out of the box

---

## 🎨 **Advanced Webflow Features**

### **Data Binding Attributes**

| Attribute | Purpose | Example |
|-----------|---------|---------|
| `data-contra-field="name"` | Bind expert data | `<h3 data-contra-field="name"></h3>` |
| `data-contra-format="rate"` | Format display | `<span data-contra-field="hourlyRateUSD" data-contra-format="rate"></span>` |
| `data-contra-stars` | Show star rating | `<div data-contra-stars></div>` |

### **Repeating Elements**

```html
<!-- Show up to 4 projects -->
<div data-contra-repeat="projects" data-contra-max="4">
  <div>
    <img data-contra-field="coverUrl">
    <h4 data-contra-field="title"></h4>
  </div>
</div>

<!-- Show skill tags -->
<div data-contra-repeat="skillTags" data-contra-max="5">
  <span data-contra-field="name"></span>
</div>
```

### **Smart Filtering**

```html
<!-- Dropdown filter -->
<select data-contra-filter="sortBy">
  <option value="relevance">Most Relevant</option>
  <option value="newest">Newest</option>
  <option value="rate_desc">Highest Rate</option>
</select>

<!-- Multi-select -->
<select data-contra-filter="languages" multiple>
  <option value="JavaScript">JavaScript</option>
  <option value="Python">Python</option>
  <option value="React">React</option>
</select>

<!-- Range slider -->
<input type="range" data-contra-filter="maxRate" min="0" max="300" step="25">

<!-- Search input -->
<input type="text" data-contra-filter="q" placeholder="Search experts...">
```

### **Conditional Display**

```html
<!-- Show only if hourly rate > 100 -->
<div data-contra-show-when="hourlyRateUSD:>:100">
  <span>Premium Expert</span>
</div>

<!-- Hide if not available -->
<div data-contra-hide-when="available:false">
  <button>Contact Now</button>
</div>
```

### **Pagination & Actions**

```html
<button data-contra-action="prev-page">Previous</button>
<button data-contra-action="next-page">Next</button>
<button data-contra-action="clear-filters">Clear All</button>
<div data-contra-pagination-info></div>
```

---

## ⚛️ **React/Framer Components**

### **ExpertListFramer**
```tsx
<ExpertListFramer
  programId="program-123"
  apiKey={props.apiKey}
  filters={{ available: true, minRate: 50 }}
  showFilters={true}
  maxExperts={20}
  virtualScrolling={true}
/>
```

### **ExpertCardFramer**
```tsx
<ExpertCardFramer
  expert={expertData}
  showProjects={true}
  showRating={true}
  maxProjects={3}
  onClick={(expert) => console.log(expert)}
/>
```

### **FilterControlsFramer**
```tsx
<FilterControlsFramer
  filters={currentFilters}
  onFilterChange={setFilters}
  showControls={{
    availability: true,
    location: true,
    rate: true
  }}
/>
```

---

## 🔧 **Configuration Options**

### **Runtime Configuration**
```html
<script id="contra-config" type="application/json">
{
  "apiKey": "your-api-key",
  "debug": true,
  "autoReload": true,
  "debounceDelay": 300,
  "loadingClass": "loading",
  "errorClass": "error"
}
</script>
```

### **Available Expert Fields**
```typescript
interface ExpertProfile {
  id: string
  name: string
  oneLiner: string
  avatarUrl: string
  profileUrl: string
  inquiryUrl: string
  hourlyRateUSD: number | null
  location: string
  available: boolean
  averageReviewScore: number
  reviewsCount: number
  projectsCompletedCount: number
  followersCount: number
  earningsUSD: number
  skillTags: string[]
  socialLinks: Array<{label: string, url: string}>
  projects: Array<{title: string, coverUrl: string, projectUrl: string}>
}
```

---

## 🎯 **Real-World Examples**

### **1. Expert Directory with Filters**
```html
<div data-contra-program="design-experts">
  <!-- Filters -->
  <div class="filters">
    <select data-contra-filter="location">
      <option value="">All Locations</option>
      <option value="United States">United States</option>
      <option value="Remote">Remote</option>
    </select>
    
    <input type="range" data-contra-filter="minRate" min="0" max="200">
    <span>Min Rate: $<span id="rate-display">0</span>/hr</span>
  </div>
  
  <!-- Expert Grid -->
  <div class="expert-grid">
    <div data-contra-template class="expert-card">
      <img data-contra-field="avatarUrl" class="avatar">
      <h3 data-contra-field="name"></h3>
      <p data-contra-field="oneLiner"></p>
      <div data-contra-field="hourlyRateUSD" data-contra-format="rate" class="rate"></div>
      <div data-contra-stars class="rating"></div>
      <a data-contra-field="inquiryUrl" class="cta-button">Contact Expert</a>
    </div>
  </div>
  
  <!-- States -->
  <div data-contra-loading>🔄 Loading amazing experts...</div>
  <div data-contra-error class="error-message"></div>
  <div data-contra-empty>No experts match your criteria.</div>
</div>
```

### **2. Featured Expert Showcase**
```html
<div data-contra-program="featured-experts" data-contra-limit="3">
  <div data-contra-template class="featured-expert">
    <div class="expert-hero">
      <img data-contra-field="avatarUrl">
      <div class="expert-info">
        <h2 data-contra-field="name"></h2>
        <p data-contra-field="oneLiner"></p>
        <div data-contra-stars></div>
        <div class="stats">
          <span data-contra-field="projectsCompletedCount" data-contra-format="number"></span> projects
          <span data-contra-field="reviewsCount" data-contra-format="number"></span> reviews
        </div>
      </div>
    </div>
    
    <div class="recent-projects" data-contra-repeat="projects" data-contra-max="3">
      <div class="project-card">
        <img data-contra-field="coverUrl">
        <h4 data-contra-field="title"></h4>
      </div>
    </div>
  </div>
</div>
```

---

## 🚀 **Performance Features**

- **🔄 Smart Caching** - API responses cached for 5-60 minutes
- **⚡ Request Deduplication** - Prevents duplicate API calls
- **🎯 Debounced Filtering** - Smooth user experience
- **📱 Lazy Loading** - Load experts as needed
- **🔧 Error Recovery** - Automatic retry with exponential backoff
- **📊 Performance Monitoring** - Built-in cache statistics

---

## 🛠️ **Development**

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Development mode
npm run dev

# Deploy to CDN
npm run deploy
```

---

## 📚 **API Reference**

### **ContraClient**
```typescript
const client = new ContraClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.contra.com',
  timeout: 10000,
  debug: false
})

// List experts with filters (using programNid from API)
const experts = await client.listExperts('program-nid', {
  available: true,
  minRate: 50,
  location: 'United States',
  sortBy: 'relevance'
})

// Get program details
const program = await client.getProgram('program-nid')

// Search experts (client-side filtering)
const results = await client.searchExperts('program-nid', 'React developer')

// Get available filters for this program
const filters = await client.getFilterOptions('program-nid')
```

---

## 🎨 **Styling Guide**

The SDK adds these CSS classes automatically:

```css
/* Runtime states */
.contra-runtime { /* Applied to containers */ }
.loading { /* During API calls */ }
.error { /* When errors occur */ }

/* Star ratings */
.star { /* All star elements */ }
.star-full { /* Filled stars */ }
.star-half { /* Half stars */ }
.star-empty { /* Empty stars */ }
```

---

## 🔗 **CDN URLs**

**Production (Recommended):**
```html
<script src="https://cdn.jsdelivr.net/gh/javron/contra-sdk@main/packages/contra-webflow/dist/runtime.min.js"></script>
```

**Development:**
```html
<script src="https://cdn.jsdelivr.net/gh/javron/contra-sdk@main/packages/contra-webflow/dist/index.js"></script>
```

---

## 🤝 **Support**

- **📖 Documentation**: [Full API Docs](https://github.com/javron/contra-sdk)
- **💬 Issues**: [GitHub Issues](https://github.com/javron/contra-sdk/issues)
- **🚀 Examples**: [Live Demos](https://github.com/javron/contra-sdk/tree/main/examples)

---

## 📄 **License**

MIT License - feel free to use in commercial projects!

---

**Built with ❤️ for the Contra community**

## 🎯 **API Specification Compliance**

✅ **100% OpenAPI 3.0.3 Compliant** - Our SDK matches the exact Contra API specification:

### **Endpoints:**
- `GET /public-api/programs/{programNid}` - Program details
- `GET /public-api/programs/{programNid}/experts` - Expert listings with filters  
- `GET /public-api/programs/{programNid}/filters` - Available filter options

### **Query Parameters (Exact from API):**
- `available` - `"true"` or `"false"` (string enum)
- `languages` - Comma-separated: `"English,Spanish"` or array
- `location` - With Google Place ID: `"San Francisco CA, USA (ChIJIQBpAG2ahYAR_6128GcTUEo)"`
- `minRate` / `maxRate` - Numbers: `50`, `200`
- `sortBy` - `"relevance" | "oldest" | "newest"`
- `limit` / `offset` - Pagination: `20`, `0`

### **Data Types:**
All TypeScript interfaces generated directly from the OpenAPI schema ensure perfect compatibility.

--- 