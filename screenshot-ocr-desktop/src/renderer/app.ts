// Renderer process for Screenshot OCR Desktop

// Type definitions for electron API
interface ElectronAPI {
  captureScreenshot: () => Promise<string | null>;
  extractText: (
    imageData: string,
    provider: string
  ) => Promise<{ success?: boolean; text?: string; error?: string; upgradeRequired?: boolean }>;
  getUsage: () => Promise<{
    freeRemaining: number;
    paidRemaining: number;
    totalUsed: number;
    subscription: { type: string; expiresAt: number | null };
    isUnlimited: boolean;
  }>;
  purchasePack: () => Promise<boolean>;
  activateSubscription: () => Promise<boolean>;
  getSettings: () => Promise<{
    defaultProvider: string;
    autoClipboard: boolean;
    saveHistory: boolean;
    startMinimized: boolean;
    shortcut: string;
  }>;
  setSettings: (settings: Record<string, unknown>) => Promise<boolean>;
  getApiKeys: () => Promise<{
    gemini: string;
    claude: string;
    gpt5: string;
    configured: { gemini: boolean; claude: boolean; gpt5: boolean };
  }>;
  setApiKey: (provider: string, key: string) => Promise<boolean>;
  testApiConnection: (provider: string) => Promise<{ success: boolean; error?: string }>;
  getHistory: () => Promise<
    Array<{ id: number; timestamp: string; provider: string; text: string }>
  >;
  clearHistory: () => Promise<boolean>;
  copyToClipboard: (text: string) => Promise<boolean>;
  minimizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
  openExternal: (url: string) => Promise<void>;
  onNavigate: (callback: (page: string) => void) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

// DOM Elements
const minimizeBtn = document.getElementById("minimizeBtn") as HTMLButtonElement;
const closeBtn = document.getElementById("closeBtn") as HTMLButtonElement;
const navBtns = document.querySelectorAll(".nav-btn") as NodeListOf<HTMLButtonElement>;
const pages = document.querySelectorAll(".page") as NodeListOf<HTMLDivElement>;
const usageCount = document.getElementById("usageCount") as HTMLSpanElement;
const captureBtn = document.getElementById("captureBtn") as HTMLButtonElement;
const shortcutKey = document.getElementById("shortcutKey") as HTMLElement;
const providerRadios = document.querySelectorAll(
  'input[name="provider"]'
) as NodeListOf<HTMLInputElement>;
const geminiStatus = document.getElementById("geminiStatus") as HTMLSpanElement;
const claudeStatus = document.getElementById("claudeStatus") as HTMLSpanElement;
const gpt5Status = document.getElementById("gpt5Status") as HTMLSpanElement;
const resultSection = document.getElementById("resultSection") as HTMLDivElement;
const resultText = document.getElementById("resultText") as HTMLTextAreaElement;
const copyBtn = document.getElementById("copyBtn") as HTMLButtonElement;
const loadingSection = document.getElementById("loadingSection") as HTMLDivElement;
const errorSection = document.getElementById("errorSection") as HTMLDivElement;
const errorMessage = document.getElementById("errorMessage") as HTMLParagraphElement;
const retryBtn = document.getElementById("retryBtn") as HTMLButtonElement;
const historyList = document.getElementById("historyList") as HTMLDivElement;
const clearHistoryBtn = document.getElementById("clearHistoryBtn") as HTMLButtonElement;
const geminiKey = document.getElementById("geminiKey") as HTMLInputElement;
const claudeKey = document.getElementById("claudeKey") as HTMLInputElement;
const gpt5Key = document.getElementById("gpt5Key") as HTMLInputElement;
const defaultProvider = document.getElementById("defaultProvider") as HTMLSelectElement;
const autoClipboard = document.getElementById("autoClipboard") as HTMLInputElement;
const saveHistory = document.getElementById("saveHistory") as HTMLInputElement;
const startMinimized = document.getElementById("startMinimized") as HTMLInputElement;
const totalUsed = document.getElementById("totalUsed") as HTMLSpanElement;
const planType = document.getElementById("planType") as HTMLSpanElement;
const buyPackBtn = document.getElementById("buyPackBtn") as HTMLButtonElement;
const subscribeBtn = document.getElementById("subscribeBtn") as HTMLButtonElement;
const toast = document.getElementById("toast") as HTMLDivElement;

// State
let selectedProvider = "gemini";
let lastImageData: string | null = null;

// Initialize
document.addEventListener("DOMContentLoaded", async () => {
  await loadSettings();
  await updateUsage();
  await updateProviderStatus();
  await loadHistory();
  setupEventListeners();
});

// Load settings
async function loadSettings() {
  const settings = await window.electronAPI.getSettings();
  selectedProvider = settings.defaultProvider;
  defaultProvider.value = settings.defaultProvider;
  autoClipboard.checked = settings.autoClipboard;
  saveHistory.checked = settings.saveHistory;
  startMinimized.checked = settings.startMinimized;
  shortcutKey.textContent = settings.shortcut.replace("CommandOrControl", "Ctrl");

  // Set selected provider radio
  const radio = document.querySelector(
    `input[name="provider"][value="${selectedProvider}"]`
  ) as HTMLInputElement;
  if (radio) radio.checked = true;
}

// Update usage display
async function updateUsage() {
  const usage = await window.electronAPI.getUsage();

  if (usage.isUnlimited) {
    usageCount.textContent = "∞";
    usageCount.className = "usage-count unlimited";
  } else {
    const remaining = usage.freeRemaining + usage.paidRemaining;
    usageCount.textContent = String(remaining);
    usageCount.className = "usage-count";
    if (remaining === 0) {
      usageCount.classList.add("empty");
    } else if (remaining <= 3) {
      usageCount.classList.add("low");
    }
  }

  totalUsed.textContent = String(usage.totalUsed);

  const planNames: Record<string, string> = {
    free: "Free",
    pack: "Pay As You Go",
    unlimited: "Unlimited",
  };
  planType.textContent = planNames[usage.subscription.type] || "Free";
}

// Update provider status
async function updateProviderStatus() {
  const keys = await window.electronAPI.getApiKeys();

  const updateStatus = (el: HTMLSpanElement, configured: boolean) => {
    el.textContent = configured ? "Ready" : "Not configured";
    el.className = `provider-status ${configured ? "configured" : ""}`;
  };

  updateStatus(geminiStatus, keys.configured.gemini);
  updateStatus(claudeStatus, keys.configured.claude);
  updateStatus(gpt5Status, keys.configured.gpt5);
}

// Load history
async function loadHistory() {
  const history = await window.electronAPI.getHistory();

  if (history.length === 0) {
    historyList.innerHTML = '<p class="empty-state">No extractions yet</p>';
    return;
  }

  historyList.innerHTML = history
    .map(
      (item) => `
    <div class="history-item" data-text="${escapeAttr(item.text)}">
      <div class="history-meta">
        <span>${getProviderName(item.provider)}</span>
        <span>${formatDate(item.timestamp)}</span>
      </div>
      <div class="history-text">${escapeHtml(item.text)}</div>
    </div>
  `
    )
    .join("");

  // Add click handlers
  historyList.querySelectorAll(".history-item").forEach((item) => {
    item.addEventListener("click", () => {
      const text = (item as HTMLElement).dataset.text || "";
      window.electronAPI.copyToClipboard(text);
      showToast("Copied to clipboard!");
    });
  });
}

// Setup event listeners
function setupEventListeners() {
  // Window controls
  minimizeBtn.addEventListener("click", () => window.electronAPI.minimizeWindow());
  closeBtn.addEventListener("click", () => window.electronAPI.closeWindow());

  // Navigation
  navBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const page = btn.dataset.page;
      navigateTo(page!);
    });
  });

  // Capture button
  captureBtn.addEventListener("click", handleCapture);

  // Provider selection
  providerRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      selectedProvider = radio.value;
    });
  });

  // Copy button
  copyBtn.addEventListener("click", () => {
    window.electronAPI.copyToClipboard(resultText.value);
    showToast("Copied to clipboard!");
  });

  // Retry button
  retryBtn.addEventListener("click", () => {
    hideError();
    if (lastImageData) {
      processImage(lastImageData);
    } else {
      handleCapture();
    }
  });

  // History
  clearHistoryBtn.addEventListener("click", async () => {
    if (confirm("Clear all history?")) {
      await window.electronAPI.clearHistory();
      await loadHistory();
      showToast("History cleared");
    }
  });

  // Settings - API Keys (save on blur)
  geminiKey.addEventListener("blur", () => saveApiKey("gemini", geminiKey.value));
  claudeKey.addEventListener("blur", () => saveApiKey("claude", claudeKey.value));
  gpt5Key.addEventListener("blur", () => saveApiKey("gpt5", gpt5Key.value));

  // Settings - Preferences
  defaultProvider.addEventListener("change", savePreferences);
  autoClipboard.addEventListener("change", savePreferences);
  saveHistory.addEventListener("change", savePreferences);
  startMinimized.addEventListener("change", savePreferences);

  // Toggle visibility buttons
  document.querySelectorAll(".toggle-visibility").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = (btn as HTMLElement).dataset.target;
      const input = document.getElementById(targetId!) as HTMLInputElement;
      input.type = input.type === "password" ? "text" : "password";
    });
  });

  // Help links
  document.querySelectorAll(".help-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const url = (link as HTMLElement).dataset.url;
      if (url) window.electronAPI.openExternal(url);
    });
  });

  // Purchase buttons
  buyPackBtn.addEventListener("click", async () => {
    if (confirm("Purchase 50 extractions for $5? (Demo mode)")) {
      await window.electronAPI.purchasePack();
      await updateUsage();
      showToast("50 extractions added!");
    }
  });

  subscribeBtn.addEventListener("click", async () => {
    if (confirm("Subscribe for $10/month unlimited? (Demo mode)")) {
      await window.electronAPI.activateSubscription();
      await updateUsage();
      showToast("Unlimited subscription activated!");
    }
  });

  // Listen for navigation from main process
  window.electronAPI.onNavigate((page) => navigateTo(page));
}

