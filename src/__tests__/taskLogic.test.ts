import assert from 'assert';

// Unit Tests for TaskFlow SaaS Business Logic & Calculations

function calculateStats(tasks: any[]) {
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

// Test Suite
console.log('Running TaskFlow SaaS automated logic tests...');

const sampleTasks = [
  { id: '1', title: 'Task A', status: 'completed', priority: 'high', due_date: '2026-01-01T00:00:00.000Z' },
  { id: '2', title: 'Task B', status: 'todo', priority: 'urgent', due_date: '2020-01-01T00:00:00.000Z' }, // Overdue
  { id: '3', title: 'Task C', status: 'in-progress', priority: 'medium', due_date: '2030-01-01T00:00:00.000Z' },
];

const stats = calculateStats(sampleTasks);
assert.strictEqual(stats.total, 3, 'Total tasks should be 3');
assert.strictEqual(stats.completed, 1, 'Completed tasks should be 1');
assert.strictEqual(stats.overdue, 1, 'Overdue tasks should be 1 (Task B)');
assert.strictEqual(stats.completion_rate, 33, 'Completion rate should be 33%');

console.log('All TaskFlow logic tests passed successfully!');
