import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
// Import the advanced AddProjectModal component
import AddProjectModal from "../components/AddProjectModal";
import { useGetCurrentUserQuery } from '../redux/slices/apiSlice';
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

const Home = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [firstName, setFirstName] = useState('');
  const { data: currentUser, isLoading, isError } = useGetCurrentUserQuery();

  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null); // State to hold the project being edited

  useEffect(() => {
    const getUserProjects = async () => {
      try {
        console.log("Fetching projects..."); // Added log
        const response = await axios.get(`http://localhost:5001/home`, {
          withCredentials: true
        });
        console.log("Project data received:", response.data); // Added log

        if (response.status === 200 && Array.isArray(response.data)) {
          const projectJson = response.data.map((project) => ({
            id: project._id,
            title: project.title,
            progress: project.progress || 0,
            // Calculate days left dynamically or use backend value if available
            daysLeft: project.dueDate ? Math.max(
              Math.ceil((new Date(project.dueDate) - new Date()) / (1000 * 60 * 60 * 24)),
              0
            ) : 0,
            startDate: project.startDate,
            dueDate: project.dueDate,
            teamMembers: project.teamMembers || [], // Array of user IDs
            owner: project.owner || null, // Owner ID
          }));
          setProjects(projectJson);
          // Ensure currentUser and user properties exist before accessing firstName
          setFirstName(currentUser?.user?.firstName || '');
        }
      } catch (error) {
        console.error("Error loading projects:", error);
      }
    };
    // Only fetch projects if currentUser data is loaded
    if (currentUser) {
      getUserProjects();
    }
  }, [currentUser]); // Depend on currentUser to refetch when user loads

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading user data</div>;
  // If currentUser is null after loading and no error, maybe redirect to login?
  if (!currentUser && !isLoading && !isError) {
      // navigate('/login'); // Example redirection
      return <div>User not authenticated.</div>;
  }


  const handleProjectClick = async (project) => {
    try {
      const projectId = project.id;
      // Sending projectId in body is okay, but setting a cookie is also common
      // Make sure your backend expects the ID in the body or adjust as needed
      const response = await axios.post(`http://localhost:5001/home/${projectId}`, { projectId: projectId }, {
        withCredentials: true
      });
      if (response.status === 200) {
        console.log("Project cookie set (or project details fetched)");
      }
      navigate(`/home/project/${projectId}/dashboard`);
    } catch (error) {
      console.error("Error navigating to project:", error);
      // Handle navigation errors, maybe show a message to the user
      alert("Could not open project. Please try again.");
    }
  };


  const handleAddProjectClick = () => {
    setEditingProject(null); // Clear editing state for a new project
    setShowModal(true); // Open the modal
  };

  // Function to handle editing an existing project
  const handleEditProjectClick = (project) => {
      setEditingProject(project); // Set the project to be edited in state
      setShowModal(true); // Open the modal
  };


  const handleAddProject = (projectData) => {
    // The projectData received from the modal includes the ID if editing
    if (projectData.id) {
        // It's an edit operation
        // Find the index and update the project in the state immutably
        setProjects(projects.map(p => p.id === projectData.id ? projectData : p));
        console.log("Project updated:", projectData);
        // TODO: Implement backend call to update the project (send projectData including ID)
        // Example: axios.put(`http://localhost:5001/projects/${projectData.id}`, projectData, { withCredentials: true })
    } else {
        // It's an add operation
        const newProject = {
           ...projectData,
           // Do NOT assign a local UUID here if your backend assigns IDs.
           // You should send the projectData to the backend, and then
           // use the ID returned by the backend in the response to update your state.
           // For now, keeping UUID for local testing if backend isn't integrated yet:
           id: crypto.randomUUID(), // Replace with backend ID after saving
        };
        setProjects(prev => [...prev, newProject]);
        console.log("New project added:", newProject);
        // TODO: Implement backend call to create the project (send projectData without ID)
        // Example: axios.post(`http://localhost:5001/projects`, projectData, { withCredentials: true })
        // Then update state with the returned project including the backend ID:
        // .then(response => setProjects(prev => [...prev.filter(p => p.id !== newProject.id), response.data]))
    }

    // Close the modal and reset editing state AFTER the operation
    setShowModal(false);
    setEditingProject(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date)) return dateString;
  
      const options = { day: 'numeric', month: 'short', year: 'numeric' };
      return date.toLocaleDateString(undefined, options).replace(/(\d+) (\w+) (\d{4})/, '$1 $2, $3');
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return dateString;
    }
  };
  

  // Function to get combined unique team member and owner IDs for display
  // Added sorting to put owner first if they exist
  const getUniqueTeamMemberIds = (project) => {
      const uniqueIds = new Set(project.teamMembers || []);
      const idsArray = Array.from(uniqueIds);

      // Add owner to the list if they exist and are not already in teamMembers
      if (project.owner && !idsArray.includes(project.owner)) {
          // Find the owner's details to potentially sort
          const ownerDetails = getTeamMemberDetails(project.owner);
          // Simple approach: just add owner ID to the start of the array
          idsArray.unshift(project.owner);
      }

      // Optional: More complex sorting if needed (e.g., owner first, then alphabetical)
      // You would need the full member objects for sorting by name.
      // const sortedIds = idsArray.sort((a, b) => {
      //     if (a === project.owner) return -1; // Owner comes first
      //     if (b === project.owner) return 1;
      //     // Otherwise, sort by name (you'd need member details here)
      //     const memberA = getTeamMemberDetails(a)?.name || '';
      //     const memberB = getTeamMemberDetails(b)?.name || '';
      //     return memberA.localeCompare(memberB);
      // });

      // Return the unique IDs array (with owner potentially at the start)
      return idsArray;
  };


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

export default Home;