import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { TaskModal } from '../tasks/TaskModal';

export const AppLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const location = useLocation();

  // Determine current page title
  const getTitle = () => {
    switch (location.pathname) {
      case '/': return 'Dashboard';
      case '/tasks': return 'Task Manager';
      case '/projects': return 'Projects';
      case '/categories': return 'Categories';
      case '/calendar': return 'Calendar & Upcoming';
      case '/settings': return 'Account Settings';
      default: return 'TaskFlow';
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          setMobileOpen={setMobileOpen}
          onOpenNewTask={() => setTaskModalOpen(true)}
          title={getTitle()}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      <TaskModal isOpen={taskModalOpen} onClose={() => setTaskModalOpen(false)} />
    </div>
  );
};
