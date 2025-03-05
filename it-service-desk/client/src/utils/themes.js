/**
 * themes.js
 * 
 * This file defines the theme configuration for the IT Service Desk application.
 * It provides color schemes, typography, spacing, breakpoints, and other styling constants
 * to maintain a consistent look and feel across the application.
 * 
 * The theme supports light and dark modes and includes specific color palettes
 * for different UI components and states.
 */

import { createGlobalStyle } from 'styled-components';

// Color palette definitions
const colors = {
  // Primary colors
  primary: {
    light: '#4dabf5',
    main: '#2196f3',
    dark: '#1976d2',
    contrastText: '#ffffff',
  },
  
  // Secondary colors
  secondary: {
    light: '#ff4081',
    main: '#f50057',
    dark: '#c51162',
    contrastText: '#ffffff',
  },
  
  // Success colors
  success: {
    light: '#81c784',
    main: '#4caf50',
    dark: '#388e3c',
    contrastText: '#ffffff',
  },
  
  // Error colors
  error: {
    light: '#e57373',
    main: '#f44336',
    dark: '#d32f2f',
    contrastText: '#ffffff',
  },
  
  // Warning colors
  warning: {
    light: '#ffb74d',
    main: '#ff9800',
    dark: '#f57c00',
    contrastText: '#000000',
  },
  
  // Info colors
  info: {
    light: '#64b5f6',
    main: '#2196f3',
    dark: '#1976d2',
    contrastText: '#ffffff',
  },
  
  // Neutral colors for light theme
  light: {
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
      disabled: 'rgba(0, 0, 0, 0.38)',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
      sidebar: '#ffffff',
      header: '#ffffff',
    },
    divider: 'rgba(0, 0, 0, 0.12)',
    border: 'rgba(0, 0, 0, 0.23)',
  },
  
  // Neutral colors for dark theme
  dark: {
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
      disabled: 'rgba(255, 255, 255, 0.5)',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
      sidebar: '#272727',
      header: '#272727',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
    border: 'rgba(255, 255, 255, 0.23)',
  },
  
  // Status colors for incidents
  incident: {
    new: '#2196f3',
    inProgress: '#ff9800',
    onHold: '#9c27b0',
    resolved: '#4caf50',
    closed: '#757575',
  },
  
  // Status colors for equipment
  equipment: {
    available: '#4caf50',
    inUse: '#2196f3',
    maintenance: '#ff9800',
    retired: '#757575',
    broken: '#f44336',
  },
  
  // Priority colors
  priority: {
    low: '#4caf50',
    medium: '#ff9800',
    high: '#f44336',
    critical: '#9c27b0',
  },
  
  // Chart colors
  chart: [
    '#2196f3',
    '#f44336',
    '#4caf50',
    '#ff9800',
    '#9c27b0',
    '#00bcd4',
    '#ffeb3b',
    '#795548',
    '#607d8b',
    '#e91e63',
  ],
};

// Typography definitions
const typography = {
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  fontSize: 14,
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightBold: 700,
  h1: {
    fontWeight: 300,
    fontSize: '6rem',
    lineHeight: 1.167,
    letterSpacing: '-0.01562em',
  },
  h2: {
    fontWeight: 300,
    fontSize: '3.75rem',
    lineHeight: 1.2,
    letterSpacing: '-0.00833em',
  },
  h3: {
    fontWeight: 400,
    fontSize: '3rem',
    lineHeight: 1.167,
    letterSpacing: '0em',
  },
  h4: {
    fontWeight: 400,
    fontSize: '2.125rem',
    lineHeight: 1.235,
    letterSpacing: '0.00735em',
  },
  h5: {
    fontWeight: 400,
    fontSize: '1.5rem',
    lineHeight: 1.334,
    letterSpacing: '0em',
  },
  h6: {
    fontWeight: 500,
    fontSize: '1.25rem',
    lineHeight: 1.6,
    letterSpacing: '0.0075em',
  },
  subtitle1: {
    fontWeight: 400,
    fontSize: '1rem',
    lineHeight: 1.75,
    letterSpacing: '0.00938em',
  },
  subtitle2: {
    fontWeight: 500,
    fontSize: '0.875rem',
    lineHeight: 1.57,
    letterSpacing: '0.00714em',
  },
  body1: {
    fontWeight: 400,
    fontSize: '1rem',
    lineHeight: 1.5,
    letterSpacing: '0.00938em',
  },
  body2: {
    fontWeight: 400,
    fontSize: '0.875rem',
    lineHeight: 1.43,
    letterSpacing: '0.01071em',
  },
  button: {
    fontWeight: 500,
    fontSize: '0.875rem',
    lineHeight: 1.75,
    letterSpacing: '0.02857em',
    textTransform: 'uppercase',
  },
  caption: {
    fontWeight: 400,
    fontSize: '0.75rem',
    lineHeight: 1.66,
    letterSpacing: '0.03333em',
  },
  overline: {
    fontWeight: 400,
    fontSize: '0.75rem',
    lineHeight: 2.66,
    letterSpacing: '0.08333em',
    textTransform: 'uppercase',
  },
};

