
export interface Tab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  groupId: string;
  bookmarked?: boolean; 
}

export interface Note {
  id: string;
  title: string;
  content: string;
  groupId: string;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface TodoList {
  id: string;
  title: string;
  items: TodoItem[];
  groupId: string;
}

export interface Group {
  id: string;
  title: string;
  color: string;
}

export interface WorkspaceData {
  tabs: Tab[];
  notes: Note[];
  todoLists: TodoList[];
  groups: Group[];
}

export type ItemType = "tab" | "note" | "todo";

// Initial workspace data for new users
export const initialWorkspaceData: WorkspaceData = {
  tabs: [
    {
      id: "tab1",
      title: "GitHub - Build software better, together",
      url: "https://github.com",
      favicon: "https://github.githubassets.com/favicons/favicon.svg",
      groupId: "group1",
      bookmarked: false
    },
    {
      id: "tab2",
      title: "React – A JavaScript library for building user interfaces",
      url: "https://reactjs.org",
      favicon: "https://reactjs.org/favicon.ico",
      groupId: "group1",
      bookmarked: false
    },
    {
      id: "tab3",
      title: "Tailwind CSS - Rapidly build modern websites",
      url: "https://tailwindcss.com",
      favicon: "https://tailwindcss.com/favicons/favicon.ico",
      groupId: "group2",
      bookmarked: false
    }
  ],
  notes: [
    {
      id: "note1",
      title: "Project Ideas",
      content: "1. Build a tab manager\n2. Create a note-taking app\n3. Design a portfolio website",
      groupId: "group1"
    },
    {
      id: "note2",
      title: "Meeting Notes",
      content: "Discussed project timeline and resource allocation.\nNext meeting: Friday at 2pm",
      groupId: "group2"
    }
  ],
  todoLists: [
    {
      id: "todo1",
      title: "Development Tasks",
      items: [
        { id: "item1", text: "Setup project structure", completed: true },
        { id: "item2", text: "Create component library", completed: false },
        { id: "item3", text: "Implement drag and drop", completed: false }
      ],
      groupId: "group1"
    }
  ],
  groups: [
    {
      id: "group1",
      title: "Work",
      color: "#4f46e5"
    },
    {
      id: "group2",
      title: "Personal",
      color: "#14b8a6"
    }
  ]
};
