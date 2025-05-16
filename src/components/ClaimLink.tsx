import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FiCheckCircle, FiAlertCircle, FiLock, FiCopy, FiArrowRight, FiRefreshCw } from 'react-icons/fi';
import theme from '../styles/theme';
import Card, { CardHeader, CardContent, CardFooter } from './ui/Card';
import Button from './ui/Button';
import TextInput from './ui/TextInput';

// Types
interface ClaimLinkProps {
  linkId?: string;
  initialPin?: string;
  onClaim?: (linkId: string, pin: string) => Promise<any>;
  onClaimed?: (result: any) => void;
  className?: string;
}

// Animations
const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const glow = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(45, 214, 210, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(45, 214, 210, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(45, 214, 210, 0);
  }
`;

// Styled Components
const ClaimContainer = styled(Card)`
  max-width: 480px;
  width: 100%;
  animation: ${slideUp} 0.5s ease-out forwards;
`;

const SecurityNote = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  background-color: ${theme.colors.primary[50]};
  border: 1px solid ${theme.colors.primary[100]};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing[3]};
  margin-bottom: ${theme.spacing[4]};
  color: ${theme.colors.primary[800]};
  font-size: ${theme.typography.fontSize.sm};
`;

const SecurityIcon = styled.div`
  color: ${theme.colors.primary[600]};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const PinForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[4]};
`;

const PinInputsContainer = styled.div`
  display: flex;
  gap: ${theme.spacing[2]};
  justify-content: center;
  margin-bottom: ${theme.spacing[4]};
`;

const PinDigit = styled.input<{ isActive: boolean }>`
  width: 56px;
  height: 64px;
  border-radius: ${theme.borderRadius.md};
  border: 2px solid ${props => 
    props.isActive 
      ? theme.colors.primary[500] 
      : theme.colors.gray[300]
  };
  background-color: ${props => 
    props.isActive 
      ? theme.colors.primary[50] 
      : theme.colors.white
  };
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  text-align: center;
  transition: all 0.2s ease;
  outline: none;
  
  &:focus {
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[200]};
    background-color: ${theme.colors.primary[50]};
  }
  
  ${props => props.isActive && css`
    animation: ${glow} 1.5s infinite;
  `}
`;

const ClaimDetails = styled.div`
  background: linear-gradient(135deg, ${theme.colors.secondary[50]}, ${theme.colors.secondary[100]});
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[4]};
  margin-bottom: ${theme.spacing[4]};
  border: 1px solid ${theme.colors.secondary[200]};
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing[2]} 0;
  border-bottom: 1px solid ${theme.colors.secondary[200]};
  
  &:last-child {
    border-bottom: none;
  }
`;

const DetailLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray[600]};
`;

const DetailValue = styled.div`
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.gray[900]};
`;

const StatusIndicator = styled.div<{ status: 'loading' | 'success' | 'error' | 'idle' }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  padding: ${theme.spacing[3]};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing[4]};
  
  ${props => {
    switch (props.status) {
      case 'loading':
        return css`
          background-color: ${theme.colors.gray[100]};
          color: ${theme.colors.gray[700]};
        `;
      case 'success':
        return css`
          background-color: ${theme.colors.status.success}20;
          color: ${theme.colors.status.success};
        `;
      case 'error':
        return css`
          background-color: ${theme.colors.status.error}20;
          color: ${theme.colors.status.error};
        `;
      default:
        return css`
          display: none;
        `;
    }
  }}
`;

const StatusIcon = styled.div<{ status: 'loading' | 'success' | 'error' | 'idle' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  
  ${props => props.status === 'loading' && css`
    animation: ${spin} 1s linear infinite;
  `}
`;

const StatusMessage = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  flex: 1;
`;

const SuccessAnimation = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing[6]} 0;
`;

const SuccessIcon = styled(motion.div)`
  width: 80px;
  height: 80px;
  border-radius: ${theme.borderRadius.full};
  background-color: ${theme.colors.status.success};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${theme.spacing[4]};
