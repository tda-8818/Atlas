// PageLayout.jsx
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar'; // Assuming your Sidebar component is in the same directory
import CurrentUserAvatar from '../components/avatar/CurrentUserAvatar';
import NotificationComponent from '../components/NotificationComponent'; // Assuming your NotificationComponent is in the same directory
import { useGetCurrentUserProjectsQuery, useCreateProjectMutation, useDeleteProjectMutation, useGetCurrentUserNotificationsQuery } from '../redux/slices/projectSlice';

const PageLayout = ({ children, title }) => {

    const { data: notificationData = [], refetch: refetchNotifications } = useGetCurrentUserNotificationsQuery();

    const {
        data: projectsData = [],
        isLoading: projectsLoading,
        isError: projectsError,
        error: projectsErrorData,
        refetch: refetchProjects,
    } = useGetCurrentUserProjectsQuery();


    return (
        <div className="flex h-screen bg-[var(--background-primary)]">
            <Sidebar />
            <div className="flex-grow p-10 ml-[240px] overflow-y-auto">
                <div className="flex justify-start items-center mb-8 pr-5">
                    <h1 className="text-3xl font-bold text-[var(--text)] mr-4">{title}</h1>
                    <div className="flex-grow" />
                    {/* Notification Component with Accept/Decline functionality */}
                    <NotificationComponent 
                            notificationData={notificationData}
                            refetchProjects={refetchProjects}
                            refetchNotifications={refetchNotifications}
                    />
                    <CurrentUserAvatar/> {/* Assuming UserAvatar is a globally available component */}
                </div>
                {children} {/* This is where the content of your specific pages will go */}
            </div>
        </div>
    );
};

export default PageLayout;