// Options page script for Screenshot OCR extension

import {
  initializeStorage,
  getApiKeys,
  setApiKey,
  isApiKeyConfigured,
  getSettings,
  updateSettings,
  getRemainingExtractions,
  getUsage,
  getSubscription,
  clearHistory,
  exportAllData,
  resetAllData
} from './storage.js';
import { testApiConnection } from './api.js';

// DOM Elements
const geminiKey = document.getElementById('geminiKey');
const claudeKey = document.getElementById('claudeKey');
const gpt5Key = document.getElementById('gpt5Key');
const geminiIndicator = document.getElementById('geminiIndicator');
const claudeIndicator = document.getElementById('claudeIndicator');
const gpt5Indicator = document.getElementById('gpt5Indicator');
const defaultProvider = document.getElementById('defaultProvider');
const autoClipboard = document.getElementById('autoClipboard');
const saveHistory = document.getElementById('saveHistory');
const remainingCount = document.getElementById('remainingCount');
const totalUsed = document.getElementById('totalUsed');
const planType = document.getElementById('planType');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const exportDataBtn = document.getElementById('exportDataBtn');
const resetAllBtn = document.getElementById('resetAllBtn');
const toast = document.getElementById('toast');

// Debounce timer for auto-save
let saveTimer = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await initializeStorage();
  await loadSettings();
  setupEventListeners();
});

// Load all settings
async function loadSettings() {
  // Load API keys
  const keys = await getApiKeys();
  geminiKey.value = keys.gemini || '';
  claudeKey.value = keys.claude || '';
  gpt5Key.value = keys.gpt5 || '';

  // Update status indicators
  await updateStatusIndicators();

  // Load preferences
  const settings = await getSettings();
  defaultProvider.value = settings.defaultProvider || 'gemini';
  autoClipboard.checked = settings.autoClipboard !== false;
  saveHistory.checked = settings.saveHistory !== false;

  // Load usage stats
  await updateUsageStats();
}

// Update API status indicators
async function updateStatusIndicators() {
  const providers = [
    { key: 'gemini', indicator: geminiIndicator },
    { key: 'claude', indicator: claudeIndicator },
    { key: 'gpt5', indicator: gpt5Indicator }
  ];

  for (const { key, indicator } of providers) {
    const configured = await isApiKeyConfigured(key);
    indicator.textContent = configured ? 'Configured' : 'Not set';
    indicator.className = `status-indicator ${configured ? 'configured' : 'not-configured'}`;
  }
}

// Update usage statistics
async function updateUsageStats() {
  const remaining = await getRemainingExtractions();
  const usage = await getUsage();
  const subscription = await getSubscription();

  // Remaining extractions
  if (remaining === Infinity) {
    remainingCount.textContent = '∞';
  } else {
    remainingCount.textContent = remaining;
  }

  // Total used
  totalUsed.textContent = usage.totalUsed;

  // Plan type
  const planNames = {
    free: 'Free',
    pack: 'Pay As You Go',
    unlimited: 'Unlimited'
  };
  planType.textContent = planNames[subscription.type] || 'Free';
}

// Setup event listeners
function setupEventListeners() {
  // API key inputs - auto-save with debounce
  geminiKey.addEventListener('input', () => debouncedSaveApiKey('gemini', geminiKey.value));
  claudeKey.addEventListener('input', () => debouncedSaveApiKey('claude', claudeKey.value));
  gpt5Key.addEventListener('input', () => debouncedSaveApiKey('gpt5', gpt5Key.value));

  // Toggle visibility buttons
  document.querySelectorAll('.btn-toggle-visibility').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const input = document.getElementById(targetId);
      input.type = input.type === 'password' ? 'text' : 'password';
    });
  });

  // Preferences - auto-save
  defaultProvider.addEventListener('change', savePreferences);
  autoClipboard.addEventListener('change', savePreferences);
  saveHistory.addEventListener('change', savePreferences);

  // Data management buttons
  clearHistoryBtn.addEventListener('click', handleClearHistory);
  exportDataBtn.addEventListener('click', handleExportData);
  resetAllBtn.addEventListener('click', handleResetAll);
}

// Debounced API key save
function debouncedSaveApiKey(provider, value) {
  if (saveTimer) clearTimeout(saveTimer);

  saveTimer = setTimeout(async () => {
    await setApiKey(provider, value.trim());
    await updateStatusIndicators();
    showToast('API key saved', 'success');
  }, 500);
}

// Save preferences
async function savePreferences() {
  await updateSettings({
    defaultProvider: defaultProvider.value,
    autoClipboard: autoClipboard.checked,
    saveHistory: saveHistory.checked
  });
  showToast('Preferences saved', 'success');
}

// Clear history handler
async function handleClearHistory() {
  if (confirm('Are you sure you want to clear all extraction history? This cannot be undone.')) {
    await clearHistory();
    showToast('History cleared', 'success');
  }
}

// Export data handler
async function handleExportData() {
  const data = await exportAllData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `screenshot-ocr-data-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('Data exported', 'success');
}

// Reset all data handler
async function handleResetAll() {
  if (confirm('Are you sure you want to reset ALL data? This will delete your API keys, history, and reset your usage. This cannot be undone.')) {
    if (confirm('This is your last chance to cancel. Continue with reset?')) {
      await resetAllData();
      await loadSettings();
      showToast('All data has been reset', 'success');
    }
  }
}

// Show toast notification
function showToast(message, type = '') {
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.style.display = 'block';

  setTimeout(() => {
    toast.style.display = 'none';
  }, 3000);
}
