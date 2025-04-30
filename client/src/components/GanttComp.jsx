import { gantt } from 'dhtmlx-gantt';
import React, { Component } from 'react';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import axios from 'axios';
import "./GanttComp.css"; // Assuming you have a CSS file for GanttComp

export default class GanttComp extends Component {
  componentDidMount() {
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
          if (response.data){
            const savedTask = response.data;
            gantt.changeTaskId(newTask.id, savedTask._id);
          }

        } catch (error) {
          console.error("Error creating task:", error);
        }
      });
      this.eventAttached = true;
    }

    // Configure Gantt chart for a professional look
    gantt.config.date_format = '%d-%m-%Y %H:%i:%s'; // Keep your date format

    // Set the timeline range to fit a larger view
    gantt.config.start_date = new Date(2021, 0, 1);  // Example: Start from Jan 1, 2021
    gantt.config.end_date = new Date(2023, 11, 31);  // Example: End on Dec 31, 2023

    // Adjusting the scale to view a larger timeline (months and weeks)
    gantt.config.scale_unit = "month"; // Use months for broader view
    gantt.config.date_scale = "%b %Y"; // Use abbreviated month name with year (e.g., Jan 2021)

    // Subscales to show weeks within the months
    gantt.config.subscales = [
      { unit: "week", step: 1, template: function(date) { 
        return `Week ${gantt.date.date_to_str("%W")(date)}`;  // Display week number as 'Week 1', 'Week 2', etc.
      }} // Show week number within each month
    ];

    // Zoom settings: Allow zoom-in and zoom-out
    gantt.config.zoom = {
      levels: [
        {
          name: "month",
          scale_unit: "month",
          date_scale: "%b %Y", // Abbreviated month and year
          subscales: [
            { unit: "week", step: 1, template: function(date) { 
              return `Week ${gantt.date.date_to_str("%W")(date)}`;  // Display week number as 'Week 1', 'Week 2', etc.
            }}
          ]
        },
        {
          name: "week",
          scale_unit: "week",
          date_scale: "%d %M", // Show day and month for week view
          subscales: []
        }
      ]
    };

    // Styling adjustments for professional look
    gantt.config.task_height = 30; // Make tasks taller for better readability
    gantt.config.grid_width = 300;  // Adjust grid width for better column visibility
    gantt.config.columns = [
      { name: "text", label: "Task", width: "*", tree: true }, // Task name column
      { name: "start_date", label: "Start Date", align: "center" }, // Start Date column
      { name: "duration", label: "Duration", align: "center" }, // Duration column
      { name: "progress", label: "Progress", align: "center" }, // Progress column
    ];

    // Customize grid lines for a cleaner, modern look
    gantt.config.grid_lines = {
      "top": { color: "#e5e7eb", style: "solid", width: 1 },
      "bottom": { color: "#e5e7eb", style: "solid", width: 1 },
    };

    // Set the task bar color for a more modern look
    gantt.config.taskbar_background = "#4caf50"; // Green task bar
    gantt.config.taskbar_color = "#ffffff"; // White text for task bars
    gantt.config.task_progress_color = "#81c784"; // Lighter green for progress
    gantt.config.task_text_color = "#ffffff"; // White text on tasks

    // Set dependency line color to improve clarity
    gantt.config.link_line_color = "#0288d1"; // Blue color for dependency lines

    // Initialize Gantt chart
    gantt.init(this.ganttContainer);
    gantt.parse(this.props.tasks);
  }

  render() {
    return (
      <div
        ref={(input) => { this.ganttContainer = input }}
        className="w-full h-full"
      />
    );
  }
}
