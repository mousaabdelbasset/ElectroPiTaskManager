import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService, SupportedLanguage } from '../../../../core/services/language.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-settings-page',
  imports: [TranslatePipe],
  template: `
    <main class="page-container">
      <header class="mb-8">
        <p class="text-sm font-bold uppercase tracking-[0.14em] text-primary">
          {{ 'brand.workspace' | translate }}
        </p>
        <h1 class="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {{ 'pages.settings.title' | translate }}
        </h1>
        <p class="mt-2 max-w-2xl text-muted">{{ 'pages.settings.subtitle' | translate }}</p>
      </header>

      <section class="surface-card max-w-2xl p-5 sm:p-7">
        <div class="flex items-start gap-4">
          <div
            class="flex size-11 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-xl text-primary"
            aria-hidden="true"
          >
            文
          </div>
          <div>
            <h2 class="text-xl font-bold text-ink">{{ 'settings.language.title' | translate }}</h2>
            <p class="mt-1 text-sm leading-6 text-muted">
              {{ 'settings.language.description' | translate }}
            </p>
          </div>
        </div>

        <fieldset class="mt-6 grid gap-3 sm:grid-cols-2">
          <legend class="sr-only">{{ 'settings.language.title' | translate }}</legend>
          <button
            type="button"
            class="flex min-h-20 items-center gap-3 rounded-xl border p-4 text-start transition hover:bg-surface-soft"
            [class.border-primary]="language.current() === 'en'"
            [class.bg-blue-50]="language.current() === 'en'"
            [class.border-border]="language.current() !== 'en'"
            (click)="selectLanguage('en')"
          >
            <span
              class="flex size-10 items-center justify-center rounded-full bg-white font-bold text-primary shadow-sm"
              >EN</span
            >
            <span>
              <strong class="block text-ink">{{ 'settings.language.english' | translate }}</strong>
              <small class="text-muted">{{ 'settings.language.ltr' | translate }}</small>
            </span>
          </button>
          <button
            type="button"
            class="flex min-h-20 items-center gap-3 rounded-xl border p-4 text-start transition hover:bg-surface-soft"
            [class.border-primary]="language.current() === 'ar'"
            [class.bg-blue-50]="language.current() === 'ar'"
            [class.border-border]="language.current() !== 'ar'"
            (click)="selectLanguage('ar')"
          >
            <span
              class="flex size-10 items-center justify-center rounded-full bg-white font-bold text-primary shadow-sm"
              >ع</span
            >
            <span>
              <strong class="block text-ink">{{ 'settings.language.arabic' | translate }}</strong>
              <small class="text-muted">{{ 'settings.language.rtl' | translate }}</small>
            </span>
          </button>
        </fieldset>

        <p class="mt-5 rounded-lg bg-surface-soft p-3 text-sm text-muted">
          {{ 'settings.language.note' | translate }}
        </p>
      </section>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPageComponent {
  protected readonly language = inject(LanguageService);
  private readonly toast = inject(ToastService);

  protected selectLanguage(language: SupportedLanguage): void {
    if (this.language.current() === language) {
      return;
    }

    this.language.setLanguage(language);
    this.toast.success('settings.language.changed');
  }
}
