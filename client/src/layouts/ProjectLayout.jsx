import { useParams, Outlet } from 'react-router-dom';
import { useGetProjectByIdQuery } from '../redux/slices/projectSlice';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const ProjectLayout = () => {
  const { id } = useParams(); // Get :id from URL

  // Use your RTK Query hook to fetch project details by id.
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
        <div className="flex-grow flex items-center justify-center pt-16 lg:pt-0">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0b80c3]"></div>
            <p className="text-[#546e7a]">Loading project...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !currentProject) {
    return (
      <div className="flex h-screen bg-[var(--background-primary)]">
        <Sidebar />
        <div className="flex-grow flex items-center justify-center pt-16 lg:pt-0">
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
      <div className="flex-grow flex flex-col overflow-hidden w-full
        pt-16 lg:pt-0">
        {/* Navbar */}
        <div className="flex-none">
          <Navbar project={currentProject} />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Pass currentProject to nested components using Outlet */}
          <Outlet context={{ currentProject }} />
        </div>
      </div>
    </div>
  );
};

export default ProjectLayout;
