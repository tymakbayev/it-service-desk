import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { FaUser, FaLock, FaEnvelope, FaEye, FaEyeSlash, FaIdCard } from 'react-icons/fa';

// Import components
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Card from '../../../components/common/Card';
import Alert from '../../../components/common/Alert';
import Loader from '../../../components/common/Loader';

// Import auth actions and selectors
import { register } from '../store/authSlice';
import { selectAuthLoading, selectAuthError, selectIsAuthenticated } from '../store/authSlice';

// Import styles
import styled from 'styled-components';

// Styled components
const RegisterContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fb;
  padding: 1rem;
`;

const RegisterCard = styled(Card)`
  width: 100%;
  max-width: 500px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const RegisterHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const RegisterTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
`;

const RegisterSubtitle = styled.p`
  color: #7f8c8d;
  font-size: 0.875rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  position: relative;
`;

const InputWrapper = styled.div`
  position: relative;
`;

const IconWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 1rem;
  transform: translateY(-50%);
  color: #7f8c8d;
`;

const PasswordToggle = styled.button`
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #7f8c8d;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
`;

const ErrorText = styled.div`
  color: #e74c3c;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  padding-left: 0.5rem;
`;

const LoginPrompt = styled.div`
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: #7f8c8d;
`;

const LoginLink = styled(Link)`
  color: #3498db;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const FormRow = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0;
  }
`;

