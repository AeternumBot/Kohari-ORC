# Watermark Manager - Integration Guide

## Overview

This guide explains how to integrate the **Watermark Manager** module into Kohari TOOLS' CLEANER module.

---

## Files Created

```
src/modules/cleaner/
├── watermark-extraction-engine.js    - Core extraction algorithm
├── watermark-removal-engine.js       - Core removal algorithm
├── watermark-alignment.js            - Edge detection & alignment
├── watermark-ui.js                   - User interface handler
├── watermark.module.js               - Module definition
├── watermark.css                     - Styling
├── WATERMARK_README.md              - User documentation
└── INTEGRATION_GUIDE.md             - This file
```

**Total lines of code:** ~2,150

---

## Integration Steps

### Step 1: Add Module to Config

Update the appropriate config files to enable the watermark module:

**config.json** (complete version):
```json
{
  "version": "complete",
  "modules": {
    "ocr": { "enabled": true },
    "cleaner": { 
      "enabled": true,
      "watermark": { "enabled": true }
    },
    "extras": { "enabled": true }
  }
}
```

**build/config-cleaner-only.json** (cleaner-only version):
```json
{
  "version": "cleaner-only",
  "modules": {
    "ocr": { "enabled": false },
    "cleaner": { 
      "enabled": true,
      "watermark": { "enabled": true }
    },
    "extras": { "enabled": false }
  }
}
```

### Step 2: Update Module Loader

Modify `src/core/module-loader.js` to support sub-modules:

```javascript
// In module-loader.js loadModule method
async loadModule(moduleName, submodules = {}) {
  // Load parent module
  const module = await import(`../modules/${moduleName}/${moduleName}.module.js`);
  
  // Load sub-modules if specified
  if (submodules && submodules[moduleName]) {
    for (const [subName, config] of Object.entries(submodules[moduleName])) {
      if (config.enabled) {
        try {
          const subModule = await import(`../modules/${moduleName}/${subName}.module.js`);
          // Register sub-module
          this.modules[`${moduleName}:${subName}`] = subModule.default;
        } catch (e) {
          console.warn(`Failed to load sub-module ${moduleName}:${subName}:`, e);
        }
      }
    }
  }
  
  return module.default;
}
```

### Step 3: Import CSS

Add the watermark stylesheet to your main HTML or CSS import:

```html
<!-- In index.html -->
<link rel="stylesheet" href="./src/modules/cleaner/watermark.css">
```

Or in main CSS:
```css
@import './src/modules/cleaner/watermark.css';
```

### Step 4: Initialize in CLEANER Module

Update `src/modules/cleaner/cleaner.module.js`:

```javascript
// Add to cleaner.module.js
import watermarkModule from './watermark.module.js';

export default {
  name: 'cleaner',
  
  async init(app) {
    // Existing cleaner init code...
    
    // Initialize watermark sub-module
    if (app.getModule('cleaner:watermark')) {
      await watermarkModule.init(app);
    }
  },
  
  // ... rest of cleaner module
};
```

### Step 5: Add UI Tabs

Update `src/modules/cleaner/cleaner-ui.js` to register watermark tabs:

```javascript
setupUI() {
  // Existing cleaner UI...
  
  // Setup watermark tabs
  const watermarkHTML = `
    <div class="tab-content" id="watermarkTab">
      <!-- Watermark UI will inject content here -->
    </div>
  `;
  
  // Append to tab navigation
  const tabNav = document.querySelector('.cleaner-tabs');
  if (tabNav) {
    const tab = document.createElement('button');
    tab.className = 'tab-button';
    tab.textContent = '💧 Watermark';
    tab.addEventListener('click', () => this.switchTab('watermark'));
    tabNav.appendChild(tab);
  }
}
```

---

## Architecture

### Module Hierarchy

```
KohariApp (core/app.js)
└── CLEANER Module (cleaner.module.js)
    ├── Existing Features
    │   ├── LaMa AI Cleaner
    │   └── Bubble Filler
    │
    └── Watermark Manager (watermark.module.js)
        ├── Extraction Engine
        ├── Removal Engine
        ├── Alignment Helper
        └── UI Handler
```

### Data Flow

