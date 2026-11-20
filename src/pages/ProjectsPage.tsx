import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { FolderKanban, Plus, Edit3, Trash2, CheckSquare } from 'lucide-react';
import { ProjectModal } from '../components/projects/ProjectModal';
import { Project } from '../types';

export const ProjectsPage: React.FC = () => {
  const { projects, tasks, deleteProject } = useTasks();
  const [modalOpen, setModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  const handleEdit = (project: Project) => {
    setProjectToEdit(project);
    setModalOpen(true);
  };

  const handleNew = () => {
    setProjectToEdit(null);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Projects Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">Organize tasks and monitor completion progress across initiatives</p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-500">
          <FolderKanban className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-semibold">No projects created yet</p>
          <p className="text-xs mt-1">Create a project to bundle related tasks together.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const projectTasks = tasks.filter(t => t.project_id === project.id);
            const completedTasks = projectTasks.filter(t => t.status === 'completed');
            const progress = projectTasks.length > 0 ? Math.round((completedTasks.length / projectTasks.length) * 100) : 0;

            return (
              <div
                key={project.id}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full shrink-0"
                        style={{ backgroundColor: project.color || '#3B82F6' }}
                      />
                      <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                        {project.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(project)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Project"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteProject(project.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Delete Project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {project.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                      {project.description}
                    </p>
                  )}
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Progress ({completedTaskCountText(completedTasks.length, projectTasks.length)})</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${progress}%`, backgroundColor: project.color || '#3B82F6' }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ProjectModal isOpen={modalOpen} onClose={() => setModalOpen(false)} projectToEdit={projectToEdit} />
    </div>
  );
};

function completedTaskCountText(completed: number, total: number) {
  return `${completed}/${total} completed`;
}
