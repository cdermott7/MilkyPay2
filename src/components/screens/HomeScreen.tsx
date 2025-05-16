import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import theme, { darkTheme } from '../../styles/theme';
import Card from '../ui/Card';
import { FiArrowUp, FiArrowDown, FiRefreshCw, FiSettings, FiUser, FiClock, FiDollarSign } from 'react-icons/fi';
import { FaRocket, FaSatellite, FaSpaceShuttle, FaGlobe, FaCoins, FaExchangeAlt, FaWallet, FaHistory, FaUserAstronaut, FaCog } from 'react-icons/fa';
import SimpleThemeToggle from '../ui/SimpleThemeToggle';
import ChatWidget from '../ChatWidget';

interface HomeScreenProps {
  balance: string;
  username?: string;
  onNavigate: (screen: string) => void;
  onSendMoney?: (amount: string, recipient: string) => Promise<void>;
  walletAddress?: string;
}

// Styled components for the home screen
const Container = styled.div`
  padding: ${props => props.theme.spacing[4]};
  width: 100%;
  max-width: 480px;
  height: 100%;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[2]};
  }
`;

const Header = styled.div`
  margin-bottom: ${props => props.theme.spacing[4]};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const GreetingContainer = styled.div``;

const Greeting = styled.h2`
  font-family: ${props => props.theme.typography.fontFamily.primary};
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.gray[900]};
  margin-bottom: ${props => props.theme.spacing[1]};
`;

const SubGreeting = styled.p`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.gray[600]};
  margin: 0;
`;

const BalanceCard = styled(motion.div)`
  background: ${props => props.theme.colors.primary[600]};
  border-radius: ${props => props.theme.borderRadius.xl};
  padding: ${props => props.theme.spacing[5]};
  color: white;
  margin-bottom: ${props => props.theme.spacing[5]};
  box-shadow: ${props => props.theme.shadows.lg};
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  /* Less busy styling in light mode, space theme in dark mode */
  ${props => props.theme.colors.background.primary === darkTheme.colors.background.primary && `
    background: linear-gradient(135deg, #0D1033, #1E1B4B);
    border: 1px solid rgba(124, 58, 237, 0.3);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4), 0 0 15px rgba(124, 58, 237, 0.3);
    
    &:before {
      content: "";
      position: absolute;
      width: 210%;
      height: 210%;
      top: -55%;
      left: -5%;
      background: radial-gradient(ellipse at center, rgba(124, 58, 237, 0.2) 0%, rgba(20, 184, 178, 0.1) 40%, rgba(255,255,255,0) 70%);
      transform: rotate(12deg);
    }
    
    &:after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=1000');
      background-size: cover;
      background-position: center;
      opacity: 0.1;
      mix-blend-mode: overlay;
      pointer-events: none;
    }
  `}
`;

const BalanceLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  opacity: 0.8;
  margin-bottom: ${theme.spacing[2]};
`;

const BalanceAmount = styled.div`
  font-family: ${theme.typography.fontFamily.primary};
  font-size: 42px;
  font-weight: ${theme.typography.fontWeight.bold};
  margin-bottom: ${theme.spacing[1]};
  display: flex;
  align-items: baseline;
`;

const CurrencySymbol = styled.span`
  font-size: 24px;
  margin-right: ${theme.spacing[1]};
`;

const XLMLabel = styled.span`
  font-size: 18px;
  opacity: 0.8;
  margin-left: ${theme.spacing[2]};
`;

const USDValue = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  opacity: 0.7;
`;

const ActionButtonsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${props => props.theme.spacing[3]};
  margin-bottom: ${props => props.theme.spacing[4]};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    grid-template-columns: repeat(2, 1fr);
    gap: ${props => props.theme.spacing[2]};
  }
`;

const ActionButton = styled(motion.button)`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: ${props => props.theme.colors.white};
  border: 1px solid ${props => props.theme.colors.gray[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[2]};
  box-shadow: ${props => props.theme.shadows.sm};
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
  position: relative;
  
  /* Dark space theme styling conditionally applied */
  ${props => props.theme.colors.background.primary === darkTheme.colors.background.primary && `
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(124, 58, 237, 0.3);
    color: white;
    backdrop-filter: blur(10px);
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(20, 184, 178, 0.05));
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    &:hover::before {
      opacity: 1;
    }
  `}
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: ${props => props.theme.shadows.md};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ActionIconWrapper = styled.div<{ bgColor: string }>`
  width: 50px;
  height: 50px;
  border-radius: ${props => props.theme.borderRadius.full};
  background-color: ${props => props.bgColor};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${props => props.theme.spacing[2]};
  color: white;
  font-size: 20px;
  
  /* Apply more elaborate styling in dark mode */
  ${props => props.theme.colors.background.primary === darkTheme.colors.background.primary && `
    background: linear-gradient(135deg, ${props.bgColor}, ${props.bgColor}88);
    box-shadow: 0 0 10px ${props.bgColor}66;
    
    &::after {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      border-radius: 9999px; /* Using full rounded corners */
      background: linear-gradient(45deg, ${props.bgColor}, transparent, ${props.bgColor});
      background-size: 400%;
      opacity: 0.5;
      z-index: -1;
      animation: rotate 3s linear infinite;
    }
  `}
`;

const ActionLabel = styled.span`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.gray[800]};
  font-size: 14px;
  
  /* White text in dark mode */
  ${props => props.theme.colors.background.primary === darkTheme.colors.background.primary && `
    color: white;
  `}
`;

const QuickActionsContainer = styled.div`
  margin-top: auto;
  margin-bottom: ${theme.spacing[4]};
