# Tab Flow Canvas

Tab Flow Canvas is a browser extension designed to help you organize your browser tabs, notes, and todos all in one place. It provides a Kanban-style visual workspace to manage your digital life efficiently.

## Core Features

### Workspace Organization
*   **Groups:** Create and manage visual columns (Groups) to categorize different projects, contexts, or workflows.
*   **Item Management:** Organize various items like saved Tabs, Notes, and Todo Lists within these groups.
*   **Drag & Drop:** Easily move items between groups to re-organize your workspace.

### Tab Management
*   **Save Tabs:** Save currently open browser tabs, capturing their title, URL, and favicon.
*   **Open Tabs:** Quickly open saved tabs in your browser.
*   **Bookmarking:** Mark important tabs as "bookmarked" for quick access via a dedicated "Bookmarks" section.
*   **Save Current Tab:** A dedicated button or feature to quickly save the active browser tab to your workspace.
*   **Import Tabs:** Feature to import multiple currently open tabs into a selected group.

### Notes
*   **Rich Text Notes:** Create notes with a title and rich text content for detailed information.
*   **Edit & Delete:** Modify existing notes or remove them as needed.

### Todo Lists
*   **Create Lists:** Generate todo lists with a title to track tasks.
*   **Task Management:** Add, edit, mark as complete/incomplete, and delete individual tasks within each list.
*   **Delete Lists:** Remove entire todo lists when they are no longer needed.

### Data Persistence
*   **Supabase Integration:** For authenticated users, data is saved and synced using Supabase, allowing access across different browser instances.
*   **Local Storage:** For users who are not signed in, or as a fallback mechanism, data is stored in the browser's local storage.
*   **Sample Data:** New users are provided with sample data to demonstrate the extension's features and help them get started quickly.

### Authentication
*   **User Sign-in:** Users can create accounts and sign in, leveraging Supabase Auth for managing user sessions.
*   **Signed-out Access:** Signed-out users can still use the extension with their data stored locally.

### Theme Options
*   **Customizable Themes:** Choose between Light, Dark, or System default themes to match your visual preference.

## Getting Started / Installation

Tab Flow Canvas is a browser extension. To install it:

1.  **Build the extension:** If you have the source code, you'll first need to build the extension. Navigate to the project directory in your terminal and run `npm run build`. This will typically create a `dist` folder containing the necessary extension files.
2.  **Enable Developer Mode:** Open your browser's extension management page (e.g., `chrome://extensions` for Chrome, `edge://extensions` for Edge, `about:addons` for Firefox).
3.  **Load Unpacked:**
    *   Enable "Developer mode" (often a toggle switch on the extensions page).
    *   Click on "Load unpacked" (or a similar button).
    *   Select the `dist` directory (or the main project folder if you are running the development server via `npm run dev`).
4.  **Access the Extension:** Once installed, click on the Tab Flow Canvas icon in your browser's toolbar to open the popup and start organizing!

## Development

### Prerequisites
*   Node.js (latest LTS version recommended)
*   npm (comes with Node.js) or a compatible package manager like Yarn or pnpm.

### Setup
1.  **Clone the repository** (if you haven't already):
    ```sh
    git clone <repository_url> # Replace <repository_url> with the actual Git URL
    cd tab-flow-canvas # Or your project's directory name
    ```
2.  **Install dependencies:**
    ```sh
    npm install
    ```

### Running Locally
To start the development server, which typically builds the extension in watch mode:
```sh
npm run dev
```
This command, powered by Vite, compiles the extension and watches for file changes, automatically rebuilding the extension as you code. After starting the dev server, load the extension into your browser using the "Load unpacked" method, pointing to the main project directory (or the `dist` folder if specified by your Vite configuration). You may need to reload the extension in your browser's extension management page to see updates after code changes.

### Building for Production
To create a production-ready build of the extension:
```sh
npm run build
```
This command will generate an optimized version of the extension, usually in a `dist` folder. This `dist` folder is what you would typically use for "Load unpacked" for regular use or for packaging if you were to distribute the extension.

### Linting
To check the codebase for code quality and style issues using ESLint:
```sh
npm run lint
```

## Permissions Used

The extension requests the following permissions (as defined in `manifest.json`):

*   `storage`: Used to save user data, settings, and workspace organization locally in the browser.
*   `tabs`: Required to interact with browser tabs, enabling features like saving the current tab, importing open tabs, and opening saved links.
*   `bookmarks`: Listed in the manifest. While the current core bookmarking feature appears to be internal to the extension's data, this permission might be intended for future integration with browser bookmarks or for more advanced bookmarking functionalities.
*   `activeTab`: Allows the extension to get information about the currently active tab, primarily used for features like "Save Current Tab".

## Project Structure (Brief Overview)

The project is organized as follows:

*   `public/`: Contains static assets, the main `manifest.json` configuration for the extension, the root `index.html` for the extension's popup UI, icons, and the `background.js` script (if used for background tasks).
*   `src/`: Contains the core source code of the React application.
    *   `components/`: Reusable React UI components that make up the interface (e.g., `Group`, `TabItem`, `NoteItem`, `TodoItem`).
    *   `hooks/`: Custom React hooks for managing state, side effects, and shared logic (e.g., `useWorkspaceData` for data operations, `useAuth` for authentication state).
    *   `integrations/`: Modules for integrating with third-party services, specifically the Supabase client setup (`supabaseClient.ts`).
    *   `lib/`: Utility functions and helper modules used across the application.
    *   `pages/`: Top-level React components that act as views or pages for the extension (e.g., `Index.tsx` for the main workspace, `Auth.tsx` for authentication, `Help.tsx` for guidance).
    *   `services/`: Service modules responsible for business logic and data handling, abstracting data sources (e.g., `workspaceService.ts` which likely handles interactions with Supabase or local storage).
    *   `types/`: TypeScript type definitions and interfaces used throughout the project.
*   `supabase/`: Contains configuration related to Supabase, such as `config.toml`, which might define local Supabase development settings or other Supabase-specific configurations.

This structure helps in organizing the codebase logically, separating concerns, and making the project maintainable.
```
