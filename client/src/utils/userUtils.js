export const getInitials = (firstName = '', lastName = '') => {
    // Handle cases where firstName/lastName might be null/undefined
    const first = firstName || '';
    const last = lastName || '';
    return `${first[0] || ''}${last[0] || ''}`.toUpperCase();
};

// check if task is overdue
export const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date() && !task.completed;
  };
  