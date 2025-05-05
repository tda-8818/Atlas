import React from 'react';
import Navbar from '../components/Navbar';
import StatBox from '../components/StatBox';
import ProjectHeader from '../components/ProjectHeader';
import { useOutletContext } from 'react-router-dom';
import { useGetProjectByIdQuery } from '../redux/slices/projectSlice';
import { useGetTasksByProjectQuery } from '../redux/slices/taskSlice';

const Dashboard = () => {
  const { currentProject } = useOutletContext();

  // Use RTK Query to fetch tasks by projectId.
  const {
    data: tasks = [],
    isLoading: loadingTasks,
    error: tasksError,
  } = useGetTasksByProjectQuery(currentProject?._id, {
    skip: !currentProject?._id,
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
                <ul className="space-y-1 text-xs">
                  {teamMembers.map(member => (
                    <li key={member.id} className="p-2 rounded-md bg-[var(--background-primary)] justify-between flex items-center text-[var(--text)]">
                      <strong>{member.firstName} {member.lastName}</strong> <p className='text-[var(--text-muted)]'>{member.role}</p>
                    </li>
                  ))}
                </ul>
              </StatBox>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
