import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import styled from 'styled-components';
import { fetchNotifications, markAsRead } from '../store/notificationsSlice';
import { useWebSocket } from '../../../hooks/useWebSocket';
import { useClickOutside } from '../../../hooks/useClickOutside';
import { formatDistanceToNow } from 'date-fns';
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
 * and a dropdown preview of recent notifications.
 * 
 * @returns {JSX.Element} The NotificationBadge component
 */
const NotificationBadge = () => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Get notifications from Redux store
  const { notifications, unreadCount, loading } = useSelector(state => state.notifications);
  
  // Setup WebSocket connection for real-time notifications
  const socket = useWebSocket();
  
  // Close dropdown when clicking outside
  useClickOutside(dropdownRef, () => {
    if (isOpen) setIsOpen(false);
  });

  // Fetch notifications on component mount
  useEffect(() => {
    dispatch(fetchNotifications({ limit: 5 }));
  }, [dispatch]);

  // Listen for new notifications via WebSocket
  useEffect(() => {
    if (socket) {
      socket.on('notification', () => {
        // Refresh notifications when a new one is received
        dispatch(fetchNotifications({ limit: 5 }));
      });

      return () => {
        socket.off('notification');
      };
    }
  }, [socket, dispatch]);

  /**
   * Toggle the notification dropdown
   */
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  /**
   * Handle clicking on a notification
   * @param {Object} notification - The notification object
   */
  const handleNotificationClick = (notification) => {
    // Mark notification as read if it's not already
    if (!notification.isRead) {
      dispatch(markAsRead(notification._id));
    }
    
    // Close the dropdown
    setIsOpen(false);
    
    // Additional logic can be added here to navigate to related content
    // based on notification type or content
  };

  /**
   * Format the notification time to a human-readable string
   * @param {Date} date - The date to format
   * @returns {String} Formatted time string
   */
  const formatNotificationTime = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (error) {
      return 'Unknown time';
    }
  };

  return (
    <BadgeContainer>
      <NotificationIcon onClick={toggleDropdown} />
      {unreadCount > 0 && <CountBadge>{unreadCount > 99 ? '99+' : unreadCount}</CountBadge>}
      
      <NotificationPreview ref={dropdownRef} isVisible={isOpen}>
        <PreviewHeader>
          <PreviewTitle>Notifications</PreviewTitle>
          <ViewAllLink to="/notifications" onClick={() => setIsOpen(false)}>
            View All
          </ViewAllLink>
        </PreviewHeader>
        
        {loading ? (
          <EmptyNotifications>Loading notifications...</EmptyNotifications>
        ) : notifications.length === 0 ? (
          <EmptyNotifications>No notifications yet</EmptyNotifications>
        ) : (
          <NotificationList>
            {notifications.map(notification => (
              <NotificationItem 
                key={notification._id} 
                isRead={notification.isRead}
                onClick={() => handleNotificationClick(notification)}
              >
                <TypeIcon type={notification.type} />
                <NotificationContent>
                  <NotificationTitle>{notification.title}</NotificationTitle>
                  <NotificationMessage>{notification.message}</NotificationMessage>
                  <NotificationTime>
                    {formatNotificationTime(notification.createdAt)}
                  </NotificationTime>
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