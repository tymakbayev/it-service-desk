import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { FaUser, FaLock, FaEnvelope, FaEye, FaEyeSlash, FaIdCard, FaBuilding } from 'react-icons/fa';
import styled from 'styled-components';

// Import components
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Card from '../../../components/common/Card';
import Alert from '../../../components/common/Alert';
import Loader from '../../../components/common/Loader';

// Import auth actions and selectors
import { register } from '../authThunks';
import { selectAuthLoading, selectAuthError, selectIsAuthenticated } from '../authSlice';

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
  border-radius: 8px;
  background-color: #ffffff;
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
  z-index: 1;
`;

const StyledInput = styled(Field)`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid ${props => props.error ? '#e74c3c' : '#dfe6e9'};
  border-radius: 0.25rem;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
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

const SubmitButton = styled(Button)`
  width: 100%;
  padding: 0.75rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 0.25rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #2980b9;
  }
  
  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
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
    .oneOf([true], 'Вы должны принять условия использования и политику конфиденциальности')
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
  
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  // Handle form submission
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const { confirmPassword, acceptTerms, ...userData } = values;
      
      await dispatch(register(userData)).unwrap();
      
      toast.success('Регистрация успешна! Теперь вы можете войти в систему.');
      navigate('/login');
      resetForm();
    } catch (err) {
      toast.error(err?.message || 'Ошибка при регистрации. Пожалуйста, попробуйте снова.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // List of departments
  const departments = [
    { value: '', label: 'Выберите отдел' },
    { value: 'IT', label: 'IT отдел' },
    { value: 'HR', label: 'Отдел кадров' },
    { value: 'Finance', label: 'Финансовый отдел' },
    { value: 'Marketing', label: 'Маркетинг' },
    { value: 'Sales', label: 'Продажи' },
    { value: 'Operations', label: 'Операционный отдел' },
    { value: 'Support', label: 'Техническая поддержка' },
    { value: 'Other', label: 'Другое' }
  ];
  
  // List of positions
  const positions = [
    { value: '', label: 'Выберите должность' },
    { value: 'Manager', label: 'Менеджер' },
    { value: 'Specialist', label: 'Специалист' },
    { value: 'Developer', label: 'Разработчик' },
    { value: 'Analyst', label: 'Аналитик' },
    { value: 'Designer', label: 'Дизайнер' },
    { value: 'Support', label: 'Сотрудник поддержки' },
    { value: 'Director', label: 'Директор' },
    { value: 'Other', label: 'Другое' }
  ];
  
  return (
    <RegisterContainer>
      <RegisterCard>
        <RegisterHeader>
          <RegisterTitle>Регистрация</RegisterTitle>
          <RegisterSubtitle>Создайте учетную запись для доступа к IT Service Desk</RegisterSubtitle>
        </RegisterHeader>
        
        {error && <Alert type="error" message={error} />}
        
        <Formik
          initialValues={{
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
            department: '',
            position: '',
            acceptTerms: false
          }}
          validationSchema={RegisterSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting, values }) => (
            <Form>
              <FormRow>
                <FormGroup>
                  <InputWrapper>
                    <IconWrapper>
                      <FaUser />
                    </IconWrapper>
                    <StyledInput
                      type="text"
                      name="firstName"
                      placeholder="Имя"
                      error={errors.firstName && touched.firstName}
                    />
                  </InputWrapper>
                  <ErrorMessage name="firstName" component={ErrorText} />
                </FormGroup>
                
                <FormGroup>
                  <InputWrapper>
                    <IconWrapper>
                      <FaUser />
                    </IconWrapper>
                    <StyledInput
                      type="text"
                      name="lastName"
                      placeholder="Фамилия"
                      error={errors.lastName && touched.lastName}
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
                  <StyledInput
                    type="email"
                    name="email"
                    placeholder="Email"
                    error={errors.email && touched.email}
                  />
                </InputWrapper>
                <ErrorMessage name="email" component={ErrorText} />
              </FormGroup>
              
              <FormGroup>
                <InputWrapper>
                  <IconWrapper>
                    <FaLock />
                  </IconWrapper>
                  <StyledInput
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Пароль"
                    error={errors.password && touched.password}
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
                  <StyledInput
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Подтвердите пароль"
                    error={errors.confirmPassword && touched.confirmPassword}
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
                      <FaBuilding />
                    </IconWrapper>
                    <Field
                      as="select"
                      name="department"
                      className={`${StyledInput}`}
                      error={errors.department && touched.department}
                    >
                      {departments.map(dept => (
                        <option key={dept.value} value={dept.value}>
                          {dept.label}
                        </option>
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
                      as="select"
                      name="position"
                      className={`${StyledInput}`}
                      error={errors.position && touched.position}
                    >
                      {positions.map(pos => (
                        <option key={pos.value} value={pos.value}>
                          {pos.label}
                        </option>
                      ))}
                    </Field>
                  </InputWrapper>
                  <ErrorMessage name="position" component={ErrorText} />
                </FormGroup>
              </FormRow>
              
              <TermsCheckbox>
                <Field
                  type="checkbox"
                  name="acceptTerms"
                  id="acceptTerms"
                />
                <label htmlFor="acceptTerms">
                  Я принимаю <Link to="/terms">условия использования</Link> и <Link to="/privacy">политику конфиденциальности</Link>
                </label>
              </TermsCheckbox>
              <ErrorMessage name="acceptTerms" component={ErrorText} />
              
              <SubmitButton
                type="submit"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting || isLoading ? <Loader size="small" color="#ffffff" /> : 'Зарегистрироваться'}
              </SubmitButton>
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