`;

const SuccessMessage = styled(motion.div)`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.gray[900]};
  margin-bottom: ${theme.spacing[2]};
  text-align: center;
`;

const SuccessSubMessage = styled(motion.div)`
  font-size: ${theme.typography.fontSize.md};
  color: ${theme.colors.gray[600]};
  text-align: center;
  max-width: 320px;
  margin: 0 auto;
`;

const ClaimAmount = styled.span`
  color: ${theme.colors.primary[700]};
  font-weight: ${theme.typography.fontWeight.bold};
`;

// Component Definition
const ClaimLink: React.FC<ClaimLinkProps> = ({
  linkId: initialLinkId,
  initialPin,
  onClaim,
  onClaimed,
  className,
}) => {
  // States
  const [linkId, setLinkId] = useState(initialLinkId || '');
  const [pin, setPin] = useState(initialPin || '');
  const [pinDigits, setPinDigits] = useState(['', '', '', '']);
  const [currentPinIndex, setCurrentPinIndex] = useState(0);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [claimDetails, setClaimDetails] = useState<any>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // References for PIN input
  const pinInputRefs = Array(4).fill(0).map(() => React.createRef<HTMLInputElement>());
  
  // Effects
  useEffect(() => {
    // If initial PIN is provided, parse it into digits
    if (initialPin) {
      const digits = initialPin.split('').slice(0, 4);
      setPinDigits(digits.concat(Array(4 - digits.length).fill('')));
      setCurrentPinIndex(Math.min(initialPin.length, 4));
    }
  }, [initialPin]);
  
  useEffect(() => {
    // Focus on the correct PIN input when current index changes
    if (pinInputRefs[currentPinIndex]?.current) {
      pinInputRefs[currentPinIndex].current?.focus();
    }
  }, [currentPinIndex]);
  
  // Combine pin digits into a single string
  useEffect(() => {
    setPin(pinDigits.join(''));
  }, [pinDigits]);
  
  // Handle PIN digit change
  const handlePinDigitChange = (index: number, value: string) => {
    const newValue = value.replace(/[^0-9]/g, '').substring(0, 1);
    const newPinDigits = [...pinDigits];
    newPinDigits[index] = newValue;
    setPinDigits(newPinDigits);
    
    // Auto-advance to next input if we entered a digit
    if (newValue && index < 3) {
      setCurrentPinIndex(index + 1);
    }
  };
  
  // Handle PIN digit keydown
  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!pinDigits[index] && index > 0) {
        setCurrentPinIndex(index - 1);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      setCurrentPinIndex(index - 1);
    } else if (e.key === 'ArrowRight' && index < 3) {
      setCurrentPinIndex(index + 1);
    }
  };
  
  // Handle claim submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!linkId.trim()) {
      toast.error('Please enter a valid claim link ID');
      return;
    }
    
    if (pin.length !== 4) {
      toast.error('Please enter a valid 4-digit PIN');
      return;
    }
    
    try {
      setStatus('loading');
      setStatusMessage('Verifying your PIN and processing your claim...');
      
      // Mock data for demo
      const mockClaimDetails = {
        sender: 'Alice',
        amount: '50.00',
        currency: 'XLM',
        date: new Date().toLocaleDateString(),
        note: 'For lunch yesterday',
      };
      
      // Here we would call the real API
      if (onClaim) {
        const result = await onClaim(linkId, pin);
        setClaimDetails(result);
        
        // Notify parent of success
        if (onClaimed) {
          onClaimed(result);
        }
      } else {
        // For demo purposes, use mock data and simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        setClaimDetails(mockClaimDetails);
      }
      
      setStatus('success');
      setStatusMessage('Claim verified! Processing your funds...');
      
      // Simulate the final processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success animation
      setIsSuccess(true);
      toast.success('Funds claimed successfully!');
      
    } catch (error) {
      console.error('Claim error:', error);
      setStatus('error');
      setStatusMessage('Invalid PIN or the funds have already been claimed. Please check and try again.');
      toast.error('Failed to claim funds');
    }
  };
  
  // Render success state
  if (isSuccess) {
    return (
      <ClaimContainer className={className}>
        <CardContent>
          <SuccessAnimation>
            <SuccessIcon
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <FiCheckCircle size={48} />
            </SuccessIcon>
            
            <SuccessMessage
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Funds Claimed!
            </SuccessMessage>
            
            <SuccessSubMessage
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              You've successfully claimed <ClaimAmount>{claimDetails?.amount} {claimDetails?.currency}</ClaimAmount>. 
              The funds are now available in your wallet.
            </SuccessSubMessage>
          </SuccessAnimation>
        </CardContent>
        
        <CardFooter>
          <Button
            variant="primary"
            fullWidth
            rightIcon={<FiArrowRight />}
            onClick={() => window.location.href = '/wallet'}
          >
            Go to My Wallet
          </Button>
        </CardFooter>
      </ClaimContainer>
    );
  }
  
  // Render claim form
  return (
    <ClaimContainer className={className}>
      <CardHeader 
        title="Claim Your Funds" 
        subtitle="Enter the PIN provided by the sender"
      />
      
      <CardContent>
        <SecurityNote>
          <SecurityIcon>
            <FiLock size={20} />
          </SecurityIcon>
          <div>
            Your funds are secured with end-to-end encryption and can only be
            claimed with the correct PIN.
          </div>
        </SecurityNote>
        
        {status !== 'idle' && (
          <StatusIndicator status={status}>
            <StatusIcon status={status}>
              {status === 'loading' && <FiRefreshCw size={20} />}
              {status === 'success' && <FiCheckCircle size={20} />}
              {status === 'error' && <FiAlertCircle size={20} />}
            </StatusIcon>
            <StatusMessage>{statusMessage}</StatusMessage>
          </StatusIndicator>
        )}
        
        <PinForm onSubmit={handleSubmit}>
          {!initialLinkId && (
            <TextInput
              label="Link ID"
              placeholder="Enter the claim link ID"
              value={linkId}
              onChange={(e) => setLinkId(e.target.value)}
              fullWidth
            />
          )}
          
          <div>
            <label 
              htmlFor="pin-input-0" 
              style={{ 
                display: 'block', 
                marginBottom: theme.spacing[2],
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.gray[700]
              }}
            >
              4-Digit PIN
            </label>
            
            <PinInputsContainer>
              {pinDigits.map((digit, index) => (
                <PinDigit
                  key={index}
                  ref={pinInputRefs[index]}
                  id={`pin-input-${index}`}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handlePinKeyDown(index, e)}
                  onFocus={() => setCurrentPinIndex(index)}
                  isActive={currentPinIndex === index}
                />
              ))}
            </PinInputsContainer>
          </div>
          
          {claimDetails && (
            <ClaimDetails>
              <DetailRow>
                <DetailLabel>Sender</DetailLabel>
                <DetailValue>{claimDetails.sender}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Amount</DetailLabel>
                <DetailValue>{claimDetails.amount} {claimDetails.currency}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Date</DetailLabel>
                <DetailValue>{claimDetails.date}</DetailValue>
              </DetailRow>
              {claimDetails.note && (
                <DetailRow>
                  <DetailLabel>Note</DetailLabel>
                  <DetailValue>{claimDetails.note}</DetailValue>
                </DetailRow>
              )}
            </ClaimDetails>
          )}
          
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={status === 'loading'}
            disabled={pin.length !== 4 || status === 'loading'}
          >
            Claim Funds
          </Button>
        </PinForm>
      </CardContent>
    </ClaimContainer>
  );
};

export default ClaimLink;