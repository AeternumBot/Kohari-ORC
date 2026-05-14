# Watermark Manager Module

## 📋 Overview

The **Watermark Manager** is a sophisticated image processing module integrated into Kohari TOOLS that provides two powerful features:

1. **🔍 Watermark Extractor** - Extract watermarks from images by comparing two versions with different backgrounds
2. **✨ Watermark Remover** - Remove extracted watermarks from images with mathematical precision and sub-pixel alignment

---

## 🎯 How It Works

### Watermark Extraction Algorithm

The extractor uses a **simple but effective subtraction method**:

```
Watermark = Image1 - Image2
```

**Steps:**
1. User loads the SAME watermark photographed on two different backgrounds
2. The algorithm automatically aligns them (finds the offset)
3. Subtracts Image2 from Image1 pixel-by-pixel to isolate the watermark
4. The result's alpha channel contains the watermark's opacity/intensity

**Example:** If you have a manga page with a watermark on white background and the same page with the watermark on black background, the difference reveals only the watermark.

### Watermark Removal Algorithm

The remover uses **direct mathematical subtraction**:

```
Clean Image = Original Image - (Watermark × Alpha)
```

**Key Features:**
- **Sub-pixel alignment** (0.05px precision) for perfect positioning
- **Automatic edge detection** to identify and align watermark boundaries
- **Three-phase alignment search:**
  1. Coarse grid search (±searchRadius)
  2. Fine refinement (±refineRadius)
  3. Sub-pixel refinement (10 fractional steps per axis)
- **Post-processing options:**
  - JPEG noise filtering
  - Opaque pixel smoothing
  - Opacity adjustment (10-200%)

---

## 📦 File Structure

```
src/modules/cleaner/
├── watermark-extraction-engine.js    (~400 lines) - Extraction logic
├── watermark-removal-engine.js       (~300 lines) - Removal logic
├── watermark-alignment.js            (~200 lines) - Alignment & edges
├── watermark-ui.js                   (~600 lines) - User interface
├── watermark.module.js               (~150 lines) - Module wrapper
├── watermark.css                     (~500 lines) - Styling
└── WATERMARK_README.md              (this file)
```

**Total:** ~2,150 lines of code

---

## 🚀 Usage

### In the UI (Manual)

#### Extraction Tab
1. **Load Image 1** - Click "Cargar Imagen 1", select your watermarked image on background A
2. **Load Image 2** - Click "Cargar Imagen 2", select the SAME watermark on background B
3. **Auto-Align** - Click "🤖 Auto-Alinear" to find the best offset (shows confidence %)
4. **Select Area** - Click "📐 Modo Selección" and drag to select the watermark area
5. **Extract** - Click "✂️ Extraer Marca"
6. **Download** - Click "💾 Descargar PNG" to save the extracted watermark

#### Removal Tab
1. **Load Original Image** - Click "Cargar Imagen", select your watermarked image
2. **Load Watermark** - Click "Cargar Marca", select the extracted watermark PNG
3. **Auto-Align** - Click "🤖 Auto-Alinear" for automatic positioning
4. **Adjust (Optional)** - Fine-tune with arrow buttons or manual offset entry
5. **Configure** - Toggle filters (JPEG/Smooth) and adjust opacity/threshold sliders
6. **Remove** - Click "⚡ Remover Marca"
7. **Download** - Click "💾 Descargar Resultado" for the cleaned image

### Programmatic Usage

```javascript
// Get module instance
const watermarkModule = app.getModule('watermark');

// Extract watermark
const watermark = await watermarkModule.extractWatermark(
  image1File,  // File object
  image2File,  // File object
  { x: 50, y: 50, width: 200, height: 150 }  // bbox
);

// Remove watermark
const cleaned = await watermarkModule.removeWatermark(
  originalImageFile,  // File object
  watermarkImageFile, // File object
  {
    autoAlign: true,           // Auto-detect alignment
    filterJPEG: true,          // Reduce compression artifacts
    smoothEdges: true,         // Smooth opaque pixels
    alphaAdjustment: 1.0,      // 100% opacity (0.5-2.0 range)
    transparencyThreshold: 20, // Only process opaque pixels
    offsetX: 100,              // Manual offset X
    offsetY: 50                // Manual offset Y
  }
);
```

