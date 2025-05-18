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
import PageLayout from "../layouts/PageLayout.jsx";
import { useGetCurrentUserQuery } from "../redux/slices/userSlice.js";
import ProjectCard from "../components/ProjectCard.jsx";
import { isProjectOwner } from "../utils/projectUtils.jsx";;
import NotificationComponent from "../components/NotificationComponent";

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
  const [showDeleteConfirmModal,  setShowDeleteConfirmModal] = useState(false);
  const [selectedProject,  setSelectedProject] = useState({ title: "" });

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

    
    // Sample notifications with invitation types
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            type: 'invitation',
            title: 'Project Invitation',
            message: 'John Doe invited you to be a member of Project Alpha',
            projectId: 'project-alpha-id',
            createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
            read: false,
            responded: false,
            accepted: null
        },
        {
            id: 2,
            type: 'invitation',
            title: 'Project Invitation',
            message: 'Jane Smith invited you to be a member of Design Revamp',
            projectId: 'design-revamp-id',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            read: false,
            responded: false,
            accepted: null
        },
        {
            id: 3,
            type: 'general',
            title: 'Due date approaching',
            message: 'Task "Create wireframes" is due tomorrow',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
            read: true
        }
    ]);
    
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

    // Notification handling functions
    const handleMarkAsRead = (id) => {
        setNotifications(prevNotifications => 
            prevNotifications.map(notification => 
                notification.id === id ? { ...notification, read: true } : notification
            )
        );
    };
    
    const handleMarkAllAsRead = () => {
        setNotifications(prevNotifications => 
            prevNotifications.map(notification => ({ ...notification, read: true }))
        );
    };
    
    const handleAcceptInvitation = (notificationId, projectId) => {
        // Here you would typically make an API call to accept the invitation
        console.log(`Accepting invitation for project ${projectId}`);
        
        // Update the notification to show it's been accepted
        setNotifications(prevNotifications => 
            prevNotifications.map(notification => 
                notification.id === notificationId 
                    ? { ...notification, responded: true, accepted: true, read: true } 
                    : notification
            )
        );
        
        // Show success message
        toast.success("Project invitation accepted");
        
        // Optionally refresh projects list to show the newly joined project
        refetch();
    };
    
    const handleDeclineInvitation = (notificationId, projectId) => {
        // Here you would typically make an API call to decline the invitation
        console.log(`Declining invitation for project ${projectId}`);
        
        // Update the notification to show it's been declined
        setNotifications(prevNotifications => 
            prevNotifications.map(notification => 
                notification.id === notificationId 
                    ? { ...notification, responded: true, accepted: false, read: true } 
                    : notification
            )
        );
        
        // Show info message
        toast.error("Project invitation declined");
    };

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
      refetch();
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
        <div className="flex h-screen bg-[var(--background-primary)]">
            <Sidebar />
            <div className="flex-grow p-10 ml-[240px] overflow-y-auto">
                <div className="flex justify-between items-center mb-8 pr-5">
                    <h1 className="text-3xl font-bold text-[var(--text)]">Projects</h1>
                    <div className="flex items-center gap-4">
                        {/* Notification Component with Accept/Decline functionality */}
                        <NotificationComponent 
                            notifications={notifications}
                            onMarkAsRead={handleMarkAsRead}
                            onMarkAllAsRead={handleMarkAllAsRead}
                            onAcceptInvitation={handleAcceptInvitation}
                            onDeclineInvitation={handleDeclineInvitation}
                        />
                        <UserAvatar />
                    </div>
                </div>

                <div className="flex flex-wrap gap-5">
                    {projects.map((project, index) => (
                        <div
                            key={index}
                            className="relative bg-[var(--background)] rounded-2xl shadow-md p-5 w-[300px] cursor-pointer hover:shadow-lg transition-shadow duration-200"
                            onClick={() => handleProjectClick(project)}
                        >
                            {/* Delete Button */}
                            <button
                                onClick={(e) =>{ e.stopPropagation(); setSelectedProject(project); setShowDeleteConfirmModal(true)}}
                                className="absolute p-1 top-2 right-2 text-gray-400 hover:text-red-500 z-5 cursor-pointer"
                                title="Delete Project"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </button>
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