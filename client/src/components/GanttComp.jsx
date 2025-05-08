// GanttComp.jsx

import { gantt } from 'dhtmlx-gantt';
import React, { Component } from 'react';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import "./css/GanttComp.css";

export default class GanttComp extends Component {
  
  componentDidMount() {

    const { addTask, deleteTask, editTask, tasks } = this.props;
    
    // --- Initialize Gantt ---
    gantt.init(this.ganttContainer);
    gantt.parse(this.props.tasks);
    //gantt.parse(tasks);
    
    console.log("tasks:", tasks);
    //adding task to database
    this.initGantt();
    // Initial parse
    console.log("Got tasks in GanttComp:", this.props.tasks); 
    // const formattedData = {
    //   data: 
    // }
    gantt.parse(this.props.tasks);
  }

  componentDidUpdate(prevProps) {
    // Check if the tasks data array reference has changed, or if the number of tasks/links has changed.
    // This is more reliable than JSON.stringify for detecting updates where the array itself is replaced.
    const tasksDataChanged = prevProps.tasks.data !== this.props.tasks.data ||
                             prevProps.tasks.data.length !== this.props.tasks.data.length ||
                             prevProps.tasks.links.length !== this.props.tasks.links.length;

    const teamMembersChanged = prevProps.teamMembers !== this.props.teamMembers; // Assuming teamMembers array reference changes on update

    if (tasksDataChanged || teamMembersChanged) {
      console.log("GanttComp: Tasks data array or Team Members reference changed, re-parsing.");
      // Preserve the scroll position before clearing
      const scrollState = gantt.getScrollState();

      // Clear Gantt and re-parse with the new data from props
      gantt.clearAll();
      gantt.parse(this.props.tasks);

      // Restore scroll position after parsing
      gantt.scrollTo(scrollState.x, scrollState.y);

    } else {
         console.log("GanttComp: No significant changes detected in tasks/members props (array ref or count), skipping re-parse.");
         // Even if we skip re-parse, Gantt might need updates if individual task properties changed
         // without the array reference changing (e.g., if you were mutating state directly, which you're trying to avoid).
         // However, with proper immutable updates in the parent, the array reference *should* change.
         // If you only change a property on a task object *within* the existing array,
         // Gantt might not visually update unless you call gantt.updateTask for that specific task.
         // Your parent component already calls gantt.updateTask, which is good.
         // The issue was the re-parse skipping when it *should* have happened.
    }
  }

  componentWillUnmount() {
      // Clean up gantt instance if necessary
      // gantt.destructor(); // Use this if you have multiple Gantt instances or complex cleanup
      // Detach events if needed for complex scenarios, but usually not required
  }


