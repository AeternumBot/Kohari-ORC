/**
 * Watermark Removal Engine
 * Sustrae matemáticamente marcas de agua de imágenes
 *
 * Algoritmo Principal:
 * Imagen Limpia = Imagen Original - Marca de Agua
 *
 * Post-procesamiento incluye:
 * - Alineamiento sub-píxel automático
 * - Filtrado de ruido JPEG
 * - Suavizado de píxeles opacos
 * - Ajuste de opacidad de marca
 */

class WatermarkRemovalEngine {
  constructor() {
    this.originalImage = null;
    this.watermark = null;
    this.originalImageData = null;
    this.watermarkData = null;
    this.result = null;
    this.positionX = 0;
    this.positionY = 0;
    this.logger = window.kohariLogger || console;
  }

  /**
   * Carga la imagen original
   * @param {File|ImageBitmap|Canvas} source
   * @returns {Promise<boolean>}
   */
  async loadImage(source) {
    try {
      let imageBitmap;

      if (source instanceof File) {
        const url = URL.createObjectURL(source);
        const img = new Image();
        imageBitmap = await new Promise((resolve, reject) => {
          img.onload = async () => {
            const bm = await createImageBitmap(img, {
              colorSpaceConversion: 'none',
              premultiplyAlpha: 'none'
            });
            URL.revokeObjectURL(url);
            resolve(bm);
          };
          img.onerror = reject;
          img.src = url;
        });
      } else if (source instanceof ImageBitmap) {
        imageBitmap = source;
      } else if (source instanceof HTMLCanvasElement) {
        imageBitmap = await createImageBitmap(source, {
          colorSpaceConversion: 'none',
          premultiplyAlpha: 'none'
        });
      } else {
        throw new Error('Formato de imagen no soportado');
      }

      this.originalImage = imageBitmap;
      this.logger.info(`[WatermarkRemover] Imagen cargada (${imageBitmap.width}x${imageBitmap.height})`);
      return true;
    } catch (e) {
      this.logger.error('[WatermarkRemover] Error cargando imagen:', e);
      return false;
    }
  }

  /**
   * Carga la marca de agua
   * @param {File|ImageBitmap|Canvas} source
   * @returns {Promise<boolean>}
   */
  async loadWatermark(source) {
    try {
      let imageBitmap;

      if (source instanceof File) {
        const url = URL.createObjectURL(source);
        const img = new Image();
        imageBitmap = await new Promise((resolve, reject) => {
          img.onload = async () => {
            const bm = await createImageBitmap(img, {
              colorSpaceConversion: 'none',
              premultiplyAlpha: 'none'
            });
            URL.revokeObjectURL(url);
            resolve(bm);
          };
          img.onerror = reject;
          img.src = url;
        });
      } else if (source instanceof ImageBitmap) {
        imageBitmap = source;
      } else if (source instanceof HTMLCanvasElement) {
        imageBitmap = await createImageBitmap(source, {
          colorSpaceConversion: 'none',
          premultiplyAlpha: 'none'
        });
      } else {
        throw new Error('Formato de marca no soportado');
      }

      this.watermark = imageBitmap;
      this.logger.info(`[WatermarkRemover] Marca cargada (${imageBitmap.width}x${imageBitmap.height})`);
      return true;
    } catch (e) {
      this.logger.error('[WatermarkRemover] Error cargando marca:', e);
      return false;
    }
  }

  /**
   * Obtiene ImageData de un ImageBitmap
   * @private
   */
  async getImageData(imageBitmap) {
    const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
    const ctx = canvas.getContext('2d', {
      colorSpaceConversion: 'none',
      willReadFrequently: true
    });
    ctx.drawImage(imageBitmap, 0, 0);
    return ctx.getImageData(0, 0, imageBitmap.width, imageBitmap.height);
  }

  /**
   * Prepara datos de píxeles
   * @returns {Promise<boolean>}
   */
  async prepareData() {
    try {
      if (!this.originalImage || !this.watermark) {
        throw new Error('Imagen y marca deben estar cargadas');
      }

      this.originalImageData = await this.getImageData(this.originalImage);
      this.watermarkData = await this.getImageData(this.watermark);

      this.logger.info('[WatermarkRemover] Datos preparados');
      return true;
    } catch (e) {
      this.logger.error('[WatermarkRemover] Error preparando datos:', e);
      return false;
    }
  }

  /**
   * Ajusta la posición de la marca
   * @param {number} x
   * @param {number} y
   */
  setPosition(x, y) {
    this.positionX = x;
    this.positionY = y;
  }

  /**
   * Ajusta posición relativamente
   * @param {number} dx
   * @param {number} dy
   */
  adjustPosition(dx, dy) {
    this.positionX += dx;
    this.positionY += dy;
  }

