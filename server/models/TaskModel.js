import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
    {
       project_id: {type: mongoose.Schema.Types.ObjectId, ref: 'project'},
       title: {type: String, required: true},
       description: {type: String},
       status: {type: String},
       priority: {type: String},
       assigned_to: [{type: mongoose.Schema.Types.ObjectId, ref: 'user'}],
       due_date: {type: Date},
       start_date: {type: Date}
    }, {timestamps: true}
);


const Task = mongoose.model('Task', taskSchema);

export default Task;

