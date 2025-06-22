
import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { TodoItem, TodoList, Group } from "@/hooks/useWorkspace"; // Added Group
import { Button } from "@/components/ui/button";
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
import { Pencil, Plus, Save, Trash2, X, MoreVertical, MoveRight } from "lucide-react";

interface TodoListComponentProps {
  todoList: TodoList;
  groups: Group[]; // List of all groups for moving
  onUpdate: (updates: Partial<TodoList>) => void;
  onDelete: () => void;
  onMoveItem: (newGroupId: string) => void; // Function to move the item
}

const TodoListComponent: React.FC<TodoListComponentProps> = ({
  todoList,
  groups,
  onUpdate,
  onDelete,
  onMoveItem,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(todoList.title);
  const [items, setItems] = useState<TodoItem[]>([...todoList.items]); // Ensure new array instance
  const [newItemText, setNewItemText] = useState("");

  const handleSave = () => {
    // Prevent saving with an empty title by using the original title as a fallback
    onUpdate({ title: title.trim() === "" ? todoList.title : title.trim(), items });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTitle(todoList.title);
    setItems([...todoList.items]); // Reset with a new array instance
    setIsEditing(false);
  };

  const otherGroups = groups.filter(g => g.id !== todoList.groupId);

  const toggleItem = (itemId: string) => {
    const updatedItems = items.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    setItems(updatedItems); // Local update for responsiveness
    if (!isEditing) { // Persist immediately if not in edit mode
      onUpdate({ items: updatedItems });
    }
  };

import { v4 as uuidv4 } from 'uuid'; // Import uuid

// ... (other imports)

  const addNewItem = () => {
    if (!newItemText.trim()) return;
    // const newItemId = `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`; // Old ID
    const newItem: TodoItem = {
      id: uuidv4(), // Use uuidv4 for new todo item ID
      text: newItemText.trim(),
      completed: false
    };
    const updatedItems = [...items, newItem];
    setItems(updatedItems); // Local update
    setNewItemText("");
    if (!isEditing) { // Persist immediately if not in edit mode
      onUpdate({ items: updatedItems });
    }
  };

  const deleteItem = (itemId: string) => {
    const updatedItems = items.filter(item => item.id !== itemId);
    setItems(updatedItems); // Local update
    if (!isEditing) { // Persist immediately if not in edit mode
      onUpdate({ items: updatedItems });
    }
  };

  return (
    <Card className="card-shadow card-hover overflow-hidden animate-fade-in group/card">
      <CardHeader className="p-4 pb-2 flex flex-row justify-between items-center"> {/* Adjusted padding */}
        {isEditing ? (
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Todo list title"
            className="font-medium text-base flex-grow" // Ensure consistent text size
          />
        ) : (
          <h3 className="font-medium text-base truncate pr-2">{todoList.title || "Untitled List"}</h3>
        )}
        
        <div className="flex gap-1 ml-2"> {/* Reduced gap */}
          {isEditing ? (
            <>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleCancel}
                aria-label="Cancel editing"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                onClick={handleSave}
                aria-label="Save todo list"
              >
                <Save className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover/card:opacity-100" aria-label={`Actions for to-do list ${todoList.title || 'Untitled List'}`}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit List
                </DropdownMenuItem>
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
                  Delete List
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2"> {/* Keep padding for content */}
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <Checkbox 
                id={`todo-item-${item.id}`}
                checked={item.completed}
                onCheckedChange={() => toggleItem(item.id)}
              />
              <label
                htmlFor={`todo-item-${item.id}`}
                className={`text-sm flex-1 ${
                  item.completed ? "text-muted-foreground line-through" : ""
                }`}
              >
                {item.text}
              </label>
              {isEditing && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteItem(item.id)}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                  aria-label={`Delete task "${item.text}"`}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
          
          <div className="flex items-center gap-2 mt-3">
            <Input
              placeholder="Add new task..."
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addNewItem();
                }
              }}
              className="text-sm"
            />
            <Button size="sm" variant="outline" onClick={addNewItem}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TodoListComponent;
