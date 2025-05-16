import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-hot-toast';
import { FiCopy, FiRefreshCw, FiDownload, FiShield } from 'react-icons/fi';
import theme from '../styles/theme';
import Card, { CardHeader, CardContent, CardFooter, CardDivider } from './ui/Card';
import Button from './ui/Button';
import { useWallet } from '../hooks/useWallet';

// Types
interface WalletLoaderProps {
  onWalletReady?: (publicKey: string) => void;
  className?: string;
}

// Animations
const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(139, 92, 246, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(139, 92, 246, 0);
  }
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

// Styled Components
const WalletContainer = styled(Card)`
  max-width: 480px;
  width: 100%;
  animation: ${slideIn} 0.5s ease-out forwards;
`;

const WalletIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, ${theme.colors.primary[600]}, ${theme.colors.primary[800]});
  border-radius: ${theme.borderRadius.full};
  color: white;
  margin: 0 auto ${theme.spacing[4]};
  box-shadow: ${theme.shadows.md};
`;

const AddressContainer = styled.div`
  background-color: ${theme.colors.gray[50]};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.gray[200]};
  padding: ${theme.spacing[2]} ${theme.spacing[4]};
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${theme.spacing[4]};
`;

const Address = styled.code`
  font-family: 'Roboto Mono', monospace;
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray[700]};
  word-break: break-all;
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.primary[600]};
  cursor: pointer;
  padding: ${theme.spacing[1]};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${theme.borderRadius.full};
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${theme.colors.primary[50]};
    color: ${theme.colors.primary[800]};
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const BalanceCard = styled.div`
  background: linear-gradient(135deg, ${theme.colors.primary[700]}, ${theme.colors.primary[900]});
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing[4]} ${theme.spacing[6]};
  color: white;
  margin-bottom: ${theme.spacing[4]};
  position: relative;
  overflow: hidden;
  box-shadow: ${theme.shadows.lg};
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
    opacity: 0.8;
    transform: rotate(15deg);
  }
`;

const BalanceLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: ${theme.spacing[2]};
`;

const BalanceAmount = styled.div`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  font-family: ${theme.typography.fontFamily.primary};
  margin-bottom: ${theme.spacing[1]};
`;

const BalanceTicker = styled.span`
  font-size: ${theme.typography.fontSize.md};
  opacity: 0.8;
  margin-left: ${theme.spacing[2]};
`;

const BalanceInFiat = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: rgba(255, 255, 255, 0.7);
`;

const QRContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: ${theme.spacing[4]} 0;
`;

const StyledQRCode = styled(QRCodeSVG)`
  padding: ${theme.spacing[4]};
  background-color: white;
  border-radius: ${theme.borderRadius.md};
  box-shadow: ${theme.shadows.md};
  max-width: 180px;
  height: auto;
  
  &:hover {
    animation: ${pulse} 2s infinite;
  }
`;

const QRLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray[500]};
  margin-top: ${theme.spacing[2]};
`;

const InfoSection = styled.div`
  margin-bottom: ${theme.spacing[4]};
`;

const InfoTitle = styled.h3`
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.semibold};
  margin-bottom: ${theme.spacing[2]};
  color: ${theme.colors.gray[800]};
`;

const InfoText = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray[600]};
  margin-bottom: ${theme.spacing[2]};
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing[8]} 0;
`;

const LoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid ${theme.colors.primary[200]};
  border-top-color: ${theme.colors.primary[600]};
  border-radius: 50%;
  animation: ${rotate} 1s linear infinite;
  margin-bottom: ${theme.spacing[4]};
`;

const LoadingText = styled.div`
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.gray[700]};
  margin-bottom: ${theme.spacing[2]};
`;

const LoadingStatus = styled.div<{ isLoading: boolean }>`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray[500]};
  padding: ${theme.spacing[2]} ${theme.spacing[4]};
  border-radius: ${theme.borderRadius.full};
  background: linear-gradient(270deg, ${theme.colors.gray[100]}, ${theme.colors.gray[200]}, ${theme.colors.gray[100]});
  background-size: 200% 100%;
  animation: ${props => props.isLoading ? `${shimmer} 1.5s infinite` : 'none'};
`;

const BadgeContainer = styled.div`
  display: flex;
  gap: ${theme.spacing[2]};
  margin-bottom: ${theme.spacing[4]};
  flex-wrap: wrap;
`;

const Badge = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[1]};
  padding: ${theme.spacing[1]} ${theme.spacing[2]};
  border-radius: ${theme.borderRadius.full};
  background-color: ${theme.colors.primary[50]};
  color: ${theme.colors.primary[700]};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  border: 1px solid ${theme.colors.primary[100]};
