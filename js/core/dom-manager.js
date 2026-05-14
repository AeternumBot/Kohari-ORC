/**
 * DOM Manager - Caché centralizado de referencias DOM
 * Evita múltiples querySelector y proporciona API limpia
 */

class DOMManager {
  constructor() {
    this.cache = {};
    this.initialized = false;
  }

  /**
   * Inicializa todas las referencias DOM de la aplicación
   * Se ejecuta una sola vez en app.init()
   */
  init() {
    if (this.initialized) return true;

    // Elementos globales
    this.cache.container = document.querySelector('.container');
    this.cache.loadingOverlay = document.getElementById('loadingOverlay');
    this.cache.statusBar = document.getElementById('statusBar');
    this.cache.statusText = document.getElementById('statusText');
    this.cache.bubbleCount = document.getElementById('bubbleCount');

    // Tabs
    this.cache.tabButtons = document.querySelectorAll('.tab-btn');
    this.cache.tabPanels = document.querySelectorAll('.tab-panel');

    // --- OCR Tab Elements ---
    this.cache.ocr = {
      tab: document.getElementById('tab-ocr'),
      scanBtn: document.getElementById('scanBtn'),
      clearBtn: document.getElementById('clearBtn'),
      copyAllBtn: document.getElementById('copyAllBtn'),
      newStripBtn: document.getElementById('newStripBtn'),
      resultsList: document.getElementById('resultsList'),
      stripInput: document.getElementById('stripInput'),

      languageInputs: document.querySelectorAll('input[name="language"]'),
      textTypeInputs: document.querySelectorAll('input[name="textType"]'),
      engineInputs: document.querySelectorAll('input[name="ocrEngine"]'),

      apiKeyContainer: document.getElementById('apiKeyContainer'),
      geminiApiKey: document.getElementById('geminiApiKey'),

      // Options
      autoNumber: document.getElementById('autoNumber'),
      singleLine: document.getElementById('singleLine'),
      preprocess: document.getElementById('preprocess'),
      copyClipboard: document.getElementById('copyClipboard')
    };

    // --- Cleaner Tab Elements ---
    this.cache.cleaner = {
      tab: document.getElementById('tab-cleaner'),
      cleanWithAIBtn: document.getElementById('cleanWithAIBtn'),
      cleanBubblesBtn: document.getElementById('cleanBubblesBtn'),
      aiStatus: document.getElementById('aiStatus'),
      aiStatusText: document.getElementById('aiStatusText')
    };

    // --- Extras Tab Elements ---
    this.cache.extras = {
      tab: document.getElementById('tab-extras'),
      convertTplBtn: document.getElementById('convertTplBtn')
    };

    this.initialized = true;
    return true;
  }

  /**
   * Obtiene un elemento o grupo de elementos del caché
   * @param {string} path - Ruta al elemento (ej: 'ocr.scanBtn', 'statusBar')
   * @returns {Element|NodeList|null}
   */
  get(path) {
    const parts = path.split('.');
    let current = this.cache;

    for (const part of parts) {
      if (current == null) return null;
      current = current[part];
    }

    return current || null;
  }

  /**
   * Obtiene múltiples elementos de una vez
   * @param {string[]} paths - Array de rutas
   * @returns {Object} Objeto con las referencias
   */
  getMultiple(paths) {
    const result = {};
    paths.forEach(path => {
      result[path] = this.get(path);
    });
    return result;
  }

  /**
   * Registra un nuevo elemento en el caché
   * Útil para elementos creados dinámicamente
   * @param {string} key - Clave única
   * @param {Element} element - El elemento
   */
  register(key, element) {
    this.cache[key] = element;
  }

  /**
   * Helper: añade event listener a un elemento por ruta
   * @param {string} path - Ruta al elemento
   * @param {string} event - Tipo de evento
   * @param {Function} handler - Handler
   * @param {Object} options - Opciones de addEventListener
   */
  on(path, event, handler, options) {
    const element = this.get(path);
    if (element) {
      element.addEventListener(event, handler, options);
    }
  }

  /**
   * Helper: obtiene el valor de un input
   * @param {string} path - Ruta al input
   * @returns {string|number|boolean}
   */
  getValue(path) {
    const element = this.get(path);
    if (!element) return null;

    if (element instanceof NodeList) return null; // No soportado para listas

    if (element.type === 'checkbox' || element.type === 'radio') {
      return element.checked;
    }
    return element.value;
  }

  /**
   * Helper: set value de un input/elemento
   * @param {string} path - Ruta al elemento
   * @param {any} value - Valor a asignar
   */
  setValue(path, value) {
    const element = this.get(path);
    if (!element) return;

    if (element.type === 'checkbox' || element.type === 'radio') {
      element.checked = Boolean(value);
    } else if (element.textContent !== undefined) {
      element.textContent = value;
    } else {
      element.value = value;
    }
  }

  /**
   * Helper: muestra/oculta un elemento
   * @param {string} path - Ruta al elemento
   * @param {boolean} visible - true = mostrar, false = ocultar
   */
  setVisible(path, visible) {
    const element = this.get(path);
    if (element) {
      element.style.display = visible ? '' : 'none';
    }
  }

  /**
   * Helper: añade/quita clase
   * @param {string} path - Ruta al elemento
   * @param {string} className - Nombre de clase
   * @param {boolean} add - true = añadir, false = quitar
   */
  toggleClass(path, className, add) {
    const element = this.get(path);
    if (element) {
      if (add) {
        element.classList.add(className);
      } else {
        element.classList.remove(className);
      }
    }
  }
}

// Export to global scope for CEP compatibility
window.DOMManager = DOMManager;
window.kohariDOM = new DOMManager();
