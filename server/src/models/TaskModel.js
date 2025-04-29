import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
    {
       projectId: {type: mongoose.Schema.Types.ObjectId, ref: 'project'},
       title: {type: String, required: true},
       description: {type: String},
       status: {type: String},
       priority: {type: String},
       assignedTo: [{type: mongoose.Schema.Types.ObjectId, ref: 'user'}],
       dueDate: {type: Date},
       startDate: {type: Date},
       favourite_projects: [{type: mongoose.Schema.Types.ObjectId, ref:'task',  default: []}],
    }, {timestamps: true}
);


const Task = mongoose.model('Task', taskSchema);

export default Task;

