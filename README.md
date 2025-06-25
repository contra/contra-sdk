# Contra SDK for Webflow

A lightweight, attribute-driven SDK for integrating Contra expert data into Webflow projects. It is designed to be flexible, performant, and require no JavaScript for implementation.

## Overview

This SDK provides a runtime that activates on your Webflow site, scanning the DOM for declarative `data-contra-*` attributes. It fetches expert data from the Contra API and binds it to your HTML elements, handling everything from initial data load to dynamic filtering and pagination.

**Core Features:**

*   **Zero-Code Integration:** Build a complete, data-driven expert directory using only HTML attributes.
*   **List-Based Architecture:** Display multiple, independent lists of experts from different programs on the same page.
*   **Dynamic Filtering:** Connect native Webflow form elements to your lists for live filtering and sorting. The runtime can even populate your filter dropdowns with available options from the API.
*   **Performance Optimized:** Features smart caching for API requests and debounced inputs for a smooth user experience.
*   **Advanced Data Binding:** Includes conditional rendering, element repetition for collections, and automatic media handling.

---

## Quick Start

1.  **Add the Runtime Script:** Place the following script in your site's custom code settings, inside the `<head>` tag. For production, replace `@latest` with a specific version number (e.g., `@2.0.0`).

    ```html
    <script defer src="https://cdn.jsdelivr.net/npm/@contra/webflow@latest/dist/runtime.min.js"></script>
    ```

2.  **Add Configuration:** Place your API key in a script tag before the closing `</body>` tag.

    ```html
    <script id="contra-config" type="application/json">
    {
      "apiKey": "YOUR_CONTRA_API_KEY"
    }
    </script>
    ```

3.  **Set Up HTML Structure:**
    *   Add `data-contra-list-id` and `data-contra-program` to a container element.
    *   Inside, create a `data-contra-template` element and set it to `display: none;`.
    *   Use `data-contra-field` attributes to bind data.

    ```html
    <!-- Main list container -->
    <div data-contra-list-id="expert-directory" data-contra-program="YOUR_PROGRAM_ID">
      
      <!-- Template for each expert card (hidden by default) -->
      <div data-contra-template style="display: none;">
        <img data-contra-field="avatarUrl" alt="">
        <h3 data-contra-field="name"></h3>
        <p data-contra-field="oneLiner"></p>
      </div>
      
      <!-- Optional placeholders for loading/empty/error states -->
      <div data-contra-loading style="display: none;">Loading...</div>
      <div data-contra-empty style="display: none;">No experts found.</div>
      <div data-contra-error style="display: none;">An error occurred.</div>
    </div>
    ```

---

## Configuration

Configure the SDK by placing a JSON object in a `<script>` tag with the ID `contra-config`.

| Option | Type | Default | Description |
|---|---|---|---|
| `apiKey` | `string` | **Required** | Your Contra API key. |
| `debug` | `boolean`| `false` | Enables detailed logs in the browser console. |
| `videoAutoplay`| `boolean`| `false` | Autoplays videos found in fields like `coverUrl`. |
| `videoHoverPlay`| `boolean`| `true` | Plays videos on mouse hover. Muted playback only. |
| `videoMuted`| `boolean`| `true` | Mutes video playback. Required for autoplay. |
| `videoLoop`| `boolean`| `true` | Loops video content. |
| `videoControls`| `boolean`| `false` | Shows the browser's native video player controls. |
| `imageTransformations` | `string` | `f_auto,...`| Default Cloudinary transformations for images. |
| `videoTransformations` | `string` | `fl_progressive,...` | Default Cloudinary transformations for videos. |

---

## HTML Attribute Reference

### List Container Attributes
These attributes control the data source and default filtering for a list.

| Attribute | Description |
|---|---|
| `data-contra-list-id` | **Required.** A unique identifier for the list. Used by filters and actions to target this list. |
| `data-contra-program` | **Required.** The Program ID from Contra to fetch experts from. |
| `data-contra-limit` | The number of experts to fetch per page. Defaults to `20`. |
| `data-contra-available`| Set to `true` to only show available experts by default. |
| `data-contra-location`| Sets a default location filter. |
| `data-contra-languages`| Sets a default language filter (comma-separated). |
| `data-contra-min-rate`| Sets a default minimum hourly rate. |
| `data-contra-max-rate`| Sets a default maximum hourly rate. |
| `data-contra-sort`| Sets a default sort order (e.g., `rate_desc`, `newest`). |
| `data-contra-prerender-placeholders` | If present, the runtime will render placeholder cards before loading data. |


### Template & State Attributes
These attributes define the structural components within a List Container.

| Attribute | Description |
|---|---|
| `data-contra-template` | **Required.** Marks the element to be cloned for each expert in the list. Must be set to `display: none;`. |
| `data-contra-loading` | This element is displayed while the initial data for the list is loading. |
| `data-contra-empty` | This element is displayed if the API returns no experts that match the current filters. |
| `data-contra-error` | This element is displayed if an API error occurs. The error message is injected as its text content. |


### Data Binding & Formatting

| Attribute | Description |
|---|---|
| `data-contra-field` | Binds an expert data field to an element. It sets `href` on `<a>` tags, `src` on `<img>` tags, and `textContent` on all others. |
| `data-contra-format`| Formats the output of a bound field. See table below for options. |
| `data-contra-stars` | Renders a 5-star rating display based on the `averageReviewScore` field. |

**Format Options (`data-contra-format`)**

