import React from 'react';
import PropTypes from 'prop-types';
import styled, { keyframes, css } from 'styled-components';

// Loader types
const TYPES = {
  SPINNER: 'spinner',
  DOTS: 'dots',
  PULSE: 'pulse',
  BAR: 'bar',
  CIRCULAR: 'circular'
};

// Loader sizes
const SIZES = {
  SMALL: 'sm',
  MEDIUM: 'md',
  LARGE: 'lg',
  EXTRA_LARGE: 'xl'
};

// Color variants
const VARIANTS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  SUCCESS: 'success',
  DANGER: 'danger',
  WARNING: 'warning',
  INFO: 'info',
  LIGHT: 'light',
  DARK: 'dark'
};

// Color mapping for variants
const colorMap = {
  [VARIANTS.PRIMARY]: '#3f51b5',
  [VARIANTS.SECONDARY]: '#757575',
  [VARIANTS.SUCCESS]: '#4caf50',
  [VARIANTS.DANGER]: '#f44336',
  [VARIANTS.WARNING]: '#ff9800',
  [VARIANTS.INFO]: '#2196f3',
  [VARIANTS.LIGHT]: '#f5f5f5',
  [VARIANTS.DARK]: '#212121'
};

// Size mapping for different loader types
const sizeMap = {
  [TYPES.SPINNER]: {
    [SIZES.SMALL]: { size: '16px', borderWidth: '2px' },
    [SIZES.MEDIUM]: { size: '24px', borderWidth: '3px' },
    [SIZES.LARGE]: { size: '36px', borderWidth: '4px' },
    [SIZES.EXTRA_LARGE]: { size: '48px', borderWidth: '5px' }
  },
  [TYPES.DOTS]: {
    [SIZES.SMALL]: { size: '6px', gap: '4px' },
    [SIZES.MEDIUM]: { size: '8px', gap: '6px' },
    [SIZES.LARGE]: { size: '12px', gap: '8px' },
    [SIZES.EXTRA_LARGE]: { size: '16px', gap: '10px' }
  },
  [TYPES.PULSE]: {
    [SIZES.SMALL]: { size: '16px' },
    [SIZES.MEDIUM]: { size: '24px' },
    [SIZES.LARGE]: { size: '36px' },
    [SIZES.EXTRA_LARGE]: { size: '48px' }
  },
  [TYPES.BAR]: {
    [SIZES.SMALL]: { height: '2px' },
    [SIZES.MEDIUM]: { height: '4px' },
    [SIZES.LARGE]: { height: '6px' },
    [SIZES.EXTRA_LARGE]: { height: '8px' }
  },
  [TYPES.CIRCULAR]: {
    [SIZES.SMALL]: { size: '16px', strokeWidth: '2px' },
    [SIZES.MEDIUM]: { size: '24px', strokeWidth: '3px' },
    [SIZES.LARGE]: { size: '36px', strokeWidth: '4px' },
    [SIZES.EXTRA_LARGE]: { size: '48px', strokeWidth: '5px' }
  }
};

// Animations
const spinAnimation = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const pulseAnimation = keyframes`
  0%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  50% {
    transform: scale(1);
    opacity: 1;
  }
`;

const dotsAnimation = keyframes`
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
`;

const barAnimation = keyframes`
  0% {
    left: -35%;
    right: 100%;
  }
  60% {
    left: 100%;
    right: -90%;
  }
  100% {
    left: 100%;
    right: -90%;
  }
`;

const barAnimation2 = keyframes`
  0% {
    left: -200%;
    right: 100%;
  }
  60% {
    left: 107%;
    right: -8%;
  }
  100% {
    left: 107%;
    right: -8%;
  }
`;

const circularAnimation = keyframes`
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 100, 200;
    stroke-dashoffset: -15;
  }
  100% {
    stroke-dasharray: 100, 200;
    stroke-dashoffset: -125;
  }
`;

// Spinner Loader
const SpinnerLoader = styled.div`
  display: inline-block;
  width: ${props => sizeMap[TYPES.SPINNER][props.size].size};
  height: ${props => sizeMap[TYPES.SPINNER][props.size].size};
  border: ${props => sizeMap[TYPES.SPINNER][props.size].borderWidth} solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: ${props => colorMap[props.variant]};
  animation: ${spinAnimation} 0.8s linear infinite;
`;

// Dots Loader
const DotsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Dot = styled.div`
  width: ${props => sizeMap[TYPES.DOTS][props.size].size};
  height: ${props => sizeMap[TYPES.DOTS][props.size].size};
  margin: 0 ${props => sizeMap[TYPES.DOTS][props.size].gap};
  background-color: ${props => colorMap[props.variant]};
  border-radius: 50%;
  display: inline-block;
  animation: ${dotsAnimation} 1.4s infinite ease-in-out both;

  &:nth-child(1) {
    animation-delay: -0.32s;
  }

  &:nth-child(2) {
    animation-delay: -0.16s;
  }
`;

// Pulse Loader
const PulseLoader = styled.div`
  width: ${props => sizeMap[TYPES.PULSE][props.size].size};
  height: ${props => sizeMap[TYPES.PULSE][props.size].size};
  background-color: ${props => colorMap[props.variant]};
  border-radius: 50%;
  animation: ${pulseAnimation} 1.2s infinite cubic-bezier(0.2, 0.68, 0.18, 1.08);
`;

// Bar Loader
const BarContainer = styled.div`
  position: relative;
  width: 100%;
  height: ${props => sizeMap[TYPES.BAR][props.size].height};
  overflow: hidden;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
`;

const BarInner = styled.div`
  position: absolute;
  background-color: ${props => colorMap[props.variant]};
  height: 100%;
  width: 100%;
  animation: ${barAnimation} 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
`;

