/**
 * Check if a user is the project owner
 * @param {Object} user - User object
 * @param {String} ownerId - ID of the project owner
 * @returns {Boolean} - True if the user is the owner
 */
export const isProjectOwner = (user, ownerId) => {
  // Extract the user id considering possible properties '_id' or 'id'
  const userId = user?._id || user?.id;
  return userId === ownerId;
};