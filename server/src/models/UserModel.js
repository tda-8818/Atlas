import { createModel } from '../db/pgModel.js';

const UserModel = createModel('user', 'users', {
  hidden: [
    'password',
    'verificationToken',
    'verificationTokenExpiry',
    'passwordResetToken',
    'passwordResetTokenExpiry',
  ],
  fields: [
    'id',
    'firstName',
    'lastName',
    'password',
    'email',
    'profilePic',
    'projects',
    'favouriteProjects',
    'recentProjects',
    'notifications',
    'emailVerified',
    'verificationToken',
    'verificationTokenExpiry',
    'passwordResetToken',
    'passwordResetTokenExpiry',
    'provider',
    'providerId',
  ],
});

export default UserModel;
