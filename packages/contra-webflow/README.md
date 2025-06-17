# Contra Webflow SDK

A lightweight, flexible JavaScript runtime for embedding Contra expert directories and lists into any web project, with a special focus on simplifying Webflow integration.

Version: 2.0.0 (List-based Architecture) | License: MIT

---

## 📋 Table of Contents

1.  [Quick Start](#-quick-start)
2.  [How It Works](#-how-it-works)
3.  [Configuration](#-configuration)
4.  [Core Attributes](#-core-attributes)
5.  [Data Binding](#-data-binding)
6.  [Filtering](#-filtering)
7.  [Styling Guide](#-styling-guide)
8.  [Full Example](#-full-example)
9.  [Troubleshooting](#-troubleshooting)

---

## 🚀 Quick Start

Get a directory of experts running in minutes. Just add the following code to an HTML embed element in your Webflow project.

#### 1. Add the Configuration
Create a `<script>` tag with the ID `contra-config`. This is where you'll put your API key.

```html
<!-- 1. Configuration Script (Required once per page) -->
<script id="contra-config" type="application/json">
{
    "apiKey": "YOUR_API_KEY_HERE",
    "debug": true
}
</script>
```

#### 2. Add the Runtime Script
This script contains all the logic. Paste this below your configuration. For production, you can replace the versioned link with one pointing to `@latest`.

```html
<!-- 2. Runtime Script (Required once per page) -->
<script src="https://cdn.jsdelivr.net/gh/javron/contra-sdk@latest/packages/contra-webflow/dist/runtime.min.js"></script>
```

#### 3. Create Your List
Design your expert list in Webflow. The structure consists of a **List Container**, which will hold the experts, and a **Template Element** inside it, which defines the layout for a single expert.

```html
<!-- 3. HTML Structure -->
<div data-contra-list-id="expert-directory" data-contra-program="YOUR_PROGRAM_ID" data-contra-limit="10">

    <!-- Template for a single expert card -->
    <!-- The runtime will clone this element for each expert -->
    <div data-contra-template class="expert-card" style="display: none;">
        <img data-contra-field="avatarUrl" alt="Expert Avatar">
        <h3 data-contra-field="name"></h3>
        <p data-contra-field="location"></p>
  </div>

    <!-- Optional: Loading, Empty, and Error states -->
    <div data-contra-loading style="display: none;">Loading experts...</div>
    <div data-contra-empty style="display: none;">No experts found.</div>
    <div data-contra-error style="display: none;">An error occurred.</div>
</div>
```

---

## ⚙️ How It Works

The SDK operates on a simple "list-based" architecture. You can have multiple independent lists on the same page.

1.  **List (`data-contra-list-id`)**: Any element with this attribute becomes a container for experts from a specific `data-contra-program`.
2.  **Template (`data-contra-template`)**: An element inside a list that serves as the blueprint for each item. It's hidden by default and cloned for each expert fetched from the API.
3.  **Data Binding (`data-contra-field`)**: Attributes placed on elements inside the template tell the SDK where to put the expert's data (e.g., name, avatar, location).
4.  **Actions (`data-contra-action`)**: Buttons, like a "Load More" button, can target a specific list using `data-contra-list-target` to perform actions.
5.  **Filters (`data-contra-filter`)**: Form inputs, like dropdowns or checkboxes, can also target a list to dynamically filter the results.

---

## 🔧 Configuration

The SDK is configured through a single JSON object inside a `<script>` tag with the ID `contra-config`.

```html
<script id="contra-config" type="application/json">
{
  "apiKey": "YOUR_API_KEY",    // Required
  "debug": true,               // Optional: Show detailed logs in the console
  
  // Video Configuration
  "videoAutoplay": false,      // Optional: Auto-play videos in project covers
  "videoHoverPlay": true,      // Optional: Play videos on hover
  "videoMuted": true,          // Optional: Mute videos
  "videoLoop": true,           // Optional: Loop videos
  "videoControls": false       // Optional: Show native video controls
}
</script>
```

| Option | Type | Default | Description |
|---|---|---|---|
| `apiKey` | `string` | **Required** | Your API authentication key. |
| `debug` | `boolean`| `false` | Enables detailed logging in the browser console. |
| `videoAutoplay`|`boolean`| `false` | Autoplays videos found in `coverUrl` fields. |
| `videoHoverPlay`|`boolean`| `true` | Plays videos on mouse hover. |
| `videoMuted`| `boolean`| `true` | Mutes video playback (required for autoplay). |
| `videoLoop`| `boolean`| `true` | Loops video content. |
| `videoControls`|`boolean`| `false` | Shows the browser's native video player controls. |

---

## 🏷️ Core Attributes

### List Container Attributes

These are placed on the element that will contain your list of experts.

| Attribute | Description | Example |
|---|---|---|
| `data-contra-list-id` | **Required.** A unique name for your list. This is used by actions and filters to target this specific list. | `data-contra-list-id="featured-experts"` |
| `data-contra-program` | **Required.** The ID of the expert program to fetch data from. | `data-contra-program="kajabi_expert"` |
| `data-contra-limit` | Optional. The number of experts to fetch per page or for the initial load. Defaults to `20`. | `data-contra-limit="5"` |
| `data-contra-available`| Optional. Set to `true` to only show available experts by default. | `data-contra-available="true"`|
| `data-contra-location`| Optional. Set a default location filter using the full location string. | `data-contra-location="San Francisco..."`|
| `data-contra-languages`| Optional. Set a default language filter (comma-separated). | `data-contra-languages="English,French"`|
| `data-contra-min-rate`| Optional. Set a default minimum hourly rate. | `data-contra-min-rate="50"`|
| `data-contra-max-rate`| Optional. Set a default maximum hourly rate. | `data-contra-max-rate="150"`|
| `data-contra-sort`| Optional. Set a default sort order. | `data-contra-sort="rate_desc"`|

### Template and State Attributes

These are placed on elements *inside* your List Container.

| Attribute | Description | Example |
|---|---|---|
| `data-contra-template` | **Required.** Marks the element to be used as a template for each expert. It should be hidden by default (`style="display: none;"`). | `<div data-contra-template style="display: none;">...</div>` |
| `data-contra-loading` | Optional. This element will be shown while the initial data for the list is loading. | `<div data-contra-loading>Loading...</div>` |
| `data-contra-empty` | Optional. This element will be shown if the API returns no experts. | `<div data-contra-empty>No experts found.</div>` |
| `data-contra-error` | Optional. This element will be shown if there is an API error. The error message will be placed inside it. | `<div data-contra-error></div>` |

---

## 🔗 Data Binding

Use these attributes on elements *inside* your `data-contra-template` to bind data.

### `data-contra-field`

Binds an expert data field to an HTML element.
- If used on an `<a>` tag, it sets the `href`.
- If used on an `<img>` tag, it sets the `src`.
- On all other elements, it sets the `textContent`.

**Available Fields:**
- `name`
- `avatarUrl`
- `location`
- `oneLiner`
- `profileUrl`
- `inquiryUrl`
- `hourlyRateUSD`
- `available` (boolean)
- `projects` (collection)
- `skillTags` (collection)
- `socialLinks` (collection)
- And many more based on the `ExpertProfile` type.

### `data-contra-format`

Formats the output of a field.

| Format | Description | Example Input | Example Output |
|---|---|---|---|
| `rate` | Formats a number as an hourly rate. | `150` | `$150/hr` |
| `earnings`| Formats a number into a compact string. | `25000` | `$25k+` |
| `rating` | Formats a number to one decimal place. | `4.912` | `4.9` |
| `currency`| Adds a dollar sign prefix. | `100` | `$100` |
| `number` | Adds thousand separators to a number. | `10000` | `10,000` |
| `truncate`| Truncates a string to 100 characters. | `long text...` | `long text...`|
| `availability`| Converts a boolean to text. | `true` | `Available` |

### `data-contra-repeat`

Repeats an element for each item in a collection (like projects or skill tags).

**Available Collections:**
- `projects`
- `skillTags`
- `socialLinks`

**Usage:** Place this on a container element. The runtime will clone its *first child* for each item in the collection.

```html
<div data-contra-repeat="skillTags" data-contra-max="5" class="tag-container">
    <!-- This div will be cloned for each skill tag -->
    <div data-contra-field="name" class="tag"></div>
</div>
```
The `data-contra-max` attribute is optional and limits the number of items shown.

### Conditional Display

Show or hide elements based on data.

- `data-contra-show-when="field:value"`: Shows the element if the condition is true.
- `data-contra-hide-when="field:value"`: Hides the element if the condition is true.

**Supported Operators:** `( : , > , < , >= , <= )`

```html
<!-- Show a badge only if the expert is available -->
<span data-contra-show-when="available:true">● Available</span>

<!-- Show a "Top Rated" badge for experts with high ratings -->
<span data-contra-show-when="averageReviewScore:>=4.9">Top Rated</span>
```

### Media Handling (`coverUrl`)

When you bind a field to `coverUrl` (typically for projects), the SDK automatically creates the correct media element:
- If the URL ends in `.mp4`, `.webm`, etc., it creates a `<video>` element.
- Otherwise, it creates an `<img>` element.
This allows for rich media in your project showcases. Configure video behavior in the global config.

---

## 🔍 Filtering

The SDK has a powerful, dynamic filtering system.

### How to Add Filters

1.  Add a form element (like `<select>` or `<input>`) to your page.
2.  Give it the `data-contra-filter` attribute, specifying which API field to filter (e.g., `sortBy`, `locations`, `languages`).
3.  Give it the `data-contra-list-target` attribute, specifying the `list-id` of the list you want to filter.

The runtime handles the rest! For dropdowns, it will automatically fetch the available options from the API and populate them.

### Example Filter Bar

```html
<div class="filter-bar">
    <!-- Sort By Dropdown -->
    <div class="filter-group">
        <label for="sort-filter">Sort by:</label>
        <select id="sort-filter" data-contra-filter="sortBy" data-contra-list-target="expert-cards">
            <!-- Options dynamically populated by runtime -->
</select>
</div>

    <!-- Location Dropdown -->
    <div class="filter-group">
        <label for="location-filter">Location:</label>
        <select id="location-filter" data-contra-filter="locations" data-contra-list-target="expert-cards">
            <option value="">All Locations</option>
            <!-- Options dynamically populated by runtime -->
</select>
</div>

    <!-- Min Rate Input -->
    <div class="filter-group">
        <label for="min-rate-filter">Min Rate:</label>
        <input type="number" id="min-rate-filter" placeholder="50" data-contra-filter="minRate" data-contra-list-target="expert-cards">
    </div>
    
    <!-- Available Now Checkbox -->
    <div class="filter-group">
        <input type="checkbox" id="available-filter" data-contra-filter="available" data-contra-list-target="expert-cards" value="true">
        <label for="available-filter">Available Now</label>
      </div>
    </div>
```

---

## 🎨 Styling Guide

The SDK adds very few classes to give you full control.

-   `.contra-rendered-item`: Added to every element cloned from a template.
-   `.loading`, `.error`: Added to the list container element during these states (if you also provide `data-contra-loading`/`data-contra-error` elements).
-   Use your own classes for styling. The SDK will preserve them.

---

## ✨ Full Example

This example demonstrates all major features, including two independent lists, dynamic filters, and rich data binding.

```html
<!--
  Contra SDK Webflow Embed Example
  Demonstrates the new, simplified list-based runtime.
-->

<!-- 1. Configuration Script (Required once per page) -->
<script id="contra-config" type="application/json">
{
    "apiKey": "YOUR_API_KEY_HERE",
    "debug": true
}
</script>

<!-- 2. Runtime Script (Required once per page) -->
<script src="https://cdn.jsdelivr.net/gh/javron/contra-sdk@latest/packages/contra-webflow/dist/runtime.min.js"></script>

<!-- 3. Styles (Recommended) -->
<style>
    /* General Styles */
    .contra-container {
        font-family: sans-serif;
        max-width: 900px;
        margin: 40px auto;
        padding: 20px;
    }
    .contra-container h2 {
        font-size: 2rem;
        margin-bottom: 20px;
        border-bottom: 1px solid #eee;
        padding-bottom: 10px;
    }

    /* Hero Avatar Styles */
    .hero-avatars-list {
        display: flex;
        justify-content: center;
        gap: 10px;
        margin-bottom: 40px;
    }
    .hero-avatar {
        width: 80px;
        height: 80px;
  border-radius: 50%;
  object-fit: cover;
        border: 3px solid white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .hero-avatar:not(:first-child) {
        margin-left: -20px;
    }

    /* Expert Card Styles */
    .expert-card {
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 24px;
        margin-bottom: 24px;
        display: flex;
        flex-direction: column;
        gap: 20px;
    }
    .expert-header { display: flex; align-items: center; gap: 16px; }
    .expert-avatar-main { width: 64px; height: 64px; border-radius: 50%; object-fit: cover; }
    .expert-name { font-size: 1.25rem; font-weight: 600; }
    .expert-location { color: #6b7280; }
    .expert-details { display: flex; gap: 16px; color: #6b7280; align-items: center; }
    .expert-oneliner { margin-top: 16px; color: #374151; }
    .skill-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
    .skill-tag { background: #f3f4f6; color: #374151; padding: 4px 12px; border-radius: 9999px; font-size: 12px; }

    /* Project Styles */
.projects-grid {
  display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 16px;
        margin-top: 16px;
    }
    .project-card {
        border: 1px solid #e5e7eb;
  border-radius: 8px;
        overflow: hidden;
        transition: transform 0.2s, box-shadow 0.2s;
    }
    .project-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }
    .project-cover {
        width: 100%;
        height: 120px;
        object-fit: cover;
    }
    .project-title {
        padding: 12px;
        font-weight: 600;
  font-size: 14px;
}

    /* Social Links */
    .social-links {
        display: flex;
        gap: 12px;
        margin-top: 16px;
    }
    .social-link {
        color: #6b7280;
        text-decoration: none;
        transition: color 0.2s;
    }
    .social-link:hover {
        color: #111827;
    }

    /* Load More Button Styles */
    .load-more-section { text-align: center; padding: 20px; }
    .load-more-btn {
        background: #111827;
        color: white;
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        font-size: 1rem;
        transition: background-color 0.2s;
    }
    .load-more-btn:hover { background: #374151; }
    .load-more-btn:disabled { background: #9ca3af; cursor: not-allowed; }

    /* Filter Styles */
    .filter-bar {
        display: flex;
        gap: 16px;
        margin-bottom: 24px;
        align-items: center;
        flex-wrap: wrap;
        padding: 16px;
        background-color: #f9fafb;
        border-radius: 12px;
    }
    .filter-group {
        display: flex;
        gap: 8px;
        align-items: center;
    }
    .filter-bar input, .filter-bar select {
        padding: 10px;
        border: 1px solid #e5e7eb;
  border-radius: 8px;
        font-size: 1rem;
    }
    .filter-bar label {
        font-weight: 600;
    }

</style>

<!-- 4. HTML Structure -->

<!-- Section 1: Hero with 5 Avatars -->
<div class="contra-container">
    <h2>Featured Experts</h2>
    
    <!-- Hero List: Fetches 5 experts, displays only their avatars -->
    <div data-contra-list-id="hero-avatars" data-contra-program="YOUR_PROGRAM_ID" data-contra-limit="5" class="hero-avatars-list">
        
        <!-- Template for a single avatar -->
<div data-contra-template style="display: none;">
            <a data-contra-field="profileUrl" target="_blank">
                <img data-contra-field="avatarUrl" class="hero-avatar" alt="Expert Avatar">
            </a>
</div>

    </div>
</div>


<!-- Section 2: Paginated Expert Cards -->
<div class="contra-container">
    <h2>All Experts</h2>
    
    <!-- Filter Bar -->
    <div class="filter-bar">
        <div class="filter-group">
            <label for="sort-filter">Sort by:</label>
            <select id="sort-filter" data-contra-filter="sortBy" data-contra-list-target="expert-cards">
                <!-- Options dynamically populated by runtime -->
</select>
        </div>
        <div class="filter-group">
            <label for="location-filter">Location:</label>
            <select id="location-filter" data-contra-filter="locations" data-contra-list-target="expert-cards">
                <option value="">All Locations</option>
                <!-- Options dynamically populated by runtime -->
            </select>
        </div>
        <div class="filter-group">
            <label for="languages-filter">Languages:</label>
            <select id="languages-filter" data-contra-filter="languages" data-contra-list-target="expert-cards">
                <option value="">All Languages</option>
                <!-- Options dynamically populated by runtime -->
            </select>
        </div>
        <div class="filter-group">
            <label for="min-rate-filter">Min Rate:</label>
            <input type="number" id="min-rate-filter" placeholder="50" data-contra-filter="minRate" data-contra-list-target="expert-cards" style="width: 80px;">
        </div>
        <div class="filter-group">
            <label for="max-rate-filter">Max Rate:</label>
            <input type="number" id="max-rate-filter" placeholder="150" data-contra-filter="maxRate" data-contra-list-target="expert-cards" style="width: 80px;">
        </div>
        <div class="filter-group">
            <input type="checkbox" id="available-filter" data-contra-filter="available" data-contra-list-target="expert-cards" value="true">
            <label for="available-filter">Available Now</label>
        </div>
    </div>

    <!-- Expert Card List: Fetches 2 experts initially -->
    <div data-contra-list-id="expert-cards" data-contra-program="YOUR_PROGRAM_ID" data-contra-limit="2">
        
        <!-- Template for a full expert card -->
        <div data-contra-template class="expert-card" style="display: none;">
            <div class="expert-header">
                <img data-contra-field="avatarUrl" class="expert-avatar-main" alt="Expert Avatar">
                <div>
                    <h3 data-contra-field="name" class="expert-name"></h3>
                    <p data-contra-field="location" class="expert-location"></p>
                    <div class="expert-details">
                        <span data-contra-field="hourlyRateUSD" data-contra-format="rate"></span>
                        <span data-contra-show-when="available:true" style="color: #10b981;">● Available Now</span>
    </div>
  </div>
    </div>
            <p data-contra-field="oneLiner" class="expert-oneliner"></p>
            <div data-contra-repeat="skillTags" data-contra-max="8" class="skill-tags">
                <div data-contra-field="name" class="skill-tag"></div>
    </div>
            <div data-contra-repeat="projects" data-contra-max="3" class="projects-grid">
                <a data-contra-field="projectUrl" target="_blank" class="project-card">
                    <img data-contra-field="coverUrl" class="project-cover" alt="Project Cover">
                    <div data-contra-field="title" class="project-title"></div>
                </a>
  </div>
            <div data-contra-repeat="socialLinks" class="social-links">
                 <a data-contra-field="url" target="_blank" class="social-link">
                    <span data-contra-field="label"></span>
                </a>
            </div>
            <a data-contra-field="profileUrl" target="_blank" class="load-more-btn" style="align-self: flex-start; margin-top: 16px;">View Profile</a>
        </div>

        <!-- Loading state for this list -->
        <div data-contra-loading style="display: none; text-align: center; padding: 40px;">
            <p>Loading...</p>
        </div>

        <!-- Empty state for this list -->
        <div data-contra-empty style="display: none; text-align: center; padding: 40px;">
            <p>No experts found.</p>
        </div>

    </div>

    <!-- Load More Section: This button targets the "expert-cards" list -->
    <div class="load-more-section">
        <button data-contra-action="load-more" data-contra-list-target="expert-cards" class="load-more-btn">
            Load More
        </button>
    </div>

</div>
```

---

## 🛠️ Troubleshooting

-   **Nothing is showing up?**
    1.  Check that your `apiKey` in `contra-config` is correct.
    2.  Check that your `data-contra-program` ID is correct.
    3.  Open the browser console. If `debug: true` is set, you will see detailed logs about what the SDK is doing. Look for any errors in red.
-   **Filters not working?**
    1.  Make sure the `data-contra-list-target` on your filter control exactly matches the `data-contra-list-id` of your list.
    2.  Check the `data-contra-filter` attribute name against the API documentation.
-   **Still stuck?** The debug logs are your best friend. They will tell you which lists are being initialized, what filters are being fetched, and what data is being loaded.

---

## 📄 License

MIT License - See LICENSE file for details.

---

*This documentation covers the complete Contra Expert Directory SDK for Webflow. For the latest updates and support, contact your Contra integration manager.* 