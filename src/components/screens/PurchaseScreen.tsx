import React, { useEffect } from 'react';
import styled from 'styled-components';
import { FaCoins, FaExternalLinkAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

// Define interfaces for props
interface PurchaseScreenProps {
  onBack: () => void;
}

// Styled components
const Container = styled.div`
  width: 100%;
  max-width: 480px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Header = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-family: 'Manrope', sans-serif;
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(90deg, white, #A4F0EF);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 0.5px;
`;

const BackButton = styled.button`
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 16px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const Card = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(124, 58, 237, 0.3);
  padding: 24px;
  width: 100%;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const IconContainer = styled.div`
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Description = styled.p`
  font-size: 16px;
  line-height: 1.5;
  color: #ffffff;
  text-align: center;
  margin-bottom: 24px;
`;

const Button = styled.button`
  background: linear-gradient(135deg, #7C3AED, #4C1D95);
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  color: white;
  font-weight: 600;
  font-size: 16px;
  width: 100%;
  cursor: pointer;
  margin-bottom: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  box-shadow: 0 0 15px rgba(124, 58, 237, 0.4);
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 20px rgba(124, 58, 237, 0.6);
  }
`;

const SecondaryButton = styled.button`
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 12px 24px;
  color: white;
  font-size: 16px;
  width: 100%;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const PurchaseScreen: React.FC<PurchaseScreenProps> = ({ onBack }) => {
  const goToFaucet = () => {
    // Open Stellar Testnet Faucet in a new tab
    window.open('https://laboratory.stellar.org/#account-creator?network=test', '_blank');
  };
  
  const handleFaucetClick = () => {
    console.log('Redirecting to Stellar Testnet Faucet');
    goToFaucet();
  };

  return (
    <Container>
      <Header>
        <BackButton onClick={onBack}>← Back</BackButton>
        <Title>Purchase XLM</Title>
        <div style={{ width: '50px' }}></div> {/* Spacer for alignment */}
      </Header>

      <Card
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <IconContainer>
          <FaCoins size={48} color="#2DD6D2" style={{ 
            filter: 'drop-shadow(0 0 10px rgba(45, 214, 210, 0.8))'
          }} />
        </IconContainer>

        <Description>
          For this demo application, you can get free XLM tokens from the Stellar Testnet Faucet. 
          These tokens have no real value but allow you to test the features of BridgeBotPay.
        </Description>

        <Button onClick={handleFaucetClick}>
          Get Free Testnet XLM <FaExternalLinkAlt size={14} />
        </Button>
        
        <SecondaryButton onClick={onBack}>
          Back to Home
        </SecondaryButton>
      </Card>
    </Container>
  );
};

export default PurchaseScreen;