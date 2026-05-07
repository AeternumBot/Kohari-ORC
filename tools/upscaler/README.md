# Waifu2x-Caffe — Denoise (limpieza de ruido) local CPU

Este directorio debe contener el binario de **waifu2x-caffe** para que
la limpieza de ruido funcione sin conexión a internet. **Utiliza CPU puro (Caffe framework)**,
sin dependencias de GPU/Vulkan — compatible con cualquier hardware.

El sistema limpia ruido de escaneos (denoise nivel 3) manteniendo el tamaño original.
Perfecto para manga/manhwa: mejora la calidad sin afectar resolución.

## Archivos requeridos

```
tools/upscaler/
  waifu2x-caffe/
    waifu2x-caffe_waifu2xEX.exe       (ejecutable principal, CPU puro)
    models/
      anime_style_art_rgb/              (modelo ligero: 1.2MB, optimizado para manga)
        ├── noise0_scale2.0x_model.prototxt
        ├── noise1_scale2.0x_model.prototxt
        ├── noise0_scale2.0x_model.prototxt.protobin
        ├── noise0_scale2.0x_model.json.caffemodel
        └── ... (resto de archivos del modelo)
```

## Por qué Caffe (no NCNN/Vulkan)

- **waifu2x-ncnn-vulkan**: Requiere Vulkan GPU → falla en AMD Radeon, GPUs viejas
- **waifu2x-caffe**: CPU puro con Caffe framework → funciona en cualquier PC sin GPU
- Modelo **anime_style_art_rgb** (1.2MB): Ligero, RGB, optimizado para manga
- Denoise `n=1`: Balance perfecto entre limpieza y velocidad

## Instalación

### Opción A: Desde Waifu2x Extension GUI (recomendado)

1. Descarga Waifu2x Extension GUI v3.137+ desde:
   https://github.com/AaronFeng753/Waifu2x-Extension-GUI/releases

2. Busca la carpeta `waifu2x-caffe/` dentro del ZIP extraído

3. Copia esta carpeta entera a `tools/upscaler/`:
   ```
   tools/upscaler/
     └── waifu2x-caffe/
   ```

### Opción B: Compilar desde fuente

https://github.com/nagadomi/waifu2x-caffe
(No recomendado si tienes la GUI disponible)

## Verificación manual

Desde PowerShell:

```powershell
cd 'tools\upscaler\waifu2x-caffe'
.\waifu2x-caffe_waifu2xEX.exe -i input.jpg -o output.png -n 1 -s 2 -m .\models\anime_style_art_rgb
```

Si retorna exit code 0 y genera PNG, está listo.

## Parámetros que usa Kohari ORC

| Flag | Valor | Razón |
|------|-------|-------|
| -i   | input.jpg | Archivo entrada (JPEG) |
| -o   | output.png | Archivo salida (PNG sin pérdidas) |
| -n   | 3 | Denoise nivel 3 (máximo, limpia bien ruido de escaneos) |
| -m   | noise | Modo denoise-only (sin upscale, mantiene tamaño original) |
| -l   | anime_style_art_rgb | Modelo anime optimizado para manga |
| --model_dir | ./models | Directorio raíz de modelos |
| -p   | cpu | Procesador: CPU mode (sin GPU) |

## Performance esperado

- **Chunk 512px**: ~1-2 segundos denoise (CPU moderno, muy rápido)
- **Procesamiento paralelo**: `Promise.all()` con chunks simultáneos
- **ETA dinámico**: Mostrado en barra de progreso con countdown
- **Ventaja denoise**: Sin upscale = mucho más rápido, menos carga CPU

## Diferencias con NCNN versión

| Aspecto | waifu2x-caffe | waifu2x-ncnn-vulkan |
|---------|---------------|--------------------|
| Backend | Caffe CPU | NCNN + Vulkan GPU |
| GPU requerida | No | Sí (incompatible AMD) |
| Velocidad | Moderada (CPU) | Rápida (si GPU funciona) |
| Compatibilidad | ✅ Universal | ❌ GPUs específicas |
| Modelo recomendado | anime_style_art_rgb | models-cunet |

## Troubleshooting

**"No se pudo localizar waifu2x-caffe"**
→ Verifica que `waifu2x-caffe/` existe en `tools/upscaler/`

**"Error codigo 1 (falla silenciosa)"**
→ Modelo no encontrado. Verifica: `tools/upscaler/waifu2x-caffe/models/anime_style_art_rgb/`

**"El denoise no limpia lo suficiente"**
→ Ya está en nivel máximo (-n 3). Para más limpieza, procesar 2 veces o ajustar manualmente en Photoshop.

**"Es muy rápido, ¿funciona?"**
→ Sí. Denoise es mucho más ligero que upscale. 1-2s por chunk es normal.
