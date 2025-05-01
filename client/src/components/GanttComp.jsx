import { gantt } from 'dhtmlx-gantt';
import React, { Component } from 'react';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import axios from 'axios';
import "./GanttComp.css";

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

    // --- Modern dynamic timeline configuration ---
    const today = new Date();
    gantt.config.start_date = new Date(today.getFullYear() - 1, today.getMonth(), 1);
    gantt.config.end_date = new Date(today.getFullYear() + 1, today.getMonth() + 1, 0);

    // --- Modern scale configuration ---
    gantt.config.scales = [
      { unit: "month", step: 1, format: "%M %Y" }, // e.g., Jan 2024
      {
        unit: "week", step: 1,
        format: date => gantt.date.date_to_str("%d")(date) // e.g., 01 Jan
      }
    ];

    // --- Professional styling ---
    gantt.config.task_height = 30;
    gantt.config.grid_width = 300;
    gantt.config.date_format = '%d-%m-%Y %H:%i:%s';

    gantt.config.columns = [
      { name: "text", label: "Task", width: "*", tree: true, resize: true },
      { name: "duration", label: "Days", align: "center", resize: true },
      { name: "assigned", label: "Assigned", align: "center", resize: true },
      {
        name: "add",
        label: "",
        width: 40,
        align: "center",
        resize: false,
        template: () => `<button class="gantt-add-btn" title="Add Task">+</button>`
      }
    ];

    // Add button click handler
    gantt.attachEvent("onGridClick", (taskId, column) => {
      if (column === "add") {
        const today = new Date();
        gantt.showLightbox({
          id: null,
          start_date: today,
          duration: 1,
          parent: taskId,
          text: ""
        });
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


    // --- Initialize Gantt ---
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
