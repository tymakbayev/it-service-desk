/**
 * Common Components Library
 * 
 * This file exports a collection of reusable UI components that are used
 * throughout the application. These components follow a consistent design
 * system and provide standardized props interfaces.
 */

import React, { useState, useEffect, forwardRef } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { FaSpinner, FaCheck, FaTimes, FaExclamationTriangle, FaInfoCircle, FaChevronDown, FaChevronUp, FaSearch, FaEye, FaEyeSlash } from 'react-icons/fa';
import PropTypes from 'prop-types';

// ========== ANIMATIONS ==========

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideDown = keyframes`
  from { transform: translateY(-10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

// ========== BUTTON COMPONENT ==========

const ButtonBase = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.size === 'sm' ? '0.5rem 1rem' : props.size === 'lg' ? '0.75rem 1.5rem' : '0.625rem 1.25rem'};
  font-size: ${props => props.size === 'sm' ? '0.875rem' : props.size === 'lg' ? '1.125rem' : '1rem'};
  font-weight: 500;
  line-height: 1.5;
  border-radius: 0.375rem;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  position: relative;
  gap: 0.5rem;
  white-space: nowrap;
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }

  ${props => props.fullWidth && css`
    width: 100%;
  `}

  ${props => props.variant === 'primary' && css`
    background-color: ${props => props.theme.colors.primary};
    color: white;
    
    &:hover:not(:disabled) {
      background-color: ${props => props.theme.colors.primaryDark};
    }
    
    &:active:not(:disabled) {
      background-color: ${props => props.theme.colors.primaryDarker};
    }
  `}

  ${props => props.variant === 'secondary' && css`
    background-color: ${props => props.theme.colors.secondary};
    color: white;
    
    &:hover:not(:disabled) {
      background-color: ${props => props.theme.colors.secondaryDark};
    }
    
    &:active:not(:disabled) {
      background-color: ${props => props.theme.colors.secondaryDarker};
    }
  `}

  ${props => props.variant === 'success' && css`
    background-color: ${props => props.theme.colors.success};
    color: white;
    
    &:hover:not(:disabled) {
      background-color: ${props => props.theme.colors.successDark};
    }
    
    &:active:not(:disabled) {
      background-color: ${props => props.theme.colors.successDarker};
    }
  `}

  ${props => props.variant === 'danger' && css`
    background-color: ${props => props.theme.colors.danger};
    color: white;
    
    &:hover:not(:disabled) {
      background-color: ${props => props.theme.colors.dangerDark};
    }
    
    &:active:not(:disabled) {
      background-color: ${props => props.theme.colors.dangerDarker};
    }
  `}

  ${props => props.variant === 'warning' && css`
    background-color: ${props => props.theme.colors.warning};
    color: ${props => props.theme.colors.dark};
    
    &:hover:not(:disabled) {
      background-color: ${props => props.theme.colors.warningDark};
    }
    
    &:active:not(:disabled) {
      background-color: ${props => props.theme.colors.warningDarker};
    }
  `}

  ${props => props.variant === 'info' && css`
    background-color: ${props => props.theme.colors.info};
    color: white;
    
    &:hover:not(:disabled) {
      background-color: ${props => props.theme.colors.infoDark};
    }
    
    &:active:not(:disabled) {
      background-color: ${props => props.theme.colors.infoDarker};
    }
  `}

  ${props => props.variant === 'light' && css`
    background-color: ${props => props.theme.colors.light};
    color: ${props => props.theme.colors.dark};
    
    &:hover:not(:disabled) {
      background-color: ${props => props.theme.colors.lightDark};
    }
    
    &:active:not(:disabled) {
      background-color: ${props => props.theme.colors.lightDarker};
    }
  `}

  ${props => props.variant === 'dark' && css`
    background-color: ${props => props.theme.colors.dark};
    color: white;
    
    &:hover:not(:disabled) {
      background-color: ${props => props.theme.colors.darkLight};
    }
    
    &:active:not(:disabled) {
      background-color: ${props => props.theme.colors.darkLighter};
    }
  `}

  ${props => props.variant === 'outline-primary' && css`
    background-color: transparent;
    color: ${props => props.theme.colors.primary};
    border-color: ${props => props.theme.colors.primary};
    
    &:hover:not(:disabled) {
      background-color: ${props => props.theme.colors.primary};
      color: white;
    }
    
    &:active:not(:disabled) {
      background-color: ${props => props.theme.colors.primaryDark};
      color: white;
    }
  `}

  ${props => props.variant === 'outline-secondary' && css`
    background-color: transparent;
    color: ${props => props.theme.colors.secondary};
    border-color: ${props => props.theme.colors.secondary};
    
    &:hover:not(:disabled) {
      background-color: ${props => props.theme.colors.secondary};
      color: white;
    }
    
    &:active:not(:disabled) {
      background-color: ${props => props.theme.colors.secondaryDark};
      color: white;
    }
  `}

  ${props => props.variant === 'text' && css`
    background-color: transparent;
    color: ${props => props.theme.colors.primary};
    border: none;
    padding: 0.25rem 0.5rem;
    
    &:hover:not(:disabled) {
      background-color: rgba(0, 0, 0, 0.05);
    }
    
    &:active:not(:disabled) {
      background-color: rgba(0, 0, 0, 0.1);
    }
  `}
`;

