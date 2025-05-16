import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { FaRocket } from 'react-icons/fa';

interface RocketAnimationProps {
  isVisible: boolean;
  isSuccess: boolean;
  onComplete: () => void;
}

const AnimationContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 2, 32, 0.85);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  z-index: 1000;
`;

const RocketContainer = styled(motion.div)`
  position: relative;
  height: 300px;
  width: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Rocket = styled(motion.div)`
  font-size: 40px;
  color: white;
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
  z-index: 5;
`;

const RocketBase = styled(motion.div)`
  width: 60px;
  height: 15px;
  background: linear-gradient(90deg, #FF4500, #FFA500);
  border-radius: 0 0 30px 30px;
  margin-top: -10px;
  z-index: 4;
`;

const Flames = styled(motion.div)`
  width: 40px;
  height: 60px;
  background: linear-gradient(to bottom, #FF4500, #FFA500, yellow);
  border-radius: 0 0 50% 50%;
  filter: blur(5px);
  margin-top: -10px;
  z-index: 3;
`;

const StatusText = styled(motion.div)`
  position: absolute;
  bottom: 80px;
  font-size: 24px;
  font-weight: 600;
  color: white;
  text-align: center;
`;

const Stars = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
`;

const Star = styled.div<{ size: number; top: number; left: number }>`
  position: absolute;
  background-color: white;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  border-radius: 50%;
  opacity: 0.8;
  top: ${props => props.top}%;
  left: ${props => props.left}%;
`;

const LaunchPad = styled(motion.div)`
  position: absolute;
  bottom: 40px;
  width: 80px;
  height: 10px;
  background: #444;
  border-radius: 5px;
`;

const Explosion = styled(motion.div)`
  position: absolute;
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, #FF4500, #FFA500, yellow, transparent);
  border-radius: 50%;
  filter: blur(5px);
  opacity: 0;
`;

const SuccessMessage = styled(motion.div)`
  font-size: 28px;
  font-weight: 700;
  color: #10B981;
  margin-top: 20px;
  text-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
`;

const FailureMessage = styled(motion.div)`
  font-size: 28px;
  font-weight: 700;
  color: #EF4444;
  margin-top: 20px;
  text-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
`;

const RocketAnimation: React.FC<RocketAnimationProps> = ({ isVisible, isSuccess, onComplete }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onComplete();
      }, isSuccess ? 5000 : 5500);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, isSuccess, onComplete]);
  
  // Generate random stars
  const renderStars = () => {
    const stars = [];
    for (let i = 0; i < 50; i++) {
      const size = Math.random() * 3 + 1;
      const top = Math.random() * 100;
      const left = Math.random() * 100;
      
      stars.push(
        <Star 
          key={i} 
          size={size} 
          top={top} 
          left={left}
        />
      );
    }
    return stars;
  };
  
  return (
    <AnimatePresence>
      {isVisible && (
        <AnimationContainer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Stars>{renderStars()}</Stars>
          
          <RocketContainer>
            {isSuccess ? (
              // Success Animation
              <>
                <StatusText
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  Transaction in progress...
                </StatusText>
                
                <Rocket
                  initial={{ y: 0 }}
                  animate={{ y: -400 }}
                  transition={{ 
                    duration: 3,
                    ease: [0.1, 0.6, 0.8, 1]
                  }}
                >
                  <FaRocket />
                </Rocket>
                
                <RocketBase
                  initial={{ y: 0 }}
                  animate={{ y: -400 }}
                  transition={{ 
                    duration: 3,
                    ease: [0.1, 0.6, 0.8, 1]
                  }}
                />
                
                <Flames
                  initial={{ height: 30, opacity: 0.7 }}
                  animate={{ 
                    height: [30, 70, 40, 70, 30],
                    opacity: [0.7, 1, 0.8, 1, 0.7]
                  }}
                  transition={{ 
                    duration: 1,
                    repeat: 3,
                    repeatType: "reverse"
                  }}
                  style={{ y: 0 }}
                />
                
                <LaunchPad
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0.5 }}
                  transition={{ delay: 2, duration: 1 }}
                />
                
                <SuccessMessage
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 3.2, duration: 0.5 }}
                >
                  Success! 🚀
                </SuccessMessage>
              </>
            ) : (
              // Failure Animation
              <>
                <StatusText
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  Transaction in progress...
                </StatusText>
                
                <Rocket
                  initial={{ y: 0 }}
                  animate={{ 
                    y: [0, -150, -100, -120, -80, -50, 0],
                    rotate: [0, 0, 5, -5, 10, -10, 0]
                  }}
                  transition={{ 
                    duration: 4,
                    times: [0, 0.3, 0.4, 0.5, 0.6, 0.8, 1],
                    ease: ["easeOut", "easeIn", "easeOut", "easeIn", "easeOut", "easeIn"]
                  }}
                >
                  <FaRocket />
                </Rocket>
                
                <RocketBase
                  initial={{ y: 0 }}
                  animate={{ 
                    y: [0, -150, -100, -120, -80, -50, 0],
                    rotate: [0, 0, 5, -5, 10, -10, 0]
                  }}
                  transition={{ 
                    duration: 4,
                    times: [0, 0.3, 0.4, 0.5, 0.6, 0.8, 1],
                    ease: ["easeOut", "easeIn", "easeOut", "easeIn", "easeOut", "easeIn"]
                  }}
                />
                
                <Flames
                  initial={{ height: 60, opacity: 1 }}
                  animate={{ 
                    height: [60, 70, 20, 30, 10, 5, 0],
                    opacity: [1, 1, 0.6, 0.8, 0.4, 0.2, 0]
                  }}
                  transition={{ 
                    duration: 4,
                    times: [0, 0.3, 0.4, 0.5, 0.6, 0.8, 1]
                  }}
                  style={{ y: 0 }}
                />
                
                <LaunchPad
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0.5 }}
                  transition={{ delay: 2, duration: 1 }}
                />
                
                <Explosion
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.8] }}
                  transition={{ delay: 4, duration: 0.5 }}
                  style={{ bottom: 10 }}
                />
                
                <FailureMessage
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 4.5, duration: 0.5 }}
                >
                  Transaction Failed 💥
                </FailureMessage>
              </>
            )}
          </RocketContainer>
        </AnimationContainer>
      )}
    </AnimatePresence>
  );
};

export default RocketAnimation;