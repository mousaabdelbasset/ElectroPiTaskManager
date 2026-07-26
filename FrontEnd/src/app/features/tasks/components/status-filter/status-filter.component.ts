import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { TASK_STATUSES, TaskItemStatus } from '../../models/task-item.models';

@Component({
  selector: 'app-status-filter',
  imports: [TranslatePipe],
  template: `
    <div
      class="flex gap-2 overflow-x-auto pb-1"
      role="group"
      [attr.aria-label]="'tasks.filter.label' | translate"
    >
      <button
        type="button"
        class="filter-chip"
        [class.filter-chip-active]="selected() === null"
        (click)="changed.emit(null)"
      >
        {{ 'statuses.All' | translate }}
      </button>
      @for (status of statuses; track status) {
        <button
          type="button"
          class="filter-chip"
          [class.filter-chip-active]="selected() === status"
          (click)="changed.emit(status)"
        >
          {{ statusLabelKey(status) | translate }}
        </button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusFilterComponent {
  readonly selected = input<TaskItemStatus | null>(null);
  readonly changed = output<TaskItemStatus | null>();
  protected readonly statuses = TASK_STATUSES;

  protected statusLabelKey(status: TaskItemStatus): string {
    return `statuses.${status}`;
  }
}
