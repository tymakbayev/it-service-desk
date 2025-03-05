import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { format, formatDistance } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaExclamationCircle, FaCheckCircle, FaClock, FaTools, FaFilter, FaArrowRight } from 'react-icons/fa';
import Card from '../../../components/common/Card';
import Table from '../../../components/common/Table';
import Pagination from '../../../components/common/Pagination';
import Loader from '../../../components/common/Loader';
import Button from '../../../components/common/Button';
import { usePagination } from '../../../hooks/usePagination';

// Styled components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${props => props.theme.colors?.text || '#333'};
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const FilterButton = styled.button`
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  font-size: 0.8rem;
  border: 1px solid ${props => props.theme.colors?.border || '#e2e8f0'};
  background-color: ${props => props.active ? (props.theme.colors?.primary || '#3b82f6') : 'transparent'};
  color: ${props => props.active ? '#fff' : (props.theme.colors?.text || '#333')};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.active ? (props.theme.colors?.primaryDark || '#2563eb') : (props.theme.colors?.backgroundHover || '#f8fafc')};
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: ${props => props.theme.colors?.textSecondary || '#64748b'};
  text-align: center;
`;

const FooterContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid ${props => props.theme.colors?.border || '#e2e8f0'};
`;

const ViewAllButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: ${props => props.theme.colors?.primary || '#3b82f6'};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${props => props.theme.colors?.backgroundHover || 'rgba(59, 130, 246, 0.1)'};
  }
`;

const StatusIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.color};
  margin-right: 0.5rem;
  font-size: 1rem;
`;

const TitleCell = styled.div`
  display: flex;
  align-items: center;
  overflow: hidden;
`;

const TitleText = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TicketId = styled.span`
  font-family: monospace;
  font-size: 0.85rem;
  color: ${props => props.theme.colors?.textSecondary || '#64748b'};
`;

const TimeCell = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 0.85rem;
`;

const TimeAgo = styled.span`
  color: ${props => props.theme.colors?.textSecondary || '#64748b'};
  font-size: 0.75rem;
`;

const PriorityBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
  background-color: ${props => props.color};
`;

const AssigneeCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Avatar = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${props => props.color || '#3b82f6'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.75rem;
  font-weight: 500;
`;

const AssigneeName = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

/**
 * RecentIncidents component displays a list of recent incidents on the dashboard
 * Allows filtering by status and provides pagination
 */
