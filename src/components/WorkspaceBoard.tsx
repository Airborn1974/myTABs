import React from "react";
import TabGroup from "./TabGroup";
import { Button } from "@/components/ui/button";
import { Plus, GripVertical } from "lucide-react"; // Added GripVertical
import { useWorkspace, Group, Note, Tab, TodoList } from "@/hooks/useWorkspace";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy, // Using grid-compatible strategy
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Define a new prop type for the sortable TabGroup
interface SortableTabGroupProps {
  id: string;
  group: Group;
  tabs: Tab[];
  notes: Note[];
  todoLists: TodoList[];
  allGroups: Group[];
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

// Create a wrapper component for TabGroup to make it sortable
const SortableTabGroup: React.FC<SortableTabGroupProps> = (props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined, // Ensure dragging item is on top
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="relative group/sortable">
      {/* Drag Handle - only appears on hover of the sortable item */}
      <div
        {...listeners}
        className="absolute top-2 right-12 p-1 cursor-grab opacity-0 group-hover/sortable:opacity-100 transition-opacity"
        aria-label="Drag to reorder group"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <TabGroup {...props} />
    </div>
  );
};


interface WorkspaceBoardProps {
  onCreateGroup: () => void;
  groups?: Group[];
}

const WorkspaceBoard: React.FC<WorkspaceBoardProps> = ({
  onCreateGroup,
  // groups prop is not used for displayGroups, data.groups from useWorkspace is the source of truth.
  // This prop could be used for filtering if needed in the future, but for now, we rely on the hook.
}) => {
  const { data, deleteItem, updateItem, moveItem, updateGroup, deleteGroup, reorderGroups } = useWorkspace();

  // data.groups is the source of truth for the groups to display and reorder
  const displayGroups = data.groups;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = displayGroups.findIndex((g) => g.id === active.id);
      const newIndex = displayGroups.findIndex((g) => g.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderGroups(oldIndex, newIndex);
      }
    }
  };

  const handleDeleteTab = (tabId: string) => {
    deleteItem("tab", tabId);
  };

  const handleUpdateNote = (noteId: string, updates: Partial<Note>) => {
    updateItem("note", noteId, updates);
  };

  const handleDeleteNote = (noteId: string) => {
    deleteItem("note", noteId);
  };

  const handleUpdateTodoList = (
    todoListId: string,
    updates: Partial<TodoList>,
  ) => {
    updateItem("todo", todoListId, updates);
  };

  const handleDeleteTodoList = (todoListId: string) => {
    deleteItem("todo", todoListId);
  };

  const getTabsForGroup = (groupId: string): Tab[] => {
    return data.tabs.filter((tab) => tab.groupId === groupId);
  };

  const getNotesForGroup = (groupId: string): Note[] => {
    return data.notes.filter((note) => note.groupId === groupId);
  };

  const getTodoListsForGroup = (groupId: string): TodoList[] => {
    return data.todoLists.filter((todoList) => todoList.groupId === groupId);
  };

  return (
    <div className="w-full py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Groups</h2>
        <Button onClick={onCreateGroup} className="gap-1">
          <Plus className="h-4 w-4" />
          Create Group
        </Button>
      </div>

      {displayGroups.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">
            No groups yet. Create your first group to get started.
          </p>
          <Button onClick={onCreateGroup}>
            <Plus className="h-4 w-4 mr-2" />
            Create First Group
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={displayGroups.map(g => g.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayGroups.map((group: Group) => (
                <SortableTabGroup
                  key={group.id}
                  id={group.id} // Important for dnd-kit
                  group={group}
                  tabs={getTabsForGroup(group.id)}
                  notes={getNotesForGroup(group.id)}
                  todoLists={getTodoListsForGroup(group.id)}
                  allGroups={data.groups}
                  onDeleteTab={handleDeleteTab}
                  onUpdateNote={handleUpdateNote}
                  onDeleteNote={handleDeleteNote}
                  onUpdateTodoList={handleUpdateTodoList}
                  onDeleteTodoList={handleDeleteTodoList}
                  onRenameGroup={(groupId, newTitle) => updateGroup(groupId, { title: newTitle })}
                  onDeleteGroup={deleteGroup}
                  onMoveTab={(itemId, newGroupId) => moveItem("tab", itemId, newGroupId)}
                  onMoveNote={(itemId, newGroupId) => moveItem("note", itemId, newGroupId)}
                  onMoveTodoList={(itemId, newGroupId) => moveItem("todo", itemId, newGroupId)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

export default WorkspaceBoard;
