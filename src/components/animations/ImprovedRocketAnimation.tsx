import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';

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
  background: rgba(0, 2, 32, 0.9);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  z-index: 1000;
  perspective: 1000px;
`;

const AnimationContent = styled(motion.div)`
  position: relative;
  width: 100%;
  max-width: 320px;
  height: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
`;

const StatusText = styled(motion.div)`
  position: absolute;
  top: 15%;
  font-size: 24px;
  font-weight: 600;
  color: white;
  text-align: center;
  z-index: 10;
`;

const ResultText = styled(motion.div)`
  position: absolute;
  top: 80%;
  font-size: 28px;
  font-weight: 700;
  text-align: center;
  z-index: 10;
`;

const StarField = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const Star = styled(motion.div)<{ size: number }>`
  position: absolute;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  border-radius: 50%;
  background-color: white;
  z-index: 1;
`;

// SVG Rocket
const RocketWrapper = styled(motion.div)`
  position: relative;
  width: 80px;
  height: 200px;
  z-index: 5;
`;

const RocketSVG = styled(motion.svg)`
  width: 100%;
  height: 100%;
`;

// Rocket Components
const RocketBody = styled(motion.path)`
  fill: #f5f5f5;
`;

const RocketWindow = styled(motion.circle)`
  fill: #a4e1f5;
`;

const RocketFin = styled(motion.path)`
  fill: #e74c3c;
`;

const RocketExhaust = styled(motion.path)`
  fill: #f39c12;
`;

// Launch Pad
const LaunchPad = styled(motion.div)`
  position: absolute;
  bottom: 20px;
  width: 120px;
  height: 20px;
  background: #444;
  border-radius: 5px;
  z-index: 2;
`;

// Explosion
const Explosion = styled(motion.div)`
  position: absolute;
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, rgba(255, 165, 0, 0.9), rgba(255, 69, 0, 0.8), rgba(255, 0, 0, 0.7), transparent);
  border-radius: 50%;
  filter: blur(5px);
  z-index: 5;
