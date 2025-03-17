import mongoose from "mongoose";

// TODO: LEARN MONGOOSE SCHEMA 
// https://mongoosejs.com/ READ THE DOCS

const userSchema = new mongoose.Schema({
    firstName: {type: String, required: True},
    lastName: String,
    userName: String,
    email: String
});

const User = mongoose.model('User', userSchema);
module.exports = User;