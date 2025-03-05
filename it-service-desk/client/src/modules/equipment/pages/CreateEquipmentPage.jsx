import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { createEquipment } from '../store/equipmentSlice';
import { Card, Button, Input, Alert, Loader } from '../../../components/common';
import { useAuth } from '../../../hooks/useAuth';
import { ROLES, EQUIPMENT_STATUS, EQUIPMENT_TYPES } from '../../../utils/constants';

/**
 * Create Equipment Page Component
 * 
 * Allows authorized users to create new equipment entries in the system.
 * Includes form validation, error handling, and success feedback.
 */
const CreateEquipmentPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  
  // Local state
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState('info');
  
  // Redux state
  const { loading, error } = useSelector((state) => state.equipment);

  // Check if user has permission to create equipment
  useEffect(() => {
    if (user && !(user.role === ROLES.ADMIN || user.role === ROLES.TECHNICIAN)) {
      setAlertMessage('You do not have permission to create equipment');
      setAlertType('error');
      
      // Redirect after showing error
      const timer = setTimeout(() => {
        navigate('/equipment');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [user, navigate]);

  // Initial form values
  const initialValues = {
    name: '',
    type: '',
    serialNumber: '',
    model: '',
    manufacturer: '',
    purchaseDate: '',
    warrantyExpiration: '',
    location: '',
    assignedTo: '',
    status: EQUIPMENT_STATUS.AVAILABLE,
    notes: '',
    specifications: ''
  };

  // Form validation schema
  const validationSchema = Yup.object({
    name: Yup.string()
      .required('Name is required')
      .max(100, 'Name must be at most 100 characters'),
    type: Yup.string()
      .required('Type is required')
      .oneOf(Object.values(EQUIPMENT_TYPES), 'Invalid equipment type'),
    serialNumber: Yup.string()
      .required('Serial number is required')
      .max(50, 'Serial number must be at most 50 characters'),
    model: Yup.string()
      .required('Model is required')
      .max(100, 'Model must be at most 100 characters'),
    manufacturer: Yup.string()
      .required('Manufacturer is required')
      .max(100, 'Manufacturer must be at most 100 characters'),
    purchaseDate: Yup.date()
      .required('Purchase date is required')
      .max(new Date(), 'Purchase date cannot be in the future'),
    warrantyExpiration: Yup.date()
      .min(Yup.ref('purchaseDate'), 'Warranty expiration must be after purchase date'),
    location: Yup.string()
      .required('Location is required')
      .max(100, 'Location must be at most 100 characters'),
    assignedTo: Yup.string()
      .max(100, 'Assigned to must be at most 100 characters'),
    status: Yup.string()
      .required('Status is required')
      .oneOf(Object.values(EQUIPMENT_STATUS), 'Invalid status'),
    notes: Yup.string()
      .max(500, 'Notes must be at most 500 characters'),
    specifications: Yup.string()
      .max(1000, 'Specifications must be at most 1000 characters')
  });

  /**
   * Handle form submission
   * @param {Object} values - Form values
   * @param {Object} actions - Formik actions
   */
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await dispatch(createEquipment(values)).unwrap();
      setAlertMessage('Equipment created successfully');
      setAlertType('success');
      resetForm();
      
      // Redirect to equipment list after successful creation
      setTimeout(() => {
        navigate('/equipment');
      }, 2000);
    } catch (err) {
      setAlertMessage(`Failed to create equipment: ${err.message}`);
      setAlertType('error');
      setSubmitting(false);
    }
  };

  /**
   * Navigate back to equipment list
   */
  const handleCancel = () => {
    navigate('/equipment');
  };

  /**
   * Close alert message
   */
  const handleCloseAlert = () => {
    setAlertMessage(null);
  };

  // If user doesn't have permission, show only the alert
  if (user && !(user.role === ROLES.ADMIN || user.role === ROLES.TECHNICIAN)) {
    return (
      <div className="create-equipment-page">
        {alertMessage && (
          <Alert 
            type={alertType} 
            message={alertMessage} 
            onClose={handleCloseAlert} 
          />
        )}
      </div>
    );
  }

  return (
    <div className="create-equipment-page">
      <div className="page-header">
        <h1>Create New Equipment</h1>
      </div>

      {alertMessage && (
        <Alert 
          type={alertType} 
          message={alertMessage} 
          onClose={handleCloseAlert} 
        />
      )}

      <Card>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched, values, setFieldValue }) => (
            <Form className="equipment-form">
              {loading && <Loader />}

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Name *</label>
                  <Field
                    as={Input}
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Enter equipment name"
                    error={touched.name && errors.name}
                  />
                  <ErrorMessage name="name" component="div" className="error-message" />
                </div>

                <div className="form-group">
                  <label htmlFor="type">Type *</label>
                  <Field
                    as="select"
                    id="type"
                    name="type"
                    className={`form-select ${touched.type && errors.type ? 'is-invalid' : ''}`}
                  >
                    <option value="">Select equipment type</option>
                    {Object.values(EQUIPMENT_TYPES).map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="type" component="div" className="error-message" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="serialNumber">Serial Number *</label>
                  <Field
                    as={Input}
                    type="text"
                    id="serialNumber"
                    name="serialNumber"
                    placeholder="Enter serial number"
                    error={touched.serialNumber && errors.serialNumber}
                  />
                  <ErrorMessage name="serialNumber" component="div" className="error-message" />
                </div>

                <div className="form-group">
                  <label htmlFor="model">Model *</label>
                  <Field
                    as={Input}
                    type="text"
                    id="model"
                    name="model"
                    placeholder="Enter model"
                    error={touched.model && errors.model}
                  />
                  <ErrorMessage name="model" component="div" className="error-message" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="manufacturer">Manufacturer *</label>
                  <Field
                    as={Input}
                    type="text"
                    id="manufacturer"
                    name="manufacturer"
                    placeholder="Enter manufacturer"
                    error={touched.manufacturer && errors.manufacturer}
                  />
                  <ErrorMessage name="manufacturer" component="div" className="error-message" />
                </div>

                <div className="form-group">
                  <label htmlFor="location">Location *</label>
                  <Field
                    as={Input}
                    type="text"
                    id="location"
                    name="location"
                    placeholder="Enter location"
                    error={touched.location && errors.location}
                  />
                  <ErrorMessage name="location" component="div" className="error-message" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="purchaseDate">Purchase Date *</label>
                  <Field
                    as={Input}
                    type="date"
                    id="purchaseDate"
                    name="purchaseDate"
                    error={touched.purchaseDate && errors.purchaseDate}
                  />
                  <ErrorMessage name="purchaseDate" component="div" className="error-message" />
                </div>

                <div className="form-group">
                  <label htmlFor="warrantyExpiration">Warranty Expiration</label>
                  <Field
                    as={Input}
                    type="date"
                    id="warrantyExpiration"
                    name="warrantyExpiration"
                    error={touched.warrantyExpiration && errors.warrantyExpiration}
                  />
                  <ErrorMessage name="warrantyExpiration" component="div" className="error-message" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="assignedTo">Assigned To</label>
                  <Field
                    as={Input}
                    type="text"
                    id="assignedTo"
                    name="assignedTo"
                    placeholder="Enter user or department"
                    error={touched.assignedTo && errors.assignedTo}
                  />
                  <ErrorMessage name="assignedTo" component="div" className="error-message" />
                </div>

                <div className="form-group">
                  <label htmlFor="status">Status *</label>
                  <Field
                    as="select"
                    id="status"
                    name="status"
                    className={`form-select ${touched.status && errors.status ? 'is-invalid' : ''}`}
                  >
                    {Object.values(EQUIPMENT_STATUS).map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="status" component="div" className="error-message" />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="specifications">Specifications</label>
                <Field
                  as="textarea"
                  id="specifications"
                  name="specifications"
                  rows="4"
                  placeholder="Enter technical specifications"
                  className={`form-textarea ${touched.specifications && errors.specifications ? 'is-invalid' : ''}`}
                />
                <ErrorMessage name="specifications" component="div" className="error-message" />
              </div>

              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <Field
                  as="textarea"
                  id="notes"
                  name="notes"
                  rows="3"
                  placeholder="Enter additional notes"
                  className={`form-textarea ${touched.notes && errors.notes ? 'is-invalid' : ''}`}
                />
                <ErrorMessage name="notes" component="div" className="error-message" />
              </div>

              <div className="form-actions">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Equipment'}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Card>
    </div>
  );
};

export default CreateEquipmentPage;