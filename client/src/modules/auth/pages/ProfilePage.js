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
import { updateProfile, changePassword } from '../authThunks';
import { selectCurrentUser, selectAuthLoading, selectAuthError } from '../authSlice';

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

const ActionButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const StyledField = styled(Field)`
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
  phone: Yup.string()
    .matches(/^\+?[0-9]{10,15}$/, 'Неверный формат телефона')
    .required('Телефон обязателен'),
});

const PasswordSchema = Yup.object().shape({
  currentPassword: Yup.string()
    .min(8, 'Пароль должен содержать минимум 8 символов')
    .required('Текущий пароль обязателен'),
  newPassword: Yup.string()
    .min(8, 'Пароль должен содержать минимум 8 символов')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Пароль должен содержать минимум одну заглавную букву, одну строчную букву, одну цифру и один специальный символ'
    )
    .required('Новый пароль обязателен'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Пароли должны совпадать')
    .required('Подтверждение пароля обязательно'),
});

const ProfilePage = () => {
  const dispatch = useDispatch();
  
  const currentUser = useSelector(selectCurrentUser);
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  
  const [editMode, setEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  
  useEffect(() => {
    // Set avatar preview if user has an avatar
    if (currentUser && currentUser.avatar) {
      setAvatarPreview(currentUser.avatar);
    }
  }, [currentUser]);
  
  // Handle avatar file change
  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAvatarFile(file);
      
      // Create preview URL
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
      // Create form data for file upload
      const formData = new FormData();
      Object.keys(values).forEach(key => {
        formData.append(key, values[key]);
      });
      
      // Add avatar file if exists
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      
      await dispatch(updateProfile(formData)).unwrap();
      setEditMode(false);
      toast.success('Профиль успешно обновлен');
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
      setShowPasswordModal(false);
      resetForm();
      toast.success('Пароль успешно изменен');
    } catch (err) {
      toast.error(err.message || 'Ошибка при изменении пароля');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!currentUser) return '';
    
    const firstName = currentUser.firstName || '';
    const lastName = currentUser.lastName || '';
    
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };
  
  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    switch (field) {
      case 'current':
        setShowCurrentPassword(!showCurrentPassword);
        break;
      case 'new':
        setShowNewPassword(!showNewPassword);
        break;
      case 'confirm':
        setShowConfirmPassword(!showConfirmPassword);
        break;
      default:
        break;
    }
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
          {/* Profile Information Card */}
          <ProfileCard>
            <CardHeader>
              <CardTitle>Личная информация</CardTitle>
              {!editMode && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setEditMode(true)}
                  startIcon={<FaEdit />}
                >
                  Редактировать
                </Button>
              )}
            </CardHeader>
            
            {/* Avatar Section */}
            <AvatarSection>
              <Avatar>
                {avatarPreview ? (
                  <img src={avatarPreview} alt="User avatar" />
                ) : (
                  getUserInitials()
                )}
              </Avatar>
              
              {editMode && (
                <AvatarUpload>
                  <AvatarUploadButton>
                    Изменить фото
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleAvatarChange} 
                    />
                  </AvatarUploadButton>
                </AvatarUpload>
              )}
            </AvatarSection>
            
            {editMode ? (
              <Formik
                initialValues={{
                  firstName: currentUser.firstName || '',
                  lastName: currentUser.lastName || '',
                  email: currentUser.email || '',
                  department: currentUser.department || '',
                  phone: currentUser.phone || '',
                  position: currentUser.position || '',
                }}
                validationSchema={ProfileSchema}
                onSubmit={handleProfileUpdate}
              >
                {({ errors, touched, isSubmitting }) => (
                  <Form>
                    <FormRow>
                      <FormGroup>
                        <InputWrapper>
                          <IconWrapper>
                            <FaUser />
                          </IconWrapper>
                          <StyledField
                            type="text"
                            name="firstName"
                            placeholder="Имя"
                            error={errors.firstName && touched.firstName}
                          />
                        </InputWrapper>
                        <ErrorMessage name="firstName" component={ErrorText} />
                      </FormGroup>
                      
                      <FormGroup>
                        <InputWrapper>
                          <IconWrapper>
                            <FaUser />
                          </IconWrapper>
                          <StyledField
                            type="text"
                            name="lastName"
                            placeholder="Фамилия"
                            error={errors.lastName && touched.lastName}
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
                        <StyledField
                          type="email"
                          name="email"
                          placeholder="Email"
                          error={errors.email && touched.email}
                        />
                      </InputWrapper>
                      <ErrorMessage name="email" component={ErrorText} />
                    </FormGroup>
                    
                    <FormGroup>
                      <InputWrapper>
                        <IconWrapper>
                          <FaBuilding />
                        </IconWrapper>
                        <StyledField
                          type="text"
                          name="department"
                          placeholder="Отдел"
                          error={errors.department && touched.department}
                        />
                      </InputWrapper>
                      <ErrorMessage name="department" component={ErrorText} />
                    </FormGroup>
                    
                    <FormGroup>
                      <InputWrapper>
                        <IconWrapper>
                          <FaIdCard />
                        </IconWrapper>
                        <StyledField
                          type="text"
                          name="position"
                          placeholder="Должность"
                          error={errors.position && touched.position}
                        />
                      </InputWrapper>
                      <ErrorMessage name="position" component={ErrorText} />
                    </FormGroup>
                    
                    <FormGroup>
                      <InputWrapper>
                        <IconWrapper>
                          <FaPhone />
                        </IconWrapper>
                        <StyledField
                          type="text"
                          name="phone"
                          placeholder="Телефон"
                          error={errors.phone && touched.phone}
                        />
                      </InputWrapper>
                      <ErrorMessage name="phone" component={ErrorText} />
                    </FormGroup>
                    
                    {error && <Alert type="error" message={error} />}
                    
                    <ActionButtons>
                      <Button 
                        variant="outline" 
                        onClick={() => setEditMode(false)}
                        disabled={isSubmitting}
                      >
                        Отмена
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        isLoading={isSubmitting}
                      >
                        Сохранить
                      </Button>
                    </ActionButtons>
                  </Form>
                )}
              </Formik>
            ) : (
              <ProfileInfo>
                <ProfileInfoItem>
                  <ProfileInfoLabel>Имя</ProfileInfoLabel>
                  <ProfileInfoValue>{currentUser.firstName} {currentUser.lastName}</ProfileInfoValue>
                </ProfileInfoItem>
                
                <ProfileInfoItem>
                  <ProfileInfoLabel>Email</ProfileInfoLabel>
                  <ProfileInfoValue>{currentUser.email}</ProfileInfoValue>
                </ProfileInfoItem>
                
                <ProfileInfoItem>
                  <ProfileInfoLabel>Отдел</ProfileInfoLabel>
                  <ProfileInfoValue>{currentUser.department || 'Не указан'}</ProfileInfoValue>
                </ProfileInfoItem>
                
                <ProfileInfoItem>
                  <ProfileInfoLabel>Должность</ProfileInfoLabel>
                  <ProfileInfoValue>{currentUser.position || 'Не указана'}</ProfileInfoValue>
                </ProfileInfoItem>
                
                <ProfileInfoItem>
                  <ProfileInfoLabel>Телефон</ProfileInfoLabel>
                  <ProfileInfoValue>{currentUser.phone || 'Не указан'}</ProfileInfoValue>
                </ProfileInfoItem>
                
                <ProfileInfoItem>
                  <ProfileInfoLabel>Роль</ProfileInfoLabel>
                  <ProfileInfoValue>{currentUser.role || 'Пользователь'}</ProfileInfoValue>
                </ProfileInfoItem>
              </ProfileInfo>
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
                <ProfileInfoValue>********</ProfileInfoValue>
              </ProfileInfoItem>
              
              <ProfileInfoItem>
                <ProfileInfoLabel>Последний вход</ProfileInfoLabel>
                <ProfileInfoValue>
                  {currentUser.lastLogin 
                    ? new Date(currentUser.lastLogin).toLocaleString() 
                    : 'Информация отсутствует'}
                </ProfileInfoValue>
              </ProfileInfoItem>
              
              <ProfileInfoItem>
                <ProfileInfoLabel>Двухфакторная аутентификация</ProfileInfoLabel>
                <ProfileInfoValue>
                  {currentUser.twoFactorEnabled ? 'Включена' : 'Отключена'}
                </ProfileInfoValue>
              </ProfileInfoItem>
            </ProfileInfo>
            
            <ActionButtons>
              <Button 
                variant="outline" 
                startIcon={<FaKey />}
                onClick={() => setShowPasswordModal(true)}
              >
                Изменить пароль
              </Button>
            </ActionButtons>
          </ProfileCard>
        </ProfileGrid>
        
        {/* Password Change Modal */}
        <Modal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          title="Изменение пароля"
        >
          <Formik
            initialValues={{
              currentPassword: '',
              newPassword: '',
              confirmPassword: '',
            }}
            validationSchema={PasswordSchema}
            onSubmit={handlePasswordChange}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form>
                <FormGroup>
                  <InputWrapper>
                    <IconWrapper>
                      <FaKey />
                    </IconWrapper>
                    <StyledField
                      type={showCurrentPassword ? "text" : "password"}
                      name="currentPassword"
                      placeholder="Текущий пароль"
                      error={errors.currentPassword && touched.currentPassword}
                    />
                    <PasswordToggle
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
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
                    <StyledField
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      placeholder="Новый пароль"
                      error={errors.newPassword && touched.newPassword}
                    />
                    <PasswordToggle
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
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
                    <StyledField
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Подтвердите пароль"
                      error={errors.confirmPassword && touched.confirmPassword}
                    />
                    <PasswordToggle
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </PasswordToggle>
                  </InputWrapper>
                  <ErrorMessage name="confirmPassword" component={ErrorText} />
                </FormGroup>
                
                {error && <Alert type="error" message={error} />}
                
                <ActionButtons>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowPasswordModal(false)}
                    disabled={isSubmitting}
                  >
                    Отмена
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    isLoading={isSubmitting}
                  >
                    Изменить пароль
                  </Button>
                </ActionButtons>
              </Form>
            )}
          </Formik>
        </Modal>
      </ProfileContainer>
    </Layout>
  );
};

export default ProfilePage;