import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs';

export type SupportedLanguage = 'en' | 'ar';

const LANGUAGE_STORAGE_KEY = 'electropi-language';
const SUPPORTED_LANGUAGES: readonly SupportedLanguage[] = ['en', 'ar'];

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService);
  private readonly document = inject(DOCUMENT);

  readonly current = signal<SupportedLanguage>(this.resolveInitialLanguage());

  constructor() {
    this.translate.addLangs([...SUPPORTED_LANGUAGES]);
    this.applyLanguage(this.current());
  }

  /**
   * Changes translations at runtime and mirrors the complete document for Arabic.
   */
  setLanguage(language: SupportedLanguage): void {
    if (!SUPPORTED_LANGUAGES.includes(language)) {
      return;
    }

    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    this.current.set(language);
    this.applyLanguage(language);
  }

  private resolveInitialLanguage(): SupportedLanguage {
    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLanguage === 'en' || savedLanguage === 'ar') {
      return savedLanguage;
    }

    const browserLanguage = navigator.language.split('-')[0];
    return browserLanguage === 'ar' ? 'ar' : 'en';
  }

  private applyLanguage(language: SupportedLanguage): void {
    const root = this.document.documentElement;
    root.lang = language;
    root.dir = language === 'ar' ? 'rtl' : 'ltr';

    // Subscribing starts the HTTP translation loader; it completes after one file load.
    this.translate.use(language).pipe(take(1)).subscribe();
  }
}
