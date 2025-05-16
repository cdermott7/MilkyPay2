import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiBell, FiGlobe, FiMoon, FiSun, FiLock, FiHelpCircle, FiLogOut } from 'react-icons/fi';
import SimpleThemeToggle from '../ui/SimpleThemeToggle';
import { useTheme } from '../../contexts/ThemeContext';

interface SettingsScreenProps {
  onBack: () => void;
}

const Container = styled.div`
  padding: ${props => props.theme.spacing[4]};
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: ${props => props.theme.colors.background.primary};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const BackButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.primary[500]};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: ${props => props.theme.borderRadius.full};
  cursor: pointer;
  margin-right: ${props => props.theme.spacing[2]};
  
  &:hover {
    background: ${props => props.theme.colors.gray[100]};
  }
`;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.gray[900]};
  margin: 0;
`;

const SectionTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.gray[700]};
  margin: ${props => props.theme.spacing[4]} 0 ${props => props.theme.spacing[2]};
`;

const SettingsList = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: ${props => props.theme.spacing[2]};
`;

const SettingItem = styled(motion.div)`
  display: flex;
  padding: ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  align-items: center;
  cursor: pointer;
  
  &:hover {
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const IconContainer = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: ${props => props.theme.colors.gray[100]};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: ${props => props.theme.spacing[3]};
  color: ${props => props.theme.colors.gray[700]};
`;

const SettingDetails = styled.div`
  flex: 1;
`;

const SettingTitle = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.gray[900]};
`;

const SettingDescription = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.gray[500]};
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
  
  &:checked + span {
    background-color: ${props => props.theme.colors.primary[500]};
  }
  
  &:checked + span:before {
    transform: translateX(24px);
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => props.theme.colors.gray[300]};
  transition: 0.4s;
  border-radius: 12px;
  
  &:before {
    position: absolute;
    content: "";
    height: 20px;
    width: 20px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }
`;

const LogoutButton = styled.button`
  margin-top: auto;
  padding: ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.status.error}10;
  color: ${props => props.theme.colors.status.error};
  border: 1px solid ${props => props.theme.colors.status.error}30;
  border-radius: ${props => props.theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing[2]};
  cursor: pointer;
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  
  &:hover {
    background: ${props => props.theme.colors.status.error}20;
  }
`;

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [biometrics, setBiometrics] = useState(false);
  
  // Mock settings sections
  const generalSettings = [
    {
      icon: <FiBell size={20} />,
      title: 'Notifications',
      description: 'Receive payment and transaction alerts',
      toggle: true,
      isEnabled: notifications,
      onChange: () => setNotifications(!notifications)
    },
    {
      icon: isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />,
      title: 'Dark Mode',
      description: 'Toggle between light and dark theme',
      theme: true
    }
  ];
  
  const securitySettings = [
    {
      icon: <FiLock size={20} />,
      title: 'Biometric Authentication',
      description: 'Use fingerprint to unlock the app',
      toggle: true,
      isEnabled: biometrics,
      onChange: () => setBiometrics(!biometrics)
    }
  ];
  
  return (
    <Container>
      <Header>
        <BackButton onClick={onBack}>
          <FiArrowLeft size={20} />
        </BackButton>
        <Title>Settings</Title>
      </Header>
      
      <SectionTitle>General</SectionTitle>
      <SettingsList>
        {generalSettings.map((setting, index) => (
          <SettingItem 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <IconContainer>
              {setting.icon}
            </IconContainer>
            <SettingDetails>
              <SettingTitle>{setting.title}</SettingTitle>
              <SettingDescription>{setting.description}</SettingDescription>
            </SettingDetails>
            {setting.toggle && (
              <ToggleSwitch>
                <ToggleInput 
                  type="checkbox" 
                  checked={setting.isEnabled} 
                  onChange={setting.onChange} 
                />
                <ToggleSlider />
              </ToggleSwitch>
            )}
            {setting.theme && <SimpleThemeToggle isDarkMode={isDarkMode} onToggle={toggleTheme} />}
          </SettingItem>
        ))}
      </SettingsList>
      
      <SectionTitle>Security</SectionTitle>
      <SettingsList>
        {securitySettings.map((setting, index) => (
          <SettingItem 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <IconContainer>
              {setting.icon}
            </IconContainer>
            <SettingDetails>
              <SettingTitle>{setting.title}</SettingTitle>
              <SettingDescription>{setting.description}</SettingDescription>
            </SettingDetails>
            <ToggleSwitch>
              <ToggleInput 
                type="checkbox" 
                checked={setting.isEnabled} 
                onChange={setting.onChange} 
              />
              <ToggleSlider />
            </ToggleSwitch>
          </SettingItem>
        ))}
      </SettingsList>
      
      <SettingItem 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{ marginTop: '16px' }}
      >
        <IconContainer>
          <FiHelpCircle size={20} />
        </IconContainer>
        <SettingDetails>
          <SettingTitle>Help & Support</SettingTitle>
          <SettingDescription>Get answers to your questions</SettingDescription>
        </SettingDetails>
      </SettingItem>
      
      <LogoutButton onClick={() => alert('Logout function would go here')}>
        <FiLogOut size={20} />
        Logout
      </LogoutButton>
    </Container>
  );
};

export default SettingsScreen;