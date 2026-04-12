# Kohari ORC - Photoshop Extension

A powerful offline OCR extension for Adobe Photoshop designed specifically for scanlation teams. Extract text from manga/manhwa panels directly within Photoshop using native selection tools.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Photoshop](https://img.shields.io/badge/Photoshop-2022+-brightgreen)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

- **Native Photoshop Integration**: Use any selection tool (Magic Wand, Rectangular Marquee, Lasso) to select text areas
- **Offline OCR**: Powered by Tesseract.js - works completely offline
- **Multi-Language Support**:
  - English (eng)
  - Japanese (jpn)
  - Korean (kor)
  - Japanese + English (jpn+eng)
- **Auto-Numbering**: Automatically numbers bubbles in selection order
- **Single-Line Conversion**: Converts Japanese/Korean multi-line text to single line
- **Preprocessing**: Image enhancement for better OCR accuracy
- **Resizable Panel**: Adapts to your workspace like native Photoshop panels

## Requirements

- Adobe Photoshop 2022 (v23.0) or later
- Windows 10/11 or macOS 10.15+

## Installation

### Windows

1. Close Photoshop if it's running
2. Right-click on `install.bat` and select "Run as Administrator"
3. Wait for installation to complete
4. Restart Photoshop
5. Access via: **Window > Extensions > Kohari ORC**

### macOS

1. Close Photoshop if it's running
2. Open Terminal
3. Navigate to the extension folder:
   ```bash
   cd /path/to/kohari-orc
   ```
4. Make the installer executable:
   ```bash
   chmod +x install.sh
   ```
5. Run the installer:
   ```bash
   ./install.sh
   ```
6. Restart Photoshop
7. Access via: **Window > Extensions > Kohari ORC**

### Manual Installation

If the automatic installer doesn't work:

#### Windows
1. Copy the entire extension folder to:
   ```
   C:\Program Files\Common Files\Adobe\CEP\extensions\com.kohari.orc
   ```

#### macOS
1. Copy the entire extension folder to:
   ```
   ~/Library/Application Support/Adobe/CEP/extensions/com.kohari.orc
   ```

#### Enable Debug Mode
You may need to enable CEP debug mode:

**Windows (Run in Command Prompt):**
```cmd
reg add "HKEY_CURRENT_USER\SOFTWARE\Adobe\CSXS.11" /v PlayerDebugMode /t REG_SZ /d "1" /f
reg add "HKEY_CURRENT_USER\SOFTWARE\Adobe\CSXS.10" /v PlayerDebugMode /t REG_SZ /d "1" /f
```

**macOS (Run in Terminal):**
```bash
defaults write com.adobe.CSXS.11 PlayerDebugMode -string "1"
defaults write com.adobe.CSXS.10 PlayerDebugMode -string "1"
```

## Usage

1. **Open a manga/manhwa page** in Photoshop

2. **Select a text bubble** using any selection tool:
   - Magic Wand Tool (W)
   - Rectangular Marquee Tool (M)
   - Lasso Tool (L)
   - Quick Selection Tool (W)

3. **Choose your language** in the Kohari ORC panel:
   - English: For English text
   - Japanese: For Japanese text (converts multi-line to single line)
   - Korean: For Korean text
   - Japanese + English: For mixed content

4. **Configure options**:
   - **Auto-number bubbles**: Automatically numbers each scan (1, 2, 3...)
   - **Single-line text**: Converts CJK multi-line text to single line
   - **Preprocess image**: Enhances contrast for better OCR
   - **Copy to clipboard**: Automatically copies extracted text

5. **Click "Scan Selection"**

6. **View results** in the panel:
   - Text appears with confidence percentage
   - Click copy button to copy individual results
   - Results are numbered according to scan order

7. **Export all results** as a text file when done

## Tips for Best Results

### Selection
- Use the **Magic Wand Tool** with tolerance ~32 for quick text bubble selection
- For irregular shapes, use the **Quick Selection Tool**
- Make selections slightly larger than the text for better accuracy

### Language-Specific Tips

**Japanese:**
- Enable "Single-line text" option for vertical text
- The OCR works best with horizontal text
- Some vertical text may need manual correction

**Korean:**
- Generally very accurate with horizontal text
- "Single-line text" combines multi-line bubbles appropriately

**English:**
- Works well with standard fonts
- Preprocessing helps with low-contrast images

### Troubleshooting

**Extension doesn't appear in Photoshop:**
- Ensure CEP debug mode is enabled (see Installation)
- Restart Photoshop after installation
- Check that files are in the correct directory

**"No selection found" error:**
- Make sure you have an active selection in Photoshop
- Check that the selection is on the current layer

**Poor OCR accuracy:**
- Enable "Preprocess image" option
- Ensure good contrast between text and background
- Try selecting a slightly larger area around the text

**Japanese/Korean not working:**
- The language files are large (30-40MB each)
- Ensure the `tessdata` folder is properly copied
- First use may take longer as models load

## File Structure

```
kohari-orc/
├── CSXS/
│   └── manifest.xml          # Extension manifest
├── css/
│   └── styles.css            # Panel styles (dark theme)
├── js/
│   ├── libs/
│   │   ├── tesseract.min.js # OCR engine
│   │   └── worker.min.js     # OCR worker
│   ├── main.js               # Main application logic
│   └── photoshop.js          # Photoshop API integration
├── host/
│   └── script.jsx            # ExtendScript for Photoshop
├── tessdata/
│   ├── eng.traineddata       # English language model
│   ├── jpn.traineddata       # Japanese language model
│   └── kor.traineddata       # Korean language model
├── install.bat               # Windows installer
├── install.sh                # macOS installer
├── index.html                # Main panel HTML
└── README.md                 # This file
```

## OCR Engine

Kohari ORC uses **Tesseract.js v5**, a JavaScript port of the Tesseract OCR engine:
- Completely offline - no internet required
- No API keys needed
- Unlimited usage
- Supports 100+ languages

## Privacy

Kohari ORC processes all text recognition locally on your machine:
- No images are uploaded to any server
- No data leaves your computer
- Works completely offline

## Technical Details

### CEP (Common Extensibility Platform)
This extension is built using Adobe CEP, which allows:
- Native Photoshop integration
- Bidirectional communication between HTML/JS and Photoshop
- Access to ExtendScript for advanced Photoshop operations

### Browser Support
The extension runs in a CEF (Chromium Embedded Framework) environment provided by Photoshop, supporting:
- HTML5
- CSS3
- ES6+ JavaScript
- Canvas and Image APIs

## Uninstallation

### Windows
Delete the folder:
```
C:\Program Files\Common Files\Adobe\CEP\extensions\com.kohari.orc
```

### macOS
Delete the folder:
```
~/Library/Application Support/Adobe/CEP/extensions/com.kohari.orc
```

## Development

### Building from Source

1. Clone or download this repository
2. Make changes to files in the respective directories
3. Reload the extension in Photoshop:
   - Open the panel
   - Click the flyout menu
   - Select "Reload"

### Debugging

To debug the extension:

1. Enable debug mode (see Installation)
2. Open Chrome browser
3. Navigate to: `http://localhost:####`
   - The port varies; check CEP logs in Photoshop
4. Chrome DevTools will open for debugging

## License

MIT License - Feel free to modify and distribute.

## Credits

- **Tesseract.js**: OCR engine by naptha
- **Tesseract OCR**: Original C++ engine by Google
- **Adobe CEP**: Extension platform

## Support

For issues or feature requests:
- Check the troubleshooting section above
- Review error messages in the Photoshop console (Help > System Info)

## Changelog

### v1.0.0
- Initial release
- Offline OCR with Tesseract.js
- Support for English, Japanese, Korean
- Auto-numbering and single-line conversion
- Photoshop 2022+ compatibility
# Kohari-ORC
