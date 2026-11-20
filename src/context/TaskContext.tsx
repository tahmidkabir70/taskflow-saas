import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Task, Project, Category, TaskFilterOptions, DashboardStats } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface TaskContextType {
  tasks: Task[];
  projects: Project[];
  categories: Category[];
  loading: boolean;
  filters: TaskFilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<TaskFilterOptions>>;
  filteredTasks: Task[];
  stats: DashboardStats;
  
  // Task CRUD
  createTask: (task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskComplete: (id: string) => Promise<void>;

  // Project CRUD
  createProject: (project: Omit<Project, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  // Category CRUD
  createCategory: (category: Omit<Category, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  refreshData: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Initial Demo Seed Data
const INITIAL_DEMO_PROJECTS: Project[] = [
  { id: 'proj-1', user_id: 'demo-user-123', name: 'Product V2 Redesign', description: 'Overhaul user interface and core workflows', color: '#3B82F6', created_at: new Date().toISOString() },
  { id: 'proj-2', user_id: 'demo-user-123', name: 'Q4 Marketing Campaign', description: 'Launch performance marketing & social promos', color: '#8B5CF6', created_at: new Date().toISOString() },
  { id: 'proj-3', user_id: 'demo-user-123', name: 'Infrastructure Migration', description: 'Move microservices to Kubernetes', color: '#10B981', created_at: new Date().toISOString() },
];

const INITIAL_DEMO_CATEGORIES: Category[] = [
  { id: 'cat-1', user_id: 'demo-user-123', name: 'Engineering', color: '#3B82F6', created_at: new Date().toISOString() },
  { id: 'cat-2', user_id: 'demo-user-123', name: 'Design', color: '#EC4899', created_at: new Date().toISOString() },
  { id: 'cat-3', user_id: 'demo-user-123', name: 'Strategy', color: '#F59E0B', created_at: new Date().toISOString() },
  { id: 'cat-4', user_id: 'demo-user-123', name: 'Operations', color: '#6366F1', created_at: new Date().toISOString() },
];

const INITIAL_DEMO_TASKS: Task[] = [
  {
    id: 'task-1',
    user_id: 'demo-user-123',
    title: 'Design high-converting landing page wireframes',
    description: 'Create responsive layouts for desktop and mobile break points.',
    status: 'in-progress',
    priority: 'high',
    due_date: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
    project_id: 'proj-1',
    category_id: 'cat-2',
    created_at: new Date().toISOString(),
  },
  {
    id: 'task-2',
    user_id: 'demo-user-123',
    title: 'Implement Supabase Row Level Security policies',
    description: 'Ensure user data isolation and secure auth triggers.',
    status: 'completed',
    priority: 'urgent',
    due_date: new Date(Date.now() - 86400000).toISOString(), // Yesterday (overdue if not completed, but completed)
    project_id: 'proj-3',
    category_id: 'cat-1',
    created_at: new Date().toISOString(),
  },
  {
    id: 'task-3',
    user_id: 'demo-user-123',
    title: 'Review Q4 budget allocation with finance team',
    description: 'Analyze ad spend ROI and server infrastructure costs.',
    status: 'todo',
    priority: 'medium',
    due_date: new Date(Date.now() + 86400000 * 5).toISOString(),
    project_id: 'proj-2',
    category_id: 'cat-3',
    created_at: new Date().toISOString(),
  },
  {
    id: 'task-4',
    user_id: 'demo-user-123',
    title: 'Fix mobile navigation overflow bug on Safari iOS',
    description: 'Sidebar drawer animation glitches on notch devices.',
    status: 'todo',
    priority: 'urgent',
    due_date: new Date(Date.now() - 86400000 * 2).toISOString(), // Overdue
    project_id: 'proj-1',
    category_id: 'cat-1',
    created_at: new Date().toISOString(),
  },
  {
    id: 'task-5',
    user_id: 'demo-user-123',
    title: 'Publish weekly engineering newsletter & release notes',
    description: 'Highlight new features and bug fixes shipped this week.',
    status: 'in-progress',
    priority: 'low',
    due_date: new Date(Date.now() + 86400000 * 4).toISOString(),
    project_id: 'proj-2',
    category_id: 'cat-4',
    created_at: new Date().toISOString(),
  }
];

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isDemo } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [filters, setFilters] = useState<TaskFilterOptions>({
    search: '',
    status: 'all',
    priority: 'all',
    project_id: 'all',
    category_id: 'all',
    sort_by: 'due_date',
    sort_order: 'asc',
  });

  const refreshData = async () => {
    if (!user) {
      setTasks([]);
      setProjects([]);
      setCategories([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    if (isDemo) {
      // Load from localStorage or defaults
      const savedTasks = localStorage.getItem('taskflow_demo_tasks');
      const savedProjects = localStorage.getItem('taskflow_demo_projects');
      const savedCategories = localStorage.getItem('taskflow_demo_categories');

      setTasks(savedTasks ? JSON.parse(savedTasks) : INITIAL_DEMO_TASKS);
      setProjects(savedProjects ? JSON.parse(savedProjects) : INITIAL_DEMO_PROJECTS);
      setCategories(savedCategories ? JSON.parse(savedCategories) : INITIAL_DEMO_CATEGORIES);
      setLoading(false);
      return;
    }

    if (!supabase) return;

    try {
      const [tasksRes, projectsRes, categoriesRes] = await Promise.all([
        supabase.from('tasks').select('*').order('created_at', { ascending: false }),
        supabase.from('projects').select('*').order('name', { ascending: true }),
        supabase.from('categories').select('*').order('name', { ascending: true }),
      ]);

      if (tasksRes.error) console.error(tasksRes.error);
      else setTasks(tasksRes.data || []);

      if (projectsRes.error) console.error(projectsRes.error);
      else setProjects(projectsRes.data || []);

      if (categoriesRes.error) console.error(categoriesRes.error);
      else setCategories(categoriesRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [user, isDemo]);

  // Helper to persist demo state
  const saveDemoState = (newTasks: Task[], newProjects: Project[], newCategories: Category[]) => {
    setTasks(newTasks);
    setProjects(newProjects);
    setCategories(newCategories);
    localStorage.setItem('taskflow_demo_tasks', JSON.stringify(newTasks));
    localStorage.setItem('taskflow_demo_projects', JSON.stringify(newProjects));
    localStorage.setItem('taskflow_demo_categories', JSON.stringify(newCategories));
  };

  // Task CRUD
  const createTask = async (taskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;
    if (isDemo) {
      const newTask: Task = {
        ...taskData,
        id: 'task-' + Date.now(),
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      saveDemoState([newTask, ...tasks], projects, categories);
      return;
    }

    if (!supabase) return;
    const { error } = await supabase.from('tasks').insert([
      {
        ...taskData,
        user_id: user.id,
      }
    ]);
    if (error) console.error(error);
    else await refreshData();
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    if (isDemo) {
      const updated = tasks.map(t => t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t);
      saveDemoState(updated, projects, categories);
      return;
    }

    if (!supabase) return;
    const { error } = await supabase.from('tasks').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) console.error(error);
    else await refreshData();
  };

  const deleteTask = async (id: string) => {
    if (isDemo) {
      const filtered = tasks.filter(t => t.id !== id);
      saveDemoState(filtered, projects, categories);
      return;
    }

    if (!supabase) return;
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) console.error(error);
    else await refreshData();
  };

  const toggleTaskComplete = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    await updateTask(id, { status: newStatus });
  };

  // Project CRUD
  const createProject = async (projData: Omit<Project, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;
    if (isDemo) {
      const newProj: Project = {
        ...projData,
        id: 'proj-' + Date.now(),
        user_id: user.id,
        created_at: new Date().toISOString(),
      };
      saveDemoState(tasks, [...projects, newProj], categories);
      return;
    }

    if (!supabase) return;
    const { error } = await supabase.from('projects').insert([{ ...projData, user_id: user.id }]);
    if (error) console.error(error);
    else await refreshData();
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    if (isDemo) {
      const updated = projects.map(p => p.id === id ? { ...p, ...updates } : p);
      saveDemoState(tasks, updated, categories);
      return;
    }

    if (!supabase) return;
    const { error } = await supabase.from('projects').update(updates).eq('id', id);
    if (error) console.error(error);
    else await refreshData();
  };

  const deleteProject = async (id: string) => {
    if (isDemo) {
      const updatedProj = projects.filter(p => p.id !== id);
      const updatedTasks = tasks.map(t => t.project_id === id ? { ...t, project_id: undefined } : t);
      saveDemoState(updatedTasks, updatedProj, categories);
      return;
    }

    if (!supabase) return;
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) console.error(error);
    else await refreshData();
  };

  // Category CRUD
  const createCategory = async (catData: Omit<Category, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;
    if (isDemo) {
      const newCat: Category = {
        ...catData,
        id: 'cat-' + Date.now(),
        user_id: user.id,
        created_at: new Date().toISOString(),
      };
      saveDemoState(tasks, projects, [...categories, newCat]);
      return;
    }

    if (!supabase) return;
    const { error } = await supabase.from('categories').insert([{ ...catData, user_id: user.id }]);
    if (error) console.error(error);
    else await refreshData();
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    if (isDemo) {
      const updated = categories.map(c => c.id === id ? { ...c, ...updates } : c);
      saveDemoState(tasks, projects, updated);
      return;
    }

    if (!supabase) return;
    const { error } = await supabase.from('categories').update(updates).eq('id', id);
    if (error) console.error(error);
    else await refreshData();
  };

  const deleteCategory = async (id: string) => {
    if (isDemo) {
      const updatedCat = categories.filter(c => c.id !== id);
      const updatedTasks = tasks.map(t => t.category_id === id ? { ...t, category_id: undefined } : t);
      saveDemoState(updatedTasks, projects, updatedCat);
      return;
    }

    if (!supabase) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) console.error(error);
    else await refreshData();
  };

  // Filtered Tasks calculation
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Search query
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchDesc = task.description?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc) return false;
      }
      // Status
      if (filters.status !== 'all' && task.status !== filters.status) return false;
      // Priority
      if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
      // Project
      if (filters.project_id !== 'all' && task.project_id !== filters.project_id) return false;
      // Category
      if (filters.category_id !== 'all' && task.category_id !== filters.category_id) return false;

      return true;
    }).sort((a, b) => {
      const { sort_by, sort_order } = filters;
      let cmp = 0;

      if (sort_by === 'due_date') {
        const dateA = a.due_date ? new Date(a.due_date).getTime() : 0;
        const dateB = b.due_date ? new Date(b.due_date).getTime() : 0;
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
  }, [tasks, filters]);

  // Dashboard Statistics calculation
  const stats = useMemo<DashboardStats>(() => {
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
  }, [tasks]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        projects,
        categories,
        loading,
        filters,
        setFilters,
        filteredTasks,
        stats,
        createTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        createProject,
        updateProject,
        deleteProject,
        createCategory,
        updateCategory,
        deleteCategory,
        refreshData,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks must be used within a TaskProvider');
  return context;
};
