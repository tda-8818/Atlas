import React from 'react'
import Navbar from '../components/Navbar'
import { useEffect, useState } from 'react';


const Home = () => {
    const [firstName, setFirstName] = useState('');

    useEffect(() => {
        // Retrieve the user's name from local storage
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.firstName) {
            setFirstName(user.firstName);
        }
    }, []);
    return (
    <>
        <Navbar /> 
        <div className="inline-block ml-[15%] w-[55%] h-[100vh]">
            <div className="m-[35px]">
                <div className="ml-[10px]">
                <h1 className='font-bold text-[20px]'>Hi, {firstName}</h1>
                <h2>Let's finish your task today</h2>
                </div>
            </div>
        </div>
        <div className="inline-block h-[100vh] w-[30%] bg-[#f5f5f7] float-right">
            <div className="m-[40px] bg-white h-[20vh]">calendar</div>
            <div className="m-[40px] bg-white h-[65vh]">
                task today
            </div>
            </div>
    </>
    )
}

export default Home