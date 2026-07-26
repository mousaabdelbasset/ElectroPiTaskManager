# ElectroPi Task Manager

ElectroPi Task Manager is a bilingual project and task management application built as a technical-task submission. It combines a Clean Architecture ASP.NET Core API, an Angular single-page application, SQL Server persistence, and a Docker Compose setup for running the complete stack locally.

## Implemented Features

- Create, view, edit, and delete projects.
- Prevent deletion of a project while it contains tasks.
- View project details with tasks grouped into **To Do**, **In Progress**, and **Done**.
- Create, view, edit, and delete tasks.
- Filter the complete task list by status.
- Change task status from an accessible select control.
- Drag tasks between project status columns using Angular CDK.
- Apply optimistic drag-and-drop updates and restore the original status if the API request fails.
- Prevent duplicate status requests while an update is pending.
- Validate required fields, maximum lengths, project references, enum values, and due dates.
- Display overdue tasks while preventing newly selected past due dates.
- Show loading, empty, confirmation, success, and safe error states.
- Switch between English/LTR and Arabic/RTL at runtime.
- Persist the selected language in browser local storage.
- Provide Swagger/OpenAPI documentation in the Development environment.
- Support responsive desktop and mobile layouts.

## Technology Stack

### Backend

- .NET 10
- ASP.NET Core Web API with controllers
- Entity Framework Core 10
- SQL Server
- Swashbuckle / Swagger
- Nullable reference types and asynchronous APIs

### Frontend

- Angular 21 standalone components
- TypeScript 5.9
- Angular Signals and `OnPush` change detection
- Angular Reactive Forms
- Angular CDK Drag and Drop
- ngx-translate
- RxJS
- Tailwind CSS 4

### Containers

- Docker Compose
- Multi-stage ASP.NET Core API image
- Multi-stage Angular build served by Nginx
- SQL Server 2022 Developer container

## Clean Architecture

The backend is split into four projects with explicit dependency direction:

```text
ElectroPi.TaskManager.Domain
    ↑
ElectroPi.TaskManager.Application
    ↑                ↑
ElectroPi.TaskManager.Infrastructure
    ↑
ElectroPi.TaskManager.Api
```

The actual project references are:

```text
Application    -> Domain
Infrastructure -> Domain, Application
Api            -> Application, Infrastructure
Domain         -> no project references
```

### Layer Responsibilities

- **Domain** contains the `Project` and `TaskItem` entities and the `TaskItemStatus` enum. It has no HTTP or EF Core dependency.
- **Application** contains request/response DTOs, repository and service interfaces, application services, business validation, manual DTO mapping, and expected application exceptions.
- **Infrastructure** contains `TaskManagerDbContext`, EF Core entity configurations, migrations, and repository implementations.
- **API** contains controllers, dependency injection, JSON configuration, CORS, Swagger, migration-on-start wiring, and centralized exception middleware.

The frontend is a separate Angular application and consumes only the public HTTP contracts.

## Repository Structure

```text
.
├── ElectroPi.TaskManager.Domain/
│   ├── Entities/
│   └── Enums/
├── ElectroPi.TaskManager.Application/
│   ├── DTOs/
│   ├── Exceptions/
│   ├── Interfaces/
│   ├── Services/
│   └── Validation/
├── ElectroPi.TaskManager.Infrastructure/
│   ├── Data/
│   │   └── Configurations/
│   ├── Migrations/
│   └── Repositories/
├── ElectroPi.TaskManager.Api/
│   ├── Controllers/
│   ├── Middleware/
│   ├── Dockerfile
│   └── Program.cs
├── FrontEnd/
│   ├── src/app/
│   │   ├── core/
│   │   ├── features/
│   │   ├── layout/
│   │   └── shared/
│   ├── src/assets/i18n/
│   ├── Dockerfile
│   └── nginx.conf
├── Documentation/
├── compose.yaml
├── .env.example
└── ElectroPi.TaskManager.slnx
```

Additional functional and technical notes are available in [Documentation](Documentation/README.md) and [Frontend Documentation](FrontEnd/Documentation/README.md).

## Database Model

The database has a required one-to-many relationship:

```text
Project (1) ─────────< TaskItem (many)
```

- Every task has a required `ProjectId`.
- Project and task IDs are SQL Server identity columns.
- Project names are required and limited to 150 characters.
- Task titles are required and limited to 200 characters.
- Task status is stored as an integer and indexed.
- The task foreign key is indexed.
- Deleting a project with tasks is restricted in both the application service and database relationship.
- Tasks must be deleted before their project can be deleted.

