import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { FaLock, FaEnvelope, FaEye, FaEyeSlash } from 'react-icons/fa';
import styled from 'styled-components';

// Import components
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Card from '../../../components/common/Card';
import Alert from '../../../components/common/Alert';
import Loader from '../../../components/common/Loader';

// Import auth actions and selectors
import { login } from '../authThunks';
import { selectAuthLoading, selectAuthError, selectIsAuthenticated } from '../authSlice';

// Styled components
const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fb;
  padding: 1rem;
`;

const LoginCard = styled(Card)`
  width: 100%;
  max-width: 450px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background-color: #ffffff;
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
  z-index: 1;
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

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.875rem;
  color: #2c3e50;
`;

const Checkbox = styled.input`
  margin-right: 0.5rem;
  cursor: pointer;
`;

const StyledInput = styled(Input)`
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
          <LoginSubtitle>
            Войдите в IT Service Desk для управления инцидентами и оборудованием
          </LoginSubtitle>
        </LoginHeader>

        {error && (
          <Alert type="error" message={error} style={{ marginBottom: '1.5rem' }} />
        )}

        <Formik
          initialValues={{
            email: '',
            password: '',
            rememberMe: false
          }}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            isSubmitting,
            setFieldValue
          }) => (
            <Form>
              <FormGroup>
                <InputWrapper>
                  <IconWrapper>
                    <FaEnvelope />
                  </IconWrapper>
                  <StyledInput
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.email && errors.email}
                  />
                </InputWrapper>
                {touched.email && errors.email && (
                  <ErrorText>{errors.email}</ErrorText>
                )}
              </FormGroup>

              <FormGroup>
                <InputWrapper>
                  <IconWrapper>
                    <FaLock />
                  </IconWrapper>
                  <StyledInput
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Пароль"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
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
                {touched.password && errors.password && (
                  <ErrorText>{errors.password}</ErrorText>
                )}
              </FormGroup>

              <CheckboxContainer>
                <CheckboxLabel>
                  <Checkbox
                    type="checkbox"
                    name="rememberMe"
                    checked={values.rememberMe}
                    onChange={() => setFieldValue('rememberMe', !values.rememberMe)}
                  />
                  Запомнить меня
                </CheckboxLabel>
              </CheckboxContainer>

              <ForgotPasswordLink to="/forgot-password">
                Забыли пароль?
              </ForgotPasswordLink>

              <SubmitButton
                type="submit"
                disabled={isSubmitting || isLoading}
              >
                {isLoading ? <Loader size="small" color="#ffffff" /> : 'Войти'}
              </SubmitButton>
            </Form>
          )}
        </Formik>

        <RegisterPrompt>
          Нет учетной записи?{' '}
          <RegisterLink to="/register">Зарегистрироваться</RegisterLink>
        </RegisterPrompt>
      </LoginCard>
    </LoginContainer>
  );
};

export default LoginPage;