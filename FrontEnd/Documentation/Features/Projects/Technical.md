# Projects — Technical Documentation

## Data flow

```text
ProjectsPage / ProjectDetailsPage
  -> ProjectsApiService
    -> HttpClient
      -> /api/projects
```

`ProjectsApiService` is the only Projects file that uses `HttpClient`. It receives the base URL through `API_BASE_URL`.

## Main files

| File                               | Responsibility                            |
| ---------------------------------- | ----------------------------------------- |
| `models/project.models.ts`         | Typed Backend request/response contracts  |
| `services/projects-api.service.ts` | Project HTTP operations                   |
| `pages/projects-page/*`            | List state and project CRUD orchestration |
| `pages/project-details-page/*`     | Project/task details orchestration        |
| `components/project-card/*`        | Presentational project card               |
| `components/project-form/*`        | Reactive create/edit form                 |

## State and requests

Pages use signals for loading, errors, data, open dialogs, and submitting state. HTTP subscriptions use `takeUntilDestroyed`, so navigating away cancels the underlying HttpClient request.

Successful create, edit, and delete operations update local state without reloading the complete project list. Create uses an immutable upsert by `id`, so OnPush observes the new array immediately and a later refresh cannot duplicate the returned project. Project details are loaded once from the Backend response that already contains tasks.

`ProjectFormComponent` must keep `[formGroup]="form"` on its `<form>`. Without that directive, `(ngSubmit)` does not own the native submit lifecycle and the browser reloads the page before the Angular create flow completes.

## Extending the feature

When adding a project field:

1. Confirm the Backend DTO and database constraint.
2. Update the typed request/response interfaces.
3. Add the control and matching validator.
4. Update local state mapping after successful edits.
5. Add English and Arabic translation keys.
6. Update both Projects documents.
