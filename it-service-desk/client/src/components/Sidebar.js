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
  const { user, isAuthenticated, hasRole } = useAuth();
  const notifications = useSelector(state => state.notifications.notifications);
  const [unreadCount, setUnreadCount] = useState(0);
  const [sidebarState, setSidebarState] = useState(isOpen);

  // Update sidebar state when isOpen prop changes
  useEffect(() => {
    setSidebarState(isOpen);
  }, [isOpen]);

  // Calculate unread notifications count
  useEffect(() => {
    if (notifications && notifications.length > 0) {
      const count = notifications.filter(notification => !notification.read).length;
      setUnreadCount(count);
    } else {
      setUnreadCount(0);
    }
  }, [notifications]);

  // Handle sidebar toggle
  const handleToggle = () => {
    setSidebarState(!sidebarState);
    if (toggleSidebar) {
      toggleSidebar();
    }
  };

  // Navigation items based on user role
  const getNavItems = () => {
    const items = [
      {
        to: '/dashboard',
        icon: <FaHome />,
        text: 'Dashboard',
        roles: [ROLES.ADMIN, ROLES.TECHNICIAN, ROLES.USER]
      },
      {
        to: '/incidents',
        icon: <FaTicketAlt />,
        text: 'Incidents',
        roles: [ROLES.ADMIN, ROLES.TECHNICIAN, ROLES.USER]
      },
      {
        to: '/equipment',
        icon: <FaDesktop />,
        text: 'Equipment',
        roles: [ROLES.ADMIN, ROLES.TECHNICIAN, ROLES.USER]
      },
      {
        to: '/reports',
        icon: <FaFileAlt />,
        text: 'Reports',
        roles: [ROLES.ADMIN, ROLES.TECHNICIAN]
      },
      {
        to: '/notifications',
        icon: <FaBell />,
        text: 'Notifications',
        badge: unreadCount > 0 ? unreadCount : null,
        roles: [ROLES.ADMIN, ROLES.TECHNICIAN, ROLES.USER]
      }
    ];

    // Admin-only items
    if (hasRole(ROLES.ADMIN)) {
      items.push(
        {
          to: '/users',
          icon: <FaUsers />,
          text: 'User Management',
          roles: [ROLES.ADMIN]
        },
        {
          to: '/settings',
          icon: <FaCog />,
          text: 'System Settings',
          roles: [ROLES.ADMIN]
        }
      );
    }

    // Filter items based on user role
    return items.filter(item => {
      if (!isAuthenticated) return false;
      if (!user || !user.role) return false;
      return item.roles.includes(user.role);
    });
  };

  return (
    <SidebarContainer isOpen={sidebarState}>
      <Logo isOpen={sidebarState}>
        {sidebarState ? 'IT Service Desk' : 'IT'}
      </Logo>
      
      <NavMenu>
        {isAuthenticated && (
          <>
            <SectionTitle isOpen={sidebarState}>Main</SectionTitle>
            {getNavItems().map((item, index) => (
              <NavItem key={index}>
                <StyledNavLink 
                  to={item.to} 
                  isOpen={sidebarState}
                  className={({ isActive }) => isActive ? 'active' : ''}
                >
                  {item.icon}
                  <LinkText isOpen={sidebarState}>
                    {item.text}
                    {item.badge && <NotificationBadge>{item.badge}</NotificationBadge>}
                  </LinkText>
                </StyledNavLink>
              </NavItem>
            ))}

            <SectionTitle isOpen={sidebarState}>User</SectionTitle>
            <NavItem>
              <StyledNavLink 
                to="/profile" 
                isOpen={sidebarState}
                className={location.pathname === '/profile' ? 'active' : ''}
              >
                <FaUserCog />
                <LinkText isOpen={sidebarState}>Profile</LinkText>
              </StyledNavLink>
            </NavItem>
          </>
        )}
      </NavMenu>

      <ToggleButton 
        isOpen={sidebarState} 
        onClick={handleToggle}
        aria-label={sidebarState ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {sidebarState ? <FaAngleLeft /> : <FaAngleRight />}
      </ToggleButton>
    </SidebarContainer>
  );
};

export default Sidebar;