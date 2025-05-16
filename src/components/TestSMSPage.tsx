import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiSend, FiCheck, FiSmartphone, FiLock } from 'react-icons/fi';
import { sendClaimLinkSMS, validatePhoneNumber } from '../services/sms';

// Styled Components
const Container = styled.div`
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
`;

const Card = styled(motion.div)`
  background-color: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
`;

const Title = styled.h1`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: white;
  text-align: center;
`;

const Subtitle = styled.p`
  font-size: 0.875rem;
  margin-bottom: 2rem;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: rgba(79, 70, 229, 0.5);
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const Button = styled(motion.button)`
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2), 0 2px 4px -1px rgba(79, 70, 229, 0.1);
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const StatusContainer = styled(motion.div)`
  margin-top: 1.5rem;
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
`;

const SuccessStatus = styled(StatusContainer)`
  background-color: rgba(16, 185, 129, 0.2);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: rgba(16, 185, 129, 1);
`;

const ErrorStatus = styled(StatusContainer)`
  background-color: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: rgba(239, 68, 68, 1);
`;

const InfoBox = styled.div`
  background-color: rgba(79, 70, 229, 0.1);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  svg {
    color: #6366f1;
    flex-shrink: 0;
  }
`;

const InfoText = styled.div`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
`;

// Status type
type Status = 'idle' | 'loading' | 'success' | 'error';

// Component
const TestSMSPage: React.FC = () => {
  // State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  
  // Generate a random PIN and claim ID for testing
  const generatePin = () => Math.floor(1000 + Math.random() * 9000).toString();
  const generateClaimId = () => `test-claim-${Date.now()}`;
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || !amount) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (!validatePhoneNumber(phoneNumber)) {
      toast.error('Please enter a valid phone number');
      return;
    }
    
    const pin = generatePin();
    const claimId = generateClaimId();
    
    setStatus('loading');
    setStatusMessage('Sending SMS notification...');
    
    try {
      const result = await sendClaimLinkSMS(
        phoneNumber,
        amount,
        pin,
        claimId,
        'MilkyPay Test'
      );
      
      if (result.success) {
        setStatus('success');
        setStatusMessage(`SMS sent successfully! PIN: ${pin}, Claim ID: ${claimId}`);
        toast.success('SMS notification sent!');
      } else {
        throw new Error(result.error || 'Failed to send SMS');
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      setStatus('error');
      setStatusMessage(error instanceof Error ? error.message : 'Unknown error occurred');
      toast.error('Failed to send SMS notification');
    }
  };
  
  return (
    <Container>
      <Card
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Title>SMS Service Test</Title>
        <Subtitle>Test sending claim link SMS notifications</Subtitle>
        
        <InfoBox>
          <FiLock size={20} />
          <InfoText>
            This utility will send a real SMS with a test claim link. The generated PIN and claim ID are randomly generated for testing purposes.
          </InfoText>
        </InfoBox>
        
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1 234 567 8901"
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="amount">Amount (USD)</Label>
            <Input
              id="amount"
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="50.00"
            />
          </FormGroup>
          
          <Button
            type="submit"
            disabled={status === 'loading'}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {status === 'loading' ? (
              <>Processing...</>
            ) : (
              <>
                <FiSend size={18} />
                Send Test SMS
              </>
            )}
          </Button>
        </form>
        
        {status === 'success' && (
          <SuccessStatus
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <FiCheck size={18} />
              <strong>Success!</strong>
            </div>
            {statusMessage}
          </SuccessStatus>
        )}
        
        {status === 'error' && (
          <ErrorStatus
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <FiSmartphone size={18} />
              <strong>Error</strong>
            </div>
            {statusMessage}
          </ErrorStatus>
        )}
      </Card>
    </Container>
  );
};

export default TestSMSPage;