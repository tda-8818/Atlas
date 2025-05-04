import React from 'react';
import Navbar from '../components/Navbar';
import ProjectHeader from '../components/ProjectHeader';
import CalendarComp from '../components/CalendarComp';
import { useOutletContext } from 'react-router-dom';

const Calendar = () => {
const { currentProject } = useOutletContext();
  return (
    <div className="flex">
      {/* Navbar */}
      <Navbar />

      <div className="flex h-screen w-full ">
        <main className="ml-[15%] w-[85%] flex flex-col bg-[var(--background-primary)]">
          {/* Header Section */}
          <div className="flex-none">
            <ProjectHeader project = {currentProject} />
          </div>

          {/* Content Section */}
          <div className="flex-1 p-6 overflow-auto">
            <CalendarComp project={currentProject} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Calendar;
