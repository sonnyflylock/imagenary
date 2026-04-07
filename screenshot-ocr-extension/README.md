# Imagenary Text Extractor — Chrome Extension

A Chrome extension that captures screenshots and extracts text using AI-powered OCR. Part of the [Imagenary.ai](https://imagenary.ai) suite. Supports multiple AI providers: Gemini Flash 2.0, Claude, and GPT-5.

## Features

- **One-click screenshot capture** - Capture the visible tab with a single click
- **Keyboard shortcut** - Use `Ctrl+Shift+O` (or `Cmd+Shift+O` on Mac) for quick capture
- **Multiple AI providers** - Choose between Gemini Flash 2.0, Claude, or GPT-5
- **Copy to clipboard** - Instantly copy extracted text
- **Extraction history** - View and reuse previous extractions
- **Freemium model** - 10 free extractions, then upgrade options

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the `screenshot-ocr-extension` folder
5. The extension icon will appear in your toolbar

## Setup

1. Click the extension icon and then click "Settings"
2. Add your API keys for the AI providers you want to use:
   - **Gemini**: Get a key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - **Claude**: Get a key from [Anthropic Console](https://console.anthropic.com/settings/keys)
   - **GPT-5**: Get a key from [OpenAI Platform](https://platform.openai.com/api-keys)

## Usage

1. Navigate to any webpage with text you want to extract
2. Click the Text Extractor icon in your toolbar
3. Select your preferred AI provider
4. Click "Capture Screenshot"
5. Wait for the text extraction to complete
6. Click the copy button to copy the extracted text

## Pricing

- **Free**: 10 extractions included
- **Pay As You Go**: $5 for 50 extractions (never expires)
- **Unlimited**: $10/month for unlimited extractions

## Project Structure

```
screenshot-ocr-extension/
├── manifest.json           # Chrome extension manifest
├── icons/                  # Extension icons
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── src/
    ├── popup.html          # Main popup UI
    ├── options.html        # Settings page
    ├── css/
    │   ├── popup.css       # Popup styles
    │   └── options.css     # Settings page styles
    └── js/
        ├── popup.js        # Popup interactions
        ├── background.js   # Service worker
        ├── options.js      # Settings page logic
        ├── api.js          # AI API integrations
        └── storage.js      # Local storage management
```

## API Usage

The extension uses the following APIs:

### Gemini Flash 2.0
- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`
- Fast and cost-effective OCR

### Claude (Anthropic)
- Endpoint: `https://api.anthropic.com/v1/messages`
- High-quality text extraction with excellent formatting

### GPT-5 (OpenAI)
- Endpoint: `https://api.openai.com/v1/chat/completions`
- Advanced vision capabilities (update model name when available)

## Privacy

- All API keys are stored locally in Chrome storage
- No data is sent to third-party servers (only to the AI providers you configure)
- Extraction history is stored locally and can be cleared at any time

## Development

To modify the extension:

1. Make your changes to the source files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the Text Extractor card
4. Test your changes

## License

MIT License - feel free to modify and distribute.
