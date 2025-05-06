import mongoose from "mongoose";
import Task from "./TaskModel.js";
// TODO: LEARN MONGOOSE SCHEMA 
// https://mongoosejs.com/ READ THE DOCS


const projectSchema = new mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    users: [{
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
        role: {type: String, enum: ['owner', 'member'], default: 'member'}
    }],
    tasks: [{type: mongoose.Schema.Types.ObjectId, ref:'task',  default: []}],
    daysLeft: {type: Number },
    progress: {type: Number, default: 0}
}, {timestamps: true});

const projectMemberSchema = new mongoose.Schema({
    projectId: {type: mongoose.Schema.Types.ObjectId, ref: 'project'},
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
    role: {type: String, enum: ['owner', 'member'], default: 'member'}
}, {timestamps: true});

const Project = mongoose.model('project', projectSchema);

export default Project;