import React, { useState } from 'react';

/**
 * AddTaskPopup Component
 * A reusable component for adding or editing tasks/cards to the Kanban board.
 * 
 * @param {Object} props
 * @param {Function} props.onAdd - Callback function when task is added/updated. Receives task data object.
 * @param {Function} props.onCancel - Callback function when adding is cancelled.
 * @param {Object} props.initialData - Optional initial data for the task (for editing existing tasks).
 * @param {boolean} props.isEditing - Optional flag to indicate if we're editing an existing task.
 * @returns {JSX.Element}
 */
const AddTaskPopup = ({ onAdd, onCancel, initialData = {}, isEditing = false }) => {
  // State for task properties
  const [title, setTitle] = useState(initialData.title || '');
  const [tag, setTag] = useState(initialData.tag || '');
  const [dueDate, setDueDate] = useState(initialData.dueDate || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [assignedTo, setAssignedTo] = useState(initialData.assignedTo || []);
  const [subtasks, setSubtasks] = useState(initialData.subtasks || []);
  
  // Optional additional fields that can be toggled
  const [showDescription, setShowDescription] = useState(!!initialData.description);
  
  /**
   * Handles form submission
   * @param {Event} e - The form submission event
   */
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    
    if (!title.trim()) return;
    
    // Create the task data object
    const taskData = {
      title,
      tag: tag.trim() || null,
      dueDate: dueDate || null,
      description,
      assignedTo,
      subtasks
    };
    
    // Call the onAdd callback with the task data
    onAdd(taskData);
    
    // Reset form fields
    resetForm();
  };
  
  /**
   * Resets the form fields to their initial state
   */
  const resetForm = () => {
    setTitle('');
    setTag('');
    setDueDate('');
    setDescription('');
    setAssignedTo([]);
    setSubtasks([]);
  };
  
  /**
   * Toggles the display of description field
   */
  const toggleDescription = () => {
    setShowDescription(!showDescription);
  };
  
  return (
    <div className="mt-2 p-2 bg-[var(--background-secondary)] rounded">
      <form onSubmit={handleSubmit}>
        {/* Required Fields */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title *"
          className="border px-2 py-1 rounded w-full text-sm mb-2 bg-white text-gray-800"
          required
          autoFocus
        />
        
        <div className="flex mb-2">
          {/* Due Date */}
          <div className="w-1/2 mr-2">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="border px-2 py-1 rounded w-full text-sm bg-white text-gray-800"
              placeholder="Due date"
            />
          </div>
          
          {/* Tag */}
          <div className="w-1/2">
            <input
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="Tag (optional)"
              className="border px-2 py-1 rounded w-full text-sm bg-white text-gray-800"
            />
          </div>
        </div>
        
        {/* Description Toggle */}
        {!showDescription ? (
          <button
            type="button"
            onClick={toggleDescription}
            className="text-xs text-blue-600 hover:underline mb-2"
          >
            + Add description
          </button>
        ) : (
          <div className="mb-2">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="border px-2 py-1 rounded w-full text-sm bg-white text-gray-800 min-h-[60px]"
            />
            
            <button
              type="button"
              onClick={toggleDescription}
              className="text-xs text-blue-600 hover:underline mt-1"
            >
              - Hide description
            </button>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex justify-end">
          <button 
            type="submit"
            className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded mr-2 border border-blue-300"
            disabled={!title.trim()}
          >
            {isEditing ? 'Update' : 'Add'}
          </button>
          <button 
            type="button"
            onClick={onCancel} 
            className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded border border-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTaskPopup;