import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaSort, FaEye } from 'react-icons/fa';

// Components
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';

// Hooks
import { usePagination } from '../../hooks/usePagination';

// Utils
import { formatDate } from '../../utils/dateUtils';
import { ITEMS_PER_PAGE } from '../../utils/constants';

/**
 * ExampleList Component
 * 
 * This component displays a list of example items with filtering, sorting, and pagination.
 * It demonstrates patterns that can be reused across the application for list views.
 */
const ExampleList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Get query parameters from URL
  const queryParams = new URLSearchParams(location.search);
  const initialPage = parseInt(queryParams.get('page') || '1', 10);
  const initialSearch = queryParams.get('search') || '';
  const initialSortField = queryParams.get('sortField') || 'createdAt';
  const initialSortDirection = queryParams.get('sortDirection') || 'desc';

  // Local state
  const [search, setSearch] = useState(initialSearch);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [sortField, setSortField] = useState(initialSortField);
  const [sortDirection, setSortDirection] = useState(initialSortDirection);
  const [filters, setFilters] = useState({
    status: queryParams.get('status') || '',
    priority: queryParams.get('priority') || '',
    category: queryParams.get('category') || '',
    dateFrom: queryParams.get('dateFrom') || '',
    dateTo: queryParams.get('dateTo') || '',
  });
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  // Redux state
  const { items, loading, error, totalItems } = useSelector(state => state.example);

  // Custom pagination hook
  const { 
    currentPage, 
    totalPages, 
    handlePageChange, 
    setCurrentPage 
  } = usePagination(totalItems, ITEMS_PER_PAGE, initialPage);

  // Fetch data on component mount and when dependencies change
  useEffect(() => {
    const fetchParams = {
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      search,
      sortField,
      sortDirection,
      ...filters
    };
    
    // Dispatch action to fetch data
    dispatch(fetchExamples(fetchParams));
    
    // Update URL with query parameters
    const params = new URLSearchParams();
    params.set('page', currentPage.toString());
    if (search) params.set('search', search);
    params.set('sortField', sortField);
    params.set('sortDirection', sortDirection);
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  }, [dispatch, currentPage, search, sortField, sortDirection, filters]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when search is submitted
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Reset all filters
  const handleResetFilters = () => {
    setFilters({
      status: '',
      priority: '',
      category: '',
      dateFrom: '',
      dateTo: '',
    });
    setSearch('');
    setCurrentPage(1);
  };

  // Handle sort change
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to descending for new field
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1); // Reset to first page when sort changes
  };

  // Open delete confirmation modal
  const openDeleteModal = (item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setItemToDelete(null);
    setIsDeleteModalOpen(false);
  };

  // Handle item deletion
  const handleDeleteItem = () => {
    if (itemToDelete) {
      dispatch(deleteExample(itemToDelete.id))
        .unwrap()
        .then(() => {
          closeDeleteModal();
          // Refresh the list
          dispatch(fetchExamples({
            page: currentPage,
            limit: ITEMS_PER_PAGE,
            search,
            sortField,
            sortDirection,
            ...filters
          }));
        })
        .catch(error => {
          console.error('Failed to delete item:', error);
        });
    }
  };

  // Table columns configuration
  const columns = useMemo(() => [
    {
      header: 'ID',
      accessor: 'id',
      sortable: true,
      cell: (row) => <span className="text-gray-700 font-medium">{row.id}</span>
    },
    {
      header: 'Title',
      accessor: 'title',
      sortable: true,
      cell: (row) => (
        <Link 
          to={`/examples/${row.id}`}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          {row.title}
        </Link>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      cell: (row) => {
        const statusColors = {
          active: 'bg-green-100 text-green-800',
          pending: 'bg-yellow-100 text-yellow-800',
          inactive: 'bg-red-100 text-red-800',
        };
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[row.status] || 'bg-gray-100 text-gray-800'}`}>
            {row.status}
          </span>
        );
      }
    },
    {
      header: 'Category',
      accessor: 'category',
      sortable: true,
    },
    {
      header: 'Priority',
      accessor: 'priority',
      sortable: true,
      cell: (row) => {
        const priorityColors = {
          high: 'bg-red-100 text-red-800',
          medium: 'bg-yellow-100 text-yellow-800',
          low: 'bg-blue-100 text-blue-800',
        };
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[row.priority] || 'bg-gray-100 text-gray-800'}`}>
            {row.priority}
          </span>
        );
      }
    },
    {
      header: 'Created At',
      accessor: 'createdAt',
      sortable: true,
      cell: (row) => formatDate(row.createdAt, 'dd MMM yyyy HH:mm')
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex space-x-2">
          <Button
            variant="icon"
            onClick={() => navigate(`/examples/${row.id}`)}
            title="View details"
          >
            <FaEye className="text-blue-600" />
          </Button>
          <Button
            variant="icon"
            onClick={() => navigate(`/examples/edit/${row.id}`)}
            title="Edit"
          >
            <FaEdit className="text-yellow-600" />
          </Button>
          <Button
            variant="icon"
            onClick={() => openDeleteModal(row)}
            title="Delete"
          >
            <FaTrash className="text-red-600" />
          </Button>
        </div>
      )
    }
  ], [navigate]);

  // Render loading state
  if (loading && !items.length) {
    return <Loader />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Examples</h1>
        <Button
          variant="primary"
          onClick={() => navigate('/examples/create')}
          className="flex items-center"
        >
          <FaPlus className="mr-2" /> Create New
        </Button>
      </div>

      {error && (
        <Alert 
          type="error" 
          message={error} 
          className="mb-4"
          onClose={() => dispatch(clearExampleErrors())}
        />
      )}

      <Card className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          {/* Search form */}
          <form onSubmit={handleSearchSubmit} className="w-full md:w-auto">
            <div className="flex">
              <Input
                type="text"
                placeholder="Search examples..."
                value={search}
                onChange={handleSearchChange}
                className="rounded-r-none"
              />
              <Button
                type="submit"
                variant="primary"
                className="rounded-l-none"
              >
                <FaSearch />
              </Button>
            </div>
          </form>

          {/* Filter toggle button */}
          <Button
            variant="secondary"
            onClick={() => setIsFilterVisible(!isFilterVisible)}
            className="flex items-center"
          >
            <FaFilter className="mr-2" /> {isFilterVisible ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>

        {/* Filters section */}
        {isFilterVisible && (
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <h3 className="text-lg font-medium mb-3">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  name="priority"
                  value={filters.priority}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">All Categories</option>
                  <option value="hardware">Hardware</option>
                  <option value="software">Software</option>
                  <option value="network">Network</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                <Input
                  type="date"
                  name="dateFrom"
                  value={filters.dateFrom}
                  onChange={handleFilterChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                <Input
                  type="date"
                  name="dateTo"
                  value={filters.dateTo}
                  onChange={handleFilterChange}
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                variant="secondary"
                onClick={handleResetFilters}
                className="mr-2"
              >
                Reset Filters
              </Button>
              <Button
                variant="primary"
                onClick={() => setCurrentPage(1)}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        )}

        {/* Results count */}
        <div className="text-sm text-gray-600 mb-4">
          Showing {items.length} of {totalItems} results
        </div>

        {/* Table */}
        {items.length > 0 ? (
          <Table
            columns={columns}
            data={items}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No examples found</p>
            {(search || Object.values(filters).some(v => v)) && (
              <Button
                variant="link"
                onClick={handleResetFilters}
                className="mt-2"
              >
                Clear filters
              </Button>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </Card>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        title="Confirm Deletion"
      >
        <div className="p-6">
          <p className="mb-4">
            Are you sure you want to delete "{itemToDelete?.title}"? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={closeDeleteModal}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteItem}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ExampleList;