import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';

// Input variants
const VARIANTS = {
  DEFAULT: 'default',
  PRIMARY: 'primary',
  SUCCESS: 'success',
  DANGER: 'danger',
  WARNING: 'warning',
  INFO: 'info',
};

// Input sizes
const SIZES = {
  SMALL: 'sm',
  MEDIUM: 'md',
  LARGE: 'lg',
};

// Input types
const TYPES = {
  TEXT: 'text',
  PASSWORD: 'password',
  EMAIL: 'email',
  NUMBER: 'number',
  TEL: 'tel',
  URL: 'url',
  SEARCH: 'search',
  DATE: 'date',
  TIME: 'time',
  DATETIME: 'datetime-local',
  MONTH: 'month',
  WEEK: 'week',
  COLOR: 'color',
  FILE: 'file',
  HIDDEN: 'hidden',
};

// Color mapping for variants
const colorMap = {
  [VARIANTS.DEFAULT]: {
    borderColor: '#e0e0e0',
    focusBorderColor: '#bdbdbd',
    errorBorderColor: '#f44336',
    placeholderColor: '#9e9e9e',
    backgroundColor: '#ffffff',
    textColor: '#333333',
  },
  [VARIANTS.PRIMARY]: {
    borderColor: '#e0e0e0',
    focusBorderColor: '#3f51b5',
    errorBorderColor: '#f44336',
    placeholderColor: '#9e9e9e',
    backgroundColor: '#ffffff',
    textColor: '#333333',
  },
  [VARIANTS.SUCCESS]: {
    borderColor: '#e0e0e0',
    focusBorderColor: '#4caf50',
    errorBorderColor: '#f44336',
    placeholderColor: '#9e9e9e',
    backgroundColor: '#ffffff',
    textColor: '#333333',
  },
  [VARIANTS.DANGER]: {
    borderColor: '#e0e0e0',
    focusBorderColor: '#f44336',
    errorBorderColor: '#f44336',
    placeholderColor: '#9e9e9e',
    backgroundColor: '#ffffff',
    textColor: '#333333',
  },
  [VARIANTS.WARNING]: {
    borderColor: '#e0e0e0',
    focusBorderColor: '#ff9800',
    errorBorderColor: '#f44336',
    placeholderColor: '#9e9e9e',
    backgroundColor: '#ffffff',
    textColor: '#333333',
  },
  [VARIANTS.INFO]: {
    borderColor: '#e0e0e0',
    focusBorderColor: '#2196f3',
    errorBorderColor: '#f44336',
    placeholderColor: '#9e9e9e',
    backgroundColor: '#ffffff',
    textColor: '#333333',
  },
};

// Size styles
const sizeStyles = {
  [SIZES.SMALL]: css`
    height: 32px;
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
    border-radius: 0.2rem;
  `,
  [SIZES.MEDIUM]: css`
    height: 40px;
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    border-radius: 0.25rem;
  `,
  [SIZES.LARGE]: css`
    height: 48px;
    padding: 0.5rem 1rem;
    font-size: 1.125rem;
    border-radius: 0.3rem;
  `,
};

// Styled input container
const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: ${(props) => (props.noMargin ? '0' : '1rem')};
  width: ${(props) => (props.fullWidth ? '100%' : 'auto')};
  position: relative;
`;

// Styled label
const Label = styled.label`
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #333333;
  display: flex;
  align-items: center;
  
  ${(props) =>
    props.required &&
    css`
      &::after {
        content: '*';
        color: #f44336;
        margin-left: 0.25rem;
      }
    `}
`;

// Styled input
const StyledInput = styled.input`
  display: block;
  width: 100%;
  box-sizing: border-box;
  background-color: ${(props) => colorMap[props.variant].backgroundColor};
  color: ${(props) => colorMap[props.variant].textColor};
  border: 1px solid ${(props) =>
    props.error ? colorMap[props.variant].errorBorderColor : colorMap[props.variant].borderColor};
  outline: none;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  
  &:focus {
    border-color: ${(props) =>
      props.error
        ? colorMap[props.variant].errorBorderColor
        : colorMap[props.variant].focusBorderColor};
    box-shadow: 0 0 0 0.2rem ${(props) =>
      props.error
        ? 'rgba(244, 67, 54, 0.25)'
        : `${colorMap[props.variant].focusBorderColor}25`};
  }
  
  &::placeholder {
    color: ${(props) => colorMap[props.variant].placeholderColor};
    opacity: 1;
  }
  
  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
    opacity: 0.7;
  }
  
  ${(props) => sizeStyles[props.size]}
  
  ${(props) =>
    props.rounded &&
    css`
      border-radius: 50px;
    `}
`;

// Styled error message
const ErrorMessage = styled.div`
  color: #f44336;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  min-height: 1rem;
`;

// Styled helper text
const HelperText = styled.div`
  color: #757575;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  min-height: 1rem;
