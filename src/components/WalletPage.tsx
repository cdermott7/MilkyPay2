import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiArrowUp, FiArrowDown, FiPlus, FiClock, FiCheck, FiFileText, FiRefreshCw } from 'react-icons/fi';
import theme from '../styles/theme';
import { useWallet } from '../hooks/useWallet';
import { useParams, useNavigate } from 'react-router-dom';

interface TransactionItem {
  id: string;
  type: 'in' | 'out';
  amount: string;
  description: string;
  date: string;
  status: 'completed' | 'pending';
}

// Styled components
const Container = styled.div`
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  padding: ${theme.spacing[4]};
  min-height: 100vh;
  background: linear-gradient(135deg, #0F172A, #1E293B);
  color: white;
`;

const Header = styled.div`
  padding: ${theme.spacing[4]} 0;
  margin-bottom: ${theme.spacing[4]};
`;

const Title = styled.h1`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  margin-bottom: ${theme.spacing[1]};
`;

const Subtitle = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray[400]};
`;

const Card = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px);
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing[5]};
  margin-bottom: ${theme.spacing[4]};
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const BalanceCard = styled(Card)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const BalanceTitle = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray[400]};
  margin-bottom: ${theme.spacing[2]};
`;

const Balance = styled.div`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  margin-bottom: ${theme.spacing[2]};
`;

const Address = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.gray[400]};
  background: rgba(255, 255, 255, 0.05);
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  border-radius: ${theme.borderRadius.md};
  margin-top: ${theme.spacing[2]};
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
`;

const ActionButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${theme.spacing[4]};
  margin-top: ${theme.spacing[4]};
`;

const ActionButton = styled.button`
  background: ${theme.colors.primary[600]};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.medium};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing[2]};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${theme.colors.primary[700]};
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const TransactionsCard = styled(Card)`
  margin-top: ${theme.spacing[6]};
`;

const TransactionsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing[4]};
`;

const TransactionsTitle = styled.h2`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
`;

const RefreshButton = styled.button`
  background: transparent;
  border: none;
  color: ${theme.colors.primary[400]};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing[1]};
  border-radius: ${theme.borderRadius.full};
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const TransactionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[3]};
`;

const Transaction = styled.div`
  display: flex;
  align-items: center;
  padding: ${theme.spacing[3]};
  border-radius: ${theme.borderRadius.lg};
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.07);
  }
`;

const TransactionIcon = styled.div<{ type: 'in' | 'out'; status: 'completed' | 'pending' }>`
  width: 40px;
  height: 40px;
  border-radius: ${theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: ${theme.spacing[3]};
  flex-shrink: 0;
  
  ${props => {
    if (props.status === 'pending') {
      return `
        background-color: ${theme.colors.gray[700]};
        color: ${theme.colors.gray[300]};
      `;
    } else if (props.type === 'in') {
      return `
        background-color: #10B981;
        color: #D1FAE5;
      `;
    } else {
      return `
        background-color: #3B82F6;
        color: #DBEAFE;
      `;
    }
  }}
`;

const TransactionInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const TransactionTitle = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TransactionDate = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.gray[400]};
  margin-top: ${theme.spacing[1]};
`;

const TransactionAmount = styled.div<{ type: 'in' | 'out' }>`
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${props => props.type === 'in' ? '#10B981' : '#3B82F6'};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing[6]};
  text-align: center;
  color: ${theme.colors.gray[400]};
`;

const EmptyStateIcon = styled.div`
  font-size: ${theme.typography.fontSize['3xl']};
  margin-bottom: ${theme.spacing[4]};
  color: ${theme.colors.gray[500]};
`;

const EmptyStateText = styled.div`
  font-size: ${theme.typography.fontSize.md};
  max-width: 240px;
  margin: 0 auto;
`;

const NoticeCard = styled(Card)`
  border-left: 4px solid ${theme.colors.primary[500]};
  margin-top: ${theme.spacing[6]};
  padding: ${theme.spacing[4]};
`;

const NoticeTitle = styled.h3`
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.semibold};
  margin-bottom: ${theme.spacing[2]};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  color: white;
`;

const NoticeText = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray[300]};
  line-height: 1.5;
`;

