import React from 'react';
import Navbar from '../components/Navbar';
import ProjectHeader from '../components/ProjectHeader';
import CalendarComp from '../components/CalendarComp';
import { useOutletContext } from 'react-router-dom';

const Calendar = () => {
  const [showAddTaskPopup, setShowAddTaskPopup] = useState(false);
  const [selectedDateInfo, setSelectedDateInfo] = useState(null);
  const { currentProject } = useOutletContext();

  // Custom event render function to show bullet points instead of colored backgrounds
  const renderEventContent = (eventInfo) => {
    return (
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        fontSize: '0.85em',
        padding: '1px 2px',
        cursor: 'pointer',
        backgroundColor: 'transparent', // Ensure transparent background
        maxWidth: '100%' // Ensure content doesn't exceed container width
      }}>
        <div style={{ 
          width: '6px',
          height: '6px',
          backgroundColor: '#80B0F0',
          borderRadius: '50%',
          marginRight: '4px',
          flexShrink: 0
        }}></div>
        <div style={{ 
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          color: 'black',
          maxWidth: 'calc(100% - 10px)' // Account for the bullet point width and margin
        }}>
          {eventInfo.timeText && (
            <span style={{ marginRight: '4px', opacity: 0.7 }}>
              {eventInfo.timeText}
            </span>
          )}
          {eventInfo.event.title}
        </div>
      </div>
    );
  };

  // Handle date selection
  const handleDateSelect = (selectInfo) => {
    try {
      setSelectedDateInfo({
        ...selectInfo,
        taskData: null // No existing task data for new events
      });
      setShowAddTaskPopup(true);
    } catch (error) {
      console.error("Error in date selection:", error);
    }
  };

  // Handle task creation from popup
  const handleAddTaskFromPopup = (taskData) => {
    // If selectedDateInfo is undefined, just create the task without calendar updates
    if (!selectedDateInfo) {
      console.log("Adding task without date selection:", taskData);
      setShowAddTaskPopup(false);
      return;
    }

    console.log("Task data received:", taskData);
    console.log("Selected date info:", selectedDateInfo);

    // Only try to access calendar API if it exists
    if (selectedDateInfo.view && selectedDateInfo.view.calendar) {
      const calendarApi = selectedDateInfo.view.calendar;
      calendarApi.unselect();

      // If editing an existing event
      if (selectedDateInfo.isEditing && selectedDateInfo.taskData) {
        // Find the existing event by ID
        const existingEvent = calendarApi.getEventById(taskData.id);
        
        console.log("Existing event found:", existingEvent);
        
        if (existingEvent) {
          try {
            // Remove the old event (to avoid rendering issues)
            existingEvent.remove();
            
            // Create a new event with the updated data but same ID
            const updatedEvent = {
              id: taskData.id,
              title: taskData.title,
              start: existingEvent.start,
              end: taskData.dueDate ? new Date(taskData.dueDate) : existingEvent.end,
              allDay: existingEvent.allDay,
              extendedProps: {
                description: taskData.description || '',
                tag: taskData.tag,
                assignedTo: taskData.assignedTo || [],
                subtasks: taskData.subtasks || [],
                priority: taskData.priority || 'none'
              }
            };
            
            // Add the updated event to the calendar
            calendarApi.addEvent(updatedEvent);
            console.log("Event updated successfully by remove/add method");
          } catch (error) {
            console.error("Error updating event:", error);
          }
        } else {
          console.error("Could not find event with ID:", taskData.id);
        }
      } else {
        // Create a new event
        const newEvent = {
          id: taskData.id,
          title: taskData.title,
          start: selectedDateInfo.startStr,
          end: selectedDateInfo.endStr,
          allDay: selectedDateInfo.allDay,
          extendedProps: {
            description: taskData.description || '',
            tag: taskData.tag,
            assignedTo: taskData.assignedTo || [],
            subtasks: taskData.subtasks || [],
            priority: taskData.priority || 'none'
          }
        };

        // Add directly to the calendar
        calendarApi.addEvent(newEvent);
        console.log("New event added successfully");
      }
    } else {
      console.error("Calendar API not available");
    }
    
    setShowAddTaskPopup(false);
    setSelectedDateInfo(null);
  };

  // Handle event click - open existing task
  const handleEventClick = (clickInfo) => {
    try {
      const event = clickInfo.event;
      
      if (!event) {
        console.error("Event is undefined");
        return;
      }
      
      console.log("Clicked event:", event);
      console.log("Event extended props:", event.extendedProps);
      
      // Convert the event to a task format that AddTaskPopup can use
      const taskData = {
        id: event.id,
        title: event.title,
        description: event.extendedProps?.description || '',
        tag: event.extendedProps?.tag || '',
        assignedTo: event.extendedProps?.assignedTo || [],
        subtasks: event.extendedProps?.subtasks || [],
        priority: event.extendedProps?.priority || 'none',
        dueDate: event.end ? event.end.toISOString().split('T')[0] : 
                event.start ? event.start.toISOString().split('T')[0] : '',
      };
      
      console.log("Prepared task data:", taskData);
      
      // Get calendar API reference directly from the event
      const calendarApi = clickInfo.view.calendar;
      
      if (!calendarApi) {
        console.error("Calendar API is undefined");
        return;
      }
      
      // Save reference to the calendar for later updates
      setSelectedDateInfo({
        startStr: event.startStr,
        endStr: event.endStr || event.startStr,
        allDay: event.allDay,
        view: { calendar: calendarApi },
        taskData: taskData,
        isEditing: true
      });
      
      // Open the popup
      setShowAddTaskPopup(true);
    } catch (error) {
      console.error("Error handling event click:", error);
    }
  };

  return (
    <div className="z-1 bg-[var(--background-primary)] h-[100vh] w-full">
      <div>
        <Navbar />
      </div>
      <div className="flex flex-col">
        <div className="ml-[15%] w-[85%] h-[9vh]">
          <ProjectHeader project={currentProject} />
        </div>
        <div className="z-10 ml-[15%] h-[91vh] w-[85%] p-4 bg-[var(--background-primary)] text-[var(--text)] overflow-y-auto">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            initialView="dayGridMonth"
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            select={handleDateSelect}
            eventClick={handleEventClick}
            initialEvents={initialEvents}
            height="auto"
            eventContent={renderEventContent} // Use the custom render function
            dayMaxEventRows={3}
            eventBackgroundColor="transparent" // Ensure no background color
            eventBorderColor="transparent" // Ensure no border color
            eventClassNames="no-background-event" // Add a custom class for additional styling
          />

          {/* Add Task Popup */}
          <AddTaskPopup
            show={showAddTaskPopup}
            onAddTask={handleAddTaskFromPopup}
            onCancel={() => {
              setShowAddTaskPopup(false);
              setSelectedDateInfo(null);
            }}
            teamMembers={teamMembers}
            {...(selectedDateInfo?.isEditing && selectedDateInfo?.taskData 
              ? { initialValues: selectedDateInfo.taskData } 
              : {})}
          />
        </div>
      </div>
    </div>
  );
};

export default Calendar;