import { Menu, Transition, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import { Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuSettings, LuUser, LuCircleArrowOutUpLeft } from 'react-icons/lu';
import { useLogoutMutation, useGetCurrentUserQuery } from '../redux/slices/apiSlice';

const getInitials = (firstName = '', lastName = '') => {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
}

const UserAvatar = () => {
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();
  const { data: currentUser } = useGetCurrentUserQuery();
  
  const handleLogout = async () => {
    try {
      await logout().unwrap();
      navigate('/login');
    } catch (err) {
      console.error('Failed to logout:', err);
      navigate('/login');
    }
  };
  
  return (
    <Menu as='div' className='relative'>
      <MenuButton className='w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors'>
        {currentUser?.user ? (
          <span className='text-lg font-semibold text-gray-700'>
            {getInitials(currentUser.user.firstName, currentUser.user.lastName)}
          </span>
        ) : (
          <LuUser className="w-6 h-6 text-gray-700" />
        )}
      </MenuButton>
      
      <Transition as={Fragment} {...transitionProps}>
        <MenuItems className="dropdown-menu">
          <div className="px-1 py-1">
            <MenuItem>
              {({ active }) => (
                <button
                  onClick={() => navigate('/settings')}
                  className={`dropdown-item ${active ? 'bg-gray-100' : ''}`}
                >
                  <LuSettings className="mr-3 h-5 w-5" />
                  Settings
                </button>
              )}
            </MenuItem>
            <MenuItem>
              {({ active }) => (
                <button
                  onClick={handleLogout}
                  className={`dropdown-item ${active ? 'bg-gray-100' : ''}`}
                >
                  <LuCircleArrowOutUpLeft className="mr-3 h-5 w-5" />
                  Logout
                </button>
              )}
            </MenuItem>
          </div>
        </MenuItems>
      </Transition>
    </Menu>
  );
};

const transitionProps = {
  enter: "transition ease-out duration-100",
  enterFrom: "transform opacity-0 scale-95",
  enterTo: "transform opacity-100 scale-100",
  leave: "transition ease-in duration-75",
  leaveFrom: "transform opacity-100 scale-100",
  leaveTo: "transform opacity-0 scale-95"
};

export default UserAvatar;