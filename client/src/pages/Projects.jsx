import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useGetUserProjectsQuery, useCreateProjectMutation, useDeleteProjectMutation } from '../redux/slices/projectSlice';
import axios from "axios";
import { useNavigate } from "react-router-dom";

// --- Avatar and stringToColor Utilities (Copy from AddProjectModal.jsx if not in shared file) ---
// It's best to put these in a separate utility file and import them in both Home.jsx and AddProjectModal.jsx
const Avatar = ({ user, size = "small" }) => {
  if (!user) return null;

  const sizeClass = size === "small" ? "w-6 h-6 text-xs" : "w-8 h-8 text-sm";

  return (
    <div className={`relative rounded-full overflow-hidden ${sizeClass} flex items-center justify-center flex-shrink-0`}>
      {user.avatar ? (
        <img
          src={user.avatar}
          alt={user.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}
      <div
        className={`absolute inset-0 text-white flex items-center justify-center ${user.avatar ? 'hidden' : ''}`}
        style={{ backgroundColor: stringToColor(user.name) }}
      >
        {user.initials}
      </div>
    </div>
  );
};

const stringToColor = (str) => {
  if (!str) return '#000000';

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
};
// --- End of Utilities ---


// Example static teamMembers data (replace with backend data if needed)
const allTeamMembers = [
  { id: "user-1", name: "Alex Johnson", avatar: "/avatars/avatar1.png", initials: "AJ" },
  { id: "user-2", name: "Sarah Wilson", avatar: "/avatars/avatar2.png", initials: "SW" },
  { id: "user-3", name: "David Chen", avatar: "/avatars/avatar3.png", initials: "DC" },
  { id: "user-4", name: "Emma Rodriguez", avatar: "/avatars/avatar4.png", initials: "ER" },
  { id: "user-5", name: "Michael Brown", avatar: "/avatars/avatar5.png", initials: "MB" },
];

// Function to get team member details by ID
const getTeamMemberDetails = (userId) => {
    return allTeamMembers.find(member => member.id === userId);
};
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
    } = useGetUserProjectsQuery();
    

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
            // console.log("Clicked Project:", project);
            // const response = await axios.post(`http://localhost:5001/projects/${project.id}`, project, {
            //     withCredentials: true
            // });
            
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
          daysLeft,
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
            <Navbar />
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
  return (
    <div className="flex h-screen bg-[var(--background-primary)]">
      <Navbar />
      <div className="flex-grow p-10 ml-[240px] overflow-y-auto">
        {/* Use firstName from state */}
        <h1 className="text-3xl font-bold mb-8 text-[var(--text)]">Hello, {firstName || 'User'}</h1> {/* Display user's name */}
        <h2 className="text-2xl font-semibold mb-6 text-[var(--text)]">Your Projects</h2> {/* Added a heading for the project list */}
        <div className="flex flex-wrap gap-5">
          {projects.map((project) => (
            <div
              key={project.id}
              // Removed direct onClick for navigation on the whole card
              className="bg-white rounded-2xl shadow-md p-5 w-[300px] min-h-[200px] flex flex-col justify-between cursor-pointer hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex flex-col gap-2">
                {/* Project Title and Edit Button */}
                <div className="flex justify-between items-start mb-2">
                    {/* Make title clickable to navigate */}
                    <h3 className="text-lg font-semibold text-gray-800 flex-grow cursor-pointer hover:underline" onClick={() => handleProjectClick(project)}>{project.title}</h3> {/* Used h3, added underline hover */}
                    {/* Edit Button with Professional Icon */}
                    <button
                       onClick={(e) => {
                           e.stopPropagation(); // Prevent card click
                           handleEditProjectClick(project); // Call edit handler
                       }}
                       className="text-gray-400 hover:text-blue-600 ml-2 p-1 rounded hover:bg-gray-100 transition-colors"
                       title="Edit Project"
                    >
                        {/* Professional Pencil Icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 2.276a.75.75 0 011.06 0l1.06 1.06c.014.014.028.028.042.042L19.5 4.25l-2.25-2.25L16.862 2.276zM15 4.5l1.5 1.5m-1.5 1.5l-8.88 8.88a1.5 1.5 0 000 2.12l1.06 1.06a1.5 1.5 0 002.12 0l8.88-8.88m-1.5-1.5l1.5 1.5m-1.5-1.5l8.88-8.88a1.5 1.5 0 000-2.12l-1.06-1.06a1.5 1.5 0 00-2.12 0l-8.88 8.88m-1.5-1.5l-1.5 1.5" />
                        </svg>
                    </button>
                </div>

                

                {/* Progress Bar (If you want to keep it) */}
                {/* Remove this div if you only want title, dates, and avatars */}
                <div>
                  <div className="flex justify-between items-center text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#5b5fc7] h-2 rounded-full"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
                {/* Bottom row: Date and Avatars on the same line */}
                <div className="flex items-center justify-between text-sm text-gray-600 mt-3">
                    {/* Date */}
                    <div>
                        {project.startDate || project.dueDate ? (
                        <>
                            <span>{formatDate(project.startDate)}</span>
                            {project.startDate && project.dueDate && <span> - </span>}
                            <span>{formatDate(project.dueDate)}</span>
                        </>
                        ) : (
                        <span>No dates</span>
                        )}
                    </div>

                    {/* Avatars */}
                    <div className="flex -space-x-1 overflow-hidden">
                        {getUniqueTeamMemberIds(project).map((userId) => {
                        const member = getTeamMemberDetails(userId);
                        return member ? (
                            <Avatar
                            key={userId}
                            user={member}
                            size="small"
                            className="w-6 h-6 rounded-full border-2 border-white flex-shrink-0"
                            />
                        ) : null;
                        })}
                    </div>
                </div>
            </div>
          ))}

          {/* Add Project Card */}
          <div
            onClick={handleAddProjectClick}
            className="bg-white border-2 border-dashed border-gray-300 rounded-2xl w-[300px] h-[200px] flex justify-center items-center cursor-pointer hover:border-[#5b5fc7] hover:bg-gray-50 transition-all"
          >
            <div className="flex flex-col items-center text-gray-500">
              <div className="text-[40px] font-bold text-[#5b5fc7]">+</div>
              <div className="mt-2 text-base">New Project</div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Project Modal */}
      {/* Ensure this component is the advanced version */}
      <AddProjectModal
        show={showModal}
        onAddProject={handleAddProject}
        onCancel={() => {
            // When canceling, close the modal and clear the editing state
            setShowModal(false);
            setEditingProject(null);
        }}
        initialValues={editingProject} // Pass initialValues if editing
      />
    </div>
  );
};

export default Projects;
