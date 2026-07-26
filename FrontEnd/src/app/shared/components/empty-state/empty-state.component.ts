import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-empty-state',
  imports: [TranslatePipe],
  template: `
    <div
      class="surface-card flex min-h-72 flex-col items-center justify-center border-dashed p-8 text-center"
    >
      <div
        class="mb-5 flex size-16 items-center justify-center rounded-full bg-blue-100 text-2xl text-primary"
      >
        <span aria-hidden="true">{{ icon() }}</span>
      </div>
      <h2 class="text-xl font-bold text-ink">{{ titleKey() | translate }}</h2>
      <p class="mt-2 max-w-md text-sm leading-6 text-muted">{{ descriptionKey() | translate }}</p>
      @if (actionKey()) {
        <button type="button" class="btn-primary mt-6" (click)="action.emit()">
          {{ actionKey() | translate }}
        </button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  readonly titleKey = input.required<string>();
  readonly descriptionKey = input.required<string>();
  readonly actionKey = input<string | null>(null);
  readonly icon = input('◇');
  readonly action = output<void>();
}
