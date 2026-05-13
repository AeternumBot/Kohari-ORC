# Watermark Manager - Testing Guide

## 🧪 Overview

This guide provides comprehensive testing procedures for the Watermark Manager module.

---

## ✅ Pre-Integration Testing

### Environment Setup
```javascript
// Test in browser console
console.log('OffscreenCanvas:', typeof OffscreenCanvas); // Should be 'function'
console.log('ImageBitmap:', typeof ImageBitmap);         // Should be 'function'
console.log('Canvas 2D:', !!document.createElement('canvas').getContext('2d')); // true
```

### Module Loading
```javascript
// Verify module is loaded
const watermark = app.getModule('watermark');
console.assert(watermark !== undefined, 'Watermark module should exist');
console.log('Module info:', watermark.getInfo());
```

---

## 🎯 Extraction Tests

### Test 1: Basic Image Loading

**Steps:**
1. Click "Cargar Imagen 1" in Extractor tab
2. Select a PNG image (transparent background)
3. Verify canvas shows image correctly
4. Click "Cargar Imagen 2"
5. Select same image (different background)
6. Verify both canvases display

**Expected:**
- ✅ Images render in correct canvases
- ✅ Canvas size matches image size
- ✅ No distortion or rotation
- ✅ Transparency preserved (if applicable)

**Failure Cases:**
- ❌ Image not showing → Check file format (PNG/JPG/WebP)
- ❌ Distorted image → Canvas width/height mismatch
- ❌ Black canvas → Image load error (check console)

---

### Test 2: Auto-Alignment

**Prerequisites:**
- Load two images of same watermark on different backgrounds

**Steps:**
1. Click "🤖 Auto-Alinear" button
2. Observe confidence badge
3. View preview (50% overlay)
4. Check if watermark overlaps perfectly

**Expected Confidence Levels:**
- ✅ 90-100%: Perfect alignment
- ✅ 70-89%: Good alignment
- ⚠️ 50-69%: Acceptable, may need refinement
- ❌ <50%: Poor alignment (try manual)

**Test Scenarios:**
1. **Same watermark, clean backgrounds** → Expect 95%+
2. **Watermark with slight offset** → Expect 80-90%
3. **Different watermark size** → Expect <50% (algorithm limitation)
4. **Rotated watermark** → Expect <50% (not supported)

---

### Test 3: Manual Alignment

**Steps:**
1. Load two images
2. Click alignment arrow buttons:
   - ▲ (Up) - move image2 up
   - ▼ (Down) - move image2 down
   - ◄ (Left) - move image2 left
   - ► (Right) - move image2 right
3. Verify preview updates in real-time
4. Fine-tune until perfect overlap

**Expected:**
- ✅ Each arrow press moves 1 pixel
- ✅ Preview updates immediately
- ✅ Can reach sub-pixel positioning
- ✅ Confidence updates as you adjust

**Edge Cases:**
- Multiple clicks in rapid succession → Should queue smoothly
- Holding arrow key → Should repeat movement
- Moving beyond image bounds → Should stop at boundary

---

### Test 4: Bounding Box Selection

**Steps:**
1. Click "📐 Modo Selección"
2. Button should change to "✋ Cancelar Selección"
3. Draw box on Image 1 canvas by dragging
4. Release mouse
5. Verify bbox values populated in fields

**Expected:**
- ✅ Green rectangle drawn on canvas while dragging
- ✅ BBox X, Y, Width, Height fields populated
- ✅ Can adjust values manually in input fields
- ✅ Preview updates with selected area

**Test Cases:**
- Small watermark (50×50px) → BBox should be tight
- Large watermark (300×300px) → BBox should encompass entire mark
- Watermark at edge → Coordinates should be accurate
- Multiple clicks → Only last selection counts

---

### Test 5: Watermark Extraction

**Prerequisites:**
- Two aligned images with visible watermark
- Selected bounding box

