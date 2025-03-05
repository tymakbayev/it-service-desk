import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { FaSave, FaTimes, FaPaperclip, FaTrash } from 'react-icons/fa';

// Components
import Layout from '../../../components/Layout';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Loader from '../../../components/common/Loader';
import Alert from '../../../components/common/Alert';

// Store actions
import { createIncident } from '../store/incidentsSlice';
import { fetchEquipment } from '../../equipment/store/equipmentSlice';
import { fetchUsers } from '../../auth/store/authSlice';

// Hooks
import useAuth from '../../../hooks/useAuth';

// Utils
import { INCIDENT_PRIORITIES, INCIDENT_CATEGORIES } from '../../../utils/constants';
import { formatFileSize } from '../../../utils/formatters';

// Styled components
const FormContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
`;

const StyledErrorMessage = styled.div`
  color: #e53e3e;
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;

const StyledSelect = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  background-color: white;
  font-size: 1rem;
  transition: border-color 0.15s ease-in-out;

  &:focus {
    border-color: #4299e1;
    outline: none;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
  }
`;

const StyledTextarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  background-color: white;
  font-size: 1rem;
  min-height: 150px;
  transition: border-color 0.15s ease-in-out;

  &:focus {
    border-color: #4299e1;
    outline: none;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
  }
`;

const FileInputContainer = styled.div`
  margin-top: 1rem;
`;

const FileInputLabel = styled.label`
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: #edf2f7;
  color: #4a5568;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #e2e8f0;
  }

  svg {
    margin-right: 0.5rem;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const FileList = styled.ul`
  list-style: none;
  padding: 0;
  margin-top: 1rem;
`;

const FileItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background-color: #f7fafc;
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
`;

const FileInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const FileName = styled.span`
  font-weight: 500;
`;

const FileSize = styled.span`
  font-size: 0.75rem;
  color: #718096;
`;

const RemoveFileButton = styled.button`
  background: none;
  border: none;
  color: #e53e3e;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;

  &:hover {
    background-color: #fed7d7;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
`;

// Validation schema
const validationSchema = Yup.object({
  title: Yup.string()
    .required('Title is required')
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: Yup.string()
    .required('Description is required')
    .min(10, 'Description must be at least 10 characters'),
  priority: Yup.string()
    .required('Priority is required')
    .oneOf(Object.keys(INCIDENT_PRIORITIES), 'Invalid priority'),
  category: Yup.string()
    .required('Category is required')
    .oneOf(Object.keys(INCIDENT_CATEGORIES), 'Invalid category'),
  equipmentId: Yup.string()
    .nullable(),
  assignedTo: Yup.string()
    .nullable()
});

const CreateIncidentPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Local state
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Redux state
  const { loading: equipmentLoading, equipment } = useSelector(state => state.equipment);
  const { loading: usersLoading, users } = useSelector(state => state.auth);
  const { loading: incidentLoading } = useSelector(state => state.incidents);

  // Initial form values
  const initialValues = {
    title: '',
    description: '',
    priority: 'MEDIUM',
    category: 'SOFTWARE',
    equipmentId: '',
    assignedTo: '',
    attachments: []
  };

  // Fetch equipment and users on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(fetchEquipment({ limit: 100 })).unwrap();
        await dispatch(fetchUsers()).unwrap();
      } catch (err) {
        setError(err.message || 'Failed to load required data');
        toast.error(`Error: ${err.message || 'Failed to load required data'}`);
      }
    };

    fetchData();
  }, [dispatch]);

  // Handle file change
  const handleFileChange = (event, setFieldValue) => {
    const selectedFiles = Array.from(event.target.files);
    
    // Check file size (limit to 5MB per file)
    const oversizedFiles = selectedFiles.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error('Files must be less than 5MB each');
      return;
    }
    
    // Check total number of files (limit to 5 files)
    if (files.length + selectedFiles.length > 5) {
      toast.error('You can upload a maximum of 5 files');
      return;
    }
    
    setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
    setFieldValue('attachments', [...files, ...selectedFiles]);
  };

  // Handle file removal
  const handleRemoveFile = (index, setFieldValue) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
    setFieldValue('attachments', updatedFiles);
  };

  // Handle form submission
  const handleSubmit = async (values, { resetForm }) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Create FormData for file uploads
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('description', values.description);
      formData.append('priority', values.priority);
      formData.append('category', values.category);
      formData.append('reportedBy', user.id);
      
      if (values.equipmentId) {
        formData.append('equipmentId', values.equipmentId);
      }
      
      if (values.assignedTo) {
        formData.append('assignedTo', values.assignedTo);
      }

      // Append files if any
      files.forEach(file => {
        formData.append('attachments', file);
      });

      // Dispatch create incident action
      const result = await dispatch(createIncident(formData)).unwrap();
      
      // Reset form and state
      resetForm();
      setFiles([]);
      setIsSubmitting(false);
      
      // Show success message
      toast.success('Incident created successfully!');
      
      // Navigate to incident detail page
      navigate(`/incidents/${result.id}`);
    } catch (err) {
      setIsSubmitting(false);
      setError(err.message || 'Failed to create incident');
      toast.error(`Error: ${err.message || 'Failed to create incident'}`);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate('/incidents');
  };

  // Loading state
  if (equipmentLoading || usersLoading) {
    return (
      <Layout>
        <div className="container mx-auto p-4">
          <Loader size="large" text="Loading required data..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Create New Incident</h1>
        
        {error && (
          <Alert type="error" message={error} className="mb-4" />
        )}
        
        <FormContainer>
          <Card>
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isValid, dirty, setFieldValue, values }) => (
                <Form>
                  <FormGroup>
                    <Label htmlFor="title">Title</Label>
                    <Field
                      as={Input}
                      type="text"
                      id="title"
                      name="title"
                      placeholder="Enter incident title"
                    />
                    <ErrorMessage name="title" component={StyledErrorMessage} />
                  </FormGroup>
                  
                  <FormGroup>
                    <Label htmlFor="description">Description</Label>
                    <Field
                      as={StyledTextarea}
                      id="description"
                      name="description"
                      placeholder="Describe the incident in detail"
                    />
                    <ErrorMessage name="description" component={StyledErrorMessage} />
                  </FormGroup>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormGroup>
                      <Label htmlFor="priority">Priority</Label>
                      <Field as={StyledSelect} id="priority" name="priority">
                        {Object.entries(INCIDENT_PRIORITIES).map(([key, value]) => (
                          <option key={key} value={key}>
                            {value}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="priority" component={StyledErrorMessage} />
                    </FormGroup>
                    
                    <FormGroup>
                      <Label htmlFor="category">Category</Label>
                      <Field as={StyledSelect} id="category" name="category">
                        {Object.entries(INCIDENT_CATEGORIES).map(([key, value]) => (
                          <option key={key} value={key}>
                            {value}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="category" component={StyledErrorMessage} />
                    </FormGroup>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormGroup>
                      <Label htmlFor="equipmentId">Related Equipment (Optional)</Label>
                      <Field as={StyledSelect} id="equipmentId" name="equipmentId">
                        <option value="">-- Select Equipment --</option>
                        {equipment && equipment.items && equipment.items.map(item => (
                          <option key={item.id} value={item.id}>
                            {item.name} ({item.serialNumber})
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="equipmentId" component={StyledErrorMessage} />
                    </FormGroup>
                    
                    <FormGroup>
                      <Label htmlFor="assignedTo">Assign To (Optional)</Label>
                      <Field as={StyledSelect} id="assignedTo" name="assignedTo">
                        <option value="">-- Select User --</option>
                        {users && users.filter(u => u.role === 'TECHNICIAN' || u.role === 'ADMIN').map(user => (
                          <option key={user.id} value={user.id}>
                            {user.firstName} {user.lastName} ({user.email})
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="assignedTo" component={StyledErrorMessage} />
                    </FormGroup>
                  </div>
                  
                  <FormGroup>
                    <Label>Attachments (Optional)</Label>
                    <p className="text-sm text-gray-600 mb-2">
                      You can upload up to 5 files (5MB max per file)
                    </p>
                    
                    <FileInputContainer>
                      <FileInputLabel htmlFor="attachments">
                        <FaPaperclip />
                        Select Files
                      </FileInputLabel>
                      <HiddenFileInput
                        id="attachments"
                        type="file"
                        multiple
                        onChange={(e) => handleFileChange(e, setFieldValue)}
                      />
                    </FileInputContainer>
                    
                    {files.length > 0 && (
                      <FileList>
                        {files.map((file, index) => (
                          <FileItem key={index}>
                            <FileInfo>
                              <FileName>{file.name}</FileName>
                              <FileSize>{formatFileSize(file.size)}</FileSize>
                            </FileInfo>
                            <RemoveFileButton
                              type="button"
                              onClick={() => handleRemoveFile(index, setFieldValue)}
                              title="Remove file"
                            >
                              <FaTrash />
                            </RemoveFileButton>
                          </FileItem>
                        ))}
                      </FileList>
                    )}
                  </FormGroup>
                  
                  <ButtonGroup>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleCancel}
                      disabled={isSubmitting}
                      icon={<FaTimes />}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={!isValid || !dirty || isSubmitting || incidentLoading}
                      isLoading={isSubmitting || incidentLoading}
                      icon={<FaSave />}
                    >
                      Create Incident
                    </Button>
                  </ButtonGroup>
                </Form>
              )}
            </Formik>
          </Card>
        </FormContainer>
      </div>
    </Layout>
  );
};

export default CreateIncidentPage;