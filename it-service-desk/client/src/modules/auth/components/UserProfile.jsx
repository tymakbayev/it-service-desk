import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import styled from 'styled-components';
import { FaUser, FaEnvelope, FaBuilding, FaIdCard, FaEdit, FaKey, FaSave, FaTimes } from 'react-icons/fa';

import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Card from '../../../components/common/Card';
import Alert from '../../../components/common/Alert';
import Loader from '../../../components/common/Loader';
import Modal from '../../../components/common/Modal';

import { updateProfile, changePassword, clearAuthError } from '../store/authSlice';

// Validation schema for profile update
const ProfileSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'Имя пользователя должно содержать минимум 3 символа')
    .max(50, 'Имя пользователя не должно превышать 50 символов')
    .required('Имя пользователя обязательно'),
  fullName: Yup.string()
    .min(2, 'Полное имя должно содержать минимум 2 символа')
    .max(100, 'Полное имя не должно превышать 100 символов')
    .required('Полное имя обязательно'),
  department: Yup.string()
    .required('Отдел обязателен'),
  phone: Yup.string()
    .matches(/^[0-9+\-() ]*$/, 'Неверный формат телефона')
    .nullable(),
  position: Yup.string()
    .max(100, 'Должность не должна превышать 100 символов')
    .nullable()
});

// Validation schema for password change
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

// Styled components
const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  gap: 2rem;
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;

  h2 {
    font-size: 1.8rem;
    color: #333;
    margin: 0;
  }
`;

const ProfileCard = styled(Card)`
  width: 100%;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const ProfileSection = styled.div`
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;

  h3 {
    font-size: 1.2rem;
    color: #333;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
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

const FormRow = styled.div`
  display: flex;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FormColumn = styled.div`
  flex: 1;
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

const UserInfoItem = styled.div`
  display: flex;
  margin-bottom: 1rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.div`
  width: 150px;
  font-weight: 500;
  color: #555;
`;

const InfoValue = styled.div`
  flex: 1;
  color: #333;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
`;

const UserAvatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: #757575;
  margin-right: 1.5rem;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const UserProfileHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
`;

const UserInfo = styled.div`
  flex: 1;

  h3 {
    font-size: 1.5rem;
    margin: 0 0 0.5rem 0;
  }

  p {
    color: #666;
    margin: 0;
  }
`;

const RoleBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 500;
  background-color: ${props => {
    switch (props.role) {
      case 'ADMIN':
        return '#e3f2fd';
      case 'TECHNICIAN':
        return '#e8f5e9';
      default:
        return '#fff3e0';
    }
  }};
  color: ${props => {
    switch (props.role) {
      case 'ADMIN':
        return '#1976d2';
      case 'TECHNICIAN':
        return '#388e3c';
      default:
        return '#f57c00';
    }
  }};
  margin-left: 0.5rem;
`;

