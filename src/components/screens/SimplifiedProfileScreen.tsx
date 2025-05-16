import React, { useState } from 'react';
import styled from 'styled-components';
import { FiArrowLeft, FiEdit2, FiCopy, FiCheckCircle, FiShield, FiLock, FiSmartphone, FiAlertCircle } from 'react-icons/fi';
import { FaUserAstronaut } from 'react-icons/fa';

interface ProfileScreenProps {
  walletAddress?: string;
  onBack: () => void;
}

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

const ProfileSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
`;

const Avatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #EDE9FE;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  position: relative;
  color: #7C3AED;
`;

const EditButton = styled.button`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: white;
  border: 2px solid #EDE9FE;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7C3AED;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background: #f9f9f9;
  }
`;

const UserName = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 5px;
`;

const WalletAddressContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 12px;
`;

const WalletAddress = styled.span`
  font-size: 14px;
  color: #666;
  font-family: monospace;
`;

const CopyButton = styled.button`
  background: transparent;
  border: none;
  color: #7C3AED;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  border-radius: 8px;
  
  &:hover {
    background: #f0f0f0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 500;
  color: #333;
  margin: 20px 0 15px;
  align-self: flex-start;
`;

const ProfileItemList = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 10px;
`;

const ProfileItem = styled.div`
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

const IconContainer = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #F5F3FF;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  color: #7C3AED;
`;

const ProfileItemDetails = styled.div`
  flex: 1;
`;

const ProfileItemTitle = styled.div`
  font-weight: 500;
  color: #333;
`;

const ProfileItemSubtitle = styled.div`
  font-size: 14px;
  color: #888;
`;

const StatusBadge = styled.div<{ status: 'verified' | 'pending' | 'required' }>`
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 999px;
  
  ${({ status }) => {
    if (status === 'verified') {
      return `
        background: rgba(16, 185, 129, 0.15);
        color: #10B981;
      `;
    } else if (status === 'pending') {
      return `
        background: rgba(245, 158, 11, 0.15);
        color: #F59E0B;
      `;
    } else {
      return `
        background: rgba(239, 68, 68, 0.15);
        color: #EF4444;
      `;
    }
  }}
`;

const SimplifiedProfileScreen: React.FC<ProfileScreenProps> = ({ 
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
          <ProfileItem key={index}>
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

export default SimplifiedProfileScreen;