import mongoose from "mongoose";
// TODO: LEARN MONGOOSE SCHEMA 
// https://mongoosejs.com/ READ THE DOCS


const projectSchema = new mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String},
    owner: {type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true},
    users: [{type: mongoose.Schema.Types.ObjectId, ref: 'user'}],
    tasks: [{type: mongoose.Schema.Types.ObjectId, ref:'task',  default: []}],
    columns: [{type: mongoose.Schema.Types.ObjectId, ref:'column',  default: []}],
    startDate: {type: Date},
    endDate: {type: Date},
}, {timestamps: true});


const Project = mongoose.model('project', projectSchema);

export default Project;