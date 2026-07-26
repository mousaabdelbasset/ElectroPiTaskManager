import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DocumentTitleService } from './core/services/document-title.service';
import { LanguageService } from './core/services/language.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  // Injection starts both app-wide lifecycle services once at bootstrap.
  private readonly languageService = inject(LanguageService);
  private readonly documentTitleService = inject(DocumentTitleService);
}
