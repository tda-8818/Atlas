import { Menu, Transition, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import { Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuSettings, LuUser, LuCircleArrowOutUpLeft } from 'react-icons/lu';
import { useLogoutMutation, useGetCurrentUserQuery } from '../redux/slices/apiSlice';

const getInitials = (firstName = '', lastName = '') => {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
};

const UserAvatar = () => {
  const navigate = useNavigate();
  const [logout, { isLoading }] = useLogoutMutation();
  const { data: currentUser } = useGetCurrentUserQuery();

  const handleLogout = async () => {
    // ...same as before
  };

  return (
    <Menu as="div" className="relative">
      <MenuButton
        className="
          w-8 h-8 flex items-center justify-center
          rounded-full bg-[var(--background-secondary)]
          hover:bg-[var(--background-hover)]
          shadow-sm border border-gray-300
          transition-all duration-200 cursor-pointer
        "
      >
        {currentUser?.user ? (
          <span className="text-base font-semibold text-[var(--text)]">
            {getInitials(currentUser.user.firstName, currentUser.user.lastName)}
          </span>
        ) : (
          <LuUser className="w-4 h-4 text-[var(--text)]" />
        )}
      </MenuButton>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <MenuItems className="absolute right-0 top-full mt-2 w-48 origin-top-right rounded-md bg-[var(--background-primary)] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
          <div className="px-2 py-2 rounded-md">
            <MenuItem>
              {({ active }) => (
                <button
                  onClick={() => navigate('/settings')}
                  className={`${
                    active
                      ? 'bg-[var(--background-secondary)] text-[var(--accent)]'
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
                  disabled={isLoading}
                  className={`${
                    active
                      ? 'bg-[var(--background-secondary)] text-[var(--accent)]'
                      : 'text-[var(--text)]'
                  } group flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors`}
                >
                  <LuCircleArrowOutUpLeft className="mr-2 h-4 w-4" />
                  {isLoading ? 'Logging out...' : 'Logout'}
                </button>
              )}
            </MenuItem>
          </div>
        </MenuItems>
      </Transition>
    </Menu>
  );
};


export default UserAvatar;
