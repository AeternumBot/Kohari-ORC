/**
 * Storage Manager - Almacenamiento seguro
 * Encriptación básica para datos sensibles (API keys, license keys)
 * Kohari TOOLS - Modular Architecture
 */


class StorageManager {
  constructor() {
    this.prefix = STORAGE_CONFIG.prefix;
    this.encryptedKeys = new Set(STORAGE_CONFIG.encrypted);
    this.cipher = null;
    this.initialized = false;
  }

  /**
   * Inicializa el gestor de almacenamiento
   * Genera o carga una clave de encriptación local
   */
  init() {
    if (this.initialized) return true;

    try {
      // Intentar obtener clave existente, si no existe, generar nueva
      let cipherKey = localStorage.getItem(`${this.prefix}__cipher__`);
      if (!cipherKey) {
        cipherKey = this.generateCipherKey();
        localStorage.setItem(`${this.prefix}__cipher__`, cipherKey);
      }
      this.cipher = cipherKey;
      this.initialized = true;
      return true;
    } catch (e) {
      console.error('[Storage] Error al inicializar:', e);
      return false;
    }
  }

  /**
   * Genera una clave de encriptación simple basada en el dispositivo
   * NO es criptografía fuerte, pero es suficiente para ofuscar datos sensibles
   * @returns {string}
   */
  generateCipherKey() {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 9);
    return btoa(`${timestamp}-${random}`).substring(0, 16);
  }

  /**
   * Encripta un string usando XOR simple + base64
   * NOTA: No es criptografía segura, solo ofusca datos
   * @private
   * @param {string} text
   * @returns {string}
   */
  encrypt(text) {
    if (!this.cipher) return text;

    try {
      let encrypted = '';
      for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i) ^ this.cipher.charCodeAt(i % this.cipher.length);
        encrypted += String.fromCharCode(charCode);
      }
      return btoa(encrypted);
    } catch (e) {
      console.warn('[Storage] Error encriptando:', e);
      return text;
    }
  }

  /**
   * Desencripta un string
   * @private
   * @param {string} encrypted
   * @returns {string}
   */
  decrypt(encrypted) {
    if (!this.cipher) return encrypted;

    try {
      const decoded = atob(encrypted);
      let decrypted = '';
      for (let i = 0; i < decoded.length; i++) {
        const charCode = decoded.charCodeAt(i) ^ this.cipher.charCodeAt(i % this.cipher.length);
        decrypted += String.fromCharCode(charCode);
      }
      return decrypted;
    } catch (e) {
      console.warn('[Storage] Error desencriptando:', e);
      return encrypted;
    }
  }

  /**
   * Guarda un valor en localStorage
   * Encripta si la clave está en la lista de encriptación
   * @param {string} key - Clave (sin prefijo)
   * @param {any} value - Valor (se convierte a JSON si no es string)
   * @returns {boolean}
   */
  set(key, value) {
    if (!this.initialized && !this.init()) {
      console.error('[Storage] No inicializado');
      return false;
    }

    try {
      const fullKey = `${this.prefix}${key}`;
      let storedValue = typeof value === 'string' ? value : JSON.stringify(value);

      // Encriptar si es clave sensible
      if (this.encryptedKeys.has(key)) {
        storedValue = this.encrypt(storedValue);
        storedValue = `__encrypted__${storedValue}`;
      }

      localStorage.setItem(fullKey, storedValue);
      return true;
    } catch (e) {
      console.error('[Storage] Error guardando', key, ':', e);
      return false;
    }
  }

  /**
   * Obtiene un valor de localStorage
   * Desencripta si fue guardado encriptado
   * @param {string} key - Clave (sin prefijo)
   * @param {any} defaultValue - Valor por defecto si no existe
   * @returns {any}
   */
  get(key, defaultValue = null) {
    if (!this.initialized && !this.init()) {
      return defaultValue;
    }

    try {
      const fullKey = `${this.prefix}${key}`;
      let value = localStorage.getItem(fullKey);

      if (value === null) return defaultValue;

      // Desencriptar si fue encriptado
      if (value.startsWith('__encrypted__')) {
        value = value.replace('__encrypted__', '');
        value = this.decrypt(value);
      }

      // Intentar parsear como JSON
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (e) {
      console.error('[Storage] Error leyendo', key, ':', e);
      return defaultValue;
    }
  }

  /**
   * Elimina una clave de localStorage
   * @param {string} key - Clave (sin prefijo)
   * @returns {boolean}
   */
  remove(key) {
    try {
      const fullKey = `${this.prefix}${key}`;
      localStorage.removeItem(fullKey);
      return true;
    } catch (e) {
      console.error('[Storage] Error eliminando', key, ':', e);
      return false;
    }
  }

  /**
   * Limpia todas las claves del almacenamiento Kohari
   * @param {boolean} keepCipherKey - Si mantener la clave de encriptación
   * @returns {boolean}
   */
  clear(keepCipherKey = true) {
    try {
      const cipherKey = keepCipherKey ? localStorage.getItem(`${this.prefix}__cipher__`) : null;

      // Eliminar todas las claves Kohari
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      }

      // Restaurar cipher si se solicitó
      if (cipherKey) {
        localStorage.setItem(`${this.prefix}__cipher__`, cipherKey);
      }

      return true;
    } catch (e) {
      console.error('[Storage] Error limpiando:', e);
      return false;
    }
  }

  /**
   * Obtiene el estado completo del almacenamiento (para debugging)
   * @returns {Object}
   */
  getAll() {
    const result = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix) && !key.includes('__cipher__')) {
          const cleanKey = key.replace(this.prefix, '');
          result[cleanKey] = this.get(cleanKey);
        }
      }
    } catch (e) {
      console.error('[Storage] Error obteniendo todo:', e);
    }
    return result;
  }

  /**
   * Guarda un objeto completo (útil para estado de la app)
   * @param {string} namespace - Espacio de nombres
   * @param {Object} obj - Objeto a guardar
   * @returns {boolean}
   */
  setNamespace(namespace, obj) {
    return this.set(namespace, obj);
  }

  /**
   * Carga un objeto completo
   * @param {string} namespace - Espacio de nombres
   * @param {Object} defaultObj - Objeto por defecto
   * @returns {Object}
   */
  getNamespace(namespace, defaultObj = {}) {
    const stored = this.get(namespace);
    return stored ? { ...defaultObj, ...stored } : defaultObj;
  }
}


// Export to global scope for CEP compatibility
window.StorageManager = StorageManager;
window.kohariStorage = new StorageManager();
