import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
//import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import Navbar from '../components/Navbar'

const Calendar = () => {
    
    const [currentEvents, setCurrentEvents] = useState([]);
    const handleDateSelect = (selectInfo) => {
        const title = prompt("Please enter a new title for your event");            //CHANGE THIS FOR A CUSTOM POPUP
        const calendarApi = selectInfo.view.calendar;

        calendarApi.unselect(); // clear date selection

        if (title) {
            calendarApi.addEvent({
                id: '${selectedInfo.dateStr}-${title}',
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
            <div className="flex ml-[15%] w-[85%] h-full">
                <div className="w-[15%] h-[84vh] bg-[#f5f5f7] p-[10px] m-[20px]">
                    <h1>Events</h1>
                    <ul>
                        {currentEvents.map((event) => (
                            <li key={event.id} className="text-[15px] w-[80%] bg-[#437eb4] p-[10px] m-[10px]">
                               <button>{event.title} </button> 
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="mt-[20px] h-full w-[100vh]">
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
                </div>
            </div>

        </>
    )
}

export default Calendar