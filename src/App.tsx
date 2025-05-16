import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { GlobalStyles, lightTheme, darkTheme } from './styles/theme';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaCoins, FaHistory, FaUserAstronaut, FaCog } from 'react-icons/fa';
import { ThemeProvider } from './contexts/ThemeContext';
import RocketAnimation from './components/animations/ImprovedRocketAnimation';
import { sendClaimLinkSMS, validatePhoneNumber } from './services/sms';

// Components
import WalletLoader from './components/WalletLoader';
import ChatWidget from './components/ChatWidget';
import ClaimLink from './components/ClaimLink';
import OffRampOptions from './components/OffRampOptions';
import FloatingChatButton from './components/FloatingChatButton';

// UI Components
import SpaceIntro from './components/animations/SpaceIntro';
import HomeScreen from './components/screens/HomeScreen';
import SimplifiedHomeScreen from './components/screens/SimplifiedHomeScreen';
import DepositScreen from './components/screens/DepositScreen';
import WithdrawScreen from './components/screens/WithdrawScreen';
import TransferScreen from './components/screens/TransferScreen';
import HistoryScreen from './components/screens/HistoryScreen';
import SimplifiedHistoryScreen from './components/screens/SimplifiedHistoryScreen';
import ProfileScreen from './components/screens/ProfileScreen';
import SimplifiedProfileScreen from './components/screens/SimplifiedProfileScreen';
import SettingsScreen from './components/screens/SettingsScreen';
import SimplifiedSettingsScreen from './components/screens/SimplifiedSettingsScreen';

// Hooks
import { useWallet } from './hooks/useWallet';

// Styled Components
const AppContainer = styled.div`
  min-height: 100vh;
  width: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  position: relative;
  transition: background-color 0.3s ease;
`;

const ScreenContainer = styled(motion.div)`
  width: 100%;
  max-width: 480px;
  min-height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  margin: 0 auto;
  padding: 20px;
`;

