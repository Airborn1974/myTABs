import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TabGroup from './TabGroup';
import { Group, Tab, Note, TodoList } from '@/hooks/useWorkspace'; // Adjust path as needed
import { useWorkspace } from '@/hooks/useWorkspace'; // To mock toggleBookmark

import { useToast } from '@/hooks/use-toast'; // Import useToast for mocking

// Mock useWorkspace hook
jest.mock('@/hooks/useWorkspace', () => ({
  useWorkspace: jest.fn(() => ({
    toggleBookmark: jest.fn(),
  })),
}));

// Mock useToast
const mockToast = jest.fn();
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

const mockGroup: Group = {
  id: 'group1',
  title: 'Test Group',
  color: '#FF0000',
  createdAt: new Date().toISOString(),
};

const mockTabs: Tab[] = [
  { id: 'tab1', title: 'Test Tab 1', url: 'http://example.com/tab1', groupId: 'group1', favicon: '', bookmarked: false, createdAt: new Date().toISOString() },
];
const mockNotes: Note[] = [];
const mockTodoLists: TodoList[] = [];
const mockAllGroups: Group[] = [mockGroup, { id: 'group2', title: 'Another Group', color: '#00FF00', createdAt: new Date().toISOString()}];

describe('TabGroup Component', () => {
  let mockOnRenameGroup: jest.Mock;
  let mockOnDeleteGroup: jest.Mock;
  let mockOnDeleteTab: jest.Mock;

  beforeEach(() => {
    mockOnRenameGroup = jest.fn();
    mockOnDeleteGroup = jest.fn();
    mockOnDeleteTab = jest.fn();
    mockToast.mockClear(); // Clear toast mock calls
    (useWorkspace as jest.Mock).mockImplementation(() => ({
      toggleBookmark: jest.fn(),
    }));
  });

  const renderComponent = (props: Partial<React.ComponentProps<typeof TabGroup>> = {}) => {
    const defaultProps: React.ComponentProps<typeof TabGroup> = {
      group: mockGroup,
      tabs: mockTabs,
      notes: mockNotes,
      todoLists: mockTodoLists,
      allGroups: mockAllGroups,
      onDeleteTab: mockOnDeleteTab,
      onUpdateNote: jest.fn(),
      onDeleteNote: jest.fn(),
      onUpdateTodoList: jest.fn(),
      onDeleteTodoList: jest.fn(),
      onRenameGroup: mockOnRenameGroup,
      onDeleteGroup: mockOnDeleteGroup,
      onMoveTab: jest.fn(),
      onMoveNote: jest.fn(),
      onMoveTodoList: jest.fn(),
      ...props,
    };
    return render(<TabGroup {...defaultProps} />);
  };

  test('renders group title and item count', () => {
    renderComponent();
    expect(screen.getByText(mockGroup.title)).toBeInTheDocument();
    expect(screen.getByText(`${mockTabs.length} items`)).toBeInTheDocument(); // Assumes only tabs are present
  });

  test('dropdown menu for group actions is present and opens', () => {
    renderComponent();
    const menuTrigger = screen.getByLabelText('Group actions');
    expect(menuTrigger).toBeInTheDocument();
    fireEvent.click(menuTrigger);

    expect(screen.getByText('Rename Group')).toBeVisible();
    expect(screen.getByText('Delete Group')).toBeVisible();
  });

  test('rename dialog opens, updates input, and calls onRenameGroup', async () => {
    renderComponent();
    const menuTrigger = screen.getByLabelText('Group actions');
    fireEvent.click(menuTrigger);
    fireEvent.click(screen.getByText('Rename Group'));

    // Dialog and input should be visible
    await screen.findByRole('dialog'); // Wait for dialog to appear
    expect(screen.getByRole('dialog')).toBeVisible();
    const input = screen.getByPlaceholderText('Enter new group name');
    expect(input).toHaveValue(mockGroup.title);

    const newGroupName = 'Updated Test Group';
    fireEvent.change(input, { target: { value: newGroupName } });
    expect(input).toHaveValue(newGroupName);

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(mockOnRenameGroup).toHaveBeenCalledTimes(1);
    expect(mockOnRenameGroup).toHaveBeenCalledWith(mockGroup.id, newGroupName);
  });

  test('rename dialog shows toast and does not call onRenameGroup if name is empty', async () => {
    renderComponent();
    const menuTrigger = screen.getByLabelText('Group actions');
    fireEvent.click(menuTrigger);
    fireEvent.click(screen.getByText('Rename Group'));

    await screen.findByRole('dialog');
    const input = screen.getByPlaceholderText('Enter new group name');

    fireEvent.change(input, { target: { value: '  ' } }); // Empty name with spaces
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(mockToast).toHaveBeenCalledWith({
      variant: "destructive",
      title: "Rename Failed",
      description: "Group name cannot be empty.",
    });
    expect(mockOnRenameGroup).not.toHaveBeenCalled();
  });

  test('delete confirmation dialog opens and calls onDeleteGroup', async () => {
    renderComponent();
    const menuTrigger = screen.getByLabelText('Group actions');
    fireEvent.click(menuTrigger);
    fireEvent.click(screen.getByText('Delete Group'));

    await screen.findByRole('dialog');
    expect(screen.getByRole('dialog')).toBeVisible();
    expect(screen.getByText('Are you sure you want to delete this group?')).toBeVisible();

    // Find the specific delete button within the dialog
    const deleteButtonInDialog = screen.getByRole('button', { name: 'Delete' });
    fireEvent.click(deleteButtonInDialog);

    expect(mockOnDeleteGroup).toHaveBeenCalledTimes(1);
    expect(mockOnDeleteGroup).toHaveBeenCalledWith(mockGroup.id);

    // Dialog should close
    // waitFor(() => {
    //   expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    // });
  });

  test('renders TabCard with correct props', () => {
    renderComponent();
    // Check if TabCard is rendered (e.g., by looking for tab title)
    expect(screen.getByText(mockTabs[0].title)).toBeInTheDocument();
    // Further tests for TabCard props (like groups for moving, onDeleteTab etc.)
    // would be more involved, requiring mocking TabCard or checking its internal elements.
    // For now, ensuring it renders is a good start.
  });

});
