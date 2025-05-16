import React from 'react';
import styled, { css } from 'styled-components';
import theme from '../../styles/theme';

// Button variants
type ButtonVariant = 'primary' | 'secondary' | 'outlined' | 'ghost' | 'danger';

// Button sizes
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
}

// Base button styles
const BaseButton = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing[2]};
  border-radius: ${theme.borderRadius.lg};
  font-weight: ${theme.typography.fontWeight.medium};
  transition: all ${theme.animation.durations.normal} ${theme.animation.easings.easeOut};
  cursor: pointer;
  outline: none;
  position: relative;
  overflow: hidden;
  border: none;
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  /* Full width variant */
  ${props => props.fullWidth && css`
    width: 100%;
  `}
  
  /* Size variants */
  ${props => {
    switch (props.size) {
      case 'sm':
        return css`
          font-size: ${theme.typography.fontSize.sm};
          padding: ${theme.spacing[1]} ${theme.spacing[3]};
          height: 2.25rem; /* 36px */
        `;
      case 'lg':
        return css`
          font-size: ${theme.typography.fontSize.md};
          padding: ${theme.spacing[3]} ${theme.spacing[6]};
          height: 3.25rem; /* 52px */
        `;
      case 'md':
      default:
        return css`
          font-size: ${theme.typography.fontSize.base};
          padding: ${theme.spacing[2]} ${theme.spacing[4]};
          height: 2.75rem; /* 44px */
        `;
    }
  }}
  
  /* Style variants */
  ${props => {
    switch (props.variant) {
      case 'secondary':
        return css`
          background-color: ${theme.colors.secondary[500]};
          color: white;
          box-shadow: ${theme.shadows.md};
          
          &:hover:not(:disabled) {
            background-color: ${theme.colors.secondary[600]};
            transform: translateY(-1px);
            box-shadow: ${theme.shadows.lg};
          }
          
          &:active:not(:disabled) {
            background-color: ${theme.colors.secondary[700]};
            transform: translateY(0);
            box-shadow: ${theme.shadows.sm};
          }
        `;
      case 'outlined':
        return css`
          background-color: transparent;
          color: ${theme.colors.primary[600]};
          border: 2px solid ${theme.colors.primary[200]};
          
          &:hover:not(:disabled) {
            background-color: ${theme.colors.primary[50]};
            border-color: ${theme.colors.primary[300]};
          }
          
          &:active:not(:disabled) {
            background-color: ${theme.colors.primary[100]};
          }
        `;
      case 'ghost':
        return css`
          background-color: transparent;
          color: ${theme.colors.primary[600]};
          
          &:hover:not(:disabled) {
            background-color: ${theme.colors.primary[50]};
          }
          
          &:active:not(:disabled) {
            background-color: ${theme.colors.primary[100]};
          }
        `;
      case 'danger':
        return css`
          background-color: ${theme.colors.status.error};
          color: white;
          
          &:hover:not(:disabled) {
            background-color: #E43535; /* Darker red */
            transform: translateY(-1px);
            box-shadow: ${theme.shadows.md};
          }
          
          &:active:not(:disabled) {
            background-color: #D02F2F; /* Even darker red */
            transform: translateY(0);
          }
        `;
      case 'primary':
      default:
        return css`
          background-color: ${theme.colors.primary[600]};
          color: white;
          box-shadow: ${theme.shadows.md};
          
          &:hover:not(:disabled) {
            background-color: ${theme.colors.primary[700]};
            transform: translateY(-1px);
            box-shadow: ${theme.shadows.lg};
          }
          
          &:active:not(:disabled) {
            background-color: ${theme.colors.primary[800]};
            transform: translateY(0);
            box-shadow: ${theme.shadows.sm};
          }
        `;
    }
  }}
  
  /* Loading state */
  ${props => props.isLoading && css`
    color: transparent !important;
    pointer-events: none;
    
    &::after {
      content: "";
      position: absolute;
      width: 1.25rem;
      height: 1.25rem;
      top: calc(50% - 0.625rem);
      left: calc(50% - 0.625rem);
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-top-color: white;
      animation: button-loading-spinner 0.8s linear infinite;
    }
    
    @keyframes button-loading-spinner {
      from {
        transform: rotate(0turn);
      }
      to {
        transform: rotate(1turn);
      }
    }
  `}
`;

const Button: React.FC<ButtonProps> = ({
  children,
  leftIcon,
  rightIcon,
  isLoading = false,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  ...props
}) => {
  return (
    <BaseButton
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      isLoading={isLoading}
      {...props}
    >
      {!isLoading && leftIcon}
      {children}
      {!isLoading && rightIcon}
    </BaseButton>
  );
};

export default Button;