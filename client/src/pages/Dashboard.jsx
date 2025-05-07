import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import StatBox from '../components/StatBox';
import ProjectUsersModal from '../components/ProjectUsersModal'
import ProjectHeader from '../components/ProjectHeader';
import { useOutletContext } from 'react-router-dom';
import { useGetProjectByIdQuery, useGetProjectUsersQuery, useUpdateProjectUsersMutation, useGetProjectTasksQuery } from '../redux/slices/projectSlice';
import { getInitials } from '../utils/userUtils';
import { isProjectOwner } from '../utils/projectUtils'
import { getTaskStats } from '../utils/taskUtils'

const Dashboard = () => {
  const { currentProject } = useOutletContext();
  const [showProjectUsersModal, setProjectUsersModal] = useState(false);

  // Sort members alphabetically by last name; adjust key if needed
  const sortedMembers = [...members].sort((a, b) =>
    a.lastName.localeCompare(b.lastName));

  // RTK Query hooks
  const {
    data: tasks = [],
    isLoading: loadingTasks,
    error: tasksError,
  } = useGetProjectTasksQuery(currentProject?.projectId, {
    skip: !currentProject?.projectId,
  });

  const {
    data: projectMembers = [],
    isLoading: loadingTeam,
    error: teamError,
  } = useGetProjectUsersQuery(currentProject?.projectId, {
    skip: !currentProject?.projectId,
  });

  const {
    data: projectDetails,
    isLoading: loadingProject,
    error: projectError,
  } = useGetProjectByIdQuery(currentProject?.projectId, {
    skip: !currentProject?.projectId,
  });

  // RTK Query mutation for updating team members
  const [updateProjectTeam, { isLoading: isUpdating }] = useUpdateProjectUsersMutation();

  // Handler for updating team members
  const handleSaveTeamMembers = async (updatedMemberIds, newOwnerId) => {
    if (!currentProject || !currentProject.projectId) {
      console.error("Cannot save team members: No project selected");
      setProjectUsersModal(false);
      return;
    }

    try {
      await updateProjectTeam({
        projectId: currentProject.projectId,
        users: updatedMemberIds,
        owner: newOwnerId
      }).unwrap();


      await updateProjectTeam(/*...*/);
      toast.success("Team updated successfully!");


    } catch (error) {
      toast.error(`Error updating team: ${error.message || "Unknown error"}`);
      console.error("Error saving team:", error);
      // Show error message
    } finally {
      setProjectUsersModal(false);
    }
  };

  if (loadingTasks || loadingProject || loadingTeam) {
    return <div>Loading dashboard data...</div>;
  }

  if (tasksError || projectError || teamError) {
    return (
      <div className="error">
        Error loading dashboard data: {tasksError?.error || projectError?.error || teamError?.error || 'Unknown error'}
      </div>
    );
  }

  // Get all task stats at once using the utility
  const { completed, inProgress, overdue } = getTaskStats(tasks);
  const completedCount = tasks.filter(task => task.status?.toLowerCase() === 'completed').length;
  const inProgressCount = tasks.filter(task => task.status?.toLowerCase() === 'in progress').length;
  const overdueCount = tasks.filter(task => new Date(task.dueDate) < new Date() && task.status?.toLowerCase() !== 'completed').length;


  return (
    <>
      <Navbar />
      <div className="ml-[15%] w-[85%] min-h-screen bg-[var(--background-primary)]">
        <ProjectHeader project={currentProject} />

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6 auto-rows-fr">
          {/* Top Stats (tasks complete, overdue and in progress) */}
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

          {/* Bottom Panels (project task list and team members) */}
          {/* Tasks list */}
          <div className="col-span-12 xl:col-span-6">
            <div className="h-full min-h-[35vh]">
              <StatBox title="Your Tasks">
                <ul className="text-xs space-y-1">
                  {tasks.map(task => (
                    <li
                      key={task.id}
                      className={`
          flex items-center justify-between 
          p-1 rounded 
          whitespace-nowrap overflow-hidden 
          bg-[var(--background-primary)]
        `}
                    >
                      {/* ${task.status === 'Completed'
                          ? 'bg-green-100'
                          : task.status === 'In Progress'
                            ? 'bg-yellow-100'
                            : 'bg-red-100'} 
                            
                            incase we do want color on tasks
                            */}

                      {/* Title will ellipsize if too long */}
                      <strong className="truncate text-[var(--text)]">{task.title}</strong>

                      {/* Status + due date in smaller text */}
                      <span className="ml-2 text-[var(--text-muted)]">
                        {task.status} • {task.dueDate}
                      </span>
                    </li>
                  ))}
                </ul>
              </StatBox>


            </div>
          </div>
          {/* members list */}
          <div className="col-span-12 xl:col-span-6">
            <div className="h-full min-h-[35vh]">
              <StatBox title="Team Members">
                <div className="flex items-center justify-between mb-2 px-2">
                  <span className="text-[var(--text)] text-sm font-medium">Team</span>
                  {isProjectOwner && (
                    <button
                      className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-700 text-sm"
                      onClick={() => setProjectUsersModal(true)}
                      title="Assign Members"
                    >
                      ＋
                    </button>
                  )}
                </div>

                {/* TEAM MEMBERS */}
                <div className="px-2">
                  <h3 className="text-xs text-[var(--text-muted)] font-semibold mb-1">
                    Team Members
                  </h3>
                  <ul className="space-y-1 text-xs">
                    {sortedMembers.map((member) => (
                      <li
                        key={member._id || member.id}
                        className="p-2 rounded-md bg-[var(--background-primary)] flex items-center gap-2 text-[var(--text)]"
                      >
                        <div
                          className="w-6 h-6 rounded-full bg-gray-300 text-gray-800 text-xs flex items-center justify-center"
                          title={`${member.firstName} ${member.lastName}`}
                        >
                          {getInitials(`${member.firstName} ${member.lastName}`)}
                        </div>
                        <span>
                          {member.firstName} {member.lastName}
                        </span>
                        {member.role && (
                          <p className="text-[var(--text-muted)] ml-auto">
                            {member.role}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </StatBox>
            </div>
          </div>
        </div>
      </div>

      {/* User Assignment Modal */}
      {showProjectUsersModal && (
        <UserAssignmentModal
          show={showProjectUsersModal}
          initialSelectedMemberIds={projectDetails?.users || []}
          currentProjectOwnerId={projectDetails?.owner}
          onSave={(members, owner) => handleSaveTeamMembers(members, owner)}
          onCancel={() => setProjectUsersModal(false)}
        />
      )}
    </>
  );
};

export default Dashboard;
