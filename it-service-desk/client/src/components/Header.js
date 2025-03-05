import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { FaBell, FaUser, FaMoon, FaSun, FaSignOutAlt, FaBars, FaTimes, FaSearch } from 'react-icons/fa';
import { logout } from '../modules/auth/store/authSlice';
import { clearNotifications, markAllAsRead } from '../modules/notifications/store/notificationsSlice';
import useAuth from '../hooks/useAuth';
import useOnClickOutside from '../hooks/useClickOutside';
import NotificationBadge from '../modules/notifications/components/NotificationBadge';
import NotificationItem from '../modules/notifications/components/NotificationItem';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-toastify';

// Styled components
const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 70px;
  background-color: ${({ theme }) => theme.header.background};
  color: ${({ theme }) => theme.header.text};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  z-index: 1001;
  transition: all 0.3s ease;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: ${({ theme }) => theme.header.text};
  font-size: 1.5rem;
  cursor: pointer;
  margin-right: 15px;
  
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  margin-left: 20px;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const SearchInput = styled.input`
  background-color: ${({ theme }) => theme.header.searchBackground};
  border: 1px solid ${({ theme }) => theme.header.searchBorder};
  border-radius: 20px;
  padding: 8px 15px 8px 35px;
  color: ${({ theme }) => theme.header.searchText};
  width: 250px;
  transition: all 0.3s ease;
  
  &:focus {
    width: 300px;
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryLight};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.header.searchPlaceholder};
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.header.searchIcon};
  pointer-events: none;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.header.iconColor};
  font-size: 1.2rem;
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${({ theme }) => theme.header.iconHoverBackground};
    color: ${({ theme }) => theme.header.iconHoverColor};
  }
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 20px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${({ theme }) => theme.header.profileHoverBackground};
  }
`;

const UserAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 10px;
  
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const UserName = styled.span`
  font-weight: 500;
  font-size: 0.9rem;
`;

const UserRole = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.header.roleColor};
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
  color: ${({ theme }) => theme.header.logoColor};
  font-size: 1.5rem;
  font-weight: 700;
  
  span {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 60px;
  right: ${props => props.$position === 'right' ? '10px' : 'auto'};
  left: ${props => props.$position === 'left' ? '10px' : 'auto'};
  background-color: ${({ theme }) => theme.dropdown.background};
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  width: ${props => props.$width || '200px'};
  z-index: 1000;
  overflow: hidden;
  transition: all 0.3s ease;
  opacity: ${props => (props.$isOpen ? 1 : 0)};
  visibility: ${props => (props.$isOpen ? 'visible' : 'hidden')};
  transform: ${props => (props.$isOpen ? 'translateY(0)' : 'translateY(-10px)')};
`;

const DropdownHeader = styled.div`
  padding: 15px;
  border-bottom: 1px solid ${({ theme }) => theme.dropdown.borderColor};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DropdownTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  color: ${({ theme }) => theme.dropdown.titleColor};
`;

const DropdownAction = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.8rem;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const DropdownContent = styled.div`
  max-height: 300px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.dropdown.scrollTrack};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.dropdown.scrollThumb};
    border-radius: 3px;
  }
`;

const DropdownFooter = styled.div`
  padding: 10px 15px;
  border-top: 1px solid ${({ theme }) => theme.dropdown.borderColor};
  text-align: center;
`;

const DropdownItem = styled.div`
  padding: 12px 15px;
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.dropdown.itemColor};
  transition: background-color 0.2s ease;
  cursor: pointer;
  
  &:hover {
    background-color: ${({ theme }) => theme.dropdown.itemHoverBackground};
  }
  
  svg {
    margin-right: 10px;
    font-size: 1.1rem;
    color: ${({ theme }) => theme.dropdown.iconColor};
  }
`;

const EmptyNotifications = styled.div`
  padding: 20px;
  text-align: center;
  color: ${({ theme }) => theme.dropdown.emptyColor};
  font-size: 0.9rem;
`;

const NotificationList = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

const ViewAllLink = styled(Link)`
  display: block;
  padding: 10px;
  text-align: center;
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  font-size: 0.9rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

/**
 * Header component for the application
 * Contains the logo, search bar, notifications, theme toggle, and user profile
 */
