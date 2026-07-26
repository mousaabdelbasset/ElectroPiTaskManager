import { Routes } from '@angular/router';

export const TASK_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/tasks-page/tasks-page.component').then(
        (component) => component.TasksPageComponent,
      ),
    data: { title: 'pages.tasks.title' },
  },
];