`;

const QuickActionsTitle = styled.h3`
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.medium};
  color: white;
  margin-bottom: ${theme.spacing[3]};
  letter-spacing: 0.5px;
`;

const QuickActionButtons = styled.div`
  display: flex;
  gap: ${theme.spacing[3]};
`;

const QuickActionButton = styled(motion.button)`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(124, 58, 237, 0.2);
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[3]};
  flex: 1;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(124, 58, 237, 0.1);
    border-color: rgba(124, 58, 237, 0.4);
    box-shadow: 0 0 15px rgba(124, 58, 237, 0.2);
    transform: translateY(-2px);
  }
`;

const QuickActionIcon = styled.div`
  color: ${theme.colors.secondary[400]};
  font-size: 20px;
  margin-bottom: ${theme.spacing[2]};
  filter: drop-shadow(0 0 5px ${theme.colors.secondary[400]}80);
`;

const QuickActionLabel = styled.span`
  font-size: ${theme.typography.fontSize.xs};
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 0.5px;
`;

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20
    }
  }
};

// Sections for organizing the homescreen layout
const SectionTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.gray[700]};
  margin-bottom: ${props => props.theme.spacing[3]};
  margin-top: ${props => props.theme.spacing[4]};
`;

const ChatSection = styled.div`
  margin-top: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[4]};
  width: 100%;
`;

const Divider = styled.div`
  height: 1px;
  background: ${props => props.theme.colors.gray[200]};
  margin: ${props => props.theme.spacing[2]} 0;
  width: 100%;
  opacity: 0.5;
`;

// Main component
const HomeScreen: React.FC<HomeScreenProps> = ({ 
  balance, 
  username = 'there', 
  onNavigate, 
  onSendMoney,
  walletAddress = ''  
}) => {
  // Convert balance for display
  const numericBalance = parseFloat(balance) || 0;
  const usdValue = (numericBalance * 0.15).toFixed(2); // Assuming 1 XLM = $0.15 USD
  
  return (
    <Container>
      <Header>
        <GreetingContainer>
          <Greeting>Hello, {username}</Greeting>
          <SubGreeting>Welcome back to MilkyPay</SubGreeting>
        </GreetingContainer>
        <SimpleThemeToggle isDarkMode={false} onToggle={() => {}} />
      </Header>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <BalanceCard 
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <BalanceLabel>Current Balance</BalanceLabel>
            <BalanceAmount>
              <CurrencySymbol>$</CurrencySymbol>
              {usdValue}
              <XLMLabel>{numericBalance.toFixed(2)} XLM</XLMLabel>
            </BalanceAmount>
            <USDValue>Stellar Network · Self-Custodial</USDValue>
          </BalanceCard>
        </motion.div>
        
        <SectionTitle>Actions</SectionTitle>
        <ActionButtonsContainer>
          <motion.div variants={itemVariants}>
            <ActionButton onClick={() => onNavigate('deposit')}>
              <ActionIconWrapper bgColor={theme.colors.status.success}>
                <FaWallet size={20} />
              </ActionIconWrapper>
              <ActionLabel>Deposit</ActionLabel>
            </ActionButton>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <ActionButton onClick={() => onNavigate('withdraw')}>
              <ActionIconWrapper bgColor={theme.colors.status.warning}>
                <FiArrowUp size={20} />
              </ActionIconWrapper>
              <ActionLabel>Withdraw</ActionLabel>
            </ActionButton>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <ActionButton onClick={() => onNavigate('transfer')}>
              <ActionIconWrapper bgColor={theme.colors.primary[600]}>
                <FaExchangeAlt size={20} />
              </ActionIconWrapper>
              <ActionLabel>Transfer</ActionLabel>
            </ActionButton>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <ActionButton onClick={() => onNavigate('purchase')}>
              <ActionIconWrapper bgColor={theme.colors.secondary[500]}>
                <FaCoins size={20} />
              </ActionIconWrapper>
              <ActionLabel>Purchase</ActionLabel>
            </ActionButton>
          </motion.div>
        </ActionButtonsContainer>
      </motion.div>
      
      <SectionTitle>AI Assistant</SectionTitle>
      <ChatSection>
        <ChatWidget
          walletBalance={balance}
          walletAddress={walletAddress}
          onSendMoney={onSendMoney}
          fallbackVoiceInput={input => {
            return new Promise(resolve => {
              const message = prompt('Speech recognition unavailable. What would you like to say?') || '';
              resolve(message);
            });
          }}
        />
      </ChatSection>
      
      <Divider />
      
      <QuickActionsContainer>
        <QuickActionsTitle>Quick Access</QuickActionsTitle>
        <QuickActionButtons>
          <QuickActionButton onClick={() => onNavigate('history')}>
            <QuickActionIcon>
              <FaHistory />
            </QuickActionIcon>
            <QuickActionLabel>History</QuickActionLabel>
          </QuickActionButton>
          
          <QuickActionButton onClick={() => onNavigate('profile')}>
            <QuickActionIcon>
              <FaUserAstronaut />
            </QuickActionIcon>
            <QuickActionLabel>Profile</QuickActionLabel>
          </QuickActionButton>
          
          <QuickActionButton onClick={() => onNavigate('settings')}>
            <QuickActionIcon>
              <FaCog />
            </QuickActionIcon>
            <QuickActionLabel>Settings</QuickActionLabel>
          </QuickActionButton>
        </QuickActionButtons>
      </QuickActionsContainer>
    </Container>
  );
};

export default HomeScreen;