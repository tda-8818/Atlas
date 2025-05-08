import mongoose from "mongoose";
// TODO: LEARN MONGOOSE SCHEMA 
// https://mongoosejs.com/ READ THE DOCS

const userSchema = new mongoose.Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    password: {type: String, required: true},
    email: {type: String, unique: true, required: true},
    profilePic: { type: String, default: '' },
    projects: [{type: mongoose.Schema.Types.ObjectId, ref:'Project',  default: []}],
    favourite_projects: [{type: mongoose.Schema.Types.ObjectId, ref:'Project',  default: []}],
    recent_projects: [{type: mongoose.Schema.Types.ObjectId, ref:'Project',  default: []}]
}, {timestamps: true});

/*
The default name for an index is the concatenation of the indexed keys and each key's direction in the index (1 or -1) using underscores as a separator. 
For example, an index created on { item : 1, quantity: -1 } has the name item_1_quantity_-1.
*/
userSchema.index({id: 1, email: 1}, {unique: true});

const UserModel = mongoose.model('user', userSchema);

export default UserModel;