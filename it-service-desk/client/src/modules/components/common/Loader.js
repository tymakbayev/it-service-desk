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
`;

const BarInner = styled.div`
  position: absolute;
  background-color: ${props => colorMap[props.variant]};
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  width: 100%;
  animation: ${barAnimation} 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
`;

const BarInner2 = styled.div`
  position: absolute;
  background-color: ${props => colorMap[props.variant]};
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
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
  position: absolute;
  top: 0;
  left: 0;
`;

const CircularCircle = styled.circle`
  stroke-dasharray: 1, 200;
  stroke-dashoffset: 0;
  animation: ${circularAnimation} 1.5s ease-in-out infinite;
  stroke-linecap: round;
  stroke: ${props => colorMap[props.variant]};
`;

// Loader wrapper with common styles
const LoaderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  
  ${props => props.fullscreen && css`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.7);
    z-index: 9999;
  `}
  
  ${props => props.overlay && !props.fullscreen && css`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.7);
    z-index: 1;
  `}
  
  ${props => props.inline && css`
    display: inline-flex;
    margin: 0 8px;
  `}
`;

// Text container for loader with text
const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const LoaderText = styled.p`
  margin-top: 12px;
  font-size: 14px;
  color: ${props => props.textColor || '#666'};
  text-align: center;
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
  fullscreen = false,
  overlay = false,
  inline = false,
  text = '',
  textColor = '',
  className = '',
  ...props
}) => {
  // Render the appropriate loader based on type
  const renderLoader = () => {
    switch (type) {
      case TYPES.SPINNER:
        return <SpinnerLoader size={size} variant={variant} />;
      
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
        const { size: circleSize, strokeWidth } = sizeMap[TYPES.CIRCULAR][size];
        const numericSize = parseInt(circleSize, 10);
        const radius = (numericSize / 2) - parseInt(strokeWidth, 10);
        
        return (
          <CircularContainer size={size}>
            <CircularSvg viewBox={`0 0 ${numericSize} ${numericSize}`}>
              <CircularCircle
                cx={numericSize / 2}
                cy={numericSize / 2}
                r={radius}
                fill="none"
                strokeWidth={strokeWidth}
                variant={variant}
              />
            </CircularSvg>
          </CircularContainer>
        );
      
      default:
        return <SpinnerLoader size={size} variant={variant} />;
    }
  };

  return (
    <LoaderWrapper
      fullscreen={fullscreen}
      overlay={overlay}
      inline={inline}
      className={className}
      {...props}
    >
      {text ? (
        <TextContainer>
          {renderLoader()}
          <LoaderText textColor={textColor}>{text}</LoaderText>
        </TextContainer>
      ) : (
        renderLoader()
      )}
    </LoaderWrapper>
  );
};

Loader.propTypes = {
  /** Type of loader to display */
  type: PropTypes.oneOf(Object.values(TYPES)),
  
  /** Size of the loader */
  size: PropTypes.oneOf(Object.values(SIZES)),
  
  /** Color variant of the loader */
  variant: PropTypes.oneOf(Object.values(VARIANTS)),
  
  /** Whether to display the loader fullscreen */
  fullscreen: PropTypes.bool,
  
  /** Whether to display the loader as an overlay */
  overlay: PropTypes.bool,
  
  /** Whether to display the loader inline */
  inline: PropTypes.bool,
  
  /** Optional text to display with the loader */
  text: PropTypes.string,
  
  /** Color of the text */
  textColor: PropTypes.string,
  
  /** Additional class name */
  className: PropTypes.string,
};

// Export constants for external use
Loader.TYPES = TYPES;
Loader.SIZES = SIZES;
Loader.VARIANTS = VARIANTS;

export default Loader;