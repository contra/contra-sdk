# Contra Expert Directory - Framer Implementation Guide

**Professional expert directories in Framer with zero code**

---

## 🎯 Quick Start (3 Minutes)

### Step 1: Get Your Credentials
Contact Contra to obtain:
- **API Key**: Your authentication key
- **Program ID**: Your expert program identifier

### Step 2: Add Component to Framer
1. Copy this URL: `https://framer.com/m/ExpertGrid-xxxx.js`
2. In Framer, press `Cmd/Ctrl + V` to paste
3. The component will appear in your Assets panel

### Step 3: Configure via Property Panel
1. Select the component on canvas
2. In Properties panel, add:
   - **API Key**: Your key from Step 1
   - **Program ID**: Your program ID from Step 1
3. Experts will load automatically!

---

## 🎨 Available Components

### ExpertGridFramer
**Full expert directory with filtering and infinite scroll**

Perfect for:
- Directory pages
- Team showcases
- Expert marketplaces
- Portfolio grids

### ExpertCardFramer
**Individual expert card for custom layouts**

Perfect for:
- Featured experts
- Hero sections
- Testimonials
- Custom layouts

---

## ⚙️ Property Controls Guide

### API Configuration
| Property | Description | Required |
|----------|-------------|----------|
| API Key | Your Contra API key | ✅ |
| Program ID | Your expert program ID | ✅ |
| Debug Mode | Show console logs | ❌ |

### Layout Options
| Property | Options | Default |
|----------|---------|---------|
| Columns | Auto, 1, 2, 3, 4 | Auto |
| Gap | Space between cards | 1.5rem |
| Items per Page | 1-100 | 20 |

### Filtering
| Property | Description | Type |
|----------|-------------|------|
| Sort By | Relevance, Newest, Oldest | Dropdown |
| Available Only | Show only available experts | Toggle |
| Location Filter | e.g. "San Francisco" | Text |
| Languages | Filter by languages | List |
| Min/Max Rate | Hourly rate range | Number |

### Display Options
| Property | Description | Default |
|----------|-------------|---------|
| Show Projects | Display project grid | ✅ |
| Max Projects | 1-8 projects shown | 4 |
| Show Stats | Earnings, reviews, etc | ✅ |
| Show Availability | Green/gray indicator | ✅ |
| Show Rate | Hourly rate | ✅ |
| Show Actions | Contact/Profile buttons | ✅ |

### Video Configuration
| Property | Description | Default |
|----------|-------------|---------|
| Video Autoplay | Auto-play project videos | ❌ |
| Video Hover Play | Play on mouse hover | ✅ |
| Video Muted | Mute video playback | ✅ |
| Video Loop | Loop videos | ✅ |
| Video Controls | Show player controls | ❌ |

### Performance
| Property | Description | Default |
|----------|-------------|---------|
| Infinite Scroll | Load more on scroll | ✅ |
| Use Canvas Data | Show placeholders on canvas | ✅ |
| Canvas Items | Placeholder count (1-20) | 6 |

---

## 🎯 Common Use Cases

### 1. Simple Expert Directory
```
Settings:
- Columns: Auto
- Show all display options
- Enable infinite scroll
```

### 2. Featured Experts Section
```
Settings:
- Columns: 3
- Items per Page: 3
- Sort By: Relevance
- Disable infinite scroll
```

### 3. Available Experts Only
```
Settings:
- Available Only: ✅
- Sort By: Newest
- Show Availability: ✅
```

### 4. Portfolio Showcase
```
Settings:
- Show Projects: ✅
- Max Projects: 4
- Video Hover Play: ✅
```

---

## 🎨 Styling in Framer

### Using Framer Styles
1. Select the component
2. Use Framer's style panel:
   - **Fill**: Background color
   - **Border**: Card borders
   - **Shadow**: Drop shadows
   - **Radius**: Corner radius

### Custom CSS
Add to your page's custom code:

```css
/* Card hover effects */
.contra-expert-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

/* Custom colors */
.contra-expert-card {
  --primary-color: #0066FF;
  --text-color: #1A1A1A;
  --border-color: #E5E5E5;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .contra-expert-grid {
    grid-template-columns: 1fr !important;
  }
}
```

---

## 🚀 Advanced Features

### Smart Components Integration
Create interactive experiences:

1. **Click to Expand**: Link expert cards to detail overlays
2. **Filter Toggles**: Create custom filter UI
3. **Load More Button**: Custom pagination controls

### Component States
Use Framer's component states for:
- Hover effects
- Loading states
- Error handling
- Empty states

### Breakpoints
The component automatically adapts:
- **Desktop**: Full grid layout
- **Tablet**: 2 columns
- **Mobile**: Single column

---

## ⚡ Performance Tips

### 1. Canvas Optimization
- Keep "Use Canvas Data" enabled
- Reduces canvas lag with placeholders
- Real data loads in preview

### 2. Image Optimization
- Component automatically lazy-loads
- Supports next-gen formats
- Handles video thumbnails

### 3. Caching
- Data cached for 5 minutes
- Reduces API calls
- Instant page switches

---

## 🛠️ Troubleshooting

### Nothing Showing?
1. ✅ Check API Key is correct
2. ✅ Verify Program ID
3. ✅ Enable Debug Mode
4. ✅ Check browser console

### Slow Performance?
1. Enable "Use Canvas Data"
2. Reduce "Canvas Items" count
3. Check internet connection

### Videos Not Playing?
1. Ensure "Video Muted" is enabled
2. Check "Video Hover Play" or "Video Autoplay"
3. Verify video URLs are accessible

---

## 📱 Responsive Design

The component automatically adapts:

```
Desktop (>1024px):  [📇][📇][📇][📇]
Tablet (768-1024px): [📇][📇]
Mobile (<768px):     [📇]
```

Override with custom breakpoints in Framer's responsive settings.

---

## 🎬 Video Support

### Automatic Detection
MP4 files automatically become video players:
- ✅ Hover to play (default)
- ✅ Muted for autoplay compatibility
- ✅ Smooth transitions
- ✅ Fallback for errors

### Supported Formats
- `.mp4`, `.webm`, `.mov`
- Cloudinary video URLs
- External video links

---

## 💡 Pro Tips

### 1. Component Variants
Create multiple versions:
- **Hero**: Single featured expert
- **Grid**: Standard directory
- **List**: Compact view

### 2. Performance Mode
For large directories:
- Set reasonable "Items per Page"
- Enable infinite scroll
- Use canvas placeholders

### 3. Custom Actions
Override default buttons:
- Link to custom forms
- Track analytics events
- Show custom modals

---

## 🔗 Sharing Components

### Share Your Configuration
1. Right-click component
2. Select "Copy URL"
3. Share with team/clients

URL includes your settings!

### Version Control
URLs can include version:
```
https://framer.com/m/ExpertGrid-xxxx.js@v1.2.3
```

---

## 📞 Need Help?

### Quick Checks
1. **API Key**: No quotes, no spaces
2. **Program ID**: Exact match from Contra
3. **Console**: Check for error messages
4. **Network**: Verify API calls succeed

### Support Resources
- Enable Debug Mode for detailed logs
- Check browser Developer Tools
- Contact Contra support with:
  - Your Program ID
  - Console errors
  - Network request details

---

**Ready to build amazing expert directories in Framer! 🚀** 