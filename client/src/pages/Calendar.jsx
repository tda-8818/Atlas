import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
//import listPlugin from "@fullcalendar/list";
//import interactionPlugin from "@fullcalendar/interaction";
import Navbar from '../components/Navbar'

const Calendar = () => {
    const [currentEvents, setCurrentEvents] = useState([]);
    const handleDateSelect = (selectInfo) => {
        const title = prompt("Please enter a new title for your event");            //CHANGE THIS FOR A CUSTOM POPUP
        const calendarApi = selectInfo.view.calendar;

        calendarApi.unselect(); // clear date selection

        if (title) {
            calendarApi.addEvent({
                id: '${selected.dateStr}-${title}',
                title,
                start: selectInfo.startStr,
                end: selectInfo.endStr,
                allDay: selectInfo.allDay,
            });
        }
    };
    const handleEventClick = (selected) => {
        if (window.confirm(`Are you sure you want to delete the event '${selected.event.title}'`)) {        //CHANGE THIS FOR A CUSTOM POPUP
            selected.event.remove();
        }
    };


    return (
        <>
            <div>
                <Navbar />
            </div>
            <div className="inline-block ml-[15%] w-[85%] h-full">
                <div className="inline-block  w-[15%] h-[80vh]">
                    <h1>Events</h1>
                    <ul>
                        {currentEvents.map((event) => (
                            <li key={event.id}>
                                {event.title} ({event.start.toISOString()} - {event.end.toISOString()})
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="inline-block  h-[80vh] w-[70%]">
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin]}
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
                    />
                </div>
            </div>

        </>
    )
}

export default Calendar