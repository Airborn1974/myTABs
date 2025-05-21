
import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { 
  WorkspaceData, 
  Group, 
  Tab, 
  Note, 
  TodoList, 
  TodoItem,
  ItemType, 
  initialWorkspaceData 
} from "@/types/workspace";
import {
  loadDataFromSupabase,
  loadFromLocalStorage,
  saveToLocalStorage,
} from "@/services/workspaceService";
import {
  addWorkspaceItem,
  updateWorkspaceItem,
  deleteWorkspaceItem,
  addWorkspaceGroup,
  updateWorkspaceGroup,
  deleteWorkspaceGroup,
  moveWorkspaceItem,
  toggleWorkspaceBookmark
} from "./workspaceCrud";

const useWorkspaceData = () => {
  const [data, setData] = useState<WorkspaceData>(initialWorkspaceData);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Load data from Supabase when authenticated
  useEffect(() => {
    const initializeData = async () => {
      if (!user) {
        const localData = loadFromLocalStorage();
        setData(localData);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const supabaseData = await loadDataFromSupabase(user.id);
        
        if (supabaseData) {
          setData(supabaseData);
        } else {
          // Fall back to localStorage if Supabase fails
          const localData = loadFromLocalStorage();
          setData(localData);
        }
      } catch (error) {
        console.error("Error initializing data:", error);
        // Fall back to localStorage
        const localData = loadFromLocalStorage();
        setData(localData);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeData();
  }, [user]);

  // Save to localStorage when data changes
  useEffect(() => {
    if (!isLoading) {
      saveToLocalStorage(data);
    }
  }, [data, isLoading]);

  // Wrapper functions that provide a clean API but use the extracted CRUD functions
  const addItem = async (type: ItemType, item: any) => {
    await addWorkspaceItem(type, item, data, setData, user?.id);
  };

  const updateItem = async (type: ItemType, id: string, updates: Partial<Tab | Note | TodoList>) => {
    await updateWorkspaceItem(type, id, updates, data, setData, user?.id);
  };

  const deleteItem = async (type: ItemType, id: string) => {
    await deleteWorkspaceItem(type, id, setData, user?.id);
  };

  const addGroup = async (group: Group) => {
    await addWorkspaceGroup(group, setData, user?.id);
  };

  const updateGroup = async (id: string, updates: Partial<Group>) => {
    await updateWorkspaceGroup(id, updates, setData, user?.id);
  };

  const deleteGroup = async (id: string) => {
    await deleteWorkspaceGroup(id, setData, user?.id);
  };

  const moveItem = async (type: ItemType, id: string, newGroupId: string) => {
    await moveWorkspaceItem(type, id, newGroupId, setData, user?.id);
  };

  const toggleBookmark = async (tabId: string) => {
    await toggleWorkspaceBookmark(tabId, data, setData, user?.id);
  };

  // Get all bookmarked tabs
  const getBookmarkedTabs = (): Tab[] => {
    return data.tabs.filter(tab => tab.bookmarked);
  };

  return {
    data,
    isLoading,
    addItem,
    updateItem,
    deleteItem,
    addGroup,
    updateGroup,
    deleteGroup,
    moveItem,
    toggleBookmark,
    getBookmarkedTabs,
  };
};

export default useWorkspaceData;
export type { WorkspaceData, Group, Tab, Note, TodoList, TodoItem, ItemType };
