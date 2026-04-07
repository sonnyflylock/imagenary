#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { extractText, testApiConnection, Provider } from "./api.js";
import { UsageTracker } from "./usage.js";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// Initialize usage tracker
const usageTracker = new UsageTracker();

// Define available tools
const tools: Tool[] = [
  {
    name: "extract_text_from_image",
    description:
      "Extract text from an image using AI-powered OCR. Supports multiple AI providers: gemini (Gemini Flash 2.0), claude, or gpt5. The image can be provided as a base64-encoded string or a file path.",
    inputSchema: {
      type: "object" as const,
      properties: {
        image: {
          type: "string",
          description:
            "The image to extract text from. Can be a base64-encoded image string (with or without data URI prefix) or an absolute file path to an image.",
        },
        provider: {
          type: "string",
          enum: ["gemini", "claude", "gpt5"],
          default: "gemini",
          description:
            "The AI provider to use for text extraction. Defaults to gemini.",
        },
      },
      required: ["image"],
    },
  },
  {
    name: "extract_text_from_url",
    description:
      "Extract text from an image at a given URL using AI-powered OCR.",
    inputSchema: {
      type: "object" as const,
      properties: {
        url: {
          type: "string",
          description: "The URL of the image to extract text from.",
        },
        provider: {
          type: "string",
          enum: ["gemini", "claude", "gpt5"],
          default: "gemini",
          description:
            "The AI provider to use for text extraction. Defaults to gemini.",
        },
      },
      required: ["url"],
    },
  },
  {
    name: "get_usage_stats",
    description:
      "Get the current usage statistics including remaining extractions and subscription status.",
    inputSchema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "check_provider_status",
    description:
      "Check if an AI provider is properly configured and accessible.",
    inputSchema: {
      type: "object" as const,
      properties: {
        provider: {
          type: "string",
          enum: ["gemini", "claude", "gpt5"],
          description: "The AI provider to check.",
        },
      },
      required: ["provider"],
    },
  },
  {
    name: "list_providers",
    description:
      "List all available AI providers and their configuration status.",
    inputSchema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
];

// Create server
const server = new Server(
  {
    name: "imagenary-text-extractor-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handle list resources request
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "ocr://usage",
        name: "Usage Statistics",
        description: "Current usage statistics and subscription status",
        mimeType: "application/json",
      },
      {
        uri: "ocr://providers",
        name: "Provider Status",
        description: "Status of configured AI providers",
        mimeType: "application/json",
      },
    ],
  };
});

// Handle read resource request
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  if (uri === "ocr://usage") {
    const stats = await usageTracker.getStats();
    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify(stats, null, 2),
        },
      ],
    };
  }

  if (uri === "ocr://providers") {
    const providers = ["gemini", "claude", "gpt5"] as Provider[];
    const status: Record<string, { configured: boolean; status: string }> = {};

    for (const provider of providers) {
      const result = await testApiConnection(provider);
      status[provider] = {
        configured: result.success,
        status: result.success ? "ready" : result.error || "not configured",
      };
    }

    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify(status, null, 2),
        },
      ],
    };
  }

  throw new Error(`Unknown resource: ${uri}`);
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "extract_text_from_image": {
        const { image, provider = "gemini" } = args as {
          image: string;
          provider?: Provider;
        };

        // Check usage limits
        const canProceed = await usageTracker.canExtract();
        if (!canProceed) {
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({
                  error: "Usage limit reached",
                  message:
                    "No extractions remaining. Please upgrade your plan or set SCREENSHOT_OCR_UNLIMITED=true for unlimited usage.",
                  upgradeRequired: true,
                }),
              },
            ],
            isError: true,
          };
        }

        let imageData: string;

        // Check if it's a file path
        if (
          !image.startsWith("data:") &&
          !image.match(/^[A-Za-z0-9+/]+=*$/) &&
          existsSync(image)
        ) {
          // It's a file path
          const absolutePath = resolve(image);
          const fileBuffer = readFileSync(absolutePath);
          const base64 = fileBuffer.toString("base64");
          const ext = absolutePath.split(".").pop()?.toLowerCase() || "png";
          const mimeType =
            ext === "jpg" ? "image/jpeg" : `image/${ext}`;
          imageData = `data:${mimeType};base64,${base64}`;
        } else if (image.startsWith("data:")) {
          imageData = image;
        } else {
          // Assume it's raw base64
          imageData = `data:image/png;base64,${image}`;
        }

        const text = await extractText(imageData, provider);
        await usageTracker.decrementUsage();

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                success: true,
                provider,
                extractedText: text,
              }),
            },
          ],
        };
      }

      case "extract_text_from_url": {
        const { url, provider = "gemini" } = args as {
          url: string;
          provider?: Provider;
        };

        // Check usage limits
        const canProceed = await usageTracker.canExtract();
        if (!canProceed) {
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({
                  error: "Usage limit reached",
                  message: "No extractions remaining. Please upgrade your plan.",
                  upgradeRequired: true,
                }),
              },
            ],
            isError: true,
          };
        }

        // Fetch the image from URL
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        const contentType = response.headers.get("content-type") || "image/png";
        const imageData = `data:${contentType};base64,${base64}`;

        const text = await extractText(imageData, provider);
        await usageTracker.decrementUsage();

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                success: true,
                provider,
                sourceUrl: url,
                extractedText: text,
              }),
            },
          ],
        };
      }

      case "get_usage_stats": {
        const stats = await usageTracker.getStats();
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(stats, null, 2),
            },
          ],
        };
      }

      case "check_provider_status": {
        const { provider } = args as { provider: Provider };
        const result = await testApiConnection(provider);

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                provider,
                configured: result.success,
                status: result.success ? "ready" : "not configured",
                message: result.error || result.message || "Provider is ready",
              }),
            },
          ],
        };
      }

      case "list_providers": {
        const providers = ["gemini", "claude", "gpt5"] as Provider[];
        const providerInfo = [];

        for (const provider of providers) {
          const result = await testApiConnection(provider);
          providerInfo.push({
            name: provider,
            displayName: getProviderDisplayName(provider),
            configured: result.success,
            status: result.success ? "ready" : result.error || "not configured",
            envVar: getProviderEnvVar(provider),
          });
        }

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ providers: providerInfo }, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({ error: errorMessage }),
        },
      ],
      isError: true,
    };
  }
});

function getProviderDisplayName(provider: Provider): string {
  const names: Record<Provider, string> = {
    gemini: "Gemini Flash 2.0",
    claude: "Claude (Anthropic)",
    gpt5: "GPT-5 (OpenAI)",
  };
  return names[provider];
}

function getProviderEnvVar(provider: Provider): string {
  const vars: Record<Provider, string> = {
    gemini: "GEMINI_API_KEY",
    claude: "ANTHROPIC_API_KEY",
    gpt5: "OPENAI_API_KEY",
  };
  return vars[provider];
}

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Imagenary Text Extractor MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
