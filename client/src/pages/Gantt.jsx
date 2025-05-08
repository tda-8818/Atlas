import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import GanttComp from '../components/GanttComp';
import { useOutletContext } from "react-router-dom";
import AddTaskPopup from '../components/AddTaskPopup-1';
import { gantt } from 'dhtmlx-gantt';
import Sidebar from '../components/Sidebar';
import { useAddTaskMutation, useDeleteTaskMutation, useUpdateTaskMutation } from '../redux/slices/taskSlice';
import { useGetProjectTasksQuery } from '../redux/slices/projectSlice';

// Team members data for assignment (Ideally, this should be fetched or in a shared context)
// Duplicated here and in AddTaskPopup-1.jsx - consider centralizing.
const teamMembers = [
  { id: "user-1", name: "Alex Johnson", avatar: "https://i.pravatar.cc/150?img=1", initials: "AJ" },
  { id: "user-2", name: "Sarah Wilson", avatar: "https://i.pravatar.cc/150?img=2", initials: "SW" },
  { id: "user-3", name: "David Chen", avatar: "https://i.pravatar.cc/150?img=3", initials: "DC" },
  { id: "user-4", name: "Emma Rodriguez", avatar: "https://i.pravatar.cc/150?img=4", initials: "ER" },
  { id: "user-5", name: "Michael Brown", avatar: "https://i.pravatar.cc/150?img=5", initials: "MB" },
];

// Helper to format date string to DHTMLX Gantt Date object (sets time to noon)
function formatDateForGantt(dateStr) {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    // Setting time to noon helps avoid timezone/daylight saving issues affecting duration calculation
    // and ensures the date corresponds to the start of the day in Gantt's view.
    date.setHours(12, 0, 0, 0);
    if (isNaN(date.getTime())) {
      console.error("Invalid date string provided:", dateStr);
      return null;
    }
    return date;
}

// Helper to format date from DHTMLX Gantt Date object to YYYY-MM-DD string for popup
function formatDateForPopup(dateObj) {
    if (!dateObj || !(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
        return '';
    }
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// This helper is no longer used for calculating duration passed to Gantt,
// but keeping it might be useful for other purposes or future features.
// function calculateDurationFromStrings(startDateStr, dueDateStr) {
//     if (!startDateStr || !dueDateStr) {
//         return 1; // Default to 1 day if dates are missing
//     }
//     const start = new Date(startDateStr);
//     const end = new Date(dueDateStr);

//     start.setHours(12, 0, 0, 0);
//     end.setHours(12, 0, 0, 0);

//     const diffTime = end.getTime() - start.getTime();
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

//     return Math.max(1, diffDays); // Ensure duration is at least 1
// }


const Gantt = () => {
  const { currentProject } = useOutletContext();

  const [addTask] = useAddTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [editTask] = useUpdateTaskMutation();
  const { data: projectTasks = [], isLoading, isError } = useGetTasksByProjectQuery(currentProject._id);

  // Format tasks for DHTMLX Gantt
  const formattedData = {
    data: projectTasks.map(task => ({
      id: task._id,
      text: task.title,
      start_date: task.start, // make sure this is in Gantt-compatible format
      duration: task.duration,
      progress: task.progress || 0,
    })),
    links: [] // optionally add real links here
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

        {/* Complete Task Popup with all fields (without Headless UI) */}
        {/* Render the popup based on showAddTaskPopup state */}
        {showAddTaskPopup && (
          <AddTaskPopup
            show={showAddTaskPopup} // Pass the show state explicitly
            onAddTask={handleSaveTaskFromPopup} // Use the save handler
            onCancel={handleCancelPopup}
            onEdit={handleEditTaskConfirm}
            onDelete={handleDeleteTaskFromPopup}
            teamMembers={teamMembers} // Pass team members to the popup
            initialValues={editingTask} // Pass the task data when editing
          />
        )}
      </div>
    </div>
  );
};

export default Gantt;