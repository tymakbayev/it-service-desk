import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import { FaBell, FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTrash } from 'react-icons/fa';
import styled from 'styled-components';
import { 
  fetchNotifications, 
  markAsRead, 
  markAllAsRead,
  deleteNotification 
} from '../store/notificationsSlice';
import Loader from '../../../components/common/Loader';
import Alert from '../../../components/common/Alert';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Pagination from '../../../components/common/Pagination';
import Modal from '../../../components/common/Modal';
import { usePagination } from '../../../hooks/usePagination';
import { useWebSocket } from '../../../hooks/useWebSocket';
import { NOTIFICATION_TYPES } from '../../../utils/constants';
import NotificationItem from './NotificationItem';
import { useAuth } from '../../../hooks/useAuth';

const NotificationsContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
`;

const NotificationsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
`;

const HeaderTitle = styled.h2`
  margin: 0;
  display: flex;
  align-items: center;
  font-size: 1.5rem;
  color: #333;
`;

const UnreadBadge = styled.span`
  background-color: ${props => props.theme.colors?.primary || '#4a90e2'};
  color: white;
  border-radius: 50%;
  min-width: 24px;
  height: 24px;
  font-size: 0.8rem;
  font-weight: bold;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 10px;
`;

const EmptyNotificationsCard = styled(Card)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
`;

const EmptyIcon = styled(FaBell)`
  color: #ccc;
  margin-bottom: 15px;
`;

const NotificationsList = styled.div`
  margin-bottom: 20px;
`;

const FilterBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const FilterButton = styled.button`
  background: ${props => props.active ? props.theme.colors?.primary || '#4a90e2' : 'transparent'};
  color: ${props => props.active ? 'white' : '#666'};
  border: 1px solid ${props => props.active ? props.theme.colors?.primary || '#4a90e2' : '#ddd'};
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.active ? props.theme.colors?.primaryDark || '#3a80d2' : '#f5f5f5'};
  }
`;

const NotificationDetailModal = styled(Modal)`
  max-width: 600px;
`;

const DetailHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
`;

const DetailTitle = styled.h3`
  margin: 0 0 5px 0;
  font-size: 1.2rem;
`;

const DetailTime = styled.div`
  font-size: 0.8rem;
  color: #888;
  margin-bottom: 15px;
`;

const DetailContent = styled.div`
  margin-bottom: 20px;
  line-height: 1.6;
  font-size: 1rem;
`;

const DetailFooter = styled.div`
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #eee;
  padding-top: 15px;
`;

const DetailType = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  color: #666;
`;

const TypeBadge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  margin-left: 8px;
  
  ${props => {
    switch (props.type) {
      case NOTIFICATION_TYPES.INFO:
        return `background-color: #e3f2fd; color: #0d47a1;`;
      case NOTIFICATION_TYPES.WARNING:
        return `background-color: #fff3e0; color: #e65100;`;
      case NOTIFICATION_TYPES.ERROR:
        return `background-color: #ffebee; color: #b71c1c;`;
      case NOTIFICATION_TYPES.SUCCESS:
        return `background-color: #e8f5e9; color: #1b5e20;`;
      default:
        return `background-color: #f5f5f5; color: #333;`;
    }
  }}
