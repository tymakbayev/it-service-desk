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
  margin-bottom: ${(props) => (props.noMargin ? '0' : '1rem')};

  &:hover {
    box-shadow: ${(props) => (props.hoverable ? '0 8px 12px rgba(0, 0, 0, 0.15)' : '')};
  }

  ${(props) => sizeStyles[props.size]}
  ${(props) =>
    props.clickable &&
    css`
      cursor: pointer;
      &:hover {
        box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
      }
    `}
`;

const CardHeader = styled.div`
  padding: 0.75rem 1.25rem;
  margin-bottom: 0;
  background-color: ${(props) => colorMap[props.variant].headerBackground};
  color: ${(props) => colorMap[props.variant].headerColor};
  border-bottom: 1px solid ${(props) => colorMap[props.variant].borderColor};
  display: flex;
  justify-content: ${(props) => (props.centered ? 'center' : 'space-between')};
  align-items: center;

  &:first-child {
    border-radius: calc(0.25rem - 1px) calc(0.25rem - 1px) 0 0;
  }
`;

const CardBody = styled.div`
  flex: 1 1 auto;
  padding: 1.25rem;
  overflow: ${(props) => (props.scroll ? 'auto' : 'inherit')};
  max-height: ${(props) => (props.maxHeight ? props.maxHeight : 'none')};
`;

const CardFooter = styled.div`
  padding: 0.75rem 1.25rem;
  background-color: ${(props) => colorMap[props.variant].footerBackground};
  color: ${(props) => colorMap[props.variant].footerColor};
  border-top: 1px solid ${(props) => colorMap[props.variant].borderColor};

  &:last-child {
    border-radius: 0 0 calc(0.25rem - 1px) calc(0.25rem - 1px);
  }
`;

const CardTitle = styled.h5`
  margin-bottom: 0.75rem;
  font-size: 1.25rem;
  font-weight: 500;
`;

const CardSubtitle = styled.h6`
  margin-top: -0.375rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #6c757d;
`;

const CardText = styled.p`
  margin-top: 0;
  margin-bottom: 1rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

/**
 * Card component for displaying content in a contained box
 * Supports headers, footers, and various styling options
 */
const Card = forwardRef(
  (
    {
      children,
      className,
      variant,
      size,
      elevated,
      hoverable,
      fullWidth,
      fullHeight,
      noMargin,
      overflow,
      clickable,
      onClick,
      header,
      footer,
      headerCentered,
      bodyScroll,
      bodyMaxHeight,
      ...rest
    },
    ref
  ) => {
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
        noMargin={noMargin}
        overflow={overflow}
        clickable={clickable}
        onClick={clickable ? onClick : undefined}
        {...rest}
      >
        {header && (
          <CardHeader className="card-header" variant={variant} centered={headerCentered}>
            {header}
          </CardHeader>
        )}
        <CardBody 
          className="card-body" 
          scroll={bodyScroll} 
          maxHeight={bodyMaxHeight}
        >
          {children}
        </CardBody>
        {footer && (
          <CardFooter className="card-footer" variant={variant}>
            {footer}
          </CardFooter>
        )}
      </StyledCard>
    );
  }
);

Card.displayName = 'Card';

Card.propTypes = {
  /** Card content */
  children: PropTypes.node,
  /** Additional CSS class */
  className: PropTypes.string,
  /** Card visual style variant */
  variant: PropTypes.oneOf(Object.values(VARIANTS)),
  /** Card size */
  size: PropTypes.oneOf(Object.values(SIZES)),
  /** Adds shadow to the card */
  elevated: PropTypes.bool,
  /** Adds hover effect with shadow */
  hoverable: PropTypes.bool,
  /** Makes the card take full width of parent */
  fullWidth: PropTypes.bool,
  /** Makes the card take full height of parent */
  fullHeight: PropTypes.bool,
  /** Removes bottom margin */
  noMargin: PropTypes.bool,
  /** Controls overflow behavior */
  overflow: PropTypes.string,
  /** Makes the card clickable */
  clickable: PropTypes.bool,
  /** Click handler for clickable cards */
  onClick: PropTypes.func,
  /** Content for the card header */
  header: PropTypes.node,
  /** Content for the card footer */
  footer: PropTypes.node,
  /** Centers the header content */
  headerCentered: PropTypes.bool,
  /** Enables scrolling in the card body */
  bodyScroll: PropTypes.bool,
  /** Sets maximum height for the card body */
  bodyMaxHeight: PropTypes.string,
};

Card.defaultProps = {
  variant: VARIANTS.DEFAULT,
  size: SIZES.MEDIUM,
  elevated: false,
  hoverable: false,
  fullWidth: false,
  fullHeight: false,
  noMargin: false,
  overflow: 'hidden',
  clickable: false,
  onClick: () => {},
  header: null,
  footer: null,
  headerCentered: false,
  bodyScroll: false,
  bodyMaxHeight: null,
};

// Export Card component and sub-components
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
Card.Title = CardTitle;
Card.Subtitle = CardSubtitle;
Card.Text = CardText;
Card.VARIANTS = VARIANTS;
Card.SIZES = SIZES;

export default Card;