import { useState } from "react";
import Navbar from '../components/Navbar'
import ProjectHeader from "../components/ProjectHeader";
import CalendarComp from "../components/CalendarComp";
import AddTaskPopup from "../components/AddTaskPopup";
import MyModal from "../components/TestModal";
const Calendar = () => {

    return (
        <>
            <div>
                <Navbar />
            </div>
            <div className=" ml-[15%] w-[85%] h-[9vh]">
                <ProjectHeader title="Calendar" />
            </div>
            {/* <div className="z-100 absolute top-[25%] left-[25%]  ml-auto w-[50%] ">
                <AddTaskPopup />
            </div> */}
            <div className="-z-1 ml-[15%] h-[90vh] w-[85%] p-[10px]">
                {/* <div className="w-[25%] h-[84vh] bg-[#f5f5f7] p-[10px] m-[20px]">
                    <h1>Events</h1>
                    <ul>
                        {currentEvents.map((event) => (
                            <li key={event.id} className="text-[15px] w-[80%] bg-[#437eb4] p-[10px] m-[10px]">
                               <button>{event.title} </button> 
                            </li>
                        ))}
                    </ul>
                </div> */}
                <CalendarComp />
            </div>

        </>
    )
}

export default Calendar