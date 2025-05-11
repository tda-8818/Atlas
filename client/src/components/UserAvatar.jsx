import { Menu } from '@headlessui/react';
import UserAvatarButton from './UserAvatarButton';
import UserDropdownMenu from './UserDropdownMenu';

const UserAvatar = () => {

  return (
    <Menu as="div" className="relative">
      <UserAvatarButton />
      <UserDropdownMenu />
    </Menu>
  );
};

export default UserAvatar;