The initial EF Core migration creates the `Projects` and `TaskItems` tables, indexes, and foreign key.

## Backend Request Flow

```text
Controller
    -> Application Service
        -> Repository
            -> TaskManagerDbContext
                -> SQL Server
```

1. ASP.NET Core binds JSON or query values to the API action and DTO.
2. `[ApiController]` applies Data Annotation validation.
3. The controller delegates to an application service and passes the cancellation token.
4. The service applies business rules and manually maps DTOs and entities.
5. The repository executes an EF Core query or mutation through `TaskManagerDbContext`.
6. The controller returns the appropriate HTTP status.
7. Expected exceptions are converted to RFC-style `ProblemDetails` responses by middleware.

Read queries use `AsNoTracking`, filtering is executed in SQL Server, and repositories do not expose `IQueryable`.

## API Endpoints

Swagger is enabled only when the API runs in the Development environment.

### Projects

| Method   | Endpoint                          | Description                  | Success          |
| -------- | --------------------------------- | ---------------------------- | ---------------- |
| `GET`    | `/api/projects`                   | List projects                | `200 OK`         |
| `GET`    | `/api/projects/{id}`              | Get a project with its tasks | `200 OK`         |
| `POST`   | `/api/projects`                   | Create a project             | `201 Created`    |
| `PUT`    | `/api/projects/{id}`              | Update a project             | `204 No Content` |
| `DELETE` | `/api/projects/{id}`              | Delete an empty project      | `204 No Content` |
| `GET`    | `/api/projects/{projectId}/tasks` | List tasks for a project     | `200 OK`         |

Deleting a project that contains tasks returns `409 Conflict`.

### Tasks

| Method   | Endpoint                     | Description                               | Success          |
| -------- | ---------------------------- | ----------------------------------------- | ---------------- |
| `GET`    | `/api/tasks`                 | List all tasks                            | `200 OK`         |
| `GET`    | `/api/tasks?status={status}` | Filter by `ToDo`, `InProgress`, or `Done` | `200 OK`         |
| `GET`    | `/api/tasks/{id}`            | Get one task                              | `200 OK`         |
| `POST`   | `/api/tasks`                 | Create a task                             | `201 Created`    |
| `PUT`    | `/api/tasks/{id}`            | Update a complete task                    | `204 No Content` |
| `PATCH`  | `/api/tasks/{id}/status`     | Update task status only                   | `204 No Content` |
| `DELETE` | `/api/tasks/{id}`            | Delete a task                             | `204 No Content` |

Status values are serialized as strings. Numeric enum values are rejected by the JSON configuration.

## Angular Frontend Architecture

The Angular application uses standalone components and lazy-loaded feature routes:

- `/projects` loads the project list.
- `/projects/:id` loads project details and the status-column task board.
- `/tasks` loads the complete task list and server-side status filter.
- `/settings` loads language settings.

The source is organized by responsibility:

- `core/` contains application-wide configuration and services.
- `features/` contains Projects, Tasks, and Settings pages, components, models, API services, and route definitions.
- `layout/` contains the responsive application shell and navigation.
- `shared/` contains reusable modal, confirmation, toast, empty-state, error-model, and utility code.

Pages own orchestration and immutable signal state. API services are the only feature classes that use `HttpClient`. Presentational components communicate through typed inputs and outputs. Subscriptions use `takeUntilDestroyed`.

## Localization and RTL

Translations are stored in:

```text
FrontEnd/src/assets/i18n/en.json
FrontEnd/src/assets/i18n/ar.json
```

`LanguageService`:

- Supports `en` and `ar`.
- Uses the saved browser preference when available.
- Falls back to the browser language, then English.
- Updates the root document `lang` attribute.
- Sets `dir="ltr"` for English and `dir="rtl"` for Arabic.
- Stores the selection in local storage.

Logical CSS spacing and responsive layout classes allow the complete shell, navigation, forms, cards, and status board to mirror in RTL.

## Drag-and-Drop Status Updates

The project details board uses Angular CDK `CdkDrag`, `CdkDropList`, and `CdkDropListGroup`.

When a task is dropped into a different column:

1. The local project signal is updated optimistically.
2. The frontend calls `PATCH /api/tasks/{id}/status`.
3. The task ID is marked pending to prevent a duplicate status request.
4. On success, the optimistic state is retained.
5. On failure, the original task is restored and a translated safe error toast is shown.

