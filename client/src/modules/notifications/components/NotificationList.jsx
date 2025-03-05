import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import { FaBell, FaCheckCircle, FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';
import { 
  fetchNotifications, 
  markAsRead, 
  markAllAsRead 
} from '../store/notificationsSlice';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Pagination from '../../components/common/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { useWebSocket } from '../../hooks/useWebSocket';
import { NOTIFICATION_TYPES } from '../../utils/constants';

/**
 * Component for displaying a list of notifications with pagination and actions
 */
const NotificationList = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount, loading, error } = useSelector((state) => state.notifications);
  const [selectedNotification, setSelectedNotification] = useState(null);
  
  // Initialize pagination
  const { 
    page, 
    itemsPerPage, 
    totalPages, 
    handlePageChange, 
    paginatedItems: paginatedNotifications 
  } = usePagination(notifications, 10);

  // Initialize WebSocket connection for real-time notifications
  useWebSocket('notifications', (newNotification) => {
    // Refresh notifications when a new one is received
    dispatch(fetchNotifications());
  });

  // Fetch notifications on component mount
  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  // Handle marking a notification as read
  const handleMarkAsRead = (notificationId) => {
    dispatch(markAsRead(notificationId));
  };

  // Handle marking all notifications as read
  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  // Get appropriate icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.INFO:
        return <FaInfoCircle className="notification-icon info" />;
      case NOTIFICATION_TYPES.WARNING:
        return <FaExclamationCircle className="notification-icon warning" />;
      case NOTIFICATION_TYPES.ERROR:
        return <FaExclamationCircle className="notification-icon error" />;
      case NOTIFICATION_TYPES.SUCCESS:
        return <FaCheckCircle className="notification-icon success" />;
      default:
        return <FaBell className="notification-icon default" />;
    }
  };

  // Handle notification click to show details
  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    
    // If notification is unread, mark it as read
    if (!notification.isRead) {
      handleMarkAsRead(notification._id);
    }
  };

  // Close notification details
  const closeNotificationDetails = () => {
    setSelectedNotification(null);
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <Alert type="error" message={`Error loading notifications: ${error}`} />;
  }

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h2>Notifications {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}</h2>
        {notifications.length > 0 && (
          <Button 
            variant="secondary"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            Mark all as read
          </Button>
        )}
      </div>
      
      {notifications.length === 0 ? (
        <Card className="empty-notifications">
          <FaBell size={48} className="empty-icon" />
          <p>You don't have any notifications yet</p>
        </Card>
      ) : (
        <>
          <div className="notification-list">
            {paginatedNotifications.map((notification) => (
              <div 
                key={notification._id} 
                className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="notification-icon-container">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-content">
                  <div className="notification-header">
                    <h4 className="notification-title">{notification.title}</h4>
                    <span className="notification-time">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="notification-message">{notification.message}</p>
                  {notification.relatedTo && (
                    <div className="notification-related">
                      Related to: {notification.relatedTo.type} #{notification.relatedTo.id}
                    </div>
                  )}
                </div>
                {!notification.isRead && (
                  <Button 
                    variant="text"
                    className="mark-read-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(notification._id);
                    }}
                  >
                    Mark as read
                  </Button>
                )}
              </div>
            ))}
          </div>
          
          {totalPages > 1 && (
            <Pagination 
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <div className="notification-modal">
          <div className="notification-modal-content">
            <div className="notification-modal-header">
              <h3>{selectedNotification.title}</h3>
              <Button variant="icon" onClick={closeNotificationDetails}>×</Button>
            </div>
            <div className="notification-modal-body">
              <div className="notification-detail-meta">
                <span className="notification-type">
                  {getNotificationIcon(selectedNotification.type)} {selectedNotification.type}
                </span>
                <span className="notification-date">
                  {new Date(selectedNotification.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="notification-detail-message">{selectedNotification.message}</p>
              
              {selectedNotification.relatedTo && (
                <div className="notification-related-details">
                  <h4>Related Information</h4>
                  <p>Type: {selectedNotification.relatedTo.type}</p>
                  <p>ID: {selectedNotification.relatedTo.id}</p>
                  {selectedNotification.relatedTo.url && (
                    <Button 
                      variant="primary"
                      onClick={() => window.location.href = selectedNotification.relatedTo.url}
                    >
                      View Details
                    </Button>
                  )}
                </div>
              )}
            </div>
            <div className="notification-modal-footer">
              <Button variant="secondary" onClick={closeNotificationDetails}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationList;