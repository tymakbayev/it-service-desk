import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { fetchNotifications } from './notificationSlice';
import NotificationModule from './NotificationModule';
import { Notification } from './NotificationTypes';
import { formatDistanceToNow } from 'date-fns';

const NotificationList: React.FC = () => {
  const dispatch = useDispatch();
  const { notifications, loading, error } = useSelector((state: RootState) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleMarkAsRead = (notificationId: string) => {
    NotificationModule.markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    NotificationModule.markAllAsRead();
  };

  if (loading) {
    return <div className="notification-loading">Loading notifications...</div>;
  }

  if (error) {
    return <div className="notification-error">Error: {error}</div>;
  }

  return (
    <div className="notification-list-container">
      <div className="notification-header">
        <h3>Notifications</h3>
        {notifications.length > 0 && (
          <button 
            className="mark-all-read-btn" 
            onClick={handleMarkAllAsRead}
          >
            Mark all as read
          </button>
        )}
      </div>
      
      {notifications.length === 0 ? (
        <div className="no-notifications">No notifications</div>
      ) : (
        <ul className="notification-list">
          {notifications.map((notification: Notification) => (
            <li 
              key={notification.id} 
              className={`notification-item ${notification.isRead ? 'read' : 'unread'} ${notification.type}`}
            >
              <div className="notification-content">
                <h4>{notification.title}</h4>
                <p>{notification.message}</p>
                <span className="notification-time">
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </span>
              </div>
              {!notification.isRead && (
                <button 
                  className="mark-read-btn" 
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  Mark as read
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationList;
