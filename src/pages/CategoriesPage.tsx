import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { Tags, Plus, Edit3, Trash2 } from 'lucide-react';
import { CategoryModal } from '../components/categories/CategoryModal';
import { Category } from '../types';

export const CategoriesPage: React.FC = () => {
  const { categories, tasks, deleteCategory } = useTasks();
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

  const handleEdit = (cat: Category) => {
    setCategoryToEdit(cat);
    setModalOpen(true);
  };

  const handleNew = () => {
    setCategoryToEdit(null);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Categories</h2>
          <p className="text-xs text-slate-500 mt-0.5">Tag and classify tasks by department or discipline</p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-500">
          <Tags className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-semibold">No categories created yet</p>
          <p className="text-xs mt-1">Create categories to tag tasks.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => {
            const count = tasks.filter(t => t.category_id === category.id).length;

            return (
              <div
                key={category.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3 truncate">
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: category.color || '#10B981' }}
                  />
                  <div className="truncate">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {category.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-mono">{count} tasks</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Edit Category"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteCategory(category.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CategoryModal isOpen={modalOpen} onClose={() => setModalOpen(false)} categoryToEdit={categoryToEdit} />
    </div>
  );
};
