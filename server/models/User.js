import mongoose from "mongoose";
import bcrypt from 'bcrypt';
// TODO: LEARN MONGOOSE SCHEMA 
// https://mongoosejs.com/ READ THE DOCS


const SALT_HASH_FACTOR = 10;


const userSchema = new mongoose.Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    password: {type: String, required: true},
    email: {type: String, unique: true, required: true},
    favourite_projects: [{type: mongoose.Schema.Types.ObjectId, ref:'project',  default: []}],
    recent_projects: [{type: mongoose.Schema.Types.ObjectId, ref:'project',  default: []}]
}, {timestamps: true});

/*
The pre-save hook is executed just before a document is saved to the database.
It’s commonly used for tasks such as data validation, generating timestamps, or modifying the document before saving.
*/

// userSchema.pre('save', function(next) {
    
//     // this ==> refer's to the user schema being saved into the mongodb
//     var user = this;

//     // only hash the password if it has been modified (or is new)
//     if (!user.isModified('password')) return next();
    
//     // generate a salt
//     bcrypt.genSalt(SALT_HASH_FACTOR, function(err, salt) {
//         if (err) return next(err);
        
//         // hash the password using our new salt
//         bcrypt.hash(user.password, salt, function(err, hash) {
//             if (err) return next(err);
            
//             // override the cleartext password with the hashed one
//             user.password = hash;
//             next(err);
            
//         });
//     });
// });

// userSchema.methods.comparePassword = function(candidatePassword, cb) {
//     bcrypt.compare(candidatePassword, this.password, function(err, isMatch){
//         if (err) return cb(err);
//         cb(null, isMatch);
//     })
// }

/*
The default name for an index is the concatenation of the indexed keys and each key's direction in the index (1 or -1) using underscores as a separator. 
For example, an index created on { item : 1, quantity: -1 } has the name item_1_quantity_-1.
*/
userSchema.index({id: 1, email: 1}, {unique: true});

const UserModel = mongoose.model('User', userSchema);

export default UserModel;