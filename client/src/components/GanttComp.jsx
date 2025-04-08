import { gantt } from 'dhtmlx-gantt';
import React, { Component } from 'react';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import axios from 'axios';

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
          console.log("New task added:", newTask);
          
          const response = await axios.post("http://localhost:5001/Gantt", newTask);
          console.log(response.data);
        } catch (error) {

          console.error("Error creating task:", error);
        }
      });
      this.eventAttached = true;
    }

    gantt.config.date_format = '%d-%m-%Y %H:%i:%s';
    gantt.init(this.ganttContainer);
    gantt.parse(this.props.tasks);
  }


  render() {
    return (
      <div ref={(input) => { this.ganttContainer = input }} className='h-[80vh] mr-[20px] '></div>
    );
  }
}