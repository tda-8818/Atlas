import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import StatBox from '../components/StatBox';
import Navbar from '../components/Navbar';
import ProjectUsersModal from '../components/modals/ProjectUsersModal.jsx';
import { useOutletContext } from 'react-router-dom';
import {
  useGetProjectByIdQuery,
  useGetProjectUsersQuery,
  useUpdateProjectUsersMutation,
  useGetProjectTasksQuery
} from '../redux/slices/projectSlice';
import { isProjectOwner } from '../utils/projectUtils';
import { getTaskStats, calculateProjectProgress, isTaskOverdue } from '../utils/taskUtils';
import { useGetCurrentUserQuery, useGetAllUsersQuery } from '../redux/slices/userSlice';
import { showErrorToast } from '../components/errorToast.jsx';
import toast from 'react-hot-toast';
import { LuCheck } from 'react-icons/lu';
import { useUpdateTaskMutation } from '../redux/slices/taskSlice.js';

const Dashboard = () => {
  const { currentProject } = useOutletContext();
  const id = currentProject._id;
  const [isProjectUsersModalOpen, setProjectUsersModalOpen] = useState(false);
  // Mutation for updating project team
  const [updateProjectUsers] = useUpdateProjectUsersMutation();

  const [updateTask] = useUpdateTaskMutation(); 

  // RTK Query hooks to fetch tasks, project details, and project users
  const { data: tasks = [], isLoading: loadingTasks, error: tasksError, refetch: refetchTasks } = useGetProjectTasksQuery(id, { skip: !id, });

  const { data: allUsers = [], isLoading: loadingAllUsers } = useGetAllUsersQuery();

  // fetch all users in the project
  const { data: users = [], isLoading: loadingUsers, error: userError, refetch: refetchUsers } = useGetProjectUsersQuery(id, { skip: !id, });

  // fetch project by id number
  const { data: projectData, isLoading: loadingProject, error: projectError, } = useGetProjectByIdQuery(id, { skip: !id, });



  // fetch current user
  const { data: currentUser, isLoading: loadingMe, error: meError } = useGetCurrentUserQuery();
  const loadingProjectData = loadingTasks || loadingProject || loadingUsers || loadingMe || loadingAllUsers;
  const loadingProjectError = projectError || tasksError || userError || meError;


  useEffect(() => {
    refetchTasks();
    refetchUsers();
  }, []);


  // Handler to update team members
  const handleUpdateProjectUsers = async (updatedMemberIds, newOwnerId) => {

    if (!id) {
      console.error("Cannot save team members: No project selected");
      setProjectUsersModalOpen(false);
      return;
    }

    try {
      await updateProjectUsers({ id: id, users: updatedMemberIds, owner: newOwnerId, }).unwrap();
      refetchUsers();
      toast("Team updated successfully!");

    } catch (error) {
      showErrorToast("Error saving team: ", error);
    } finally {
      setProjectUsersModalOpen(false);
    }
  };


  // Handler to toggle task status
  const handleToggleTask = async (task) => {
    try {
      // Optimistically update the UI immediately
      const updatedStatus = !task.status;
      // Update the task status in the backend using the updateTask mutation
      await updateTask({ ...task, status: updatedStatus }).unwrap();

      // After a successful update, refetch tasks to get the latest data
      refetchTasks();
      toast.success("Task completed!");
    } catch (error) {
      console.error("Error updating task status:", error);
      showErrorToast("Error updating task status", "500");
      // Optionally, revert the UI if the update fails (for better UX)
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

  const { completed, inProgress, overdue } = getTaskStats(tasks);
  const projectProgress = calculateProjectProgress(tasks);


  return (
    <>
      <Sidebar />
      <div className="ml-[15%] w-[85%] min-h-screen bg-[var(--background-primary)]">
        <Navbar project={currentProject} />

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6 auto-rows-fr">
          {/* Top Stats */}
          <div className="col-span-12 xl:col-span-4 flex ">
            <div className="h-full w-full flex items-center justify-center">
              <StatBox title="Tasks Completed" value={completed} />
            </div>
          </div>
          <div className="col-span-12 xl:col-span-4 flex items-center justify-center">
            <div className="h-full w-full flex items-center justify-center">
              <StatBox title="Tasks In Progress" value={inProgress} />
            </div>
          </div>
          <div className="col-span-12 xl:col-span-4 flex items-center justify-center">
            <div className="h-full w-full flex items-center justify-center">
              <StatBox title="Tasks Overdue" value={overdue} />
            </div>
          </div>

          {/* Current User's tasks sorted by due date */}
          <div className="col-span-12 xl:col-span-6">
            <div className="h-full min-h-[35vh]">
              <StatBox title="Tasks To Do">
                <ul className="text-xs space-y-1">
                  {tasks
                    .filter(task => !task.status)
                    .filter(task => task.assignedTo && task.assignedTo.some(user => user._id === currentUser.user.id))
                    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                    .map((task) => (
                      <li
                        key={task.id}
                        className={`
                        flex items-center justify-between 
                        p-1 rounded whitespace-nowrap overflow-hidden 
                        bg-[var(--background-primary)]
                      `}
                      >
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleTask(task)}
                            className={`
                                        w-4 h-4 rounded-full border-2
                                        ${task.status ? 'bg-green-500 border-green-500' : 'border-gray-400'}
                                        flex items-center justify-center focus:outline-none cursor-pointer
                                    `}
                          >
                            {<LuCheck className="w-3 h-3 text-white" />}
                          </button>
                          <strong className="truncate text-[var(--text)]">{task.title}</strong>
                        </div>
                        <span className={`ml-2 ${isTaskOverdue(task) ? 'text-red-500' : 'text-[var(--text-muted)]'}`}>
                          {new Date(task.dueDate).toLocaleDateString('en-GB')}
                        </span>
                      </li>
                    ))}
                </ul>
              </StatBox>
            </div>
          </div>

          {/* Members list */}
          <div className="col-span-12 xl:col-span-6">
            <div className="h-full min-h-[35vh]">
              <StatBox title="Team Members">
                <div className="flex items-center justify-between mb-2 px-2">
                  {isProjectOwner(currentUser.user.id, projectData?.owner) && (
                    <button
                      className="w-30 h-6 bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] text-white items-center justify-center text-sm rounded"
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
                        {projectData?.owner === user._id && (
                          <p className="text-gray-500 ml-auto">(Owner)</p>
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