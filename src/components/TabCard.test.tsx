import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TabCard, { TabCardProps } from './TabCard'; // Assuming TabCardProps is exported if needed, or define locally
import { Tab, Group } from '@/types/workspace'; // Adjust if Tab/Group types are elsewhere
import { useToast } from '@/hooks/use-toast';

// Mock useToast
const mockToastFn = jest.fn();
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToastFn,
  }),
}));

// Sample data for tests
const mockTabInstance: Tab = {
  id: 't1',
  title: 'Test Tab',
  url: 'http://example.com',
  groupId: 'g1',
  favicon: '',
  bookmarked: false,
  createdAt: new Date().toISOString(),
};

const mockGroupsData: Group[] = [
  { id: 'g1', title: 'Group 1', color: 'red', createdAt: '2023-01-01T00:00:00.000Z' },
  { id: 'g2', title: 'Group 2', color: 'blue', createdAt: '2023-01-01T00:00:00.000Z' },
];


describe('TabCard Component', () => {
  let mockOnDelete: jest.Mock;
  let mockOnToggleBookmark: jest.Mock;
  let mockOnMoveItem: jest.Mock;
  let mockOnEdit: jest.Mock;

  beforeEach(() => {
    mockOnDelete = jest.fn();
    mockOnToggleBookmark = jest.fn();
    mockOnMoveItem = jest.fn();
    mockOnEdit = jest.fn();
    mockToastFn.mockClear();
  });

  const renderTabCard = (tabProps: Partial<TabCardProps> = {}) => {
    const defaultTestProps: TabCardProps = {
      tab: mockTabInstance,
      groups: mockGroupsData,
      onDelete: mockOnDelete,
      onToggleBookmark: mockOnToggleBookmark,
      onMoveItem: mockOnMoveItem,
      onEdit: mockOnEdit,
      ...tabProps,
    };
    // Ensure window.open is mocked for the "Open Link" test
    global.open = jest.fn();

    return render(<TabCard {...defaultTestProps} />);
  };

  test('renders tab title and URL', () => {
    renderTabCard();
    expect(screen.getByText(mockTabInstance.title)).toBeInTheDocument();
    expect(screen.getByText(mockTabInstance.url)).toBeInTheDocument();
  });

  test('dropdown menu opens and shows core actions', () => {
    renderTabCard();
    const menuTrigger = screen.getByLabelText(`Actions for tab ${mockTabInstance.title}`);
    fireEvent.click(menuTrigger);

    expect(screen.getByText('Open Link')).toBeVisible();
    expect(screen.getByText('Add Bookmark')).toBeVisible(); // Assuming not bookmarked initially
    expect(screen.getByText('Edit Tab')).toBeVisible();
    expect(screen.getByText('Move to Group')).toBeVisible();
    expect(screen.getByText('Delete Tab')).toBeVisible();
  });

  test('Open Link calls window.open', () => {
    renderTabCard();
    const menuTrigger = screen.getByLabelText(`Actions for tab ${mockTabInstance.title}`);
    fireEvent.click(menuTrigger);
    fireEvent.click(screen.getByText('Open Link'));
    expect(global.open).toHaveBeenCalledWith(mockTabInstance.url, '_blank');
  });


  test('calls onToggleBookmark and shows toast when bookmark action is clicked', () => {
    renderTabCard();
    const menuTrigger = screen.getByLabelText(`Actions for tab ${mockTabInstance.title}`);
    fireEvent.click(menuTrigger);
    fireEvent.click(screen.getByText('Add Bookmark'));

    expect(mockOnToggleBookmark).toHaveBeenCalledTimes(1);
    expect(mockToastFn).toHaveBeenCalledWith({
      title: "Added to bookmarks",
      description: mockTabInstance.title,
    });
  });

  test('calls onEdit with tab data when "Edit Tab" is clicked', () => {
    renderTabCard();
    const menuTrigger = screen.getByLabelText(`Actions for tab ${mockTabInstance.title}`);
    fireEvent.click(menuTrigger);
    fireEvent.click(screen.getByText('Edit Tab'));

    expect(mockOnEdit).toHaveBeenCalledTimes(1);
    expect(mockOnEdit).toHaveBeenCalledWith(mockTabInstance);
  });

  test('calls onMoveItem when a group is selected from "Move to Group" sub-menu', () => {
    renderTabCard();
    const menuTrigger = screen.getByLabelText(`Actions for tab ${mockTabInstance.title}`);
    fireEvent.click(menuTrigger);
    fireEvent.click(screen.getByText('Move to Group')); // Open sub-menu

    const targetGroup = mockGroupsData.find(g => g.id !== mockTabInstance.groupId);
    if (!targetGroup) throw new Error("Test setup error: Need at least one other group to move to.");

    fireEvent.click(screen.getByText(targetGroup.title)); // Click on the other group

    expect(mockOnMoveItem).toHaveBeenCalledTimes(1);
    expect(mockOnMoveItem).toHaveBeenCalledWith(targetGroup.id);
  });

  test('calls onDelete when "Delete Tab" is clicked', () => {
    renderTabCard();
    const menuTrigger = screen.getByLabelText(`Actions for tab ${mockTabInstance.title}`);
    fireEvent.click(menuTrigger);
    fireEvent.click(screen.getByText('Delete Tab'));

    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });

  test('renders favicon and handles error correctly', () => {
    const favIconUrl = 'http://example.com/favicon.png';
    renderTabCard({ tab: { ...mockTabInstance, favicon: favIconUrl } });
    const img = screen.getByRole('img') as HTMLImageElement;
    expect(img.src).toBe(favIconUrl);

    fireEvent.error(img);
    expect(img.src).toContain('placeholder.svg');
  });
});
