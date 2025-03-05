import React, { useState, useEffect } from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { 
  FaHome, 
  FaTicketAlt, 
  FaDesktop, 
  FaChartBar, 
  FaBell, 
  FaFileAlt, 
  FaUserCog, 
  FaAngleLeft, 
  FaAngleRight,
  FaUsers,
  FaCog
} from 'react-icons/fa';
import useAuth from '../hooks/useAuth';
import { ROLES } from '../utils/constants';

// Styled components
const SidebarContainer = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: ${({ isOpen }) => (isOpen ? '250px' : '70px')};
  background-color: ${({ theme }) => theme.sidebar.background};
  color: ${({ theme }) => theme.sidebar.text};
  transition: width 0.3s ease;
  z-index: 1000;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  overflow-x: hidden;
  padding-top: 70px; // Space for logo/header

  @media (max-width: 768px) {
    transform: translateX(${({ isOpen }) => (isOpen ? '0' : '-100%')});
    width: 250px;
  }
`;

const Logo = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: ${({ isOpen }) => (isOpen ? 'flex-start' : 'center')};
  padding: ${({ isOpen }) => (isOpen ? '0 20px' : '0')};
  background-color: ${({ theme }) => theme.sidebar.logoBackground};
  color: ${({ theme }) => theme.sidebar.logoText};
  font-weight: bold;
  font-size: ${({ isOpen }) => (isOpen ? '1.2rem' : '1rem')};
  overflow: hidden;
  white-space: nowrap;
`;

const NavMenu = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
`;

const NavItem = styled.li`
  width: 100%;
  margin-bottom: 5px;
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: ${({ theme }) => theme.sidebar.linkText};
  text-decoration: none;
  transition: all 0.3s ease;
  white-space: nowrap;
  overflow: hidden;

  &:hover {
    background-color: ${({ theme }) => theme.sidebar.hoverBackground};
    color: ${({ theme }) => theme.sidebar.hoverText};
  }

  &.active {
    background-color: ${({ theme }) => theme.sidebar.activeBackground};
    color: ${({ theme }) => theme.sidebar.activeText};
    border-left: 4px solid ${({ theme }) => theme.sidebar.activeIndicator};
  }

  svg {
    min-width: 20px;
    margin-right: ${({ isOpen }) => (isOpen ? '15px' : '0')};
    font-size: 1.2rem;
  }
`;

const LinkText = styled.span`
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  transition: opacity 0.3s ease;
`;

const SectionTitle = styled.div`
  padding: 10px 20px;
  font-size: 0.8rem;
  text-transform: uppercase;
  color: ${({ theme }) => theme.sidebar.sectionTitle};
  letter-spacing: 1px;
  margin-top: 15px;
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  height: ${({ isOpen }) => (isOpen ? 'auto' : '0')};
  overflow: hidden;
