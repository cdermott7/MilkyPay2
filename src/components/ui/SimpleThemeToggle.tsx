import React from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';

interface ThemeToggleProps {
  isDarkMode: boolean;
  onToggle: () => void;
}

const SimpleThemeToggle: React.FC<ThemeToggleProps> = ({ isDarkMode, onToggle }) => {
  return (
    <button 
      onClick={onToggle} 
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: 'none',
        background: isDarkMode ? '#7C3AED' : '#FFF',
        color: isDarkMode ? '#FFF' : '#F59E0B',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {isDarkMode ? <FiMoon size={20} /> : <FiSun size={20} />}
    </button>
  );
};

export default SimpleThemeToggle;