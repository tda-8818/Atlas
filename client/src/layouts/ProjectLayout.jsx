import { useParams, Outlet } from 'react-router-dom';

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
    return <div className="p-6 text-gray-500">Loading project...</div>;
  }

  if (error || !currentProject) {
    return <div className="text-center text-red-500">{error || "Project not found"}</div>;
  }

  return (
    <div className="flex-1 overflow-auto">
      {/* Pass currentProject to nested components using Outlet */}
      <Outlet context={{ currentProject }} />
    </div>
  );
};

export default ProjectLayout;