const RecentIncidents = ({
  incidents = [],
  isLoading = false,
  title = 'Recent Incidents',
  maxItems = 5,
  showPagination = true,
  showStatus = true,
  showPriority = true,
  showAssignee = true,
  onViewAll,
  emptyMessage = 'No incidents to display',
}) => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.auth);
  const [filter, setFilter] = useState('all');
  
  // Setup pagination
  const { 
    currentPage, 
    totalPages, 
    currentItems, 
    setCurrentPage 
  } = usePagination(
    useMemo(() => {
      if (filter === 'all') return incidents;
      return incidents.filter(incident => incident.status.toLowerCase() === filter);
    }, [incidents, filter]), 
    maxItems
  );

  // Update pagination when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, setCurrentPage]);

  // Handle incident click to navigate to detail page
  const handleIncidentClick = (incident) => {
    navigate(`/incidents/${incident._id}`);
  };

  // Get status icon based on incident status
  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'open':
        return <StatusIcon color="#f59e0b"><FaExclamationCircle /></StatusIcon>;
      case 'in progress':
        return <StatusIcon color="#3b82f6"><FaTools /></StatusIcon>;
      case 'pending':
        return <StatusIcon color="#8b5cf6"><FaClock /></StatusIcon>;
      case 'resolved':
        return <StatusIcon color="#10b981"><FaCheckCircle /></StatusIcon>;
      case 'closed':
        return <StatusIcon color="#6b7280"><FaCheckCircle /></StatusIcon>;
      default:
        return <StatusIcon color="#6b7280"><FaExclamationCircle /></StatusIcon>;
    }
  };

  // Get priority badge color
  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'critical':
        return '#ef4444';
      case 'high':
        return '#f59e0b';
      case 'medium':
        return '#3b82f6';
      case 'low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  // Generate avatar color based on name
  const getAvatarColor = (name) => {
    const colors = [
      '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
      '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Format the columns for the table
  const columns = useMemo(() => {
    const baseColumns = [
      {
        Header: 'ID',
        accessor: 'ticketId',
        Cell: ({ value }) => <TicketId>{value}</TicketId>,
        width: '80px',
      },
      {
        Header: 'Title',
        accessor: 'title',
        Cell: ({ value, row }) => (
          <TitleCell>
            {showStatus && getStatusIcon(row.original.status)}
            <TitleText>{value}</TitleText>
          </TitleCell>
        ),
        width: '40%',
      },
      {
        Header: 'Created',
        accessor: 'createdAt',
        Cell: ({ value }) => {
          const date = new Date(value);
          return (
            <TimeCell>
              <div>{format(date, 'MMM dd, yyyy')}</div>
              <TimeAgo>{formatDistance(date, new Date(), { addSuffix: true })}</TimeAgo>
            </TimeCell>
          );
        },
        width: '120px',
      },
    ];

    // Conditionally add columns based on props
    if (showPriority) {
      baseColumns.push({
        Header: 'Priority',
        accessor: 'priority',
        Cell: ({ value }) => (
          <PriorityBadge color={getPriorityColor(value)}>
            {value}
          </PriorityBadge>
        ),
        width: '100px',
      });
    }

    if (showAssignee) {
      baseColumns.push({
        Header: 'Assignee',
        accessor: 'assignee',
        Cell: ({ value }) => {
          if (!value || !value.name) {
            return <AssigneeName>Unassigned</AssigneeName>;
          }
          
          return (
            <AssigneeCell>
              <Avatar color={getAvatarColor(value.name)}>
                {getInitials(value.name)}
              </Avatar>
              <AssigneeName>{value.name}</AssigneeName>
            </AssigneeCell>
          );
        },
        width: '120px',
      });
    }

    return baseColumns;
  }, [showStatus, showPriority, showAssignee]);

  // Status filter options
  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'open', label: 'Open' },
    { value: 'in progress', label: 'In Progress' },
    { value: 'pending', label: 'Pending' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
  ];

  return (
    <Card>
      <Container>
        <Header>
          <Title>{title}</Title>
          <FilterContainer>
            <FaFilter style={{ color: '#64748b', marginRight: '0.5rem' }} />
            {filterOptions.map(option => (
              <FilterButton
                key={option.value}
                active={filter === option.value}
                onClick={() => setFilter(option.value)}
              >
                {option.label}
              </FilterButton>
            ))}
          </FilterContainer>
        </Header>

        {isLoading ? (
          <Loader />
        ) : currentItems.length > 0 ? (
          <Table
            columns={columns}
            data={currentItems}
            onRowClick={handleIncidentClick}
            hoverable
          />
        ) : (
          <EmptyState>
            <FaExclamationCircle size={24} style={{ marginBottom: '0.5rem' }} />
            <p>{emptyMessage}</p>
          </EmptyState>
        )}

        <FooterContainer>
          {showPagination && totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              size="small"
            />
          )}
          
          {onViewAll && (
            <ViewAllButton onClick={onViewAll}>
              View all incidents
              <FaArrowRight size={12} />
            </ViewAllButton>
          )}
        </FooterContainer>
      </Container>
    </Card>
  );
};

RecentIncidents.propTypes = {
  incidents: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      ticketId: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      priority: PropTypes.string,
      createdAt: PropTypes.string.isRequired,
      assignee: PropTypes.shape({
        _id: PropTypes.string,
        name: PropTypes.string,
      }),
    })
  ),
  isLoading: PropTypes.bool,
  title: PropTypes.string,
  maxItems: PropTypes.number,
  showPagination: PropTypes.bool,
  showStatus: PropTypes.bool,
  showPriority: PropTypes.bool,
  showAssignee: PropTypes.bool,
  onViewAll: PropTypes.func,
  emptyMessage: PropTypes.string,
};

export default RecentIncidents;