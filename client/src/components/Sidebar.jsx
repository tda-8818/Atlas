import { useState, useMemo, useCallback, useEffect } from 'react';
import logo from '../assets/logo.png';
import { RxHome } from "react-icons/rx";
import { MdOutlineFolderOpen, MdMenu, MdClose } from "react-icons/md";
import { useNavigate, useLocation } from 'react-router-dom';
import { useProjects } from '../contexts/ProjectsContext';

const navItems = [
  { label: "Projects", icon: <RxHome />, href: "/projects" }
];

const Sidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopExpanded, setDesktopExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Use context to get projects data (instead of making another API call)
  const { projectsData = [] } = useProjects();

  // Memoize sorted projects to avoid re-sorting on every render
  const sortedProjects = useMemo(() => {
    return [...projectsData].sort((a, b) =>
      a.title.localeCompare(b.title)
    );
  }, [projectsData]);

  // Check if current path matches navigation item
  const isActivePath = useCallback((href) => {
    return location.pathname === href;
  }, [location.pathname]);

  // Check if current project is active
  const isActiveProject = useCallback((projectId) => {
    return location.pathname.includes(`/projects/${projectId}`);
  }, [location.pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileOpen]);

  const toggleMobile = useCallback(() => {
    setMobileOpen(prev => !prev);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setDesktopExpanded(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setDesktopExpanded(false);
  }, []);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[var(--background)] border-b-2 border-[var(--border-color)] z-50 flex items-center justify-between px-4">
        <a href="/projects" className="flex items-center gap-3">
          <img
            src={logo}
            alt="Atlas Logo"
            className="w-10 h-10 rounded-full object-cover shadow-md"
          />
          <div className="flex flex-col justify-center">
            <h1 className="text-xl font-black bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] bg-clip-text text-transparent leading-tight">
              Atlas
            </h1>
            <p className="text-[10px] text-[var(--text-muted)] font-medium leading-tight">
              Navigate & Conquer
            </p>
          </div>
        </a>
        <button
          onClick={toggleMobile}
          className="p-2 rounded-lg hover:bg-[var(--color-bg-light-secondary)] text-[var(--color-primary)] transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <MdClose className="text-2xl" /> : <MdMenu className="text-2xl" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={toggleMobile}
        />
      )}

      {/* Hover Trigger Area - Desktop Only */}
      <div
        className="hidden lg:block fixed top-0 left-0 w-16 h-full z-30"
        onMouseEnter={handleMouseEnter}
      />

      {/* Sidebar */}
      <nav
        className={`fixed top-0 left-0 h-full z-40 transition-all duration-300 ease-in-out
          bg-[var(--background)] border-r-2 border-[var(--border-color)]
          flex flex-col py-4 w-64
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          ${desktopExpanded ? 'lg:translate-x-0' : 'lg:-translate-x-full'}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Logo */}
        <div className="flex px-5 mb-6 items-center gap-3">
          <a href="/projects" className="flex items-center gap-3 group transition-all duration-300">
            <img
              src={logo}
              alt="Atlas Logo"
              className="w-10 h-10 rounded-full object-cover shrink-0 shadow-md group-hover:shadow-lg transition-shadow duration-300"
            />
            <div className="flex flex-col justify-center min-w-0">
              <h1 className="text-xl font-black bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] bg-clip-text text-transparent truncate leading-tight">
                Atlas
              </h1>
              <p className="text-[10px] text-[var(--text-muted)] font-medium truncate leading-tight">
                Navigate & Conquer
              </p>
            </div>
          </a>
        </div>

        {/* Nav Links */}
        <ul className="flex flex-col px-3 space-y-1 mb-4">
          {navItems.map(({ label, icon, href }) => {
            const isActive = isActivePath(href);
            return (
              <li key={label} className="w-full">
                <a href={href} className="block w-full">
                  <button
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl
                      transition-all duration-200 cursor-pointer overflow-hidden
                      ${isActive
                        ? 'bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-primary-light)]/10 text-[var(--color-primary)] shadow-sm'
                        : 'text-[var(--nav-text)] hover:bg-[var(--color-bg-light-secondary)] hover:text-[var(--color-primary)]'
                      }`}
                  >
                    <span className={`text-xl shrink-0 ${isActive ? 'scale-110' : ''} transition-transform duration-200`}>
                      {icon}
                    </span>
                    <span className="truncate min-w-0 font-semibold">
                      {label}
                    </span>
                  </button>
                </a>
              </li>
            );
          })}
        </ul>

        {/* Project List Header */}
        <div className="px-4 pb-3 flex items-center justify-between transition-all duration-300">
          <h2 className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
            Your Projects ({sortedProjects.length})
          </h2>
        </div>

        {/* Project List */}
        <ul className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {sortedProjects.length > 0 ? (
            sortedProjects.map((project) => {
              const isActive = isActiveProject(project._id);
              return (
                <li key={project._id} className="w-full">
                  <button
                    onClick={() => navigate(`/projects/${project._id}/dashboard`)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl
                      transition-all duration-200 cursor-pointer overflow-hidden group
                      ${isActive
                        ? 'bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-primary-light)]/10 text-[var(--color-primary)] shadow-sm'
                        : 'text-[var(--nav-text)] hover:bg-[var(--color-bg-light-secondary)] hover:text-[var(--color-primary)]'
                      }`}
                    title={project.title}
                  >
                    <MdOutlineFolderOpen className={`text-lg shrink-0 ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--text-muted)]'} group-hover:text-[var(--color-primary)] transition-colors duration-200`} />
                    <span className="truncate min-w-0">
                      {project.title}
                    </span>
                  </button>
                </li>
              );
            })
          ) : (
            <li className="px-4 py-6 text-center">
              <p className="text-xs text-[var(--text-muted)]">
                No projects yet
              </p>
            </li>
          )}
        </ul>
      </nav>
    </>
  );
};

export default Sidebar;
