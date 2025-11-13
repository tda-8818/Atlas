// components/avatar/UserAvatar.jsx

import { useState } from 'react';
import { getInitials } from '../../utils/userUtils';

/**
 * Props:
 * - user: { firstName, lastName, profilePic }
 * - size: number (e.g., 6, 8, 10 for Tailwind)
 * - className: optional extra classes
 */
const UserAvatar = ({ user, size=8 }) => {
  const [imageError, setImageError] = useState(false);
  const profileImage = user?.profilePic;
  const initials = getInitials(user?.firstName, user?.lastName);
 

  return (
    <div
      className={`
        w-${size} h-${size} rounded-full
        flex items-center justify-center overflow-hidden shadow-sm
      `}

    >
      {profileImage && !imageError ? (
        <img
          src={profileImage}
          alt={`${user?.firstName || ''} ${user?.lastName || ''}`}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover rounded-full"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center">
          <span className="text-xs font-semibold text-white">
            {initials}
          </span>
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
