import { useState } from 'react';
import logo from '../assets/logo.png';
import { RxHome } from "react-icons/rx";
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../contexts/ProjectsContext';

const navItems = [
  { label: "Projects", icon: <RxHome />, href: "/projects" }
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  // Use context to get projects data (instead of making another API call)
  const { projectsData = [] } = useProjects();

  return (
    <nav className={`fixed top-0 left-0 h-full z-40 transition-all duration-300
      bg-[var(--background)] border-r-2 border-[var(--border-color)] 
      flex flex-col justify-between py-3 ${collapsed ? 'w-16' : 'w-[15%]'}`}>
      
      {/* Logo */}
      <div className="px-5 mb-6 flex items-center gap-3 justify-between">
        {!collapsed ? (
          <a href="/projects" className="flex items-center gap-3 w-full overflow-hidden group transition-all duration-300">
            <img
              src={logo}
              alt="Atlas Logo"
              className="w-10 h-10 rounded-full object-cover shrink-0 shadow-md group-hover:shadow-lg transition-shadow duration-300"
            />
            <div className="flex flex-col justify-center min-w-0">
              <h1 className="text-xl font-black bg-gradient-to-r from-[#0b80c3] to-[#0d9ae6] bg-clip-text text-transparent truncate leading-tight">
                Atlas
              </h1>
              <p className="text-[10px] text-[#546e7a] font-medium truncate leading-tight">
                Navigate & Conquer
              </p>
            </div>
          </a>
        ) : (
          <a href="/projects" className="flex items-center justify-center w-full">
            <img
              src={logo}
              alt="Atlas Logo"
              className="w-10 h-10 rounded-full object-cover shadow-md hover:shadow-lg transition-shadow duration-300"
            />
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
            <button
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