**Steps:**
1. Click "✂️ Extraer Marca"
2. Status should show "Extrayendo marca..."
3. Wait for completion
4. Status should show "✅ Marca extraída"
5. "💾 Descargar PNG" button should enable

**Expected:**
- ✅ Extraction completes in <200ms
- ✅ Status message confirms success
- ✅ Download button becomes active
- ✅ No console errors

**Test Different Watermark Types:**
1. **Colored watermark** → Should extract RGB + alpha
2. **Grayscale watermark** → Should show in grayscale
3. **Faint watermark** (low opacity) → Should extract as semi-transparent
4. **Complex watermark** (text + logo) → Should extract shape accurately
5. **Watermark with gradients** → Should show gradient in extraction

---

### Test 6: PNG Download

**Steps:**
1. Extract a watermark (see Test 5)
2. Click "💾 Descargar PNG"
3. Browser download dialog appears
4. Save file to disk
5. Open PNG in image viewer
6. Verify transparency is preserved

**Expected:**
- ✅ Browser download triggered
- ✅ File named "extracted_watermark.png"
- ✅ PNG has transparent background
- ✅ Watermark shape visible
- ✅ Transparency channel present (ImageData.data[n+3] values)

---

## 🎨 Removal Tests

### Test 7: Basic Watermark Removal

**Prerequisites:**
- Original image with visible watermark (PNG or JPG)
- Extracted watermark PNG

**Steps:**
1. Click "Cargar Imagen" (Remover tab)
2. Select original watermarked image
3. Click "Cargar Marca"
4. Select extracted watermark PNG
5. Click "🤖 Auto-Alinear"
6. Observe confidence score
7. Click "⚡ Remover Marca"
8. Result displays in canvas

**Expected:**
- ✅ Auto-align finds position (confidence >70%)
- ✅ Removal completes in <200ms
- ✅ Watermark less visible in result
- ✅ Image quality preserved (no major artifacts)

---

### Test 8: Manual Positioning

**Prerequisites:**
- Original image loaded
- Watermark loaded

**Steps:**
1. Use arrow buttons to position watermark manually
2. Or enter precise X/Y offsets in numeric inputs
3. Click "⚡ Remover Marca"
4. Observe result

**Expected:**
- ✅ Arrow buttons move ±1px per click
- ✅ Numeric input accepts float values (e.g., 123.5)
- ✅ Removal uses exact position specified
- ✅ Result reflects positioning

**Precision Test:**
- Set offset to X: 100, Y: 50
- Verify watermark removed from that exact location
- Test sub-pixel values (100.2, 50.7)
- Verify result is different from integer positions

---

### Test 9: Post-Processing Filters

### Test 9a: JPEG Filter

**Steps:**
1. Load image with JPEG compression artifacts
2. Uncheck all filters
3. Remove watermark (note artifacts)
4. Check "Filtro JPEG"
5. Remove again (should have fewer artifacts)

**Expected:**
- ✅ Artifacts reduced when filter enabled
- ✅ Result smoother than without filter
- ✅ No major quality loss

**Side Effect Test:**
- If filter radius too large → Watermark removal less accurate
- Adjust via hidden config if needed

### Test 9b: Edge Smoothing

**Steps:**
1. Load watermark with hard edges
2. Uncheck "Suavizar Bordes"
3. Remove watermark
4. Check "Suavizar Bordes"
5. Remove again

**Expected:**
- ✅ Smooth edges blend better with background
- ✅ Avoids harsh lines at watermark boundary
- ✅ Creates more natural result

---

### Test 10: Opacity Adjustment

**Steps:**
1. Load original + watermark
2. Move "Ajuste Opacidad Marca" slider (50% to 200%)
3. Remove watermark at different opacity levels
4. Compare results

**Expected:**
- ✅ Slider range: 50% to 200%
- ✅ Value shown in percentage
- ✅ Lower values → watermark less removed (underestimated)
- ✅ Higher values → watermark removed aggressively (overestimated)
- ✅ 100% should be optimal for original watermark

