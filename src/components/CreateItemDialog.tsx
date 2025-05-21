
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Group, ItemType, Tab, Note, TodoList } from "@/hooks/useWorkspaceData";
import { Link, ListChecks, StickyNote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreateItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateItem: (type: ItemType, item: any) => void;
  groups: Group[];
}

const CreateItemDialog: React.FC<CreateItemDialogProps> = ({
  open,
  onOpenChange,
  onCreateItem,
  groups,
}) => {
  const [activeTab, setActiveTab] = useState<ItemType>("tab");
  const [selectedGroup, setSelectedGroup] = useState<string>(groups[0]?.id || "");
  const { toast } = useToast();

  // Tab fields
  const [tabTitle, setTabTitle] = useState("");
  const [tabUrl, setTabUrl] = useState("");

  // Note fields
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");

  // Todo list fields
  const [todoListTitle, setTodoListTitle] = useState("");

  const resetForm = () => {
    setTabTitle("");
    setTabUrl("");
    setNoteTitle("");
    setNoteContent("");
    setTodoListTitle("");
    setSelectedGroup(groups[0]?.id || "");
    setActiveTab("tab");
  };

  const handleCreateItem = () => {
    if (!selectedGroup) {
      toast({
        title: "Error",
        description: "Please select a group",
        variant: "destructive",
      });
      return;
    }

    try {
      if (activeTab === "tab") {
        // Only URL is required for tabs
        if (!tabUrl) {
          toast({
            title: "Error",
            description: "Please enter a URL",
            variant: "destructive",
          });
          return;
        }

        // Add basic URL validation
        let processedUrl = tabUrl;
        if (!processedUrl.startsWith("http://") && !processedUrl.startsWith("https://")) {
          processedUrl = "https://" + processedUrl;
        }
        
        // Use URL as title if title is not provided
        const finalTitle = tabTitle || new URL(processedUrl).hostname;

        const newTab: Tab = {
          id: `tab-${Date.now()}`,
          title: finalTitle,
          url: processedUrl,
          groupId: selectedGroup,
          bookmarked: false
        };

        onCreateItem("tab", newTab);
        toast({
          title: "Success",
          description: "Tab added successfully",
        });
      } else if (activeTab === "note") {
        // Only title is required for notes
        if (!noteTitle) {
          toast({
            title: "Error",
            description: "Please provide a title for the note",
            variant: "destructive",
          });
          return;
        }

        const newNote: Note = {
          id: `note-${Date.now()}`,
          title: noteTitle,
          content: noteContent || "", // Content is optional
          groupId: selectedGroup,
        };

        onCreateItem("note", newNote);
        toast({
          title: "Success",
          description: "Note added successfully",
        });
      } else if (activeTab === "todo") {
        // Only title is required for todo lists
        if (!todoListTitle) {
          toast({
            title: "Error",
            description: "Please provide a title for the todo list",
            variant: "destructive",
          });
          return;
        }

        const newTodoList: TodoList = {
          id: `todo-${Date.now()}`,
          title: todoListTitle,
          items: [],
          groupId: selectedGroup,
        };

        onCreateItem("todo", newTodoList);
        toast({
          title: "Success",
          description: "Todo list added successfully",
        });
      }

      resetForm();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong, please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Item</DialogTitle>
          <DialogDescription>
            Add a new tab, note or todo list to your workspace.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ItemType)} className="w-full">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="tab" className="flex items-center gap-1">
              <Link className="h-4 w-4" />
              <span>Tab</span>
            </TabsTrigger>
            <TabsTrigger value="note" className="flex items-center gap-1">
              <StickyNote className="h-4 w-4" />
              <span>Note</span>
            </TabsTrigger>
            <TabsTrigger value="todo" className="flex items-center gap-1">
              <ListChecks className="h-4 w-4" />
              <span>Todo</span>
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-4">
            <Label htmlFor="group-select">Group</Label>
            <Select
              value={selectedGroup}
              onValueChange={setSelectedGroup}
            >
              <SelectTrigger id="group-select" className="w-full">
                <SelectValue placeholder="Select a group" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="tab" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="tab-title">Title <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input
                id="tab-title"
                value={tabTitle}
                onChange={(e) => setTabTitle(e.target.value)}
                placeholder="Title will be extracted from URL if empty"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tab-url">URL <span className="text-red-500">*</span></Label>
              <Input
                id="tab-url"
                value={tabUrl}
                onChange={(e) => setTabUrl(e.target.value)}
                placeholder="https://example.com"
                required
              />
            </div>
          </TabsContent>

          <TabsContent value="note" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="note-title">Title <span className="text-red-500">*</span></Label>
              <Input
                id="note-title"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Note title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note-content">Content <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Textarea
                id="note-content"
                rows={5}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write your note here..."
              />
            </div>
          </TabsContent>

          <TabsContent value="todo" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="todo-title">Title <span className="text-red-500">*</span></Label>
              <Input
                id="todo-title"
                value={todoListTitle}
                onChange={(e) => setTodoListTitle(e.target.value)}
                placeholder="Todo list title"
                required
              />
            </div>
            <p className="text-sm text-muted-foreground">
              You can add tasks to your list after creating it.
            </p>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateItem}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateItemDialog;

