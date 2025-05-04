import { useParams, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

const ProjectLayout = () => {
  const { id } = useParams(); // Get :id from URL
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjectById = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`http://localhost:5001/home/project/${id}`, {
          withCredentials: true
        });
        console.log(response);

        if (response.status === 200 && response.data) {
          setCurrentProject(response.data);
        } else {
          throw new Error('Failed to fetch project');
        }
      } catch (err) {
        setError('Failed to load project');
        console.error("Error fetching project:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectById();
  }, [id]);

  if (loading) {
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
