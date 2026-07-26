export type TaskItemStatus = 'ToDo' | 'InProgress' | 'Done';

export const TASK_STATUSES: readonly TaskItemStatus[] = ['ToDo', 'InProgress', 'Done'];

export function isTaskItemStatus(value: string): value is TaskItemStatus {
  return value === 'ToDo' || value === 'InProgress' || value === 'Done';
}

export interface TaskItemResponse {
  id: number;
  title: string;
  description: string | null;
  status: TaskItemStatus;
  dueDate: string;
  projectId: number;
}

export interface CreateTaskItemRequest {
  title: string;
  description: string | null;
  status: TaskItemStatus;
  dueDate: string;
  projectId: number;
}

export type UpdateTaskItemRequest = CreateTaskItemRequest;

export interface UpdateTaskStatusRequest {
  status: TaskItemStatus;
}
