
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Save, List } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BrowserService from "@/services/BrowserService";
import useWorkspaceData from "@/hooks/useWorkspaceData";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SaveCurrentTabButtonProps {
  selectedGroup?: string;
}

const SaveCurrentTabButton: React.FC<SaveCurrentTabButtonProps> = ({ selectedGroup }) => {
  const { toast } = useToast();
  const { data, addItem } = useWorkspaceData();
  const [isLoading, setIsLoading] = useState(false);
  const [openTabs, setOpenTabs] = useState<Array<{
    id: number;
    title: string;
    url: string;
    favIconUrl?: string;
  }>>([]);
  
  const loadOpenTabs = async () => {
    setIsLoading(true);
    try {
      // Get all tabs from browser service
      const tabs = await BrowserService.getCurrentTabs();
      setOpenTabs(tabs);
      
      if (tabs.length === 0) {
        toast({
          title: "No tabs available",
          description: "There are no open tabs to save.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading open tabs:", error);
      toast({
        title: "Error loading tabs",
        description: "Failed to load open tabs.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveTab = async (tabData: {
    id: number;
    title: string;
    url: string;
    favIconUrl?: string;
  }) => {
    try {
      // Use selected group or default to first group
      const groupId = selectedGroup || data.groups[0]?.id;
      
      if (!groupId) {
        toast({
          title: "No groups available",
          description: "Please create a group first.",
          variant: "destructive",
        });
        return;
      }
      
      // Add the tab to the workspace with the selected group
      addItem("tab", {
        id: `tab-${Date.now()}`,
        title: tabData.title || "Untitled Tab",
        url: tabData.url || "",
        favicon: tabData.favIconUrl,
        groupId,
        bookmarked: false
      });
      
      toast({
        title: "Tab saved",
        description: `Successfully saved "${tabData.title}"`,
      });
    } catch (error) {
      console.error("Error saving tab:", error);
      toast({
        title: "Save failed",
        description: "Failed to save the tab.",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu onOpenChange={(open) => { if (open) loadOpenTabs(); }}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-1"
          title="Save tab"
          disabled={isLoading}
        >
          <Save className="h-4 w-4" />
          {isLoading ? "Loading..." : "Save Tab"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72">
        {openTabs.length > 0 ? (
          openTabs.map((tab) => (
            <DropdownMenuItem 
              key={tab.id} 
              className="flex items-center py-2 cursor-pointer"
              onClick={() => handleSaveTab(tab)}
            >
              {tab.favIconUrl && (
                <img 
                  src={tab.favIconUrl} 
                  alt="" 
                  className="h-4 w-4 mr-2"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <div className="truncate">{tab.title}</div>
            </DropdownMenuItem>
          ))
        ) : (
          <div className="text-center p-2 text-sm text-muted-foreground">
            {isLoading ? "Loading tabs..." : "No tabs available"}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SaveCurrentTabButton;