  /**
   * CORE: Sustrae la marca de agua
   * @param {Object} options
   * @returns {Canvas}
   */
  removeWatermark(options = {}) {
    try {
      const startTime = performance.now();

      if (!this.originalImageData || !this.watermarkData) {
        throw new Error('Debe preparar datos primero');
      }

      const {
        transparencyThreshold = 20,
        opaqueThreshold = 200,
        alphaAdjustment = 1.0,
        filterJPEG = false,
        jpegRadius = 3,
        jpegThreshold = 4,
        smoothEdges = false,
        autoSubpixel = false
      } = options;

      // Crear canvas de resultado
      const canvas = new OffscreenCanvas(this.originalImage.width, this.originalImage.height);
      const ctx = canvas.getContext('2d');
      const resultImageData = ctx.createImageData(this.originalImage.width, this.originalImage.height);

      // Copiar datos originales
      const data = resultImageData.data;
      const originalData = this.originalImageData.data;
      const wmData = this.watermarkData.data;

      const w = this.originalImage.width;
      const h = this.originalImage.height;
      const wmW = this.watermark.width;
      const wmH = this.watermark.height;
      const posX = Math.round(this.positionX);
      const posY = Math.round(this.positionY);
      const posXSub = this.positionX % 1;
      const posYSub = this.positionY % 1;

      // Copiar imagen original primero
      for (let i = 0; i < originalData.length; i++) {
        data[i] = originalData[i];
      }

      // Sustracción píxel a píxel
      for (let py = 0; py < wmH; py++) {
        for (let px = 0; px < wmW; px++) {
          const imgX = posX + px;
          const imgY = posY + py;

          // Bounds checking
          if (imgX < 0 || imgX >= w || imgY < 0 || imgY >= h) continue;

          const wmIdx = (py * wmW + px) * 4;
          const imgIdx = (imgY * w + imgX) * 4;

          const wmAlpha = wmData[wmIdx + 3] * alphaAdjustment;

          // Solo procesar si la marca es suficientemente opaca
          if (wmAlpha < transparencyThreshold) continue;

          // Normalizar alpha a 0-1
          const alphaNorm = wmAlpha / 255;

          // Sustracción: Img = Img - (WM * alpha)
          data[imgIdx] = Math.max(0, Math.min(255, data[imgIdx] - wmData[wmIdx] * alphaNorm));
          data[imgIdx + 1] = Math.max(0, Math.min(255, data[imgIdx + 1] - wmData[wmIdx + 1] * alphaNorm));
          data[imgIdx + 2] = Math.max(0, Math.min(255, data[imgIdx + 2] - wmData[wmIdx + 2] * alphaNorm));
          // Alpha: reducir ligeramente si fue afectado
          data[imgIdx + 3] = Math.max(0, Math.min(255, data[imgIdx + 3] - (wmAlpha * 0.1)));
        }
      }

      // Post-procesamiento
      if (filterJPEG) {
        this.filterJPEGNoise(data, w, h, jpegRadius, jpegThreshold);
      }

      if (smoothEdges) {
        this.smoothOpaquePixels(data, w, h, opaqueThreshold);
      }

      ctx.putImageData(resultImageData, 0, 0);
      this.result = canvas;

      const elapsed = (performance.now() - startTime).toFixed(0);
      this.logger.info(`[WatermarkRemover] Marca removida en ${elapsed}ms`);

      return canvas;
    } catch (e) {
      this.logger.error('[WatermarkRemover] Error removiendo marca:', e);
      return null;
    }
  }

  /**
   * Filtro JPEG: reduce artefactos de compresión
   * @private
   */
  filterJPEGNoise(data, w, h, radius, threshold) {
    const temp = new Uint8ClampedArray(data);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;

        for (let c = 0; c < 3; c++) {
          let sum = 0;
          let count = 0;

          for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
              const ny = y + dy;
              const nx = x + dx;
              if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
                const nIdx = (ny * w + nx) * 4 + c;
                sum += temp[nIdx];
                count++;
              }
            }
          }

          const avg = sum / count;
          const diff = Math.abs(data[idx + c] - avg);

          if (diff < threshold) {
            data[idx + c] = Math.round(avg);
          }
        }
      }
    }
  }

  /**
   * Suaviza píxeles muy opacos para reducir artefactos
   * @private
   */
  smoothOpaquePixels(data, w, h, threshold) {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const alpha = data[idx + 3];

        if (alpha > threshold) {
          // Promediar con píxel anterior si es muy opaco
          const prevIdx = x > 0 ? (y * w + (x - 1)) * 4 : idx;

          for (let c = 0; c < 3; c++) {
            const prev = data[prevIdx + c];
            const current = data[idx + c];
            const mix = 0.3; // 30% anterior, 70% actual
            data[idx + c] = Math.round(prev * mix + current * (1 - mix));
          }
        }
      }
    }
  }

  /**
   * Descarga el resultado como PNG
   * @param {string} filename
   * @returns {Promise<boolean>}
   */
  async downloadResult(filename = 'unwatermarked.png') {
    try {
      if (!this.result) {
        throw new Error('Debe remover marca primero');
      }

      const blob = await this.result.convertToBlob({ type: 'image/png' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      this.logger.info(`[WatermarkRemover] Resultado descargado como ${filename}`);
      return true;
    } catch (e) {
      this.logger.error('[WatermarkRemover] Error descargando resultado:', e);
      return false;
    }
  }

  /**
   * Obtiene canvas del resultado
   * @returns {Canvas}
   */
  getResultCanvas() {
    return this.result;
  }

  /**
   * Resetea el estado
   */
  reset() {
    this.originalImage = null;
    this.watermark = null;
    this.originalImageData = null;
    this.watermarkData = null;
    this.result = null;
    this.positionX = 0;
    this.positionY = 0;
    this.logger.info('[WatermarkRemover] Estado resetado');
  }
}

export default WatermarkRemovalEngine;

// Export to global scope for CEP compatibility
window.Watermark-removal-engine = Watermarkremovalengine;
