# Contra Expert Directory SDK - Quick Implementation Guide

**Get your expert directory up and running in 5 minutes**

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Add Configuration
```html
<script id="contra-config" type="application/json">
{
  "program": "YOUR_PROGRAM_ID",
  "apiKey": "YOUR_API_KEY"
}
</script>
```

### Step 2: Add HTML Structure
```html
<div data-contra-program="YOUR_PROGRAM_ID" data-contra-limit="20">
  <!-- Expert Card Template -->
  <div data-contra-template class="expert-card" style="display: none;">
    <img data-contra-field="avatarUrl" class="avatar" alt="Expert Avatar">
    <h3 data-contra-field="name">Expert Name</h3>
    <p data-contra-field="oneLiner">Expert Bio</p>
    <span data-contra-field="location">Location</span>
    <a data-contra-field="inquiryUrl" class="cta" target="_blank">Contact</a>
  </div>
  
  <!-- States -->
  <div data-contra-loading>Loading experts...</div>
  <div data-contra-error></div>
  <div data-contra-empty>No experts found.</div>
</div>
```

### Step 3: Add SDK Script
```html
<script src="https://cdn.jsdelivr.net/gh/javron/contra-sdk@latest/packages/contra-webflow/dist/runtime.min.js"></script>
```

---

## 🎨 Professional Template Example

```html
<div data-contra-template class="expert-card" style="display: none;">
  <!-- Header -->
  <div class="card-header">
    <img data-contra-field="avatarUrl" class="avatar" alt="Expert Avatar">
    <div class="expert-info">
      <h3 data-contra-field="name" class="expert-name">Expert Name</h3>
      <p data-contra-field="location" class="location">Location</p>
    </div>
    <span data-contra-show-when="available:true" class="available-badge">Available</span>
  </div>
  
  <!-- Bio -->
  <p data-contra-field="oneLiner" class="bio">Expert bio</p>
  
  <!-- Stats -->
  <div class="stats">
    <div class="stat">
      <span data-contra-field="earningsUSD" data-contra-format="earnings">$0</span>
      <span>Earned</span>
    </div>
    <div class="stat">
      <span data-contra-field="projectsCompletedCount">0</span>
      <span>Projects</span>
    </div>
    <div class="stat">
      <div data-contra-stars></div>
      <span data-contra-field="averageReviewScore">0</span>
    </div>
  </div>
  
  <!-- Projects -->
  <div data-contra-repeat="projects" data-contra-max="4" class="projects">
    <a data-contra-field="projectUrl" target="_blank">
      <img data-contra-field="coverUrl" class="project-thumb" alt="Project">
    </a>
  </div>
  
  <!-- Actions -->
  <div class="actions">
    <a data-contra-field="profileUrl" class="profile-link" target="_blank">View Profile</a>
    <a data-contra-field="inquiryUrl" class="contact-btn" target="_blank">Contact Expert</a>
  </div>
</div>
```

---

## 🔍 Add Filters (Optional)

```html
<!-- Filter Controls -->
<div class="filters">
  <select data-contra-filter="sortBy">
    <option value="relevance">Most Relevant</option>
    <option value="newest">Newest</option>
  </select>
  
  <label>
    <input type="checkbox" data-contra-filter="available" value="true">
    Available Only
  </label>
  
  <input type="number" data-contra-filter="minRate" placeholder="Min Rate">
  <input type="number" data-contra-filter="maxRate" placeholder="Max Rate">
</div>
```

---

## 🎬 Video Configuration (Enterprise)

```json
{
  "program": "YOUR_PROGRAM_ID",
  "apiKey": "YOUR_API_KEY",
  "videoAutoplay": false,
  "videoHoverPlay": true,
  "videoMuted": true,
  "videoLoop": true,
  "videoControls": false
}
```

---

## 📊 Essential CSS

```css
.expert-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  background: white;
  transition: transform 0.2s;
}

.expert-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.stats {
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
  padding: 1rem 0;
  border-top: 1px solid #f3f4f6;
  border-bottom: 1px solid #f3f4f6;
}

.stat {
  text-align: center;
  flex: 1;
}

.projects {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  margin: 1rem 0;
}

.project-thumb {
  width: 100%;
  aspect-ratio: 4/3;
  object-fit: cover;
  border-radius: 6px;
}

/* Responsive */
@media (max-width: 768px) {
  .projects {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

---

## ✅ Checklist

- [ ] Configuration script added with valid program ID and API key
- [ ] Container has `data-contra-program` attribute
- [ ] Template has `data-contra-template` attribute and `display: none`
- [ ] Loading, error, and empty states included
- [ ] SDK script loaded from CDN
- [ ] CSS styles applied for responsive design

---

## 🛠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| No experts loading | Check API key and program ID in config |
| Template not cloning | Verify `data-contra-template` attribute |
| Styles not applying | Check CSS selectors match your classes |
| Console errors | Enable `"debug": true` in config |

---

## 📞 Need Help?

1. **Enable Debug Mode**: Set `"debug": true` in your configuration
2. **Check Browser Console**: Look for error messages and API responses
3. **Verify Network Requests**: Ensure API calls are successful in Network tab
4. **Contact Support**: Share your configuration and HTML structure

---

**Full Documentation**: See `packages/contra-webflow/README.md` for complete reference.

**Live CDN**: `https://cdn.jsdelivr.net/gh/javron/contra-sdk@latest/packages/contra-webflow/dist/runtime.min.js` 