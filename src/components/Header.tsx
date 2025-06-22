import React from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Plus, HelpCircle, Settings } from "lucide-react"; // Added Settings icon
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom"; // Added useNavigate
import { useHotkeys } from "react-hotkeys-hook"; // Added useHotkeys

interface HeaderProps {
  onCreateNew?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onCreateNew }) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  // Shortcut for opening Tab Management Page
  useHotkeys("mod+shift+t", (event) => {
    event.preventDefault();
    navigate("/settings/tabs");
    toast({
      title: "Navigated",
      description: "Opened Tab Management page.",
    });
  }, { preventDefault: true });

  const handleSyncClick = () => {
    toast({
      title: "Syncing workspace",
      description: "Your workspace is being synced across devices.",
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <span className="text-white font-bold">TF</span>
            </div>
            <h1 className="text-xl font-bold">myTABs</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            onClick={handleSyncClick}
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
          >
            Sync
          </Button>
          {onCreateNew && (
            <Button onClick={onCreateNew} className="gap-1">
              <Plus className="h-4 w-4" />
              Create New
            </Button>
          )}
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
          >
            <Link to="/settings/tabs" title="Settings">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
          >
            <Link to="/help" title="Help">
              <HelpCircle className="h-5 w-5" />
              <span className="sr-only">Help</span>
            </Link>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
