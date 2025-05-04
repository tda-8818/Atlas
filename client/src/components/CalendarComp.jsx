import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import AddTaskPopup from "./AddTaskPopup";
import ViewTaskModal from "./ViewTaskModal";
import "./css/CalendarComp.css"
import axios from "axios";


const CalendarComp = () => {
  const members = [
    { id: "123456", name: "John Doe", image: "/avatars/avatar1.png" }
  ]

  const [modalStateAdd, setmodalStateAdd] = useState(false);
  const [modalStateView, setModalStateView] = useState(false);

  const [selectedDateInfo, setSelectedDateInfo] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentEvents, setCurrentEvents] = useState([]);

  const [actionName, setActionName] = useState(""); //used to determine which action to take in the modal (add/edit/delete)

  //fetches tasks from database 
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get("http://localhost:5001/calendar"); // Adjust if needed
        setCurrentEvents(response.data); // set events into FullCalendar
      } catch (error) {
        console.error("Error fetching calendar tasks:", error);
      }
    };

    fetchTasks();
  }, []);

  // handles date selection via click and opens modal when clicked
  const handleDateSelect = async (selectInfo) => {
    setSelectedDateInfo(selectInfo);
    setmodalStateAdd(true);
    setActionName("Add a task"); // Set action name to "add" for the modal
  };

  // createss a new event using the form data from the modal
  const handleEventSubmission = async (formData) => {
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

  //handles when user clikcs on event in calendar to open modal
  const handleEventClick = async (selected) => {
    setSelectedEvent(selected.event);
    setmodalStateAdd(true);
    setActionName("Edit or delete a task"); // Set action name to "edit" for the modal
  };

  //handles when user chooses to delete an event in the modal
  // deletes the event from the calendar and the server
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
        initialEvents={(events) => setCurrentEvents(events)}
      />
      <AddTaskPopup toggle={modalStateAdd} onSubmit={handleEventSubmission} onClose={() => { setmodalStateAdd(!modalStateAdd); setSelectedDateInfo(null); setSelectedEvent(null); }} onDelete={handleEventDelete} event={selectedEvent} teamMembers={members} actionName={actionName} />
      {/* <ViewTaskModal toggle={modalStateView} action={()=>{setModalStateView(!modalStateView); setSelectedEvent(null);}} onSubmit={handleEventDelete} /> */}

    </>
  );
}
export default CalendarComp