`;

const ToggleButton = styled.button`
  position: absolute;
  bottom: 20px;
  right: ${({ isOpen }) => (isOpen ? '20px' : '50%')};
  transform: ${({ isOpen }) => (isOpen ? 'none' : 'translateX(50%)')};
  background-color: ${({ theme }) => theme.sidebar.toggleBackground};
  color: ${({ theme }) => theme.sidebar.toggleIcon};
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;

  &:hover {
    background-color: ${({ theme }) => theme.sidebar.toggleHoverBackground};
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const NotificationBadge = styled.span`
  background-color: ${({ theme }) => theme.colors.danger};
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 0.7rem;
  margin-left: 10px;
  min-width: 18px;
  text-align: center;
`;

/**
 * Sidebar component that provides navigation for the application
 * Shows different menu items based on user role
 */
const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const { user } = useAuth();
  const { unreadCount } = useSelector(state => state.notifications);
  const [activeItem, setActiveItem] = useState('');

  // Update active item based on current location
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/incidents')) {
      setActiveItem('incidents');
    } else if (path.includes('/equipment')) {
      setActiveItem('equipment');
    } else if (path.includes('/dashboard')) {
      setActiveItem('dashboard');
    } else if (path.includes('/notifications')) {
      setActiveItem('notifications');
    } else if (path.includes('/reports')) {
      setActiveItem('reports');
    } else if (path.includes('/profile')) {
      setActiveItem('profile');
    } else if (path.includes('/admin')) {
      setActiveItem('admin');
    } else if (path.includes('/settings')) {
      setActiveItem('settings');
    } else {
      setActiveItem('dashboard');
    }
  }, [location]);

  // Check if user has admin role
  const isAdmin = user?.role === ROLES.ADMIN;
  // Check if user has manager role
  const isManager = user?.role === ROLES.MANAGER || isAdmin;

  return (
    <SidebarContainer isOpen={isOpen}>
      <Logo isOpen={isOpen}>
        {isOpen ? 'IT Service Desk' : 'IT'}
      </Logo>
      
      <NavMenu>
        <NavItem>
          <StyledNavLink 
            to="/dashboard" 
            isOpen={isOpen}
            className={activeItem === 'dashboard' ? 'active' : ''}
          >
            <FaHome />
            <LinkText isOpen={isOpen}>Dashboard</LinkText>
          </StyledNavLink>
        </NavItem>

        <NavItem>
          <StyledNavLink 
            to="/incidents" 
            isOpen={isOpen}
            className={activeItem === 'incidents' ? 'active' : ''}
          >
            <FaTicketAlt />
            <LinkText isOpen={isOpen}>Incidents</LinkText>
          </StyledNavLink>
        </NavItem>

        <NavItem>
          <StyledNavLink 
            to="/equipment" 
            isOpen={isOpen}
            className={activeItem === 'equipment' ? 'active' : ''}
          >
            <FaDesktop />
            <LinkText isOpen={isOpen}>Equipment</LinkText>
          </StyledNavLink>
        </NavItem>

        <NavItem>
          <StyledNavLink 
            to="/notifications" 
            isOpen={isOpen}
            className={activeItem === 'notifications' ? 'active' : ''}
          >
            <FaBell />
            <LinkText isOpen={isOpen}>
              Notifications
              {unreadCount > 0 && <NotificationBadge>{unreadCount}</NotificationBadge>}
            </LinkText>
            {!isOpen && unreadCount > 0 && <NotificationBadge>{unreadCount}</NotificationBadge>}
          </StyledNavLink>
        </NavItem>

        {isManager && (
          <>
            <SectionTitle isOpen={isOpen}>Management</SectionTitle>
            
            <NavItem>
              <StyledNavLink 
                to="/reports" 
                isOpen={isOpen}
                className={activeItem === 'reports' ? 'active' : ''}
              >
                <FaFileAlt />
                <LinkText isOpen={isOpen}>Reports</LinkText>
              </StyledNavLink>
            </NavItem>

            <NavItem>
              <StyledNavLink 
                to="/analytics" 
                isOpen={isOpen}
                className={activeItem === 'analytics' ? 'active' : ''}
              >
                <FaChartBar />
                <LinkText isOpen={isOpen}>Analytics</LinkText>
              </StyledNavLink>
            </NavItem>
          </>
        )}

        {isAdmin && (
          <>
            <SectionTitle isOpen={isOpen}>Administration</SectionTitle>
            
            <NavItem>
              <StyledNavLink 
                to="/admin/users" 
                isOpen={isOpen}
                className={activeItem === 'admin' ? 'active' : ''}
              >
                <FaUsers />
                <LinkText isOpen={isOpen}>User Management</LinkText>
              </StyledNavLink>
            </NavItem>
            
            <NavItem>
              <StyledNavLink 
                to="/settings" 
                isOpen={isOpen}
                className={activeItem === 'settings' ? 'active' : ''}
              >
                <FaCog />
                <LinkText isOpen={isOpen}>System Settings</LinkText>
              </StyledNavLink>
            </NavItem>
          </>
        )}

        <SectionTitle isOpen={isOpen}>User</SectionTitle>
        <NavItem>
          <StyledNavLink 
            to="/profile" 
            isOpen={isOpen}
            className={activeItem === 'profile' ? 'active' : ''}
          >
            <FaUserCog />
            <LinkText isOpen={isOpen}>Profile</LinkText>
          </StyledNavLink>
        </NavItem>
      </NavMenu>

      <ToggleButton 
        isOpen={isOpen} 
        onClick={toggleSidebar}
        aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {isOpen ? <FaAngleLeft /> : <FaAngleRight />}
      </ToggleButton>
    </SidebarContainer>
  );
};

export default Sidebar;