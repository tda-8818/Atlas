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
    const [showAddTaskPopup, setShowAddTaskPopup] = useState(false);
    const [editingTask, setEditingTask] = useState(null); // State to hold the task data when editing

    const [addTask] = useAddTaskMutation();
    const [deleteTask] = useDeleteTaskMutation();
    const [editTask] = useUpdateTaskMutation();
    const { data: projectTasks, isLoading, isError} = useGetProjectTasksQuery(currentProject._id);
    const [tasks, setTasks] = useState({
        projectTasks
    });

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


   // Handler to update tasks state when Gantt itself changes tasks (e.g., dragging, resizing)
   // This handler receives the task object *after* Gantt has updated its internal state
   // updatedGanttTask will have start_date (Date), end_date (Date), and duration (number)
   const handleGanttTaskUpdate = (taskId, updatedGanttTask) => {
       console.log("Gantt updated task from drag/resize:", taskId, updatedGanttTask);

       setTasks(prevTasks => ({
           ...prevTasks,
           data: prevTasks.data.map(task => {
               if (task.id === taskId) {
                   // Create a new object by merging updates
                   const updatedTask = {
                       ...task, // Keep existing custom properties
                       ...updatedGanttTask, // Apply Gantt's changes (start_date, end_date, duration, progress etc.)
                       // Ensure custom properties are not overwritten if Gantt didn't modify them
                       assignedTo: updatedGanttTask.assignedTo !== undefined ? updatedGanttTask.assignedTo : task.assignedTo,
                       description: updatedGanttTask.description !== undefined ? updatedGanttTask.description : task.description,
                       priority: updatedGanttTask.priority !== undefined ? updatedGanttTask.priority : task.priority,
                       tag: updatedGanttTask.tag !== undefined ? updatedGanttTask.tag : task.tag,
                       subtasks: updatedGanttTask.subtasks !== undefined ? updatedGanttTask.subtasks : task.subtasks,

                       // --- IMPORTANT: Recalculate and store the date strings for the popup ---
                       // Use Gantt's start_date and end_date as the source of truth after a drag/resize.
                       startDate: updatedGanttTask.start_date ? formatDateForPopup(updatedGanttTask.start_date) : '',
                       dueDate: updatedGanttTask.end_date ? formatDateForPopup(gantt.date.add(updatedGanttTask.end_date, -1, 'day')) : '' // Due date is the day before Gantt's end_date
                   };
                    console.log("Updated state for task (from Gantt update):", taskId, updatedTask);
                   return updatedTask;
               }
               return task;
           })
       }));
   };

   // Handler to delete tasks from state when Gantt deletes them
   const handleGanttTaskDelete = (taskId) => {
       console.log("Gantt deleted task:", taskId);
       setTasks(prevTasks => ({
           ...prevTasks,
           data: prevTasks.data.filter(task => task.id !== taskId)
       }));
   };


  // Handler for adding/saving a task from the popup
  const handleSaveTaskFromPopup = (cardData) => {
    // Safely access and trim properties, defaulting to empty string if null/undefined
    const title = cardData.title ? cardData.title.trim() : '';
    const tag = cardData.tag ? cardData.tag.trim() : '';
    const description = cardData.description ? cardData.description.trim() : '';
    const assignedTo = cardData.assignedTo || []; // Ensure it's an array, default to empty
    const priority = cardData.priority || 'none'; // Default priority
    const subtasks = cardData.subtasks || [];

    // Basic validation (already handled in popup, but good to have a fallback)
    if (!title && !cardData.id) { // Check if title is required for new tasks (no ID)
        alert("Task title is required for new tasks.");
        return;
    }

    // --- Date Logic Based on Popup Inputs (Deriving Start and End Dates for Gantt) ---
    const popupStartDateStr = cardData.startDate;
    const popupDueDateStr = cardData.dueDate; // This is the last day of the task

    let startDateForGantt = null; // Date object for start date
    let endDateForGantt = null;   // Date object for end date (Gantt's end_date is exclusive)

    if (popupStartDateStr) {
        startDateForGantt = formatDateForGantt(popupStartDateStr);
    }

    if (popupDueDateStr) {
        // Gantt's end_date is typically the day *after* the task ends.
        // So, add one day to the popup's due date string.
        const dueDateObj = formatDateForGantt(popupDueDateStr);
        if (dueDateObj) {
             endDateForGantt = gantt.date.add(dueDateObj, 1, 'day');
        }
    }

    // If only end date was provided, set start date to be the same as the calculated *start* date for Gantt
    // This effectively creates a 1-day task ending on the due date.
    if (endDateForGantt && !startDateForGantt) {
        // The calculated start date for Gantt in this case is the day before endDateForGantt
        startDateForGantt = gantt.date.add(endDateForGantt, -1, 'day');
    }


    // If neither date is provided (for a new task), default to today, 1 day
    if (!cardData.id && !startDateForGantt && !endDateForGantt) {
        startDateForGantt = new Date();
        startDateForGantt.setHours(12, 0, 0, 0);
        // For a 1-day task, end date is the day after start date
        endDateForGantt = gantt.date.add(startDateForGantt, 1, 'day');
    }

     // Ensure end date is not before start date (adjust end date if necessary)
     // Gantt's end_date must be >= start_date + 1 day for a duration >= 1
     if (startDateForGantt && endDateForGantt && endDateForGantt <= startDateForGantt) {
         console.warn("Due date is before or same as start date. Adjusting end date to be one day after start date.");
         endDateForGantt = gantt.date.add(startDateForGantt, 1, 'day'); // Set end date to be one day after start date
     }


    // Construct the task data object to be stored in React state
    // This object includes both Gantt-compatible properties and custom properties
    const taskDataToStore = {
      // Use existing ID if editing, generate new if adding
      id: cardData.id || gantt.uid(), // Use gantt.uid() for new task IDs
      text: title,
      // Store Date objects for Gantt's internal use based on popup dates
      start_date: startDateForGantt, // Pass Date object
      end_date: endDateForGantt,     // Pass Date object (exclusive)
      // Do NOT calculate and pass 'duration' here when updating from popup.
      // Let Gantt calculate duration based on start_date and end_date.
      // Gantt will automatically set the 'duration' property internally.

      progress: cardData.progress || 0, // Preserve progress or default
      parent: cardData.parent || null, // Preserve parent ID if adding a subtask
      type: 'task', // Explicitly set type to 'task'

      // Store custom properties, including original date strings from popup
      tag: tag === '' ? null : tag,
      description: description,
      assignedTo: assignedTo,
      priority: priority,
      subtasks: subtasks,
      // --- IMPORTANT: Store the original date strings from the popup for editing purposes ---
      // These are the user's intended dates from the form.
      startDate: popupStartDateStr, // Keep the string from the popup
      dueDate: popupDueDateStr // Keep the string from the popup
    };

    console.log("Saving task from popup:", taskDataToStore);


    // Check if we are editing an existing task
    const existingTaskIndex = tasks.data.findIndex(task => task.id === taskDataToStore.id);

    if (existingTaskIndex !== -1) {
        // Editing existing task
        // Merge the updated properties into the existing task object in state
        const updatedTasksData = [...tasks.data];
        // Create a new object by merging to ensure immutability
        updatedTasksData[existingTaskIndex] = {
            ...updatedTasksData[existingTaskIndex], // Keep any properties not in taskDataToStore
            ...taskDataToStore // Apply updates (title, dates, assignedTo, etc.)
        };


        setTasks(prevTasks => ({
            ...prevTasks,
            data: updatedTasksData
        }));

        // Update the Gantt instance directly for immediate visual feedback
         // Pass the taskDataToStore which now has start_date and end_date
         gantt.updateTask(taskDataToStore.id, taskDataToStore);


    } else {
        // Adding new task
        setTasks(prevTasks => ({
            ...prevTasks,
            data: [...prevTasks.data, taskDataToStore]
        }));
        // Add to Gantt instance for immediate visual feedback
        // Gantt's addTask expects the same structure as `taskDataToStore`
        gantt.addTask(taskDataToStore);
    }

    // Close popup and reset editing state
    setShowAddTaskPopup(false);
    setEditingTask(null);
  };

  // Handler to open the popup for adding a new task
  const openAddTaskPopup = (initialTaskData = {}) => {
       setEditingTask({ // Set initial state for a new task
           id: null, // No ID yet
           title: '',
           tag: '',
           startDate: '', // Start with empty date strings for new tasks
           dueDate: '',
           assignedTo: [],
           description: '',
           subtasks: [],
           priority: 'none',
           parent: initialTaskData.parent || null // Pass parent ID if adding a subtask
       });
       setShowAddTaskPopup(true);
  };


  // Handler to open the popup for editing an existing task
  const handleEditTask = (ganttTask) => {
       console.log("Editing Gantt task:", ganttTask);
       // Prepare task data for the popup, including custom properties
       const taskDataForPopup = {
           id: ganttTask.id,
           title: ganttTask.text || '',
           tag: ganttTask.tag || '',
           // --- IMPORTANT: Pass the stored date strings to the popup ---
           // These are the user's last inputs from the form, not Gantt's calculated dates.
           // Use the startDate and dueDate properties stored in our state, which are
           // kept in sync with Gantt's timeline by handleGanttTaskUpdate.
           startDate: ganttTask.startDate || '',
           dueDate: ganttTask.dueDate || '',
           assignedTo: ganttTask.assignedTo || [],
           description: ganttTask.description || '',
           subtasks: ganttTask.subtasks || [],
           priority: ganttTask.priority || 'none',
           parent: ganttTask.parent || null,
            // Pass progress for potential future use in popup
           progress: ganttTask.progress || 0
       };
        console.log("Opening popup with data:", taskDataForPopup);
       setEditingTask(taskDataForPopup);
       setShowAddTaskPopup(true);
  };


  // Function to cancel adding/editing
  const handleCancelPopup = () => {
    // If editing, reset editingTask state
    if (editingTask) {
        setEditingTask(null);
    }
    setShowAddTaskPopup(false);
  };

  return (
    <div>
      <Sidebar />
      <div className="ml-[15%] w-[85%] h-[9vh]">
        <Navbar project={currentProject} />
      </div>
      <div className="p-4 font-sans ml-[15%] w-[85%] bg-[var(--background-primary)] text-[var(--text)] h-[91vh] overflow-y-auto">
        {/* Gantt Chart Component */}
        <div className="w-full h-full">
          <GanttComp
            tasks={formattedData} // Pass the tasks state
            onAddTask={openAddTaskPopup}
            onEditTask={handleEditTask}
            onGanttTaskUpdate={handleGanttTaskUpdate} // Handle updates from Gantt drag/resize
            onGanttTaskDelete={handleGanttTaskDelete} // Handle deletes from Gantt
            teamMembers={teamMembers} // Pass team members to GanttComp for column template
          />
        </div>

        {/* Complete Task Popup with all fields (without Headless UI) */}
        {/* Render the popup based on showAddTaskPopup state */}
        {showAddTaskPopup && (
          <AddTaskPopup
            show={showAddTaskPopup} // Pass the show state explicitly
            onAddTask={handleSaveTaskFromPopup} // Use the save handler
            onCancel={handleCancelPopup}
            teamMembers={teamMembers} // Pass team members to the popup
            initialValues={editingTask} // Pass the task data when editing
          />
        )}
      </div>
    </div>
  );
};

export default Gantt;