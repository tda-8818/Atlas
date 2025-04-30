import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import AddTaskPopup from "./AddTaskPopup";
import "./CalendarComp.css";
import axios from "axios";

const CalendarComp = () => {
  const [modalStateAdd, setmodalStateAdd] = useState(false);
  const [selectedDateInfo, setSelectedDateInfo] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentEvents, setCurrentEvents] = useState([]);

  const handleDateSelect = async (selectInfo) => {
    setSelectedDateInfo(selectInfo);
    setmodalStateAdd(true);
  };

  const handleEventSubmission = async (formData) => {
    const calendarApi = selectedDateInfo.view.calendar;
    calendarApi.unselect();

    const newEvent = {
      title: formData.title,
      start: selectedDateInfo.startStr,
      end: selectedDateInfo.endStr,
      allDay: selectedDateInfo.allDay,
      description: formData.description
    };

    try {
      const response = await axios.post("http://localhost:5001/Calendar", newEvent);
      if (response.data) {
        const savedTask = response.data;
        calendarApi.addEvent({ id: savedTask._id, ...newEvent });
      }
    } catch (error) {
      console.error("Error adding event:", error);
    }

    setmodalStateAdd(false);
    setSelectedDateInfo(null);
  };

  const handleEventClick = (selected) => {
    setSelectedEvent(selected.event);
    setmodalStateAdd(true);
  };

  const handleEventDelete = async () => {
    if (!selectedEvent) return;

    try {
      await axios.delete(`http://localhost:5001/calendar/${selectedEvent.id}`);
      selectedEvent.remove();
    } catch (error) {
      console.error("Error deleting task:", error);
    } finally {
      setSelectedEvent(null);
      setmodalStateAdd(false);
    }
  };

  return (
    <div className="bg-[var(--background)] rounded-2xl shadow-md p-4 h-full w-full">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek"
        }}
        initialView="dayGridMonth"
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        select={handleDateSelect}
        eventClick={handleEventClick}
        eventsSet={setCurrentEvents}
        initialEvents={[
          { id: 1, title: "event 1", date: "2025-03-01" },
          { id: 2, title: "event 2", date: "2025-03-02" },
          { id: 3, title: "event 3", date: "2025-03-03" }
        ]}
        height="100%"
      />

      <AddTaskPopup
        toggle={modalStateAdd}
        onSubmit={handleEventSubmission}
        onClose={() => {
          setmodalStateAdd(false);
          setSelectedDateInfo(null);
          setSelectedEvent(null);
        }}
        onDelete={handleEventDelete}
        event={selectedEvent}
      />
    </div>
  );
};

export default CalendarComp;
