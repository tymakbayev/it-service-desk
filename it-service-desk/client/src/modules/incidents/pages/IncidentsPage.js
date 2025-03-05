import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { FaPlus, FaFilter, FaSearch, FaSync, FaEllipsisV, FaTrash, FaEdit, FaEye } from 'react-icons/fa';

// Components
import Layout from '../../../components/Layout';
import Table from '../../../components/common/Table';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Loader from '../../../components/common/Loader';
import Pagination from '../../../components/common/Pagination';
import Card from '../../../components/common/Card';
import Modal from '../../../components/common/Modal';
import IncidentStatusBadge from '../components/IncidentStatusBadge';
import IncidentFilter from '../components/IncidentFilter';
import Alert from '../../../components/common/Alert';

// Store
import { 
  fetchIncidents, 
  deleteIncident,
  updateIncidentStatus 
} from '../store/incidentsSlice';

// Hooks
import useAuth from '../../../hooks/useAuth';
import usePagination from '../../../hooks/usePagination';

// Utils
import { formatDate, formatDateTime } from '../../../utils/dateUtils';
import { INCIDENT_STATUSES, INCIDENT_PRIORITIES, USER_ROLES } from '../../../utils/constants';

// Styled components
const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const PageTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const SearchForm = styled.form`
  display: flex;
  flex: 1;
  max-width: 500px;
`;

const SearchInput = styled(Input)`
  flex: 1;
  margin-right: 0.5rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const FilterContainer = styled.div`
  margin-bottom: 1.5rem;
`;

const StatusSelect = styled.select`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.25rem;
  font-size: 0.875rem;
`;

const NoDataContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  background-color: #f7fafc;
  border-radius: 0.5rem;
  border: 1px dashed #cbd5e0;
`;

const NoDataText = styled.p`
  color: #718096;
  font-size: 1rem;
  margin-top: 1rem;
`;

const ActionsCell = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.color || '#4a5568'};
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: #edf2f7;
  }
