# Application Architecture — TaskFlow SaaS

## Structure & Layers

- **`src/types/`**: TypeScript interfaces defining the data model (Task, Project, Category, User, FilterOptions).
- **`src/lib/`**: Supabase client connection and configuration helpers.
- **`src/context/`**:
  - `AuthContext`: Manages Supabase session and authentication state, with demo mode fallback.
  - `TaskContext`: Manages state and CRUD operations for tasks, projects, and categories, interacting with Supabase or localStorage.
- **`src/components/`**:
  - `layout/`: AppLayout, Sidebar, Header.
  - `tasks/`: TaskModal, Task card/row components.
  - `projects/`: ProjectModal.
  - `categories/`: CategoryModal.
- **`src/pages/`**:
  - `DashboardPage.tsx`: Statistics and overview.
  - `TasksPage.tsx`: Advanced task filterable table.
  - `ProjectsPage.tsx`: Project management.
  - `CategoriesPage.tsx`: Category management.
  - `CalendarPage.tsx`: Upcoming & calendar agenda.
  - `SettingsPage.tsx`: User profile, theme, and configuration.
  - `AuthPage.tsx`: Sign in / sign up / password reset.
