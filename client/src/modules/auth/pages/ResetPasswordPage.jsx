import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { FaLock, FaEye, FaEyeSlash, FaKey } from 'react-icons/fa';

// Import components
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Card from '../../../components/common/Card';
import Alert from '../../../components/common/Alert';
import Loader from '../../../components/common/Loader';

// Import auth actions and selectors
import { resetPassword } from '../store/authSlice';
import { selectAuthLoading, selectAuthError, selectIsAuthenticated } from '../store/authSlice';

// Import styles
import styled from 'styled-components';

// Styled components
const ResetPasswordContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fb;
`;

const ResetPasswordCard = styled(Card)`
  width: 100%;
  max-width: 450px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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

const SuccessMessage = styled.div`
  background-color: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 0.25rem;
  margin-bottom: 1.5rem;
  text-align: center;
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
      navigate('/dashboard', { replace: true });
    }
    
    // Validate token
    if (!resetToken) {
      setTokenValid(false);
      toast.error('Недействительный или отсутствующий токен сброса пароля');
    }
  }, [isAuthenticated, navigate, resetToken]);
  
  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await dispatch(resetPassword({ 
        token: resetToken, 
        password: values.password 
      })).unwrap();
      
      setResetSuccess(true);
      toast.success('Пароль успешно изменен');
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
    } catch (err) {
      toast.error(err?.message || 'Не удалось сбросить пароль. Пожалуйста, попробуйте снова.');
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
  
  if (!tokenValid) {
    return (
      <ResetPasswordContainer>
        <ResetPasswordCard>
          <ResetPasswordHeader>
            <ResetPasswordTitle>Ошибка сброса пароля</ResetPasswordTitle>
            <ResetPasswordSubtitle>
              Недействительный или отсутствующий токен сброса пароля
            </ResetPasswordSubtitle>
          </ResetPasswordHeader>
          
          <Alert type="error" message="Ссылка для сброса пароля недействительна или срок её действия истек." />
          
          <LoginPrompt>
            <Link to="/forgot-password">
              <Button type="button" fullWidth>
                Запросить новую ссылку
              </Button>
            </Link>
          </LoginPrompt>
          
          <LoginPrompt>
            Вернуться на <LoginLink to="/login">страницу входа</LoginLink>
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
        
        {resetSuccess ? (
          <>
            <SuccessMessage>
              Ваш пароль был успешно изменен. Вы будете перенаправлены на страницу входа через несколько секунд.
            </SuccessMessage>
            <LoginPrompt>
              <LoginLink to="/login">Нажмите здесь, если вы не были перенаправлены автоматически</LoginLink>
            </LoginPrompt>
          </>
        ) : (
          <>
            <Formik
              initialValues={{
                password: '',
                confirmPassword: ''
              }}
              validationSchema={ResetPasswordSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, touched, errors }) => (
                <Form>
                  <FormGroup>
                    <InputWrapper>
                      <IconWrapper>
                        <FaLock />
                      </IconWrapper>
                      <Field
                        as={Input}
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="Новый пароль"
                        icon={<FaLock />}
                        hasError={touched.password && errors.password}
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
                        <FaKey />
                      </IconWrapper>
                      <Field
                        as={Input}
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        placeholder="Подтвердите пароль"
                        icon={<FaKey />}
                        hasError={touched.confirmPassword && errors.confirmPassword}
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
                  
                  <Button
                    type="submit"
                    fullWidth
                    disabled={isSubmitting || isLoading}
                  >
                    {isLoading ? <Loader size="sm" color="#ffffff" /> : 'Сбросить пароль'}
                  </Button>
                </Form>
              )}
            </Formik>
            
            <LoginPrompt>
              Вспомнили пароль? <LoginLink to="/login">Войти</LoginLink>
            </LoginPrompt>
          </>
        )}
      </ResetPasswordCard>
    </ResetPasswordContainer>
  );
};

export default ResetPasswordPage;