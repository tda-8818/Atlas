import React, { useState, useEffect } from "react";
import { useGetCurrentUserProjectsQuery, useCreateProjectMutation, useDeleteProjectMutation } from '../redux/slices/projectSlice';
import { useNavigate } from "react-router-dom";
import UserAvatar from "../components/avatar/UserAvatar.jsx";
import { LuClock } from "react-icons/lu";
import toast from 'react-hot-toast';
import AddProjectModal from "../components/modals/AddProjectModal.jsx";
import DeleteProjectModal from "../components/modals/DeleteProjectModal.jsx"
import { calculateDaysLeft } from "../utils/projectUtils.jsx";
import PageLayout from "../layouts/PageLayout.jsx";
import { useGetCurrentUserQuery } from "../redux/slices/userSlice.js";
import { useLazyGetProjectUsersQuery } from '../redux/slices/projectSlice';


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

    const [createProject, { error: createProjectError }] = useCreateProjectMutation();
    const [deleteProject, { error: deleteProjectError }] = useDeleteProjectMutation();
    const { data: userId } = useGetCurrentUserQuery();

    // Local UI state to handle modal visibility and new project form inputs.
    const [showModal, setShowModal] = useState(false);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState({ title: '' });

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
                `Failed to load projects: ${projectsErrorData.data?.message || 'Unknown error'}`,
                { duration: 5000 }
            );
        }
        if (createProjectError) {
            toast.error(
                `Failed to create project: ${createProjectError.data?.message || 'Unknown error'}`,
                { duration: 5000 }
            );
        }
        if (deleteProjectError) {
            toast.error(
                `Failed to delete project: ${deleteProjectError.data?.message || 'Unknown error'}`,
                { duration: 5000 }
            );
        }
    }, [projectsError, projectsErrorData, createProjectError, deleteProjectError]);

    // Optional: Transform projectsData if needed. For example, if your API returns data with _id etc.
    const projects = Array.isArray(projectsData)
        ? projectsData.map((project) => ({
            id: project._id,
            title: project.title,
            description: project.description,
            progress: project.progress,
            daysLeft: project.daysLeft,
            team: projectUsers[project._id] || [],
        }))
        : [];

    const handleProjectClick = async (project) => {
        try {
            // Redirect to project-specific dashboard
            navigate(`/projects/${project.id}/dashboard`);
        } catch (error) {
            console.error("Error in handleProjectClick:", error);
            toast.error("Error navigating to project", "400");
        }
    };

    //handles delete project when user chooses to delete
    const handleDeleteProject = async () => {
        console.log("current selected project: ", selectedProject)
        try {
            await deleteProject(selectedProject.id).unwrap();
            // Show success toast
            toast.success("Project deleted successfully");
            // RTK Query auto-invalidates or you can call refetch

        } catch (error) {
            console.error("Error deleting project", error);
            toast.error(
                `Failed to delete project: ${error.data?.message || 'Unknown error'}`,
                error.status || '400'
            );
        }
        setSelectedProject({ title: '', id: '' });
        setShowDeleteConfirmModal(false);
    };

    //handles opening modal whne user clicks Add proejct
    const handleAddProjectClick = () => setShowModal(true);


    //function for creating a project one user completes modal inputs
    const handleCreateProject = async (formData) => {
        if (!formData.title || !formData.dueDate) {
            toast.error("Please fill all fields!", { duration: 3000 });
            return;
        }

        console.log("current new project ", formData);


        try {

            const projectData = {
                title: formData.title,
                description: formData.description,
                startDate: new Date(), // Backend should handle consistent date formatting
                endDate: new Date(formData.dueDate), // Ensure backend can parse this format
                owner: userId,  //  Include the owner.  You'll need the current user's ID.
            };

            // createProject RTK Query mutation hook
            await createProject(projectData).unwrap();

            // Show success toast
            toast.success("Project created successfully");

            // Clear the form inputs after successful creation


            // Close the modal
            setShowModal(false);

            // Refresh the list if needed
            refetch();
        } catch (error) {
            console.error("Error creating project", error);
            toast.error(
                `Failed to create project: ${error.data?.message || 'Unknown error'}`,
                error.status || '400'
            );
        }
    };

    return (
        <PageLayout title="Projects">
            <button
                onClick={handleAddProjectClick}
                className="bg-[#187cb4] text-white px-4 py-2 rounded-md hover:bg-[#0f5b8c] transition-colors duration-200 mb-4"
            >
                +Add Project
            </button>

            <div className="flex flex-wrap gap-5">
                {projects.map((project, index) => (
                    <div
                        key={index}
                        className="relative bg-[var(--background)] rounded-2xl shadow-md p-5 w-[300px] cursor-pointer hover:shadow-lg transition-shadow duration-200"
                        onClick={() => handleProjectClick(project)}
                    >
                        {/* Delete Button */}
                        <button
                            onClick={(e) => { e.stopPropagation(); setSelectedProject(project); setShowDeleteConfirmModal(true) }}
                            className="absolute p-1 top-2 right-2 text-gray-400 hover:text-red-500 z-5 cursor-pointer"
                            title="Delete Project"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </button>

                        <div className="flex flex-col gap-3">
                            <div>
                                <h2 className="text-lg font-semibold text-[var(--text)]">{project.title}</h2>
                                <p className="text-sm text-[var(--text-muted)] mt-1">{project.description}</p>
                            </div>

                            <div>
                                <div className="flex justify-between items-center text-sm text-[var(--text)] mb-1">
                                    <span>Progress</span>
                                    <span>{project.progress}%</span>
                                </div>
                                <div className="w-full bg-[var(--background-primary)] h-2 rounded-full overflow-hidden">
                                    <div
                                        className="bg-[#5b5fc7] h-2 rounded-full"
                                        style={{ width: `${project.progress}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-xs text-[var(--text)] mt-3">
                                <div className="flex items-center gap-1">
                                    <LuClock />
                                    <span>{calculateDaysLeft(project.dueDate)} Days Left</span>
                                </div>
                                <div className="flex -space-x-2">
                                    {!project.team.length ? (
                                        <span className="text-xs text-gray-400">Loading...</span>
                                    ) : (
                                        project.team.map((user, i) => <UserAvatar key={i} user={user} />)
                                    )}

                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <AddProjectModal show={showModal} onAddProject={handleCreateProject} onCancel={() => { setShowModal(false); }} />
            <DeleteProjectModal show={showDeleteConfirmModal} projectName={selectedProject.title} onDeleteConfirm={handleDeleteProject} onCancel={() => { setShowDeleteConfirmModal(false); }} />
        </PageLayout>
    );
};

export default Projects;