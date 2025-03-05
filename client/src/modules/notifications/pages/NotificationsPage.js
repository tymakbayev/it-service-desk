import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { FaBell, FaCheck, FaTrash, FaFilter, FaSort } from 'react-icons/fa';

// Components
import Layout from '../../../components/Layout';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Loader from '../../../components/common/Loader';
import Pagination from '../../../components/common/Pagination';
import Alert from '../../../components/common/Alert';
import NotificationList from '../components/NotificationList';
import NotificationItem from '../components/NotificationItem';

// Store
import { 
  fetchNotifications, 
  markAllAsRead, 
  markAsRead, 
  deleteNotification,
  clearNotifications
} from '../notificationSlice';

// Hooks
import useNotifications from '../../../hooks/useNotifications';
import usePagination from '../../../hooks/usePagination';

// Utils
import { formatRelativeTime } from '../../../utils/dateUtils';
import { NOTIFICATION_TYPES } from '../../../utils/constants';

const PageContainer = styled.div`
  padding: 20px;
  width: 100%;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  font-size: 24px;
  color: #333;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 10px;
    color: #4a6cf7;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const FilterContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const FilterLabel = styled.label`
  font-weight: 500;
  margin-right: 5px;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 5px;
  }
`;

const Select = styled.select`
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background-color: white;
  font-size: 14px;
  min-width: 150px;
  
  &:focus {
    outline: none;
    border-color: #4a6cf7;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 20px;
  text-align: center;
  
  svg {
    font-size: 48px;
    color: #ccc;
    margin-bottom: 20px;
  }
  
  h3 {
    font-size: 18px;
    color: #666;
    margin-bottom: 10px;
  }
  
  p {
    color: #888;
    max-width: 400px;
  }
`;

const NotificationCount = styled.span`
  background-color: ${props => props.unread > 0 ? '#4a6cf7' : '#6c757d'};
  color: white;
  border-radius: 20px;
  padding: 2px 8px;
  font-size: 14px;
  margin-left: 10px;
`;

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { subscribeToNotifications } = useNotifications();
  
  // Local state
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date'); // 'date', 'priority'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'
  const [alertMessage, setAlertMessage] = useState(null);
  
  // Redux state
  const { 
    notifications, 
    loading, 
    error, 
    totalCount,
    unreadCount 
  } = useSelector(state => state.notifications);
  
  const { user } = useSelector(state => state.auth);
  
  // Pagination
  const { 
    page, 
    pageSize, 
    setPage, 
    setPageSize, 
    totalPages 
  } = usePagination(totalCount, 10);
  
  // Fetch notifications on component mount and when dependencies change
  useEffect(() => {
    dispatch(fetchNotifications({ 
      page, 
      pageSize, 
      filter, 
      typeFilter,
      sortBy, 
      sortOrder 
    }));
  }, [dispatch, page, pageSize, filter, typeFilter, sortBy, sortOrder]);
  
  // Subscribe to real-time notifications
  useEffect(() => {
    if (user) {
      const unsubscribe = subscribeToNotifications();
      return () => unsubscribe();
    }
  }, [user, subscribeToNotifications]);
  
  // Handle notification click
  const handleNotificationClick = useCallback((notification) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      dispatch(markAsRead(notification.id))
        .unwrap()
        .catch(error => {
          toast.error(`Failed to mark notification as read: ${error.message}`);
        });
    }
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'INCIDENT_ASSIGNED':
      case 'INCIDENT_STATUS_CHANGED':
      case 'INCIDENT_COMMENT_ADDED':
        navigate(`/incidents/${notification.referenceId}`);
        break;
      case 'EQUIPMENT_STATUS_CHANGED':
      case 'EQUIPMENT_MAINTENANCE_DUE':
        navigate(`/equipment/${notification.referenceId}`);
        break;
      case 'REPORT_GENERATED':
        navigate(`/reports/view/${notification.referenceId}`);
        break;
      case 'SYSTEM_NOTIFICATION':
      default:
        // For other notification types, just stay on the notifications page
        break;
    }
  }, [dispatch, navigate]);
  
  // Handle mark all as read
  const handleMarkAllAsRead = useCallback(() => {
    dispatch(markAllAsRead())
      .unwrap()
      .then(() => {
        setAlertMessage({
          type: 'success',
          message: 'All notifications marked as read'
        });
        
        // Clear alert after 3 seconds
        setTimeout(() => setAlertMessage(null), 3000);
      })
      .catch(error => {
        setAlertMessage({
          type: 'error',
          message: `Failed to mark notifications as read: ${error.message}`
        });
      });
  }, [dispatch]);
  
  // Handle delete notification
  const handleDeleteNotification = useCallback((id) => {
    dispatch(deleteNotification(id))
      .unwrap()
      .then(() => {
        setAlertMessage({
          type: 'success',
          message: 'Notification deleted successfully'
        });
        
        // Clear alert after 3 seconds
        setTimeout(() => setAlertMessage(null), 3000);
      })
      .catch(error => {
        setAlertMessage({
          type: 'error',
          message: `Failed to delete notification: ${error.message}`
        });
      });
  }, [dispatch]);
  
  // Handle clear all notifications
  const handleClearAllNotifications = useCallback(() => {
    if (window.confirm('Are you sure you want to delete all notifications? This action cannot be undone.')) {
      dispatch(clearNotifications())
        .unwrap()
        .then(() => {
          setAlertMessage({
            type: 'success',
            message: 'All notifications cleared successfully'
          });
          
          // Clear alert after 3 seconds
          setTimeout(() => setAlertMessage(null), 3000);
        })
        .catch(error => {
          setAlertMessage({
            type: 'error',
            message: `Failed to clear notifications: ${error.message}`
          });
        });
    }
  }, [dispatch]);
  
  // Handle filter change
  const handleFilterChange = useCallback((e) => {
    setFilter(e.target.value);
    setPage(1); // Reset to first page when filter changes
  }, [setPage]);
  
  // Handle type filter change
  const handleTypeFilterChange = useCallback((e) => {
    setTypeFilter(e.target.value);
    setPage(1); // Reset to first page when filter changes
  }, [setPage]);
  
  // Handle sort change
  const handleSortChange = useCallback((e) => {
    setSortBy(e.target.value);
    setPage(1); // Reset to first page when sort changes
  }, [setPage]);
  
  // Handle sort order change
  const handleSortOrderChange = useCallback(() => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    setPage(1); // Reset to first page when sort order changes
  }, [sortOrder, setPage]);
  
  // Render notification type options
  const renderNotificationTypeOptions = () => {
    return (
      <>
        <option value="all">All Types</option>
        {Object.keys(NOTIFICATION_TYPES).map(type => (
          <option key={type} value={type}>
            {NOTIFICATION_TYPES[type]}
          </option>
        ))}
      </>
    );
  };
  
  // Render empty state
  const renderEmptyState = () => {
    return (
      <EmptyState>
        <FaBell />
        <h3>No notifications found</h3>
        <p>
          {filter === 'all' 
            ? "You don't have any notifications yet." 
            : filter === 'unread' 
              ? "You don't have any unread notifications." 
              : "You don't have any read notifications."}
        </p>
      </EmptyState>
    );
  };
  
  return (
    <Layout>
      <PageContainer>
        <PageHeader>
          <Title>
            <FaBell /> 
            Notifications 
            <NotificationCount unread={unreadCount}>
              {unreadCount > 0 ? `${unreadCount} unread` : 'All read'}
            </NotificationCount>
          </Title>
          <ActionButtons>
            {unreadCount > 0 && (
              <Button 
                onClick={handleMarkAllAsRead}
                variant="secondary"
                icon={<FaCheck />}
              >
                Mark All as Read
              </Button>
            )}
            <Button 
              onClick={handleClearAllNotifications}
              variant="danger"
              icon={<FaTrash />}
              disabled={notifications.length === 0}
            >
              Clear All
            </Button>
          </ActionButtons>
        </PageHeader>
        
        {alertMessage && (
          <Alert 
            type={alertMessage.type} 
            message={alertMessage.message} 
            onClose={() => setAlertMessage(null)}
          />
        )}
        
        <FilterContainer>
          <FilterGroup>
            <FilterLabel>
              <FaFilter /> Filter:
            </FilterLabel>
            <Select value={filter} onChange={handleFilterChange}>
              <option value="all">All Notifications</option>
              <option value="unread">Unread Only</option>
              <option value="read">Read Only</option>
            </Select>
            
            <FilterLabel>Type:</FilterLabel>
            <Select value={typeFilter} onChange={handleTypeFilterChange}>
              {renderNotificationTypeOptions()}
            </Select>
          </FilterGroup>
          
          <FilterGroup>
            <FilterLabel>Sort By:</FilterLabel>
            <Select value={sortBy} onChange={handleSortChange}>
              <option value="date">Date</option>
              <option value="priority">Priority</option>
              <option value="type">Type</option>
            </Select>
            
            <Button 
              onClick={handleSortOrderChange}
              variant="outline"
              icon={<FaSort />}
            >
              {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
            </Button>
          </FilterGroup>
        </FilterContainer>
        
        <Card>
          {loading ? (
            <Loader text="Loading notifications..." />
          ) : error ? (
            <Alert 
              type="error" 
              message={`Error loading notifications: ${error}`} 
            />
          ) : notifications.length === 0 ? (
            renderEmptyState()
          ) : (
            <>
              <NotificationList>
                {notifications.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={() => handleNotificationClick(notification)}
                    onDelete={() => handleDeleteNotification(notification.id)}
                    formatTime={(date) => formatRelativeTime(date)}
                  />
                ))}
              </NotificationList>
              
              {totalPages > 1 && (
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  pageSize={pageSize}
                  onPageSizeChange={setPageSize}
                  pageSizeOptions={[5, 10, 25, 50]}
                  totalItems={totalCount}
                />
              )}
            </>
          )}
        </Card>
      </PageContainer>
    </Layout>
  );
};

export default NotificationsPage;