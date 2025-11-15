import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGetProjectByIdQuery, useGetProjectTasksQuery } from '../redux/slices/projectSlice';
import { useUpdateTaskMutation } from '../redux/slices/taskSlice';
import {
    useGetProjectSprintsQuery,
    useCreateSprintMutation,
    useUpdateSprintMutation,
    useDeleteSprintMutation,
    useStartSprintMutation,
    useCompleteSprintMutation
} from '../redux/slices/sprintSlice';
import { TaskTypeIcon } from '../utils/taskTypeUtils';
import { FaPlus, FaPlay, FaCheck, FaTrash, FaEdit, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import AddTaskModal from '../components/modals/AddTaskModal';

const Backlog = () => {
    const { id: projectId } = useParams();
    const { data: project } = useGetProjectByIdQuery(projectId);
    const { data: allTasks = [] } = useGetProjectTasksQuery(projectId);
    const { data: sprints = [] } = useGetProjectSprintsQuery(projectId);

    const [createSprint] = useCreateSprintMutation();
    const [updateSprint] = useUpdateSprintMutation();
    const [deleteSprint] = useDeleteSprintMutation();
    const [startSprint] = useStartSprintMutation();
    const [completeSprint] = useCompleteSprintMutation();
    const [updateTask] = useUpdateTaskMutation();

    const [showCreateSprint, setShowCreateSprint] = useState(false);
    const [editingSprint, setEditingSprint] = useState(null);
    const [expandedSprints, setExpandedSprints] = useState({});
    const [draggedTask, setDraggedTask] = useState(null);

    const [sprintForm, setSprintForm] = useState({
        name: '',
        goal: '',
        startDate: '',
        endDate: '',
        capacity: 0
    });

    const [showAddTask, setShowAddTask] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    // Separate tasks by sprint
    const backlogTasks = allTasks.filter(task => !task.sprintId);
    const sprintTasks = (sprintId) => allTasks.filter(task => task.sprintId === sprintId);

    // Auto-expand active sprint
    useEffect(() => {
        const activeSprint = sprints.find(s => s.status === 'active');
        if (activeSprint && !expandedSprints[activeSprint._id]) {
            setExpandedSprints(prev => ({ ...prev, [activeSprint._id]: true }));
        }
    }, [sprints]);

    const handleCreateSprint = async () => {
        try {
            await createSprint({ projectId, ...sprintForm }).unwrap();
            setShowCreateSprint(false);
            setSprintForm({ name: '', goal: '', startDate: '', endDate: '', capacity: 0 });
        } catch (error) {
            console.error('Error creating sprint:', error);
            alert('Failed to create sprint: ' + (error.data?.message || 'Unknown error'));
        }
    };

    const handleUpdateSprint = async () => {
        try {
            await updateSprint({ sprintId: editingSprint._id, ...sprintForm }).unwrap();
            setEditingSprint(null);
            setSprintForm({ name: '', goal: '', startDate: '', endDate: '', capacity: 0 });
        } catch (error) {
            console.error('Error updating sprint:', error);
            alert('Failed to update sprint: ' + (error.data?.message || 'Unknown error'));
        }
    };

    const handleDeleteSprint = async (sprintId) => {
        if (window.confirm('Are you sure you want to delete this sprint? Tasks will be moved back to backlog.')) {
            try {
                await deleteSprint(sprintId).unwrap();
            } catch (error) {
                console.error('Error deleting sprint:', error);
                alert('Failed to delete sprint: ' + (error.data?.message || 'Unknown error'));
            }
        }
    };

    const handleStartSprint = async (sprintId) => {
        try {
            await startSprint(sprintId).unwrap();
        } catch (error) {
            console.error('Error starting sprint:', error);
            alert('Failed to start sprint: ' + (error.data?.message || 'Unknown error'));
        }
    };

    const handleCompleteSprint = async (sprintId) => {
        if (window.confirm('Are you sure you want to complete this sprint?')) {
            try {
                await completeSprint(sprintId).unwrap();
            } catch (error) {
                console.error('Error completing sprint:', error);
                alert('Failed to complete sprint: ' + (error.data?.message || 'Unknown error'));
            }
        }
    };

    const handleDragStart = (task) => {
        setDraggedTask(task);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDropOnSprint = async (sprintId) => {
        if (draggedTask) {
            try {
                await updateTask({
                    id: draggedTask._id,
                    sprintId: sprintId
                }).unwrap();
                setDraggedTask(null);
            } catch (error) {
                console.error('Error moving task to sprint:', error);
            }
        }
    };

    const handleDropOnBacklog = async () => {
        if (draggedTask) {
            try {
                await updateTask({
                    id: draggedTask._id,
                    sprintId: null
                }).unwrap();
                setDraggedTask(null);
            } catch (error) {
                console.error('Error moving task to backlog:', error);
            }
        }
    };

    const toggleSprintExpand = (sprintId) => {
        setExpandedSprints(prev => ({
            ...prev,
            [sprintId]: !prev[sprintId]
        }));
    };

    const startEditSprint = (sprint) => {
        setEditingSprint(sprint);
        setSprintForm({
            name: sprint.name,
            goal: sprint.goal || '',
            startDate: sprint.startDate ? new Date(sprint.startDate).toISOString().split('T')[0] : '',
            endDate: sprint.endDate ? new Date(sprint.endDate).toISOString().split('T')[0] : '',
            capacity: sprint.capacity || 0
        });
    };

    const calculateSprintStats = (sprint) => {
        const tasks = sprintTasks(sprint._id);
        const totalPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
        const completedPoints = tasks.filter(t => t.status).reduce((sum, t) => sum + (t.storyPoints || 0), 0);
        const completedTasks = tasks.filter(t => t.status).length;

        return {
            totalTasks: tasks.length,
            completedTasks,
            totalPoints,
            completedPoints,
            completion: tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0
        };
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const TaskCard = ({ task, isDraggable = true }) => (
        <div
            draggable={isDraggable}
            onDragStart={() => handleDragStart(task)}
            onClick={() => setSelectedTask(task)}
            className={`p-3 bg-[var(--background)] border border-[var(--border-color-accent)] rounded-lg cursor-pointer hover:shadow-md transition-all ${
                task.status ? 'opacity-60' : ''
            }`}
        >
            <div className="flex items-start gap-2">
                <TaskTypeIcon type={task.taskType || 'task'} size="sm" />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        {task.priority && task.priority !== 'none' && (
                            <span className="text-xs font-bold text-red-500">{task.priority}</span>
                        )}
                        <div className={`text-sm font-medium truncate ${task.status ? 'line-through text-gray-400' : ''}`}>
                            {task.title}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        {task.labels && task.labels.length > 0 && (
                            <div className="flex gap-1">
                                {task.labels.slice(0, 2).map(label => (
                                    <span
                                        key={label._id}
                                        className="inline-block px-2 py-0.5 rounded text-xs text-white"
                                        style={{ backgroundColor: label.color }}
                                    >
                                        {label.name}
                                    </span>
                                ))}
                                {task.labels.length > 2 && (
                                    <span className="text-xs text-[var(--text-muted)]">+{task.labels.length - 2}</span>
                                )}
                            </div>
                        )}
                        {task.storyPoints > 0 && (
                            <span className="text-xs text-[var(--text-muted)] font-semibold">
                                {task.storyPoints} pts
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const SprintCard = ({ sprint }) => {
        const stats = calculateSprintStats(sprint);
        const tasks = sprintTasks(sprint._id);
        const isExpanded = expandedSprints[sprint._id];

        const statusColors = {
            planned: 'bg-gray-100 text-gray-700',
            active: 'bg-green-100 text-green-700',
            completed: 'bg-blue-100 text-blue-700'
        };

        return (
            <div
                className="mb-4 bg-[var(--background-modal)] border-2 border-[var(--border-color)] rounded-lg overflow-hidden"
                onDragOver={handleDragOver}
                onDrop={() => handleDropOnSprint(sprint._id)}
            >
                <div className="p-4 bg-[var(--background-primary)] border-b border-[var(--border-color-accent)]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                            <button
                                onClick={() => toggleSprintExpand(sprint._id)}
                                className="text-[var(--text-muted)] hover:text-[var(--text)]"
                            >
                                {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                            </button>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-lg font-semibold text-[var(--text)]">{sprint.name}</h3>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[sprint.status]}`}>
                                        {sprint.status.toUpperCase()}
                                    </span>
                                </div>
                                {sprint.goal && (
                                    <p className="text-sm text-[var(--text-muted)] mb-2">{sprint.goal}</p>
                                )}
                                <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                                    <span>{formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}</span>
                                    <span>{stats.totalTasks} tasks</span>
                                    <span>{stats.totalPoints} points</span>
                                    {sprint.capacity > 0 && <span>Capacity: {sprint.capacity}</span>}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {sprint.status === 'planned' && (
                                <button
                                    onClick={() => handleStartSprint(sprint._id)}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                                >
                                    <FaPlay className="text-xs" />
                                    Start
                                </button>
                            )}
                            {sprint.status === 'active' && (
                                <button
                                    onClick={() => handleCompleteSprint(sprint._id)}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                                >
                                    <FaCheck />
                                    Complete
                                </button>
                            )}
                            <button
                                onClick={() => startEditSprint(sprint)}
                                className="p-2 text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors"
                            >
                                <FaEdit />
                            </button>
                            <button
                                onClick={() => handleDeleteSprint(sprint._id)}
                                className="p-2 text-[var(--text-muted)] hover:text-red-500 transition-colors"
                            >
                                <FaTrash />
                            </button>
                        </div>
                    </div>
                    {stats.totalTasks > 0 && (
                        <div className="mt-3">
                            <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1">
                                <span>{stats.completedTasks}/{stats.totalTasks} tasks completed</span>
                                <span>{stats.completion}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-[var(--color-primary)] h-2 rounded-full transition-all"
                                    style={{ width: `${stats.completion}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
                {isExpanded && (
                    <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
                        {tasks.length === 0 ? (
                            <p className="text-center text-[var(--text-muted)] py-8">
                                Drag tasks here or drop them from the backlog
                            </p>
                        ) : (
                            tasks.map(task => <TaskCard key={task._id} task={task} />)
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="p-4 sm:p-6 bg-[var(--background-primary)] min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--text)]">{project?.title} - Backlog</h1>
                        <p className="text-sm text-[var(--text-muted)] mt-1">
                            Manage your sprints and product backlog
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateSprint(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors"
                    >
                        <FaPlus />
                        Create Sprint
                    </button>
                </div>

                {/* Sprints Section */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-[var(--text)] mb-4">Sprints</h2>
                    {sprints.length === 0 ? (
                        <div className="text-center py-12 bg-[var(--background)] border border-[var(--border-color-accent)] rounded-lg">
                            <p className="text-[var(--text-muted)] mb-4">No sprints yet. Create your first sprint to get started!</p>
                            <button
                                onClick={() => setShowCreateSprint(true)}
                                className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-accent-hover)]"
                            >
                                Create Sprint
                            </button>
                        </div>
                    ) : (
                        sprints
                            .slice()
                            .sort((a, b) => {
                                const statusOrder = { active: 0, planned: 1, completed: 2 };
                                return statusOrder[a.status] - statusOrder[b.status];
                            })
                            .map(sprint => <SprintCard key={sprint._id} sprint={sprint} />)
                    )}
                </div>

                {/* Backlog Section */}
                <div
                    onDragOver={handleDragOver}
                    onDrop={handleDropOnBacklog}
                    className="bg-[var(--background-modal)] border-2 border-[var(--border-color)] rounded-lg p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-semibold text-[var(--text)]">Product Backlog</h2>
                            <p className="text-sm text-[var(--text-muted)]">{backlogTasks.length} tasks</p>
                        </div>
                        <button
                            onClick={() => setShowAddTask(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-accent-hover)]"
                        >
                            <FaPlus />
                            Add Task
                        </button>
                    </div>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {backlogTasks.length === 0 ? (
                            <p className="text-center text-[var(--text-muted)] py-8">
                                No tasks in backlog. Create your first task!
                            </p>
                        ) : (
                            backlogTasks.map(task => <TaskCard key={task._id} task={task} />)
                        )}
                    </div>
                </div>
            </div>

            {/* Sprint Create/Edit Modal */}
            {(showCreateSprint || editingSprint) && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[var(--background-modal)] rounded-lg max-w-md w-full p-6">
                        <h3 className="text-xl font-semibold text-[var(--text)] mb-4">
                            {editingSprint ? 'Edit Sprint' : 'Create Sprint'}
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                                    Sprint Name *
                                </label>
                                <input
                                    type="text"
                                    value={sprintForm.name}
                                    onChange={(e) => setSprintForm({ ...sprintForm, name: e.target.value })}
                                    placeholder="e.g., Sprint 1"
                                    className="w-full px-4 py-2 bg-[var(--background-primary)] border border-[var(--border-color-accent)] text-[var(--text)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                                    Sprint Goal
                                </label>
                                <textarea
                                    value={sprintForm.goal}
                                    onChange={(e) => setSprintForm({ ...sprintForm, goal: e.target.value })}
                                    placeholder="What do you want to achieve in this sprint?"
                                    rows={3}
                                    className="w-full px-4 py-2 bg-[var(--background-primary)] border border-[var(--border-color-accent)] text-[var(--text)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text)] mb-2">
                                        Start Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={sprintForm.startDate}
                                        onChange={(e) => setSprintForm({ ...sprintForm, startDate: e.target.value })}
                                        className="w-full px-4 py-2 bg-[var(--background-primary)] border border-[var(--border-color-accent)] text-[var(--text)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text)] mb-2">
                                        End Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={sprintForm.endDate}
                                        onChange={(e) => setSprintForm({ ...sprintForm, endDate: e.target.value })}
                                        className="w-full px-4 py-2 bg-[var(--background-primary)] border border-[var(--border-color-accent)] text-[var(--text)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                                    Capacity (Story Points)
                                </label>
                                <input
                                    type="number"
                                    value={sprintForm.capacity}
                                    onChange={(e) => setSprintForm({ ...sprintForm, capacity: Number(e.target.value) })}
                                    min="0"
                                    className="w-full px-4 py-2 bg-[var(--background-primary)] border border-[var(--border-color-accent)] text-[var(--text)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowCreateSprint(false);
                                    setEditingSprint(null);
                                    setSprintForm({ name: '', goal: '', startDate: '', endDate: '', capacity: 0 });
                                }}
                                className="px-4 py-2 border border-[var(--border-color-accent)] text-[var(--text)] rounded-lg hover:bg-[var(--background-primary)]"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={editingSprint ? handleUpdateSprint : handleCreateSprint}
                                disabled={!sprintForm.name || !sprintForm.startDate || !sprintForm.endDate}
                                className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {editingSprint ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Task Modal */}
            {(showAddTask || selectedTask) && (
                <AddTaskModal
                    show={showAddTask || !!selectedTask}
                    onCancel={() => {
                        setShowAddTask(false);
                        setSelectedTask(null);
                    }}
                    onAddTask={async (taskData) => {
                        setShowAddTask(false);
                    }}
                    onEdit={async (taskData) => {
                        setSelectedTask(null);
                    }}
                    teamMembers={project?.users || []}
                    initialValues={selectedTask}
                    projectId={projectId}
                />
            )}
        </div>
    );
};

export default Backlog;
