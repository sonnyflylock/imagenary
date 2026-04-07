// Background service worker for handling screenshot capture and commands

import { initializeStorage, canExtract, decrementUsage, addToHistory, getSettings } from './storage.js';
import { extractText } from './api.js';

// Initialize storage on install
chrome.runtime.onInstalled.addListener(async () => {
  await initializeStorage();
  console.log('Screenshot OCR extension installed');
});

// Handle keyboard shortcut command
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'capture-screenshot') {
    await captureAndProcess();
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'captureScreenshot') {
    handleCapture(message.provider)
      .then(sendResponse)
      .catch(error => sendResponse({ error: error.message }));
    return true; // Keep message channel open for async response
  }

  if (message.action === 'extractFromImage') {
    handleExtraction(message.imageData, message.provider)
      .then(sendResponse)
      .catch(error => sendResponse({ error: error.message }));
    return true;
  }
});

// Capture screenshot from current tab
async function captureScreenshot() {
  return new Promise((resolve, reject) => {
    chrome.tabs.captureVisibleTab(null, {
      format: 'png',
      quality: 100
    }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else if (!dataUrl) {
        reject(new Error('Failed to capture screenshot'));
      } else {
        resolve(dataUrl);
      }
    });
  });
}

// Handle capture request
async function handleCapture(provider = 'gemini') {
  try {
    // Check if user can extract
    const canProceed = await canExtract();
    if (!canProceed) {
      return {
        error: 'No extractions remaining. Please upgrade your plan.',
        upgradeRequired: true
      };
    }

    // Capture screenshot
    const imageData = await captureScreenshot();

    // Extract text
    const text = await extractText(imageData, provider);

    // Decrement usage
    await decrementUsage();

    // Add to history
    await addToHistory({
      provider,
      text,
      imagePreview: await createThumbnail(imageData)
    });

    // Auto copy to clipboard if enabled
    const settings = await getSettings();
    if (settings.autoClipboard) {
      // Note: Clipboard write requires user gesture in MV3
      // This will be handled in the popup
    }

    return { success: true, text, imageData };
  } catch (error) {
    console.error('Capture error:', error);
    return { error: error.message };
  }
}

// Handle extraction from existing image data
async function handleExtraction(imageData, provider) {
  try {
    // Check if user can extract
    const canProceed = await canExtract();
    if (!canProceed) {
      return {
        error: 'No extractions remaining. Please upgrade your plan.',
        upgradeRequired: true
      };
    }

    // Extract text
    const text = await extractText(imageData, provider);

    // Decrement usage
    await decrementUsage();

    // Add to history
    await addToHistory({
      provider,
      text,
      imagePreview: await createThumbnail(imageData)
    });

    return { success: true, text };
  } catch (error) {
    console.error('Extraction error:', error);
    return { error: error.message };
  }
}

// Create thumbnail for history
async function createThumbnail(imageData) {
  // For simplicity, just store the first portion of the base64
  // In a production app, you'd resize the image
  const base64 = imageData.replace(/^data:image\/\w+;base64,/, '');
  return base64.substring(0, 1000) + '...'; // Truncated preview
}

// Capture and process with default settings (for keyboard shortcut)
async function captureAndProcess() {
  const settings = await getSettings();
  const result = await handleCapture(settings.defaultProvider);

  if (result.success) {
    // Show notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: '../icons/icon128.png',
      title: 'Text Extracted!',
      message: `${result.text.substring(0, 100)}${result.text.length > 100 ? '...' : ''}`
    });
  } else if (result.error) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: '../icons/icon128.png',
      title: 'Extraction Failed',
      message: result.error
    });
  }
}
