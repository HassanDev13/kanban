export interface ChecklistItem {
    id: string;
    content: string;
    isCompleted: boolean;
  }
  
  export interface Task {
    id: string;
    content: string;
    priority: "low" | "medium" | "high";
    description: string;
    assignedTo?: string;
    checklist: ChecklistItem[];
  }
  
  export interface Column {
    id: string;
    title: string;
    tasks: Task[];
    limit: number;
  }
  
  export interface User {
    id: string;
    name: string;
    avatar: string;
  }