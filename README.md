# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/e2b1c0ca-8c38-4e69-b7f0-4785d1d2e8d4

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/e2b1c0ca-8c38-4e69-b7f0-4785d1d2e8d4) and start prompting.

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

## Documentation

Comprehensive API and component docs live in `docs/`.

- Components: `docs/components.md`
- Hooks: `docs/hooks.md`
- Contexts: `docs/contexts.md`
- Utilities: `docs/utils.md`
- Integrations (Supabase): `docs/integrations.md`
- UI components (shadcn): `docs/ui-components.md`

Quick imports (path alias `@` → `src/`):

```ts
import { Button } from '@/components/ui/button'
import { useTransactions } from '@/hooks/useTransactions'
```

Mount the app-level providers in `src/App.tsx` (or root):

```tsx
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/contexts/AuthContext'

export default function AppRoot() {
  return (
    <AuthProvider>
      <App />
      <Toaster />
    </AuthProvider>
  )
}
```

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/e2b1c0ca-8c38-4e69-b7f0-4785d1d2e8d4) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