The status select remains available as an accessible alternative. Same-column drops do not call the API, and no task ordering is persisted because the backend has no ordering field.

## Validation and Error Handling

### Backend

- Data Annotations validate required fields, string lengths, ranges, enum values, and non-default dates.
- Application services repeat important business validation so rules are not tied only to HTTP model binding.
- Task creation rejects due dates before the current day.
- An unchanged historical due date remains valid when editing an overdue task, but selecting a different past date is rejected.
- Task services verify that the referenced project exists.
- Project deletion checks for tasks and also relies on the restrictive foreign key for race-condition protection.
- Invalid input, missing records, and conflicts map to `400`, `404`, and `409`.
- Unexpected exceptions return a generic `500` response. Stack traces and internal exception details are not returned.
- Every middleware-generated problem response includes a trace identifier.

### Frontend

- Reactive Forms validate required fields, maximum lengths, project selection, and due dates.
- The due-date minimum uses the user's local calendar date rather than UTC.
- New tasks are submitted with `ToDo`; status remains editable later.
- Safe translation keys map HTTP failures to user-facing messages without exposing internal API details.
- Mutating actions disable duplicate submission and use confirmation dialogs where deletion is involved.

## Docker Architecture

```text
Browser
  |
  | http://localhost:8080
  v
Angular production files / Nginx
  |
  | /api/* -> http://api:8080
  v
ASP.NET Core API
  |
  | SQL Server protocol
  v
SQL Server 2022
  |
  v
electropi_sql_data named volume
```

- **frontend** builds Angular with Node 22 and serves the production output from Nginx.
- **Nginx** serves SPA routes and proxies `/api/` to the internal API service.
- **api** publishes the .NET application and listens on container port `8080`, mapped to host port `8081`.
- **database** runs SQL Server 2022 Developer and is checked with `sqlcmd`.
- The API waits for the database health check and applies EF Core migrations on startup through `Database__ApplyMigrations=true`.
- SQL Server files are persisted in the named volume `electropi_sql_data`.
- `docker compose down` stops and removes the containers but keeps the named volume and its data.

## Prerequisites

### Recommended Docker Setup

- Docker Desktop with Docker Compose support
- Available host ports `8080` and `8081`

### Manual Setup

- .NET 10 SDK
- EF Core CLI compatible with EF Core 10
- SQL Server
- Node.js 22
- npm 11
- A trusted ASP.NET Core development HTTPS certificate for the default frontend development API URL

## Docker Quick Start

Run the following commands from the repository root.

1. Copy `.env.example` to `.env`.

   PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

   macOS/Linux:

   ```bash
   cp .env.example .env
   ```

   Update the local `.env` value as needed. Do not commit `.env` or use the example value outside local development.

2. Build and start all services:

   ```bash
   docker compose up -d --build
   ```

3. Open the application:

   <http://localhost:8080>

4. Open Swagger:

   <http://localhost:8081/swagger>

5. Check container status:

   ```bash
   docker compose ps
   ```

6. Stop the stack:

   ```bash
   docker compose down
   ```

## Manual Setup

### Database

1. Start a reachable SQL Server instance.
2. Configure `ConnectionStrings:DefaultConnection` locally. Prefer an environment variable or another local secret mechanism; do not commit credentials.
3. Apply the checked-in migration from the repository root:

   ```bash
   dotnet ef database update --project ElectroPi.TaskManager.Infrastructure --startup-project ElectroPi.TaskManager.Api
   ```

When the model changes, create a new migration instead of editing the existing migration:

```bash
dotnet ef migrations add <MigrationName> --project ElectroPi.TaskManager.Infrastructure --startup-project ElectroPi.TaskManager.Api --output-dir Migrations
```

Then apply it with the database update command above.

### Backend

Restore and build the solution:

```bash
dotnet restore ElectroPi.TaskManager.slnx
dotnet build ElectroPi.TaskManager.slnx
```

Run the HTTPS Development profile expected by the Angular development environment:

```bash
dotnet run --project ElectroPi.TaskManager.Api --launch-profile https
```

The default Development URLs are:

- API: `https://localhost:7247`
- Swagger: `https://localhost:7247/swagger`

Swagger is not enabled outside Development.

### Frontend

From `FrontEnd/`:

```bash
npm ci
npm start
```

Open <http://localhost:4200>.

The development environment calls `https://localhost:7247/api`. The production build uses the relative `/api` URL, which Nginx proxies to the API container.