const SpinnerWrapper = styled.span`
  display: inline-flex;
  animation: ${spin} 1s linear infinite;
  margin-right: ${props => props.hasChildren ? '0.5rem' : '0'};
`;

export const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  loading = false,
  disabled = false,
  fullWidth = false,
  startIcon = null,
  endIcon = null,
  onClick,
  ...rest
}, ref) => {
  return (
    <ButtonBase
      ref={ref}
      variant={variant}
      size={size}
      type={type}
      disabled={disabled || loading}
      fullWidth={fullWidth}
      onClick={loading ? null : onClick}
      {...rest}
    >
      {loading && (
        <SpinnerWrapper hasChildren={!!children}>
          <FaSpinner size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
        </SpinnerWrapper>
      )}
      {!loading && startIcon && <span className="button-start-icon">{startIcon}</span>}
      {children}
      {!loading && endIcon && <span className="button-end-icon">{endIcon}</span>}
    </ButtonBase>
  );
});

Button.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf([
    'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark',
    'outline-primary', 'outline-secondary', 'text'
  ]),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  startIcon: PropTypes.node,
  endIcon: PropTypes.node,
  onClick: PropTypes.func
};

// ========== CARD COMPONENT ==========

const CardContainer = styled.div`
  background-color: ${props => props.theme.card.background};
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  width: 100%;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const CardHeader = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid ${props => props.theme.card.borderColor};
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: ${props => props.theme.card.headerText};
  }
`;

const CardBody = styled.div`
  padding: 1.5rem;
  flex: 1;
`;

const CardFooter = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid ${props => props.theme.card.borderColor};
  background-color: ${props => props.theme.card.footerBackground};
`;

export const Card = ({ 
  children, 
  title, 
  headerActions, 
  footer, 
  className, 
  ...rest 
}) => {
  return (
    <CardContainer className={className} {...rest}>
      {(title || headerActions) && (
        <CardHeader>
          {title && <h3>{title}</h3>}
          {headerActions && <div className="card-header-actions">{headerActions}</div>}
        </CardHeader>
      )}
      <CardBody>{children}</CardBody>
      {footer && <CardFooter>{footer}</CardFooter>}
    </CardContainer>
  );
};

Card.propTypes = {
  children: PropTypes.node,
  title: PropTypes.node,
  headerActions: PropTypes.node,
  footer: PropTypes.node,
  className: PropTypes.string
};

// ========== INPUT COMPONENT ==========

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
  width: 100%;
`;

const InputLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.375rem;
  color: ${props => props.theme.input.labelColor};
  display: flex;
  align-items: center;
  
  ${props => props.required && css`
    &::after {
      content: '*';
      color: ${props => props.theme.colors.danger};
      margin-left: 0.25rem;
    }
  `}
