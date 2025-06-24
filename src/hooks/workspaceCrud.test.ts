import {
  addWorkspaceGroup,
  updateWorkspaceGroup,
  deleteWorkspaceGroup,
  addWorkspaceItem,
  updateWorkspaceItem, // Added updateWorkspaceItem
  moveWorkspaceItem,
  deleteWorkspaceItem,
  reorderWorkspaceGroups, // Added reorderWorkspaceGroups
} from './workspaceCrud';
import { WorkspaceData, Group, Tab, Note, TodoList, ItemType, initialWorkspaceData } from '@/types/workspace';
import * as workspaceService from '@/services/workspaceService'; // To mock Supabase functions
import { arrayMove } from '@dnd-kit/sortable'; // For reorder test verification

// Mock the workspaceService module that handles Supabase calls
jest.mock('@/services/workspaceService', () => ({
  addGroupToSupabase: jest.fn(() => Promise.resolve()),
  updateGroupInSupabase: jest.fn(() => Promise.resolve()),
  deleteGroupFromSupabase: jest.fn(() => Promise.resolve()),
  addItemToSupabase: jest.fn(() => Promise.resolve()),
  updateItemInSupabase: jest.fn(() => Promise.resolve()),
  deleteItemFromSupabase: jest.fn(() => Promise.resolve()),
  moveItemInSupabase: jest.fn(() => Promise.resolve()),
  toggleBookmarkInSupabase: jest.fn(() => Promise.resolve()),
  // loadDataFromSupabase: jest.fn(), // Not directly used by CRUD functions here
  // handleSupabaseError: jest.fn(), // Can be mocked if specific error paths are tested
}));

