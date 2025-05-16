import React, { useState } from 'react';
import styled from 'styled-components';
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
  padding: 20px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const BackButton = styled.button`
  background: transparent;
  border: none;
  color: #7C3AED;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  margin-right: 10px;
  
  &:hover {
    background: #f5f5f5;
  }
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const FilterSection = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  
  &:hover {
    background: #f9f9f9;
  }
`;

const TransactionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  flex: 1;
`;

const TransactionItem = styled.div`
  display: flex;
  padding: 15px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  align-items: center;
  cursor: pointer;
  border: 1px solid #f0f0f0;
  
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const IconContainer = styled.div<{ type: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  
  ${({ type }) => {
    if (type === 'deposit' || type === 'transfer_in') {
      return `
        background: rgba(16, 185, 129, 0.1);
        color: #10B981;
      `;
    } else {
      return `
        background: rgba(245, 158, 11, 0.1);
        color: #F59E0B;
      `;
    }
  }}
`;

const TransactionDetails = styled.div`
  flex: 1;
`;

const TransactionType = styled.div`
  font-weight: 500;
  color: #333;
  font-size: 16px;
`;

const TransactionAddress = styled.div`
  color: #888;
  font-size: 14px;
`;

const TransactionAmount = styled.div<{ type: string }>`
  font-weight: 600;
  font-size: 16px;
  color: ${({ type }) => 
    type === 'deposit' || type === 'transfer_in' 
      ? '#10B981' 
      : '#F59E0B'
  };
`;

const TransactionDate = styled.div`
  font-size: 12px;
  color: #aaa;
  text-align: right;
  margin-top: 5px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
  color: #888;
  
  svg {
    margin-bottom: 15px;
    opacity: 0.5;
  }
`;

const SimplifiedHistoryScreen: React.FC<HistoryScreenProps> = ({ onBack }) => {
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
          filteredTransactions.map((tx) => (
            <TransactionItem key={tx.id}>
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

export default SimplifiedHistoryScreen;