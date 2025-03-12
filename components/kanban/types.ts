export interface ChecklistItem {
  id: string;
  content: string;
  isCompleted: boolean;
}

export enum Priority {
  Low = "low",
  Medium = "medium",
  High = "high",
}
export interface Task {
  id: string;
  content: string;
  priority: Priority;
  description: string;
  assignedTo?: string;
  dueDate? : Date
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

export interface PlaceholderTask {
  id: 'placeholder';
  content: 'placeholder';
}

export type TaskOrPlaceholder = Task | PlaceholderTask;
