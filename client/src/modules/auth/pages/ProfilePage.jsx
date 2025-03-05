import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaIdCard, FaBuilding, FaPhone, FaEdit, FaKey, FaEye, FaEyeSlash } from 'react-icons/fa';

// Import components
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Card from '../../../components/common/Card';
import Alert from '../../../components/common/Alert';
import Loader from '../../../components/common/Loader';
import Modal from '../../../components/common/Modal';

// Import layout components
import Layout from '../../../components/Layout';

// Import auth actions and selectors
import { updateProfile, changePassword, selectCurrentUser, selectAuthLoading, selectAuthError } from '../store/authSlice';

// Import styles
import styled from 'styled-components';

// Styled components
const ProfileContainer = styled.div`
  padding: 1.5rem;
`;

const ProfileHeader = styled.div`
  margin-bottom: 2rem;
`;

const ProfileTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
`;

const ProfileSubtitle = styled.p`
  color: #7f8c8d;
  font-size: 0.875rem;
`;

const ProfileGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  
  @media (min-width: 992px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const ProfileCard = styled(Card)`
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e0e0e0;
`;

const CardTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
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

const FormRow = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0;
  }
`;

const ProfileInfo = styled.div`
  margin-bottom: 1.5rem;
`;

const ProfileInfoItem = styled.div`
  display: flex;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ProfileInfoLabel = styled.div`
  width: 40%;
  color: #7f8c8d;
  font-weight: 500;
  font-size: 0.875rem;
`;

const ProfileInfoValue = styled.div`
  width: 60%;
  color: #2c3e50;
  font-weight: 400;
`;

const AvatarSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
`;

const Avatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: #3498db;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: 600;
  margin-bottom: 1rem;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const AvatarUpload = styled.div`
  margin-top: 0.5rem;
`;

const AvatarUploadButton = styled.label`
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: #f0f0f0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  
  &:hover {
    background-color: #e0e0e0;
  }
  
  input {
    display: none;
  }
`;

const RoleBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  background-color: ${props => {
    switch (props.role) {
      case 'admin':
        return '#e74c3c';
      case 'manager':
        return '#f39c12';
      case 'user':
        return '#3498db';
      default:
        return '#95a5a6';
    }
  }};
  color: white;
