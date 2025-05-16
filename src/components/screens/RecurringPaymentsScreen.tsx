import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiPlus, FiTrash2, FiEdit2, FiRepeat, FiToggleLeft, FiToggleRight, FiCheck, FiX } from 'react-icons/fi';
import theme from '../../styles/theme';
import { RecurringPayment, getAllRecurringPayments, createRecurringPayment, updateRecurringPayment, deleteRecurringPayment, toggleRecurringPaymentStatus } from '../../services/recurringPayments';
import { validatePhoneNumber, sendRecurringPaymentConfirmation } from '../../services/sms';
import { toast } from 'react-hot-toast';

interface RecurringPaymentsScreenProps {
  onBack: () => void;
  balance: string;
  onSubmit: (recipient: string, amount: string, memo?: string, frequency?: string) => void;
  initialRecipient?: string;
  initialAmount?: string;
  initialFrequency?: 'daily' | 'weekly' | 'monthly';
}

// Styled components
const Container = styled.div`
  padding: ${theme.spacing[4]};
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  flex-direction: column;
  color: ${theme.colors.gray[900]};
  font-family: ${theme.typography.fontFamily.secondary};

  /* Use same background style as main app when in dark mode */
  .dark-mode & {
    color: white;
    background-image: url("https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=3540&auto=format&fit=crop");
    background-size: cover;
    background-position: center;
    background-blend-mode: overlay;
  }
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
  
  /* Style for dark mode */
  .dark-mode & {
    color: white;
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
`;

const Title = styled.h1`
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
  margin-left: ${theme.spacing[2]};
  
  /* Style for dark mode */
  .dark-mode & {
    color: white;
    background: linear-gradient(90deg, white, #A4F0EF);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: 0.5px;
  }
`;

const AddButton = styled(motion.button)`
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: ${theme.borderRadius.full};
  background: linear-gradient(135deg, ${theme.colors.primary[600]}, ${theme.colors.primary[800]});
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${theme.shadows.lg};
  cursor: pointer;
  z-index: 10;
  
  /* Style for dark mode */
  .dark-mode & {
    box-shadow: 0 0 20px rgba(124, 58, 237, 0.4);
    border: 1px solid rgba(124, 58, 237, 0.3);
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing[10]} ${theme.spacing[4]};
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  color: ${theme.colors.gray[400]};
  margin-bottom: ${theme.spacing[4]};
  
  /* Style for dark mode */
  .dark-mode & {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const EmptyText = styled.p`
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.md};
  color: ${theme.colors.gray[600]};
  margin-bottom: ${theme.spacing[2]};
  font-weight: ${theme.typography.fontWeight.medium};
  
  /* Style for dark mode */
  .dark-mode & {
    color: rgba(255, 255, 255, 0.8);
  }
`;

const EmptySubtext = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray[500]};
  max-width: 300px;
  
  /* Style for dark mode */
  .dark-mode & {
    color: rgba(255, 255, 255, 0.6);
  }
`;

const PaymentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[3]};
  margin-bottom: 80px; // Space for the Add button
`;

const PaymentCard = styled(motion.div)`
  background-color: white;
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
  padding: ${theme.spacing[4]};
  display: flex;
  flex-direction: column;
  
  /* Style for dark mode */
  .dark-mode & {
    background-color: rgba(26, 32, 44, 0.7);
    border: 1px solid rgba(124, 58, 237, 0.3);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
  }
`;

const PaymentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${theme.spacing[3]};
`;

const PaymentTitle = styled.h3`
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.gray[800]};
  
  /* Style for dark mode */
  .dark-mode & {
    color: white;
  }
`;

const PaymentStatus = styled.div<{ active: boolean }>`
  display: flex;
  align-items: center;
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  padding: ${theme.spacing[1]} ${theme.spacing[2]};
  border-radius: ${theme.borderRadius.full};
  color: ${props => props.active ? '#047857' : theme.colors.gray[600]};
  background-color: ${props => props.active ? '#D1FAE5' : theme.colors.gray[100]};
`;

const PaymentDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[2]};
`;

const PaymentInfo = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${theme.typography.fontSize.sm};
`;

const InfoLabel = styled.span`
  color: ${theme.colors.gray[600]};
`;

const InfoValue = styled.span`
  color: ${theme.colors.gray[900]};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const PaymentActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${theme.spacing[2]};
  margin-top: ${theme.spacing[3]};
  padding-top: ${theme.spacing[3]};
  border-top: 1px solid ${theme.colors.gray[200]};
`;

