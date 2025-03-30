import React from 'react';
import logoName from '../assets/logoName.png';
import { RxDashboard, RxCalendar } from "react-icons/rx";
import { LuChartGantt, LuMessageSquareMore, LuSettings } from "react-icons/lu";
import UserAvatar from './UserAvatar';


const Navbar = () => {
    return (
        <nav className="fixed bg-white h-full w-[15%] border-r-[3px] border-[#f5f5f7]">
            <div className="w-full">
                <a href="/" className="block">
                    <img src={logoName} alt="Logo" className="w-full" />
                </a>
            </div>
            <ul className="p-0 m-0 mb-[60px] w-full">
                <li >
                    <a href="/Home">
                        <button className="list-none text-[#8E92BC] py-[15px] px-[20px] rounded-[6%] mx-[20px]  hover:bg-[#f5f5f7] hover:text-black bg-white cursor-pointer">
                            <RxDashboard className='inline mr-[10px] mb-[4px] justify-center text-[25px]' />
                            Dashboard
                        </button>
                    </a>
                </li>
                <li>
                    <a href="/Calendar">
                        <button className="list-none text-[#8E92BC] py-[15px] px-[20px] rounded-[6%] mx-[20px]  hover:bg-[#f5f5f7] hover:text-black bg-white cursor-pointer">
                            <RxCalendar className='inline mr-[10px] mb-[4px] justify-center text-[25px]' />
                            Calendar
                        </button>
                    </a>
                </li>
                <li>
                    <a href="/Gantt">
                        <button className="list-none text-[#8E92BC] py-[15px] px-[20px] rounded-[6%] mx-[20px]  hover:bg-[#f5f5f7] hover:text-black bg-white cursor-pointer">
                            <LuChartGantt className='inline mr-[10px] mb-[4px] justify-center text-[25px]' />
                            Gantt Chart
                        </button>                    
                    </a>
                </li>
                <li>
                    <a href="/Messages">
                        <button className="list-none text-[#8E92BC] py-[15px] px-[20px] rounded-[6%] mx-[20px]  hover:bg-[#f5f5f7] hover:text-black bg-white cursor-pointer">
                            <LuMessageSquareMore className='inline mr-[10px] mb-[4px] justify-center text-[25px]' />
                            Messages
                        </button>                    
                    </a>
                </li>
                <li>
                    <a href="/Settings">
                        <button className="list-none text-[#8E92BC] py-[15px] px-[20px] rounded-[6%] mx-[20px]  hover:bg-[#f5f5f7] hover:text-black bg-white cursor-pointer">
                            <LuSettings className='inline mr-[10px] mb-[4px] justify-center text-[25px]' />
                            Settings
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
