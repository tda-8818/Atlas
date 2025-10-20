// Projects.jsx
import React, { useState, useEffect, useRef } from "react";
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

    const [createProject, { error: createProjectError }] =
      useCreateProjectMutation();
    const [deleteProject, { error: deleteProjectError }] =
      useDeleteProjectMutation();
      const { data: userId } = useGetCurrentUserQuery();

    // Local UI state to handle modal visibility and new project form inputs.
    const [showModal, setShowModal] = useState(false);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState({title:""});
    // Show error toasts when API errors occur


    // State to hold project users.
    const [projectUsers, setProjectUsers] = useState({}); // { [projectId]: [user objects] }
    const [fetchProjectUsers] = useLazyGetProjectUsersQuery();

    useEffect(() => {
      const loadUsersForProjects = async () => {
        if (!projectsData || !Array.isArray(projectsData)) return;

        // Fetch all project users in parallel instead of sequentially
        const promises = projectsData.map(async (project) => {
          try {
            const result = await fetchProjectUsers(project._id).unwrap();
            return { projectId: project._id, users: result };
          } catch (err) {
            console.error(`Failed to load users for project ${project._id}`, err);
            return { projectId: project._id, users: [] };
          }
        });

        // Wait for all requests to complete in parallel
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
          `Failed to load projects: ${projectsErrorData.data?.message || "Unknown error"
          }`,
          { duration: 5000 }
        );
      }
      if (createProjectError) {
        toast.error(
          `Failed to create project: ${createProjectError.data?.message || "Unknown error"
          }`,
          { duration: 5000 }
        );
      }
      if (deleteProjectError) {
        toast.error(
          `Failed to delete project: ${deleteProjectError.data?.message || "Unknown error"
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
      dueDate: project.dueDate,
      owner: project.owner,
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
        `Failed to delete project: ${error.data?.message || "Unknown error"
        }`,
        error.status || "400"
      );
    }
    setSelectedProject({ title: "", id: "" });
    setShowDeleteConfirmModal(false);
  };

  const handleAddProjectClick = () => setShowModal(true);

  const handleCreateProject = async (formData) => {
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
      toast.error(
        `Failed to create project: ${error.data?.message || "Unknown error"
        }`,
        error.status || "400"
      );
    }
  };

    
  return (
    <PageLayout title="Projects">
      <button
        onClick={handleAddProjectClick}
        className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-md hover:bg-[#0f5b8c] transition-colors duration-200 mb-4"
      >
        + Add Project
      </button>

      <div className="flex flex-wrap gap-5">
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