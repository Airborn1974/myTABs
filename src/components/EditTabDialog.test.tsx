import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditTabDialog, { EditTabDialogProps } from './EditTabDialog';
import { Tab } from '@/types/workspace';
import { useToast } from '@/hooks/use-toast';

// Mock useToast
const mockToast = jest.fn();
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

const mockTab: Tab = {
  id: 'tab1',
  title: 'Original Title',
  url: 'http://original.com',
  groupId: 'group1',
  favicon: '',
  bookmarked: false,
  createdAt: new Date().toISOString(),
};

describe('EditTabDialog Component', () => {
  let mockOnOpenChange: jest.Mock;
  let mockOnSave: jest.Mock;

  const defaultProps: EditTabDialogProps = {
    open: true,
    onOpenChange: jest.fn(),
    tab: mockTab,
    onSave: jest.fn(),
  };

  beforeEach(() => {
    mockOnOpenChange = jest.fn();
    mockOnSave = jest.fn();
    mockToast.mockClear();
    defaultProps.onOpenChange = mockOnOpenChange;
    defaultProps.onSave = mockOnSave;
    defaultProps.tab = { ...mockTab }; // Reset tab prop
    defaultProps.open = true; // Default to open for most tests
  });

  const renderDialog = (props?: Partial<EditTabDialogProps>) => {
    return render(<EditTabDialog {...defaultProps} {...props} />);
  };

  test('renders dialog with title, input fields, and buttons when open and tab is provided', () => {
    renderDialog();
    expect(screen.getByRole('heading', { name: /Edit Tab/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/URL/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save changes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
  });

  test('input fields are pre-filled with tab data', () => {
    renderDialog();
    expect(screen.getByLabelText(/Title/i)).toHaveValue(mockTab.title);
    expect(screen.getByLabelText(/URL/i)).toHaveValue(mockTab.url);
  });

  test('input field changes update state', () => {
    renderDialog();
    const titleInput = screen.getByLabelText(/Title/i);
    const urlInput = screen.getByLabelText(/URL/i);

    fireEvent.change(titleInput, { target: { value: 'New Title' } });
    fireEvent.change(urlInput, { target: { value: 'http://new.com' } });

    expect(titleInput).toHaveValue('New Title');
    expect(urlInput).toHaveValue('http://new.com');
  });

  test('Cancel button calls onOpenChange(false)', () => {
    renderDialog();
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  test('DialogClose (X button) calls onOpenChange(false)', () => {
    renderDialog();
    // DialogClose is usually a button with an X icon, often without explicit text,
    // but it's part of the dialog structure.
    // ShadCN Dialog typically has a button with class "absolute right-4 top-4" for close.
    // We can look for a button with an aria-label if available, or role 'button' and assume it's the X.
    // For a more robust test, ensure the DialogClose button has an explicit aria-label="Close"
    const closeButton = screen.getByRole('button', { name: /Close/i }); // ShadCN Dialog has this by default
    fireEvent.click(closeButton);
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });


  test('Save button calls onSave and onOpenChange(false) with valid input', () => {
    renderDialog();
    const newTitle = 'Updated Title';
    const newUrl = 'http://updated.com';

    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: newTitle } });
    fireEvent.change(screen.getByLabelText(/URL/i), { target: { value: newUrl } });
    fireEvent.click(screen.getByRole('button', { name: /Save changes/i }));

    expect(mockOnSave).toHaveBeenCalledWith(mockTab.id, newTitle, newUrl);
    expect(mockOnOpenChange).toHaveBeenCalledWith(false); // Dialog should close
  });

  test('Save button shows toast and does not call onSave if title is empty', () => {
    renderDialog();
    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /Save changes/i }));

    expect(mockToast).toHaveBeenCalledWith({
      variant: 'destructive',
      title: 'Validation Error',
      description: 'Title cannot be empty.',
    });
    expect(mockOnSave).not.toHaveBeenCalled();
    expect(mockOnOpenChange).not.toHaveBeenCalledWith(false); // Dialog should remain open
  });

  test('Save button shows toast and does not call onSave if URL is empty', () => {
    renderDialog();
    fireEvent.change(screen.getByLabelText(/URL/i), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /Save changes/i }));

    expect(mockToast).toHaveBeenCalledWith({
      variant: 'destructive',
      title: 'Validation Error',
      description: 'URL cannot be empty.',
    });
    expect(mockOnSave).not.toHaveBeenCalled();
    expect(mockOnOpenChange).not.toHaveBeenCalledWith(false);
  });

  test('Save button shows toast for invalid URL format', () => {
    renderDialog();
    fireEvent.change(screen.getByLabelText(/URL/i), { target: { value: 'invalid-url' } });
    fireEvent.click(screen.getByRole('button', { name: /Save changes/i }));

    expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please enter a valid URL (e.g., http://example.com or /path).',
    });
    expect(mockOnSave).not.toHaveBeenCalled();
    expect(mockOnOpenChange).not.toHaveBeenCalledWith(false);
  });


  test('does not render content if tab prop is null (though open prop controls visibility)', () => {
    // The component returns null if tab is null, so Dialog won't even try to render its content.
    // The Dialog's visibility itself is controlled by `open`.
    // If open is true but tab is null, the component returns null.
    const { container } = renderDialog({ tab: null });
    // Check that the dialog's typical inner content isn't there.
    // For example, the specific title "Edit Tab" should not be found.
    expect(screen.queryByRole('heading', { name: /Edit Tab/i })).not.toBeInTheDocument();
    // The container might still have Dialog's portal structure if open=true, but not the form.
    // If open is false, Dialog doesn't render anything to the main DOM.
  });

  test('fields are initialized/updated correctly when tab prop changes while dialog is open', () => {
    const { rerender } = renderDialog({ tab: mockTab });
    expect(screen.getByLabelText(/Title/i)).toHaveValue(mockTab.title);

    const newMockTab: Tab = { ...mockTab, id: 'tab2', title: 'Another Title', url: 'http://another.com' };
    rerender(<EditTabDialog {...defaultProps} tab={newMockTab} open={true} />);

    expect(screen.getByLabelText(/Title/i)).toHaveValue(newMockTab.title);
    expect(screen.getByLabelText(/URL/i)).toHaveValue(newMockTab.url);
  });

  test('fields are reset or retain old values if dialog is closed and reopened without tab change (current behavior: retains due to useEffect dependency on `tab`)', () => {
    // This test depends on the exact logic in useEffect.
    // Current useEffect: if (tab && open) { setTitle(tab.title); setUrl(tab.url); }
    // This means if `open` becomes false, then true again, but `tab` object instance is the same,
    // the fields will re-initialize from that `tab` prop. If `tab` prop is cleared (set to null)
    // when dialog closes, then it's different. Let's assume parent clears `tab` prop.
    const { rerender } = renderDialog({ tab: mockTab, open: true });
    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'Temporary Change' } });
    expect(screen.getByLabelText(/Title/i)).toHaveValue('Temporary Change');

    // Simulate closing and reopening with the same tab prop instance
    rerender(<EditTabDialog {...defaultProps} tab={mockTab} open={false} />);
    rerender(<EditTabDialog {...defaultProps} tab={mockTab} open={true} />);

    // Should re-initialize from mockTab.title because of useEffect [tab, open]
    expect(screen.getByLabelText(/Title/i)).toHaveValue(mockTab.title);
  });

});
