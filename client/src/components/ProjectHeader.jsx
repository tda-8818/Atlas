import React, { useEffect, useState } from 'react';
import { RxDashboard, RxCalendar } from "react-icons/rx";
import { LuChartGantt, LuMessageSquareMore, LuSquareKanban } from "react-icons/lu";
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import UserAvatar from './UserAvatar';

const ProjectHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const [project, setProject] = useState(null);

  // Simulated fetch — replace with actual API call
  useEffect(() => {
    const fetchProject = async () => {
      // Example: const res = await fetch(`/api/projects/${id}`);
      // const data = await res.json();
      const data = { title: `Project ${id}` }; // mock data
      setProject(data);
    };
    fetchProject();
  }, [id]);

  // AI generated fetching operation for database fetching
  // useEffect(() => {
  //   const fetchProject = async () => {
  //     try {
  //       const response = await axios.get(`/api/projects/${id}`); // Adjust your endpoint as needed
  //       setProject(response.data);
  //     } catch (error) {
  //       console.error('Error fetching project:', error);
  //     }
  //   };

  //   if (id) fetchProject();
  // }, [id]);

  //links for navigation
  const navLinks = [
    { label: 'Dashboard', icon: <RxDashboard />, href: `/project/${id}/dashboard` },
    { label: 'Kanban Board', icon: <LuSquareKanban />, href: `/project/${id}/kanban` },
    { label: 'Calendar', icon: <RxCalendar />, href: `/project/${id}/calendar` },
    { label: 'Gantt Chart', icon: <LuChartGantt />, href: `/project/${id}/gantt` },
  ];

  //finding currect active page and apply hover effect
  const getLinkClassName = (href) => {
    const isActive = location.pathname === href;
    return isActive
      ? 'flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--nav-hover)] text-[var(--text-hover)] transition duration-200 cursor-pointer'
      : 'flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg text-[var(--nav-text)] hover:bg-[var(--nav-hover)] hover:text-[var(--text-hover)] transition duration-200 cursor-pointer';
  };

  return (
    <header className="bg-[var(--background)] border-b border-[var(--border-color)] shadow-sm">
      <div className="px-4 py-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        {/* Project title section */}
        <div className="flex flex-col min-w-0 flex-1">
          <h1
            className="font-bold text-[var(--text)] text-[1.2rem] truncate"
            title={project?.title || 'Project Name'}
          >
            {project?.title || 'Project Name'}
          </h1>
        </div>
        {/* Page link navigation section */}
        <div className="flex items-center gap-4 mt-1 md:mt-0 shrink-0">
          <ul className="flex gap-1 flex-wrap items-center">
            {navLinks.map(({ label, icon, href }) => (
              <li key={label}>
                <button
                  onClick={() => navigate(href)}
                  className={getLinkClassName(href)}
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                </button>
              </li>
            ))}
          </ul>

          {/* User avatar */}
          <UserAvatar />
        </div>
      </div>
    </header>
  );
};

export default ProjectHeader;
