import mongoose from "mongoose";
// TODO: LEARN MONGOOSE SCHEMA 
// https://mongoosejs.com/ READ THE DOCS


const projectSchema = new mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    users: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    tasks: [{type: mongoose.Schema.Types.ObjectId, ref:'Task',  default: []}],
    startDate: {type: Date},
    endDate: {type: Date},
    progress: {type: Number, default: 0}
}, {timestamps: true});


const Project = mongoose.model('Project', projectSchema);

export default Project;