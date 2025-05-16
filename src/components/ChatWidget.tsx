import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from '@react-spring/web';
// import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useSpeech } from '../hooks/useSpeech';
import { HiMicrophone, HiVolumeUp, HiPaperAirplane } from 'react-icons/hi';
import { RiSendPlaneFill } from 'react-icons/ri';
import { MdCancel } from 'react-icons/md';
import { FaRocket, FaSatellite } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import theme from '../styles/theme';
import Button from './ui/Button';
import Card, { CardContent } from './ui/Card';
import TextInput from './ui/TextInput';
import { useNLU } from '../hooks/useNLU';

// Types for our messages
interface ChatMessage {
  id: string;
  content: string;
  type: 'user' | 'assistant';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
  isAction?: boolean;
}

// Props type for the ChatWidget
interface ChatWidgetProps {
  onSendMoney?: (amount: string, recipient: string) => Promise<void>;
  onQueryHistory?: (query: string) => Promise<any>;
  onClaimFunds?: (code: string) => Promise<void>;
  onOffRamp?: (amount: string, method: string) => Promise<void>;
  onRefund?: (txId: string) => Promise<void>;
  walletBalance?: string;
  walletAddress?: string;
  className?: string;
  fallbackVoiceInput?: (currentInput: string) => Promise<string>;
}

// Animations
const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const waveAnimation = keyframes`
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
  100% {
    transform: translateY(0);
  }
`;

// Styled Components
const ChatContainer = styled(Card)`
  height: 500px;
  max-width: 480px;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(180deg, #0D1033 0%, #1E1B4B 100%);
  border: 1px solid rgba(124, 58, 237, 0.3);
  box-shadow: 0 0 20px rgba(124, 58, 237, 0.2);
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${theme.spacing[4]};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[3]};
  scroll-behavior: smooth;
  background-image: url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=1000');
  background-size: cover;
  background-position: center;
  background-blend-mode: overlay;
  background-color: rgba(13, 16, 51, 0.8);
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(13, 16, 51, 0.5);
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(124, 58, 237, 0.5);
    border-radius: ${theme.borderRadius.full};
  }
`;

const MessageBubble = styled(motion.div)<{ type: 'user' | 'assistant'; isAction?: boolean }>`
  max-width: 80%;
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border-radius: ${theme.borderRadius.xl};
  position: relative;
  line-height: 1.5;
  word-break: break-word;
  box-shadow: ${theme.shadows.sm};
  
  ${props => props.type === 'user' && css`
    align-self: flex-end;
    background: linear-gradient(135deg, ${theme.colors.primary[600]}, ${theme.colors.primary[800]});
    color: white;
    border-bottom-right-radius: ${theme.borderRadius.sm};
    box-shadow: 0 2px 10px rgba(124, 58, 237, 0.3);
    backdrop-filter: blur(4px);
  `}
  
  ${props => props.type === 'assistant' && css`
    align-self: flex-start;
    background: rgba(255, 255, 255, 0.1);
    background-image: linear-gradient(135deg, rgba(45, 214, 210, 0.2), rgba(20, 184, 178, 0.1));
    color: white;
    border-bottom-left-radius: ${theme.borderRadius.sm};
    box-shadow: 0 2px 15px rgba(45, 214, 210, 0.2);
    border: 1px solid rgba(45, 214, 210, 0.3);
    backdrop-filter: blur(4px);
  `}
  
  ${props => props.isAction && css`
    background-color: ${theme.colors.secondary[100]};
    border: 1px solid ${theme.colors.secondary[200]};
    color: ${theme.colors.secondary[800]};
  `}
`;

const MessageStatus = styled.div<{ status?: 'sending' | 'sent' | 'error' }>`
  font-size: ${theme.typography.fontSize.xs};
  margin-top: ${theme.spacing[1]};
  text-align: right;
  
  ${props => props.status === 'sending' && css`
    color: ${theme.colors.gray[400]};
  `}
  
  ${props => props.status === 'sent' && css`
    color: ${theme.colors.gray[400]};
  `}
  
  ${props => props.status === 'error' && css`
    color: ${theme.colors.status.error};
  `}
`;

