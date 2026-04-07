// Usage tracking module for Screenshot OCR MCP server

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const DEFAULT_FREE_EXTRACTIONS = 10;
const PACK_EXTRACTIONS = 50;

interface UsageData {
  freeRemaining: number;
  paidRemaining: number;
  totalUsed: number;
  subscription: {
    type: "free" | "pack" | "unlimited";
    expiresAt: number | null;
    purchaseDate: string | null;
  };
  history: Array<{
    timestamp: string;
    provider: string;
  }>;
}

export interface UsageStats {
  remainingExtractions: number | "unlimited";
  freeRemaining: number;
  paidRemaining: number;
  totalUsed: number;
  subscriptionType: string;
  subscriptionExpires: string | null;
  isUnlimited: boolean;
}

export class UsageTracker {
  private dataPath: string;
  private data: UsageData;

  constructor() {
    // Store data in user's home directory
    const configDir = join(homedir(), ".screenshot-ocr-mcp");
    if (!existsSync(configDir)) {
      mkdirSync(configDir, { recursive: true });
    }
    this.dataPath = join(configDir, "usage.json");
    this.data = this.loadData();
  }

  private loadData(): UsageData {
    if (existsSync(this.dataPath)) {
      try {
        const content = readFileSync(this.dataPath, "utf-8");
        return JSON.parse(content);
      } catch {
        // If file is corrupted, start fresh
      }
    }

    // Default data
    return {
      freeRemaining: DEFAULT_FREE_EXTRACTIONS,
      paidRemaining: 0,
      totalUsed: 0,
      subscription: {
        type: "free",
        expiresAt: null,
        purchaseDate: null,
      },
      history: [],
    };
  }

  private saveData(): void {
    writeFileSync(this.dataPath, JSON.stringify(this.data, null, 2));
  }

  // Check if unlimited mode is enabled via environment variable
  private isUnlimitedMode(): boolean {
    return process.env.SCREENSHOT_OCR_UNLIMITED === "true";
  }

  async getRemainingExtractions(): Promise<number | "unlimited"> {
    // Check for unlimited environment variable
    if (this.isUnlimitedMode()) {
      return "unlimited";
    }

    // Check unlimited subscription
    if (this.data.subscription.type === "unlimited") {
      const now = Date.now();
      if (
        !this.data.subscription.expiresAt ||
        now < this.data.subscription.expiresAt
      ) {
        return "unlimited";
      }
      // Subscription expired, revert to free
      this.data.subscription.type = "free";
      this.saveData();
    }

    return this.data.freeRemaining + this.data.paidRemaining;
  }

  async canExtract(): Promise<boolean> {
    const remaining = await this.getRemainingExtractions();
    return remaining === "unlimited" || remaining > 0;
  }

  async decrementUsage(): Promise<boolean> {
    // Don't decrement if unlimited mode
    if (this.isUnlimitedMode()) {
      this.data.totalUsed++;
      this.data.history.unshift({
        timestamp: new Date().toISOString(),
        provider: "unknown",
      });
      // Keep only last 100 entries
      if (this.data.history.length > 100) {
        this.data.history = this.data.history.slice(0, 100);
      }
      this.saveData();
      return true;
    }

    // Check unlimited subscription
    if (this.data.subscription.type === "unlimited") {
      const now = Date.now();
      if (
        !this.data.subscription.expiresAt ||
        now < this.data.subscription.expiresAt
      ) {
        this.data.totalUsed++;
        this.data.history.unshift({
          timestamp: new Date().toISOString(),
          provider: "unknown",
        });
        if (this.data.history.length > 100) {
          this.data.history = this.data.history.slice(0, 100);
        }
        this.saveData();
        return true;
      }
    }

    // Use free extractions first
    if (this.data.freeRemaining > 0) {
      this.data.freeRemaining--;
      this.data.totalUsed++;
      this.data.history.unshift({
        timestamp: new Date().toISOString(),
        provider: "unknown",
      });
      if (this.data.history.length > 100) {
        this.data.history = this.data.history.slice(0, 100);
      }
      this.saveData();
      return true;
    }

    // Then use paid extractions
    if (this.data.paidRemaining > 0) {
      this.data.paidRemaining--;
      this.data.totalUsed++;
      this.data.history.unshift({
        timestamp: new Date().toISOString(),
        provider: "unknown",
      });
      if (this.data.history.length > 100) {
        this.data.history = this.data.history.slice(0, 100);
      }
      this.saveData();
      return true;
    }

    return false;
  }

  async getStats(): Promise<UsageStats> {
    const remaining = await this.getRemainingExtractions();
    const isUnlimited = remaining === "unlimited";

    return {
      remainingExtractions: remaining,
      freeRemaining: this.data.freeRemaining,
      paidRemaining: this.data.paidRemaining,
      totalUsed: this.data.totalUsed,
      subscriptionType: this.isUnlimitedMode()
        ? "unlimited (env)"
        : this.data.subscription.type,
      subscriptionExpires: this.data.subscription.expiresAt
        ? new Date(this.data.subscription.expiresAt).toISOString()
        : null,
      isUnlimited,
    };
  }

  // Add extractions (for pack purchase simulation)
  async addPack(): Promise<void> {
    this.data.paidRemaining += PACK_EXTRACTIONS;
    this.data.subscription.type = "pack";
    this.data.subscription.purchaseDate = new Date().toISOString();
    this.saveData();
  }

  // Activate unlimited subscription (for subscription simulation)
  async activateUnlimited(durationDays: number = 30): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    this.data.subscription = {
      type: "unlimited",
      expiresAt: expiresAt.getTime(),
      purchaseDate: new Date().toISOString(),
    };
    this.saveData();
  }

  // Reset all usage data
  async reset(): Promise<void> {
    this.data = {
      freeRemaining: DEFAULT_FREE_EXTRACTIONS,
      paidRemaining: 0,
      totalUsed: 0,
      subscription: {
        type: "free",
        expiresAt: null,
        purchaseDate: null,
      },
      history: [],
    };
    this.saveData();
  }
}
