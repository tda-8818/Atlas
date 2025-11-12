// PageLayout.jsx
import React from 'react';
import Sidebar from '../components/Sidebar'; // Assuming your Sidebar component is in the same directory
import CurrentUserAvatar from '../components/avatar/CurrentUserAvatar';
import NotificationComponent from '../components/NotificationComponent'; // Assuming your NotificationComponent is in the same directory
import { useProjects } from '../contexts/ProjectsContext';

const PageLayout = ({ children, title }) => {

    const {
        notificationData,
        refetchNotifications,
        refetchProjects
    } = useProjects();


    return (
        <div className="flex h-screen bg-[var(--background-primary)]">
            <Sidebar />
            <div className="flex-grow p-10 ml-64 overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-8 pr-5">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0b80c3] to-[#0d9ae6] bg-clip-text text-transparent">
                            {title}
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Notification Component with Accept/Decline functionality */}
                        <NotificationComponent
                            notificationData={notificationData}
                            refetchProjects={refetchProjects}
                            refetchNotifications={refetchNotifications}
                        />
                        <CurrentUserAvatar />
                    </div>
                </div>
                {children} {/* This is where the content of your specific pages will go */}
            </div>
        </div>
    );
};

export default PageLayout;