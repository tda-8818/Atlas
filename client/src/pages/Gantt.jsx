import React from 'react'
import Navbar from '../components/Navbar'
import GanttComp from '../components/GanttComp'
import ProjectHeader from '../components/ProjectHeader'



const Gantt = () => {
    const data = {
       data: [
        {id: 1, text: 'Project #1', start_date: '01-04-2021', duration: 18, progress: 0.4},
        {id: 2, text: 'Task #1', start_date: '02-04-2021', duration: 8, progress: 0.6},
        {id: 3, text: 'Task #2', start_date: '11-04-2021', duration: 8, progress: 0.6}
    ],
    links: [
        {id: 1, source: 1, target: 2, type: '0'},
    ]
};
    return (
        <>
            <div className='fixed'>
            <Navbar />
            </div>
            <div className=" ml-[15%] w-[85%] h-[9vh]">
                <ProjectHeader title="Calendar" />
            </div>

            <div className="pl-[15%] pt-[20px]">                
                <div className='relative'>
                <GanttComp tasks={data}/>
                </div>
            
            </div>
            
            
        </>
    )
}

export default Gantt