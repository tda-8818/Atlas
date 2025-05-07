import React from 'react';
import Navbar from '../components/Sidebar';
import GanttComp from '../components/GanttComp';
import ProjectHeader from '../components/Navbar';
import { useOutletContext } from 'react-router-dom';

const Gantt = () => {
  const { currentProject } = useOutletContext();
  const data = {
    data: [
      { id: 1, text: 'Project #1', start_date: '01-04-2025', duration: 18, progress: 0.4 },
      { id: 2, text: 'Task #1', start_date: '02-04-2025', duration: 8, progress: 0.6 },
      { id: 3, text: 'Task #2', start_date: '11-04-2025', duration: 8, progress: 0.6 }
    ],
    links: [
      { id: 1, source: 1, target: 2, type: '0' },
    ]
  };

  return (
    <div className="flex h-screen ">
      <Navbar />
      <main className="ml-[15%] w-[85%] flex flex-col bg-[var(--background-primary)]">
        {/* Header Section */}
        <div className="flex-none">
          <ProjectHeader project={currentProject} />
        </div>
        {/* Content Section */}
        <div className="flex-1 p-2">
          <div className="w-full h-full">
            <GanttComp tasks={data} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Gantt;
