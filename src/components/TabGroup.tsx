
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreHorizontal } from "lucide-react"; // Icon for the dropdown trigger
import TabCard from "./TabCard";
import NoteCard from "./NoteCard";
import { Badge } from "@/components/ui/badge";
import { useWorkspace, Tab, Note, TodoList, Group } from "@/hooks/useWorkspace"; // Re-added for toggleBookmark
import TodoListComponent from "./TodoListComponent";

interface TabGroupProps {
  group: Group;
  allGroups: Group[]; // All groups in the workspace
  tabs: Tab[];
  notes: Note[];
  todoLists: TodoList[];
  onDeleteTab: (id: string) => void;
  onUpdateNote: (id: string, updates: Partial<Note>) => void;
  onDeleteNote: (id: string) => void;
  onUpdateTodoList: (id: string, updates: Partial<TodoList>) => void;
  onDeleteTodoList: (id: string) => void;
  onRenameGroup: (id: string, newTitle: string) => void;
  onDeleteGroup: (id: string) => void;
  onMoveTab: (itemId: string, newGroupId: string) => void;
  onMoveNote: (itemId: string, newGroupId: string) => void;
  onMoveTodoList: (itemId: string, newGroupId: string) => void;
}

const TabGroup: React.FC<TabGroupProps> = ({
  group,
  allGroups,
  tabs,
  notes,
  todoLists,
  onDeleteTab,
  onUpdateNote,
  onDeleteNote,
  onUpdateTodoList,
  onDeleteTodoList,
  onRenameGroup,
  onDeleteGroup,
  onMoveTab,
  onMoveNote,
  onMoveTodoList,
}) => {
  const groupColor = group.color || "#4f46e5";
  const { toggleBookmark } = useWorkspace(); // Re-added for TabCard
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState(group.title);

  const otherGroups = allGroups.filter(g => g.id !== group.id);

  const handleRenameGroup = () => {
    if (newGroupName.trim() === "") {
      // TODO: Show a toast or error message for empty name
      return;
    }
    onRenameGroup(group.id, newGroupName.trim());
    setIsRenameDialogOpen(false);
  };

  const handleDeleteGroup = () => {
    onDeleteGroup(group.id);
    setIsDeleteDialogOpen(false);
  };
  
  return (
    <div className="flex flex-col gap-4 kanban-column">
      <Card className="border-t-4" style={{ borderTopColor: groupColor }}>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center">
            {group.title}
            <Badge variant="outline" className="ml-2 text-xs">
              {tabs.length + notes.length + todoLists.length} items
            </Badge>
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="ml-2" aria-label="Group actions">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {
                setNewGroupName(group.title);
                setIsRenameDialogOpen(true);
              }}>
                Rename Group
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-red-600">
                Delete Group
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {tabs.length === 0 && notes.length === 0 && todoLists.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm italic">
              No items in this group yet
            </div>
          )}
          
          {tabs.map((tab) => (
            <TabCard
              key={tab.id}
              tab={tab}
              groups={otherGroups}
              onDelete={() => onDeleteTab(tab.id)}
              onToggleBookmark={() => toggleBookmark(tab.id)} // Passed down
              onMoveItem={(newGroupId) => onMoveTab(tab.id, newGroupId)}
            />
          ))}

          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              groups={otherGroups}
              onUpdate={(updates) => onUpdateNote(note.id, updates)}
              onDelete={() => onDeleteNote(note.id)}
              onMoveItem={(newGroupId) => onMoveNote(note.id, newGroupId)}
            />
          ))}

          {todoLists.map((todoList) => (
            <TodoListComponent
              key={todoList.id}
              todoList={todoList}
              groups={otherGroups}
              onUpdate={(updates) => onUpdateTodoList(todoList.id, updates)}
              onDelete={() => onDeleteTodoList(todoList.id)}
              onMoveItem={(newGroupId) => onMoveTodoList(todoList.id, newGroupId)}
            />
          ))}
        </CardContent>
      </Card>

      {/* Rename Group Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Group</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Enter new group name"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleRenameGroup}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Group Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this group?</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>This action cannot be undone. All items within this group will also be deleted.</p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteGroup}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TabGroup;