const InputArea = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${theme.spacing[4]};
  border-top: 1px solid rgba(124, 58, 237, 0.3);
  background: linear-gradient(180deg, #1E1B4B 0%, #0D1033 100%);
`;

const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
`;

const TranscriptionPreview = styled.div`
  min-height: 24px;
  font-size: ${theme.typography.fontSize.sm};
  color: rgba(255, 255, 255, 0.7);
  font-style: italic;
  margin-bottom: ${theme.spacing[2]};
`;

const StyledTextInput = styled(TextInput)`
  margin-bottom: 0;
  flex: 1;
  
  input {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(124, 58, 237, 0.3);
    color: white;
    
    &::placeholder {
      color: rgba(255, 255, 255, 0.6);
    }
  }
  
  button {
    color: rgba(255, 255, 255, 0.7);
  }
`;

const MicButton = styled(Button)<{ isListening: boolean }>`
  width: 48px;
  height: 48px;
  padding: 0;
  border-radius: ${theme.borderRadius.full};
  background: linear-gradient(135deg, ${theme.colors.primary[600]}, ${theme.colors.primary[800]});
  border: 1px solid rgba(124, 58, 237, 0.4);
  box-shadow: 0 0 10px rgba(124, 58, 237, 0.3);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(ellipse at center, rgba(124, 58, 237, 0.3) 0%, rgba(124, 58, 237, 0) 70%);
    opacity: 0;
  }
  
  &:hover::before {
    opacity: 1;
    animation: ripple 1.5s linear infinite;
  }
  
  ${props => props.isListening && css`
    animation: ${pulseAnimation} 2s infinite ease-in-out;
    background: linear-gradient(135deg, ${theme.colors.status.error}, #AB0D02);
    box-shadow: 0 0 15px rgba(239, 68, 68, 0.5);
    
    &:hover {
      background: linear-gradient(135deg, ${theme.colors.status.error}, #AB0D02);
    }
  `}
  
  @keyframes ripple {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const WaveContainer = styled.div`
  display: flex;
  align-items: flex-end;
  height: 15px;
  gap: 3px;
  margin: 0 auto;
`;

const WaveBar = styled.div<{ delay: number }>`
  width: 3px;
  background-color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.full};
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
  animation: ${waveAnimation} 1.2s infinite ease-in-out;
  animation-delay: ${props => props.delay}s;
`;

const SendButton = styled(Button)`
  width: 48px;
  height: 48px;
  padding: 0;
  border-radius: ${theme.borderRadius.full};
  background: linear-gradient(135deg, ${theme.colors.secondary[400]}, ${theme.colors.secondary[600]});
  border: 1px solid rgba(45, 214, 210, 0.4);
  box-shadow: 0 0 10px rgba(45, 214, 210, 0.3);
  
  &:hover:not(:disabled) {
    box-shadow: 0 0 15px rgba(45, 214, 210, 0.5);
    background: linear-gradient(135deg, ${theme.colors.secondary[300]}, ${theme.colors.secondary[500]});
    transform: translateY(-2px);
  }
  
  &:disabled {
    background: rgba(45, 214, 210, 0.2);
    border: 1px solid rgba(45, 214, 210, 0.2);
    box-shadow: none;
  }
`;

const AssistantTypingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  border-radius: ${theme.borderRadius.full};
  background: rgba(20, 184, 178, 0.2);
  border: 1px solid rgba(20, 184, 178, 0.3);
  backdrop-filter: blur(4px);
  width: fit-content;
  align-self: flex-start;
  margin-bottom: ${theme.spacing[2]};
`;

const TypingDot = styled.div<{ delay: number }>`
  width: 8px;
  height: 8px;
  border-radius: ${theme.borderRadius.full};
  background-color: ${theme.colors.secondary[400]};
  box-shadow: 0 0 8px ${theme.colors.secondary[400]};
  animation: ${pulseAnimation} 1.4s infinite ease-in-out;
  animation-delay: ${props => props.delay}s;
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing[2]};
  margin-top: ${theme.spacing[3]};
  
  button {
    border: 1px solid rgba(124, 58, 237, 0.4);
    background: rgba(124, 58, 237, 0.15);
    color: white;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(124, 58, 237, 0.3);
      box-shadow: 0 0 15px rgba(124, 58, 237, 0.4);
    }
  }
`;

// Helper function to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

// Header component
const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  background: linear-gradient(90deg, #0D1033, #1E1B4B, #0D1033);
  border-bottom: 1px solid rgba(124, 58, 237, 0.3);
  color: white;
  
  h4 {
    margin: 0;
    font-weight: ${theme.typography.fontWeight.medium};
    background: linear-gradient(90deg, white, #A4F0EF);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: 0.5px;
  }
  
  .satellite-icon {
    color: ${theme.colors.secondary[400]};
    animation: orbit 8s linear infinite;
  }
  
  @keyframes orbit {
    0% {
      transform: rotate(0deg) translateX(3px) rotate(0deg);
    }
    100% {
      transform: rotate(360deg) translateX(3px) rotate(-360deg);
    }
  }
`;

const ChatWidget: React.FC<ChatWidgetProps> = ({
  onSendMoney,
  onQueryHistory,
  onClaimFunds,
  onOffRamp,
  onRefund,
  walletBalance,
  walletAddress,
  className,
  fallbackVoiceInput,
}) => {
  // State management
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: generateId(),
      content: "Hi there! I'm your MilkyPay assistant. You can ask me to send money, check your history, or help you claim funds. Try saying or typing 'Send $20 to +1234567890'",
      type: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  
  // Speech recognition setup
  const {
    transcript,
    interimTranscript,
    resetTranscript,
    startListening,
    stopListening,
    isListening,
    isSupported,
    speak,
    status
  } = useSpeech({
    lang: 'en-US',
    continuous: true,
    interimResults: true
  });
  
  // Interface with our NLU service
  const { processCommand, isProcessing } = useNLU();
  
  // References
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  // Animation
  const springProps = useSpring({
    opacity: isListening ? 1 : 0,
    transform: isListening ? 'scale(1)' : 'scale(0.8)',
  });
  
  // Voice waveform visualization
  const renderWaveform = () => {
    return (
      <WaveContainer>
        {[...Array(5)].map((_, i) => (
          <WaveBar key={i} delay={i * 0.1} />
        ))}
      </WaveContainer>
    );
  };

  // Handle transcript updates with auto-commit after silence
  useEffect(() => {
    if (transcript !== '') {
      console.log('Transcript updated:', transcript);
      setInputValue(transcript);
      
      // Auto-commit the transcription if there's a pause in speech
      // We'll set up a timer that resets whenever the transcript changes
      const silenceTimer = setTimeout(() => {
        // Only auto-submit if we're still listening and have a transcript
        if (isListening && transcript.trim() !== '') {
          console.log('Auto-submitting after silence detection:', transcript);
          stopListening();
          handleSendMessage(transcript);
        }
      }, 2000); // Wait 2 seconds of silence before submitting
      
      // Clean up the timer when transcript changes
      return () => clearTimeout(silenceTimer);
    }
  }, [transcript, isListening]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Toggle microphone
  const toggleListening = async () => {
    console.log("Toggle listening. Current state:", isListening);
    if (isListening) {
      // Stop listening and submit what we have
      stopListening();
      
      // If we have a transcript, submit it
      if (transcript.trim()) {
        console.log("Submitting transcript:", transcript);
        handleSendMessage(transcript);
        toast.success('Processing your voice command');
      }
    } else {
      try {
        // Start listening for voice input
        resetTranscript();
        
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
          console.log("Browser supports speech recognition, starting...");
          startListening();
          toast.success('Listening... Speak now');
        } else {
          // Use fallback if speech recognition is not available
          console.log("Speech recognition not supported, using fallback");
          if (fallbackVoiceInput) {
            toast.success('Browser voice recognition unavailable. Using text input instead.');
            const text = await fallbackVoiceInput(inputValue);
            if (text && text.trim()) {
              setInputValue(text);
              handleSendMessage(text);
            }
          } else {
            // Basic fallback
            const text = prompt('Voice recognition not available. Please type your message:') || '';
            if (text.trim()) {
              setInputValue(text);
              handleSendMessage(text);
            }
          }
        }
      } catch (error) {
        console.error("Error in voice recognition:", error);
        toast.error('Voice recognition failed. Please try typing instead.');
      }
    }
  };

  // Handle send message (either from voice or text input)
  const handleSendMessage = async (text: string = inputValue) => {
    if (!text.trim()) return;
    
    // Create and add user message
    const userMessage: ChatMessage = {
      id: generateId(),
      content: text,
      type: 'user',
      timestamp: new Date(),
      status: 'sending',
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputValue('');
    resetTranscript();
    
    // Stop listening after message is sent
    if (isListening) {
      stopListening();
    }
    
    // Show typing indicator
    setIsAssistantTyping(true);
    
    try {
      // Process the command with our NLU service
      const nlpResult = await processCommand(text);
      
      // Update user message status
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
        )
      );
      
      // Small delay to simulate thinking
      await new Promise(resolve => setTimeout(resolve, 600));
      
      console.log("NLU result:", nlpResult);
      
      // Special handling for balance check intent
      if (nlpResult.intent === 'check_balance') {
        // Create a balance response message
        const balanceResponse = walletBalance 
          ? `Your current balance is ${walletBalance} XLM, approximately $${(parseFloat(walletBalance) * 0.15).toFixed(2)} USD.`
          : `Your current balance information is not available right now.`;
        
        // Add response message
        setMessages(prevMessages => [
          ...prevMessages,
          {
            id: generateId(),
            content: balanceResponse,
            type: 'assistant',
            timestamp: new Date(),
          }
        ]);
        
        // Speak the response
        speak(balanceResponse);
      }
      // Handle money transfer intent
      else if (nlpResult.intent === 'send_money') {
        // Check if we have both amount and recipient
        const { amount, recipient } = nlpResult.entities;
        
        // If missing information, ask for details
        if (!amount || !recipient) {
          const missingAmount = !amount;
          const missingRecipient = !recipient;
          
          let promptMessage = '';
          if (missingAmount && missingRecipient) {
            promptMessage = "I can help you send money. Who would you like to send to and how much?";
          } else if (missingAmount) {
            promptMessage = `I can help you send money to ${recipient}. How much would you like to send?`;
          } else if (missingRecipient) {
            promptMessage = `I can help you send ${amount}. Who would you like to send it to?`;
          }
          
          // Add the prompt
          setMessages(prevMessages => [
            ...prevMessages,
            {
              id: generateId(),
              content: promptMessage,
              type: 'assistant',
              timestamp: new Date(),
            }
          ]);
          
          // Speak the prompt
          speak(promptMessage);
          
          return; // Exit early, waiting for user to provide more info
        }
        
        // We have both amount and recipient, proceed with the transaction
        if (onSendMoney) {
          // Create the assistant's message
          const processingMessage = `I'll help you send ${amount} to ${recipient}. Processing your request...`;
          
          // Add action message from assistant
          setMessages(prevMessages => [
            ...prevMessages,
            {
              id: generateId(),
              content: processingMessage,
              type: 'assistant',
              timestamp: new Date(),
              isAction: true,
            }
          ]);
          
          // Speak the processing message
          speak(processingMessage);
          
          try {
            // Perform the action
            await onSendMoney(amount, recipient);
            
            // Add confirmation
            const confirmationText = `Success! I've sent ${amount} to ${recipient}. They'll receive a notification with instructions to claim the funds.`;
            setMessages(prevMessages => [
              ...prevMessages,
              {
                id: generateId(),
                content: confirmationText,
                type: 'assistant',
                timestamp: new Date(),
              }
            ]);
            
            // Speak the confirmation
            speak(confirmationText);
          } catch (error) {
            console.error("Error sending money:", error);
            
            // Add error message
            const errorMessage = `Sorry, I encountered an error sending money to ${recipient}. Please try again.`;
            setMessages(prevMessages => [
              ...prevMessages,
              {
                id: generateId(),
                content: errorMessage,
                type: 'assistant',
                timestamp: new Date(),
              }
            ]);
            
            // Speak the error
            speak(errorMessage);
          }
        } else {
          // No send money handler
          const noHandlerMessage = "I'm sorry, sending money is not available right now.";
          setMessages(prevMessages => [
            ...prevMessages,
            {
              id: generateId(),
              content: noHandlerMessage,
              type: 'assistant',
              timestamp: new Date(),
            }
          ]);
          
          speak(noHandlerMessage);
        }
      } 
      else if (nlpResult.intent === 'query_history' && onQueryHistory) {
        const { timeframe } = nlpResult.entities;
        
        // Create the action message
        const actionMessage = `I'm retrieving your transaction history for ${timeframe || 'recent transactions'}...`;
        
        // Add action message
        setMessages(prevMessages => [
          ...prevMessages,
          {
            id: generateId(),
            content: actionMessage,
            type: 'assistant',
            timestamp: new Date(),
            isAction: true,
          }
        ]);
        
        // Speak the action message
        speak(actionMessage);
        
        // Perform query
        const history = await onQueryHistory(timeframe || 'recent');
        
        // Format history results nicely
        let resultMessage = 'Here are your recent transactions:\n\n';
        if (history && history.length > 0) {
          history.forEach((tx: any, i: number) => {
            resultMessage += `${i + 1}. ${tx.type === 'sent' ? 'Sent' : 'Received'} ${tx.amount} ${
              tx.to ? `to ${tx.to}` : `from ${tx.from}`
            } on ${new Date(tx.date).toLocaleDateString()}\n`;
          });
        } else {
          resultMessage = "You don't have any transactions in this period.";
        }
        
        // Add response
        setMessages(prevMessages => [
          ...prevMessages,
          {
            id: generateId(),
            content: resultMessage,
            type: 'assistant',
            timestamp: new Date(),
          }
        ]);
      }
      else {
        // For any other intent or fallback
        const responseText = nlpResult.response || "I'm not sure I understood that. Can you try rephrasing?";
        setMessages(prevMessages => [
          ...prevMessages,
          {
            id: generateId(),
            content: responseText,
            type: 'assistant',
            timestamp: new Date(),
          }
        ]);
        
        // Use speech synthesis to speak the response
        speak(responseText);
      }
    } catch (error) {
      // Handle error
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === userMessage.id ? { ...msg, status: 'error' } : msg
        )
      );
      
      // Create error message
      const errorMessage = "Sorry, I encountered an error processing your request. Please try again.";
      
      // Add error message
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: generateId(),
          content: errorMessage,
          type: 'assistant',
          timestamp: new Date(),
        }
      ]);
      
      // Speak the error message
      speak(errorMessage);
      
      console.error('Error processing message:', error);
    } finally {
      setIsAssistantTyping(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  // Render typing indicator
  const renderTypingIndicator = () => {
    return (
      <AssistantTypingIndicator>
        <TypingDot delay={0} />
        <TypingDot delay={0.2} />
        <TypingDot delay={0.4} />
      </AssistantTypingIndicator>
    );
  };

  // Check browser support
  if (!isSupported) {
    return (
      <ChatContainer className={className}>
        <CardContent>
          <p>Your browser doesn't support speech recognition. Please try using a modern browser like Chrome.</p>
        </CardContent>
      </ChatContainer>
    );
  }

  return (
    <ChatContainer className={className} elevation="high">
      <ChatHeader>
        <FaSatellite size={18} className="satellite-icon" />
        <h4>MilkyPay AI Assistant</h4>
      </ChatHeader>
      <MessagesContainer ref={messagesContainerRef}>
        <AnimatePresence>
          {messages.map(message => (
            <MessageBubble
              key={message.id}
              type={message.type}
              isAction={message.isAction}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              {message.content}
              {message.type === 'user' && message.status && (
                <MessageStatus status={message.status}>
                  {message.status === 'sending' && 'Sending...'}
                  {message.status === 'sent' && 'Sent'}
                  {message.status === 'error' && 'Failed to send'}
                </MessageStatus>
              )}
            </MessageBubble>
          ))}
        </AnimatePresence>
        
        {isAssistantTyping && renderTypingIndicator()}
        
        <div ref={messagesEndRef} />
      </MessagesContainer>
      
      <InputArea>
        <TranscriptionPreview>
          {isListening && interimTranscript && `Hearing: ${interimTranscript}`}
        </TranscriptionPreview>
        
        <form onSubmit={handleSubmit}>
          <InputRow>
            <MicButton
              type="button"
              variant={isListening ? 'danger' : 'primary'}
              isListening={isListening}
              onClick={toggleListening}
              aria-label={isListening ? 'Stop listening' : 'Start listening'}
            >
              <animated.div style={springProps}>
                {isListening ? renderWaveform() : <HiMicrophone size={24} />}
              </animated.div>
            </MicButton>
            
            <StyledTextInput
              placeholder="Type a message or press mic to speak..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              variant="filled"
              rightIcon={inputValue ? <MdCancel /> : undefined}
              showClearButton
              onClear={() => setInputValue('')}
              fullWidth
            />
            
            <SendButton
              type="submit"
              variant="primary"
              disabled={!inputValue.trim()}
              aria-label="Send message"
            >
              <RiSendPlaneFill size={24} />
            </SendButton>
          </InputRow>
        </form>
        
        {/* Quick action buttons */}
        <ActionButtonsContainer>
          <Button 
            size="sm" 
            variant="outlined" 
            onClick={() => handleSendMessage("What's my balance?")}
          >
            <FaRocket size={12} style={{ marginRight: '4px' }} /> Check Balance
          </Button>
          <Button 
            size="sm" 
            variant="outlined" 
            onClick={() => handleSendMessage("Show my transaction history")}
          >
            <FaSatellite size={12} style={{ marginRight: '4px' }} /> Transaction History
          </Button>
          <Button 
            size="sm" 
            variant="outlined" 
            onClick={() => handleSendMessage("Help me withdraw funds")}
          >
            <FaRocket size={12} style={{ marginRight: '4px', transform: 'rotate(180deg)' }} /> Withdraw
          </Button>
        </ActionButtonsContainer>
      </InputArea>
    </ChatContainer>
  );
};

export default ChatWidget;