  initGantt() {
    // Destructure all props needed for configuration and events
    const { onAddTask, onEditTask, onGanttTaskUpdate, onGanttTaskDelete, teamMembers } = this.props;

    // Completely disable the built-in lightbox
    gantt.config.lightbox.sections = [];
    gantt.config.lightbox.project_sections = [];
    gantt.config.show_lightbox = false;

    // Override default task creation behavior (clicking '+' Add Task in grid)
    gantt.attachEvent("onTaskCreated", function(task) {
      if (onAddTask && typeof onAddTask === 'function') {
        // Pass initial data like parent ID
        onAddTask({ parent: task.parent });
      }
      return false; // Prevent the default lightbox from showing
    });

    // Override double-click to open our edit modal
    gantt.attachEvent("onTaskDblClick", (id, e) => {
         const task = gantt.getTask(id);
         console.log("THE GANTT TASK FORMAT: ",task);
         if (onEditTask && typeof onEditTask === 'function') {
              onEditTask(task);
         }
         return false; // Prevent default lightbox
    });

    // Override single click to open our edit modal
     if (!this.taskClickEventAttached) {
         gantt.attachEvent("onTaskClick", (id, e) => {
             // Check if the click target is the '+' button in the grid
             const target = e.target;
             if (target.classList.contains('gantt-add-btn') || target.closest('.gantt_grid_head_add')) {
                  return true; // Let the onGridClick handler handle this
             }

             // Otherwise, handle task editing on single click
             const task = gantt.getTask(id);
             console.log("THE GANTT TASK FORMAT: ",task);
             if (onEditTask && typeof onEditTask === 'function') {
                  onEditTask(task);
             }
             return true; // Allow default selection behavior
         });
         this.taskClickEventAttached = true;
     }


    // --- Attach CRUD events to call parent callbacks ---
    // Attach these events only once
    if (!this.eventAttached) {
      gantt.attachEvent("onAfterTaskAdd", async (id, task) => {
        try {
          const newTask = {
            id: id,
            title: task.text,
            start: task.start_date,
            duration: task.duration,
            progress: task.progress,
          };

          const response = await axios.post("http://localhost:5001/Gantt", newTask);
          if (response.data) {
            const savedTask = response.data;
            gantt.changeTaskId(newTask.id, savedTask._id);
          }
        } catch (error) {
          console.error("Error creating task:", error);
        }
      });
      this.eventAttached = true;
    }


    // --- Modern dynamic timeline configuration --- (-1 year +1 year of current date)
    const today = new Date();
    gantt.config.start_date = new Date(today.getFullYear() - 1, today.getMonth(), 1);
    gantt.config.end_date = new Date(today.getFullYear() + 1, today.getMonth() + 1, 0);

    // --- Modern scale configuration ---
    gantt.config.scales = [
      { unit: "month", step: 1, format: "%M %Y" },
      {
        unit: "week", step: 1,
        format: date => {
             // Calculate week number (simple example)
             const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
             const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
             const weekNumber = Math.floor((pastDaysOfYear + firstDayOfYear.getDay() + 6) / 7);
             return `<div class="week-number">W${weekNumber}</div>`; // Added 'W'
        }
      },
      { unit: "day", step: 1, format: "%d" }
    ];
    gantt.config.scale_height = 60;

    // --- Professional styling ---
    gantt.config.task_height = 25;
    gantt.config.grid_width = 350;
    // Use a format that includes time if needed, though %Y-%m-%d is common
    gantt.config.date_format = '%Y-%m-%d'; // Changed to just date for simplicity

    // --- SIMPLIFIED COLUMN NAMES ---
    gantt.config.columns = [
      { name: "text", label: "Task", width: "*", tree: true, resize: true },
      { name: "duration", label: "Days", align: "center", resize: true }, // <-- This column displays task.duration
      // Assigned To column
      {
          name: "assigned",
          label: "Assigned To",
          align: "center",
          width: 100,
          resize: true,
          template: (task) => {
              if (!task.assignedTo || task.assignedTo.length === 0) {
                  return "";
              }
              // Use the teamMembers prop passed to the component
              const assignedNames = (task.assignedTo || [])
                 .map(userId => {
                     const member = teamMembers.find(m => m.id === userId);
                     return member ? member.initials : '?'; // Display initials
                 })
                 .join(', ');
              return assignedNames;
          }
      },
      {
        name: "add",
        label: "",
        width: 40,
        align: "center",
        resize: false,
        template: () => `<button class="gantt-add-btn" title="Add Task">+</button>`
      }
    ];

    // Add button click handler in the grid
    gantt.attachEvent("onGridClick", (taskId, column) => {
      if (column === "add") {
        if (onAddTask && typeof onAddTask === 'function') {
             const task = gantt.getTask(taskId);
             onAddTask({ parent: task.id }); // Pass parent ID
        }
        return false;
      }
      return true;
    });

    // --- Visual customizations ---
    gantt.config.grid_lines = {
      "top": { color: "#e5e7eb", style: "solid", width: 1 },
      "bottom": { color: "#e5e7eb", style: "solid", width: 1 },
    };

    gantt.config.taskbar_background = "#4caf50";
    gantt.config.taskbar_color = "#ffffff";
    gantt.config.task_progress_color = "#81c784";
    gantt.config.task_text_color = "#ffffff";
    gantt.config.link_line_color = "#0288d1";


  }

  render() {
    return (
      <div
        ref={this.ganttContainer} // Attach the ref
        className="w-full h-full"
        style={{ minHeight: '500px' }}
      />
    );
  }
}