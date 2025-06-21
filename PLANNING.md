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
