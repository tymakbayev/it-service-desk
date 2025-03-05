import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styled, { ThemeProvider } from 'styled-components';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from './Header';
import Sidebar from './Sidebar';
import { lightTheme, darkTheme } from '../assets/styles/theme';
import GlobalStyles from '../assets/styles/GlobalStyles';
import useAuth from '../hooks/useAuth';
import useWebSocket from '../hooks/useWebSocket';
import { fetchNotifications } from '../modules/notifications/store/notificationsSlice';
import Loader from './common/Loader';
import Alert from './common/Alert';

// Styled components
const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  transition: all 0.3s ease;
`;

const MainContent = styled.main`
  flex: 1;
  padding: 20px;
  margin-left: ${({ sidebarOpen }) => (sidebarOpen ? '250px' : '70px')};
  transition: margin-left 0.3s ease;
  overflow-x: hidden;

  @media (max-width: 768px) {
    margin-left: 0;
    padding: 15px;
  }
`;

const ContentWrapper = styled.div`
  padding-top: 70px; // Space for fixed header
  min-height: calc(100vh - 70px);
`;

const ErrorBanner = styled.div`
  background-color: ${({ theme }) => theme.colors.danger};
  color: white;
  padding: 10px 20px;
  margin-bottom: 20px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ErrorMessage = styled.p`
  margin: 0;
`;

const DismissButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-weight: bold;
  cursor: pointer;
`;

/**
 * Main layout component that wraps all pages
 * Provides sidebar, header, theme switching, and notification handling
 */
const Layout = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  
  // Global state
  const { loading: notificationsLoading } = useSelector(state => state.notifications);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState('light');
  const [error, setError] = useState(null);
  
  // Initialize WebSocket connection for real-time notifications
  const { connected: socketConnected } = useWebSocket({
    enabled: isAuthenticated,
    onMessage: (data) => {
      // Refresh notifications when receiving a new one
      if (data.type === 'NOTIFICATION') {
        dispatch(fetchNotifications());
      }
    },
    onError: (err) => {
      setError('WebSocket connection error. Real-time updates may be unavailable.');
      console.error('WebSocket error:', err);
    }
  });

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Load saved theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Fetch notifications when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchNotifications());
    }
  }, [isAuthenticated, dispatch]);

  // Redirect to login if not authenticated
  useEffect(() => {
    const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
    
    if (!authLoading && !isAuthenticated && !publicRoutes.some(route => location.pathname.startsWith(route))) {
      navigate('/login', { state: { from: location.pathname } });
    }
  }, [isAuthenticated, authLoading, location.pathname, navigate]);

  // Adjust sidebar state based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial state
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Show loader while authentication is being checked
  if (authLoading) {
    return (
      <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
        <GlobalStyles />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Loader size="large" />
        </div>
      </ThemeProvider>
    );
  }

  // For public routes like login, register, etc.
  const isPublicRoute = ['/login', '/register', '/forgot-password', '/reset-password'].some(
    route => location.pathname.startsWith(route)
  );

  if (isPublicRoute) {
    return (
      <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
        <GlobalStyles />
        <div style={{ minHeight: '100vh', backgroundColor: theme === 'light' ? lightTheme.background : darkTheme.background }}>
          {children}
        </div>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={theme}
        />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
      <GlobalStyles />
      <LayoutContainer>
        <Header 
          toggleSidebar={toggleSidebar} 
          toggleTheme={toggleTheme} 
          theme={theme}
          sidebarOpen={sidebarOpen}
        />
        <Sidebar 
          isOpen={sidebarOpen} 
          toggleSidebar={toggleSidebar}
          user={user}
        />
        <MainContent sidebarOpen={sidebarOpen}>
          <ContentWrapper>
            {error && (
              <ErrorBanner>
                <ErrorMessage>{error}</ErrorMessage>
                <DismissButton onClick={() => setError(null)}>×</DismissButton>
              </ErrorBanner>
            )}
            
            {notificationsLoading ? (
              <div style={{ padding: '20px 0' }}>
                <Loader size="small" />
              </div>
            ) : (
              children
            )}
          </ContentWrapper>
        </MainContent>
      </LayoutContainer>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={theme}
      />
    </ThemeProvider>
  );
};

export default Layout;