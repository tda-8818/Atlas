import { createModel } from '../db/pgModel.js';

const Notification = createModel('notification', 'notifications', {
  fields: [
    'id',
    'senderId',
    'recipientId',
    'projectId',
    'timeSent',
    'isUnread',
    'responded',
    'accepted',
  ],
});

export default Notification;
