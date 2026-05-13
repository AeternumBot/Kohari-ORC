/**
 * Themes Manager - Detección y aplicación de temas de Photoshop
 * Soporta 4 temas: darkest, dark, medium, light
 * Kohari TOOLS - Modular Architecture
 */

import { THEMES, BRIGHTNESS_THRESHOLDS } from './constants.js';
import storage from './storage.js';

class ThemeManager {
  constructor() {
    this.currentTheme = 'darkest';
    this.listeners = [];
  }

  /**
   * Detecta el tema actual de Photoshop basado en el color de fondo del panel
   * Fallback: preferencia del SO
   * @returns {string} - ID del tema
   */
  detectTheme() {
    try {
      // Intentar obtener el color de fondo de Photoshop
      if (typeof window.__adobe_cep__ !== 'undefined' && window.__adobe_cep__.getHostEnvironment) {
        const env = JSON.parse(window.__adobe_cep__.getHostEnvironment());
        const skinInfo = env.appSkinInfo;

        if (skinInfo) {
          const bgColor = skinInfo.panelBackgroundColor.color || skinInfo.panelBackgroundColor;
          const r = bgColor.red !== undefined ? bgColor.red : (bgColor.r || 0);
          const g = bgColor.green !== undefined ? bgColor.green : (bgColor.g || 0);
          const b = bgColor.blue !== undefined ? bgColor.blue : (bgColor.b || 0);
          const brightness = (r + g + b) / 3;

          return this.brightnessToTheme(brightness);
        }
      }
    } catch (e) {
      console.warn('[Themes] No se pudo detectar tema de Photoshop:', e.message);
    }

    // Fallback: preferencia del SO
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }

    return 'darkest'; // Fallback final
  }

  /**
   * Mapea un valor de brillo (0-255) a uno de los 4 temas
   * @param {number} brightness - Valor de brillo
   * @returns {string} - ID del tema
   */
  brightnessToTheme(brightness) {
    if (brightness < BRIGHTNESS_THRESHOLDS.darkest) return 'darkest';
    if (brightness < BRIGHTNESS_THRESHOLDS.dark) return 'dark';
    if (brightness < BRIGHTNESS_THRESHOLDS.medium) return 'medium';
    return 'light';
  }

  /**
   * Aplica un tema al documento
   * @param {string} themeId - ID del tema (darkest, dark, medium, light)
   * @returns {boolean}
   */
  applyTheme(themeId) {
    try {
      if (!THEMES[themeId]) {
        console.warn(`[Themes] Tema desconocido: ${themeId}`);
        return false;
      }

      document.documentElement.setAttribute('data-theme', themeId);
      this.currentTheme = themeId;

      // Guardar preferencia
      storage.set('theme', themeId);

      // Notificar listeners
      this.notifyListeners(themeId);

      console.log(`[Themes] Tema aplicado: ${themeId}`);
      return true;
    } catch (e) {
      console.error('[Themes] Error al aplicar tema:', e);
      return false;
    }
  }

  /**
   * Inicializa el gestor de temas
   * - Detecta el tema actual
   * - Carga preferencia guardada (si existe)
   * - Escucha cambios de tema en Photoshop
   * @returns {boolean}
   */
  init() {
    try {
      // Intentar cargar tema guardado
      const savedTheme = storage.get('theme');
      if (savedTheme && THEMES[savedTheme]) {
        this.applyTheme(savedTheme);
      } else {
        // Detectar tema actual y aplicar
        const detected = this.detectTheme();
        this.applyTheme(detected);
      }

      // Escuchar cambios de tema de Photoshop
      this.listenForThemeChanges();

      return true;
    } catch (e) {
      console.error('[Themes] Error inicializando:', e);
      return false;
    }
  }

  /**
   * Suscribe a los cambios de tema
   * @param {Function} callback - Función que se ejecuta al cambiar de tema
   * @returns {Function} - Función para desuscribirse
   */
  onChange(callback) {
    this.listeners.push(callback);
    // Retornar función para desuscribirse
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  /**
   * Notifica a todos los listeners sobre cambio de tema
   * @private
   * @param {string} themeId
   */
  notifyListeners(themeId) {
    this.listeners.forEach(callback => {
      try {
        callback(themeId);
      } catch (e) {
        console.error('[Themes] Error en listener:', e);
      }
    });
  }

  /**
   * Suscribe al evento ThemeColorChanged de Photoshop
   * Se dispara cuando el usuario cambia el tema sin reiniciar el panel
   * @private
   */
  listenForThemeChanges() {
    try {
      if (!window.__adobe_cep__) {
        console.log('[Themes] No hay entorno CEP, no se pueden escuchar cambios de tema');
        return;
      }

      const csInterface = new (window.CSInterface || window.uxp.bridgeProxy)();
      csInterface.addEventListener('com.adobe.csxs.events.ThemeColorChanged', () => {
        const newTheme = this.detectTheme();
        if (newTheme !== this.currentTheme) {
          this.applyTheme(newTheme);
        }
      });

      console.log('[Themes] Escuchando cambios de tema de Photoshop');
    } catch (e) {
      console.warn('[Themes] No se pudo suscribir a ThemeColorChanged:', e.message);
    }
  }

  /**
   * Obtiene la información del tema actual
   * @returns {Object}
   */
  getCurrentTheme() {
    return {
      id: this.currentTheme,
      info: THEMES[this.currentTheme]
    };
  }

  /**
   * Lista todos los temas disponibles
   * @returns {Object}
   */
  getAvailableThemes() {
    return THEMES;
  }
}

export default new ThemeManager();
