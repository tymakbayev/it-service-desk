import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

// Components
import Table from '../../../components/common/Table';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Pagination from '../../../components/common/Pagination';
import Loader from '../../../components/common/Loader';
import Alert from '../../../components/common/Alert';
import IncidentStatusBadge from './IncidentStatusBadge';
import IncidentFilter from './IncidentFilter';

// Redux actions
import { 
  fetchIncidents, 
  setIncidentFilters, 
  setIncidentPage, 
  setIncidentPageSize 
} from '../store/incidentsSlice';

// Hooks
import { useWebSocket } from '../../../hooks/useWebSocket';
import { useAuth } from '../../../hooks/useAuth';

// Utils and constants
import { 
  INCIDENT_PRIORITIES, 
  INCIDENT_STATUSES, 
  INCIDENT_CATEGORIES,
  ITEMS_PER_PAGE_OPTIONS 
} from '../../../utils/constants';

/**
 * IncidentList component displays a list of incidents with filtering, sorting, and pagination
 */
const IncidentList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscribe } = useWebSocket();

  // Get incidents data from Redux store
  const { 
    incidents, 
    loading, 
    error, 
    totalCount, 
    page, 
    pageSize, 
    filters,
    sortField,
    sortDirection
  } = useSelector((state) => state.incidents);

  // Local state for filters
  const [localFilters, setLocalFilters] = useState(filters || {});
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Load incidents on component mount and when dependencies change
  const loadIncidents = useCallback(() => {
    dispatch(fetchIncidents({ page, pageSize, filters, sortField, sortDirection }));
  }, [dispatch, page, pageSize, filters, sortField, sortDirection]);

  useEffect(() => {
    loadIncidents();
    
    // Subscribe to incident updates via WebSocket
    const unsubscribe = subscribe('incidents', (data) => {
      if (data.type === 'update' || data.type === 'create' || data.type === 'delete') {
        loadIncidents();
      }
    });
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [loadIncidents, subscribe]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value, type } = e.target;
    
    setLocalFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? e.target.checked : value
    }));
  };

  // Handle multi-select filter changes
  const handleMultiSelectChange = (name, values) => {
    setLocalFilters(prev => ({
      ...prev,
      [name]: values
    }));
  };

  // Apply filters
  const applyFilters = () => {
    // Combine search term with other filters
    const newFilters = {
      ...localFilters,
      search: searchTerm
    };
    
    // Remove empty filters
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key] === '' || newFilters[key] === null || 
          (Array.isArray(newFilters[key]) && newFilters[key].length === 0)) {
        delete newFilters[key];
      }
    });
    
    dispatch(setIncidentFilters(newFilters));
    dispatch(setIncidentPage(1)); // Reset to first page when applying filters
  };

  // Reset filters
  const resetFilters = () => {
    setLocalFilters({});
    setSearchTerm('');
    dispatch(setIncidentFilters({}));
    dispatch(setIncidentPage(1));
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    dispatch(setIncidentPage(newPage));
  };

  // Handle page size change
  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value, 10);
    dispatch(setIncidentPageSize(newSize));
    dispatch(setIncidentPage(1)); // Reset to first page when changing page size
  };

  // Handle incident click to view details
  const handleIncidentClick = (incidentId) => {
    navigate(`/incidents/${incidentId}`);
  };

  // Handle create new incident
  const handleCreateIncident = () => {
    navigate('/incidents/new');
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    applyFilters();
  };

  // Handle sort change
  const handleSortChange = (field) => {
    let direction = 'asc';
    
    if (sortField === field) {
      direction = sortDirection === 'asc' ? 'desc' : 'asc';
    }
    
    dispatch(fetchIncidents({ 
      page, 
      pageSize, 
      filters, 
      sortField: field, 
      sortDirection: direction 
    }));
  };

  // Table columns configuration
  const columns = [
    {
      header: 'ID',
      accessor: 'incidentNumber',
      sortable: true,
      cell: (row) => <span className="incident-id">{row.incidentNumber}</span>
    },
    {
      header: 'Title',
      accessor: 'title',
      sortable: true,
      cell: (row) => <span className="incident-title">{row.title}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      cell: (row) => <IncidentStatusBadge status={row.status} />
    },
    {
      header: 'Priority',
      accessor: 'priority',
      sortable: true,
      cell: (row) => (
        <span className={`priority-badge priority-${row.priority.toLowerCase()}`}>
          {row.priority}
        </span>
      )
    },
    {
      header: 'Reported By',
      accessor: 'reportedBy.name',
      sortable: true,
      cell: (row) => <span>{row.reportedBy?.name || 'N/A'}</span>
    },
    {
      header: 'Assigned To',
      accessor: 'assignedTo.name',
      sortable: true,
      cell: (row) => <span>{row.assignedTo?.name || 'Unassigned'}</span>
    },
    {
      header: 'Created',
      accessor: 'createdAt',
      sortable: true,
      cell: (row) => <span>{format(new Date(row.createdAt), 'dd MMM yyyy')}</span>
    },
    {
      header: 'Due Date',
      accessor: 'dueDate',
      sortable: true,
      cell: (row) => (
        <span className={new Date(row.dueDate) < new Date() ? 'overdue' : ''}>
          {row.dueDate ? format(new Date(row.dueDate), 'dd MMM yyyy') : 'N/A'}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className="action-buttons">
          <Button 
            variant="primary" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              handleIncidentClick(row._id);
            }}
          >
            View
          </Button>
        </div>
      )
    }
  ];

  // Render loading state
  if (loading && incidents.length === 0) {
    return (
      <div className="incidents-loading">
        <Loader size="large" />
        <p>Loading incidents...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="incidents-error">
        <Alert type="error" message={`Error loading incidents: ${error}`} />
        <Button variant="primary" onClick={loadIncidents}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="incident-list-container">
      <div className="incident-list-header">
        <h2>Incidents</h2>
        <div className="incident-list-actions">
          <Button 
            variant="primary" 
            onClick={handleCreateIncident}
            disabled={user?.role === 'viewer'}
          >
            Create Incident
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>
      </div>

      <div className="incident-search-bar">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <Input
            type="text"
            placeholder="Search incidents..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
          <Button type="submit" variant="primary">Search</Button>
        </form>
      </div>

      {showFilters && (
        <IncidentFilter
          filters={localFilters}
          onFilterChange={handleFilterChange}
          onMultiSelectChange={handleMultiSelectChange}
          onApplyFilters={applyFilters}
          onResetFilters={resetFilters}
          statuses={INCIDENT_STATUSES}
          priorities={INCIDENT_PRIORITIES}
          categories={INCIDENT_CATEGORIES}
        />
      )}

      {incidents.length === 0 ? (
        <div className="no-incidents">
          <p>No incidents found. {Object.keys(filters).length > 0 && 'Try adjusting your filters.'}</p>
          {Object.keys(filters).length > 0 && (
            <Button variant="secondary" onClick={resetFilters}>Clear Filters</Button>
          )}
        </div>
      ) : (
        <>
          <div className="incident-table-container">
            <Table
              columns={columns}
              data={incidents}
              onRowClick={(row) => handleIncidentClick(row._id)}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSortChange}
              className="incident-table"
              rowClassName={(row) => `incident-row incident-status-${row.status.toLowerCase()}`}
            />
          </div>

          <div className="incident-pagination">
            <div className="pagination-info">
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount} incidents
            </div>
            
            <div className="pagination-size">
              <label htmlFor="page-size">Items per page:</label>
              <select
                id="page-size"
                value={pageSize}
                onChange={handlePageSizeChange}
                className="page-size-select"
              >
                {ITEMS_PER_PAGE_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
            <Pagination
              currentPage={page}
              totalPages={Math.ceil(totalCount / pageSize)}
              onPageChange={handlePageChange}
              siblingCount={1}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default IncidentList;