`;

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: ${props => props.size === 'sm' ? '0.375rem 0.75rem' : props.size === 'lg' ? '0.75rem 1rem' : '0.5rem 0.75rem'};
  font-size: ${props => props.size === 'sm' ? '0.875rem' : props.size === 'lg' ? '1.125rem' : '1rem'};
  line-height: 1.5;
  color: ${props => props.theme.input.textColor};
  background-color: ${props => props.theme.input.background};
  border: 1px solid ${props => props.error ? props.theme.colors.danger : props.theme.input.borderColor};
  border-radius: 0.375rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  
  &:focus {
    outline: none;
    border-color: ${props => props.error ? props.theme.colors.danger : props.theme.colors.primary};
    box-shadow: 0 0 0 0.2rem ${props => props.error 
      ? `rgba(${props.theme.colors.dangerRgb}, 0.25)` 
      : `rgba(${props.theme.colors.primaryRgb}, 0.25)`};
  }
  
  &:disabled {
    background-color: ${props => props.theme.input.disabledBackground};
    cursor: not-allowed;
    opacity: 0.65;
  }
  
  &::placeholder {
    color: ${props => props.theme.input.placeholderColor};
    opacity: 0.6;
  }
  
  ${props => props.startIcon && css`
    padding-left: 2.5rem;
  `}
  
  ${props => props.endIcon && css`
    padding-right: 2.5rem;
  `}
`;

const InputIcon = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 2.5rem;
  color: ${props => props.theme.input.iconColor};
  pointer-events: ${props => props.clickable ? 'auto' : 'none'};
  cursor: ${props => props.clickable ? 'pointer' : 'default'};
  
  ${props => props.position === 'start' && css`
    left: 0;
  `}
  
  ${props => props.position === 'end' && css`
    right: 0;
  `}
`;

const InputHelperText = styled.div`
  font-size: 0.75rem;
  margin-top: 0.25rem;
  color: ${props => props.error ? props.theme.colors.danger : props.theme.input.helperTextColor};
`;

export const Input = forwardRef(({
  id,
  name,
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  disabled = false,
  readOnly = false,
  required = false,
  error = null,
  helperText = null,
  size = 'md',
  startIcon = null,
  endIcon = null,
  className,
  ...rest
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || `input-${name}-${Math.random().toString(36).substr(2, 9)}`;
  
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };
  
  const getInputType = () => {
    if (type === 'password') {
      return showPassword ? 'text' : 'password';
    }
    return type;
  };
  
  return (
    <InputWrapper className={className}>
      {label && (
        <InputLabel htmlFor={inputId} required={required}>
          {label}
        </InputLabel>
      )}
      <InputContainer>
        {startIcon && (
          <InputIcon position="start">
            {startIcon}
          </InputIcon>
        )}
        <StyledInput
          ref={ref}
          id={inputId}
          name={name}
          type={getInputType()}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          error={!!error}
          size={size}
          startIcon={!!startIcon}
          endIcon={!!endIcon || type === 'password'}
          {...rest}
        />
        {type === 'password' && (
          <InputIcon position="end" clickable onClick={togglePasswordVisibility}>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </InputIcon>
        )}
        {endIcon && type !== 'password' && (
          <InputIcon position="end">
            {endIcon}
          </InputIcon>
        )}
      </InputContainer>
      {(helperText || error) && (
        <InputHelperText error={!!error}>
          {error || helperText}
        </InputHelperText>
      )}
    </InputWrapper>
  );
});

Input.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  label: PropTypes.node,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  required: PropTypes.bool,
  error: PropTypes.string,
  helperText: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  startIcon: PropTypes.node,
  endIcon: PropTypes.node,
  className: PropTypes.string
};

// ========== MODAL COMPONENT ==========

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  animation: ${fadeIn} 0.2s ease-out;
`;

const ModalContainer = styled.div`
  background-color: ${props => props.theme.modal.background};
  border-radius: 0.5rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
  width: ${props => {
    switch (props.size) {
      case 'sm': return '300px';
      case 'lg': return '800px';
      case 'xl': return '1140px';
      default: return '500px';
    }
  }};
  max-width: 95vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  animation: ${slideDown} 0.3s ease-out;
  
  @media (max-width: 576px) {
    width: 95vw;
    max-height: 80vh;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid ${props => props.theme.modal.borderColor};
  
  h4 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: ${props => props.theme.modal.headerText};
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
`;

const ModalFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 1rem 1.5rem;
  border-top: 1px solid ${props => props.theme.modal.borderColor};
  gap: 0.5rem;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  color: ${props => props.theme.modal.closeButtonColor};
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s ease-in-out;
  
  &:hover {
    color: ${props => props.theme.modal.closeButtonHoverColor};
  }
