import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Card from '../../../components/common/Card';
import Alert from '../../../components/common/Alert';
import Loader from '../../../components/common/Loader';

import { createEquipment, updateEquipment, getEquipmentById } from '../store/equipmentSlice';
import { EQUIPMENT_STATUSES } from '../../../utils/constants';

const FormContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const FormTitle = styled.h2`
  margin-bottom: 24px;
  color: #333;
  font-weight: 600;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const FormRow = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 30px;
`;

const ErrorText = styled.div`
  color: #e53935;
  font-size: 14px;
  margin-top: 5px;
`;

const SelectField = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
  background-color: white;

  &:focus {
    border-color: #4a90e2;
    outline: none;
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  min-height: 120px;
  resize: vertical;
  font-family: inherit;

  &:focus {
    border-color: #4a90e2;
    outline: none;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
`;

/**
 * Equipment Form Component
 * 
 * This component provides a form for creating and editing equipment.
 * It supports validation, form submission, and loading existing equipment data for editing.
 */
const EquipmentForm = ({ isEdit = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const { loading, currentEquipment } = useSelector((state) => state.equipment);
  const { user } = useSelector((state) => state.auth);

  // Define validation schema using Yup
  const validationSchema = Yup.object({
    name: Yup.string()
      .required('Name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be at most 100 characters'),
    type: Yup.string()
      .required('Type is required')
      .min(2, 'Type must be at least 2 characters')
      .max(50, 'Type must be at most 50 characters'),
    serialNumber: Yup.string()
      .required('Serial number is required')
      .min(2, 'Serial number must be at least 2 characters')
      .max(50, 'Serial number must be at most 50 characters'),
    purchaseDate: Yup.date()
      .required('Purchase date is required')
      .max(new Date(), 'Purchase date cannot be in the future'),
    warrantyExpiryDate: Yup.date()
      .nullable()
      .min(Yup.ref('purchaseDate'), 'Warranty expiry date must be after purchase date'),
    status: Yup.string()
      .required('Status is required')
      .oneOf(Object.values(EQUIPMENT_STATUSES), 'Invalid status'),
    location: Yup.string()
      .required('Location is required')
      .min(2, 'Location must be at least 2 characters')
      .max(100, 'Location must be at most 100 characters'),
    assignedTo: Yup.string()
      .nullable(),
    manufacturer: Yup.string()
      .required('Manufacturer is required')
      .min(2, 'Manufacturer must be at least 2 characters')
      .max(100, 'Manufacturer must be at most 100 characters'),
    model: Yup.string()
      .required('Model is required')
      .min(1, 'Model must be at least 1 character')
      .max(100, 'Model must be at most 100 characters'),
    notes: Yup.string()
      .max(1000, 'Notes must be at most 1000 characters'),
  });

  // Initialize formik
  const formik = useFormik({
    initialValues: {
      name: '',
      type: '',
      serialNumber: '',
      purchaseDate: '',
      warrantyExpiryDate: '',
      status: EQUIPMENT_STATUSES.AVAILABLE,
      location: '',
      assignedTo: '',
      manufacturer: '',
      model: '',
      notes: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setError(null);
        
        // Format dates for API
        const formattedValues = {
          ...values,
          purchaseDate: new Date(values.purchaseDate).toISOString(),
          warrantyExpiryDate: values.warrantyExpiryDate 
            ? new Date(values.warrantyExpiryDate).toISOString() 
            : null,
          assignedTo: values.assignedTo || null,
        };

        if (isEdit && id) {
          await dispatch(updateEquipment({ id, equipmentData: formattedValues })).unwrap();
          setSuccess('Equipment updated successfully');
        } else {
          await dispatch(createEquipment(formattedValues)).unwrap();
          setSuccess('Equipment created successfully');
          formik.resetForm();
        }

        // Redirect after short delay to show success message
        setTimeout(() => {
          navigate('/equipment');
        }, 1500);
      } catch (err) {
        setError(err.message || 'An error occurred while saving the equipment');
      }
    },
  });

  // Load equipment data if in edit mode
  useEffect(() => {
    if (isEdit && id) {
      dispatch(getEquipmentById(id))
        .unwrap()
        .catch((err) => {
          setError(err.message || 'Failed to load equipment data');
          navigate('/equipment');
        });
    }
  }, [isEdit, id, dispatch, navigate]);

  // Populate form when equipment data is loaded
  useEffect(() => {
    if (isEdit && currentEquipment && Object.keys(currentEquipment).length > 0) {
      formik.setValues({
        name: currentEquipment.name || '',
        type: currentEquipment.type || '',
        serialNumber: currentEquipment.serialNumber || '',
        purchaseDate: currentEquipment.purchaseDate 
          ? new Date(currentEquipment.purchaseDate).toISOString().split('T')[0] 
          : '',
        warrantyExpiryDate: currentEquipment.warrantyExpiryDate 
          ? new Date(currentEquipment.warrantyExpiryDate).toISOString().split('T')[0] 
          : '',
        status: currentEquipment.status || EQUIPMENT_STATUSES.AVAILABLE,
        location: currentEquipment.location || '',
        assignedTo: currentEquipment.assignedTo || '',
        manufacturer: currentEquipment.manufacturer || '',
        model: currentEquipment.model || '',
        notes: currentEquipment.notes || '',
      });
    }
  }, [currentEquipment, isEdit, formik]);

  // Check if user has permission to edit equipment
  const canEditEquipment = () => {
    return user && (user.role === 'ADMIN' || user.role === 'TECHNICIAN');
  };

  if (loading && isEdit) {
    return <Loader />;
  }

  return (
    <FormContainer>
      <Card>
        <FormTitle>{isEdit ? 'Edit Equipment' : 'Add New Equipment'}</FormTitle>
        
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}
        
        <form onSubmit={formik.handleSubmit}>
          <FormRow>
            <FormGroup>
              <Label htmlFor="name">Equipment Name*</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter equipment name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && formik.errors.name}
              />
              {formik.touched.name && formik.errors.name && (
                <ErrorText>{formik.errors.name}</ErrorText>
              )}
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="type">Equipment Type*</Label>
              <Input
                id="type"
                name="type"
                type="text"
                placeholder="e.g. Laptop, Printer, Server"
                value={formik.values.type}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.type && formik.errors.type}
              />
              {formik.touched.type && formik.errors.type && (
                <ErrorText>{formik.errors.type}</ErrorText>
              )}
            </FormGroup>
          </FormRow>
          
          <FormRow>
            <FormGroup>
              <Label htmlFor="manufacturer">Manufacturer*</Label>
              <Input
                id="manufacturer"
                name="manufacturer"
                type="text"
                placeholder="Enter manufacturer"
                value={formik.values.manufacturer}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.manufacturer && formik.errors.manufacturer}
              />
              {formik.touched.manufacturer && formik.errors.manufacturer && (
                <ErrorText>{formik.errors.manufacturer}</ErrorText>
              )}
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="model">Model*</Label>
              <Input
                id="model"
                name="model"
                type="text"
                placeholder="Enter model"
                value={formik.values.model}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.model && formik.errors.model}
              />
              {formik.touched.model && formik.errors.model && (
                <ErrorText>{formik.errors.model}</ErrorText>
              )}
            </FormGroup>
          </FormRow>
          
          <FormRow>
            <FormGroup>
              <Label htmlFor="serialNumber">Serial Number*</Label>
              <Input
                id="serialNumber"
                name="serialNumber"
                type="text"
                placeholder="Enter serial number"
                value={formik.values.serialNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.serialNumber && formik.errors.serialNumber}
              />
              {formik.touched.serialNumber && formik.errors.serialNumber && (
                <ErrorText>{formik.errors.serialNumber}</ErrorText>
              )}
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="location">Location*</Label>
              <Input
                id="location"
                name="location"
                type="text"
                placeholder="e.g. Office 101, IT Department"
                value={formik.values.location}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.location && formik.errors.location}
              />
              {formik.touched.location && formik.errors.location && (
                <ErrorText>{formik.errors.location}</ErrorText>
              )}
            </FormGroup>
          </FormRow>
          
          <FormRow>
            <FormGroup>
              <Label htmlFor="purchaseDate">Purchase Date*</Label>
              <Input
                id="purchaseDate"
                name="purchaseDate"
                type="date"
                value={formik.values.purchaseDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.purchaseDate && formik.errors.purchaseDate}
              />
              {formik.touched.purchaseDate && formik.errors.purchaseDate && (
                <ErrorText>{formik.errors.purchaseDate}</ErrorText>
              )}
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="warrantyExpiryDate">Warranty Expiry Date</Label>
              <Input
                id="warrantyExpiryDate"
                name="warrantyExpiryDate"
                type="date"
                value={formik.values.warrantyExpiryDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.warrantyExpiryDate && formik.errors.warrantyExpiryDate}
              />
              {formik.touched.warrantyExpiryDate && formik.errors.warrantyExpiryDate && (
                <ErrorText>{formik.errors.warrantyExpiryDate}</ErrorText>
              )}
            </FormGroup>
          </FormRow>
          
          <FormRow>
            <FormGroup>
              <Label htmlFor="status">Status*</Label>
              <SelectField
                id="status"
                name="status"
                value={formik.values.status}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={!canEditEquipment()}
              >
                {Object.entries(EQUIPMENT_STATUSES).map(([key, value]) => (
                  <option key={key} value={value}>
                    {value.replace(/_/g, ' ')}
                  </option>
                ))}
              </SelectField>
              {formik.touched.status && formik.errors.status && (
                <ErrorText>{formik.errors.status}</ErrorText>
              )}
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="assignedTo">Assigned To</Label>
              <Input
                id="assignedTo"
                name="assignedTo"
                type="text"
                placeholder="User ID or username (optional)"
                value={formik.values.assignedTo}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.assignedTo && formik.errors.assignedTo}
              />
              {formik.touched.assignedTo && formik.errors.assignedTo && (
                <ErrorText>{formik.errors.assignedTo}</ErrorText>
              )}
            </FormGroup>
          </FormRow>
          
          <FormGroup>
            <Label htmlFor="notes">Notes</Label>
            <TextArea
              id="notes"
              name="notes"
              placeholder="Additional information about this equipment"
              value={formik.values.notes}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.notes && formik.errors.notes && (
              <ErrorText>{formik.errors.notes}</ErrorText>
            )}
          </FormGroup>
          
          <FormActions>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => navigate('/equipment')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              disabled={loading || !canEditEquipment() || !formik.isValid}
            >
              {loading ? 'Saving...' : isEdit ? 'Update Equipment' : 'Add Equipment'}
            </Button>
          </FormActions>
        </form>
      </Card>
    </FormContainer>
  );
};

export default EquipmentForm;