## Configuration

| Setting                               | Purpose                                                   |
| ------------------------------------- | --------------------------------------------------------- |
| `ConnectionStrings:DefaultConnection` | SQL Server connection used by EF Core                     |
| `Database:ApplyMigrations`            | Applies pending migrations during API startup when `true` |
| `ASPNETCORE_ENVIRONMENT`              | Controls Development-only Swagger behavior                |
| `ASPNETCORE_HTTP_PORTS`               | Sets the API container listening port                     |
| `MSSQL_SA_PASSWORD`                   | Local Docker SQL Server credential sourced from `.env`    |

ASP.NET Core environment variables use double underscores for nested keys, such as `ConnectionStrings__DefaultConnection`.

For local Angular development, the API CORS policy allows `http://localhost:4200` and `http://localhost:5173`. In Docker, browser API calls use the same Nginx origin and do not require cross-origin access.

## Assumptions and Design Decisions

- A task must belong to an existing project.
- Project names are not required to be unique.
- A project cannot be deleted until all its tasks are deleted.
- New tasks are created as `ToDo` by the Angular UI.
- API enum values are strings, while task status is stored as an integer.
- DTOs are manually mapped; entities are not returned directly.
- Feature-specific repositories are used instead of a generic repository.
- The implementation intentionally does not add CQRS, MediatR, AutoMapper, FluentValidation, a generic Unit of Work, or result wrappers.
- Task lists are ordered by database identity for deterministic reads; user-defined ordering is not implemented.
- Docker Compose is configured for local evaluation, with the API running in Development so Swagger is available.

## Known Limitations

- No authentication, authorization, or user ownership.
- No automated application test projects or frontend spec files are currently included.
- No CI workflow or production deployment definition is included.
- No pagination, search, or user-defined task ordering.
- No optimistic concurrency token or conflict resolution for simultaneous edits.
- No real-time updates between multiple browser sessions.
- No dedicated API health-check endpoint or production observability stack.
- Docker Compose uses a local SQL Server administrator credential and Development-mode Swagger; production secret management and hardening are outside the current scope.

## Realistic Future Improvements

- Add authentication, authorization, and per-user project ownership.
- Add backend unit/integration tests and Angular component/service tests.
- Add pagination, search, and richer filtering.
- Add concurrency handling and audit fields.
- Add an explicit persisted task-ordering model if manual ordering becomes a requirement.
- Add API health checks, structured observability, and production-safe logging.
- Add CI for restore, build, tests, container builds, and migration validation.
- Add production deployment configuration with managed secrets, TLS, and a non-Development API environment.

## Troubleshooting

### Ports 8080 or 8081 Are Already in Use

Check the current stack:

```bash
docker compose ps
```

Stop the process or container already using the required host port, or change only the host side of the relevant port mapping in `compose.yaml`.

### Docker Desktop Is Not Running

Start Docker Desktop and wait until the Docker engine is ready, then retry:

```bash
docker compose up -d --build
```

If Compose starts but a service exits, inspect the service logs:

```bash
docker compose logs database
docker compose logs api
docker compose logs frontend
```

### SQL Server Takes Time to Start

The database service has a startup grace period and repeated health checks. Use:

```bash
docker compose ps
docker compose logs database
```

The API starts only after SQL Server becomes healthy. Ensure the value copied from `.env.example` has been replaced with a strong local password that satisfies SQL Server requirements.

The SQL password initializes the database container's persisted data. Changing `.env` later does not automatically rewrite credentials inside an existing named volume. Removing the volume would permanently delete its SQL data.

### Manual Frontend Cannot Reach the API

- Confirm the API is running on `https://localhost:7247`.
- Trust the ASP.NET Core development HTTPS certificate.
- Confirm the browser accepts the local certificate.
- Confirm the Angular app is running on an origin allowed by the API CORS policy.

## Submission and Demo Guide

A concise evaluator walkthrough:

1. Start the stack with the Docker quick-start commands.
2. Open <http://localhost:8080>.
3. Create a project and confirm it appears immediately.
4. Open project details and create a task.
5. Move the task between status columns by drag and drop.
6. Change status using the select control.
7. Edit and delete a task through the confirmation flow.
8. Demonstrate project deletion protection while tasks exist.
9. Switch between English and Arabic and confirm the RTL layout.
10. Open <http://localhost:8081/swagger> and review the actual controller endpoints.

This repository is intended to be evaluated locally through Docker Compose or the documented manual development setup.
