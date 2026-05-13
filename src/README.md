# Kohari TOOLS - Arquitectura Modular v2.0.0

## 📁 Estructura

```
src/
├── core/                    # Núcleo de la aplicación
│   ├── app.js              # Clase KohariApp - orquestador principal
│   ├── module-loader.js    # Cargador dinámico de módulos
│   ├── dom-manager.js      # Gestor centralizado de referencias DOM
│   ├── storage.js          # Almacenamiento seguro (encriptado)
│   ├── themes.js           # Detección y aplicación de temas
│   └── constants.js        # Configuración global y constantes
│
├── modules/                 # Módulos funcionales independientes
│   ├── ocr/
│   │   ├── ocr.module.js        # Export del módulo
│   │   ├── ocr-engine.js        # Lógica OCR (Tesseract + Gemini)
│   │   ├── ocr-ui.js            # Handlers de UI
│   │   ├── ocr-preprocess.js    # Preprocesamiento de imágenes
│   │   └── ocr.css              # Estilos exclusivos
│   │
│   ├── cleaner/
│   │   ├── cleaner.module.js    # Export del módulo
│   │   ├── cleaner-engine.js    # Lógica IA (LaMa, fill bubbles)
│   │   ├── cleaner-ui.js        # Handlers de UI
│   │   └── cleaner.css          # Estilos exclusivos
│   │
│   └── extras/
│       ├── extras.module.js     # Export del módulo
│       ├── tpl-converter.js     # Conversión TPL → JSON
│       ├── extras-ui.js         # Handlers de UI
│       └── extras.css           # Estilos exclusivos
│
├── shared/                  # Utilidades compartidas
│   ├── logger.js           # Sistema de logs con niveles
│   ├── utils.js            # Funciones auxiliares
│   ├── photoshop-api.js    # API de comunicación con Photoshop
│   └── shared.css          # Estilos comunes
│
└── licensing/              # Sistema de licencias (futuro)
    ├── license-manager.js  # Validación de licencias
    ├── license-ui.js       # UI de activación
    └── license.css         # Estilos de paywall
```

## 🚀 Cómo funciona

### 1. Inicialización

```javascript
// En index.html (nuevo)
<script type="module">
  import ModuleLoader from './src/core/module-loader.js';
  import KohariApp from './src/core/app.js';
  
  const moduleLoader = new ModuleLoader();
  const app = new KohariApp(moduleLoader);
  
  await moduleLoader.init(app);
  await app.init();
</script>
```

### 2. Carga de Módulos Dinámicos

`config.json` define qué módulos están habilitados:

```json
{
  "version": "complete",
  "modules": {
    "ocr": { "enabled": true },
    "cleaner": { "enabled": true },
    "extras": { "enabled": true }
  }
}
```

El `ModuleLoader` solo carga los módulos `enabled: true`.

### 3. Estructura de un Módulo

```javascript
// ocr/ocr.module.js
export default {
  name: 'ocr',
  
  init(app) {
    this.app = app;
    this.setupUI();
    this.bindEvents();
  },
  
  setupUI() {
    // Mostrar/ocultar elementos específicos del módulo
  },
  
  bindEvents() {
    // Vincular handlers de eventos
  },
  
  // Métodos del módulo...
  handleScan() { /* ... */ }
};
```

### 4. Comunicación Entre Componentes

```javascript
// Desde app.js - Emitir evento global
app.emit('ocr:scan-started', { selection });

// Desde un módulo - Escuchar evento global
app.on('ocr:scan-completed', (result) => {
  // Handle result
});

// Acceder a otro módulo
const ocrModule = app.getModule('ocr');
ocrModule.doSomething();
```

## 🔐 Sistema de Storage Seguro

```javascript
import storage from './core/storage.js';

// Guardar (encripta automáticamente si es clave sensible)
storage.set('apiKey', 'sk-123456');  // ← Se encripta
storage.set('language', 'es');       // ← Se guarda como texto

// Recuperar (desencripta automáticamente)
const apiKey = storage.get('apiKey');  // Devuelve desencriptado
const lang = storage.get('language');
```

## 🎨 Detección de Temas Automática

```javascript
import themeManager from './core/themes.js';

// El tema se detecta y aplica automáticamente en init()
// Soporta 4 temas: darkest, dark, medium, light

themeManager.onChange(theme => {
  console.log('Tema cambió a:', theme);
});
```

## 🛠️ Utilidades Compartidas

```javascript
import * as utils from './shared/utils.js';
import logger from './shared/logger.js';

// Logger
logger.debug('Mensaje de debug');
logger.info('Información');
logger.warn('Advertencia');
logger.error('Error');
logger.getHistory('ERROR', 20);  // Últimos 20 errores

// Utils
utils.copyToClipboard('texto');
utils.debounce(myFunction, 300);
utils.sleep(1000);
utils.postProcessText(text, 'jpn', { singleLine: true });
```

## 📦 Versiones Compiladas

El build system genera 4 versiones en `/dist`:

### 1. **complete/** - Todos los módulos
```json
{ "ocr": enabled, "cleaner": enabled, "extras": enabled }
```

### 2. **ocr-only/** - Solo OCR
```json
{ "ocr": enabled, "cleaner": disabled, "extras": disabled }
```
- `index.html` sin tabs de Cleaner/Extras
- Instalador: `install-ocr-only.bat`

### 3. **cleaner-only/** - Solo limpiador
```json
{ "ocr": disabled, "cleaner": enabled, "extras": disabled }
```

### 4. **extras-only/** - Solo herramientas
```json
{ "ocr": disabled, "cleaner": disabled, "extras": enabled }
```

## 🔑 Agregar un Nuevo Módulo

1. Crear carpeta: `src/modules/mynewmodule/`
2. Crear archivo: `mynewmodule.module.js`
3. Exportar con estructura estándar:
```javascript
export default {
  name: 'mynewmodule',
  init(app) { /* ... */ }
};
```
4. Agregar en `config.json`
5. Crear UI/CSS específicos

## 📝 Notas Importantes

- **Imports**: Usar rutas relativas: `import x from './core/app.js'`
- **DOM**: No usar `document.querySelector` directamente, usar `domManager.get()`
- **Storage**: API keys y datos sensibles se encriptan automáticamente
- **Logging**: Siempre usar `logger` en lugar de `console.log()`
- **Eventos**: Usar `app.on()` / `app.emit()` para comunicación entre módulos

---

**Próximos pasos**: Refactorizar main.js → módulos OCR, CLEANER, EXTRAS
