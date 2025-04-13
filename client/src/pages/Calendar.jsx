import { useState } from "react";
import Navbar from '../components/Navbar'
import ProjectHeader from "../components/ProjectHeader";
import CalendarComp from "../components/CalendarComp";
const Calendar = () => {

    return (
        <>
            <div>
                <Navbar />
            </div>
            <div className=" ml-[15%] w-[85%] h-[9vh]">
                <ProjectHeader title="Calendar" />
            </div>
            <div className="-z-1 ml-[15%] h-[90vh] w-[85%] p-[10px]">
                <CalendarComp />
            </div>

        </>
    )
}

export default Calendar