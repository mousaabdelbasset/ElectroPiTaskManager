import { HttpErrorResponse } from '@angular/common/http';
import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { DateFormatterService } from '../../../../core/services/date-formatter.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { apiErrorTranslationKey } from '../../../../shared/utilities/api-error';
import { TaskCardComponent } from '../../../tasks/components/task-card/task-card.component';
import { TaskFormComponent } from '../../../tasks/components/task-form/task-form.component';
import { StatusFilterComponent } from '../../../tasks/components/status-filter/status-filter.component';
import {
  CreateTaskItemRequest,
  TASK_STATUSES,
  TaskItemResponse,
  TaskItemStatus,
} from '../../../tasks/models/task-item.models';
import { TasksApiService } from '../../../tasks/services/tasks-api.service';
import { ProjectFormComponent } from '../../components/project-form/project-form.component';
import {
  CreateProjectRequest,
  ProjectDetailsResponse,
  ProjectResponse,
} from '../../models/project.models';
import { ProjectsApiService } from '../../services/projects-api.service';

interface TaskGroup {
  status: TaskItemStatus;
  tasks: readonly TaskItemResponse[];
}

@Component({
  selector: 'app-project-details-page',
  imports: [
    ConfirmDialogComponent,
    CdkDrag,
    CdkDropList,
    CdkDropListGroup,
    EmptyStateComponent,
    ProjectFormComponent,
    RouterLink,
    StatusFilterComponent,
    TaskCardComponent,
    TaskFormComponent,
    TranslatePipe,
  ],
  templateUrl: './project-details-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDetailsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly projectsApi = inject(ProjectsApiService);
  private readonly tasksApi = inject(TasksApiService);
  private readonly toast = inject(ToastService);
  private readonly dates = inject(DateFormatterService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly project = signal<ProjectDetailsResponse | null>(null);
  protected readonly loading = signal(true);
  protected readonly errorKey = signal<string | null>(null);
  protected readonly selectedStatus = signal<TaskItemStatus | null>(null);
  protected readonly projectFormOpen = signal(false);
  protected readonly taskFormOpen = signal(false);
  protected readonly editingTask = signal<TaskItemResponse | null>(null);
  protected readonly savingProject = signal(false);
  protected readonly savingTask = signal(false);
  protected readonly deletingProject = signal(false);
  protected readonly deleteProjectOpen = signal(false);
  protected readonly deleteTaskTarget = signal<TaskItemResponse | null>(null);
  protected readonly deletingTask = signal(false);
  protected readonly pendingStatusTaskIds = signal<ReadonlySet<number>>(new Set<number>());
  protected readonly statuses = TASK_STATUSES;

  protected readonly createdDate = computed(() => {
    const project = this.project();
    return project ? this.dates.format(project.createdAt) : '';
  });

  protected readonly taskGroups = computed<readonly TaskGroup[]>(() => {
    const tasks = this.project()?.tasks ?? [];
    const selected = this.selectedStatus();

    return TASK_STATUSES.filter((status) => selected === null || selected === status).map(
      (status) => ({
        status,
        tasks: tasks.filter((task) => task.status === status),
      }),
    );
  });

  protected readonly projectOptions = computed<readonly ProjectResponse[]>(() => {
    const project = this.project();
    return project ? [project] : [];
  });

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = Number(params.get('id'));
      if (!Number.isInteger(id) || id <= 0) {
        this.loading.set(false);
        this.errorKey.set('errors.notFound');
        return;
      }
      this.loadProject(id);
    });
  }

  protected loadProject(id = this.project()?.id): void {
    if (!id) {
      return;
    }

    this.loading.set(true);
    this.errorKey.set(null);
    this.projectsApi
      .getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (project) => {
          this.project.set(project);
          this.loading.set(false);
        },
        error: (error: unknown) => {
          this.errorKey.set(apiErrorTranslationKey(error));
          this.loading.set(false);
        },
      });
  }

  protected statusLabelKey(status: TaskItemStatus): string {
    return `statuses.${status}`;
  }

  protected openCreateTask(): void {
    this.editingTask.set(null);
    this.taskFormOpen.set(true);
  }

  protected openEditTask(task: TaskItemResponse): void {
    this.editingTask.set(task);
    this.taskFormOpen.set(true);
  }

  protected saveProject(request: CreateProjectRequest): void {
    const project = this.project();
    if (!project) {
      return;
    }

    this.savingProject.set(true);
    this.projectsApi
      .update(project.id, request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.project.update((current) => (current ? { ...current, ...request } : current));
          this.savingProject.set(false);
          this.projectFormOpen.set(false);
          this.toast.success('projects.feedback.updated');
        },
        error: (error: unknown) => {
          this.savingProject.set(false);
          this.toast.error(apiErrorTranslationKey(error));
        },
      });
  }

  protected saveTask(request: CreateTaskItemRequest): void {
    const editingTask = this.editingTask();
    this.savingTask.set(true);

    if (editingTask) {
      this.tasksApi
        .update(editingTask.id, request)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.updateTaskLocally({ ...editingTask, ...request });
            this.finishTaskSave('tasks.feedback.updated');
          },
          error: (error: unknown) => this.handleTaskSaveError(error),
        });
      return;
    }

    this.tasksApi
      .create(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (createdTask) => {
          this.project.update((current) =>
            current ? { ...current, tasks: [createdTask, ...current.tasks] } : current,
          );
          this.finishTaskSave('tasks.feedback.created');
        },
        error: (error: unknown) => this.handleTaskSaveError(error),
      });
  }

  protected changeTaskStatus(task: TaskItemResponse, status: TaskItemStatus): void {
    this.persistTaskStatus(task, status, false);
  }

  protected dropTask(
    event: CdkDragDrop<readonly TaskItemResponse[], readonly TaskItemResponse[], TaskItemResponse>,
    status: TaskItemStatus,
  ): void {
    this.persistTaskStatus(event.item.data, status, true);
  }

  private persistTaskStatus(
    task: TaskItemResponse,
    status: TaskItemStatus,
    optimistic: boolean,
  ): void {
    if (task.status === status || this.pendingStatusTaskIds().has(task.id)) {
      return;
    }

    const originalTask = task;
    this.setStatusPending(task.id, true);

    if (optimistic) {
      this.updateTaskLocally({ ...task, status });
    }

    this.tasksApi
      .updateStatus(task.id, { status })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          if (!optimistic) {
            this.updateTaskLocally({ ...task, status });
          }
          this.setStatusPending(task.id, false);
          this.toast.success('tasks.feedback.statusUpdated');
        },
        error: () => {
          // Roll back only drag-and-drop updates because dropdown changes wait for API success.
          if (optimistic) {
            this.updateTaskLocally(originalTask);
          }
          this.setStatusPending(task.id, false);
          this.toast.error('tasks.feedback.statusUpdateFailed');
        },
      });
  }

  protected confirmTaskDelete(): void {
    const task = this.deleteTaskTarget();
    if (!task) {
      return;
    }

    this.deletingTask.set(true);
    this.tasksApi
      .delete(task.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.project.update((current) =>
            current
              ? { ...current, tasks: current.tasks.filter((item) => item.id !== task.id) }
              : current,
          );
          this.deletingTask.set(false);
          this.deleteTaskTarget.set(null);
          this.toast.success('tasks.feedback.deleted');
        },
        error: (error: unknown) => {
          this.deletingTask.set(false);
          this.deleteTaskTarget.set(null);
          this.toast.error(apiErrorTranslationKey(error));
        },
      });
  }

  protected confirmProjectDelete(): void {
    const project = this.project();
    if (!project) {
      return;
    }

    this.deletingProject.set(true);
    this.projectsApi
      .delete(project.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.success('projects.feedback.deleted');
          void this.router.navigate(['/projects']);
        },
        error: (error: unknown) => {
          this.deletingProject.set(false);
          this.deleteProjectOpen.set(false);
          this.toast.error(
            error instanceof HttpErrorResponse && error.status === 409
              ? 'projects.feedback.deleteConflict'
              : apiErrorTranslationKey(error),
          );
        },
      });
  }

  private updateTaskLocally(updatedTask: TaskItemResponse): void {
    this.project.update((current) =>
      current
        ? {
            ...current,
            tasks: current.tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
          }
        : current,
    );
  }

  private setStatusPending(taskId: number, pending: boolean): void {
    this.pendingStatusTaskIds.update((current) => {
      const next = new Set(current);
      if (pending) {
        next.add(taskId);
      } else {
        next.delete(taskId);
      }
      return next;
    });
  }

  private finishTaskSave(messageKey: string): void {
    this.savingTask.set(false);
    this.taskFormOpen.set(false);
    this.editingTask.set(null);
    this.toast.success(messageKey);
  }

  private handleTaskSaveError(error: unknown): void {
    this.savingTask.set(false);
    this.toast.error(apiErrorTranslationKey(error));
  }
}
