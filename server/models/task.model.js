import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
    {
       project_id: {type: mongoose.Schema.Types.ObjectId, ref: 'project'},
       title: {type: String, required: true},
       status: {type: String},
       priority: {type: String},
       assigned_to: [{type: mongoose.Schema.Types.ObjectId, ref: 'user'}],
       due_date: {type: Date},
       created_at: {type: Date, default: Date.now}
    }, {timestamps: true}
);


