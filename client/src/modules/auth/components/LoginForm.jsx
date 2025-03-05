import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaEye, FaEyeSlash, FaLock, FaUser } from 'react-icons/fa';
import styled from 'styled-components';

import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Card from '../../../components/common/Card';
import Alert from '../../../components/common/Alert';
import Loader from '../../../components/common/Loader';

import { login } from '../store/authSlice';
import { clearAuthError } from '../store/authSlice';

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Неверный формат email')
    .required('Email обязателен'),
  password: Yup.string()
    .min(6, 'Пароль должен содержать минимум 6 символов')
    .required('Пароль обязателен'),
  rememberMe: Yup.boolean()
});

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  
  const { isLoading, error, isAuthenticated, user } = useSelector(state => state.auth);
  
  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated && user) {
      // Redirect based on user role
      if (user.role === 'ADMIN') {
        navigate('/dashboard');
      } else if (user.role === 'TECHNICIAN') {
        navigate('/incidents');
      } else {
        navigate('/dashboard');
      }
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
      await dispatch(login({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe
      })).unwrap();
      
      // Navigation will happen in useEffect after auth state updates
    } catch (err) {
      // Error is handled by the redux slice
      setSubmitting(false);
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <LoginFormContainer>
      <StyledCard>
        <CardHeader>
          <h2>Вход в систему</h2>
          <p>IT Service Desk</p>
        </CardHeader>
        
        {error && (
          <Alert type="error" message={error} onClose={() => dispatch(clearAuthError())} />
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
          {({ isSubmitting, touched, errors }) => (
            <StyledForm>
              <FormGroup>
                <InputWrapper>
                  <IconWrapper>
                    <FaUser />
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
                  <PasswordToggle type="button" onClick={togglePasswordVisibility}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </PasswordToggle>
                </InputWrapper>
                <ErrorMessage name="password" component={ErrorText} />
              </FormGroup>
              
              <CheckboxContainer>
                <Field type="checkbox" name="rememberMe" id="rememberMe" />
                <label htmlFor="rememberMe">Запомнить меня</label>
              </CheckboxContainer>
              
              <Button 
                type="submit" 
                disabled={isLoading || isSubmitting}
                fullWidth
              >
                {isLoading ? <Loader size="small" color="white" /> : 'Войти'}
              </Button>
              
              <LinksContainer>
                <StyledLink to="/auth/forgot-password">
                  Забыли пароль?
                </StyledLink>
                <StyledLink to="/auth/register">
                  Зарегистрироваться
                </StyledLink>
              </LinksContainer>
            </StyledForm>
          )}
        </Formik>
      </StyledCard>
    </LoginFormContainer>
  );
};

// Styled Components
const LoginFormContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background-color: #f5f7fb;
`;

const StyledCard = styled(Card)`
  width: 100%;
  max-width: 420px;
  padding: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
`;

const CardHeader = styled.div`
  text-align: center;
  margin-bottom: 30px;
  
  h2 {
    font-size: 24px;
    color: #333;
    margin-bottom: 8px;
  }
  
  p {
    color: #666;
    font-size: 16px;
  }
`;

const StyledForm = styled(Form)`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const IconWrapper = styled.div`
  position: absolute;
  left: 12px;
  color: #6b7280;
  font-size: 16px;
  z-index: 1;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 16px;
  
  &:hover {
    color: #4b5563;
  }
  
  &:focus {
    outline: none;
  }
`;

const ErrorText = styled.div`
  color: #dc2626;
  font-size: 12px;
  margin-top: 4px;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
  }
  
  label {
    font-size: 14px;
    color: #4b5563;
    cursor: pointer;
  }
`;

const LinksContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
`;

const StyledLink = styled(Link)`
  color: #3b82f6;
  font-size: 14px;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

export default LoginForm;