| Value | Description | Example Input | Example Output |
|---|---|---|---|
| `rate` | Formats a number as an hourly rate. | `150` | `$150/hr` |
| `earnings`| Formats a number into a compact string (e.g., thousands, millions). | `25000` | `$25k+` |
| `rating` | Formats a number to one decimal place. | `4.912` | `4.9` |
| `currency`| Prefixes a number with a dollar sign. | `100` | `$100` |
| `number` | Formats a number with thousand separators. | `10000` | `10,000` |
| `truncate`| Truncates a string to 100 characters. | `long text...` | `long text...`|
| `availability`| Converts a boolean to "Available" or "Not Available". | `true` | `Available` |

### Structural Attributes

| Attribute | Description |
|---|---|
| `data-contra-repeat` | Repeats its **first direct child** element for each item in a collection field (e.g., `projects`, `skillTags`, `socialLinks`). |
| `data-contra-max` | Used with `data-contra-repeat` to limit the number of items rendered. |
| `data-contra-show-when` | Shows the element only if the condition is met. |
| `data-contra-hide-when` | Hides the element if the condition is met. |

**Conditional Logic (`show-when`/`hide-when`)**
Conditions are strings in the format `"field:operator:value"` or `"field:value"`.

*   **Supported Operators**: `>` , `<` , `>=` , `<=`
*   **Exact Match**: Use the format `"field:value"` (e.g., `available:true`). The comparison is case-insensitive for strings.

*Example:*
`<div data-contra-show-when="available:true">Available</div>`
`<div data-contra-show-when="averageReviewScore:>=4.5">Top Rated</div>`


### Action & Filter Attributes
These attributes create interactivity.

| Attribute | Description |
|---|---|
| `data-contra-filter` | **Required for filters.** Turns an input (`<select>`, `<input>`) into a live filter. The value must be a valid API filter key (e.g., `sortBy`, `minRate`, `q` for search). |
| `data-contra-action` | **Required for actions.** Turns a button into an action. Supported values: `load-more`, `clear-filters`. |
| `data-contra-list-target`| **Required for filters & actions.** The `list-id` of the list this control should affect. |

---
## Advanced Examples

### Expert Card Template
This example shows many features working together in a single card.

```html
<div data-contra-template style="display: none;">
  <!-- Header with Avatar and Name -->
  <div>
    <img data-contra-field="avatarUrl" alt="">
    <div>
      <h3 data-contra-field="name"></h3>
      <p data-contra-field="location"></p>
    </div>
    <!-- Conditional "Available" badge -->
    <span data-contra-show-when="available:true">Available Now</span>
  </div>

  <!-- Bio -->
  <p data-contra-field="oneLiner"></p>

  <!-- Stats Section -->
  <div>
    <div>
      <!-- Star rating component -->
      <div data-contra-stars></div>
      <!-- Formatted rating number -->
      <span data-contra-field="averageReviewScore" data-contra-format="rating"></span>
    </div>
    <div>
      <!-- Formatted rate -->
      <span data-contra-field="hourlyRateUSD" data-contra-format="rate"></span>
    </div>
  </div>

  <!-- Repeating Skill Tags -->
  <div data-contra-repeat="skillTags" data-contra-max="5">
    <!-- The runtime maps each tag string to an object: { name: "tag" } -->
    <!-- So we bind to the 'name' field. -->
    <span data-contra-field="name"></span>
  </div>
  
  <!-- Repeating Projects with automatic Video/Image handling -->
  <div data-contra-repeat="projects" data-contra-max="2">
    <a data-contra-field="projectUrl" target="_blank">
      <!-- The runtime creates an <img> or <video> tag here based on the coverUrl -->
      <div data-contra-field="coverUrl"></div>
      <h4 data-contra-field="title"></h4>
    </a>
  </div>

  <!-- Profile link with analytics -->
  <a data-contra-field="profileUrl" target="_blank">View Profile</a>
</div>
```

### Filters
A complete set of filter controls targeting a list with `data-contra-list-id="expert-directory"`.

```html
<!-- Text search input (debounced) -->
<input type="text" data-contra-filter="q" data-contra-list-target="expert-directory" placeholder="Search by keyword...">

<!-- Dropdown for sorting. Options are populated automatically by the runtime. -->
<select data-contra-filter="sortBy" data-contra-list-target="expert-directory">
  <option value="">Sort By...</option>
</select>

<!-- Range slider for minimum rate -->
<input type="range" data-contra-filter="minRate" data-contra-list-target="expert-directory" min="0" max="300">

<!-- A checkbox for availability -->
<label>
  <input type="checkbox" data-contra-filter="available" data-contra-list-target="expert-directory" value="true">
  Available now
</label>

<!-- A button to clear all active filters for this list -->
<button data-contra-action="clear-filters" data-contra-list-target="expert-directory">Clear Filters</button>
```

---

## For Developers

This repository is a TypeScript monorepo managed with npm workspaces.

### Architecture
*   `packages/contra-types`: Shared TypeScript definitions for API resources.
*   `packages/contra-client`: Core API client with caching and retry logic.
*   `packages/contra-webflow`: The Webflow runtime that consumes the other packages.

### Local Development
1.  **Install dependencies:** `npm install`
2.  **Build all packages:** `npm run build`
    *   This compiles all packages and generates the final `runtime.min.js` in `packages/contra-webflow/dist`.

### Publishing
The project is configured for publishing to the public npm registry.
1.  Log in to npm: `npm login`
2.  Update the `version` in the `package.json` of the package(s) you intend to publish.
3.  Publish packages in order of dependency:
    ```bash
    # From within packages/contra-types
    npm publish --access public

    # From within packages/contra-client
    npm publish --access public

    # From within packages/contra-webflow
    npm publish --access public
    ```
---

## License
MIT 