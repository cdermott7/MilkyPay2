import React, { useState } from 'react';
import styled from 'styled-components';
import { FiArrowLeft, FiBell, FiMoon, FiSun, FiLock, FiHelpCircle, FiLogOut } from 'react-icons/fi';
import SimpleThemeToggle from '../ui/SimpleThemeToggle';

interface SettingsScreenProps {
  onBack: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

const Container = styled.div`
  padding: 20px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const BackButton = styled.button`
  background: transparent;
  border: none;
  color: #7C3AED;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  margin-right: 10px;
  
  &:hover {
    background: #f5f5f5;
  }
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 500;
  color: #666;
  margin: 20px 0 10px;
`;

const SettingsList = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 10px;
`;

const SettingItem = styled.div`
  display: flex;
  padding: 15px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  align-items: center;
  cursor: pointer;
  border: 1px solid #f0f0f0;
  
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const IconContainer = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  color: #666;
`;

const SettingDetails = styled.div`
  flex: 1;
`;

const SettingTitle = styled.div`
  font-weight: 500;
  color: #333;
`;

const SettingDescription = styled.div`
  font-size: 14px;
  color: #888;
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
    background-color: #7C3AED;
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
  background-color: #ccc;
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
  padding: 15px;
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    background: rgba(239, 68, 68, 0.2);
  }
`;

const SimplifiedSettingsScreen: React.FC<SettingsScreenProps> = ({ 
  onBack,
  isDarkMode = false,
  onToggleTheme = () => {} 
}) => {
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
          <SettingItem key={index}>
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
            {setting.theme && (
              <SimpleThemeToggle isDarkMode={isDarkMode} onToggle={onToggleTheme} />
            )}
          </SettingItem>
        ))}
      </SettingsList>
      
      <SectionTitle>Security</SectionTitle>
      <SettingsList>
        {securitySettings.map((setting, index) => (
          <SettingItem key={index}>
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
      
      <SettingItem style={{ marginTop: '16px' }}>
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

export default SimplifiedSettingsScreen;