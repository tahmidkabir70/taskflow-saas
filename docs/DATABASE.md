# Database Architecture — TaskFlow SaaS

TaskFlow utilizes PostgreSQL hosted on Supabase with strict Row Level Security (RLS) enabled on all tables and database-level ownership triggers.

## Tables Overview

1. **`profiles`**
   - Extends Supabase `auth.users`.
   - Columns: `id` (UUID, PK), `email` (TEXT), `display_name` (TEXT), `avatar_url` (TEXT), `theme` (TEXT), `created_at`, `updated_at`.

2. **`projects`**
   - Organizes tasks into user-owned projects.
   - Columns: `id` (UUID, PK), `user_id` (UUID, FK), `name` (TEXT), `description` (TEXT), `color` (TEXT), `created_at`.

3. **`categories`**
   - Task classification tags.
   - Columns: `id` (UUID, PK), `user_id` (UUID, FK), `name` (TEXT), `color` (TEXT), `created_at`.

4. **`tasks`**
   - Core work items.
   - Columns: `id` (UUID, PK), `user_id` (UUID, FK), `title` (TEXT), `description` (TEXT), `status` (TEXT: `todo`, `in-progress`, `completed`), `priority` (TEXT: `low`, `medium`, `high`, `urgent`), `due_date` (TIMESTAMPTZ), `project_id` (UUID, FK), `category_id` (UUID, FK), `created_at`, `updated_at`.

## Row Level Security (RLS) & Cross-User Security

- RLS is enabled on `profiles`, `projects`, `categories`, and `tasks`.
- Users can only access and mutate records where `user_id = auth.uid()`.
- **Cross-User Relationship Protection**: A PostgreSQL trigger (`validate_task_ownership`) inspects every task insertion or update to guarantee that `project_id` and `category_id` belong to the exact same `user_id` as the task, preventing cross-user reference attacks.
- Profile auto-creation is handled via `handle_new_user` trigger with `ON CONFLICT DO NOTHING` to prevent duplicate profile key conflicts.