`;

const BadgeIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

// Component Definition
const WalletLoader: React.FC<WalletLoaderProps> = ({ onWalletReady, className }) => {
  // Use our wallet hook
  const { 
    wallet, 
    balance, 
    isLoading, 
    loadingStatus, 
    error, 
    createWallet, 
    refreshBalance, 
    exportMnemonic 
  } = useWallet();

  // State for estimated fiat value (would come from an exchange rate API in production)
  const [fiatValue, setFiatValue] = useState<number | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Calculate fiat value when balance changes (mock implementation)
  useEffect(() => {
    if (balance) {
      // Mock exchange rate: 1 XLM = $0.15 USD
      const xlmValue = parseFloat(balance);
      setFiatValue(xlmValue * 0.15);
    }
  }, [balance]);

  // Notify parent component when wallet is ready
  useEffect(() => {
    if (wallet?.publicKey && onWalletReady) {
      onWalletReady(wallet.publicKey);
    }
  }, [wallet?.publicKey, onWalletReady]);

  // Handler for copying address to clipboard
  const copyToClipboard = () => {
    if (wallet?.publicKey) {
      navigator.clipboard.writeText(wallet.publicKey);
      setCopiedAddress(true);
      toast.success('Address copied to clipboard!');
      
      // Reset copy state after 2 seconds
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  // Handler for exporting wallet mnemonic
  const handleExportMnemonic = async () => {
    try {
      const mnemonic = await exportMnemonic();
      
      if (mnemonic) {
        // In a real app, you'd want to handle this more securely
        // For demo purposes, we just show a success toast
        toast.success('Mnemonic phrase exported. Keep it secure!');
        
        // Create a downloadable file with the mnemonic
        const blob = new Blob([mnemonic], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bridgebotpay-recovery-phrase.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      toast.error('Failed to export recovery phrase');
      console.error(err);
    }
  };

  // Handle wallet creation
  const handleCreateWallet = async () => {
    try {
      await createWallet();
      toast.success('Wallet created successfully!');
    } catch (err) {
      toast.error('Failed to create wallet');
      console.error(err);
    }
  };

  // Handle balance refresh
  const handleRefreshBalance = async () => {
    try {
      await refreshBalance();
      toast.success('Balance updated!');
    } catch (err) {
      toast.error('Failed to refresh balance');
      console.error(err);
    }
  };

  // If there's an error
  if (error) {
    return (
      <WalletContainer className={className}>
        <CardHeader title="Wallet Error" />
        <CardContent>
          <div>
            <p>There was an error with your wallet: {error}</p>
            <Button 
              variant="primary" 
              onClick={handleCreateWallet} 
              fullWidth
              style={{ marginTop: theme.spacing[4] }}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </WalletContainer>
    );
  }

  // If the wallet is still loading
  if (isLoading || !wallet) {
    return (
      <WalletContainer className={className}>
        <CardHeader title="Creating Your Wallet" />
        <CardContent>
          <LoadingContainer>
            <LoadingSpinner />
            <LoadingText>Setting up your secure wallet</LoadingText>
            <LoadingStatus isLoading={isLoading}>
              {loadingStatus || 'Initializing...'}
            </LoadingStatus>
          </LoadingContainer>
        </CardContent>
        <CardFooter>
          <Button 
            variant="outlined" 
            onClick={handleCreateWallet} 
            fullWidth
            leftIcon={<FiRefreshCw />}
          >
            Restart Process
          </Button>
        </CardFooter>
      </WalletContainer>
    );
  }

  // Wallet is loaded and ready
  return (
    <WalletContainer className={className}>
      <CardHeader 
        title="Your Stellar Wallet" 
        subtitle="Send money across borders instantly"
      />
      <CardContent>
        {/* Balance Card */}
        <BalanceCard>
          <BalanceLabel>AVAILABLE BALANCE</BalanceLabel>
          <BalanceAmount>
            {balance || '0'}<BalanceTicker>XLM</BalanceTicker>
          </BalanceAmount>
          {fiatValue !== null && (
            <BalanceInFiat>≈ ${fiatValue.toFixed(2)} USD</BalanceInFiat>
          )}
        </BalanceCard>
        
        {/* Wallet Address */}
        <InfoTitle>Wallet Address</InfoTitle>
        <AddressContainer>
          <Address>
            {wallet.publicKey.substring(0, 12)}...
            {wallet.publicKey.substring(wallet.publicKey.length - 6)}
          </Address>
          <CopyButton onClick={copyToClipboard}>
            <FiCopy size={20} />
          </CopyButton>
        </AddressContainer>
        
        {/* Feature Badges */}
        <BadgeContainer>
          <Badge>
            <BadgeIcon><FiShield size={12} /></BadgeIcon>
            Self-Custodial
          </Badge>
          <Badge>
            <BadgeIcon>🔒</BadgeIcon>
            Encrypted
          </Badge>
          <Badge>
            <BadgeIcon>💸</BadgeIcon>
            Low Fees
          </Badge>
          <Badge>
            <BadgeIcon>⚡</BadgeIcon>
            Instant Transfers
          </Badge>
        </BadgeContainer>
        
        {/* QR Code */}
        <QRContainer>
          <StyledQRCode 
            value={wallet.publicKey} 
            size={180}
            level="H"
            imageSettings={{
              src: "https://stellar.org/images/stellar-logo.png",
              height: 24,
              width: 24,
              excavate: true,
            }}
          />
          <QRLabel>Scan to send funds to this wallet</QRLabel>
        </QRContainer>
      </CardContent>
      
      <CardDivider />
      
      <CardFooter>
        <Button
          variant="outlined"
          leftIcon={<FiRefreshCw />}
          onClick={handleRefreshBalance}
        >
          Refresh Balance
        </Button>
        <Button
          variant="primary"
          leftIcon={<FiDownload />}
          onClick={handleExportMnemonic}
        >
          Backup Wallet
        </Button>
      </CardFooter>
    </WalletContainer>
  );
};

export default WalletLoader;