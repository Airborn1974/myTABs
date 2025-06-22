
import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Note, Group } from "@/hooks/useWorkspace"; // Added Group
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Pencil, Save, X, MoreVertical, Trash2, MoveRight } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast"; // Import useToast

interface NoteCardProps {
  note: Note;
  groups: Group[]; // List of all groups for moving
  onUpdate: (updatedNote: Partial<Note>) => void;
  onDelete: () => void;
  onMoveItem: (newGroupId: string) => void; // Function to move the item
}

const NoteCard: React.FC<NoteCardProps> = ({ note, groups, onUpdate, onDelete, onMoveItem }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const { toast } = useToast(); // Initialize useToast

  const handleSave = () => {
    if (title.trim() === "") {
      setTitle(note.title); // Reset to original title
      toast({
        variant: "default", // Or "warning" if you have that variant defined
        title: "Title Reverted",
        description: "Note title cannot be empty. Original title restored.",
      });
      // Do not proceed to onUpdate if the title was empty and reverted,
      // unless you want to save the (potentially changed) content with the original title.
      // For now, we assume if title was made empty, user might want to rethink.
      // If you want to save content changes even if title is reverted:
      // onUpdate({ title: note.title, content });
      // setIsEditing(false);
      return; // Prevent saving with an empty (and now reverted) title
    }
    onUpdate({ title: title.trim(), content }); // Ensure title is trimmed
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTitle(note.title);
    setContent(note.content);
    setIsEditing(false);
  };

  const otherGroups = groups.filter(g => g.id !== note.groupId);

  return (
    <Card className="card-shadow card-hover overflow-hidden animate-fade-in group/card">
      {isEditing ? (
        <>
          <CardHeader className="p-4 pb-0 flex flex-row justify-between items-center">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title"
              className="font-medium text-base" // Ensure consistent text size
            />
            <div className="flex gap-1"> {/* Reduced gap for tighter buttons */}
              <Button
                size="icon" // Changed to icon size
                variant="ghost"
                onClick={handleCancel}
                aria-label="Cancel editing"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                size="icon" // Changed to icon size
                onClick={handleSave}
                aria-label="Save note"
              >
                <Save className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-3"> {/* Adjusted padding */}
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Note content"
              className="min-h-[100px] resize-none text-sm" // Ensure consistent text size
            />
          </CardContent>
        </>
      ) : (
        <>
          <CardHeader className="p-4 pb-0 flex flex-row justify-between items-center">
            <h3 className="font-medium text-base truncate pr-2">{note.title || "Untitled Note"}</h3> {/* Added truncate and padding */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover/card:opacity-100" aria-label={`Actions for note ${note.title || 'Untitled Note'}`}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Note
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <MoveRight className="mr-2 h-4 w-4" />
                    Move to Group
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {otherGroups.length > 0 ? (
                      otherGroups.map((group) => (
                        <DropdownMenuItem key={group.id} onClick={() => onMoveItem(group.id)}>
                          {group.title}
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <DropdownMenuItem disabled>No other groups</DropdownMenuItem>
                    )}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Note
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent className="p-4 pt-3"> {/* Adjusted padding */}
            <div className="whitespace-pre-line text-sm text-muted-foreground break-words"> {/* Added break-words */}
              {note.content || <span className="italic">No content</span>}
            </div>
          </CardContent>
        </>
      )}
    </Card>
  );
};

export default NoteCard;
