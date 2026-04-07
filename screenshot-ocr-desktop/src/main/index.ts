import {
  app,
  BrowserWindow,
  ipcMain,
  globalShortcut,
  Tray,
  Menu,
  nativeImage,
  clipboard,
  dialog,
  shell,
  desktopCapturer,
  screen,
} from "electron";
import * as path from "path";
import Store from "electron-store";
import { extractText, testApiConnection, Provider } from "./api";

// Initialize store for settings and usage
const store = new Store({
  defaults: {
    apiKeys: {
      gemini: "",
      claude: "",
      gpt5: "",
    },
    settings: {
      defaultProvider: "gemini",
      autoClipboard: true,
      saveHistory: true,
      startMinimized: false,
      shortcut: "CommandOrControl+Shift+O",
    },
    usage: {
      freeRemaining: 10,
      paidRemaining: 0,
      totalUsed: 0,
    },
    subscription: {
      type: "free",
      expiresAt: null,
    },
    history: [],
  },
});

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 450,
    height: 650,
    minWidth: 400,
    minHeight: 500,
    frame: false,
    transparent: false,
    resizable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    icon: path.join(__dirname, "../../assets/icon.png"),
    show: false,
  });

  mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));

  mainWindow.once("ready-to-show", () => {
    if (!store.get("settings.startMinimized")) {
      mainWindow?.show();
    }
  });

  mainWindow.on("close", (event) => {
    if (process.platform === "win32") {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function createTray() {
  const iconPath = path.join(__dirname, "../../assets/icon.png");
  let trayIcon: nativeImage;

  try {
    trayIcon = nativeImage.createFromPath(iconPath);
    if (trayIcon.isEmpty()) {
      // Create a simple colored icon if file not found
      trayIcon = nativeImage.createEmpty();
    }
  } catch {
    trayIcon = nativeImage.createEmpty();
  }

  tray = new Tray(trayIcon);
  tray.setToolTip("Imagenary Text Extractor");

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Open Text Extractor",
      click: () => {
        mainWindow?.show();
        mainWindow?.focus();
      },
    },
    {
      label: "Capture Screenshot",
      accelerator: store.get("settings.shortcut") as string,
      click: () => captureScreenshot(),
    },
    { type: "separator" },
    {
      label: "Settings",
      click: () => {
        mainWindow?.show();
        mainWindow?.webContents.send("navigate", "settings");
      },
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  tray.on("click", () => {
    if (mainWindow?.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow?.show();
      mainWindow?.focus();
    }
  });
}

function registerShortcuts() {
  const shortcut = store.get("settings.shortcut") as string;

  globalShortcut.unregisterAll();

  const registered = globalShortcut.register(shortcut, () => {
    captureScreenshot();
  });

  if (!registered) {
    console.error("Failed to register global shortcut:", shortcut);
  }
}

async function captureScreenshot(): Promise<string | null> {
  try {
    // Get all displays
    const displays = screen.getAllDisplays();
    const primaryDisplay = screen.getPrimaryDisplay();

    // Capture the primary display
    const sources = await desktopCapturer.getSources({
      types: ["screen"],
      thumbnailSize: {
        width: primaryDisplay.workAreaSize.width * primaryDisplay.scaleFactor,
        height: primaryDisplay.workAreaSize.height * primaryDisplay.scaleFactor,
      },
    });

    if (sources.length === 0) {
      throw new Error("No screen sources available");
    }

    // Get the primary screen source
    const primarySource = sources[0];
    const thumbnail = primarySource.thumbnail;

    // Convert to base64
    const base64 = thumbnail.toDataURL();

    return base64;
  } catch (error) {
    console.error("Screenshot capture failed:", error);
    return null;
  }
}

// IPC Handlers
ipcMain.handle("capture-screenshot", async () => {
  return await captureScreenshot();
});

ipcMain.handle(
  "extract-text",
  async (_, imageData: string, provider: Provider) => {
    try {
      // Check usage
      const usage = store.get("usage") as {
        freeRemaining: number;
        paidRemaining: number;
        totalUsed: number;
      };
      const subscription = store.get("subscription") as {
        type: string;
        expiresAt: number | null;
      };

      const isUnlimited =
        subscription.type === "unlimited" &&
        (!subscription.expiresAt || Date.now() < subscription.expiresAt);

      if (
        !isUnlimited &&
        usage.freeRemaining <= 0 &&
        usage.paidRemaining <= 0
      ) {
        return {
          error: "No extractions remaining",
          upgradeRequired: true,
        };
      }

      const text = await extractText(imageData, provider, store);

      // Decrement usage
      if (!isUnlimited) {
        if (usage.freeRemaining > 0) {
          usage.freeRemaining--;
        } else if (usage.paidRemaining > 0) {
          usage.paidRemaining--;
        }
      }
      usage.totalUsed++;
      store.set("usage", usage);

      // Save to history
      const settings = store.get("settings") as { saveHistory: boolean };
      if (settings.saveHistory) {
        const history = store.get("history") as Array<{
          id: number;
          timestamp: string;
          provider: string;
          text: string;
        }>;
        history.unshift({
          id: Date.now(),
          timestamp: new Date().toISOString(),
          provider,
          text: text.substring(0, 500),
        });
        // Keep only last 100
        store.set("history", history.slice(0, 100));
      }

      // Auto-copy to clipboard
      if (settings.autoClipboard) {
        clipboard.writeText(text);
      }

      return { success: true, text };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Extraction failed",
      };
    }
  }
);

ipcMain.handle("get-usage", () => {
  const usage = store.get("usage");
  const subscription = store.get("subscription") as {
    type: string;
    expiresAt: number | null;
  };

  const isUnlimited =
    subscription.type === "unlimited" &&
    (!subscription.expiresAt || Date.now() < subscription.expiresAt);

  return {
    ...usage,
    subscription,
    isUnlimited,
  };
});

ipcMain.handle("get-settings", () => {
  return store.get("settings");
});

ipcMain.handle("set-settings", (_, settings: Record<string, unknown>) => {
  const current = store.get("settings") as Record<string, unknown>;
  store.set("settings", { ...current, ...settings });
  registerShortcuts(); // Re-register in case shortcut changed
  return true;
});

ipcMain.handle("get-api-keys", () => {
  const keys = store.get("apiKeys") as Record<string, string>;
  // Return masked keys for display
  return {
    gemini: keys.gemini ? "••••" + keys.gemini.slice(-4) : "",
    claude: keys.claude ? "••••" + keys.claude.slice(-4) : "",
    gpt5: keys.gpt5 ? "••••" + keys.gpt5.slice(-4) : "",
    configured: {
      gemini: !!keys.gemini,
      claude: !!keys.claude,
      gpt5: !!keys.gpt5,
    },
  };
});

ipcMain.handle(
  "set-api-key",
  (_, provider: string, key: string) => {
    const keys = store.get("apiKeys") as Record<string, string>;
    keys[provider] = key;
    store.set("apiKeys", keys);
    return true;
  }
);

ipcMain.handle("test-api-connection", async (_, provider: Provider) => {
  return await testApiConnection(provider, store);
});

ipcMain.handle("get-history", () => {
  return store.get("history");
});

ipcMain.handle("clear-history", () => {
  store.set("history", []);
  return true;
});

ipcMain.handle("copy-to-clipboard", (_, text: string) => {
  clipboard.writeText(text);
  return true;
});

ipcMain.handle("purchase-pack", () => {
  // Simulate purchase - in production, integrate with payment provider
  const usage = store.get("usage") as {
    freeRemaining: number;
    paidRemaining: number;
    totalUsed: number;
  };
  usage.paidRemaining += 50;
  store.set("usage", usage);
  store.set("subscription", { type: "pack", expiresAt: null });
  return true;
});

ipcMain.handle("activate-subscription", () => {
  // Simulate subscription - in production, integrate with payment provider
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  store.set("subscription", { type: "unlimited", expiresAt });
  return true;
});

ipcMain.handle("minimize-window", () => {
  mainWindow?.minimize();
});

ipcMain.handle("close-window", () => {
  mainWindow?.hide();
});

ipcMain.handle("open-external", (_, url: string) => {
  shell.openExternal(url);
});

// App lifecycle
app.whenReady().then(() => {
  createWindow();
  createTray();
  registerShortcuts();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    // Don't quit on Windows, minimize to tray
  }
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
}
