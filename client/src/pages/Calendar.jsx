import { useState } from "react";
import Navbar from '../components/Navbar'
import ProjectHeader from "../components/ProjectHeader";
import CalendarComp from "../components/CalendarComp";
const Calendar = () => {
    return (
        <>
            <div className="z-1 bg-[var(--background-primary)] h-[100vh] w-full">
            <div>
                <Navbar />
            </div>
            <div className="flex flex-col">
            <div className=" ml-[15%] w-[85%] h-[9%] ">
                <ProjectHeader title="Calendar" />
            </div>
            <div className="z-10 ml-[15%] h-[90vh] w-[85%] p-[10px] bg-[var(--background-primary)] text-[var(--text)]">
                <CalendarComp />
            </div>
            </div>
            </div>
        </>
    )
}

export default Calendar