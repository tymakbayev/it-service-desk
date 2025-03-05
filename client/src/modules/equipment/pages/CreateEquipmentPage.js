import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import styled from 'styled-components';

// Components
import { Card, Button, Input, Alert, Loader } from '../../../components/common';
import Layout from '../../../components/Layout';

// Hooks
import { useAuth } from '../../../hooks/useAuth';

// Redux actions
import { createEquipment } from '../equipmentSlice';

// Constants
import { ROLES, EQUIPMENT_STATUS, EQUIPMENT_TYPES } from '../../../utils/constants';

const PageContainer = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const FormTitle = styled.h1`
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
`;

const StyledField = styled(Field)`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
  }
`;

const StyledSelect = styled(Field)`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
  }
`;

const StyledTextArea = styled(Field)`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
  }
`;

const ErrorText = styled.div`
  color: #e53935;
  font-size: 14px;
  margin-top: 5px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
`;

/**
 * CreateEquipmentPage Component
 * 
 * This page allows administrators and technicians to add new equipment to the system.
 * It includes a form with validation for all equipment fields.
 */
const CreateEquipmentPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  
  // Local state for alerts
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
      setAlertMessage(`Failed to create equipment: ${err.message || 'Unknown error'}`);
      setAlertType('error');
      setSubmitting(false);
    }
  };

  /**
   * Handle cancel button click
   */
  const handleCancel = () => {
    navigate('/equipment');
  };

  // If user doesn't have permission, show loading until redirect happens
  if (user && !(user.role === ROLES.ADMIN || user.role === ROLES.TECHNICIAN)) {
    return (
      <Layout>
        <PageContainer>
          {alertMessage && (
            <Alert type={alertType} message={alertMessage} onClose={() => setAlertMessage(null)} />
          )}
          <Loader />
        </PageContainer>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageContainer>
        {alertMessage && (
          <Alert type={alertType} message={alertMessage} onClose={() => setAlertMessage(null)} />
        )}
        
        <Card>
          <FormTitle>Add New Equipment</FormTitle>
          
          {loading && <Loader />}
          
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form>
                <FormGroup>
                  <Label htmlFor="name">Equipment Name*</Label>
                  <StyledField
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Enter equipment name"
                  />
                  <ErrorMessage name="name" component={ErrorText} />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="type">Equipment Type*</Label>
                  <StyledSelect as="select" id="type" name="type">
                    <option value="">Select equipment type</option>
                    {Object.values(EQUIPMENT_TYPES).map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </StyledSelect>
                  <ErrorMessage name="type" component={ErrorText} />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="serialNumber">Serial Number*</Label>
                  <StyledField
                    type="text"
                    id="serialNumber"
                    name="serialNumber"
                    placeholder="Enter serial number"
                  />
                  <ErrorMessage name="serialNumber" component={ErrorText} />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="model">Model*</Label>
                  <StyledField
                    type="text"
                    id="model"
                    name="model"
                    placeholder="Enter model"
                  />
                  <ErrorMessage name="model" component={ErrorText} />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="manufacturer">Manufacturer*</Label>
                  <StyledField
                    type="text"
                    id="manufacturer"
                    name="manufacturer"
                    placeholder="Enter manufacturer"
                  />
                  <ErrorMessage name="manufacturer" component={ErrorText} />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="purchaseDate">Purchase Date*</Label>
                  <StyledField
                    type="date"
                    id="purchaseDate"
                    name="purchaseDate"
                  />
                  <ErrorMessage name="purchaseDate" component={ErrorText} />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="warrantyExpiration">Warranty Expiration Date</Label>
                  <StyledField
                    type="date"
                    id="warrantyExpiration"
                    name="warrantyExpiration"
                  />
                  <ErrorMessage name="warrantyExpiration" component={ErrorText} />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="location">Location*</Label>
                  <StyledField
                    type="text"
                    id="location"
                    name="location"
                    placeholder="Enter location"
                  />
                  <ErrorMessage name="location" component={ErrorText} />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="assignedTo">Assigned To</Label>
                  <StyledField
                    type="text"
                    id="assignedTo"
                    name="assignedTo"
                    placeholder="Enter user or department assigned to"
                  />
                  <ErrorMessage name="assignedTo" component={ErrorText} />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="status">Status*</Label>
                  <StyledSelect as="select" id="status" name="status">
                    {Object.values(EQUIPMENT_STATUS).map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </StyledSelect>
                  <ErrorMessage name="status" component={ErrorText} />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="specifications">Specifications</Label>
                  <StyledTextArea
                    as="textarea"
                    id="specifications"
                    name="specifications"
                    placeholder="Enter equipment specifications"
                  />
                  <ErrorMessage name="specifications" component={ErrorText} />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="notes">Notes</Label>
                  <StyledTextArea
                    as="textarea"
                    id="notes"
                    name="notes"
                    placeholder="Enter additional notes"
                  />
                  <ErrorMessage name="notes" component={ErrorText} />
                </FormGroup>
                
                <ButtonContainer>
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
                    disabled={isSubmitting || loading}
                  >
                    {isSubmitting || loading ? 'Saving...' : 'Create Equipment'}
                  </Button>
                </ButtonContainer>
              </Form>
            )}
          </Formik>
        </Card>
      </PageContainer>
    </Layout>
  );
};

export default CreateEquipmentPage;