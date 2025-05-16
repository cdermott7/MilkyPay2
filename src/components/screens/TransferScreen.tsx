import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiUserPlus, FiPhone, FiDollarSign, FiSend, FiInfo } from 'react-icons/fi';
import theme from '../../styles/theme';
import RocketAnimation from '../animations/ImprovedRocketAnimation';
import { validatePhoneNumber, sendClaimLinkSMS } from '../../services/sms';
import { toast } from 'react-hot-toast';

interface TransferScreenProps {
  balance: string;
  onBack: () => void;
  onSubmit: (recipient: string, amount: string, memo?: string) => void;
}

// Styled components for the transfer screen
const Container = styled.div`
  padding: ${theme.spacing[4]};
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${theme.spacing[6]};
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.gray[800]};
  padding: ${theme.spacing[2]};
  margin-left: -${theme.spacing[2]};
  border-radius: ${theme.borderRadius.full};
  cursor: pointer;
  
  &:hover {
    background-color: ${theme.colors.gray[100]};
  }
`;

const Title = styled.h1`
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
  margin-left: ${theme.spacing[2]};
`;

const Card = styled(motion.div)`
  background-color: white;
  border-radius: ${theme.borderRadius.xl};
  box-shadow: ${theme.shadows.md};
  padding: ${theme.spacing[6]};
  margin-bottom: ${theme.spacing[4]};
`;

const BalanceInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing[4]} ${theme.spacing[4]};
  background-color: ${theme.colors.gray[50]};
  border-radius: ${theme.borderRadius.lg};
  margin-bottom: ${theme.spacing[5]};
`;

const BalanceLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray[600]};
`;

const BalanceValue = styled.div`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.gray[900]};
`;

const FormGroup = styled.div`
  margin-bottom: ${theme.spacing[5]};
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

const Textarea = styled.textarea`
  width: 100%;
  padding: ${theme.spacing[3]};
  font-size: ${theme.typography.fontSize.md};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  background-color: white;
  transition: all 0.2s ease;
  resize: vertical;
  min-height: 80px;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[400]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
`;

const SegmentedControl = styled.div`
  display: flex;
  background-color: ${theme.colors.gray[100]};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[1]};
  margin-bottom: ${theme.spacing[4]};
`;

const SegmentButton = styled.button<{ active: boolean }>`
  flex: 1;
  background-color: ${props => props.active ? 'white' : 'transparent'};
  color: ${props => props.active ? theme.colors.primary[700] : theme.colors.gray[600]};
  border: none;
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing[2]};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  box-shadow: ${props => props.active ? theme.shadows.sm : 'none'};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    margin-right: ${theme.spacing[2]};
  }
  
  &:hover {
    background-color: ${props => props.active ? 'white' : theme.colors.gray[200]};
  }
`;

const InputGroup = styled.div`
  position: relative;
`;

const AmountPrefix = styled.div`
  position: absolute;
  top: 50%;
  left: ${theme.spacing[3]};
  transform: translateY(-50%);
  color: ${theme.colors.gray[600]};
  font-size: ${theme.typography.fontSize.md};
`;

const AmountInput = styled(Input)`
  padding-left: 1.75rem; /* Using fixed value instead of theme.spacing[7] which doesn't exist */
`;

const MaxButton = styled.button`
  position: absolute;
  top: 50%;
  right: ${theme.spacing[3]};
  transform: translateY(-50%);
  background-color: ${theme.colors.primary[100]};
  color: ${theme.colors.primary[700]};
  border: none;
  border-radius: ${theme.borderRadius.sm};
  padding: ${theme.spacing[1]} ${theme.spacing[2]};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  
  &:hover {
    background-color: ${theme.colors.primary[200]};
  }
`;

const SubmitButton = styled(motion.button)`
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
  box-shadow: ${theme.shadows.md};
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.lg};
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    background: linear-gradient(135deg, ${theme.colors.gray[400]}, ${theme.colors.gray[500]});
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  svg {
    margin-right: ${theme.spacing[2]};
  }
`;

const InfoBox = styled.div`
  display: flex;
  align-items: flex-start;
  background-color: ${theme.colors.primary[50]};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing[3]};
  margin-top: ${theme.spacing[3]};
`;

const InfoIcon = styled.div`
  color: ${theme.colors.primary[600]};
  margin-right: ${theme.spacing[2]};
  flex-shrink: 0;
  margin-top: 2px;
