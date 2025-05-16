import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiEdit2, FiCopy, FiCheckCircle, FiShield, FiLock, FiSmartphone, FiAlertCircle } from 'react-icons/fi';
import { FaUserAstronaut } from 'react-icons/fa';

interface ProfileScreenProps {
  walletAddress?: string;
  onBack: () => void;
}

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

const ProfileSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const Avatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: ${props => props.theme.colors.primary[100]};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${props => props.theme.spacing[3]};
  position: relative;
  color: ${props => props.theme.colors.primary[600]};
`;

const EditButton = styled.button`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 32px;
  height: 32px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: ${props => props.theme.colors.white};
  border: 2px solid ${props => props.theme.colors.primary[100]};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.primary[500]};
  cursor: pointer;
  box-shadow: ${props => props.theme.shadows.sm};
  
  &:hover {
    background: ${props => props.theme.colors.gray[50]};
  }
`;

const UserName = styled.h2`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.gray[900]};
  margin: 0 0 ${props => props.theme.spacing[1]};
`;

const WalletAddressContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.gray[100]};
  border-radius: ${props => props.theme.borderRadius.lg};
`;

const WalletAddress = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.gray[700]};
  font-family: monospace;
`;

const CopyButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.primary[500]};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing[1]};
  border-radius: ${props => props.theme.borderRadius.md};
  
  &:hover {
    background: ${props => props.theme.colors.primary[50]};
  }
`;

const SectionTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.gray[900]};
  margin: ${props => props.theme.spacing[4]} 0 ${props => props.theme.spacing[3]};
  align-self: flex-start;
`;

const ProfileItemList = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: ${props => props.theme.spacing[2]};
`;

const ProfileItem = styled(motion.div)`
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

const IconContainer = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: ${props => props.theme.colors.primary[50]};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: ${props => props.theme.spacing[3]};
  color: ${props => props.theme.colors.primary[500]};
`;

const ProfileItemDetails = styled.div`
  flex: 1;
`;

const ProfileItemTitle = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.gray[900]};
`;

const ProfileItemSubtitle = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.gray[500]};
`;

const StatusBadge = styled.div<{ status: 'verified' | 'pending' | 'required' }>`
  font-size: ${props => props.theme.typography.fontSize.xs};
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  border-radius: ${props => props.theme.borderRadius.full};
  
  ${({ status, theme }) => {
    if (status === 'verified') {
      return `
        background: ${theme.colors.status.success}15;
        color: ${theme.colors.status.success};
      `;
    } else if (status === 'pending') {
      return `
        background: ${theme.colors.status.warning}15;
        color: ${theme.colors.status.warning};
      `;
    } else {
      return `
        background: ${theme.colors.status.error}15;
        color: ${theme.colors.status.error};
      `;
    }
  }}
`;

const ProfileScreen: React.FC<ProfileScreenProps> = ({ 
  walletAddress = 'GDKXJL2B4FSXP5XMOPAC6MESQDTHST3RM532JLZADJBGXX6UVAHEIST',
  onBack 
}) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Mock data for profile items
  const securityItems = [
    {
      icon: <FiShield size={20} />,
      title: 'Two-Factor Authentication',
      subtitle: 'Add an extra layer of security',
      status: 'required' as 'required'
    },
    {
      icon: <FiLock size={20} />,
      title: 'Recovery Phrase',
      subtitle: 'Backup your wallet',
      status: 'verified' as 'verified'
    },
    {
      icon: <FiSmartphone size={20} />,
      title: 'Phone Verification',
      subtitle: '+1 (415) 555-****',
      status: 'verified' as 'verified'
    }
  ];
  
  return (
    <Container>
      <Header>
        <BackButton onClick={onBack}>
          <FiArrowLeft size={20} />
        </BackButton>
        <Title>My Profile</Title>
      </Header>
      
      <ProfileSection>
        <Avatar>
          <FaUserAstronaut size={40} />
          <EditButton>
            <FiEdit2 size={16} />
          </EditButton>
        </Avatar>
        <UserName>Stellar Explorer</UserName>
        <WalletAddressContainer>
          <WalletAddress>
            {walletAddress.substring(0, 8)}...{walletAddress.substring(walletAddress.length - 8)}
          </WalletAddress>
          <CopyButton onClick={handleCopyAddress}>
            {copied ? <FiCheckCircle size={16} /> : <FiCopy size={16} />}
          </CopyButton>
        </WalletAddressContainer>
      </ProfileSection>
      
      <SectionTitle>Security & Verification</SectionTitle>
      <ProfileItemList>
        {securityItems.map((item, index) => (
          <ProfileItem 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <IconContainer>
              {item.icon}
            </IconContainer>
            <ProfileItemDetails>
              <ProfileItemTitle>{item.title}</ProfileItemTitle>
              <ProfileItemSubtitle>{item.subtitle}</ProfileItemSubtitle>
            </ProfileItemDetails>
            <StatusBadge status={item.status}>
              {item.status === 'verified' && 'Verified'}
              {item.status === 'required' && 'Required'}
            </StatusBadge>
          </ProfileItem>
        ))}
      </ProfileItemList>
    </Container>
  );
};

export default ProfileScreen;