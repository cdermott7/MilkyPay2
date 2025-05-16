import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../../contexts/ThemeContext';

const ToggleButton = styled(motion.button)`
  width: 50px;
  height: 26px;
  background: ${props => props.theme.colors.primary[600]};
  border: none;
  border-radius: 15px;
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0 4px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const ToggleThumb = styled(motion.div)`
  width: 20px;
  height: 20px;
  background: #fff;
  border-radius: 50%;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
`;

const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <ToggleButton 
      onClick={toggleTheme} 
      initial={false} 
      animate={{ background: isDarkMode ? '#7C3AED' : '#7C3AED' }}
    >
      <ToggleThumb
        animate={{ 
          x: isDarkMode ? 26 : 4,
          background: isDarkMode ? '#0D1033' : '#fff'
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        {isDarkMode ? (
          <FiMoon size={12} color="#A78BFA" />
        ) : (
          <FiSun size={12} color="#F59E0B" />
        )}
      </ToggleThumb>
    </ToggleButton>
  );
};

export default ThemeToggle;