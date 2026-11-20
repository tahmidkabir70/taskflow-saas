import { Task, TaskFilterOptions, DashboardStats } from '../types';

export function calculateStats(tasks: Task[]): DashboardStats {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const in_progress = tasks.filter(t => t.status === 'in-progress').length;
  const pending = tasks.filter(t => t.status === 'todo').length;
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const overdue = tasks.filter(t => {
    if (t.status === 'completed' || !t.due_date) return false;
    const due = new Date(t.due_date);
    due.setHours(0, 0, 0, 0);
    return due.getTime() < now.getTime();
  }).length;

  const completion_rate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { total, completed, pending, in_progress, overdue, completion_rate };
}

export function filterAndSortTasks(tasks: Task[], filters: TaskFilterOptions): Task[] {
  return tasks.filter(task => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }
    if (filters.status !== 'all' && task.status !== filters.status) return false;
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
    if (filters.project_id !== 'all' && task.project_id !== filters.project_id) return false;
    if (filters.category_id !== 'all' && task.category_id !== filters.category_id) return false;

    return true;
  }).sort((a, b) => {
    const { sort_by, sort_order } = filters;
    let cmp = 0;

    if (sort_by === 'due_date') {
      const dateA = a.due_date ? new Date(a.due_date).getTime() : Number.MAX_SAFE_INTEGER;
      const dateB = b.due_date ? new Date(b.due_date).getTime() : Number.MAX_SAFE_INTEGER;
      cmp = dateA - dateB;
    } else if (sort_by === 'priority') {
      const weights: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
      cmp = (weights[b.priority] || 0) - (weights[a.priority] || 0);
    } else if (sort_by === 'title') {
      cmp = a.title.localeCompare(b.title);
    } else {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      cmp = dateA - dateB;
    }

    return sort_order === 'asc' ? cmp : -cmp;
  });
}
