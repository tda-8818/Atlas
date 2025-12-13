import { useState, useEffect, useRef } from 'react';
import { useGetSubTasksQuery, useCreateSubTaskMutation, useDeleteSubTaskMutation, useUpdateSubTaskMutation } from '../../redux/slices/taskSlice';
import Modal from './Modal';
import LabelPicker from '../LabelPicker';
import UserAvatar from '../avatar/UserAvatar';
import { TASK_TYPES, STORY_POINTS_OPTIONS, TaskTypeIcon } from '../../utils/taskTypeUtils';
import SubtaskDetailModal from './SubtaskDetailModal';

// Define priority levels
const priorityLevels = ['none', '!', '!!', '!!!'];

const AddTaskModal = ({ show, onAddTask, onCancel, onDelete, onEdit, teamMembers = [], initialValues = null, projectId }) => {
  const [title, setTitle] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState([]);
  const [description, setDescription] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [subtaskIds, setSubtaskIds] = useState([]);
  const [priority, setPriority] = useState('none');
  const [touched, setTouched] = useState(false);

  // Subtask modal state
  const [showSubtaskModal, setShowSubtaskModal] = useState(false);
  const [editingSubtask, setEditingSubtask] = useState(null);

  // Phase 1: Jira-inspired fields
  const [taskType, setTaskType] = useState('task');
  const [storyPoints, setStoryPoints] = useState(0);
  const [labels, setLabels] = useState([]);

  const [showMemberSearch, setShowMemberSearch] = useState(false);
  const [searchMember, setSearchMember] = useState("");

  const [createSubTask] = useCreateSubTaskMutation();
  const [deleteSubTask] = useDeleteSubTaskMutation();
  const [updateSubTask] = useUpdateSubTaskMutation();

  // Track if we're in edit mode
  const [isEditing, setIsEditing] = useState(false);

  const memberSearchRef = useRef(null);
  const titleInputRef = useRef(null);

  const { data: subtasksData, isLoading: isSubtasksLoading } = useGetSubTasksQuery(initialValues?.id, { skip: !show || !initialValues?.id });

  // Handler to populate form with initialValues when editing an existing task
  useEffect(() => {
    if (show) {
      console.log("current initial value: ", initialValues);
      if (initialValues) {
        // We're editing an existing task
        setTitle(initialValues.title || '');
        setIsCompleted(initialValues.status);
        setStartDate(formatDateToInputValue(initialValues.startDate) || '');
        setDueDate(formatDateToInputValue(initialValues.dueDate) || '');
        setAssignedTo(initialValues.assignedTo || []);
        setDescription(initialValues.description || '');
        setSubtaskIds(initialValues.subtasks || []);
        setPriority(initialValues.priority || 'none');
        setTaskType(initialValues.taskType || 'task');
        setStoryPoints(initialValues.storyPoints || 0);
        setLabels(initialValues.labels || []);
        setIsEditing(true);
      } else {
        // We're creating a new task
        setTitle('');
        setIsCompleted(false);
        setStartDate(null);
        setDueDate(null);
        setAssignedTo([]);
        setDescription('');
        setSubtaskIds([]);
        setPriority('none');
        setTaskType('task');
        setStoryPoints(0);
        setLabels([]);
        setIsEditing(false);
      }

      setShowMemberSearch(false);
      setSearchMember('');
      setTouched(false);

      // Auto-focus the title input when the modal opens
      requestAnimationFrame(() => {
        if (titleInputRef.current) {
          titleInputRef.current.focus();
        }
      });
    }
  }, [show, initialValues]);

  // Fetch and display current subtasks
  useEffect(() => {
    if (!subtasksData) return;
    console.log("Subtasks: ", subtasksData);

    const fetchedSubtasks = subtasksData.map((subtask) => ({
      id: subtask._id,
      title: subtask.title,
      status: subtask.status,
      priority: subtask.priority,
    }));
    setSubtasks(fetchedSubtasks);
    const fetchedSubtaskIds = subtasksData.map((subtask) => subtask._id);
    setSubtaskIds(fetchedSubtaskIds);
  }, [subtasksData]);

  function formatDateToInputValue(date) {
    if (!date) return '';

    // Convert to Date object if it's a string
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    // Check if it's a valid date
    if (isNaN(dateObj.getTime())) return '';

    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  // Effect to handle clicking outside the member search dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (memberSearchRef.current && !memberSearchRef.current.contains(event.target)) {
        setShowMemberSearch(false);
        setSearchMember('');
      }
    };

    if (showMemberSearch) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMemberSearch]);

  if (!show) return null;

  const handleSave = () => {
    if (!title.trim() && !isEditing) {
      return;
    }

    console.log("initial values: ", initialValues);
    const taskData = {
      id: initialValues?.id,
      title: title.trim(),
      status: isCompleted,
      startDate: startDate || null,
      dueDate: dueDate || null,
      assignedTo: assignedTo,
      description: description.trim(),
      subtasks: subtasks,
      priority: priority,
      taskType: taskType,
      storyPoints: storyPoints,
      labels: labels.map(l => l._id || l)
    };

    onAddTask(taskData);
  };

  const handleEdit = () => {
    const taskData = {
      id: initialValues?.id,
      title: title.trim(),
      status: isCompleted,
      startDate: startDate || null,
      dueDate: dueDate || null,
      assignedTo: assignedTo,
      description: description.trim(),
      subtasks: subtasks,
      priority: priority,
      taskType: taskType,
      storyPoints: storyPoints,
      labels: labels.map(l => l._id || l)
    };
    onEdit(taskData);
  };

  const handleOpenSubtaskModal = (subtask = null) => {
    setEditingSubtask(subtask);
    setShowSubtaskModal(true);
  };

  const handleSaveSubtask = async (subtaskData) => {
    if (isEditing && initialValues?.id) {
      // Creating/editing subtask for existing task
      try {
        if (subtaskData._id) {
          // Editing existing subtask - update it
          await updateSubTask({
            taskId: initialValues.id,
            subtaskId: subtaskData._id,
            subtask: subtaskData
          }).unwrap();
        } else {
          // Creating new subtask
          await createSubTask({
            taskId: initialValues.id,
            subtask: subtaskData
          }).unwrap();
        }
        setShowSubtaskModal(false);
        setEditingSubtask(null);
      } catch (error) {
        console.error("Error saving subtask:", error);
      }
    } else {
      // For new tasks, just add to local state
      if (subtaskData._id) {
        setSubtasks(prev => prev.map(st => st._id === subtaskData._id ? subtaskData : st));
      } else {
        setSubtasks(prev => [...prev, { ...subtaskData, _id: `temp-${Date.now()}` }]);
      }
      setShowSubtaskModal(false);
      setEditingSubtask(null);
    }
  };

  const handleDeleteSubtask = async (subtaskId) => {
    // If editing existing task, delete from DB
    if (isEditing && initialValues?.id) {
      try {
        await deleteSubTask({ taskId: initialValues.id, subtaskId }).unwrap();
        console.log("Subtask deleted successfully");
      } catch (error) {
        console.error("Error deleting subtask:", error);
        return;
      }
    }

    // Remove from local state
    setSubtasks(subtasks.filter(st => st._id !== subtaskId && st.id !== subtaskId));
  };

  const handleToggleSubtask = async (subtaskId) => {
    const subtaskToUpdate = subtasks.find(st => st._id === subtaskId || st.id === subtaskId);
    if (!subtaskToUpdate) return;

    // If editing existing task, update in DB
    if (isEditing && initialValues?.id) {
      try {
        const updatedSubtask = {
          ...subtaskToUpdate,
          status: !subtaskToUpdate.status
        };
        await updateSubTask({ taskId: initialValues.id, subtaskId, subtask: updatedSubtask }).unwrap();
      } catch (error) {
        console.error("Error updating subtask:", error);
        return;
      }
    }

    // Update local state
    setSubtasks(prev =>
      prev.map(st =>
        (st._id === subtaskId || st.id === subtaskId) ? { ...st, status: !st.status } : st
      )
    );
  };

  const toggleUserAssignment = (member) => {
    setAssignedTo(prev =>
      prev.some(m => m._id === member._id)
        ? prev.filter(m => m._id !== member._id)
        : [...prev, member]
    );
  };

  return (
    <>
    <Modal
      isOpen={show}
      onClose={onCancel}
      onSave={isEditing ? handleEdit : handleSave}
      saveLabel={isEditing ? 'Save Changes' : 'Create Task'}
      showDelete={isEditing}
      onDelete={onDelete}
      deleteLabel="Delete Task"
      saveDisabled={!title.trim()}
      size="2xl"
    >
      {/* Task Title */}
      <div className="mb-6">
        <label htmlFor="taskTitle" className="block text-sm font-medium text-[var(--text)] mb-2">
          Task Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          ref={titleInputRef}
          id="taskTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder="Enter task title"
          className="w-full px-4 py-2.5 bg-[var(--background-primary)] border border-[var(--border-color-accent)] text-[var(--text)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200 placeholder:text-[var(--text-muted)]"
        />
        {touched && !title.trim() && (
          <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Task title is required
          </p>
        )}
      </div>

      {/* Status and Type Row */}
      <div className="mb-6 flex items-center justify-between gap-4 p-4 bg-[var(--background-primary)] border border-[var(--border-color-accent)] rounded-lg">
        {/* Completion Button */}
        <button
          type="button"
          onClick={() => setIsCompleted(!isCompleted)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            isCompleted
              ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20 border border-green-500/30'
              : 'bg-gray-500/10 text-gray-600 hover:bg-gray-500/20 border border-gray-500/30'
          }`}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-sm">{isCompleted ? 'Completed' : 'Not completed'}</span>
        </button>

        {/* Task Type Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--text-muted)]">Type:</span>
          <select
            id="taskType"
            value={taskType}
            onChange={(e) => setTaskType(e.target.value)}
            className="px-3 py-1.5 bg-[var(--background)] border border-[var(--border-color-accent)] text-[var(--text)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all duration-200 text-sm"
          >
            {Object.values(TASK_TYPES).map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Priority and Story Points Row */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-2">
            Priority
          </label>
          <div className="flex gap-2">
            {priorityLevels.map(level => {
              const colors = {
                'none': 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200',
                '!': 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200',
                '!!': 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200',
                '!!!': 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200'
              };

              const selectedColors = {
                'none': 'bg-gray-500 text-white border-gray-600',
                '!': 'bg-blue-600 text-white border-blue-700',
                '!!': 'bg-orange-600 text-white border-orange-700',
                '!!!': 'bg-red-600 text-white border-red-700'
              };

              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => setPriority(level)}
                  className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg border-2 transition-all duration-200 ${
                    priority === level ? selectedColors[level] : colors[level]
                  }`}
                >
                  {level === 'none' ? 'None' : level}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label htmlFor="storyPoints" className="block text-sm font-medium text-[var(--text)] mb-2">
            Story Points
          </label>
          <select
            id="storyPoints"
            value={storyPoints}
            onChange={(e) => setStoryPoints(Number(e.target.value))}
            className="w-full px-4 py-2 bg-[var(--background-primary)] border border-[var(--border-color-accent)] text-[var(--text)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200"
          >
            {STORY_POINTS_OPTIONS.map(points => (
              <option key={points} value={points}>
                {points === 0 ? 'None' : points}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dates */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="taskStartDate" className="block text-sm font-medium text-[var(--text)] mb-2">
            Start Date
          </label>
          <input
            type="date"
            id="taskStartDate"
            value={startDate || ''}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-2.5 bg-[var(--background-primary)] border border-[var(--border-color-accent)] text-[var(--text)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200"
          />
        </div>
        <div>
          <label htmlFor="taskDueDate" className="block text-sm font-medium text-[var(--text)] mb-2">
            Due Date
          </label>
          <input
            type="date"
            id="taskDueDate"
            value={dueDate || ''}
            onChange={(e) => setDueDate(e.target.value)}
            min={startDate || undefined}
            className="w-full px-4 py-2.5 bg-[var(--background-primary)] border border-[var(--border-color-accent)] text-[var(--text)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>

      {/* Assigned To */}
      <div className="mb-6 relative">
        <label className="block text-sm font-medium text-[var(--text)] mb-2">
          Assigned To
        </label>
        <div className="flex items-center flex-wrap gap-2 p-3 bg-[var(--background-primary)] border border-[var(--border-color-accent)] rounded-lg min-h-[48px]">
          {(assignedTo || []).map((user) => (
            <div key={user._id} className="flex items-center gap-2 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 rounded-full pl-1 pr-3 py-1 text-sm text-[var(--text)]">
              <UserAvatar user={user} size="sm" />
              <span>{user.firstName}</span>
              <button
                onClick={() => toggleUserAssignment(user)}
                className="text-[var(--text-muted)] hover:text-red-500 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>
          ))}

          <button
            className="flex items-center justify-center w-8 h-8 bg-[var(--color-primary)]/20 hover:bg-[var(--color-primary)]/30 rounded-full transition-colors"
            onClick={() => setShowMemberSearch(!showMemberSearch)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--color-primary)]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {showMemberSearch && (
          <div ref={memberSearchRef} className="absolute top-full mt-2 bg-[var(--background)] border border-[var(--border-color-accent)] shadow-lg rounded-lg p-3 w-full z-20">
            <div className="mb-2">
              <input
                type="text"
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
                placeholder="Search members..."
                className="w-full px-3 py-2 bg-[var(--background-primary)] border border-[var(--border-color-accent)] text-[var(--text)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent placeholder:text-[var(--text-muted)]"
                autoFocus
              />
            </div>
            <div className="max-h-40 overflow-y-auto">
              {teamMembers
                .filter(member =>
                  member.firstName.toLowerCase().includes(searchMember.toLowerCase()) &&
                  !assignedTo.some(m => m._id === member._id)
                )
                .map(member => (
                  <div
                    key={member._id}
                    className="flex items-center gap-3 p-2 hover:bg-[var(--background-primary)] rounded-lg cursor-pointer transition-colors"
                    onClick={() => {
                      toggleUserAssignment(member);
                      setSearchMember("");
                      setShowMemberSearch(false);
                    }}
                  >
                    <UserAvatar user={member} size="md" />
                    <span className="text-sm text-[var(--text)]">{member.firstName} {member.lastName}</span>
                  </div>
                ))}
              {teamMembers.filter(member =>
                member.firstName.toLowerCase().includes(searchMember.toLowerCase()) &&
                !assignedTo.some(m => m._id === member._id)
              ).length === 0 && (
                <div className="text-center text-sm text-[var(--text-muted)] py-2">No members found</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Labels */}
      {projectId && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--text)] mb-2">
            Labels
          </label>
          <LabelPicker
            projectId={projectId}
            selectedLabels={labels}
            onChange={setLabels}
          />
        </div>
      )}

      {/* Notes Section */}
      <div className="mb-6">
        <label htmlFor="taskDescription" className="block text-sm font-medium text-[var(--text)] mb-2">
          Notes
        </label>
        <textarea
          id="taskDescription"
          value={description || ''}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add notes, details, or any additional information..."
          rows={3}
          className="w-full px-4 py-2.5 bg-[var(--background-primary)] border border-[var(--border-color-accent)] text-[var(--text)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200 resize-none placeholder:text-[var(--text-muted)]"
        />
      </div>

      {/* Subtasks Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-[var(--text)]">
            Subtasks {subtasks.length > 0 && <span className="text-[var(--text-muted)] font-normal">({subtasks.length})</span>}
          </label>
          <button
            onClick={() => handleOpenSubtaskModal(null)}
            className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-accent-hover)] text-sm font-medium transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Subtask
          </button>
        </div>

        {(subtasks || []).length > 0 ? (
          <div className="space-y-2">
            {(subtasks || []).map((subtask) => (
              <div
                key={subtask._id || subtask.id}
                onClick={() => handleOpenSubtaskModal(subtask)}
                className="flex items-center gap-3 bg-[var(--background-primary)] border border-[var(--border-color-accent)] p-3 rounded-lg hover:border-[var(--color-primary)] transition-all cursor-pointer group"
              >
                {/* Status Checkbox */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleSubtask(subtask._id || subtask.id);
                  }}
                  className="flex items-center justify-center w-5 h-5 rounded border-2 focus:outline-none transition-all flex-shrink-0"
                  style={{
                    borderColor: subtask.status ? 'var(--color-primary)' : 'var(--border-color-accent)',
                    backgroundColor: subtask.status ? 'var(--color-primary)' : 'transparent'
                  }}
                >
                  {subtask.status && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" className="w-3.5 h-3.5">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>

                {/* Task Type Icon */}
                <div className="flex-shrink-0">
                  <TaskTypeIcon type={subtask.taskType || 'task'} size="sm" />
                </div>

                {/* Title and Details */}
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium text-[var(--text)] truncate ${subtask.status ? "line-through opacity-60" : ""}`}>
                    {subtask.title}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {/* Priority */}
                    {subtask.priority && subtask.priority !== 'none' && (
                      <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-700 rounded font-medium">
                        {subtask.priority}
                      </span>
                    )}
                    {/* Dates */}
                    {(subtask.startDate || subtask.dueDate) && (
                      <span className="text-xs text-[var(--text-muted)]">
                        {subtask.startDate && new Date(subtask.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {subtask.startDate && subtask.dueDate && ' → '}
                        {subtask.dueDate && new Date(subtask.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                    {/* Story Points */}
                    {subtask.storyPoints > 0 && (
                      <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">
                        {subtask.storyPoints} pts
                      </span>
                    )}
                  </div>
                </div>

                {/* Assignees */}
                {subtask.assignedTo && subtask.assignedTo.length > 0 && (
                  <div className="flex -space-x-2 flex-shrink-0">
                    {subtask.assignedTo.slice(0, 3).map((user, idx) => (
                      <div key={user._id || idx} className="relative">
                        <UserAvatar user={user} size="sm" />
                      </div>
                    ))}
                    {subtask.assignedTo.length > 3 && (
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                        +{subtask.assignedTo.length - 3}
                      </div>
                    )}
                  </div>
                )}

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSubtask(subtask._id || subtask.id);
                  }}
                  className="text-[var(--text-muted)] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-[var(--background-primary)] border-2 border-dashed border-[var(--border-color-accent)] rounded-lg">
            <svg className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm text-[var(--text-muted)] mb-3">No subtasks yet</p>
            <button
              onClick={() => handleOpenSubtaskModal(null)}
              className="text-sm text-[var(--color-primary)] hover:underline font-medium"
            >
              Add your first subtask
            </button>
          </div>
        )}
      </div>
    </Modal>

    {/* Subtask Detail Modal */}
    <SubtaskDetailModal
      show={showSubtaskModal}
      onCancel={() => {
        setShowSubtaskModal(false);
        setEditingSubtask(null);
      }}
      onSave={handleSaveSubtask}
      teamMembers={teamMembers}
      initialValues={editingSubtask}
      projectId={projectId}
    />
  </>
  );
};

export default AddTaskModal;
