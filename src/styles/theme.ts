import { createGlobalStyle } from 'styled-components';

// Modern color palette with premium feel
export const lightTheme = {
  colors: {
    // Primary color (deep purple)
    primary: {
      50: '#F5F3FF',
      100: '#EDE9FE',
      200: '#DDD6FE',
      300: '#C4B5FD',
      400: '#A78BFA', 
      500: '#8B5CF6', // Main primary color
      600: '#7C3AED',
      700: '#6D28D9',
      800: '#5B21B6',
      900: '#4C1D95',
    },
    // Secondary color (teal blue for accents)
    secondary: {
      50: '#EFFCFB',
      100: '#D0F8F7',
      200: '#A4F0EF',
      300: '#6FE3E1',
      400: '#2DD6D2', // Main secondary color
      500: '#14B8B2',
      600: '#0D9994',
      700: '#0C7976',
      800: '#0A5C5A',
      900: '#084340',
    },
    // Neutral gray tones for text and backgrounds
    gray: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#E5E5E5',
      300: '#D4D4D4',
      400: '#A3A3A3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },
    // Additional accent colors
    status: {
      success: '#10B981', // Green
      warning: '#F59E0B', // Amber
      error: '#EF4444',   // Red
      info: '#3B82F6',    // Blue
    },
    white: '#FFFFFF',
    black: '#000000',
    background: {
      primary: '#FFFFFF',
      secondary: '#FAFAFA',
      dark: '#121212',
    }
  },
  
  // Typography with modern sans-serif fonts
  typography: {
    fontFamily: {
      primary: "'Outfit', sans-serif", // Modern, clean font for headlines
      secondary: "'Inter', sans-serif", // Highly readable font for body text
    },
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    fontSize: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      md: '1.125rem',    // 18px
      lg: '1.25rem',     // 20px
      xl: '1.5rem',      // 24px
      '2xl': '1.875rem', // 30px
      '3xl': '2.25rem',  // 36px
      '4xl': '3rem',     // 48px
      '5xl': '4rem',     // 64px
    },
    lineHeight: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },
  
  // Border radius for a modern, slightly rounded look
  borderRadius: {
    none: '0',
    sm: '0.25rem',     // 4px
    md: '0.5rem',      // 8px
    lg: '0.75rem',     // 12px
    xl: '1rem',        // 16px
    '2xl': '1.5rem',   // 24px
    '3xl': '2rem',     // 32px
    full: '9999px',    // Fully rounded (for circles/pills)
  },
  
  // Shadows for depth and elevation
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },
  
  // Spacing system for consistent layout
  spacing: {
    0: '0',
    1: '0.25rem',      // 4px
    2: '0.5rem',       // 8px
    3: '0.75rem',      // 12px
    4: '1rem',         // 16px
    5: '1.25rem',      // 20px
    6: '1.5rem',       // 24px
    8: '2rem',         // 32px
    10: '2.5rem',      // 40px
    12: '3rem',        // 48px
    16: '4rem',        // 64px
    20: '5rem',        // 80px
    24: '6rem',        // 96px
    32: '8rem',        // 128px
    40: '10rem',       // 160px
    48: '12rem',       // 192px
    56: '14rem',       // 224px
    64: '16rem',       // 256px
  },
  
  // Animation timings
  animation: {
    durations: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      slower: '700ms',
    },
    easings: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },
  },

  // Z-index scale
  zIndex: {
    0: '0',
    10: '10',
    20: '20',
    30: '30',
    40: '40',
    50: '50',
    auto: 'auto',
  },

  // Media breakpoints
  breakpoints: {
    xs: '480px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

// Global styles
export const GlobalStyles = createGlobalStyle`
  /* Import fonts */
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700&display=swap');
  
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  html {
    font-size: 16px;
  }
  
  body {
    font-family: ${props => theme.typography.fontFamily.secondary};
    color: ${props => theme.colors.gray[800]};
    background-color: ${props => theme.colors.background.primary};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    line-height: 1.5;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-family: ${props => theme.typography.fontFamily.primary};
    font-weight: ${props => theme.typography.fontWeight.semibold};
    margin-bottom: ${props => theme.spacing[4]};
    line-height: 1.2;
  }
  
  h1 {
    font-size: ${props => theme.typography.fontSize['3xl']};
  }
  
  h2 {
    font-size: ${props => theme.typography.fontSize['2xl']};
  }
  
  h3 {
    font-size: ${props => theme.typography.fontSize.xl};
  }
  
  h4 {
    font-size: ${props => theme.typography.fontSize.lg};
  }
  
  h5, h6 {
    font-size: ${props => theme.typography.fontSize.md};
  }
  
  p {
    margin-bottom: ${props => theme.spacing[4]};
  }
  
  a {
    color: ${props => theme.colors.primary[600]};
    text-decoration: none;
    transition: color ${props => theme.animation.durations.fast} ${props => theme.animation.easings.easeOut};
    
    &:hover {
      color: ${props => theme.colors.primary[700]};
    }
  }
  
  button {
    font-family: ${props => theme.typography.fontFamily.secondary};
  }
  
  /* For devices with reduced motion preferences */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
`;

// Dark theme with space theming
export const darkTheme = {
  colors: {
    // Primary color (deep purple with more saturation)
    primary: {
      50: '#F5F3FF',
      100: '#EDE9FE',
      200: '#DDD6FE',
      300: '#C4B5FD',
      400: '#A78BFA', 
      500: '#8B5CF6', // Main primary color
      600: '#7C3AED',
      700: '#6D28D9',
      800: '#5B21B6',
      900: '#4C1D95',
    },
    // Secondary color (teal blue for accents)
    secondary: {
      50: '#EFFCFB',
      100: '#D0F8F7',
      200: '#A4F0EF',
      300: '#6FE3E1',
      400: '#2DD6D2', // Main secondary color
      500: '#14B8B2',
      600: '#0D9994',
      700: '#0C7976',
      800: '#0A5C5A',
      900: '#084340',
    },
    // Darker gray tones for text and backgrounds
    gray: {
      50: '#1A1D35',
      100: '#16192F',
      200: '#13162A',
      300: '#101425',
      400: '#0D1033',
      500: '#0A0D28',
      600: '#080B24',
      700: '#05081F',
      800: '#03051A',
      900: '#010314',
    },
    // Additional accent colors
    status: {
      success: '#10B981', // Green
      warning: '#F59E0B', // Amber
      error: '#EF4444',   // Red
      info: '#3B82F6',    // Blue
    },
    white: '#FFFFFF',
    black: '#000000',
    background: {
      primary: '#0D1033',
      secondary: '#101425',
      dark: '#03051A',
    }
  },
  
  // Typography (same as light theme)
  typography: lightTheme.typography,
  
  // Border radius (same as light theme)
  borderRadius: lightTheme.borderRadius,
  
  // Shadows with more intensity for dark theme
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.2)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.15)',
    glow: '0 0 15px rgba(124, 58, 237, 0.4)',
    'teal-glow': '0 0 15px rgba(45, 214, 210, 0.4)',
  },
  
  // Other properties (same as light theme)
  spacing: lightTheme.spacing,
  animation: lightTheme.animation,
  zIndex: lightTheme.zIndex,
  breakpoints: lightTheme.breakpoints,
};

// Default theme is light
export const theme = lightTheme;

export default lightTheme;