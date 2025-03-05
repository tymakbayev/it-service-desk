import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import styled from 'styled-components';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaBell, FaTrash, FaCheck, FaExternalLinkAlt } from 'react-icons/fa';
import { markAsRead, deleteNotification } from '../store/notificationsSlice';
import { NOTIFICATION_TYPES } from '../../../utils/constants';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';

// Styled components
const NotificationItemContainer = styled(Card)`
  position: relative;
  padding: 16px;
  margin-bottom: 12px;
  border-left: 4px solid ${props => getNotificationColor(props.type)};
  transition: all 0.2s ease;
  cursor: pointer;
  opacity: ${props => (props.isRead ? 0.8 : 1)};
  background-color: ${props => (props.isRead ? '#f9f9f9' : 'white')};
  box-shadow: ${props => (props.isRead ? '0 1px 3px rgba(0,0,0,0.08)' : '0 2px 6px rgba(0,0,0,0.12)')};

  &:hover {
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    transform: translateY(-2px);
  }
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const NotificationTitle = styled.h4`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NotificationTime = styled.span`
  font-size: 0.75rem;
  color: #777;
  white-space: nowrap;
`;

const NotificationContent = styled.div`
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 12px;
  line-height: 1.5;
`;

const NotificationFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
`;

const NotificationMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: #888;
`;

const NotificationSource = styled.span`
  background-color: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
`;

const NotificationActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled(Button)`
  padding: 4px 8px;
  font-size: 0.8rem;
`;

const ReadIndicator = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => (props.isRead ? 'transparent' : '#4a90e2')};
`;

const NotificationIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: ${props => getNotificationColor(props.type)};
`;

const ExpandButton = styled.button`
  background: none;
  border: none;
  color: #777;
  font-size: 0.8rem;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
  margin-top: 4px;

  &:hover {
    color: #333;
  }
`;

const RelatedLink = styled.a`
  color: #4a90e2;
  text-decoration: none;
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;

  &:hover {
    text-decoration: underline;
  }
`;

// Helper function to get notification color based on type
const getNotificationColor = (type) => {
  switch (type) {
    case NOTIFICATION_TYPES.INFO:
      return '#3498db';
    case NOTIFICATION_TYPES.WARNING:
      return '#f39c12';
    case NOTIFICATION_TYPES.ERROR:
      return '#e74c3c';
    case NOTIFICATION_TYPES.SUCCESS:
      return '#2ecc71';
    default:
      return '#95a5a6';
  }
};

// Helper function to get notification icon based on type
const getNotificationIcon = (type) => {
  switch (type) {
    case NOTIFICATION_TYPES.INFO:
      return <FaInfoCircle />;
    case NOTIFICATION_TYPES.WARNING:
      return <FaExclamationCircle />;
    case NOTIFICATION_TYPES.ERROR:
      return <FaExclamationCircle />;
    case NOTIFICATION_TYPES.SUCCESS:
      return <FaCheckCircle />;
    default:
      return <FaBell />;
  }
};

/**
 * NotificationItem component displays a single notification with actions
 * 
 * @component
 */
const NotificationItem = ({ notification, onClick }) => {
  const dispatch = useDispatch();
  const [expanded, setExpanded] = useState(false);
  const [timeAgo, setTimeAgo] = useState('');

  // Update the time ago text periodically
  useEffect(() => {
    const updateTimeAgo = () => {
      setTimeAgo(formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }));
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [notification.createdAt]);

  // Handle marking notification as read
  const handleMarkAsRead = (e) => {
    e.stopPropagation();
    if (!notification.isRead) {
      dispatch(markAsRead(notification.id));
    }
  };

  // Handle deleting notification
  const handleDelete = (e) => {
    e.stopPropagation();
    dispatch(deleteNotification(notification.id));
  };

  // Handle expanding/collapsing the notification content
  const toggleExpand = (e) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  // Handle notification click
  const handleClick = () => {
    // Mark as read if not already read
    if (!notification.isRead) {
      dispatch(markAsRead(notification.id));
    }
    
    // Call the onClick handler if provided
    if (onClick) {
      onClick(notification);
    }
  };

  // Truncate content if not expanded
  const renderContent = () => {
    if (expanded || notification.message.length <= 100) {
      return notification.message;
    }
    return (
      <>
        {notification.message.substring(0, 100)}...
        <ExpandButton onClick={toggleExpand}>Show more</ExpandButton>
      </>
    );
  };

  return (
    <NotificationItemContainer 
      type={notification.type} 
      isRead={notification.isRead}
      onClick={handleClick}
    >
      <ReadIndicator isRead={notification.isRead} />
      
      <NotificationHeader>
        <NotificationTitle>
          <NotificationIcon type={notification.type}>
            {getNotificationIcon(notification.type)}
          </NotificationIcon>
          {notification.title}
        </NotificationTitle>
        <NotificationTime>{timeAgo}</NotificationTime>
      </NotificationHeader>
      
      <NotificationContent>
        {renderContent()}
        
        {notification.relatedLink && (
          <RelatedLink 
            href={notification.relatedLink} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            View details <FaExternalLinkAlt size={12} />
          </RelatedLink>
        )}
      </NotificationContent>
      
      <NotificationFooter>
        <NotificationMeta>
          {notification.source && (
            <NotificationSource>{notification.source}</NotificationSource>
          )}
        </NotificationMeta>
        
        <NotificationActions>
          {!notification.isRead && (
            <ActionButton 
              variant="outline"
              size="small"
              onClick={handleMarkAsRead}
              title="Mark as read"
            >
              <FaCheck size={12} /> Mark read
            </ActionButton>
          )}
          
          <ActionButton 
            variant="outline"
            size="small"
            onClick={handleDelete}
            title="Delete notification"
          >
            <FaTrash size={12} /> Delete
          </ActionButton>
          
          {!expanded && notification.message.length > 100 && (
            <ActionButton 
              variant="outline"
              size="small"
              onClick={toggleExpand}
              title="Show more"
            >
              Expand
            </ActionButton>
          )}
        </NotificationActions>
      </NotificationFooter>
    </NotificationItemContainer>
  );
};

NotificationItem.propTypes = {
  /**
   * Notification object with all notification data
   */
  notification: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    type: PropTypes.oneOf(Object.values(NOTIFICATION_TYPES)).isRequired,
    isRead: PropTypes.bool.isRequired,
    createdAt: PropTypes.string.isRequired,
    source: PropTypes.string,
    relatedLink: PropTypes.string,
    relatedId: PropTypes.string
  }).isRequired,
  
  /**
   * Callback function when notification is clicked
   */
  onClick: PropTypes.func
};

export default NotificationItem;