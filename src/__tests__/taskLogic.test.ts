import assert from 'assert';
import { calculateStats, filterAndSortTasks } from '../utils/taskUtils';

// Automated Unit Tests importing real production code for TaskFlow SaaS

console.log('Running TaskFlow SaaS production logic tests...');

const sampleTasks: any[] = [
  { id: '1', title: 'Task Alpha', status: 'completed', priority: 'high', due_date: '2026-01-01T00:00:00.000Z', created_at: '2026-01-01T00:00:00.000Z' },
  { id: '2', title: 'Task Beta', status: 'todo', priority: 'urgent', due_date: '2020-01-01T00:00:00.000Z', created_at: '2026-01-02T00:00:00.000Z' }, // Overdue
  { id: '3', title: 'Task Gamma', status: 'in-progress', priority: 'medium', due_date: '2030-01-01T00:00:00.000Z', created_at: '2026-01-03T00:00:00.000Z' },
];

// Test Stats Calculation
const stats = calculateStats(sampleTasks);
assert.strictEqual(stats.total, 3, 'Total tasks should be 3');
assert.strictEqual(stats.completed, 1, 'Completed tasks should be 1');
assert.strictEqual(stats.overdue, 1, 'Overdue tasks should be 1 (Task Beta)');
assert.strictEqual(stats.completion_rate, 33, 'Completion rate should be 33%');

// Test Filtering
const filtered = filterAndSortTasks(sampleTasks, {
  search: 'alpha',
  status: 'all',
  priority: 'all',
  project_id: 'all',
  category_id: 'all',
  sort_by: 'title',
  sort_order: 'asc',
});
assert.strictEqual(filtered.length, 1, 'Search query "alpha" should match 1 task');
assert.strictEqual(filtered[0].title, 'Task Alpha');

console.log('All TaskFlow production logic tests passed successfully!');
