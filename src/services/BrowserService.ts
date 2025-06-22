
import { Tab } from "@/hooks/useWorkspace";

interface ChromeTab {
  id: number;
  title: string;
  url: string;
  favIconUrl?: string;
  active?: boolean; // Chrome tab object can have this
}

class BrowserService {
  // Check if running as a Chrome extension
  isExtension(): boolean {
    return typeof chrome !== 'undefined' && chrome.tabs !== undefined;
  }

  // Get current browser tabs
  async getCurrentTabs(): Promise<ChromeTab[]> {
    if (!this.isExtension()) {
      console.log("Not running as extension, returning mock tabs for development");
      return [
        {
          id: 1,
          title: "GitHub",
          url: "https://github.com",
          favIconUrl: "https://github.githubassets.com/favicons/favicon.svg"
        },
        {
          id: 2,
          title: "React Documentation",
          url: "https://react.dev",
          favIconUrl: "https://react.dev/favicon.ico"
        },
        {
          id: 3,
          title: "Tailwind CSS",
          url: "https://tailwindcss.com",
          favIconUrl: "https://tailwindcss.com/favicons/favicon-32x32.png"
        }
      ];
    }
    
    try {
      return new Promise<ChromeTab[]>((resolve) => {
        chrome.tabs.query({}, (tabs) => resolve(tabs as unknown as ChromeTab[]));
      });
    } catch (error) {
      console.error("Error getting tabs:", error);
      return [];
    }
  }

  // Get the currently active tab in the current window
  async getActiveTab(): Promise<ChromeTab | null> {
    if (!this.isExtension()) {
      console.log("Not running as extension, returning mock active tab for development");
      // Return a single mock tab that could be considered "active"
      return {
        id: 1, // Different from getCurrentTabs to distinguish
        title: "Active Mock Tab - Google",
        url: "https://www.google.com",
        favIconUrl: "https://www.google.com/favicon.ico",
        active: true,
      };
    }

    try {
      return new Promise<ChromeTab | null>((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (chrome.runtime.lastError) {
            // Reject the promise if there's a runtime error
            return reject(new Error(chrome.runtime.lastError.message));
          }
          if (tabs && tabs.length > 0) {
            // Resolve with the first tab in the array (should be the active one)
            resolve(tabs[0] as unknown as ChromeTab);
          } else {
            // No active tab found or tabs array is empty/undefined
            resolve(null);
          }
        });
      });
    } catch (error) {
      console.error("Error getting active tab:", error);
      return null; // Or rethrow, depending on desired error handling
    }
  }

  // Save current active tab (existing method, might be deprecated or refactored if useSaveActiveTab hook is preferred)
  async saveCurrentTab(): Promise<Tab | null> {
    if (!this.isExtension()) {
      console.log("Not running as extension, can't save current tab");
      return null;
    }

    try {
      const activeTabDetails = await this.getActiveTab(); // Use the new method
      if (!activeTabDetails) return null;
      
      return {
        id: `tab-${Date.now()}`, // This ID generation should be handled by the workspace logic
        title: activeTabDetails.title || "Untitled Tab",
        url: activeTabDetails.url || "",
        favicon: activeTabDetails.favIconUrl,
        groupId: "default", // This groupId assignment should also be workspace logic
        bookmarked: false
      };
    } catch (error) {
      console.error("Error saving current tab:", error);
      return null;
    }
  }

  // Open a tab
  async openTab(url: string): Promise<void> {
    if (!this.isExtension()) {
      window.open(url, '_blank');
      return;
    }

    try {
      await new Promise<void>((resolve) => {
        chrome.tabs.create({ url }, () => resolve());
      });
    } catch (error) {
      console.error("Error opening tab:", error);
    }
  }

  // Add a bookmark
  async addBookmark(title: string, url: string): Promise<void> {
    if (!this.isExtension()) {
      console.log("Bookmarking not available outside extension");
      return;
    }

    try {
      await new Promise<void>((resolve) => {
        chrome.bookmarks.create({ title, url }, () => resolve());
      });
    } catch (error) {
      console.error("Error creating bookmark:", error);
    }
  }
}

export default new BrowserService();