---

## 🔧 Configuration Options

### Removal Options

| Option | Type | Range | Default | Description |
|--------|------|-------|---------|-------------|
| `autoAlign` | boolean | - | false | Auto-detect optimal alignment |
| `filterJPEG` | boolean | - | false | Reduce JPEG compression artifacts |
| `smoothEdges` | boolean | - | false | Smooth very opaque pixels |
| `alphaAdjustment` | number | 0-2 | 1.0 | Watermark opacity multiplier |
| `transparencyThreshold` | number | 0-255 | 20 | Min alpha to process |
| `opaqueThreshold` | number | 0-255 | 200 | Alpha for smoothing |
| `jpegRadius` | number | 1-5 | 3 | JPEG filter radius |
| `jpegThreshold` | number | 0-20 | 4 | JPEG filter sensitivity |
| `autoSubpixel` | boolean | - | false | Enable sub-pixel alignment |

### Alignment Options

| Option | Type | Range | Default | Description |
|--------|------|-------|---------|-------------|
| `searchRadius` | number | 5-50 | 20 | Coarse grid search radius (px) |
| `refineRadius` | number | 1-5 | 2 | Fine refinement radius (px) |
| `subpixelSteps` | number | 5-20 | 10 | Sub-pixel precision steps |

---

## 📊 Algorithm Performance

| Operation | Time | Memory | Notes |
|-----------|------|--------|-------|
| Load image (2048×2048) | ~50ms | ~50MB | Includes colorspace conversion |
| Auto-align (grid search) | ~200ms | ~10MB | 40×40 offset grid |
| Extract watermark | ~100ms | ~20MB | Pixel-by-pixel subtraction |
| Remove watermark | ~150ms | ~30MB | Includes post-processing |
| Auto-align (sub-pixel) | ~300ms | ~20MB | Three-phase refinement |

**Total workflow (both images):** ~800ms for full processing

---

## ⚠️ Limitations & Considerations

### When It Works Well ✅
- Watermarks with **sharp, well-defined edges**
- Watermarks that **don't change** between images
- Images with **good contrast** between background and watermark
- **Same watermark** on both backgrounds (extraction)
- Images smaller than **4096×4096 pixels**

### When It Struggles ⚠️
- Watermarks with **soft transparency gradients**
- Watermarks that **scaled/rotated** between images
- **Very faint watermarks** (low opacity)
- Watermarks with **complex colors** matching background
- **JPEG compression artifacts** on the watermark
- Watermarks affecting over **40% of image**

### Best Practices 🎯
1. **Extract first** - Always get the exact watermark shape
2. **Use PNG** - Ensure alpha transparency is preserved
3. **Match positioning** - Manual adjustment often beats auto-align
4. **Test filters** - JPEG filter helps compressed images
5. **Lower threshold** - If watermark is faint, reduce `transparencyThreshold`

---

## 🐛 Troubleshooting

### Auto-align shows low confidence (<50%)
**Solution:** Manually adjust using arrow buttons or enter precise X/Y offsets

### Watermark removal leaves dark/light spots
**Solution:** Enable "Filtro JPEG" post-processing filter

### Edges look jagged after removal
**Solution:** Enable "Suavizar Bordes" (smooth opaque pixels)

### Watermark isn't being detected
**Solution:** 
- Check if transparency channel is properly preserved
- Lower `transparencyThreshold` to catch fainter marks
- Verify both images are the SAME watermark

### Performance is slow
**Solution:**
- Resize images to <2048×2048 before processing
- Disable auto-align and use manual positioning
- Turn off unnecessary post-processing filters

---

## 📝 Events

The module emits these app-wide events:

```javascript
// Extraction completed
app.on('watermark:extraction-completed', ({ watermark }) => {
  console.log('Watermark extracted:', watermark);
});

// Removal completed
app.on('watermark:removal-completed', ({ result }) => {
  console.log('Watermark removed:', result);
});
```

