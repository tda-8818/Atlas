import mongoose from "mongoose";

const subtaskSchema = new mongoose.Schema(
    {
       parentTaskId: {type: mongoose.Schema.Types.ObjectId, ref: 'task', required: true},
       title: {type: String, required: true},
       status: {type: Boolean, default: false}, //completed or not completed
       priority: {type: String, default: "None"},
       assignedTo: [{type: mongoose.Schema.Types.ObjectId, ref: 'user', default: []}],
    }, {timestamps: true}
);


const Subtask = mongoose.model('subtask', subtaskSchema);

export default Subtask;

