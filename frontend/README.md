# DatasetOps Autopilot — Frontend

This is the Next.js frontend web application for DatasetOps Autopilot. It provides the UI for project initialization, document upload, benchmark plan reviews, live execution tracing, and deliverable downloads.

## Development Setup

1. Make sure the backend service is running (locally or on ECS).
2. Configure your environment variable in `.env.local`:
   ```env
   BACKEND_URL=http://localhost:8000
   ```
3. Install dependencies and start the development server:
   ```bash
   npm install
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view the application.