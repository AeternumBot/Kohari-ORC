/**
 * Constants y Configuración Global
 * Kohari TOOLS - Modular Architecture
 */

export const VERSION = '2.0.0-modular';

export const LANGUAGES = {
  spa: { code: 'spa', name: 'Español', direction: 'ltr', hasSpaces: true },
  eng: { code: 'eng', name: 'Inglés', direction: 'ltr', hasSpaces: true },
  jpn: { code: 'jpn', name: 'Japonés', direction: 'ltr', hasSpaces: false },
  kor: { code: 'kor', name: 'Coreano', direction: 'ltr', hasSpaces: true }
};

export const TEXT_TYPES = {
  bubble: { id: 'bubble', name: 'Burbuja', prefix: '💬' },
  ot: { id: 'OT', name: 'OT (Off-text)', prefix: '📄' },
  st: { id: 'ST', name: 'ST (Sound Text)', prefix: '🔊' }
};

export const OCR_ENGINES = {
  local: { id: 'local', name: 'Local (Tesseract)', requiresInternet: false },
  gemini: { id: 'gemini', name: 'IA en la Nube (Gemini)', requiresInternet: true }
};

export const THEMES = {
  darkest: { id: 'darkest', name: 'Más Oscuro', brightness: 50 },
  dark: { id: 'dark', name: 'Oscuro', brightness: 83 },
  medium: { id: 'medium', name: 'Medio', brightness: 184 },
  light: { id: 'light', name: 'Claro', brightness: 220 }
};

/**
 * Configuración de Módulos
 * Puede ser sobrescrita por config.json en tiempo de carga
 */
export const DEFAULT_MODULE_CONFIG = {
  version: 'complete',
  modules: {
    ocr: {
      enabled: true,
      licensed: true,
      name: 'OCR - Extracción de Texto'
    },
    cleaner: {
      enabled: true,
      licensed: true,
      name: 'Limpiador - Limpieza con IA'
    },
    extras: {
      enabled: true,
      licensed: true,
      name: 'Herramientas Extras'
    }
  }
};

/**
 * Configuración de Storage (encriptación, claves)
 */
export const STORAGE_CONFIG = {
  prefix: 'kohariORC_',
  encrypted: ['apiKey', 'licenseKey'],
  keys: {
    engine: 'engine',
    apiKey: 'apiKey',
    language: 'language',
    theme: 'theme',
    licenseKey: 'licenseKey',
    moduleStates: 'moduleStates'
  }
};

/**
 * Configuración de OCR
 */
export const OCR_CONFIG = {
  tesseract: {
    workerPath: './js/libs/worker.min.js',
    loadLanguage: ['eng', 'jpn', 'kor', 'spa']
  },
  gemini: {
    apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent'
  }
};

/**
 * Configuración de Cleaner
 */
export const CLEANER_CONFIG = {
  lama: {
    endpoint: 'https://huggingface.co/spaces/akhaliq/LaMa/api/predict'
  },
  maskPadding: {
    min: 40,
    max: 300,
    ratio: 0.6
  }
};

/**
 * Temas de Photoshop - mapeo brillo a tema
 */
export const BRIGHTNESS_THRESHOLDS = {
  darkest: 67,
  dark: 130,
  medium: 200
};

/**
 * Estados de la aplicación
 */
export const APP_STATES = {
  READY: 'ready',
  PROCESSING: 'processing',
  ERROR: 'error',
  SUCCESS: 'success',
  WARNING: 'warning'
};

/**
 * Eventos globales de la app
 */
export const APP_EVENTS = {
  MODULE_LOADED: 'module:loaded',
  MODULE_ERROR: 'module:error',
  THEME_CHANGED: 'theme:changed',
  LANGUAGE_CHANGED: 'language:changed',
  LICENSE_ACTIVATED: 'license:activated',
  LICENSE_EXPIRED: 'license:expired'
};
