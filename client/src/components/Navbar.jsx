import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './Navbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faCircleUser } from '@fortawesome/free-solid-svg-icons';

const Navbar = () => {
    const [click, setClick] = useState(false);
    const [title, setTitle] = useState(document.title);
    const location = useLocation();

    const handleClick = () => setClick(!click);
    const closeMobileMenu = () => setClick(false);

    useEffect(() => {
        const updateTitle = () => {
            const path = location.pathname;
            let newTitle = 'Task Management System'; // Default title

            switch (path) {
                case '/':
                    newTitle = 'Home';
                    break;
                case '/Calendar':
                    newTitle = 'Calendar';
                    break;
                case '/Gantt':
                    newTitle = 'Gantt Chart';
                    break;
                case '/Messages':
                    newTitle = 'Messages';
                    break;
                case '/Settings':
                    newTitle = 'Settings';
                    break;
                default:
                    newTitle = 'Task Management System';
            }

            document.title = newTitle;
            setTitle(newTitle);
        };

        updateTitle();
    }, [location]);

    return (
        <>
            <nav className='navbar'>
                <div className="menu-icon" onClick={handleClick}>
                    <FontAwesomeIcon icon={click ? faTimes : faBars} />
                </div>
                <div className="Title">
                    <h1>{title}</h1>
                </div>
                <div className="profile">
                    <a href="/Settings" className='profile'>
                        <FontAwesomeIcon icon={faCircleUser} />
                    </a>
                </div>
                <div className={click ? "navbar-container active" : "navbar-container"}>
                    <div className="menu-icon" onClick={handleClick}>
                        <FontAwesomeIcon icon={click ? faTimes : faBars} />
                    </div>
                    <ul className={click ? "nav-menu active" : "nav-menu"}>
                        <li className='nav-item'>
                            <a href="/" className='nav-links' onClick={closeMobileMenu}>
                                Home
                            </a>
                        </li>
                        <li className='nav-item'>
                            <a href="/Calendar" className='nav-links' onClick={closeMobileMenu}>
                                Calendar
                            </a>
                        </li>
                        <li className='nav-item'>
                            <a href="/Gantt" className='nav-links' onClick={closeMobileMenu}>
                                Gantt Chart
                            </a>
                        </li>
                        <li className='nav-item'>
                            <a href="/Messages" className='nav-links-mobile' onClick={closeMobileMenu}>
                                Messages
                            </a>
                        </li>
                        <li className='nav-item'>
                            <a href="/Settings" className='nav-links-mobile' onClick={closeMobileMenu}>
                                Settings
                            </a>
                        </li>
                    </ul>
                </div>
            </nav>
        </>
    );
};

export default Navbar;
