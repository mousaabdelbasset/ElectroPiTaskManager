# Tasks — Functional Documentation

## What it does

The Tasks feature lets a user:

- View all tasks.
- Filter tasks by `ToDo`, `InProgress`, or `Done`.
- Create a To Do task and choose its project.
- Edit all task fields.
- Change status directly from a task card.
- Drag a task between the To Do, In Progress, and Done columns.
- Delete a task after confirmation.
- Add and manage tasks inside a project details page.

## Forms

Task forms require:

- Title, maximum 200 characters.
- Due date.
- Existing project.

Description is optional and limited to 2000 characters. The create form does not show Status and always submits `ToDo`.

A newly selected due date must be today or later. Existing overdue tasks can keep their unchanged historical date, but a user cannot replace it with another past date. Tasks may still become overdue naturally as time passes.

## Filtering

The All Tasks page sends the selected status to the Backend. It does not download every task and filter in the browser.

Project details groups tasks by status to match the Stitch Kanban design.

Dragging updates the card immediately and calls the existing status PATCH endpoint. If the request fails, the task returns to its original column and the user sees a safe error. The card's status selector remains available as the accessible alternative.

Every task card displays a clearly labelled red Delete action. It opens the translated confirmation dialog; confirming calls `DELETE /api/tasks/{id}`, removes the card from the current project or task list, and shows success feedback.

## Feedback

Every operation disables duplicate submission, shows success or safe error feedback, and preserves the user's current filter. A status change that no longer matches the selected filter removes the card from the current list.
