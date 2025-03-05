import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styled, { ThemeProvider } from 'styled-components';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { lightTheme, darkTheme, GlobalStyles } from '../utils/themes';
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

  // Public routes don't need sidebar and header
  const isPublicRoute = ['/login', '/register', '/forgot-password', '/reset-password'].some(
    route => location.pathname.startsWith(route)
  );

  if (isPublicRoute) {
    return (
      <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
        <GlobalStyles />
        <div>
          {children}
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
        </div>
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
          user={user}
        />
        
        <Sidebar 
          isOpen={sidebarOpen} 
          toggleSidebar={toggleSidebar}
          user={user}
        />
        
        <MainContent sidebarOpen={sidebarOpen}>
          <ContentWrapper>
            {error && (
              <Alert 
                type="error" 
                message={error} 
                onClose={() => setError(null)} 
                style={{ marginBottom: '20px' }}
              />
            )}
            
            {!socketConnected && isAuthenticated && (
              <Alert 
                type="warning" 
                message="Real-time connection unavailable. Some features may be limited." 
                style={{ marginBottom: '20px' }}
              />
            )}
            
            {(notificationsLoading) && <Loader />}
            
            {children}
          </ContentWrapper>
        </MainContent>
        
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
      </LayoutContainer>
    </ThemeProvider>
  );
};

export default Layout;