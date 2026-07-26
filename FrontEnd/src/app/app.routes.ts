import { Routes } from '@angular/router';
import { AppLayoutComponent } from './layout/components/app-layout/app-layout.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'projects',
  },
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      {
        path: 'projects',
        loadChildren: () =>
          import('./features/projects/projects.routes').then((routes) => routes.PROJECT_ROUTES),
      },
      {
        path: 'tasks',
        loadChildren: () =>
          import('./features/tasks/tasks.routes').then((routes) => routes.TASK_ROUTES),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./features/settings/settings.routes').then((routes) => routes.SETTINGS_ROUTES),
      },
      {
        path: '**',
        loadComponent: () =>
          import('./shared/components/not-found/not-found.component').then(
            (component) => component.NotFoundComponent,
          ),
        data: { title: 'pages.notFound.title' },
      },
    ],
  },
];
