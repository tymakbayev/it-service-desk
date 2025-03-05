import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';

// Import components
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Card from '../../../components/common/Card';
import Alert from '../../../components/common/Alert';
import Loader from '../../../components/common/Loader';

// Import auth actions and selectors
import { forgotPassword } from '../store/authSlice';
import { selectAuthLoading, selectAuthError, selectIsAuthenticated } from '../store/authSlice';

// Import styles
import styled from 'styled-components';

// Styled components
const ForgotPasswordContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fb;
`;

const ForgotPasswordCard = styled(Card)`
  width: 100%;
  max-width: 450px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
      await dispatch(forgotPassword(values)).unwrap();
      setEmailSent(true);
      setSentToEmail(values.email);
      toast.success('Инструкции по сбросу пароля отправлены на ваш email');
    } catch (err) {
      // Error is handled by the auth slice and displayed in the component
      toast.error('Не удалось отправить инструкции по сбросу пароля');
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
          <>
            <SuccessMessage>
              <p>Мы отправили инструкции по сбросу пароля на адрес:</p>
              <strong>{sentToEmail}</strong>
              <p>Пожалуйста, проверьте вашу электронную почту и следуйте инструкциям.</p>
            </SuccessMessage>
            <Button 
              type="button" 
              variant="primary" 
              fullWidth 
              onClick={() => navigate('/login')}
            >
              Вернуться на страницу входа
            </Button>
          </>
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
                    <Field
                      as={Input}
                      type="email"
                      name="email"
                      placeholder="Введите ваш email"
                      leftIcon
                      error={touched.email && errors.email}
                    />
                  </InputWrapper>
                  <ErrorMessage name="email" component={ErrorText} />
                </FormGroup>
                
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={isSubmitting || isLoading}
                >
                  {isLoading ? <Loader size="sm" color="#ffffff" /> : 'Отправить инструкции'}
                </Button>
                
                <BackToLoginLink to="/login">
                  <FaArrowLeft />
                  Вернуться на страницу входа
                </BackToLoginLink>
              </Form>
            )}
          </Formik>
        )}
      </ForgotPasswordCard>
    </ForgotPasswordContainer>
  );
};

export default ForgotPasswordPage;