```
User Input (File Upload)
  ↓
watermark-ui.js
  ↓
[Engine Processing]
  ├── watermark-extraction-engine.js
  ├── watermark-removal-engine.js
  └── watermark-alignment.js
  ↓
Canvas Output
  ↓
Download PNG
```

### Event Communication

```javascript
// Module emits events
app.emit('watermark:extraction-completed', { watermark });
app.emit('watermark:removal-completed', { result });

// Other modules can listen
app.on('watermark:extraction-completed', (data) => {
  // Do something with extracted watermark
});
```

---

## Configuration

### Enable/Disable Features

```javascript
// In config.json
{
  "cleaner": {
    "enabled": true,
    "watermark": {
      "enabled": true,
      "extraction": true,
      "removal": true,
      "autoAlign": true,
      "subPixelPrecision": 10
    }
  }
}
```

### Performance Tuning

```javascript
// In watermark.module.js
const ALIGNMENT_CONFIG = {
  searchRadius: 20,      // Larger = slower but more thorough
  refineRadius: 2,       // Fine-tuning radius
  subpixelSteps: 10,     // Higher = more precision, slower
  jpegFilterRadius: 3,   // JPEG artifact filter radius
};
```

---

## Testing Checklist

Before deploying, test these scenarios:

### Extraction Tests
- [ ] Load two images with different backgrounds
- [ ] Auto-align finds the watermark offset
- [ ] Confidence score reflects alignment quality
- [ ] Bbox selection works with mouse drag
- [ ] Extracted watermark can be downloaded as PNG
- [ ] Test with different watermark sizes (small, medium, large)
- [ ] Test with faint watermarks (low opacity)
- [ ] Test with colorful watermarks

### Removal Tests
- [ ] Load original image + extracted watermark
- [ ] Auto-align positions watermark correctly
- [ ] Manual arrow key positioning works
- [ ] JPEG filter reduces artifacts
- [ ] Smooth edges smooths opaque pixels
- [ ] Opacity adjustment (50%-200%) works
- [ ] Transparency threshold slider affects result
- [ ] Result can be downloaded as PNG
- [ ] Test with different background types

### Integration Tests
- [ ] Watermark tabs appear in CLEANER module
- [ ] Can switch between tabs without errors
- [ ] Module loads/unloads cleanly
- [ ] Events are emitted correctly
- [ ] Works in ocr-only, cleaner-only, and complete versions
- [ ] Responsive on mobile viewports
- [ ] Dark/light theme switching works

### Performance Tests
- [ ] Images up to 2048×2048 process in <1s
- [ ] No memory leaks on repeated operations
- [ ] Canvas cleanup works properly
- [ ] Large batch operations remain responsive

---

## Error Handling

### Common Error Scenarios

1. **ImageBitmap creation fails**
   ```javascript
   // Handle in watermark-removal-engine.js
   catch (e) {
     this.logger.error('Failed to create ImageBitmap:', e);
     return false; // Fall back gracefully
   }
   ```

2. **Canvas operations on unsupported browser**
   ```javascript
   // Check for OffscreenCanvas support
   if (typeof OffscreenCanvas === 'undefined') {
     throw new Error('OffscreenCanvas not supported in this browser');
   }
   ```

3. **Out of memory for large images**
   ```javascript
   // Resize image if needed
   if (bitmap.width > 4096 || bitmap.height > 4096) {
     // Scale down or show warning
   }
   ```

---

## Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome 90+ | ✅ Full | All features work |
| Firefox 88+ | ✅ Full | All features work |
| Safari 14+ | ✅ Full | All features work |
| Edge 90+ | ✅ Full | All features work |
| IE 11 | ❌ No | OffscreenCanvas not supported |

**Requires:**
- `createImageBitmap()` API
- `OffscreenCanvas` API
- `ImageData` and Canvas 2D Context

---

## Performance Optimization

### Memory Usage
- Images are converted to ImageBitmap (direct browser memory)
- OffscreenCanvas avoids DOM overhead
- Uint8ClampedArray for direct pixel access (~4 bytes per pixel)

### Execution Speed
- Edge detection uses only sampled pixels (not every pixel)
- Alignment uses grid search + refinement (not brute force)
- Sub-pixel alignment runs only on best grid position (not all)

