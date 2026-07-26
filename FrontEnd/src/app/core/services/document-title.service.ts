import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { filter, merge, startWith } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DocumentTitleService {
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    merge(
      this.router.events.pipe(filter((event) => event instanceof NavigationEnd)),
      this.translate.onLangChange,
    )
      .pipe(startWith(null), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateTitle());
  }

  private updateTitle(): void {
    const titleKey = this.findDeepestTitle(this.router.routerState.snapshot.root);
    const pageTitle = titleKey ? this.translate.instant(titleKey) : '';
    this.document.title = pageTitle ? `${String(pageTitle)} · ElectroPi` : 'ElectroPi Task Manager';
  }

  private findDeepestTitle(route: ActivatedRouteSnapshot): string | null {
    let current: ActivatedRouteSnapshot | null = route;
    let title: string | null = null;

    while (current) {
      const candidate = current.data['title'];
      if (typeof candidate === 'string') {
        title = candidate;
      }
      current = current.firstChild;
    }

    return title;
  }
}