// Component
const WalletPage: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { wallet, balance, refreshBalance } = useWallet();
  const queryParams = new URLSearchParams(window.location.search);
  const claimId = queryParams.get('claimed');
  const navigate = useNavigate();
  
  // Mock data for the demo
  useEffect(() => {
    setTimeout(() => {
      // If we have a claimId, create a transaction for it
      if (claimId) {
        const newTransactions = [
          {
            id: `tx-${Date.now()}`,
            type: 'in' as const,
            amount: '50.00',
            description: 'Received from phone transfer',
            date: new Date().toLocaleDateString(),
            status: 'completed' as const
          },
          {
            id: 'tx-random-1',
            type: 'out' as const,
            amount: '25.00',
            description: 'Sent to G3X5...9J7K',
            date: '3 days ago',
            status: 'completed' as const
          },
          {
            id: 'tx-random-2',
            type: 'in' as const,
            amount: '100.00',
            description: 'Received from G7Z9...1H4F',
            date: '1 week ago',
            status: 'completed' as const
          }
        ];
        setTransactions(newTransactions);
      } else {
        // Default transactions
        setTransactions([
          {
            id: 'tx-random-1',
            type: 'out' as const,
            amount: '25.00',
            description: 'Sent to G3X5...9J7K',
            date: '3 days ago',
            status: 'completed' as const
          },
          {
            id: 'tx-random-2',
            type: 'in' as const,
            amount: '100.00',
            description: 'Received from G7Z9...1H4F',
            date: '1 week ago',
            status: 'completed' as const
          }
        ]);
      }
      setIsLoading(false);
    }, 1000);
  }, [claimId]);
  
  // Handle send button click
  const handleSend = () => {
    navigate('/transfer');
  };
  
  // Handle receive button click
  const handleReceive = () => {
    navigate('/receive');
  };
  
  // Handle refresh
  const handleRefresh = () => {
    setIsLoading(true);
    refreshBalance();
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };
  
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
        stiffness: 300,
        damping: 25
      }
    }
  };
  
  return (
    <Container>
      <Header>
        <Title>Your Wallet</Title>
        <Subtitle>Manage your funds and transactions</Subtitle>
      </Header>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <BalanceCard variants={itemVariants}>
          <BalanceTitle>Available Balance</BalanceTitle>
          
          <Balance>
            {isLoading 
              ? <FiRefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} /> 
              : `${balance || '550.00'} XLM`
            }
          </Balance>
          
          <Address>
            {wallet?.publicKey || 'G3B7V9EXCGFDKLSUHK6EKPBZ4GWD25XUKM7IKEL5N6RHWL3NB3LVSOT2'}
          </Address>
          
          <ActionButtons>
            <ActionButton onClick={handleSend}>
              <FiArrowUp size={18} />
              Send
            </ActionButton>
            <ActionButton onClick={handleReceive}>
              <FiArrowDown size={18} />
              Receive
            </ActionButton>
          </ActionButtons>
        </BalanceCard>
        
        <TransactionsCard variants={itemVariants}>
          <TransactionsHeader>
            <TransactionsTitle>Transactions</TransactionsTitle>
            <RefreshButton onClick={handleRefresh}>
              <FiRefreshCw size={18} />
            </RefreshButton>
          </TransactionsHeader>
          
          {isLoading ? (
            <div style={{ padding: theme.spacing[4], textAlign: 'center' }}>
              <FiRefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : transactions.length > 0 ? (
            <TransactionsList>
              {transactions.map(tx => (
                <Transaction key={tx.id}>
                  <TransactionIcon type={tx.type} status={tx.status}>
                    {tx.status === 'pending' ? <FiClock /> : tx.type === 'in' ? <FiArrowDown /> : <FiArrowUp />}
                  </TransactionIcon>
                  
                  <TransactionInfo>
                    <TransactionTitle>{tx.description}</TransactionTitle>
                    <TransactionDate>{tx.date}</TransactionDate>
                  </TransactionInfo>
                  
                  <TransactionAmount type={tx.type}>
                    {tx.type === 'in' ? '+' : '−'}{tx.amount} XLM
                  </TransactionAmount>
                </Transaction>
              ))}
            </TransactionsList>
          ) : (
            <EmptyState>
              <EmptyStateIcon>
                <FiFileText />
              </EmptyStateIcon>
              <EmptyStateText>
                No transactions yet. Start sending or receiving XLM to see your transaction history.
              </EmptyStateText>
            </EmptyState>
          )}
        </TransactionsCard>
        
        {claimId && (
          <NoticeCard 
            variants={itemVariants}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <NoticeTitle>
              <FiCheck size={18} color="#10B981" />
              Funds Claimed Successfully
            </NoticeTitle>
            <NoticeText>
              The funds from your claimed link have been added to your wallet. 
              You can now use these funds to send to others or withdraw to your bank account.
            </NoticeText>
          </NoticeCard>
        )}
      </motion.div>
    </Container>
  );
};

export default WalletPage;