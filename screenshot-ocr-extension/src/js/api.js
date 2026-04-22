// API integration module for OCR text extraction

import { getApiKeys, getInstallId } from './storage.js';

// Gemini Flash 2.0 API
export async function extractWithGemini(imageBase64) {
  const keys = await getApiKeys();
  if (!keys.gemini) {
    throw new Error('Gemini API key not configured. Please add your API key in Settings.');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${keys.gemini}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: 'Extract ALL text from this image. Return only the extracted text, preserving the original formatting and layout as much as possible. Do not add any commentary or explanations.'
            },
            {
              inline_data: {
                mime_type: 'image/png',
                data: imageBase64.replace(/^data:image\/\w+;base64,/, '')
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 4096
        }
      })
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('No text could be extracted from the image.');
  }

  return text;
}

// Claude API (Anthropic)
export async function extractWithClaude(imageBase64) {
  const keys = await getApiKeys();
  if (!keys.claude) {
    throw new Error('Claude API key not configured. Please add your API key in Settings.');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': keys.claude,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/png',
              data: imageBase64.replace(/^data:image\/\w+;base64,/, '')
            }
          },
          {
            type: 'text',
            text: 'Extract ALL text from this image. Return only the extracted text, preserving the original formatting and layout as much as possible. Do not add any commentary or explanations.'
          }
        ]
      }]
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `Claude API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text;

  if (!text) {
    throw new Error('No text could be extracted from the image.');
  }

  return text;
}

// GPT-4o API (OpenAI)
export async function extractWithGPT5(imageBase64) {
  const keys = await getApiKeys();
  if (!keys.gpt5) {
    throw new Error('OpenAI API key not configured. Please add your API key in Settings.');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${keys.gpt5}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Extract ALL text from this image. Return only the extracted text, preserving the original formatting and layout as much as possible. Do not add any commentary or explanations.'
          },
          {
            type: 'image_url',
            image_url: {
              url: imageBase64.startsWith('data:')
                ? imageBase64
                : `data:image/png;base64,${imageBase64}`
            }
          }
        ]
      }]
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error('No text could be extracted from the image.');
  }

  return text;
}

// Imagenary API (uses your imagenary.ai account credits — no API key needed)
export async function extractWithImagenary(imageBase64) {
  // Convert base64 data URL to a Blob for FormData
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
  const byteChars = atob(base64Data);
  const byteArray = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteArray[i] = byteChars.charCodeAt(i);
  }
  const blob = new Blob([byteArray], { type: 'image/png' });

  // Check for stored access token (from ext-auth sign-in flow)
  const accessToken = await getImagenaryAccessToken();

  if (accessToken) {
    // Authenticated path — full credits, smart model
    const formData = new FormData();
    formData.append('file', blob, 'screenshot.png');
    formData.append('model', 'smart');

    const response = await fetch('https://www.imagenary.ai/api/ext/extract', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      if (response.status === 401) {
        // Token expired — fall through to anonymous path
      } else if (response.status === 402) {
        throw new Error('Imagenary credits exhausted. Visit imagenary.ai/pricing to top up.');
      } else {
        throw new Error(error.error || `Imagenary API error: ${response.status}`);
      }
    } else {
      const data = await response.json();

      // Store server-reported remaining count
      if (typeof data.remaining === 'number') {
        await chrome.storage.local.set({ freeRemaining: data.remaining });
      }

      return data.result;
    }
  }

  // Anonymous path — no login required, limited to 10 lifetime extractions
  const installId = await getInstallId();
  const formData = new FormData();
  formData.append('file', blob, 'screenshot.png');
  formData.append('installId', installId);

  const response = await fetch('https://www.imagenary.ai/api/ext/extract-free', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    if (response.status === 429) {
      throw new Error(error.error || 'Free extractions used up. Sign in to Imagenary AI for more, or add your own API key in Settings.');
    }
    throw new Error(error.error || `Imagenary API error: ${response.status}`);
  }

  const data = await response.json();

  // Store server-reported remaining count locally
  if (typeof data.remaining === 'number') {
    await chrome.storage.local.set({ freeRemaining: data.remaining });
  }

  return data.result;
}

// Get the stored Imagenary access token (saved when user signs in via ext-auth page)
async function getImagenaryAccessToken() {
  try {
    const data = await chrome.storage.local.get('imagenaryToken');
    const token = data.imagenaryToken;
    if (!token || !token.access_token) return null;

    // Check if token has expired (Supabase tokens last ~1 hour)
    if (token.expires_at && token.expires_at * 1000 < Date.now()) {
      return null; // Expired — user needs to sign in again
    }

    return token.access_token;
  } catch {
    return null;
  }
}

// Main extraction function that routes to the selected provider
export async function extractText(imageBase64, provider = 'imagenary') {
  switch (provider) {
    case 'imagenary':
      return await extractWithImagenary(imageBase64);
    case 'gemini':
      return await extractWithGemini(imageBase64);
    case 'claude':
      return await extractWithClaude(imageBase64);
    case 'gpt5':
      return await extractWithGPT5(imageBase64);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

// Map extracted text to form fields using AI
export async function mapTextToFormFields(extractedText, formFields, provider = 'imagenary') {
  const fieldDescriptions = formFields.map(f =>
    `[${f.index}] ${f.description}`
  ).join('\n');

  const prompt = `You are a form-filling assistant. Given extracted text from a document/screenshot and a list of form fields on a webpage, map the relevant data to the correct fields.

