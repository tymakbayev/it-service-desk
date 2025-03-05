import React, { useState, useEffect, forwardRef } from 'react';
import PropTypes from 'prop-types';
import styled, { css, keyframes } from 'styled-components';
import { FaTimes, FaExclamationCircle, FaInfoCircle, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

// Alert variants
const VARIANTS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  SUCCESS: 'success',
  DANGER: 'danger',
  WARNING: 'warning',
  INFO: 'info',
  LIGHT: 'light',
  DARK: 'dark',
};

// Alert sizes
const SIZES = {
  SMALL: 'sm',
  MEDIUM: 'md',
  LARGE: 'lg',
};

// Color mapping for variants
const colorMap = {
  [VARIANTS.PRIMARY]: {
    background: '#e8eaf6',
    color: '#3f51b5',
    borderColor: '#c5cae9',
    icon: FaInfoCircle,
  },
  [VARIANTS.SECONDARY]: {
    background: '#f5f5f5',
    color: '#757575',
    borderColor: '#e0e0e0',
    icon: FaInfoCircle,
  },
  [VARIANTS.SUCCESS]: {
    background: '#e8f5e9',
    color: '#4caf50',
    borderColor: '#c8e6c9',
    icon: FaCheckCircle,
  },
  [VARIANTS.DANGER]: {
    background: '#ffebee',
    color: '#f44336',
    borderColor: '#ffcdd2',
    icon: FaExclamationCircle,
  },
  [VARIANTS.WARNING]: {
    background: '#fff8e1',
    color: '#ff9800',
    borderColor: '#ffecb3',
    icon: FaExclamationTriangle,
  },
  [VARIANTS.INFO]: {
    background: '#e3f2fd',
    color: '#2196f3',
    borderColor: '#bbdefb',
    icon: FaInfoCircle,
  },
  [VARIANTS.LIGHT]: {
    background: '#fafafa',
    color: '#757575',
    borderColor: '#f5f5f5',
    icon: FaInfoCircle,
  },
  [VARIANTS.DARK]: {
    background: '#eeeeee',
    color: '#212121',
    borderColor: '#e0e0e0',
    icon: FaInfoCircle,
  },
};

// Size styles
const sizeStyles = {
  [SIZES.SMALL]: css`
    padding: 0.5rem;
    font-size: 0.875rem;
    border-radius: 0.2rem;
    
    .alert-icon {
      font-size: 1rem;
      margin-right: 0.5rem;
    }
    
    .alert-close {
      font-size: 0.875rem;
    }
  `,
  [SIZES.MEDIUM]: css`
    padding: 0.75rem;
    font-size: 1rem;
    border-radius: 0.25rem;
    
    .alert-icon {
      font-size: 1.25rem;
      margin-right: 0.75rem;
    }
    
    .alert-close {
      font-size: 1rem;
    }
  `,
  [SIZES.LARGE]: css`
    padding: 1rem;
    font-size: 1.25rem;
    border-radius: 0.3rem;
    
    .alert-icon {
      font-size: 1.5rem;
      margin-right: 1rem;
    }
    
    .alert-close {
      font-size: 1.25rem;
    }
  `,
};

// Animation keyframes
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-10px);
  }
`;

// Styled alert component
const StyledAlert = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: ${props => props.marginBottom || '1rem'};
  background-color: ${props => colorMap[props.variant].background};
  color: ${props => colorMap[props.variant].color};
  border: 1px solid ${props => colorMap[props.variant].borderColor};
  box-shadow: ${props => props.elevated ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none'};
  animation: ${props => props.isClosing ? fadeOut : fadeIn} 0.3s ease-in-out;
  
  ${props => props.size && sizeStyles[props.size]}
  
  ${props => props.fullWidth && css`
    width: 100%;
  `}
  
  ${props => props.solid && css`
    background-color: ${colorMap[props.variant].color};
    color: white;
    border-color: ${colorMap[props.variant].color};
  `}
  
  ${props => props.outlined && css`
    background-color: transparent;
    color: ${colorMap[props.variant].color};
    border: 1px solid ${colorMap[props.variant].color};
  `}
  
  ${props => props.rounded && css`
    border-radius: 50px;
  `}
  
  ${props => props.dismissible && css`
    padding-right: ${props.size === SIZES.LARGE ? '3rem' : props.size === SIZES.SMALL ? '2rem' : '2.5rem'};
  `}
  
  .alert-icon {
    display: flex;
    align-items: center;
  }
  
  .alert-content {
    flex: 1;
  }
  
  .alert-close {
    position: absolute;
    top: 50%;
    right: ${props => props.size === SIZES.LARGE ? '1rem' : props.size === SIZES.SMALL ? '0.5rem' : '0.75rem'};
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: currentColor;
    background: transparent;
    border: none;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.2s ease-in-out;
    
    &:hover {
      opacity: 1;
    }
    
    &:focus {
      outline: none;
      opacity: 1;
    }
  }
`;

