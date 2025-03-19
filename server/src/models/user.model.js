import mongoose from "mongoose";

// TODO: LEARN MONGOOSE SCHEMA 
// https://mongoosejs.com/ READ THE DOCS

const userSchema = new mongoose.Schema({
    id: {type: Number, required: true },
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    userName: {type: String, required: true},
    email: {type: String, required: true}
});

const User = mongoose.model('User', userSchema);

export default User;