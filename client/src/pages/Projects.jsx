// Projects.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useLazyGetProjectUsersQuery,
} from "../redux/slices/projectSlice";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AddProjectModal from "../components/modals/AddProjectModal.jsx";
import DeleteProjectModal from "../components/modals/DeleteProjectModal.jsx";
import PageLayout from "../layouts/PageLayout.jsx";
import { useGetCurrentUserQuery } from "../redux/slices/userSlice.js";
import ProjectCard from "../components/ProjectCard.jsx";
import { useProjects } from "../contexts/ProjectsContext.jsx";
import { MdAdd } from "react-icons/md";

const Projects = () => {
    const navigate = useNavigate();

    // Use context to get projects data (instead of making another API call)
    const {
        projectsData = [],
        projectsLoading,
        projectsError,
        projectsErrorData,
        refetchProjects,
    } = useProjects();

    const [createProject, { error: createProjectError }] = useCreateProjectMutation();
    const [deleteProject, { error: deleteProjectError }] = useDeleteProjectMutation();
    const { data: userId } = useGetCurrentUserQuery();

    // Local UI state to handle modal visibility and new project form inputs.
    const [showModal, setShowModal] = useState(false);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState({ title: "" });

    // State to hold project users.
    const [projectUsers, setProjectUsers] = useState({}); // { [projectId]: [user objects] }
    const [fetchProjectUsers] = useLazyGetProjectUsersQuery();

    // Memoized user loading to prevent unnecessary re-fetches
    useEffect(() => {
      const loadUsersForProjects = async () => {
        if (!projectsData || !Array.isArray(projectsData) || projectsData.length === 0) return;

        // Fetch all project users in parallel
        const promises = projectsData.map(async (project) => {
          try {
            const result = await fetchProjectUsers(project._id).unwrap();
            return { projectId: project._id, users: result };
          } catch (err) {
            console.error(`Failed to load users for project ${project._id}`, err);
            return { projectId: project._id, users: [] };
          }
        });

        const results = await Promise.all(promises);

        // Convert array of results into a map
        const userMap = results.reduce((acc, { projectId, users }) => {
          acc[projectId] = users;
          return acc;
        }, {});

        setProjectUsers(userMap);
      };

      loadUsersForProjects();
    }, [projectsData, fetchProjectUsers]);

    // Show error toasts when API errors occur
    useEffect(() => {
      if (projectsError && projectsErrorData) {
        toast.error(
          `Failed to load projects: ${projectsErrorData.data?.message || "Unknown error"}`,
          { duration: 5000 }
        );
      }
      if (createProjectError) {
        toast.error(
          `Failed to create project: ${createProjectError.data?.message || "Unknown error"}`,
          { duration: 5000 }
        );
      }
      if (deleteProjectError) {
        toast.error(
          `Failed to delete project: ${deleteProjectError.data?.message || "Unknown error"}`,
          { duration: 5000 }
        );
      }
    }, [projectsError, projectsErrorData, createProjectError, deleteProjectError]);



  // Memoize transformed projects to avoid unnecessary recalculations
  const projects = useMemo(() => {
    if (!Array.isArray(projectsData)) return [];

    return projectsData.map((project) => ({
      id: project._id,
      title: project.title,
      description: project.description,
      startDate: project.startDate,
      dueDate: project.dueDate,
      owner: project.owner,
      users: projectUsers[project._id] || [],
    }));
  }, [projectsData, projectUsers]);

  // Memoized callbacks to prevent unnecessary re-renders
  const handleProjectClick = useCallback((project) => {
    try {
      navigate(`/projects/${project.id}/dashboard`);
    } catch (error) {
      console.error("Error navigating to project:", error);
      toast.error("Error navigating to project");
    }
  }, [navigate]);

  const handleRequestDelete = useCallback((project) => {
    setSelectedProject(project);
    setShowDeleteConfirmModal(true);
  }, []);

  const handleDeleteProject = useCallback(async () => {
    try {
      await deleteProject(selectedProject.id).unwrap();
      toast.success("Project deleted successfully");
      refetchProjects();
    } catch (error) {
      console.error("Error deleting project", error);
      toast.error(`Failed to delete project: ${error.data?.message || "Unknown error"}`);
    }
    setSelectedProject({ title: "", id: "" });
    setShowDeleteConfirmModal(false);
  }, [selectedProject.id, deleteProject, refetchProjects]);

  const handleAddProjectClick = useCallback(() => setShowModal(true), []);

  const handleCreateProject = useCallback(async (formData) => {
    if (!formData.title || !formData.dueDate) {
      toast.error("Please fill all fields!", { duration: 3000 });
      return;
    }

    try {
      const projectData = {
        title: formData.title,
        description: formData.description,
        startDate: new Date(formData.startDate),
        dueDate: new Date(formData.dueDate),
        owner: userId,
      };

      await createProject(projectData).unwrap();
      toast.success("Project created successfully");
      setShowModal(false);
      refetchProjects();
    } catch (error) {
      console.error("Error creating project", error);
      toast.error(`Failed to create project: ${error.data?.message || "Unknown error"}`);
    }
  }, [userId, createProject, refetchProjects]);


  return (
    <PageLayout title="Projects">
      {/* Header Section with Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-6">
        <div>
          <p className="text-[#546e7a] text-sm">
            {projectsLoading ? "Loading projects..." : `${projects.length} ${projects.length === 1 ? 'Project' : 'Projects'}`}
          </p>
        </div>
        <button
          onClick={handleAddProjectClick}
          className="flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-[#0b80c3] to-[#0d9ae6] text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 w-full sm:w-auto justify-center"
        >
          <MdAdd className="text-xl" />
          Add Project
        </button>
      </div>

      {/* Projects Grid */}
      {projectsLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0b80c3]"></div>
            <p className="text-[#546e7a]">Loading your projects...</p>
          </div>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] sm:h-64 bg-white/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-[#bbdefb] mx-auto max-w-2xl">
          <div className="text-center px-6 py-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-gradient-to-br from-[#f0f8ff] to-[#e3f2fd] rounded-full flex items-center justify-center">
              <MdAdd className="text-3xl sm:text-4xl text-[#0b80c3]" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-[#0b80c3] mb-2">No Projects Yet</h3>
            <p className="text-sm sm:text-base text-[#546e7a] mb-6">Get started by creating your first project</p>
            <button
              onClick={handleAddProjectClick}
              className="px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-[#0b80c3] to-[#0d9ae6] text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 w-full sm:w-auto"
            >
              Create Your First Project
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              users={project.users}
              onProjectClick={handleProjectClick}
              onRequestDelete={handleRequestDelete}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <AddProjectModal
        show={showModal}
        onAddProject={handleCreateProject}
        onCancel={() => setShowModal(false)}
      />
      <DeleteProjectModal
        show={showDeleteConfirmModal}
        projectName={selectedProject.title}
        onDeleteConfirm={handleDeleteProject}
        onCancel={() => setShowDeleteConfirmModal(false)}
      />
    </PageLayout>
  );
};

export default Projects;