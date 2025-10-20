import { useState, useEffect, useRef } from 'react';
import { useGetSubTasksQuery, useCreateSubTaskMutation, useDeleteSubTaskMutation, useUpdateSubTaskMutation } from '../../redux/slices/taskSlice';
import Modal from './Modal';

// Define priority levels
const priorityLevels = ['none', '!', '!!', '!!!'];

const AddTaskModal = ({ show, onAddTask, onCancel, onDelete, onEdit, teamMembers = [], initialValues = null }) => {
  const [title, setTitle] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState([]);
  const [description, setDescription] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [subtaskIds, setSubtaskIds] = useState([]);
  const [priority, setPriority] = useState('none');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const [showMemberSearch, setShowMemberSearch] = useState(false);
  const [searchMember, setSearchMember] = useState("");

  // State for collapsible sections
  const [isDescriptionCollapsed, setIsDescriptionCollapsed] = useState(true);
  const [isSubtasksCollapsed, setIsSubtasksCollapsed] = useState(true);

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
        setIsEditing(true);
        setIsDescriptionCollapsed(!initialValues.description);
        setIsSubtasksCollapsed(!initialValues.subtasks?.length);
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
        setIsEditing(false);
        setIsDescriptionCollapsed(true);
        setIsSubtasksCollapsed(true);
      }

      setNewSubtaskTitle('');
      setShowMemberSearch(false);
      setSearchMember('');

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
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
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
      priority: priority
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
      priority: priority
    };
    onEdit(taskData);
  };

  const addSubtask = async () => {
    if (!newSubtaskTitle.trim()) return;
    try {
      console.log("Adding subtask:", newSubtaskTitle.trim());
      const newSubtask = {
        title: newSubtaskTitle.trim(),
        priority: 'none'
      };
      console.log("Subtask data:", newSubtask);
      await createSubTask({ taskId: initialValues.id, subtask: newSubtask }).unwrap();
      setSubtasks([...subtasks, newSubtask]);
    } catch (error) {
      console.error("Error adding subtask:", error);
    }

    setNewSubtaskTitle('');
    setIsSubtasksCollapsed(false);
  };

  const deleteSubtask = async (subtaskId) => {
    try {
      await deleteSubTask({ taskId: initialValues.id, subtaskId }).unwrap();
      console.log("Subtask deleted successfully");
      setSubtasks(subtasks.filter(st => st.id !== subtaskId));
    } catch (error) {
      console.error("Error deleting subtask:", error);
    }
  };

  const toggleSubtask = async (subtaskId) => {
    try {
      const subtaskToUpdate = subtasks.find(st => st.id === subtaskId);
      if (!subtaskToUpdate) return;
      const updatedSubtask = {
        ...subtaskToUpdate,
        status: !subtaskToUpdate.status
      };
      await updateSubTask({ taskId: initialValues.id, subtaskId, subtask: updatedSubtask }).unwrap();
      setSubtasks(prev =>
        prev.map(st =>
          st.id === subtaskId ? { ...st, status: !st.status } : st
        )
      );
    } catch (error) {
      console.error("Error updating subtask:", error);
    }
  };

  const handleUpdateSubtaskPriority = async (subtaskId, newPriority) => {
    try {
      const subtaskToUpdate = subtasks.find(st => st.id === subtaskId);
      if (!subtaskToUpdate) return;
      const updatedSubtask = {
        ...subtaskToUpdate,
        priority: newPriority
      };
      await updateSubTask({ taskId: initialValues.id, subtaskId, subtask: updatedSubtask }).unwrap();
      setSubtasks(subtasks.map(st =>
        st.id === subtaskId ? { ...st, priority: newPriority } : st
      ));
    } catch (error) {
      console.error("Error updating subtask priority:", error);
    }
  };

  const toggleUserAssignment = (member) => {
    setAssignedTo(prev =>
      prev.some(m => m._id === member._id)
        ? prev.filter(m => m._id !== member._id)
        : [...prev, member]
    );
  };

  return (
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
          placeholder="Enter task title"
          className="w-full px-4 py-2.5 bg-[var(--background-primary)] border border-[var(--border-color-accent)] text-[var(--text)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200 placeholder:text-[var(--text-muted)]"
        />
        {!isEditing && !title.trim() && (
          <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Task title is required
          </p>
        )}
      </div>

      {/* Priority and Completion Row */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="taskPriority" className="block text-sm font-medium text-[var(--text)] mb-2">
            Priority
          </label>
          <select
            id="taskPriority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full px-4 py-2.5 bg-[var(--background-primary)] border border-[var(--border-color-accent)] text-[var(--text)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200"
          >
            {priorityLevels.map(level => (
              <option key={level} value={level}>
                {level === 'none' ? 'None' : level}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="completed" className="block text-sm font-medium text-[var(--text)] mb-2">
            Status
          </label>
          <div className="flex items-center h-[42px] px-4 bg-[var(--background-primary)] border border-[var(--border-color-accent)] rounded-lg">
            <input
              type="checkbox"
              id="completed"
              checked={isCompleted}
              onChange={(e) => setIsCompleted(e.target.checked)}
              className="w-5 h-5 text-[var(--color-primary)] bg-[var(--background)] border-[var(--border-color-accent)] rounded focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer"
            />
            <label htmlFor="completed" className="ml-3 text-sm text-[var(--text)] cursor-pointer">
              Mark as completed
            </label>
          </div>
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
            <div key={user._id} className="flex items-center bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 rounded-full px-3 py-1.5 text-sm text-[var(--text)]">
              <span>{user.firstName}</span>
              <button
                onClick={() => toggleUserAssignment(user)}
                className="ml-2 text-[var(--text-muted)] hover:text-red-500 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
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
                    className="flex items-center gap-2 p-2 hover:bg-[var(--background-primary)] rounded-lg cursor-pointer transition-colors"
                    onClick={() => {
                      toggleUserAssignment(member);
                      setSearchMember("");
                      setShowMemberSearch(false);
                    }}
                  >
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

      {/* Description Section (Collapsible) */}
      <div className="mb-6">
        <button
          className="flex items-center justify-between w-full py-2 text-sm font-medium text-left text-[var(--text)] hover:text-[var(--color-primary)] focus:outline-none transition-colors"
          onClick={() => setIsDescriptionCollapsed(!isDescriptionCollapsed)}
        >
          <span>Description</span>
          <svg
            className={`w-5 h-5 transform transition-transform duration-200 ${isDescriptionCollapsed ? '' : 'rotate-180'}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <div className={`mt-3 ${isDescriptionCollapsed ? 'hidden' : ''}`}>
          <textarea
            id="taskDescription"
            value={description || ''}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a detailed description..."
            rows={3}
            className="w-full px-4 py-2.5 bg-[var(--background-primary)] border border-[var(--border-color-accent)] text-[var(--text)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200 resize-none placeholder:text-[var(--text-muted)]"
          />
        </div>
      </div>

      {/* Subtasks Section (Collapsible) */}
      <div className="mb-4">
        <button
          className="flex items-center justify-between w-full py-2 text-sm font-medium text-left text-[var(--text)] hover:text-[var(--color-primary)] focus:outline-none transition-colors"
          onClick={() => setIsSubtasksCollapsed(!isSubtasksCollapsed)}
        >
          <span>Subtasks {isEditing && `(${subtasks.length})`}</span>
          {isEditing && (
            <svg
              className={`w-5 h-5 transform transition-transform duration-200 ${isSubtasksCollapsed ? '' : 'rotate-180'}`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        {isEditing ? (
          <div className={`mt-3 ${isSubtasksCollapsed ? 'hidden' : ''}`}>
            {(subtasks || []).length > 0 && (
              <div className="space-y-2 mb-3">
                {(subtasks || []).map((subtask) => (
                  <div key={subtask.id} className="flex items-center gap-3 bg-[var(--background-primary)] border border-[var(--border-color-accent)] p-3 rounded-lg">
                    <button
                      onClick={() => toggleSubtask(subtask.id)}
                      className="flex items-center justify-center w-5 h-5 rounded border-2 focus:outline-none transition-all"
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
                    <span className={`text-sm flex-1 text-[var(--text)] ${subtask.status ? "line-through opacity-60" : ""}`}>
                      {subtask.title}
                    </span>
                    <select
                      value={subtask.priority || 'none'}
                      onChange={(e) => handleUpdateSubtaskPriority(subtask.id, e.target.value)}
                      className="text-xs px-2 py-1 bg-[var(--background)] border border-[var(--border-color-accent)] text-[var(--text)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    >
                      {priorityLevels.map(level => (
                        <option key={level} value={level}>
                          {level === 'none' ? 'Priority' : level}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => deleteSubtask(subtask.id)}
                      className="text-[var(--text-muted)] hover:text-red-500 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="text"
                id="newSubtaskInput"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Add a new subtask..."
                className="flex-1 px-4 py-2.5 bg-[var(--background-primary)] border border-[var(--border-color-accent)] text-[var(--text)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200 placeholder:text-[var(--text-muted)]"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newSubtaskTitle.trim()) {
                    addSubtask();
                  }
                }}
              />
              <button
                onClick={addSubtask}
                disabled={!newSubtaskTitle.trim()}
                className="px-5 py-2.5 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-accent-hover)] text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--color-primary)]"
              >
                Add
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-xs text-[var(--text-muted)]">Save the task first to add subtasks</p>
        )}
      </div>
    </Modal>
  );
};

export default AddTaskModal;
