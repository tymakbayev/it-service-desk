import React, { useState, useEffect, useCallback, forwardRef } from 'react';
import PropTypes from 'prop-types';
import styled, { css, keyframes } from 'styled-components';
import { FaTimes } from 'react-icons/fa';
import Button from './Button';

// Animation keyframes
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideIn = keyframes`
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

// Modal sizes
const SIZES = {
  SMALL: 'sm',
  MEDIUM: 'md',
  LARGE: 'lg',
  EXTRA_LARGE: 'xl',
  FULL_SCREEN: 'fullscreen',
};

// Size styles
const sizeStyles = {
  [SIZES.SMALL]: css`
    max-width: 300px;
  `,
  [SIZES.MEDIUM]: css`
    max-width: 500px;
  `,
  [SIZES.LARGE]: css`
    max-width: 800px;
  `,
  [SIZES.EXTRA_LARGE]: css`
    max-width: 1140px;
  `,
  [SIZES.FULL_SCREEN]: css`
    max-width: 100%;
    height: 100%;
    margin: 0;
    border-radius: 0;
  `,
};

// Styled components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: ${props => props.centered ? 'center' : 'flex-start'};
  justify-content: center;
  z-index: 1050;
  padding: ${props => props.size === SIZES.FULL_SCREEN ? '0' : '1.75rem'};
  overflow-x: hidden;
  overflow-y: auto;
  animation: ${fadeIn} 0.3s ease-in-out;
`;

const ModalContainer = styled.div`
  position: relative;
  background-color: #fff;
  border-radius: 0.3rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  width: 100%;
  pointer-events: auto;
  background-clip: padding-box;
  outline: 0;
  margin: ${props => props.centered ? '0' : '1.75rem auto'};
  animation: ${slideIn} 0.3s ease-in-out;
  ${props => sizeStyles[props.size]}
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
  border-top-left-radius: 0.3rem;
  border-top-right-radius: 0.3rem;
`;

const ModalTitle = styled.h5`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 1.5;
`;

const CloseButton = styled.button`
  padding: 0;
  background-color: transparent;
  border: 0;
  appearance: none;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
  color: #000;
  text-shadow: 0 1px 0 #fff;
  opacity: 0.5;
  cursor: pointer;
  transition: opacity 0.15s linear;

  &:hover {
    opacity: 0.75;
  }

  &:focus {
    outline: none;
    opacity: 0.75;
  }
`;

const ModalBody = styled.div`
  position: relative;
  flex: 1 1 auto;
  padding: 1rem;
  overflow-y: ${props => props.scrollable ? 'auto' : 'visible'};
  max-height: ${props => props.scrollable ? 'calc(100vh - 210px)' : 'none'};
`;

const ModalFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: ${props => props.align === 'left' ? 'flex-start' : props.align === 'center' ? 'center' : 'flex-end'};
  padding: 1rem;
  border-top: 1px solid #dee2e6;
  border-bottom-right-radius: 0.3rem;
  border-bottom-left-radius: 0.3rem;
  gap: 0.5rem;
`;

/**
 * Modal component for displaying content in a layer above the app
 * 
 * @component
 */
const Modal = forwardRef(({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = SIZES.MEDIUM,
  centered = false,
  scrollable = true,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  showCloseButton = true,
  footerAlign = 'right',
  className,
  style,
  ariaLabelledBy = 'modalTitle',
  ariaDescribedBy = 'modalDescription',
  ...props
}, ref) => {
  const [isVisible, setIsVisible] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    setIsVisible(isOpen);
    
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscKey = (event) => {
      if (closeOnEsc && event.key === 'Escape' && isVisible) {
        handleClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isVisible, closeOnEsc]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    
    // Add a small delay to allow the animation to complete
    setTimeout(() => {
      setIsClosing(false);
      setIsVisible(false);
      if (onClose) onClose();
    }, 300);
  }, [onClose]);

  const handleOverlayClick = useCallback((event) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      handleClose();
    }
  }, [closeOnOverlayClick, handleClose]);

  if (!isVisible && !isClosing) {
    return null;
  }

  return (
    <ModalOverlay
      onClick={handleOverlayClick}
      centered={centered}
      size={size}
      className={`modal-overlay ${className || ''}`}
      style={style}
      role="dialog"
      aria-modal="true"
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      {...props}
    >
      <ModalContainer
        ref={ref}
        size={size}
        centered={centered}
        className="modal-container"
      >
        {(title || showCloseButton) && (
          <ModalHeader className="modal-header">
            {title && (
              <ModalTitle id={ariaLabelledBy} className="modal-title">
                {title}
              </ModalTitle>
            )}
            {showCloseButton && (
              <CloseButton
                type="button"
                onClick={handleClose}
                aria-label="Close"
                className="modal-close"
              >
                <FaTimes />
              </CloseButton>
            )}
          </ModalHeader>
        )}
        
        <ModalBody scrollable={scrollable} id={ariaDescribedBy} className="modal-body">
          {children}
        </ModalBody>
        
        {footer && (
          <ModalFooter align={footerAlign} className="modal-footer">
            {footer}
          </ModalFooter>
        )}
      </ModalContainer>
    </ModalOverlay>
  );
});

Modal.displayName = 'Modal';

Modal.propTypes = {
  /** Controls whether the modal is displayed */
  isOpen: PropTypes.bool.isRequired,
  /** Function to call when the modal should close */
  onClose: PropTypes.func.isRequired,
  /** Modal title displayed in the header */
  title: PropTypes.node,
  /** Modal content */
  children: PropTypes.node.isRequired,
  /** Footer content, typically contains action buttons */
  footer: PropTypes.node,
  /** Controls the width of the modal */
  size: PropTypes.oneOf(Object.values(SIZES)),
  /** Centers the modal vertically in the viewport */
  centered: PropTypes.bool,
  /** Enables scrolling within the modal body */
  scrollable: PropTypes.bool,
  /** Closes the modal when clicking on the overlay */
  closeOnOverlayClick: PropTypes.bool,
  /** Closes the modal when pressing the Escape key */
  closeOnEsc: PropTypes.bool,
  /** Shows the close button in the header */
  showCloseButton: PropTypes.bool,
  /** Alignment of the footer content */
  footerAlign: PropTypes.oneOf(['left', 'center', 'right']),
  /** Additional CSS class for the modal */
  className: PropTypes.string,
  /** Inline styles for the modal */
  style: PropTypes.object,
  /** ID for aria-labelledby attribute */
  ariaLabelledBy: PropTypes.string,
  /** ID for aria-describedby attribute */
  ariaDescribedBy: PropTypes.string,
};

// Export size constants for external use
Modal.SIZES = SIZES;

export default Modal;