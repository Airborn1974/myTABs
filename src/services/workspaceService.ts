
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { 
  WorkspaceData, 
  Group, 
  Tab, 
  Note, 
  TodoList, 
  TodoItem, 
  initialWorkspaceData 
} from "@/types/workspace";

// Helper function for Supabase error handling
export const handleSupabaseError = (error: any, operation: string) => {
  console.error(`Error during ${operation}:`, error);
  toast({
    title: `Error during ${operation}`,
    description: error.message || "Something went wrong",
    variant: "destructive",
  });
};

// Load data from Supabase
export const loadDataFromSupabase = async (userId: string): Promise<WorkspaceData | null> => {
  try {
    // Load groups
    const { data: groupsData, error: groupsError } = await supabase
      .from('groups')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (groupsError) throw groupsError;
    
    // If user has no groups, create default groups
    if (groupsData.length === 0) {
      // Use initialWorkspaceData to create default groups
      for (const group of initialWorkspaceData.groups) {
        const { error } = await supabase.from('groups').insert({
          title: group.title,
          color: group.color,
          user_id: userId,
          id: group.id
        });
        if (error) throw error;
      }
      
      // Load newly created groups
      const { data: newGroupsData, error: newGroupsError } = await supabase
        .from('groups')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (newGroupsError) throw newGroupsError;
      
      // Map Supabase data to our format
      const groups: Group[] = newGroupsData.map(group => ({
        id: group.id,
        title: group.title,
        color: group.color
      }));
      
      // Create initial sample data for new users
      await createSampleData(userId, groups);
      
      // Load all data after creating samples
      return await loadAllData(userId, groups);
    } else {
      // Map existing groups
      const groups: Group[] = groupsData.map(group => ({
        id: group.id,
        title: group.title,
        color: group.color
      }));
      
      // Load rest of the data using these existing groups
      return await loadAllData(userId, groups);
    }
  } catch (error) {
    console.error('Error loading data from Supabase:', error);
    return null;
  }
};

// Create sample data for new users
export const createSampleData = async (userId: string, groups: Group[]) => {
  try {
    // Add sample tabs
    for (const tab of initialWorkspaceData.tabs) {
      await supabase.from('tabs').insert({
        title: tab.title,
        url: tab.url,
        favicon: tab.favicon,
        group_id: tab.groupId,
        user_id: userId,
        bookmarked: tab.bookmarked || false
      });
    }
    
    // Add sample notes
    for (const note of initialWorkspaceData.notes) {
      await supabase.from('notes').insert({
        title: note.title,
        content: note.content,
        group_id: note.groupId,
        user_id: userId
      });
    }
    
    // Add sample todo lists and items
    for (const todoList of initialWorkspaceData.todoLists) {
      const { data: newList } = await supabase.from('todo_lists').insert({
        title: todoList.title,
        group_id: todoList.groupId,
        user_id: userId
      }).select('id').single();
      
      if (newList && todoList.items.length > 0) {
        for (const item of todoList.items) {
          await supabase.from('todo_items').insert({
            text: item.text,
            completed: item.completed,
            todo_list_id: newList.id,
            user_id: userId
          });
        }
      }
    }
  } catch (error) {
    console.error('Error creating sample data:', error);
  }
};

