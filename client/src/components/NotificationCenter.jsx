import { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, AlertCircle, Info, CheckCircle, XCircle } from 'lucide-react';

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);

  // Mock notifications - in real app, this would come from props/state
  useEffect(() => {
    // Simulate fetching notifications
    const mockNotifications = [
      {
        id: 1,
        type: 'success',
        title: 'Task completed',
        message: 'Design review for homepage was completed successfully',
        time: '2 minutes ago',
        read: false,
        icon: <CheckCircle className="w-5 h-5" />
      },
      {
        id: 2,
        type: 'info',
        title: 'New team member',
        message: 'Sarah Chen joined your project',
        time: '1 hour ago',
        read: false,
        icon: <Info className="w-5 h-5" />
      },
      {
        id: 3,
        type: 'warning',
        title: 'Deadline approaching',
        message: 'API integration task is due in 2 days',
        time: '3 hours ago',
        read: true,
        icon: <AlertCircle className="w-5 h-5" />
      },
      {
        id: 4,
        type: 'error',
        title: 'Failed to sync',
        message: 'Unable to sync changes with server',
        time: '5 hours ago',
        read: true,
        icon: <XCircle className="w-5 h-5" />
      }
    ];
    setNotifications(mockNotifications);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getTypeStyles = (type) => {
    const styles = {
      success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700',
      info: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700',
      warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700',
      error: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700'
    };
    return styles[type] || styles.info;
  };

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Premium Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-[var(--background-primary)] transition-all duration-300 group"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
        <Bell className="w-5 h-5 text-[var(--text)] relative transform transition-transform duration-300 group-hover:scale-110" />

        {/* Notification badge with animation */}
        {unreadCount > 0 && (
          <div className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full min-w-[1.25rem] h-5 flex items-center justify-center animate-pulse shadow-lg">
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </button>

      {/* Premium Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-[var(--background-modal)] rounded-2xl shadow-2xl border border-[var(--border-color-accent)] ring-1 ring-black/5 backdrop-blur-sm overflow-hidden z-50 transform transition-all duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-primary)]/90 to-[var(--color-secondary)] px-6 py-4">
            <div className="flex items-center justify-between text-white">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
                {unreadCount > 0 && (
                  <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Actions */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 bg-[var(--background-primary)] border-b border-[var(--border-color-accent)] flex items-center justify-between">
              <button
                onClick={markAllAsRead}
                className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium transition-colors"
              >
                Mark all as read
              </button>
              <button
                onClick={clearAll}
                className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="w-16 h-16 bg-[var(--background-primary)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-[var(--text-muted)]" />
                </div>
                <p className="text-[var(--text-muted)] font-medium">No notifications</p>
                <p className="text-[var(--text-muted)] text-sm mt-1">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-color-accent)]">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`
                      px-4 py-4 hover:bg-[var(--background-primary)] transition-colors cursor-pointer
                      ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}
                    `}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`
                        p-2 rounded-full
                        ${getTypeStyles(notification.type)}
                      `}>
                        {notification.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-[var(--text)]">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-[var(--text-muted)] mt-0.5">
                              {notification.message}
                            </p>
                            <p className="text-xs text-[var(--text-muted)] mt-1">
                              {notification.time}
                            </p>
                          </div>

                          <div className="flex items-center gap-1">
                            {!notification.read && (
                              <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full"></div>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                clearNotification(notification.id);
                              }}
                              className="p-1 hover:bg-[var(--background)] rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <X className="w-3 h-3 text-[var(--text-muted)]" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-[var(--background-primary)] border-t border-[var(--border-color-accent)]">
            <button className="w-full text-center text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium transition-colors">
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;