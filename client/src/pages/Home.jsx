import React, { useState } from "react";
import Navbar from "../components/Navbar"; // Your existing Navbar
import "./css/Home.css"; // Correct pathimport { useGetCurrentUserQuery } from '../redux/slices/apiSlice';


const Home = () => {
    const [firstName, setFirstName] = useState('');
    const { data: currentUser, isLoading, isError } = useGetCurrentUserQuery();

    useEffect(() => {
        if (currentUser?.user?.firstName) {
            setFirstName(currentUser.user.firstName);
        }
    }, [currentUser]);

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error loading user data</div>;

    return (
        <>
            <Navbar />
            <div className="inline-block ml-[15%] w-[55%] h-[100vh]">
                <div className="m-[35px]">
                    <div className="ml-[10px]">
                        <h1 className='font-bold text-[20px]'>Hi, {firstName}</h1>
                        <h2>Let's finish your task today</h2>
                    </div>
                </div>
            </div>
            <div className="inline-block h-[100vh] w-[30%] bg-[#f5f5f7] float-right">
                <div className="m-[40px] bg-white h-[20vh]">calendar</div>
                <div className="m-[40px] bg-white h-[65vh]">
                    task today
                </div>
            </div>
        </>
    )
}
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

const handleAddProjectClick = () => {
    setShowModal(true);
};

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
    <div className="page-layout">
        <Navbar />
        <div className="home">
            <h1 className="home-title">Projects</h1>
            <div className="cards-container">
                {projects.map((project, index) => (
                    <div className="card" key={index}>
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



export default Home;
