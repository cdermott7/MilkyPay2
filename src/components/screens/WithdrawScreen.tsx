import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiAlertCircle, FiDollarSign, FiSend } from 'react-icons/fi';
import theme from '../../styles/theme';

interface WithdrawScreenProps {
  balance: string;
  onBack: () => void;
  onSubmit: (address: string, amount: string) => void;
}

// Styled components for the withdraw screen
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

const WarningBanner = styled.div`
  display: flex;
  align-items: flex-start;
  background-color: ${theme.colors.status.warning}10;
  border-left: 4px solid ${theme.colors.status.warning};
  padding: ${theme.spacing[3]};
  border-radius: ${theme.borderRadius.md};
  margin-top: ${theme.spacing[4]};
`;

const WarningIcon = styled.div`
  color: ${theme.colors.status.warning};
  margin-right: ${theme.spacing[2]};
  flex-shrink: 0;
  margin-top: 2px;
`;

const WarningText = styled.p`
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
const WithdrawScreen: React.FC<WithdrawScreenProps> = ({ balance, onBack, onSubmit }) => {
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const numericBalance = parseFloat(balance) || 0;
  
  // Check if form is valid
  const isFormValid = () => {
    return address.trim() !== '' && 
           amount.trim() !== '' && 
           parseFloat(amount) > 0 && 
           parseFloat(amount) <= numericBalance;
  };
  
  // Handle max amount
  const setMaxAmount = () => {
    // Leave a small amount for transaction fees
    const maxAmount = Math.max(0, numericBalance - 0.1).toFixed(2);
    setAmount(maxAmount);
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid()) {
      onSubmit(address, amount);
    }
  };
  
  return (
    <Container>
      <Header>
        <BackButton onClick={onBack}>
          <FiArrowLeft size={24} />
        </BackButton>
        <Title>Withdraw Funds</Title>
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
            
            <FormGroup>
              <Label htmlFor="recipient-address">Recipient Address</Label>
              <Input 
                id="recipient-address"
                type="text" 
                placeholder="G..." 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
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
            
            <SubmitButton 
              type="submit" 
              disabled={!isFormValid()}
              whileHover={{ scale: isFormValid() ? 1.03 : 1 }}
              whileTap={{ scale: isFormValid() ? 0.98 : 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <FiSend size={18} />
              Withdraw Funds
            </SubmitButton>
            
            <WarningBanner>
              <WarningIcon><FiAlertCircle size={18} /></WarningIcon>
              <WarningText>
                Always double-check the recipient address before submitting. Transactions on the Stellar network cannot be reversed once confirmed.
              </WarningText>
            </WarningBanner>
          </form>
        </Card>
      </motion.div>
    </Container>
  );
};

export default WithdrawScreen;