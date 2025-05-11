import React, { useState, useEffect } from 'react';
import logo from '../assets/logo.png';
import { RxHome } from "react-icons/rx";
import { useNavigate } from 'react-router-dom';
import { useGetCurrentUserProjectsQuery } from '../redux/slices/projectSlice';
import {
  useGetProjectByIdQuery,
  useGetProjectUsersQuery,
  useUpdateProjectUsersMutation
} from '../redux/slices/projectSlice';
const navItems = [
  { label: "Home", icon: <RxHome />, href: "/Home" }
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  //const [projects, setProjects] = useState([]);
  //const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  // Use RTK Query hook to fetch projects
  const {
      data: projectsData = [],
      isLoading: projectsLoading,
      isError: projectsError,
      refetch,
  } = useGetCurrentUserProjectsQuery();

  // Use RTK Query hook to fetch projects
  const {
      data: projectsData = [],
      isLoading: projectsLoading,
      isError: projectsError,
      refetch,
  } = useGetCurrentUserProjectsQuery();

  useEffect(() => {
    console.log("projectsData:", projectsData);
  }, [projectsData]);
    console.log("projectsData:", projectsData);
  }, [projectsData]);

  return (
    <nav className={`fixed top-0 left-0 h-full z-40 transition-all duration-300
      bg-[var(--background)] border-r-2 border-[var(--border-color)] 
      flex flex-col justify-between py-3 ${collapsed ? 'w-16' : 'w-[15%]'}`}>
      
      {/* Logo */}
      <div className="px-5 mb-6 flex items-center gap-2 justify-between">
        {!collapsed && (
          <a href="/Home" className="flex items-center gap-2 w-full overflow-hidden">
            <img src={logo} alt="Logo" className="w-6 h-6 object-contain shrink-0" />
            <h1 className="text-base font-extrabold text-[var(--text)] truncate min-w-0">
              UniFlow
            </h1>
          </a>
        )}
      </div>

      {/* Nav Links */}
      <ul className="flex flex-col px-2 space-y-2">
        {navItems.map(({ label, icon, href }) => (
          <li key={label} className="w-full">
            <a href={href} className="block w-full">
              <button className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg
                bg-[var(--background)] text-[var(--nav-text)]
                hover:bg-[var(--nav-hover)] hover:text-[var(--text-hover)]
                transition duration-200 cursor-pointer overflow-hidden">
                <span className="text-xl shrink-0">{icon}</span>
                {!collapsed && <span className="truncate min-w-0">{label}</span>}
              </button>
            </a>
          </li>
        ))}
      </ul>

      {/* Project List */}
      {!collapsed && (
        <h2 className="px-4 pb-2 pt-4 text-sm font-bold text-[1rem] text-[var(--text)]">Your Projects</h2>
      )}
      <ul className="flex-1 px-2 space-y-2 overflow-y-auto">
        {projectsData.map((project) => (
          <li key={project._id} className="w-full">
        {projectsData.map((project) => (
          <li key={project._id} className="w-full">
            <button
              onClick={() => navigate(`/projects/${project._id}/dashboard`)}
              onClick={() => navigate(`/projects/${project._id}/dashboard`)}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg
                bg-[var(--background)] text-[var(--nav-text)]
                hover:bg-[var(--nav-hover)] hover:text-[var(--text-hover)]
                transition duration-200 cursor-pointer overflow-hidden"
            >
              <span className="truncate min-w-0">
                {collapsed ? project.title[0] : project.title}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Sidebar;