`;

/**
 * Component for displaying a list of notifications with pagination, filtering, and actions
 * Supports real-time updates via WebSocket
 */
const NotificationList = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { notifications, unreadCount, loading, error } = useSelector((state) => state.notifications);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'info', 'warning', 'error', 'success'
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  
  // Filter notifications based on current filters
  const filteredNotifications = useCallback(() => {
    return notifications.filter(notification => {
      // Filter by read status
      if (filter === 'unread' && notification.isRead) return false;
      if (filter === 'read' && !notification.isRead) return false;
      
      // Filter by type
      if (typeFilter !== 'all' && notification.type !== typeFilter) return false;
      
      return true;
    });
  }, [notifications, filter, typeFilter]);
  
  // Initialize pagination
  const { 
    page, 
    itemsPerPage, 
    totalPages, 
    handlePageChange, 
    paginatedItems 
  } = usePagination(filteredNotifications(), 10);

  // Initialize WebSocket connection for real-time notifications
  useWebSocket('notifications', (newNotification) => {
    // Refresh notifications when a new one is received
    dispatch(fetchNotifications());
  });

  // Fetch notifications on component mount
  useEffect(() => {
    dispatch(fetchNotifications());
    
    // Set up polling for notifications (every 30 seconds)
    const intervalId = setInterval(() => {
      dispatch(fetchNotifications());
    }, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
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
  
  // Handle notification deletion
  const handleDeleteNotification = (notificationId) => {
    setDeleteConfirmation(notificationId);
  };
  
  // Confirm notification deletion
  const confirmDelete = () => {
    if (deleteConfirmation) {
      dispatch(deleteNotification(deleteConfirmation));
      setDeleteConfirmation(null);
      
      // If the deleted notification is currently selected, close the detail view
      if (selectedNotification && selectedNotification._id === deleteConfirmation) {
        setSelectedNotification(null);
      }
    }
  };
  
  // Cancel notification deletion
  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };

  // Handle filter changes
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };
  
  // Handle type filter changes
  const handleTypeFilterChange = (newTypeFilter) => {
    setTypeFilter(newTypeFilter);
  };

  if (loading && notifications.length === 0) {
    return (
      <NotificationsContainer>
        <NotificationsHeader>
          <HeaderTitle>Notifications</HeaderTitle>
        </NotificationsHeader>
        <Loader />
      </NotificationsContainer>
    );
  }

  if (error) {
    return (
      <NotificationsContainer>
        <NotificationsHeader>
          <HeaderTitle>Notifications</HeaderTitle>
        </NotificationsHeader>
        <Alert type="error" message={`Error loading notifications: ${error}`} />
      </NotificationsContainer>
    );
  }

  return (
    <NotificationsContainer>
      <NotificationsHeader>
        <HeaderTitle>
          Notifications
          {unreadCount > 0 && <UnreadBadge>{unreadCount}</UnreadBadge>}
        </HeaderTitle>
        
        <HeaderActions>
          {notifications.length > 0 && (
            <Button 
              variant="secondary"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              Mark all as read
            </Button>
          )}
        </HeaderActions>
      </NotificationsHeader>
      
      {notifications.length === 0 ? (
        <EmptyNotificationsCard>
          <EmptyIcon size={48} />
          <p>You don't have any notifications yet</p>
        </EmptyNotificationsCard>
      ) : (
        <>
          <FilterBar>
            <FilterGroup>
              <FilterButton 
                active={filter === 'all'} 
                onClick={() => handleFilterChange('all')}
              >
                All
              </FilterButton>
              <FilterButton 
                active={filter === 'unread'} 
                onClick={() => handleFilterChange('unread')}
              >
                Unread
              </FilterButton>
              <FilterButton 
                active={filter === 'read'} 
                onClick={() => handleFilterChange('read')}
              >
                Read
              </FilterButton>
            </FilterGroup>
            
            <FilterGroup>
              <FilterButton 
                active={typeFilter === 'all'} 
                onClick={() => handleTypeFilterChange('all')}
              >
                All Types
              </FilterButton>
              <FilterButton 
                active={typeFilter === NOTIFICATION_TYPES.INFO} 
                onClick={() => handleTypeFilterChange(NOTIFICATION_TYPES.INFO)}
              >
                Info
              </FilterButton>
              <FilterButton 
                active={typeFilter === NOTIFICATION_TYPES.WARNING} 
                onClick={() => handleTypeFilterChange(NOTIFICATION_TYPES.WARNING)}
              >
                Warning
              </FilterButton>
              <FilterButton 
                active={typeFilter === NOTIFICATION_TYPES.ERROR} 
                onClick={() => handleTypeFilterChange(NOTIFICATION_TYPES.ERROR)}
              >
                Error
              </FilterButton>
              <FilterButton 
                active={typeFilter === NOTIFICATION_TYPES.SUCCESS} 
                onClick={() => handleTypeFilterChange(NOTIFICATION_TYPES.SUCCESS)}
              >
                Success
              </FilterButton>
            </FilterGroup>
          </FilterBar>
          
          <NotificationsList>
            {paginatedItems.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onClick={() => handleNotificationClick(notification)}
                onMarkAsRead={() => handleMarkAsRead(notification._id)}
                onDelete={() => handleDeleteNotification(notification._id)}
              />
            ))}
          </NotificationsList>
          
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
        <NotificationDetailModal
          isOpen={!!selectedNotification}
          onClose={closeNotificationDetails}
          title="Notification Details"
        >
          <DetailHeader>
            {getNotificationIcon(selectedNotification.type)}
            <DetailTitle>{selectedNotification.title}</DetailTitle>
          </DetailHeader>
          
          <DetailTime>
            {formatDistanceToNow(new Date(selectedNotification.createdAt), { addSuffix: true })}
          </DetailTime>
          
          <DetailContent>
            {selectedNotification.message}
            
            {selectedNotification.link && (
              <div style={{ marginTop: '15px' }}>
                <Button 
                  as="a" 
                  href={selectedNotification.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  View Details
                </Button>
              </div>
            )}
          </DetailContent>
          
          <DetailFooter>
            <DetailType>
              Type: 
              <TypeBadge type={selectedNotification.type}>
                {selectedNotification.type.charAt(0).toUpperCase() + selectedNotification.type.slice(1)}
              </TypeBadge>
            </DetailType>
            
            <Button 
              variant="danger" 
              onClick={() => handleDeleteNotification(selectedNotification._id)}
            >
              <FaTrash style={{ marginRight: '5px' }} /> Delete
            </Button>
          </DetailFooter>
        </NotificationDetailModal>
      )}
      
      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <Modal
          isOpen={!!deleteConfirmation}
          onClose={cancelDelete}
          title="Confirm Deletion"
        >
          <p>Are you sure you want to delete this notification? This action cannot be undone.</p>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <Button variant="secondary" onClick={cancelDelete}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </Modal>
      )}
    </NotificationsContainer>
  );
};

export default NotificationList;