interface ActionButtonProps {
  active?: boolean;
}

const ActionButton = styled.button<ActionButtonProps>`
  background: none;
  border: none;
  padding: ${theme.spacing[2]};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.gray[600]};
  
  &:hover {
    background-color: ${theme.colors.gray[100]};
    color: ${theme.colors.gray[900]};
  }
  
  &.edit {
    color: ${theme.colors.primary[600]};
    &:hover {
      background-color: ${theme.colors.primary[50]};
    }
  }
  
  &.delete {
    color: #EF4444;
    &:hover {
      background-color: #FEE2E2;
    }
  }
  
  &.toggle {
    color: ${props => props.active ? '#047857' : theme.colors.gray[600]};
    &:hover {
      background-color: ${props => props.active ? '#D1FAE5' : theme.colors.gray[100]};
    }
  }
`;

// Modal components
const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: ${theme.spacing[4]};
`;

const ModalContent = styled(motion.div)`
  background-color: white;
  border-radius: ${theme.borderRadius.xl};
  box-shadow: ${theme.shadows.xl};
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  padding: ${theme.spacing[6]};
  
  /* Style for dark mode */
  .dark-mode & {
    background-color: rgba(26, 32, 44, 0.95);
    border: 1px solid rgba(124, 58, 237, 0.3);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(10px);
    color: white;
  }
`;

const ModalHeader = styled.div`
  margin-bottom: ${theme.spacing[4]};
