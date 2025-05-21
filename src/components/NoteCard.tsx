
import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Note } from "@/hooks/useWorkspaceData";
import { Pencil, Save, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface NoteCardProps {
  note: Note;
  onUpdate: (updatedNote: Partial<Note>) => void;
  onDelete: () => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  const handleSave = () => {
    onUpdate({ title, content });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTitle(note.title);
    setContent(note.content);
    setIsEditing(false);
  };

  return (
    <Card className="card-shadow card-hover overflow-hidden animate-fade-in">
      {isEditing ? (
        <>
          <CardHeader className="p-4 pb-0 flex flex-row justify-between items-center">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title"
              className="font-medium"
            />
            <div className="flex gap-2">
              <Button
                size="sm" 
                variant="ghost"
                onClick={handleCancel}
                className="h-8 w-8 p-0"
                aria-label="Cancel editing"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                className="h-8 w-8 p-0"
                aria-label="Save note"
              >
                <Save className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Note content"
              className="min-h-[100px] resize-none"
            />
          </CardContent>
        </>
      ) : (
        <>
          <CardHeader className="p-4 pb-0 flex flex-row justify-between items-center">
            <h3 className="font-medium">{note.title}</h3>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                className="h-8 w-8 p-0"
                aria-label="Edit note"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onDelete}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                aria-label="Delete note"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="whitespace-pre-line text-sm">
              {content}
            </div>
          </CardContent>
        </>
      )}
    </Card>
  );
};

export default NoteCard;
