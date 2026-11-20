export type TaskStatus = 'todo' | 'in-progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at?: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  color: string;
  created_at?: string;
  task_count?: number;
  completed_count?: number;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  project_id?: string;
  category_id?: string;
  created_at?: string;
  updated_at?: string;
  // Joined fields for UI convenience
  project?: Project;
  category?: Category;
}

export interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  theme?: 'light' | 'dark' | 'system';
}

export interface TaskFilterOptions {
  search: string;
  status: string;
  priority: string;
  project_id: string;
  category_id: string;
  sort_by: 'due_date' | 'priority' | 'created_at' | 'title';
  sort_order: 'asc' | 'desc';
}

export interface DashboardStats {
  total: number;
  completed: number;
  pending: number;
  in_progress: number;
  overdue: number;
  completion_rate: number;
}
