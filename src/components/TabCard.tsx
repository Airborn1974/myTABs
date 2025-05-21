
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, X, Bookmark, BookmarkCheck } from "lucide-react";
import { Tab } from "@/hooks/useWorkspaceData";
import { useToast } from "@/hooks/use-toast";

interface TabCardProps {
  tab: Tab;
  onDelete: () => void;
  onToggleBookmark?: () => void;
}

const TabCard: React.FC<TabCardProps> = ({ tab, onDelete, onToggleBookmark }) => {
  const defaultFavicon = "/placeholder.svg";
  const { toast } = useToast();

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (onToggleBookmark) {
      onToggleBookmark();
      toast({
        title: tab.bookmarked ? "Removed from bookmarks" : "Added to bookmarks",
        description: tab.title,
      });
    }
  };

  return (
    <Card className="card-shadow card-hover overflow-hidden animate-fade-in">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <a 
            href={tab.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-start flex-1 group"
          >
            <div className="flex">
              <div className="h-6 w-6 mr-3 flex-shrink-0">
                <img 
                  src={tab.favicon || defaultFavicon} 
                  alt="" 
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = defaultFavicon;
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-foreground group-hover:text-primary truncate">
                  {tab.title}
                </h3>
                <p className="text-xs text-muted-foreground truncate mt-1">
                  {tab.url}
                </p>
              </div>
            </div>
            <ExternalLink className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
          </a>
          <div className="flex">
            <button
              onClick={handleBookmarkClick}
              className="ml-2 text-muted-foreground hover:text-amber-500 p-1 rounded-full hover:bg-muted/80 transition-colors"
              aria-label={tab.bookmarked ? "Remove bookmark" : "Add bookmark"}
            >
              {tab.bookmarked ? (
                <BookmarkCheck className="h-4 w-4 text-amber-500" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="ml-2 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted/80 transition-colors"
              aria-label="Delete tab"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TabCard;
