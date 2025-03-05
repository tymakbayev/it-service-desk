/**
 * theme.js
 * 
 * This file defines the theme configuration for the IT Service Desk application.
 * It provides consistent design tokens that can be used throughout the application
 * to maintain a cohesive visual design.
 * 
 * The theme includes color palettes, typography settings, spacing, shadows,
 * breakpoints for responsive design, and other UI-related constants.
 * 
 * This theme is designed to work with styled-components and can be accessed
 * via the ThemeProvider component.
 */

const theme = {
  // Color palette
  colors: {
    // Primary colors
    primary: {
      main: '#2563eb',
      light: '#3b82f6',
      dark: '#1d4ed8',
      contrastText: '#ffffff',
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554',
    },
    
    // Secondary colors
    secondary: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
      contrastText: '#ffffff',
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
      950: '#022c22',
    },
    
    // Neutral colors
    neutral: {
      white: '#ffffff',
      black: '#000000',
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
      950: '#030712',
    },
    
    // Semantic colors for feedback
    feedback: {
      success: {
        main: '#10b981',
        light: '#34d399',
        dark: '#059669',
        contrastText: '#ffffff',
        background: '#ecfdf5',
      },
      warning: {
        main: '#f59e0b',
        light: '#fbbf24',
        dark: '#d97706',
        contrastText: '#ffffff',
        background: '#fffbeb',
      },
      error: {
        main: '#ef4444',
        light: '#f87171',
        dark: '#dc2626',
        contrastText: '#ffffff',
        background: '#fef2f2',
      },
      info: {
        main: '#3b82f6',
        light: '#60a5fa',
        dark: '#2563eb',
        contrastText: '#ffffff',
        background: '#eff6ff',
      },
    },
    
    // Status colors for incidents
    status: {
      new: '#3b82f6',
      assigned: '#8b5cf6',
      inProgress: '#f59e0b',
      onHold: '#6b7280',
      resolved: '#10b981',
      closed: '#1f2937',
      cancelled: '#ef4444',
    },
    
    // Priority colors for incidents
    priority: {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444',
      critical: '#b91c1c',
    },
    
    // Equipment status colors
    equipment: {
      available: '#10b981',
      inUse: '#3b82f6',
      underMaintenance: '#f59e0b',
      broken: '#ef4444',
      decommissioned: '#6b7280',
    },
    
    // Background colors
    background: {
      default: '#f9fafb',
      paper: '#ffffff',
      card: '#ffffff',
      sidebar: '#1f2937',
      header: '#ffffff',
      footer: '#1f2937',
      modal: '#ffffff',
      tooltip: '#1f2937',
    },
    
    // Text colors
    text: {
      primary: '#111827',
      secondary: '#4b5563',
      disabled: '#9ca3af',
      hint: '#6b7280',
      contrast: '#ffffff',
    },
    
    // Border colors
    border: {
      light: '#e5e7eb',
      main: '#d1d5db',
      dark: '#9ca3af',
    },
    
    // Divider color
    divider: '#e5e7eb',
  },
  
  // Typography settings
  typography: {
    fontFamily: {
      sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
      mono: "'JetBrains Mono', 'SF Mono', 'Fira Code', Consolas, 'Courier New', monospace",
    },
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
    },
    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
    // Predefined text styles
    variants: {
      h1: {
        fontSize: '2.25rem',
        fontWeight: 700,
        lineHeight: 1.25,
        letterSpacing: '-0.025em',
      },
      h2: {
        fontSize: '1.875rem',
        fontWeight: 700,
        lineHeight: 1.25,
        letterSpacing: '-0.025em',
      },
      h3: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.375,
        letterSpacing: '-0.025em',
      },
      h4: {
        fontSize: '1.25rem',
        fontWeight: 600,
        lineHeight: 1.375,
        letterSpacing: '-0.025em',
      },
      h5: {
        fontSize: '1.125rem',
        fontWeight: 600,
        lineHeight: 1.375,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 600,
        lineHeight: 1.5,
      },
      subtitle1: {
        fontSize: '1rem',
        fontWeight: 500,
        lineHeight: 1.5,
      },
      subtitle2: {
        fontSize: '0.875rem',
        fontWeight: 500,
        lineHeight: 1.5,
      },
      body1: {
        fontSize: '1rem',
        fontWeight: 400,
        lineHeight: 1.5,
      },
      body2: {
        fontSize: '0.875rem',
        fontWeight: 400,
        lineHeight: 1.5,
      },
      button: {
        fontSize: '0.875rem',
        fontWeight: 600,
        lineHeight: 1.5,
        textTransform: 'none',
      },
      caption: {
        fontSize: '0.75rem',
        fontWeight: 400,
        lineHeight: 1.5,
      },
      overline: {
        fontSize: '0.75rem',
        fontWeight: 600,
        lineHeight: 1.5,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      },
      code: {
        fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', Consolas, 'Courier New', monospace",
        fontSize: '0.875rem',
        fontWeight: 400,
        lineHeight: 1.5,
      },
    },
  },
  
  // Spacing scale
  spacing: {
    0: '0',
    0.5: '0.125rem',  // 2px
    1: '0.25rem',     // 4px
    1.5: '0.375rem',  // 6px
    2: '0.5rem',      // 8px
    2.5: '0.625rem',  // 10px
    3: '0.75rem',     // 12px
    3.5: '0.875rem',  // 14px
    4: '1rem',        // 16px
    5: '1.25rem',     // 20px
    6: '1.5rem',      // 24px
    7: '1.75rem',     // 28px
    8: '2rem',        // 32px
    9: '2.25rem',     // 36px
    10: '2.5rem',     // 40px
    11: '2.75rem',    // 44px
    12: '3rem',       // 48px
    14: '3.5rem',     // 56px
    16: '4rem',       // 64px
    20: '5rem',       // 80px
    24: '6rem',       // 96px
    28: '7rem',       // 112px
    32: '8rem',       // 128px
    36: '9rem',       // 144px
    40: '10rem',      // 160px
    44: '11rem',      // 176px
    48: '12rem',      // 192px
    52: '13rem',      // 208px
    56: '14rem',      // 224px
    60: '15rem',      // 240px
    64: '16rem',      // 256px
    72: '18rem',      // 288px
    80: '20rem',      // 320px
    96: '24rem',      // 384px
  },
  
  // Breakpoints for responsive design
  breakpoints: {
    xs: '0px',
    sm: '600px',
    md: '960px',
    lg: '1280px',
    xl: '1920px',
  },
  
  // Z-index values
  zIndex: {
    mobileStepper: 1000,
    speedDial: 1050,
    appBar: 1100,
    drawer: 1200,
    modal: 1300,
    snackbar: 1400,
    tooltip: 1500,
    fab: 1600,
  },
  
  // Border radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    DEFAULT: '0.25rem', // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px',   // Fully rounded (circles)
  },
  
  // Shadows
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },
  
  // Transitions
  transitions: {
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
  },
  
  // Component-specific styles
  components: {
    // Button variants
    button: {
      variants: {
        primary: {
          backgroundColor: '#2563eb',
          color: '#ffffff',
          hoverBackgroundColor: '#1d4ed8',
          activeBackgroundColor: '#1e40af',
          disabledBackgroundColor: '#bfdbfe',
          disabledColor: '#ffffff',
        },
        secondary: {
          backgroundColor: '#10b981',
          color: '#ffffff',
          hoverBackgroundColor: '#059669',
          activeBackgroundColor: '#047857',
          disabledBackgroundColor: '#a7f3d0',
          disabledColor: '#ffffff',
        },
        danger: {
          backgroundColor: '#ef4444',
          color: '#ffffff',
          hoverBackgroundColor: '#dc2626',
          activeBackgroundColor: '#b91c1c',
          disabledBackgroundColor: '#fca5a5',
          disabledColor: '#ffffff',
        },
        warning: {
          backgroundColor: '#f59e0b',
          color: '#ffffff',
          hoverBackgroundColor: '#d97706',
          activeBackgroundColor: '#b45309',
          disabledBackgroundColor: '#fcd34d',
          disabledColor: '#ffffff',
        },
        info: {
          backgroundColor: '#3b82f6',
          color: '#ffffff',
          hoverBackgroundColor: '#2563eb',
          activeBackgroundColor: '#1d4ed8',
          disabledBackgroundColor: '#93c5fd',
          disabledColor: '#ffffff',
        },
        light: {
          backgroundColor: '#f3f4f6',
          color: '#1f2937',
          hoverBackgroundColor: '#e5e7eb',
          activeBackgroundColor: '#d1d5db',
          disabledBackgroundColor: '#f9fafb',
          disabledColor: '#9ca3af',
        },
        dark: {
          backgroundColor: '#1f2937',
          color: '#ffffff',
          hoverBackgroundColor: '#111827',
          activeBackgroundColor: '#030712',
          disabledBackgroundColor: '#6b7280',
          disabledColor: '#e5e7eb',
        },
        link: {
          backgroundColor: 'transparent',
          color: '#2563eb',
          hoverBackgroundColor: 'transparent',
          hoverColor: '#1d4ed8',
          activeBackgroundColor: 'transparent',
          activeColor: '#1e40af',
          disabledBackgroundColor: 'transparent',
          disabledColor: '#9ca3af',
        },
        outline: {
          backgroundColor: 'transparent',
          color: '#2563eb',
          borderColor: '#2563eb',
          hoverBackgroundColor: '#eff6ff',
          hoverColor: '#1d4ed8',
          hoverBorderColor: '#1d4ed8',
          activeBackgroundColor: '#dbeafe',
          activeColor: '#1e40af',
          activeBorderColor: '#1e40af',
          disabledBackgroundColor: 'transparent',
          disabledColor: '#9ca3af',
          disabledBorderColor: '#e5e7eb',
        },
      },
      sizes: {
        small: {
          padding: '0.375rem 0.75rem',
          fontSize: '0.75rem',
          borderRadius: '0.125rem',
        },
        medium: {
          padding: '0.5rem 1rem',
          fontSize: '0.875rem',
          borderRadius: '0.25rem',
        },
        large: {
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          borderRadius: '0.375rem',
        },
      },
    },
    
    // Card variants
    card: {
      variants: {
        default: {
          backgroundColor: '#ffffff',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        },
        flat: {
          backgroundColor: '#ffffff',
          borderRadius: '0.5rem',
          boxShadow: 'none',
          border: '1px solid #e5e7eb',
        },
        elevated: {
          backgroundColor: '#ffffff',
          borderRadius: '0.5rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    
    // Input variants
    input: {
      variants: {
        default: {
          backgroundColor: '#ffffff',
          borderColor: '#d1d5db',
          borderRadius: '0.375rem',
          color: '#111827',
          placeholderColor: '#9ca3af',
          focusBorderColor: '#2563eb',
          errorBorderColor: '#ef4444',
          errorColor: '#ef4444',
          disabledBackgroundColor: '#f3f4f6',
          disabledBorderColor: '#e5e7eb',
          disabledColor: '#6b7280',
        },
      },
      sizes: {
        small: {
          padding: '0.375rem 0.75rem',
          fontSize: '0.75rem',
          height: '2rem',
        },
        medium: {
          padding: '0.5rem 1rem',
          fontSize: '0.875rem',
          height: '2.5rem',
        },
        large: {
          padding: '0.75rem 1.25rem',
          fontSize: '1rem',
          height: '3rem',
        },
      },
    },
    
    // Table variants
    table: {
      variants: {
        default: {
          borderColor: '#e5e7eb',
          headerBackgroundColor: '#f9fafb',
          headerTextColor: '#111827',
          rowBackgroundColor: '#ffffff',
          rowTextColor: '#111827',
          rowHoverBackgroundColor: '#f3f4f6',
          rowStripedBackgroundColor: '#f9fafb',
        },
      },
    },
    
    // Badge variants
    badge: {
      variants: {
        default: {
          backgroundColor: '#e5e7eb',
          color: '#1f2937',
        },
        primary: {
          backgroundColor: '#dbeafe',
          color: '#1e40af',
        },
        secondary: {
          backgroundColor: '#d1fae5',
          color: '#065f46',
        },
        success: {
          backgroundColor: '#d1fae5',
          color: '#065f46',
        },
        warning: {
          backgroundColor: '#fef3c7',
          color: '#92400e',
        },
        danger: {
          backgroundColor: '#fee2e2',
          color: '#b91c1c',
        },
        info: {
          backgroundColor: '#dbeafe',
          color: '#1e40af',
        },
      },
    },
    
    // Alert variants
    alert: {
      variants: {
        info: {
          backgroundColor: '#eff6ff',
          borderColor: '#93c5fd',
          color: '#1e40af',
          iconColor: '#3b82f6',
        },
        success: {
          backgroundColor: '#ecfdf5',
          borderColor: '#6ee7b7',
          color: '#065f46',
          iconColor: '#10b981',
        },
        warning: {
          backgroundColor: '#fffbeb',
          borderColor: '#fcd34d',
          color: '#92400e',
          iconColor: '#f59e0b',
        },
        error: {
          backgroundColor: '#fef2f2',
          borderColor: '#fca5a5',
          color: '#b91c1c',
          iconColor: '#ef4444',
        },
      },
    },
    
    // Modal variants
    modal: {
      variants: {
        default: {
          backgroundColor: '#ffffff',
          borderRadius: '0.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overlayColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
      sizes: {
        small: {
          width: '20rem',
          maxWidth: '90%',
        },
        medium: {
          width: '32rem',
          maxWidth: '90%',
        },
        large: {
          width: '48rem',
          maxWidth: '90%',
        },
        fullScreen: {
          width: '100%',
          height: '100%',
          margin: '0',
          borderRadius: '0',
          maxWidth: 'none',
        },
      },
    },
  },
};

// Helper functions to use the theme
const getColor = (path) => {
  return (props) => {
    const pathParts = path.split('.');
    let result = props.theme.colors;
    
    for (const part of pathParts) {
      if (!result[part]) return undefined;
      result = result[part];
    }
    
    return result;
  };
};

const getSpacing = (multiplier) => {
  return (props) => {
    return props.theme.spacing[multiplier] || `${multiplier * 0.25}rem`;
  };
};

const getFontSize = (size) => {
  return (props) => {
    return props.theme.typography.fontSize[size] || size;
  };
};

const getBreakpoint = (breakpoint) => {
  return (props) => {
    return props.theme.breakpoints[breakpoint] || breakpoint;
  };
};

// Export theme and helper functions
export { theme, getColor, getSpacing, getFontSize, getBreakpoint };
export default theme;