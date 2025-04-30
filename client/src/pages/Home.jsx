import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar"; // Your existing Navbar
import "./css/Home.css"; // Correct path
import { useGetCurrentUserQuery } from '../redux/slices/apiSlice';
import axios from "axios";
import { retry } from "@reduxjs/toolkit/query";
import { useNavigate } from "react-router-dom";


const Home = () => {

    const navigate = useNavigate();

    // Get current user's first name to display on homepage
    const [firstName, setFirstName] = useState('');
    const { data: currentUser, isLoading, isError } = useGetCurrentUserQuery();

    useEffect(() => {
        if (currentUser?.user?.firstName) {
            setFirstName(currentUser.user.firstName);
        }
    }, [currentUser]);

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error loading user data</div>;

    // homepage contents
    const [projects, setProjects] = useState([
        // STATIC PROJECT CARD: NOT RENDERED FROM DATABASE
        {
            title: "Creating Mobile App Design",
            subtitle: "UI UX Design",
            progress: 75,
            daysLeft: 3,
            team: ["/avatars/avatar1.png", "/avatars/avatar2.png"]
        },
    ]);

    const [showModal, setShowModal] = useState(false);
    const [newProject, setNewProject] = useState({
        title: "",
        subtitle: "",
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

    const handleAddProjectClick = () => {
        setShowModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProject((prev) => ({ ...prev, [name]: value }));
    };

    const handleCreateProject = async () => {
        if (!newProject.title || !newProject.subtitle || !newProject.deadline) {
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
            subtitle: newProject.subtitle,
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
            setNewProject({ title: "", subtitle: "", deadline: "" });
            setShowModal(false);
        }
        else{
            alert("Bad Response when creating project.")
            return;
        }

    };

    return (
        <div className="page-layout">
            <Navbar />
            <div className="home">
                <h1 className="home-title">Projects</h1>
                <div className="cards-container">
                    {projects.map((project, index) => (
                        <div className="card" key={index} onClick={() => handleProjectClick(project)}> 
                            <div className="card-body">
                                <h2 className="card-title">{project.title}</h2>
                                <p className="card-subtitle">{project.subtitle}</p>
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
                                <div className="footer">
                                    <div className="days-left">
                                        <i className="far fa-clock"></i> {project.daysLeft} Days Left
                                    </div>
                                    <div className="avatars">
                                        {project.team.map((avatar, idx) => (
                                            <img
                                                key={idx}
                                                src={avatar}
                                                alt="team"
                                                className="avatar"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Add Project Block */}
                    <div className="card add-project-card" onClick={handleAddProjectClick}>
                        <div className="add-project-content">
                            <div className="add-icon">+</div>
                            <div className="add-text">Add Project</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Create New Project</h2>
                        <input
                            type="text"
                            name="title"
                            value={newProject.title}
                            onChange={handleInputChange}
                            placeholder="Project Name"
                        />
                        <input
                            type="text"
                            name="subtitle"
                            value={newProject.subtitle}
                            onChange={handleInputChange}
                            placeholder="Attending Person"
                        />
                        <input
                            type="date"
                            name="deadline"
                            value={newProject.deadline}
                            onChange={handleInputChange}
                        />
                        <div className="modal-buttons">
                            <button onClick={handleCreateProject}>Create</button>
                            <button
                                className="cancel-btn"
                                onClick={() => setShowModal(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );


}

export default Home;
