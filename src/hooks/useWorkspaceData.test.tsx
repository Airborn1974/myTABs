import { renderHook, act, waitFor } from '@testing-library/react';
import useWorkspaceData, { WorkspaceData, Group, Tab, initialWorkspaceData } from './useWorkspaceData';
import * as workspaceCrud from './workspaceCrud'; // To spy on CRUD functions
import * as workspaceService from '@/services/workspaceService'; // To mock Supabase & localStorage

// Mock workspaceCrud: We want to test that useWorkspaceData calls these,
// but the actual logic of these CRUD functions is tested in workspaceCrud.test.ts
jest.mock('./workspaceCrud', () => ({
  addWorkspaceItem: jest.fn(() => Promise.resolve()),
  updateWorkspaceItem: jest.fn(() => Promise.resolve()),
  deleteWorkspaceItem: jest.fn(() => Promise.resolve()),
  addWorkspaceGroup: jest.fn(() => Promise.resolve()),
  updateWorkspaceGroup: jest.fn(() => Promise.resolve()),
  deleteWorkspaceGroup: jest.fn(() => Promise.resolve()),
  moveWorkspaceItem: jest.fn(() => Promise.resolve()),
  toggleWorkspaceBookmark: jest.fn(() => Promise.resolve()),
}));

// Mock workspaceService (localStorage, Supabase)
jest.mock('@/services/workspaceService', () => ({
  loadDataFromSupabase: jest.fn(() => Promise.resolve(initialWorkspaceData)),
  loadFromLocalStorage: jest.fn(() => initialWorkspaceData),
  saveToLocalStorage: jest.fn(),
  // ... other service functions if needed by useWorkspaceData directly
}));

// Mock useAuth hook
jest.mock('./useAuth', () => ({
  useAuth: jest.fn(() => ({ user: { id: 'test-user' }, /* other auth props */ })),
}));

// Mock chrome API (already done via jest.setup.js and __mocks__/chromeMock.js)
// but we might need to control specific mock implementations for chrome.runtime.onMessage here.

