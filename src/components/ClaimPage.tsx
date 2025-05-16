import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiLock, FiCheck, FiX, FiDownload, FiAlertCircle } from 'react-icons/fi';
import theme from '../styles/theme';
import { useWallet } from '../hooks/useWallet';

interface ClaimPageProps {
  claimId: string;
  onComplete: () => void;
}

const Container = styled.div`
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  padding: ${theme.spacing[4]};
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0D1033, #1E1B4B);
`;

const Card = styled(motion.div)`
  background-color: white;
  border-radius: ${theme.borderRadius.xl};
  box-shadow: ${theme.shadows.xl};
  padding: ${theme.spacing[6]};
  width: 100%;
  overflow: hidden;
`;

const Logo = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${theme.colors.primary[600]}, ${theme.colors.primary[800]});
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${theme.spacing[6]};
  color: white;
  font-size: 24px;
`;

const Title = styled.h1`
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.gray[900]};
  text-align: center;
  margin-bottom: ${theme.spacing[2]};
`;

const Subtitle = styled.p`
  font-size: ${theme.typography.fontSize.md};
  color: ${theme.colors.gray[600]};
  text-align: center;
  margin-bottom: ${theme.spacing[5]};
`;

const FormGroup = styled.div`
  margin-bottom: ${theme.spacing[4]};
`;

const Label = styled.label`
  display: block;
  font-weight: ${theme.typography.fontWeight.medium};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray[800]};
  margin-bottom: ${theme.spacing[2]};
`;

const Input = styled.input`
  width: 100%;
  padding: ${theme.spacing[3]};
  font-size: ${theme.typography.fontSize.md};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  background-color: white;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[400]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
`;

const PinContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${theme.spacing[2]};
  margin-bottom: ${theme.spacing[4]};
`;

const PinDigit = styled.div`
  width: 100%;
  height: 60px;
  border: 2px solid ${theme.colors.primary[400]};
  border-radius: ${theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: ${theme.typography.fontWeight.bold};
  background-color: ${theme.colors.primary[50]};
`;

const ClaimButton = styled(motion.button)`
  width: 100%;
  background: linear-gradient(135deg, ${theme.colors.primary[600]}, ${theme.colors.primary[800]});
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[4]};
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:disabled {
    background: ${theme.colors.gray[400]};
    cursor: not-allowed;
  }
  
  svg {
    margin-right: ${theme.spacing[2]};
  }
`;

const StatusContainer = styled(motion.div)`
  margin-top: ${theme.spacing[4]};
  padding: ${theme.spacing[4]};
  border-radius: ${theme.borderRadius.lg};
  width: 100%;
  text-align: center;
`;

const SuccessStatus = styled(StatusContainer)`
  background-color: ${theme.colors.status.success}10;
  color: ${theme.colors.status.success};
`;

const ErrorStatus = styled(StatusContainer)`
  background-color: ${theme.colors.status.error}10;
  color: ${theme.colors.status.error};
`;

const StatusMessage = styled.p`
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.medium};
`;

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  }
};

enum ClaimStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error'
}

const ClaimPage: React.FC<ClaimPageProps> = ({ claimId, onComplete }) => {
  const [pin, setPin] = useState('');
  const [status, setStatus] = useState<ClaimStatus>(ClaimStatus.IDLE);
  const [errorMessage, setErrorMessage] = useState('');
  const [claimedAmount, setClaimedAmount] = useState('');
  
  // Get the claimBalance function from the wallet hook
  const { claimBalance } = useWallet();
  
  // Format PIN input to show in the 4 boxes
  const pinDigits = pin.padEnd(4, ' ').split('');
  
  // Handle PIN input
  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and limit to 4 digits
    if (/^\d{0,4}$/.test(value)) {
      setPin(value);
    }
  };
  
  // Handle claim button click
  const handleClaim = async () => {
    if (pin.length !== 4 || !claimId) {
      return;
    }
    
    try {
      setStatus(ClaimStatus.LOADING);
      
      // Call the wallet's claim function
      const result = await claimBalance(claimId, pin);
      
      if (result.success) {
        setClaimedAmount(result.amount);
        setStatus(ClaimStatus.SUCCESS);
        
        // After a delay, navigate back to home
        setTimeout(() => {
          onComplete();
        }, 5000);
      } else {
        setErrorMessage(result.error || 'Failed to claim funds');
        setStatus(ClaimStatus.ERROR);
      }
    } catch (error) {
      console.error('Claim error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
      setStatus(ClaimStatus.ERROR);
    }
  };
  
  return (
    <Container>
      <Card 
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <Logo>
          <FiDownload size={32} />
        </Logo>
        
        <Title>Claim Your Funds</Title>
        <Subtitle>Enter the 4-digit PIN you received to claim your funds</Subtitle>
        
        {claimId ? (
          <>
            <FormGroup>
              <Label htmlFor="pin">Enter PIN</Label>
              <Input 
                id="pin"
                type="text"
                inputMode="numeric"
                maxLength={4}
                placeholder="Enter 4-digit PIN"
                value={pin}
                onChange={handlePinChange}
                disabled={status === ClaimStatus.LOADING || status === ClaimStatus.SUCCESS}
              />
            </FormGroup>
            
            <PinContainer>
              {pinDigits.map((digit, index) => (
                <PinDigit key={index}>
                  {digit !== ' ' ? digit : ''}
                </PinDigit>
              ))}
            </PinContainer>
            
            <ClaimButton 
              onClick={handleClaim}
              disabled={pin.length !== 4 || status === ClaimStatus.LOADING || status === ClaimStatus.SUCCESS}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              {status === ClaimStatus.LOADING ? (
                <>Loading...</>
              ) : (
                <>
                  <FiLock />
                  Claim Funds
                </>
              )}
            </ClaimButton>
          </>
        ) : (
          <ErrorStatus
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FiAlertCircle size={24} style={{ marginBottom: '8px' }} />
            <StatusMessage>
              Invalid claim link. Please check the URL and try again.
            </StatusMessage>
          </ErrorStatus>
        )}
        
        {status === ClaimStatus.SUCCESS && (
          <SuccessStatus
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FiCheck size={24} style={{ marginBottom: '8px' }} />
            <StatusMessage>
              Success! {claimedAmount} XLM has been added to your wallet.
            </StatusMessage>
          </SuccessStatus>
        )}
        
        {status === ClaimStatus.ERROR && (
          <ErrorStatus
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FiX size={24} style={{ marginBottom: '8px' }} />
            <StatusMessage>
              {errorMessage || 'Failed to claim funds. Please check your PIN and try again.'}
            </StatusMessage>
          </ErrorStatus>
        )}
      </Card>
    </Container>
  );
};

export default ClaimPage;