
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TabCard from "./TabCard";
import NoteCard from "./NoteCard";
import { Badge } from "@/components/ui/badge";
import { useWorkspace, Tab, Note, TodoList, Group } from "@/hooks/useWorkspace";
import TodoListComponent from "./TodoListComponent";

interface TabGroupProps {
  group: Group;
  tabs: Tab[];
  notes: Note[];
  todoLists: TodoList[];
  onDeleteTab: (id: string) => void;
  onUpdateNote: (id: string, updates: Partial<Note>) => void;
  onDeleteNote: (id: string) => void;
  onUpdateTodoList: (id: string, updates: Partial<TodoList>) => void;
  onDeleteTodoList: (id: string) => void;
}

const TabGroup: React.FC<TabGroupProps> = ({
  group,
  tabs,
  notes,
  todoLists,
  onDeleteTab,
  onUpdateNote,
  onDeleteNote,
  onUpdateTodoList,
  onDeleteTodoList
}) => {
  const groupColor = group.color || "#4f46e5";
  const { toggleBookmark } = useWorkspace();
  
  return (
    <div className="flex flex-col gap-4 kanban-column">
      <Card className="border-t-4" style={{ borderTopColor: groupColor }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center">
            {group.title}
            <Badge variant="outline" className="ml-2 text-xs">
              {tabs.length + notes.length + todoLists.length} items
            </Badge>
          </CardTitle>
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
              onDelete={() => onDeleteTab(tab.id)}
              onToggleBookmark={() => toggleBookmark(tab.id)}
            />
          ))}

          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onUpdate={(updates) => onUpdateNote(note.id, updates)}
              onDelete={() => onDeleteNote(note.id)}
            />
          ))}

          {todoLists.map((todoList) => (
            <TodoListComponent
              key={todoList.id}
              todoList={todoList}
              onUpdate={(updates) => onUpdateTodoList(todoList.id, updates)}
              onDelete={() => onDeleteTodoList(todoList.id)}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default TabGroup;
