import React from 'react'
import Navbar from '../components/Navbar'
import StatBox from '../components/StatBox'
import ProjectHeader from '../components/ProjectHeader'


const Dashboard = () => {
    return (
    <>
        <Navbar /> 
        <div className="bg-[var(--background-primary)] inline-block ml-[15%] w-[85%] h-[100vh]">
            <ProjectHeader title="Home" />
            <div></div>
            <div className='grid grid-cols-12 grid-row-4 gap-5 row-auto flex-row justify-between m-[35px] h-[75vh]'>
                <div className='col-span-4 row-span-1'><StatBox  title="tasks completed" value="5"/></div>
                <div className='col-span-4 row-span-1'><StatBox  title="tasks in progress" value="3"/></div>
                <div className='col-span-4 row-span-1'><StatBox  title="tasks overdue" value="2"/></div>
                <div className='col-span-6 row-span-2'><StatBox title="Your tasks"/></div>
                <div className='col-span-6 row-span-2'><StatBox title="Team members" /></div>
            </div>
        </div>
    </>
    )
}

export default Dashboard