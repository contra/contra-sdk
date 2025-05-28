# Contra Web Attributes Runtime (v0.2)

Design **anything** in Webflow → tag once → runtime clones.

## 1. Script
```html
<script src="https://<cdn>/contra-web-attrs.min.js" defer></script>
```

## 2. Wrapper
```html
<div data-contra-program="spline_expert"
     data-contra-languages="English,French"
     data-contra-min-rate="50">
  <!-- template hidden by display:none -->
  <div class="card" data-contra-template style="display:none">
     <img data-field="avatarUrl"/>
     <span data-field="name"></span>
     <div data-stars></div>
     <span data-field="hourlyRateUSD"></span>
     <!-- projects -->
     <div class="proj-row" data-repeat="projects">
        <a><img data-field="coverUrl"/></a>
     </div>
  </div>
</div>
```

## 3. Live filters
```html
<select multiple data-contra-filter="languages"> ... </select>
<input type="number" data-contra-filter="min-rate"/>
<input type="checkbox" data-contra-filter="available"/>
```
Changing any control triggers `wrapper._reload()` → new API call.

## Notes
* Any element inside template can bind via `[data-field]`, `[data-stars]`, `[data-repeat="projects"]`.
* The runtime loops first 4 projects; designers can add inner `[data-field]` hooks (coverUrl, projectUrl, title).
* CSS/layout fully controlled in Webflow.

---

# Contra Web Attributes Runtime

Add **one** script tag:
```html
<script src="https://<cdn>/contra-web-attrs.min.js" defer></script>
```

## Wrapper attributes
| Attribute | Example | Effect |
|-----------|---------|--------|
| `data-contra-program` | `spline_expert` | **required** |
| `data-contra-languages` | `English,French` | CSV list |
| `data-contra-min-rate` / `data-contra-max-rate` | `50` / `150` | numbers |
| `data-contra-sort` | `newest` | enum |
| `data-contra-available` | `true` | boolean |

## Template mark‑up
Inside the wrapper include **one** hidden element (display:none) flagged with `data-contra-template` and inner hooks:
```html
<div class="card" data-contra-template style="display:none">
  <img data-field="avatarUrl" />
  <span data-field="name"></span>
  <span data-stars></span>
  ...
</div>
```

## Filter controls
Add any input/select inside the wrapper and tag with `data-contra-filter="<key>"` where key ∈ languages | min-rate | max-rate | available | sort.
Component auto‑binds `change` events.

```html
<select multiple data-contra-filter="languages">
  <option>English</option><option>Spanish</option>
</select>
<input type="number" data-contra-filter="min-rate" placeholder="Min $" />
<input type="checkbox" data-contra-filter="available" /> Available only
```

Changing controls re‑renders the list instantly.

## CDN bundles
* `/contra-web-attrs.min.js` – UMD for browsers
* `/contra-web-attrs.module.js` – ESM 