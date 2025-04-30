import mongoose from "mongoose";
import Task from "./TaskModel.js";
// TODO: LEARN MONGOOSE SCHEMA 
// https://mongoosejs.com/ READ THE DOCS


const projectSchema = new mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    project_admin_priveliges: [{type: mongoose.Schema.Types.ObjectId, ref:'user',  default: []}],
    users: [{type: mongoose.Schema.Types.ObjectId, ref:'user',  default: []}],
    tasks: [{type: mongoose.Schema.Types.ObjectId, ref:'task',  default: []}],
    daysLeft: {type: Number },
    progress: {type: Number, default: 0}
}, {timestamps: true});

// If a project is deleted from the database, also remove all related tasks within that project.

projectSchema.pre('deleteOne', {document: true, query: false}, async function (next) {
    try
    {
        await Task.deleteMany({task_id: this.id});
        next();
    } catch (error)
    {
        next(error);
    }

})

const Project = mongoose.model('project', projectSchema);

export default Project;