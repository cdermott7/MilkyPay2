import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  FiDollarSign, 
  FiCreditCard, 
  FiSmartphone, 
  FiMapPin, 
  FiArrowRight,
  FiDownload,
  FiInfo,
  FiCheck
} from 'react-icons/fi';
import theme from '../styles/theme';
import Card, { CardHeader, CardContent, CardFooter, CardDivider } from './ui/Card';
import Button from './ui/Button';
import TextInput from './ui/TextInput';

// Types
interface OffRampOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  fee: string;
  minAmount: string;
  estimate: string;
  isPopular?: boolean;
}

interface OffRampOptionsProps {
  balance?: string;
  walletAddress?: string;
  onWithdraw?: (amount: string, method: string, details: any) => Promise<any>;
  onSuccess?: (result: any) => void;
  className?: string;
}

// Styled Components
const OptionsContainer = styled(Card)`
  max-width: 480px;
  width: 100%;
`;

const BalanceInfo = styled.div`
  background: linear-gradient(135deg, ${theme.colors.primary[50]}, ${theme.colors.primary[100]});
  padding: ${theme.spacing[4]};
  border-radius: ${theme.borderRadius.lg};
  margin-bottom: ${theme.spacing[4]};
`;

const BalanceLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray[600]};
  margin-bottom: ${theme.spacing[1]};
`;

const BalanceAmount = styled.div`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.gray[900]};
`;

const OptionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[3]};
  margin-bottom: ${theme.spacing[4]};
`;

const OptionItem = styled.div<{ isSelected: boolean }>`
  display: flex;
  align-items: center;
  padding: ${theme.spacing[3]};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${props => 
    props.isSelected ? theme.colors.primary[500] : theme.colors.gray[200]
  };
  background-color: ${props => 
    props.isSelected ? theme.colors.primary[50] : theme.colors.white
  };
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${props => 
      props.isSelected ? theme.colors.primary[500] : theme.colors.primary[200]
    };
    background-color: ${props => 
      props.isSelected ? theme.colors.primary[50] : theme.colors.gray[50]
    };
  }
`;

const OptionIconWrapper = styled.div<{ isSelected: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: ${theme.borderRadius.md};
  background-color: ${props => 
    props.isSelected ? theme.colors.primary[100] : theme.colors.gray[100]
  };
  color: ${props => 
    props.isSelected ? theme.colors.primary[700] : theme.colors.gray[700]
  };
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: ${theme.spacing[3]};
  flex-shrink: 0;
`;

const OptionInfo = styled.div`
  flex: 1;
`;

const OptionName = styled.div`
  font-weight: ${theme.typography.fontWeight.medium};
  margin-bottom: ${theme.spacing[1]};
  display: flex;
  align-items: center;
`;

const OptionDescription = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray[600]};
`;

const PopularBadge = styled.span`
  background-color: ${theme.colors.secondary[100]};
  color: ${theme.colors.secondary[700]};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  padding: ${theme.spacing[1]} ${theme.spacing[2]};
  border-radius: ${theme.borderRadius.full};
  margin-left: ${theme.spacing[2]};
`;

const OptionDetails = styled.div`
  text-align: right;
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray[600]};
`;

const EstimateText = styled.div`
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.gray[800]};
`;

const WithdrawForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[4]};
`;

const AmountRow = styled.div`
  display: flex;
  gap: ${theme.spacing[2]};
`;

const MaxButton = styled.button`
  background-color: ${theme.colors.primary[50]};
  color: ${theme.colors.primary[700]};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  border: 1px solid ${theme.colors.primary[200]};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing[1]} ${theme.spacing[2]};
  cursor: pointer;
  transition: all 0.2s ease;
  height: 2.75rem;
  
  &:hover {
    background-color: ${theme.colors.primary[100]};
  }
`;

const SummaryContainer = styled.div`
  background-color: ${theme.colors.gray[50]};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[3]};
  margin-bottom: ${theme.spacing[4]};
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${theme.spacing[2]};
  font-size: ${theme.typography.fontSize.sm};
  
  &:last-child {
    margin-bottom: 0;
    padding-top: ${theme.spacing[2]};
    border-top: 1px solid ${theme.colors.gray[200]};
    font-weight: ${theme.typography.fontWeight.semibold};
  }