const Header = ({ toggleSidebar, isSidebarOpen, toggleTheme, isDarkMode }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const notifications = useSelector(state => state.notifications.notifications);
  const unreadCount = useSelector(state => state.notifications.unreadCount);
  
  // State for dropdowns
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Refs for click outside detection
  const notificationsRef = useRef(null);
  const profileRef = useRef(null);
  
  // Close dropdowns when clicking outside
  useOnClickOutside(notificationsRef, () => setIsNotificationsOpen(false));
  useOnClickOutside(profileRef, () => setIsProfileOpen(false));
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.name) return 'U';
    
    const nameParts = user.name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return nameParts[0][0].toUpperCase();
  };
  
  // Format role for display
  const formatRole = (role) => {
    if (!role) return '';
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };
  
  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    toast.info('You have been logged out successfully');
  };
  
  // Handle mark all notifications as read
  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
    toast.success('All notifications marked as read');
  };
  
  // Handle clear all notifications
  const handleClearAllNotifications = () => {
    dispatch(clearNotifications());
    toast.success('All notifications cleared');
  };
  
  // Toggle notifications dropdown
  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    setIsProfileOpen(false);
  };
  
  // Toggle profile dropdown
  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
    setIsNotificationsOpen(false);
  };
  
  return (
    <HeaderContainer>
      <LeftSection>
        <MobileMenuButton onClick={toggleSidebar}>
          {isSidebarOpen ? <FaTimes /> : <FaBars />}
        </MobileMenuButton>
        
        <Logo to="/">
          IT<span>Service</span>Desk
        </Logo>
        
        <SearchContainer>
          <form onSubmit={handleSearchSubmit}>
            <SearchIcon>
              <FaSearch />
            </SearchIcon>
            <SearchInput
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </SearchContainer>
      </LeftSection>
      
      <RightSection>
        {isAuthenticated && (
          <>
            <div ref={notificationsRef}>
              <IconButton onClick={toggleNotifications} aria-label="Notifications">
                <FaBell />
                {unreadCount > 0 && <NotificationBadge count={unreadCount} />}
              </IconButton>
              
              <DropdownMenu $isOpen={isNotificationsOpen} $position="right" $width="320px">
                <DropdownHeader>
                  <DropdownTitle>Notifications</DropdownTitle>
                  {notifications.length > 0 && (
                    <DropdownAction onClick={handleMarkAllAsRead}>
                      Mark all as read
                    </DropdownAction>
                  )}
                </DropdownHeader>
                
                <DropdownContent>
                  {notifications.length === 0 ? (
                    <EmptyNotifications>
                      No notifications to display
                    </EmptyNotifications>
                  ) : (
                    <NotificationList>
                      {notifications.slice(0, 5).map(notification => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onClick={() => setIsNotificationsOpen(false)}
                        />
                      ))}
                    </NotificationList>
                  )}
                </DropdownContent>
                
                <DropdownFooter>
                  {notifications.length > 0 ? (
                    <>
                      <ViewAllLink to="/notifications" onClick={() => setIsNotificationsOpen(false)}>
                        View all notifications
                      </ViewAllLink>
                      <DropdownAction onClick={handleClearAllNotifications}>
                        Clear all
                      </DropdownAction>
                    </>
                  ) : (
                    <span>You're all caught up!</span>
                  )}
                </DropdownFooter>
              </DropdownMenu>
            </div>
            
            <IconButton onClick={toggleTheme} aria-label="Toggle theme">
              {isDarkMode ? <FaSun /> : <FaMoon />}
            </IconButton>
            
            <div ref={profileRef}>
              <UserProfile onClick={toggleProfile}>
                <UserAvatar>
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    getUserInitials()
                  )}
                </UserAvatar>
                
                <UserInfo>
                  <UserName>{user?.name || 'User'}</UserName>
                  <UserRole>{formatRole(user?.role) || 'User'}</UserRole>
                </UserInfo>
              </UserProfile>
              
              <DropdownMenu $isOpen={isProfileOpen} $position="right">
                <DropdownContent>
                  <DropdownItem as={Link} to="/profile" onClick={() => setIsProfileOpen(false)}>
                    <FaUser />
                    My Profile
                  </DropdownItem>
                  <DropdownItem onClick={handleLogout}>
                    <FaSignOutAlt />
                    Logout
                  </DropdownItem>
                </DropdownContent>
              </DropdownMenu>
            </div>
          </>
        )}
        
        {!isAuthenticated && (
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <IconButton>
              <FaUser />
            </IconButton>
          </Link>
        )}
      </RightSection>
    </HeaderContainer>
  );
};

export default Header;