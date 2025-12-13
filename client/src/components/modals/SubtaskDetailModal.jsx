import { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import LabelPicker from '../LabelPicker';
import UserAvatar from '../avatar/UserAvatar';
import { TASK_TYPES, STORY_POINTS_OPTIONS, TaskTypeIcon } from '../../utils/taskTypeUtils';

const priorityLevels = ['none', '!', '!!', '!!!'];

const SubtaskDetailModal = ({ show, onCancel, onSave, teamMembers = [], initialValues = null, projectId }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState([]);
  const [priority, setPriority] = useState('none');
  const [taskType, setTaskType] = useState('task');
  const [storyPoints, setStoryPoints] = useState(0);
  const [labels, setLabels] = useState([]);
  const [showMemberSearch, setShowMemberSearch] = useState(false);
  const [searchMember, setSearchMember] = useState('');
  const memberSearchRef = useRef(null);

  useEffect(() => {
    if (show && initialValues) {
      setTitle(initialValues.title || '');
      setDescription(initialValues.description || '');
      setStatus(initialValues.status || false);
      setStartDate(formatDateToInputValue(initialValues.startDate) || '');
      setDueDate(formatDateToInputValue(initialValues.dueDate) || '');
      setAssignedTo(initialValues.assignedTo || []);
      setPriority(initialValues.priority || 'none');
      setTaskType(initialValues.taskType || 'task');
      setStoryPoints(initialValues.storyPoints || 0);
      setLabels(initialValues.labels || []);
    } else if (show) {
      // Reset for new subtask
      setTitle('');
      setDescription('');
      setStatus(false);
      setStartDate('');
      setDueDate('');
      setAssignedTo([]);
      setPriority('none');
      setTaskType('task');
      setStoryPoints(0);
      setLabels([]);
    }
  }, [show, initialValues]);

  function formatDateToInputValue(date) {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '';
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  const toggleUserAssignment = (member) => {
    setAssignedTo(prev =>
      prev.some(m => m._id === member._id)
        ? prev.filter(m => m._id !== member._id)
        : [...prev, member]
    );
  };

  const handleSave = () => {
    if (!title.trim()) return;

    const subtaskData = {
      _id: initialValues?._id,
      title: title.trim(),
      description: description.trim(),
      status,
      startDate: startDate || null,
      dueDate: dueDate || null,
      assignedTo,
      priority,
      taskType,
      storyPoints,
      labels: labels.map(l => l._id || l)
    };

    onSave(subtaskData);
  };

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

  const filteredMembers = teamMembers.filter(member =>
    `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchMember.toLowerCase())
  );

  if (!show) return null;

  return (
    <Modal
      isOpen={show}
      onClose={onCancel}
      title={initialValues ? 'Edit Subtask' : 'Add Subtask'}
      onSave={handleSave}
      saveLabel={initialValues ? 'Save Changes' : 'Add Subtask'}
      saveDisabled={!title.trim()}
    >
      {/* Content Container */}
      <div className="space-y-4">

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-2">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter subtask title"
            className="w-full px-4 py-2.5 bg-[var(--background-primary)] border border-[var(--border-color-accent)] text-[var(--text)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200"
            autoFocus
          />
        </div>

        {/* Status Toggle */}
        <div>
          <button
            onClick={() => setStatus(!status)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              status ? 'bg-green-50 text-green-700' : 'bg-[var(--background-primary)] text-[var(--text-muted)] border border-[var(--border-color-accent)]'
            }`}
          >
            <svg className={`w-5 h-5 ${status ? 'text-green-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{status ? 'Completed' : 'Mark as complete'}</span>
          </button>
        </div>

        {/* Task Type & Story Points */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">Task Type</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(TASK_TYPES).map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    onClick={() => setTaskType(type.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                      taskType === type.value
                        ? 'border-[var(--color-primary)] bg-opacity-10'
                        : 'border-[var(--border-color-accent)] hover:border-[var(--border-color)] bg-[var(--background-primary)]'
                    }`}
                    style={{
                      borderColor: taskType === type.value ? type.color : undefined,
                      backgroundColor: taskType === type.value ? `${type.color}15` : undefined
                    }}
                  >
                    <Icon className="w-4 h-4" style={{ color: type.color }} />
                    <span className="text-sm font-medium text-[var(--text)]">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">Story Points</label>
            <select
              value={storyPoints}
              onChange={(e) => setStoryPoints(Number(e.target.value))}
              className="w-full px-4 py-2 bg-[var(--background-primary)] border border-[var(--border-color-accent)] text-[var(--text)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200"
            >
              {STORY_POINTS_OPTIONS.map(points => (
                <option key={points} value={points}>{points === 0 ? 'None' : points}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 bg-[var(--background-primary)] border border-[var(--border-color-accent)] text-[var(--text)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2 bg-[var(--background-primary)] border border-[var(--border-color-accent)] text-[var(--text)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-2">Priority</label>
          <div className="flex gap-2">
            {priorityLevels.map((level) => (
              <button
                key={level}
                onClick={() => setPriority(level)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  priority === level
                    ? 'bg-red-100 text-red-700 border-2 border-red-500'
                    : 'bg-[var(--background-primary)] text-[var(--text-muted)] border-2 border-[var(--border-color-accent)] hover:border-[var(--border-color)]'
                }`}
              >
                {level === 'none' ? 'None' : level}
              </button>
            ))}
          </div>
        </div>

        {/* Assignees */}
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-2">Assignees</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {assignedTo.map(member => (
              <div key={member._id} className="flex items-center gap-2 bg-[var(--background-primary)] border border-[var(--border-color-accent)] px-3 py-1.5 rounded-lg">
                <UserAvatar user={member} size="xs" />
                <span className="text-sm font-medium text-[var(--text)]">{member.firstName} {member.lastName}</span>
                <button
                  onClick={() => toggleUserAssignment(member)}
                  className="text-[var(--text-muted)] hover:text-red-500"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <div className="relative" ref={memberSearchRef}>
            <input
              type="text"
              placeholder="Search team members..."
              value={searchMember}
              onChange={(e) => {
                setSearchMember(e.target.value);
                setShowMemberSearch(true);
              }}
              onFocus={() => setShowMemberSearch(true)}
              className="w-full px-4 py-2 bg-[var(--background-primary)] border border-[var(--border-color-accent)] text-[var(--text)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200"
            />
            {showMemberSearch && filteredMembers.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-[var(--background-modal)] border border-[var(--border-color-accent)] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredMembers.map(member => (
                  <button
                    key={member._id}
                    onClick={() => {
                      toggleUserAssignment(member);
                      setSearchMember('');
                      setShowMemberSearch(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[var(--background-primary)] transition-colors"
                  >
                    <UserAvatar user={member} size="sm" />
                    <span className="text-sm font-medium text-[var(--text)]">{member.firstName} {member.lastName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Labels */}
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-2">Labels</label>
          <LabelPicker
            projectId={projectId}
            selectedLabels={labels}
            onLabelsChange={setLabels}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description..."
            rows={4}
            className="w-full px-4 py-2 bg-[var(--background-primary)] border border-[var(--border-color-accent)] text-[var(--text)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200 resize-none"
          />
        </div>

    </div>
    </Modal>
  );
};

export default SubtaskDetailModal;
