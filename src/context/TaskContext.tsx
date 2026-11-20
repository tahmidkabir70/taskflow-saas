import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Task, Project, Category, TaskFilterOptions, DashboardStats } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { calculateStats, filterAndSortTasks } from '../utils/taskUtils';

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
  createTask: (task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<{ error: any }>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<{ error: any }>;
  deleteTask: (id: string) => Promise<{ error: any }>;
  toggleTaskComplete: (id: string) => Promise<{ error: any }>;

  // Project CRUD
  createProject: (project: Omit<Project, 'id' | 'user_id' | 'created_at'>) => Promise<{ error: any }>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<{ error: any }>;
  deleteProject: (id: string) => Promise<{ error: any }>;

  // Category CRUD
  createCategory: (category: Omit<Category, 'id' | 'user_id' | 'created_at'>) => Promise<{ error: any }>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<{ error: any }>;
  deleteCategory: (id: string) => Promise<{ error: any }>;

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
    due_date: new Date(Date.now() + 86400000 * 2).toISOString(),
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
    due_date: new Date(Date.now() - 86400000).toISOString(),
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
    due_date: new Date(Date.now() - 86400000 * 2).toISOString(),
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
      const savedTasks = localStorage.getItem('taskflow_demo_tasks');
      const savedProjects = localStorage.getItem('taskflow_demo_projects');
      const savedCategories = localStorage.getItem('taskflow_demo_categories');

      setTasks(savedTasks ? JSON.parse(savedTasks) : INITIAL_DEMO_TASKS);
      setProjects(savedProjects ? JSON.parse(savedProjects) : INITIAL_DEMO_PROJECTS);
      setCategories(savedCategories ? JSON.parse(savedCategories) : INITIAL_DEMO_CATEGORIES);
      setLoading(false);
      return;
    }

    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      const [tasksRes, projectsRes, categoriesRes] = await Promise.all([
        supabase.from('tasks').select('*').order('created_at', { ascending: false }),
        supabase.from('projects').select('*').order('name', { ascending: true }),
        supabase.from('categories').select('*').order('name', { ascending: true }),
      ]);

      if (tasksRes.error) throw tasksRes.error;
      if (projectsRes.error) throw projectsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;

      setTasks(tasksRes.data || []);
      setProjects(projectsRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [user, isDemo]);

  const saveDemoState = (newTasks: Task[], newProjects: Project[], newCategories: Category[]) => {
    setTasks(newTasks);
    setProjects(newProjects);
    setCategories(newCategories);
    localStorage.setItem('taskflow_demo_tasks', JSON.stringify(newTasks));
    localStorage.setItem('taskflow_demo_projects', JSON.stringify(newProjects));
    localStorage.setItem('taskflow_demo_categories', JSON.stringify(newCategories));
  };

  // Task CRUD
  const createTask = async (taskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<{ error: any }> => {
    if (!user) return { error: { message: 'Not authenticated' } };
    if (isDemo) {
      const newTask: Task = {
        ...taskData,
        id: 'task-' + Date.now(),
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      saveDemoState([newTask, ...tasks], projects, categories);
      return { error: null };
    }

    if (!supabase) return { error: { message: 'Supabase not configured' } };
    try {
      const { error } = await supabase.from('tasks').insert([
        {
          ...taskData,
          user_id: user.id,
        }
      ]);
      if (error) return { error };
      await refreshData();
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>): Promise<{ error: any }> => {
    if (isDemo) {
      const updated = tasks.map(t => t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t);
      saveDemoState(updated, projects, categories);
      return { error: null };
    }

    if (!supabase) return { error: { message: 'Supabase not configured' } };
    try {
      const { error } = await supabase.from('tasks').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) return { error };
      await refreshData();
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const deleteTask = async (id: string): Promise<{ error: any }> => {
    if (isDemo) {
      const filtered = tasks.filter(t => t.id !== id);
      saveDemoState(filtered, projects, categories);
      return { error: null };
    }

    if (!supabase) return { error: { message: 'Supabase not configured' } };
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) return { error };
      await refreshData();
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const toggleTaskComplete = async (id: string): Promise<{ error: any }> => {
    const task = tasks.find(t => t.id === id);
    if (!task) return { error: { message: 'Task not found' } };
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    return await updateTask(id, { status: newStatus });
  };

  // Project CRUD
  const createProject = async (projData: Omit<Project, 'id' | 'user_id' | 'created_at'>): Promise<{ error: any }> => {
    if (!user) return { error: { message: 'Not authenticated' } };
    if (isDemo) {
      const newProj: Project = {
        ...projData,
        id: 'proj-' + Date.now(),
        user_id: user.id,
        created_at: new Date().toISOString(),
      };
      saveDemoState(tasks, [...projects, newProj], categories);
      return { error: null };
    }

    if (!supabase) return { error: { message: 'Supabase not configured' } };
    try {
      const { error } = await supabase.from('projects').insert([{ ...projData, user_id: user.id }]);
      if (error) return { error };
      await refreshData();
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>): Promise<{ error: any }> => {
    if (isDemo) {
      const updated = projects.map(p => p.id === id ? { ...p, ...updates } : p);
      saveDemoState(tasks, updated, categories);
      return { error: null };
    }

    if (!supabase) return { error: { message: 'Supabase not configured' } };
    try {
      const { error } = await supabase.from('projects').update(updates).eq('id', id);
      if (error) return { error };
      await refreshData();
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const deleteProject = async (id: string): Promise<{ error: any }> => {
    if (isDemo) {
      const updatedProj = projects.filter(p => p.id !== id);
      const updatedTasks = tasks.map(t => t.project_id === id ? { ...t, project_id: undefined } : t);
      saveDemoState(updatedTasks, updatedProj, categories);
      return { error: null };
    }

    if (!supabase) return { error: { message: 'Supabase not configured' } };
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) return { error };
      await refreshData();
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  // Category CRUD
  const createCategory = async (catData: Omit<Category, 'id' | 'user_id' | 'created_at'>): Promise<{ error: any }> => {
    if (!user) return { error: { message: 'Not authenticated' } };
    if (isDemo) {
      const newCat: Category = {
        ...catData,
        id: 'cat-' + Date.now(),
        user_id: user.id,
        created_at: new Date().toISOString(),
      };
      saveDemoState(tasks, projects, [...categories, newCat]);
      return { error: null };
    }

    if (!supabase) return { error: { message: 'Supabase not configured' } };
    try {
      const { error } = await supabase.from('categories').insert([{ ...catData, user_id: user.id }]);
      if (error) return { error };
      await refreshData();
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>): Promise<{ error: any }> => {
    if (isDemo) {
      const updated = categories.map(c => c.id === id ? { ...c, ...updates } : c);
      saveDemoState(tasks, projects, updated);
      return { error: null };
    }

    if (!supabase) return { error: { message: 'Supabase not configured' } };
    try {
      const { error } = await supabase.from('categories').update(updates).eq('id', id);
      if (error) return { error };
      await refreshData();
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const deleteCategory = async (id: string): Promise<{ error: any }> => {
    if (isDemo) {
      const updatedCat = categories.filter(c => c.id !== id);
      const updatedTasks = tasks.map(t => t.category_id === id ? { ...t, category_id: undefined } : t);
      saveDemoState(updatedTasks, projects, updatedCat);
      return { error: null };
    }

    if (!supabase) return { error: { message: 'Supabase not configured' } };
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) return { error };
      await refreshData();
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  // Filtered Tasks calculation using real production helper
  const filteredTasks = useMemo(() => {
    return filterAndSortTasks(tasks, filters);
  }, [tasks, filters]);

  // Dashboard Statistics calculation using real production helper
  const stats = useMemo<DashboardStats>(() => {
    return calculateStats(tasks);
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
