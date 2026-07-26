import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  imports: [TranslatePipe],
  template: `
    <div
      class="pointer-events-none fixed inset-x-4 top-4 z-[100] flex flex-col items-end gap-3 sm:start-auto sm:end-5 sm:w-96"
      aria-live="polite"
      aria-atomic="true"
    >
      @for (toast of toastService.messages(); track toast.id) {
        <div
          class="pointer-events-auto flex w-full items-start gap-3 rounded-xl border bg-white p-4 shadow-xl"
          [class.border-emerald-200]="toast.kind === 'success'"
          [class.border-red-200]="toast.kind === 'error'"
        >
          <span
            class="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-bold"
            [class.bg-emerald-100]="toast.kind === 'success'"
            [class.text-emerald-700]="toast.kind === 'success'"
            [class.bg-red-100]="toast.kind === 'error'"
            [class.text-danger]="toast.kind === 'error'"
            aria-hidden="true"
          >
            {{ toast.kind === 'success' ? '✓' : '!' }}
          </span>
          <p class="flex-1 text-sm font-medium text-ink">{{ toast.messageKey | translate }}</p>
          <button
            type="button"
            class="-m-2 p-2 text-muted hover:text-ink"
            [attr.aria-label]="'common.dismiss' | translate"
            (click)="toastService.dismiss(toast.id)"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastContainerComponent {
  protected readonly toastService = inject(ToastService);
}
