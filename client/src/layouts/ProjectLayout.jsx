import { useParams, Outlet } from 'react-router-dom';
import { useGetProjectsQuery } from '../redux/slices/apiSlice';

const mockProjects = [
  { id: 1, title: 'Design System' },
  { id: 2, title: 'Marketing Site' },
  { id: 3, title: 'Project A' },
];


const ProjectLayout = () => {
  const { id } = useParams();

  //FOR WHEN PROJECTS ARE FETCHED FROM THE BACKEND
  ///////////////////////////////////////////////////////////////////////////////////
  // const { data: projects, isLoading } = useGetProjectsQuery();

  // const currentProject = projects?.find(p => String(p.id) === id);

  // if (isLoading || !currentProject) {
  //   return <div className="p-6 text-gray-500">Loading project...</div>;
  // }
/////////////////////////////////////////////////////////////////////////////////////
  //FOR MOCK DATA
    // Find the current project from the mock data using the ID from the URL
    const currentProject = mockProjects.find((project) => project.id === parseInt(id));

    // If no matching project is found, display a "Project not found" message
    if (!currentProject) {
      return <div className="text-center text-red-500">Project not found</div>;
    }

  return (
    <div className="flex-1 overflow-auto">
      {/* <Outlet context={{ currentProject }} /> */}
      <Outlet context={currentProject} />

    </div>
  );
};

export default ProjectLayout;
