import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import AddTaskPopup from "./AddTaskPopup";
import "./CalendarComp.css"
import axios from "axios";


const CalendarComp = () => {
  const [modalState, setModalState] = useState(false);

  const [selectedDateInfo, setSelectedDateInfo] = useState(null)
  const [currentEvents, setCurrentEvents] = useState([]);

  function openModal() {
    setModalState(!modalState);
  }
  const handleDateSelect = async (selectInfo) => {
    setSelectedDateInfo(selectInfo);
    setModalState(true);
    // const title = prompt("Please enter a new title for your event");            //CHANGE THIS FOR A CUSTOM POPUP
    // const calendarApi = selectInfo.view.calendar;

    // calendarApi.unselect(); // clear date selection

    // if (title) {
    //   try {

    //     const newEvent = {
    //       title,
    //       start: selectInfo.startStr,
    //       end: selectInfo.endStr,
    //       allDay: selectInfo.allDay,
    //     };


    //     const response = await axios.post("http://localhost:5001/Calendar", newEvent);

    //     if (response.data) {
    //       const savedTask = response.data;
    //       console.log("Task created:", savedTask);

    //       calendarApi.addEvent({
    //         id: savedTask._id,
    //         ...newEvent
    //       });

    //     }

    //   } catch (error) {
    //     console.error("Error adding event:", error);
    //   }
    // }
  };
  const handleEventSubmission = async (formData) =>{
    const calendarApi = selectedDateInfo.view.calendar;
    calendarApi.unselect();

    // Create a new event using the form data from the modal
    // and the date info from the calendar.
    const newEvent = {
      title: formData.title, // from modal input
      start: selectedDateInfo.startStr,
      end: selectedDateInfo.endStr,
      allDay: selectedDateInfo.allDay,
      description: formData.description // extra info from your modal
    };
    try {
      // Optionally save the new event to a server.
      const response = await axios.post("http://localhost:5001/Calendar", newEvent);
      if (response.data) {
        const savedTask = response.data;
        console.log("Task created:", savedTask);
        calendarApi.addEvent({
          id: savedTask._id,
          ...newEvent
        });
      }
    } catch (error) {
      console.error("Error adding event:", error);
    };

    // Close the modal and clear our saved selection.
    setModalState(false);
    setSelectedDateInfo(false);

  };
  const handleEventClick = async (selected) => {
    if (window.confirm(`Are you sure you want to delete the event '${selected.event.title}'`)) {        //CHANGE THIS FOR A CUSTOM POPUP
      try {
        console.log("xdd is ", selected.event.id);
        const response = await axios.delete(`http://localhost:5001/calendar/${selected.event.id}`);
        selected.event.remove();

      } catch (error) {
        console.error("Error deleting task:", error);
      }
    }
  };
  return (
    <>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
        }}
        initialView="dayGridMonth"
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        // initialEvents={INITIAL_EVENTS} // alternatively, use the `events` setting to fetch from a feed
        select={handleDateSelect}
        // eventContent={renderEventContent} // custom render function
        eventClick={handleEventClick}
        eventsSet={(events) => setCurrentEvents(events)} // called after events are initialized/added/changed/removed
        initialEvents={
          [
            { id: 1, title: "event 1", date: "2025-03-01" },
            { id: 2, title: "event 2", date: "2025-03-02" },
            { id: 3, title: "event 3", date: "2025-03-03" }
          ]
        }
      />
     <AddTaskPopup toggle={modalState} onSubmit={handleEventSubmission} onClose={()=>{openModal(); setSelectedDateInfo(null);}} />
    </>
  );
}
export default CalendarComp