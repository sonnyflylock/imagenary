// Background service worker for handling screenshot capture and commands

import { initializeStorage, canExtract, decrementUsage, addToHistory, getSettings } from './storage.js';
import { extractText } from './api.js';

// Pending region selection state
let pendingSelection = null;

// ── Setup ──────────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(async () => {
  await initializeStorage();

  // Reset default provider to imagenary (fixes stale settings from dev)
  await chrome.storage.local.set({
    settings: {
      defaultProvider: 'imagenary',
      autoClipboard: true,
      saveHistory: true,
    },
  });

  // Context menu on extension icon (right-click)
  chrome.contextMenus.create({
    id: 'full-screen',
    title: 'Full Screen Capture',
    contexts: ['action'],
  });
  chrome.contextMenus.create({
    id: 'settings',
    title: 'Settings',
    contexts: ['action'],
  });
});

// ── Icon Click → Selection Overlay ─────────────────────────────────

chrome.action.onClicked.addListener(async (tab) => {
  console.log('Icon clicked, tab:', tab?.id, tab?.url);
  if (!tab?.id) return;

  const settings = await getSettings();
  const provider = settings.defaultProvider || 'imagenary';
  console.log('Provider:', provider, 'Starting selection...');
  pendingSelection = { tabId: tab.id, provider };

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['src/js/content-select.js'],
    });
  } catch (err) {
    console.error('Failed to inject selection overlay:', err);
    pendingSelection = null;
    chrome.notifications.create({
      type: 'basic',
      iconUrl: '/icons/icon128.png',
      title: 'ScreenScribe',
      message: 'Extensions cannot capture Chrome internal pages. Try on a regular website.',
    });
  }
});

// ── Context Menu ───────────────────────────────────────────────────

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'full-screen') {
    await handleFullScreenCapture(tab);
  }
  if (info.menuItemId === 'settings') {
    chrome.runtime.openOptionsPage();
  }
});

async function handleFullScreenCapture(tab) {
  // Show spinner toast immediately
  if (tab?.id) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['src/js/content-toast.js'],
      });
    } catch { /* page may block injection */ }
  }

  try {
    const remaining = await checkFreeUsage();
    if (remaining <= 0) {
      if (tab?.id) {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            action: 'toast-result',
            error: 'Free extractions used up. Sign in or visit imagenary.ai for more.',
            exhausted: true,
          });
        } catch {}
      }
      return;
    }

    const settings = await getSettings();
    const provider = settings.defaultProvider || 'imagenary';

    const imageData = await captureScreenshot();
    const text = await extractText(imageData, provider);

    if (provider !== 'imagenary') {
      await decrementUsage();
    }

    await addToHistory({
      provider,
      text,
      imagePreview: imageData.substring(0, 1000) + '...',
    });

    await copyToClipboard(text);

    // Server updates freeRemaining in storage via api.js; read it
    const newRemaining = await getRemaining();

    if (tab?.id) {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          action: 'toast-result',
          text,
          remaining: newRemaining,
        });
      } catch { /* toast may have been removed */ }
    }
  } catch (err) {
    console.error('Full screen capture error:', err);
    if (tab?.id) {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          action: 'toast-result',
          error: err.message || 'Extraction failed',
        });
      } catch { /* toast may have been removed */ }
    }
  }
}

// ── Keyboard Shortcut ──────────────────────────────────────────────

chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'capture-screenshot') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    const settings = await getSettings();
    const provider = settings.defaultProvider || 'imagenary';
    pendingSelection = { tabId: tab.id, provider };

    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['src/js/content-select.js'],
      });
    } catch (err) {
      console.error('Shortcut capture error:', err);
      pendingSelection = null;
    }
  }
});

// ── Message Listener ───────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Region selected (from content-select.js)
  if (message.action === 'regionSelected') {
    handleRegionCapture(message.rect, sender.tab?.id);
    sendResponse({ ok: true });
    return false;
  }

  // Region cancelled
  if (message.action === 'regionCancelled') {
    pendingSelection = null;
    sendResponse({ ok: true });
    return false;
  }

  // Open settings from upsell modal
  if (message.action === 'openSettings') {
    chrome.runtime.openOptionsPage();
    sendResponse({ ok: true });
    return false;
  }

  // Token received from content script on imagenary.ai/ext-auth
  if (message.action === 'saveToken') {
    chrome.storage.local.set({
      imagenaryToken: {
        access_token: message.access_token,
        refresh_token: message.refresh_token,
        email: message.email,
        expires_at: message.expires_at,
        saved_at: Date.now(),
      },
    });
    sendResponse({ success: true });
    return false;
  }
});