`;

// Styled icon container
const IconContainer = styled.div`
  position: absolute;
  top: ${(props) => (props.hasLabel ? 'calc(1.5rem + 8px)' : '8px')};
  ${(props) => (props.position === 'left' ? 'left: 8px' : 'right: 8px')};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #757575;
  pointer-events: ${(props) => (props.clickable ? 'auto' : 'none')};
  cursor: ${(props) => (props.clickable ? 'pointer' : 'default')};
  
  ${(props) =>
    props.size === SIZES.SMALL &&
    css`
      top: ${props.hasLabel ? 'calc(1.5rem + 4px)' : '4px'};
      ${props.position === 'left' ? 'left: 4px' : 'right: 4px'};
    `}
  
  ${(props) =>
    props.size === SIZES.LARGE &&
    css`
      top: ${props.hasLabel ? 'calc(1.5rem + 12px)' : '12px'};
      ${props.position === 'left' ? 'left: 12px' : 'right: 12px'};
    `}
`;

// Input component
const Input = forwardRef(
  (
    {
      id,
      name,
      type = TYPES.TEXT,
      label,
      placeholder,
      value,
      defaultValue,
      onChange,
      onBlur,
      onFocus,
      disabled = false,
      readOnly = false,
      required = false,
      autoFocus = false,
      autoComplete = 'off',
      min,
      max,
      step,
      pattern,
      maxLength,
      minLength,
      multiple,
      accept,
      size = SIZES.MEDIUM,
      variant = VARIANTS.DEFAULT,
      error,
      helperText,
      fullWidth = false,
      noMargin = false,
      rounded = false,
      startIcon,
      endIcon,
      onStartIconClick,
      onEndIconClick,
      className,
      style,
      ...rest
    },
    ref
  ) => {
    // Generate a unique ID if not provided
    const inputId = id || `input-${name}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Handle start icon click
    const handleStartIconClick = (e) => {
      if (onStartIconClick && typeof onStartIconClick === 'function') {
        onStartIconClick(e);
      }
    };
    
    // Handle end icon click
    const handleEndIconClick = (e) => {
      if (onEndIconClick && typeof onEndIconClick === 'function') {
        onEndIconClick(e);
      }
    };
    
    return (
      <InputContainer
        className={`input-container ${className || ''}`}
        style={style}
        fullWidth={fullWidth}
        noMargin={noMargin}
      >
        {label && (
          <Label htmlFor={inputId} required={required}>
            {label}
          </Label>
        )}
        
        <div style={{ position: 'relative' }}>
          {startIcon && (
            <IconContainer
              position="left"
              hasLabel={!!label}
              size={size}
              clickable={!!onStartIconClick}
              onClick={handleStartIconClick}
            >
              {startIcon}
            </IconContainer>
          )}
          
          <StyledInput
            id={inputId}
            ref={ref}
            name={name}
            type={type}
            placeholder={placeholder}
            value={value}
            defaultValue={defaultValue}
            onChange={onChange}
            onBlur={onBlur}
            onFocus={onFocus}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            autoFocus={autoFocus}
            autoComplete={autoComplete}
            min={min}
            max={max}
            step={step}
            pattern={pattern}
            maxLength={maxLength}
            minLength={minLength}
            multiple={multiple}
            accept={accept}
            size={size}
            variant={variant}
            error={!!error}
            rounded={rounded}
            style={{
              paddingLeft: startIcon ? (size === SIZES.SMALL ? '1.5rem' : size === SIZES.LARGE ? '2.5rem' : '2rem') : undefined,
              paddingRight: endIcon ? (size === SIZES.SMALL ? '1.5rem' : size === SIZES.LARGE ? '2.5rem' : '2rem') : undefined,
            }}
            {...rest}
          />
          
          {endIcon && (
            <IconContainer
              position="right"
              hasLabel={!!label}
              size={size}
              clickable={!!onEndIconClick}
              onClick={handleEndIconClick}
            >
              {endIcon}
            </IconContainer>
          )}
        </div>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {!error && helperText && <HelperText>{helperText}</HelperText>}
      </InputContainer>
    );
  }
);

Input.displayName = 'Input';

Input.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string.isRequired,
  type: PropTypes.oneOf(Object.values(TYPES)),
  label: PropTypes.node,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.bool,
  ]),
  defaultValue: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.bool,
  ]),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  required: PropTypes.bool,
  autoFocus: PropTypes.bool,
  autoComplete: PropTypes.string,
  min: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  max: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  step: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  pattern: PropTypes.string,
  maxLength: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  minLength: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  multiple: PropTypes.bool,
  accept: PropTypes.string,
  size: PropTypes.oneOf(Object.values(SIZES)),
  variant: PropTypes.oneOf(Object.values(VARIANTS)),
  error: PropTypes.node,
  helperText: PropTypes.node,
  fullWidth: PropTypes.bool,
  noMargin: PropTypes.bool,
  rounded: PropTypes.bool,
  startIcon: PropTypes.node,
  endIcon: PropTypes.node,
  onStartIconClick: PropTypes.func,
  onEndIconClick: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object,
};

// Export component and constants
export default Input;
export { VARIANTS, SIZES, TYPES };