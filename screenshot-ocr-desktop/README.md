# Imagenary Text Extractor — Desktop App

A Windows desktop application for AI-powered OCR text extraction from screenshots. Part of the [Imagenary.ai](https://imagenary.ai) suite. Built with Electron.

## Features

- **Global hotkey** - Capture screenshots from anywhere with `Ctrl+Shift+O`
- **System tray** - Runs in background, always accessible
- **Multi-provider OCR** - Supports Gemini Flash 2.0, Claude, and GPT-5
- **Dark theme UI** - Modern, clean interface
- **Usage tracking** - Freemium model with 10 free extractions
- **Extraction history** - Save and copy previous extractions
- **Auto-clipboard** - Automatically copy extracted text

## Installation

### From Release

1. Download the latest release from the Releases page
2. Run the installer (`Imagenary-Text-Extractor-Setup-x.x.x.exe`) or use the portable version
3. Launch Imagenary Text Extractor from the Start Menu or desktop shortcut

### From Source

```bash
# Clone the repository
git clone https://github.com/your-repo/screenshot-ocr-desktop.git
cd screenshot-ocr-desktop

# Install dependencies
npm install

# Build TypeScript
npm run build

# Run in development
npm start

# Build Windows installer
npm run dist:win
```

## Configuration

### API Keys

1. Open the app and go to Settings
2. Add your API keys for the providers you want to use:
   - **Gemini**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - **Claude**: Get from [Anthropic Console](https://console.anthropic.com/settings/keys)
   - **GPT-5**: Get from [OpenAI Platform](https://platform.openai.com/api-keys)

### Preferences

- **Default Provider**: Choose which AI to use by default
- **Auto-copy**: Automatically copy extracted text to clipboard
- **Save History**: Keep a history of extractions
- **Start Minimized**: Launch to system tray

## Usage

1. **Quick Capture**: Press `Ctrl+Shift+O` anywhere to capture and extract
2. **From App**: Click the "Capture Screenshot" button
3. **System Tray**: Right-click the tray icon for quick access

The extracted text will be displayed in the app and automatically copied to your clipboard (if enabled).

## Pricing

- **Free**: 10 extractions included
- **Pay As You Go**: $5 for 50 additional extractions
- **Unlimited**: $10/month for unlimited extractions

## Project Structure

```
screenshot-ocr-desktop/
├── package.json
├── tsconfig.main.json
├── tsconfig.renderer.json
├── README.md
├── assets/
│   └── icon.png          # App icon
└── src/
    ├── main/
    │   ├── index.ts      # Main Electron process
    │   ├── preload.ts    # Preload script for IPC
    │   └── api.ts        # AI API integrations
    └── renderer/
        ├── index.html    # App UI
        ├── styles.css    # Styling
        └── app.ts        # Renderer logic
```

## Building

### Development

```bash
# Run in development mode
npm run dev

# Or build and run
npm run build && npm start
```

### Production

```bash
# Build for Windows (NSIS installer + portable)
npm run dist:win

# Output will be in the `release` folder
```

## System Requirements

- Windows 10 or later (64-bit)
- Node.js 18+ (for building from source)

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+O` | Capture screenshot and extract text |

## Troubleshooting

### Screenshot capture not working

- Make sure the app has screen capture permissions
- Try running as administrator

### API errors

- Verify your API key is correct
- Check that you have credits/quota with the provider
- Ensure you have internet connectivity

### App won't start

- Check Windows Event Viewer for errors
- Try deleting `%APPDATA%/screenshot-ocr-desktop` and restarting

## License

MIT License
