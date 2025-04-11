import { Menu, Transition, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaSignOutAlt } from 'react-icons/fa';
import { LuSettings, LuUser, LuCircleArrowOutUpLeft } from 'react-icons/lu';

/**
 * Gets the initials given full name.
 * @param {} fullName 
 */
export const getInitials = (fullName) => {
    // check if its a string
    if (typeof fullName !== 'string' || !fullName) {
        return '';
    }
    // split the full name into names
    const names = fullName.split(' ');
    const initials = names.slice(0, 2).map((name) => name[0].toUpperCase());
    return initials.join('');

}

/**
 * Displays a user's avatar and a dropdown menu on click.
 * @returns 
 */
const UserAvatar = () => {
    const { user } = useSelector((state) => state.auth); // extract user from auth slice
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null); // store user data
    
    // Fetch user data from API
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get('api/user/${user._id}'); // fetch user data from API
                setUserData(response.data);
            } catch (error) {
                console.error('Error fetching user data:', error); 
            }
        };

        if (user && user._id) { // check if user is logged in
            // fetch user data from API
            fetchUserData();
        }
    }
    , [user]);


    // dispatch logout action and navigate to login page
    const handleLogout = () => {
        dispatch({ type: 'LOGOUT' });
        navigate('/login');
    };
    
    return <>
        <div>
            <Menu as='div' className='absolute bottom-4 left-4 w-10 h-10 2x1:w-12 2x1:h-12'>
                <div>
                    {/* Avatar button */}
                    <MenuButton className='w-fit h-fit 2x1:w-12 2x1:h-12 items-center justify-center rounded-full bg-gray-200'>
                        {/* TODO: display initials*/}
                        {/* <span className='text-lg 2x1:text-xl font-semibold text-gray-700'>
                            {getInitials(userData?.fullName)}
                        </span> */}
                        <LuUser className="w-10 h-10 text-2xl text-gray-700" /> {/* Use the icon */}
                        
                    </MenuButton>
                </div>
                
                    <MenuItems
                        className="absolute bottom-20 left-0 w-fit h-fit mt-2 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                        anchor="bottom"
                        transition
                    >
                        <div className="py-1">
                            <MenuItem>
                                {({ active }) => (
                                    <button
                                        onClick={() => navigate('/settings')}
                                        // navigate to settings page
                                        className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} flex items-center w-full px-6 py-4 text-left text-sm`}
                                    >
                                        <LuSettings className='mr-2' aria-hidden='true'/> Settings
                                    </button>
                                )}
                            </MenuItem>
                            <MenuItem>
                                {({ active }) => (
                                    <button
                                        onClick={handleLogout}
                                        className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} flex items-center w-full px-6 py-4 text-left text-sm`}
                                    >
                                        <LuCircleArrowOutUpLeft className="mr-2" aria-hidden="true" />Logout
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

export default UserAvatar;