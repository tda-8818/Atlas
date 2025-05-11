// GanttComp.jsx

import { gantt } from 'dhtmlx-gantt';
import React, { Component } from 'react';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import "./css/GanttComp.css";

export default class GanttComp extends Component {
  constructor(props) {
    super(props);
    this.eventAttached = false; // Flag to prevent attaching CRUD events multiple times
    this.taskClickEventAttached = false; // Flag for task click event
    this.ganttContainer = React.createRef(); // Use React.createRef()
  }

  componentDidMount() {
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

      // This fires after a task is updated (e.g., dragged, resized, or updated via gantt.updateTask)
      gantt.attachEvent("onAfterTaskUpdate", (id, task) => {
           console.log("Gantt onAfterTaskUpdate:", id, task);
           // Call the parent component's handler to update React state
           // Pass the task ID and the updated task object from Gantt
           // This will contain the new start_date and end_date/duration after a drag/resize
           if (onGanttTaskUpdate && typeof onGanttTaskUpdate === 'function') {
               onGanttTaskUpdate(id, task);
           }
           // Backend integration logic here (optional) - could be in the parent or here
      });

       // This fires after a task is deleted (e.g., using Gantt's delete key)
       gantt.attachEvent("onAfterTaskDelete", (id) => {
           console.log("Gantt onAfterTaskDelete:", id);
           // Call the parent component's handler to update React state
           if (onGanttTaskDelete && typeof onGanttTaskDelete === 'function') {
               onGanttTaskDelete(id);
           }
           // Backend integration logic here (optional)
       });

      this.eventAttached = true; // Set flag after attaching CRUD events
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

    // Custom tooltip template
    gantt.templates.tooltip_text = function(start, end, task) {
        const assignedNames = (task.assignedTo || [])
           .map(userId => {
               const member = teamMembers.find(m => m.id === userId); // Use teamMembers prop
               return member ? member.name : 'Unknown';
           })
           .join(', ');

        // Format dates for display in tooltip
        // Use task.start_date and task.end_date from Gantt's internal object
        const startDateFormatted = task.start_date ? gantt.date.date_to_str("%Y-%m-%d")(task.start_date) : 'N/A';
        // Gantt's end_date is exclusive, tooltip usually shows the last day, so subtract 1 day
        const endDateFormatted = task.end_date ? gantt.date.date_to_str("%Y-%m-%d")(gantt.date.add(task.end_date, -1, 'day')) : 'N/A';


        return `
            <b>Task:</b> ${task.text || 'Untitled Task'}<br/>
            <b>Start date:</b> ${startDateFormatted}<br/>
            <b>End date:</b> ${endDateFormatted}<br/>
            <b>Duration:</b> ${task.duration || 0} days<br/>
            <b>Progress:</b> ${Math.round((task.progress || 0) * 100)}%<br/>
            ${assignedNames ? `<b>Assigned To:</b> ${assignedNames}<br/>` : ''}
            ${task.priority && task.priority !== 'none' ? `<b>Priority:</b> ${task.priority}<br/>` : ''}
            ${task.tag ? `<b>Tag:</b> ${task.tag}<br/>` : ''}
            ${task.description ? `<b>Description:</b> ${task.description.substring(0, 100)}${task.description.length > 100 ? '...' : ''}<br/>` : ''}
        `;
    };

    // Priority-based coloring for the task bar
    gantt.templates.task_class = function(start, end, task) {
      let classes = '';
      if (task.priority === '!!!') {
        classes += ' high-priority-task';
      } else if (task.priority === '!!') {
          classes += ' medium-priority-task';
      } else if (task.priority === '!') {
          classes += ' low-priority-task';
      }
       // Check if progress is 1 or more (representing 100%)
       if (task.progress >= 1) {
           classes += ' completed-task'; // Add class for completed tasks
       }
      return classes.trim();
    };

    // --- Enable Dragging and Resizing ---
    gantt.config.drag_move = true; // Enable dragging tasks on timeline
    gantt.config.drag_resize = true; // Enable resizing tasks on timeline
    gantt.config.drag_links = true; // Enable creating links between tasks

     // Configure Gantt to calculate duration based on start_date and end_date
     // This is the default behavior, but good to be aware of.
     // If you had specific work calendars, you might need more complex config here.
     // gantt.config.duration_unit = "day";
     // gantt.config.work_time = true; // Enable work calendars if configured
     // gantt.config.skip_off_time = true; // Skip non-working time when calculating duration/end_date


    // Initialize Gantt
    // Use this.ganttContainer.current with createRef()
    gantt.init(this.ganttContainer.current);
    // Detect Enter key in inline cell editor and trigger save
    gantt.attachEvent("onEditEnd", function(state) {
      if (state && state.mode === "edit" && state.editor && state.editor.input) {
        const inputEl = state.editor.input;
        if (!inputEl._enterListenerAdded) {
          inputEl.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
              const taskId = state.id;
              const task = gantt.getTask(taskId);
              // Finalize editing
              gantt.endEdit();
              // Trigger update
              if (typeof state.editor.save === 'function') {
                state.editor.save(); // For good measure
              }
              // This ensures parent update logic runs
              if (typeof this.props.onGanttTaskUpdate === 'function') {
                this.props.onGanttTaskUpdate(taskId, task);
              }
            }
          });
          inputEl._enterListenerAdded = true;
        }
      }
      return true; // Allow default behavior
    }.bind(this));
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