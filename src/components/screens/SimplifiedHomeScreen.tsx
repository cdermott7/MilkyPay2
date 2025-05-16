import React from 'react';
import styled from 'styled-components';
import { FaRocket, FaArrowUp, FaExchangeAlt, FaCoins, FaHistory, FaUserAstronaut, FaCog } from 'react-icons/fa';
import { FiSun, FiMoon } from 'react-icons/fi';
import ChatWidget from '../ChatWidget';

// Simple styled components (with fewer theme properties that could cause errors)
const Container = styled.div`
  padding: 20px;
  width: 100%;
  max-width: 480px;
  height: 100%;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  color: #333;

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const Header = styled.div`
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const GreetingContainer = styled.div``;

const Greeting = styled.h2`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 5px;
`;

const SubGreeting = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0;
`;

const ThemeToggle = styled.button`
  width: 40px;
  height: 40px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #F59E0B;
  
  &:hover {
    background: #f9f9f9;
  }
`;

const BalanceCard = styled.div`
  background: #7C3AED;
  border-radius: 16px;
  padding: 25px;
  color: white;
  margin-bottom: 25px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: relative;
`;

const BalanceLabel = styled.div`
  font-size: 14px;
  opacity: 0.8;
`;

const BalanceAmount = styled.div`
  font-size: 42px;
  font-weight: 700;
  margin-bottom: 5px;
  display: flex;
  align-items: baseline;
`;

const CurrencySymbol = styled.span`
  font-size: 24px;
  margin-right: 5px;
`;

const XLMLabel = styled.span`
  font-size: 18px;
  opacity: 0.8;
  margin-left: 10px;
`;

const USDValue = styled.div`
  font-size: 14px;
  opacity: 0.7;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 500;
  color: #333;
  margin-bottom: 15px;
  margin-top: 20px;
`;

const ActionButtonsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
  
  @media (max-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
`;

const ActionButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: white;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 15px 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const IconWrapper = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  color: #7C3AED;
`;

const ActionLabel = styled.span`
  font-weight: 500;
  color: #333;
  font-size: 14px;
`;

const ChatSection = styled.div`
  margin-top: 10px;
  margin-bottom: 20px;
  width: 100%;
`;

const Divider = styled.div`
  height: 1px;
  background: #eee;
  margin: 10px 0;
  width: 100%;
`;

const QuickActionsContainer = styled.div`
  margin-top: auto;
  margin-bottom: 20px;
`;

const QuickActionButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const QuickActionButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: transparent;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 12px;
  flex: 1;
  cursor: pointer;
  
  &:hover {
    background: #f9f9f9;
  }
`;

const QuickActionIcon = styled.div`
  color: #7C3AED;
  font-size: 20px;
  margin-bottom: 8px;
`;

const QuickActionLabel = styled.span`
  font-size: 12px;
  color: #666;
`;

interface SimplifiedHomeScreenProps {
  balance: string;
  username?: string;
  walletAddress?: string;
  onNavigate: (screen: string) => void;
  onSendMoney?: (amount: string, recipient: string) => Promise<void>;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

const SimplifiedHomeScreen: React.FC<SimplifiedHomeScreenProps> = ({
  balance,
  username = 'there',
  walletAddress = '',
  onNavigate,
  onSendMoney,
  isDarkMode = false,
  onToggleTheme = () => {}
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
        <ThemeToggle onClick={onToggleTheme}>
          {isDarkMode ? <FiMoon size={20} /> : <FiSun size={20} />}
        </ThemeToggle>
      </Header>
      
      <BalanceCard>
        <BalanceLabel>Current Balance</BalanceLabel>
        <BalanceAmount>
          <CurrencySymbol>$</CurrencySymbol>
          {usdValue}
          <XLMLabel>{numericBalance.toFixed(2)} XLM</XLMLabel>
        </BalanceAmount>
        <USDValue>Stellar Network · Self-Custodial</USDValue>
      </BalanceCard>
      
      <SectionTitle>Actions</SectionTitle>
      <ActionButtonsContainer>
        <ActionButton onClick={() => onNavigate('deposit')}>
          <IconWrapper>
            <FaRocket size={20} />
          </IconWrapper>
          <ActionLabel>Deposit</ActionLabel>
        </ActionButton>
        
        <ActionButton onClick={() => onNavigate('withdraw')}>
          <IconWrapper>
            <FaArrowUp size={20} />
          </IconWrapper>
          <ActionLabel>Withdraw</ActionLabel>
        </ActionButton>
        
        <ActionButton onClick={() => onNavigate('transfer')}>
          <IconWrapper>
            <FaExchangeAlt size={20} />
          </IconWrapper>
          <ActionLabel>Transfer</ActionLabel>
        </ActionButton>
        
        <ActionButton onClick={() => onNavigate('purchase')}>
          <IconWrapper>
            <FaCoins size={20} />
          </IconWrapper>
          <ActionLabel>Purchase</ActionLabel>
        </ActionButton>
      </ActionButtonsContainer>
      
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
        <SectionTitle>Quick Access</SectionTitle>
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

export default SimplifiedHomeScreen;