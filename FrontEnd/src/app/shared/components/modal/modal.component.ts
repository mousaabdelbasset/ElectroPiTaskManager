import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  input,
  output,
  viewChild,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

let modalId = 0;

@Component({
  selector: 'app-modal',
  imports: [TranslatePipe],
  template: `
    <div
      class="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/50 p-0 sm:items-center sm:p-4"
      (mousedown)="onBackdrop($event)"
    >
      <section
        #dialogPanel
        class="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-w-xl sm:rounded-2xl"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="titleId"
      >
        <header class="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
          <h2 class="text-xl font-bold text-ink" [id]="titleId">{{ titleKey() | translate }}</h2>
          <button
            type="button"
            class="icon-btn"
            [disabled]="busy()"
            [attr.aria-label]="'common.close' | translate"
            (click)="requestClose()"
          >
            <span aria-hidden="true" class="text-2xl leading-none">×</span>
          </button>
        </header>
        <div class="p-5 sm:p-6">
          <ng-content />
        </div>
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent implements AfterViewInit, OnDestroy {
  readonly titleKey = input.required<string>();
  readonly busy = input(false);
  readonly closed = output<void>();
  readonly panel = viewChild.required<ElementRef<HTMLElement>>('dialogPanel');
  readonly titleId = `modal-title-${++modalId}`;

  private previouslyFocused: HTMLElement | null = null;

  ngAfterViewInit(): void {
    this.previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const firstFocusable = this.panel().nativeElement.querySelector<HTMLElement>(
      'input, select, textarea, button, [tabindex]:not([tabindex="-1"])',
    );
    firstFocusable?.focus();
  }

  ngOnDestroy(): void {
    this.previouslyFocused?.focus();
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.requestClose();
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    const focusable = Array.from(
      this.panel().nativeElement.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );

    if (focusable.length === 0) {
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  onBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.requestClose();
    }
  }

  requestClose(): void {
    if (!this.busy()) {
      this.closed.emit();
    }
  }
}
