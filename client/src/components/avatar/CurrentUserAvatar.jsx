import { Fragment } from 'react';
import { Menu, Transition, MenuItem, MenuItems, MenuButton } from '@headlessui/react';
import { LuSettings, LuCircleArrowOutUpLeft } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import { useGetCurrentUserQuery, useLogoutMutation } from '../../redux/slices/userSlice';
import UserAvatar from './UserAvatar';

const CurrentUserAvatar = () => {
  const { data, isLoading } = useGetCurrentUserQuery();
  const user = data?.user;
  const navigate = useNavigate();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  if (isLoading || !user) return null;

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      window.location.href = '/login';
    } catch (err) {
      console.error('Failed to logout:', err);
      // Clear cookie manually if needed
      document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      navigate('/login');
    }
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      {/* Avatar as the Menu Button */}
      <MenuButton className="focus:outline-none">
        <UserAvatar user={user} />
      </MenuButton>

      {/* Dropdown Menu */}
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <MenuItems className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-[var(--background)] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
          <div className="px-2 py-2">
            <MenuItem>
              {({ active }) => (
                <button
                  onClick={() => navigate('/settings')}
                  className={`${
                    active
                      ? 'bg-[var(--background-primary)] text-[var(--text)]'
                      : 'text-[var(--text)]'
                  } group flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors`}
                >
                  <LuSettings className="mr-2 h-4 w-4" />
                  Settings
                </button>
              )}
            </MenuItem>

            <MenuItem>
              {({ active }) => (
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className={`${
                    active
                      ? 'bg-[var(--background-primary)] text-[var(--text)]'
                      : 'text-[var(--text)]'
                  } group flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors`}
                >
                  <LuCircleArrowOutUpLeft className="mr-2 h-4 w-4" />
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </button>
              )}
            </MenuItem>
          </div>
        </MenuItems>
      </Transition>
    </Menu>
  );
};

export default CurrentUserAvatar;