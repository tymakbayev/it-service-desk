import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';

// Button variants
const VARIANTS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  SUCCESS: 'success',
  DANGER: 'danger',
  WARNING: 'warning',
  INFO: 'info',
  LIGHT: 'light',
  DARK: 'dark',
  LINK: 'link',
  OUTLINE_PRIMARY: 'outline-primary',
  OUTLINE_SECONDARY: 'outline-secondary',
  OUTLINE_SUCCESS: 'outline-success',
  OUTLINE_DANGER: 'outline-danger',
  OUTLINE_WARNING: 'outline-warning',
  OUTLINE_INFO: 'outline-info',
  OUTLINE_LIGHT: 'outline-light',
  OUTLINE_DARK: 'outline-dark',
};

// Button sizes
const SIZES = {
  SMALL: 'sm',
  MEDIUM: 'md',
  LARGE: 'lg',
};

// Color mapping for variants
const colorMap = {
  [VARIANTS.PRIMARY]: {
    background: '#3f51b5',
    color: '#ffffff',
    hoverBackground: '#303f9f',
    borderColor: '#3f51b5',
  },
  [VARIANTS.SECONDARY]: {
    background: '#f5f5f5',
    color: '#333333',
    hoverBackground: '#e0e0e0',
    borderColor: '#e0e0e0',
  },
  [VARIANTS.SUCCESS]: {
    background: '#4caf50',
    color: '#ffffff',
    hoverBackground: '#388e3c',
    borderColor: '#4caf50',
  },
  [VARIANTS.DANGER]: {
    background: '#f44336',
    color: '#ffffff',
    hoverBackground: '#d32f2f',
    borderColor: '#f44336',
  },
  [VARIANTS.WARNING]: {
    background: '#ff9800',
    color: '#ffffff',
    hoverBackground: '#f57c00',
    borderColor: '#ff9800',
  },
  [VARIANTS.INFO]: {
    background: '#2196f3',
    color: '#ffffff',
    hoverBackground: '#1976d2',
    borderColor: '#2196f3',
  },
  [VARIANTS.LIGHT]: {
    background: '#fafafa',
    color: '#333333',
    hoverBackground: '#f5f5f5',
    borderColor: '#eeeeee',
  },
  [VARIANTS.DARK]: {
    background: '#212121',
    color: '#ffffff',
    hoverBackground: '#000000',
    borderColor: '#212121',
  },
  [VARIANTS.LINK]: {
    background: 'transparent',
    color: '#3f51b5',
    hoverBackground: 'transparent',
    borderColor: 'transparent',
  },
  [VARIANTS.OUTLINE_PRIMARY]: {
    background: 'transparent',
    color: '#3f51b5',
    hoverBackground: 'rgba(63, 81, 181, 0.1)',
    borderColor: '#3f51b5',
  },
  [VARIANTS.OUTLINE_SECONDARY]: {
    background: 'transparent',
    color: '#757575',
    hoverBackground: 'rgba(117, 117, 117, 0.1)',
    borderColor: '#757575',
  },
  [VARIANTS.OUTLINE_SUCCESS]: {
    background: 'transparent',
    color: '#4caf50',
    hoverBackground: 'rgba(76, 175, 80, 0.1)',
    borderColor: '#4caf50',
  },
  [VARIANTS.OUTLINE_DANGER]: {
    background: 'transparent',
    color: '#f44336',
    hoverBackground: 'rgba(244, 67, 54, 0.1)',
    borderColor: '#f44336',
  },
  [VARIANTS.OUTLINE_WARNING]: {
    background: 'transparent',
    color: '#ff9800',
    hoverBackground: 'rgba(255, 152, 0, 0.1)',
    borderColor: '#ff9800',
  },
  [VARIANTS.OUTLINE_INFO]: {
    background: 'transparent',
    color: '#2196f3',
    hoverBackground: 'rgba(33, 150, 243, 0.1)',
    borderColor: '#2196f3',
  },
  [VARIANTS.OUTLINE_LIGHT]: {
    background: 'transparent',
    color: '#f5f5f5',
    hoverBackground: 'rgba(245, 245, 245, 0.1)',
    borderColor: '#f5f5f5',
  },
  [VARIANTS.OUTLINE_DARK]: {
    background: 'transparent',
    color: '#212121',
    hoverBackground: 'rgba(33, 33, 33, 0.1)',
    borderColor: '#212121',
  },
};

// Size styles
const sizeStyles = {
  [SIZES.SMALL]: css`
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
    border-radius: 0.2rem;
  `,
  [SIZES.MEDIUM]: css`
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    border-radius: 0.25rem;
  `,
  [SIZES.LARGE]: css`
    padding: 0.5rem 1rem;
    font-size: 1.25rem;
    border-radius: 0.3rem;
  `,
};

// Styled button component
const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  user-select: none;
  border: 1px solid transparent;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  cursor: pointer;
  outline: none;
  position: relative;
  overflow: hidden;
  
  /* Apply variant styles */
  background-color: ${props => colorMap[props.variant].background};
  color: ${props => colorMap[props.variant].color};
  border-color: ${props => colorMap[props.variant].borderColor};
  
  /* Apply size styles */
  ${props => props.size && sizeStyles[props.size]}
  
  /* Full width style */
  ${props => props.fullWidth && css`
    width: 100%;
    display: flex;
  `}
  
  /* Rounded style */
  ${props => props.rounded && css`
    border-radius: 50px;
  `}
  
  /* Elevated style */
  ${props => props.elevated && css`
    box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.16), 0 2px 10px 0 rgba(0, 0, 0, 0.12);
    &:hover {
      box-shadow: 0 5px 11px 0 rgba(0, 0, 0, 0.18), 0 4px 15px 0 rgba(0, 0, 0, 0.15);
    }
  `}
  
  /* Icon spacing */
  .button-icon {
    ${props => props.iconPosition === 'left' && css`
      margin-right: 0.5rem;
    `}
    
    ${props => props.iconPosition === 'right' && css`
      margin-left: 0.5rem;
    `}
  }
  
  /* Disabled state */
  ${props => props.disabled && css`
    opacity: 0.65;
    pointer-events: none;
  `}
  
  /* Loading state */
  ${props => props.loading && css`
    position: relative;
    color: transparent !important;
    pointer-events: none;
    
    &::after {
      content: "";
      position: absolute;
      width: 1rem;
      height: 1rem;
      top: calc(50% - 0.5rem);
      left: calc(50% - 0.5rem);
      border: 2px solid ${props => colorMap[props.variant].color};
      border-radius: 50%;
      border-right-color: transparent;
      animation: spin 0.75s linear infinite;
    }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `}
  
  /* Hover state */
  &:hover:not(:disabled) {
    background-color: ${props => colorMap[props.variant].hoverBackground};
    border-color: ${props => colorMap[props.variant].hoverBackground};
  }
  
  /* Active state */
  &:active:not(:disabled) {
    transform: translateY(1px);
  }
  
  /* Focus state */
  &:focus:not(:disabled) {
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
  
  /* Link variant specific styles */
  ${props => props.variant === VARIANTS.LINK && css`
    background-color: transparent;
    border-color: transparent;
    padding-left: 0;
    padding-right: 0;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
      background-color: transparent;
      border-color: transparent;
    }
    
    &:focus {
      text-decoration: underline;
      box-shadow: none;
    }
  `}
  
  /* Ripple effect */
  .ripple {
    position: absolute;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.4);
    transform: scale(0);
    animation: ripple 0.6s linear;
  }
  
  @keyframes ripple {
    to {
      transform: scale(2.5);
      opacity: 0;
    }
  }
`;

/**
 * Button component for user interactions
 * 
 * @component
 * @example
 * // Basic usage
 * <Button variant="primary" onClick={handleClick}>Click Me</Button>
 * 
 * // With icon
 * <Button variant="success" icon={<FaSave />} iconPosition="left">Save</Button>
 * 
 * // Full width button
 * <Button variant="danger" fullWidth>Delete</Button>
 * 
 * // Loading state
 * <Button variant="primary" loading>Processing</Button>
 */
const Button = forwardRef(({
  children,
  variant = VARIANTS.PRIMARY,
  size = SIZES.MEDIUM,
  type = 'button',
  disabled = false,
  loading = false,
  fullWidth = false,
  rounded = false,
  elevated = false,
  icon = null,
  iconPosition = 'left',
  onClick,
  className = '',
  ...props
}, ref) => {
  // Handle ripple effect on click
  const createRipple = (event) => {
    if (disabled || loading || variant === VARIANTS.LINK) return;
    
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.className = 'ripple';
    
    // Remove existing ripples
    const existingRipple = button.getElementsByClassName('ripple')[0];
    if (existingRipple) {
      existingRipple.remove();
    }
    
    button.appendChild(ripple);
    
    // Remove ripple after animation
    setTimeout(() => {
      if (ripple && ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 600);
  };
  
  // Handle click with ripple effect
  const handleClick = (event) => {
    createRipple(event);
    if (onClick && !disabled && !loading) {
      onClick(event);
    }
  };
  
  return (
    <StyledButton
      ref={ref}
      type={type}
      variant={variant}
      size={size}
      disabled={disabled || loading}
      loading={loading}
      fullWidth={fullWidth}
      rounded={rounded}
      elevated={elevated}
      iconPosition={iconPosition}
      onClick={handleClick}
      className={`button ${className}`}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="button-icon">{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className="button-icon">{icon}</span>}
    </StyledButton>
  );
});

Button.displayName = 'Button';

Button.propTypes = {
  /** Button content */
  children: PropTypes.node,
  /** Button variant style */
  variant: PropTypes.oneOf(Object.values(VARIANTS)),
  /** Button size */
  size: PropTypes.oneOf(Object.values(SIZES)),
  /** Button type attribute */
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  /** Disabled state */
  disabled: PropTypes.bool,
  /** Loading state */
  loading: PropTypes.bool,
  /** Full width button */
  fullWidth: PropTypes.bool,
  /** Rounded button style */
  rounded: PropTypes.bool,
  /** Elevated button with shadow */
  elevated: PropTypes.bool,
  /** Icon element */
  icon: PropTypes.node,
  /** Icon position */
  iconPosition: PropTypes.oneOf(['left', 'right']),
  /** Click handler */
  onClick: PropTypes.func,
  /** Additional CSS class */
  className: PropTypes.string,
};

// Export variants and sizes as static properties
Button.VARIANTS = VARIANTS;
Button.SIZES = SIZES;

export default Button;