// Spacing definitions
const spacing = (factor) => `${8 * factor}px`;
spacing.unit = 8;

// Breakpoints for responsive design
const breakpoints = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
  up: (key) => `@media (min-width: ${breakpoints[key]}px)`,
  down: (key) => `@media (max-width: ${breakpoints[key] - 0.05}px)`,
  between: (start, end) => 
    `@media (min-width: ${breakpoints[start]}px) and (max-width: ${breakpoints[end] - 0.05}px)`,
};

// Shadows for elevation
const shadows = [
  'none',
  '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
  '0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)',
  '0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)',
  '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
  '0px 3px 5px -1px rgba(0,0,0,0.2),0px 5px 8px 0px rgba(0,0,0,0.14),0px 1px 14px 0px rgba(0,0,0,0.12)',
  '0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)',
  '0px 4px 5px -2px rgba(0,0,0,0.2),0px 7px 10px 1px rgba(0,0,0,0.14),0px 2px 16px 1px rgba(0,0,0,0.12)',
  '0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)',
  '0px 5px 6px -3px rgba(0,0,0,0.2),0px 9px 12px 1px rgba(0,0,0,0.14),0px 3px 16px 2px rgba(0,0,0,0.12)',
  '0px 6px 6px -3px rgba(0,0,0,0.2),0px 10px 14px 1px rgba(0,0,0,0.14),0px 4px 18px 3px rgba(0,0,0,0.12)',
  '0px 6px 7px -4px rgba(0,0,0,0.2),0px 11px 15px 1px rgba(0,0,0,0.14),0px 4px 20px 3px rgba(0,0,0,0.12)',
  '0px 7px 8px -4px rgba(0,0,0,0.2),0px 12px 17px 2px rgba(0,0,0,0.14),0px 5px 22px 4px rgba(0,0,0,0.12)',
  '0px 7px 8px -4px rgba(0,0,0,0.2),0px 13px 19px 2px rgba(0,0,0,0.14),0px 5px 24px 4px rgba(0,0,0,0.12)',
  '0px 7px 9px -4px rgba(0,0,0,0.2),0px 14px 21px 2px rgba(0,0,0,0.14),0px 5px 26px 4px rgba(0,0,0,0.12)',
  '0px 8px 9px -5px rgba(0,0,0,0.2),0px 15px 22px 2px rgba(0,0,0,0.14),0px 6px 28px 5px rgba(0,0,0,0.12)',
  '0px 8px 10px -5px rgba(0,0,0,0.2),0px 16px 24px 2px rgba(0,0,0,0.14),0px 6px 30px 5px rgba(0,0,0,0.12)',
  '0px 8px 11px -5px rgba(0,0,0,0.2),0px 17px 26px 2px rgba(0,0,0,0.14),0px 6px 32px 5px rgba(0,0,0,0.12)',
  '0px 9px 11px -5px rgba(0,0,0,0.2),0px 18px 28px 2px rgba(0,0,0,0.14),0px 7px 34px 6px rgba(0,0,0,0.12)',
  '0px 9px 12px -6px rgba(0,0,0,0.2),0px 19px 29px 2px rgba(0,0,0,0.14),0px 7px 36px 6px rgba(0,0,0,0.12)',
  '0px 10px 13px -6px rgba(0,0,0,0.2),0px 20px 31px 3px rgba(0,0,0,0.14),0px 8px 38px 7px rgba(0,0,0,0.12)',
  '0px 10px 13px -6px rgba(0,0,0,0.2),0px 21px 33px 3px rgba(0,0,0,0.14),0px 8px 40px 7px rgba(0,0,0,0.12)',
  '0px 10px 14px -6px rgba(0,0,0,0.2),0px 22px 35px 3px rgba(0,0,0,0.14),0px 8px 42px 7px rgba(0,0,0,0.12)',
  '0px 11px 14px -7px rgba(0,0,0,0.2),0px 23px 36px 3px rgba(0,0,0,0.14),0px 9px 44px 8px rgba(0,0,0,0.12)',
  '0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)',
];

