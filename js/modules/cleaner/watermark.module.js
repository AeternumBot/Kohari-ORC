/**
 * Watermark Manager Module
 * Integración de extractor y removedor de marcas de agua en Kohari TOOLS
 *
 * Proporciona:
 * - Extracción automática de marcas de agua
 * - Remoción matemática de marcas con alineamiento sub-píxel
 * - Interfaz unificada en el módulo CLEANER
 */

const watermarkModule = {
  name: 'watermark',

  /**
   * Inicializa el módulo
   */
  async init(app) {
    this.app = app;
    this.logger = app.logger || window.kohariLogger || console;
    this.domManager = app.domManager;

    // Crear instancia UI
    this.watermarkUI = new WatermarkUI(this.domManager, this.logger);

    // Setup
    this.setupUI();
    this.bindEvents();

    this.logger.info('[WatermarkModule] ✅ Módulo de marcas de agua inicializado');
  },

  /**
   * Setup de interfaz
   */
  setupUI() {
    // Los tabs se crean dinámicamente en watermark-ui.js
    this.watermarkUI.init();
  },

  /**
   * Vincula eventos globales
   */
  bindEvents() {
    // Escuchar eventos de módulo
    this.app.on('cleaner:tab-switched', ({ tab }) => {
      if (tab === 'watermark') {
        this.onTabActive();
      }
    });

    // Escuchar eventos de extracción completada
    this.app.on('watermark:extraction-completed', ({ watermark }) => {
      this.logger.info('[WatermarkModule] Marca extraída completada');
      // Aquí se puede hacer algo como guardar la marca automaticamente
    });

    // Escuchar eventos de remoción completada
    this.app.on('watermark:removal-completed', ({ result }) => {
      this.logger.info('[WatermarkModule] Marca removida completada');
    });
  },

  /**
   * Called cuando el tab está activo
   */
  onTabActive() {
    this.logger.debug('[WatermarkModule] Tab de marcas de agua activado');
  },

  /**
   * Extrae marca de agua público (puede ser llamado desde otros módulos)
   * @param {File} image1 - Primera imagen
   * @param {File} image2 - Segunda imagen
   * @param {Object} bbox - Bounding box {x, y, width, height}
   * @returns {Promise<Canvas>}
   */
  async extractWatermark(image1, image2, bbox) {
    try {
      await this.watermarkUI.extractor.loadImage(image1, 1);
      await this.watermarkUI.extractor.loadImage(image2, 2);
      await this.watermarkUI.extractor.prepareData();

      const result = this.watermarkUI.extractor.extractWatermark(bbox);

      this.app.emit('watermark:extraction-completed', { watermark: result });
      return result;
    } catch (e) {
      this.logger.error('[WatermarkModule] Error extrayendo marca:', e);
      throw e;
    }
  },

  /**
   * Remueve marca de agua público (puede ser llamado desde otros módulos)
   * @param {File} originalImage - Imagen original
   * @param {File} watermarkImage - Marca a remover (PNG transparente)
   * @param {Object} options - Opciones de remoción
   * @returns {Promise<Canvas>}
   */
  async removeWatermark(originalImage, watermarkImage, options = {}) {
    try {
      const remover = this.watermarkUI.remover;

      await remover.loadImage(originalImage);
      await remover.loadWatermark(watermarkImage);
      await remover.prepareData();

      // Autoalinear si es solicitado
      if (options.autoAlign) {
        const alignment = this.watermarkUI.aligner.findOptimalAlignment(
          remover.originalImageData,
          remover.watermarkData
        );
        remover.setPosition(alignment.offsetX, alignment.offsetY);
      } else if (options.offsetX !== undefined && options.offsetY !== undefined) {
        remover.setPosition(options.offsetX, options.offsetY);
      }

      const result = remover.removeWatermark(options);

      this.app.emit('watermark:removal-completed', { result });
      return result;
    } catch (e) {
      this.logger.error('[WatermarkModule] Error removiendo marca:', e);
      throw e;
    }
  },

  /**
   * Detecta bordes automáticamente en marca de agua
   * @param {ImageData} watermarkData
   * @param {number} threshold
   * @returns {Array}
   */
  detectWatermarkEdges(watermarkData, threshold = 30) {
    return this.watermarkUI.aligner.detectWatermarkEdges(watermarkData, threshold);
  },

  /**
   * Encuentra alineamiento óptimo
   * @param {ImageData} imageData
   * @param {ImageData} watermarkData
   * @param {Object} options
   * @returns {Object}
   */
  findOptimalAlignment(imageData, watermarkData, options = {}) {
    return this.watermarkUI.aligner.findOptimalAlignment(imageData, watermarkData, options);
  },

  /**
   * Información del módulo
   */
  getInfo() {
    return {
      name: 'Watermark Manager',
      version: '1.0.0',
      description: 'Extrae y remueve marcas de agua de imágenes con alineamiento sub-píxel',
      features: [
        'Extracción automática de marcas',
        'Remoción matemática precisa',
        'Alineamiento sub-píxel (0.05px)',
        'Auto-detección de bordes',
        'Filtros JPEG y suavizado'
      ]
    };
  }
};

// Export to global scope for CEP compatibility
window.watermarkModule = watermarkModule;
