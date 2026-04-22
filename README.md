# Kohari TOOLS - Photoshop Extension

A professional hybrid suite of tools for Adobe Photoshop designed specifically for scanlation teams. Kohari TOOLS combines high-performance OCR with state-of-the-art AI-powered image cleaning to streamline your workflow directly within your Photoshop workspace.

![Version](https://img.shields.io/badge/version-1.3.0-blue)
![Photoshop](https://img.shields.io/badge/Photoshop-2022+-brightgreen)
![AI-Powered](https://img.shields.io/badge/AI-Gemini_%26_IOPaint-orange)
![License](https://img.shields.io/badge/license-MIT-green)

## 🆕 What's New in v1.3.0

- **AI Image Cleaning (Inpainting)**: Remove SFX and text bubbles with one click. Uses the powerful LaMa model to reconstruct the background seamlessly.
- **Smart Masking**: Automatically generates high-precision masks from your lasso selection with advanced background context preservation.
- **Renamed to Kohari TOOLS**: The project has evolved from a simple OCR tool to a comprehensive suite for cleaners and typesetters.
- **Improved UI**: Smooth animations between tabs and a more organized layout for better productivity.
- **Robust IPC**: Redesigned communication layer between CEP and ExtendScript to handle large images and avoid memory errors.

## 🛠 Features

- **AI Image Cleaner**:
  - **Context-Aware**: Intelligently analyzes surrounding artwork to fill in gaps.
  - **Single-Click Workflow**: Results are automatically pasted as new, perfectly aligned layers.
- **Hybrid OCR Engine**:
  - **Local (Tesseract.js)**: 100% offline, private, and fast. Best for standard font bubbles.
  - **Cloud AI (Gemini)**: Exceptional accuracy for difficult text, artistic fonts, or vertical text.
- **Native Photoshop Integration**: Works with any selection tool (Magic Wand, Rectangular Marquee, Lasso).
- **Multi-Language Support**: English, Japanese, Korean, and Spanish.
- **Live Copy**: Extracted text is automatically copied to your clipboard as you scan.

## 📋 Requirements

- **Adobe Photoshop 2022 (v23.0)** or later.
- **Windows 10/11** or **macOS 10.15+**.
- **Internet connection** (required for Cloud OCR and AI Cleaning).

## 🚀 Installation

### Automated Installation (Recommended)

1. Close Photoshop if it's running.
2. **Windows**: Right-click `install.bat` and select **Run as Administrator**.
3. **macOS**: Open Terminal, navigate to the folder, and run `./install.sh`.
4. Restart Photoshop.
5. Go to **Window > Extensions > Kohari TOOLS**.

### Manual Installation

Copy the extension folder to:
- **Windows**: `C:\Program Files\Common Files\Adobe\CEP\extensions\com.kohari.orc`
- **macOS**: `~/Library/Application Support/Adobe/CEP/extensions/com.kohari.orc`

## 💡 How to Use

### AI Cleaning
1. Select the SFX or text area with the **Lasso Tool (L)**.
2. Go to the **Limpiador IA** tab.
3. Click **"Limpiar Selección"**.
4. The cleaned artwork will be added as a new layer.

### OCR (Text Recognition)
1. Select a text bubble.
2. Choose your engine (**Local** or **IA en la Nube**).
3. Click **"Escanear Selección"**.
4. Use **"Copiar Todo"** to export your formatted script.

## 📁 File Structure

```
Kohari-TOOLS/
├── Kohari_Logo-.png    # Main Brand Logo
├── assets/             # Extension icons
├── css/                # Modern UI styles with animations
├── js/
│   ├── main.js         # Core logic and AI API communication
│   ├── photoshop.js    # Layer management and file handling
│   └── libs/           # OCR libraries
├── host/
│   └── script.jsx      # Photoshop ExtendScript (Image Processing)
├── CSXS/
│   └── manifest.xml    # Extension configuration
├── install.bat/sh      # Automated installers
└── index.html          # Professional Tabbed UI
```

## 🔐 Privacy

Kohari TOOLS values your privacy:
- **Local OCR**: Processed entirely on your machine.
- **AI Tools**: Images sent for processing are handled according to the provider's standard privacy terms (Google Gemini / Hugging Face). No images are permanently stored.

## ⚖️ License

MIT License - Developed for the Scanlation community with ❤️ by the Kohari Team.
