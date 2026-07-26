import { Routes } from '@angular/router';

export const PROJECT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/projects-page/projects-page.component').then(
        (component) => component.ProjectsPageComponent,
      ),
    data: { title: 'pages.projects.title' },
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/project-details-page/project-details-page.component').then(
        (component) => component.ProjectDetailsPageComponent,
      ),
    data: { title: 'pages.projectDetails.title' },
  },
];
