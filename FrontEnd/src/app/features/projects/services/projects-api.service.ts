import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import {
  CreateProjectRequest,
  ProjectDetailsResponse,
  ProjectResponse,
  UpdateProjectRequest,
} from '../models/project.models';

@Injectable({ providedIn: 'root' })
export class ProjectsApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly endpoint = `${this.apiBaseUrl}/projects`;

  getAll(): Observable<readonly ProjectResponse[]> {
    return this.http.get<readonly ProjectResponse[]>(this.endpoint);
  }

  getById(id: number): Observable<ProjectDetailsResponse> {
    return this.http.get<ProjectDetailsResponse>(`${this.endpoint}/${id}`);
  }

  create(request: CreateProjectRequest): Observable<ProjectResponse> {
    return this.http.post<ProjectResponse>(this.endpoint, request);
  }

  update(id: number, request: UpdateProjectRequest): Observable<void> {
    return this.http.put<void>(`${this.endpoint}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }
}
