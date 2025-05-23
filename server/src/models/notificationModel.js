import mongoose from "mongoose";
// TODO: LEARN MONGOOSE SCHEMA 
// https://mongoosejs.com/ READ THE DOCS

/**
 * Notifications are the invitation card 
 * 
 */

const notificationSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true},
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true},
    projectId: {type: mongoose.Schema.Types.ObjectId, ref: 'project', required: true},
    timeSent: {type: Date},
    isUnread: {type: Boolean, default: true},
    responded: {type: Boolean, default: false}, //NEW
    accepted: {type: Boolean, default: false}, //NEW
}, {timestamps: true});


const Notification = mongoose.model('notification', notificationSchema);

export default Notification;