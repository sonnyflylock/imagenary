// Storage module for managing user data, usage limits, and history

const STORAGE_KEYS = {
  API_KEYS: 'apiKeys',
  USAGE: 'usage',
  SUBSCRIPTION: 'subscription',
  HISTORY: 'history',
  SETTINGS: 'settings'
};

const DEFAULT_FREE_EXTRACTIONS = 10;
const PACK_EXTRACTIONS = 50;

// Initialize storage with defaults
export async function initializeStorage() {
  const data = await chrome.storage.local.get(null);

  if (!data[STORAGE_KEYS.USAGE]) {
    await chrome.storage.local.set({
      [STORAGE_KEYS.USAGE]: {
        freeRemaining: DEFAULT_FREE_EXTRACTIONS,
        paidRemaining: 0,
        totalUsed: 0
      }
    });
  }

  if (!data[STORAGE_KEYS.API_KEYS]) {
    await chrome.storage.local.set({
      [STORAGE_KEYS.API_KEYS]: {
        gemini: '',
        claude: '',
        gpt5: ''
      }
    });
  }

  if (!data[STORAGE_KEYS.SUBSCRIPTION]) {
    await chrome.storage.local.set({
      [STORAGE_KEYS.SUBSCRIPTION]: {
        type: 'free', // 'free', 'pack', 'unlimited'
        expiresAt: null,
        purchaseDate: null
      }
    });
  }

  if (!data[STORAGE_KEYS.HISTORY]) {
    await chrome.storage.local.set({
      [STORAGE_KEYS.HISTORY]: []
    });
  }

  if (!data[STORAGE_KEYS.SETTINGS]) {
    await chrome.storage.local.set({
      [STORAGE_KEYS.SETTINGS]: {
        defaultProvider: 'gemini',
        autoClipboard: true,
        saveHistory: true
      }
    });
  }
}

// API Keys management
export async function getApiKeys() {
  const data = await chrome.storage.local.get(STORAGE_KEYS.API_KEYS);
  return data[STORAGE_KEYS.API_KEYS] || {};
}

export async function setApiKey(provider, key) {
  const keys = await getApiKeys();
  keys[provider] = key;
  await chrome.storage.local.set({ [STORAGE_KEYS.API_KEYS]: keys });
}

export async function isApiKeyConfigured(provider) {
  const keys = await getApiKeys();
  return !!(keys[provider] && keys[provider].trim());
}

// Usage management
export async function getUsage() {
  const data = await chrome.storage.local.get(STORAGE_KEYS.USAGE);
  return data[STORAGE_KEYS.USAGE];
}

export async function getRemainingExtractions() {
  const usage = await getUsage();
  const subscription = await getSubscription();

  if (subscription.type === 'unlimited') {
    const now = new Date().getTime();
    if (!subscription.expiresAt || now < subscription.expiresAt) {
      return Infinity;
    }
  }

  return usage.freeRemaining + usage.paidRemaining;
}

export async function decrementUsage() {
  const usage = await getUsage();
  const subscription = await getSubscription();

  // Check unlimited subscription
  if (subscription.type === 'unlimited') {
    const now = new Date().getTime();
    if (!subscription.expiresAt || now < subscription.expiresAt) {
      usage.totalUsed++;
      await chrome.storage.local.set({ [STORAGE_KEYS.USAGE]: usage });
      return true;
    }
  }

  // Use free extractions first
  if (usage.freeRemaining > 0) {
    usage.freeRemaining--;
    usage.totalUsed++;
    await chrome.storage.local.set({ [STORAGE_KEYS.USAGE]: usage });
    return true;
  }

  // Then use paid extractions
  if (usage.paidRemaining > 0) {
    usage.paidRemaining--;
    usage.totalUsed++;
    await chrome.storage.local.set({ [STORAGE_KEYS.USAGE]: usage });
    return true;
  }

  return false; // No extractions remaining
}

export async function canExtract() {
  const remaining = await getRemainingExtractions();
  return remaining > 0;
}

// Subscription management
export async function getSubscription() {
  const data = await chrome.storage.local.get(STORAGE_KEYS.SUBSCRIPTION);
  return data[STORAGE_KEYS.SUBSCRIPTION];
}

export async function purchasePack() {
  const usage = await getUsage();
  usage.paidRemaining += PACK_EXTRACTIONS;

  await chrome.storage.local.set({
    [STORAGE_KEYS.USAGE]: usage,
    [STORAGE_KEYS.SUBSCRIPTION]: {
      type: 'pack',
      expiresAt: null,
      purchaseDate: new Date().toISOString()
    }
  });
}

export async function activateUnlimitedSubscription() {
  // Set expiration to 30 days from now
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await chrome.storage.local.set({
    [STORAGE_KEYS.SUBSCRIPTION]: {
      type: 'unlimited',
      expiresAt: expiresAt.getTime(),
      purchaseDate: new Date().toISOString()
    }
  });
}

// History management
export async function getHistory() {
  const data = await chrome.storage.local.get(STORAGE_KEYS.HISTORY);
  return data[STORAGE_KEYS.HISTORY] || [];
}

export async function addToHistory(entry) {
  const settings = await getSettings();
  if (!settings.saveHistory) return;

  const history = await getHistory();
  history.unshift({
    id: Date.now(),
    timestamp: new Date().toISOString(),
    provider: entry.provider,
    text: entry.text,
    imagePreview: entry.imagePreview // Small base64 thumbnail
  });

  // Keep only last 100 entries
  if (history.length > 100) {
    history.pop();
  }

  await chrome.storage.local.set({ [STORAGE_KEYS.HISTORY]: history });
}

export async function clearHistory() {
  await chrome.storage.local.set({ [STORAGE_KEYS.HISTORY]: [] });
}

export async function deleteHistoryItem(id) {
  const history = await getHistory();
  const filtered = history.filter(item => item.id !== id);
  await chrome.storage.local.set({ [STORAGE_KEYS.HISTORY]: filtered });
}

// Settings management
export async function getSettings() {
  const data = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
  return data[STORAGE_KEYS.SETTINGS];
}

export async function updateSettings(newSettings) {
  const settings = await getSettings();
  Object.assign(settings, newSettings);
  await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: settings });
}

// Export for testing/debugging
export async function exportAllData() {
  return await chrome.storage.local.get(null);
}

export async function resetAllData() {
  await chrome.storage.local.clear();
  await initializeStorage();
}
