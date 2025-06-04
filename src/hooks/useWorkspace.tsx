import { ReactNode, createContext, useContext } from 'react';
import useWorkspaceData, {
  WorkspaceData,
  Group,
  Tab,
  Note,
  TodoList,
  TodoItem,
  ItemType
} from './useWorkspaceData';

interface WorkspaceContextType {
  data: WorkspaceData;
  isLoading: boolean;
  addItem: (type: ItemType, item: any) => Promise<void>;
  updateItem: (type: ItemType, id: string, updates: Partial<Tab | Note | TodoList>) => Promise<void>;
  deleteItem: (type: ItemType, id: string) => Promise<void>;
  addGroup: (group: Group) => Promise<void>;
  updateGroup: (id: string, updates: Partial<Group>) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  moveItem: (type: ItemType, id: string, newGroupId: string) => Promise<void>;
  toggleBookmark: (tabId: string) => Promise<void>;
  getBookmarkedTabs: () => Tab[];
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const workspace = useWorkspaceData();
  return (
    <WorkspaceContext.Provider value={workspace}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};

export type { WorkspaceData, Group, Tab, Note, TodoList, TodoItem, ItemType };
