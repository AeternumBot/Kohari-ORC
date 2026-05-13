/**
 * Kohari App Core
 * Núcleo de la aplicación: orquesta módulos, maneja eventos globales
 * Kohari TOOLS - Modular Architecture v2.0.0
 */

import { VERSION, APP_EVENTS, APP_STATES } from './constants.js';
import domManager from './dom-manager.js';
import storage from './storage.js';
import themeManager from './themes.js';
import logger from '../shared/logger.js';

class KohariApp {
  constructor(moduleLoader) {
    this.version = VERSION;
    this.moduleLoader = moduleLoader;
    this.modules = {};
    this.state = {
      currentTheme: 'darkest',
      selectedLanguage: 'kor',
      isProcessing: false,
      status: APP_STATES.READY
    };
    this.eventListeners = {};
    this.initialized = false;
  }

  /**
   * Inicializa la aplicación
   * 1. Inicializa sistemas base (DOM, Storage, Temas)
   * 2. Carga módulos dinámicamente
   * 3. Vincula eventos globales
   * 4. Aplica configuración guardada
   * @returns {Promise<boolean>}
   */
  async init() {
    try {
      logger.info(`Kohari App iniciando v${this.version}`);

      // 1. Inicializar sistemas base
      if (!domManager.init()) {
        throw new Error('No se pudo inicializar DOM Manager');
      }
      logger.info('✓ DOM Manager inicializado');

      if (!storage.init()) {
        throw new Error('No se pudo inicializar Storage Manager');
      }
      logger.info('✓ Storage Manager inicializado (con encriptación)');

      if (!themeManager.init()) {
        logger.warn('No se pudo inicializar Theme Manager, usando tema por defecto');
      }
      logger.info('✓ Theme Manager inicializado');

      // 2. Cargar módulos
      await this.moduleLoader.load();
      this.modules = this.moduleLoader.getModules();
      logger.info(`✓ ${Object.keys(this.modules).length} módulos cargados`);

      // 3. Vincular eventos globales
      this.bindGlobalEvents();
      logger.info('✓ Eventos globales vinculados');

      // 4. Aplicar configuración guardada
      this.loadState();
      logger.info('✓ Estado guardado cargado');

      // 5. Escuchar cambios de tema
      themeManager.onChange(theme => {
        this.state.currentTheme = theme;
        this.emit(APP_EVENTS.THEME_CHANGED, theme);
      });

      this.initialized = true;
      logger.info('✅ Kohari App iniciada correctamente');
      return true;
    } catch (error) {
      logger.error('Error inicializando Kohari App:', error);
      this.setStatus(APP_STATES.ERROR, `Error: ${error.message}`);
      return false;
    }
  }

  /**
   * Vincula eventos globales (tabs, etc)
   * @private
   */
  bindGlobalEvents() {
    // Navegación de tabs
    const tabButtons = domManager.get('tabButtons');
    if (tabButtons) {
      tabButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const tabId = btn.dataset.tab;
          this.switchTab(tabId);
        });
      });
    }

    logger.debug('Eventos globales vinculados');
  }

  /**
   * Cambia la pestaña activa
   * @param {string} tabId - ID de la pestaña (ocr, cleaner, extras)
   */
  switchTab(tabId) {
    try {
      const tabButtons = domManager.get('tabButtons');
      const tabPanels = domManager.get('tabPanels');

      if (tabButtons) {
        tabButtons.forEach(btn => {
          const isActive = btn.dataset.tab === tabId;
          btn.classList.toggle('active', isActive);
        });
      }

      if (tabPanels) {
        tabPanels.forEach(panel => {
          const isActive = panel.id === `tab-${tabId}`;
          panel.classList.toggle('active', isActive);
        });
      }

      // Notificar al módulo que su tab fue activado
      if (this.modules[tabId]) {
        this.emit(`tab:${tabId}:activated`);
      }
    } catch (e) {
      logger.error(`Error al cambiar a tab ${tabId}:`, e);
    }
  }

  /**
   * Carga el estado guardado (tema, idioma, etc)
   * @private
   */
  loadState() {
    const savedTheme = storage.get('theme');
    if (savedTheme) {
      this.state.currentTheme = savedTheme;
    }

    const savedLanguage = storage.get('language', 'kor');
    this.state.selectedLanguage = savedLanguage;
  }

  /**
   * Actualiza el estado de la aplicación
   * @param {string} status - Estado (ready, processing, error, success, warning)
   * @param {string} message - Mensaje de estado
   */
  setStatus(status, message = '') {
    this.state.status = status;
    const statusText = domManager.get('statusText');
    const statusBar = domManager.get('statusBar');

    if (statusText) {
      statusText.textContent = message || status;
    }

    if (statusBar) {
      statusBar.className = `status-bar status-${status}`;
    }

    logger.info(`Status: ${status} - ${message}`);
  }

  /**
   * Muestra un mensaje de notificación (toast)
   * @param {string} message - Mensaje a mostrar
   * @param {string} type - Tipo (success, error, warning, info)
   * @param {number} duration - Duración en ms
   */
  showToast(message, type = 'info', duration = 3000) {
    try {
      const container = domManager.get('container');
      if (!container) return;

      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      toast.textContent = message;
      toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 16px;
        background: var(--ps-${type});
        color: white;
        border-radius: 4px;
        font-size: 12px;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
      `;

      container.appendChild(toast);

      setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
      }, duration);
    } catch (e) {
      logger.warn('No se pudo mostrar toast:', e);
    }
  }

  /**
   * Emisor de eventos personalizado
   * @param {string} eventName - Nombre del evento
   * @param {any} data - Datos a pasar
   */
  emit(eventName, data) {
    const listeners = this.eventListeners[eventName] || [];
    listeners.forEach(callback => {
      try {
        callback(data);
      } catch (e) {
        logger.error(`Error en listener para ${eventName}:`, e);
      }
    });
  }

  /**
   * Suscribir a un evento personalizado
   * @param {string} eventName
   * @param {Function} callback
   * @returns {Function} - Función para desuscribirse
   */
  on(eventName, callback) {
    if (!this.eventListeners[eventName]) {
      this.eventListeners[eventName] = [];
    }
    this.eventListeners[eventName].push(callback);

    // Retornar función para desuscribirse
    return () => {
      this.eventListeners[eventName] = this.eventListeners[eventName].filter(
        cb => cb !== callback
      );
    };
  }

  /**
   * Obtiene un módulo por nombre
   * @param {string} moduleName
   * @returns {Object|null}
   */
  getModule(moduleName) {
    return this.modules[moduleName] || null;
  }

  /**
   * Lista todos los módulos cargados
   * @returns {string[]}
   */
  getLoadedModules() {
    return Object.keys(this.modules);
  }

  /**
   * Obtiene el estado actual
   * @returns {Object}
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Obtiene información de la app (para debugging)
   * @returns {Object}
   */
  getInfo() {
    return {
      version: this.version,
      initialized: this.initialized,
      currentTheme: this.state.currentTheme,
      selectedLanguage: this.state.selectedLanguage,
      status: this.state.status,
      modules: this.getLoadedModules(),
      storageState: storage.getAll()
    };
  }
}

export default KohariApp;
