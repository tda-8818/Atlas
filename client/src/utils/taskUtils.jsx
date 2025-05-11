export const getTaskStatus = (task) => {
  if (task.status === true) {
    return 'completed';
  } else {
    return 'in progress';
  }
};

export const isTaskOverdue = (task) => {
  if (task.dueDate) {
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    return dueDate < now && task.status === false; // Only overdue if not completed
  }
  return false; // If no due date, it's not overdue
};

export const getTaskStats = (tasks) => {
  const completedCount = tasks.filter((task) => getTaskStatus(task) === 'completed').length;
  const inProgressCount = tasks.filter((task) => getTaskStatus(task) === 'in progress').length;
  const overdueCount = tasks.filter(isTaskOverdue).length;

  return { completed: completedCount, inProgress: inProgressCount, overdue: overdueCount };
};

export const calculateProjectProgress = (tasks) => {
  if (!tasks || tasks.length === 0) {
    return 0; // No tasks, no progress
  }

  const completedTasks = tasks.filter((task) => getTaskStatus(task) === 'completed').length;
  const totalTasks = tasks.length;

  return (completedTasks / totalTasks) * 100;
};