import { gantt } from 'dhtmlx-gantt';
import React, { Component } from 'react';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import axios from 'axios';

export default class GanttComp extends Component {
  componentDidMount() {
    if (!this.eventAttached) {
      gantt.attachEvent("onAfterTaskAdd", async (id, task) => {
        try {
          // At this point, the id is created by the gantt API. We want to change this to the mongoID later on
          const newTask = {
            id: id,
            title: task.text,
            start: task.start_date,
            duration: task.duration,
            progress: task.progress,
          };
          
          const response = await axios.post("http://localhost:5001/Gantt", newTask);
          if (response.data){
            console.log("response from server received. MongoID: ", response.data);
            const savedTask = response.data;
            // Change the ID to be the respective mongoDB id
            // The mongoDB id can be found on task creation by sending a HTTP response 201 in taskController.js 
            gantt.changeTaskId(newTask.id, savedTask._id);

            console.log(savedTask._id);
          }

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
        <div ref={(input) => { this.ganttContainer = input }} className='h-[85vh] w-full mr-[20px] '></div>
    );
  }
}