import { useToast } from "@/hooks/use-toast";
import BrowserService from "@/services/BrowserService";
import { useWorkspace } from "@/hooks/useWorkspace";
import { Tab } from "@/types/workspace";
import { v4 as uuidv4 } from 'uuid'; // Import uuid

export const useSaveActiveTab = () => {
  const { toast } = useToast();
  const { data, addItem } = useWorkspace();

  const saveActiveTab = async (selectedGroupId?: string) => {
    try {
      const activeTabInfo = await BrowserService.getActiveTab();

      if (!activeTabInfo || !activeTabInfo.url) { // Check for URL as it's crucial
        toast({
          title: "No active tab found", // Or "Active tab has no URL" if activeTabInfo exists but URL is missing
          description: "Could not determine the active tab or URL is missing.",
          variant: "destructive",
        });
        return;
      }

      const groupId = selectedGroupId || data.groups[0]?.id;
      if (!groupId) {
        toast({
          title: "No groups available",
          description: "Please create a group first to save the tab.",
          variant: "destructive",
        });
        return;
      }

      const newTab: Tab = {
        id: uuidv4(), // Use uuidv4 for new tab ID
        title: activeTabInfo.title || "Untitled Tab",
        url: activeTabInfo.url,
        favicon: activeTabInfo.favIconUrl,
        groupId,
        bookmarked: false,
        createdAt: new Date().toISOString(), // Optional: add creation timestamp
      };

      addItem("tab", newTab);

      toast({
        title: "Tab Saved",
        description: `Successfully saved "${newTab.title}".`,
      });

    } catch (error) {
      console.error("Error saving active tab:", error);
      toast({
        title: "Save Failed",
        description: "Failed to save the active tab.",
        variant: "destructive",
      });
    }
  };

  return { saveActiveTab };
};
