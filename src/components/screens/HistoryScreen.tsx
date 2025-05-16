import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiChevronDown, FiArrowUp, FiArrowDown, FiSend, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';

interface HistoryScreenProps {
  onBack: () => void;
}

// Generate some mock transaction data
const generateMockTransactions = () => {
  const types = ['deposit', 'withdraw', 'transfer_in', 'transfer_out'];
  const transactions = [];
  
  // Generate transactions for the past 30 days
  for (let i = 0; i < 15; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const amount = (Math.random() * 1000).toFixed(2);
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    let label, address;
    if (type === 'deposit') {
      label = 'Deposit';
      address = `G${Math.random().toString(36).substring(2, 12)}...`;
    } else if (type === 'withdraw') {
      label = 'Withdraw';
      address = `G${Math.random().toString(36).substring(2, 12)}...`;
    } else if (type === 'transfer_in') {
      label = 'Received from';
      address = `+1${Math.floor(Math.random() * 1000)}${Math.floor(Math.random() * 1000)}${Math.floor(Math.random() * 1000)}${Math.floor(Math.random() * 1000)}`;
    } else {
      label = 'Sent to';
      address = `+1${Math.floor(Math.random() * 1000)}${Math.floor(Math.random() * 1000)}${Math.floor(Math.random() * 1000)}${Math.floor(Math.random() * 1000)}`;
    }
    
    transactions.push({
      id: i.toString(),
      type,
      label,
      amount: parseFloat(amount),
      date,
      address,
      status: 'completed',
    });
  }
  
  // Sort by date (newest first)
  return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
};

const Container = styled.div`
  padding: ${props => props.theme.spacing[4]};
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: ${props => props.theme.colors.background.primary};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const BackButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.primary[500]};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: ${props => props.theme.borderRadius.full};
  cursor: pointer;
  margin-right: ${props => props.theme.spacing[2]};
  
  &:hover {
    background: ${props => props.theme.colors.gray[100]};
  }
`;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.gray[900]};
  margin: 0;
`;

const FilterSection = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.white};
  border: 1px solid ${props => props.theme.colors.gray[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.gray[700]};
  cursor: pointer;
  
  &:hover {
    background: ${props => props.theme.colors.gray[50]};
  }
`;

const TransactionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
  overflow-y: auto;
  flex: 1;
`;

const TransactionItem = styled(motion.div)`
  display: flex;
  padding: ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  align-items: center;
  cursor: pointer;
  
  &:hover {
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const IconContainer = styled.div<{ type: string }>`
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: ${props => props.theme.spacing[3]};
  
  ${({ type, theme }) => {
    if (type === 'deposit' || type === 'transfer_in') {
      return `
        background: ${theme.colors.status.success}10;
        color: ${theme.colors.status.success};
      `;
    } else {
      return `
        background: ${theme.colors.status.warning}10;
        color: ${theme.colors.status.warning};
      `;
    }
  }}
`;

const TransactionDetails = styled.div`
  flex: 1;
`;

const TransactionType = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.gray[900]};
  font-size: ${props => props.theme.typography.fontSize.md};
`;

const TransactionAddress = styled.div`
  color: ${props => props.theme.colors.gray[500]};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const TransactionAmount = styled.div<{ type: string }>`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  font-size: ${props => props.theme.typography.fontSize.md};
  color: ${({ type, theme }) => 
    type === 'deposit' || type === 'transfer_in' 
      ? theme.colors.status.success 
      : theme.colors.status.warning
  };
`;

const TransactionDate = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.gray[400]};
  text-align: right;
  margin-top: ${props => props.theme.spacing[1]};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing[8]};
  text-align: center;
  color: ${props => props.theme.colors.gray[500]};
  
  svg {
    margin-bottom: ${props => props.theme.spacing[3]};
    opacity: 0.5;
  }
`;

const HistoryScreen: React.FC<HistoryScreenProps> = ({ onBack }) => {
  const [filter, setFilter] = useState('all');
  const transactions = generateMockTransactions();
  
  // Filter transactions based on current filter
  const filteredTransactions = filter === 'all' 
    ? transactions 
    : transactions.filter(tx => 
        filter === 'incoming' 
          ? (tx.type === 'deposit' || tx.type === 'transfer_in')
          : (tx.type === 'withdraw' || tx.type === 'transfer_out')
      );
  
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <FiArrowDown size={20} />;
      case 'withdraw':
        return <FiArrowUp size={20} />;
      case 'transfer_in':
        return <FiArrowDown size={20} />;
      case 'transfer_out':
        return <FiSend size={20} />;
      default:
        return <FiClock size={20} />;
    }
  };
  
  return (
    <Container>
      <Header>
        <BackButton onClick={onBack}>
          <FiArrowLeft size={20} />
        </BackButton>
        <Title>Transaction History</Title>
      </Header>
      
      <FilterSection>
        <FilterButton onClick={() => setFilter('all')}>
          All
          <FiChevronDown size={16} />
        </FilterButton>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <FilterButton onClick={() => setFilter('incoming')}>
            Incoming
          </FilterButton>
          <FilterButton onClick={() => setFilter('outgoing')}>
            Outgoing
          </FilterButton>
        </div>
      </FilterSection>
      
      <TransactionsList>
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((tx, index) => (
            <TransactionItem 
              key={tx.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <IconContainer type={tx.type}>
                {getTransactionIcon(tx.type)}
              </IconContainer>
              <TransactionDetails>
                <TransactionType>{tx.label}</TransactionType>
                <TransactionAddress>{tx.address}</TransactionAddress>
              </TransactionDetails>
              <div>
                <TransactionAmount type={tx.type}>
                  {(tx.type === 'deposit' || tx.type === 'transfer_in') ? '+' : '-'}
                  {tx.amount.toFixed(2)} XLM
                </TransactionAmount>
                <TransactionDate>
                  {format(tx.date, 'MMM d, yyyy')}
                </TransactionDate>
              </div>
            </TransactionItem>
          ))
        ) : (
          <EmptyState>
            <FiClock size={48} />
            <h3>No transactions</h3>
            <p>You haven't made any transactions yet</p>
          </EmptyState>
        )}
      </TransactionsList>
    </Container>
  );
};

export default HistoryScreen;