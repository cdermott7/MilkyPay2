import React, { useState, forwardRef } from 'react';
import styled, { css } from 'styled-components';
import theme from '../../styles/theme';

interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  variant?: 'outlined' | 'filled' | 'underlined';
  size?: 'sm' | 'md' | 'lg';
  onClear?: () => void;
  showClearButton?: boolean;
}

// Container div for the input component
const InputContainer = styled.div<{ fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  margin-bottom: ${theme.spacing[4]};
  width: ${props => (props.fullWidth ? '100%' : 'auto')};
`;

// Label styles
const InputLabel = styled.label<{ hasError?: boolean }>`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  margin-bottom: ${theme.spacing[1]};
  color: ${props => props.hasError ? theme.colors.status.error : theme.colors.gray[700]};
`;

// Wrapper for input element and icons
const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
`;

// Icon containers
const LeftIconContainer = styled.div`
  position: absolute;
  left: ${theme.spacing[3]};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.gray[500]};
  pointer-events: none;
`;

const RightIconContainer = styled.div`
  position: absolute;
  right: ${theme.spacing[3]};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.gray[500]};
  cursor: pointer;
`;

// Base input styles
const StyledInput = styled.input<Pick<TextInputProps, 'size' | 'variant'> & { hasError?: boolean; hasLeftIcon?: boolean; hasRightIcon?: boolean }>`
  width: 100%;
  font-family: ${theme.typography.fontFamily.secondary};
  border-radius: ${theme.borderRadius.lg};
  transition: all ${theme.animation.durations.normal} ${theme.animation.easings.easeOut};
  
  &:focus {
    outline: none;
  }
  
  &::placeholder {
    color: ${theme.colors.gray[400]};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: ${theme.colors.gray[100]};
  }
  
  /* Size variants */
  ${props => {
    switch (props.size) {
      case 'sm':
        return css`
          font-size: ${theme.typography.fontSize.sm};
          padding: ${theme.spacing[1]} ${theme.spacing[3]};
          height: 2.25rem; /* 36px */
          ${props.hasLeftIcon && css`padding-left: ${theme.spacing[8]};`}
          ${props.hasRightIcon && css`padding-right: ${theme.spacing[8]};`}
        `;
      case 'lg':
        return css`
          font-size: ${theme.typography.fontSize.md};
          padding: ${theme.spacing[3]} ${theme.spacing[4]};
          height: 3.25rem; /* 52px */
          ${props.hasLeftIcon && css`padding-left: ${theme.spacing[10]};`}
          ${props.hasRightIcon && css`padding-right: ${theme.spacing[10]};`}
        `;
      case 'md':
      default:
        return css`
          font-size: ${theme.typography.fontSize.base};
          padding: ${theme.spacing[2]} ${theme.spacing[4]};
          height: 2.75rem; /* 44px */
          ${props.hasLeftIcon && css`padding-left: ${theme.spacing[10]};`}
          ${props.hasRightIcon && css`padding-right: ${theme.spacing[10]};`}
        `;
    }
  }}
  
  /* Style variants */
  ${props => {
    switch (props.variant) {
      case 'filled':
        return css`
          border: none;
          background-color: ${theme.colors.gray[100]};
          
          &:focus {
            background-color: ${theme.colors.gray[50]};
            box-shadow: 0 0 0 2px ${theme.colors.primary[100]};
          }
          
          ${props.hasError && css`
            background-color: ${theme.colors.status.error}10;
            box-shadow: 0 0 0 1px ${theme.colors.status.error};
            
            &:focus {
              box-shadow: 0 0 0 2px ${theme.colors.status.error}40;
            }
          `}
        `;
      case 'underlined':
        return css`
          border: none;
          border-bottom: 2px solid ${theme.colors.gray[300]};
          border-radius: 0;
          padding-left: 0;
          padding-right: 0;
          
          &:focus {
            border-bottom-color: ${theme.colors.primary[500]};
          }
          
          ${props.hasError && css`
            border-bottom-color: ${theme.colors.status.error};
            
            &:focus {
              border-bottom-color: ${theme.colors.status.error};
            }
          `}
        `;
      case 'outlined':
      default:
        return css`
          border: 1px solid ${theme.colors.gray[300]};
          background-color: ${theme.colors.white};
          
          &:focus {
            border-color: ${theme.colors.primary[500]};
            box-shadow: 0 0 0 2px ${theme.colors.primary[100]};
          }
          
          ${props.hasError && css`
            border-color: ${theme.colors.status.error};
            
            &:focus {
              border-color: ${theme.colors.status.error};
              box-shadow: 0 0 0 2px ${theme.colors.status.error}30;
            }
          `}
        `;
    }
  }}
`;

// Helper and error text
const HelperText = styled.div<{ hasError?: boolean }>`
  font-size: ${theme.typography.fontSize.xs};
  margin-top: ${theme.spacing[1]};
  color: ${props => props.hasError ? theme.colors.status.error : theme.colors.gray[500]};
`;

// Clear button
const ClearButton = styled.button`
  position: absolute;
  right: ${theme.spacing[3]};
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.gray[400]};
  padding: ${theme.spacing[1]};
  transition: color ${theme.animation.durations.fast} ${theme.animation.easings.easeOut};
  
  &:hover {
    color: ${theme.colors.gray[700]};
  }
`;

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      variant = 'outlined',
      size = 'md',
      onClear,
      showClearButton,
      value,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };
    
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };
    
    const clearInput = () => {
      if (onClear) {
        onClear();
      }
    };
    
    // Show the clear button only when there's a value, showClearButton is true, and onClear is provided
    const showClear = showClearButton && onClear && value && String(value).length > 0;
    
    // Adjust because we can't have both rightIcon and clearButton
    const effectiveRightIcon = showClear ? (
      <svg 
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        onClick={clearInput}
      >
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    ) : rightIcon;

    return (
      <InputContainer fullWidth={fullWidth}>
        {label && <InputLabel hasError={!!error}>{label}</InputLabel>}
        
        <InputWrapper>
          {leftIcon && <LeftIconContainer>{leftIcon}</LeftIconContainer>}
          
          <StyledInput
            ref={ref}
            hasError={!!error}
            hasLeftIcon={!!leftIcon}
            hasRightIcon={!!effectiveRightIcon}
            variant={variant}
            size={size}
            value={value}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
          
          {effectiveRightIcon && (
            <RightIconContainer onClick={showClear ? clearInput : undefined}>
              {effectiveRightIcon}
            </RightIconContainer>
          )}
        </InputWrapper>
        
        {(error || helperText) && (
          <HelperText hasError={!!error}>{error || helperText}</HelperText>
        )}
      </InputContainer>
    );
  }
);

TextInput.displayName = 'TextInput';

export default TextInput;