// ── Region Capture ─────────────────────────────────────────────────

async function handleRegionCapture(rect, tabId) {
  if (!pendingSelection) return;
  const { provider } = pendingSelection;
  pendingSelection = null;

  // Show spinner toast immediately
  if (tabId) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['src/js/content-toast.js'],
      });
    } catch { /* page may block injection */ }
  }

  try {
    // Check free usage
    const remaining = await checkFreeUsage();
    if (remaining <= 0) {
      if (tabId) {
        try {
          await chrome.tabs.sendMessage(tabId, {
            action: 'toast-result',
            error: 'Free extractions used up. Sign in or visit imagenary.ai for more.',
            exhausted: true,
          });
        } catch {}
      }
      return;
    }

    // Capture the full visible tab (overlay already removed)
    const fullImage = await captureScreenshot();

    // Crop to selected region
    const croppedImage = await cropImage(fullImage, rect);

    // Extract text
    const text = await extractText(croppedImage, provider);

    if (provider !== 'imagenary') {
      await decrementUsage();
    }

    await addToHistory({
      provider,
      text,
      imagePreview: croppedImage.substring(0, 1000) + '...',
    });

    await copyToClipboard(text);

    // Server updates freeRemaining in storage via api.js; read it
    const newRemaining = await getRemaining();

    // Send result to toast with remaining count
    if (tabId) {
      try {
        await chrome.tabs.sendMessage(tabId, {
          action: 'toast-result',
          text,
          remaining: newRemaining,
        });
      } catch { /* toast may have been removed */ }
    }
  } catch (err) {
    console.error('Region capture error:', err);
    if (tabId) {
      try {
        await chrome.tabs.sendMessage(tabId, {
          action: 'toast-result',
          error: err.message || 'Extraction failed',
        });
      } catch { /* toast may have been removed */ }
    }
  }
}

// ── Utilities ──────────────────────────────────────────────────────

async function captureScreenshot() {
  return new Promise((resolve, reject) => {
    chrome.tabs.captureVisibleTab(null, { format: 'png', quality: 100 }, (dataUrl) => {
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

async function cropImage(dataUrl, rect) {
  const resp = await fetch(dataUrl);
  const blob = await resp.blob();
  const bitmap = await createImageBitmap(blob, rect.x, rect.y, rect.w, rect.h);

  const canvas = new OffscreenCanvas(rect.w, rect.h);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  const croppedBlob = await canvas.convertToBlob({ type: 'image/png' });
  const buffer = await croppedBlob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
  }
  return 'data:image/png;base64,' + btoa(binary);
}

async function copyToClipboard(text) {
  try {
    // Ensure offscreen document exists
    const existingContexts = await chrome.runtime.getContexts({
      contextTypes: ['OFFSCREEN_DOCUMENT'],
    });
    if (existingContexts.length === 0) {
      await chrome.offscreen.createDocument({
        url: 'src/offscreen.html',
        reasons: ['CLIPBOARD'],
        justification: 'Copy extracted text to clipboard',
      });
    }
    await chrome.runtime.sendMessage({ action: 'clipboard-write', text });
  } catch (err) {
    console.warn('Clipboard copy failed:', err);
  }
}

const FREE_LIMIT = 10;

async function checkFreeUsage() {
  // Signed-in users get unlimited
  const tokenData = await chrome.storage.local.get('imagenaryToken');
  if (tokenData.imagenaryToken?.access_token) return Infinity;

  // Use server-reported remaining if available, otherwise estimate from local
  const data = await chrome.storage.local.get('freeRemaining');
  if (typeof data.freeRemaining === 'number') return data.freeRemaining;

  // Fallback: no server data yet, assume full allowance
  return FREE_LIMIT;
}

async function getRemaining() {
  // Read the latest server-reported remaining count
  const data = await chrome.storage.local.get('freeRemaining');
  return typeof data.freeRemaining === 'number' ? data.freeRemaining : FREE_LIMIT;
}
