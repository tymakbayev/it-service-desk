import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaEnvelope } from 'react-icons/fa';
import styled from 'styled-components';

import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Card from '../../../components/common/Card';
import Alert from '../../../components/common/Alert';
import Loader from '../../../components/common/Loader';

import { forgotPassword, clearAuthError } from '../store/authSlice';

// Validation schema for forgot password form
const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Неверный формат email')
    .required('Email обязателен')
});

// Styled components
const ForgotPasswordFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 450px;
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

const ErrorText = styled.div`
  color: #e53935;
  font-size: 0.8rem;
  margin-top: 0.25rem;
`;

const FormFooter = styled.div`
  margin-top: 1.5rem;
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
  border: 1px solid #a5d6a7;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  color: #2e7d32;
  font-size: 0.95rem;
  line-height: 1.5;
`;

/**
 * Forgot Password form component
 * Allows users to request a password reset link
 */
const ForgotPasswordForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [emailSent, setEmailSent] = useState(false);
  
  const { isLoading, error } = useSelector(state => state.auth);
  
  useEffect(() => {
    // Clear any existing auth errors when component mounts
    return () => {
      if (error) {
        dispatch(clearAuthError());
      }
    };
  }, [dispatch, error]);
  
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await dispatch(forgotPassword({
        email: values.email
      })).unwrap();
      
      // Show success message
      setEmailSent(true);
      resetForm();
    } catch (err) {
      // Error is handled by the redux slice
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ForgotPasswordFormContainer>
      <StyledCard>
        <CardHeader>
          <h2>Восстановление пароля</h2>
          <p>Введите email для получения инструкций</p>
        </CardHeader>
        
        {error && (
          <Alert 
            type="error" 
            message={error} 
            onClose={() => dispatch(clearAuthError())} 
          />
        )}
        
        {emailSent && (
          <SuccessMessage>
            Инструкции по восстановлению пароля отправлены на указанный email. 
            Пожалуйста, проверьте вашу почту и следуйте инструкциям в письме.
          </SuccessMessage>
        )}
        
        <Formik
          initialValues={{
            email: ''
          }}
          validationSchema={ForgotPasswordSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, touched, errors }) => (
            <StyledForm>
              <FormGroup>
                <InputWrapper>
                  <IconWrapper>
                    <FaEnvelope />
                  </IconWrapper>
                  <Field
                    as={Input}
                    type="email"
                    name="email"
                    placeholder="Введите ваш email"
                    error={touched.email && errors.email}
                    disabled={isLoading || emailSent}
                  />
                </InputWrapper>
                <ErrorMessage name="email" component={ErrorText} />
              </FormGroup>
              
              <Button 
                type="submit" 
                variant="primary" 
                fullWidth 
                disabled={isLoading || emailSent}
              >
                {isLoading ? <Loader size="small" color="#ffffff" /> : 'Отправить инструкции'}
              </Button>
              
              <FormFooter>
                <div>
                  Вспомнили пароль? <Link to="/login">Вернуться к входу</Link>
                </div>
              </FormFooter>
            </StyledForm>
          )}
        </Formik>
      </StyledCard>
    </ForgotPasswordFormContainer>
  );
};

export default ForgotPasswordForm;