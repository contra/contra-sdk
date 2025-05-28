# Contra SDK Deployment & Testing Guide

## 🚀 Quick Start Testing

### **Step 1: Push to GitHub**

1. Create a new repository on GitHub (e.g., `contra-sdk`)
2. Run these commands:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/contra-sdk.git
   git branch -M main
   git push -u origin main
   ```

### **Step 2: Test on Webflow (Immediate)**

**Option A: Using jsDelivr CDN (No npm required)**
```html
<!-- Add this to your Webflow site's custom code (before </body>) -->
<script id="contra-config" type="application/json">
{
  "apiKey": "your-contra-api-key"
}
</script>

<script src="https://cdn.jsdelivr.net/gh/YOUR_USERNAME/contra-sdk@main/packages/contra-web-attrs/dist/index.min.js" defer></script>
```

**Option B: Host on Vercel/Netlify**
1. Connect your GitHub repo to Vercel
2. Deploy with these settings:
   - Build Command: `npm run build`
   - Output Directory: `.`
3. Use the URL: `https://your-project.vercel.app/packages/contra-web-attrs/dist/index.min.js`

### **Step 3: Test on Framer**

**Using npm packages:**
1. In your Framer project, go to Assets → Code
2. Create a new code component
3. Install the package: `npm install @contra/contra-react-framer@latest`
4. Use the component (see examples below)

---

## 📦 Professional Deployment (npm Publishing)

### **Prepare for Publishing**

1. **Update package.json files** (replace `YOUR_USERNAME` with your GitHub username)
2. **Build all packages:**
   ```bash
   npm run build
   ```

3. **Create npm account** (if you don't have one):
   ```bash
   npm adduser
   ```

4. **Login to npm:**
   ```bash
   npm login
   ```

### **Publish Packages**

**Publish in order (core first):**
```bash
# 1. Core package
cd packages/contra-core
npm publish --access public

# 2. Web attrs package  
cd ../contra-web-attrs
npm publish --access public

# 3. React framer package
cd ../contra-react-framer
npm publish --access public
```

### **After Publishing**

**Webflow CDN Options:**
- jsDelivr: `https://cdn.jsdelivr.net/npm/@contra/contra-web-attrs@latest/dist/index.min.js`
- unpkg: `https://unpkg.com/@contra/contra-web-attrs@latest/dist/index.min.js`

**Framer Installation:**
```bash
npm install @contra/contra-react-framer @contra/contra-core
```

---

## 🧪 Testing Examples

### **Webflow Test Page**

```html
<!DOCTYPE html>
<html>
<head>
    <title>Contra SDK Test</title>
    <style>
        .expert-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
        .expert-card { border: 1px solid #ddd; padding: 20px; border-radius: 8px; }
        .expert-card img { width: 60px; height: 60px; border-radius: 50%; }
    </style>
</head>
<body>
    <!-- Configuration -->
    <script id="contra-config" type="application/json">
    {
        "apiKey": "your-actual-api-key-here"
    }
    </script>

    <!-- Expert List -->
    <div class="expert-grid" 
         data-contra-program="spline_expert"
         data-contra-min-rate="25">
        
        <!-- Template (hidden) -->
        <div class="expert-card" data-contra-template style="display:none">
            <img data-field="avatarUrl" alt="Expert">
            <h3 data-field="name"></h3>
            <div data-stars></div>
            <p data-field="hourlyRateUSD"></p>
            <p data-field="bio"></p>
        </div>
    </div>

    <!-- Load SDK -->
    <script src="YOUR_CDN_URL_HERE" defer></script>
</body>
</html>
```

### **Framer Code Component**

```tsx
import { addPropertyControls, ControlType } from "framer"
import { ContraProvider, ExpertList } from '@contra/contra-react-framer'

export function ContraExperts({ apiKey, program, minRate, maxRate }) {
    return (
        <ContraProvider apiKey={apiKey}>
            <ExpertList 
                program={program}
                filters={{ minRate, maxRate }}
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '20px'
                }}
            />
        </ContraProvider>
    )
}

addPropertyControls(ContraExperts, {
    apiKey: { 
        type: ControlType.String, 
        title: "API Key",
        defaultValue: "your-api-key"
    },
    program: { 
        type: ControlType.String, 
        title: "Program",
        defaultValue: "spline_expert"
    },
    minRate: { 
        type: ControlType.Number, 
        title: "Min Rate",
        defaultValue: 25
    },
    maxRate: { 
        type: ControlType.Number, 
        title: "Max Rate", 
        defaultValue: 200
    }
})
```

---

## 🔧 Troubleshooting

### **Common Issues**

**Webflow:**
- ✅ Make sure the script loads after the DOM content
- ✅ Check browser console for errors
- ✅ Verify API key is correct
- ✅ Check network requests in DevTools

**Framer:**
- ✅ Ensure React 18+ is used
- ✅ Check if npm package installed correctly
- ✅ Verify import paths are correct
- ✅ Check Framer's package manager logs

### **Testing Checklist**

**Before Publishing:**
- [ ] All packages build successfully (`npm run build`)
- [ ] No TypeScript errors
- [ ] Examples work locally
- [ ] API key configuration tested

**After Publishing:**
- [ ] CDN URLs work in browser
- [ ] npm packages install correctly
- [ ] Webflow integration functional
- [ ] Framer integration functional

---

## 📈 Next Steps

1. **Get API Key** from Contra developer portal
2. **Test locally** with real API key
3. **Deploy to GitHub** for CDN access
4. **Publish to npm** for professional distribution
5. **Test on live sites** (Webflow/Framer)
6. **Iterate and improve** based on feedback

---

## 🔗 Useful Links

- **jsDelivr CDN**: https://www.jsdelivr.com/
- **npm Publishing Guide**: https://docs.npmjs.com/creating-and-publishing-scoped-packages
- **Vercel Deployment**: https://vercel.com/docs
- **Framer Code Components**: https://www.framer.com/docs/code-components/ 