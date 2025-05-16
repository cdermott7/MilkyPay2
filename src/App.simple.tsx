import React from 'react';
import styled from 'styled-components';

const AppContainer = styled.div`
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #0D1033 0%, #1E1B4B 100%);
  color: white;
`;

const Card = styled.div`
  padding: 2rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(124, 58, 237, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
  width: 90%;
  max-width: 500px;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  background: linear-gradient(90deg, #FFFFFF, #A4F0EF);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Subtitle = styled.h2`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.8);
`;

const Button = styled.button`
  background: linear-gradient(135deg, #7C3AED, #6D28D9);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 50px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0.5rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 15px rgba(124, 58, 237, 0.5);
  }
`;

const SimpleApp: React.FC = () => {
  return (
    <AppContainer>
      <Card>
        <Title>MilkyPay</Title>
        <Subtitle>Voice-enabled cross-border payments</Subtitle>
        
        <p>
          Send money internationally with just a few words. 
          Try saying "Send $20 to +1-905-805-2755" or check your balance.
        </p>
        
        <div style={{ marginTop: '2rem' }}>
          <Button>Send Money</Button>
          <Button>Check Balance</Button>
        </div>
      </Card>
    </AppContainer>
  );
};

export default SimpleApp;