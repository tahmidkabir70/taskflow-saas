# Testing Guide — TaskFlow SaaS

## Test Scenarios

1. **Authentication Flow**
   - Sign up with new credentials.
   - Sign in and verify session persistence on page refresh.
   - Password reset request.
   - Sign out and verify redirection to Auth page.

2. **Task CRUD & Validation**
   - Create a task with required fields and verify appearance in dashboard & task list.
   - Edit task details and status.
   - Mark task as completed / reopen.
   - Delete task with confirmation.

3. **Project & Category Management**
   - Create project with custom color.
   - Assign task to project.
   - Create category and assign to task.
   - Filter task list by project and category.

4. **Search, Filtering & Sorting**
   - Search tasks by title keyword.
   - Filter by status and priority.
   - Sort by due date and priority.

5. **Responsive Design & Dark Mode**
   - Verify mobile sidebar drawer toggle.
   - Test light and dark mode toggle with state persistence.
