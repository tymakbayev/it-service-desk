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
    props.readOnly &&
    css`
      background-color: #f9f9f9;
      cursor: default;
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

// Styled prefix/suffix container
const AddonContainer = styled.div`
  position: absolute;
  top: ${(props) => (props.hasLabel ? 'calc(1.5rem + 8px)' : '0')};
  ${(props) => (props.position === 'start' ? 'left: 0;' : 'right: 0;')}
  height: ${(props) => (props.size === SIZES.SMALL ? '32px' : props.size === SIZES.LARGE ? '48px' : '40px')};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.75rem;
  color: #757575;
  pointer-events: none;
  z-index: 1;
`;

/**
 * Input component for forms with various styles and states
 */
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
      error = null,
      helperText = null,
      variant = VARIANTS.DEFAULT,
      size = SIZES.MEDIUM,
      fullWidth = false,
      noMargin = false,
      className = '',
      autoComplete = 'off',
      min,
      max,
      step,
      pattern,
      maxLength,
      minLength,
      autoFocus = false,
      prefix = null,
      suffix = null,
      ...rest
    },
    ref
  ) => {
    // Generate a unique ID if not provided
    const inputId = id || `input-${name}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Calculate padding based on prefix/suffix
    const getPadding = () => {
      if (prefix && suffix) {
        return { paddingLeft: '2.5rem', paddingRight: '2.5rem' };
      } else if (prefix) {
        return { paddingLeft: '2.5rem' };
      } else if (suffix) {
        return { paddingRight: '2.5rem' };
      }
      return {};
    };

    return (
      <InputContainer fullWidth={fullWidth} noMargin={noMargin} className={className}>
        {label && (
          <Label htmlFor={inputId} required={required}>
            {label}
          </Label>
        )}
        
        <div style={{ position: 'relative' }}>
          {prefix && (
            <AddonContainer position="start" hasLabel={!!label} size={size}>
              {prefix}
            </AddonContainer>
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
            error={!!error}
            variant={variant}
            size={size}
            autoComplete={autoComplete}
            min={min}
            max={max}
            step={step}
            pattern={pattern}
            maxLength={maxLength}
            minLength={minLength}
            autoFocus={autoFocus}
            style={getPadding()}
            {...rest}
          />
          
          {suffix && (
            <AddonContainer position="end" hasLabel={!!label} size={size}>
              {suffix}
            </AddonContainer>
          )}
        </div>
        
        {error ? (
          <ErrorMessage>{error}</ErrorMessage>
        ) : helperText ? (
          <HelperText>{helperText}</HelperText>
        ) : null}
      </InputContainer>
    );
  }
);

Input.displayName = 'Input';

Input.propTypes = {
  /** Input id attribute */
  id: PropTypes.string,
  /** Input name attribute */
  name: PropTypes.string.isRequired,
  /** Input type attribute */
  type: PropTypes.oneOf(Object.values(TYPES)),
  /** Input label */
  label: PropTypes.node,
  /** Input placeholder */
  placeholder: PropTypes.string,
  /** Input value for controlled component */
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /** Default value for uncontrolled component */
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /** Function called when input value changes */
  onChange: PropTypes.func,
  /** Function called when input loses focus */
  onBlur: PropTypes.func,
  /** Function called when input gains focus */
  onFocus: PropTypes.func,
  /** Whether the input is disabled */
  disabled: PropTypes.bool,
  /** Whether the input is read-only */
  readOnly: PropTypes.bool,
  /** Whether the input is required */
  required: PropTypes.bool,
  /** Error message to display */
  error: PropTypes.string,
  /** Helper text to display below the input */
  helperText: PropTypes.string,
  /** Input variant */
  variant: PropTypes.oneOf(Object.values(VARIANTS)),
  /** Input size */
  size: PropTypes.oneOf(Object.values(SIZES)),
  /** Whether the input should take up the full width of its container */
  fullWidth: PropTypes.bool,
  /** Whether to remove the bottom margin */
  noMargin: PropTypes.bool,
  /** Additional CSS class name */
  className: PropTypes.string,
  /** HTML autocomplete attribute */
  autoComplete: PropTypes.string,
  /** Minimum value for number inputs */
  min: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /** Maximum value for number inputs */
  max: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /** Step value for number inputs */
  step: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /** Pattern for validation */
  pattern: PropTypes.string,
  /** Maximum length of input value */
  maxLength: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /** Minimum length of input value */
  minLength: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /** Whether the input should automatically get focus */
  autoFocus: PropTypes.bool,
  /** Content to display before the input */
  prefix: PropTypes.node,
  /** Content to display after the input */
  suffix: PropTypes.node,
};

// Export constants and component
export { VARIANTS as INPUT_VARIANTS, SIZES as INPUT_SIZES, TYPES as INPUT_TYPES };
export default Input;