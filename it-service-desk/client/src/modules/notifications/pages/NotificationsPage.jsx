import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import styled from 'styled-components';

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
  deleteNotification 
} from '../store/notificationsSlice';

// Hooks
import useNotifications from '../../../hooks/useNotifications';
import usePagination from '../../../hooks/usePagination';

// Utils
import { formatRelativeTime } from '../../../utils/dateUtils';

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { subscribeToNotifications } = useNotifications();
  
  // Local state
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [sortBy, setSortBy] = useState('date'); // 'date', 'priority'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'
  const [alertMessage, setAlertMessage] = useState(null);
  
  // Redux state
  const { 
    notifications, 
    loading, 
    error, 
    totalCount 
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
      sortBy, 
      sortOrder 
    }));
  }, [dispatch, page, pageSize, filter, sortBy, sortOrder]);
  
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
      dispatch(markAsRead(notification.id));
    }
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'INCIDENT_ASSIGNED':
      case 'INCIDENT_STATUS_CHANGED':
      case 'INCIDENT_COMMENT_ADDED':
        navigate(`/incidents/${notification.referenceId}`);
        break;
      case 'EQUIPMENT_STATUS_CHANGED':
        navigate(`/equipment/${notification.referenceId}`);
        break;
      case 'REPORT_GENERATED':
        navigate(`/reports/view/${notification.referenceId}`);
        break;
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
  
  // Handle filter change
  const handleFilterChange = useCallback((newFilter) => {
    setFilter(newFilter);
    setPage(1); // Reset to first page when filter changes
  }, [setPage]);
  
  // Handle sort change
  const handleSortChange = useCallback((field) => {
    if (sortBy === field) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and default to descending
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1); // Reset to first page when sort changes
  }, [sortBy, sortOrder, setPage]);
  
  // Get notification priority class
  const getPriorityClass = useCallback((priority) => {
    switch (priority) {
      case 'HIGH':
        return 'high-priority';
      case 'MEDIUM':
        return 'medium-priority';
      case 'LOW':
        return 'low-priority';
      default:
        return '';
    }
  }, []);
  
  // Render notification timestamp
  const renderTimestamp = useCallback((timestamp) => {
    const date = new Date(timestamp);
    return (
      <Timestamp title={format(date, 'PPpp')}>
        {formatRelativeTime(date)}
      </Timestamp>
    );
  }, []);
  
  // Render empty state
  const renderEmptyState = useCallback(() => (
    <EmptyState>
      <h3>No notifications</h3>
      <p>You don't have any notifications at the moment.</p>
    </EmptyState>
  ), []);
  
  return (
    <Layout>
      <PageHeader>
        <h1>Notifications</h1>
        <ButtonGroup>
          <Button 
            onClick={handleMarkAllAsRead} 
            disabled={loading || notifications.every(n => n.isRead)}
            variant="secondary"
          >
            Mark All as Read
          </Button>
        </ButtonGroup>
      </PageHeader>
      
      {alertMessage && (
        <Alert 
          type={alertMessage.type} 
          message={alertMessage.message} 
          onClose={() => setAlertMessage(null)} 
        />
      )}
      
      <FiltersContainer>
        <FilterGroup>
          <FilterLabel>Filter:</FilterLabel>
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
          <FilterLabel>Sort by:</FilterLabel>
          <FilterButton 
            active={sortBy === 'date'} 
            onClick={() => handleSortChange('date')}
          >
            Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
          </FilterButton>
          <FilterButton 
            active={sortBy === 'priority'} 
            onClick={() => handleSortChange('priority')}
          >
            Priority {sortBy === 'priority' && (sortOrder === 'asc' ? '↑' : '↓')}
          </FilterButton>
        </FilterGroup>
      </FiltersContainer>
      
      <Card>
        {loading ? (
          <LoaderContainer>
            <Loader size="medium" />
          </LoaderContainer>
        ) : error ? (
          <ErrorContainer>
            <p>Error loading notifications: {error}</p>
            <Button 
              onClick={() => dispatch(fetchNotifications({ page, pageSize, filter, sortBy, sortOrder }))}
              variant="primary"
            >
              Retry
            </Button>
          </ErrorContainer>
        ) : notifications.length === 0 ? (
          renderEmptyState()
        ) : (
          <NotificationList>
            {notifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={() => handleNotificationClick(notification)}
                onDelete={() => handleDeleteNotification(notification.id)}
                priorityClass={getPriorityClass(notification.priority)}
                timestamp={renderTimestamp(notification.createdAt)}
              />
            ))}
          </NotificationList>
        )}
      </Card>
      
      {!loading && notifications.length > 0 && (
        <PaginationContainer>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[5, 10, 25, 50]}
            totalItems={totalCount}
          />
        </PaginationContainer>
      )}
    </Layout>
  );
};

// Styled Components
const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  h1 {
    font-size: 1.8rem;
    margin: 0;
    color: #333;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const FiltersContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FilterLabel = styled.span`
  font-weight: 500;
  color: #555;
`;

const FilterButton = styled.button`
  background: ${props => props.active ? '#1976d2' : '#f5f5f5'};
  color: ${props => props.active ? 'white' : '#333'};
  border: 1px solid ${props => props.active ? '#1976d2' : '#ddd'};
  border-radius: 4px;
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.active ? '#1565c0' : '#e0e0e0'};
  }
`;

const LoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 2rem;
  color: #d32f2f;
  
  p {
    margin-bottom: 1rem;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #757575;
  
  h3 {
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  
  p {
    font-size: 0.95rem;
  }
`;

const PaginationContainer = styled.div`
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
`;

const Timestamp = styled.span`
  font-size: 0.8rem;
  color: #757575;
  white-space: nowrap;
`;

export default NotificationsPage;