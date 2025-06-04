import React, { useState } from "react";
import Header from "@/components/Header";
import WorkspaceBoard from "@/components/WorkspaceBoard";
import CreateItemDialog from "@/components/CreateItemDialog";
import CreateGroupDialog from "@/components/CreateGroupDialog";
import { useWorkspace, ItemType, Group, Tab } from "@/hooks/useWorkspace";
import TabCard from "@/components/TabCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookmarkCheck, LogOut } from "lucide-react";
import SaveCurrentTabButton from "@/components/SaveCurrentTabButton";
import ImportTabsButton from "@/components/ImportTabsButton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

const Index: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreateGroupDialogOpen, setIsCreateGroupDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState("");
  const {
    data,
    addItem,
    addGroup,
    deleteItem,
    toggleBookmark,
    getBookmarkedTabs,
    isLoading,
  } = useWorkspace();
  const { signOut, user } = useAuth();

  // Set default selected group if available
  React.useEffect(() => {
    if (data.groups.length > 0 && !selectedGroup) {
      setSelectedGroup(data.groups[0].id);
    }
  }, [data.groups, selectedGroup]);

  const handleCreateItem = (type: ItemType, item: any) => {
    addItem(type, item);
  };

  const handleCreateGroup = (title: string, color: string) => {
    const newGroup: Group = {
      id: `group-${Date.now()}`,
      title,
      color,
    };
    addGroup(newGroup);
    setIsCreateGroupDialogOpen(false); // Close dialog after creation
  };

  const bookmarkedTabs = getBookmarkedTabs();

  const handleDeleteTab = (tabId: string) => {
    deleteItem("tab", tabId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header onCreateNew={() => setIsCreateDialogOpen(true)} />
        <main className="flex-grow p-6">
          <div className="w-full">
            <div className="flex justify-between items-center mb-6">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-10 w-36" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-t-4 border-t-gray-300">
                  <CardHeader className="pb-3">
                    <Skeleton className="h-6 w-36" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header onCreateNew={() => setIsCreateDialogOpen(true)} />
      <main className="flex-grow">
        {/* Action Buttons */}
        <div className="w-full pt-6 flex flex-wrap gap-2 justify-between">
          <div className="flex gap-2 flex-wrap">
            <SaveCurrentTabButton selectedGroup={selectedGroup} />
            <ImportTabsButton selectedGroup={selectedGroup} />
          </div>

          <div className="flex items-center gap-2">
            {user && (
              <span className="text-sm text-muted-foreground">
                {user.email}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut()}
              title="Sign out"
              className="gap-1"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>

        {/* Bookmarked Tabs Section */}
        {bookmarkedTabs.length > 0 && (
          <div className="w-full py-6">
            <Card className="border-t-4 border-t-amber-500 mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <BookmarkCheck className="mr-2 h-5 w-5 text-amber-500" />
                  Bookmarked Tabs
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {bookmarkedTabs.map((tab: Tab) => (
                  <TabCard
                    key={tab.id}
                    tab={tab}
                    onDelete={() => handleDeleteTab(tab.id)}
                    onToggleBookmark={() => toggleBookmark(tab.id)}
                  />
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        <WorkspaceBoard
          onCreateGroup={() => setIsCreateGroupDialogOpen(true)}
          groups={data.groups} // Pass groups data directly
        />
      </main>
      <CreateItemDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateItem={handleCreateItem}
        groups={data.groups}
      />
      <CreateGroupDialog
        open={isCreateGroupDialogOpen}
        onOpenChange={setIsCreateGroupDialogOpen}
        onCreateGroup={handleCreateGroup}
      />
    </div>
  );
};

export default Index;
