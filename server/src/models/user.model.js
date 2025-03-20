import mongoose from "mongoose";
import bcrypt from 'bcrypt';
// TODO: LEARN MONGOOSE SCHEMA 
// https://mongoosejs.com/ READ THE DOCS


SALT_HASH_FACTOR = 10;


const userSchema = new mongoose.Schema({
    id: {type: Number, required: true },
    firstname: {type: String, required: true},
    lastname: {type: String, required: true},
    username: {type: String, required: true, index: {unique: true}},
    password: {type: String, required: true},
    email: {type: String, required: true},
    favourite_projects: [{type: mongoose.Schema.Types.ObjectId, ref:'project',  default: []}],
    recent_projects: [{type: mongoose.Schema.Types.ObjectId, ref:'project',  default: []}]
}, {timestamps: true});

/*
The pre-save hook is executed just before a document is saved to the database.
It’s commonly used for tasks such as data validation, generating timestamps, or modifying the document before saving.
*/

userSchema.pre(save, function(next) {

    // this ==> refer's to the user schema being saved into the mongodb
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_HASH_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});


const User = mongoose.model('User', userSchema);

export default User;