import React from 'react'
import { RxDashboard, RxCalendar } from "react-icons/rx";
import { LuChartGantt, LuMessageSquareMore, LuSquareKanban } from "react-icons/lu";


const ProjectHeader = ({ projectName }) => {

  return (
    <>
    <div className='border-[3px] border-l-[0px] border-t-[0px] border-[#f5f5f7] '>
    <div className="relative pl-[20px]">
      <h1 className="text-2xl font-bold">{projectName}</h1>
      <p className="text-lg">Project Name</p>
    </div>
    <div className="nav">
        <ul className='flex mt-[3px] ml-[10px]  text-[16px]'>
            <li><a href="">
                <button className='px-[10px] rounded-[6%] hover:bg-[#f5f5f7] hover:text-black  cursor-pointer'>                          
                    <RxDashboard className='inline mr-[10px] mb-[4px] justify-center text-[25px]' />
                    Dashboard</button>
                    </a>
                    </li>
            <li>
                <a href=""><button className='px-[10px] rounded-[6%] hover:bg-[#f5f5f7] hover:text-black  cursor-pointer'>
                    <LuSquareKanban className='inline mr-[10px] mb-[4px] justify-center text-[25px]' />
                    Kanban Board
                    </button>
                    </a>
                    </li>
            <li><a href="">
                <button className='px-[10px] rounded-[6%] hover:bg-[#f5f5f7] hover:text-black  cursor-pointer'>
                <RxCalendar className='inline mr-[10px] mb-[4px] justify-center text-[25px]' />

                    Calendar</button>
                    </a>
                    </li>
            <li><a href=""><button className='px-[10px] rounded-[6%] hover:bg-[#f5f5f7] hover:text-black  cursor-pointer'>
                <LuChartGantt className='inline mr-[10px] mb-[4px] justify-center text-[25px]' />
                Gantt Chart</button></a></li>
            <li><a href=""><button className='px-[10px] rounded-[6%] hover:bg-[#f5f5f7] hover:text-black  cursor-pointer'>
                <LuMessageSquareMore className='inline mr-[10px] mb-[4px] justify-center text-[25px]' />
                Messages</button></a></li>
        </ul>
    </div>
    </div>
    </>
  )
}
export default ProjectHeader