
import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BrowserService from "@/services/BrowserService";
import useWorkspaceData from "@/hooks/useWorkspaceData";

interface ImportTabsButtonProps {
  selectedGroup: string;
}

const ImportTabsButton: React.FC<ImportTabsButtonProps> = ({ selectedGroup }) => {
  const { toast } = useToast();
  const { addItem } = useWorkspaceData();

  const handleImportTabs = async () => {
    try {
      const tabs = await BrowserService.getCurrentTabs();
      
      if (!tabs.length) {
        toast({
          title: "No tabs to import",
          description: "There are no open tabs to import or extension permissions are missing.",
          variant: "destructive",
        });
        return;
      }

      let importedCount = 0;
      
      for (const tab of tabs) {
        // Skip about: and chrome:// URLs
        if (tab.url.startsWith('about:') || tab.url.startsWith('chrome://')) {
          continue;
        }
        
        addItem("tab", {
          ...tab,
          id: `tab-${Date.now()}-${importedCount}`,
          groupId: selectedGroup
        });
        
        importedCount++;
      }

      toast({
        title: "Tabs imported",
        description: `Successfully imported ${importedCount} tabs.`,
      });
    } catch (error) {
      console.error("Error importing tabs:", error);
      toast({
        title: "Import failed",
        description: "Failed to import tabs. Please check console for details.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button 
      onClick={handleImportTabs} 
      variant="outline" 
      className="gap-1"
      title="Import tabs from browser"
    >
      <Download className="h-4 w-4" />
      Import Tabs
    </Button>
  );
};

export default ImportTabsButton;
