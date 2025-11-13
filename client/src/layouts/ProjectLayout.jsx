import { useParams, Outlet } from 'react-router-dom';
import { useGetProjectByIdQuery } from '../redux/slices/projectSlice';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const ProjectLayout = () => {
  const { id } = useParams();

  const {
    data: currentProject,
    isLoading,
    error,
  } = useGetProjectByIdQuery(id, {
    skip: !id,
  });

  if (isLoading) {
    return (
      <div className="flex h-screen bg-[var(--background-primary)]">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center pt-16 lg:pt-0">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
            <p className="text-[var(--text-muted)]">Loading project...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !currentProject) {
    return (
      <div className="flex h-screen bg-[var(--background-primary)]">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center pt-16 lg:pt-0">
          <div className="text-center text-red-500">
            {error?.data?.message || "Project not found"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[var(--background-primary)]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden
        pt-16 lg:pt-0">
        <div className="flex-none">
          <Navbar project={currentProject} />
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <Outlet context={{ currentProject }} />
        </div>
      </div>
    </div>
  );
};

export default ProjectLayout;
