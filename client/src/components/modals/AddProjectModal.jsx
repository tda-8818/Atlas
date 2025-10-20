import { useState, useEffect } from 'react';
import Modal from './Modal';

const AddProjectModal = ({ show, onAddProject, onCancel, initialValues = null }) => {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (show) {
      if (initialValues) {
        setTitle(initialValues.title || '');
        setStartDate(initialValues.startDate || '');
        setDueDate(initialValues.dueDate || '');
        setDescription(initialValues.description || '');
      } else {
        setTitle('');
        setStartDate('');
        setDueDate('');
        setDescription('');
      }
      setTouched(false);
    }
  }, [show, initialValues]);

  const handleSave = () => {
    setTouched(true);
    if (!title.trim()) {
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
    console.log("new project data ", projectData);
    onAddProject(projectData);
  };

  if (!show) return null;

  const isValid = title.trim().length > 0;

  return (
    <Modal
      isOpen={show}
      onClose={onCancel}
      onSave={handleSave}
      title={initialValues ? "Edit Project" : "Create New Project"}
      saveLabel={initialValues ? "Save Changes" : "Create Project"}
      saveDisabled={!isValid}
      size="lg"
    >
      {/* Title */}
      <div className="mb-6">
        <label htmlFor="projectTitle" className="block text-sm font-medium text-[var(--text)] mb-2">
          Project Title <span className="text-red-500">*</span>
        </label>
        <input
          id="projectTitle"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder="Enter project title"
          className="w-full px-4 py-2.5 bg-[var(--background-primary)] border border-[var(--border-color-accent)] text-[var(--text)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200 placeholder:text-[var(--text-muted)]"
          autoFocus
        />
        {touched && !title.trim() && (
          <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Project title is required
          </p>
        )}
      </div>

      {/* Dates */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-[var(--text)] mb-2">
            Start Date
          </label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-2.5 bg-[var(--background-primary)] border border-[var(--border-color-accent)] text-[var(--text)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200"
          />
        </div>
        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-[var(--text)] mb-2">
            Due Date
          </label>
          <input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            min={startDate || undefined}
            className="w-full px-4 py-2.5 bg-[var(--background-primary)] border border-[var(--border-color-accent)] text-[var(--text)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>

      {/* Description */}
      <div className="mb-4">
        <label htmlFor="projectDescription" className="block text-sm font-medium text-[var(--text)] mb-2">
          Description
        </label>
        <textarea
          id="projectDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a detailed description for your project..."
          rows={4}
          className="w-full px-4 py-2.5 bg-[var(--background-primary)] border border-[var(--border-color-accent)] text-[var(--text)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200 resize-none placeholder:text-[var(--text-muted)]"
        />
        <p className="mt-1.5 text-xs text-[var(--text-muted)]">Optional: Provide context and goals for this project</p>
      </div>
    </Modal>
  );
};

export default AddProjectModal;
