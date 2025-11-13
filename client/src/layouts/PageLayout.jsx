// PageLayout.jsx
import React from 'react';
import Sidebar from '../components/Sidebar';
import CurrentUserAvatar from '../components/avatar/CurrentUserAvatar';
import NotificationComponent from '../components/NotificationComponent';
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
            <div className="flex-1 overflow-y-auto custom-scrollbar
                pt-20 lg:pt-10 px-4 sm:px-6 lg:px-10 pb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] bg-clip-text text-transparent">
                            {title}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4">
                        <NotificationComponent
                            notificationData={notificationData}
                            refetchProjects={refetchProjects}
                            refetchNotifications={refetchNotifications}
                        />
                        <CurrentUserAvatar />
                    </div>
                </div>
                {children}
            </div>
        </div>
    );
};

export default PageLayout;
