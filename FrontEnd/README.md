# ElectroPi Task Manager Frontend

Angular frontend for the ElectroPi Task Manager API. The application follows the supplied Stitch design, supports English and Arabic at runtime, and provides project and task CRUD without mock data.

## Prerequisites

- Node.js `24.0+` supported by Angular 21. The current workspace was built with Node `24.14.1`.
- npm `11+`.
- The ASP.NET Core API running at the URL configured in `src/environments`.
- SQL Server and the Backend database migration applied when real data is required.

## Installation

```powershell
cd FrontEnd
npm install
```

The `FrontEnd/desgin` folder contains the original Stitch references and must remain unchanged.

## Development

```powershell
npm start
```

Open `http://localhost:4200`. This origin is already allowed by the Backend CORS policy.

## Production build

```powershell
npm run build
```

Output is written to `dist/electropi-task-manager/browser`.

## API URL configuration

The API URL is never hardcoded in feature services. It is read through the `API_BASE_URL` injection token:

- `src/environments/environment.development.ts`
- `src/environments/environment.ts`
- `src/app/core/config/api.config.ts`

The current value is `https://localhost:7247/api`. Change the production environment value for the target deployment.

## Architecture

```text
src/app/
  core/
    config/       Global API configuration
    services/     Language, title, date, and toast services
  layout/
    components/   Responsive application shell and navigation
  shared/
    components/   Modal, confirmation, toast, empty state, and Not Found
    models/       Cross-feature transport models
    utilities/    Shared safe API error mapping
  features/
    projects/
      components/ Project card and project form
      pages/      Projects list and project details
      services/   Typed Projects API client
      models/     Project request/response types
    tasks/
      components/ Task card, task form, and status filter
      pages/      All Tasks
      services/   Typed Tasks API client
      models/     Task request/response and status types
    settings/
      pages/      Runtime language settings
  app.config.ts
  app.routes.ts

src/assets/i18n/
  en.json
  ar.json
```

Feature pages orchestrate loading and mutations. Presentational components emit typed events. Only feature API services use `HttpClient`.

## API integration

Models mirror the real Backend DTOs:

- Project create/update: `name`, `description`.
- Project response: `id`, `name`, `description`, `createdAt`.
- Project details also includes `tasks`.
- Task create/update: `title`, `description`, `status`, `dueDate`, `projectId`.
- Task response adds server-generated `id`.
- Status values remain `ToDo`, `InProgress`, and `Done`.

Filtering on `/tasks` calls the Backend with `?status=...`. Mutations are not automatically retried. The frontend maps technical failures to safe localized messages and treats Backend validation as authoritative.

The Backend task response does not include a project name. The All Tasks page loads the project list once and resolves names from each task's `projectId`; the Backend was not changed.

## Localization and RTL

`ngx-translate` loads `en.json` and `ar.json` at runtime. `LanguageService`:

1. Uses a saved language when available.
2. Otherwise uses Arabic when the browser language is Arabic.
3. Falls back to English.
4. Updates `<html lang>` and `<html dir>` without a reload.
5. Stores only the language code in `localStorage`.

To add or edit text, add the same key to both translation files. API enum values must stay unchanged; translate only `statuses.*` labels.

The layout uses logical CSS/Tailwind properties such as `start`, `end`, `ms`, and `border-e`, so changing `dir` mirrors navigation and content rather than only changing text alignment.

## Adding a feature

1. Add a lazy route and feature folder under `features`.
2. Create typed request/response models from the real Backend contract.
3. Create a focused API service; do not expose `HttpClient` to components.
4. Keep page components responsible for state/orchestration.
5. Keep reusable feature components presentational.
6. Add all visible text to both translation files.
7. Add Functional and Technical documentation under `Documentation/Features`.
8. Format and run the production build.

## Design decisions

- Angular standalone components with strict TypeScript and OnPush change detection.
- Signals for local page state.
- Reactive Forms with Backend-matching limits.
- Tailwind CSS 4 through the official PostCSS setup.
- No UI framework, global state library, generic API client, or icon package.
- Accessible custom dialogs instead of native `confirm`.
- Server-side status filtering and no mock production data.

## Known limitations

- No authentication, accounts, notifications, analytics, pagination, or dark mode because the Backend does not support them.
- Project deletion is blocked when the project contains tasks.
- The API does not return task project names, so the All Tasks view resolves them from the projects endpoint.
- The configured production API URL is local until changed for deployment.

Detailed feature documentation starts at [Documentation/README.md](Documentation/README.md).