**Tuning Test:**
- If result too dark → Increase opacity %
- If result too light → Decrease opacity %
- Find sweet spot for specific watermark

---

### Test 11: Transparency Threshold

**Steps:**
1. Move "Umbral Transparencia" slider (0 to 100)
2. Remove watermark at different thresholds
3. Observe which pixels are affected

**Expected:**
- ✅ Lower threshold → More pixels affected
- ✅ Higher threshold → Only opaque watermark pixels affected
- ✅ Faint watermarks need lower threshold (<20)
- ✅ Opaque watermarks can use higher threshold (>50)

**Test Cases:**
- Very faint watermark → Use threshold 5-10
- Normal watermark → Use threshold 15-30
- Very opaque watermark → Use threshold 40-60

---

### Test 12: Removal Download

**Steps:**
1. Remove watermark successfully
2. Click "💾 Descargar Resultado"
3. Browser download triggered
4. Save file
5. Open in image viewer
6. Compare with original

**Expected:**
- ✅ File named "unwatermarked.png"
- ✅ PNG format preserved
- ✅ Image quality maintained
- ✅ Watermark significantly reduced or gone

---

## 🌐 UI & UX Tests

### Test 13: Tab Switching

**Steps:**
1. Click on Extractor tab
2. Load images
3. Click on Remover tab
4. Verify UI switches correctly
5. Click back to Extractor
6. Verify state preserved (images still visible)

**Expected:**
- ✅ Smooth tab transition
- ✅ Content visible/hidden appropriately
- ✅ No state loss when switching tabs
- ✅ Both tabs independent

---

### Test 14: Theme Support

**Steps:**
1. Set Photoshop to "Darkest" theme
2. Verify watermark UI matches
3. Switch to "Light" theme
4. Verify colors adjust
5. Switch back

**Expected:**
- ✅ UI respects theme colors
- ✅ Text readable in all themes
- ✅ Contrast ratios > 4.5:1 (accessibility)
- ✅ No flickering on theme change

**Visual Tests:**
- Buttons visible in all themes
- Canvas background matches theme
- Status messages readable
- Confidence badge color appropriate

---

### Test 15: Responsive Design

**Steps:**
1. Test on desktop (1920×1080)
2. Resize browser to tablet (768×1024)
3. Resize to mobile (375×812)
4. Verify layout adapts

**Expected:**
- ✅ Single column on mobile
- ✅ Two columns on desktop
- ✅ All buttons clickable (not too small)
- ✅ Canvas scales appropriately
- ✅ Text readable on all sizes

---

### Test 16: Error Messages

**Test Invalid File:**
- Upload corrupted image → Error message appears
- Upload unsupported format → Error message appears
- Upload empty file → Error message appears

**Expected:**
- ✅ User-friendly error messages
- ✅ Suggests recovery (e.g., "Try PNG instead")
- ✅ No console crashes
- ✅ UI remains functional

---

## 📊 Performance Tests

### Test 17: Load Time

```javascript
console.time('image-load');
// Load image
console.timeEnd('image-load');
// Should be < 100ms
```

**Expected:**
- ✅ Small images (<1MB): < 50ms
- ✅ Medium images (2-5MB): < 100ms
- ✅ Large images (>5MB): < 200ms

---

### Test 18: Alignment Speed

```javascript
console.time('auto-align');
// Click auto-align button
console.timeEnd('auto-align');
// Should be < 500ms
```

**Expected:**
- ✅ Auto-align completes in < 500ms
- ✅ User feedback (status message) appears during operation
- ✅ No UI freezing

---

### Test 19: Removal Speed

```javascript
console.time('removal');
// Click remove button
console.timeEnd('removal');
// Should be < 200ms
```

**Expected:**
- ✅ Removal completes in < 200ms (without filters)
- ✅ With JPEG filter: < 400ms
- ✅ With smoothing: < 300ms
- ✅ UI remains responsive

---

### Test 20: Memory Usage

