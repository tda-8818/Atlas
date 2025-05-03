import React from 'react';
import Navbar from '../components/Navbar';
import StatBox from '../components/StatBox';
import ProjectHeader from '../components/ProjectHeader';

const Dashboard = () => {
  // Dummy data for "Your Tasks"
  const tasks = [
    { id: 1, title: "Task 1", status: "Completed", dueDate: "2025-05-01" },
    { id: 2, title: "Task 2", status: "In Progress", dueDate: "2025-05-05" },
    { id: 3, title: "Task 3", status: "Overdue", dueDate: "2025-04-28" },
  ];
  //function for fetching tasks in a project here

  // Dummy data for "Team Members"
  const teamMembers = [
    { id: 1, name: "John Doe", role: "Project Manager" },
    { id: 2, name: "Jane Smith", role: "Developer" },
    { id: 3, name: "Alice Johnson", role: "Designer" },
  ];
  //function for fetching users in a project here
  return (
    <>
      <Navbar />
      <div className="ml-[15%] w-[85%] min-h-screen bg-[var(--background-primary)]">
        <ProjectHeader title="Home" />

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6 auto-rows-fr">
          {/* Top Stats (tasks complete, overdue and in progress) */}
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
                      <strong>{member.name}</strong> <p className='text-[var(--text-muted)]'>{member.role}</p>
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
