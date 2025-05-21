import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import {
  useGetCurrentUserNotificationsQuery,
  useAcceptProjectInviteMutation,
  useDeleteNotificationMutation,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation
} from "../redux/slices/projectSlice.js";


const NotificationItem = ({ notification, onAccept, onDecline, onMarkAsRead }) => {
  // Determine if this notification is an invitation type that needs accept/decline buttons
  const isInvitation = notification.type === 'invitation';

  return (
    <div className="px-4 py-3 border-b border-gray-200 hover:bg-gray-50">
      <div className="flex items-start">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
          <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
          <p className="text-xs text-gray-400 mt-1">
            {typeof notification.createdAt === 'string' 
              ? new Date(notification.createdAt).toLocaleString() 
              : notification.createdAt.toLocaleString()}
          </p>
          
          {/* Accept/Decline buttons for invitations */}
          {isInvitation && !notification.responded && (
            <div className="mt-2 flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering the parent onClick
                  onAccept(notification.id, notification.projectId);
                }}
                className="px-3 py-1 text-xs text-green-600 bg-white border border-green-500 rounded hover:bg-green-50 transition-colors"
              >
                Accept
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering the parent onClick
                  onDecline(notification.id, notification.projectId);
                }}
                className="px-3 py-1 text-xs text-red-600 bg-white border border-red-500 rounded hover:bg-red-50 transition-colors"
              >
                Decline
              </button>
            </div>
          )}
          
          {/* Show response status if already responded */}
          {isInvitation && notification.responded && (
            <div className="mt-2">
              <span className={`text-xs px-2 py-1 rounded ${
                notification.accepted 
                  ? 'bg-white text-green-600 border border-green-500' 
                  : 'bg-white text-red-600 border border-red-500'
              }`}>
                {notification.accepted ? 'Accepted' : 'Declined'}
              </span>
            </div>
          )}
        </div>
        {!notification.read && (
          <div className="ml-3 flex-shrink-0">
            <span className="inline-block h-2 w-2 rounded-full bg-blue-500"></span>
          </div>
        )}
      </div>
    </div>
  );
};

const NotificationComponent = (
  // { 
  // notifications = [], 
  // onMarkAsRead, 
  // onMarkAllAsRead,
  // onAcceptInvitation,
  // onDeclineInvitation
  // }
) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch notifications
  const { data: notifications = [], refetch } = useGetCurrentUserNotificationsQuery();

  // Define RTK functions
  const [acceptInvitation] = useAcceptProjectInviteMutation();
  const [declineInvitation] = useDeleteNotificationMutation();
  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [markAllAsRead] = useMarkAllNotificationsAsReadMutation();
  
  // Count unread notifications
  const unreadCount = notifications.filter(notification => !notification.read).length;
  
  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  
  // Handle notification click - mark as read
  const handleNotificationClick = async (notificationId) => {
    // onMarkAsRead(id);
    try {
      await markAsRead(notificationId)
    } catch (error) {
      console.error("Failed to mark notification as read", err);
    }
  };

  // Handle when a user accepts an invitation
   const handleAccept = async (userId, projectId) => {
    try {
      await acceptInvitation({ userId, projectId });
      refetch();
    } catch (err) {
      console.error("Failed to accept invitation", err);
    }
  };

  const handleDecline = async (userId, projectId) => {
    try {
      await declineInvitation({ userId, projectId });
      refetch();
    } catch (err) {
      console.error("Failed to decline invitation", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      refetch();
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };


   return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="relative p-2 text-gray-600 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-10 border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div key={notification.id} onClick={() => handleNotificationClick(notification.id)}>
                  <NotificationItem 
                    notification={notification} 
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                  />
                </div>
              ))
            ) : (
              <div className="px-4 py-6 text-sm text-gray-500 text-center">
                No notifications
              </div>
            )}
          </div>

          {notifications.length > 0 && unreadCount > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <button 
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationComponent;