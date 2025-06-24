# TODO List for myTABs

This file tracks pending tasks and areas for future improvement in the `myTABs` extension.

## High Priority
- Implement Supabase persistence for group reordering (requires schema changes for an `order` or `position` column in the `groups` table and backend logic for transactional updates).

## Medium Priority
- Enhance component tests for UI interactions (e.g., dialogs, drag-and-drop) using a library like React Testing Library and specialized dnd testing utilities.
- Review and implement any remaining `TODO:` comments found within the codebase.
- Investigate and address the `npm audit` moderate severity vulnerabilities.

## Low Priority
- Explore adding theming options beyond light/dark mode.
- Consider more advanced filtering and sorting options on the Tab Management page.

## Completed Recently
- Implemented tab renaming.
- Implemented group renaming, deletion, and drag-and-drop reordering (local state).
- Added toast notifications for various CRUD operations.
