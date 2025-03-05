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
    box-shadow: ${(props) => (props.hoverable ? '0 8px 16px rgba(0, 0, 0, 0.1)' : '')};
  }

  ${(props) => sizeStyles[props.size]}
  ${(props) =>
    props.clickable &&
    css`
      cursor: pointer;
      &:hover {
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
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
  background-color: ${(props) => colorMap[props.variant].background};
  color: ${(props) => colorMap[props.variant].color};
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
  font-size: 1rem;
  font-weight: 500;
  color: #6c757d;
`;

const CardText = styled.p`
  margin-top: 0;
  margin-bottom: 1rem;
  &:last-child {
    margin-bottom: 0;
  }
`;

const CardImage = styled.img`
  width: 100%;
  border-top-left-radius: ${(props) => (props.isTop ? 'calc(0.25rem - 1px)' : '0')};
  border-top-right-radius: ${(props) => (props.isTop ? 'calc(0.25rem - 1px)' : '0')};
  border-bottom-left-radius: ${(props) => (props.isBottom ? 'calc(0.25rem - 1px)' : '0')};
  border-bottom-right-radius: ${(props) => (props.isBottom ? 'calc(0.25rem - 1px)' : '0')};
`;

/**
 * Card component for displaying content in a contained manner
 * Supports different variants, sizes, and customization options
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
      overflow,
      noMargin,
      clickable,
      onClick,
      ...props
    },
    ref
  ) => {
    return (
      <StyledCard
        ref={ref}
        className={className}
        variant={variant}
        size={size}
        elevated={elevated}
        hoverable={hoverable}
        fullWidth={fullWidth}
        fullHeight={fullHeight}
        overflow={overflow}
        noMargin={noMargin}
        clickable={clickable}
        onClick={onClick}
        {...props}
      >
        {children}
      </StyledCard>
    );
  }
);

Card.Header = ({ children, variant = VARIANTS.DEFAULT, centered, ...props }) => (
  <CardHeader variant={variant} centered={centered} className="card-header" {...props}>
    {children}
  </CardHeader>
);

Card.Body = ({ children, variant = VARIANTS.DEFAULT, ...props }) => (
  <CardBody variant={variant} className="card-body" {...props}>
    {children}
  </CardBody>
);

Card.Footer = ({ children, variant = VARIANTS.DEFAULT, ...props }) => (
  <CardFooter variant={variant} className="card-footer" {...props}>
    {children}
  </CardFooter>
);

Card.Title = ({ children, ...props }) => (
  <CardTitle className="card-title" {...props}>
    {children}
  </CardTitle>
);

Card.Subtitle = ({ children, ...props }) => (
  <CardSubtitle className="card-subtitle" {...props}>
    {children}
  </CardSubtitle>
);

Card.Text = ({ children, ...props }) => (
  <CardText className="card-text" {...props}>
    {children}
  </CardText>
);

Card.Image = ({ src, alt, isTop, isBottom, ...props }) => (
  <CardImage src={src} alt={alt} isTop={isTop} isBottom={isBottom} className="card-img" {...props} />
);

Card.displayName = 'Card';
Card.Header.displayName = 'Card.Header';
Card.Body.displayName = 'Card.Body';
Card.Footer.displayName = 'Card.Footer';
Card.Title.displayName = 'Card.Title';
Card.Subtitle.displayName = 'Card.Subtitle';
Card.Text.displayName = 'Card.Text';
Card.Image.displayName = 'Card.Image';

Card.propTypes = {
  /** Card content */
  children: PropTypes.node,
  /** Additional CSS classes */
  className: PropTypes.string,
  /** Card visual style variant */
  variant: PropTypes.oneOf(Object.values(VARIANTS)),
  /** Card size */
  size: PropTypes.oneOf(Object.values(SIZES)),
  /** Whether to apply elevation shadow */
  elevated: PropTypes.bool,
  /** Whether to apply hover effect */
  hoverable: PropTypes.bool,
  /** Whether card should take full width of parent */
  fullWidth: PropTypes.bool,
  /** Whether card should take full height of parent */
  fullHeight: PropTypes.bool,
  /** Overflow behavior */
  overflow: PropTypes.string,
  /** Whether to remove bottom margin */
  noMargin: PropTypes.bool,
  /** Whether card is clickable */
  clickable: PropTypes.bool,
  /** Click handler function */
  onClick: PropTypes.func,
};

Card.defaultProps = {
  children: null,
  className: '',
  variant: VARIANTS.DEFAULT,
  size: SIZES.MEDIUM,
  elevated: false,
  hoverable: false,
  fullWidth: false,
  fullHeight: false,
  overflow: 'hidden',
  noMargin: false,
  clickable: false,
  onClick: null,
};

Card.Header.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(Object.values(VARIANTS)),
  centered: PropTypes.bool,
};

Card.Body.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(Object.values(VARIANTS)),
};

Card.Footer.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(Object.values(VARIANTS)),
};

Card.Title.propTypes = {
  children: PropTypes.node,
};

Card.Subtitle.propTypes = {
  children: PropTypes.node,
};

Card.Text.propTypes = {
  children: PropTypes.node,
};

Card.Image.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  isTop: PropTypes.bool,
  isBottom: PropTypes.bool,
};

Card.Image.defaultProps = {
  alt: '',
  isTop: false,
  isBottom: false,
};

// Export variants and sizes as static properties
Card.VARIANTS = VARIANTS;
Card.SIZES = SIZES;

export default Card;