`;

const InfoText = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray[800]};
  margin: 0;
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

// Main component
const TransferScreen: React.FC<TransferScreenProps> = ({ balance, onBack, onSubmit }) => {
  const [selectedTab, setSelectedTab] = useState<'address' | 'phone'>('phone');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [isTransferSuccess, setIsTransferSuccess] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const numericBalance = parseFloat(balance) || 0;
  
  // Check if form is valid
  const isFormValid = () => {
    if (selectedTab === 'phone') {
      return recipient.trim() !== '' && 
             validatePhoneNumber(recipient) &&
             amount.trim() !== '' && 
             parseFloat(amount) > 0 && 
             parseFloat(amount) <= numericBalance;
    } else {
      return recipient.trim() !== '' && 
             // Basic Stellar address validation (G... format)
             /^G[A-Z0-9]{55}$/.test(recipient.trim()) &&
             amount.trim() !== '' && 
             parseFloat(amount) > 0 && 
             parseFloat(amount) <= numericBalance;
    }
  };
  
  // Handle max amount
  const setMaxAmount = () => {
    // Leave a small amount for transaction fees
    const maxAmount = Math.max(0, numericBalance - 0.1).toFixed(2);
    setAmount(maxAmount);
  };
  
  // Handle animation complete
  const handleAnimationComplete = () => {
    setShowAnimation(false);
    if (isTransferSuccess) {
      onBack(); // Return to home screen on success
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid()) {
      try {
        setIsTransferring(true);
        setShowAnimation(true);
        
        // Add a small delay to allow the animation to appear
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Try to process the transaction
        const result = await onSubmit(recipient, amount, memo);
        
        // For phone transfers, send an SMS with claim link
        if (selectedTab === 'phone' && result) {
          try {
            console.log('Preparing to send SMS notification for phone transfer');
            console.log('Transaction result:', result);
            
            // Extract PIN from the transaction result or generate a new one
            // In a real implementation, PIN should come from the transaction
            const pin = result.pin || Math.floor(1000 + Math.random() * 9000).toString();
            const claimId = `claim-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            
            console.log('Sending SMS with:', {
              recipient: recipient,
              amount: amount,
              pin: pin,
              claimId: claimId
            });
            
            // Send SMS notification with debug logging
            toast.loading('Sending SMS notification...');
            
            const smsResult = await sendClaimLinkSMS(
              recipient,
              amount,
              pin,
              claimId,
              "MilkyPay User" // Default sender name
            );
            
            console.log('SMS result:', smsResult);
            
            if (smsResult.success) {
              toast.success('SMS notification sent successfully!');
            } else {
              toast.warning('Transaction successful, but SMS notification failed to send');
              console.error('SMS notification failed:', smsResult.error);
            }
          } catch (smsError) {
            console.error('Failed to send SMS notification:', smsError);
            toast.warning('Transaction successful, but SMS notification failed to send');
          }
        }
        
        // If we get here, the transaction succeeded
        setIsTransferSuccess(true);
      } catch (error) {
        // If there was an error, the transfer failed
        setIsTransferSuccess(false);
        console.error('Transaction failed:', error);
      }
    }
  };
  
  return (
    <Container>
      <Header>
        <BackButton onClick={onBack}>
          <FiArrowLeft size={24} />
        </BackButton>
        <Title>Transfer Funds</Title>
      </Header>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Card variants={itemVariants}>
          <form onSubmit={handleSubmit}>
            <BalanceInfo>
              <BalanceLabel>Available Balance</BalanceLabel>
              <BalanceValue>{numericBalance.toFixed(2)} XLM</BalanceValue>
            </BalanceInfo>
            
            <SegmentedControl>
              <SegmentButton 
                type="button"
                active={selectedTab === 'phone'} 
                onClick={() => setSelectedTab('phone')}
              >
                <FiPhone size={16} />
                Phone Number
              </SegmentButton>
              <SegmentButton 
                type="button"
                active={selectedTab === 'address'} 
                onClick={() => setSelectedTab('address')}
              >
                <FiUserPlus size={16} />
                Stellar Address
              </SegmentButton>
            </SegmentedControl>
            
            <FormGroup>
              <Label htmlFor="recipient">
                {selectedTab === 'phone' ? 'Recipient Phone Number' : 'Recipient Stellar Address'}
              </Label>
              <Input 
                id="recipient"
                type={selectedTab === 'phone' ? 'tel' : 'text'} 
                placeholder={selectedTab === 'phone' ? '+1 (555) 123-4567' : 'G...'} 
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
              {selectedTab === 'phone' && (
                <InfoBox>
                  <InfoIcon><FiInfo size={18} /></InfoIcon>
                  <InfoText>
                    Recipients will receive a text message with a link to claim their funds. No wallet needed!
                  </InfoText>
                </InfoBox>
              )}
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="amount">Amount</Label>
              <InputGroup>
                <AmountPrefix>
                  <FiDollarSign />
                </AmountPrefix>
                <AmountInput 
                  id="amount"
                  type="number" 
                  step="0.01" 
                  min="0" 
                  max={numericBalance}
                  placeholder="0.00" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <MaxButton type="button" onClick={setMaxAmount}>MAX</MaxButton>
              </InputGroup>
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="memo">Memo (Optional)</Label>
              <Textarea 
                id="memo"
                placeholder="Add a note about this transfer..." 
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
            </FormGroup>
            
            <SubmitButton 
              type="submit" 
              disabled={!isFormValid()}
              whileHover={{ scale: isFormValid() ? 1.03 : 1 }}
              whileTap={{ scale: isFormValid() ? 0.98 : 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <FiSend size={18} />
              Send Funds
            </SubmitButton>
          </form>
        </Card>
      </motion.div>
      
      {/* Rocket animation for transaction feedback */}
      <RocketAnimation 
        isVisible={showAnimation}
        isSuccess={isTransferSuccess}
        onComplete={handleAnimationComplete}
      />
    </Container>
  );
};

export default TransferScreen;