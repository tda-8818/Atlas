import React from 'react';
import { RxDashboard, RxCalendar } from "react-icons/rx";
import { LuChartGantt, LuSquareKanban } from "react-icons/lu";
import { useLocation, useNavigate } from 'react-router-dom';
import UserAvatar from './avatar/UserAvatarButton';

const Navbar = ({ project }) => {
  const location = useLocation();
  const navigate = useNavigate();

  if (!project) {
    return <div>Loading project...</div>;
  }

  const { title, _id } = project;

  const navLinks = [
    { label: 'Dashboard', icon: <RxDashboard />, href: `/projects/${_id}/dashboard` },
    { label: 'Kanban Board', icon: <LuSquareKanban />, href: `/projects/${_id}/kanban` },
    { label: 'Calendar', icon: <RxCalendar />, href: `/projects/${_id}/calendar` },
    { label: 'Gantt Chart', icon: <LuChartGantt />, href: `/projects/${_id}/gantt` },
  ];

  const getLinkClassName = (href) => {
    const isActive = location.pathname === href;
    return isActive
      ? 'flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--nav-hover)] text-[var(--text-hover)] transition duration-200 cursor-pointer'
      : 'flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg text-[var(--nav-text)] hover:bg-[var(--nav-hover)] hover:text-[var(--text-hover)] transition duration-200 cursor-pointer';
  };

  return (
    <header className="bg-[var(--background)] border-b border-[var(--border-color)] shadow-sm">
      <div className="px-4 py-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col min-w-0 flex-1">
          <h1 className="font-bold text-[var(--text)] text-[1.2rem] truncate" title={title || 'Project Name'}>
            {title || 'Project Name'}
          </h1>
        </div>
        <div className="flex items-center gap-4 mt-1 md:mt-0 shrink-0">
          <ul className="flex gap-1 flex-wrap items-center">
            {navLinks.map(({ label, icon, href }) => (
              <li key={label}>
                <button onClick={() => navigate(href)} className={getLinkClassName(href)}>
                  <span>{icon}</span>
                  <span>{label}</span>
                </button>
              </li>
            ))}
          </ul>
          <UserAvatar />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
