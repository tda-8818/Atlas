import { Menu, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

/**
 * Displays a user's avatar and a dropdown menu on click.
 * @returns 
 */
const UserAvatar = () => {
    const { user } = useSelector((state) => state.auth); // extract user from auth slice
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false); // control menu open state
    const [openPassword, setOpenPassword] = useState(false); // handling password changes
    
    // dispatch logout action and navigate to login page
    const handleLogout = () => {
        dispatch({ type: 'LOGOUT' });
        navigate('/login');
    };
    
    return <>
        <div>
            <Menu as='div' className='relative inline-block text-left'>
                <div>
                    {/* Avatar button */}
                    <MenuButton className='w-10 h-10 2x1:w-12 2x1:h-12 items-center justify-center rounded-full bg-gray-200'>
                        <span className='text-lg 2x1:text-xl font-semibold text-gray-700'>
                            {getInitials(user?.fullName)}
                        </span>
                    </MenuButton>
                </div>
                <MenuItems
                    className="absolute right-0 w-56 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none transition duration-200 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
                    anchor="bottom"
                    transition
                >
                    <div className="py-1">
                        <MenuItem>
                            {({ active }) => (
                                <button
                                    onClick={handleLogout}
                                    className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block w-full px-4 py-2 text-left text-sm`}
                                >
                                    <FaUser className='mr-2' aria-hidden='true'/> Profile
                                </button>
                            )}
                        </MenuItem>
                        <MenuItem>
                            {({ active }) => (
                                <button
                                    onClick={handleLogout}
                                    className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block w-full px-4 py-2 text-left text-sm`}
                                >
                                    Logout
                                </button>
                            )}
                        </MenuItem>
                        {/* Add more MenuItems here */}
                    </div>
                </MenuItems>
            </Menu>
        </div>
    </>;
}