// Load all data from Supabase
export const loadAllData = async (userId: string, groups: Group[]): Promise<WorkspaceData> => {
  try {
    // Load tabs
    const { data: tabsData, error: tabsError } = await supabase
      .from('tabs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (tabsError) throw tabsError;
    
    const tabs: Tab[] = tabsData.map(tab => ({
      id: tab.id,
      title: tab.title,
      url: tab.url,
      favicon: tab.favicon || undefined,
      groupId: tab.group_id,
      bookmarked: tab.bookmarked || false
    }));
    
    // Load notes
    const { data: notesData, error: notesError } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (notesError) throw notesError;
    
    const notes: Note[] = notesData.map(note => ({
      id: note.id,
      title: note.title,
      content: note.content,
      groupId: note.group_id
    }));
    
    // Load todo lists
    const { data: todoListsData, error: todoListsError } = await supabase
      .from('todo_lists')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (todoListsError) throw todoListsError;
    
    // Load todo items for each list
    const todoLists: TodoList[] = await Promise.all(todoListsData.map(async (todoList) => {
      const { data: todoItemsData, error: todoItemsError } = await supabase
        .from('todo_items')
        .select('*')
        .eq('todo_list_id', todoList.id)
        .order('created_at', { ascending: true });
      
      if (todoItemsError) throw todoItemsError;
      
      const items: TodoItem[] = todoItemsData.map(item => ({
        id: item.id,
        text: item.text,
        completed: item.completed || false
      }));
      
      return {
        id: todoList.id,
        title: todoList.title,
        items,
        groupId: todoList.group_id
      };
    }));
    
    // Return all data
    return {
      groups,
      tabs,
      notes,
      todoLists
    };
  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  }
};

// Load data from local storage
export const loadFromLocalStorage = (): WorkspaceData => {
  const savedData = localStorage.getItem("workspaceData");
  if (savedData) {
    try {
      return JSON.parse(savedData);
    } catch (e) {
      console.error("Failed to parse workspace data from localStorage", e);
    }
  }
  return initialWorkspaceData;
};

// Save data to local storage
export const saveToLocalStorage = (data: WorkspaceData): void => {
  localStorage.setItem("workspaceData", JSON.stringify(data));
};

// CRUD operations for Supabase

// Add item to Supabase
export const addItemToSupabase = async (type: string, item: any, userId: string): Promise<void> => {
  try {
    if (type === "tab") {
      await supabase.from('tabs').insert({
        id: item.id,
        title: item.title,
        url: item.url,
        favicon: item.favicon,
        group_id: item.groupId,
        bookmarked: item.bookmarked || false,
        user_id: userId
      });
    } 
    else if (type === "note") {
      await supabase.from('notes').insert({
        id: item.id,
        title: item.title,
        content: item.content,
        group_id: item.groupId,
        user_id: userId
      });
    } 
    else if (type === "todo") {
      // Create todo list
      const { data: todoList, error: todoListError } = await supabase
        .from('todo_lists')
        .insert({
          id: item.id,
          title: item.title,
          group_id: item.groupId,
          user_id: userId
        })
        .select('id')
        .single();
        
      if (todoListError) throw todoListError;
      
      // Create todo items if there are any
      if (item.items && item.items.length > 0) {
        const todoItemsToInsert = item.items.map((todoItem: TodoItem) => ({
          id: todoItem.id,
          text: todoItem.text,
          completed: todoItem.completed,
          todo_list_id: todoList.id,
          user_id: userId
        }));
        
        await supabase.from('todo_items').insert(todoItemsToInsert);
      }
    }
  } catch (error) {
    handleSupabaseError(error, `adding ${type}`);
    throw error;
  }
};

// Update item in Supabase
export const updateItemInSupabase = async (type: string, id: string, updates: any, data: WorkspaceData, userId: string): Promise<void> => {
  try {
    let supabaseUpdates: Record<string, any> = {};

    if (type === "tab") {
      if (updates.title !== undefined) supabaseUpdates.title = updates.title;
      if (updates.url !== undefined) supabaseUpdates.url = updates.url;
      if (updates.favicon !== undefined) supabaseUpdates.favicon = updates.favicon;
      if (updates.bookmarked !== undefined) supabaseUpdates.bookmarked = updates.bookmarked;
      if (updates.groupId !== undefined) supabaseUpdates.group_id = updates.groupId;
      // Add other Tab fields here if they become updatable

      if (Object.keys(supabaseUpdates).length > 0) {
        await supabase.from('tabs').update(supabaseUpdates).eq('id', id);
      }
    } 
    else if (type === "note") {
      if (updates.title !== undefined) supabaseUpdates.title = updates.title;
      if (updates.content !== undefined) supabaseUpdates.content = updates.content;
      if (updates.groupId !== undefined) supabaseUpdates.group_id = updates.groupId;
      // Add other Note fields here

      if (Object.keys(supabaseUpdates).length > 0) {
        await supabase.from('notes').update(supabaseUpdates).eq('id', id);
      }
    } 
    else if (type === "todo") {
      // Handle TodoList specific fields (title, groupId)
      let todoListUpdates: Record<string, any> = {};
      if (updates.title !== undefined) todoListUpdates.title = updates.title;
      if (updates.groupId !== undefined) todoListUpdates.group_id = updates.groupId;

      if (Object.keys(todoListUpdates).length > 0) {
        await supabase.from('todo_lists').update(todoListUpdates).eq('id', id);
      }
      
      // Handle TodoItems within the TodoList
      if (updates.items !== undefined) {
        const updatedItems = updates.items as TodoItem[];
        
        // First get current items from database
        const { data: currentItems, error: fetchError } = await supabase
          .from('todo_items')
          .select('*')
          .eq('todo_list_id', id);
          
        if (fetchError) throw fetchError;
        
        // Identify items to insert, update, and delete
        const currentItemsMap = new Map(currentItems.map(item => [item.id, item]));
        const updatedItemsMap = new Map(updatedItems.map(item => [item.id, item]));
        
        // Items to insert (exist in updated but not in current)
        const itemsToInsert = updatedItems.filter(item => !currentItemsMap.has(item.id))
          .map(item => ({
            id: item.id,
            text: item.text,
            completed: item.completed,
            todo_list_id: id,
            user_id: userId
          }));
          
        // Items to update (exist in both)
        const itemsToUpdate = updatedItems.filter(item => currentItemsMap.has(item.id));
        
        // Items to delete (exist in current but not in updated)
        const itemsToDelete = currentItems.filter(item => !updatedItemsMap.has(item.id))
          .map(item => item.id);
        
        // Execute operations
        if (itemsToInsert.length > 0) {
          await supabase.from('todo_items').insert(itemsToInsert);
        }
        
        for (const item of itemsToUpdate) {
          await supabase
            .from('todo_items')
            .update({
              text: item.text,
              completed: item.completed
            })
            .eq('id', item.id);
        }
        
        if (itemsToDelete.length > 0) {
          await supabase
            .from('todo_items')
            .delete()
            .in('id', itemsToDelete);
        }
      }
    }
  } catch (error) {
    handleSupabaseError(error, `updating ${type}`);
    throw error;
  }
};

// Delete item from Supabase
export const deleteItemFromSupabase = async (type: string, id: string): Promise<void> => {
  try {
    if (type === "tab") {
      await supabase.from('tabs').delete().eq('id', id);
    } 
    else if (type === "note") {
      await supabase.from('notes').delete().eq('id', id);
    } 
    else if (type === "todo") {
      // Delete todo list (cascade will remove items)
      await supabase.from('todo_lists').delete().eq('id', id);
    }
  } catch (error) {
    handleSupabaseError(error, `deleting ${type}`);
    throw error;
  }
};

// Group operations
export const addGroupToSupabase = async (group: Group, userId: string): Promise<void> => {
  try {
    await supabase.from('groups').insert({
      id: group.id,
      title: group.title,
      color: group.color,
      user_id: userId
    });
  } catch (error) {
    handleSupabaseError(error, "adding group");
    throw error;
  }
};

export const updateGroupInSupabase = async (id: string, updates: Partial<Group>): Promise<void> => {
  try {
    await supabase.from('groups').update(updates).eq('id', id);
  } catch (error) {
    handleSupabaseError(error, "updating group");
    throw error;
  }
};

export const deleteGroupFromSupabase = async (id: string): Promise<void> => {
  try {
    await supabase.from('groups').delete().eq('id', id);
  } catch (error) {
    handleSupabaseError(error, "deleting group");
    throw error;
  }
};

// Move item to a different group
export const moveItemInSupabase = async (type: string, id: string, newGroupId: string): Promise<void> => {
  try {
    if (type === "tab") {
      await supabase
        .from('tabs')
        .update({ group_id: newGroupId })
        .eq('id', id);
    } 
    else if (type === "note") {
      await supabase
        .from('notes')
        .update({ group_id: newGroupId })
        .eq('id', id);
    } 
    else if (type === "todo") {
      await supabase
        .from('todo_lists')
        .update({ group_id: newGroupId })
        .eq('id', id);
    }
  } catch (error) {
    handleSupabaseError(error, `moving ${type}`);
    throw error;
  }
};

// Toggle bookmark status for a tab
export const toggleBookmarkInSupabase = async (tabId: string, newStatus: boolean): Promise<void> => {
  try {
    await supabase
      .from('tabs')
      .update({ bookmarked: newStatus })
      .eq('id', tabId);
  } catch (error) {
    handleSupabaseError(error, "toggling bookmark");
    throw error;
  }
};
