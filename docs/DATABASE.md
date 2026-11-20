# Database Architecture — TaskFlow SaaS

TaskFlow utilizes PostgreSQL hosted on Supabase with strict Row Level Security (RLS) enabled on all tables.

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

## Row Level Security (RLS) Policies

All tables have RLS enabled. Users can only access and mutate records where `user_id = auth.uid()` (or `id = auth.uid()` for profiles).
