import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { FaLock, FaEnvelope, FaEye, FaEyeSlash } from 'react-icons/fa';

// Import components
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Card from '../../../components/common/Card';
import Alert from '../../../components/common/Alert';
import Loader from '../../../components/common/Loader';

// Import auth actions and selectors
import { login } from '../store/authSlice';
import { selectAuthLoading, selectAuthError, selectIsAuthenticated } from '../store/authSlice';

// Import styles
import styled from 'styled-components';

// Styled components
const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fb;
`;

const LoginCard = styled(Card)`
  width: 100%;
  max-width: 450px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const LoginHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const LoginTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
`;

const LoginSubtitle = styled.p`
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

const ForgotPasswordLink = styled(Link)`
  display: block;
  text-align: right;
  color: #3498db;
  font-size: 0.875rem;
  margin-top: -1rem;
  margin-bottom: 1.5rem;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const RegisterPrompt = styled.div`
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: #7f8c8d;
`;

const RegisterLink = styled(Link)`
  color: #3498db;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

// Validation schema
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Неверный формат email')
    .required('Email обязателен'),
  password: Yup.string()
    .min(6, 'Пароль должен содержать минимум 6 символов')
    .required('Пароль обязателен'),
  rememberMe: Yup.boolean()
});

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  
  const [showPassword, setShowPassword] = useState(false);
  
  // Get redirect path from location state or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);
  
  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await dispatch(login(values)).unwrap();
      toast.success('Вход выполнен успешно');
    } catch (err) {
      // Error is handled by the auth slice and displayed in the component
      setSubmitting(false);
    }
  };
  
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <LoginContainer>
      <LoginCard>
        <LoginHeader>
          <LoginTitle>Вход в систему</LoginTitle>
          <LoginSubtitle>IT Service Desk - управление инцидентами и оборудованием</LoginSubtitle>
        </LoginHeader>
        
        {error && <Alert type="error" message={error} />}
        
        <Formik
          initialValues={{
            email: '',
            password: '',
            rememberMe: false
          }}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, touched, errors }) => (
            <Form>
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
                    disabled={isLoading}
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
                    rightIcon
                    disabled={isLoading}
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
                <label>
                  <Field type="checkbox" name="rememberMe" />
                  <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem' }}>Запомнить меня</span>
                </label>
              </FormGroup>
              
              <ForgotPasswordLink to="/forgot-password">
                Забыли пароль?
              </ForgotPasswordLink>
              
              <Button
                type="submit"
                fullWidth
                disabled={isLoading || isSubmitting}
              >
                {isLoading ? <Loader size="small" color="white" /> : 'Войти'}
              </Button>
            </Form>
          )}
        </Formik>
        
        <RegisterPrompt>
          Нет учетной записи? <RegisterLink to="/register">Зарегистрироваться</RegisterLink>
        </RegisterPrompt>
      </LoginCard>
    </LoginContainer>
  );
};

export default LoginPage;