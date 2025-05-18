/**
 * Check if a user is the project owner
 * @param {Object} user - User object
 * @param {String} ownerId - ID of the project owner
 * @returns {Boolean} - True if the user is the owner
 */
export const isProjectOwner = (userId, ownerId) => {
  return userId === ownerId;
};

export const calculateDaysLeft = (deadline) => {
  if (!deadline) {
    return 'No Deadline';
  }

  const today = new Date();
  const deadlineDate = new Date(deadline);

  // Important: Convert both dates to UTC to handle time zone issues correctly
  today.setUTCHours(0, 0, 0, 0);
  deadlineDate.setUTCHours(0, 0, 0, 0);

  const timeDifference = deadlineDate.getTime() - today.getTime();
  const daysLeft = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return 'Deadline Passed';
  }

  return daysLeft;
};