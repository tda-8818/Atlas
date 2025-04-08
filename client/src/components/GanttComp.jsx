import { gantt } from 'dhtmlx-gantt';
import React, { Component } from 'react';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import axios from 'axios';

export default class GanttComp extends Component {
  componentDidMount() {
    gantt.config.date_format = '%d-%m-%Y %H:%i:%s';
    const { tasks } = this.props;
    gantt.init(this.ganttContainer);
    gantt.parse(tasks);

    gantt.attachEvent("onAfterTaskAdd", async (id, task) => {
      //console.log("New task added xdd:", task);
      try {
        const newTask = {
              id: id,
              title: task.text,
              start: task.start_date,
              duration: task.duration,
              progress: task.progress,
            };

        const response = await axios.post("http://localhost:5001/gantt", newTask);
        //console.log("Task created:", response.data);
        
        // if (response.data && response.data._id)
        // {
        //   console.log(response.data._id);
        //   //gantt.changeTaskId(id, response.data._id)

        // }
      } catch (error) {
        console.error("Error creating task:", error);
      }});
  }



  render() {
    return (
        <div ref={(input) => { this.ganttContainer = input }} className='h-[80vh] mr-[20px] '></div>
    );
  }
}