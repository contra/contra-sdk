# Contra SDK for Webflow 🚀

**A professional, attribute-driven SDK for integrating Contra expert directories into your Webflow sites with zero code.**

[![npm version](https://badge.fury.io/js/%40contra%2Fwebflow.svg)](https://badge.fury.io/js/%40contra%2Fwebflow)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![CDN Ready](https://img.shields.io/badge/CDN-jsDelivr-orange.svg)](https://www.jsdelivr.com/)

---

## 🌟 Overview

This SDK is a complete, enterprise-grade solution for bringing data from Contra into your Webflow projects. It's designed for performance, flexibility, and ease of use, allowing designers and developers to build rich, data-driven expert directories without writing any JavaScript.

- **🎯 Zero-Code Webflow Integration:** Use simple `data-contra-*` attributes to connect your designs to live data.
- **⚡ Performance Optimized:** Includes smart caching, request deduplication, and debounced inputs to ensure a fast user experience.
- **🔧 Professional Architecture:** A clean, modular monorepo using TypeScript for type safety and reliability.
- **🎨 Attribute-Driven:** Control everything from data binding to conditional visibility directly from the Webflow Designer.

---

## 🚀 Quick Start for Webflow

Get a dynamic expert directory running on your Webflow site in just three steps.

### Step 1: Add the Runtime Script

Add the following script tag to the custom code settings of your Webflow site, inside the `</head>` tag. Replace `@latest` with a specific version for production use.

```html
<!-- Get the latest version from npm -->
<script defer src="https://cdn.jsdelivr.net/npm/@contra/webflow@latest/dist/runtime.min.js"></script>
```

### Step 2: Configure the SDK

Next, add your API key and other optional configurations in a script tag just before the closing `</body>` tag.

```html
<script id="contra-config" type="application/json">
{
  "apiKey": "YOUR_CONTRA_API_KEY_HERE",
  "debug": false,
  "videoHoverPlay": true
}
</script>
```

### Step 3: Set Up Your HTML Structure

Design your expert list and card in the Webflow Designer, then add the `data-contra-*` attributes to connect them to the SDK.

1.  **Main List Container:** This element wraps your entire list and defines which program to pull experts from.
2.  **Template Element:** This is your expert card design. It will be used as a template and should be hidden by default (`display: none`).
3.  **Data Fields:** Use `data-contra-field` on any element inside your template to bind it to expert data.
4.  **States:** Define elements to show for loading, empty, and error states.

```html
<!-- 1. The main list container -->
<div data-contra-list-id="expert-directory" data-contra-program="YOUR_PROGRAM_ID">
  
  <!-- 2. The template for each expert card (set to display:none) -->
  <div data-contra-template>
    <img data-contra-field="avatarUrl" alt="Expert Avatar">
    <h3 data-contra-field="name"></h3>
    <p data-contra-field="oneLiner"></p>
    <!-- Show a star rating -->
    <div data-contra-stars></div>
    <!-- Format a number as a currency -->
    <div data-contra-field="hourlyRateUSD" data-contra-format="rate"></div>
  </div>
  
  <!-- 4. Placeholders for different states -->
  <div data-contra-loading style="display: none;">Loading experts...</div>
  <div data-contra-error style="display: none;">Something went wrong.</div>
  <div data-contra-empty style="display: none;">No experts found for this search.</div>
</div>
```

**That's it!** When you publish your site, the SDK will automatically fetch the experts and populate your list.

---

## 🎨 Advanced Features & Attributes

### Repeating Elements (`data-contra-repeat`)

Use `data-contra-repeat` to render a list of items, like project samples or skill tags.

```html
<!-- Show up to 3 project samples -->
<div data-contra-repeat="projects" data-contra-max="3">
  <div>
    <a data-contra-field="projectUrl" target="_blank">
      <img data-contra-field="coverUrl" alt="Project Cover">
      <h4 data-contra-field="title"></h4>
    </a>
  </div>
</div>

<!-- Show the first 5 skill tags -->
<div data-contra-repeat="skillTags" data-contra-max="5">
  <div>
    <!-- The value of a simple array item is just the item itself -->
    <span data-contra-field="."></span>
  </div>
</div>
```

### Conditional Display (`data-contra-show-when`)

Show or hide elements based on data. This is great for things like an "Available" badge.

```html
<!-- Shows only if the expert is available -->
<div data-contra-show-when="available:true">Available for Hire</div>

<!-- Shows if the review score is 4.5 or higher -->
<div data-contra-show-when="averageReviewScore:>=4.5">Top Rated</div>
```

### Filtering

Add `data-contra-filter` attributes to standard form inputs to create powerful, live filtering for your lists. The SDK automatically detects the input type and listens for changes.

```html
<!-- Dropdown for sorting -->
<select data-contra-filter="sortBy" data-contra-list-target="expert-directory">
  <option value="relevance">Most Relevant</option>
  <option value="newest">Newest</option>
  <option value="rate_desc">Rate: High to Low</option>
</select>

<!-- A search input -->
<input type="text" data-contra-filter="q" data-contra-list-target="expert-directory" placeholder="Search by keyword...">

<!-- A checkbox for availability -->
<label>
  <input type="checkbox" data-contra-filter="available" data-contra-list-target="expert-directory" value="true">
  Available now
</label>

<!-- A range slider for hourly rate -->
<input type="range" data-contra-filter="minRate" data-contra-list-target="expert-directory" min="0" max="300">
```

---

## 📦 For Developers: Project Structure & Deployment

This is a TypeScript monorepo managed with npm workspaces.

### Package Architecture

```
/packages
├── /contra-types     # Shared TypeScript definitions generated from an OpenAPI spec.
├── /contra-client    # Core API client with caching, retries, and error handling.
└── /contra-webflow   # The Webflow runtime that consumes the other two packages.
```

### Building the Project

1.  **Install dependencies:** `npm install`
2.  **Build all packages:** `npm run build`

The primary build artifact is `packages/contra-webflow/dist/runtime.min.js`.

### Publishing to NPM

This project is set up for public publishing on npm.

1.  **Login to npm:** `npm login`
2.  **Bump package versions:** Manually update the `version` in the `package.json` files for the packages you want to publish.
3.  **Publish:** Run the publish command from within each package directory you want to publish, in the correct order.

```bash
# 1. Publish types
cd packages/contra-types
npm publish --access public

# 2. Publish client
cd ../contra-client
npm publish --access public

# 3. Publish webflow runtime
cd ../contra-webflow
npm publish --access public
```

After publishing, the new version will be available on the jsDelivr CDN: `https://cdn.jsdelivr.net/npm/@contra/webflow@VERSION/dist/runtime.min.js`.

---

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