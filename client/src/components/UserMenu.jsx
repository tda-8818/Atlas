// src/components/UserMenu.jsx
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuSettings, LuCircleArrowOutUpLeft, LuUser } from 'react-icons/lu';
import { useLogoutMutation, useGetCurrentUserQuery } from '../redux/slices/userSlice';
import { getInitials } from '../utils/userUtils.jsx';

const UserMenu = () => {
  const navigate = useNavigate();
  const [logout, { isLoading }] = useLogoutMutation();
  const { data: currentUser } = useGetCurrentUserQuery();
  const user = currentUser?.user;

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      // Force full page reload to clear all state
      window.location.href = '/login';
    } catch (err) {
      console.error('Failed to logout:', err);
      // Fallback: Manual cookie clear if API fails
      document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      navigate('/login');
    }
  };

  // Safe check for profile picture
  const hasProfilePicture = user?.profilePicture && user.profilePicture !== '';

  return (
    <Menu as="div" className="relative">
      {({ open }) => (
        <>
          <Menu.Button
            className="
              w-8 h-8 flex items-center justify-center
              rounded-full bg-[var(--background-secondary)]
              hover:bg-[var(--background-hover)]
              shadow-sm border border-gray-300
              transition-all duration-200 cursor-pointer
            "
          >
            {hasProfilePicture ? (
              <img 
                src={user.profilePicture} 
                alt="Profile" 
                className="w-full h-full object-cover rounded-full"
              />
            ) : user ? (
              <span className="text-base font-semibold text-[var(--text)]">
                {getInitials(user.firstName, user.lastName)}
              </span>
            ) : (
              <LuUser className="w-4 h-4 text-[var(--text)]" />
            )}
          </Menu.Button>

          <Transition
            show={open}
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items
              static
              className="absolute right-0 mt-2 w-48 origin-top-right divide-y divide-gray-100 rounded-md bg-[var(--background)] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
            >
              {user && (
                <div className="px-3 py-2 border-b border-gray-200">
                  <p className="font-semibold text-[var(--text)]">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user.email}
                  </p>
                </div>
              )}
              
              <div className="p-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => navigate('/settings')}
                      className={`${
                        active ? 'bg-[var(--background-primary)]' : ''
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm text-[var(--text)]`}
                    >
                      <LuSettings className="mr-2 h-5 w-5" />
                      Settings
                    </button>
                  )}
                </Menu.Item>
                
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleLogout}
                      disabled={isLoading}
                      className={`${
                        active ? 'bg-[var(--background-primary)]' : ''
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm text-[var(--text)]`}
                    >
                      <LuCircleArrowOutUpLeft className="mr-2 h-5 w-5" />
                      {isLoading ? 'Logging out...' : 'Logout'}
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );
};

export default UserMenu;