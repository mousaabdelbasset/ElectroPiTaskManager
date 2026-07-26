import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { apiErrorTranslationKey } from '../../../../shared/utilities/api-error';
import { ProjectResponse } from '../../../projects/models/project.models';
import { ProjectsApiService } from '../../../projects/services/projects-api.service';
import { StatusFilterComponent } from '../../components/status-filter/status-filter.component';
import { TaskCardComponent } from '../../components/task-card/task-card.component';
import { TaskFormComponent } from '../../components/task-form/task-form.component';
import {
  CreateTaskItemRequest,
  TaskItemResponse,
  TaskItemStatus,
} from '../../models/task-item.models';
import { TasksApiService } from '../../services/tasks-api.service';

@Component({
  selector: 'app-tasks-page',
  imports: [
    ConfirmDialogComponent,
    EmptyStateComponent,
    StatusFilterComponent,
    TaskCardComponent,
    TaskFormComponent,
    TranslatePipe,
  ],
  templateUrl: './tasks-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksPageComponent {
  private readonly tasksApi = inject(TasksApiService);
  private readonly projectsApi = inject(ProjectsApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly tasks = signal<readonly TaskItemResponse[]>([]);
  protected readonly projects = signal<readonly ProjectResponse[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorKey = signal<string | null>(null);
  protected readonly selectedStatus = signal<TaskItemStatus | null>(null);
  protected readonly formOpen = signal(false);
  protected readonly editingTask = signal<TaskItemResponse | null>(null);
  protected readonly saving = signal(false);
  protected readonly deleteTarget = signal<TaskItemResponse | null>(null);
  protected readonly deleting = signal(false);
  protected readonly pendingStatusTaskIds = signal<ReadonlySet<number>>(new Set<number>());
  protected readonly projectNames = computed(
    () => new Map(this.projects().map((project) => [project.id, project.name])),
  );

  constructor() {
    this.loadTasks();
    this.loadProjects();

    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      if (params.get('create') === 'true') {
        this.openCreateForm();
      }
    });
  }

  protected changeFilter(status: TaskItemStatus | null): void {
    if (status === this.selectedStatus()) {
      return;
    }
    this.selectedStatus.set(status);
    this.loadTasks();
  }

  protected loadTasks(): void {
    this.loading.set(true);
    this.errorKey.set(null);

    this.tasksApi
      .getAll(this.selectedStatus())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (tasks) => {
          this.tasks.set(tasks);
          this.loading.set(false);
        },
        error: (error: unknown) => {
          this.errorKey.set(apiErrorTranslationKey(error));
          this.loading.set(false);
        },
      });
  }

  protected openCreateForm(): void {
    this.editingTask.set(null);
    this.formOpen.set(true);
  }

  protected openEditForm(task: TaskItemResponse): void {
    this.editingTask.set(task);
    this.formOpen.set(true);
  }

  protected closeForm(): void {
    if (this.saving()) {
      return;
    }

    this.formOpen.set(false);
    this.editingTask.set(null);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { create: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  protected saveTask(request: CreateTaskItemRequest): void {
    const editingTask = this.editingTask();
    this.saving.set(true);

    if (editingTask) {
      this.tasksApi
        .update(editingTask.id, request)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            const updatedTask: TaskItemResponse = { ...editingTask, ...request };
            this.tasks.update((tasks) =>
              this.matchesCurrentFilter(updatedTask)
                ? tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
                : tasks.filter((task) => task.id !== updatedTask.id),
            );
            this.finishSave('tasks.feedback.updated');
          },
          error: (error: unknown) => this.handleSaveError(error),
        });
      return;
    }

    this.tasksApi
      .create(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (createdTask) => {
          if (this.matchesCurrentFilter(createdTask)) {
            this.tasks.update((tasks) => [createdTask, ...tasks]);
          }
          this.finishSave('tasks.feedback.created');
        },
        error: (error: unknown) => this.handleSaveError(error),
      });
  }

  protected changeTaskStatus(task: TaskItemResponse, status: TaskItemStatus): void {
    if (task.status === status || this.pendingStatusTaskIds().has(task.id)) {
      return;
    }

    this.setStatusPending(task.id, true);
    this.tasksApi
      .updateStatus(task.id, { status })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          const updatedTask = { ...task, status };
          this.tasks.update((tasks) =>
            this.matchesCurrentFilter(updatedTask)
              ? tasks.map((item) => (item.id === task.id ? updatedTask : item))
              : tasks.filter((item) => item.id !== task.id),
          );
          this.setStatusPending(task.id, false);
          this.toast.success('tasks.feedback.statusUpdated');
        },
        error: () => {
          this.setStatusPending(task.id, false);
          this.toast.error('tasks.feedback.statusUpdateFailed');
        },
      });
  }

  protected confirmDelete(): void {
    const task = this.deleteTarget();
    if (!task) {
      return;
    }

    this.deleting.set(true);
    this.tasksApi
      .delete(task.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.tasks.update((tasks) => tasks.filter((item) => item.id !== task.id));
          this.deleting.set(false);
          this.deleteTarget.set(null);
          this.toast.success('tasks.feedback.deleted');
        },
        error: (error: unknown) => {
          this.deleting.set(false);
          this.deleteTarget.set(null);
          this.toast.error(apiErrorTranslationKey(error));
        },
      });
  }

  private loadProjects(): void {
    this.projectsApi
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (projects) => this.projects.set(projects),
        error: () => this.toast.error('tasks.feedback.projectsUnavailable'),
      });
  }

  private matchesCurrentFilter(task: TaskItemResponse): boolean {
    const status = this.selectedStatus();
    return status === null || task.status === status;
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

  private finishSave(messageKey: string): void {
    this.saving.set(false);
    this.toast.success(messageKey);
    this.closeForm();
  }

  private handleSaveError(error: unknown): void {
    this.saving.set(false);
    this.toast.error(apiErrorTranslationKey(error));
  }
}
