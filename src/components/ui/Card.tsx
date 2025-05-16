import React from 'react';
import styled, { css } from 'styled-components';
import theme from '../../styles/theme';

type CardElevation = 'flat' | 'low' | 'medium' | 'high';
type CardVariant = 'default' | 'outlined' | 'gradient' | 'glass';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  elevation?: CardElevation;
  variant?: CardVariant;
  hoverEffect?: boolean;
  fullWidth?: boolean;
  padding?: keyof typeof theme.spacing | 'none';
  radius?: keyof typeof theme.borderRadius;
}

// Shadow intensities based on elevation
const getElevationShadow = (elevation: CardElevation) => {
  switch (elevation) {
    case 'flat':
      return theme.shadows.none;
    case 'low':
      return theme.shadows.sm;
    case 'high':
      return theme.shadows.xl;
    case 'medium':
    default:
      return theme.shadows.md;
  }
};

// Define glass effect styles
const glassEffect = css`
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

// Define gradient effect
const gradientEffect = css`
  background: linear-gradient(135deg, ${theme.colors.primary[700]} 0%, ${theme.colors.primary[500]} 100%);
  color: white;
`;

const StyledCard = styled.div<CardProps>`
  display: flex;
  flex-direction: column;
  position: relative;
  border-radius: ${props => theme.borderRadius[props.radius || 'xl']};
  padding: ${props => (props.padding === 'none' ? 0 : theme.spacing[props.padding || 6])};
  transition: all ${theme.animation.durations.normal} ${theme.animation.easings.easeOut};
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  
  /* Variants */
  ${props => {
    switch (props.variant) {
      case 'outlined':
        return css`
          background-color: ${theme.colors.white};
          border: 1px solid ${theme.colors.gray[200]};
          box-shadow: ${getElevationShadow(props.elevation || 'flat')};
        `;
      case 'gradient':
        return css`
          ${gradientEffect}
          box-shadow: ${getElevationShadow(props.elevation || 'medium')};
        `;
      case 'glass':
        return css`
          ${glassEffect}
          box-shadow: ${getElevationShadow(props.elevation || 'low')};
        `;
      default:
        return css`
          background-color: ${theme.colors.white};
          box-shadow: ${getElevationShadow(props.elevation || 'medium')};
        `;
    }
  }}
  
  /* Hover effect */
  ${props => props.hoverEffect && css`
    &:hover {
      transform: translateY(-4px);
      box-shadow: ${getElevationShadow(
        props.elevation === 'high' 
          ? 'high' 
          : props.elevation === 'medium'
            ? 'high'
            : 'medium'
      )};
    }
  `}
`;

const Card: React.FC<CardProps> = ({
  children,
  elevation = 'medium',
  variant = 'default',
  hoverEffect = false,
  fullWidth = false,
  padding = 6,
  radius = 'xl',
  ...rest
}) => {
  return (
    <StyledCard
      elevation={elevation}
      variant={variant}
      hoverEffect={hoverEffect}
      fullWidth={fullWidth}
      padding={padding}
      radius={radius}
      {...rest}
    >
      {children}
    </StyledCard>
  );
};

// Card Header component
interface CardHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}

const StyledCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${theme.spacing[4]};
`;

const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.gray[900]};
`;

const CardSubtitle = styled.div`
  margin-top: ${theme.spacing[1]};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray[500]};
`;

const CardAction = styled.div`
  display: flex;
  align-items: center;
`;

export const CardHeader: React.FC<CardHeaderProps> = ({ title, subtitle, action, ...rest }) => {
  return (
    <StyledCardHeader {...rest}>
      <HeaderContent>
        {title && <CardTitle>{title}</CardTitle>}
        {subtitle && <CardSubtitle>{subtitle}</CardSubtitle>}
      </HeaderContent>
      {action && <CardAction>{action}</CardAction>}
    </StyledCardHeader>
  );
};

// Card Content component
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const StyledCardContent = styled.div`
  flex: 1;
`;

export const CardContent: React.FC<CardContentProps> = ({ children, ...rest }) => {
  return <StyledCardContent {...rest}>{children}</StyledCardContent>;
};

// Card Footer component
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right' | 'space-between';
}

const StyledCardFooter = styled.div<Pick<CardFooterProps, 'align'>>`
  display: flex;
  align-items: center;
  margin-top: ${theme.spacing[4]};
  justify-content: ${props => {
    if (props.align === 'left') return 'flex-start';
    if (props.align === 'center') return 'center';
    if (props.align === 'right') return 'flex-end';
    return 'space-between';
  }};
  gap: ${theme.spacing[2]};
`;

export const CardFooter: React.FC<CardFooterProps> = ({ 
  children, 
  align = 'space-between',
  ...rest 
}) => {
  return (
    <StyledCardFooter align={align} {...rest}>
      {children}
    </StyledCardFooter>
  );
};

// Card Divider component
const StyledCardDivider = styled.hr`
  border: 0;
  height: 1px;
  background-color: ${theme.colors.gray[200]};
  margin: ${theme.spacing[4]} 0;
`;

export const CardDivider: React.FC = () => {
  return <StyledCardDivider />;
};

export default Card;