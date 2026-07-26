# Projects — Functional Documentation

## What it does

The Projects feature lets a user:

- View all projects as responsive cards.
- Create a project.
- Edit a project's name and description.
- Delete an empty project.
- Open project details and manage its tasks.

After a successful create, the modal closes, the blank form state is restored, a translated success message appears, and the new project is visible immediately without a page refresh.

## Screens

`/projects` shows loading skeletons first, followed by projects, an empty state, or a retryable error state.

`/projects/:id` shows:

- Project name, description, and created date.
- Edit and delete actions.
- Tasks grouped into To Do, In Progress, and Done columns.
- Status filters.
- Add, edit, delete, and direct status actions for tasks.

## Validation

- Project name is required and limited to 150 characters.
- Description is optional and limited to 1000 characters.
- Leading and trailing whitespace is removed before submission.
- The Backend remains the final validation authority.

## Delete behavior

Deleting a project uses an accessible confirmation dialog. If the project contains tasks, the Backend returns `409 Conflict` and the user sees a friendly instruction to delete those tasks first.

No browser-native confirmation dialog is used.