const BarInner2 = styled.div`
  position: absolute;
  background-color: ${props => colorMap[props.variant]};
  height: 100%;
  width: 100%;
  animation: ${barAnimation2} 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) 1.15s infinite;
`;

// Circular Loader
const CircularContainer = styled.div`
  display: inline-block;
  position: relative;
  width: ${props => sizeMap[TYPES.CIRCULAR][props.size].size};
  height: ${props => sizeMap[TYPES.CIRCULAR][props.size].size};
`;

const CircularSvg = styled.svg`
  animation: ${spinAnimation} 2s linear infinite;
  height: 100%;
  width: 100%;
  transform-origin: center center;
`;

const CircularCircle = styled.circle`
  stroke-dasharray: 1, 200;
  stroke-dashoffset: 0;
  animation: ${circularAnimation} 1.5s ease-in-out infinite;
  stroke: ${props => colorMap[props.variant]};
  stroke-linecap: round;
  stroke-width: ${props => sizeMap[TYPES.CIRCULAR][props.size].strokeWidth};
  fill: none;
`;

// Loader Container
const LoaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  height: ${props => props.fullHeight ? '100%' : 'auto'};
  padding: ${props => props.padding || '0'};
  
  ${props => props.overlay && css`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.7);
    z-index: 1000;
  `}
  
  ${props => props.centered && css`
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1000;
  `}
`;

// Label styling
const LoaderLabel = styled.div`
  margin-top: ${props => props.position === 'bottom' ? '10px' : '0'};
  margin-bottom: ${props => props.position === 'top' ? '10px' : '0'};
  margin-left: ${props => props.position === 'right' ? '0' : '10px'};
  margin-right: ${props => props.position === 'left' ? '10px' : '0'};
  color: ${props => props.color || '#757575'};
  font-size: ${props => {
    switch(props.size) {
      case SIZES.SMALL: return '0.75rem';
      case SIZES.LARGE: return '1.25rem';
      case SIZES.EXTRA_LARGE: return '1.5rem';
      default: return '1rem';
    }
  }};
  font-weight: ${props => props.bold ? 'bold' : 'normal'};
`;

// Wrapper for loader and label
const LoaderWrapper = styled.div`
  display: flex;
  flex-direction: ${props => {
    switch(props.labelPosition) {
      case 'top': return 'column-reverse';
      case 'bottom': return 'column';
      case 'left': return 'row-reverse';
      case 'right':
      default: return 'row';
    }
  }};
  align-items: center;
  justify-content: center;
`;

/**
 * Loader component for displaying loading states
 * 
 * @component
 */
const Loader = ({
  type = TYPES.SPINNER,
  size = SIZES.MEDIUM,
  variant = VARIANTS.PRIMARY,
  fullWidth = false,
  fullHeight = false,
  overlay = false,
  centered = false,
  padding = '0',
  label = '',
  labelPosition = 'right',
  labelColor,
  labelBold = false,
  ...props
}) => {
  // Render the appropriate loader based on type
  const renderLoader = () => {
    switch (type) {
      case TYPES.DOTS:
        return (
          <DotsContainer>
            <Dot size={size} variant={variant} />
            <Dot size={size} variant={variant} />
            <Dot size={size} variant={variant} />
          </DotsContainer>
        );
      case TYPES.PULSE:
        return <PulseLoader size={size} variant={variant} />;
      case TYPES.BAR:
        return (
          <BarContainer size={size}>
            <BarInner variant={variant} />
            <BarInner2 variant={variant} />
          </BarContainer>
        );
      case TYPES.CIRCULAR:
        return (
          <CircularContainer size={size}>
            <CircularSvg viewBox="25 25 50 50">
              <CircularCircle
                cx="50"
                cy="50"
                r="20"
                size={size}
                variant={variant}
              />
            </CircularSvg>
          </CircularContainer>
        );
      case TYPES.SPINNER:
      default:
        return <SpinnerLoader size={size} variant={variant} />;
    }
  };

  return (
    <LoaderContainer
      fullWidth={fullWidth}
      fullHeight={fullHeight}
      overlay={overlay}
      centered={centered}
      padding={padding}
      {...props}
    >
      <LoaderWrapper labelPosition={labelPosition}>
        {renderLoader()}
        {label && (
          <LoaderLabel
            position={labelPosition}
            size={size}
            color={labelColor || colorMap[variant]}
            bold={labelBold}
          >
            {label}
          </LoaderLabel>
        )}
      </LoaderWrapper>
    </LoaderContainer>
  );
};

Loader.propTypes = {
  /** Type of loader to display */
  type: PropTypes.oneOf(Object.values(TYPES)),
  
  /** Size of the loader */
  size: PropTypes.oneOf(Object.values(SIZES)),
  
  /** Color variant of the loader */
  variant: PropTypes.oneOf(Object.values(VARIANTS)),
  
  /** Whether the loader should take up the full width of its container */
  fullWidth: PropTypes.bool,
  
  /** Whether the loader should take up the full height of its container */
  fullHeight: PropTypes.bool,
  
  /** Whether to display the loader as an overlay */
  overlay: PropTypes.bool,
  
  /** Whether to center the loader in the viewport */
  centered: PropTypes.bool,
  
  /** Padding around the loader */
  padding: PropTypes.string,
  
  /** Optional text to display with the loader */
  label: PropTypes.string,
  
  /** Position of the label relative to the loader */
  labelPosition: PropTypes.oneOf(['top', 'right', 'bottom', 'left']),
  
  /** Color of the label text */
  labelColor: PropTypes.string,
  
  /** Whether the label text should be bold */
  labelBold: PropTypes.bool,
};

// Export constants for external use
Loader.TYPES = TYPES;
Loader.SIZES = SIZES;
Loader.VARIANTS = VARIANTS;

export default Loader;