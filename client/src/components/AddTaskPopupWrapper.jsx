import React from 'react';
import AddTaskPopup from './AddTaskPopup-1';

/**
 * A wrapper component for AddTaskPopup that handles the 
 * differences between the Calendar and Kanban implementations
 */
const AddTaskPopupWrapper = ({ 
  show, 
  onAddTask, 
  onCancel, 
  teamMembers = [] 
}) => {
  // Simply pass through all props to the original AddTaskPopup
  return (
    <AddTaskPopup
      show={show}
      onAddTask={onAddTask}
      onCancel={onCancel}
      teamMembers={teamMembers}
    />
  );
};

export default AddTaskPopupWrapper;