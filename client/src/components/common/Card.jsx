import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';

// Card variants
const VARIANTS = {
  DEFAULT: 'default',
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  SUCCESS: 'success',
  DANGER: 'danger',
  WARNING: 'warning',
  INFO: 'info',
  LIGHT: 'light',
  DARK: 'dark',
};

// Card sizes
const SIZES = {
  SMALL: 'sm',
  MEDIUM: 'md',
  LARGE: 'lg',
};

// Color mapping for variants
const colorMap = {
  [VARIANTS.DEFAULT]: {
    background: '#ffffff',
    color: '#333333',
    borderColor: '#e0e0e0',
    headerBackground: '#f5f5f5',
    headerColor: '#333333',
    footerBackground: '#f5f5f5',
    footerColor: '#333333',
  },
  [VARIANTS.PRIMARY]: {
    background: '#ffffff',
    color: '#333333',
    borderColor: '#3f51b5',
    headerBackground: '#3f51b5',
    headerColor: '#ffffff',
    footerBackground: '#f5f5f5',
    footerColor: '#333333',
  },
  [VARIANTS.SECONDARY]: {
    background: '#ffffff',
    color: '#333333',
    borderColor: '#757575',
    headerBackground: '#757575',
    headerColor: '#ffffff',
    footerBackground: '#f5f5f5',
    footerColor: '#333333',
  },
  [VARIANTS.SUCCESS]: {
    background: '#ffffff',
    color: '#333333',
    borderColor: '#4caf50',
    headerBackground: '#4caf50',
    headerColor: '#ffffff',
    footerBackground: '#f5f5f5',
    footerColor: '#333333',
  },
  [VARIANTS.DANGER]: {
    background: '#ffffff',
    color: '#333333',
    borderColor: '#f44336',
    headerBackground: '#f44336',
    headerColor: '#ffffff',
    footerBackground: '#f5f5f5',
    footerColor: '#333333',
  },
  [VARIANTS.WARNING]: {
    background: '#ffffff',
    color: '#333333',
    borderColor: '#ff9800',
    headerBackground: '#ff9800',
    headerColor: '#ffffff',
    footerBackground: '#f5f5f5',
    footerColor: '#333333',
  },
  [VARIANTS.INFO]: {
    background: '#ffffff',
    color: '#333333',
    borderColor: '#2196f3',
    headerBackground: '#2196f3',
    headerColor: '#ffffff',
    footerBackground: '#f5f5f5',
    footerColor: '#333333',
  },
  [VARIANTS.LIGHT]: {
    background: '#ffffff',
    color: '#333333',
    borderColor: '#e0e0e0',
    headerBackground: '#fafafa',
    headerColor: '#333333',
    footerBackground: '#fafafa',
    footerColor: '#333333',
  },
  [VARIANTS.DARK]: {
    background: '#ffffff',
    color: '#333333',
    borderColor: '#212121',
    headerBackground: '#212121',
    headerColor: '#ffffff',
    footerBackground: '#f5f5f5',
    footerColor: '#333333',
  },
};

// Size styles
const sizeStyles = {
  [SIZES.SMALL]: css`
    border-radius: 0.2rem;
    .card-header {
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
    }
    .card-body {
      padding: 0.75rem;
    }
    .card-footer {
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
    }
  `,
  [SIZES.MEDIUM]: css`
    border-radius: 0.25rem;
    .card-header {
      padding: 0.75rem 1rem;
      font-size: 1rem;
    }
    .card-body {
      padding: 1rem;
    }
    .card-footer {
      padding: 0.75rem 1rem;
      font-size: 1rem;
    }
  `,
  [SIZES.LARGE]: css`
    border-radius: 0.3rem;
    .card-header {
      padding: 1rem 1.25rem;
      font-size: 1.25rem;
    }
    .card-body {
      padding: 1.25rem;
    }
    .card-footer {
      padding: 1rem 1.25rem;
      font-size: 1.25rem;
    }
  `,
};