describe('useWorkspaceData Hook', () => {
  let originalChromeRuntimeOnMessage: typeof chrome.runtime.onMessage;
  let mockChromeMessageListener: ((message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => boolean | undefined) | null = null;

  beforeEach(() => {
    // Clear all mocks from workspaceCrud before each test
    Object.values(workspaceCrud).forEach(mockFn => {
      if (jest.isMockFunction(mockFn)) {
        mockFn.mockClear();
      }
    });
    Object.values(workspaceService).forEach(mockFn => {
      if (jest.isMockFunction(mockFn)) {
        mockFn.mockClear();
      }
    });

    // More robust mocking for chrome.runtime.onMessage for this specific test suite
    // This allows us to capture the listener added by useWorkspaceData
    mockChromeMessageListener = null; // Reset
    global.chrome.runtime.onMessage.addListener = jest.fn((listener) => {
      mockChromeMessageListener = listener;
    });
    global.chrome.runtime.onMessage.removeListener = jest.fn();
    global.chrome.runtime.sendMessage = jest.fn(); // Mock sendMessage used for GROUPS_UPDATED
  });


  test('initial data loading (simulating no user, from localStorage)', () => {
    (jest.requireMock('./useAuth').useAuth as jest.Mock).mockReturnValueOnce({ user: null });
    const { result } = renderHook(() => useWorkspaceData());
    expect(workspaceService.loadFromLocalStorage).toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false); // Should be false after initial load
  });

  test('should add item via addItem wrapper', async () => {
    const { result } = renderHook(() => useWorkspaceData());
    const newItem = { title: 'New Test Tab' }; // Simplified item

    await act(async () => {
      await result.current.addItem('tab', newItem);
    });

    expect(workspaceCrud.addWorkspaceItem).toHaveBeenCalledWith(
      'tab',
      newItem,
      expect.anything(), // current data state
      expect.any(Function), // setData function
      'test-user' // userId from useAuth mock
    );
  });

  test('should add group via addGroup wrapper', async () => {
    const { result } = renderHook(() => useWorkspaceData());
    const newGroupData: Group = { id: 'g-new', title: 'New Group from Test', color: 'green', createdAt: '' };

    await act(async () => {
      await result.current.addGroup(newGroupData);
    });

    expect(workspaceCrud.addWorkspaceGroup).toHaveBeenCalledWith(
      newGroupData,
      expect.any(Function), // setData function
      'test-user'
    );
  });


  describe('chrome.runtime.onMessage listener for ADD_TAB_TO_GROUP_REQUEST', () => {
    const mockTabDetails = {
      title: 'Test Tab from Context',
      url: 'http://example.com/context',
      favIconUrl: 'http://example.com/favicon.ico',
    };

    test('handles ADD_TAB_TO_GROUP_REQUEST for an existing group', async () => {
      const { result, rerender } = renderHook(() => useWorkspaceData());

      // Ensure the listener is registered
      expect(global.chrome.runtime.onMessage.addListener).toHaveBeenCalledTimes(1);
      expect(mockChromeMessageListener).not.toBeNull();

      const existingGroupId = 'g1'; // Assume g1 exists or will be added by initial data/mocks
      // You might need to ensure result.current.data.groups contains g1 or mock addGroup to not change it.
      // For simplicity, we rely on addWorkspaceItem being called correctly.

      const message = {
        type: 'ADD_TAB_TO_GROUP_REQUEST',
        tabDetails: mockTabDetails,
        targetGroupId: existingGroupId,
      };

      let sendResponseCalledWith: any;
      const mockSendResponse = jest.fn(response => sendResponseCalledWith = response);

      // Simulate receiving the message
      act(() => {
        if (mockChromeMessageListener) {
          mockChromeMessageListener(message, {} as chrome.runtime.MessageSender, mockSendResponse);
        }
      });

      await waitFor(() => {
        expect(workspaceCrud.addWorkspaceItem).toHaveBeenCalledWith(
          'tab',
          expect.objectContaining({
            title: mockTabDetails.title,
            url: mockTabDetails.url,
            favicon: mockTabDetails.favIconUrl,
            groupId: existingGroupId,
          }),
          expect.anything(),
          expect.any(Function),
          'test-user'
        );
      });
      expect(mockSendResponse).toHaveBeenCalledWith({ status: "received", message: expect.any(String) });
    });

    test('handles ADD_TAB_TO_GROUP_REQUEST for "NEW_GROUP"', async () => {
      const { result, rerender } = renderHook(() => useWorkspaceData());
      expect(global.chrome.runtime.onMessage.addListener).toHaveBeenCalledTimes(1); // Listener registered
      expect(mockChromeMessageListener).not.toBeNull();

      const message = {
        type: 'ADD_TAB_TO_GROUP_REQUEST',
        tabDetails: mockTabDetails,
        targetGroupId: 'NEW_GROUP',
      };

      let sendResponseCalledWith: any;
      const mockSendResponse = jest.fn(response => sendResponseCalledWith = response);

      act(() => {
         if (mockChromeMessageListener) {
          mockChromeMessageListener(message, {} as chrome.runtime.MessageSender, mockSendResponse);
        }
      });

      // Verify addWorkspaceGroup was called for the new group
      await waitFor(() => {
        expect(workspaceCrud.addWorkspaceGroup).toHaveBeenCalledWith(
          expect.objectContaining({
            title: expect.stringMatching(/^New Group \d+$/), // Default name pattern
          }),
          expect.any(Function),
          'test-user'
        );
      });

      // Then verify addWorkspaceItem was called for the tab with the new group's ID
      // This part is a bit more complex because the new group's ID is generated inside the callback
      // We'd need to capture the argument to addWorkspaceGroup, then check addWorkspaceItem.
      // For now, we'll trust that if addWorkspaceGroup is called, the subsequent .then block
      // calls addWorkspaceItem. A more integrated test might be needed if this interaction is fragile.
      // We can at least check it's called again.
      await waitFor(() => {
        expect(workspaceCrud.addWorkspaceItem).toHaveBeenCalledWith(
          'tab',
          expect.objectContaining({
            title: mockTabDetails.title,
            url: mockTabDetails.url,
            // groupId will be the newly generated one
          }),
          expect.anything(),
          expect.any(Function),
          'test-user'
        );
      });
      expect(mockSendResponse).toHaveBeenCalledWith({ status: "received", message: expect.any(String) });
    });

    test('listener is removed on unmount', () => {
      const { unmount } = renderHook(() => useWorkspaceData());
      expect(global.chrome.runtime.onMessage.addListener).toHaveBeenCalledTimes(1);
      unmount();
      expect(global.chrome.runtime.onMessage.removeListener).toHaveBeenCalledTimes(1);
      expect(global.chrome.runtime.onMessage.removeListener).toHaveBeenCalledWith(mockChromeMessageListener);
    });
  });

  // Test for saving groups to chrome.storage.local and sending GROUPS_UPDATED message
  test('saves groups to chrome.storage.local and sends GROUPS_UPDATED message', async () => {
    const { result, rerender } = renderHook(() => useWorkspaceData());

    // Initial call to set up listener + initial data load might trigger it if groups exist
    // Clear any initial calls from setup
    (global.chrome.storage.local.set as jest.Mock).mockClear();
    (global.chrome.runtime.sendMessage as jest.Mock).mockClear();

    // Simulate a change in groups that would trigger the useEffect
    // This typically happens by calling addGroup, deleteGroup, updateGroup
    // For this test, we can manually trigger a rerender with new group data
    // by forcing a new state in the mock that useWorkspaceData uses internally (via workspaceCrud calls).
    // Or, more simply, just call one of the functions that modifies groups.

    const newGroupData: Group = { id: 'g-new-storage-test', title: 'Storage Test Group', color: 'purple', createdAt: '' };
    await act(async () => {
      // This will call addWorkspaceGroup, which updates data, triggering the useEffect
      await result.current.addGroup(newGroupData);
    });

    // Wait for the useEffect that saves to chrome.storage.local to run
    await waitFor(() => {
      expect(global.chrome.storage.local.set).toHaveBeenCalledWith(
        { workspaceGroups: expect.arrayContaining([expect.objectContaining({ id: newGroupData.id })]) },
        expect.any(Function) // Callback
      );
    });

    // Simulate successful set callback for chrome.storage.local.set
    // The callback for set is the second argument.
    const setCallback = (global.chrome.storage.local.set as jest.Mock).mock.calls[0][1];
    act(() => {
      setCallback(); // Call the callback to trigger runtime.sendMessage
    });

    await waitFor(() => {
       expect(global.chrome.runtime.sendMessage).toHaveBeenCalledWith(
        { type: "GROUPS_UPDATED" },
        expect.any(Function)
      );
    });
  });

});
