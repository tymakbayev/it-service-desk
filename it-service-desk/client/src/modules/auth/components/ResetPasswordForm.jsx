import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaEye, FaEyeSlash, FaLock } from 'react-icons/fa';
import styled from 'styled-components';

import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Card from '../../../components/common/Card';
import Alert from '../../../components/common/Alert';
import Loader from '../../../components/common/Loader';

import { resetPassword, clearAuthError } from '../store/authSlice';

// Validation schema for reset password form
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

// Styled components
const ResetPasswordFormContainer = styled.div`
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

const SuccessMessage = styled.div`
  background-color: #e8f5e9;
  color: #2e7d32;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  text-align: center;
`;

/**
 * Reset Password form component
 * Allows users to reset their password using a token from the reset password email
 */
const ResetPasswordForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useParams();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  
  const { isLoading, error } = useSelector(state => state.auth);
  
  useEffect(() => {
    // Clear any existing auth errors when component mounts
    return () => {
      if (error) {
        dispatch(clearAuthError());
      }
    };
  }, [dispatch, error]);
  
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await dispatch(resetPassword({
        token,
        password: values.password
      })).unwrap();
      
      setResetSuccess(true);
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
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

  if (!token) {
    return (
      <ResetPasswordFormContainer>
        <StyledCard>
          <CardHeader>
            <h2>Ошибка сброса пароля</h2>
          </CardHeader>
          <Alert type="error" message="Недействительная ссылка для сброса пароля. Пожалуйста, запросите новую ссылку для сброса пароля." />
          <FormFooter>
            <Link to="/forgot-password">Запросить новую ссылку</Link>
          </FormFooter>
        </StyledCard>
      </ResetPasswordFormContainer>
    );
  }

  return (
    <ResetPasswordFormContainer>
      <StyledCard>
        <CardHeader>
          <h2>Сброс пароля</h2>
          <p>Введите новый пароль</p>
        </CardHeader>
        
        {resetSuccess && (
          <SuccessMessage>
            Пароль успешно изменен! Вы будете перенаправлены на страницу входа...
          </SuccessMessage>
        )}
        
        {error && (
          <Alert type="error" message={error} onClose={() => dispatch(clearAuthError())} />
        )}
        
        {!resetSuccess && (
          <Formik
            initialValues={{
              password: '',
              confirmPassword: ''
            }}
            validationSchema={ResetPasswordSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, touched, errors }) => (
              <StyledForm>
                <FormGroup>
                  <InputWrapper>
                    <IconWrapper>
                      <FaLock />
                    </IconWrapper>
                    <Field
                      as={Input}
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Новый пароль"
                      error={touched.password && errors.password}
                      disabled={isLoading}
                    />
                    <PasswordToggle type="button" onClick={togglePasswordVisibility}>
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
                    <PasswordToggle type="button" onClick={toggleConfirmPasswordVisibility}>
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </PasswordToggle>
                  </InputWrapper>
                  <ErrorMessage name="confirmPassword" component={ErrorText} />
                </FormGroup>
                
                <Button 
                  type="submit" 
                  variant="primary" 
                  fullWidth 
                  disabled={isLoading || isSubmitting}
                >
                  {isLoading ? <Loader size="small" color="white" /> : 'Сбросить пароль'}
                </Button>
              </StyledForm>
            )}
          </Formik>
        )}
        
        <FormFooter>
          <p>Вспомнили пароль? <Link to="/login">Войти</Link></p>
        </FormFooter>
      </StyledCard>
    </ResetPasswordFormContainer>
  );
};

export default ResetPasswordForm;