/**
 * Check if a user is the project owner
 * @param {Object} user - User object
 * @param {String} ownerId - ID of the project owner
 * @returns {Boolean} - True if the user is the owner
 */
export const isProjectOwner = (userId, ownerId) => {
  return userId === ownerId;
};

/**
 * Calculates the number of days remaining until the end date, given a start and end date.
 * Returns null if the endDate is not provided or has already passed.
 *
 * @param {string | Date} startDate The start date (can be a Date object or a string parsable by Date).
 * @param {string | Date} endDate The end date (can be a Date object or a string parsable by Date).
 * @returns {number | null} The number of days left until the end date, or null if no end date or it has passed.
 */
export const calculateDaysLeft = (startDate, endDate) => {
  if (!endDate) {
    return null;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();

  // Set hours, minutes, seconds, and milliseconds to 0 for accurate comparison
  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  if (end < today) {
    return null; // End date has passed
  }

  // Calculate the difference in milliseconds
  const difference = end.getTime() - today.getTime();

  // Convert milliseconds to days
  const daysLeft = Math.ceil(difference / (1000 * 60 * 60 * 24));

  return daysLeft;
};

export const calculateProgress = (tasks) => {
  if (!Array.isArray(tasks) || tasks.length === 0) return 0;
  const completedTasks = tasks.filter((task) => task.status);
  console.log(tasks);
  tasks.forEach(task => {
  console.log(task.status, typeof task.status);
});
  return Math.round((completedTasks.length / tasks.length) * 100);
};