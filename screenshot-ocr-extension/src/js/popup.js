// Popup script for Screenshot OCR extension

import {
  initializeStorage,
  getRemainingExtractions,
  getSubscription,
  isApiKeyConfigured,
  getHistory,
  getSettings
} from './storage.js';

// DOM Elements
const usageBadge = document.getElementById('usageBadge');
const usageCount = document.getElementById('usageCount');
const captureBtn = document.getElementById('captureBtn');
const apiProviders = document.querySelectorAll('input[name="apiProvider"]');
const resultSection = document.getElementById('resultSection');
const extractedText = document.getElementById('extractedText');
const copyBtn = document.getElementById('copyBtn');
const loadingSection = document.getElementById('loadingSection');
const errorSection = document.getElementById('errorSection');
const errorMessage = document.getElementById('errorMessage');
const retryBtn = document.getElementById('retryBtn');
const settingsLink = document.getElementById('settingsLink');
const upgradeLink = document.getElementById('upgradeLink');
const historyLink = document.getElementById('historyLink');
const upgradeModal = document.getElementById('upgradeModal');
const closeModal = document.getElementById('closeModal');
const buyPackBtn = document.getElementById('buyPackBtn');
const historyModal = document.getElementById('historyModal');
const closeHistoryModal = document.getElementById('closeHistoryModal');
const historyList = document.getElementById('historyList');

// API status elements
const imagenaryStatus = document.getElementById('imagenaryStatus');
const geminiStatus = document.getElementById('geminiStatus');
const claudeStatus = document.getElementById('claudeStatus');
const gpt5Status = document.getElementById('gpt5Status');

// State
let selectedProvider = 'imagenary';
let lastImageData = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await initializeStorage();
  await updateUI();
  setupEventListeners();
});

// Update UI with current state
async function updateUI() {
  // Update usage display
  const remaining = await getRemainingExtractions();
  const subscription = await getSubscription();

  if (remaining === Infinity) {
    usageCount.textContent = '∞';
    usageBadge.classList.add('unlimited');
    usageBadge.classList.remove('low', 'empty');
  } else {
    usageCount.textContent = remaining;
    usageBadge.classList.remove('unlimited');

    if (remaining === 0) {
      usageBadge.classList.add('empty');
      usageBadge.classList.remove('low');
    } else if (remaining <= 3) {
      usageBadge.classList.add('low');
      usageBadge.classList.remove('empty');
    } else {
      usageBadge.classList.remove('low', 'empty');
    }
  }

  // Update API status indicators
  await updateApiStatus('imagenary', imagenaryStatus);
  await updateApiStatus('gemini', geminiStatus);
  await updateApiStatus('claude', claudeStatus);
  await updateApiStatus('gpt5', gpt5Status);

  // Load default provider from settings
  const settings = await getSettings();
  if (settings.defaultProvider) {
    selectedProvider = settings.defaultProvider;
    const radio = document.querySelector(`input[value="${selectedProvider}"]`);
    if (radio) radio.checked = true;
  }
}

// Update API status indicator
async function updateApiStatus(provider, element) {
  const configured = await isApiKeyConfigured(provider);
  element.textContent = configured ? 'Ready' : 'Not set';
  element.className = `api-status ${configured ? 'configured' : 'not-configured'}`;
}

// Setup event listeners
function setupEventListeners() {
  // Capture button
  captureBtn.addEventListener('click', handleCapture);

  // API provider selection
  apiProviders.forEach(radio => {
    radio.addEventListener('change', (e) => {
      selectedProvider = e.target.value;
    });
  });

  // Copy button
  copyBtn.addEventListener('click', copyToClipboard);

  // Retry button
  retryBtn.addEventListener('click', () => {
    hideError();
    if (lastImageData) {
      processImage(lastImageData);
    } else {
      handleCapture();
    }
  });

  // Settings link
  settingsLink.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });

  // Upgrade link
  upgradeLink.addEventListener('click', (e) => {
    e.preventDefault();
    showUpgradeModal();
  });

  // History link
  historyLink.addEventListener('click', async (e) => {
    e.preventDefault();
    await showHistoryModal();
  });

  // Modal close buttons
  closeModal.addEventListener('click', hideUpgradeModal);
  closeHistoryModal.addEventListener('click', hideHistoryModal);

  // Click outside modal to close
  upgradeModal.addEventListener('click', (e) => {
    if (e.target === upgradeModal) hideUpgradeModal();
  });
  historyModal.addEventListener('click', (e) => {
    if (e.target === historyModal) hideHistoryModal();
  });

  // Purchase button
  buyPackBtn.addEventListener('click', handleBuyPack);
}