`;

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
  showCloseButton = true,
  className,
  ...rest
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };
  
  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContainer size={size} className={className} {...rest}>
        <ModalHeader>
          <h4>{title}</h4>
          {showCloseButton && (
            <CloseButton onClick={onClose} aria-label="Close">
              <FaTimes />
            </CloseButton>
          )}
        </ModalHeader>
        <ModalBody>{children}</ModalBody>
        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContainer>
    </ModalOverlay>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  closeOnOverlayClick: PropTypes.bool,
  showCloseButton: PropTypes.bool,
  className: PropTypes.string
};

// ========== TABLE COMPONENT ==========

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  background-color: ${props => props.theme.table.background};
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  font-size: 0.875rem;
`;

const TableHead = styled.thead`
  background-color: ${props => props.theme.table.headerBackground};
  
  th {
    padding: 0.75rem 1rem;
    text-align: left;
    font-weight: 600;
    color: ${props => props.theme.table.headerText};
    border-bottom: 2px solid ${props => props.theme.table.borderColor};
    white-space: nowrap;
    position: relative;
    
    &.sortable {
      cursor: pointer;
      user-select: none;
      
      &:hover {
        background-color: ${props => props.theme.table.headerHoverBackground};
      }
    }
  }
`;

const TableBody = styled.tbody`
  tr {
    &:nth-child(even) {
      background-color: ${props => props.theme.table.stripedBackground};
    }
    
    &:hover {
      background-color: ${props => props.theme.table.rowHoverBackground};
    }
    
    &.selected {
      background-color: ${props => props.theme.table.selectedRowBackground};
    }
  }
  
  td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid ${props => props.theme.table.borderColor};
    color: ${props => props.theme.table.cellText};
  }
`;

const TableFooter = styled.tfoot`
  background-color: ${props => props.theme.table.footerBackground};
  
  td {
    padding: 0.75rem 1rem;
    border-top: 2px solid ${props => props.theme.table.borderColor};
  }
`;

const SortIcon = styled.span`
  margin-left: 0.5rem;
  display: inline-flex;
  align-items: center;
`;

const EmptyMessage = styled.div`
  padding: 2rem;
  text-align: center;
  color: ${props => props.theme.table.emptyText};
  font-style: italic;
`;

export const Table = ({
  columns,
  data,
  sortable = false,
  sortColumn = null,
  sortDirection = 'asc',
  onSort = null,
  onRowClick = null,
  selectedRowId = null,
  footer = null,
  emptyMessage = 'No data available',
  className,
  ...rest
}) => {
  const handleSort = (column) => {
    if (!sortable || !column.sortable || !onSort) return;
    
    const newDirection = sortColumn === column.key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(column.key, newDirection);
  };
  
  const renderSortIcon = (column) => {
    if (!sortable || !column.sortable) return null;
    
    if (sortColumn === column.key) {
      return (
        <SortIcon>
          {sortDirection === 'asc' ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
        </SortIcon>
      );
    }
    
    return null;
  };
  
  return (
    <TableContainer className={className} {...rest}>
      <StyledTable>
        <TableHead>
          <tr>
            {columns.map((column) => (
              <th 
                key={column.key}
                className={column.sortable && sortable ? 'sortable' : ''}
                style={{ width: column.width || 'auto' }}
                onClick={() => handleSort(column)}
              >
                {column.title}
                {renderSortIcon(column)}
              </th>
            ))}
          </tr>
        </TableHead>
        <TableBody>
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr 
                key={row.id || rowIndex}
                onClick={() => onRowClick && onRowClick(row)}
                className={selectedRowId && row.id === selectedRowId ? 'selected' : ''}
                style={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                {columns.map((column) => (
                  <td key={`${row.id || rowIndex}-${column.key}`}>
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length}>
                <EmptyMessage>{emptyMessage}</EmptyMessage>
              </td>
            </tr>
          )}
        </TableBody>
        {footer && (
          <TableFooter>
            {footer}
          </TableFooter>
        )}
      </StyledTable>
    </TableContainer>
  );
};

Table.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      title: PropTypes.node.isRequired,
      sortable: PropTypes.bool,
      width: PropTypes.string,
      render: PropTypes.func
    })
  ).isRequired,
  data: PropTypes.array.isRequired,
  sortable: PropTypes.bool,
  sortColumn: PropTypes.string,
  sortDirection: PropTypes.oneOf(['asc', 'desc']),
  onSort: PropTypes.func,
  onRowClick: PropTypes.func,
  selectedRowId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  footer: PropTypes.node,
  emptyMessage: PropTypes.node,
  className: PropTypes.string
};

