
import React from "react";
import TabGroup from "./TabGroup";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import useWorkspaceData, { Group, Note, Tab, TodoList } from "@/hooks/useWorkspaceData";

interface WorkspaceBoardProps {
  onCreateGroup: () => void;
  groups?: Group[]; // Make groups optional with a default in the component
}

const WorkspaceBoard: React.FC<WorkspaceBoardProps> = ({ onCreateGroup, groups = [] }) => {
  const { 
    data, 
    deleteItem, 
    updateItem 
  } = useWorkspaceData();
  
  // Use the groups prop if provided, otherwise fall back to data.groups
  const displayGroups = groups.length > 0 ? groups : data.groups;

  const handleDeleteTab = (tabId: string) => {
    deleteItem("tab", tabId);
  };

  const handleUpdateNote = (noteId: string, updates: Partial<Note>) => {
    updateItem("note", noteId, updates);
  };

  const handleDeleteNote = (noteId: string) => {
    deleteItem("note", noteId);
  };

  const handleUpdateTodoList = (todoListId: string, updates: Partial<TodoList>) => {
    updateItem("todo", todoListId, updates);
  };

  const handleDeleteTodoList = (todoListId: string) => {
    deleteItem("todo", todoListId);
  };

  const getTabsForGroup = (groupId: string): Tab[] => {
    return data.tabs.filter(tab => tab.groupId === groupId);
  };

  const getNotesForGroup = (groupId: string): Note[] => {
    return data.notes.filter(note => note.groupId === groupId);
  };

  const getTodoListsForGroup = (groupId: string): TodoList[] => {
    return data.todoLists.filter(todoList => todoList.groupId === groupId);
  };

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Groups</h2>
        <Button onClick={onCreateGroup} className="gap-1">
          <Plus className="h-4 w-4" />
          Create Group
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayGroups.map((group: Group) => (
          <TabGroup
            key={group.id}
            group={group}
            tabs={getTabsForGroup(group.id)}
            notes={getNotesForGroup(group.id)}
            todoLists={getTodoListsForGroup(group.id)}
            onDeleteTab={handleDeleteTab}
            onUpdateNote={handleUpdateNote}
            onDeleteNote={handleDeleteNote}
            onUpdateTodoList={handleUpdateTodoList}
            onDeleteTodoList={handleDeleteTodoList}
          />
        ))}
      </div>
      
      {displayGroups.length === 0 && (
        <div className="text-center py-12 border border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">No groups yet. Create your first group to get started.</p>
          <Button onClick={onCreateGroup}>
            <Plus className="h-4 w-4 mr-2" />
            Create First Group
          </Button>
        </div>
      )}
    </div>
  );
};

export default WorkspaceBoard;
