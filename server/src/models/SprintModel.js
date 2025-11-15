import mongoose from "mongoose";

const sprintSchema = new mongoose.Schema({
    name: { type: String, required: true },
    goal: { type: String },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'project', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
        type: String,
        enum: ['planned', 'active', 'completed'],
        default: 'planned'
    },
    // Track velocity and capacity
    capacity: { type: Number, default: 0 }, // Total story points the team can handle
}, { timestamps: true });

const Sprint = mongoose.model('sprint', sprintSchema);

export default Sprint;
