import React from 'react'
import Navbar from '../components/Navbar'
import './css/Home.css'

const Home = () => {
    return (
    <>
        <div>
            <Navbar />
        </div>
        <h1>Welcome to FIT3162 Task Management Tool</h1>
        <div className="container">
            <div className="container-grid">
                <div className="grid-item">
                    <h2>Calendar</h2>
                </div>
                <div className="grid-item">
                    <h2>Gantt Chart</h2>
                </div>
                <div className="grid-item">
                    <h2>Tasks</h2>
                </div>
                <div className="grid-item">
                    <h2>Messages</h2>
                </div>
                <div className="grid-item">
                    <h2>Progress</h2>
                </div>
                <div className="grid-item">
                    <h2>Reminders</h2>
                </div>
            </div>
        </div>   
    </>
    )
}

export default Home