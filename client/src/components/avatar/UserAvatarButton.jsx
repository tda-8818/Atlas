import { Menu } from '@headlessui/react';
import UserAvatar from './UserAvatar';
import UserDropdownMenu from './UserDropdownMenu';

const UserAvatarButton = () => {

  return (
    <Menu as="div" className="relative">
      <UserAvatar />
      <UserDropdownMenu />
    </Menu>
  );
};

export default UserAvatarButton;