describe('workspaceCrud Functions', () => {
  let mockSetData: jest.Mock;
  let currentData: WorkspaceData;
  const userId = 'test-user-id';

  beforeEach(() => {
    currentData = JSON.parse(JSON.stringify(initialWorkspaceData)); // Deep copy
    mockSetData = jest.fn(updater => {
      if (typeof updater === 'function') {
        currentData = updater(currentData);
      } else {
        currentData = updater;
      }
    });
    // Clear all mocks from workspaceService before each test
    Object.values(workspaceService).forEach(mockFn => {
      if (jest.isMockFunction(mockFn)) {
        mockFn.mockClear();
      }
    });
  });

  // Helper to add initial data for testing updates/deletes
  // Extended to include more groups for reordering tests
  const setupInitialData = () => {
    const group1: Group = { id: 'g1', title: 'Group 1', color: 'red', createdAt: '1' };
    const group2: Group = { id: 'g2', title: 'Group 2', color: 'blue', createdAt: '2' };
    const group3: Group = { id: 'g3', title: 'Group 3', color: 'green', createdAt: '3' };
    currentData.groups = [group1, group2, group3];

    const tab1: Tab = { id: 't1', title: 'Tab 1', url: 'url1', groupId: 'g1', favicon:'', bookmarked: false, createdAt: '1' };
    const tab2: Tab = { id: 't2', title: 'Tab 2', url: 'url2', groupId: 'g1', favicon:'', bookmarked: false, createdAt: '2' };
    const note1: Note = { id: 'n1', title: 'Note 1', content: 'content1', groupId: 'g1', createdAt: '1' };
    currentData.tabs = [tab1, tab2];
    currentData.notes = [note1];
    currentData.todoLists = []; // Ensure it's initialized
  };


  describe('updateWorkspaceGroup', () => {
    test('should update group title in state and call Supabase', async () => {
      setupInitialData();
      const groupIdToUpdate = 'g1';
      const updates: Partial<Group> = { title: 'Updated Group 1 Title' };

      await updateWorkspaceGroup(groupIdToUpdate, updates, mockSetData, userId);

      // Check state update
      expect(mockSetData).toHaveBeenCalledTimes(1);
      const updatedGroup = currentData.groups.find(g => g.id === groupIdToUpdate);
      expect(updatedGroup).toBeDefined();
      expect(updatedGroup?.title).toBe(updates.title);

      // Check Supabase call
      expect(workspaceService.updateGroupInSupabase).toHaveBeenCalledTimes(1);
      expect(workspaceService.updateGroupInSupabase).toHaveBeenCalledWith(groupIdToUpdate, updates);
    });
  });

  describe('deleteWorkspaceGroup', () => {
    test('should remove group and its items from state and call Supabase', async () => {
      setupInitialData(); // g1 has 2 tabs, 1 note
      const groupIdToDelete = 'g1';

      // Need to pass the *current* data state to deleteWorkspaceGroup
      // because it reads data.tabs, data.notes etc. to find items to delete.
      // The `data` argument in deleteWorkspaceGroup refers to the state *before* this specific deletion.
      const dataBeforeDelete = JSON.parse(JSON.stringify(currentData));


      await deleteWorkspaceGroup(groupIdToDelete, dataBeforeDelete, mockSetData, userId);

      // Check state update for group
      expect(mockSetData).toHaveBeenCalledTimes(1);
      expect(currentData.groups.find(g => g.id === groupIdToDelete)).toBeUndefined();
      expect(currentData.groups.length).toBe(1); // g2 should remain

      // Check state update for items
      expect(currentData.tabs.filter(t => t.groupId === groupIdToDelete).length).toBe(0);
      expect(currentData.tabs.length).toBe(0); // All tabs were in g1
      expect(currentData.notes.filter(n => n.groupId === groupIdToDelete).length).toBe(0);
      expect(currentData.notes.length).toBe(0); // All notes were in g1

      // Check Supabase calls
      expect(workspaceService.deleteItemFromSupabase).toHaveBeenCalledTimes(3); // t1, t2, n1
      expect(workspaceService.deleteItemFromSupabase).toHaveBeenCalledWith('tab', 't1');
      expect(workspaceService.deleteItemFromSupabase).toHaveBeenCalledWith('tab', 't2');
      expect(workspaceService.deleteItemFromSupabase).toHaveBeenCalledWith('note', 'n1');
      expect(workspaceService.deleteGroupFromSupabase).toHaveBeenCalledTimes(1);
      expect(workspaceService.deleteGroupFromSupabase).toHaveBeenCalledWith(groupIdToDelete);
    });
  });

  describe('moveWorkspaceItem', () => {
    test('should update item\'s groupId in state and call Supabase', async () => {
      setupInitialData();
      const itemIdToMove = 't1'; // A tab
      const newGroupId = 'g2';

      await moveWorkspaceItem('tab', itemIdToMove, newGroupId, mockSetData, userId);

      // Check state update
      expect(mockSetData).toHaveBeenCalledTimes(1);
      const movedItem = currentData.tabs.find(t => t.id === itemIdToMove);
      expect(movedItem).toBeDefined();
      expect(movedItem?.groupId).toBe(newGroupId);

      // Check Supabase call
      expect(workspaceService.moveItemInSupabase).toHaveBeenCalledTimes(1);
      expect(workspaceService.moveItemInSupabase).toHaveBeenCalledWith('tab', itemIdToMove, newGroupId);
    });
  });

  describe('updateWorkspaceItem', () => {
    test('should update tab title in state and call Supabase', async () => {
      setupInitialData();
      const tabIdToUpdate = 't1';
      const updates: Partial<Tab> = { title: 'Updated Tab 1 Title' };
      const dataBeforeUpdate = JSON.parse(JSON.stringify(currentData));


      await updateWorkspaceItem('tab', tabIdToUpdate, updates, dataBeforeUpdate, mockSetData, userId);

      // Check state update
      expect(mockSetData).toHaveBeenCalledTimes(1);
      const updatedTab = currentData.tabs.find(t => t.id === tabIdToUpdate);
      expect(updatedTab).toBeDefined();
      expect(updatedTab?.title).toBe(updates.title);
      expect(updatedTab?.url).toBe(dataBeforeUpdate.tabs.find(t => t.id === tabIdToUpdate)?.url); // Other fields unchanged

      // Check Supabase call
      expect(workspaceService.updateItemInSupabase).toHaveBeenCalledTimes(1);
      expect(workspaceService.updateItemInSupabase).toHaveBeenCalledWith('tab', tabIdToUpdate, updates, dataBeforeUpdate, userId);
    });

    test('should update note content in state and call Supabase', async () => {
        setupInitialData();
        const noteIdToUpdate = 'n1';
        const updates: Partial<Note> = { content: 'Updated Note Content' };
        const dataBeforeUpdate = JSON.parse(JSON.stringify(currentData));

        await updateWorkspaceItem('note', noteIdToUpdate, updates, dataBeforeUpdate, mockSetData, userId);

        // Check state update
        expect(mockSetData).toHaveBeenCalledTimes(1);
        const updatedNote = currentData.notes.find(n => n.id === noteIdToUpdate);
        expect(updatedNote).toBeDefined();
        expect(updatedNote?.content).toBe(updates.content);
        expect(updatedNote?.title).toBe(dataBeforeUpdate.notes.find(n => n.id === noteIdToUpdate)?.title); // Other fields unchanged

        // Check Supabase call
        expect(workspaceService.updateItemInSupabase).toHaveBeenCalledTimes(1);
        expect(workspaceService.updateItemInSupabase).toHaveBeenCalledWith('note', noteIdToUpdate, updates, dataBeforeUpdate, userId);
      });
  });

  describe('reorderWorkspaceGroups', () => {
    test('should reorder groups in state and NOT call Supabase (yet)', async () => {
      setupInitialData(); // Has g1, g2, g3
      const oldIndex = 0; // g1
      const newIndex = 2; // Move g1 to the end (g2, g3, g1)

      const originalGroups = [...currentData.groups];

      await reorderWorkspaceGroups(oldIndex, newIndex, mockSetData, userId);

      // Check state update
      expect(mockSetData).toHaveBeenCalledTimes(1);
      const expectedOrder = arrayMove(originalGroups, oldIndex, newIndex);
      expect(currentData.groups.map(g => g.id)).toEqual(expectedOrder.map(g => g.id));
      expect(currentData.groups[newIndex].id).toBe(originalGroups[oldIndex].id);


      // Check Supabase call (should NOT be called for now as per TODO)
      // This assumes no Supabase function is named e.g., `reorderGroupsInSupabase` yet
      Object.keys(workspaceService).forEach(key => {
        if (key.toLowerCase().includes('reorder') || key.toLowerCase().includes('grouporder')) {
          expect(workspaceService[key as keyof typeof workspaceService]).not.toHaveBeenCalled();
        }
      });
       // Verify no other Supabase modification calls were made for this specific operation
       expect(workspaceService.updateGroupInSupabase).not.toHaveBeenCalled();
       expect(workspaceService.addGroupToSupabase).not.toHaveBeenCalled();
       expect(workspaceService.deleteGroupFromSupabase).not.toHaveBeenCalled();
    });
  });
});
