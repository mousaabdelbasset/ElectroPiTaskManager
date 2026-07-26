# Tasks — Technical Documentation

## Data flow

```text
TasksPage / ProjectDetailsPage
  -> TasksApiService
    -> HttpClient
      -> /api/tasks
```

Project task reads use `/api/projects/{projectId}/tasks`. Creation always uses `/api/tasks` with `projectId` in the request body, matching the Backend contract.

## Main files

| File                            | Responsibility                                   |
| ------------------------------- | ------------------------------------------------ |
| `models/task-item.models.ts`    | Status union and typed DTOs                      |
| `services/tasks-api.service.ts` | Task HTTP operations                             |
| `pages/tasks-page/*`            | Server filter, CRUD, and project-name lookup     |
| `pages/project-details-page/*`  | CDK Kanban drag/drop and optimistic rollback     |
| `components/task-form/*`        | Reactive create/edit form                        |
| `components/task-card/*`        | Display, overdue state, actions, status selector |
| `components/status-filter/*`    | Reusable accessible filter control               |

## Status safety

API status values stay exactly `ToDo`, `InProgress`, and `Done`. `isTaskItemStatus` validates values read from the native select before emitting a typed event. Only displayed labels are translated.

Project details uses `CdkDropListGroup`, `CdkDropList`, and `CdkDrag`. A drag updates the project signal before PATCH; the original task is restored on failure. `pendingStatusTaskIds` blocks a second status request for the same task. Same-column drops do nothing, and no client ordering is persisted because the Backend has no ordering field.

## Create status and due dates

`TaskFormComponent` keeps the status control for edit mode, hides it in create mode, and emits `ToDo` explicitly for new tasks.

`DateFormatterService` constructs `datetime-local` values from local calendar parts rather than UTC. The input has a local `min` and a Reactive Forms validator. For an overdue edit, `min` exposes the original value while the validator rejects any different past value. Requests use a timezone-free local date-time so the Backend receives the selected calendar day without a UTC day shift.

## Project names

`TaskItemResponse` contains `projectId` but no project name. The All Tasks page loads projects once and builds a computed `Map<number, string>`. This is a view-model transformation, not a Backend assumption.

`TaskCardComponent.remove` emits the complete typed task. The owning page stores it as the confirmation target, then calls `TasksApiService.delete(id)`. On success, the page creates a new task array without that id so OnPush updates immediately. The visible button uses an inline SVG and translated text; the SVG is decorative and the button retains an accessible name.

## Cancellation and state

All requests use Angular HttpClient observables with `takeUntilDestroyed`. Pages update signals after mutations. The server performs list filtering through the query parameter.

When adding a task field, update the Backend-aligned models, Reactive Form, card, both translation files, and this documentation.
