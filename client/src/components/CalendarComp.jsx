import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import AddTaskPopup from "./AddTaskPopup";
import ViewTaskModal from "./ViewTaskModal";
import "./CalendarComp.css"
import axios from "axios";


const CalendarComp = () => {
  const [modalStateAdd, setmodalStateAdd] = useState(false);
  const [modalStateView, setModalStateView] = useState(false);

  const [selectedDateInfo, setSelectedDateInfo] = useState(null)
  const [selectedEvent,setSelectedEvent] = useState(null);
  const [currentEvents, setCurrentEvents] = useState([]);

  const handleDateSelect = async (selectInfo) => {
    setSelectedDateInfo(selectInfo);
    setmodalStateAdd(true);
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
    setmodalStateAdd(false);
    setSelectedDateInfo(false);

  };
  const handleEventClick = async (selected) => {
    setSelectedEvent(selected.event);
    setModalStateView(true);
  };
  const handleEventDelete = async () => {
    if (!selectedEvent) return;

    try {
      console.log("Deleting event id:", selectedEvent.id);
      await axios.delete(`http://localhost:5001/calendar/${selectedEvent.id}`);
      selectedEvent.remove();
    } catch (error) {
      console.error("Error deleting task:", error);
    } finally {
      setModalStateView(false);
      setSelectedEvent(null); // Clear the selected event
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
     <AddTaskPopup toggle={modalStateAdd} onSubmit={handleEventSubmission} onClose={()=>{setmodalStateAdd(!modalStateAdd); setSelectedDateInfo(null);}} />
    <ViewTaskModal toggle={modalStateView} action={()=>{setModalStateView(!modalStateView); setSelectedEvent(null);}} onSubmit={handleEventDelete} />

    </>
  );
}
export default CalendarComp