### Recommendations
1. **Resize large images** before processing (target <2048×2048)
2. **Disable unnecessary filters** (JPEG, smoothing if not needed)
3. **Use auto-align** only if necessary (manual positioning is faster)
4. **Cache watermarks** for batch processing
5. **Process in background** if handling multiple files

---

## Troubleshooting Integration

### Module Not Loading

**Check:**
1. Is watermark.module.js in correct path?
2. Is it enabled in config.json?
3. Do imports reference correct files?
4. Check browser console for import errors

**Solution:**
```javascript
// In browser console
app.getModule('cleaner:watermark') // Should return module object
```

### CSS Not Applying

**Check:**
1. Is watermark.css loaded?
2. Are CSS variable names correct (--bg-primary, --accent-color)?
3. Do theme data-attributes exist?

**Solution:**
```html
<!-- Verify CSS is loaded -->
<link rel="stylesheet" href="./src/modules/cleaner/watermark.css">
```

### Events Not Firing

**Check:**
1. Is module emitting events?
2. Is app event system initialized?
3. Are event names correct?

**Solution:**
```javascript
// Test event system
app.on('watermark:extraction-completed', console.log);
app.emit('watermark:extraction-completed', { test: true });
```

### UI Elements Missing

**Check:**
1. Is watermark-ui.js init() being called?
2. Are DOM element IDs correct?
3. Is cleaner tab element selected?

**Solution:**
```javascript
// Manually init if needed
const ui = new WatermarkUI(app.domManager, app.logger);
ui.init();
```

---

## Version Compatibility

### For Kohari v2.0.0+
✅ Full compatibility

### Updating Existing Versions
To add Watermark Manager to existing installations:

1. Copy new files to `src/modules/cleaner/`
2. Update config files
3. Rebuild/redeploy
4. No breaking changes to existing code

---

## Future Enhancements

### Planned Features
- [ ] GPU acceleration via WebGL
- [ ] Batch mode for multiple images
- [ ] Watermark templates library
- [ ] ML-based edge detection
- [ ] Integration with OCR pre-processing

### External Integration
- **Photoshop CEP:** Embed directly in Photoshop
- **Web API:** Expose as REST endpoint
- **Cloud Storage:** Save/load watermarks to cloud

---

## Support & Debugging

### Enable Debug Logging
```javascript
// In app.js
window.kohariLogger.setLevel('DEBUG');

// Then check logs for detailed info
window.kohariLogger.getHistory('DEBUG', 50);
```

### Test Extraction Algorithm
```javascript
const engine = new WatermarkExtractionEngine();
await engine.loadImage(file1, 1);
await engine.loadImage(file2, 2);
await engine.prepareData();

// Check detection
const alignment = engine.autoAlign(10);
console.log('Alignment quality:', alignment.confidence);
```

### Test Removal Algorithm
```javascript
const engine = new WatermarkRemovalEngine();
await engine.loadImage(originalFile);
await engine.loadWatermark(watermarkFile);
await engine.prepareData();

const result = engine.removeWatermark({
  alphaAdjustment: 1.0,
  filterJPEG: true,
  smoothEdges: true
});
```

---

## FAQ

**Q: Does this replace the existing CLEANER module?**
A: No, it's additive. Existing features (LaMa, bubble fill) remain unchanged.

**Q: Can I use this without Photoshop?**
A: Yes! The watermark manager is a standalone web tool.

**Q: Will this slow down Kohari?**
A: No, modules are loaded on-demand. No performance impact if not used.

**Q: Can I disable the watermark feature?**
A: Yes, set `"enabled": false` in config.json for that module.

---

## Deployment Checklist

- [ ] All files created in correct location
- [ ] Config files updated with watermark settings
- [ ] CSS imported in main stylesheet
- [ ] Module loader updated for sub-modules
- [ ] Cleaner module init includes watermark init
- [ ] Testing completed for all scenarios
- [ ] Documentation updated
- [ ] Build/bundler configured correctly
- [ ] No console errors in deployment build
- [ ] Feature works in all target browsers

---

**Status:** ✅ Ready for Integration
**Last Updated:** 2024
**Version:** 1.0.0
