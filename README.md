# Todo Application

A full-stack Todo application built with React, TailwindCSS, Express, and SQLite.

## Links
- Repository: https://github.com/gamlinskijoleg/UITOP-test-assignment
- Deployed app: https://uitop-test-assignment.vercel.app/

## Features
- Create tasks with a specific category
- Limit of 5 tasks per category
- Undo notifications for delete and complete actions
- Bulk actions (Complete/Delete selected)
- Responsive and modern UI with TailwindCSS v4

## Prerequisites
- Node.js v22+
- Docker (optional)

## Running Locally (Without Docker)

1. **Backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   The API will run on http://localhost:3001

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   The UI will run on http://localhost:5173

## Running with Docker
```bash
docker-compose up --build
```
This will start both the frontend and backend services.

## Tests
```bash
cd backend
npm run test
```

## CI / Deployment

The repository includes a GitHub Actions workflow at [.github/workflows/deploy.yml](.github/workflows/deploy.yml) that:

- runs backend tests on every push to `main`
- triggers a Render deploy hook for the backend

The frontend is meant to be connected to Vercel directly through GitHub integration, so it does not need a custom CI deploy step in this repository.

Vercel should be connected to the `frontend/` folder as the project root, with `VITE_API_URL` set to the public Render backend URL.

Required GitHub repository secrets:

- `RENDER_DEPLOY_HOOK_URL` - Render deploy hook URL for the backend service

Required Vercel environment variable:

- `VITE_API_URL` - Public Render backend URL, for example `https://your-backend.onrender.com`

After setting the secret, push to `main` or run the workflow manually from GitHub Actions.

## AI Usage Answers

1. **Did you use AI at any stage while working on this task? Why?**
Yes, I did. I used AI to knock out the initial setup and basic structure for both the front-end and back-end. Writing that kind of repetitive code from scratch takes time, so offloading it to AI let me jump straight into the core features—like building the undo logic, enforcing the 5-task limit per category, and making sure the UI felt smooth.

2. **What kind of problems or uncertainties AI helps you resolve during the process?****
It mostly helped with the heavy lifting and boilerplate—getting Vite, Tailwind, Express, and SQLite to talk to each other without losing time on configuration. It was also really useful for double-checking TypeScript types and figuring out the cleanest way to handle instant UI updates (optimistic UI) alongside the form states and toast notifications.