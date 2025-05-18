// PageLayout.jsx
import React from 'react';
import Sidebar from '../components/Sidebar'; // Assuming your Sidebar component is in the same directory
import CurrentUserAvatar from '../components/avatar/CurrentUserAvatar';

const PageLayout = ({ children, title }) => {

    return (
        <div className="flex h-screen bg-[var(--background-primary)]">
            <Sidebar />
            <div className="flex-grow p-10 ml-[240px] overflow-y-auto">
                <div className="flex justify-start items-center mb-8 pr-5">
                    <h1 className="text-3xl font-bold text-[var(--text)] mr-4">{title}</h1>
                    <div className="flex-grow" />
                    <CurrentUserAvatar/> {/* Assuming UserAvatar is a globally available component */}
                </div>
                {children} {/* This is where the content of your specific pages will go */}
            </div>
        </div>
    );
};

export default PageLayout;