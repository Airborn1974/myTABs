import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Index from './Index';
import { useHotkeys } from 'react-hotkeys-hook';
import { useToast } from '@/hooks/use-toast';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useAuth } from '@/hooks/useAuth';
// import { useSaveActiveTab } from '@/hooks/useSaveActiveTab'; // We will use the actual hook
import BrowserService from '@/services/BrowserService'; // Import to mock its methods
import { initialWorkspaceData, Tab } from '@/types/workspace'; // Import Tab type

// Mock hooks
jest.mock('react-hotkeys-hook');

// Mock BrowserService
jest.mock('@/services/BrowserService');

const mockToast = jest.fn();
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

const mockSetIsCreateGroupDialogOpen = jest.fn();
// We need to control the state for CreateGroupDialog for one of the shortcuts
// This is tricky because useState is internal to Index. We can check its effects.

const mockAddGroup = jest.fn();
const mockAddItem = jest.fn();
// const mockSaveActiveTab = jest.fn(); // No longer mocking the whole hook

jest.mock('@/hooks/useWorkspace', () => ({
  useWorkspace: jest.fn(() => ({
    data: {
      ...initialWorkspaceData,
      groups: [{ id: 'g1', title: 'Default Group', color: 'blue', createdAt: '' }],
    },
    isLoading: false,
    addItem: mockAddItem, // This is what useSaveActiveTab will call
    addGroup: mockAddGroup,
    deleteItem: jest.fn(),
    toggleBookmark: jest.fn(),
    getBookmarkedTabs: jest.fn(() => []),
    // other necessary functions/data from useWorkspace
  })),
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(() => ({
    user: { email: 'test@example.com' },
    signOut: jest.fn(),
    // other auth context values
  })),
}));

// jest.mock('@/hooks/useSaveActiveTab', () => ({ // Undoing this mock
//   useSaveActiveTab: jest.fn(() => ({
//     saveActiveTab: mockSaveActiveTab,
//   })),
// }));


