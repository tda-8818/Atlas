import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useGetCurrentUserQuery } from '../redux/slices/apiSlice';

const Home = () => {
    const [firstName, setFirstName] = useState('');
    const { data: currentUser, isLoading, isError } = useGetCurrentUserQuery();

    useEffect(() => {
        if (currentUser?.user?.firstName) {
            setFirstName(currentUser.user.firstName);
        }
    }, [currentUser]);

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
        subtitle: "",
        deadline: ""
    });

    const handleAddProjectClick = () => setShowModal(true);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProject((prev) => ({ ...prev, [name]: value }));
    };

    const handleCreateProject = () => {
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

        const createdProject = {
            title: newProject.title,
            subtitle: newProject.subtitle,
            progress: 0,
            daysLeft,
            team: ["/avatars/avatar1.png"]
        };

        setProjects((prev) => [...prev, createdProject]);
        setNewProject({ title: "", subtitle: "", deadline: "" });
        setShowModal(false);
    };

    return (
        <div className="flex h-screen bg-[var(--background-primary)]">
            <Navbar />
            <div className="flex-grow p-10 ml-[240px] overflow-y-auto">
                <h1 className="text-3xl font-bold mb-8 text-[var(--text)]">Projects</h1>
                <div className="flex flex-wrap gap-5">
                    {projects.map((project, index) => (
                        <div key={index} className="bg-[var(--background)] rounded-2xl shadow-md w-[300px] min-h-[200px] p-5 flex flex-col justify-between text-text">
                            <div className="flex flex-col h-full justify-between">
                                <div>
                                    <h2 className="text-lg font-bold mb-1 text-[var(--text)]">{project.title}</h2>
                                    <p className="text-sm text-[#8e92bc] mb-2">{project.subtitle}</p>
                                </div>
                                <div className="mb-2">
                                    <div className="font-medium text-sm mb-1 text-[var(--text-muted)]">Progress</div>
                                    <div className="font-semibold text-[#5b5fc7] text-sm mb-1">{project.progress}%</div>
                                    <div className="h-[6px] bg-[#e4e6f2] rounded-full w-full">
                                        <div className="h-full rounded-full bg-[#5b5fc7]" style={{ width: `${project.progress}%` }}></div>
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
                            name="subtitle"
                            value={newProject.subtitle}
                            onChange={handleInputChange}
                            placeholder="Attending Person"
                            className="w-full p-2 mb-3 border border-gray-300 rounded"
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
