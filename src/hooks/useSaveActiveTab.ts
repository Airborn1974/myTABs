import { useToast } from "@/hooks/use-toast";
import BrowserService from "@/services/BrowserService";
import { useWorkspace } from "@/hooks/useWorkspace";
import { Tab } from "@/types/workspace"; // Assuming Tab type is exported from workspace types

export const useSaveActiveTab = () => {
  const { toast } = useToast();
  const { data, addItem } = useWorkspace();

  const saveActiveTab = async (selectedGroupId?: string) => {
    try {
      // TODO: Ideally, BrowserService.getActiveTab() would be better.
      // For now, we'll try to get all current tabs and pick the first one
      // that seems active or is the current window's focused tab.
      // This might require BrowserService to have a more specific method.
      const currentTabs = await BrowserService.getCurrentTabs();

      let activeTabInfo = null;
      if (currentTabs && currentTabs.length > 0) {
        // Heuristic: often the first tab returned by some browser APIs is the active one,
        // or one that has focus. This is not guaranteed.
        // A more robust solution would be an explicit BrowserService.getActiveTab().
        activeTabInfo = currentTabs.find(tab => tab.active) || currentTabs[0];
      }

      if (!activeTabInfo || !activeTabInfo.url) { // Check for URL as it's crucial
        toast({
          title: "No active tab found",
          description: "Could not determine the active tab to save.",
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
        id: `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // More unique ID
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
