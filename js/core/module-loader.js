/**
 * Module Loader - Cargador dinámico de módulos
 * Carga módulos basados en config.json
 * Soporta múltiples versiones: complete, ocr-only, cleaner-only, extras-only
 * Kohari TOOLS - Modular Architecture
 */

// Note: DEFAULT_MODULE_CONFIG and logger are loaded via script tags in index.html
// ES6 imports removed for CEP compatibility

class ModuleLoader {
  constructor() {
    this.config = null;
    this.modules = {};
    this.app = null;
  }

  /**
   * Carga la configuración de módulos desde config.json
   * Si no existe, usa la configuración por defecto
   * @private
   * @returns {Promise<Object>}
   */
  async loadConfig() {
    try {
      // Intentar cargar config.json
      const response = await fetch('./config.json');
      if (response.ok) {
        const config = await response.json();
        if (window.kohariLogger) window.kohariLogger.info('Config cargada desde config.json:', config);
        return config;
      } else {
        throw new Error('config.json no encontrado');
      }
    } catch (e) {
      if (window.kohariLogger) window.kohariLogger.warn('No se pudo cargar config.json, usando configuración por defecto:', e.message);
      return window.KohariConstants.DEFAULT_MODULE_CONFIG;
    }
  }

  /**
   * Inicializa el module loader
   * @param {KohariApp} app - Instancia de la aplicación
   * @returns {Promise<boolean>}
   */
  async init(app) {
    try {
      this.app = app;
      this.config = await this.loadConfig();
      if(window.kohariLogger)window.kohariLogger.info(`Module Loader inicializado con versión: ${this.config.version}`);
      return true;
    } catch (e) {
      if(window.kohariLogger)window.kohariLogger.error('Error inicializando Module Loader:', e);
      return false;
    }
  }

  /**
   * Carga todos los módulos habilitados
   * @returns {Promise<boolean>}
   */
  async load() {
    if (!this.config) {
      if(window.kohariLogger)window.kohariLogger.error('Module Loader no inicializado');
      return false;
    }

    try {
      const modulesToLoad = this.getEnabledModules();
      if(window.kohariLogger)window.kohariLogger.info(`Cargando ${modulesToLoad.length} módulos...`);

      for (const moduleName of modulesToLoad) {
        await this.loadModule(moduleName);
      }

      if(window.kohariLogger)window.kohariLogger.info(`✓ ${Object.keys(this.modules).length} módulos cargados exitosamente`);
      return true;
    } catch (e) {
      if(window.kohariLogger)window.kohariLogger.error('Error cargando módulos:', e);
      return false;
    }
  }

  /**
   * Carga un módulo individual
   * @private
   * @param {string} moduleName - Nombre del módulo (ocr, cleaner, extras)
   * @returns {Promise<boolean>}
   */
  async loadModule(moduleName) {
    try {
      const modulePath = `./src/modules/${moduleName}/${moduleName}.module.js`;
      if(window.kohariLogger)window.kohariLogger.info(`Cargando módulo: ${moduleName} desde ${modulePath}`);

      const module = await import(modulePath);
      if (!module.default) {
        throw new Error(`Módulo ${moduleName} no exporta default`);
      }

      this.modules[moduleName] = module.default;

      // Inicializar el módulo
      if (typeof this.modules[moduleName].init === 'function') {
        this.modules[moduleName].init(this.app);
        if(window.kohariLogger)window.kohariLogger.info(`✓ ${moduleName} inicializado`);
      } else {
        if(window.kohariLogger)window.kohariLogger.warn(`${moduleName} no tiene método init()`);
      }

      return true;
    } catch (e) {
      if(window.kohariLogger)window.kohariLogger.error(`Error cargando módulo ${moduleName}:`, e);
      return false;
    }
  }

  /**
   * Obtiene la lista de módulos habilitados
   * @private
   * @returns {string[]}
   */
  getEnabledModules() {
    const enabled = [];
    for (const [name, config] of Object.entries(this.config.modules)) {
      if (config.enabled) {
        enabled.push(name);
      }
    }
    return enabled;
  }

  /**
   * Obtiene todos los módulos cargados
   * @returns {Object}
   */
  getModules() {
    return { ...this.modules };
  }

  /**
   * Obtiene un módulo específico
   * @param {string} moduleName
   * @returns {Object|null}
   */
  getModule(moduleName) {
    return this.modules[moduleName] || null;
  }

  /**
   * Verifica si un módulo está cargado
   * @param {string} moduleName
   * @returns {boolean}
   */
  isModuleLoaded(moduleName) {
    return moduleName in this.modules;
  }

  /**
   * Obtiene la configuración de un módulo
   * @param {string} moduleName
   * @returns {Object|null}
   */
  getModuleConfig(moduleName) {
    return this.config.modules[moduleName] || null;
  }

  /**
   * Obtiene la configuración completa
   * @returns {Object}
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * Obtiene información de los módulos (para debugging)
   * @returns {Object}
   */
  getInfo() {
    return {
      version: this.config.version,
      moduleCount: Object.keys(this.modules).length,
      modules: Object.keys(this.modules),
      config: this.config
    };
  }
}

// Make available globally
window.ModuleLoader = ModuleLoader;
