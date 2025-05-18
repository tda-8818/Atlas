// Projects.jsx
import React, { useState, useEffect } from "react";
import {
  useGetCurrentUserProjectsQuery,
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useLazyGetProjectUsersQuery,
} from "../redux/slices/projectSlice";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AddProjectModal from "../components/modals/AddProjectModal.jsx";
import DeleteProjectModal from "../components/modals/DeleteProjectModal.jsx";
import { calculateDaysLeft } from "../utils/projectUtils";
import PageLayout from "../layouts/PageLayout.jsx";
import { useGetCurrentUserQuery } from "../redux/slices/userSlice.js";
import ProjectCard from "../components/ProjectCard.jsx";

const Projects = () => {
  const navigate = useNavigate();

  // Use RTK Query hook to fetch projects
  const {
    data: projectsData = [],
    isLoading: projectsLoading,
    isError: projectsError,
    error: projectsErrorData,
    refetch,
  } = useGetCurrentUserProjectsQuery();

  const [createProject, { error: createProjectError }] =
    useCreateProjectMutation();
  const [deleteProject, { error: deleteProjectError }] =
    useDeleteProjectMutation();
  const { data: userId } = useGetCurrentUserQuery();

  // Local UI state for modals
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState({ title: "" });

  // State to hold project users.
  const [projectUsers, setProjectUsers] = useState({}); // { [projectId]: [user objects] }
  const [fetchProjectUsers] = useLazyGetProjectUsersQuery();

  useEffect(() => {
    const loadUsersForProjects = async () => {
      if (!projectsData || !Array.isArray(projectsData)) return;

      const userMap = {};
      for (const project of projectsData) {
        try {
          const result = await fetchProjectUsers(project._id).unwrap();
          userMap[project._id] = result;
        } catch (err) {
          console.error(`Failed to load users for project ${project._id}`, err);
        }
      }
      setProjectUsers(userMap);
    };

    loadUsersForProjects();
  }, [projectsData, fetchProjectUsers]);

  // Show error toasts when API errors occur
  useEffect(() => {
    if (projectsError && projectsErrorData) {
      toast.error(
        `Failed to load projects: ${
          projectsErrorData.data?.message || "Unknown error"
        }`,
        { duration: 5000 }
      );
    }
    if (createProjectError) {
      toast.error(
        `Failed to create project: ${
          createProjectError.data?.message || "Unknown error"
        }`,
        { duration: 5000 }
      );
    }
    if (deleteProjectError) {
      toast.error(
        `Failed to delete project: ${
          deleteProjectError.data?.message || "Unknown error"
        }`,
        { duration: 5000 }
      );
    }
  }, [projectsError, projectsErrorData, createProjectError, deleteProjectError]);

  // Transform the projects data if needed.
  const projects = Array.isArray(projectsData)
    ? projectsData.map((project) => ({
        id: project._id,
        title: project.title,
        description: project.description,
        startDate: project.startDate,
        endDate: project.endDate,
        // Pass the loaded users (or an empty array if not loaded yet)
        users: projectUsers[project._id] || [],
      }))
    : [];

  const handleProjectClick = (project) => {
    try {
      navigate(`/projects/${project.id}/dashboard`);
    } catch (error) {
      console.error("Error navigating to project:", error);
      toast.error("Error navigating to project", "400");
    }
  };

  const handleRequestDelete = (project) => {
    setSelectedProject(project);
    setShowDeleteConfirmModal(true);
  };

  const handleDeleteProject = async () => {
    try {
      await deleteProject(selectedProject.id).unwrap();
      toast.success("Project deleted successfully");
    } catch (error) {
      console.error("Error deleting project", error);
      toast.error(
        `Failed to delete project: ${
          error.data?.message || "Unknown error"
        }`,
        error.status || "400"
      );
    }
    setSelectedProject({ title: "", id: "" });
    setShowDeleteConfirmModal(false);
  };

  const handleAddProjectClick = () => setShowModal(true);

  const handleCreateProject = async (formData) => {
    if (!formData.title || !formData.endDate) {
      toast.error("Please fill all fields!", { duration: 3000 });
      return;
    }

    try {
      const projectData = {
        title: formData.title,
        description: formData.description,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        owner: userId,
      };

      await createProject(projectData).unwrap();

      toast.success("Project created successfully");
      setShowModal(false);
      refetch();
    } catch (error) {
      console.error("Error creating project", error);
      toast.error(
        `Failed to create project: ${
          error.data?.message || "Unknown error"
        }`,
        error.status || "400"
      );
    }
  };

  return (
    <PageLayout title="Projects">
      <button
        onClick={handleAddProjectClick}
        className="bg-[#187cb4] text-white px-4 py-2 rounded-md hover:bg-[#0f5b8c] transition-colors duration-200 mb-4"
      >
        + Add Project
      </button>

      <div className="flex flex-wrap gap-5">
        {projects.map((project, index) => (
          <ProjectCard
            key={project.id}
            project={project}
            users={project.users}
            onProjectClick={handleProjectClick}
            onRequestDelete={handleRequestDelete}
          />
        ))}
      </div>

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