import { TaskItemResponse } from '../../tasks/models/task-item.models';

export interface ProjectResponse {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
}

export interface ProjectDetailsResponse extends ProjectResponse {
  tasks: readonly TaskItemResponse[];
}

export interface CreateProjectRequest {
  name: string;
  description: string | null;
}

export type UpdateProjectRequest = CreateProjectRequest;
