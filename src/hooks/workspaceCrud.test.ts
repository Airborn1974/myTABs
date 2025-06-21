import {
  addWorkspaceGroup,
  updateWorkspaceGroup,
  deleteWorkspaceGroup,
  addWorkspaceItem,
  moveWorkspaceItem,
  deleteWorkspaceItem,
} from './workspaceCrud';
import { WorkspaceData, Group, Tab, Note, TodoList, ItemType, initialWorkspaceData } from '@/types/workspace';
import * as workspaceService from '@/services/workspaceService'; // To mock Supabase functions

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
  const setupInitialData = () => {
    const group1: Group = { id: 'g1', title: 'Group 1', color: 'red', createdAt: '' };
    const group2: Group = { id: 'g2', title: 'Group 2', color: 'blue', createdAt: '' };
    currentData.groups = [group1, group2];

    const tab1: Tab = { id: 't1', title: 'Tab 1', url: 'url1', groupId: 'g1', favicon:'', bookmarked: false, createdAt: '' };
    const tab2: Tab = { id: 't2', title: 'Tab 2', url: 'url2', groupId: 'g1', favicon:'', bookmarked: false, createdAt: '' };
    const note1: Note = { id: 'n1', title: 'Note 1', content: 'content1', groupId: 'g1', createdAt: '' };
    currentData.tabs = [tab1, tab2];
    currentData.notes = [note1];
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
});
