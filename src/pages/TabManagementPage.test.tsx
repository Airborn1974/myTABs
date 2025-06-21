import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TabManagementPage from './TabManagementPage';
import { useWorkspace } from '@/hooks/useWorkspace';
import { Group, Tab, WorkspaceData, initialWorkspaceData } from '@/types/workspace';

// Mock useWorkspace hook
const mockMoveItem = jest.fn();
const mockDeleteItem = jest.fn();
const mockUpdateItem = jest.fn(); // For future edit functionality

const mockGroups: Group[] = [
  { id: 'g1', title: 'Group 1', color: 'red', createdAt: '2023-01-01T00:00:00.000Z' },
  { id: 'g2', title: 'Group 2', color: 'blue', createdAt: '2023-01-01T00:00:00.000Z' },
];
const mockTabs: Tab[] = [
  { id: 't1', title: 'Tab A', url: 'http://example.com/a', groupId: 'g1', favicon: '', bookmarked: false, createdAt: '2023-01-01T00:00:00.000Z' },
  { id: 't2', title: 'Tab B', url: 'http://example.com/b', groupId: 'g2', favicon: '', bookmarked: false, createdAt: '2023-01-01T00:00:00.000Z' },
  { id: 't3', title: 'Tab C', url: 'http://example.com/c', groupId: 'g1', favicon: '', bookmarked: false, createdAt: '2023-01-01T00:00:00.000Z' },
];

jest.mock('@/hooks/useWorkspace', () => ({
  useWorkspace: jest.fn(() => ({
    data: {
      tabs: mockTabs,
      groups: mockGroups,
      notes: [],
      todoLists: [],
      isLoading: false,
    } as WorkspaceData, // Cast to satisfy WorkspaceData type if initialWorkspaceData is not complete
    isLoading: false,
    deleteItem: mockDeleteItem,
    updateItem: mockUpdateItem,
    moveItem: mockMoveItem,
    // Add any other functions/data your page might use
  })),
}));

// Mock child components if they are complex and tested separately, or to simplify page tests.
// For now, we'll test interactions that trigger props on these components.
// jest.mock('@/components/ui/table', () => ({
//   ...jest.requireActual('@/components/ui/table'), // Keep original Table, TableBody etc.
//   // Mock specific sub-components if they cause issues or have heavy logic
// }));
// jest.mock('@/components/ui/dropdown-menu', () => ({
//   ...jest.requireActual('@/components/ui/dropdown-menu'),
// }));
// jest.mock('@/components/ui/button', () => ({
//   ...jest.requireActual('@/components/ui/button'),
// }));


describe('TabManagementPage', () => {
  beforeEach(() => {
    mockMoveItem.mockClear();
    mockDeleteItem.mockClear();
    mockUpdateItem.mockClear();
    (useWorkspace as jest.Mock).mockImplementation(() => ({
        data: {
            tabs: mockTabs,
            groups: mockGroups,
            notes: [],
            todoLists: [],
        } as WorkspaceData,
        isLoading: false,
        deleteItem: mockDeleteItem,
        updateItem: mockUpdateItem,
        moveItem: mockMoveItem,
    }));
  });

  test('renders loading state initially', () => {
    (useWorkspace as jest.Mock).mockImplementationOnce(() => ({
      data: initialWorkspaceData, // Or an empty state
      isLoading: true,
      deleteItem: mockDeleteItem,
      updateItem: mockUpdateItem,
      moveItem: mockMoveItem,
    }));
    render(<TabManagementPage />);
    expect(screen.getByText('Loading tab data...')).toBeInTheDocument();
  });

  test('renders page title and table with tabs', () => {
    render(<TabManagementPage />);
    expect(screen.getByRole('heading', { name: /Tab Management/i })).toBeInTheDocument();

    // Check for table headers
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('URL')).toBeInTheDocument();
    expect(screen.getByText('Group')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();

    // Check for tab data
    mockTabs.forEach(tab => {
      expect(screen.getByText(tab.title)).toBeInTheDocument();
      expect(screen.getByText(tab.url)).toBeInTheDocument();
      const group = mockGroups.find(g => g.id === tab.groupId);
      expect(screen.getAllByText(group?.title || 'Unassigned').length).toBeGreaterThan(0);
    });
  });

  test('delete action calls deleteItem with correct parameters', async () => {
    render(<TabManagementPage />);
    const firstTab = mockTabs[0];

    // Find the action menu for the first tab
    // This assumes each row has a unique way to find its menu; aria-label on trigger could be tab specific
    const actionMenuTriggers = screen.getAllByRole('button', { name: /morehorizontal/i });
    fireEvent.click(actionMenuTriggers[0]); // Click the first tab's action menu

    await screen.findByText('Delete'); // Wait for menu item to be visible
    fireEvent.click(screen.getByText('Delete'));

    expect(mockDeleteItem).toHaveBeenCalledTimes(1);
    expect(mockDeleteItem).toHaveBeenCalledWith('tab', firstTab.id);
  });

  test('move to group action calls moveItem with correct parameters', async () => {
    render(<TabManagementPage />);
    const firstTab = mockTabs[0]; // Belongs to g1
    const targetGroup = mockGroups[1]; // g2

    const actionMenuTriggers = screen.getAllByRole('button', { name: /morehorizontal/i });
    fireEvent.click(actionMenuTriggers[0]);

    await screen.findByText('Move to Group');
    fireEvent.click(screen.getByText('Move to Group')); // Open sub-menu

    await screen.findByText(targetGroup.title); // Wait for target group to be visible in sub-menu
    fireEvent.click(screen.getByText(targetGroup.title));

    expect(mockMoveItem).toHaveBeenCalledTimes(1);
    expect(mockMoveItem).toHaveBeenCalledWith('tab', firstTab.id, targetGroup.id);
  });

  test('displays "No tabs found" when there are no tabs', () => {
    (useWorkspace as jest.Mock).mockImplementationOnce(() => ({
      data: { ...initialWorkspaceData, groups: mockGroups }, // Has groups but no tabs
      isLoading: false,
      deleteItem: mockDeleteItem,
      updateItem: mockUpdateItem,
      moveItem: mockMoveItem,
    }));
    render(<TabManagementPage />);
    expect(screen.getByText('No tabs found.')).toBeInTheDocument();
  });

  test('move to group sub-menu shows "No other groups" if only one group exists or tab is in no group and only one group exists', async () => {
    const singleGroup = [{ id: 'g1', title: 'Group 1', color: 'red', createdAt: '2023-01-01T00:00:00.000Z' }];
    const tabInSingleGroup = [{ ...mockTabs[0], groupId: 'g1'}];
    (useWorkspace as jest.Mock).mockImplementationOnce(() => ({
      data: { tabs: tabInSingleGroup, groups: singleGroup, notes: [], todoLists:[] } as WorkspaceData,
      isLoading: false,
      deleteItem: mockDeleteItem,
      updateItem: mockUpdateItem,
      moveItem: mockMoveItem,
    }));
    render(<TabManagementPage />);

    const actionMenuTriggers = screen.getAllByRole('button', { name: /morehorizontal/i });
    fireEvent.click(actionMenuTriggers[0]);

    await screen.findByText('Move to Group');
    fireEvent.click(screen.getByText('Move to Group'));

    await screen.findByText('No other groups');
    expect(screen.getByText('No other groups')).toBeInTheDocument();
  });

  // TODO: Test for "Edit" dialog and functionality once implemented
  // TODO: Test for filtering and sorting once implemented
  // TODO: Test for bulk actions once implemented
});
