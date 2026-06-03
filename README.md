# Todo Application

A full-stack Todo application built with React, TailwindCSS, Express, and SQLite.

## Features
- Create tasks with a specific category
- Limit of 5 tasks per category
- Undo notifications for delete and complete actions
- Bulk actions (Complete/Delete selected)
- Responsive and modern UI with TailwindCSS v4

## Prerequisites
- Node.js v18+
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

## AI Usage Answers

1. **Did you use AI at any stage while working on this task? Why?**
Yes, AI was used to accelerate the scaffolding and boilerplate generation for the full-stack architecture, allowing focus on the core business logic and requirements such as the transient undo logic, max 5-task limit per category, and seamless UI/UX interactions.

2. **What kind of problems or uncertainties AI helps you resolve during the process?**
AI helps in quickly setting up boilerplate configuration (e.g., Vite + Tailwind setup, Express + SQLite integration), generating robust types, and providing idiomatic patterns for handling asynchronous optimistic UI updates with React Hook Form and react-hot-toast.
