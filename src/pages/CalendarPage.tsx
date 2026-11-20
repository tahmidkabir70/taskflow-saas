import React from 'react';
import { useTasks } from '../context/TaskContext';
import { CalendarDays, CheckCircle2, Circle, AlertTriangle, Clock } from 'lucide-react';

export const CalendarPage: React.FC = () => {
  const { tasks, toggleTaskComplete } = useTasks();

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const todayStr = now.toISOString().substring(0, 10);

  const overdueTasks = tasks.filter(t => {
    if (t.status === 'completed' || !t.due_date) return false;
    const due = new Date(t.due_date);
    due.setHours(0, 0, 0, 0);
    return due.getTime() < now.getTime();
  });

  const todayTasks = tasks.filter(t => {
    if (!t.due_date) return false;
    return t.due_date.substring(0, 10) === todayStr;
  });

  const upcomingWeekTasks = tasks.filter(t => {
    if (!t.due_date) return false;
    const due = new Date(t.due_date);
    due.setHours(0, 0, 0, 0);
    const diff = due.getTime() - now.getTime();
    const days = diff / (1000 * 60 * 60 * 24);
    return days > 0 && days <= 7;
  });

  const laterTasks = tasks.filter(t => {
    if (!t.due_date) return false;
    const due = new Date(t.due_date);
    due.setHours(0, 0, 0, 0);
    const diff = due.getTime() - now.getTime();
    const days = diff / (1000 * 60 * 60 * 24);
    return days > 7;
  });

  const renderSection = (title: string, list: typeof tasks, icon: any, badgeClass: string) => {
    const Icon = icon;
    if (list.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${badgeClass}`}>
            <Icon className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title} ({list.length})</h3>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
          {list.map(task => (
            <div key={task.id} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
              <div className="flex items-center gap-3.5 min-w-0">
                <button
                  onClick={() => toggleTaskComplete(task.id)}
                  className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 shrink-0"
                >
                  {task.status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>
                <div className="min-w-0">
                  <p className={`text-sm font-semibold truncate ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                    {task.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}
                  </p>
                </div>
              </div>

              <span className={`text-[10px] font-semibold uppercase px-2.5 py-1 rounded-md shrink-0 ${
                task.priority === 'urgent' ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400' :
                task.priority === 'high' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400' :
                'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}>
                {task.priority}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const hasAnyTasks = overdueTasks.length > 0 || todayTasks.length > 0 || upcomingWeekTasks.length > 0 || laterTasks.length > 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Calendar & Upcoming Deadlines</h2>
        <p className="text-xs text-slate-500 mt-0.5">Review overdue items, tasks due today, and upcoming schedule</p>
      </div>

      {!hasAnyTasks ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-500">
          <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-semibold">No scheduled deadlines</p>
          <p className="text-xs mt-1">Assign due dates to tasks to view them here.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {renderSection('Overdue Tasks', overdueTasks, AlertTriangle, 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400')}
          {renderSection('Due Today', todayTasks, Clock, 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400')}
          {renderSection('Due This Week', upcomingWeekTasks, CalendarDays, 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400')}
          {renderSection('Due Later', laterTasks, CalendarDays, 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400')}
        </div>
      )}
    </div>
  );
};
