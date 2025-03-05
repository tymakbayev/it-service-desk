import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaPlus, FaFilter, FaSearch, FaSync } from 'react-icons/fa';

// Components
import Table from '../../../components/common/Table';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Loader from '../../../components/common/Loader';
import Pagination from '../../../components/common/Pagination';
import Card from '../../../components/common/Card';
import Modal from '../../../components/common/Modal';
import IncidentStatusBadge from '../components/IncidentStatusBadge';
import IncidentFilter from '../components/IncidentFilter';

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
import { formatDate } from '../../../utils/dateUtils';
import { INCIDENT_STATUSES, INCIDENT_PRIORITIES } from '../../../utils/constants';

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
        toast.error(`Failed to load incidents: ${err.message}`);
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
        id: selectedIncident.id,
        status: newStatus
      })).unwrap();
      
      toast.success(`Incident status updated to ${newStatus}`);
      setShowStatusModal(false);
      setSelectedIncident(null);
      setNewStatus('');
    } catch (err) {
      toast.error(`Failed to update status: ${err.message}`);
    }
  };

  // Open status change modal
  const openStatusModal = (incident) => {
    setSelectedIncident(incident);
    setNewStatus(incident.status);
    setShowStatusModal(true);
  };

  // Open delete confirmation modal
  const openDeleteModal = (incident) => {
    setSelectedIncident(incident);
    setShowDeleteModal(true);
  };

  // Handle incident deletion
  const handleDeleteIncident = async () => {
    if (!selectedIncident) return;
    
    try {
      await dispatch(deleteIncident(selectedIncident.id)).unwrap();
      toast.success('Incident deleted successfully');
      setShowDeleteModal(false);
      setSelectedIncident(null);
    } catch (err) {
      toast.error(`Failed to delete incident: ${err.message}`);
    }
  };

  // Refresh incidents data
  const handleRefresh = () => {
    dispatch(fetchIncidents({ 
      page, 
      limit, 
      search: searchTerm,
      ...filters
    }));
  };

  // Check if user can perform actions based on role
  const canChangeStatus = useCallback((incident) => {
    if (!user) return false;
    
    // Admins can change any incident status
    if (user.role === 'ADMIN') return true;
    
    // Technicians can change status of incidents assigned to them
    if (user.role === 'TECHNICIAN' && incident.assignedTo === user.id) return true;
    
    // Users can only change status of their own incidents in certain conditions
    if (user.role === 'USER' && incident.createdBy === user.id) {
      // Users can only cancel their incidents if they're in NEW status
      return incident.status === 'NEW';
    }
    
    return false;
  }, [user]);

  const canDelete = useCallback((incident) => {
    if (!user) return false;
    
    // Only admins can delete incidents
    if (user.role === 'ADMIN') return true;
    
    // Users can delete their own incidents only if they're in NEW status
    if (user.role === 'USER' && incident.createdBy === user.id && incident.status === 'NEW') {
      return true;
    }
    
    return false;
  }, [user]);

  // Table columns configuration
  const columns = [
    {
      header: 'ID',
      accessor: 'ticketNumber',
      cell: (row) => <span className="font-medium">{row.ticketNumber}</span>
    },
    {
      header: 'Title',
      accessor: 'title',
      cell: (row) => (
        <div className="max-w-xs truncate">
          <span className="cursor-pointer hover:text-blue-600" onClick={() => handleViewIncident(row.id)}>
            {row.title}
          </span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => <IncidentStatusBadge status={row.status} />
    },
    {
      header: 'Priority',
      accessor: 'priority',
      cell: (row) => {
        const priorityColors = {
          LOW: 'bg-green-100 text-green-800',
          MEDIUM: 'bg-blue-100 text-blue-800',
          HIGH: 'bg-orange-100 text-orange-800',
          CRITICAL: 'bg-red-100 text-red-800'
        };
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[row.priority]}`}>
            {row.priority}
          </span>
        );
      }
    },
    {
      header: 'Created',
      accessor: 'createdAt',
      cell: (row) => formatDate(row.createdAt)
    },
    {
      header: 'Assigned To',
      accessor: 'assignedTo',
      cell: (row) => row.assignedToUser ? row.assignedToUser.username : 'Unassigned'
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex space-x-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleViewIncident(row.id)}
          >
            View
          </Button>
          
          {canChangeStatus(row) && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => openStatusModal(row)}
            >
              Change Status
            </Button>
          )}
          
          {canDelete(row) && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => openDeleteModal(row)}
            >
              Delete
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Incidents Management</h1>
        
        <div className="flex space-x-2">
          <Button
            variant="primary"
            onClick={handleCreateIncident}
            icon={<FaPlus />}
          >
            Create Incident
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            icon={<FaFilter />}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleRefresh}
            icon={<FaSync />}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <div className="p-4">
          <form onSubmit={handleSearch} className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Search incidents..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="flex-grow"
              icon={<FaSearch className="text-gray-400" />}
            />
            <Button type="submit" variant="primary">
              Search
            </Button>
          </form>
        </div>
        
        {showFilters && (
          <div className="border-t border-gray-200 p-4">
            <IncidentFilter 
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleFilterReset}
            />
          </div>
        )}
      </Card>

      {loading && <Loader />}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {!loading && !error && incidents.length === 0 && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <p>No incidents found. Try adjusting your search or filters.</p>
        </div>
      )}
      
      {!loading && !error && incidents.length > 0 && (
        <>
          <Table
            columns={columns}
            data={incidents}
            className="mb-4"
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

      {/* Status Change Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Change Incident Status"
      >
        <div className="p-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Current Status
            </label>
            <div className="py-2">
              {selectedIncident && (
                <IncidentStatusBadge status={selectedIncident.status} />
              )}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              New Status
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="">Select Status</option>
              {Object.values(INCIDENT_STATUSES).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => setShowStatusModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleStatusChange}
              disabled={!newStatus || (selectedIncident && newStatus === selectedIncident.status)}
            >
              Update Status
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Incident"
      >
        <div className="p-4">
          <p className="mb-4">
            Are you sure you want to delete incident{' '}
            <span className="font-bold">
              {selectedIncident?.ticketNumber}: {selectedIncident?.title}
            </span>
            ? This action cannot be undone.
          </p>
          
          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteIncident}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default IncidentsPage;