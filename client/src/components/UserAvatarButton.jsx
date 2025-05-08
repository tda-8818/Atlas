import { useState } from 'react';
import { MenuButton } from '@headlessui/react';
import { LuUser } from 'react-icons/lu';
import { getInitials } from '../utils/userUtils';
import { useGetCurrentUserQuery } from '../redux/slices/userSlice';

const UserAvatarButton = () => {
  const { data: currentUser } = useGetCurrentUserQuery();
  const user = currentUser?.user;
  const profileImage = user?.profilePic;

  const [imageError, setImageError] = useState(false);

  return (
    <MenuButton
      className="
        w-8 h-8 flex items-center justify-center
        rounded-full bg-[var(--background-secondary)]
        hover:bg-[var(--background-hover)]
        shadow-sm border border-gray-300
        transition-all duration-200 cursor-pointer overflow-hidden
      "
    >
      {user ? (
        profileImage && !imageError ? (
          <img
            src={profileImage}
            alt="User profile"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          <span className="text-base font-semibold text-[var(--text)]">
            {getInitials(user.firstName, user.lastName)}
          </span>
        )
      ) : (
        <LuUser className="w-4 h-4 text-[var(--text)]" />
      )}
    </MenuButton>
  );
};

export default UserAvatarButton;
