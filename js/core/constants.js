/**
 * Constants y Configuración Global
 * Kohari TOOLS - Modular Architecture
 */

const VERSION = '2.0.0-modular';

const LANGUAGES = {
  spa: { code: 'spa', name: 'Español', direction: 'ltr', hasSpaces: true },
  eng: { code: 'eng', name: 'Inglés', direction: 'ltr', hasSpaces: true },
  jpn: { code: 'jpn', name: 'Japonés', direction: 'ltr', hasSpaces: false },
  kor: { code: 'kor', name: 'Coreano', direction: 'ltr', hasSpaces: true }
};

const TEXT_TYPES = {
  bubble: { id: 'bubble', name: 'Burbuja', prefix: '💬' },
  ot: { id: 'OT', name: 'OT (Off-text)', prefix: '📄' },
  st: { id: 'ST', name: 'ST (Sound Text)', prefix: '🔊' }
};

const OCR_ENGINES = {
  local: { id: 'local', name: 'Local (Tesseract)', requiresInternet: false },
  gemini: { id: 'gemini', name: 'IA en la Nube (Gemini)', requiresInternet: true }
};

const THEMES = {
  darkest: { id: 'darkest', name: 'Más Oscuro', brightness: 50 },
  dark: { id: 'dark', name: 'Oscuro', brightness: 83 },
  medium: { id: 'medium', name: 'Medio', brightness: 184 },
  light: { id: 'light', name: 'Claro', brightness: 220 }
};

/**
 * Configuración de Módulos
 * Puede ser sobrescrita por config.json en tiempo de carga
 */
const DEFAULT_MODULE_CONFIG = {
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
const STORAGE_CONFIG = {
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
const OCR_CONFIG = {
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
const CLEANER_CONFIG = {
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
const BRIGHTNESS_THRESHOLDS = {
  darkest: 67,
  dark: 130,
  medium: 200
};

/**
 * Estados de la aplicación
 */
const APP_STATES = {
  READY: 'ready',
  PROCESSING: 'processing',
  ERROR: 'error',
  SUCCESS: 'success',
  WARNING: 'warning'
};

/**
 * Eventos globales de la app
 */
const APP_EVENTS = {
  MODULE_LOADED: 'module:loaded',
  MODULE_ERROR: 'module:error',
  THEME_CHANGED: 'theme:changed',
  LANGUAGE_CHANGED: 'language:changed',
  LICENSE_ACTIVATED: 'license:activated',
  LICENSE_EXPIRED: 'license:expired'
};

// Export to global scope for CEP compatibility
window.KohariConstants = {
  VERSION,
  LANGUAGES,
  TEXT_TYPES,
  OCR_ENGINES,
  THEMES,
  DEFAULT_MODULE_CONFIG,
  STORAGE_CONFIG,
  OCR_CONFIG,
  CLEANER_CONFIG,
  BRIGHTNESS_THRESHOLDS,
  APP_STATES,
  APP_EVENTS
};
