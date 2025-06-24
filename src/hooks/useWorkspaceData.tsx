
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
  toggleWorkspaceBookmark,
  reorderWorkspaceGroups // Added reorderWorkspaceGroups
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

  // Save groups to chrome.storage.local for background script access
  useEffect(() => {
    if (!isLoading && data.groups && typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ workspaceGroups: data.groups }, () => {
        if (chrome.runtime.lastError) {
          console.error("Error saving groups to chrome.storage.local:", chrome.runtime.lastError.message);
        } else {
          // console.log("Groups saved to chrome.storage.local");
          // Send a message to background script to update context menus
          chrome.runtime.sendMessage({ type: "GROUPS_UPDATED" }, response => {
            if (chrome.runtime.lastError) {
              // This can happen if the background script isn't listening (e.g., during development hot reloads)
              // console.warn("Could not send GROUPS_UPDATED message to background:", chrome.runtime.lastError.message);
            }
          });
        }
      });
    }
  }, [data.groups, isLoading]);

  // Listen for messages from background script (e.g., context menu clicks)
  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onMessage) {
      const messageListener = (message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
        if (message.type === "ADD_TAB_TO_GROUP_REQUEST") {
          // console.log("useWorkspaceData: Received ADD_TAB_TO_GROUP_REQUEST", message);
          const { tabDetails, targetGroupId } = message;
          const newTab: Omit<Tab, 'id' | 'groupId'> = { // Omit id and groupId as they'll be set
            title: tabDetails.title || "Untitled Tab",
            url: tabDetails.url,
            favicon: tabDetails.favIconUrl,
            bookmarked: false,
            createdAt: new Date().toISOString(),
          };

          if (targetGroupId === "NEW_GROUP") {
            // Create a new group first
            const newGroupTitle = `New Group ${data.groups.length + 1}`; // Simple default name
            const newGroupColor = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`; // Random color
            const newGroup: Group = {
              id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              title: newGroupTitle,
              color: newGroupColor,
              createdAt: new Date().toISOString(),
            };
            addGroup(newGroup).then(() => {
              // Add tab to the newly created group
              addItem("tab", { ...newTab, id: `tab-${Date.now()}`, groupId: newGroup.id });
            });
          } else {
            // Add tab to existing group
            addItem("tab", { ...newTab, id: `tab-${Date.now()}`, groupId: targetGroupId });
          }
          sendResponse({ status: "received", message: "Tab addition request processed by useWorkspaceData." });
          return true; // Indicate async response
        }
        return false; // No async response for other types
      };

      chrome.runtime.onMessage.addListener(messageListener);
      // console.log("useWorkspaceData: ADD_TAB_TO_GROUP_REQUEST listener added.");

      return () => {
        chrome.runtime.onMessage.removeListener(messageListener);
        // console.log("useWorkspaceData: ADD_TAB_TO_GROUP_REQUEST listener removed.");
      };
    }
  }, [data.groups, addItem, addGroup]); // addGroup and data.groups are dependencies for NEW_GROUP logic

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
    await deleteWorkspaceGroup(id, data, setData, user?.id); // Pass data here
  };

  const moveItem = async (type: ItemType, id: string, newGroupId: string) => {
    await moveWorkspaceItem(type, id, newGroupId, setData, user?.id);
  };

  const toggleBookmark = async (tabId: string) => {
    await toggleWorkspaceBookmark(tabId, data, setData, user?.id);
  };

  const reorderGroups = async (oldIndex: number, newIndex: number) => {
    await reorderWorkspaceGroups(oldIndex, newIndex, setData, user?.id);
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
    reorderGroups, // Added reorderGroups
    getBookmarkedTabs,
  };
};

export default useWorkspaceData;
export type { WorkspaceData, Group, Tab, Note, TodoList, TodoItem, ItemType };
