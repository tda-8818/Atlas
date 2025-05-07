import React, { useState } from 'react';
import { RxDashboard, RxCalendar } from "react-icons/rx";
import { LuChartGantt, LuSquareKanban } from "react-icons/lu";
import { useLocation, useNavigate } from 'react-router-dom';
import UserAvatar from './UserAvatar.jsx';
import axios from 'axios';

const ProjectHeader = ({ project, setCurrentProject }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(project?.title || '');

  if (!project) return <div>Loading project...</div>;

  const { _id } = project;

  const navLinks = [
    { label: 'Dashboard', icon: <RxDashboard />, href: `/project/${_id}/dashboard` },
    { label: 'Kanban Board', icon: <LuSquareKanban />, href: `/project/${_id}/kanban` },
    { label: 'Calendar', icon: <RxCalendar />, href: `/project/${_id}/calendar` },
    { label: 'Gantt Chart', icon: <LuChartGantt />, href: `/project/${_id}/gantt` },
  ];

  const getLinkClassName = (href) => {
    const isActive = location.pathname === href;
    return isActive
      ? 'flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--nav-hover)] text-[var(--text-hover)] transition duration-200 cursor-pointer'
      : 'flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg text-[var(--nav-text)] hover:bg-[var(--nav-hover)] hover:text-[var(--text-hover)] transition duration-200 cursor-pointer';
  };

  const saveTitle = async () => {
    if (!titleInput.trim() || titleInput.trim() === project.title) {
      setIsEditingTitle(false);
      return;
    }

    try {
      const res = await axios.put(`http://localhost:5001/projects/${project._id}`, {
        title: titleInput.trim()
      }, { withCredentials: true });

      if (res.status === 200) {
        setCurrentProject(prev => ({ ...prev, title: titleInput.trim() }));
      } else {
        alert('Failed to update title');
      }
    } catch (error) {
      console.error("Error saving title:", error);
      alert('Error updating title');
    } finally {
      setIsEditingTitle(false);
    }
  };

  return (
    <header className="bg-[var(--background)] border-b border-[var(--border-color)] shadow-sm">
      <div className="px-4 py-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col min-w-0 flex-1">
          {isEditingTitle ? (
            <input
              className="text-[1.2rem] font-bold text-[var(--text)] bg-white border border-gray-300 px-2 py-1 rounded w-full"
              value={titleInput}
              autoFocus
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => e.key === 'Enter' && saveTitle()}
            />
          ) : (
            <h1
              className="font-bold text-[var(--text)] text-[1.2rem] truncate cursor-pointer"
              onDoubleClick={() => setIsEditingTitle(true)}
              title={project.title}
            >
              {project.title || 'Project Name'}
            </h1>
          )}
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

export default ProjectHeader;
