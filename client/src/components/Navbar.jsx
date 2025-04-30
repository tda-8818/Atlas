import React from 'react';
import logo from '../assets/logo.png';
import { RxDashboard, RxCalendar, RxHome } from "react-icons/rx";
import { LuChartGantt, LuMessageSquareMore, LuSquareKanban } from "react-icons/lu";
import UserAvatar from './UserAvatar';

const navItems = [
    { label: "Home", icon: <RxHome />, href: "/Home" },
    { label: "Dashboard", icon: <RxDashboard />, href: "/Dashboard" },
    { label: "Calendar", icon: <RxCalendar />, href: "/Calendar" },
    { label: "Gantt Chart", icon: <LuChartGantt />, href: "/Gantt" },
    { label: "Task", icon: <LuSquareKanban />, href: "/Kanban" },
    { label: "Messages", icon: <LuMessageSquareMore />, href: "/Messages" },
];

const Navbar = () => {
    return (
        <nav className="fixed top-0 left-0 h-full w-[15%] bg-[var(--background)] border-r-4 border-[var(--border-color)] flex flex-col justify-between py-6">
            {/* Logo Section */}
            <div className="px-6 mb-10">
                <a href="/Home" className="flex items-center gap-3">
                    <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
                    <h1 className="text-lg font-extrabold text-[var(--text)]">UniFlow</h1>
                </a>
            </div>

            {/* Navigation Links */}
            <ul className="flex-1 px-2 space-y-2">
                {navItems.map(({ label, icon, href }) => (
                    <li key={label}>
                        <a href={href}>
                            <button className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg 
  bg-[var(--background)] text-[var(--nav-text)] 
  hover:bg-[var(--nav-hover)] hover:text-[var(--text-hover)] 
  transition duration-200 whitespace-nowrap">
                                <span className="text-xl shrink-0">{icon}</span>
                                <span className="truncate">{label}</span>
                            </button>

                        </a>
                    </li>
                ))}
            </ul>

            {/* Avatar/User Section */}
    
        </nav>
    );
};

export default Navbar;
