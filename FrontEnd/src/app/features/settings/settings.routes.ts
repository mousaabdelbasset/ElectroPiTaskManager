import { Routes } from '@angular/router';

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/settings-page/settings-page.component').then(
        (component) => component.SettingsPageComponent,
      ),
    data: { title: 'pages.settings.title' },
  },
];
