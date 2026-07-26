import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import {
  CreateTaskItemRequest,
  TaskItemResponse,
  TaskItemStatus,
  UpdateTaskItemRequest,
  UpdateTaskStatusRequest,
} from '../models/task-item.models';

@Injectable({ providedIn: 'root' })
export class TasksApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly endpoint = `${this.apiBaseUrl}/tasks`;

  getAll(status: TaskItemStatus | null = null): Observable<readonly TaskItemResponse[]> {
    const params = status ? new HttpParams().set('status', status) : undefined;
    return this.http.get<readonly TaskItemResponse[]>(this.endpoint, { params });
  }

  getById(id: number): Observable<TaskItemResponse> {
    return this.http.get<TaskItemResponse>(`${this.endpoint}/${id}`);
  }

  getByProjectId(projectId: number): Observable<readonly TaskItemResponse[]> {
    return this.http.get<readonly TaskItemResponse[]>(
      `${this.apiBaseUrl}/projects/${projectId}/tasks`,
    );
  }

  create(request: CreateTaskItemRequest): Observable<TaskItemResponse> {
    return this.http.post<TaskItemResponse>(this.endpoint, request);
  }

  update(id: number, request: UpdateTaskItemRequest): Observable<void> {
    return this.http.put<void>(`${this.endpoint}/${id}`, request);
  }

  updateStatus(id: number, request: UpdateTaskStatusRequest): Observable<void> {
    return this.http.patch<void>(`${this.endpoint}/${id}/status`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }
}