// Navigate to page
function navigateTo(pageName: string) {
  navBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.page === pageName);
  });

  pages.forEach((page) => {
    page.classList.toggle("active", page.id === `${pageName}Page`);
  });
}

// Handle capture
async function handleCapture() {
  const usage = await window.electronAPI.getUsage();
  if (!usage.isUnlimited && usage.freeRemaining + usage.paidRemaining === 0) {
    showError("No extractions remaining. Please upgrade your plan.");
    return;
  }

  const keys = await window.electronAPI.getApiKeys();
  if (!keys.configured[selectedProvider as keyof typeof keys.configured]) {
    showError(
      `${getProviderName(selectedProvider)} API key not configured. Add it in Settings.`
    );
    return;
  }

  showLoading();
  hideResult();
  hideError();

  const imageData = await window.electronAPI.captureScreenshot();
  if (!imageData) {
    hideLoading();
    showError("Failed to capture screenshot");
    return;
  }

  lastImageData = imageData;
  await processImage(imageData);
}

// Process image
async function processImage(imageData: string) {
  try {
    const result = await window.electronAPI.extractText(imageData, selectedProvider);

    hideLoading();

    if (result.error) {
      showError(result.error);
      return;
    }

    if (result.text) {
      showResult(result.text);
      await updateUsage();
      await loadHistory();
    }
  } catch (error) {
    hideLoading();
    showError(error instanceof Error ? error.message : "Extraction failed");
  }
}