// Styled card component
const StyledCard = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  word-wrap: break-word;
  background-color: ${(props) => colorMap[props.variant].background};
  color: ${(props) => colorMap[props.variant].color};
  background-clip: border-box;
  border: 1px solid ${(props) => colorMap[props.variant].borderColor};
  box-shadow: ${(props) => (props.elevated ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none')};
  transition: box-shadow 0.3s ease-in-out;
  width: ${(props) => (props.fullWidth ? '100%' : 'auto')};
  height: ${(props) => (props.fullHeight ? '100%' : 'auto')};
  overflow: ${(props) => (props.overflow ? props.overflow : 'hidden')};

  &:hover {
    box-shadow: ${(props) => (props.hoverable ? '0 8px 16px rgba(0, 0, 0, 0.1)' : props.elevated ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none')};
  }

  ${(props) => sizeStyles[props.size]}
`;

const CardHeader = styled.div`
  padding: 0.75rem 1.25rem;
  margin-bottom: 0;
  background-color: ${(props) => colorMap[props.variant].headerBackground};
  color: ${(props) => colorMap[props.variant].headerColor};
  border-bottom: 1px solid ${(props) => colorMap[props.variant].borderColor};
  display: flex;
  justify-content: ${(props) => (props.align === 'center' ? 'center' : props.align === 'right' ? 'flex-end' : 'flex-start')};
  align-items: center;
  font-weight: 500;
`;

const CardBody = styled.div`
  flex: 1 1 auto;
  padding: 1.25rem;
`;

const CardFooter = styled.div`
  padding: 0.75rem 1.25rem;
  background-color: ${(props) => colorMap[props.variant].footerBackground};
  color: ${(props) => colorMap[props.variant].footerColor};
  border-top: 1px solid ${(props) => colorMap[props.variant].borderColor};
  display: flex;
  justify-content: ${(props) => (props.align === 'center' ? 'center' : props.align === 'right' ? 'flex-end' : 'flex-start')};
  align-items: center;
`;

/**
 * Card component for displaying content in a contained format
 * 
 * @component
 */
const Card = forwardRef(({
  children,
  className,
  variant = VARIANTS.DEFAULT,
  size = SIZES.MEDIUM,
  header,
  footer,
  headerAlign = 'left',
  footerAlign = 'left',
  elevated = false,
  hoverable = false,
  fullWidth = false,
  fullHeight = false,
  overflow,
  style,
  ...props
}, ref) => {
  return (
    <StyledCard
      ref={ref}
      className={`card ${className || ''}`}
      variant={variant}
      size={size}
      elevated={elevated}
      hoverable={hoverable}
      fullWidth={fullWidth}
      fullHeight={fullHeight}
      overflow={overflow}
      style={style}
      {...props}
    >
      {header && (
        <CardHeader className="card-header" variant={variant} align={headerAlign}>
          {header}
        </CardHeader>
      )}
      <CardBody className="card-body">
        {children}
      </CardBody>
      {footer && (
        <CardFooter className="card-footer" variant={variant} align={footerAlign}>
          {footer}
        </CardFooter>
      )}
    </StyledCard>
  );
});

Card.displayName = 'Card';

Card.propTypes = {
  /** Card content */
  children: PropTypes.node,
  /** Additional CSS class names */
  className: PropTypes.string,
  /** Card visual style variant */
  variant: PropTypes.oneOf(Object.values(VARIANTS)),
  /** Card size */
  size: PropTypes.oneOf(Object.values(SIZES)),
  /** Card header content */
  header: PropTypes.node,
  /** Card footer content */
  footer: PropTypes.node,
  /** Alignment of header content */
  headerAlign: PropTypes.oneOf(['left', 'center', 'right']),
  /** Alignment of footer content */
  footerAlign: PropTypes.oneOf(['left', 'center', 'right']),
  /** Whether the card has elevation (shadow) */
  elevated: PropTypes.bool,
  /** Whether the card should have hover effect */
  hoverable: PropTypes.bool,
  /** Whether the card should take full width of its container */
  fullWidth: PropTypes.bool,
  /** Whether the card should take full height of its container */
  fullHeight: PropTypes.bool,
  /** Overflow behavior */
  overflow: PropTypes.oneOf(['visible', 'hidden', 'scroll', 'auto']),
  /** Additional inline styles */
  style: PropTypes.object,
};

// Export variants and sizes as static properties
Card.VARIANTS = VARIANTS;
Card.SIZES = SIZES;

export default Card;