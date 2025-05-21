
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateGroup: (title: string, color: string) => void;
}

const CreateGroupDialog: React.FC<CreateGroupDialogProps> = ({
  open,
  onOpenChange,
  onCreateGroup,
}) => {
  const [title, setTitle] = useState("");
  const [color, setColor] = useState("#4f46e5"); // Default color
  const { toast } = useToast();

  const resetForm = () => {
    setTitle("");
    setColor("#4f46e5");
  };

  const handleCreateGroup = () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please provide a group title",
        variant: "destructive",
      });
      return;
    }

    try {
      onCreateGroup(title, color);
      toast({
        title: "Success",
        description: "Group created successfully",
      });
      resetForm();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong, please try again",
        variant: "destructive",
      });
    }
  };

  const predefinedColors = [
    "#4f46e5", // Purple
    "#14b8a6", // Teal
    "#ef4444", // Red
    "#f59e0b", // Amber
    "#10b981", // Green
    "#8b5cf6", // Violet
    "#ec4899", // Pink
    "#6366f1", // Indigo
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
          <DialogDescription>
            Add a new group to organize your tabs, notes, and to-dos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="group-title">Group Title</Label>
            <Input
              id="group-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Work, Personal, Project, etc."
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {predefinedColors.map((predefinedColor) => (
                <button
                  key={predefinedColor}
                  type="button"
                  className={`h-8 w-8 rounded-full ${
                    color === predefinedColor ? "ring-2 ring-offset-2 ring-primary" : ""
                  }`}
                  style={{ backgroundColor: predefinedColor }}
                  onClick={() => setColor(predefinedColor)}
                  aria-label={`Select ${predefinedColor} color`}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateGroup}>Create Group</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupDialog;