// ========== LOADER COMPONENT ==========

const LoaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.fullPage ? '0' : '2rem'};
  height: ${props => props.fullPage ? '100vh' : 'auto'};
  width: 100%;
`;

const SpinnerIcon = styled.div`
  color: ${props => props.theme.colors.primary};
  animation: ${spin} 1s linear infinite;
  font-size: ${props => {
    switch (props.size) {
      case 'sm': return '1.5rem';
      case 'lg': return '3rem';
      default: return '2rem';
    }
  }};
`;

const LoaderText = styled.div`
  margin-top: 1rem;
  color: ${props => props.theme.text};
  font-size: 0.875rem;
  text-align: center;
`;

export const Loader = ({
  size = 'md',
  fullPage = false,
  text = null,
  className,
  ...rest
}) => {
  return (
    <LoaderContainer fullPage={fullPage} className={className} {...rest}>
      <div>
        <SpinnerIcon size={size}>
          <FaSpinner size="100%" />
        </SpinnerIcon>
        {text && <LoaderText>{text}</LoaderText>}
      </div>
    </LoaderContainer>
  );
};

Loader.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  fullPage: PropTypes.bool,
  text: PropTypes.string,
  className: PropTypes.string
};

// ========== PAGINATION COMPONENT ==========

const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
  flex-wrap: wrap;
  gap: 1rem;
`;

const PaginationInfo = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.pagination.infoText};
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const PageButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 2rem;
  padding: 0 0.5rem;
  border-radius: 0.25rem;
  background-color: ${props => props.active ? props.theme.colors.primary : props.theme.pagination.buttonBackground};
  color: ${props => props.active ? 'white' : props.theme.pagination.buttonText};
  border: 1px solid ${props => props.active ? props.theme.colors.primary : props.theme.pagination.buttonBorder};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background-color: ${props => props.active ? props.theme.colors.primaryDark : props.theme.pagination.buttonHoverBackground};
    border-color: ${props => props.active ? props.theme.colors.primaryDark : props.theme.pagination.buttonHoverBorder};
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const PageSizeSelector = styled.select`
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  border-radius: 0.25rem;
  border: 1px solid ${props => props.theme.pagination.buttonBorder};
  background-color: ${props => props.theme.pagination.buttonBackground};
  color: ${props => props.theme.pagination.buttonText};
  cursor: pointer;
  margin-left: 0.5rem;
`;

