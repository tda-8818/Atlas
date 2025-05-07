// src/components/UserAvatar.jsx
import { LuUser } from 'react-icons/lu';
import { useGetCurrentUserQuery } from '../redux/slices/userSlice';
import { getInitials } from '../utils/userUtils.jsx';

const UserAvatar = () => {
  const navigate = useNavigate();
  const [logout, { isLoading }] = useLogoutMutation();
  const { data: currentUser } = useGetCurrentUserQuery();

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

  return (
    <Menu as="div" className="relative">

      {/* User avatar display */}
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

        {/* popup for when user avatar is clicked */}

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
            {/* SETTINGS NOT WORKING */}
            {/* <MenuItem>
              {({ active }) => (
                <button
                  onClick={() => navigate('/settings')}
                  className={`${
                    active
                      ? 'bg-[var(--background-primary)] text-[var(--text)] cursor-pointer'
                      : 'text-[var(--text)] bg-[var(--background)] hover:bg-[var(--background-priamry)]'
                  } group flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors`}
                >
                  <LuSettings className="mr-2 h-4 w-4" />
                  Settings
                </button>
              )}
            </MenuItem> */}

            <MenuItem>
              {({ active }) => (
                <button
                  onClick={handleLogout}
                  disabled={isLoading}
                  className={`${
                    active
                      ? 'bg-[var(--background-primary)] text-[var(--text)] cursor-pointer'
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