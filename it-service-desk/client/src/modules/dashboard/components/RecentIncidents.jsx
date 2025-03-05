import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { format, formatDistance } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaExclamationCircle, FaCheckCircle, FaClock, FaTools } from 'react-icons/fa';
import Card from '../../../components/common/Card';
import Table from '../../../components/common/Table';
import Pagination from '../../../components/common/Pagination';
import Loader from '../../../components/common/Loader';
import { usePagination } from '../../../hooks/usePagination';

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
  } = usePagination(incidents, maxItems);

  // Filter incidents based on selected status
  const filteredIncidents = useMemo(() => {
    if (filter === 'all') return incidents;
    return incidents.filter(incident => incident.status.toLowerCase() === filter);
  }, [incidents, filter]);

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
        accessor: 'assignedTo',
        Cell: ({ value }) => {
          if (!value) return <UnassignedText>Unassigned</UnassignedText>;
          return <div>{value.name || value.username || 'Unknown'}</div>;
        },
        width: '120px',
      });
    }

    return baseColumns;
  }, [showStatus, showPriority, showAssignee]);

  return (
    <StyledCard>
      <CardHeader>
        <Title>{title}</Title>
        <Controls>
          <FilterContainer>
            <FilterButton 
              active={filter === 'all'} 
              onClick={() => setFilter('all')}
            >
              All
            </FilterButton>
            <FilterButton 
              active={filter === 'open'} 
              onClick={() => setFilter('open')}
            >
              Open
            </FilterButton>
            <FilterButton 
              active={filter === 'in progress'} 
              onClick={() => setFilter('in progress')}
            >
              In Progress
            </FilterButton>
            <FilterButton 
              active={filter === 'resolved'} 
              onClick={() => setFilter('resolved')}
            >
              Resolved
            </FilterButton>
          </FilterContainer>
          {onViewAll && (
            <ViewAllButton onClick={onViewAll}>
              View All
            </ViewAllButton>
          )}
        </Controls>
      </CardHeader>

      {isLoading ? (
        <LoaderContainer>
          <Loader size="medium" />
        </LoaderContainer>
      ) : filteredIncidents.length === 0 ? (
        <EmptyState>
          <EmptyIcon>
            <FaExclamationCircle />
          </EmptyIcon>
          <EmptyText>{emptyMessage}</EmptyText>
        </EmptyState>
      ) : (
        <>
          <Table
            columns={columns}
            data={currentItems}
            onRowClick={handleIncidentClick}
            hoverable
            compact
          />
          {showPagination && totalPages > 1 && (
            <PaginationContainer>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                size="small"
              />
            </PaginationContainer>
          )}
        </>
      )}
    </StyledCard>
  );
};

RecentIncidents.propTypes = {
  /** Array of incident objects to display */
  incidents: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      ticketId: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      priority: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
      assignedTo: PropTypes.object,
    })
  ),
  /** Loading state indicator */
  isLoading: PropTypes.bool,
  /** Title for the card */
  title: PropTypes.string,
  /** Maximum number of items to show per page */
  maxItems: PropTypes.number,
  /** Whether to show pagination controls */
  showPagination: PropTypes.bool,
  /** Whether to show status icons */
  showStatus: PropTypes.bool,
  /** Whether to show priority badges */
  showPriority: PropTypes.bool,
  /** Whether to show assignee information */
  showAssignee: PropTypes.bool,
  /** Handler for "View All" button click */
  onViewAll: PropTypes.func,
  /** Message to display when there are no incidents */
  emptyMessage: PropTypes.string,
};

// Styled components
const StyledCard = styled(Card)`
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  color: #111827;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  background: ${props => props.active ? '#f3f4f6' : 'transparent'};
  border: 1px solid ${props => props.active ? '#d1d5db' : 'transparent'};
  color: ${props => props.active ? '#111827' : '#6b7280'};
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f3f4f6;
    color: #111827;
  }
`;

const ViewAllButton = styled.button`
  background: transparent;
  border: none;
  color: #3b82f6;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  transition: all 0.2s ease;

  &:hover {
    background: #eff6ff;
  }
`;

const LoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
  flex: 1;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 3rem;
  flex: 1;
`;

const EmptyIcon = styled.div`
  font-size: 2.5rem;
  color: #d1d5db;
  margin-bottom: 1rem;
`;

const EmptyText = styled.p`
  color: #6b7280;
  font-size: 1rem;
  text-align: center;
`;

const TitleCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const TitleText = styled.span`
  font-weight: 500;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StatusIcon = styled.div`
  color: ${props => props.color};
  display: flex;
  align-items: center;
  font-size: 1rem;
  flex-shrink: 0;
`;

const TimeCell = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 0.875rem;
`;

const TimeAgo = styled.span`
  color: #6b7280;
  font-size: 0.75rem;
  margin-top: 0.25rem;
`;

const PriorityBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  background-color: ${props => `${props.color}15`};
  color: ${props => props.color};
`;

const TicketId = styled.span`
  font-family: monospace;
  font-size: 0.875rem;
  color: #6b7280;
`;

const UnassignedText = styled.span`
  color: #9ca3af;
  font-style: italic;
  font-size: 0.875rem;
`;

const PaginationContainer = styled.div`
  padding: 1rem;
  display: flex;
  justify-content: center;
  border-top: 1px solid #e5e7eb;
  margin-top: auto;
`;

export default RecentIncidents;