EXTRACTED TEXT:
${extractedText}

FORM FIELDS:
${fieldDescriptions}

Return ONLY a JSON object mapping field index numbers to values. Example: {"0": "John", "1": "Smith", "3": "john@email.com"}

Rules:
- Only include fields where you have a clear match from the extracted text.
- Use the field index number as the key.
- For date fields, use the format the field expects (check the type).
- For select fields, use one of the available option values.
- Do not guess or fabricate data. Only map data that is clearly present in the extracted text.
- Return ONLY valid JSON, no explanation.`;

  let response;

  if (provider === 'imagenary') {
    // Use Gemini via Imagenary's backend would be ideal, but for now use Gemini directly if key available
    // Fall through to try available providers
    const keys = await getApiKeys();
    if (keys.gemini) {
      provider = 'gemini';
    } else if (keys.gpt5) {
      provider = 'gpt5';
    } else if (keys.claude) {
      provider = 'claude';
    } else {
      // Use Imagenary API for form mapping
      return await mapTextViaImagenary(extractedText, formFields);
    }
  }

  const keys = await getApiKeys();

  if (provider === 'gemini') {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${keys.gemini}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 2048 }
        })
      }
    );
    const data = await resp.json();
    response = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } else if (provider === 'gpt5') {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${keys.gpt5}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
      })
    });
    const data = await resp.json();
    response = data.choices?.[0]?.message?.content || '';
  } else if (provider === 'claude') {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': keys.claude,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await resp.json();
    response = data.content?.[0]?.text || '';
  }

  // Parse JSON from response (strip markdown code fences if present)
  const jsonMatch = response.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(jsonMatch);
  } catch {
    throw new Error('AI returned invalid mapping. Try again.');
  }
}

// Map text to form fields via Imagenary API (no API key needed)
async function mapTextViaImagenary(extractedText, formFields) {
  const accessToken = await getImagenaryAccessToken();
  const installId = await getInstallId();

  const body = JSON.stringify({
    text: extractedText,
    fields: formFields.map(f => ({ index: f.index, description: f.description, type: f.type, options: f.options })),
    installId: accessToken ? undefined : installId,
  });

  const headers = { 'Content-Type': 'application/json' };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  const resp = await fetch('https://www.imagenary.ai/api/ext/form-map', {
    method: 'POST',
    headers,
    body,
  });

  if (!resp.ok) {
    throw new Error('Form mapping failed. Try using your own API key in Settings.');
  }

  const data = await resp.json();
  return data.mappings;
}

// Test API connection
export async function testApiConnection(provider) {
  const keys = await getApiKeys();
  const key = keys[provider];

  if (!key) {
    return { success: false, error: 'API key not configured' };
  }

  try {
    switch (provider) {
      case 'gemini':
        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
        );
        if (!geminiResponse.ok) throw new Error('Invalid API key');
        return { success: true };

      case 'claude':
        // Claude doesn't have a simple test endpoint, so we just validate key format
        if (!key.startsWith('sk-ant-')) {
          return { success: false, error: 'Invalid API key format' };
        }
        return { success: true, message: 'Key format valid (connection test skipped)' };

      case 'gpt5':
        const openaiResponse = await fetch('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${key}` }
        });
        if (!openaiResponse.ok) throw new Error('Invalid API key');
        return { success: true };

      default:
        return { success: false, error: 'Unknown provider' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}
