import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaSave, FaTimes, FaPaperclip } from 'react-icons/fa';

// Components
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Loader from '../../../components/common/Loader';
import Alert from '../../../components/common/Alert';

// Store
import { createIncident } from '../store/incidentsSlice';
import { fetchEquipment } from '../../equipment/store/equipmentSlice';
import { fetchUsers } from '../../auth/store/authSlice';

// Hooks
import useAuth from '../../../hooks/useAuth';

// Utils
import { INCIDENT_PRIORITIES, INCIDENT_CATEGORIES } from '../../../utils/constants';

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
  attachments: Yup.array()
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

  // Initial form values
  const initialValues = {
    title: '',
    description: '',
    priority: 'MEDIUM',
    category: 'SOFTWARE',
    equipmentId: '',
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
      
      if (values.equipmentId) {
        formData.append('equipmentId', values.equipmentId);
      }

      // Append files if any
      files.forEach(file => {
        formData.append('attachments', file);
      });

      // Dispatch create incident action
      const result = await dispatch(createIncident(formData)).unwrap();
      
      toast.success('Incident created successfully');
      resetForm();
      setFiles([]);
      
      // Navigate to the newly created incident
      navigate(`/incidents/${result.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create incident');
      toast.error(`Error: ${err.message || 'Failed to create incident'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel button
  const handleCancel = () => {
    navigate('/incidents');
  };

  // Loading state
  if (equipmentLoading || usersLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Create New Incident</h1>
        <Button 
          variant="secondary" 
          onClick={handleCancel}
          icon={<FaTimes />}
        >
          Cancel
        </Button>
      </div>

      {error && (
        <Alert type="error" className="mb-4">
          {error}
        </Alert>
      )}

      <Card className="mb-6">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isValid, dirty, setFieldValue, values }) => (
            <Form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <Field
                    as={Input}
                    id="title"
                    name="title"
                    type="text"
                    placeholder="Enter incident title"
                  />
                  <ErrorMessage name="title" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <Field
                    as="select"
                    id="category"
                    name="category"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {Object.entries(INCIDENT_CATEGORIES).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="category" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                    Priority *
                  </label>
                  <Field
                    as="select"
                    id="priority"
                    name="priority"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {Object.entries(INCIDENT_PRIORITIES).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="priority" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="equipmentId" className="block text-sm font-medium text-gray-700 mb-1">
                    Related Equipment
                  </label>
                  <Field
                    as="select"
                    id="equipmentId"
                    name="equipmentId"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">-- Select Equipment (Optional) --</option>
                    {equipment.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name} - {item.serialNumber}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="equipmentId" component="div" className="mt-1 text-sm text-red-600" />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <Field
                  as="textarea"
                  id="description"
                  name="description"
                  rows={6}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Describe the incident in detail..."
                />
                <ErrorMessage name="description" component="div" className="mt-1 text-sm text-red-600" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attachments
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <FaPaperclip className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                      >
                        <span>Upload files</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          multiple
                          onChange={e => handleFileChange(e, setFieldValue)}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, PDF, DOC up to 10MB each
                    </p>
                  </div>
                </div>

                {files.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700">Selected Files:</h4>
                    <ul className="mt-2 divide-y divide-gray-200 border border-gray-200 rounded-md">
                      {files.map((file, index) => (
                        <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                          <div className="w-0 flex-1 flex items-center">
                            <FaPaperclip className="flex-shrink-0 h-5 w-5 text-gray-400" />
                            <span className="ml-2 flex-1 w-0 truncate">{file.name}</span>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(index, setFieldValue)}
                              className="font-medium text-red-600 hover:text-red-500"
                            >
                              Remove
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3">
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
                  disabled={!isValid || !dirty || isSubmitting}
                  loading={isSubmitting}
                  icon={<FaSave />}
                >
                  Create Incident
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Card>
    </div>
  );
};

export default CreateIncidentPage;