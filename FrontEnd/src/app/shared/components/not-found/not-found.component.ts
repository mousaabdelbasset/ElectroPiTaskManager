import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, TranslatePipe],
  template: `
    <main class="page-container flex min-h-[70vh] items-center justify-center">
      <div class="max-w-lg text-center">
        <p class="text-sm font-bold uppercase tracking-[0.2em] text-primary">404</p>
        <h1 class="mt-3 text-4xl font-bold text-ink">{{ 'pages.notFound.title' | translate }}</h1>
        <p class="mt-4 text-muted">{{ 'pages.notFound.description' | translate }}</p>
        <a routerLink="/projects" class="btn-primary mt-7">
          {{ 'pages.notFound.back' | translate }}
        </a>
      </div>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundComponent {}
