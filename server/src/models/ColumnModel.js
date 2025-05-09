import mongoose from "mongoose";
// TODO: LEARN MONGOOSE SCHEMA 
// https://mongoosejs.com/ READ THE DOCS


const columnSchema = new mongoose.Schema({
    title: {type: String, required: true},
    projectId: {type: mongoose.Schema.Types.ObjectId, ref: 'project', required: true},
    tasks: [{type: mongoose.Schema.Types.ObjectId, ref:'task',  default: []}],
    position: { type: Number, required: true}, // Position is the order of the column from left to right
    isDefault: {type: Boolean, default: false}, // Columns created should not set this value.  
}, {timestamps: true});


const Column = mongoose.model('column', columnSchema);

export default Column;