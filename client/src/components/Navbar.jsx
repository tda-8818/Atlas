import React from 'react';
import logoName from '../assets/logoName.png';

import { RxDashboard, RxCalendar,RxHome } from "react-icons/rx";
import { LuChartGantt, LuMessageSquareMore, LuSquareKanban } from "react-icons/lu";
import UserAvatar from './UserAvatar';


const Navbar = () => {
    return (
        <nav className="fixed bg-[var(--background)] h-full w-[15%] border-r-[3px] border-[var(--border-color)]">
            <div className="w-full">
                <a href="/Home" className="block">
                    <img src={logoName} alt="Logo" className="w-full" />
                </a>
            </div>
            <ul className="p-0 m-0 mb-[60px] w-full">
            <li >
                    <a href="/Home">
                        <button className="list-none bg-[var(--background)] text-[var(--nav-text)] py-[15px] px-[20px] rounded-[6%] mx-[20px] hover:bg-[var(--nav-hover)] hover:text-[var(--text-hover)] cursor-pointer">
                            <RxHome className='inline mr-[10px] mb-[4px] justify-center text-[25px]' />
                            Home
                        </button>
                    </a>
                </li>
                <li >
                    <a href="/Home">
                        <button  className="list-none bg-[var(--background)] text-[var(--nav-text)] py-[15px] px-[20px] rounded-[6%] mx-[20px] hover:bg-[var(--nav-hover)] hover:text-[var(--text-hover)] cursor-pointer">
                            <RxDashboard className='inline mr-[10px] mb-[4px] justify-center text-[25px]' />
                            Dashboard
                        </button>
                    </a>
                </li>
                <li>
                    <a href="/Calendar">
                        <button  className="list-none bg-[var(--background)] text-[var(--nav-text)] py-[15px] px-[20px] rounded-[6%] mx-[20px] hover:bg-[var(--nav-hover)] hover:text-[var(--text-hover)] cursor-pointer">
                            <RxCalendar className='inline mr-[10px] mb-[4px] justify-center text-[25px]' />
                            Calendar
                        </button>
                    </a>
                </li>
                <li>
                    <a href="/Gantt">
                        <button  className="list-none bg-[var(--background)] text-[var(--nav-text)] py-[15px] px-[20px] rounded-[6%] mx-[20px] hover:bg-[var(--nav-hover)] hover:text-[var(--text-hover)] cursor-pointer">
                            <LuChartGantt className='inline mr-[10px] mb-[4px] justify-center text-[25px]' />
                            Gantt Chart
                        </button>                    
                    </a>
                </li>
                <li>
                    <a href="/Kanban">
                        <button  className="list-none bg-[var(--background)] text-[var(--nav-text)] py-[15px] px-[20px] rounded-[6%] mx-[20px] hover:bg-[var(--nav-hover)] hover:text-[var(--text-hover)] cursor-pointer">
                            <LuSquareKanban className='inline mr-[10px] mb-[4px] justify-center text-[25px]' />
                            Task
                        </button>                    
                    </a>
                </li>
                <li>
                    <a href="/Messages">
                        <button  className="list-none bg-[var(--background)] text-[var(--nav-text)] py-[15px] px-[20px] rounded-[6%] mx-[20px] hover:bg-[var(--nav-hover)] hover:text-[var(--text-hover)] cursor-pointer">
                            <LuMessageSquareMore className='inline mr-[10px] mb-[4px] justify-center text-[25px]' />
                            Messages
                        </button>                    
                    </a>
                </li>
            </ul>
            <div className="p-4">
                <UserAvatar />
            </div>
        </nav>
    );
};

export default Navbar;