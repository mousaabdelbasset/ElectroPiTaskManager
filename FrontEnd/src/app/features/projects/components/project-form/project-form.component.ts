import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  input,
  output,
  viewChild,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { CreateProjectRequest, ProjectResponse } from '../../models/project.models';

@Component({
  selector: 'app-project-form',
  imports: [ModalComponent, ReactiveFormsModule, TranslatePipe],
  template: `
    <app-modal
      [titleKey]="project() ? 'projects.form.editTitle' : 'projects.form.createTitle'"
      [busy]="saving()"
      (closed)="cancelled.emit()"
    >
      <form #formElement [formGroup]="form" class="space-y-5" novalidate (ngSubmit)="submit()">
        <div>
          <label class="form-label" for="project-name">{{
            'projects.form.name' | translate
          }}</label>
          <input
            id="project-name"
            class="form-control"
            type="text"
            maxlength="150"
            autocomplete="off"
            formControlName="name"
            [attr.aria-invalid]="name.invalid && name.touched"
            aria-describedby="project-name-error"
          />
          @if (name.invalid && name.touched) {
            <p id="project-name-error" class="form-error">
              @if (name.hasError('required')) {
                {{ 'validation.projectNameRequired' | translate }}
              } @else {
                {{ 'validation.maxLength' | translate: { count: 150 } }}
              }
            </p>
          }
          <p class="mt-1 text-end text-xs text-muted">{{ name.value.length }}/150</p>
        </div>

        <div>
          <label class="form-label" for="project-description">
            {{ 'projects.form.description' | translate }}
          </label>
          <textarea
            id="project-description"
            class="form-control min-h-28 resize-y"
            maxlength="1000"
            rows="4"
            formControlName="description"
            [attr.aria-invalid]="description.invalid && description.touched"
            aria-describedby="project-description-error"
          ></textarea>
          @if (description.invalid && description.touched) {
            <p id="project-description-error" class="form-error">
              {{ 'validation.maxLength' | translate: { count: 1000 } }}
            </p>
          }
          <p class="mt-1 text-end text-xs text-muted">{{ description.value.length }}/1000</p>
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
export class ProjectFormComponent {
  readonly project = input<ProjectResponse | null>(null);
  readonly saving = input(false);
  readonly saved = output<CreateProjectRequest>();
  readonly cancelled = output<void>();
  readonly formElement = viewChild.required<ElementRef<HTMLFormElement>>('formElement');

  protected readonly name = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(150)],
  });
  protected readonly description = new FormControl('', {
    nonNullable: true,
    validators: [Validators.maxLength(1000)],
  });
  protected readonly form = new FormGroup({
    name: this.name,
    description: this.description,
  });

  constructor() {
    effect(() => {
      const project = this.project();
      this.name.setValue(project?.name ?? '');
      this.description.setValue(project?.description ?? '');
      this.name.markAsUntouched();
      this.description.markAsUntouched();
    });
  }

  protected submit(): void {
    this.name.setValue(this.name.value.trim());
    this.name.markAsTouched();
    this.description.markAsTouched();

    if (this.name.invalid || this.description.invalid) {
      this.formElement().nativeElement.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }

    const description = this.description.value.trim();
    this.saved.emit({
      name: this.name.value,
      description: description || null,
    });
  }
}
