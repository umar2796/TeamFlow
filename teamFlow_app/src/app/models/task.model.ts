export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 1 | 2 | 3 | 4 | 5;

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: string;
  createdAt: Date;
}

export type NewTaskInput = Omit<Task, 'id' | 'createdAt'>;
export type TaskUpdate = Partial<Task>;