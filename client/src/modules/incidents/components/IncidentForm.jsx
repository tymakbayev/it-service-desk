import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { format } from 'date-fns';

// Components
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Alert from '../../../components/common/Alert';
import Loader from '../../../components/common/Loader';

// Redux actions
import { createIncident, updateIncident, getIncidentById } from '../store/incidentsSlice';

// Utils and constants
import { INCIDENT_PRIORITIES, INCIDENT_STATUSES } from '../../../utils/constants';
import { useAuth } from '../../../hooks/useAuth';

/**
 * IncidentForm component for creating and editing incidents
 * Supports both creation of new incidents and editing existing ones
 */
const IncidentForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Get equipment list for the dropdown
  const { equipment } = useSelector((state) => state.equipment);
  
  // Get technicians list for assignment (only for admin and technician roles)
  const { technicians } = useSelector((state) => state.auth);
  
  // Get current incident if in edit mode
  const { currentIncident, loading } = useSelector((state) => state.incidents);

  // Initial form values
  const initialValues = {
    title: '',
    description: '',
    priority: INCIDENT_PRIORITIES.MEDIUM,
    status: INCIDENT_STATUSES.NEW,
    equipmentId: '',
    assignedTo: '',
    attachments: [],
    dueDate: format(new Date(Date.now() + 86400000 * 3), 'yyyy-MM-dd'), // Default due date is 3 days from now
  };

  // Validation schema
  const validationSchema = Yup.object({
    title: Yup.string()
      .required('Title is required')
      .min(5, 'Title must be at least 5 characters')
      .max(100, 'Title must be less than 100 characters'),
    description: Yup.string()
      .required('Description is required')
      .min(10, 'Description must be at least 10 characters')
      .max(1000, 'Description must be less than 1000 characters'),
    priority: Yup.string()
      .required('Priority is required')
      .oneOf(Object.values(INCIDENT_PRIORITIES), 'Invalid priority'),
    status: Yup.string()
      .required('Status is required')
      .oneOf(Object.values(INCIDENT_STATUSES), 'Invalid status'),
    equipmentId: Yup.string()
      .nullable(),
    assignedTo: Yup.string()
      .nullable(),
    dueDate: Yup.date()
      .required('Due date is required')
      .min(new Date(), 'Due date cannot be in the past'),
  });

  // Load incident data if in edit mode
  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      dispatch(getIncidentById(id));
    }
  }, [id, dispatch]);

  // Set form values when incident data is loaded in edit mode
  useEffect(() => {
    if (isEditMode && currentIncident && !loading) {
      // Form values will be set via the initialValues prop in Formik
    }
  }, [isEditMode, currentIncident, loading]);

  // Handle form submission
  const handleSubmit = async (values, { resetForm }) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Prepare form data for file uploads
      const formData = new FormData();
      
      // Add all form fields to formData
      Object.keys(values).forEach(key => {
        if (key !== 'attachments') {
          formData.append(key, values[key]);
        }
      });
      
      // Add attachments if any
      if (values.attachments && values.attachments.length > 0) {
        Array.from(values.attachments).forEach(file => {
          formData.append('attachments', file);
        });
      }
      
      // Dispatch action based on mode (create or update)
      if (isEditMode) {
        await dispatch(updateIncident({ id, formData })).unwrap();
        setSuccess('Incident updated successfully');
      } else {
        await dispatch(createIncident(formData)).unwrap();
        setSuccess('Incident created successfully');
        resetForm();
      }
      
      // Redirect after a short delay to show success message
      setTimeout(() => {
        navigate('/incidents');
      }, 2000);
    } catch (err) {
      setError(err.message || 'An error occurred while saving the incident');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle file change
  const handleFileChange = (event, setFieldValue) => {
    setFieldValue('attachments', event.currentTarget.files);
  };

  // Show loader while fetching incident data in edit mode
  if (isEditMode && loading) {
    return <Loader />;
  }

  return (
    <div className="incident-form-container">
      <h2 className="form-title">{isEditMode ? 'Edit Incident' : 'Create New Incident'}</h2>
      
      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}
      
      <Formik
        initialValues={isEditMode && currentIncident ? {
          title: currentIncident.title || '',
          description: currentIncident.description || '',
          priority: currentIncident.priority || INCIDENT_PRIORITIES.MEDIUM,
          status: currentIncident.status || INCIDENT_STATUSES.NEW,
          equipmentId: currentIncident.equipmentId || '',
          assignedTo: currentIncident.assignedTo?._id || '',
          dueDate: currentIncident.dueDate ? format(new Date(currentIncident.dueDate), 'yyyy-MM-dd') : '',
          attachments: []
        } : initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ setFieldValue, values, errors, touched }) => (
          <Form className="incident-form">
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <Field
                as={Input}
                id="title"
                name="title"
                type="text"
                placeholder="Enter incident title"
              />
              <ErrorMessage name="title" component="div" className="error-message" />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <Field
                as="textarea"
                id="description"
                name="description"
                rows="5"
                placeholder="Describe the incident in detail"
                className={`form-textarea ${errors.description && touched.description ? 'error' : ''}`}
              />
              <ErrorMessage name="description" component="div" className="error-message" />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="priority">Priority</label>
                <Field
                  as="select"
                  id="priority"
                  name="priority"
                  className={`form-select ${errors.priority && touched.priority ? 'error' : ''}`}
                >
                  {Object.values(INCIDENT_PRIORITIES).map(priority => (
                    <option key={priority} value={priority}>
                      {priority.charAt(0) + priority.slice(1).toLowerCase()}
                    </option>
                  ))}
                </Field>
                <ErrorMessage name="priority" component="div" className="error-message" />
              </div>
              
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <Field
                  as="select"
                  id="status"
                  name="status"
                  className={`form-select ${errors.status && touched.status ? 'error' : ''}`}
                  disabled={user.role === 'USER' && isEditMode}
                >
                  {Object.values(INCIDENT_STATUSES).map(status => (
                    <option key={status} value={status}>
                      {status.replace(/_/g, ' ').charAt(0) + status.replace(/_/g, ' ').slice(1).toLowerCase()}
                    </option>
                  ))}
                </Field>
                <ErrorMessage name="status" component="div" className="error-message" />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="equipmentId">Related Equipment</label>
                <Field
                  as="select"
                  id="equipmentId"
                  name="equipmentId"
                  className={`form-select ${errors.equipmentId && touched.equipmentId ? 'error' : ''}`}
                >
                  <option value="">-- Select Equipment (Optional) --</option>
                  {equipment && equipment.map(item => (
                    <option key={item._id} value={item._id}>
                      {item.name} - {item.serialNumber}
                    </option>
                  ))}
                </Field>
                <ErrorMessage name="equipmentId" component="div" className="error-message" />
              </div>
              
              {(user.role === 'ADMIN' || user.role === 'TECHNICIAN') && (
                <div className="form-group">
                  <label htmlFor="assignedTo">Assign To</label>
                  <Field
                    as="select"
                    id="assignedTo"
                    name="assignedTo"
                    className={`form-select ${errors.assignedTo && touched.assignedTo ? 'error' : ''}`}
                  >
                    <option value="">-- Unassigned --</option>
                    {technicians && technicians.map(tech => (
                      <option key={tech._id} value={tech._id}>
                        {tech.firstName} {tech.lastName} ({tech.email})
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="assignedTo" component="div" className="error-message" />
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="dueDate">Due Date</label>
              <Field
                as={Input}
                id="dueDate"
                name="dueDate"
                type="date"
                min={format(new Date(), 'yyyy-MM-dd')}
              />
              <ErrorMessage name="dueDate" component="div" className="error-message" />
            </div>
            
            <div className="form-group">
              <label htmlFor="attachments">Attachments</label>
              <input
                id="attachments"
                name="attachments"
                type="file"
                multiple
                onChange={(event) => handleFileChange(event, setFieldValue)}
                className="form-file-input"
              />
              <small className="form-text text-muted">
                Allowed file types: .jpg, .jpeg, .png, .pdf, .doc, .docx (Max size: 5MB per file)
              </small>
            </div>
            
            {isEditMode && currentIncident && currentIncident.attachments && currentIncident.attachments.length > 0 && (
              <div className="form-group">
                <label>Current Attachments</label>
                <ul className="attachment-list">
                  {currentIncident.attachments.map((attachment, index) => (
                    <li key={index} className="attachment-item">
                      <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                        {attachment.filename}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="form-actions">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/incidents')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  isEditMode ? 'Update Incident' : 'Create Incident'
                )}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default IncidentForm;