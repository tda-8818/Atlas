import { Fragment } from 'react';
import { MenuItems, MenuItem, Transition } from '@headlessui/react';
import { LuSettings, LuCircleArrowOutUpLeft } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import { useLogoutMutation } from '../redux/slices/userSlice';

const UserDropdownMenu = () => {
  const navigate = useNavigate();
  const [logout, { isLoading }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      window.location.href = '/login';
    } catch (err) {
      console.error('Failed to logout:', err);
      document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      navigate('/login');
    }
  };

  return (
    <Transition
      as={Fragment}
      enter="transition ease-out duration-100"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      <MenuItems className="absolute right-0 top-full mt-2 w-48 origin-top-right rounded-md bg-[var(--background)] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
        <div className="px-2 py-2 rounded-md">
          {/* Uncomment to enable Settings */}
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
                disabled={isLoading}
                className={`${
                  active
                    ? 'bg-[var(--background-primary)] text-[var(--text)]'
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
  );
};

export default UserDropdownMenu;
