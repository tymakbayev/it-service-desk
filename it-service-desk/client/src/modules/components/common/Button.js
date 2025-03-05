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
  line-height: 1.5;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  /* Apply variant styles */
  background-color: ${({ variant }) => colorMap[variant]?.background || colorMap[VARIANTS.PRIMARY].background};
  color: ${({ variant }) => colorMap[variant]?.color || colorMap[VARIANTS.PRIMARY].color};
  border-color: ${({ variant }) => colorMap[variant]?.borderColor || colorMap[VARIANTS.PRIMARY].borderColor};
  
  /* Apply size styles */
  ${({ size }) => sizeStyles[size] || sizeStyles[SIZES.MEDIUM]}
  
  /* Full width style */
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  
  /* Icon spacing */
  & > svg {
    margin-right: ${({ iconOnly }) => (iconOnly ? '0' : '0.5rem')};
  }
  
  /* Hover styles */
  &:hover:not(:disabled) {
    background-color: ${({ variant }) => colorMap[variant]?.hoverBackground || colorMap[VARIANTS.PRIMARY].hoverBackground};
    text-decoration: ${({ variant }) => (variant === VARIANTS.LINK ? 'underline' : 'none')};
  }
  
  /* Focus styles */
  &:focus {
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgba(63, 81, 181, 0.25);
  }
  
  /* Active styles */
  &:active:not(:disabled) {
    transform: translateY(1px);
  }
  
  /* Disabled styles */
  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
    pointer-events: none;
  }
  
  /* Link variant specific styles */
  ${({ variant }) =>
    variant === VARIANTS.LINK &&
    css`
      border-color: transparent;
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
    `}
  
  /* Ripple effect */
  .ripple {
    position: absolute;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.3);
    transform: scale(0);
    animation: ripple 0.6s linear;
  }
  
  @keyframes ripple {
    to {
      transform: scale(4);
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
 * <Button>Click me</Button>
 * 
 * // With variant and size
 * <Button variant="primary" size="lg">Large Primary Button</Button>
 * 
 * // With icon
 * <Button startIcon={<FaPlus />}>Add Item</Button>
 */
const Button = forwardRef(({
  children,
  variant = VARIANTS.PRIMARY,
  size = SIZES.MEDIUM,
  type = 'button',
  disabled = false,
  fullWidth = false,
  startIcon = null,
  endIcon = null,
  onClick,
  className,
  ...props
}, ref) => {
  // Handle ripple effect
  const createRipple = (event) => {
    if (disabled || variant === VARIANTS.LINK) return;
    
    const button = event.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    
    const rect = button.getBoundingClientRect();
    
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - rect.left - radius}px`;
    circle.style.top = `${event.clientY - rect.top - radius}px`;
    circle.classList.add('ripple');
    
    // Remove existing ripples
    const ripple = button.getElementsByClassName('ripple')[0];
    if (ripple) {
      ripple.remove();
    }
    
    button.appendChild(circle);
  };
  
  // Handle click with ripple effect
  const handleClick = (event) => {
    createRipple(event);
    if (onClick) onClick(event);
  };
  
  // Check if button has only icon and no text
  const iconOnly = !children && (startIcon || endIcon);
  
  return (
    <StyledButton
      ref={ref}
      type={type}
      variant={variant}
      size={size}
      disabled={disabled}
      fullWidth={fullWidth}
      iconOnly={iconOnly}
      onClick={handleClick}
      className={className}
      {...props}
    >
      {startIcon && startIcon}
      {children}
      {endIcon && endIcon}
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
  /** Full width button */
  fullWidth: PropTypes.bool,
  /** Icon to display before text */
  startIcon: PropTypes.node,
  /** Icon to display after text */
  endIcon: PropTypes.node,
  /** Click handler */
  onClick: PropTypes.func,
  /** Additional CSS class */
  className: PropTypes.string,
};

// Export button component and constants
export { VARIANTS, SIZES };
export default Button;