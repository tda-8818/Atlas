import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import StatBox from '../components/StatBox';
import ProjectHeader from '../components/ProjectHeader';
import UserAssignmentModal from '../components/UserAssignmentModal';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';

const allTeamMembers = [
  { id: "user-1", name: "Alex Johnson", avatar: "/avatars/avatar1.png", initials: "AJ" },
  { id: "user-2", name: "Sarah Wilson", avatar: "/avatars/avatar2.png", initials: "SW" },
  { id: "user-3", name: "David Chen", avatar: "/avatars/avatar3.png", initials: "DC" },
  { id: "user-4", name: "Emma Rodriguez", avatar: "/avatars/avatar4.png", initials: "ER" },
  { id: "user-5", name: "Michael Brown", avatar: "/avatars/avatar5.png", initials: "MB" },
];

const getTeamMemberDetails = (userId) => {
  return allTeamMembers.find(member => member.id === userId);
};

const getInitialsFromName = (name = '') => {
  if (!name) return '';
  const parts = name.split(' ');
  if (parts.length > 1) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  } else if (name.length > 0) {
    return name[0].toUpperCase();
  }
  return '';
};

const Dashboard = () => {
  const { currentProject, setCurrentProject } = useOutletContext();
  const [showUserAssignmentModal, setShowUserAssignmentModal] = useState(false);

  const tasks = [
    { id: 1, title: "Task 1", status: "Completed", dueDate: "2025-05-01" },
    { id: 2, title: "Task 2", status: "In Progress", dueDate: "2025-05-05" },
    { id: 3, title: "Task 3", status: "Overdue", dueDate: "2025-04-28" },
  ];

  const projectTeamMembersDetails = (currentProject?.teamMembers || [])
    .map(memberId => getTeamMemberDetails(memberId))
    .filter(member => member !== undefined);

  const handleSaveTeamMembers = async (updatedMemberIds, newOwnerId) => {
    if (!currentProject || !currentProject._id) {
      console.error("Cannot save team members: No project selected or ID missing.");
      setShowUserAssignmentModal(false);
      return;
    }

    try {
      const response = await axios.put(`http://localhost:5001/projects/${currentProject._id}`, {
        teamMembers: updatedMemberIds,
        owner: newOwnerId
      }, {
        withCredentials: true
      });

      if (response.status === 200) {
        setCurrentProject(prev => ({
          ...prev,
          teamMembers: response.data.teamMembers,
          owner: response.data.owner
        }));
        alert("Team updated successfully!");
      } else {
        alert(`Failed to update team: ${response.data?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error saving team:", error);
      alert(`Error saving team: ${error.message || 'Network error'}`);
    } finally {
      setShowUserAssignmentModal(false);
    }
  };

  if (!currentProject) {
    return (
      <>
        <Navbar />
        <div className="ml-[15%] w-[85%] min-h-screen bg-[var(--background-primary)] flex items-center justify-center text-gray-500">
          Select a project from the sidebar.
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="ml-[15%] w-[85%] min-h-screen bg-[var(--background-primary)]">
        <ProjectHeader project={currentProject} />

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6 auto-rows-fr">
          <div className="col-span-12 xl:col-span-4 flex ">
            <div className="h-full w-full flex items-center justify-center">
              <StatBox title="Tasks Completed" value="5" />
            </div>
          </div>
          <div className="col-span-12 xl:col-span-4 flex items-center justify-center">
            <div className="h-full w-full flex items-center justify-center">
              <StatBox title="Tasks In Progress" value="3" />
            </div>
          </div>
          <div className="col-span-12 xl:col-span-4 flex items-center justify-center">
            <div className="h-full w-full flex items-center justify-center">
              <StatBox title="Tasks Overdue" value="2" />
            </div>
          </div>

          <div className="col-span-12 xl:col-span-6">
            <div className="h-full min-h-[35vh]">
              <StatBox title="Your Tasks">
                <ul className="text-xs space-y-1">
                  {tasks.map(task => (
                    <li key={task.id} className="flex items-center justify-between p-1 rounded bg-[var(--background-primary)] text-[var(--text)]">
                      <strong className="truncate">{task.title}</strong>
                      <span className="ml-2 text-[var(--text-muted)]">{task.status} • {task.dueDate}</span>
                    </li>
                  ))}
                </ul>
              </StatBox>
            </div>
          </div>

          <div className="col-span-12 xl:col-span-6">
            <div className="h-full min-h-[35vh] flex flex-col">
              <StatBox title="">
                <div className="flex items-center justify-between mb-2 px-2">
                  <span className="text-[var(--text)] text-sm font-medium">Team</span>
                  <button
                    className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-700 text-sm"
                    onClick={() => setShowUserAssignmentModal(true)}
                    title="Assign Members"
                  >
                    ＋
                  </button>
                </div>

                {/* OWNER */}
                <div className="mb-3 px-2">
                  <h3 className="text-xs text-[var(--text-muted)] font-semibold mb-1">Owner</h3>
                  {getTeamMemberDetails(currentProject.owner) ? (
                    <div className="flex items-center gap-2 text-sm text-[var(--text)]">
                      <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs text-gray-800">
                        {getInitialsFromName(getTeamMemberDetails(currentProject.owner).name)}
                      </div>
                      <span>{getTeamMemberDetails(currentProject.owner).name}</span>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">No owner assigned</p>
                  )}
                </div>

                {/* TEAM MEMBERS */}
                <div className="px-2">
                  <h3 className="text-xs text-[var(--text-muted)] font-semibold mb-1">Team Members</h3>
                  <ul className="space-y-1 text-xs">
                    {projectTeamMembersDetails.filter(m => m.id !== currentProject.owner).map(member => (
                      <li key={member.id} className="p-2 rounded-md bg-[var(--background-primary)] flex items-center gap-2 text-[var(--text)]">
                        <div className="w-6 h-6 rounded-full bg-gray-300 text-gray-800 text-xs flex items-center justify-center">
                          {getInitialsFromName(member.name)}
                        </div>
                        <span>{member.name}</span>
                      </li>
                    ))}
                    {projectTeamMembersDetails.length <= 1 && (
                      <li className="text-center text-gray-500 p-4 text-sm">No additional team members assigned.</li>
                    )}
                  </ul>
                </div>
              </StatBox>
            </div>
          </div>
        </div>
      </div>

      <UserAssignmentModal
        show={showUserAssignmentModal}
        initialSelectedMemberIds={currentProject?.teamMembers || []}
        currentProjectOwnerId={currentProject?.owner}
        onSave={(members, owner) => handleSaveTeamMembers(members, owner)}
        onCancel={() => setShowUserAssignmentModal(false)}
      />
    </>
  );
};

export default Dashboard;