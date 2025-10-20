import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import AddTaskModal from "./modals/AddTaskModal";
import "./css/CalendarComp.css"
import taskApiSlice, { useAddTaskMutation, useDeleteTaskMutation, useUpdateTaskMutation } from "../redux/slices/taskSlice";
import { useGetProjectTasksQuery, useGetProjectUsersQuery } from "../redux/slices/projectSlice";
const CalendarComp = ({ project }) => {

  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [selectedDateInfo, setSelectedDateInfo] = useState(null);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentEvents, setCurrentEvents] = useState([]);


  /// RTK QUERY FUNCTIONS ///
  const [addTask] = useAddTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [editTask] = useUpdateTaskMutation();


  const {data: projectTasks, refetch} = useGetProjectTasksQuery(project._id);
  
  const {data: projectUsers} = useGetProjectUsersQuery(project._id);

  /// RTK QUERY FUNCTIONS ///


  //fetches tasks from database 
  useEffect(() => {
    console.log('refetching tasks');
    refetch();
    if (!project || !projectTasks) return;

    console.log("Got these tasks:", projectTasks);
    console.log("got these users: ",projectUsers);
    
    const transformedTasks = projectTasks.map(task => ({
      id: task._id,
      projectId: task.projectId,
      status: task.status,
      title: task.title,
      start: task.startDate,
      end: task.dueDate,
      description: task.description,
      assignedTo:task.assignedTo,
      subtasks: task.subtasks,
      priority: task.priority,
      

    }));
    console.log("transformed Tasks",transformedTasks);

    setCurrentEvents(transformedTasks);
  }, [project, projectTasks]);


  // handles date selection via click and opens modal when clicked
  const handleDateSelect = async (selectInfo) => {
    setSelectedDateInfo(selectInfo);
    setShowAddTaskModal(true);
    };

  // createss a new event using the form data from the modal
  const handleEventSubmission = async (formData) => {
    const calendarApi = selectedDateInfo.view.calendar;
    calendarApi.unselect();
    console.log("form data gotten: ",formData)
    // Create a new event using the form data from the modal
    // and the date info from the calendar.
    const startDate = formData.startDate? new Date(formData.startDate) : new Date(selectedDateInfo.startStr);
    const dueDate = formData.dueDate? new Date(formData.dueDate) : new Date(selectedDateInfo.end);
    const newEvent = {
      projectId: project._id,
      title: formData.title, // from modal input
      startDate: startDate,
      dueDate: dueDate,
      allDay: selectedDateInfo.allDay,
      description: formData.description, // extra info from your modal
      assignedTo: formData.assignedTo,
      subtasks: formData.subtasks,
      priority: formData.priority,
      status: formData.status,

    };
    try {
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
        await refetch();
      }
    } catch (error) {
      console.error("Error adding event:", error);
    };

    // Close the modal and clear our saved selection.
    setShowAddTaskModal(false);
    setSelectedDateInfo(false);

  };

  //handles when user clikcs on event in calendar to open modal
  const handleEventClick = (clickInfo) => {
    try {
      const event = clickInfo.event;
      
      if (!event) {
        console.error("Event is undefined");
        return;
      }
      
      console.log("Clicked event:", event);
      console.log("Event extended props:", event.extendedProps);
      
      // Convert the event to a task format that AddTaskModal can use
      const taskData = {
        id: event.id,
        title: event.title,
        status: event.extendedProps.status,
        description: event.extendedProps?.description || '',
        assignedTo: event.extendedProps?.assignedTo || [],
        subtasks: event.extendedProps?.subtasks || [],
        priority: event.extendedProps?.priority || 'none',
        dueDate: new Date(event.end),
        startDate: new Date(event.start),
      };
      
      console.log("Prepared task data:", taskData);
      
      // Get calendar API reference directly from the event
      const calendarApi = clickInfo.view.calendar;
      
      if (!calendarApi) {
        console.error("Calendar API is undefined");
        return;
      }
      
      // Save reference to the calendar for later updates
      setSelectedEvent({
        eventRef: event,
        startDate: new Date(event.startStr),
        dueDate: new Date(event.endStr) || new Date(event.startStr),
        assignedTo: taskData.assignedTo,
        status: taskData.status,
        allDay: event.allDay,
        view: { calendar: calendarApi },
        taskData: taskData,
        isEditing: true,
      });
      
      // Open the popup
      console.log("team members: ",projectUsers)
      setShowAddTaskModal(true);
    } catch (error) {
      console.error("Error handling event click:", error);
    }
  };


  //handles when user chooses to delete an event in the modal
  // deletes the event from the calendar and the server
  const handleEventDelete = async () => {
    if (!selectedEvent) return;

    try {
      console.log("Deleting event id:", selectedEvent.taskData.id);
      await deleteTask(selectedEvent.taskData.id).unwrap();
      selectedEvent.eventRef.remove();
    } catch (error) {
      console.error("Error deleting task:", error);
    } finally {
      setShowAddTaskModal(false);
      setSelectedEvent(null); // Clear the selected event
    }
  };

  const handleEventEdit = async (formData) => {
  if (!selectedEvent) return;
console.log("formData: ",formData)
  const newEvent = {
    _id: formData.id,
    projectId: selectedEvent.taskData._id,
    status: formData.status,
    title: formData.title,
    startDate: new Date(formData.startDate),
    dueDate: new Date(formData.dueDate),
    allDay: formData.allDay,
    description: formData.description,
    assignedTo: formData.assignedTo,
    subtasks: formData.subtasks,
    priority: formData.priority,
    
  };

  try {
    await editTask(newEvent).unwrap();


const calendarEvent = selectedEvent.eventRef;
calendarEvent.setProp("title", newEvent.title);
calendarEvent.setStart(formData.startDate);
calendarEvent.setEnd(formData.dueDate);
calendarEvent.setExtendedProp("description", newEvent.description);
calendarEvent.setExtendedProp("status",formData.status);
calendarEvent.setExtendedProp("assignedTo",formData.assignedTo);
calendarEvent.setExtendedProp("subtasks",formData.subtasks);
calendarEvent.setExtendedProp("priority",formData.priority);

  } catch (error) {
    console.error("error modifying task: ", error);
  }

  setShowAddTaskModal(false);
  setSelectedEvent(null);
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
       {/* Render the reusable AddTaskModal */}
       <AddTaskModal
          show={showAddTaskModal}
          onAddTask={handleEventSubmission}
          onCancel={() => {
            setShowAddTaskModal(false);
            setSelectedEvent(null);
            
          }}
          onDelete={handleEventDelete}
          onEdit = {handleEventEdit}
          teamMembers={projectUsers}
          {...(selectedEvent?.isEditing && selectedEvent?.taskData 
              ? { initialValues: selectedEvent.taskData } 
              : {})}
        />
    </>
  );
}
export default CalendarComp;