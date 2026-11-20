import React from 'react';
import { Menu, Plus, Moon, Sun, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  setMobileOpen: (open: boolean) => void;
  onOpenNewTask: () => void;
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ setMobileOpen, onOpenNewTask, title }) => {
  const { user, updateProfile } = useAuth();
  const isDark = user?.theme === 'dark';

  const toggleTheme = () => {
    const nextTheme = isDark ? 'light' : 'dark';
    updateProfile({ theme: nextTheme });
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="flex items-center justify-between gap-8 px-6 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white lg:hidden rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Open Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap truncate">
          {title}
        </h1>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>

        <button
          onClick={onOpenNewTask}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>
    </header>
  );
};