const DepartmentSelect = styled.select`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid ${props => (props.error ? '#e53935' : '#ddd')};
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;
  transition: border-color 0.2s ease;
  outline: none;

  &:focus {
    border-color: #1976d2;
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

/**
 * User Profile component for viewing and editing user information
 */
const UserProfile = () => {
  const dispatch = useDispatch();
  const { user, isLoading, error, isAuthenticated } = useSelector(state => state.auth);
  
  const [editMode, setEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
  const [profileUpdateSuccess, setProfileUpdateSuccess] = useState(false);
  
  useEffect(() => {
    // Clear any existing auth errors when component mounts
    return () => {
      if (error) {
        dispatch(clearAuthError());
      }
    };
  }, [dispatch, error]);
  
  // Format role for display
  const formatRole = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'Администратор';
      case 'TECHNICIAN':
        return 'Техник';
      case 'USER':
        return 'Пользователь';
      default:
        return role;
    }
  };
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.fullName) return 'U';
    
    const nameParts = user.fullName.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`;
    }
    return nameParts[0].charAt(0);
  };
  
  const handleEditToggle = () => {
    setEditMode(!editMode);
    setProfileUpdateSuccess(false);
  };
  
  const handleProfileUpdate = async (values, { setSubmitting }) => {
    try {
      await dispatch(updateProfile(values)).unwrap();
      setProfileUpdateSuccess(true);
      setEditMode(false);
    } catch (err) {
      // Error is handled by the redux slice
    } finally {
      setSubmitting(false);
    }
  };
  
  const handlePasswordChange = async (values, { setSubmitting, resetForm }) => {
    try {
      await dispatch(changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      })).unwrap();
      
      setPasswordChangeSuccess(true);
      resetForm();
      
      // Close modal after a delay
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordChangeSuccess(false);
      }, 2000);
    } catch (err) {
      // Error is handled by the redux slice
    } finally {
      setSubmitting(false);
    }
  };
  
  if (!isAuthenticated || !user) {
    return (
      <ProfileContainer>
        <ProfileCard>
          <Alert type="warning" message="Вы не авторизованы. Пожалуйста, войдите в систему." />
        </ProfileCard>
      </ProfileContainer>
    );
  }
  
  return (
    <ProfileContainer>
      {error && (
        <Alert type="error" message={error} onClose={() => dispatch(clearAuthError())} />
      )}
      
      {profileUpdateSuccess && (
        <Alert type="success" message="Профиль успешно обновлен" onClose={() => setProfileUpdateSuccess(false)} />
      )}
      
      <ProfileCard>
        <ProfileHeader>
          <h2>Профиль пользователя</h2>
          <ButtonGroup>
            {!editMode ? (
              <Button 
                variant="primary" 
                onClick={handleEditToggle}
                icon={<FaEdit />}
              >
                Редактировать
              </Button>
            ) : (
              <Button 
                variant="secondary" 
                onClick={handleEditToggle}
                icon={<FaTimes />}
              >
                Отмена
              </Button>
            )}
            <Button 
              variant="secondary" 
              onClick={() => setShowPasswordModal(true)}
              icon={<FaKey />}
            >
              Сменить пароль
            </Button>
          </ButtonGroup>
        </ProfileHeader>
        
        <UserProfileHeader>
          <UserAvatar>
            {user.avatar ? (
              <img src={user.avatar} alt={user.fullName} />
            ) : (
              getUserInitials()
            )}
          </UserAvatar>
          <UserInfo>
            <h3>
              {user.fullName}
              <RoleBadge role={user.role}>{formatRole(user.role)}</RoleBadge>
            </h3>
            <p>{user.email}</p>
            {user.position && <p>{user.position}</p>}
          </UserInfo>
        </UserProfileHeader>
        
        {!editMode ? (
          <ProfileSection>
            <SectionHeader>
              <h3><FaUser /> Личная информация</h3>
            </SectionHeader>
            
            <UserInfoItem>
              <InfoLabel>Имя пользователя:</InfoLabel>
              <InfoValue>{user.username}</InfoValue>
            </UserInfoItem>
            
            <UserInfoItem>
              <InfoLabel>Полное имя:</InfoLabel>
              <InfoValue>{user.fullName}</InfoValue>
            </UserInfoItem>
            
            <UserInfoItem>
              <InfoLabel>Email:</InfoLabel>
              <InfoValue>{user.email}</InfoValue>
            </UserInfoItem>
            
            <UserInfoItem>
              <InfoLabel>Телефон:</InfoLabel>
              <InfoValue>{user.phone || 'Не указан'}</InfoValue>
            </UserInfoItem>
            
            <UserInfoItem>
              <InfoLabel>Отдел:</InfoLabel>
              <InfoValue>{user.department}</InfoValue>
            </UserInfoItem>
            
            <UserInfoItem>
              <InfoLabel>Должность:</InfoLabel>
              <InfoValue>{user.position || 'Не указана'}</InfoValue>
            </UserInfoItem>
            
            <UserInfoItem>
              <InfoLabel>Дата регистрации:</InfoLabel>
              <InfoValue>{new Date(user.createdAt).toLocaleDateString()}</InfoValue>
            </UserInfoItem>
          </ProfileSection>
        ) : (
          <ProfileSection>
            <SectionHeader>
              <h3><FaEdit /> Редактирование профиля</h3>
            </SectionHeader>
            
            <Formik
              initialValues={{
                username: user.username || '',
                fullName: user.fullName || '',
                department: user.department || '',
                phone: user.phone || '',
                position: user.position || ''
              }}
              validationSchema={ProfileSchema}
              onSubmit={handleProfileUpdate}
            >
              {({ isSubmitting, touched, errors }) => (
                <StyledForm>
                  <FormRow>
                    <FormColumn>
                      <FormGroup>
                        <label htmlFor="username">Имя пользователя</label>
                        <InputWrapper>
                          <IconWrapper>
                            <FaUser />
                          </IconWrapper>
                          <Field
                            as={Input}
                            type="text"
                            name="username"
                            placeholder="Имя пользователя"
                            error={touched.username && errors.username}
                            disabled={isLoading || isSubmitting}
                          />
                        </InputWrapper>
                        <ErrorMessage name="username" component={ErrorText} />
                      </FormGroup>
                    </FormColumn>
                    
                    <FormColumn>
                      <FormGroup>
                        <label htmlFor="fullName">Полное имя</label>
                        <InputWrapper>
                          <IconWrapper>
                            <FaIdCard />
                          </IconWrapper>
                          <Field
                            as={Input}
                            type="text"
                            name="fullName"
                            placeholder="Полное имя"
                            error={touched.fullName && errors.fullName}
                            disabled={isLoading || isSubmitting}
                          />
                        </InputWrapper>
                        <ErrorMessage name="fullName" component={ErrorText} />
                      </FormGroup>
                    </FormColumn>
                  </FormRow>
                  
                  <FormGroup>
                    <label htmlFor="department">Отдел</label>
                    <InputWrapper>
                      <IconWrapper>
                        <FaBuilding />
                      </IconWrapper>
                      <Field
                        as={DepartmentSelect}
                        name="department"
                        error={touched.department && errors.department}
                        disabled={isLoading || isSubmitting}
                      >
                        <option value="">Выберите отдел</option>
                        <option value="IT">IT отдел</option>
                        <option value="HR">HR отдел</option>
                        <option value="Finance">Финансовый отдел</option>
                        <option value="Marketing">Маркетинг</option>
                        <option value="Sales">Продажи</option>
                        <option value="Support">Поддержка</option>
                        <option value="Development">Разработка</option>
                        <option value="Management">Управление</option>
                        <option value="Other">Другое</option>
                      </Field>
                    </InputWrapper>
                    <ErrorMessage name="department" component={ErrorText} />
                  </FormGroup>
                  
                  <FormRow>
                    <FormColumn>
                      <FormGroup>
                        <label htmlFor="phone">Телефон</label>
                        <InputWrapper>
                          <IconWrapper>
                            <FaUser />
                          </IconWrapper>
                          <Field
                            as={Input}
                            type="text"
                            name="phone"
                            placeholder="Телефон"
                            error={touched.phone && errors.phone}
                            disabled={isLoading || isSubmitting}
                          />
                        </InputWrapper>
                        <ErrorMessage name="phone" component={ErrorText} />
                      </FormGroup>
                    </FormColumn>
                    
                    <FormColumn>
                      <FormGroup>
                        <label htmlFor="position">Должность</label>
                        <InputWrapper>
                          <IconWrapper>
                            <FaIdCard />
                          </IconWrapper>
                          <Field
                            as={Input}
                            type="text"
                            name="position"
                            placeholder="Должность"
                            error={touched.position && errors.position}
                            disabled={isLoading || isSubmitting}
                          />
                        </InputWrapper>
                        <ErrorMessage name="position" component={ErrorText} />
                      </FormGroup>
                    </FormColumn>
                  </FormRow>
                  
                  <ButtonGroup>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleEditToggle}
                      disabled={isLoading || isSubmitting}
                      icon={<FaTimes />}
                    >
                      Отмена
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isLoading || isSubmitting}
                      isLoading={isSubmitting}
                      icon={<FaSave />}
                    >
                      Сохранить
                    </Button>
                  </ButtonGroup>
                </StyledForm>
              )}
            </Formik>
          </ProfileSection>
        )}
      </ProfileCard>
      
      {/* Password Change Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPasswordChangeSuccess(false);
        }}
        title="Изменение пароля"
      >
        {passwordChangeSuccess ? (
          <Alert type="success" message="Пароль успешно изменен" />
        ) : (
          <Formik
            initialValues={{
              currentPassword: '',
              newPassword: '',
              confirmPassword: ''
            }}
            validationSchema={PasswordSchema}
            onSubmit={handlePasswordChange}
          >
            {({ isSubmitting, touched, errors }) => (
              <StyledForm>
                <FormGroup>
                  <label htmlFor="currentPassword">Текущий пароль</label>
                  <Field
                    as={Input}
                    type="password"
                    name="currentPassword"
                    placeholder="Введите текущий пароль"
                    error={touched.currentPassword && errors.currentPassword}
                    disabled={isLoading || isSubmitting}
                  />
                  <ErrorMessage name="currentPassword" component={ErrorText} />
                </FormGroup>
                
                <FormGroup>
                  <label htmlFor="newPassword">Новый пароль</label>
                  <Field
                    as={Input}
                    type="password"
                    name="newPassword"
                    placeholder="Введите новый пароль"
                    error={touched.newPassword && errors.newPassword}
                    disabled={isLoading || isSubmitting}
                  />
                  <ErrorMessage name="newPassword" component={ErrorText} />
                </FormGroup>
                
                <FormGroup>
                  <label htmlFor="confirmPassword">Подтверждение пароля</label>
                  <Field
                    as={Input}
                    type="password"
                    name="confirmPassword"
                    placeholder="Подтвердите новый пароль"
                    error={touched.confirmPassword && errors.confirmPassword}
                    disabled={isLoading || isSubmitting}
                  />
                  <ErrorMessage name="confirmPassword" component={ErrorText} />
                </FormGroup>
                
                <ButtonGroup>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowPasswordModal(false)}
                    disabled={isLoading || isSubmitting}
                  >
                    Отмена
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isLoading || isSubmitting}
                    isLoading={isSubmitting}
                  >
                    Изменить пароль
                  </Button>
                </ButtonGroup>
              </StyledForm>
            )}
          </Formik>
        )}
      </Modal>
    </ProfileContainer>
  );
};

export default UserProfile;