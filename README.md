# TaskFlow SaaS

TaskFlow is a professional, production-ready Full-Stack Task Management SaaS application built with React, TypeScript, Tailwind CSS, Vite, and Supabase (PostgreSQL with strict Row Level Security and ownership triggers).

## Repository Information
- **Repository URL**: `https://github.com/tahmidkabir70/taskflow-saas`
- **Owner**: `tahmidkabir70`
- **Repository Name**: `taskflow-saas`
- **Branch**: `main`

## Features

- **Authentication**: Secure Supabase Auth (Sign Up, Sign In, Forgot Password, Password Reset, Session Persistence).
- **Dashboard**: Real-time KPI statistics (Total, Completed, Pending, In Progress, Overdue), completion rate overview, recent tasks, and upcoming deadlines.
- **Task Management**: Full CRUD functionality with rich attributes (Title, Description, Status, Priority, Due Date, Project, Category).
- **Project Management**: Create, edit, and organize tasks into distinct projects with custom color coding and progress tracking.
- **Categories**: Custom task categorization with color tagging.
- **Advanced Search & Filtering**: Filter by status, priority, project, and category, sort by due date, priority, or creation date, and search instantly.
- **Upcoming / Calendar View**: Dedicated agenda views for Overdue tasks, tasks due Today, this Week, and Later.
- **Profile & Settings**: User display name, email, theme selection (Light / Dark mode persistence with Tailwind v4), and account management.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, React Router
- **Backend & Database**: Supabase (PostgreSQL, Auth, RLS, ownership validation triggers)
- **Deployment Ready**: Vercel-compatible configuration and robust fallback demo mode.

## Local Development Instructions

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. (Optional) Configure your Supabase project URL and Anon Key in `.env`. If left unconfigured, TaskFlow runs in a fully functional local demo mode with pre-seeded sample data.
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Run automated tests:
   ```bash
   npm test
   ```

## Supabase Setup & Security Migrations

1. Create a new project at [supabase.com](https://supabase.com).
2. Run the SQL migration scripts in your Supabase SQL Editor in order:
   - `/supabase/migrations/20261120000000_init_schema.sql`
   - `/supabase/migrations/20261120000001_security_and_constraints_fix.sql`
3. Copy your Project URL and Anon Key into your `.env` file.

## Documentation

- [Database Architecture](docs/DATABASE.md)
- [Application Architecture](docs/ARCHITECTURE.md)
- [Testing Guide](docs/TESTING.md)
