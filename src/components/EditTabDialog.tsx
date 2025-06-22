import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tab } from '@/types/workspace'; // Assuming Tab type is available
import { useToast } from '@/hooks/use-toast';

export interface EditTabDialogProps {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
  tab: Tab | null; // Tab can be null if no tab is selected for editing
  onSave: (tabId: string, newTitle: string, newUrl: string) => void;
}

const EditTabDialog: React.FC<EditTabDialogProps> = ({ open, onOpenChange, tab, onSave }) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (tab && open) {
      setTitle(tab.title);
      setUrl(tab.url);
    } else if (!open) {
      // Reset fields when dialog is closed if desired, or on next open if tab is different
      // setTitle('');
      // setUrl('');
    }
  }, [tab, open]);

  const handleSave = () => {
    if (!tab) return;

    const trimmedTitle = title.trim();
    const trimmedUrl = url.trim();

    if (!trimmedTitle) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Title cannot be empty.',
      });
      return;
    }

    if (!trimmedUrl) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'URL cannot be empty.',
      });
      return;
    }

    // Basic URL validation (starts with http/https or is a relative path)
    // More robust validation might be needed for production
    if (!trimmedUrl.match(/^(https?:\/\/|^\/|^\.?\/)/i)) {
        toast({
            variant: 'destructive',
            title: 'Validation Error',
            description: 'Please enter a valid URL (e.g., http://example.com or /path).',
        });
        return;
    }


    onSave(tab.id, trimmedTitle, trimmedUrl);
    onOpenChange(false); // Close dialog on save
  };

  const handleDialogClose = (isOpen: boolean) => {
    if (!isOpen) {
      // Optionally reset state when dialog is closed via X, Escape, or overlay click
      // setTitle(tab?.title || '');
      // setUrl(tab?.url || '');
    }
    onOpenChange(isOpen);
  };


  if (!tab) {
    // Don't render the dialog content if no tab is provided,
    // or handle it gracefully if `open` could be true without a tab.
    // For this setup, Dialog's open prop will control visibility.
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Tab</DialogTitle>
          <DialogDescription>
            Make changes to your saved tab details here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              placeholder="Enter tab title"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="url" className="text-right">
              URL
            </Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="col-span-3"
              placeholder="https://example.com"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditTabDialog;
