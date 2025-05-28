# Contra SDK Examples

This directory contains examples demonstrating how to use the Contra SDK packages in different environments.

## Examples

### 1. Webflow/HTML Example (`webflow-example.html`)

A complete HTML example showing how to use the `@contra/contra-web-attrs` package in a Webflow-style setup.

**Features:**
- Attribute-driven configuration
- Live filtering controls
- Template-based rendering
- No JavaScript knowledge required

**Usage:**
1. Include the script tag: `<script src="contra-web-attrs.min.js" defer></script>`
2. Add configuration: `<script id="contra-config" type="application/json">{"apiKey": "your-key"}</script>`
3. Create a wrapper with `data-contra-program="spline_expert"`
4. Add a hidden template with `data-contra-template`
5. Use data attributes for field binding: `data-field="name"`, `data-stars`, etc.

### 2. React Example (`react-example.tsx`)

A comprehensive React example using the `@contra/contra-react-framer` package.

**Features:**
- React components with hooks
- Custom expert card rendering
- Interactive filtering
- Error handling and loading states
- TypeScript support

**Usage:**
```tsx
import { ContraProvider, ExpertList } from '@contra/contra-react-framer';

<ContraProvider apiKey="your-api-key">
  <ExpertList program="spline_expert" filters={{ minRate: 50 }} />
</ContraProvider>
```

## Getting Started

### For Webflow/HTML Projects

1. **Add the script tag** to your page:
   ```html
   <script src="https://cdn.jsdelivr.net/npm/@contra/contra-web-attrs@latest/dist/index.min.js" defer></script>
   ```

2. **Configure your API key**:
   ```html
   <script id="contra-config" type="application/json">
   {
     "apiKey": "your-contra-api-key"
   }
   </script>
   ```

3. **Create your expert showcase**:
   ```html
   <div data-contra-program="spline_expert" data-contra-min-rate="50">
     <div data-contra-template style="display:none">
       <img data-field="avatarUrl"/>
       <h3 data-field="name"></h3>
       <div data-stars></div>
       <p data-field="hourlyRateUSD"></p>
     </div>
   </div>
   ```

### For React/Framer Projects

1. **Install the packages**:
   ```bash
   npm install @contra/contra-react-framer @contra/contra-core
   ```

2. **Use in your React app**:
   ```tsx
   import { ContraProvider, ExpertList } from '@contra/contra-react-framer';
   
   function App() {
     return (
       <ContraProvider apiKey="your-api-key">
         <ExpertList program="spline_expert" />
       </ContraProvider>
     );
   }
   ```

3. **For Framer Code Components**:
   ```tsx
   import { addPropertyControls, ControlType } from "framer"
   import { ContraProvider, ExpertList } from '@contra/contra-react-framer'
   
   export function ContraExperts({ apiKey, program }) {
     return (
       <ContraProvider apiKey={apiKey}>
         <ExpertList program={program} />
       </ContraProvider>
     )
   }
   
   addPropertyControls(ContraExperts, {
     apiKey: { type: ControlType.String, title: "API Key" },
     program: { type: ControlType.String, title: "Program" }
   })
   ```

## Available Data Attributes (Web Attrs)

### Wrapper Attributes
| Attribute | Example | Description |
|-----------|---------|-------------|
| `data-contra-program` | `spline_expert` | **Required** - Program identifier |
| `data-contra-languages` | `English,Spanish` | Comma-separated language list |
| `data-contra-min-rate` | `50` | Minimum hourly rate filter |
| `data-contra-max-rate` | `200` | Maximum hourly rate filter |
| `data-contra-location` | `United States` | Location filter |
| `data-contra-available` | `true` | Show only available experts |
| `data-contra-sort` | `rating` | Sort order (newest, oldest, rating, rate_low, rate_high) |

### Template Attributes
| Attribute | Description | Example |
|-----------|-------------|---------|
| `data-contra-template` | Marks the template element | `<div data-contra-template style="display:none">` |
| `data-field="fieldName"` | Binds to expert data field | `<span data-field="name"></span>` |
| `data-stars` | Renders star rating | `<div data-stars></div>` |
| `data-repeat="projects"` | Repeats for each project | `<div data-repeat="projects">` |

### Filter Control Attributes
| Attribute | Description | Example |
|-----------|-------------|---------|
| `data-contra-filter="languages"` | Multi-select language filter | `<select multiple>` |
| `data-contra-filter="min-rate"` | Minimum rate input | `<input type="number">` |
| `data-contra-filter="max-rate"` | Maximum rate input | `<input type="number">` |
| `data-contra-filter="available"` | Available checkbox | `<input type="checkbox">` |

## Expert Data Fields

The following fields are available for binding with `data-field`:

- `name` - Expert's full name
- `avatarUrl` - Profile image URL
- `bio` - Expert biography
- `hourlyRateUSD` - Hourly rate (automatically formatted as `$XX/hr`)
- `location` - Geographic location
- `profileUrl` - Link to full profile
- `averageReviewScore` - Rating score (use with `data-stars`)
- `totalReviews` - Number of reviews
- `available` - Availability status

### Project Fields (within `data-repeat="projects"`)

- `title` - Project title
- `coverUrl` - Project cover image
- `projectUrl` - Link to project
- `description` - Project description

## Styling

Both packages are designed to work with your existing CSS. The web attributes runtime preserves all your Webflow styling, while the React components accept `className` and `style` props for customization.

## API Key

To get your Contra API key:
1. Sign up for a Contra developer account
2. Create a new application
3. Copy your API key from the dashboard
4. Use it in your configuration

## Support

For issues or questions:
- Check the individual package READMEs
- Open an issue on the GitHub repository
- Contact Contra developer support 