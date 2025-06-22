import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, useNavigate } from 'react-router-dom'; // MemoryRouter for Link components
import Header from './Header';
import { useHotkeys } from 'react-hotkeys-hook';
import { useToast } from '@/hooks/use-toast';

// Mock react-hotkeys-hook
jest.mock('react-hotkeys-hook');

// Mock react-router-dom's useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // import and retain default behavior
  useNavigate: () => mockNavigate, // override useNavigate with mock
}));

// Mock useToast
const mockToast = jest.fn();
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));


describe('Header Component', () => {
  let mockOnCreateNew: jest.Mock;

  beforeEach(() => {
    mockOnCreateNew = jest.fn();
    (useHotkeys as jest.Mock).mockClear();
    mockNavigate.mockClear();
    mockToast.mockClear();
  });

  const renderHeader = (props: Partial<React.ComponentProps<typeof Header>> = {}) => {
    return render(
      <MemoryRouter>
        <Header onCreateNew={mockOnCreateNew} {...props} />
      </MemoryRouter>
    );
  };

  test('renders logo and basic navigation links', () => {
    renderHeader();
    expect(screen.getByText('myTABs')).toBeInTheDocument();
    expect(screen.getByTitle('Settings')).toBeInTheDocument();
    expect(screen.getByTitle('Help')).toBeInTheDocument();
  });

  test('calls onCreateNew when "Create New" button is clicked', () => {
    renderHeader({ onCreateNew: mockOnCreateNew }); // Ensure onCreateNew is passed
    const createNewButton = screen.getByText('Create New');
    fireEvent.click(createNewButton);
    expect(mockOnCreateNew).toHaveBeenCalledTimes(1);
  });

  test('does not render "Create New" button if onCreateNew is not provided', () => {
    renderHeader({onCreateNew: undefined}); // Pass undefined for onCreateNew
    expect(screen.queryByText('Create New')).not.toBeInTheDocument();
  });

  test('registers "mod+shift+t" hotkey for navigating to Tab Management page', () => {
    renderHeader();
    expect(useHotkeys).toHaveBeenCalledWith(
      'mod+shift+t',
      expect.any(Function), // The callback
      { preventDefault: true }, // Options
      undefined // Dependencies array, if not specified, it's undefined or an empty array by default from the mock
    );

    // Optionally, simulate the hotkey callback invocation
    // This requires capturing the callback from the mock call
    const hotkeyCallback = (useHotkeys as jest.Mock).mock.calls.find(
      call => call[0] === 'mod+shift+t'
    )?.[1];

    if (hotkeyCallback) {
      const mockEvent = { preventDefault: jest.fn() };
      hotkeyCallback(mockEvent);
      expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/settings/tabs');
      expect(mockToast).toHaveBeenCalledWith({
        title: "Navigated",
        description: "Opened Tab Management page.",
      });
    } else {
      throw new Error('mod+shift+t hotkey callback not found in mock calls');
    }
  });

  test('Sync button shows toast on click', () => {
    renderHeader();
    fireEvent.click(screen.getByText('Sync'));
    expect(mockToast).toHaveBeenCalledWith({
      title: "Syncing workspace",
      description: "Your workspace is being synced across devices.",
    });
  });

});