describe('Index Page', () => {
  const mockActiveTabDetails = {
    title: 'Mock Active Tab',
    url: 'http://example.com/active',
    favIconUrl: 'http://example.com/active.ico',
  };

  beforeEach(() => {
    (useHotkeys as jest.Mock).mockClear();
    mockToast.mockClear();
    // mockSaveActiveTab.mockClear(); // Not used directly anymore
    mockAddItem.mockClear();
    mockAddGroup.mockClear();

    // Mock BrowserService.getActiveTab for each test
    (BrowserService.getActiveTab as jest.Mock).mockResolvedValue(mockActiveTabDetails);

    (useWorkspace as jest.Mock).mockImplementation(() => ({
        data: {
            ...initialWorkspaceData,
            groups: [{ id: 'g1', title: 'Default Group', color: 'blue', createdAt:'' }],
        },
        isLoading: false,
        addItem: mockAddItem,
        addGroup: mockAddGroup,
        deleteItem: jest.fn(),
        toggleBookmark: jest.fn(),
        getBookmarkedTabs: jest.fn(() => []),
    }));
  });

  const renderIndexPage = () => {
    return render(
      <MemoryRouter>
        <Index />
      </MemoryRouter>
    );
  };

  test('renders header and workspace board', () => {
    renderIndexPage();
    expect(screen.getByText('myTABs')).toBeInTheDocument(); // From Header
    expect(screen.getByRole('heading', { name: /Groups/i })).toBeInTheDocument(); // From WorkspaceBoard
  });

  test('registers "mod+shift+g" hotkey for opening Create Group dialog', () => {
    renderIndexPage();
    expect(useHotkeys).toHaveBeenCalledWith(
      'mod+shift+g',
      expect.any(Function),
      { preventDefault: true },
      expect.arrayContaining([expect.any(Function), mockToast]) // Dependencies including setIsCreateGroupDialogOpen and toast
    );

    // Simulate the hotkey callback
    const hotkeyCallback = (useHotkeys as jest.Mock).mock.calls.find(
      call => call[0] === 'mod+shift+g'
    )?.[1];

    if (hotkeyCallback) {
      const mockEvent = { preventDefault: jest.fn() };
      hotkeyCallback(mockEvent);
      expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
      // Check if dialog opened - This is tricky. We can check for toast.
      // Or, if setIsCreateGroupDialogOpen was passed to useHotkeys, we could check its mock.
      // For now, checking toast is a good side effect.
      expect(mockToast).toHaveBeenCalledWith({
        title: "Action Triggered",
        description: "Create New Group dialog opened via shortcut.",
      });
      // To truly test dialog opening, CreateGroupDialog would need to be non-modal or its presence checked.
      // Let's assume the toast is sufficient proof of the callback logic for now.
      // We can also check if the dialog component itself becomes visible if it's straightforward.
      // For example, if the dialog has a distinct title when open:
      // await screen.findByRole('heading', { name: /Create New Group/i }); // Assuming Dialog has such a title
    } else {
      throw new Error('mod+shift+g hotkey callback not found');
    }
  });

  test('registers "mod+shift+s" hotkey for saving current tab and calls addItem', async () => {
    renderIndexPage();
    const { data } = (useWorkspace as jest.Mock)();

    // Find the hotkey registration for 'mod+shift+s'
    const hotkeyRegistration = (useHotkeys as jest.Mock).mock.calls.find(
      call => call[0] === 'mod+shift+s'
    );
    expect(hotkeyRegistration).toBeDefined();

    // Check dependencies: saveActiveTab (from the actual hook), selectedGroup, data.groups
    // The saveActiveTab function instance will be different each render, so expect.any(Function)
    expect(hotkeyRegistration[3]).toEqual(expect.arrayContaining([expect.any(Function), '', data.groups]));

    const hotkeyCallback = hotkeyRegistration[1];

    const mockEvent = { preventDefault: jest.fn() };
    await act(async () => {
      await hotkeyCallback(mockEvent);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
    expect(BrowserService.getActiveTab).toHaveBeenCalledTimes(1);

    const expectedGroupId = data.groups.length > 0 ? data.groups[0].id : undefined;
    expect(mockAddItem).toHaveBeenCalledWith(
      'tab',
      expect.objectContaining({
        title: mockActiveTabDetails.title,
        url: mockActiveTabDetails.url,
        favicon: mockActiveTabDetails.favIconUrl,
        groupId: expectedGroupId,
        bookmarked: false,
      })
    );
    // Toast is handled within useSaveActiveTab, check if it was called (indirectly)
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: "Tab Saved",
      description: `Successfully saved "${mockActiveTabDetails.title}".`,
    }));
  });

  test('handles "mod+shift+s" when getActiveTab returns null', async () => {
    (BrowserService.getActiveTab as jest.Mock).mockResolvedValue(null); // Simulate no active tab
    renderIndexPage();

    const hotkeyCallback = (useHotkeys as jest.Mock).mock.calls.find(
      call => call[0] === 'mod+shift+s'
    )?.[1];

    if (hotkeyCallback) {
      const mockEvent = { preventDefault: jest.fn() };
      await act(async () => {
        await hotkeyCallback(mockEvent);
      });
      expect(mockAddItem).not.toHaveBeenCalled();
      expect(mockToast).toHaveBeenCalledWith({
        title: "No active tab found",
        description: "Could not determine the active tab or URL is missing.",
        variant: "destructive",
      });
    } else {
      throw new Error('mod+shift+s hotkey callback not found for null tab test');
    }
  });

  // Test for CreateGroupDialog opening after mod+shift+g
  // This requires the dialog to be part of the Index component's render output
  // and to become visible based on state that the hotkey changes.
  test('Create Group dialog becomes visible after "mod+shift+g" hotkey', async () => {
    renderIndexPage();
    const hotkeyCallback = (useHotkeys as jest.Mock).mock.calls.find(
      call => call[0] === 'mod+shift+g'
    )?.[1];

    if (hotkeyCallback) {
      const mockEvent = { preventDefault: jest.fn() };
      hotkeyCallback(mockEvent); // Trigger the state change for dialog

      // Assuming CreateGroupDialog has a distinct title or element when open
      // The dialog might take a moment to render due to state change.
      await waitFor(() => {
        // Check for an element that is unique to the CreateGroupDialog
        // For example, if it has a title "Create New Group"
        expect(screen.getByText('Create a New Group')).toBeVisible(); // Adjust if title is different
      });
    } else {
      throw new Error('mod+shift+g hotkey callback not found for dialog visibility test');
    }
  });

});
