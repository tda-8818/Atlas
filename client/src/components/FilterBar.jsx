import { useState, useRef, useEffect } from 'react';
import { FaSearch, FaTimes, FaFilter } from 'react-icons/fa';
import { TASK_TYPES } from '../utils/taskTypeUtils';
import UserAvatar from './avatar/UserAvatar';

const priorityLevels = ['!', '!!', '!!!'];

const FilterBar = ({
  onFilterChange,
  teamMembers = [],
  availableLabels = [],
  currentUserId
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPriorities, setSelectedPriorities] = useState([]);
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [selectedAssignees, setSelectedAssignees] = useState([]);
  const [selectedTaskTypes, setSelectedTaskTypes] = useState([]);
  const [showCompleted, setShowCompleted] = useState(true);
  const [quickFilter, setQuickFilter] = useState(null);

  const filterRef = useRef(null);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Apply filters whenever any filter changes
  useEffect(() => {
    const filters = {
      searchQuery,
      priorities: selectedPriorities,
      labels: selectedLabels,
      assignees: selectedAssignees,
      taskTypes: selectedTaskTypes,
      showCompleted,
      quickFilter
    };
    onFilterChange(filters);
  }, [searchQuery, selectedPriorities, selectedLabels, selectedAssignees, selectedTaskTypes, showCompleted, quickFilter]);

  const togglePriority = (priority) => {
    setQuickFilter(null);
    setSelectedPriorities(prev =>
      prev.includes(priority)
        ? prev.filter(p => p !== priority)
        : [...prev, priority]
    );
  };

  const toggleLabel = (labelId) => {
    setQuickFilter(null);
    setSelectedLabels(prev =>
      prev.includes(labelId)
        ? prev.filter(l => l !== labelId)
        : [...prev, labelId]
    );
  };

  const toggleAssignee = (userId) => {
    setQuickFilter(null);
    setSelectedAssignees(prev =>
      prev.includes(userId)
        ? prev.filter(a => a !== userId)
        : [...prev, userId]
    );
  };

  const toggleTaskType = (type) => {
    setQuickFilter(null);
    setSelectedTaskTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedPriorities([]);
    setSelectedLabels([]);
    setSelectedAssignees([]);
    setSelectedTaskTypes([]);
    setShowCompleted(true);
    setQuickFilter(null);
  };

  const applyQuickFilter = (filterType) => {
    clearAllFilters();
    setQuickFilter(filterType);

    if (filterType === 'myTasks' && currentUserId) {
      setSelectedAssignees([currentUserId]);
    } else if (filterType === 'highPriority') {
      setSelectedPriorities(['!!!']);
    } else if (filterType === 'unassigned') {
      setSelectedAssignees(['unassigned']);
    }
  };

  const activeFilterCount = selectedPriorities.length + selectedLabels.length +
    selectedAssignees.length + selectedTaskTypes.length + (showCompleted ? 0 : 1);

  return (
    <div className="mb-4 space-y-3">
      {/* Search and Quick Filters Row */}
      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <div className="flex-1 relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)]">
            <FaSearch className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-[var(--background-primary)] border border-[var(--border-color-accent)] text-[var(--text)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all duration-200 placeholder:text-[var(--text-muted)]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
            showFilters || activeFilterCount > 0
              ? 'bg-[var(--color-primary)] text-white'
              : 'bg-[var(--background-primary)] text-[var(--text)] border border-[var(--border-color-accent)] hover:bg-[var(--background-secondary)]'
          }`}
        >
          <FaFilter className="w-4 h-4" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs font-semibold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Quick Filter Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-[var(--text-muted)] mr-2">Quick filters:</span>
        <button
          onClick={() => applyQuickFilter('myTasks')}
          className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
            quickFilter === 'myTasks'
              ? 'bg-[var(--color-primary)] text-white'
              : 'bg-[var(--background-primary)] text-[var(--text)] border border-[var(--border-color-accent)] hover:bg-[var(--background-secondary)]'
          }`}
        >
          My Tasks
        </button>
        <button
          onClick={() => applyQuickFilter('highPriority')}
          className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
            quickFilter === 'highPriority'
              ? 'bg-[var(--color-primary)] text-white'
              : 'bg-[var(--background-primary)] text-[var(--text)] border border-[var(--border-color-accent)] hover:bg-[var(--background-secondary)]'
          }`}
        >
          High Priority
        </button>
        <button
          onClick={() => applyQuickFilter('unassigned')}
          className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
            quickFilter === 'unassigned'
              ? 'bg-[var(--color-primary)] text-white'
              : 'bg-[var(--background-primary)] text-[var(--text)] border border-[var(--border-color-accent)] hover:bg-[var(--background-secondary)]'
          }`}
        >
          Unassigned
        </button>
        {activeFilterCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="px-3 py-1.5 text-sm rounded-lg transition-all duration-200 bg-red-500/10 text-red-600 border border-red-500/30 hover:bg-red-500/20"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Advanced Filters Dropdown */}
      {showFilters && (
        <div
          ref={filterRef}
          className="bg-[var(--background-modal)] border-2 border-[var(--border-color)] rounded-lg shadow-2xl p-4 space-y-4"
        >
          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">
              Priority
            </label>
            <div className="flex gap-2">
              {priorityLevels.map(priority => (
                <button
                  key={priority}
                  onClick={() => togglePriority(priority)}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg border-2 transition-all duration-200 ${
                    selectedPriorities.includes(priority)
                      ? priority === '!!!'
                        ? 'bg-red-600 text-white border-red-700'
                        : priority === '!!'
                        ? 'bg-orange-600 text-white border-orange-700'
                        : 'bg-blue-600 text-white border-blue-700'
                      : priority === '!!!'
                        ? 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200'
                        : priority === '!!'
                        ? 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200'
                        : 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200'
                  }`}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>

          {/* Task Type Filter */}
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">
              Task Type
            </label>
            <div className="flex gap-2 flex-wrap">
              {Object.values(TASK_TYPES).map(type => (
                <button
                  key={type.value}
                  onClick={() => toggleTaskType(type.value)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border-2 transition-all duration-200 ${
                    selectedTaskTypes.includes(type.value)
                      ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                      : 'bg-[var(--background-primary)] text-[var(--text)] border-[var(--border-color-accent)] hover:bg-[var(--background-secondary)]'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Labels Filter */}
          {availableLabels.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2">
                Labels
              </label>
              <div className="flex gap-2 flex-wrap">
                {availableLabels.map(label => (
                  <button
                    key={label._id}
                    onClick={() => toggleLabel(label._id)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                      selectedLabels.includes(label._id)
                        ? 'ring-2 ring-offset-2 ring-[var(--color-primary)]'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: label.color,
                      color: 'white'
                    }}
                  >
                    {label.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Assignee Filter */}
          {teamMembers.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2">
                Assignee
              </label>
              <div className="flex gap-2 flex-wrap">
                {teamMembers.map(member => (
                  <button
                    key={member._id}
                    onClick={() => toggleAssignee(member._id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all duration-200 ${
                      selectedAssignees.includes(member._id)
                        ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)] text-[var(--text)]'
                        : 'bg-[var(--background-primary)] border-[var(--border-color-accent)] text-[var(--text)] hover:bg-[var(--background-secondary)]'
                    }`}
                  >
                    <UserAvatar user={member} size={5} />
                    <span className="text-sm">{member.firstName}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Show Completed Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)]">
            <label className="text-sm font-medium text-[var(--text)]">
              Show Completed Tasks
            </label>
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                showCompleted ? 'bg-[var(--color-primary)]' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  showCompleted ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
