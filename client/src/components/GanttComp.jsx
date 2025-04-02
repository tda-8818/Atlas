import { gantt } from 'dhtmlx-gantt';
import React, { Component } from 'react';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';

export default class GanttComp extends Component {
  componentDidMount() {
    gantt.config.date_format = '%d-%m-%Y %H:%i:%s';
    const { tasks } = this.props;
    gantt.init(this.ganttContainer);
    gantt.parse(tasks);
  }

  render() {
    return (
        <div ref={(input) => { this.ganttContainer = input }} className='h-[80vh] mr-[20px] '></div>
    );
  }
}