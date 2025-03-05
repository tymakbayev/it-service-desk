import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { FaLock, FaEye, FaEyeSlash, FaKey } from 'react-icons/fa';
import styled from 'styled-components';

// Import components
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Card from '../../../components/common/Card';
import Alert from '../../../components/common/Alert';
import Loader from '../../../components/common/Loader';

// Import auth actions and selectors
import { resetPassword } from '../authThunks';
import { selectAuthLoading, selectAuthError, selectIsAuthenticated } from '../authSlice';

// Styled components
const ResetPasswordContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fb;
  padding: 1rem;
`;

const ResetPasswordCard = styled(Card)`
  width: 100%;
  max-width: 450px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background-color: #ffffff;
`;

const ResetPasswordHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const ResetPasswordTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
`;

const ResetPasswordSubtitle = styled.p`
  color: #7f8c8d;
  font-size: 0.875rem;
  line-height: 1.5;
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

const SuccessMessage = styled.div`
  background-color: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 0.25rem;
  margin-bottom: 1.5rem;
  text-align: center;
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
const ResetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, 'Пароль должен содержать минимум 8 символов')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Пароль должен содержать хотя бы одну заглавную букву, одну строчную букву, одну цифру и один специальный символ'
    )
    .required('Пароль обязателен'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Пароли должны совпадать')
    .required('Подтверждение пароля обязательно')
});

const ResetPasswordPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useParams();
  
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  
  // Get token from URL if not in params
  const resetToken = token || new URLSearchParams(location.search).get('token');
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  // Validate token on component mount
  useEffect(() => {
    if (!resetToken) {
      setTokenValid(false);
    }
    // Here you could add an API call to validate the token
    // For now, we'll assume the token is valid if it exists
  }, [resetToken]);
  
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    if (!resetToken) {
      toast.error('Недействительный токен сброса пароля');
      return;
    }
    
    try {
      const result = await dispatch(resetPassword({ 
        token: resetToken, 
        password: values.password 
      })).unwrap();
      
      setResetSuccess(true);
      toast.success('Пароль успешно изменен');
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      toast.error(err.message || 'Не удалось сбросить пароль. Пожалуйста, попробуйте снова.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // If token is invalid, show error message
  if (!tokenValid) {
    return (
      <ResetPasswordContainer>
        <ResetPasswordCard>
          <ResetPasswordHeader>
            <ResetPasswordTitle>Ошибка сброса пароля</ResetPasswordTitle>
            <ResetPasswordSubtitle>
              Недействительный или истекший токен сброса пароля.
            </ResetPasswordSubtitle>
          </ResetPasswordHeader>
          
          <Alert type="error" message="Ссылка для сброса пароля недействительна или срок ее действия истек." />
          
          <LoginPrompt>
            <LoginLink to="/forgot-password">
              Запросить новую ссылку для сброса пароля
            </LoginLink>
          </LoginPrompt>
        </ResetPasswordCard>
      </ResetPasswordContainer>
    );
  }
  
  // If password reset was successful, show success message
  if (resetSuccess) {
    return (
      <ResetPasswordContainer>
        <ResetPasswordCard>
          <ResetPasswordHeader>
            <ResetPasswordTitle>Пароль изменен</ResetPasswordTitle>
            <ResetPasswordSubtitle>
              Ваш пароль был успешно изменен.
            </ResetPasswordSubtitle>
          </ResetPasswordHeader>
          
          <SuccessMessage>
            Вы будете перенаправлены на страницу входа через несколько секунд.
          </SuccessMessage>
          
          <LoginPrompt>
            <LoginLink to="/login">
              Перейти на страницу входа
            </LoginLink>
          </LoginPrompt>
        </ResetPasswordCard>
      </ResetPasswordContainer>
    );
  }
  
  return (
    <ResetPasswordContainer>
      <ResetPasswordCard>
        <ResetPasswordHeader>
          <ResetPasswordTitle>Сброс пароля</ResetPasswordTitle>
          <ResetPasswordSubtitle>
            Введите новый пароль для вашей учетной записи
          </ResetPasswordSubtitle>
        </ResetPasswordHeader>
        
        {error && <Alert type="error" message={error} />}
        
        <Formik
          initialValues={{ password: '', confirmPassword: '' }}
          validationSchema={ResetPasswordSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <FormGroup>
                <InputWrapper>
                  <IconWrapper>
                    <FaLock />
                  </IconWrapper>
                  <StyledInput
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Новый пароль"
                    error={errors.password && touched.password}
                  />
                  <PasswordToggle
                    type="button"
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </PasswordToggle>
                </InputWrapper>
                <ErrorMessage name="password" component={ErrorText} />
              </FormGroup>
              
              <FormGroup>
                <InputWrapper>
                  <IconWrapper>
                    <FaKey />
                  </IconWrapper>
                  <StyledInput
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Подтвердите пароль"
                    error={errors.confirmPassword && touched.confirmPassword}
                  />
                  <PasswordToggle
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    aria-label={showConfirmPassword ? 'Скрыть пароль' : 'Показать пароль'}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </PasswordToggle>
                </InputWrapper>
                <ErrorMessage name="confirmPassword" component={ErrorText} />
              </FormGroup>
              
              <SubmitButton
                type="submit"
                disabled={isSubmitting || isLoading}
              >
                {isLoading ? <Loader size="small" color="#ffffff" /> : 'Сбросить пароль'}
              </SubmitButton>
            </Form>
          )}
        </Formik>
        
        <LoginPrompt>
          Вспомнили пароль? <LoginLink to="/login">Войти</LoginLink>
        </LoginPrompt>
      </ResetPasswordCard>
    </ResetPasswordContainer>
  );
};

export default ResetPasswordPage;