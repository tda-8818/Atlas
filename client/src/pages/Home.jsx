import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useGetCurrentUserQuery } from '../redux/slices/apiSlice';
import axios from "axios";
import { retry } from "@reduxjs/toolkit/query";
import { useNavigate } from "react-router-dom";


const Home = () => {

    const navigate = useNavigate();

    // homepage contents
    const [projects, setProjects] = useState([
        // STATIC PROJECT CARD: NOT RENDERED FROM DATABASE
        // {
        //     title: "Creating Mobile App Design",
        //     description: "UI UX Design",
        //     progress: 75,
        //     daysLeft: 3,
        //     team: ["/avatars/avatar1.png", "/avatars/avatar2.png"]
        // },
    ]);

    // Get current user's first name to display on homepage
    const [firstName, setFirstName] = useState('');
    const { data: currentUser, isLoading, isError } = useGetCurrentUserQuery();

    useEffect(() => {
        // Call this function to load projects from database
        const getUserProjects = async () => {
            try {
                console.log("cast on load");
                //console.log(currentUser.user._id);
                //if (!currentUser?.user?._id) return;
                
                const response = await axios.get(`http://localhost:5001/home`, {
                    withCredentials: true
                });
                console.log("project data:", response.data);

                if (response.status === 200 && Array.isArray(response.data)) {               
                    const projectJson = response.data.map((project) => ({
                        id: project._id,
                        title: project.title,
                        description: project.description,
                        progress: project.progress,
                        daysLeft: project.daysLeft,
                        team: ["/avatars/avatar1.png"],
                    }));
                    setProjects(projectJson);
                    setFirstName(currentUser.user.firstName);
                }
            } catch (error) {
                console.error("Error in useEffect in Home.jsx:", error);
            }
        }
        getUserProjects();
    }, [currentUser]);

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error loading user data</div>;

    // homepage contents
    const [projects, setProjects] = useState([
        {
            title: "Creating Mobile App Design",
            subtitle: "UI UX Design",
            progress: 75,
            daysLeft: 3,
            team: ["/avatars/avatar1.png", "/avatars/avatar2.png"]
        },
        {
            title: "Creating Perfect Website",
            subtitle: "Web Developer",
            progress: 85,
            daysLeft: 4,
            team: ["/avatars/avatar3.png", "/avatars/avatar4.png"]
        },
        {
            title: "Building Dashboard",
            subtitle: "React Developer",
            progress: 60,
            daysLeft: 6,
            team: ["/avatars/avatar5.png", "/avatars/avatar6.png"]
        },
        {
            title: "Design New Logo",
            subtitle: "Graphic Design",
            progress: 40,
            daysLeft: 2,
            team: ["/avatars/avatar7.png", "/avatars/avatar8.png"]
        },
        {
            title: "Develop Landing Page",
            subtitle: "Frontend Developer",
            progress: 90,
            daysLeft: 1,
            team: ["/avatars/avatar9.png", "/avatars/avatar10.png"]
        },
        {
            title: "Fix Website Bugs",
            subtitle: "QA Engineer",
            progress: 55,
            daysLeft: 5,
            team: ["/avatars/avatar11.png", "/avatars/avatar12.png"]
        }
    ]);

    const [showModal, setShowModal] = useState(false);
    const [newProject, setNewProject] = useState({
        title: "",
        description: "",
        deadline: ""
    });

    const handleProjectClick = async (project) => {
        /**
         * Switches the view to the dashboard and sets the cookie for the selected project.
         */
        console.log("Clicked Project:", project);
        
        const projectId = project.id;
        // 1. Clear the project cookie if not null. 
        // set the current clicked project to be the new project cookie. 

        // 2. selectedProject is the name of the cookie i defined in projectController.js
        console.log(projectId);
        const response = await axios.post(`http://localhost:5001/home/${projectId}`, project, {
            withCredentials: true
        });

        if (response.status === 200) {
            console.log("Project cookie set");
             // 3. redirect to project dashboard
            navigate('/dashboard'); // Only redirect if request is successful
        } else {
            console.error("Error in handleProjectClick:", error);
        }
    };

    const handleProjectClick = async (project) => {
        /**
         * Switches the view to the dashboard and sets the cookie for the selected project.
         */
        console.log("Clicked Project:", project);
        
        const projectId = project.id;
        // 1. Clear the project cookie if not null. 
        // set the current clicked project to be the new project cookie. 

        // 2. selectedProject is the name of the cookie i defined in projectController.js
        console.log(projectId);
        const response = await axios.post(`http://localhost:5001/home/${projectId}`, project, {
            withCredentials: true
        });

        if (response.status === 200) {
            console.log("Project cookie set");
             // 3. redirect to project dashboard
            navigate('/dashboard'); // Only redirect if request is successful
        } else {
            console.error("Error in handleProjectClick:", error);
        }
    };

    const handleAddProjectClick = () => setShowModal(true);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProject((prev) => ({ ...prev, [name]: value }));
    };

    const handleCreateProject = async () => {
        if (!newProject.title || !newProject.description || !newProject.deadline) {
            alert("Please fill all fields!");
            return;
        }

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

        // Send project object to database
        const response = await axios.post("http://localhost:5001/home", projectData, {
            withCredentials: true
        });
        
        if (response.data) {
            const savedProject = response.data;
            const createdProject = {
                id: savedProject._id,
                ...projectData
            }
            console.log("Recieved mongoID of project:", savedProject._id);
            setProjects((prev) => [...prev, createdProject]);
            setNewProject({ title: "", description: "", deadline: "" });
            setShowModal(false);
        }
        else{
            alert("Bad Response when creating project.")
            return;
        }

    };

    return (
        <div className="flex h-screen bg-[var(--background-primary)]">
            <Navbar />
            <div className="flex-grow p-10 ml-[240px] overflow-y-auto">
                <h1 className="text-3xl font-bold mb-8 text-[var(--text)]">Projects</h1>
                <div className="flex flex-wrap gap-5">
                    {projects.map((project, index) => (
                        <div className="card" key={index} onClick={() => handleProjectClick(project)}> 
                            <div className="card-body">
                                <h2 className="card-title">{project.title}</h2>
                                <p className="card-description">{project.description}</p>
                                <div className="progress-section">
                                    <div className="progress-text">Progress</div>
                                    <div className="progress-value">{project.progress}%</div>
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{ width: `${project.progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-xs text-gray-600">
                                    <div><i className="far fa-clock mr-1"></i>{project.daysLeft} Days Left</div>
                                    
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Add Project Card */}
                    <div onClick={handleAddProjectClick} className="bg-background border-2 border-dashed border-gray-300 rounded-2xl w-[300px] min-h-[200px] flex justify-center items-center cursor-pointer hover:bg-nav-hover transition-all">
                        <div className="flex flex-col items-center">
                            <div className="text-[40px] font-bold text-[#5b5fc7]">+</div>
                            <div className="mt-2 text-base text-gray-600">Add Project</div>
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

export default Home;
