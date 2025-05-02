import React from 'react';
import logo from '../assets/logo.png';
import { RxDashboard, RxCalendar, RxHome } from "react-icons/rx";
import { useNavigate } from 'react-router-dom';

const navItems = [
    { label: "Home", icon: <RxHome />, href: "/Home" }];
//TEMPORARY TESTING PROJECTS
const dummyProjects = [
  { id: 1, title: 'Design System' },
  { id: 2, title: 'Marketing Site' },
  { id: 3, title: 'Project A' },
];

const currentProjectId = 1; // This should be dynamically set based on the current project

const Navbar = () => {
    const navigate = useNavigate();
    return (
      <nav className="fixed top-0 left-0 h-full w-[15%] bg-[var(--background)] border-r-4 border-[var(--border-color)] flex flex-col justify-between py-4">
        {/* Logo Section */}
        <div className="px-6 mb-6 flex items-center gap-2">
          <a href="/Home" className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="w-6 h-6 object-contain" />
            <h1 className="text-base font-extrabold text-[var(--text)] truncate">
              UniFlow
            </h1>
          </a>
        </div>
  
        {/* Navigation Links */}
        <ul className="flex px-2 space-y-2">
          {navItems.map(({ label, icon, href }) => (
            <li key={label}>
              <a href={href}>
                <button className="
                  w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg
                  bg-[var(--background)] text-[var(--nav-text)]
                  hover:bg-[var(--nav-hover)] hover:text-[var(--text-hover)]
                  transition duration-200 whitespace-nowrap cursor-pointer
                ">
                  <span className="text-xl shrink-0">{icon}</span>
                  <span className="truncate">{label}</span>
                </button>
              </a>
            </li>
          ))}
        </ul>
        <h2 className="
                 flex px-2 items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg
                  bg-[var(--background)] text-[var(--text)]
      
                ">Your Projects</h2>
        {/* Projects List */}
      <ul className="flex-1 px-2 space-y-2">
        {dummyProjects?.map(dummyProjects => {
          const isActive = currentProjectId === String(dummyProjects.id);
          return (
            // CHANGE DUMMY PROJECT FOR REAL PROJECTS
            <button
              key={dummyProjects.id}
              onClick={() => navigate(`/project/${dummyProjects.id}/dashboard`)}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg
                  bg-[var(--background)] text-[var(--nav-text)]
                  hover:bg-[var(--nav-hover)] hover:text-[var(--text-hover)]
                  transition duration-200 whitespace-nowrap cursor-pointer
                "
            >
              {dummyProjects.title}
            </button>
          );
        })}
      </ul>
      </nav>
    );
  };
  
export default Navbar;
