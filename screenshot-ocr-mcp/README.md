# Imagenary Text Extractor — MCP Server

An MCP (Model Context Protocol) server that provides AI-powered OCR text extraction from images. Part of the [Imagenary.ai](https://imagenary.ai) suite. Supports multiple AI providers: Gemini Flash 2.0, Claude, and GPT-5/GPT-4o.

## Features

- **Multi-provider OCR** - Extract text using Gemini, Claude, or OpenAI
- **Multiple input formats** - Accept base64 images, file paths, or URLs
- **Usage tracking** - Built-in usage limits with freemium model
- **Easy configuration** - Configure via environment variables

## Installation

```bash
# Clone the repository
git clone https://github.com/your-repo/screenshot-ocr-mcp.git
cd screenshot-ocr-mcp

# Install dependencies
npm install

# Build
npm run build
```

## Configuration

Set up your API keys as environment variables:

```bash
# Gemini (Google AI)
export GEMINI_API_KEY="your-gemini-api-key"

# Claude (Anthropic)
export ANTHROPIC_API_KEY="your-anthropic-api-key"

# GPT-5/GPT-4o (OpenAI)
export OPENAI_API_KEY="your-openai-api-key"

# Optional: Enable unlimited extractions
export SCREENSHOT_OCR_UNLIMITED="true"
```

### Getting API Keys

- **Gemini**: [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Claude**: [Anthropic Console](https://console.anthropic.com/settings/keys)
- **OpenAI**: [OpenAI Platform](https://platform.openai.com/api-keys)

## Usage with Claude Desktop

Add to your Claude Desktop configuration (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "imagenary-text-extractor": {
      "command": "node",
      "args": ["/path/to/screenshot-ocr-mcp/dist/index.js"],
      "env": {
        "GEMINI_API_KEY": "your-gemini-api-key",
        "ANTHROPIC_API_KEY": "your-anthropic-api-key",
        "OPENAI_API_KEY": "your-openai-api-key"
      }
    }
  }
}
```

## Available Tools

### `extract_text_from_image`

Extract text from an image provided as base64 or file path.

**Parameters:**
- `image` (required): Base64-encoded image string or absolute file path
- `provider` (optional): AI provider to use - "gemini" (default), "claude", or "gpt5"

**Example:**
```json
{
  "name": "extract_text_from_image",
  "arguments": {
    "image": "/path/to/screenshot.png",
    "provider": "gemini"
  }
}
```

### `extract_text_from_url`

Extract text from an image at a URL.

**Parameters:**
- `url` (required): URL of the image
- `provider` (optional): AI provider to use

**Example:**
```json
{
  "name": "extract_text_from_url",
  "arguments": {
    "url": "https://example.com/image.png",
    "provider": "claude"
  }
}
```

### `get_usage_stats`

Get current usage statistics.

**Returns:**
```json
{
  "remainingExtractions": 8,
  "freeRemaining": 8,
  "paidRemaining": 0,
  "totalUsed": 2,
  "subscriptionType": "free",
  "subscriptionExpires": null,
  "isUnlimited": false
}
```

### `check_provider_status`

Check if a specific AI provider is configured and accessible.

**Parameters:**
- `provider` (required): "gemini", "claude", or "gpt5"

### `list_providers`

List all available AI providers and their configuration status.

## Available Resources

### `ocr://usage`

Current usage statistics in JSON format.

### `ocr://providers`

Status of all configured AI providers.

## Usage Limits

The server includes a freemium usage model:

- **Free**: 10 extractions included
- **Pay As You Go**: Add 50 extractions (simulated)
- **Unlimited**: Set `SCREENSHOT_OCR_UNLIMITED=true` environment variable

Usage data is stored in `~/.screenshot-ocr-mcp/usage.json`.

## Development

```bash
# Watch mode for development
npm run dev

# Build for production
npm run build

# Run the server
npm start
```

## Project Structure

```
screenshot-ocr-mcp/
├── package.json
├── tsconfig.json
├── README.md
└── src/
    ├── index.ts      # Main MCP server entry point
    ├── api.ts        # AI provider API integrations
    └── usage.ts      # Usage tracking and limits
```

## API Provider Details

### Gemini Flash 2.0
- Fast and cost-effective
- Good for general OCR tasks
- Model: `gemini-2.0-flash`

### Claude (Anthropic)
- Excellent text formatting preservation
- High accuracy on complex layouts
- Model: `claude-sonnet-4-20250514`

### GPT-4o (OpenAI)
- Advanced vision capabilities
- Good for handwritten text
- Model: `gpt-4o` (upgradeable to GPT-5 when available)

## License

MIT License
