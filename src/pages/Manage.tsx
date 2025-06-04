import React, { useState } from "react";
import Header from "@/components/Header";
import { useWorkspace, Group, Tab, Note, TodoList } from "@/hooks/useWorkspace";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Manage: React.FC = () => {
  const { data, updateGroup, deleteGroup, deleteItem } = useWorkspace();

  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [groupTitle, setGroupTitle] = useState("");
  const [groupColor, setGroupColor] = useState("#000000");

  const startEditGroup = (group: Group) => {
    setEditingGroupId(group.id);
    setGroupTitle(group.title);
    setGroupColor(group.color);
  };

  const saveGroup = async () => {
    if (editingGroupId) {
      await updateGroup(editingGroupId, { title: groupTitle, color: groupColor });
      setEditingGroupId(null);
    }
  };

  const cancelEdit = () => {
    setEditingGroupId(null);
  };

  const findGroupTitle = (groupId: string) =>
    data.groups.find((g) => g.id === groupId)?.title || "";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow w-full p-4 space-y-8">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Workspace
          </Link>
        </Button>

        <section>
          <h2 className="text-xl font-bold mb-2">Manage Groups</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Color</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.groups.map((group) => (
                editingGroupId === group.id ? (
                  <TableRow key={group.id}>
                    <TableCell>
                      <Input value={groupTitle} onChange={(e) => setGroupTitle(e.target.value)} />
                    </TableCell>
                    <TableCell>
                      <input type="color" value={groupColor} onChange={(e) => setGroupColor(e.target.value)} />
                    </TableCell>
                    <TableCell className="flex gap-2 justify-end">
                      <Button size="sm" onClick={saveGroup}>Save</Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow key={group.id}>
                    <TableCell>{group.title}</TableCell>
                    <TableCell>
                      <span className="inline-block h-4 w-4 rounded-full mr-2" style={{ backgroundColor: group.color }} />
                      {group.color}
                    </TableCell>
                    <TableCell className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline" onClick={() => startEditGroup(group)}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteGroup(group.id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                )
              ))}
            </TableBody>
          </Table>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">Manage Links</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Group</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.tabs.map((tab) => (
                <TableRow key={tab.id}>
                  <TableCell>{tab.title}</TableCell>
                  <TableCell>
                    <a href={tab.url} target="_blank" rel="noopener noreferrer" className="text-primary underline break-all">
                      {tab.url}
                    </a>
                  </TableCell>
                  <TableCell>{findGroupTitle(tab.groupId)}</TableCell>
                  <TableCell className="flex justify-end">
                    <Button size="sm" variant="destructive" onClick={() => deleteItem("tab", tab.id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">Information Boxes</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Group</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.notes.map((note) => (
                <TableRow key={note.id}>
                  <TableCell>Note</TableCell>
                  <TableCell>{note.title}</TableCell>
                  <TableCell>{findGroupTitle(note.groupId)}</TableCell>
                  <TableCell className="flex justify-end">
                    <Button size="sm" variant="destructive" onClick={() => deleteItem("note", note.id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
              {data.todoLists.map((list) => (
                <TableRow key={list.id}>
                  <TableCell>Todo List</TableCell>
                  <TableCell>{list.title}</TableCell>
                  <TableCell>{findGroupTitle(list.groupId)}</TableCell>
                  <TableCell className="flex justify-end">
                    <Button size="sm" variant="destructive" onClick={() => deleteItem("todo", list.id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      </main>
    </div>
  );
};

export default Manage;

