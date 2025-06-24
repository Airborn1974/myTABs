# PLANNING.md – Architecture + Vision for `myTABs`

## 🎯 Goal
To replicate and enhance tabExtend using LoopLogic principles, with cross-device sync via Supabase and a responsive tree-based UI inspired by Google Tasks.

## 🧠 Architecture
- New tab override
- React tree UI (group > tab/item)
- Context menus per group/tab
- Chrome APIs: tabs, storage, notifications, commands
- Supabase: sync, auth, mobile app integration

## 🧰 Component Breakdown
- `SidebarTree`
- `TabGroupCard`
- `TabPickerModal`
- `NotesEditor`
- `ReminderModal`
- `SupabaseClient`

## 🔌 Extension Permissions
- `tabs`
- `storage`
- `commands`
- `notifications`

## 🗺️ Roadmap
- Phase 1: Local MVP
- Phase 2: Supabase sync + mobile viewer
- Phase 3: Bookmark import/export

## 🔮 Future Considerations & Next Steps
- **Supabase Persistence for Group Reordering**: The current implementation reorders groups in the local state and local storage. For these changes to persist across devices via Supabase, the following will be needed:
    - Schema modification: Add an `order` or `position` column to the `groups` table in Supabase.
    - Backend logic: Implement a robust way to update the order of multiple groups, likely within a transaction, when a reorder occurs. This could involve updating the `order` field for all affected groups.
- **Enhanced Component Testing**: Improve test coverage for UI interactions, especially for dialogs and drag-and-drop functionality, potentially using a library like React Testing Library and specialized dnd testing utilities.
- **Address Codebase TODOs**: Systematically review and address any remaining `TODO:` comments within the codebase for further enhancements and fixes.
