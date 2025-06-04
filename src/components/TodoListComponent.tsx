
import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { TodoItem, TodoList } from "@/hooks/useWorkspace";
import { Button } from "@/components/ui/button";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";

interface TodoListComponentProps {
  todoList: TodoList;
  onUpdate: (updates: Partial<TodoList>) => void;
  onDelete: () => void;
}

const TodoListComponent: React.FC<TodoListComponentProps> = ({
  todoList,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(todoList.title);
  const [items, setItems] = useState<TodoItem[]>(todoList.items);
  const [newItemText, setNewItemText] = useState("");

  const handleSave = () => {
    onUpdate({ title, items });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTitle(todoList.title);
    setItems([...todoList.items]);
    setIsEditing(false);
  };

  const toggleItem = (itemId: string) => {
    const updatedItems = items.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    setItems(updatedItems);
    if (!isEditing) {
      onUpdate({ items: updatedItems });
    }
  };

  const addNewItem = () => {
    if (!newItemText.trim()) return;
    
    const newItem: TodoItem = {
      id: `item-${Date.now()}`,
      text: newItemText,
      completed: false
    };
    
    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    setNewItemText("");
    
    if (!isEditing) {
      onUpdate({ items: updatedItems });
    }
  };

  const deleteItem = (itemId: string) => {
    const updatedItems = items.filter(item => item.id !== itemId);
    setItems(updatedItems);
    
    if (!isEditing) {
      onUpdate({ items: updatedItems });
    }
  };

  return (
    <Card className="card-shadow card-hover overflow-hidden animate-fade-in">
      <CardHeader className="p-4 pb-0 flex flex-row justify-between items-center">
        {isEditing ? (
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Todo list title"
            className="font-medium"
          />
        ) : (
          <h3 className="font-medium">{todoList.title}</h3>
        )}
        
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                size="sm" 
                variant="ghost"
                onClick={handleCancel}
                className="h-8 w-8 p-0"
                aria-label="Cancel editing"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                className="h-8 w-8 p-0"
                aria-label="Save todo list"
              >
                <Save className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                className="h-8 w-8 p-0"
                aria-label="Edit todo list"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onDelete}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                aria-label="Delete todo list"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
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