// Border radius
const shape = {
  borderRadius: 4,
  borderRadiusSmall: 2,
  borderRadiusLarge: 8,
};

// Transitions
const transitions = {
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  },
  duration: {
    shortest: 150,
    shorter: 200,
    short: 250,
    standard: 300,
    complex: 375,
    enteringScreen: 225,
    leavingScreen: 195,
  },
};

// Z-index values
const zIndex = {
  mobileStepper: 1000,
  speedDial: 1050,
  appBar: 1100,
  drawer: 1200,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500,
};

// Create theme object
const createTheme = (mode = 'light') => {
  const isDark = mode === 'dark';
  
  return {
    mode,
    colors: {
      ...colors,
      text: isDark ? colors.dark.text : colors.light.text,
      background: isDark ? colors.dark.background : colors.light.background,
      divider: isDark ? colors.dark.divider : colors.light.divider,
      border: isDark ? colors.dark.border : colors.light.border,
    },
    typography,
    spacing,
    breakpoints,
    shadows: isDark 
      ? shadows.map(shadow => shadow === 'none' ? shadow : shadow.replace(/rgba\(0,0,0/g, 'rgba(255,255,255')) 
      : shadows,
    shape,
    transitions,
    zIndex,
    isDark,
  };
};

// Default themes
const lightTheme = createTheme('light');
const darkTheme = createTheme('dark');

// Global styles
export const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  html, body {
    height: 100%;
    font-family: ${props => props.theme.typography.fontFamily};
    font-size: ${props => props.theme.typography.fontSize}px;
    background-color: ${props => props.theme.colors.background.default};
    color: ${props => props.theme.colors.text.primary};
    transition: background-color 0.3s ease, color 0.3s ease;
  }
  
  #root {
    height: 100%;
  }
  
  a {
    text-decoration: none;
    color: ${props => props.theme.colors.primary.main};
    
    &:hover {
      text-decoration: underline;
      color: ${props => props.theme.colors.primary.dark};
    }
  }
  
  button {
    font-family: ${props => props.theme.typography.fontFamily};
  }
  
  h1, h2, h3, h4, h5, h6 {
    margin-bottom: ${props => props.theme.spacing(2)};
  }
  
  p {
    margin-bottom: ${props => props.theme.spacing(2)};
  }
`;

// Helper functions
export const getContrastText = (background) => {
  // Calculate contrast ratio and return appropriate text color
  const isLight = calculateLuminance(background) > 0.5;
  return isLight ? 'rgba(0, 0, 0, 0.87)' : '#ffffff';
};

// Calculate luminance of a color
const calculateLuminance = (color) => {
  // Simple luminance calculation for hex colors
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16) / 255;
    const g = parseInt(color.slice(3, 5), 16) / 255;
    const b = parseInt(color.slice(5, 7), 16) / 255;
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  
  return 0.5; // Default for non-hex colors
};

// Export theme objects and utilities
export default {
  light: lightTheme,
  dark: darkTheme,
  createTheme,
  getContrastText,
  colors,
  typography,
  spacing,
  breakpoints,
  shadows,
  shape,
  transitions,
  zIndex,
};