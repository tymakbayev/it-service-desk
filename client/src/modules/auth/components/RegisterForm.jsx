import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaEye, FaEyeSlash, FaLock, FaUser, FaEnvelope, FaIdCard } from 'react-icons/fa';
import styled from 'styled-components';

import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Card from '../../../components/common/Card';
import Alert from '../../../components/common/Alert';
import Loader from '../../../components/common/Loader';

import { register, clearAuthError } from '../store/authSlice';

// Validation schema for registration form
const RegisterSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'Имя пользователя должно содержать минимум 3 символа')
    .max(50, 'Имя пользователя не должно превышать 50 символов')
    .required('Имя пользователя обязательно'),
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
  fullName: Yup.string()
    .min(2, 'Полное имя должно содержать минимум 2 символа')
    .max(100, 'Полное имя не должно превышать 100 символов')
    .required('Полное имя обязательно'),
  department: Yup.string()
    .required('Отдел обязателен'),
  acceptTerms: Yup.boolean()
    .oneOf([true], 'Вы должны принять условия использования')
});

// Styled components
const RegisterFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
`;

const StyledCard = styled(Card)`
  width: 100%;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const CardHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;

  h2 {
    font-size: 1.8rem;
    color: #333;
    margin-bottom: 0.5rem;
  }

  p {
    color: #666;
    font-size: 1rem;
  }
`;

const StyledForm = styled(Form)`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const IconWrapper = styled.div`
  position: absolute;
  left: 12px;
  color: #666;
  z-index: 1;
`;

const PasswordToggle = styled.div`
  position: absolute;
  right: 12px;
  color: #666;
  cursor: pointer;
  z-index: 1;
`;

const ErrorText = styled.div`
  color: #e53935;
  font-size: 0.8rem;
  margin-top: 0.25rem;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;

  input {
    width: auto;
    margin: 0;
  }

  label {
    font-size: 0.9rem;
    color: #555;
  }
`;

const FormFooter = styled.div`
  margin-top: 1rem;
  text-align: center;
  font-size: 0.9rem;
  color: #666;

  a {
    color: #1976d2;
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const DepartmentSelect = styled.select`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid ${props => (props.error ? '#e53935' : '#ddd')};
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;
  transition: border-color 0.2s ease;
  outline: none;

  &:focus {
    border-color: #1976d2;
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

/**
 * Registration form component for new users
 * Allows users to create a new account with validation
 */
const RegisterForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { isLoading, error, isAuthenticated, user } = useSelector(state => state.auth);
  
  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated && user) {
      navigate('/dashboard');
    }
    
    // Clear any existing auth errors when component mounts
    return () => {
      if (error) {
        dispatch(clearAuthError());
      }
    };
  }, [isAuthenticated, user, navigate, dispatch, error]);
  
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const { confirmPassword, acceptTerms, ...userData } = values;
      
      await dispatch(register(userData)).unwrap();
      
      // Show success message and redirect to login
      navigate('/login', { 
        state: { 
          registrationSuccess: true,
          message: 'Регистрация успешна! Пожалуйста, войдите в систему.' 
        } 
      });
    } catch (err) {
      // Error is handled by the redux slice
      setSubmitting(false);
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Department options
  const departments = [
    { value: '', label: 'Выберите отдел' },
    { value: 'IT', label: 'IT отдел' },
    { value: 'HR', label: 'HR отдел' },
    { value: 'FINANCE', label: 'Финансовый отдел' },
    { value: 'MARKETING', label: 'Маркетинг' },
    { value: 'SALES', label: 'Продажи' },
    { value: 'SUPPORT', label: 'Техническая поддержка' },
    { value: 'MANAGEMENT', label: 'Руководство' },
    { value: 'OTHER', label: 'Другое' }
  ];

  return (
    <RegisterFormContainer>
      <StyledCard>
        <CardHeader>
          <h2>Регистрация</h2>
          <p>Создайте учетную запись в IT Service Desk</p>
        </CardHeader>
        
        {error && (
          <Alert type="error" message={error} onClose={() => dispatch(clearAuthError())} />
        )}
        
        <Formik
          initialValues={{
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            fullName: '',
            department: '',
            acceptTerms: false
          }}
          validationSchema={RegisterSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, touched, errors, values, handleChange, handleBlur }) => (
            <StyledForm>
              <FormGroup>
                <InputWrapper>
                  <IconWrapper>
                    <FaUser />
                  </IconWrapper>
                  <Field
                    as={Input}
                    type="text"
                    name="username"
                    placeholder="Имя пользователя"
                    error={touched.username && errors.username}
                    disabled={isLoading}
                  />
                </InputWrapper>
                <ErrorMessage name="username" component={ErrorText} />
              </FormGroup>
              
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
                    error={touched.email && errors.email}
                    disabled={isLoading}
                  />
                </InputWrapper>
                <ErrorMessage name="email" component={ErrorText} />
              </FormGroup>
              
              <FormGroup>
                <InputWrapper>
                  <IconWrapper>
                    <FaIdCard />
                  </IconWrapper>
                  <Field
                    as={Input}
                    type="text"
                    name="fullName"
                    placeholder="Полное имя"
                    error={touched.fullName && errors.fullName}
                    disabled={isLoading}
                  />
                </InputWrapper>
                <ErrorMessage name="fullName" component={ErrorText} />
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
                    error={touched.password && errors.password}
                    disabled={isLoading}
                  />
                  <PasswordToggle onClick={togglePasswordVisibility}>
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
                    error={touched.confirmPassword && errors.confirmPassword}
                    disabled={isLoading}
                  />
                  <PasswordToggle onClick={toggleConfirmPasswordVisibility}>
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </PasswordToggle>
                </InputWrapper>
                <ErrorMessage name="confirmPassword" component={ErrorText} />
              </FormGroup>
              
              <FormGroup>
                <InputWrapper>
                  <IconWrapper>
                    <FaIdCard />
                  </IconWrapper>
                  <Field
                    as={DepartmentSelect}
                    name="department"
                    error={touched.department && errors.department}
                    disabled={isLoading}
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
                <CheckboxContainer>
                  <Field
                    type="checkbox"
                    name="acceptTerms"
                    id="acceptTerms"
                    disabled={isLoading}
                  />
                  <label htmlFor="acceptTerms">
                    Я принимаю <Link to="/terms">условия использования</Link> и <Link to="/privacy">политику конфиденциальности</Link>
                  </label>
                </CheckboxContainer>
                <ErrorMessage name="acceptTerms" component={ErrorText} />
              </FormGroup>
              
              <Button
                type="submit"
                disabled={isLoading || isSubmitting}
                fullWidth
              >
                {isLoading ? <Loader size="small" color="#fff" /> : 'Зарегистрироваться'}
              </Button>
              
              <FormFooter>
                Уже есть аккаунт? <Link to="/login">Войти</Link>
              </FormFooter>
            </StyledForm>
          )}
        </Formik>
      </StyledCard>
    </RegisterFormContainer>
  );
};

export default RegisterForm;