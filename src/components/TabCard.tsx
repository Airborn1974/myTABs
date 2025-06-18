
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ExternalLink, Bookmark, BookmarkCheck, MoreVertical, Trash2, MoveRight } from "lucide-react";
import { Tab, Group } from "@/hooks/useWorkspace"; // Added Group
import { useToast } from "@/hooks/use-toast";

interface TabCardProps {
  tab: Tab;
  groups: Group[]; // List of all groups for moving
  onDelete: () => void;
  onToggleBookmark?: () => void;
  onMoveItem: (newGroupId: string) => void; // Function to move the item
}

const TabCard: React.FC<TabCardProps> = ({ tab, groups, onDelete, onToggleBookmark, onMoveItem }) => {
  const defaultFavicon = "/placeholder.svg";
  const { toast } = useToast();

  const handleBookmarkClick = () => {
    if (onToggleBookmark) {
      onToggleBookmark();
      toast({
        title: tab.bookmarked ? "Removed from bookmarks" : "Added to bookmarks",
        description: tab.title,
      });
    }
  };

  const otherGroups = groups.filter(g => g.id !== tab.groupId);

  return (
    <Card className="card-shadow card-hover overflow-hidden animate-fade-in group/card">
      <CardContent className="p-3"> {/* Reduced padding for a more compact look */}
        <div className="flex items-start justify-between">
          <div className="flex items-start flex-1 min-w-0"> {/* Ensure this div takes up space */}
            <div className="h-6 w-6 mr-3 flex-shrink-0 mt-1">
              <img
                src={tab.favicon || defaultFavicon}
                alt=""
                className="h-full w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = defaultFavicon;
                }}
              />
            </div>
            <div className="flex-1 min-w-0"> {/* Allow text to truncate */}
              <a
                href={tab.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                <h3 className="text-sm font-medium text-foreground group-hover/card:text-primary truncate">
                  {tab.title}
                </h3>
              </a>
              <a
                href={tab.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:underline truncate block"
              >
                {tab.url}
              </a>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="ml-2 opacity-0 group-hover/card:opacity-100">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => window.open(tab.url, "_blank")}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Link
              </DropdownMenuItem>
              {onToggleBookmark && (
                <DropdownMenuItem onClick={handleBookmarkClick}>
                  {tab.bookmarked ? (
                    <BookmarkCheck className="mr-2 h-4 w-4 text-amber-500" />
                  ) : (
                    <Bookmark className="mr-2 h-4 w-4" />
                  )}
                  {tab.bookmarked ? "Remove Bookmark" : "Add Bookmark"}
                </DropdownMenuItem>
              )}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <MoveRight className="mr-2 h-4 w-4" />
                  Move to Group
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {otherGroups.length > 0 ? (
                    otherGroups.map((group) => (
                      <DropdownMenuItem key={group.id} onClick={() => onMoveItem(group.id)}>
                        {group.title}
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <DropdownMenuItem disabled>No other groups</DropdownMenuItem>
                  )}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Tab
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};

export default TabCard;