export const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  pageSizeOptions = [10, 25, 50, 100],
  onPageChange,
  onPageSizeChange,
  showPageSizeSelector = true,
  className,
  ...rest
}) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate middle pages
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if at the beginning or end
      if (currentPage <= 2) {
        endPage = 4;
      } else if (currentPage >= totalPages - 1) {
        startPage = totalPages - 3;
      }
      
      // Add ellipsis if needed
      if (startPage > 2) {
        pages.push('...');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      
      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };
  
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  };
  
  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value, 10);
    onPageSizeChange(newSize);
  };
  
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  
  return (
    <PaginationContainer className={className} {...rest}>
      <PaginationInfo>
        Showing {totalItems > 0 ? `${startItem}-${endItem} of ` : ''}{totalItems} items
        {showPageSizeSelector && (
          <>
            <span> | Items per page:</span>
            <PageSizeSelector value={pageSize} onChange={handlePageSizeChange}>
              {pageSizeOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </PageSizeSelector>
          </>
        )}
      </PaginationInfo>
      
      {totalPages > 1 && (
        <PaginationControls>
          <PageButton 
            onClick={() => handlePageChange(1)} 
            disabled={currentPage === 1}
            aria-label="First page"
          >
            &laquo;
          </PageButton>
          <PageButton 
            onClick={() => handlePageChange(currentPage - 1)} 
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            &lsaquo;
          </PageButton>
          
          {getPageNumbers().map((page, index) => (
            page === '...' ? (
              <PageButton key={`ellipsis-${index}`} disabled>...</PageButton>
            ) : (
              <PageButton 
                key={page}
                active={page === currentPage}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </PageButton>
            )
          ))}
          
          <PageButton 
            onClick={() => handlePageChange(currentPage + 1)} 
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            &rsaquo;
          </PageButton>
          <PageButton 
            onClick={() => handlePageChange(totalPages)} 
            disabled={currentPage === totalPages}
            aria-label="Last page"
          >
            &raquo;
          </PageButton>
        </PaginationControls>
      )}
    </PaginationContainer>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  totalItems: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  pageSizeOptions: PropTypes.arrayOf(PropTypes.number),
  onPageChange: PropTypes.func.isRequired,
  onPageSizeChange: PropTypes.func,
  showPageSizeSelector: PropTypes.bool,
  className: PropTypes.string
};

// ========== ALERT COMPONENT ==========

const AlertContainer = styled.div`
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 0.375rem;
  display: flex;
  align-items: flex-start;
  animation: ${fadeIn} 0.3s ease-out;
  
  ${props => props.variant === 'success' && css`
    background-color: ${props.theme.alert.successBackground};
    color: ${props.theme.alert.successText};
    border-left: 4px solid ${props.theme.colors.success};
  `}
  
  ${props => props.variant === 'info' && css`
    background-color: ${props.theme.alert.infoBackground};
    color: ${props.theme.alert.infoText};
    border-left: 4px solid ${props.theme.colors.info};
  `}
  
  ${props => props.variant === 'warning' && css`
    background-color: ${props.theme.alert.warningBackground};
    color: ${props.theme.alert.warningText};
    border-left: 4px solid ${props.theme.colors.warning};
  `}
  
  ${props => props.variant === 'danger' && css`
    background-color: ${props.theme.alert.dangerBackground};
    color: ${props.theme.alert.dangerText};
    border-left: 4px solid ${props.theme.colors.danger};
  `}
`;

const AlertIconWrapper = styled.div`
  margin-right: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  
  ${props => props.variant === 'success' && css`
    color: ${props.theme.colors.success};
  `}
  
  ${props => props.variant === 'info' && css`
    color: ${props.theme.colors.info};
  `}
  
  ${props => props.variant === 'warning' && css`
    color: ${props.theme.colors.warning};
  `}
  
  ${props => props.variant === 'danger' && css`
    color: ${props.theme.colors.danger};
  `}
`;

const AlertContent = styled.div`
  flex: 1;
`;

const AlertTitle = styled.h4`
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
`;

const AlertMessage = styled.div`
  font-size: 0.875rem;
`;

const AlertCloseButton = styled.button`
  background: transparent;
  border: none;
  color: inherit;
  opacity: 0.5;
  cursor: pointer;
  padding: 0;
  margin-left: 0.75rem;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.15s ease-in-out;
  
  &:hover {
    opacity: 0.75;
  }
`;

export const Alert = ({
  variant = 'info',
  title = null,
  message,
  onClose = null,
  showIcon = true,
  className,
  ...rest
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'success':
        return <FaCheck />;
      case 'warning':
        return <FaExclamationTriangle />;
      case 'danger':
        return <FaTimes />;
      case 'info':
      default:
        return <FaInfoCircle />;
    }
  };
  
  return (
    <AlertContainer variant={variant} className={className} {...rest}>
      {showIcon && (
        <AlertIconWrapper variant={variant}>
          {getIcon()}
        </AlertIconWrapper>
      )}
      <AlertContent>
        {title && <AlertTitle>{title}</AlertTitle>}
        <AlertMessage>{message}</AlertMessage>
      </AlertContent>
      {onClose && (
        <AlertCloseButton onClick={onClose} aria-label="Close">
          <FaTimes />
        </AlertCloseButton>
      )}
    </AlertContainer>
  );
};

Alert.propTypes = {
  variant: PropTypes.oneOf(['success', 'info', 'warning', 'danger']),
  title: PropTypes.node,
  message: PropTypes.node.isRequired,
  onClose: PropTypes.func,
  showIcon: PropTypes.bool,
  className: PropTypes.string
};

// Export all components
export default {
  Button,
  Card,
  Input,
  Modal,
  Table,
  Loader,
  Pagination,
  Alert
};