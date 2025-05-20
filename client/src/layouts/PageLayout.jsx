// PageLayout.jsx
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar'; // Assuming your Sidebar component is in the same directory
import CurrentUserAvatar from '../components/avatar/CurrentUserAvatar';
import NotificationComponent from '../components/NotificationComponent'; // Assuming your NotificationComponent is in the same directory

const PageLayout = ({ children, title }) => {

    // Sample notifications with invitation types
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            type: 'invitation',
            title: 'Project Invitation',
            message: 'John Doe invited you to be a member of Project Alpha',
            projectId: 'project-alpha-id',
            createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
            read: false,
            responded: false,
            accepted: null
        },
        {
            id: 2,
            type: 'invitation',
            title: 'Project Invitation',
            message: 'Jane Smith invited you to be a member of Design Revamp',
            projectId: 'design-revamp-id',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            read: false,
            responded: false,
            accepted: null
        },
        {
            id: 3,
            type: 'general',
            title: 'Due date approaching',
            message: 'Task "Create wireframes" is due tomorrow',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
            read: true
        }
    ]);

        // Notification handling functions
        const handleMarkAsRead = (id) => {
            setNotifications(prevNotifications => 
                prevNotifications.map(notification => 
                    notification.id === id ? { ...notification, read: true } : notification
                )
            );
        };
        
        const handleMarkAllAsRead = () => {
            setNotifications(prevNotifications => 
                prevNotifications.map(notification => ({ ...notification, read: true }))
            );
        };
        
        const handleAcceptInvitation = (notificationId, projectId) => {
            // Here you would typically make an API call to accept the invitation
            console.log(`Accepting invitation for project ${projectId}`);
            
            // Update the notification to show it's been accepted
            setNotifications(prevNotifications => 
                prevNotifications.map(notification => 
                    notification.id === notificationId 
                        ? { ...notification, responded: true, accepted: true, read: true } 
                        : notification
                )
            );
            
            // Show success message
            toast.success("Project invitation accepted");
            
            // Optionally refresh projects list to show the newly joined project
            refetch();
        };
        
        const handleDeclineInvitation = (notificationId, projectId) => {
            // Here you would typically make an API call to decline the invitation
            console.log(`Declining invitation for project ${projectId}`);
            
            // Update the notification to show it's been declined
            setNotifications(prevNotifications => 
                prevNotifications.map(notification => 
                    notification.id === notificationId 
                        ? { ...notification, responded: true, accepted: false, read: true } 
                        : notification
                )
            );
            
            // Show info message
            toast.error("Project invitation declined");
        };

    return (
        <div className="flex h-screen bg-[var(--background-primary)]">
            <Sidebar />
            <div className="flex-grow p-10 ml-[240px] overflow-y-auto">
                <div className="flex justify-start items-center mb-8 pr-5">
                    <h1 className="text-3xl font-bold text-[var(--text)] mr-4">{title}</h1>
                    <div className="flex-grow" />
                    {/* Notification Component with Accept/Decline functionality */}
                    <NotificationComponent 
                        notifications={notifications}
                        onMarkAsRead={handleMarkAsRead}
                        onMarkAllAsRead={handleMarkAllAsRead}
                        onAcceptInvitation={handleAcceptInvitation}
                        onDeclineInvitation={handleDeclineInvitation}
                    />
                    <CurrentUserAvatar/> {/* Assuming UserAvatar is a globally available component */}
                </div>
                {children} {/* This is where the content of your specific pages will go */}
            </div>
        </div>
    );
};

export default PageLayout;