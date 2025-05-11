import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import StatBox from '../components/StatBox';
import Navbar from '../components/Navbar';
import ProjectUsersModal from '../components/ProjectUsersModal';
import { useOutletContext } from 'react-router-dom';
import {
  useGetProjectByIdQuery,
  useGetProjectUsersQuery,
  useUpdateProjectUsersMutation,
  useGetProjectTasksQuery
} from '../redux/slices/projectSlice';
import { isProjectOwner } from '../utils/projectUtils';
import { getTaskStats } from '../utils/taskUtils';
import { useGetCurrentUserQuery, useGetAllUsersQuery } from '../redux/slices/userSlice';

const Dashboard = () => {
  const {currentProject} = useOutletContext();
  const id = currentProject._id;
  const [isProjectUsersModalOpen, setProjectUsersModalOpen] = useState(false);
  // Mutation for updating project team
  const [updateProjectUsers] = useUpdateProjectUsersMutation();

  // RTK Query hooks to fetch tasks, project details, and project users
  const { data: tasks = [], isLoading: loadingTasks, error: tasksError, } = useGetProjectTasksQuery(id, { skip: !id, });

  const { data: allUsers = [], isLoading: loadingAllUsers } = useGetAllUsersQuery();

  // fetch all users in the project
  const { data: users = [], isLoading: loadingUsers, error: userError, } = useGetProjectUsersQuery(id, { skip: !id, });

  // fetch project by id number
  const { data: projectData, isLoading: loadingProject, error: projectError, } = useGetProjectByIdQuery(id, { skip: !id, });

  // fetch current user
  const { data: currentUser, isLoading: loadingMe, error: meError } = useGetCurrentUserQuery();

  // Handler to update team members
  const handleUpdateProjectUsers = async (updatedMemberIds, newOwnerId) => {
    console.log("updated member ids: ", updatedMemberIds);
    console.log("new owner id:", newOwnerId);

    if (!id) {
      console.error("Cannot save team members: No project selected");
      setProjectUsersModalOpen(false);
      return;
    }

    try {
      await updateProjectUsers({
        id: id,
        users: updatedMemberIds,
        owner: newOwnerId,
      }).unwrap();
      console.log("Team updated successfully!");
    } catch (error) {
      console.error("Error saving team:", error);
    } finally {
      setProjectUsersModalOpen(false);
    }
  };

  // Check loading and error states using the correct variables
  if (loadingTasks || loadingProject || loadingUsers) {
    return <div>Loading dashboard data...</div>;
  }

  if (tasksError || projectError || userError) {
    return (
      <div className="error">
        Error loading dashboard data:{" "}
        {tasksError?.error || projectError?.error || userError?.error || "Unknown error"}
      </div>
    );
  }

  if (loadingProject || loadingUsers || loadingMe) {
    return <div>Loading dashboard data...</div>;
  }

  if (projectError || userError || meError) {
    return (
      <div className="error">
        Error loading dashboard data:{" "}
        {projectError?.error || userError?.error || "Unknown error"}
      </div>
    );
  }

  
  // Get task statistics
  // const { completed, inProgress, overdue } = getTaskStats(tasks);
  // const completedCount = tasks.filter(
  //   (task) => task.status?.toLowerCase() === 'completed'
  // ).length;
  // const inProgressCount = tasks.filter(
  //   (task) => task.status?.toLowerCase() === 'in progress'
  // ).length;
  // const overdueCount = tasks.filter(
  //   (task) =>
  //     new Date(task.dueDate) < new Date() &&
  //     task.status?.toLowerCase() !== 'completed'
  // ).length;

  return (
    <>
      <Sidebar />
      <div className="ml-[15%] w-[85%] min-h-screen bg-[var(--background-primary)]">
        <Navbar project={currentProject} />

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6 auto-rows-fr">
          {/* Top Stats */}
          {/* <div className="col-span-12 xl:col-span-4 flex ">
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
          </div> */}

          {/* Bottom Panels */}
          {/* <div className="col-span-12 xl:col-span-6">
            <div className="h-full min-h-[35vh]">
              <StatBox title="Your Tasks">
                <ul className="text-xs space-y-1">
                  {tasks.map((task) => (
                    <li
                      key={task.id}
                      className={`
                        flex items-center justify-between 
                        p-1 rounded whitespace-nowrap overflow-hidden 
                        bg-[var(--background-primary)]
                      `}
                    >
                      <strong className="truncate text-[var(--text)]">{task.title}</strong>
                      <span className="ml-2 text-[var(--text-muted)]">
                        {task.status} • {task.dueDate}
                      </span>
                    </li>
                  ))}
                </ul>
              </StatBox>
            </div>
          </div> */}

          {/* Members list */}
          <div className="col-span-12 xl:col-span-6">
            <div className="h-full min-h-[35vh]">
              <StatBox title="Team Members">
                <div className="flex items-center justify-between mb-2 px-2">
                  {isProjectOwner(currentUser.user.id, projectData?.owner) && (
                    <button
                      className="w-30 h-6 bg-gray-400 hover:bg-gray-300 text-gray-800 items-center justify-center text-sm rounded"
                      onClick={() => setProjectUsersModalOpen(true)}
                      title="Members"
                    >
                      ＋Add Members
                    </button>
                  )}
                </div>

                <div className="px-2">
                  {/* Users List */}
                  <ul className="space-y-1 text-sm">
                    {users.map((user) => (
                      <li
                        key={user._id || user.id}
                        className="p-2 rounded-md bg-[var(--background-primary)] flex items-center gap-2 text-[var(--text)]"
                      >
                        <span className="capitalize">
                          {user.firstName} {user.lastName}
                        </span>
                        {user.role && (
                          <p className="text-[var(--text-muted)] ml-auto">
                            {user.role}
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

      <ProjectUsersModal
        show={isProjectUsersModalOpen}
        onClose={() => setProjectUsersModalOpen(false)}
        initialSelectedMemberIds={projectData?.users || []}
        currentProjectOwnerId={projectData?.owner}
        onSave={handleUpdateProjectUsers}
        allTeamMembers={allUsers} // Pass all users to allow searching
      />
      
    </>
  );
};

export default Dashboard;