`;

const ModalTitle = styled.h2`
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.gray[900]};
  margin-bottom: ${theme.spacing[1]};
  
  /* Style for dark mode */
  .dark-mode & {
    color: white;
    background: linear-gradient(90deg, white, #A4F0EF);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: 0.5px;
  }
`;

const ModalSubtitle = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray[600]};
  
  /* Style for dark mode */
  .dark-mode & {
    color: rgba(255, 255, 255, 0.7);
  }
`;

const FormGroup = styled.div`
  margin-bottom: ${theme.spacing[4]};
`;

const Label = styled.label`
  display: block;
  font-family: ${theme.typography.fontFamily.primary};
  font-weight: ${theme.typography.fontWeight.medium};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray[800]};
  margin-bottom: ${theme.spacing[2]};
  
  /* Style for dark mode */
  .dark-mode & {
    color: rgba(255, 255, 255, 0.9);
  }
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
  
  /* Style for dark mode */
  .dark-mode & {
    background-color: rgba(17, 24, 39, 0.7);
    border-color: rgba(124, 58, 237, 0.3);
    color: white;
    
    &:focus {
      border-color: ${theme.colors.primary[300]};
      box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.2);
    }
    
    &::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }
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
  
  /* Style for dark mode */
  .dark-mode & {
    background-color: rgba(17, 24, 39, 0.7);
    border-color: rgba(124, 58, 237, 0.3);
    color: white;
    
    &:focus {
      border-color: ${theme.colors.primary[300]};
      box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.2);
    }
    
    &::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }
  }
`;

const Select = styled.select`
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
  
  /* Style for dark mode */
  .dark-mode & {
    background-color: rgba(17, 24, 39, 0.7);
    border-color: rgba(124, 58, 237, 0.3);
    color: white;
    
    &:focus {
      border-color: ${theme.colors.primary[300]};
      box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.2);
    }
    
    option {
      background-color: #1a202c;
    }
  }
`;

const RadioGroup = styled.div`
  display: flex;
  gap: ${theme.spacing[3]};
  margin-top: ${theme.spacing[1]};
`;

const RadioButton = styled.label<{ selected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${props => props.selected ? theme.colors.primary[500] : theme.colors.gray[300]};
  background-color: ${props => props.selected ? theme.colors.primary[50] : 'white'};
  color: ${props => props.selected ? theme.colors.primary[700] : theme.colors.gray[700]};
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  flex: 1;
  text-align: center;
  
  &:hover {
    border-color: ${theme.colors.primary[400]};
    background-color: ${props => props.selected ? theme.colors.primary[50] : 'rgba(124, 58, 237, 0.05)'};
  }
`;

const ModalButtonGroup = styled.div`
  display: flex;
  gap: ${theme.spacing[3]};
  margin-top: ${theme.spacing[6]};
`;

const ModalButton = styled.button<{ primary?: boolean }>`
  flex: 1;
  padding: ${theme.spacing[3]};
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.medium};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  ${props => props.primary ? `
    background: linear-gradient(135deg, ${theme.colors.primary[600]}, ${theme.colors.primary[800]});
    color: white;
    border: none;
    
    &:hover {
      opacity: 0.9;
    }
  ` : `
    background-color: white;
    color: ${theme.colors.gray[700]};
    border: 1px solid ${theme.colors.gray[300]};
    
    &:hover {
      background-color: ${theme.colors.gray[100]};
    }
  `}
`;

// Component
const RecurringPaymentsScreen: React.FC<RecurringPaymentsScreenProps> = ({ 
  onBack, 
  balance, 
  onSubmit, 
  initialRecipient = '',
  initialAmount = '',
  initialFrequency = 'weekly'
}) => {
  const [payments, setPayments] = useState<RecurringPayment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<RecurringPayment | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [recipientType, setRecipientType] = useState<'phone' | 'address'>(
    initialRecipient && initialRecipient.startsWith('+') ? 'phone' : 'address'
  );
  const [recipient, setRecipient] = useState(initialRecipient);
  const [amount, setAmount] = useState(initialAmount);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>(initialFrequency);
  const [nextPaymentDate, setNextPaymentDate] = useState('');
  const [memo, setMemo] = useState('');
  
  // Load payments on mount and open modal if we have initial data
  useEffect(() => {
    console.log("RecurringPaymentsScreen mounted with initial data:", { 
      initialRecipient, 
      initialAmount, 
      initialFrequency 
    });
    
    setPayments(getAllRecurringPayments());
    
    // If we have initial data from voice command, open the modal automatically
    if (initialRecipient || initialAmount) {
      // Set a name based on recipient
      const autoName = initialRecipient && initialRecipient.startsWith('+') 
        ? `Payment to ${initialRecipient}` 
        : initialRecipient
          ? `Payment to Stellar Account`
          : `New Recurring Payment`;
      
      setName(autoName);
      
      // Set default next payment date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setNextPaymentDate(tomorrow.toISOString().split('T')[0]);
      
      // Open the modal
      setTimeout(() => {
        setIsModalOpen(true);
      }, 500);
    }
  }, [initialRecipient, initialAmount, initialFrequency]);
  
  // Open the modal for adding a new payment
  const handleAddPayment = () => {
    // Reset form
    setEditingPayment(null);
    setName('');
    setRecipientType('phone');
    setRecipient('');
    setAmount('');
    setFrequency('weekly');
    
    // Set default next payment date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setNextPaymentDate(tomorrow.toISOString().split('T')[0]);
    
    setMemo('');
    setIsModalOpen(true);
  };
  
  // Open the modal for editing an existing payment
  const handleEditPayment = (payment: RecurringPayment) => {
    setEditingPayment(payment);
    setName(payment.name);
    setRecipientType(payment.recipientType);
    setRecipient(payment.recipient);
    setAmount(payment.amount);
    setFrequency(payment.frequency);
    setNextPaymentDate(new Date(payment.nextPaymentDate).toISOString().split('T')[0]);
    setMemo(payment.memo || '');
    setIsModalOpen(true);
  };
  
  // Handle deletion of a payment
  const handleDeletePayment = (id: string) => {
    if (window.confirm('Are you sure you want to delete this recurring payment?')) {
      const success = deleteRecurringPayment(id);
      if (success) {
        setPayments(getAllRecurringPayments());
        toast.success('Recurring payment deleted');
      }
    }
  };
  
  // Toggle a payment's active status
  const handleToggleStatus = (id: string) => {
    const updatedPayment = toggleRecurringPaymentStatus(id);
    if (updatedPayment) {
      setPayments(getAllRecurringPayments());
      toast.success(`Payment ${updatedPayment.active ? 'activated' : 'paused'}`);
    }
  };
  
  // Submit the form for adding or editing a payment
  const handleSubmitForm = () => {
    if (!name || !recipient || !amount || !nextPaymentDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Validate recipient based on type
    if (recipientType === 'phone' && !validatePhoneNumber(recipient)) {
      toast.error('Please enter a valid phone number');
      return;
    }
    
    if (recipientType === 'address' && !/^G[A-Z0-9]{55}$/.test(recipient.trim())) {
      toast.error('Please enter a valid Stellar address');
      return;
    }
    
    // Create or update the payment
    if (editingPayment) {
      // Update existing payment
      const formattedAmount = amount.startsWith('$') ? amount : `$${amount}`;
      const updated = updateRecurringPayment(editingPayment.id, {
        name,
        recipientType,
        recipient,
        amount: formattedAmount,
        frequency,
        nextPaymentDate: new Date(nextPaymentDate).toISOString(),
        memo: memo || undefined
      });
      
      if (updated) {
        setPayments(getAllRecurringPayments());
        toast.success('Recurring payment updated');
      }
    } else {
      // Create new payment
      const formattedAmount = amount.startsWith('$') ? amount : `$${amount}`;
      const newPayment = createRecurringPayment({
        recipientType,
        recipient,
        amount: formattedAmount,
        frequency,
        nextPaymentDate: new Date(nextPaymentDate).toISOString(),
        name,
        memo: memo || undefined
      });
      
      setPayments(getAllRecurringPayments());
      toast.success('Recurring payment created');
      
      // Send a confirmation SMS if the recipient is a phone number
      if (recipientType === 'phone' && validatePhoneNumber(recipient)) {
        // Format frequency for the SMS
        const formattedFrequency = frequency === 'daily' ? 'daily' : 
                                  frequency === 'weekly' ? 'every week' : 'every month';
                                  
        // Send confirmation to recipient
        sendRecurringPaymentConfirmation(
          recipient,
          amount,
          formattedFrequency
        ).then(() => {
          toast.success('Confirmation SMS sent to recipient');
        }).catch(error => {
          console.error('Failed to send confirmation SMS:', error);
          // Don't block the payment creation even if SMS fails
        });
      }
      
      // Call the onSubmit callback to notify the parent component
      onSubmit(recipient, amount, memo, frequency.toString());
    }
    
    setIsModalOpen(false);
  };
  
  // Format frequency for display
  const formatFrequency = (freq: string): string => {
    switch (freq) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      default: return freq;
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Use state to track dark mode
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Check for dark mode when component mounts (client-side only)
  useEffect(() => {
    // Safely check for dark mode on document after component mounts
    const isDarkModeActive = document.documentElement.classList.contains('dark-mode');
    setIsDarkMode(isDarkModeActive);
    
    // Setup observer for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDarkModeNow = document.documentElement.classList.contains('dark-mode');
          setIsDarkMode(isDarkModeNow);
        }
      });
    });
    
    // Start observing document for class changes
    observer.observe(document.documentElement, { attributes: true });
    
    // Cleanup
    return () => observer.disconnect();
  }, []);
  
  // Add dark-mode class to container when dark mode is active
  useEffect(() => {
    const container = document.querySelector('.container-recurring');
    if (container) {
      if (isDarkMode) {
        container.classList.add('dark-mode');
      } else {
        container.classList.remove('dark-mode');
      }
    }
  }, [isDarkMode]);
  
  return (
    <Container className="container-recurring">
      <Header>
        <BackButton onClick={onBack}>
          <FiArrowLeft size={24} />
        </BackButton>
        <Title>Recurring Payments</Title>
      </Header>
      
      {payments.length === 0 ? (
        <EmptyState>
          <EmptyIcon>
            <FiRepeat />
          </EmptyIcon>
          <EmptyText>No recurring payments yet</EmptyText>
          <EmptySubtext>
            Set up recurring payments to automatically send funds on a schedule.
          </EmptySubtext>
        </EmptyState>
      ) : (
        <PaymentsList>
          {payments.map(payment => (
            <PaymentCard 
              key={payment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PaymentHeader>
                <PaymentTitle>{payment.name}</PaymentTitle>
                <PaymentStatus active={payment.active}>
                  {payment.active ? 'Active' : 'Paused'}
                </PaymentStatus>
              </PaymentHeader>
              
              <PaymentDetails>
                <PaymentInfo>
                  <InfoLabel>To:</InfoLabel>
                  <InfoValue>
                    {payment.recipientType === 'phone' 
                      ? payment.recipient 
                      : `${payment.recipient.substring(0, 6)}...${payment.recipient.substring(payment.recipient.length - 4)}`}
                  </InfoValue>
                </PaymentInfo>
                
                <PaymentInfo>
                  <InfoLabel>Amount:</InfoLabel>
                  <InfoValue>
                    {payment.amount.startsWith('$') ? payment.amount : `$${payment.amount}`}
                  </InfoValue>
                </PaymentInfo>
                
                <PaymentInfo>
                  <InfoLabel>Frequency:</InfoLabel>
                  <InfoValue>{formatFrequency(payment.frequency)}</InfoValue>
                </PaymentInfo>
                
                <PaymentInfo>
                  <InfoLabel>Next payment:</InfoLabel>
                  <InfoValue>{formatDate(payment.nextPaymentDate)}</InfoValue>
                </PaymentInfo>
                
                {payment.memo && (
                  <PaymentInfo>
                    <InfoLabel>Memo:</InfoLabel>
                    <InfoValue>{payment.memo}</InfoValue>
                  </PaymentInfo>
                )}
              </PaymentDetails>
              
              <PaymentActions>
                <ActionButton 
                  className="toggle"
                  title={payment.active ? 'Pause' : 'Activate'}
                  onClick={() => handleToggleStatus(payment.id)}
                  active={payment.active}
                >
                  {payment.active ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}
                </ActionButton>
                
                <ActionButton 
                  className="edit"
                  title="Edit"
                  onClick={() => handleEditPayment(payment)}
                >
                  <FiEdit2 size={18} />
                </ActionButton>
                
                <ActionButton 
                  className="delete"
                  title="Delete"
                  onClick={() => handleDeletePayment(payment.id)}
                >
                  <FiTrash2 size={18} />
                </ActionButton>
              </PaymentActions>
            </PaymentCard>
          ))}
        </PaymentsList>
      )}
      
      <AddButton
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleAddPayment}
      >
        <FiPlus size={24} />
      </AddButton>
      
      {/* Add/Edit Payment Modal */}
      {isModalOpen && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <ModalContent
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ModalHeader>
              <ModalTitle>{editingPayment ? 'Edit Payment' : 'New Recurring Payment'}</ModalTitle>
              <ModalSubtitle>
                {editingPayment 
                  ? 'Update your recurring payment details' 
                  : 'Set up a new automatic recurring payment'}
              </ModalSubtitle>
            </ModalHeader>
            
            <FormGroup>
              <Label htmlFor="name">Payment Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., Rent Payment, Weekly Allowance"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Recipient Type</Label>
              <RadioGroup>
                <RadioButton 
                  selected={recipientType === 'phone'}
                  onClick={() => setRecipientType('phone')}
                >
                  Phone Number
                </RadioButton>
                <RadioButton 
                  selected={recipientType === 'address'}
                  onClick={() => setRecipientType('address')}
                >
                  Stellar Address
                </RadioButton>
              </RadioGroup>
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="recipient">
                {recipientType === 'phone' ? 'Phone Number' : 'Stellar Address'}
              </Label>
              <Input
                id="recipient"
                type={recipientType === 'phone' ? 'tel' : 'text'}
                placeholder={recipientType === 'phone' ? '+1 (555) 123-4567' : 'G...'}
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="amount">Amount (USD)</Label>
              <Input
                id="amount"
                type="text"
                placeholder="0.00"
                value={amount.startsWith('$') ? amount : amount ? `$${amount}` : ''}
                onChange={(e) => {
                  // Remove $ if present and handle formatting
                  let value = e.target.value;
                  if (value.startsWith('$')) {
                    value = value.substring(1);
                  }
                  // Only allow numeric input with up to 2 decimal places
                  if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
                    setAmount(value);
                  }
                }}
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="frequency">Payment Frequency</Label>
              <Select
                id="frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as 'daily' | 'weekly' | 'monthly')}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </Select>
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="nextPaymentDate">Next Payment Date</Label>
              <Input
                id="nextPaymentDate"
                type="date"
                value={nextPaymentDate}
                onChange={(e) => setNextPaymentDate(e.target.value)}
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="memo">Memo (Optional)</Label>
              <Textarea
                id="memo"
                placeholder="Add a note or description..."
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
            </FormGroup>
            
            <ModalButtonGroup>
              <ModalButton onClick={() => setIsModalOpen(false)}>
                Cancel
              </ModalButton>
              <ModalButton primary onClick={handleSubmitForm}>
                {editingPayment ? (
                  <>
                    <FiCheck size={18} style={{ marginRight: '8px' }} />
                    Update Payment
                  </>
                ) : (
                  <>
                    <FiPlus size={18} style={{ marginRight: '8px' }} />
                    Create Payment
                  </>
                )}
              </ModalButton>
            </ModalButtonGroup>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default RecurringPaymentsScreen;