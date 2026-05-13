/**
 * Utilidades compartidas
 * Funciones de uso común para todos los módulos
 * Kohari TOOLS - Modular Architecture
 */

/**
 * Convierte base64 a Blob
 * @param {string} base64 - String en formato base64
 * @param {string} mimeType - MIME type (ej: 'image/png')
 * @returns {Blob}
 */
export function base64ToBlob(base64, mimeType = 'application/octet-stream') {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

/**
 * Convierte Blob a base64
 * @param {Blob} blob
 * @returns {Promise<string>}
 */
export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Escapa caracteres especiales en JSON
 * @param {string} str
 * @returns {string}
 */
export function escapeJSON(str) {
  if (!str) return '';
  return str
    .toString()
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

/**
 * Post-procesa texto OCR
 * - Limpia caracteres indeseables
 * - Ajusta espacios según idioma
 * - Convierte a línea única si es necesario
 * @param {string} text - Texto a procesar
 * @param {string} lang - Código de idioma (spa, eng, jpn, kor)
 * @param {Object} options - Opciones de procesamiento
 * @returns {string}
 */
export function postProcessText(text, lang = 'eng', options = {}) {
  if (!text) return '';

  const { singleLine = false, removeNumbers = false } = options;

  // Remover líneas en blanco adicionales
  let processed = text.replace(/\n\n+/g, '\n');

  // Remover espacios al inicio/final de cada línea
  processed = processed
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');

  // Convertir a línea única si se solicita
  if (singleLine) {
    processed = processed.replace(/\n/g, ' ').replace(/  +/g, ' ');
  }

  // Remover números (ej: números de página) si se solicita
  if (removeNumbers) {
    processed = processed.replace(/\b\d+\b/g, '').replace(/  +/g, ' ');
  }

  return processed.trim();
}

/**
 * Formatea un número con separador de miles
 * @param {number} num
 * @param {string} locale - Locale (ej: 'es-ES', 'en-US')
 * @returns {string}
 */
export function formatNumber(num, locale = 'en-US') {
  return new Intl.NumberFormat(locale).format(num);
}

/**
 * Formatea un tamaño en bytes a formato legible
 * @param {number} bytes
 * @returns {string}
 */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Espera un número de milisegundos
 * @param {number} ms
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Debounce: retrasa la ejecución de una función
 * @param {Function} fn
 * @param {number} delay - Milisegundos de espera
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle: limita la frecuencia de ejecución de una función
 * @param {Function} fn
 * @param {number} limit - Milisegundos entre ejecuciones
 * @returns {Function}
 */
export function throttle(fn, limit = 300) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      fn(...args);
    }
  };
}

/**
 * Copia texto al portapapeles
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback para contextos no seguros
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    }
  } catch (e) {
    console.error('Error copiando al portapapeles:', e);
    return false;
  }
}

/**
 * Genera un ID único
 * @param {string} prefix - Prefijo opcional
 * @returns {string}
 */
export function generateId(prefix = '') {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
}

/**
 * Valida un email
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

/**
 * Valida un URL
 * @param {string} url
 * @returns {boolean}
 */
export function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Obtiene un parámetro de URL
 * @param {string} paramName
 * @returns {string|null}
 */
export function getUrlParam(paramName) {
  const params = new URLSearchParams(window.location.search);
  return params.get(paramName);
}

/**
 * Convierte un objeto a query string
 * @param {Object} obj
 * @returns {string}
 */
export function objectToQueryString(obj) {
  return new URLSearchParams(obj).toString();
}

/**
 * Intenta parsear JSON con fallback
 * @param {string} jsonStr
 * @param {any} fallback - Valor por defecto si falla
 * @returns {any}
 */
export function safeJsonParse(jsonStr, fallback = null) {
  try {
    return JSON.parse(jsonStr);
  } catch {
    return fallback;
  }
}

/**
 * Crea un deep clone de un objeto
 * @param {any} obj
 * @returns {any}
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Merges dos objetos (shallow merge)
 * @param {Object} target
 * @param {Object} source
 * @returns {Object}
 */
export function mergeObjects(target, source) {
  return { ...target, ...source };
}

/**
 * Obtiene un valor anidado de un objeto
 * @param {Object} obj
 * @param {string} path - Ruta punteada (ej: 'user.profile.name')
 * @param {any} defaultValue
 * @returns {any}
 */
export function getNestedValue(obj, path, defaultValue = null) {
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current == null) return defaultValue;
    current = current[part];
  }
  return current ?? defaultValue;
}