`;

const IncidentsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assignedTo: '',
    dateFrom: '',
    dateTo: '',
    category: ''
  });
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Redux state
  const { 
    incidents, 
    loading, 
    error, 
    totalItems 
  } = useSelector((state) => state.incidents);

  // Pagination hook
  const { 
    page, 
    limit, 
    totalPages, 
    handlePageChange, 
    handleLimitChange 
  } = usePagination(totalItems, 10);

  // Fetch incidents on mount and when dependencies change
  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(fetchIncidents({ 
          page, 
          limit, 
          search: searchTerm,
          ...filters
        })).unwrap();
      } catch (err) {
        toast.error(`Failed to load incidents: ${err.message || 'Unknown error'}`);
      }
    };
    
    fetchData();
  }, [dispatch, page, limit, searchTerm, filters]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    handlePageChange(1); // Reset to first page when searching
  };

  // Handle filter changes
  const handleFilterChange = (filterData) => {
    setFilters(filterData);
    handlePageChange(1); // Reset to first page when filtering
  };

  // Handle filter reset
  const handleFilterReset = () => {
    setFilters({
      status: '',
      priority: '',
      assignedTo: '',
      dateFrom: '',
      dateTo: '',
      category: ''
    });
    handlePageChange(1);
  };

  // Navigate to create incident page
  const handleCreateIncident = () => {
    navigate('/incidents/create');
  };

  // Navigate to incident detail page
  const handleViewIncident = (id) => {
    navigate(`/incidents/${id}`);
  };

  // Handle incident status change
  const handleStatusChange = async () => {
    if (!selectedIncident || !newStatus) return;
    
    try {
      await dispatch(updateIncidentStatus({
        id: selectedIncident._id,
        status: newStatus
      })).unwrap();
      
      toast.success(`Incident status updated to ${newStatus}`);
      setShowStatusModal(false);
      setSelectedIncident(null);
      setNewStatus('');
    } catch (err) {
      toast.error(`Failed to update status: ${err.message || 'Unknown error'}`);
    }
  };

  // Open status change modal
  const openStatusModal = (incident) => {
    setSelectedIncident(incident);
    setNewStatus(incident.status);
    setShowStatusModal(true);
  };

  // Handle incident deletion
  const handleDeleteIncident = async () => {
    if (!selectedIncident) return;
    
    try {
      await dispatch(deleteIncident(selectedIncident._id)).unwrap();
      toast.success('Incident deleted successfully');
      setShowDeleteModal(false);
      setSelectedIncident(null);
    } catch (err) {
      toast.error(`Failed to delete incident: ${err.message || 'Unknown error'}`);
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (incident) => {
    setSelectedIncident(incident);
    setShowDeleteModal(true);
  };

  // Navigate to edit incident page
  const handleEditIncident = (id) => {
    navigate(`/incidents/${id}/edit`);
  };

  // Check if user has permission to edit/delete incidents
  const canManageIncidents = useCallback(() => {
    return user && (user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.TECHNICIAN);
  }, [user]);

  // Check if user has permission to change status
  const canChangeStatus = useCallback(() => {
    return user && (user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.TECHNICIAN);
  }, [user]);

  // Table columns configuration
  const columns = [
    {
      header: 'ID',
      accessor: '_id',
      cell: (value) => <span>{value.substring(0, 8)}...</span>,
      width: '10%'
    },
    {
      header: 'Title',
      accessor: 'title',
      width: '20%'
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (value) => <IncidentStatusBadge status={value} />,
      width: '10%'
    },
    {
      header: 'Priority',
      accessor: 'priority',
      cell: (value) => (
        <span style={{ 
          color: INCIDENT_PRIORITIES[value]?.color || '#718096',
          fontWeight: 'bold'
        }}>
          {value}
        </span>
      ),
      width: '10%'
    },
    {
      header: 'Reported By',
      accessor: 'reportedBy',
      cell: (value) => value?.name || 'Unknown',
      width: '15%'
    },
    {
      header: 'Created',
      accessor: 'createdAt',
      cell: (value) => formatDateTime(value),
      width: '15%'
    },
    {
      header: 'Actions',
      accessor: '_id',
      cell: (value, row) => (
        <ActionsCell>
          <ActionButton 
            title="View details"
            onClick={() => handleViewIncident(value)}
            color="#3182ce"
          >
            <FaEye />
          </ActionButton>
          
          {canManageIncidents() && (
            <>
              <ActionButton 
                title="Edit incident"
                onClick={() => handleEditIncident(value)}
                color="#38a169"
              >
                <FaEdit />
              </ActionButton>
              
              {canChangeStatus() && (
                <ActionButton 
                  title="Change status"
                  onClick={() => openStatusModal(row)}
                  color="#805ad5"
                >
                  <FaEllipsisV />
                </ActionButton>
              )}
              
              <ActionButton 
                title="Delete incident"
                onClick={() => openDeleteModal(row)}
                color="#e53e3e"
              >
                <FaTrash />
              </ActionButton>
            </>
          )}
        </ActionsCell>
      ),
      width: '20%'
    }
  ];

  return (
    <Layout>
      <PageHeader>
        <PageTitle>Incidents</PageTitle>
        <Button 
          variant="primary" 
          onClick={handleCreateIncident}
          leftIcon={<FaPlus />}
        >
          Create Incident
        </Button>
      </PageHeader>

      <Card>
        <SearchContainer>
          <SearchForm onSubmit={handleSearch}>
            <SearchInput
              type="text"
              placeholder="Search incidents..."
              value={searchTerm}
              onChange={handleSearchChange}
              leftIcon={<FaSearch />}
            />
            <Button type="submit" variant="secondary">Search</Button>
          </SearchForm>
          
          <ActionButtons>
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<FaFilter />}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                handleFilterReset();
              }}
              leftIcon={<FaSync />}
              title="Reset all filters"
            >
              Reset
            </Button>
          </ActionButtons>
        </SearchContainer>

        {showFilters && (
          <FilterContainer>
            <IncidentFilter 
              filters={filters} 
              onFilterChange={handleFilterChange}
              onReset={handleFilterReset}
            />
          </FilterContainer>
        )}

        {error && (
          <Alert 
            type="error" 
            message={`Error loading incidents: ${error}`} 
            style={{ marginBottom: '1rem' }}
          />
        )}

        {loading ? (
          <Loader size="large" center />
        ) : incidents.length === 0 ? (
          <NoDataContainer>
            <FaSearch size={48} color="#cbd5e0" />
            <NoDataText>
              No incidents found. {searchTerm || Object.values(filters).some(v => v) ? 
                'Try adjusting your search or filters.' : 
                'Create a new incident to get started.'}
            </NoDataText>
            <Button 
              variant="primary" 
              onClick={handleCreateIncident}
              leftIcon={<FaPlus />}
              style={{ marginTop: '1rem' }}
            >
              Create Incident
            </Button>
          </NoDataContainer>
        ) : (
          <>
            <Table 
              columns={columns} 
              data={incidents} 
              onRowClick={(row) => handleViewIncident(row._id)}
              hoverable
              responsive
            />
            
            <Pagination 
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              limit={limit}
              onLimitChange={handleLimitChange}
              totalItems={totalItems}
            />
          </>
        )}
      </Card>

      {/* Status Change Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Update Incident Status"
      >
        <p>
          Update status for incident: <strong>{selectedIncident?.title}</strong>
        </p>
        <div style={{ margin: '1rem 0' }}>
          <label htmlFor="status-select">New Status:</label>
          <StatusSelect
            id="status-select"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
          >
            {Object.keys(INCIDENT_STATUSES).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </StatusSelect>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <Button variant="outline" onClick={() => setShowStatusModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleStatusChange}>
            Update Status
          </Button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Incident"
      >
        <p>
          Are you sure you want to delete incident: <strong>{selectedIncident?.title}</strong>?
        </p>
        <p>This action cannot be undone.</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
          <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteIncident}>
            Delete
          </Button>
        </div>
      </Modal>
    </Layout>
  );
};

export default IncidentsPage;