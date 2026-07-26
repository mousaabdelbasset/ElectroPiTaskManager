import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { DateFormatterService } from '../../../../core/services/date-formatter.service';
import { ProjectResponse } from '../../../projects/models/project.models';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import {
  CreateTaskItemRequest,
  TASK_STATUSES,
  TaskItemResponse,
  TaskItemStatus,
} from '../../models/task-item.models';

@Component({
  selector: 'app-task-form',
  imports: [ModalComponent, ReactiveFormsModule, TranslatePipe],
  template: `
    <app-modal
      [titleKey]="task() ? 'tasks.form.editTitle' : 'tasks.form.createTitle'"
      [busy]="saving()"
      (closed)="cancelled.emit()"
    >
      <form #formElement [formGroup]="form" class="space-y-5" novalidate (ngSubmit)="submit()">
        <div>
          <label class="form-label" for="task-title">{{ 'tasks.form.title' | translate }}</label>
          <input
            id="task-title"
            class="form-control"
            type="text"
            maxlength="200"
            autocomplete="off"
            formControlName="title"
            [attr.aria-invalid]="controlInvalid('title')"
          />
          @if (controlInvalid('title')) {
            <p class="form-error">
              @if (form.controls.title.hasError('required')) {
                {{ 'validation.taskTitleRequired' | translate }}
              } @else {
                {{ 'validation.maxLength' | translate: { count: 200 } }}
              }
            </p>
          }
          <p class="mt-1 text-end text-xs text-muted">{{ form.controls.title.value.length }}/200</p>
        </div>

        <div>
          <label class="form-label" for="task-description">{{
            'tasks.form.description' | translate
          }}</label>
          <textarea
            id="task-description"
            class="form-control min-h-24 resize-y"
            maxlength="2000"
            rows="3"
            formControlName="description"
            [attr.aria-invalid]="controlInvalid('description')"
          ></textarea>
          @if (controlInvalid('description')) {
            <p class="form-error">{{ 'validation.maxLength' | translate: { count: 2000 } }}</p>
          }
          <p class="mt-1 text-end text-xs text-muted">
            {{ form.controls.description.value.length }}/2000
          </p>
        </div>

        <div class="grid gap-5" [class.sm:grid-cols-2]="task()">
          @if (task()) {
            <div>
              <label class="form-label" for="task-status">{{
                'tasks.form.status' | translate
              }}</label>
              <select id="task-status" class="form-control" formControlName="status">
                @for (status of statuses; track status) {
                  <option [value]="status">{{ statusLabelKey(status) | translate }}</option>
                }
              </select>
            </div>
          }
          <div>
            <label class="form-label" for="task-due-date">{{
              'tasks.form.dueDate' | translate
            }}</label>
            <input
              id="task-due-date"
              class="form-control"
              type="datetime-local"
              formControlName="dueDate"
              [min]="minimumDueDate()"
              [attr.aria-invalid]="controlInvalid('dueDate')"
            />
            @if (controlInvalid('dueDate')) {
              <p class="form-error">
                {{
                  (form.controls.dueDate.hasError('required')
                    ? 'validation.dueDateRequired'
                    : 'validation.dueDatePast'
                  ) | translate
                }}
              </p>
            }
          </div>
        </div>

        <div>
          <label class="form-label" for="task-project">{{
            'tasks.form.project' | translate
          }}</label>
          <select
            id="task-project"
            class="form-control"
            formControlName="projectId"
            [attr.aria-invalid]="controlInvalid('projectId')"
          >
            <option [ngValue]="0">{{ 'tasks.form.selectProject' | translate }}</option>
            @for (project of projects(); track project.id) {
              <option [ngValue]="project.id">{{ project.name }}</option>
            }
          </select>
          @if (controlInvalid('projectId')) {
            <p class="form-error">{{ 'validation.projectRequired' | translate }}</p>
          }
        </div>

        <div class="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            class="btn-secondary"
            [disabled]="saving()"
            (click)="cancelled.emit()"
          >
            {{ 'common.cancel' | translate }}
          </button>
          <button type="submit" class="btn-primary" [disabled]="saving()">
            {{ (saving() ? 'common.saving' : 'common.save') | translate }}
          </button>
        </div>
      </form>
    </app-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskFormComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly dates = inject(DateFormatterService);

  readonly task = input<TaskItemResponse | null>(null);
  readonly projects = input.required<readonly ProjectResponse[]>();
  readonly lockedProjectId = input<number | null>(null);
  readonly saving = input(false);
  readonly saved = output<CreateTaskItemRequest>();
  readonly cancelled = output<void>();
  readonly formElement = viewChild.required<ElementRef<HTMLFormElement>>('formElement');

  protected readonly statuses = TASK_STATUSES;
  protected readonly minimumDueDate = computed(() => {
    const today = this.dates.localDayStartInput();
    const existing = this.task();
    const existingValue = existing ? this.dates.toDateInput(existing.dueDate) : null;

    return existingValue && existingValue < today ? existingValue : today;
  });
  protected readonly form = this.formBuilder.group({
    title: this.formBuilder.nonNullable.control('', [
      Validators.required,
      Validators.maxLength(200),
    ]),
    description: this.formBuilder.nonNullable.control('', [Validators.maxLength(2000)]),
    status: this.formBuilder.nonNullable.control<TaskItemStatus>('ToDo', [Validators.required]),
    dueDate: this.formBuilder.nonNullable.control('', [
      Validators.required,
      (control) => this.validateDueDate(control),
    ]),
    projectId: this.formBuilder.nonNullable.control(0, [Validators.required, Validators.min(1)]),
  });

  constructor() {
    effect(() => {
      const task = this.task();
      const lockedProjectId = this.lockedProjectId();

      this.form.reset({
        title: task?.title ?? '',
        description: task?.description ?? '',
        status: task?.status ?? 'ToDo',
        dueDate: task ? this.dates.toDateInput(task.dueDate) : this.dates.localDayStartInput(1),
        projectId: lockedProjectId ?? task?.projectId ?? 0,
      });

      if (lockedProjectId !== null) {
        this.form.controls.projectId.disable();
      } else {
        this.form.controls.projectId.enable();
      }
    });
  }

  protected controlInvalid(
    controlName: 'title' | 'description' | 'dueDate' | 'projectId',
  ): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && control.touched;
  }

  protected statusLabelKey(status: TaskItemStatus): string {
    return `statuses.${status}`;
  }

  protected submit(): void {
    const trimmedTitle = this.form.controls.title.value.trim();
    this.form.controls.title.setValue(trimmedTitle);
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.formElement().nativeElement.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }

    const raw = this.form.getRawValue();
    const description = raw.description.trim();

    this.saved.emit({
      title: raw.title,
      description: description || null,
      status: this.task() ? raw.status : 'ToDo',
      dueDate: `${raw.dueDate}:00`,
      projectId: raw.projectId,
    });
  }

  private validateDueDate(control: AbstractControl<string>): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const selected = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (Number.isNaN(selected.getTime()) || selected >= today) {
      return null;
    }

    // An existing overdue value remains valid only while the user leaves that value unchanged.
    const existing = this.task();
    return existing && this.dates.toDateInput(existing.dueDate) === control.value
      ? null
      : { dueDatePast: true };
  }
}
