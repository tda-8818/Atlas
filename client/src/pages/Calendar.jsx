import React from 'react';
import CalendarComp from '../components/CalendarComp';
import { useOutletContext } from 'react-router-dom';

const Calendar = () => {
  const { currentProject } = useOutletContext();

  return (
    <CalendarComp project={currentProject} />
  );
};

export default Calendar;