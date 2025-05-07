import React from 'react';
import Navbar from '../components/Sidebar';
import StatBox from '../components/StatBox';
import ProjectHeader from '../components/ProjectHeader';
import { useOutletContext } from 'react-router-dom';
import { 
  useGetProjectByIdQuery, 
  useGetProjectUsersQuery, 
  useUpdateProjectUsersMutation, 
  useGetProjectTasksQuery 
} from '../redux/slices/projectSlice';
import { getInitials } from '../utils/userUtils';
import { isProjectOwner } from '../utils/projectUtils';
import { getTaskStats } from '../utils/taskUtils';
// If available, import current user (adjust as needed)
// import { useGetCurrentUserQuery } from '../redux/slices/userApiSlice';

const Dashboard = () => {
  const { currentProject, currentUser } = useOutletContext();
  const [showProjectUsersModal, setProjectUsersModal] = useState(false);

  // RTK Query hooks to fetch tasks, project details, and project users
  const {
    data: tasks = [],
    isLoading: loadingTasks,
    error: tasksError,
  } = useGetProjectTasksQuery(currentProject?.projectId, {
    skip: !currentProject?.projectId,
  });

  const {
    data: users = [],
    isLoading: loadingUsers,
    error: userError,
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

  // Mutation for updating project team
  const [updateProjectTeam] = useUpdateProjectUsersMutation();

  // Sort users alphabetically by last name
  const sortedUsers = [...users].sort((a, b) =>
    a.lastName.localeCompare(b.lastName)
  );

  // Handler to update team members
  const handleUpdateProjectUsers = async (updatedMemberIds, newOwnerId) => {
    if (!currentProject || !currentProject.projectId) {
      console.error("Cannot save team members: No project selected");
      setProjectUsersModal(false);
      return;
    }

    try {
      await updateProjectUsers({
        projectId: currentProject.projectId,
        users: updatedMemberIds,
        owner: newOwnerId,
      }).unwrap();
      // Show a success message (assumes toast is available in your project)
      toast.success("Team updated successfully!");
    } catch (error) {
      toast.error(`Error updating team: ${error.message || "Unknown error"}`);
      console.error("Error saving team:", error);
    } finally {
      setProjectUsersModal(false);
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

  // Get task statistics
  //const { completed, inProgress, overdue } = getTaskStats(tasks);
  const completedCount = tasks.filter(
    (task) => task.status?.toLowerCase() === 'completed'
  ).length;
  const inProgressCount = tasks.filter(
    (task) => task.status?.toLowerCase() === 'in progress'
  ).length;
  const overdueCount = tasks.filter(
    (task) =>
      new Date(task.dueDate) < new Date() &&
      task.status?.toLowerCase() !== 'completed'
  ).length;

  return (
    <>
      <Navbar />
      <div className="ml-[15%] w-[85%] min-h-screen bg-[var(--background-primary)]">
        <ProjectHeader project={currentProject} />

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6 auto-rows-fr">
          {/* Top Stats */}
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

          {/* Bottom Panels */}
          <div className="col-span-12 xl:col-span-6">
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
          </div>

          {/* Members list */}
          <div className="col-span-12 xl:col-span-6">
            <div className="h-full min-h-[35vh]">
              <StatBox title="Team Members">
                <div className="flex items-center justify-between mb-2 px-2">
                  {isProjectOwner(currentUser, projectDetails?.owner) && (
                    <button
                      className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-700 text-sm"
                      onClick={() => setProjectUsersModal(true)}
                      title="Assign Members"
                    >
                      ＋
                    </button>
                  )}
                </div>

                <div className="px-2">
                  <ul className="space-y-1 text-xs">
                    {sortedUsers.map((user) => (
                      <li
                        key={user._id || user.id}
                        className="p-2 rounded-md bg-[var(--background-primary)] flex items-center gap-2 text-[var(--text)]"
                      >
                        <div
                          className="w-6 h-6 rounded-full bg-gray-300 text-gray-800 text-xs flex items-center justify-center"
                          title={`${user.firstName} ${user.lastName}`}
                        >
                          {getInitials(user.firstName, user.lastName)}
                        </div>
                        <span>
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

      {/* User Assignment Modal */}
      {showProjectUsersModal && (
        <ProjectUsersModal
          show={showProjectUsersModal}
          initialSelectedMemberIds={projectDetails?.users || []}
          currentProjectOwnerId={projectDetails?.owner}
          onSave={(users, owner) => handleUpdateProjectUsers(users, owner)}
          onCancel={() => setProjectUsersModal(false)}
          allTeamMembers={users}
        />
      )}
    </>
  );
};

export default Dashboard;