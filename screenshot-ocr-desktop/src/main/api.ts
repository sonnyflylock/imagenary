// API integration module for OCR text extraction
import Store from "electron-store";

export type Provider = "gemini" | "claude" | "gpt5";

interface ApiTestResult {
  success: boolean;
  error?: string;
  message?: string;
}

// Extract base64 data from data URI
function extractBase64(imageData: string): string {
  if (imageData.startsWith("data:")) {
    return imageData.replace(/^data:image\/\w+;base64,/, "");
  }
  return imageData;
}

// Gemini Flash 2.0 API
async function extractWithGemini(
  imageBase64: string,
  apiKey: string
): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Extract ALL text from this image. Return only the extracted text, preserving the original formatting and layout as much as possible. Do not add any commentary or explanations.",
              },
              {
                inline_data: {
                  mime_type: "image/png",
                  data: extractBase64(imageBase64),
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 4096,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      (error as { error?: { message?: string } }).error?.message ||
        `Gemini API error: ${response.status}`
    );
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("No text could be extracted from the image.");
  }

  return text;
}

// Claude API (Anthropic)
async function extractWithClaude(
  imageBase64: string,
  apiKey: string
): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/png",
                data: extractBase64(imageBase64),
              },
            },
            {
              type: "text",
              text: "Extract ALL text from this image. Return only the extracted text, preserving the original formatting and layout as much as possible. Do not add any commentary or explanations.",
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      (error as { error?: { message?: string } }).error?.message ||
        `Claude API error: ${response.status}`
    );
  }

  const data = await response.json();
  const text = data.content?.[0]?.text;

  if (!text) {
    throw new Error("No text could be extracted from the image.");
  }

  return text;
}

// GPT-5 API (OpenAI)
async function extractWithGPT5(
  imageBase64: string,
  apiKey: string
): Promise<string> {
  const imageUrl = imageBase64.startsWith("data:")
    ? imageBase64
    : `data:image/png;base64,${imageBase64}`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract ALL text from this image. Return only the extracted text, preserving the original formatting and layout as much as possible. Do not add any commentary or explanations.",
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      (error as { error?: { message?: string } }).error?.message ||
        `OpenAI API error: ${response.status}`
    );
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error("No text could be extracted from the image.");
  }

  return text;
}

// Main extraction function
export async function extractText(
  imageBase64: string,
  provider: Provider,
  store: Store
): Promise<string> {
  const apiKeys = store.get("apiKeys") as Record<string, string>;
  const apiKey = apiKeys[provider];

  if (!apiKey) {
    throw new Error(
      `${provider.charAt(0).toUpperCase() + provider.slice(1)} API key not configured. Please add it in Settings.`
    );
  }

  switch (provider) {
    case "gemini":
      return await extractWithGemini(imageBase64, apiKey);
    case "claude":
      return await extractWithClaude(imageBase64, apiKey);
    case "gpt5":
      return await extractWithGPT5(imageBase64, apiKey);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

// Test API connection
export async function testApiConnection(
  provider: Provider,
  store: Store
): Promise<ApiTestResult> {
  const apiKeys = store.get("apiKeys") as Record<string, string>;
  const apiKey = apiKeys[provider];

  if (!apiKey) {
    return { success: false, error: "API key not configured" };
  }

  try {
    switch (provider) {
      case "gemini": {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        );
        if (!response.ok) throw new Error("Invalid API key");
        return { success: true };
      }

      case "claude": {
        if (!apiKey.startsWith("sk-ant-")) {
          return { success: false, error: "Invalid API key format" };
        }
        return {
          success: true,
          message: "Key format valid",
        };
      }

      case "gpt5": {
        const response = await fetch("https://api.openai.com/v1/models", {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        if (!response.ok) throw new Error("Invalid API key");
        return { success: true };
      }

      default:
        return { success: false, error: "Unknown provider" };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
