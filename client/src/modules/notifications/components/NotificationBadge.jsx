import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import styled from 'styled-components';
import { fetchNotifications } from '../store/notificationsSlice';
import { useWebSocket } from '../../../hooks/useWebSocket';
import { NOTIFICATION_TYPES } from '../../../utils/constants';

/**
 * Styled components for the notification badge
 */
const BadgeContainer = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const NotificationIcon = styled(FaBell)`
  font-size: 1.25rem;
  color: ${props => props.theme.colors?.text || '#333'};
  transition: color 0.2s ease;

  &:hover {
    color: ${props => props.theme.colors?.primary || '#4a90e2'};
  }
`;

const CountBadge = styled.span`
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: ${props => props.theme.colors?.danger || '#e74c3c'};
  color: white;
  border-radius: 50%;
  min-width: 18px;
  height: 18px;
  font-size: 0.7rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  animation: pulse 1.5s infinite;

  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
    }
  }
`;

const NotificationPreview = styled.div`
  position: absolute;
  top: 100%;
  right: -10px;
  width: 300px;
  max-height: 400px;
  overflow-y: auto;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  padding: 0;
  margin-top: 10px;
  display: ${props => (props.isVisible ? 'block' : 'none')};
`;

const PreviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
`;

const PreviewTitle = styled.h3`
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
`;

const ViewAllLink = styled(Link)`
  font-size: 0.8rem;
  color: ${props => props.theme.colors?.primary || '#4a90e2'};
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const EmptyNotifications = styled.div`
  padding: 20px;
  text-align: center;
  color: #888;
  font-size: 0.9rem;
`;

const NotificationList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const NotificationItem = styled.li`
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: flex-start;
  
  &:hover {
    background-color: #f9f9f9;
  }
  
  ${props => !props.isRead && `
    background-color: #f0f7ff;
    
    &:hover {
      background-color: #e6f0fa;
    }
  `}
  
  &:last-child {
    border-bottom: none;
  }
`;

const NotificationContent = styled.div`
  flex: 1;
  margin-left: 12px;
`;

const NotificationTitle = styled.div`
  font-weight: 600;
  font-size: 0.85rem;
  margin-bottom: 4px;
  color: #333;
`;

const NotificationMessage = styled.div`
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const NotificationTime = styled.div`
  font-size: 0.7rem;
  color: #999;
`;

const TypeIcon = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-top: 5px;
  
  ${props => {
    switch (props.type) {
      case NOTIFICATION_TYPES.INFO:
        return `background-color: #3498db;`;
      case NOTIFICATION_TYPES.WARNING:
        return `background-color: #f39c12;`;
      case NOTIFICATION_TYPES.ERROR:
        return `background-color: #e74c3c;`;
      case NOTIFICATION_TYPES.SUCCESS:
        return `background-color: #2ecc71;`;
      default:
        return `background-color: #95a5a6;`;
    }
  }}
`;

/**
 * NotificationBadge component displays a bell icon with a count badge for unread notifications
 * and a dropdown preview of recent notifications
 * 
 * @param {Object} props - Component props
 * @param {number} props.maxPreviewItems - Maximum number of notifications to show in preview (default: 5)
 * @returns {JSX.Element} NotificationBadge component
 */
const NotificationBadge = ({ maxPreviewItems = 5 }) => {
  const dispatch = useDispatch();
  const { notifications, unreadCount, loading } = useSelector((state) => state.notifications);
  const [showPreview, setShowPreview] = useState(false);
  
  // Get recent notifications for preview
  const recentNotifications = notifications
    .slice(0, maxPreviewItems)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Initialize WebSocket connection for real-time notifications
  useWebSocket('notifications', (newNotification) => {
    // Refresh notifications when a new one is received
    dispatch(fetchNotifications());
  });

  // Fetch notifications on component mount
  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  // Toggle notification preview
  const togglePreview = () => {
    setShowPreview(prev => !prev);
  };

  // Close preview when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showPreview && !event.target.closest('.notification-badge')) {
        setShowPreview(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPreview]);

  // Format notification time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    // Navigate to the relevant page based on notification type
    // This will be implemented based on the specific notification types in your application
    setShowPreview(false);
  };

  return (
    <BadgeContainer className="notification-badge">
      <NotificationIcon onClick={togglePreview} />
      {unreadCount > 0 && <CountBadge>{unreadCount > 99 ? '99+' : unreadCount}</CountBadge>}
      
      <NotificationPreview isVisible={showPreview}>
        <PreviewHeader>
          <PreviewTitle>Notifications</PreviewTitle>
          <ViewAllLink to="/notifications" onClick={() => setShowPreview(false)}>
            View all
          </ViewAllLink>
        </PreviewHeader>
        
        {loading ? (
          <EmptyNotifications>Loading notifications...</EmptyNotifications>
        ) : recentNotifications.length === 0 ? (
          <EmptyNotifications>No notifications yet</EmptyNotifications>
        ) : (
          <NotificationList>
            {recentNotifications.map((notification) => (
              <NotificationItem 
                key={notification._id} 
                isRead={notification.isRead}
                onClick={() => handleNotificationClick(notification)}
              >
                <TypeIcon type={notification.type} />
                <NotificationContent>
                  <NotificationTitle>{notification.title}</NotificationTitle>
                  <NotificationMessage>{notification.message}</NotificationMessage>
                  <NotificationTime>{formatTime(notification.createdAt)}</NotificationTime>
                </NotificationContent>
              </NotificationItem>
            ))}
          </NotificationList>
        )}
      </NotificationPreview>
    </BadgeContainer>
  );
};

export default NotificationBadge;