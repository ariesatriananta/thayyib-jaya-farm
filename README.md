# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
pnpm install

# Step 4: Start the development server with auto-reloading and an instant preview.
pnpm dev
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

## Backend database (Neon + Drizzle)

1) Set `DATABASE_URL` in `.env` (see `.env.example`).
2) Run Vercel Functions locally:
```sh
pnpm dlx vercel dev
```
3) Health check:
```sh
curl http://localhost:3000/api/health
```

## Local Development (Full Stack)

1) Set `DATABASE_URL` in `.env` or `.env.local` (see `.env.example`).
2) Run frontend + API together:
```sh
pnpm dev:full
```
3) Test API directly (Vercel Functions):
```sh
curl http://localhost:3001/api/health
```
4) Test API via frontend proxy (from Vite origin):
```sh
fetch('/api/health')
```

Catatan:
- `pnpm dev` hanya menjalankan frontend.
- `pnpm dev:full` menjalankan frontend + Vercel Functions.
- `pnpm dev:full` memakai `vercel.api.json` agar `vercel dev` tidak menjalankan Vite kedua kali.

## Deploy di Vercel (Vite SPA + Functions)

### Environment variables
- Production: Project Settings -> Environment Variables -> `DATABASE_URL`
- Preview: Project Settings -> Environment Variables -> `DATABASE_URL`

### Build output
- Output directory: `dist` (Vite default)
- Build command: `pnpm build`

### Health check
```sh
curl https://<your-vercel-domain>/api/health
```

### Migration
```sh
pnpm run db:generate
pnpm run db:migrate
```

## Catatan keamanan
- Jangan pernah menaruh `DATABASE_URL` di variabel `VITE_*`.
- Jangan query database langsung dari frontend; gunakan `/api`.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
