import React, { useState } from 'react';
import { Bell, X, Info, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { Notification } from '../../types';

const NotificationBell: React.FC = () => {
  const { notifications, loading } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [dismissedNotifications, setDismissedNotifications] = useState<number[]>(
    JSON.parse(localStorage.getItem('dismissedNotifications') || '[]')
  );

  // Filter out dismissed notifications
  const activeNotifications = notifications.filter(
    n => n.isActive && !dismissedNotifications.includes(n.id)
  );

  const dismissNotification = (id: number) => {
    const newDismissed = [...dismissedNotifications, id];
    setDismissedNotifications(newDismissed);
    localStorage.setItem('dismissedNotifications', JSON.stringify(newDismissed));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'info':
        return <Info size={16} className="text-blue-500" />;
      case 'warning':
        return <AlertTriangle size={16} className="text-yellow-500" />;
      case 'success':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'error':
        return <AlertCircle size={16} className="text-red-500" />;
      default:
        return <Info size={16} className="text-blue-500" />;
    }
  };

  const getNotificationBorderColor = (type: Notification['type']) => {
    switch (type) {
      case 'info':
        return 'border-l-blue-500';
      case 'warning':
        return 'border-l-yellow-500';
      case 'success':
        return 'border-l-green-500';
      case 'error':
        return 'border-l-red-500';
      default:
        return 'border-l-blue-500';
    }
  };

  if (loading) return null;

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors focus:outline-none"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {activeNotifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {activeNotifications.length > 9 ? '9+' : activeNotifications.length}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {activeNotifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Bell size={32} className="mx-auto mb-2 text-gray-300" />
                <p>No new notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {activeNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors border-l-4 ${getNotificationBorderColor(notification.type)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm">
                            {notification.title}
                          </p>
                          <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => dismissNotification(notification.id)}
                        className="ml-2 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                        aria-label="Dismiss notification"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationBell;
