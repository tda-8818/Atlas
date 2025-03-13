import React, {useState} from 'react'
import './Navbar.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons'
import { Button } from './Button'
import { faCircleUser } from '@fortawesome/free-solid-svg-icons'

const Navbar = () => {
    const [click, setClick] = useState(false);
    const [button, setButton] = useState(true);
    const handleClick = () => setClick(!click);
    const closeMobileMenu = () => setClick(false);
    
  return (
    <>
    <nav className='navbar'>
        <div className="menu-icon" onClick={handleClick}>
                <FontAwesomeIcon icon={click ? faTimes : faBars} />
            </div>
        <div className="profile">
            <a href="/Settings" className='profile'>
                <FontAwesomeIcon icon = {faCircleUser} />
            </a>
        </div>
        <div className={click ? "navbar-container active" : "navbar-container"}>
            <div className="menu-icon" onClick={handleClick}>
                <FontAwesomeIcon icon={click ? faTimes : faBars} />
            </div>
            <ul className={click ? "nav-menu active" : "nav-menu"}>
                <li className='nav-iten'>
                    <a href="/" className='nav-links' onClick={closeMobileMenu}>
                        Home
                    </a>
                </li>
                <li className='nav-iten'>
                    <a href="/Calendar" className='nav-links' onClick={closeMobileMenu}>
                        Calendar
                    </a>
                </li>
                <li className='nav-iten'>
                    <a href="/Gantt" className='nav-links' onClick={closeMobileMenu}>
                        Gantt Chart
                    </a></li>
                <li className='nav-iten'>
                    <a href="/Messages" className='nav-links-mobile' onClick={closeMobileMenu}>
                        Messages
                    </a>
                </li>
                <li className='nav-iten'>
                    <a href="/Settings" className='nav-links-mobile' onClick={closeMobileMenu}>
                        Settings    
                    </a></li>
            </ul>
        </div>

    </nav>
    </>
  )
}

export default Navbar
