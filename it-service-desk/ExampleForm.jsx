import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

// Components
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';

// Styles
import styled from 'styled-components';

const FormContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
`;

const ErrorMessage = styled.div`
  color: #d32f2f;
  font-size: 0.8rem;
  margin-top: 4px;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
`;

const FormTitle = styled.h2`
  margin-bottom: 24px;
  color: #2c3e50;
  font-weight: 600;
`;

/**
 * Example Form Component
 * 
 * This is a reusable form component that demonstrates form handling with Formik,
 * validation with Yup, and integration with Redux for state management.
 * It can be used as a template for creating new forms in the application.
 */
const ExampleForm = ({ isEditing = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Example of loading state and error handling from Redux store
  const { loading, error, currentItem } = useSelector(state => state.example);
  
  const [submitError, setSubmitError] = useState(null);

  // Validation schema using Yup
  const validationSchema = Yup.object({
    title: Yup.string()
      .required('Title is required')
      .min(3, 'Title must be at least 3 characters')
      .max(100, 'Title must be less than 100 characters'),
    description: Yup.string()
      .required('Description is required')
      .min(10, 'Description must be at least 10 characters')
      .max(500, 'Description must be less than 500 characters'),
    category: Yup.string()
      .required('Category is required')
      .oneOf(['hardware', 'software', 'network', 'other'], 'Invalid category'),
    priority: Yup.string()
      .required('Priority is required')
      .oneOf(['low', 'medium', 'high', 'critical'], 'Invalid priority'),
    status: Yup.string()
      .required('Status is required')
      .oneOf(['open', 'in-progress', 'resolved', 'closed'], 'Invalid status'),
    assignedTo: Yup.string()
      .nullable()
      .uuid('Invalid user ID format'),
    dueDate: Yup.date()
      .nullable()
      .min(new Date(), 'Due date cannot be in the past')
  });

  // Initialize formik
  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      category: '',
      priority: 'medium',
      status: 'open',
      assignedTo: null,
      dueDate: null
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setSubmitError(null);
        
        if (isEditing && id) {
          // Example of dispatching an update action
          // await dispatch(updateItem({ id, ...values })).unwrap();
          console.log('Updating item:', { id, ...values });
        } else {
          // Example of dispatching a create action
          // await dispatch(createItem(values)).unwrap();
          console.log('Creating new item:', values);
        }
        
        // Navigate back after successful submission
        navigate(-1);
      } catch (err) {
        setSubmitError(err.message || 'An error occurred while submitting the form');
      }
    },
  });

  // Load data if editing an existing item
  useEffect(() => {
    if (isEditing && id) {
      // Example of dispatching a fetch action
      // dispatch(fetchItemById(id));
      console.log('Fetching item with ID:', id);
    }
  }, [isEditing, id, dispatch]);

  // Update form values when currentItem changes (for edit mode)
  useEffect(() => {
    if (isEditing && currentItem) {
      formik.setValues({
        title: currentItem.title || '',
        description: currentItem.description || '',
        category: currentItem.category || '',
        priority: currentItem.priority || 'medium',
        status: currentItem.status || 'open',
        assignedTo: currentItem.assignedTo || null,
        dueDate: currentItem.dueDate ? new Date(currentItem.dueDate) : null
      });
    }
  }, [isEditing, currentItem]);

  // Handle cancel button click
  const handleCancel = () => {
    navigate(-1);
  };

  if (loading && isEditing) {
    return <Loader />;
  }

  return (
    <FormContainer>
      <Card>
        <FormTitle>{isEditing ? 'Edit Item' : 'Create New Item'}</FormTitle>
        
        {(error || submitError) && (
          <Alert type="error" message={error || submitError} />
        )}
        
        <form onSubmit={formik.handleSubmit}>
          <FormGroup>
            <FormLabel htmlFor="title">Title</FormLabel>
            <Input
              id="title"
              name="title"
              type="text"
              placeholder="Enter title"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.title && formik.errors.title}
            />
            {formik.touched.title && formik.errors.title && (
              <ErrorMessage>{formik.errors.title}</ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <FormLabel htmlFor="description">Description</FormLabel>
            <Input
              id="description"
              name="description"
              type="textarea"
              placeholder="Enter description"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.description && formik.errors.description}
              rows={4}
            />
            {formik.touched.description && formik.errors.description && (
              <ErrorMessage>{formik.errors.description}</ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <FormLabel htmlFor="category">Category</FormLabel>
            <select
              id="category"
              name="category"
              value={formik.values.category}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={formik.touched.category && formik.errors.category ? 'error' : ''}
            >
              <option value="">Select a category</option>
              <option value="hardware">Hardware</option>
              <option value="software">Software</option>
              <option value="network">Network</option>
              <option value="other">Other</option>
            </select>
            {formik.touched.category && formik.errors.category && (
              <ErrorMessage>{formik.errors.category}</ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <FormLabel htmlFor="priority">Priority</FormLabel>
            <select
              id="priority"
              name="priority"
              value={formik.values.priority}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </FormGroup>

          <FormGroup>
            <FormLabel htmlFor="status">Status</FormLabel>
            <select
              id="status"
              name="status"
              value={formik.values.status}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </FormGroup>

          <FormGroup>
            <FormLabel htmlFor="dueDate">Due Date</FormLabel>
            <Input
              id="dueDate"
              name="dueDate"
              type="date"
              value={formik.values.dueDate ? new Date(formik.values.dueDate).toISOString().split('T')[0] : ''}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.dueDate && formik.errors.dueDate}
            />
            {formik.touched.dueDate && formik.errors.dueDate && (
              <ErrorMessage>{formik.errors.dueDate}</ErrorMessage>
            )}
          </FormGroup>

          <FormActions>
            <Button type="button" variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              disabled={loading || !formik.isValid || !formik.dirty}
            >
              {loading ? 'Submitting...' : isEditing ? 'Update' : 'Create'}
            </Button>
          </FormActions>
        </form>
      </Card>
    </FormContainer>
  );
};

export default ExampleForm;