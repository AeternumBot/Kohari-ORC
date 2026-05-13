# Plan de Modularización - Kohari TOOLS

## 📊 Mapeo de Dependencias Actual

### main.js (1586 líneas) - Problemas
- TODO en un solo archivo
- Estado global (`state`) accesible desde cualquier lado
- Funciones entrelazadas sin separación clara
- DOM queries repetidas
- Sin abstracción de módulos

---

## 🏗️ Estructura Nueva

```
src/
├── core/
│   ├── app.js              # Núcleo: init, bindEvents globales, router de módulos
│   ├── module-loader.js    # Carga dinámica de módulos basada en config
│   ├── storage.js          # Almacenamiento seguro (API keys, estado)
│   ├── dom-manager.js      # Caché de referencias DOM, querys optimizadas
│   ├── themes.js           # Detección de tema Photoshop + listeners
│   └── constants.js        # languageConfig, config de módulos, etc
│
├── modules/
│   ├── ocr/
│   │   ├── ocr.module.js         # Export del módulo (OCR)
│   │   ├── ocr-engine.js         # Lógica OCR (Tesseract + Gemini)
│   │   ├── ocr-ui.js             # UI handlers, renderizado
│   │   ├── ocr-preprocess.js     # Preprocesamiento: rotate, blur, threshold
│   │   └── ocr.css               # Estilos exclusivos OCR
│   │
│   ├── cleaner/
│   │   ├── cleaner.module.js     # Export del módulo (CLEANER)
│   │   ├── cleaner-engine.js     # Lógica IA (LaMa, fill bubbles)
│   │   ├── cleaner-ui.js         # UI handlers, renderizado
│   │   └── cleaner.css           # Estilos exclusivos CLEANER
│   │
│   └── extras/
│       ├── extras.module.js      # Export del módulo (EXTRAS)
│       ├── tpl-converter.js      # Conversión TPL → JSON
│       ├── extras-ui.js          # UI handlers
│       └── extras.css            # Estilos exclusivos EXTRAS
│
├── shared/
│   ├── photoshop-api.js    # API comunicación con Photoshop (ya existe)
│   ├── utils.js            # Utilidades: base64ToBlob, textProcessing, etc
│   ├── logger.js           # Sistema de logs con niveles
│   └── shared.css          # Estilos comunes (reset, variables, grid)
│
└── licensing/
    ├── license-manager.js  # Validación de licencias por módulo
    ├── license-ui.js       # UI de activación/compra
    └── license.css         # Estilos de paywall

index.html (actualizado)
├── Cargar core/app.js
├── Cargar core/module-loader.js
├── Cargar config.json (qué módulos están habilitados)
└── Cargar CSS compartido
```

---

## 🔄 Flujo de Modularización

### 1️⃣ **Paso 1: Estructura Core**
```javascript
// config.json (generado por build system)
{
  "version": "complete",
  "modules": {
    "ocr": { "enabled": true, "licensed": true },
    "cleaner": { "enabled": true, "licensed": true },
    "extras": { "enabled": true, "licensed": true }
  }
}

// En index.html
<script src="config.json"></script>
<script src="core/app.js"></script>
<script src="core/module-loader.js"></script>
```

### 2️⃣ **Paso 2: Cada módulo es independiente**
```javascript
// ocr/ocr.module.js
const OCRModule = {
  name: 'ocr',
  requires: ['photoshop-api', 'utils'],
  
  init(app) {
    // Cargar UI
    this.bindEvents();
    // Registrar handlers
    app.on('scan', this.handleScan.bind(this));
  },
  
  bindEvents() { /* ... */ },
  handleScan() { /* ... */ },
  /* funciones OCR específicas */
};

export default OCRModule;
```

### 3️⃣ **Paso 3: Module Loader**
```javascript
// module-loader.js
class ModuleLoader {
  constructor(config) {
    this.config = config;
    this.modules = {};
  }
  
  async load() {
    for (const [name, meta] of Object.entries(this.config.modules)) {
      if (!meta.enabled) continue;
      
      const module = await import(`./modules/${name}/${name}.module.js`);
      this.modules[name] = module.default;
      this.modules[name].init(this.app);
    }
  }
  
  getModule(name) {
    return this.modules[name];
  }
}
```

---

## 🎯 Mapping: main.js → Nuevos Módulos