// Handle screenshot capture
async function handleCapture() {
  const remaining = await getRemainingExtractions();

  if (remaining === 0) {
    showUpgradeModal();
    return;
  }

  const configured = await isApiKeyConfigured(selectedProvider);
  if (!configured) {
    showError(`${getProviderName(selectedProvider)} API key not configured. Click Settings to add it.`);
    return;
  }

  showLoading();
  hideResult();
  hideError();

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'captureScreenshot',
      provider: selectedProvider
    });

    if (response.error) {
      if (response.upgradeRequired) {
        showUpgradeModal();
      } else {
        showError(response.error);
      }
      return;
    }

    lastImageData = response.imageData;
    showResult(response.text);
    await updateUI();
  } catch (error) {
    showError(error.message || 'Failed to capture screenshot');
  } finally {
    hideLoading();
  }
}

// Process existing image
async function processImage(imageData) {
  showLoading();
  hideResult();
  hideError();

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'extractFromImage',
      imageData,
      provider: selectedProvider
    });

    if (response.error) {
      if (response.upgradeRequired) {
        showUpgradeModal();
      } else {
        showError(response.error);
      }
      return;
    }

    showResult(response.text);
    await updateUI();
  } catch (error) {
    showError(error.message || 'Failed to extract text');
  } finally {
    hideLoading();
  }
}

// Copy text to clipboard
async function copyToClipboard() {
  const text = extractedText.value;
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!');
  } catch (error) {
    // Fallback for older browsers
    extractedText.select();
    document.execCommand('copy');
    showToast('Copied to clipboard!');
  }
}

// Show/hide UI sections
function showLoading() {
  loadingSection.style.display = 'flex';
  captureBtn.disabled = true;
}

function hideLoading() {
  loadingSection.style.display = 'none';
  captureBtn.disabled = false;
}

function showResult(text) {
  resultSection.style.display = 'block';
  extractedText.value = text;
}

function hideResult() {
  resultSection.style.display = 'none';
  extractedText.value = '';
}

function showError(message) {
  errorSection.style.display = 'block';
  errorMessage.textContent = message;
}

function hideError() {
  errorSection.style.display = 'none';
}

// Modal functions
function showUpgradeModal() {
  upgradeModal.style.display = 'flex';
}

function hideUpgradeModal() {
  upgradeModal.style.display = 'none';
}

async function showHistoryModal() {
  const history = await getHistory();
  renderHistory(history);
  historyModal.style.display = 'flex';
}

function hideHistoryModal() {
  historyModal.style.display = 'none';
}

// Render history items
function renderHistory(history) {
  if (history.length === 0) {
    historyList.innerHTML = '<p class="empty-state">No extractions yet. Capture a screenshot to get started!</p>';
    return;
  }

  historyList.innerHTML = history.map(item => `
    <div class="history-item" data-id="${item.id}">
      <div class="history-meta">
        <span>${getProviderName(item.provider)}</span>
        <span>${formatDate(item.timestamp)}</span>
      </div>
      <div class="history-text">${escapeHtml(item.text)}</div>
    </div>
  `).join('');

  // Add click handlers to copy text
  historyList.querySelectorAll('.history-item').forEach(item => {
    item.addEventListener('click', () => {
      const text = item.querySelector('.history-text').textContent;
      navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard!');
      });
    });
  });
}

// Payment handlers — open imagenary.ai pricing page
async function handleBuyPack() {
  chrome.tabs.create({ url: 'https://www.imagenary.ai/pricing' });
  hideUpgradeModal();
}


// Utility functions
function getProviderName(provider) {
  const names = {
    imagenary: 'Imagenary.ai',
    gemini: 'Gemini Flash 2.0',
    claude: 'Claude',
    gpt5: 'GPT-4o'
  };
  return names[provider] || provider;
}

function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showToast(message) {
  // Remove existing toast
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  // Create new toast
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  // Remove after delay
  setTimeout(() => toast.remove(), 2000);
}
