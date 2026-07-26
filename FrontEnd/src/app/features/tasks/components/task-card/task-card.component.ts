import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { DateFormatterService } from '../../../../core/services/date-formatter.service';
import {
  TASK_STATUSES,
  TaskItemResponse,
  TaskItemStatus,
  isTaskItemStatus,
} from '../../models/task-item.models';

@Component({
  selector: 'app-task-card',
  imports: [TranslatePipe],
  template: `
    <article
      class="surface-card flex min-h-60 flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-md"
      [class.opacity-75]="task().status === 'Done'"
    >
      <div class="flex items-start justify-between gap-3">
        <span class="status-pill" [class]="statusClass()">
          {{ statusLabelKey(task().status) | translate }}
        </span>
        <div class="flex gap-1">
          <button
            type="button"
            class="icon-btn size-9"
            [attr.aria-label]="'tasks.actions.edit' | translate"
            (click)="edit.emit(task())"
          >
            <span aria-hidden="true">✎</span>
          </button>
          <button
            type="button"
            class="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold text-danger transition hover:bg-red-50"
            [attr.aria-label]="'tasks.actions.delete' | translate"
            (click)="remove.emit(task())"
          >
            <svg
              class="size-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M3 6h18" />
              <path d="M8 6V4h8v2" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v5M14 11v5" />
            </svg>
            <span>{{ 'common.delete' | translate }}</span>
          </button>
        </div>
      </div>

      <h3
        class="mt-4 text-lg font-bold text-ink"
        [class.line-through]="task().status === 'Done'"
        [class.text-muted]="task().status === 'Done'"
      >
        {{ task().title }}
      </h3>
      @if (projectName()) {
        <p class="mt-1 text-sm font-medium text-primary-dark">{{ projectName() }}</p>
      }
      <p class="mt-2 line-clamp-2 text-sm leading-6 text-muted">
        {{ task().description || ('tasks.noDescription' | translate) }}
      </p>

      <div
        class="mt-auto grid gap-3 border-t border-border pt-4 sm:grid-cols-[1fr_auto] sm:items-center"
      >
        <span
          class="text-sm font-medium"
          [class.text-danger]="overdue()"
          [class.text-muted]="!overdue()"
        >
          <span aria-hidden="true">{{ overdue() ? '!' : '▣' }}</span>
          {{ overdue() ? ('tasks.overdue' | translate) : dueDate() }}
        </span>
        <label class="sr-only" [for]="'status-' + task().id">
          {{ 'tasks.actions.changeStatus' | translate }}
        </label>
        <select
          class="min-h-10 rounded-lg border border-border bg-white px-2 text-sm font-medium text-ink"
          [id]="'status-' + task().id"
          [value]="task().status"
          [disabled]="updatingStatus()"
          (change)="onStatusChange($event)"
        >
          @for (status of statuses; track status) {
            <option [value]="status">{{ statusLabelKey(status) | translate }}</option>
          }
        </select>
      </div>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskCardComponent {
  private readonly dates = inject(DateFormatterService);

  readonly task = input.required<TaskItemResponse>();
  readonly projectName = input<string | null>(null);
  readonly updatingStatus = input(false);
  readonly edit = output<TaskItemResponse>();
  readonly remove = output<TaskItemResponse>();
  readonly statusChanged = output<TaskItemStatus>();
  protected readonly statuses = TASK_STATUSES;

  protected readonly dueDate = computed(() => this.dates.format(this.task().dueDate));
  protected readonly overdue = computed(
    () => this.task().status !== 'Done' && this.dates.isOverdue(this.task().dueDate),
  );
  protected readonly statusClass = computed(() => {
    const status = this.task().status;
    return status === 'Done'
      ? 'status-done'
      : status === 'InProgress'
        ? 'status-progress'
        : 'status-todo';
  });

  protected statusLabelKey(status: TaskItemStatus): string {
    return `statuses.${status}`;
  }

  protected onStatusChange(event: Event): void {
    const value = event.target instanceof HTMLSelectElement ? event.target.value : '';
    if (isTaskItemStatus(value) && value !== this.task().status) {
      this.statusChanged.emit(value);
    }
  }
}
