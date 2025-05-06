import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import StatBox from '../components/StatBox';
import ProjectHeader from '../components/ProjectHeader';
import UserAssignmentModal from '../components/UserAssignmentModal';
import { useOutletContext } from 'react-router-dom';
import { useGetProjectByIdQuery } from '../redux/slices/projectSlice';
import { useGetTasksByProjectQuery } from '../redux/slices/taskSlice';
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
  const { currentProject } = useOutletContext();

  // Use RTK Query to fetch tasks by projectId.
  const {
    data: tasks = [],
    isLoading: loadingTasks,
    error: tasksError,
  } = useGetTasksByProjectQuery(currentProject?.projectId, {
    skip: !currentProject?.projectId,
  });

  // Use RTK Query to fetch users by projectId
  const {
    data: users = [],
    isLoading: loadingUsers,
    error: userError,
  } = useGetTasksByProjectQuery(currentProject?.projectId, {
    skip: !currentProject?.projectId,
  });

  // Use RTK Query to fetch project details (assuming team members are part of the project data).
  const {
    data: projectDetails,
    isLoading: loadingProject,
    error: projectError,
  } = useGetProjectByIdQuery(currentProject?._id, {
    skip: !currentProject?._id,
  });

  if (loadingTasks || loadingProject) {
    return <div>Loading dashboard data...</div>;
  }

  if (tasksError || projectError) {
    return (
      <div className="error">
        Error loading dashboard data: {tasksError?.error || projectError?.error || 'Unknown error'}
      </div>
    );
  }

  const completedCount = currentProject.tasks.filter(task => task.status?.toLowerCase() === 'completed').length;
  const inProgressCount = currentProject.tasks.filter(task => task.status?.toLowerCase() === 'in progress').length;
  const overdueCount = currentProject.tasks.filter(task => new Date(task.dueDate) < new Date() && task.status?.toLowerCase() !== 'completed').length;

  return (
    <>
      <Navbar />
      <div className="ml-[15%] w-[85%] min-h-screen bg-[var(--background-primary)]">
        <ProjectHeader project={currentProject} />

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6 auto-rows-fr">
          <div className="col-span-12 xl:col-span-4 flex ">
            <div className="h-full w-full flex items-center justify-center">
              <StatBox title="Tasks Completed" value={completedCount} />
            </div>
          </div>
          <div className="col-span-12 xl:col-span-4 flex items-center justify-center">
            <div className="h-full w-full flex items-center justify-center">
              <StatBox title="Tasks In Progress" value={inProgressCount} />
            </div>
          </div>
          <div className="col-span-12 xl:col-span-4 flex items-center justify-center">
            <div className="h-full w-full flex items-center justify-center">
              <StatBox title="Tasks Overdue" value={overdueCount} />
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