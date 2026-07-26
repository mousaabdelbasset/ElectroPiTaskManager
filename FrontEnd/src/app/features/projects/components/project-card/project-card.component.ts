import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { DateFormatterService } from '../../../../core/services/date-formatter.service';
import { ProjectResponse } from '../../models/project.models';

@Component({
  selector: 'app-project-card',
  imports: [RouterLink, TranslatePipe],
  template: `
    <article
      class="surface-card group flex min-h-64 flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div class="flex items-start justify-between gap-3">
        <span class="status-pill bg-blue-100 text-primary-dark">{{
          'projects.active' | translate
        }}</span>
        <div class="flex gap-1">
          <button
            type="button"
            class="icon-btn size-9"
            [attr.aria-label]="'projects.actions.edit' | translate"
            (click)="edit.emit(project())"
          >
            <span aria-hidden="true">✎</span>
          </button>
          <button
            type="button"
            class="icon-btn size-9 hover:bg-red-50 hover:text-danger"
            [attr.aria-label]="'projects.actions.delete' | translate"
            (click)="remove.emit(project())"
          >
            <span aria-hidden="true">⌫</span>
          </button>
        </div>
      </div>

      <h2 class="mt-4 text-xl font-bold text-ink">{{ project().name }}</h2>
      <p class="mt-2 line-clamp-3 text-sm leading-6 text-muted">
        {{ project().description || ('projects.noDescription' | translate) }}
      </p>

      <div class="mt-auto flex items-center justify-between gap-4 border-t border-border pt-4">
        <span class="text-sm text-muted">
          <span aria-hidden="true">▣</span>
          {{ createdDate() }}
        </span>
        <a
          [routerLink]="['/projects', project().id]"
          class="font-semibold text-primary hover:text-primary-dark"
        >
          {{ 'projects.viewProject' | translate }}
          <span class="directional-arrow" aria-hidden="true">→</span>
        </a>
      </div>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectCardComponent {
  private readonly dates = inject(DateFormatterService);

  readonly project = input.required<ProjectResponse>();
  readonly edit = output<ProjectResponse>();
  readonly remove = output<ProjectResponse>();
  protected readonly createdDate = computed(() => this.dates.format(this.project().createdAt));
}
