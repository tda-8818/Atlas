import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useGetCurrentUserProjectsQuery, useCreateProjectMutation, useDeleteProjectMutation } from '../redux/slices/projectSlice';
import { useNavigate } from "react-router-dom";
import UserAvatar from "../components/UserAvatar";
import { LuClock } from "react-icons/lu";

const Projects = () => {

    const navigate = useNavigate();
    

    // Use RTK Query hook to fetch projects
    const {
        data: projectsData = [],
        isLoading: projectsLoading,
        isError: projectsError,
        refetch,
    } = useGetCurrentUserProjectsQuery();
    

    const [createProject] = useCreateProjectMutation();
    const [deleteProject] = useDeleteProjectMutation();

    // Local UI state to handle modal visibility and new project form inputs.
    const [showModal, setShowModal] = useState(false);
    const [newProject, setNewProject] = useState({
        title: "",
        description: "",
        deadline: ""
    });

    // If either current user or projects are loading, display a loading state.
    //if (userLoading || projectsLoading) return <div>Loading...</div>;
    //if (userError || projectsError) return <div>Error loading data</div>;

    // Optional: Transform projectsData if needed. For example, if your API returns data with _id etc.
    const projects = Array.isArray(projectsData)
        ? projectsData.map((project) => ({
            id: project._id,
            title: project.title,
            description: project.description,
            progress: project.progress,
            daysLeft: project.daysLeft,
            team: ["/avatars/avatar1.png"],
        }))
        : [];


    const handleProjectClick = async (project) => {
        try {
            // Redirect to project-specific dashboard
            navigate(`/projects/${project.id}/dashboard`);
        } catch (error) {
            console.error("Error in handleProjectClick:", error);
        }
    };

    //handles delete project when user chooses to delete
    const handleDeleteProject = async (e, projectId) => {
        e.stopPropagation(); // prevent triggering navigation

        if (window.confirm("Are you sure you want to delete this project?")) {
            try {
                await deleteProject(projectId).unwrap();
                // RTK Query auto-invalidates or you can call refetch
                refetch();
            } catch (error) {
                console.error("Error deleting project", error);
            }
        }
    };

    //handles opening modal whne user clicks Add proejct
    const handleAddProjectClick = () => setShowModal(true);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProject((prev) => ({ ...prev, [name]: value }));
    };


    //function for creating a project one user completes modal inputs
    const handleCreateProject = async () => {
        if (!newProject.title || !newProject.description || !newProject.deadline) {
          alert("Please fill all fields!");
          return;
        }
      
        // Calculate daysLeft
        const today = new Date();
        const deadline = new Date(newProject.deadline);
        const daysLeft = Math.max(
          Math.ceil((deadline - today) / (1000 * 60 * 60 * 24)),
          0
        );
      
        const projectData = {
          title: newProject.title,
          description: newProject.description,
          progress: 0,
          endDate: deadline,
          startDate: today,
          team: ["/avatars/avatar1.png"]
        };
      
        try {
          // createProject RTK Query mutation hook
          await createProject(projectData).unwrap();
      
          // Clear the form inputs after successful creation
          setNewProject({ title: "", description: "", deadline: "" });
      
          // Refresh the list if needed
          refetch();
        } catch (error) {
          console.error("Error creating project", error);
        }
      };

    return (
        <div className="flex h-screen bg-[var(--background-primary)]">
            <Sidebar />
            <div className="flex-grow p-10 ml-[240px] overflow-y-auto">
                <div className="flex justify-between items-center mb-8 pr-5">
                    <h1 className="text-3xl font-bold text-[var(--text)]">Projects</h1>
                    <UserAvatar />
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
                                onClick={(e) => handleDeleteProject(e, project.id)}
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
                                        <span>{project.daysLeft} Days Left</span>
                                    </div>
                                    <div className="flex -space-x-2">
                                        {project.team.map((avatar, i) => (
                                            <img
                                                key={i}
                                                src={avatar}
                                                alt="team"
                                                className="w-6 h-6 rounded-full border-2 border-white"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Add Project Card */}
                    <div
                        onClick={handleAddProjectClick}
                        className="bg-[var(--background)] border-2 border-dashed border-gray-300 rounded-2xl w-[300px] h-[200px] flex justify-center items-center cursor-pointer hover:border-[#187cb4] hover:bg-[var(--background-primary)] transition-all"
                    >
                        <div className="flex flex-col items-center text-gray-500">
                            <div className="text-[40px] font-bold text-[#187cb4]">+</div>
                            <div className="mt-2 text-base">New Project</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-xl w-[400px] text-center animate-fadeIn">
                        <h2 className="text-xl font-bold mb-4">Create New Project</h2>
                        <input
                            type="text"
                            name="title"
                            value={newProject.title}
                            onChange={handleInputChange}
                            placeholder="Project Name"
                            className="w-full p-2 mb-3 border border-gray-300 rounded"
                        />
                        <input
                            type="text"
                            name="description"
                            value={newProject.description}
                            onChange={handleInputChange}
                            placeholder="Description"
                        />
                        <input
                            type="date"
                            name="deadline"
                            value={newProject.deadline}
                            onChange={handleInputChange}
                            className="w-full p-2 mb-3 border border-gray-300 rounded"
                        />
                        <div className="flex justify-between mt-5">
                            <button onClick={handleCreateProject} className="px-4 py-2 bg-[#5b5fc7] text-white rounded">Create</button>
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-300 text-white rounded">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Projects;