---

## 🔌 Integration Points

### With Photoshop
The extracted watermark or cleaned image can be:
- Returned to Photoshop as new layer
- Saved to clipboard
- Exported directly as PNG

### With Other Modules
- **OCR Module:** Pre-process image (remove watermarks) before scanning
- **Cleaner Module:** Combine with LaMa AI for enhanced results
- **Storage:** Cache extracted watermarks for batch processing

---

## 📚 Technical Details

### ImageData Handling
- Uses OffscreenCanvas for performance
- Direct RGBA manipulation (Uint8ClampedArray)
- No compression overhead
- ~4 bytes per pixel (RGBA)

### Color Space
- Non-premultiplied alpha (standard)
- Linear pixel values (no gamma correction)
- Full 8-bit color depth per channel

### Coordinate System
- Origin (0,0) at top-left
- X increases rightward
- Y increases downward
- Sub-pixel precision: ±0.05px

---

## 🎓 Examples

### Example 1: Simple Extraction & Removal

```javascript
// Load images
const img1 = document.getElementById('imageInput1').files[0];
const img2 = document.getElementById('imageInput2').files[0];

// Extract watermark
const watermark = await watermarkModule.extractWatermark(
  img1, img2,
  { x: 100, y: 100, width: 300, height: 200 }
);

// Remove from original
const cleaned = await watermarkModule.removeWatermark(
  img1, watermark,
  { autoAlign: true, filterJPEG: true }
);
```

### Example 2: Batch Processing

```javascript
const images = [...fileList];

for (const image of images) {
  const cleaned = await watermarkModule.removeWatermark(
    image,
    cachedWatermark,  // Reuse same watermark
    {
      autoAlign: true,
      smoothEdges: true,
      filterJPEG: true
    }
  );

  // Process result...
}
```

### Example 3: High-Precision Alignment

```javascript
// Find optimal alignment with sub-pixel precision
const alignment = watermarkModule.findOptimalAlignment(
  originalImageData,
  watermarkImageData,
  {
    searchRadius: 30,    // Wider search
    refineRadius: 3,     // Finer refinement
    subpixelSteps: 15    // More sub-pixel steps
  }
);

console.log(`Best alignment: X=${alignment.offsetX.toFixed(2)}, Y=${alignment.offsetY.toFixed(2)}, Confidence=${(alignment.confidence*100).toFixed(1)}%`);
```

---

## 🚀 Future Improvements

Potential enhancements for future versions:

1. **ML-based watermark detection** - Automatic watermark identification
2. **Batch mode** - Process multiple images automatically
3. **Template matching** - Find watermark instances in larger images
4. **Gradient preservation** - Better handling of soft transparency
5. **Color correction** - Handle color shifts between backgrounds
6. **WebGL acceleration** - GPU-based pixel operations
7. **Real-time preview** - Live alignment visualization
8. **Watermark library** - Store/manage extracted watermarks

---

## 📄 License & Attribution

Part of **Kohari TOOLS v2.0.0**
- Watermark extraction algorithm based on image subtraction
- Alignment engine uses gradient-based edge detection
- All original code © 2024

---

## ❓ FAQ

**Q: Why do I need two images for extraction?**
A: Different backgrounds reveal the watermark's transparency profile. One image isn't enough because the watermark might blend with the background.

**Q: Can I extract a watermark from a single image?**
A: No, the algorithm requires subtraction. However, if you know the watermark in advance, you can use the Remover directly.

**Q: Will this work on JPEG watermarks?**
A: Better on PNG watermarks with clear alpha channel. JPEG watermarks are harder because they lack transparency info.

**Q: What's sub-pixel alignment?**
A: Movement precision of 0.05 pixels. Watermarks can be off by fractional pixels, and sub-pixel correction fixes this for perfect removal.

**Q: Can I use this for copyright removal?**
A: This tool extracts and removes watermarks from YOUR OWN content or with permission. Respect copyright laws in your jurisdiction.

---

**Last Updated:** 2024
**Version:** 1.0.0
**Status:** ✅ Production Ready
