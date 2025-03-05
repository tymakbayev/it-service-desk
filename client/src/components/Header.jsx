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
  color: ${({ theme }) => theme.header.roleText};
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 60px;
  right: ${({ position }) => position || '10px'};
  background-color: ${({ theme }) => theme.dropdown.background};
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  width: ${({ width }) => width || '200px'};
  z-index: 1000;
  overflow: hidden;
  transition: all 0.3s ease;
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  visibility: ${({ isOpen }) => (isOpen ? 'visible' : 'hidden')};
  transform: ${({ isOpen }) => (isOpen ? 'translateY(0)' : 'translateY(-10px)')};
`;

const DropdownHeader = styled.div`
  padding: 15px;
  border-bottom: 1px solid ${({ theme }) => theme.dropdown.divider};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DropdownTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  color: ${({ theme }) => theme.dropdown.headerText};
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
    background-color: ${({ theme }) => theme.dropdown.scrollThumb};
    border-radius: 3px;
  }
`;

const DropdownItem = styled.div`
  padding: 12px 15px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
  color: ${({ theme }) => theme.dropdown.itemText};
  
  &:hover {
    background-color: ${({ theme }) => theme.dropdown.itemHoverBackground};
  }
  
  svg {
    margin-right: 10px;
    font-size: 1rem;
    color: ${({ theme }) => theme.dropdown.iconColor};
  }
`;

const DropdownDivider = styled.div`
  height: 1px;
  background-color: ${({ theme }) => theme.dropdown.divider};
  margin: 5px 0;
`;

const EmptyState = styled.div`
  padding: 20px;
  text-align: center;
  color: ${({ theme }) => theme.dropdown.emptyText};
  font-size: 0.9rem;
`;

/**
 * Header component that provides app navigation, search, notifications, and user profile
 * @param {Object} props - Component props
 * @param {Function} props.toggleSidebar - Function to toggle sidebar visibility
 * @param {Function} props.toggleTheme - Function to toggle between light and dark themes
 * @param {String} props.theme - Current theme ('light' or 'dark')
 */
const Header = ({ toggleSidebar, toggleTheme, theme }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const notifications = useSelector(state => state.notifications.items);
  const unreadCount = useSelector(state => state.notifications.unreadCount);
  
  // State for dropdowns
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Refs for click outside detection
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);
  
  // Close dropdowns when clicking outside
  useOnClickOutside(userMenuRef, () => setUserMenuOpen(false));
  useOnClickOutside(notificationsRef, () => setNotificationsOpen(false));
  
  // Handle user logout
  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearNotifications());
    navigate('/login');
    toast.info('You have been logged out successfully');
  };
  
  // Handle profile navigation
  const handleProfileClick = () => {
    setUserMenuOpen(false);
    navigate('/profile');
  };
  
  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };
  
  // Mark all notifications as read
  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
    toast.success('All notifications marked as read');
  };
  
  // Handle notification click
  const handleNotificationClick = (notification) => {
    // Navigate based on notification type
    switch (notification.type) {
      case 'INCIDENT':
        navigate(`/incidents/${notification.referenceId}`);
        break;
      case 'EQUIPMENT':
        navigate(`/equipment/${notification.referenceId}`);
        break;
      case 'REPORT':
        navigate(`/reports/${notification.referenceId}`);
        break;
      default:
        navigate('/notifications');
    }
    setNotificationsOpen(false);
  };
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.name) return '?';
    return user.name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Get role display name
  const getRoleDisplay = () => {
    if (!user || !user.role) return 'User';
    
    switch (user.role) {
      case 'admin':
        return 'Administrator';
      case 'technician':
        return 'IT Technician';
      case 'user':
        return 'End User';
      default:
        return user.role.charAt(0).toUpperCase() + user.role.slice(1);
    }
  };
  
  return (
    <HeaderContainer>
      <LeftSection>
        <MobileMenuButton onClick={toggleSidebar}>
          <FaBars />
        </MobileMenuButton>
        
        <SearchContainer>
          <form onSubmit={handleSearch}>
            <SearchInput
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <SearchIcon>
              <FaSearch />
            </SearchIcon>
          </form>
        </SearchContainer>
      </LeftSection>
      
      <RightSection>
        {isAuthenticated && (
          <>
            <div ref={notificationsRef}>
              <IconButton 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                aria-label="Notifications"
              >
                <FaBell />
                {unreadCount > 0 && <NotificationBadge count={unreadCount} />}
              </IconButton>
              
              <DropdownMenu 
                isOpen={notificationsOpen} 
                width="320px"
              >
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
                    <EmptyState>No notifications yet</EmptyState>
                  ) : (
                    notifications.slice(0, 5).map(notification => (
                      <NotificationItem
                        key={notification._id}
                        notification={notification}
                        onClick={() => handleNotificationClick(notification)}
                      />
                    ))
                  )}
                  
                  {notifications.length > 5 && (
                    <DropdownItem onClick={() => navigate('/notifications')}>
                      View all notifications
                    </DropdownItem>
                  )}
                </DropdownContent>
              </DropdownMenu>
            </div>
            
            <IconButton onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'light' ? <FaMoon /> : <FaSun />}
            </IconButton>
            
            <div ref={userMenuRef}>
              <UserProfile onClick={() => setUserMenuOpen(!userMenuOpen)}>
                <UserAvatar>
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    getUserInitials()
                  )}
                </UserAvatar>
                
                <UserInfo>
                  <UserName>{user?.name || 'User'}</UserName>
                  <UserRole>{getRoleDisplay()}</UserRole>
                </UserInfo>
              </UserProfile>
              
              <DropdownMenu isOpen={userMenuOpen}>
                <DropdownContent>
                  <DropdownItem onClick={handleProfileClick}>
                    <FaUser />
                    My Profile
                  </DropdownItem>
                  
                  <DropdownDivider />
                  
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
            <DropdownItem>
              <FaUser />
              Login
            </DropdownItem>
          </Link>
        )}
      </RightSection>
    </HeaderContainer>
  );
};

export default Header;