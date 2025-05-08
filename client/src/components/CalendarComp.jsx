import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import AddTaskPopup from "./AddTaskPopup";
import ViewTaskModal from "./ViewTaskModal";
import "./css/CalendarComp.css"
import axios from "axios";
import { useAddTaskMutation, useDeleteTaskMutation, useGetTasksByProjectQuery, useUpdateTaskMutation } from "../redux/slices/taskSlice";

const CalendarComp = ({ project }) => {

  const [modalStateAdd, setmodalStateAdd] = useState(false);
  const [modalStateView, setModalStateView] = useState(false);

  const [selectedDateInfo, setSelectedDateInfo] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentEvents, setCurrentEvents] = useState([]);

  const [actionName, setActionName] = useState(""); //used to determine which action to take in the modal (add/edit/delete)


  /// RTK QUERY FUNCTIONS ///
  const [addTask] = useAddTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [editTask] = useUpdateTaskMutation();

  const {data: projectTasks, isLoading, isError} = useGetTasksByProjectQuery(project._id);
  /// RTK QUERY FUNCTIONS ///


  //fetches tasks from database 
  useEffect(() => {

    if (!project || !projectTasks) return;

    console.log("Got these tasks:", projectTasks);
    
    const transformedTasks = projectTasks.map(task => ({
      id: task._id,
      projectId: task.projectId,
      title: task.title,
      start: task.startDate,
      end: task.dueDate,
      allDay: task.allDay,
      description: task.description
    }));

    setCurrentEvents(transformedTasks);
  }, [project, projectTasks]);


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
      projectId: project._id,
      title: formData.title, // from modal input
      start: selectedDateInfo.startStr,
      end: selectedDateInfo.endStr,
      allDay: selectedDateInfo.allDay,
      description: formData.description // extra info from your modal
    };
    try {
      // Optionally save the new event to a server.
      //ROUTING ISSUE EXISTS
      // const response = await axios.post(`http://localhost:5001/calendar`, newEvent, {
      //   withCredentials: true
      // }, { withCredentials: true });

      const response = await addTask(newEvent).unwrap(); // NOW USING RTK Query instead of axios
      console.log("RESPONSE FROM SERVER: TASK RECEIVED -> ", response);
      if (response) {

        const savedTask = response;
        console.log("Task created via RTK:", savedTask);
        //console.log("Task ID:", savedTask._id);
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
      await deleteTask(selectedEvent.id).unwrap();
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
        select={handleDateSelect}
        eventClick={handleEventClick}
        events={currentEvents}
      />

      <AddTaskPopup toggle={modalStateAdd} onSubmit={handleEventSubmission} onClose={() => { setmodalStateAdd(!modalStateAdd); setSelectedDateInfo(null); setSelectedEvent(null); }} onDelete={handleEventDelete} event={selectedEvent}actionName={actionName} />
      {/* <ViewTaskModal toggle={modalStateView} action={()=>{setModalStateView(!modalStateView); setSelectedEvent(null);}} onSubmit={handleEventDelete} /> */}

    </>
  );
}
export default CalendarComp