// Save API key
async function saveApiKey(provider: string, key: string) {
  if (key.trim()) {
    await window.electronAPI.setApiKey(provider, key.trim());
    await updateProviderStatus();
    showToast("API key saved");
  }
}

// Save preferences
async function savePreferences() {
  await window.electronAPI.setSettings({
    defaultProvider: defaultProvider.value,
    autoClipboard: autoClipboard.checked,
    saveHistory: saveHistory.checked,
    startMinimized: startMinimized.checked,
  });
  showToast("Settings saved");
}

// UI helpers
function showLoading() {
  loadingSection.style.display = "flex";
  captureBtn.disabled = true;
}

function hideLoading() {
  loadingSection.style.display = "none";
  captureBtn.disabled = false;
}

function showResult(text: string) {
  resultSection.style.display = "block";
  resultText.value = text;
}

function hideResult() {
  resultSection.style.display = "none";
  resultText.value = "";
}

function showError(message: string) {
  errorSection.style.display = "block";
  errorMessage.textContent = message;
}

function hideError() {
  errorSection.style.display = "none";
}

function showToast(message: string) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

// Utility functions
function getProviderName(provider: string): string {
  const names: Record<string, string> = {
    gemini: "Gemini Flash 2.0",
    claude: "Claude",
    gpt5: "GPT-5",
  };
  return names[provider] || provider;
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return (
    date.toLocaleDateString() +
    " " +
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
}

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function escapeAttr(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