### **CORE / Shared**
| Función | Nuevo Archivo |
|---------|--------------|
| `init()` | `core/app.js` |
| `bindEvents()` | `core/app.js` + cada módulo |
| `detectPhotoshopTheme()` | `core/themes.js` |
| `applyTheme()` | `core/themes.js` |
| `listenForThemeChanges()` | `core/themes.js` |
| `getElements()` | `core/dom-manager.js` |
| `localStorage` calls | `core/storage.js` (con encriptación) |
| `languageConfig` | `core/constants.js` |
| `updateStatus()`, `showToast()` | `core/app.js` (UI notifications) |
| `base64ToBlob()`, `escapeJSON()` | `shared/utils.js` |

### **OCR Module**
| Función | Nuevo Archivo |
|---------|--------------|
| `handleScan()` | `modules/ocr/ocr-ui.js` |
| `preprocessImage()` | `modules/ocr/ocr-preprocess.js` |
| `detectSkewAngle()` | `modules/ocr/ocr-preprocess.js` |
| `rotateCanvas()` | `modules/ocr/ocr-preprocess.js` |
| `gaussianBlur3()` | `modules/ocr/ocr-preprocess.js` |
| `otsuThreshold()` | `modules/ocr/ocr-preprocess.js` |
| `postProcessText()` | `modules/ocr/ocr-engine.js` |
| OCR logic (Tesseract, Gemini) | `modules/ocr/ocr-engine.js` |
| Strip management | `modules/ocr/ocr-ui.js` |

### **CLEANER Module**
| Función | Nuevo Archivo |
|---------|--------------|
| `handleCleanWithAI()` | `modules/cleaner/cleaner-ui.js` |
| `handleFillBubblesWhite()` | `modules/cleaner/cleaner-ui.js` |
| `showAIStatus()` | `modules/cleaner/cleaner-ui.js` |
| Lógica LaMa/inpainting | `modules/cleaner/cleaner-engine.js` |
| Comunicación con PS (fill bubbles) | `modules/cleaner/cleaner-engine.js` |

### **EXTRAS Module**
| Función | Nuevo Archivo |
|---------|--------------|
| `handleConvertTPL()` | `modules/extras/extras-ui.js` |
| Lógica conversión TPL | `modules/extras/tpl-converter.js` |

---

## 📱 Versiones Generadas

### `build.js` genera 4 carpetas en `/dist`:

#### 1. **complete/** (Todos los módulos)
```json
{ "ocr": enabled, "cleaner": enabled, "extras": enabled }
```

#### 2. **ocr-only/** (Solo OCR)
```json
{ "ocr": enabled, "cleaner": disabled, "extras": disabled }
```
- index.html sin tabs de Cleaner/Extras
- config.json deshabilita esos módulos
- Instalador: `install-ocr-only.bat`

#### 3. **cleaner-only/** (Solo limpiador)
```json
{ "ocr": disabled, "cleaner": enabled, "extras": disabled }
```

#### 4. **extras-only/** (Solo herramientas)
```json
{ "ocr": disabled, "cleaner": disabled, "extras": enabled }
```

---

## 🔐 Sistema de Licencias (Futuro)

```javascript
// licensing/license-manager.js
class LicenseManager {
  validateLicense(module, licenseKey) {
    // Validar en servidor o localmente
    // Return: { valid: bool, expiry: date, features: [] }
  }
  
  isModuleAvailable(moduleName) {
    // Devuelve true si:
    // 1. Es versión "complete" O
    // 2. Módulo está en config.json como enabled O
    // 3. Licencia válida para ese módulo
  }
}
```

---

## ⏱️ Estimación de Tiempo

| Tarea | Tiempo | Complejidad |
|-------|--------|------------|
| Crear estructura carpetas | 15 min | Trivial |
| Refactor CORE (app.js, storage.js, etc) | 45 min | Media |
| Refactor OCR Module | 60 min | Alta |
| Refactor CLEANER Module | 45 min | Media |
| Refactor EXTRAS Module | 20 min | Baja |
| Module Loader + dinámico | 30 min | Media |
| Actualizar index.html (tabs dinámicos) | 20 min | Baja |
| Build system (Node.js script) | 30 min | Media |
| Instaladores .bat por versión | 15 min | Baja |
| Testing de todas las versiones | 30 min | Media |
| **TOTAL** | **4-5 horas** | - |

---

## 🎬 Comenzamos por:

1. **Crear estructura carpetas**
2. **Refactor CORE** (base para todo lo demás)
3. **Refactor OCR** (módulo más grande)
4. **Refactor CLEANER**
5. **Refactor EXTRAS**
6. **Module Loader**
7. **Build system**
