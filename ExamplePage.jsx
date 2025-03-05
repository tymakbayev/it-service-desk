import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaSort, FaEye, FaDownload } from 'react-icons/fa';

// Components
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Table from '../../components/common/Table';
import Loader from '../../components/common/Loader';
import Pagination from '../../components/common/Pagination';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import ExampleForm from './ExampleForm';

// Hooks
import { usePagination } from '../../hooks/usePagination';

// Utils
import { formatDate } from '../../utils/dateUtils';
import { formatStatus } from '../../utils/formatters';
import { ITEMS_PER_PAGE, EXAMPLE_STATUSES } from '../../utils/constants';

// Redux actions
import { 
  fetchExamples, 
  deleteExample, 
  resetExampleState 
} from '../../modules/example/store/exampleSlice';

/**
 * ExamplePage component
 * 
 * This page displays a list of examples with filtering, sorting, and pagination.
 * Users can create, edit, view details, and delete examples.
 */
const ExamplePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Get example data from Redux store
  const { 
    examples, 
    totalItems, 
    loading, 
    error 
  } = useSelector((state) => state.example);

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedExample, setSelectedExample] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Get query params from URL
  const queryParams = new URLSearchParams(location.search);
  const initialPage = parseInt(queryParams.get('page')) || 1;

  // Initialize pagination
  const { 
    currentPage, 
    setCurrentPage, 
    pageCount 
  } = usePagination(totalItems, ITEMS_PER_PAGE, initialPage);

  // Fetch examples when component mounts or filters change
  useEffect(() => {
    const fetchData = async () => {
      const params = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: searchTerm,
        status: statusFilter,
        sortBy: sortField,
        sortDirection: sortDirection
      };
      
      dispatch(fetchExamples(params));
      
      // Update URL with query params
      const queryParams = new URLSearchParams();
      if (currentPage > 1) queryParams.set('page', currentPage);
      if (searchTerm) queryParams.set('search', searchTerm);
      if (statusFilter) queryParams.set('status', statusFilter);
      
      const queryString = queryParams.toString();
      const newUrl = `${location.pathname}${queryString ? `?${queryString}` : ''}`;
      
      navigate(newUrl, { replace: true });
    };

    fetchData();
  }, [
    dispatch, 
    currentPage, 
    searchTerm, 
    statusFilter, 
    sortField, 
    sortDirection, 
    refreshTrigger,
    navigate,
    location.pathname
  ]);

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      dispatch(resetExampleState());
    };
  }, [dispatch]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Handle sort change
  const handleSortChange = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sort changes
  };

  // Handle create new example
  const handleCreateExample = () => {
    navigate('/examples/create');
  };

  // Handle view example details
  const handleViewExample = (id) => {
    navigate(`/examples/${id}`);
  };

  // Handle edit example
  const handleEditExample = (id) => {
    navigate(`/examples/${id}/edit`);
  };

  // Handle delete example confirmation
  const handleDeleteConfirm = (example) => {
    setSelectedExample(example);
    setShowDeleteModal(true);
  };

  // Handle delete example
  const handleDeleteExample = async () => {
    if (selectedExample) {
      await dispatch(deleteExample(selectedExample.id));
      setShowDeleteModal(false);
      setSelectedExample(null);
      setRefreshTrigger(prev => prev + 1); // Trigger a refresh
    }
  };

  // Handle export examples
  const handleExportExamples = () => {
    // Implementation for exporting examples to CSV/Excel
    // This would typically call an API endpoint that returns a file
    window.open('/api/examples/export', '_blank');
  };

  // Table columns configuration
  const columns = useMemo(() => [
    {
      header: 'ID',
      accessor: 'id',
      cell: (row) => <span className="text-sm font-medium">{row.id.substring(0, 8)}...</span>,
    },
    {
      header: 'Title',
      accessor: 'title',
      sortable: true,
      cell: (row) => (
        <div className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer" 
             onClick={() => handleViewExample(row.id)}>
          {row.title}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      cell: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.status === 'active' ? 'bg-green-100 text-green-800' :
          row.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          row.status === 'inactive' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {formatStatus(row.status)}
        </span>
      ),
    },
    {
      header: 'Created',
      accessor: 'createdAt',
      sortable: true,
      cell: (row) => <span>{formatDate(row.createdAt)}</span>,
    },
    {
      header: 'Updated',
      accessor: 'updatedAt',
      sortable: true,
      cell: (row) => <span>{formatDate(row.updatedAt)}</span>,
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex space-x-2">
          <button
            className="p-1 text-blue-600 hover:text-blue-800"
            onClick={() => handleViewExample(row.id)}
            title="View Details"
          >
            <FaEye size={16} />
          </button>
          <button
            className="p-1 text-green-600 hover:text-green-800"
            onClick={() => handleEditExample(row.id)}
            title="Edit"
          >
            <FaEdit size={16} />
          </button>
          <button
            className="p-1 text-red-600 hover:text-red-800"
            onClick={() => handleDeleteConfirm(row)}
            title="Delete"
          >
            <FaTrash size={16} />
          </button>
        </div>
      ),
    },
  ], []);

  // Render loading state
  if (loading && !examples.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Examples</h1>
        <div className="flex space-x-2">
          <Button
            onClick={handleExportExamples}
            variant="secondary"
            className="flex items-center"
          >
            <FaDownload className="mr-2" />
            Export
          </Button>
          <Button
            onClick={handleCreateExample}
            variant="primary"
            className="flex items-center"
          >
            <FaPlus className="mr-2" />
            Create Example
          </Button>
        </div>
      </div>

      {error && (
        <Alert type="error" className="mb-4">
          {error}
        </Alert>
      )}

      <Card className="mb-6">
        <div className="p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Search examples..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 w-full"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-48">
                <select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Statuses</option>
                  {EXAMPLE_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center">
                <FaFilter className="mr-2 text-gray-500" />
                <span className="text-sm text-gray-500">Filters</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        {examples.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">No examples found</p>
            <Button onClick={handleCreateExample} variant="primary">
              Create your first example
            </Button>
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              data={examples}
              onSort={handleSortChange}
              sortField={sortField}
              sortDirection={sortDirection}
            />
            <div className="p-4 border-t border-gray-200">
              <Pagination
                currentPage={currentPage}
                pageCount={pageCount}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Delete"
      >
        <div className="p-6">
          <p className="mb-4">
            Are you sure you want to delete the example "{selectedExample?.title}"? This action cannot be undone.
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
              onClick={handleDeleteExample}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ExamplePage;