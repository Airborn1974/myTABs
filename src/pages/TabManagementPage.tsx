import React from 'react';
import { useWorkspace } from '@/hooks/useWorkspace';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, Trash2, Edit, MoveRight } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
// TODO: Add Dialog components for editing tab details if needed

const TabManagementPage: React.FC = () => {
  const { data, isLoading, deleteItem, updateItem, moveItem } = useWorkspace();
  const { tabs, groups } = data;

  // TODO: Add state for selected tabs, filters, sorting, edit dialog
  // const [selectedTabs, setSelectedTabs] = React.useState<string[]>([]);
  // const [filterGroup, setFilterGroup] = React.useState<string>('');
  // const [searchTerm, setSearchTerm] = React.useState<string>('');
  // const [sortConfig, setSortConfig] = React.useState<{ key: string; direction: string } | null>(null);

  if (isLoading) {
    return <div className="p-6">Loading tab data...</div>;
  }

  // TODO: Implement filtering and sorting logic
  const filteredAndSortedTabs = tabs; // Placeholder

  const handleMoveTab = (tabId: string, newGroupId: string) => {
    moveItem('tab', tabId, newGroupId);
  };

  const handleDeleteTab = (tabId: string) => {
    deleteItem('tab', tabId);
  };

  // TODO: Implement edit tab functionality
  // const handleEditTab = (tabId: string, newDetails: Partial<Tab>) => {
  //   updateItem('tab', tabId, newDetails);
  // };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Tab Management</h1>
        <p className="text-muted-foreground">
          View, edit, move, and delete your saved tabs.
        </p>
      </header>

      {/* TODO: Add Filters and Bulk Actions Bar */}
      <div className="mb-4 p-4 border rounded-lg bg-card">
        <p className="text-center text-muted-foreground">
          Filters and bulk actions will be implemented here.
        </p>
      </div>


      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {/* <TableHead className="w-[50px]">
                <Checkbox
                  // checked={selectedTabs.length === filteredAndSortedTabs.length && filteredAndSortedTabs.length > 0}
                  // onCheckedChange={(checked) => {
                  //   setSelectedTabs(checked ? filteredAndSortedTabs.map(t => t.id) : []);
                  // }}
                />
              </TableHead> */}
              <TableHead>Title</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Group</TableHead>
              <TableHead className="text-right w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedTabs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24"> {/* Updated colSpan to 4 */}
                  No tabs found.
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedTabs.map((tab) => {
                const currentGroup = groups.find(g => g.id === tab.groupId);
                const otherGroups = groups.filter(g => g.id !== tab.groupId);
                return (
                  <TableRow key={tab.id}>
                    {/* <TableCell>
                      <Checkbox
                        // checked={selectedTabs.includes(tab.id)}
                        // onCheckedChange={(checked) => {
                        //   setSelectedTabs(prev => checked ? [...prev, tab.id] : prev.filter(id => id !== tab.id));
                        // }}
                      />
                    </TableCell> */}
                    <TableCell className="font-medium max-w-xs truncate">{tab.title}</TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">
                      <a href={tab.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {tab.url}
                      </a>
                    </TableCell>
                    <TableCell>{currentGroup?.title || 'Unassigned'}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" aria-label={`Actions for tab ${tab.title}`}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => alert('Edit functionality to be implemented for tab: ' + tab.title)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              <MoveRight className="mr-2 h-4 w-4" />
                              Move to Group
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              {otherGroups.length > 0 ? (
                                otherGroups.map((group) => (
                                  <DropdownMenuItem
                                    key={group.id}
                                    onClick={() => handleMoveTab(tab.id, group.id)}
                                  >
                                    {group.title}
                                  </DropdownMenuItem>
                                ))
                              ) : (
                                <DropdownMenuItem disabled>No other groups</DropdownMenuItem>
                              )}
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteTab(tab.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TabManagementPage;
