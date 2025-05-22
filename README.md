# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/ec188998-8b61-4d6f-beed-6f17d66e480e

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/ec188998-8b61-4d6f-beed-6f17d66e480e) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Linting

This project uses ESLint for code linting. To run the linter, use the following command:

```sh
npm run lint
```

The linting process currently passes without any errors.

## Build Process

To create a production build of the project, run the following command:

```sh
npm run build
```

This command bundles the application for deployment. The build process currently completes successfully.

**Note on Browserslist:** During the build, you might see a message like:
`Browserslist: browsers data (caniuse-lite) is 7 months old. Please run: npx update-browserslist-db@latest`
This is a recommendation to update the project's browser compatibility data. It's good practice to run `npx update-browserslist-db@latest` periodically for future maintenance, but it's not an error and does not prevent a successful build.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- ESLint

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/ec188998-8b61-4d6f-beed-6f17d66e480e) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes it is!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
