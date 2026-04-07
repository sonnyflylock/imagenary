import { contextBridge, ipcRenderer } from "electron";

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld("electronAPI", {
  // Screenshot & OCR
  captureScreenshot: () => ipcRenderer.invoke("capture-screenshot"),
  extractText: (imageData: string, provider: string) =>
    ipcRenderer.invoke("extract-text", imageData, provider),

  // Usage & Subscription
  getUsage: () => ipcRenderer.invoke("get-usage"),
  purchasePack: () => ipcRenderer.invoke("purchase-pack"),
  activateSubscription: () => ipcRenderer.invoke("activate-subscription"),

  // Settings
  getSettings: () => ipcRenderer.invoke("get-settings"),
  setSettings: (settings: Record<string, unknown>) =>
    ipcRenderer.invoke("set-settings", settings),

  // API Keys
  getApiKeys: () => ipcRenderer.invoke("get-api-keys"),
  setApiKey: (provider: string, key: string) =>
    ipcRenderer.invoke("set-api-key", provider, key),
  testApiConnection: (provider: string) =>
    ipcRenderer.invoke("test-api-connection", provider),

  // History
  getHistory: () => ipcRenderer.invoke("get-history"),
  clearHistory: () => ipcRenderer.invoke("clear-history"),

  // Clipboard
  copyToClipboard: (text: string) =>
    ipcRenderer.invoke("copy-to-clipboard", text),

  // Window controls
  minimizeWindow: () => ipcRenderer.invoke("minimize-window"),
  closeWindow: () => ipcRenderer.invoke("close-window"),

  // External links
  openExternal: (url: string) => ipcRenderer.invoke("open-external", url),

  // Event listeners
  onNavigate: (callback: (page: string) => void) => {
    ipcRenderer.on("navigate", (_, page) => callback(page));
  },
});