// Main App Component
const App: React.FC = () => {
  // State
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [currentScreen, setCurrentScreen] = useState<string>('');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [localBalance, setLocalBalance] = useState<string>('0');
  const [isTransactionProcessing, setIsTransactionProcessing] = useState<boolean>(false);
  const [isTransactionSuccess, setIsTransactionSuccess] = useState<boolean>(false);
  
  // Hooks
  const { 
    wallet, 
    balance, 
    isLoading: walletLoading, 
    createWallet, 
    sendPayment,
    createClaimableBalance,
    claimBalance,
    refreshBalance
  } = useWallet();
  
  // State for theme instead of using ThemeContext hook
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  
  // Toggle theme function
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  // Update local balance when wallet balance changes
  useEffect(() => {
    if (balance) {
      setLocalBalance(balance);
    }
  }, [balance]);
  
  // Set wallet address when wallet is loaded
  useEffect(() => {
    if (wallet?.publicKey) {
      setWalletAddress(wallet.publicKey);
    }
  }, [wallet]);
  
  // Handle wallet creation if none exists
  useEffect(() => {
    const loadWallet = async () => {
      if (!wallet && !walletLoading) {
        try {
          await createWallet();
        } catch (err) {
          console.error('Failed to create wallet on load:', err);
        }
      }
    };
    
    loadWallet();
  }, [wallet, walletLoading, createWallet]);
  
  // Handle the animation completion 
  const handleTransactionAnimationComplete = () => {
    setIsTransactionProcessing(false);
  };

  // Handle send money from chat or transfer screen
  const handleSendMoney = async (amount: string, recipient: string, memo?: string) => {
    try {
      setIsTransactionProcessing(true);
      setIsTransactionSuccess(false);
      
      // Generate a random 4-digit PIN
      const pin = Math.floor(1000 + Math.random() * 9000).toString();
      console.log('Created PIN:', pin, 'for transfer to:', recipient);
      
      // For demo purposes, try the real operation but have a fallback mock
      let result;
      try {
        // First try real Stellar claimable balance operation
        result = await createClaimableBalance(
          amount,
          'GDKXJL2B4FSXP5XMOPAC6MESQDTHST3RM532JLZADJBGXX6UVAHEIST', // Demo recipient
          pin,
          30 // Expiration in days
        );
        console.log('Successfully created claimable balance:', result);
      } catch (stellarErr) {
        console.error('Error creating real claimable balance:', stellarErr);
        
        // Create a mock result for demo purposes
        console.log('Using mock result for demo...');
        result = {
          txHash: 'mock-tx-' + Date.now(),
          balanceId: 'mock-balance-id-' + Date.now(),
          amount: amount.startsWith('$') ? amount.substring(1) : amount,
          pin,
          recipient,
          expirationDate: new Date(Date.now() + 30*24*60*60*1000).toISOString()
        };
      }
      
      // Simulate balance update
      if (localBalance) {
        const currentBalance = parseFloat(localBalance);
        const sentAmount = parseFloat(amount.startsWith('$') ? amount.substring(1) : amount);
        const newBalance = Math.max(0, currentBalance - sentAmount).toFixed(7);
        
        // Update the local balance to reflect the transaction
        setLocalBalance(newBalance);
      }
      
      // Set transaction as successful and show animation
      setIsTransactionSuccess(true);
      
      // If recipient looks like a phone number, send the claim link via SMS
      if (validatePhoneNumber(recipient)) {
        try {
          // Send the SMS with claim link
          await sendClaimLinkSMS(
            recipient,
            amount,
            pin,
            result?.balanceId || 'mock-id',
            'You' // Or you could use a username here if available
          );
          
          // Toast shows after animation completes
          setTimeout(() => {
            toast.success(`Sent ${amount} to ${recipient} with PIN: ${pin}. SMS notification sent!`);
          }, 5000);
        } catch (smsErr) {
          console.error('Failed to send SMS notification:', smsErr);
          // Still show success toast but mention SMS issue
          setTimeout(() => {
            toast.success(`Sent ${amount} to ${recipient} with PIN: ${pin}. (SMS notification failed)`);
          }, 5000);
        }
      } else {
        // Regular success message for non-phone numbers
        setTimeout(() => {
          toast.success(`Sent ${amount} to ${recipient} with PIN: ${pin}`);
        }, 5000);
      }
      
      return {
        success: true,
        amount,
        recipient,
        pin,
        claimId: result?.balanceId,
      };
    } catch (err) {
      console.error('Send money error:', err);
      
      // Set transaction as failed and show animation
      setIsTransactionSuccess(false);
      
      // Toast shows after animation completes
      setTimeout(() => {
        toast.error('Failed to send money');
      }, 5000);
      
      return {
        success: false,
        error: 'Failed to send money',
      };
    }
  };
  
  // Handle withdrawal
  const handleWithdraw = async (address: string, amount: string) => {
    try {
      console.log(`Withdrawing ${amount} to address: ${address}`);
      
      // Simulate a transaction for the demo
      setTimeout(() => {
        // Update the balance
        if (localBalance) {
          const currentBalance = parseFloat(localBalance);
          const withdrawAmount = parseFloat(amount);
          const newBalance = Math.max(0, currentBalance - withdrawAmount).toFixed(7);
          setLocalBalance(newBalance);
        }
        
        // Navigate back to home
        setCurrentScreen('home');
        
        // Show success message
        toast.success(`Successfully withdrew ${amount} XLM to ${address.slice(0, 6)}...${address.slice(-6)}`);
      }, 1500);
      
      return {
        success: true,
        txHash: 'mock-withdrawal-' + Date.now(),
        amount,
        fee: '0.00001',
      };
    } catch (err) {
      console.error('Withdrawal error:', err);
      toast.error('Failed to withdraw funds');
      return {
        success: false,
        error: 'Failed to withdraw funds',
      };
    }
  };
  
  // Handle claim
  const handleClaim = async (claimId: string, pin: string) => {
    try {
      console.log('Attempting to claim balance with ID:', claimId, 'and PIN:', pin);
      
      // Try real claim operation with fallback
      let result;
      try {
        // Try to use the real Stellar operation
        result = await claimBalance(claimId, pin);
        console.log('Successfully claimed balance:', result);
      } catch (stellarErr) {
        console.error('Error with real claim operation:', stellarErr);
        
        // For demo, create a mock result
        console.log('Using mock claim for demo');
        result = {
          txHash: 'mock-claim-tx-' + Date.now(),
          balanceId: claimId,
          amount: '100.00', // Mock amount
          assetType: 'native',
          claimDate: new Date().toISOString()
        };
        
        // Simulate balance increase
        if (localBalance) {
          const currentBalance = parseFloat(localBalance);
          const claimedAmount = 100; // Mock amount
          const newBalance = (currentBalance + claimedAmount).toFixed(7);
          setLocalBalance(newBalance);
        }
      }
      
      toast.success(`Successfully claimed ${result?.amount || '0'} XLM!`);
      
      return {
        success: true,
        amount: result?.amount || '0',
      };
    } catch (err) {
      console.error('Claim error:', err);
      toast.error('Failed to claim funds');
      return {
        success: false,
        error: 'Failed to claim funds',
      };
    }
  };
  
  // Setup a log listener to help debugging browser speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const originalConsoleLog = console.log;
      console.log = function(...args) {
        originalConsoleLog.apply(console, args);
        
        // Extra logging for debugging speech recognition
        if (args.join(' ').includes('speech') || args.join(' ').includes('voice')) {
          try {
            // Report speech API support
            originalConsoleLog.apply(console, [
              'Speech API support:',
              'SpeechRecognition:', Boolean(window.SpeechRecognition),
              'webkitSpeechRecognition:', Boolean(window.webkitSpeechRecognition)
            ]);
          } catch (e) {
            // Ignore errors in debug logging
          }
        }
      };
    }
  }, []);
  
  // Handle navigation between screens
  const navigateTo = (screen: string) => {
    setCurrentScreen(screen);
  };
  
  // Page transition variants
  const pageVariants = {
    initial: { opacity: 0, x: 10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -10 }
  };
  
  // Intro animation is complete
  const handleIntroComplete = () => {
    setShowIntro(false);
    setCurrentScreen('home');
  };
  
  // ChatWidget wrapper function to make type-safe
  const handleChatSend = (amount: string, recipient: string) => {
    handleSendMoney(amount, recipient);
    return Promise.resolve();
  };
  
  return (
    <ThemeProvider>
      <GlobalStyles />
      <Toaster position="top-right" />
      
      <AppContainer style={{
          background: isDarkMode ? darkTheme.colors.background.primary : lightTheme.colors.background.primary,
          backgroundImage: isDarkMode ? 'url("https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=3540&auto=format&fit=crop")' : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay'
        }}>
        {showIntro && (
          <SpaceIntro onComplete={handleIntroComplete} />
        )}
        
        <AnimatePresence mode="wait">
          {!showIntro && (
            <>
              {/* Removed Floating Chat Button as we'll integrate chat directly */}
              
              {/* Screen Content */}
              {currentScreen === 'home' && (
                <ScreenContainer
                  key="home-screen"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  transition={{ duration: 0.3 }}
                >
                  <SimplifiedHomeScreen 
                    balance={localBalance}
                    username="there"
                    onNavigate={navigateTo}
                    onSendMoney={handleChatSend}
                    walletAddress={walletAddress || ''}
                    isDarkMode={isDarkMode}
                    onToggleTheme={toggleTheme}
                  />
                </ScreenContainer>
              )}
              
              {currentScreen === 'deposit' && (
                <ScreenContainer
                  key="deposit-screen"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  transition={{ duration: 0.3 }}
                >
                  <DepositScreen 
                    walletAddress={walletAddress || 'G...'}
                    onBack={() => navigateTo('home')}
                  />
                </ScreenContainer>
              )}
              
              {currentScreen === 'withdraw' && (
                <ScreenContainer
                  key="withdraw-screen"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  transition={{ duration: 0.3 }}
                >
                  <WithdrawScreen 
                    balance={localBalance}
                    onBack={() => navigateTo('home')}
                    onSubmit={handleWithdraw}
                  />
                </ScreenContainer>
              )}
              
              {currentScreen === 'transfer' && (
                <ScreenContainer
                  key="transfer-screen"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  transition={{ duration: 0.3 }}
                >
                  <TransferScreen 
                    balance={localBalance}
                    onBack={() => navigateTo('home')}
                    onSubmit={handleSendMoney}
                  />
                </ScreenContainer>
              )}
              
              {currentScreen === 'history' && (
                <ScreenContainer
                  key="history-screen"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  transition={{ duration: 0.3 }}
                >
                  <SimplifiedHistoryScreen onBack={() => navigateTo('home')} />
                </ScreenContainer>
              )}
              
              {currentScreen === 'profile' && (
                <ScreenContainer
                  key="profile-screen"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  transition={{ duration: 0.3 }}
                >
                  <SimplifiedProfileScreen 
                    walletAddress={walletAddress || ''}
                    onBack={() => navigateTo('home')} 
                  />
                </ScreenContainer>
              )}
              
              {currentScreen === 'settings' && (
                <ScreenContainer
                  key="settings-screen"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  transition={{ duration: 0.3 }}
                >
                  <SimplifiedSettingsScreen 
                    onBack={() => navigateTo('home')} 
                    isDarkMode={isDarkMode} 
                    onToggleTheme={toggleTheme} 
                  />
                </ScreenContainer>
              )}
              
              {/* Fallback for voice chat */}
              {currentScreen === 'purchase' && (
                <ScreenContainer
                  key="purchase-screen"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  transition={{ duration: 0.3 }}
                >
                  <div style={{ 
                    padding: '20px', 
                    width: '100%',
                    height: '100%',
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    color: 'white'
                  }}>
                    <h2 style={{ 
                      marginBottom: '20px', 
                      backgroundImage: 'linear-gradient(90deg, white, #A4F0EF)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent', 
                      fontSize: '28px' 
                    }}>Purchase XLM</h2>
                    
                    <div style={{ 
                      background: 'rgba(255,255,255,0.05)', 
                      borderRadius: '16px', 
                      padding: '30px', 
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(124, 58, 237, 0.3)',
                      width: '100%',
                      textAlign: 'center'
                    }}>
                      <FaCoins size={48} style={{ 
                        color: "#2DD6D2",
                        marginBottom: '20px',
                        filter: 'drop-shadow(0 0 10px rgba(45, 214, 210, 0.8))'
                      }} />
                      
                      <p style={{ marginBottom: '25px' }}>
                        Connect with our network of verified onramp partners to purchase XLM directly to your MilkyPay wallet.
                      </p>
                      
                      <button style={{
                        background: 'linear-gradient(135deg, #7C3AED, #4C1D95)',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px 24px',
                        color: 'white',
                        fontWeight: 600,
                        marginBottom: '15px',
                        width: '100%',
                        cursor: 'pointer',
                        boxShadow: '0 0 15px rgba(124, 58, 237, 0.4)'
                      }}>Connect to Partner</button>
                      
                      <button onClick={() => navigateTo('home')} style={{
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        padding: '12px 24px',
                        color: 'white',
                        width: '100%',
                        cursor: 'pointer',
                      }}>Back to Home</button>
                    </div>
                  </div>
                </ScreenContainer>
              )}
            </>
          )}
        </AnimatePresence>
        
        {/* Global rocket animation for transactions */}
        <RocketAnimation 
          isVisible={isTransactionProcessing}
          isSuccess={isTransactionSuccess}
          onComplete={handleTransactionAnimationComplete}
        />
      </AppContainer>
    </ThemeProvider>
  );
};

export default App;