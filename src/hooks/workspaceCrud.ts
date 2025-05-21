
import { toast } from "@/hooks/use-toast";
import {
  WorkspaceData,
  Group,
  Tab,
  Note,
  TodoList,
  TodoItem,
  ItemType
} from "@/types/workspace";
import {
  addItemToSupabase,
  updateItemInSupabase,
  deleteItemFromSupabase,
  addGroupToSupabase,
  updateGroupInSupabase,
  deleteGroupFromSupabase,
  moveItemInSupabase,
  toggleBookmarkInSupabase,
  handleSupabaseError
} from "@/services/workspaceService";

// Add new item (tab, note, todoList)
export const addWorkspaceItem = async (
  type: ItemType, 
  item: any, 
  data: WorkspaceData, 
  setData: React.Dispatch<React.SetStateAction<WorkspaceData>>,
  userId?: string
) => {
  // Update local state first for immediate feedback
  setData(prev => {
    if (type === "tab") {
      return { ...prev, tabs: [...prev.tabs, item] };
    } else if (type === "note") {
      return { ...prev, notes: [...prev.notes, item] };
    } else if (type === "todo") {
      return { ...prev, todoLists: [...prev.todoLists, item] };
    }
    return prev;
  });
  
  // Then update in Supabase if user is authenticated
  if (userId) {
    try {
      await addItemToSupabase(type, item, userId);
    } catch (error) {
      handleSupabaseError(error, `adding ${type}`);
    }
  }
};

// Update existing item
export const updateWorkspaceItem = async (
  type: ItemType, 
  id: string, 
  updates: Partial<Tab | Note | TodoList>,
  data: WorkspaceData,
  setData: React.Dispatch<React.SetStateAction<WorkspaceData>>,
  userId?: string
) => {
  // Update local state first
  setData(prev => {
    if (type === "tab") {
      return {
        ...prev,
        tabs: prev.tabs.map(tab => tab.id === id ? { ...tab, ...updates } : tab)
      };
    } else if (type === "note") {
      return {
        ...prev,
        notes: prev.notes.map(note => note.id === id ? { ...note, ...updates } : note)
      };
    } else if (type === "todo") {
      return {
        ...prev,
        todoLists: prev.todoLists.map(list => list.id === id ? { ...list, ...updates } : list)
      };
    }
    return prev;
  });
  
  // Then update in Supabase if user is authenticated
  if (userId) {
    try {
      await updateItemInSupabase(type, id, updates, data, userId);
    } catch (error) {
      handleSupabaseError(error, `updating ${type}`);
    }
  }
};

// Delete item
export const deleteWorkspaceItem = async (
  type: ItemType, 
  id: string,
  setData: React.Dispatch<React.SetStateAction<WorkspaceData>>,
  userId?: string
) => {
  // Update local state first
  setData(prev => {
    if (type === "tab") {
      return { ...prev, tabs: prev.tabs.filter(tab => tab.id !== id) };
    } else if (type === "note") {
      return { ...prev, notes: prev.notes.filter(note => note.id !== id) };
    } else if (type === "todo") {
      return { ...prev, todoLists: prev.todoLists.filter(list => list.id !== id) };
    }
    return prev;
  });
  
  // Then delete from Supabase if user is authenticated
  if (userId) {
    try {
      await deleteItemFromSupabase(type, id);
    } catch (error) {
      handleSupabaseError(error, `deleting ${type}`);
    }
  }
};

// Group operations
export const addWorkspaceGroup = async (
  group: Group,
  setData: React.Dispatch<React.SetStateAction<WorkspaceData>>,
  userId?: string
) => {
  // Update local state first
  setData(prev => ({ ...prev, groups: [...prev.groups, group] }));
  
  // Then add to Supabase if user is authenticated
  if (userId) {
    try {
      await addGroupToSupabase(group, userId);
    } catch (error) {
      handleSupabaseError(error, "adding group");
    }
  }
};

export const updateWorkspaceGroup = async (
  id: string, 
  updates: Partial<Group>,
  setData: React.Dispatch<React.SetStateAction<WorkspaceData>>,
  userId?: string
) => {
  // Update local state first
  setData(prev => ({
    ...prev,
    groups: prev.groups.map(group => group.id === id ? { ...group, ...updates } : group)
  }));
  
  // Then update in Supabase if user is authenticated
  if (userId) {
    try {
      await updateGroupInSupabase(id, updates);
    } catch (error) {
      handleSupabaseError(error, "updating group");
    }
  }
};

export const deleteWorkspaceGroup = async (
  id: string,
  setData: React.Dispatch<React.SetStateAction<WorkspaceData>>,
  userId?: string
) => {
  // Update local state first
  setData(prev => ({ ...prev, groups: prev.groups.filter(group => group.id !== id) }));
  
  // Then delete from Supabase if user is authenticated
  if (userId) {
    try {
      await deleteGroupFromSupabase(id);
    } catch (error) {
      handleSupabaseError(error, "deleting group");
    }
  }
};

// Move item to a different group
export const moveWorkspaceItem = async (
  type: ItemType, 
  id: string, 
  newGroupId: string,
  setData: React.Dispatch<React.SetStateAction<WorkspaceData>>,
  userId?: string
) => {
  // Update local state first
  setData(prev => {
    if (type === "tab") {
      return {
        ...prev,
        tabs: prev.tabs.map(tab => tab.id === id ? { ...tab, groupId: newGroupId } : tab)
      };
    } else if (type === "note") {
      return {
        ...prev,
        notes: prev.notes.map(note => note.id === id ? { ...note, groupId: newGroupId } : note)
      };
    } else if (type === "todo") {
      return {
        ...prev,
        todoLists: prev.todoLists.map(list => list.id === id ? { ...list, groupId: newGroupId } : list)
      };
    }
    return prev;
  });
  
  // Then update in Supabase if user is authenticated
  if (userId) {
    try {
      await moveItemInSupabase(type, id, newGroupId);
    } catch (error) {
      handleSupabaseError(error, `moving ${type}`);
    }
  }
};

// Toggle bookmark status for a tab
export const toggleWorkspaceBookmark = async (
  tabId: string,
  data: WorkspaceData,
  setData: React.Dispatch<React.SetStateAction<WorkspaceData>>,
  userId?: string
) => {
  // Get current bookmark status
  const tab = data.tabs.find(tab => tab.id === tabId);
  if (!tab) return;
  
  const newBookmarkedStatus = !tab.bookmarked;
  
  // Update local state first
  setData(prev => ({
    ...prev,
    tabs: prev.tabs.map(tab => 
      tab.id === tabId ? { ...tab, bookmarked: newBookmarkedStatus } : tab
    )
  }));
  
  // Then update in Supabase if user is authenticated
  if (userId) {
    try {
      await toggleBookmarkInSupabase(tabId, newBookmarkedStatus);
    } catch (error) {
      handleSupabaseError(error, "toggling bookmark");
    }
  }
};
