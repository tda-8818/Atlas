import React from 'react'
import { RxDashboard, RxCalendar } from "react-icons/rx";
import { LuChartGantt, LuMessageSquareMore, LuSquareKanban } from "react-icons/lu";


const ProjectHeader = ({ projectName }) => {

  return (
    <>
    <div className='bg-[var(--background)] border-b-[3px] border-[var(--border-color)] '>
    <div className="relative pl-[20px]">
      <h1 className="text-2xl font-bold">{projectName}</h1>
      <p className="text-lg text-[var(--text)]">Project Name</p>
    </div>
    <div className="nav">
        <ul className='flex mt-[3px] ml-[10px]  text-[16px]'>
            <li><a href="/Dashboard">
                <button className='px-[10px] rounded-[6%] bg-[var(--background)]  hover:bg-[var(--nav-hover)] hover:text-[var(--text-hover)] text-[var(--nav-text)] cursor-pointer'>                          
                    <RxDashboard className='inline mr-[10px] mb-[4px] justify-center text-[25px]' />
                    Dashboard</button>
                    </a>
                    </li>
            <li>
                <a href="/Kanban"><button className='px-[10px] rounded-[6%] bg-[var(--background)]  hover:bg-[var(--nav-hover)] hover:text-[var(--text-hover)] text-[var(--nav-text)] cursor-pointer'>
                    <LuSquareKanban className='inline mr-[10px] mb-[4px] justify-center text-[25px]' />
                    Kanban Board
                    </button>
                    </a>
                    </li>
            <li><a href="/Calendar">
                <button className='px-[10px] rounded-[6%] bg-[var(--background)]  hover:bg-[var(--nav-hover)] hover:text-[var(--text-hover)] text-[var(--nav-text)] cursor-pointer'>
                <RxCalendar className='inline mr-[10px] mb-[4px] justify-center text-[25px]' />

                    Calendar</button>
                    </a>
                    </li>
            <li><a href="/Gantt"><button className='px-[10px] rounded-[6%] bg-[var(--background)]  hover:bg-[var(--nav-hover)] hover:text-[var(--text-hover)] text-[var(--nav-text)] cursor-pointer'>
                <LuChartGantt className='inline mr-[10px] mb-[4px] justify-center text-[25px]' />
                Gantt Chart</button></a></li>
            <li><a href="/Messages"><button className='px-[10px] rounded-[6%] bg-[var(--background)]  hover:bg-[var(--nav-hover)] hover:text-[var(--text-hover)] text-[var(--nav-text)] cursor-pointer'>
                <LuMessageSquareMore className='inline mr-[10px] mb-[4px] justify-center text-[25px]' />
                Messages</button></a></li>
        </ul>
    </div>
    </div>
    </>
  )
}
export default ProjectHeader