import React from 'react';
import Navbar from '../components/Navbar';
import StatBox from '../components/StatBox';
import ProjectHeader from '../components/ProjectHeader';

const Dashboard = () => {
  return (
    <>
      <Navbar />
      <div className="ml-[15%] w-[85%] min-h-screen bg-[var(--background-primary)]">
        <ProjectHeader title="Home" />

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6 auto-rows-fr">
          {/* Top Stats */}
          <div className="col-span-12 xl:col-span-4">
            <div className="h-full min-h-[20vh]">
              <StatBox title="Tasks Completed" value="5" />
            </div>
          </div>
          <div className="col-span-12 xl:col-span-4">
            <div className="h-full min-h-[20vh]">
              <StatBox title="Tasks In Progress" value="3" />
            </div>
          </div>
          <div className="col-span-12 xl:col-span-4">
            <div className="h-full min-h-[20vh]">
              <StatBox title="Tasks Overdue" value="2" />
            </div>
          </div>

          {/* Bottom Panels */}
          <div className="col-span-12 xl:col-span-6">
            <div className="h-full min-h-[35vh]">
              <StatBox title="Your Tasks" />
            </div>
          </div>
          <div className="col-span-12 xl:col-span-6">
            <div className="h-full min-h-[35vh]">
              <StatBox title="Team Members" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