`;

const FeeTooltip = styled.div`
  display: inline-flex;
  align-items: center;
  color: ${theme.colors.gray[500]};
  cursor: help;
  margin-left: ${theme.spacing[1]};
  
  &:hover {
    color: ${theme.colors.primary[600]};
  }
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

const SuccessTitle = styled(motion.div)`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.gray[900]};
  margin-bottom: ${theme.spacing[2]};
`;

const SuccessMessage = styled(motion.div)`
  font-size: ${theme.typography.fontSize.md};
  color: ${theme.colors.gray[600]};
  text-align: center;
  max-width: 320px;
  margin: 0 auto;
  margin-bottom: ${theme.spacing[4]};
`;

const ReferenceCode = styled.div`
  font-family: monospace;
  background-color: ${theme.colors.gray[100]};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  font-size: ${theme.typography.fontSize.md};
  text-align: center;
  letter-spacing: 1px;
  margin-bottom: ${theme.spacing[3]};
`;

// Component Definition
const OffRampOptions: React.FC<OffRampOptionsProps> = ({
  balance = '0',
  walletAddress,
  onWithdraw,
  onSuccess,
  className,
}) => {
  // State
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [details, setDetails] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [withdrawResult, setWithdrawResult] = useState<any>(null);
  
  // Available off-ramp options
  const options: OffRampOption[] = [
    {
      id: 'bank',
      name: 'Bank Transfer',
      description: 'Direct transfer to your bank account',
      icon: <FiDollarSign size={20} />,
      fee: '1.5%',
      minAmount: '5',
      estimate: '1-2 business days',
      isPopular: true,
    },
    {
      id: 'card',
      name: 'Debit Card',
      description: 'Instant transfer to your debit card',
      icon: <FiCreditCard size={20} />,
      fee: '2.5%',
      minAmount: '10',
      estimate: '10-30 minutes',
    },
    {
      id: 'mobile',
      name: 'Mobile Money',
      description: 'M-Pesa, MTN, Airtel Money and more',
      icon: <FiSmartphone size={20} />,
      fee: '1%',
      minAmount: '1',
      estimate: '5-15 minutes',
      isPopular: true,
    },
    {
      id: 'pickup',
      name: 'Cash Pickup',
      description: 'MoneyGram pickup locations worldwide',
      icon: <FiMapPin size={20} />,
      fee: '3%',
      minAmount: '20',
      estimate: 'Same day',
    },
  ];
  
  // Calculate fees and totals
  const getSelectedOption = () => {
    return options.find(opt => opt.id === selectedOption) || null;
  };
  
  const calculateFee = () => {
    const option = getSelectedOption();
    if (!option || !amount) return 0;
    
    const feePercentage = parseFloat(option.fee.replace('%', '')) / 100;
    return parseFloat(amount) * feePercentage;
  };
  
  const calculateTotal = () => {
    if (!amount) return 0;
    const amountValue = parseFloat(amount);
    const fee = calculateFee();
    return amountValue - fee;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const option = getSelectedOption();
    if (!option || !amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    const minAmount = parseFloat(option.minAmount);
    if (parseFloat(amount) < minAmount) {
      toast.error(`Minimum amount for ${option.name} is $${minAmount}`);
      return;
    }
    
    if (parseFloat(amount) > parseFloat(balance)) {
      toast.error('Amount exceeds your available balance');
      return;
    }
    
    // Validate required fields
    let missingFields = false;
    
    if (option.id === 'bank') {
      if (!details.accountNumber || !details.routingNumber || !details.accountName) {
        toast.error('Please fill all bank details');
        missingFields = true;
      }
    } else if (option.id === 'card') {
      if (!details.cardNumber || !details.expiryDate || !details.cardholderName) {
        toast.error('Please fill all card details');
        missingFields = true;
      }
    } else if (option.id === 'mobile') {
      if (!details.phoneNumber || !details.provider) {
        toast.error('Please fill all mobile money details');
        missingFields = true;
      }
    } else if (option.id === 'pickup') {
      if (!details.fullName || !details.country) {
        toast.error('Please fill all pickup details');
        missingFields = true;
      }
    }
    
    if (missingFields) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Call the withdraw function provided by parent component
      if (onWithdraw) {
        const result = await onWithdraw(amount, option.id, details);
        setWithdrawResult(result);
        
        if (onSuccess) {
          onSuccess(result);
        }
      } else {
        // Mock response for demo purposes
        await new Promise(resolve => setTimeout(resolve, 2000));
        const mockResult = {
          success: true,
          amount: calculateTotal().toFixed(2),
          fee: calculateFee().toFixed(2),
          destination: getDestinationLabel(),
          referenceCode: `WD${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          estimatedTime: option.estimate,
        };
        setWithdrawResult(mockResult);
      }
      
      setWithdrawSuccess(true);
      toast.success('Withdrawal initiated successfully!');
      
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast.error('Failed to process withdrawal');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper to set the maximum amount
  const handleMaxAmount = () => {
    setAmount(balance);
  };
  
  // Helper to show the destination in a human-readable form
  const getDestinationLabel = () => {
    const option = getSelectedOption();
    if (!option) return '';
    
    switch (option.id) {
      case 'bank':
        return details.accountNumber 
          ? `Bank account ending in ${details.accountNumber.slice(-4)}` 
          : 'Bank account';
      case 'card':
        return details.cardNumber 
          ? `Card ending in ${details.cardNumber.slice(-4)}` 
          : 'Debit card';
      case 'mobile':
        return details.phoneNumber 
          ? `${details.provider || 'Mobile'} (${details.phoneNumber})` 
          : 'Mobile money';
      case 'pickup':
        return details.country 
          ? `Cash pickup in ${details.country}` 
          : 'Cash pickup';
      default:
        return '';
    }
  };
  
  // Render appropriate form fields based on selected method
  const renderMethodFields = () => {
    if (!selectedOption) return null;
    
    switch (selectedOption) {
      case 'bank':
        return (
          <>
            <TextInput
              label="Account Number"
              placeholder="Enter your bank account number"
              value={details.accountNumber || ''}
              onChange={(e) => setDetails({...details, accountNumber: e.target.value})}
              fullWidth
            />
            <TextInput
              label="Routing Number / Sort Code"
              placeholder="Enter your routing number"
              value={details.routingNumber || ''}
              onChange={(e) => setDetails({...details, routingNumber: e.target.value})}
              fullWidth
            />
            <TextInput
              label="Account Holder Name"
              placeholder="Enter the account holder's name"
              value={details.accountName || ''}
              onChange={(e) => setDetails({...details, accountName: e.target.value})}
              fullWidth
            />
          </>
        );
      case 'card':
        return (
          <>
            <TextInput
              label="Card Number"
              placeholder="Enter your card number"
              value={details.cardNumber || ''}
              onChange={(e) => setDetails({...details, cardNumber: e.target.value})}
              fullWidth
            />
            <TextInput
              label="Expiry Date"
              placeholder="MM/YY"
              value={details.expiryDate || ''}
              onChange={(e) => setDetails({...details, expiryDate: e.target.value})}
              fullWidth
            />
            <TextInput
              label="Cardholder Name"
              placeholder="Enter the cardholder's name"
              value={details.cardholderName || ''}
              onChange={(e) => setDetails({...details, cardholderName: e.target.value})}
              fullWidth
            />
          </>
        );
      case 'mobile':
        return (
          <>
            <TextInput
              label="Mobile Number"
              placeholder="Enter your mobile number"
              value={details.phoneNumber || ''}
              onChange={(e) => setDetails({...details, phoneNumber: e.target.value})}
              fullWidth
            />
            <TextInput
              label="Mobile Money Provider"
              placeholder="e.g. M-Pesa, MTN, Airtel Money"
              value={details.provider || ''}
              onChange={(e) => setDetails({...details, provider: e.target.value})}
              fullWidth
            />
          </>
        );
      case 'pickup':
        return (
          <>
            <TextInput
              label="Full Name"
              placeholder="Enter your full name"
              value={details.fullName || ''}
              onChange={(e) => setDetails({...details, fullName: e.target.value})}
              fullWidth
            />
            <TextInput
              label="Country"
              placeholder="Enter your country"
              value={details.country || ''}
              onChange={(e) => setDetails({...details, country: e.target.value})}
              fullWidth
            />
            <TextInput
              label="City"
              placeholder="Enter your city"
              value={details.city || ''}
              onChange={(e) => setDetails({...details, city: e.target.value})}
              fullWidth
            />
          </>
        );
      default:
        return null;
    }
  };
  
  // Render success state
  if (withdrawSuccess && withdrawResult) {
    return (
      <OptionsContainer className={className}>
        <CardContent>
          <SuccessAnimation>
            <SuccessIcon
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <FiCheck size={42} />
            </SuccessIcon>
            
            <SuccessTitle
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Withdrawal Initiated
            </SuccessTitle>
            
            <SuccessMessage
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              ${withdrawResult.amount} has been sent to your {getDestinationLabel()}. 
              Estimated arrival: {withdrawResult.estimatedTime}.
            </SuccessMessage>
            
            <ReferenceCode>
              {withdrawResult.referenceCode}
            </ReferenceCode>
            
            <p style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.gray[600], textAlign: 'center' }}>
              Keep this reference code for tracking your withdrawal.
            </p>
          </SuccessAnimation>
        </CardContent>
        
        <CardFooter>
          <Button
            variant="primary"
            fullWidth
            leftIcon={<FiArrowRight />}
            onClick={() => window.location.href = '/wallet'}
          >
            Return to Wallet
          </Button>
        </CardFooter>
      </OptionsContainer>
    );
  }
  
  // Render main component
  return (
    <OptionsContainer className={className}>
      <CardHeader 
        title="Withdraw Funds" 
        subtitle="Convert your digital assets to local currency"
      />
      
      <CardContent>
        <BalanceInfo>
          <BalanceLabel>Available Balance</BalanceLabel>
          <BalanceAmount>${parseFloat(balance).toFixed(2)} USD</BalanceAmount>
        </BalanceInfo>
        
        <h3 style={{ 
          marginBottom: theme.spacing[3],
          fontSize: theme.typography.fontSize.md,
          fontWeight: theme.typography.fontWeight.medium
        }}>
          Select Withdrawal Method
        </h3>
        
        <OptionsList>
          {options.map(option => (
            <OptionItem 
              key={option.id}
              isSelected={selectedOption === option.id}
              onClick={() => setSelectedOption(option.id)}
            >
              <OptionIconWrapper isSelected={selectedOption === option.id}>
                {option.icon}
              </OptionIconWrapper>
              
              <OptionInfo>
                <OptionName>
                  {option.name}
                  {option.isPopular && <PopularBadge>Popular</PopularBadge>}
                </OptionName>
                <OptionDescription>{option.description}</OptionDescription>
              </OptionInfo>
              
              <OptionDetails>
                <div>Fee: {option.fee}</div>
                <EstimateText>{option.estimate}</EstimateText>
              </OptionDetails>
            </OptionItem>
          ))}
        </OptionsList>
        
        {selectedOption && (
          <>
            <CardDivider />
            
            <WithdrawForm onSubmit={handleSubmit}>
              <AmountRow>
                <TextInput
                  label="Amount to Withdraw"
                  placeholder="Enter amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  fullWidth
                  leftIcon={<FiDollarSign />}
                />
                <MaxButton type="button" onClick={handleMaxAmount}>
                  MAX
                </MaxButton>
              </AmountRow>
              
              {renderMethodFields()}
              
              {amount && parseFloat(amount) > 0 && (
                <SummaryContainer>
                  <SummaryRow>
                    <div>Amount</div>
                    <div>${parseFloat(amount).toFixed(2)}</div>
                  </SummaryRow>
                  <SummaryRow>
                    <div>
                      Fee ({getSelectedOption()?.fee})
                      <FeeTooltip title="Withdrawal fee">
                        <FiInfo size={14} />
                      </FeeTooltip>
                    </div>
                    <div>${calculateFee().toFixed(2)}</div>
                  </SummaryRow>
                  <SummaryRow>
                    <div>You'll receive</div>
                    <div>${calculateTotal().toFixed(2)}</div>
                  </SummaryRow>
                </SummaryContainer>
              )}
              
              <Button
                type="submit"
                variant="primary"
                fullWidth
                leftIcon={<FiDownload />}
                isLoading={isLoading}
                disabled={!selectedOption || !amount || parseFloat(amount) <= 0 || isLoading}
              >
                Withdraw Funds
              </Button>
            </WithdrawForm>
          </>
        )}
      </CardContent>
    </OptionsContainer>
  );
};

export default OffRampOptions;