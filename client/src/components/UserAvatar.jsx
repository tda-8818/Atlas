// src/components/UserAvatar.jsx
import { LuUser } from 'react-icons/lu';
import { useGetCurrentUserQuery } from '../redux/slices/userSlice';
import { getInitials } from '../utils/userUtils.jsx';

const UserAvatar = () => {
  const { data: currentUser, isLoading } = useGetCurrentUserQuery();
  
  // Safe access to user object with null checks
  const user = currentUser?.user;
  
  const classes = `
    w-8 h-8 flex items-center justify-center
    rounded-full bg-[var(--background-secondary)]
    hover:bg-[var(--background-hover)]
    shadow-sm border border-gray-300
    transition-all duration-200 cursor-pointer
  `;
  
  // Show loading or fallback state
  if (isLoading || !user) {
    return (
      <div className={classes}>
        <LuUser className="w-4 h-4 text-[var(--text)]" />
      </div>
    );
  }
  
  // Safe check for profile picture
  const hasProfilePicture = user.profilePicture && user.profilePicture !== '';
  
  return (
    <div className={classes}>
      {hasProfilePicture ? (
        <img 
          src={user.profilePicture} 
          alt={`${user.firstName} ${user.lastName}`} 
          className="w-full h-full object-cover rounded-full"
        />
      ) : (
        <span className="text-base font-semibold text-[var(--text)]">
          {getInitials(user.firstName, user.lastName)}
        </span>
      )}
    </div>
  );
};

export default UserAvatar;