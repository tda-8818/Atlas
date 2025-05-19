import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';

const AddProjectModal = ({ show, onAddProject, onCancel, initialValues = null }) => {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [description,setDescription] = useState('');


  useEffect(() => {
    if (show) {
      if (initialValues) {
        setTitle(initialValues.title || '');
        setStartDate(initialValues.startDate || '');
        setDueDate(initialValues.dueDate || '');
       
      } else {
        setTitle('');
        setStartDate('');
        setDueDate('');
        
      }
      
    }
  }, [show, initialValues]);

  const handleSave = () => {
    if (!title.trim()) {
      alert("Project title is required.");
      return;
    }
    const projectData = {
      title: title.trim(),
      startDate: startDate || null,
      dueDate: dueDate,
      description: description || null,
      progress: initialValues?.progress || 0,
      daysLeft: dueDate
        ? Math.max(Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24)), 0)
        : 0,
    };
    console.log("new project data ",projectData)
    onAddProject(projectData);
  };


  if (!show) return null;

  return (
    <Modal
      isOpen={show}
      onClose={onCancel}
      onSave={handleSave}
      title="Add Project"
      saveLabel={initialValues ? "Save Changes" : "Create Project"}
    >
        {/* Title */}
        <div className="mb-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Project Title"
            className="w-full text-lg font-semibold border-b border-gray-300 focus:border-blue-500 focus:outline-none pb-1"
          />
        </div>

        {/* Dates */}
        <div className="mb-4 flex gap-4">
          <div className="flex-1">
            <label className="text-sm font-semibold block mb-1">Start Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className="w-full border px-3 py-2 rounded text-sm" />
          </div>
          <div className="flex-1">
            <label className="text-sm font-semibold block mb-1">Due Date</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
              className="w-full border px-3 py-2 rounded text-sm" />
          </div>
        </div>

        {/* Owner */}
        <div className="mb-4">
           <button
               className="flex items-center justify-between w-full py-3 text-sm font-semibold text-left text-gray-700 hover:text-gray-900 focus:outline-none" // Removed border-b
           >
               Description (Optional)
              
           </button>
           <div>
               <textarea
                 id="taskDescription"
                 value={description || ''}
                 onChange={(e) => setDescription(e.target.value)}
                 placeholder="Add a detailed description..."
                 className="w-full border rounded px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-blue-500 focus:border-blue-500"
               />
           </div>
        </div>
    </Modal>
  );
};

export default AddProjectModal;