/**
 * Alert component for displaying feedback messages to users
 */
const Alert = forwardRef(({
  variant = VARIANTS.PRIMARY,
  size = SIZES.MEDIUM,
  children,
  icon,
  title,
  dismissible = false,
  onClose,
  autoClose = false,
  autoCloseDelay = 5000,
  solid = false,
  outlined = false,
  elevated = false,
  fullWidth = false,
  rounded = false,
  marginBottom,
  className,
  ...props
}, ref) => {
  const [visible, setVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  
  // Handle auto close functionality
  useEffect(() => {
    let timer;
    
    if (autoClose && visible) {
      timer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [autoClose, autoCloseDelay, visible]);
  
  // Handle close animation
  const handleClose = () => {
    setIsClosing(true);
    
    setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, 300); // Match animation duration
  };
  
  // If alert is not visible, don't render anything
  if (!visible) return null;
  
  // Get the appropriate icon based on variant
  const IconComponent = icon || colorMap[variant].icon;
  
  return (
    <StyledAlert
      ref={ref}
      variant={variant}
      size={size}
      solid={solid}
      outlined={outlined}
      elevated={elevated}
      fullWidth={fullWidth}
      rounded={rounded}
      dismissible={dismissible}
      marginBottom={marginBottom}
      isClosing={isClosing}
      className={`alert alert-${variant} ${className || ''}`}
      role="alert"
      {...props}
    >
      {IconComponent && (
        <span className="alert-icon">
          <IconComponent />
        </span>
      )}
      
      <div className="alert-content">
        {title && <div className="alert-title"><strong>{title}</strong></div>}
        {children}
      </div>
      
      {dismissible && (
        <button
          type="button"
          className="alert-close"
          aria-label="Close"
          onClick={handleClose}
        >
          <FaTimes />
        </button>
      )}
    </StyledAlert>
  );
});

Alert.displayName = 'Alert';

Alert.propTypes = {
  /** Alert variant that determines color scheme */
  variant: PropTypes.oneOf(Object.values(VARIANTS)),
  
  /** Alert size */
  size: PropTypes.oneOf(Object.values(SIZES)),
  
  /** Alert content */
  children: PropTypes.node.isRequired,
  
  /** Custom icon to display */
  icon: PropTypes.elementType,
  
  /** Alert title displayed in bold */
  title: PropTypes.string,
  
  /** Whether the alert can be dismissed */
  dismissible: PropTypes.bool,
  
  /** Function called when alert is closed */
  onClose: PropTypes.func,
  
  /** Whether the alert should automatically close after a delay */
  autoClose: PropTypes.bool,
  
  /** Delay in milliseconds before auto-closing (if autoClose is true) */
  autoCloseDelay: PropTypes.number,
  
  /** Whether to use solid background color */
  solid: PropTypes.bool,
  
  /** Whether to use outlined style */
  outlined: PropTypes.bool,
  
  /** Whether to add elevation shadow */
  elevated: PropTypes.bool,
  
  /** Whether the alert should take full width */
  fullWidth: PropTypes.bool,
  
  /** Whether to use rounded corners */
  rounded: PropTypes.bool,
  
  /** Custom margin bottom value */
  marginBottom: PropTypes.string,
  
  /** Additional CSS class */
  className: PropTypes.string,
};

// Export variants and sizes as static properties
Alert.VARIANTS = VARIANTS;
Alert.SIZES = SIZES;

export default Alert;