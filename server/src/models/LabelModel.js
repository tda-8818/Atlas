import mongoose from "mongoose";

const labelSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        color: {
            type: String,
            required: true,
            default: '#3B82F6' // Default blue color
        },
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'project',
            required: true
        }
    },
    { timestamps: true }
);

// Ensure unique label names per project
labelSchema.index({ name: 1, projectId: 1 }, { unique: true });

const Label = mongoose.model('label', labelSchema);

export default Label;
