import mongoose from "mongoose";
// TODO: LEARN MONGOOSE SCHEMA 
// https://mongoosejs.com/ READ THE DOCS

const userSchema = new mongoose.Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    password: {type: String, required: function() { return this.provider === 'local'; }}, // Only required for local auth
    email: {type: String, unique: true, required: true},
    profilePic: { type: String, default: '' },
    projects: [{type: mongoose.Schema.Types.ObjectId, ref:'project',  default: []}],
    favourite_projects: [{type: mongoose.Schema.Types.ObjectId, ref:'project',  default: []}],
    recent_projects: [{type: mongoose.Schema.Types.ObjectId, ref:'project',  default: []}],
    notifications: [{type: mongoose.Schema.Types.ObjectId, ref: 'notification', default: []}],

    // Email verification fields
    emailVerified: {type: Boolean, default: false},
    verificationToken: {type: String, default: null}, // Hashed token
    verificationTokenExpiry: {type: Date, default: null},
    passwordResetToken: {type: String, default: null},
    passwordResetTokenExpiry: {type: Date, default: null},

    // OAuth fields (for future Google/GitHub login)
    provider: {type: String, enum: ['local', 'google', 'github'], default: 'local'},
    providerId: {type: String, default: null}, // OAuth provider's user ID
}, {timestamps: true});

/*
The default name for an index is the concatenation of the indexed keys and each key's direction in the index (1 or -1) using underscores as a separator. 
For example, an index created on { item : 1, quantity: -1 } has the name item_1_quantity_-1.
*/
userSchema.index({ email: 1 }, { unique: true });

const UserModel = mongoose.model('user', userSchema);

export default UserModel;