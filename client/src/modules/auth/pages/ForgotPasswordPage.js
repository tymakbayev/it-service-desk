import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import styled from 'styled-components';

// Import components
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Card from '../../../components/common/Card';
import Alert from '../../../components/common/Alert';
import Loader from '../../../components/common/Loader';

// Import auth actions and selectors
import { forgotPassword } from '../authThunks';
import { selectAuthLoading, selectAuthError, selectIsAuthenticated } from '../authSlice';

// Styled components
const ForgotPasswordContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fb;
  padding: 1rem;
`;

const ForgotPasswordCard = styled(Card)`
  width: 100%;
  max-width: 450px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background-color: #ffffff;
`;

const ForgotPasswordHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const ForgotPasswordTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
`;

const ForgotPasswordSubtitle = styled.p`
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

const BackToLoginLink = styled(Link)`
  display: flex;
  align-items: center;
  color: #3498db;
  font-size: 0.875rem;
  margin-top: 1.5rem;
  text-decoration: none;
  
  svg {
    margin-right: 0.5rem;
  }
  
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
const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Неверный формат email')
    .required('Email обязателен')
});

const ForgotPasswordPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  
  const [emailSent, setEmailSent] = useState(false);
  const [sentToEmail, setSentToEmail] = useState('');
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await dispatch(forgotPassword(values.email)).unwrap();
      setEmailSent(true);
      setSentToEmail(values.email);
      toast.success('Инструкции по сбросу пароля отправлены на ваш email');
    } catch (err) {
      // Error is handled by the auth slice and displayed in the component
      toast.error(err?.message || 'Не удалось отправить инструкции по сбросу пароля');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <ForgotPasswordContainer>
      <ForgotPasswordCard>
        <ForgotPasswordHeader>
          <ForgotPasswordTitle>Восстановление пароля</ForgotPasswordTitle>
          <ForgotPasswordSubtitle>
            Введите ваш email, и мы отправим вам инструкции по сбросу пароля
          </ForgotPasswordSubtitle>
        </ForgotPasswordHeader>
        
        {error && <Alert type="error" message={error} />}
        
        {emailSent ? (
          <SuccessMessage>
            <p>Инструкции по сбросу пароля отправлены на адрес <strong>{sentToEmail}</strong></p>
            <p>Пожалуйста, проверьте вашу электронную почту и следуйте инструкциям для сброса пароля.</p>
          </SuccessMessage>
        ) : (
          <Formik
            initialValues={{ email: '' }}
            validationSchema={ForgotPasswordSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, touched, errors }) => (
              <Form>
                <FormGroup>
                  <InputWrapper>
                    <IconWrapper>
                      <FaEnvelope />
                    </IconWrapper>
                    <StyledInput
                      type="email"
                      name="email"
                      placeholder="Введите ваш email"
                      error={touched.email && errors.email}
                    />
                  </InputWrapper>
                  <ErrorMessage name="email" component={ErrorText} />
                </FormGroup>
                
                <SubmitButton
                  type="submit"
                  disabled={isSubmitting || isLoading}
                >
                  {isLoading ? <Loader size="small" color="#ffffff" /> : 'Отправить инструкции'}
                </SubmitButton>
              </Form>
            )}
          </Formik>
        )}
        
        <BackToLoginLink to="/login">
          <FaArrowLeft />
          Вернуться на страницу входа
        </BackToLoginLink>
      </ForgotPasswordCard>
    </ForgotPasswordContainer>
  );
};

export default ForgotPasswordPage;