`;

// Validation schemas
const ProfileSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, 'Имя должно содержать минимум 2 символа')
    .max(50, 'Имя должно содержать максимум 50 символов')
    .required('Имя обязательно'),
  lastName: Yup.string()
    .min(2, 'Фамилия должна содержать минимум 2 символа')
    .max(50, 'Фамилия должна содержать максимум 50 символов')
    .required('Фамилия обязательна'),
  email: Yup.string()
    .email('Неверный формат email')
    .required('Email обязателен'),
  department: Yup.string()
    .required('Отдел обязателен'),
  position: Yup.string()
    .required('Должность обязательна'),
  phone: Yup.string()
    .matches(/^\+?[0-9]{10,15}$/, 'Неверный формат телефона')
    .nullable()
});

const PasswordSchema = Yup.object().shape({
  currentPassword: Yup.string()
    .required('Текущий пароль обязателен'),
  newPassword: Yup.string()
    .min(8, 'Пароль должен содержать минимум 8 символов')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Пароль должен содержать хотя бы одну заглавную букву, одну строчную букву, одну цифру и один специальный символ'
    )
    .required('Новый пароль обязателен'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Пароли должны совпадать')
    .required('Подтверждение пароля обязательно')
});

const ProfilePage = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  
  // Get user initials for avatar
  const getInitials = () => {
    if (!currentUser) return '';
    return `${currentUser.firstName.charAt(0)}${currentUser.lastName.charAt(0)}`.toUpperCase();
  };
  
  // Format role for display
  const formatRole = (role) => {
    if (!role) return 'Пользователь';
    
    switch (role) {
      case 'admin':
        return 'Администратор';
      case 'manager':
        return 'Менеджер';
      case 'user':
        return 'Пользователь';
      default:
        return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };
  
  // Handle avatar change
  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle profile update
  const handleProfileUpdate = async (values, { setSubmitting }) => {
    try {
      const profileData = {
        ...values,
        avatar: avatarPreview || currentUser.avatar
      };
      
      await dispatch(updateProfile(profileData)).unwrap();
      toast.success('Профиль успешно обновлен');
      setIsEditMode(false);
    } catch (err) {
      toast.error(err.message || 'Ошибка при обновлении профиля');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle password change
  const handlePasswordChange = async (values, { setSubmitting, resetForm }) => {
    try {
      await dispatch(changePassword(values)).unwrap();
      toast.success('Пароль успешно изменен');
      setIsPasswordModalOpen(false);
      resetForm();
    } catch (err) {
      toast.error(err.message || 'Ошибка при изменении пароля');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };
  
  // Toggle password modal
  const togglePasswordModal = () => {
    setIsPasswordModalOpen(!isPasswordModalOpen);
  };
  
  if (!currentUser) {
    return (
      <Layout>
        <ProfileContainer>
          <Loader />
        </ProfileContainer>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <ProfileContainer>
        <ProfileHeader>
          <ProfileTitle>Профиль пользователя</ProfileTitle>
          <ProfileSubtitle>Управление личной информацией и настройками безопасности</ProfileSubtitle>
        </ProfileHeader>
        
        <ProfileGrid>
          {/* Personal Information Card */}
          <ProfileCard>
            <CardHeader>
              <CardTitle>Личная информация</CardTitle>
              {!isEditMode ? (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={toggleEditMode}
                  icon={<FaEdit />}
                >
                  Редактировать
                </Button>
              ) : null}
            </CardHeader>
            
            {isEditMode ? (
              <Formik
                initialValues={{
                  firstName: currentUser.firstName || '',
                  lastName: currentUser.lastName || '',
                  email: currentUser.email || '',
                  department: currentUser.department || '',
                  position: currentUser.position || '',
                  phone: currentUser.phone || ''
                }}
                validationSchema={ProfileSchema}
                onSubmit={handleProfileUpdate}
              >
                {({ isSubmitting, errors, touched }) => (
                  <Form>
                    <AvatarSection>
                      <Avatar>
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="User avatar" />
                        ) : currentUser.avatar ? (
                          <img src={currentUser.avatar} alt="User avatar" />
                        ) : (
                          getInitials()
                        )}
                      </Avatar>
                      <AvatarUpload>
                        <AvatarUploadButton>
                          Загрузить фото
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleAvatarChange} 
                          />
                        </AvatarUploadButton>
                      </AvatarUpload>
                    </AvatarSection>
                    
                    <FormRow>
                      <FormGroup>
                        <InputWrapper>
                          <IconWrapper>
                            <FaUser />
                          </IconWrapper>
                          <Field
                            as={Input}
                            type="text"
                            name="firstName"
                            placeholder="Имя"
                            leftIcon
                            className={errors.firstName && touched.firstName ? 'error' : ''}
                          />
                        </InputWrapper>
                        <ErrorMessage name="firstName" component={ErrorText} />
                      </FormGroup>
                      
                      <FormGroup>
                        <InputWrapper>
                          <IconWrapper>
                            <FaUser />
                          </IconWrapper>
                          <Field
                            as={Input}
                            type="text"
                            name="lastName"
                            placeholder="Фамилия"
                            leftIcon
                            className={errors.lastName && touched.lastName ? 'error' : ''}
                          />
                        </InputWrapper>
                        <ErrorMessage name="lastName" component={ErrorText} />
                      </FormGroup>
                    </FormRow>
                    
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
                          className={errors.email && touched.email ? 'error' : ''}
                        />
                      </InputWrapper>
                      <ErrorMessage name="email" component={ErrorText} />
                    </FormGroup>
                    
                    <FormGroup>
                      <InputWrapper>
                        <IconWrapper>
                          <FaBuilding />
                        </IconWrapper>
                        <Field
                          as={Input}
                          type="text"
                          name="department"
                          placeholder="Отдел"
                          leftIcon
                          className={errors.department && touched.department ? 'error' : ''}
                        />
                      </InputWrapper>
                      <ErrorMessage name="department" component={ErrorText} />
                    </FormGroup>
                    
                    <FormGroup>
                      <InputWrapper>
                        <IconWrapper>
                          <FaIdCard />
                        </IconWrapper>
                        <Field
                          as={Input}
                          type="text"
                          name="position"
                          placeholder="Должность"
                          leftIcon
                          className={errors.position && touched.position ? 'error' : ''}
                        />
                      </InputWrapper>
                      <ErrorMessage name="position" component={ErrorText} />
                    </FormGroup>
                    
                    <FormGroup>
                      <InputWrapper>
                        <IconWrapper>
                          <FaPhone />
                        </IconWrapper>
                        <Field
                          as={Input}
                          type="text"
                          name="phone"
                          placeholder="Телефон"
                          leftIcon
                          className={errors.phone && touched.phone ? 'error' : ''}
                        />
                      </InputWrapper>
                      <ErrorMessage name="phone" component={ErrorText} />
                    </FormGroup>
                    
                    {error && <Alert type="error" message={error} />}
                    
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={toggleEditMode}
                        disabled={isSubmitting}
                      >
                        Отмена
                      </Button>
                      <Button 
                        type="submit" 
                        variant="primary" 
                        disabled={isSubmitting}
                        isLoading={isSubmitting}
                      >
                        Сохранить
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            ) : (
              <>
                <AvatarSection>
                  <Avatar>
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt="User avatar" />
                    ) : (
                      getInitials()
                    )}
                  </Avatar>
                  <RoleBadge role={currentUser.role}>{formatRole(currentUser.role)}</RoleBadge>
                </AvatarSection>
                
                <ProfileInfo>
                  <ProfileInfoItem>
                    <ProfileInfoLabel>Имя</ProfileInfoLabel>
                    <ProfileInfoValue>{currentUser.firstName}</ProfileInfoValue>
                  </ProfileInfoItem>
                  
                  <ProfileInfoItem>
                    <ProfileInfoLabel>Фамилия</ProfileInfoLabel>
                    <ProfileInfoValue>{currentUser.lastName}</ProfileInfoValue>
                  </ProfileInfoItem>
                  
                  <ProfileInfoItem>
                    <ProfileInfoLabel>Email</ProfileInfoLabel>
                    <ProfileInfoValue>{currentUser.email}</ProfileInfoValue>
                  </ProfileInfoItem>
                  
                  <ProfileInfoItem>
                    <ProfileInfoLabel>Отдел</ProfileInfoLabel>
                    <ProfileInfoValue>{currentUser.department || '—'}</ProfileInfoValue>
                  </ProfileInfoItem>
                  
                  <ProfileInfoItem>
                    <ProfileInfoLabel>Должность</ProfileInfoLabel>
                    <ProfileInfoValue>{currentUser.position || '—'}</ProfileInfoValue>
                  </ProfileInfoItem>
                  
                  <ProfileInfoItem>
                    <ProfileInfoLabel>Телефон</ProfileInfoLabel>
                    <ProfileInfoValue>{currentUser.phone || '—'}</ProfileInfoValue>
                  </ProfileInfoItem>
                </ProfileInfo>
              </>
            )}
          </ProfileCard>
          
          {/* Security Card */}
          <ProfileCard>
            <CardHeader>
              <CardTitle>Безопасность</CardTitle>
            </CardHeader>
            
            <ProfileInfo>
              <ProfileInfoItem>
                <ProfileInfoLabel>Пароль</ProfileInfoLabel>
                <ProfileInfoValue>••••••••</ProfileInfoValue>
              </ProfileInfoItem>
              
              <ProfileInfoItem>
                <ProfileInfoLabel>Последний вход</ProfileInfoLabel>
                <ProfileInfoValue>
                  {currentUser.lastLogin 
                    ? new Date(currentUser.lastLogin).toLocaleString() 
                    : 'Нет данных'}
                </ProfileInfoValue>
              </ProfileInfoItem>
              
              <ProfileInfoItem>
                <ProfileInfoLabel>Дата регистрации</ProfileInfoLabel>
                <ProfileInfoValue>
                  {currentUser.createdAt 
                    ? new Date(currentUser.createdAt).toLocaleDateString() 
                    : 'Нет данных'}
                </ProfileInfoValue>
              </ProfileInfoItem>
            </ProfileInfo>
            
            <div style={{ marginTop: '1rem' }}>
              <Button 
                type="button" 
                variant="outline" 
                onClick={togglePasswordModal}
                icon={<FaKey />}
                fullWidth
              >
                Изменить пароль
              </Button>
            </div>
          </ProfileCard>
        </ProfileGrid>
        
        {/* Password Change Modal */}
        <Modal
          isOpen={isPasswordModalOpen}
          onClose={togglePasswordModal}
          title="Изменение пароля"
        >
          <Formik
            initialValues={{
              currentPassword: '',
              newPassword: '',
              confirmPassword: ''
            }}
            validationSchema={PasswordSchema}
            onSubmit={handlePasswordChange}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form>
                <FormGroup>
                  <InputWrapper>
                    <IconWrapper>
                      <FaKey />
                    </IconWrapper>
                    <Field
                      as={Input}
                      type={showCurrentPassword ? 'text' : 'password'}
                      name="currentPassword"
                      placeholder="Текущий пароль"
                      leftIcon
                      className={errors.currentPassword && touched.currentPassword ? 'error' : ''}
                    />
                    <PasswordToggle
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                    </PasswordToggle>
                  </InputWrapper>
                  <ErrorMessage name="currentPassword" component={ErrorText} />
                </FormGroup>
                
                <FormGroup>
                  <InputWrapper>
                    <IconWrapper>
                      <FaKey />
                    </IconWrapper>
                    <Field
                      as={Input}
                      type={showNewPassword ? 'text' : 'password'}
                      name="newPassword"
                      placeholder="Новый пароль"
                      leftIcon
                      className={errors.newPassword && touched.newPassword ? 'error' : ''}
                    />
                    <PasswordToggle
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </PasswordToggle>
                  </InputWrapper>
                  <ErrorMessage name="newPassword" component={ErrorText} />
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
                      leftIcon
                      className={errors.confirmPassword && touched.confirmPassword ? 'error' : ''}
                    />
                    <PasswordToggle
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </PasswordToggle>
                  </InputWrapper>
                  <ErrorMessage name="confirmPassword" component={ErrorText} />
                </FormGroup>
                
                {error && <Alert type="error" message={error} />}
                
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={togglePasswordModal}
                    disabled={isSubmitting}
                  >
                    Отмена
                  </Button>
                  <Button 
                    type="submit" 
                    variant="primary" 
                    disabled={isSubmitting}
                    isLoading={isSubmitting}
                  >
                    Изменить пароль
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </Modal>
      </ProfileContainer>
    </Layout>
  );
};

export default ProfilePage;