import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { apiErrorTranslationKey } from '../../../../shared/utilities/api-error';
import { ProjectCardComponent } from '../../components/project-card/project-card.component';
import { ProjectFormComponent } from '../../components/project-form/project-form.component';
import { CreateProjectRequest, ProjectResponse } from '../../models/project.models';
import { ProjectsApiService } from '../../services/projects-api.service';

@Component({
  selector: 'app-projects-page',
  imports: [
    ConfirmDialogComponent,
    EmptyStateComponent,
    ProjectCardComponent,
    ProjectFormComponent,
    TranslatePipe,
  ],
  templateUrl: './projects-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsPageComponent {
  private readonly projectsApi = inject(ProjectsApiService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly projects = signal<readonly ProjectResponse[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorKey = signal<string | null>(null);
  protected readonly formOpen = signal(false);
  protected readonly editingProject = signal<ProjectResponse | null>(null);
  protected readonly saving = signal(false);
  protected readonly deleteTarget = signal<ProjectResponse | null>(null);
  protected readonly deleting = signal(false);

  constructor() {
    this.loadProjects();
  }

  protected loadProjects(): void {
    this.loading.set(true);
    this.errorKey.set(null);

    this.projectsApi
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (projects) => {
          this.projects.set(projects);
          this.loading.set(false);
        },
        error: (error: unknown) => {
          this.errorKey.set(apiErrorTranslationKey(error));
          this.loading.set(false);
        },
      });
  }

  protected openCreateForm(): void {
    this.editingProject.set(null);
    this.formOpen.set(true);
  }

  protected openEditForm(project: ProjectResponse): void {
    this.editingProject.set(project);
    this.formOpen.set(true);
  }

  protected closeForm(): void {
    if (!this.saving()) {
      this.formOpen.set(false);
      this.editingProject.set(null);
    }
  }

  protected saveProject(request: CreateProjectRequest): void {
    const editingProject = this.editingProject();
    this.saving.set(true);

    if (editingProject) {
      this.projectsApi
        .update(editingProject.id, request)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.projects.update((projects) =>
              projects.map((project) =>
                project.id === editingProject.id ? { ...project, ...request } : project,
              ),
            );
            this.toast.success('projects.feedback.updated');
            this.saving.set(false);
            this.closeForm();
          },
          error: (error: unknown) => {
            this.saving.set(false);
            this.toast.error(apiErrorTranslationKey(error));
          },
        });
      return;
    }

    this.projectsApi
      .create(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (createdProject) => {
          // Reconcile by id so the POST result appears immediately without duplicating a later refresh.
          this.projects.update((projects) => [
            createdProject,
            ...projects.filter((project) => project.id !== createdProject.id),
          ]);
          this.saving.set(false);
          this.closeForm();
          this.toast.success('projects.feedback.created');
        },
        error: (error: unknown) => {
          this.saving.set(false);
          this.toast.error(apiErrorTranslationKey(error));
        },
      });
  }

  protected confirmDelete(): void {
    const project = this.deleteTarget();
    if (!project) {
      return;
    }

    this.deleting.set(true);
    this.projectsApi
      .delete(project.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.projects.update((projects) => projects.filter((item) => item.id !== project.id));
          this.deleteTarget.set(null);
          this.deleting.set(false);
          this.toast.success('projects.feedback.deleted');
        },
        error: (error: unknown) => {
          this.deleting.set(false);
          this.deleteTarget.set(null);
          this.toast.error(
            error instanceof HttpErrorResponse && error.status === 409
              ? 'projects.feedback.deleteConflict'
              : apiErrorTranslationKey(error),
          );
        },
      });
  }
}
