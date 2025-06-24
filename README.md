# myTABs – LoopLogic Productivity Extension

`myTABs` is a Chromium-based extension that turns your new tab into a structured dashboard for tab groups, notes, and reminders — with optional Supabase backup and mobile sync.

## 🚀 Features
- 📂 **Organize with Groups:**
    - Create, rename, and delete visual groups for your tabs, notes, and to-do lists.
    - Reorder groups using drag-and-drop on your main workspace board.
    - Each group can have a distinct color for better visual organization.
- 📑 **Manage Tabs Efficiently:**
    - Save open browser tabs to specific groups.
    - Rename saved tabs for clarity.
    - Move tabs between different groups.
    - Delete unneeded tabs.
    - Access these actions from individual Tab Cards or the dedicated Tab Management page.
- 📝 **Notes and To-Dos:**
    - Add rich notes and trackable to-do lists within each group.
    - (Note: Management features like renaming/moving for notes and to-do lists are also available but not detailed here for brevity).
- 🔔 **Reminders:**
    - Set reminders for important tasks or links (via Chrome notifications).
- 📥 **Quick Save:**
    - Easily save your currently active tab to a chosen group using a modal or keyboard shortcuts.
- ☁️ **Cloud Sync (Optional):**
    - Back up your workspace (groups, tabs, notes, to-dos) to Supabase.
    - Enable cross-device synchronization and access via a potential mobile viewer.

## 🧱 Tech Stack
- Manifest v3 Chrome Extension
- React + Tailwind UI
- Supabase (optional cloud sync)

## 🛠️ Local Setup
```bash
git clone https://github.com/Airborn1974/myTABs.git
cd myTABs
npm install
```

## ▶️ Development
```bash
npm run dev
```

## 🔑 Environment Variables
Copy and edit `.env.local.template`:
```env
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
```

## 🔁 CI/CD
LoopLogic GitHub Actions pipeline is preconfigured.

## 📄 License
MIT (or LoopLogic dual license)
