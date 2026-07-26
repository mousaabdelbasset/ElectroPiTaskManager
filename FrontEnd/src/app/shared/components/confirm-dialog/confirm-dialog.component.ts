import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-confirm-dialog',
  imports: [ModalComponent, TranslatePipe],
  template: `
    <app-modal [titleKey]="titleKey()" [busy]="busy()" (closed)="cancelled.emit()">
      <p class="text-sm leading-6 text-muted">{{ messageKey() | translate }}</p>
      <div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" class="btn-secondary" [disabled]="busy()" (click)="cancelled.emit()">
          {{ 'common.cancel' | translate }}
        </button>
        <button type="button" class="btn-danger" [disabled]="busy()" (click)="confirmed.emit()">
          @if (busy()) {
            {{ 'common.deleting' | translate }}
          } @else {
            {{ confirmKey() | translate }}
          }
        </button>
      </div>
    </app-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
  readonly titleKey = input.required<string>();
  readonly messageKey = input.required<string>();
  readonly confirmKey = input('common.delete');
  readonly busy = input(false);
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();
}