`;

// Flame
const Flame = styled(motion.div)`
  position: absolute;
  width: 30px;
  height: 60px;
  background: linear-gradient(to bottom, #f5b642, #f39c12, #ff5722);
  border-radius: 0 0 15px 15px;
  filter: blur(3px);
  z-index: 3;
  transform-origin: top center;
`;

// Generate random stars
const generateStars = (count: number) => {
  const stars = [];
  for (let i = 0; i < count; i++) {
    const size = Math.random() * 2 + 1;
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const delay = Math.random() * 5;
    
    stars.push(
      <Star
        key={i}
        size={size}
        initial={{ opacity: 0.5, scale: 0.8 }}
        animate={{ 
          opacity: [0.5, 1, 0.5],
          scale: [0.8, 1.2, 0.8]
        }}
        transition={{
          duration: 4,
          delay: delay,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ left: `${x}%`, top: `${y}%` }}
      />
    );
  }
  return stars;
};

const ImprovedRocketAnimation: React.FC<RocketAnimationProps> = ({ isVisible, isSuccess, onComplete }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onComplete();
      }, isSuccess ? 6000 : 6500);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, isSuccess, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <AnimationContainer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <StarField>
            {generateStars(100)}
          </StarField>
          
          <AnimationContent>
            <StatusText
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              {isSuccess ? "Transaction in progress..." : "Verifying transaction..."}
            </StatusText>
            
            {isSuccess ? (
              // Success Animation
              <>
                <RocketWrapper
                  initial={{ y: 0 }}
                  animate={{ y: [-10, -400] }}
                  transition={{ 
                    duration: 4,
                    times: [0, 1],
                    ease: [0.34, 1.56, 0.64, 1]
                  }}
                >
                  <RocketSVG viewBox="0 0 100 240" xmlns="http://www.w3.org/2000/svg">
                    {/* Rocket Body */}
                    <RocketBody d="M30,200 L30,80 C30,30 70,30 70,80 L70,200 Z" />
                    
                    {/* Rocket Window */}
                    <RocketWindow cx="50" cy="100" r="15" />
                    
                    {/* Rocket Top */}
                    <RocketBody d="M30,80 C30,40 50,10 50,10 C50,10 70,40 70,80 Z" />
                    
                    {/* Left Fin */}
                    <RocketFin d="M20,170 L0,230 L30,200 Z" />
                    
                    {/* Right Fin */}
                    <RocketFin d="M80,170 L100,230 L70,200 Z" />
                    
                    {/* Bottom */}
                    <RocketExhaust d="M30,200 C30,220 70,220 70,200 Z" />
                  </RocketSVG>
                </RocketWrapper>
                
                <Flame
                  initial={{ y: 200, height: 60 }}
                  animate={{ 
                    y: [-10, -400],
                    height: [60, 100, 80, 100, 60],
                    opacity: [0.8, 1, 0.9, 1, 0]
                  }}
                  transition={{ 
                    y: { duration: 4, times: [0, 1], ease: [0.34, 1.56, 0.64, 1] },
                    height: { duration: 2, repeat: 2, repeatType: "reverse" },
                    opacity: { duration: 4, times: [0, 0.3, 0.5, 0.7, 1] }
                  }}
                  style={{ x: -15 }}
                />
                
                <LaunchPad
                  initial={{ opacity: 1 }}
                  animate={{ opacity: [1, 0.7, 0.3] }}
                  transition={{ duration: 3, times: [0, 0.7, 1] }}
                />
                
                <ResultText
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 4, duration: 0.6 }}
                  style={{ color: '#10B981' }}
                >
                  Transaction Successful! 🚀
                </ResultText>
              </>
            ) : (
              // Failure Animation
              <>
                <RocketWrapper
                  initial={{ y: 0, rotate: 0 }}
                  animate={{ 
                    y: [-10, -120, -100, -90, -70, -40, 60],
                    rotate: [0, 0, 5, -10, 15, -20, -90]
                  }}
                  transition={{ 
                    duration: 5,
                    times: [0, 0.2, 0.3, 0.4, 0.5, 0.7, 1],
                    ease: ["easeOut", "easeIn", "easeOut", "easeIn", "easeOut", "easeIn"]
                  }}
                >
                  <RocketSVG viewBox="0 0 100 240" xmlns="http://www.w3.org/2000/svg">
                    {/* Rocket Body */}
                    <RocketBody d="M30,200 L30,80 C30,30 70,30 70,80 L70,200 Z" />
                    
                    {/* Rocket Window */}
                    <RocketWindow cx="50" cy="100" r="15" />
                    
                    {/* Rocket Top */}
                    <RocketBody d="M30,80 C30,40 50,10 50,10 C50,10 70,40 70,80 Z" />
                    
                    {/* Left Fin */}
                    <RocketFin d="M20,170 L0,230 L30,200 Z" />
                    
                    {/* Right Fin */}
                    <RocketFin d="M80,170 L100,230 L70,200 Z" />
                    
                    {/* Bottom */}
                    <RocketExhaust d="M30,200 C30,220 70,220 70,200 Z" />
                  </RocketSVG>
                </RocketWrapper>
                
                <Flame
                  initial={{ y: 200, height: 60 }}
                  animate={{ 
                    y: [-10, -120, -100, -90, -70, -40, 60],
                    rotate: [0, 0, 5, -10, 15, -20, -90],
                    height: [60, 80, 30, 50, 20, 10, 0],
                    opacity: [1, 1, 0.7, 0.6, 0.4, 0.2, 0]
                  }}
                  transition={{ 
                    duration: 5,
                    times: [0, 0.2, 0.3, 0.4, 0.5, 0.7, 1],
                    ease: ["easeOut", "easeIn", "easeOut", "easeIn", "easeOut", "easeIn"]
                  }}
                  style={{ x: -15 }}
                />
                
                <LaunchPad
                  initial={{ opacity: 1 }}
                  animate={{ opacity: [1, 0.8, 0.6] }}
                  transition={{ duration: 2 }}
                />
                
                <Explosion
                  initial={{ opacity: 0, scale: 0.2 }}
                  animate={{ 
                    opacity: [0, 1, 0.7, 0],
                    scale: [0.2, 1.5, 2, 2.5]
                  }}
                  transition={{ 
                    duration: 1.5,
                    delay: 4.5,
                    times: [0, 0.3, 0.7, 1]
                  }}
                  style={{ bottom: 250, left: 30 }}
                />
                
                <ResultText
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 5, duration: 0.6 }}
                  style={{ color: '#EF4444' }}
                >
                  Transaction Failed 💥
                </ResultText>
              </>
            )}
          </AnimationContent>
        </AnimationContainer>
      )}
    </AnimatePresence>
  );
};

export default ImprovedRocketAnimation;