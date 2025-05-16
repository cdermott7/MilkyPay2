import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMicrophone } from 'react-icons/hi';
import { FaRocket, FaSatelliteDish, FaSpaceShuttle } from 'react-icons/fa';
import { FiX } from 'react-icons/fi';
import ChatWidget from './ChatWidget';
import theme from '../styles/theme';

interface FloatingChatButtonProps {
  walletBalance: string;
  walletAddress: string;
  onSendMoney: (amount: string, recipient: string) => Promise<void>;
}

const ButtonContainer = styled(motion.div)`
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 1000;
`;

const ChatButton = styled(motion.button)`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2b2f77, #0d1033);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    z-index: -1;
    background: linear-gradient(45deg, #7C3AED, #2b2f77, #14B8B2, #7C3AED);
    background-size: 400%;
    border-radius: 50%;
    animation: glowBorder 3s linear infinite;
  }
  
  @keyframes glowBorder {
    0% { background-position: 0% 0%; }
    50% { background-position: 400% 0%; }
    100% { background-position: 0% 0%; }
  }
  color: white;
  border: none;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 24px;
`;

const ChatContainer = styled(motion.div)`
  position: fixed;
  bottom: 100px;
  right: 30px;
  width: 350px;
  height: 500px;
  background: rgba(13, 16, 51, 0.95);
  background-image: url('https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80');
  background-size: cover;
  background-blend-mode: overlay;
  backdrop-filter: blur(10px);
  border-radius: ${theme.borderRadius.xl};
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2), inset 0 0 30px rgba(124, 58, 237, 0.2);
  z-index: 1000;
  border: 1px solid rgba(124, 58, 237, 0.3);
`;

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  background: linear-gradient(90deg, #0d1033, #2b2f77);
  color: white;
  border-bottom: 1px solid rgba(124, 58, 237, 0.3);
`;

const ChatTitle = styled.h3`
  margin: 0;
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.semibold};
  display: flex;
  align-items: center;
  gap: 8px;
  
  svg {
    margin-right: 6px;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  border-radius: 50%;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const ChatContent = styled.div`
  height: calc(100% - 50px);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    background: radial-gradient(circle at right bottom, rgba(20, 184, 178, 0.1) 0%, transparent 60%);
  }
`;

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ 
  walletBalance, 
  walletAddress,
  onSendMoney
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => setIsOpen(!isOpen);

  return (
    <>
      <ButtonContainer 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
      >
        <ChatButton 
          onClick={toggleChat}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {isOpen ? <FiX size={24} /> : <FaRocket size={22} />}
        </ChatButton>
      </ButtonContainer>

      <AnimatePresence>
        {isOpen && (
          <ChatContainer 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <ChatHeader>
              <ChatTitle>
                <FaSatelliteDish size={16} color="#14B8B2" />
                MilkyPay AI Assistant
              </ChatTitle>
              <CloseButton onClick={toggleChat}>
                <FiX size={18} />
              </CloseButton>
            </ChatHeader>
            <ChatContent>
              <ChatWidget 
                walletBalance={walletBalance}
                walletAddress={walletAddress}
                onSendMoney={onSendMoney}
                fallbackVoiceInput={input => {
                  return new Promise(resolve => {
                    const message = prompt('Speech recognition unavailable. What would you like to say?') || '';
                    resolve(message);
                  });
                }}
              />
            </ChatContent>
          </ChatContainer>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingChatButton;