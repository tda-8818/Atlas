/**
 * Task utility functions for calculating statistics and managing task data
 */

/**
 * Count tasks with "completed" status
 * @param {Array} tasks - Array of task objects
 * @returns {number} - Count of completed tasks
 */
export const getCompletedTasksCount = (tasks = []) => {
    return tasks.filter(task => 
      task?.status?.toLowerCase() === 'completed'
    ).length || 0;
  };
  
  /**
   * Count tasks with "in progress" status
   * @param {Array} tasks - Array of task objects
   * @returns {number} - Count of in-progress tasks
   */
  export const getInProgressTasksCount = (tasks = []) => {
    return tasks.filter(task => 
      task?.status?.toLowerCase() === 'in progress'
    ).length || 0;
  };
  
  /**
   * Count overdue tasks (due date in the past and not completed)
   * @param {Array} tasks - Array of task objects
   * @returns {number} - Count of overdue tasks
   */
  export const getOverdueTasksCount = (tasks = []) => {
    return tasks.filter(task => {
      if (!task?.dueDate) return false;
      
      const dueDate = new Date(task.dueDate);
      const now = new Date();
      return dueDate < now && task?.status?.toLowerCase() !== 'completed';
    }).length || 0;
  };
  
  /**
   * Get all task statistics at once
   * @param {Array} tasks - Array of task objects
   * @returns {Object} - Object containing all task statistics
   */
  export const getTaskStats = (tasks = []) => {
    return {
      completed: getCompletedTasksCount(tasks),
      inProgress: getInProgressTasksCount(tasks),
      overdue: getOverdueTasksCount(tasks)
    };
  };
  
  /**
   * Format due date for display
   * @param {string} dateString - ISO date string
   * @returns {string} - Formatted date
   */
  export const formatDueDate = (dateString) => {
    if (!dateString) return 'No due date';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
      });
    } catch (e) {
      return dateString;
    }
  };
  
  /**
   * Check if a task is overdue
   * @param {Object} task - Task object with dueDate and status properties
   * @returns {boolean} - True if task is overdue
   */
  export const isTaskOverdue = (task) => {
    if (!task?.dueDate || task?.status?.toLowerCase() === 'completed') return false;
    
    const dueDate = new Date(task.dueDate);
    const now = new Date();
    return dueDate < now;
  };

  // More utility functions you might want to add

/**
 * Group tasks by status
 * @param {Array} tasks - Array of task objects
 * @returns {Object} Object with tasks grouped by status
 */
export const groupTasksByStatus = (tasks = []) => {
    return tasks.reduce((acc, task) => {
      const status = task?.status?.toLowerCase() || 'unknown';
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(task);
      return acc;
    }, {});
  };
  
  /**
   * Sort tasks by due date (ascending)
   * @param {Array} tasks - Array of task objects
   * @returns {Array} Sorted tasks
   */
  export const sortTasksByDueDate = (tasks = []) => {
    return [...tasks].sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
  };
  
  /**
   * Get upcoming tasks (due within the next 7 days)
   * @param {Array} tasks - Array of task objects
   * @returns {Array} Upcoming tasks
   */
  export const getUpcomingTasks = (tasks = []) => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    return tasks.filter(task => {
      if (!task?.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= today && dueDate <= nextWeek;
    });
  };