const TermsCheckbox = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  
  input {
    margin-top: 0.25rem;
    margin-right: 0.5rem;
  }
  
  label {
    font-size: 0.875rem;
    color: #2c3e50;
  }
  
  a {
    color: #3498db;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

// Validation schema
const RegisterSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, 'Имя должно содержать минимум 2 символа')
    .max(50, 'Имя должно содержать максимум 50 символов')
    .required('Имя обязательно'),
  lastName: Yup.string()
    .min(2, 'Фамилия должна содержать минимум 2 символа')
    .max(50, 'Фамилия должна содержать максимум 50 символов')
    .required('Фамилия обязательна'),
  email: Yup.string()
    .email('Неверный формат email')
    .required('Email обязателен'),
  password: Yup.string()
    .min(8, 'Пароль должен содержать минимум 8 символов')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Пароль должен содержать хотя бы одну заглавную букву, одну строчную букву, одну цифру и один специальный символ'
    )
    .required('Пароль обязателен'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Пароли должны совпадать')
    .required('Подтверждение пароля обязательно'),
  department: Yup.string()
    .required('Отдел обязателен'),
  position: Yup.string()
    .required('Должность обязательна'),
  acceptTerms: Yup.boolean()
    .oneOf([true], 'Вы должны принять условия использования')
    .required('Вы должны принять условия использования')
});

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  // Initial form values
  const initialValues = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    position: '',
    acceptTerms: false
  };
  
  // Handle form submission
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      // Remove confirmPassword and acceptTerms from the payload
      const { confirmPassword, acceptTerms, ...userData } = values;
      
      await dispatch(register(userData)).unwrap();
      toast.success('Регистрация выполнена успешно! Пожалуйста, проверьте вашу почту для подтверждения аккаунта.');
      resetForm();
      navigate('/login');
    } catch (err) {
      // Error is handled by the auth slice and displayed in the component
      setSubmitting(false);
    }
  };
  
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  // Department options
  const departments = [
    { value: '', label: 'Выберите отдел' },
    { value: 'it', label: 'IT отдел' },
    { value: 'hr', label: 'HR отдел' },
    { value: 'finance', label: 'Финансовый отдел' },
    { value: 'marketing', label: 'Маркетинг' },
    { value: 'sales', label: 'Продажи' },
    { value: 'support', label: 'Техническая поддержка' },
    { value: 'other', label: 'Другое' }
  ];
  
  return (
    <RegisterContainer>
      <RegisterCard>
        <RegisterHeader>
          <RegisterTitle>Регистрация</RegisterTitle>
          <RegisterSubtitle>Создайте аккаунт для доступа к IT Service Desk</RegisterSubtitle>
        </RegisterHeader>
        
        {error && <Alert type="error" message={error} />}
        
        <Formik
          initialValues={initialValues}
          validationSchema={RegisterSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, touched, errors }) => (
            <Form>
              <FormRow>
                <FormGroup>
                  <InputWrapper>
                    <IconWrapper>
                      <FaUser />
                    </IconWrapper>
                    <Field
                      as={Input}
                      type="text"
                      name="firstName"
                      placeholder="Имя"
                      leftIcon
                      error={touched.firstName && errors.firstName}
                    />
                  </InputWrapper>
                  <ErrorMessage name="firstName" component={ErrorText} />
                </FormGroup>
                
                <FormGroup>
                  <InputWrapper>
                    <IconWrapper>
                      <FaUser />
                    </IconWrapper>
                    <Field
                      as={Input}
                      type="text"
                      name="lastName"
                      placeholder="Фамилия"
                      leftIcon
                      error={touched.lastName && errors.lastName}
                    />
                  </InputWrapper>
                  <ErrorMessage name="lastName" component={ErrorText} />
                </FormGroup>
              </FormRow>
              
              <FormGroup>
                <InputWrapper>
                  <IconWrapper>
                    <FaEnvelope />
                  </IconWrapper>
                  <Field
                    as={Input}
                    type="email"
                    name="email"
                    placeholder="Email"
                    leftIcon
                    error={touched.email && errors.email}
                  />
                </InputWrapper>
                <ErrorMessage name="email" component={ErrorText} />
              </FormGroup>
              
              <FormGroup>
                <InputWrapper>
                  <IconWrapper>
                    <FaLock />
                  </IconWrapper>
                  <Field
                    as={Input}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Пароль"
                    leftIcon
                    error={touched.password && errors.password}
                  />
                  <PasswordToggle
                    type="button"
                    onClick={togglePasswordVisibility}
                    tabIndex="-1"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </PasswordToggle>
                </InputWrapper>
                <ErrorMessage name="password" component={ErrorText} />
              </FormGroup>
              
              <FormGroup>
                <InputWrapper>
                  <IconWrapper>
                    <FaLock />
                  </IconWrapper>
                  <Field
                    as={Input}
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Подтвердите пароль"
                    leftIcon
                    error={touched.confirmPassword && errors.confirmPassword}
                  />
                  <PasswordToggle
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    tabIndex="-1"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </PasswordToggle>
                </InputWrapper>
                <ErrorMessage name="confirmPassword" component={ErrorText} />
              </FormGroup>
              
              <FormRow>
                <FormGroup>
                  <InputWrapper>
                    <IconWrapper>
                      <FaIdCard />
                    </IconWrapper>
                    <Field
                      as="select"
                      name="department"
                      className={`form-select ${touched.department && errors.department ? 'is-invalid' : ''}`}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem 0.75rem 2.5rem',
                        borderRadius: '0.375rem',
                        border: touched.department && errors.department ? '1px solid #e74c3c' : '1px solid #dce4ec',
                        fontSize: '1rem',
                        backgroundColor: '#fff',
                        appearance: 'none',
                        backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\'%3e%3cpath fill=\'none\' stroke=\'%23343a40\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M2 5l6 6 6-6\'/%3e%3c/svg%3e")',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.75rem center',
                        backgroundSize: '16px 12px',
                      }}
                    >
                      {departments.map(dept => (
                        <option key={dept.value} value={dept.value}>{dept.label}</option>
                      ))}
                    </Field>
                  </InputWrapper>
                  <ErrorMessage name="department" component={ErrorText} />
                </FormGroup>
                
                <FormGroup>
                  <InputWrapper>
                    <IconWrapper>
                      <FaIdCard />
                    </IconWrapper>
                    <Field
                      as={Input}
                      type="text"
                      name="position"
                      placeholder="Должность"
                      leftIcon
                      error={touched.position && errors.position}
                    />
                  </InputWrapper>
                  <ErrorMessage name="position" component={ErrorText} />
                </FormGroup>
              </FormRow>
              
              <TermsCheckbox>
                <Field type="checkbox" name="acceptTerms" id="acceptTerms" />
                <label htmlFor="acceptTerms">
                  Я принимаю <Link to="/terms">условия использования</Link> и <Link to="/privacy">политику конфиденциальности</Link>
                </label>
              </TermsCheckbox>
              <ErrorMessage name="acceptTerms" component={ErrorText} />
              
              <Button
                type="submit"
                disabled={isSubmitting || isLoading}
                fullWidth
                primary
              >
                {isLoading ? <Loader size="sm" color="#ffffff" /> : 'Зарегистрироваться'}
              </Button>
            </Form>
          )}
        </Formik>
        
        <LoginPrompt>
          Уже есть аккаунт? <LoginLink to="/login">Войти</LoginLink>
        </LoginPrompt>
      </RegisterCard>
    </RegisterContainer>
  );
};

export default RegisterPage;