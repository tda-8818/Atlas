import Sprint from '../models/SprintModel.js';
import Project from '../models/ProjectModel.js';
import Task from '../models/TaskModel.js';

// Get all sprints for a project
export const getProjectSprints = async (req, res) => {
    try {
        const { projectId } = req.params;

        // Verify user has access to project
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const userId = req.user._id.toString();
        const isOwner = project.owner.toString() === userId;
        const isMember = project.users.some(u => u.toString() === userId);

        if (!isOwner && !isMember) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const sprints = await Sprint.find({ projectId }).sort({ startDate: -1 });
        res.status(200).json(sprints);
    } catch (error) {
        console.error('Error fetching project sprints:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get a single sprint with its tasks
export const getSprint = async (req, res) => {
    try {
        const { sprintId } = req.params;

        const sprint = await Sprint.findById(sprintId);
        if (!sprint) {
            return res.status(404).json({ message: 'Sprint not found' });
        }

        // Verify user has access to project
        const project = await Project.findById(sprint.projectId);
        if (!project) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const userId = req.user._id.toString();
        const isOwner = project.owner.toString() === userId;
        const isMember = project.users.some(u => u.toString() === userId);

        if (!isOwner && !isMember) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Get tasks in this sprint
        const tasks = await Task.find({ sprintId })
            .populate('assignedTo', 'firstName lastName email profilePicture')
            .populate('labels');

        res.status(200).json({ sprint, tasks });
    } catch (error) {
        console.error('Error fetching sprint:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Create a new sprint
export const createSprint = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { name, goal, startDate, endDate, capacity } = req.body;

        // Verify user has access to project
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const userId = req.user._id.toString();
        const isOwner = project.owner.toString() === userId;
        const isMember = project.users.some(u => u.toString() === userId);

        if (!isOwner && !isMember) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Validate dates
        if (new Date(startDate) >= new Date(endDate)) {
            return res.status(400).json({ message: 'End date must be after start date' });
        }

        const sprint = await Sprint.create({
            name,
            goal: goal || '',
            projectId,
            startDate,
            endDate,
            capacity: capacity || 0
        });

        res.status(201).json(sprint);
    } catch (error) {
        console.error('Error creating sprint:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update a sprint
export const updateSprint = async (req, res) => {
    try {
        const { sprintId } = req.params;
        const { name, goal, startDate, endDate, status, capacity } = req.body;

        const sprint = await Sprint.findById(sprintId);
        if (!sprint) {
            return res.status(404).json({ message: 'Sprint not found' });
        }

        // Verify user has access to project
        const project = await Project.findById(sprint.projectId);
        if (!project) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const userId = req.user._id.toString();
        const isOwner = project.owner.toString() === userId;
        const isMember = project.users.some(u => u.toString() === userId);

        if (!isOwner && !isMember) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Validate dates if being updated
        if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
            return res.status(400).json({ message: 'End date must be after start date' });
        }

        if (name) sprint.name = name;
        if (goal !== undefined) sprint.goal = goal;
        if (startDate) sprint.startDate = startDate;
        if (endDate) sprint.endDate = endDate;
        if (status) sprint.status = status;
        if (capacity !== undefined) sprint.capacity = capacity;

        await sprint.save();
        res.status(200).json(sprint);
    } catch (error) {
        console.error('Error updating sprint:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete a sprint
export const deleteSprint = async (req, res) => {
    try {
        const { sprintId } = req.params;

        const sprint = await Sprint.findById(sprintId);
        if (!sprint) {
            return res.status(404).json({ message: 'Sprint not found' });
        }

        // Verify user has access to project
        const project = await Project.findById(sprint.projectId);
        if (!project) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const userId = req.user._id.toString();
        const isOwner = project.owner.toString() === userId;
        const isMember = project.users.some(u => u.toString() === userId);

        if (!isOwner && !isMember) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Remove sprint reference from all tasks
        await Task.updateMany(
            { sprintId },
            { $set: { sprintId: null } }
        );

        await Sprint.findByIdAndDelete(sprintId);

        res.status(200).json({ message: 'Sprint deleted successfully' });
    } catch (error) {
        console.error('Error deleting sprint:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Start a sprint (set status to active)
export const startSprint = async (req, res) => {
    try {
        const { sprintId } = req.params;

        const sprint = await Sprint.findById(sprintId);
        if (!sprint) {
            return res.status(404).json({ message: 'Sprint not found' });
        }

        // Verify user has access to project
        const project = await Project.findById(sprint.projectId);
        if (!project) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const userId = req.user._id.toString();
        const isOwner = project.owner.toString() === userId;
        const isMember = project.users.some(u => u.toString() === userId);

        if (!isOwner && !isMember) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Check if there's already an active sprint
        const activeSprint = await Sprint.findOne({
            projectId: sprint.projectId,
            status: 'active',
            _id: { $ne: sprintId }
        });

        if (activeSprint) {
            return res.status(400).json({ message: 'Another sprint is already active. Complete it first.' });
        }

        sprint.status = 'active';
        await sprint.save();

        res.status(200).json(sprint);
    } catch (error) {
        console.error('Error starting sprint:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Complete a sprint
export const completeSprint = async (req, res) => {
    try {
        const { sprintId } = req.params;

        const sprint = await Sprint.findById(sprintId);
        if (!sprint) {
            return res.status(404).json({ message: 'Sprint not found' });
        }

        // Verify user has access to project
        const project = await Project.findById(sprint.projectId);
        if (!project) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const userId = req.user._id.toString();
        const isOwner = project.owner.toString() === userId;
        const isMember = project.users.some(u => u.toString() === userId);

        if (!isOwner && !isMember) {
            return res.status(403).json({ message: 'Access denied' });
        }

        sprint.status = 'completed';
        await sprint.save();

        res.status(200).json(sprint);
    } catch (error) {
        console.error('Error completing sprint:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get sprint statistics
export const getSprintStats = async (req, res) => {
    try {
        const { sprintId } = req.params;

        const sprint = await Sprint.findById(sprintId);
        if (!sprint) {
            return res.status(404).json({ message: 'Sprint not found' });
        }

        // Verify user has access to project
        const project = await Project.findById(sprint.projectId);
        if (!project) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const userId = req.user._id.toString();
        const isOwner = project.owner.toString() === userId;
        const isMember = project.users.some(u => u.toString() === userId);

        if (!isOwner && !isMember) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Get tasks in this sprint
        const tasks = await Task.find({ sprintId });

        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === true).length;
        const totalPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
        const completedPoints = tasks
            .filter(t => t.status === true)
            .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

        const stats = {
            totalTasks,
            completedTasks,
            totalPoints,
            completedPoints,
            remainingPoints: totalPoints - completedPoints,
            capacity: sprint.capacity,
            completionPercentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
            pointsCompletionPercentage: totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0
        };

        res.status(200).json(stats);
    } catch (error) {
        console.error('Error fetching sprint stats:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
