import Label from '../models/LabelModel.js';
import Project from '../models/ProjectModel.js';

// Get all labels for a project
export const getProjectLabels = async (req, res) => {
    try {
        const { projectId } = req.params;

        // Verify user has access to project
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Check if user is owner or member of the project
        const userId = req.user._id.toString();
        const isOwner = project.owner.toString() === userId;
        const isMember = project.users.some(u => u.toString() === userId);

        if (!isOwner && !isMember) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const labels = await Label.find({ projectId }).sort({ name: 1 });
        res.status(200).json(labels);
    } catch (error) {
        console.error('Error fetching project labels:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Create a new label
export const createLabel = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { name, color } = req.body;

        // Verify user has access to project
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Check if user is owner or member of the project
        const userId = req.user._id.toString();
        const isOwner = project.owner.toString() === userId;
        const isMember = project.users.some(u => u.toString() === userId);

        if (!isOwner && !isMember) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Check if label with same name already exists in project
        const existingLabel = await Label.findOne({ name, projectId });
        if (existingLabel) {
            return res.status(400).json({ message: 'Label with this name already exists in project' });
        }

        const label = await Label.create({
            name,
            color: color || '#3B82F6',
            projectId
        });

        res.status(201).json(label);
    } catch (error) {
        console.error('Error creating label:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update a label
export const updateLabel = async (req, res) => {
    try {
        const { labelId } = req.params;
        const { name, color } = req.body;

        const label = await Label.findById(labelId);
        if (!label) {
            return res.status(404).json({ message: 'Label not found' });
        }

        // Verify user has access to project
        const project = await Project.findById(label.projectId);
        if (!project) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const userId = req.user._id.toString();
        const isOwner = project.owner.toString() === userId;
        const isMember = project.users.some(u => u.toString() === userId);

        if (!isOwner && !isMember) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Check if new name conflicts with existing label
        if (name && name !== label.name) {
            const existingLabel = await Label.findOne({
                name,
                projectId: label.projectId,
                _id: { $ne: labelId }
            });
            if (existingLabel) {
                return res.status(400).json({ message: 'Label with this name already exists in project' });
            }
        }

        if (name) label.name = name;
        if (color) label.color = color;

        await label.save();
        res.status(200).json(label);
    } catch (error) {
        console.error('Error updating label:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete a label
export const deleteLabel = async (req, res) => {
    try {
        const { labelId } = req.params;

        const label = await Label.findById(labelId);
        if (!label) {
            return res.status(404).json({ message: 'Label not found' });
        }

        // Verify user has access to project
        const project = await Project.findById(label.projectId);
        if (!project) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const userId = req.user._id.toString();
        const isOwner = project.owner.toString() === userId;
        const isMember = project.users.some(u => u.toString() === userId);

        if (!isOwner && !isMember) {
            return res.status(403).json({ message: 'Access denied' });
        }

        await Label.findByIdAndDelete(labelId);

        // Note: Tasks will still have this label ID in their labels array
        // You might want to clean this up in a real application

        res.status(200).json({ message: 'Label deleted successfully' });
    } catch (error) {
        console.error('Error deleting label:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
