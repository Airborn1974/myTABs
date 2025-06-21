# myTABs – LoopLogic Productivity Extension

`myTABs` is a Chromium-based extension that turns your new tab into a structured dashboard for tab groups, notes, and reminders — with optional Supabase backup and mobile sync.

## 🚀 Features
- 📂 Organize tabs into visual groups
- 📝 Add notes and task lists per group
- 🔔 Set reminders via Chrome notifications
- 📥 Save open tabs to groups (via modal or shortcut)
- 📁 Optional Supabase sync for backup and mobile

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
