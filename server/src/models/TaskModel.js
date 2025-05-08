import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
    {
       projectId: {type: mongoose.Schema.Types.ObjectId, ref: 'project'},
       title: {type: String, required: true},
       description: {type: String, default: ""},
       status: {type: String, default: ""},
       priority: {type: String, default: ""},
       assignedTo: [{type: mongoose.Schema.Types.ObjectId, ref: 'user'}],
       dueDate: {type: Date},
       startDate: {type: Date},
       subtasks: [{type: mongoose.Schema.Types.ObjectId, ref:'task',  default: []}],
    }, {timestamps: true}
);


const Task = mongoose.model('task', taskSchema);

export default Task;

