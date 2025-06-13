# Contra SDK - Framer Components

A collection of professional, API-powered Framer components for building expert directory interfaces that match your design requirements.

## 🎯 **Quick Start - New Centralized Setup**

**Step 1:** Add `ContraConfigFramer` to your canvas
1. Drag the **ContraConfigFramer** component onto your canvas
2. In the properties panel, enter your:
   - **API Key** (starts with `csk_...`)
   - **Program ID** (your Contra program identifier)
3. Click **"Test Connection"** to verify setup
4. ✅ **Done!** All other components will automatically use this configuration

**Step 2:** Use any combination of components
- All components now automatically detect your API configuration
- No need to set API keys in individual components
- Mix and match components as needed for your design

---

## 📦 **Available Components**

### 🔧 **ContraConfigFramer** *(New - Required)*
**Central API configuration that all other components use automatically.**

- **One-time setup**: Configure API credentials once
- **Auto-detection**: Other components automatically find and use this config
- **Test connection**: Built-in connection testing and validation
- **Debug mode**: Optional console logging for troubleshooting

**Usage:** Place once on your canvas, configure API settings, done!

---

### 🎯 **HeroFramer**
**Hero section with real expert avatars from your Contra program.**

- **Smart avatars**: Real expert photos from API (with custom override)
- **Auto-config**: Uses ContraConfigFramer automatically
- **Customizable**: Full control over title, subtitle, and actions
- **Design match**: Overlapping avatar layout matching uploaded designs

**Configuration:** Uses global config from ContraConfigFramer (no individual setup needed)

---

### 👨‍💼 **ExpertCardFramer** 
**Individual expert cards with project portfolios.**

- **Complete profiles**: Avatar, rating, rate, projects, availability
- **Project grid**: 2x2 project layout exactly like design mockups
- **Interactive**: Hover effects, project viewing, contact actions
- **Flexible**: Show/hide any element (projects, stats, actions)

**Configuration:** Fully standalone - no API setup required

---

### 🔍 **ExpertGridFramer**
**Full expert directory with API integration and filtering.**

- **Live data**: Real expert profiles from Contra API
- **Smart filtering**: Availability, location, rate, sort options
- **Auto-config**: Uses ContraConfigFramer automatically
- **Event-driven**: Communicates with FilterBarFramer and ExpertFilterFramer

**Configuration:** Uses global config from ContraConfigFramer (no individual setup needed)

---

### 🎛️ **ExpertFilterFramer** 
**Advanced modal filter panel with all filter options.**

- **Complete filtering**: Availability, location, rate range, sorting
- **Modal design**: Overlay panel matching design specs
- **Event communication**: Works with FilterBarFramer toggle
- **Real-time**: Instant filter application

**Configuration:** No API setup required - works with ExpertGridFramer

---

### 🔘 **FilterBarFramer**
**Toggle button to show/hide the filter panel.**

- **Simple toggle**: Clean filter button design
- **Event-driven**: Communicates with ExpertFilterFramer
- **Customizable**: Flexible alignment and styling
- **Lightweight**: Minimal, focused component

**Configuration:** No setup required - pure UI component

---

### 📝 **HeaderFramer**
**Professional navigation header with logo and actions.**

- **Brand flexibility**: Custom logo or text
- **Navigation**: Configurable menu items
- **Actions**: Primary and secondary call-to-action buttons
- **Responsive**: Auto-sizing and flexible layout

**Configuration:** No API setup required - pure UI component

---

## 🎨 **Color System Integration**

All components support Framer's global color system:

### **Background Colors**
- `Background Primary` - Main backgrounds
- `Background Secondary` - Card backgrounds  
- `Background Tertiary` - Hover states

### **Text Colors**
- `Text Primary` - Headings, important text
- `Text Secondary` - Body text, descriptions
- `Text Muted` - Subtle text, placeholders

### **Accent Colors**
- `Accent Primary` - Primary actions, links
- `Accent Success` - Available badges, success states
- `Accent Warning` - Warning states
- `Accent Error` - Error states

### **Button Colors**
- `Button Primary Background/Text` - Main actions
- `Button Secondary Background/Text/Border` - Secondary actions

### **Surface Colors**
- `Surface Hover` - Hover backgrounds
- `Border Color` - All borders and dividers

**Setup:** Create these colors in Framer with light/dark mode variants. Components will automatically use them but allow overrides in the properties panel.

---

## 🚀 **Deployment Workflows**

### **Minimal Setup** (Just hero + directory)
1. `ContraConfigFramer` - Configure API once
2. `HeroFramer` - Hero section with real avatars  
3. `ExpertGridFramer` - Expert directory with real data

### **Basic Setup** (Add header)
1. `ContraConfigFramer`
2. `HeaderFramer` - Navigation
3. `HeroFramer` 
4. `ExpertGridFramer`

### **Advanced Setup** (Full filtering)
1. `ContraConfigFramer`
2. `HeaderFramer`
3. `HeroFramer`
4. `FilterBarFramer` - Filter toggle
5. `ExpertFilterFramer` - Filter panel
6. `ExpertGridFramer`

### **Custom Setup** (Mix and match)
- Use any combination of components
- All API components automatically use ContraConfigFramer
- Complete flexibility for custom layouts

---

## 🔧 **Migration from Individual Config**

**If you were using individual API configurations:**

1. **Add ContraConfigFramer** to your canvas
2. **Copy your API settings** from existing components to ContraConfigFramer
3. **Remove API settings** from individual components (they'll auto-detect the global config)
4. **Test the connection** using the built-in test button

**Benefits of centralized config:**
- ✅ Configure once, use everywhere
- ✅ No duplicate API key management
- ✅ Built-in connection testing
- ✅ Easier debugging and troubleshooting
- ✅ Consistent configuration across all components

---

## 🎯 **Design Compliance**

These components are built to **exactly match** the provided Replo design mockups:

- **Pixel-perfect layouts** matching Figma specifications
- **Exact color schemes** for light and dark modes
- **Proper typography** and spacing
- **Interactive states** and hover effects
- **Real data integration** maintaining design fidelity

---

## 🛠️ **Development Notes**

- **Standalone Architecture**: Each component is fully self-contained (no inter-dependencies)
- **Event Communication**: Components use browser events for interaction (no imports required)
- **API Integration**: Real Contra API data with fallback systems
- **Global Configuration**: Centralized setup via ContraConfigFramer
- **Theme Support**: Full light/dark mode via Framer's color system
- **Error Handling**: Graceful degradation when API unavailable

---

**Ready to build your expert directory!** 🚀 