import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCopy, FiCheckCircle, FiActivity } from 'react-icons/fi';
import QRCode from 'qrcode.react';
import theme from '../../styles/theme';

interface DepositScreenProps {
  walletAddress: string;
  onBack: () => void;
}

// Styled components for the deposit screen
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

const StyledQRCode = styled.div`
  display: flex;
  justify-content: center;
  margin: ${theme.spacing[4]} 0;
`;

const QRContainer = styled.div`
  padding: ${theme.spacing[4]};
  background-color: white;
  border-radius: ${theme.borderRadius.md};
  box-shadow: ${theme.shadows.sm};
  border: 1px solid ${theme.colors.gray[200]};
`;

const InstructionTitle = styled.h3`
  font-weight: ${theme.typography.fontWeight.semibold};
  font-size: ${theme.typography.fontSize.lg};
  margin-bottom: ${theme.spacing[3]};
  color: ${theme.colors.gray[900]};
`;

const InstructionStep = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: ${theme.spacing[4]};
`;

const StepNumber = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: ${theme.borderRadius.full};
  background-color: ${theme.colors.primary[600]};
  color: white;
  font-weight: ${theme.typography.fontWeight.semibold};
  margin-right: ${theme.spacing[3]};
  flex-shrink: 0;
`;

const StepContent = styled.div`
  flex: 1;
`;

const StepTitle = styled.h4`
  font-weight: ${theme.typography.fontWeight.medium};
  font-size: ${theme.typography.fontSize.md};
  margin-bottom: ${theme.spacing[1]};
  color: ${theme.colors.gray[900]};
`;

const StepDescription = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray[600]};
  margin: 0;
`;

const AddressContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: ${theme.colors.gray[50]};
  border: 1px solid ${theme.colors.gray[200]};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing[3]};
  margin: ${theme.spacing[2]} 0 ${theme.spacing[4]} 0;
  font-family: monospace;
  font-size: ${theme.typography.fontSize.sm};
  position: relative;
  overflow: hidden;
`;

const Address = styled.div`
  flex: 1;
  word-break: break-all;
`;

const CopyButton = styled.button<{ copied: boolean }>`
  background: ${props => props.copied ? theme.colors.status.success : 'none'};
  color: ${props => props.copied ? 'white' : theme.colors.primary[600]};
  border: none;
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing[2]};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.copied ? theme.colors.status.success : theme.colors.primary[50]};
  }
`;

const InfoBanner = styled.div`
  display: flex;
  align-items: center;
  background-color: ${theme.colors.status.info}10;
  border-left: 4px solid ${theme.colors.status.info};
  padding: ${theme.spacing[3]};
  border-radius: ${theme.borderRadius.md};
  margin-top: ${theme.spacing[4]};
`;

const InfoIcon = styled.div`
  color: ${theme.colors.status.info};
  margin-right: ${theme.spacing[2]};
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
const DepositScreen: React.FC<DepositScreenProps> = ({ walletAddress, onBack }) => {
  const [copied, setCopied] = useState(false);
  
  // Format wallet address for display
  const formatAddress = (address: string) => {
    if (!address) return '...';
    if (address.length <= 16) return address;
    return `${address.substring(0, 8)}...${address.substring(address.length - 8)}`;
  };
  
  // Handle address copy
  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <Container>
      <Header>
        <BackButton onClick={onBack}>
          <FiArrowLeft size={24} />
        </BackButton>
        <Title>Deposit Funds</Title>
      </Header>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Card variants={itemVariants}>
          <InstructionTitle>Your Deposit Address</InstructionTitle>
          
          <StyledQRCode>
            <QRContainer>
              <QRCode 
                value={walletAddress} 
                size={180} 
                level="H"
                renderAs="svg"
                includeMargin={true}
                // Remove imageSettings which has type errors
                // imageSettings={{
                //   src: 'https://stellarx.com/static/images/stellar.svg',
                //   x: null,
                //   y: null,
                //   height: 30,
                //   width: 30,
                //   excavate: true,
                // }}
              />
            </QRContainer>
          </StyledQRCode>
          
          <AddressContainer>
            <Address>{walletAddress}</Address>
            <CopyButton copied={copied} onClick={copyAddress}>
              {copied ? <FiCheckCircle size={18} /> : <FiCopy size={18} />}
            </CopyButton>
          </AddressContainer>
          
          <InfoBanner>
            <InfoIcon><FiActivity size={18} /></InfoIcon>
            <InfoText>
              Only send XLM or assets on the Stellar network to this address. Your funds will appear in your wallet once the transaction is confirmed.
            </InfoText>
          </InfoBanner>
        </Card>
        
        <Card variants={itemVariants}>
          <InstructionTitle>How to Deposit</InstructionTitle>
          
          <InstructionStep>
            <StepNumber>1</StepNumber>
            <StepContent>
              <StepTitle>Copy Your Address</StepTitle>
              <StepDescription>
                Copy your Stellar wallet address shown above or scan the QR code with your sending wallet.
              </StepDescription>
            </StepContent>
          </InstructionStep>
          
          <InstructionStep>
            <StepNumber>2</StepNumber>
            <StepContent>
              <StepTitle>Initiate Transfer</StepTitle>
              <StepDescription>
                From your sending wallet or exchange, initiate a transfer to the copied wallet address.
              </StepDescription>
            </StepContent>
          </InstructionStep>
          
          <InstructionStep>
            <StepNumber>3</StepNumber>
            <StepContent>
              <StepTitle>Wait for Confirmation</StepTitle>
              <StepDescription>
                Stellar transactions typically confirm within seconds. Your balance will update automatically.
              </StepDescription>
            </StepContent>
          </InstructionStep>
        </Card>
      </motion.div>
    </Container>
  );
};

export default DepositScreen;