import React from 'react';
import logoName from '../assets/logoName.png';
import Button from './Button';

const Navbar = () => {
    return (
        <nav className="fixed bg-white h-full w-[15%] border-r border-[#141522]">
            <div className="w-full">
                <a href="/" className="block">
                    <img src={logoName} alt="Logo" className="w-full" />
                </a>
            </div>
            <ul className="p-0 m-0 mb-[60px] w-full">
                <li >
                    <a href="/">
                        <Button label="Dashboard" className="list-none text-[#8E92BC] py-[15px] px-[20px] rounded-[6%] mx-[20px] my-[15px] hover:bg-[#f5f5f7] hover:text-black bg-white" />
                    </a>
                </li>
                <li>
                    <a href="/Calendar">
                    <Button label="Calendar" className="list-none text-[#8E92BC] py-[15px] px-[20px] rounded-[6%] mx-[20px] my-[15px] :bg-[#f5f5f7] hover:text-black bg-white" />
                    </a>
                </li>
                <li>
                    <a href="/Gantt">
                        <Button label="Gantt Chart" className="list-none text-[#8E92BC] py-[15px] px-[20px] rounded-[6%] mx-[20px] hover:bg-[#f5f5f7] hover:text-black bg-white" />
                    </a>
                </li>
                <li>
                    <a href="/Messages">
                        <Button label="Messages" className="list-none text-[#8E92BC] py-[15px] px-[20px] rounded-[6%] mx-[20px]  hover:bg-[#f5f5f7] hover:text-black bg-white cursor-pointer" />
                    </a>
                </li>
                <li className="list-none py-[15px] px-0 rounded-[6%] mx-[20px] my-[15px] hover:bg-[#f5f5f7]">
                    <a href="/Settings" className="no-underline text-[#8E92BC] pl-[20px] hover:text-black">
                        Settings
                    </a>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
