
import { Tab } from "@/hooks/useWorkspaceData";

interface ChromeTab {
  id: number;
  title: string;
  url: string;
  favIconUrl?: string;
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

  // Save current active tab
  async saveCurrentTab(): Promise<Tab | null> {
    if (!this.isExtension()) {
      console.log("Not running as extension, can't save current tab");
      return null;
    }

    try {
      const chromeTabs = await new Promise<ChromeTab[]>((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => resolve(tabs as unknown as ChromeTab[]));
      });
      
      if (chromeTabs.length === 0) return null;
      
      const currentTab = chromeTabs[0];
      return {
        id: `tab-${Date.now()}`,
        title: currentTab.title || "Untitled Tab",
        url: currentTab.url || "",
        favicon: currentTab.favIconUrl,
        groupId: "default",
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