**Steps:**
1. Open DevTools → Memory tab
2. Take heap snapshot
3. Load image
4. Remove watermark
5. Take another snapshot
6. Check memory didn't leak

**Expected:**
- ✅ Memory returns to baseline after operation
- ✅ No accumulation on repeated operations
- ✅ Large images release memory after processing

---

## 🧬 Algorithm Tests

### Test 21: Edge Detection Accuracy

```javascript
const edges = watermarkModule.detectWatermarkEdges(
  watermarkImageData,
  threshold = 30
);
console.log(`Found ${edges.length} edge pixels`);
// Should find most watermark boundaries
```

**Expected:**
- ✅ Edges array contains detected boundary pixels
- ✅ More edges with lower threshold
- ✅ Fewer edges with higher threshold
- ✅ Edges correspond to visual watermark boundaries

---

### Test 22: Alignment Confidence Accuracy

**Test Cases:**
1. Perfect alignment → Confidence ~95-100%
2. Off by 1 pixel → Confidence ~80%
3. Off by 5 pixels → Confidence ~50%
4. Off by 20 pixels → Confidence ~10%

**Expected:**
- ✅ Confidence correlates with alignment quality
- ✅ Manual inspection confirms high confidence = good alignment
- ✅ Low confidence (< 70%) suggests manual adjustment

---

### Test 23: Subtraction Accuracy

**Formula:** `Result = Original - (Watermark × Alpha)`

**Test:**
1. Load known watermark
2. Load original with same watermark
3. Align perfectly (offset = 0,0)
4. Remove watermark
5. Result should be close to watermark-free image

**Expected:**
- ✅ Watermark removed correctly
- ✅ Result matches expected background
- ✅ Minimal artifacts

---

## ✔️ Regression Tests

### Test 24: Reset Functionality

**Steps:**
1. Load images in Extractor
2. Extract watermark
3. Click "🔄 Resetear"
4. Verify canvases cleared
5. Verify states reset

**Expected:**
- ✅ Canvases empty
- ✅ Buttons disabled
- ✅ Fields cleared
- ✅ Status reset to initial

---

### Test 25: Multiple Operations

**Steps:**
1. Load Image Set 1 → Extract → Download
2. Load Image Set 2 → Extract → Download
3. Load Original 1 + Watermark 1 → Remove → Download
4. Load Original 2 + Watermark 2 → Remove → Download
5. No crashes or memory leaks

**Expected:**
- ✅ All operations complete successfully
- ✅ Each download has unique file
- ✅ No cross-contamination between operations
- ✅ Memory remains stable

---

## 📋 Final Checklist

- [ ] All extraction tests pass
- [ ] All removal tests pass
- [ ] UI/UX tests pass
- [ ] Performance within spec
- [ ] Algorithm accuracy verified
- [ ] Theme support working
- [ ] Responsive design confirmed
- [ ] Error handling tested
- [ ] Memory leaks checked
- [ ] Browser compatibility verified
- [ ] Download functionality works
- [ ] Reset/cleanup functions work
- [ ] No console errors
- [ ] Documentation accurate
- [ ] Ready for production

---

## 🚀 Test Report Template

```markdown
## Watermark Manager Test Report

**Date:** [DATE]
**Tester:** [NAME]
**Version:** 1.0.0

### Test Results Summary
- Extraction: ✅ [# passed / # total]
- Removal: ✅ [# passed / # total]
- UI/UX: ✅ [# passed / # total]
- Performance: ✅ [# passed / # total]
- Algorithm: ✅ [# passed / # total]

### Issues Found
1. [Issue 1]
2. [Issue 2]
3. ...

### Recommendations
1. [Recommendation 1]
2. ...

### Sign-Off
[ ] Ready for deployment
[ ] Needs fixes
[ ] Needs more testing

Tester: ____________  Date: ____________
```

---

**Testing Status:** ✅ Ready for QA  
**Estimated Time:** 2-4 hours  
**Required Skills:** JavaScript, image processing, UI testing  

See QUICK_REFERENCE.md for quick lookup during testing.
