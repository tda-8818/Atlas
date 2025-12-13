import React, { useState, useEffect, useRef } from 'react';
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, eachDayOfInterval, isSameDay, differenceInDays, addMonths, subMonths, addWeeks, subWeeks, addQuarters, subQuarters } from 'date-fns';
import { TaskTypeIcon, getTaskTypeConfig } from '../utils/taskTypeUtils';
import UserAvatar from './avatar/UserAvatar';

const CustomGantt = ({ tasks = [], onTaskUpdate, onTaskClick, columns = [], sprints = [] }) => {
  const [viewMode, setViewMode] = useState('month'); // 'week', 'month', 'quarter'
  const [groupBy, setGroupBy] = useState('flat'); // 'flat', 'column', 'sprint', 'milestone'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragStartX, setDragStartX] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [expandedTasks, setExpandedTasks] = useState(new Set());
  const scrollContainerRef = useRef(null);
  const [isDraggingTimeline, setIsDraggingTimeline] = useState(false);
  const [timelineDragStart, setTimelineDragStart] = useState({ x: 0, scrollLeft: 0 });

  // Calculate date range based on view mode
  const getDateRange = () => {
    let start, end;

    switch (viewMode) {
      case 'week':
        start = startOfWeek(subWeeks(currentDate, 2));
        end = endOfWeek(addWeeks(currentDate, 2));
        break;
      case 'quarter':
        start = startOfQuarter(currentDate);
        end = endOfQuarter(addQuarters(currentDate, 1));
        break;
      case 'month':
      default:
        start = startOfMonth(subMonths(currentDate, 1));
        end = endOfMonth(addMonths(currentDate, 2));
        break;
    }

    return { start, end };
  };

  const { start: rangeStart, end: rangeEnd } = getDateRange();
  const days = eachDayOfInterval({ start: rangeStart, end: rangeEnd });
  const totalDays = days.length;

  // Column width based on view mode
  const getDayWidth = () => {
    switch (viewMode) {
      case 'week':
        return 80; // Wider for week view
      case 'quarter':
        return 20; // Narrower for quarter view
      case 'month':
      default:
        return 40;
    }
  };

  const dayWidth = getDayWidth();
  const taskListWidth = 300;
  const timelineWidth = totalDays * dayWidth;

  // Navigate timeline
  const navigateTimeline = (direction) => {
    switch (viewMode) {
      case 'week':
        setCurrentDate(direction === 'prev' ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1));
        break;
      case 'quarter':
        setCurrentDate(direction === 'prev' ? subQuarters(currentDate, 1) : addQuarters(currentDate, 1));
        break;
      case 'month':
      default:
        setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
        break;
    }
  };

  // Calculate task bar position and width
  const getTaskPosition = (task) => {
    if (!task.startDate || !task.dueDate) return null;

    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.dueDate);

    const startOffset = differenceInDays(taskStart, rangeStart);
    const duration = differenceInDays(taskEnd, taskStart) + 1;

    return {
      left: startOffset * dayWidth,
      width: Math.max(duration * dayWidth, dayWidth),
      startOffset,
      duration
    };
  };

  // Handle task bar drag
  const handleTaskMouseDown = (e, task) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    setDraggedTask(task);
    setDragStartX(e.clientX);
  };

  // Handle timeline drag scrolling
  const handleTimelineMouseDown = (e) => {
    if (e.button !== 0 || e.target.closest('.task-bar')) return;

    setIsDraggingTimeline(true);
    setTimelineDragStart({
      x: e.clientX,
      scrollLeft: scrollContainerRef.current.scrollLeft
    });
  };

  useEffect(() => {
    if (!draggedTask) return;

    const handleMouseMove = (e) => {
      if (!dragStartX) return;

      const deltaX = e.clientX - dragStartX;
      const daysMoved = Math.round(deltaX / dayWidth);

      if (daysMoved !== 0) {
        const newStartDate = addDays(new Date(draggedTask.startDate), daysMoved);
        const newDueDate = addDays(new Date(draggedTask.dueDate), daysMoved);

        if (onTaskUpdate) {
          onTaskUpdate({
            ...draggedTask,
            startDate: format(newStartDate, 'yyyy-MM-dd'),
            dueDate: format(newDueDate, 'yyyy-MM-dd')
          });
        }

        setDragStartX(e.clientX);
      }
    };

    const handleMouseUp = () => {
      setDraggedTask(null);
      setDragStartX(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggedTask, dragStartX, dayWidth, onTaskUpdate]);

  // Handle timeline drag scrolling
  useEffect(() => {
    if (!isDraggingTimeline) return;

    const handleMouseMove = (e) => {
      const deltaX = e.clientX - timelineDragStart.x;
      scrollContainerRef.current.scrollLeft = timelineDragStart.scrollLeft - deltaX;
    };

    const handleMouseUp = () => {
      setIsDraggingTimeline(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingTimeline, timelineDragStart]);

  // Group tasks based on groupBy setting
  const getGroupedTasks = () => {
    // Filter tasks with dates
    const validTasks = tasks.filter(task => task.startDate && task.dueDate);

    if (groupBy === 'flat') {
      return [{
        id: 'all',
        title: 'All Tasks',
        tasks: validTasks,
        type: 'flat'
      }];
    }

    if (groupBy === 'column') {
      const grouped = {};

      validTasks.forEach(task => {
        const columnId = task.columnId?._id || task.columnId || 'unassigned';
        const columnTitle = task.columnId?.title || columns.find(c => c.id === columnId)?.title || 'Unassigned';

        if (!grouped[columnId]) {
          grouped[columnId] = {
            id: columnId,
            title: columnTitle,
            tasks: [],
            type: 'column'
          };
        }
        grouped[columnId].tasks.push(task);
      });

      return Object.values(grouped);
    }

    if (groupBy === 'sprint') {
      const grouped = {};

      validTasks.forEach(task => {
        const sprintId = task.sprintId?._id || task.sprintId || 'backlog';
        const sprintTitle = task.sprintId?.name || sprints.find(s => s._id === sprintId)?.name || 'Backlog';

        if (!grouped[sprintId]) {
          grouped[sprintId] = {
            id: sprintId,
            title: sprintTitle,
            tasks: [],
            type: 'sprint'
          };
        }
        grouped[sprintId].tasks.push(task);
      });

      return Object.values(grouped);
    }

    if (groupBy === 'milestone') {
      const milestones = validTasks.filter(t => t.taskType === 'milestone');
      const grouped = milestones.map(milestone => ({
        id: milestone._id,
        title: milestone.title,
        task: milestone,
        tasks: validTasks.filter(t =>
          t.subtasks && Array.isArray(t.subtasks) &&
          t.subtasks.some(st => st._id === milestone._id || st === milestone._id)
        ),
        type: 'milestone'
      }));

      // Add ungrouped tasks
      const groupedTaskIds = new Set(grouped.flatMap(g => g.tasks.map(t => t._id)));
      const milestoneIds = new Set(milestones.map(m => m._id));
      const ungrouped = validTasks.filter(t => !groupedTaskIds.has(t._id) && !milestoneIds.has(t._id));

      if (ungrouped.length > 0) {
        grouped.push({
          id: 'ungrouped',
          title: 'Other Tasks',
          tasks: ungrouped,
          type: 'other'
        });
      }

      return grouped;
    }

    return [{
      id: 'all',
      title: 'All Tasks',
      tasks: validTasks,
      type: 'flat'
    }];
  };

  const groupedTasks = getGroupedTasks();

  // Toggle group expansion
  const toggleGroup = (groupId) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  // Toggle task expansion (for subtasks)
  const toggleTask = (taskId) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  // Build flat list with hierarchy
  const buildTaskList = () => {
    const list = [];
    let rowIndex = 0;

    groupedTasks.forEach(group => {
      const isGroupExpanded = expandedGroups.has(group.id) || groupBy === 'flat';

      // Add group header (except for flat view)
      if (groupBy !== 'flat') {
        list.push({
          type: 'group',
          id: group.id,
          title: group.title,
          count: group.tasks.length,
          groupType: group.type,
          task: group.task, // For milestone groups
          isExpanded: isGroupExpanded,
          rowIndex: rowIndex++
        });
      }

      // Add tasks if group is expanded
      if (isGroupExpanded) {
        group.tasks.forEach(task => {
          const hasSubtasks = task.subtasks && task.subtasks.length > 0;
          const isTaskExpanded = expandedTasks.has(task._id);

          list.push({
            type: 'task',
            task,
            hasSubtasks,
            isExpanded: isTaskExpanded,
            level: groupBy === 'flat' ? 0 : 1,
            rowIndex: rowIndex++
          });

          // Add subtasks if expanded
          if (hasSubtasks && isTaskExpanded) {
            task.subtasks.forEach(subtask => {
              // If subtask is a populated object
              if (subtask && subtask._id) {
                list.push({
                  type: 'task',
                  task: subtask,
                  hasSubtasks: false,
                  isExpanded: false,
                  level: groupBy === 'flat' ? 1 : 2,
                  isSubtask: true,
                  rowIndex: rowIndex++
                });
              }
            });
          }
        });
      }
    });

    return list;
  };

  const taskList = buildTaskList();

  // Calculate task positions for rendering
  const tasksToRender = taskList
    .filter(item => item.type === 'task')
    .map(item => ({
      ...item.task,
      position: getTaskPosition(item.task),
      rowIndex: item.rowIndex,
      level: item.level,
      isSubtask: item.isSubtask
    }))
    .filter(task => task.position !== null);

  return (
    <div className="flex flex-col h-full bg-[var(--background)] rounded-xl border border-gray-200/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/50 bg-white">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-800">Timeline</h2>

          {/* View mode selector */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {['Week', 'Month', 'Quarter'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode.toLowerCase())}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  viewMode === mode.toLowerCase()
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Group by selector */}
          <div className="flex items-center gap-2 ml-2">
            <span className="text-xs text-gray-500 font-medium">Group by:</span>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="flat">None</option>
              <option value="column">Column</option>
              <option value="sprint">Sprint</option>
              <option value="milestone">Milestone</option>
            </select>
          </div>
        </div>

        {/* Date navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateTimeline('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Today
          </button>

          <button
            onClick={() => navigateTimeline('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="flex-1 flex overflow-hidden">
        {/* Task List Column */}
        <div
          className="flex-shrink-0 border-r border-gray-200/50 bg-gray-50/50 overflow-y-auto"
          style={{ width: `${taskListWidth}px` }}
        >
          {/* Column Header */}
          <div className="sticky top-0 z-10 bg-gray-100 border-b border-gray-200/50 px-4 py-3">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Tasks</span>
          </div>

          {/* Task Rows */}
          {taskList.map((item) => {
            if (item.type === 'group') {
              const config = item.task ? getTaskTypeConfig(item.task.taskType) : null;

              return (
                <div
                  key={`group-${item.id}`}
                  className="flex items-center gap-2 px-4 py-3 border-b border-gray-200/50 bg-gray-100/50 hover:bg-gray-100 transition-colors cursor-pointer font-medium"
                  style={{ height: '56px' }}
                  onClick={() => toggleGroup(item.id)}
                >
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${item.isExpanded ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>

                  {item.task && <TaskTypeIcon type={item.task.taskType} size="sm" />}

                  <span className="text-sm text-gray-800 truncate flex-1">{item.title}</span>
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">{item.count}</span>
                </div>
              );
            }

            const { task, hasSubtasks, isExpanded, level, isSubtask } = item;
            const paddingLeft = level * 16 + 16;

            return (
              <div
                key={task._id}
                className={`flex items-center gap-3 px-4 py-3 border-b border-gray-200/30 hover:bg-white/50 transition-colors cursor-pointer ${
                  isSubtask ? 'bg-gray-50/30' : ''
                }`}
                style={{ height: '56px', paddingLeft: `${paddingLeft}px` }}
                onClick={() => onTaskClick && onTaskClick(task)}
              >
                {hasSubtasks && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTask(task._id);
                    }}
                    className="flex-shrink-0"
                  >
                    <svg
                      className={`w-3 h-3 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}

                <TaskTypeIcon type={task.taskType || 'task'} size="sm" />

                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium text-gray-900 truncate ${isSubtask ? 'text-gray-600' : ''}`}>
                    {task.title}
                  </div>
                  {task.assignedTo && task.assignedTo.length > 0 && (
                    <div className="flex -space-x-1 mt-1">
                      {task.assignedTo.slice(0, 3).map((user, idx) => (
                        <div key={user._id || idx} className="relative">
                          <UserAvatar user={user} size="xs" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {taskList.length === 0 && (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
              No tasks with dates
            </div>
          )}
        </div>

        {/* Timeline Area */}
        <div
          ref={scrollContainerRef}
          className={`flex-1 overflow-auto ${isDraggingTimeline ? 'cursor-grabbing' : 'cursor-grab'}`}
          onMouseDown={handleTimelineMouseDown}
        >
          <div style={{ minWidth: `${timelineWidth}px` }}>
            {/* Timeline Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200/50">
              {/* Month Labels */}
              <div className="flex border-b border-gray-200/30">
                {Array.from(new Set(days.map(day => format(day, 'MMM yyyy')))).map((month, idx) => {
                  const monthDays = days.filter(day => format(day, 'MMM yyyy') === month);
                  return (
                    <div
                      key={idx}
                      className="border-r border-gray-200/30 px-4 py-2"
                      style={{ width: `${monthDays.length * dayWidth}px` }}
                    >
                      <span className="text-sm font-semibold text-gray-700">{month}</span>
                    </div>
                  );
                })}
              </div>

              {/* Day Headers */}
              <div className="flex">
                {days.map((day, idx) => {
                  const isToday = isSameDay(day, new Date());
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                  return (
                    <div
                      key={idx}
                      className={`flex-shrink-0 border-r border-gray-200/30 px-2 py-2 text-center ${
                        isToday ? 'bg-blue-50' : isWeekend ? 'bg-gray-50' : ''
                      }`}
                      style={{ width: `${dayWidth}px` }}
                    >
                      {viewMode === 'quarter' ? (
                        <div className={`text-xs font-semibold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                          {format(day, 'd')}
                        </div>
                      ) : (
                        <>
                          <div className={`text-xs font-medium ${isToday ? 'text-blue-600' : 'text-gray-600'}`}>
                            {format(day, 'EEE')}
                          </div>
                          <div className={`text-sm font-semibold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                            {format(day, 'd')}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Task Bars */}
            <div className="relative" style={{ height: `${taskList.length * 56}px` }}>
              {/* Grid Lines */}
              {days.map((day, idx) => {
                const isToday = isSameDay(day, new Date());
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                return (
                  <div
                    key={idx}
                    className={`absolute top-0 bottom-0 border-r border-gray-200/30 ${
                      isToday ? 'bg-blue-50/30' : isWeekend ? 'bg-gray-50/30' : ''
                    }`}
                    style={{
                      left: `${idx * dayWidth}px`,
                      width: `${dayWidth}px`
                    }}
                  />
                );
              })}

              {/* Today Line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-20 pointer-events-none"
                style={{
                  left: `${differenceInDays(new Date(), rangeStart) * dayWidth + dayWidth / 2}px`
                }}
              />

              {/* Task Bars */}
              {tasksToRender.map((task) => {
                const config = getTaskTypeConfig(task.taskType || 'task');

                // Calculate progress based on subtasks or status
                let progress = 0;
                if (task.subtasks && task.subtasks.length > 0) {
                  // Calculate based on completed subtasks
                  const completedSubtasks = task.subtasks.filter(st => st.status === true).length;
                  progress = (completedSubtasks / task.subtasks.length) * 100;
                } else {
                  // Use task status (0% or 100%)
                  progress = task.status ? 100 : 0;
                }

                return (
                  <div
                    key={task._id}
                    className="task-bar absolute cursor-move group"
                    style={{
                      top: `${task.rowIndex * 56 + 8}px`,
                      left: `${task.position.left}px`,
                      width: `${task.position.width}px`,
                      height: '40px',
                      opacity: task.isSubtask ? 0.85 : 1,
                      zIndex: draggedTask?._id === task._id ? 30 : 10
                    }}
                    onMouseDown={(e) => handleTaskMouseDown(e, task)}
                  >
                    {/* Task bar container */}
                    <div
                      className="relative h-full rounded-md overflow-hidden border-2 transition-all group-hover:shadow-lg"
                      style={{
                        borderColor: config.color,
                        backgroundColor: 'white'
                      }}
                    >
                      {/* Progress fill */}
                      <div
                        className="absolute inset-0 transition-all"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: config.color,
                          opacity: 1
                        }}
                      />

                      {/* Content */}
                      <div className="relative h-full flex items-center justify-between px-3 py-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div style={{ color: progress > 50 ? 'white' : config.color }}>
                            <TaskTypeIcon type={task.taskType || 'task'} size="sm" />
                          </div>
                          <span
                            className="text-sm font-semibold truncate"
                            style={{ color: progress > 50 ? 'white' : config.color }}
                          >
                            {task.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {/* Progress percentage */}
                          {progress > 0 && progress < 100 && (
                            <span
                              className="text-xs font-bold px-1.5 py-0.5 rounded"
                              style={{
                                backgroundColor: progress > 50 ? 'rgba(255,255,255,0.2)' : config.color + '15',
                                color: progress > 50 ? 'white' : config.color
                              }}
                            >
                              {Math.round(progress)}%
                            </span>
                          )}

                          {/* Completion checkmark */}
                          {progress === 100 && (
                            <svg
                              className="w-4 h-4"
                              fill="white"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}

                          {/* Story points */}
                          {task.storyPoints > 0 && (
                            <span
                              className="text-xs font-bold px-1.5 py-0.5 rounded"
                              style={{
                                backgroundColor: progress > 50 ? 'rgba(255,255,255,0.2)' : config.color + '15',
                                color: progress > 50 ? 'white' : config.color
                              }}
                            >
                              {task.storyPoints}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Hover tooltip with dates */}
                      <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                        <div className="font-semibold mb-1">{task.title}</div>
                        <div className="text-gray-300">
                          {new Date(task.startDate).toLocaleDateString()} → {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                        <div className="text-gray-300">
                          Duration: {task.position.duration} {task.position.duration === 1 ? 'day' : 'days'}
                        </div>
                        {progress > 0 && (
                          <div className="text-gray-300">Progress: {Math.round(progress)}%</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomGantt;
