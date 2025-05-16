import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import theme from '../../styles/theme';
import { ReactComponent as StellarLogoSVG } from '../../assets/stellar-logo.svg';

interface SpaceIntroProps {
  onComplete: () => void;
}

// Styled components for the animation
const AnimationContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #000220;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  z-index: 1000;
`;

const StarField = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
`;

const Star = styled.div<{ size: number; delay: number; speed: number }>`
  position: absolute;
  background-color: white;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  border-radius: 50%;
  opacity: 0.8;
  animation: star-fly ${props => props.speed}s linear ${props => props.delay}s infinite;

  @keyframes star-fly {
    0% {
      transform: translateZ(0) translateY(100vh) translateX(${() => Math.random() * 100 - 50}vw);
      opacity: 0;
    }
    5% {
      opacity: 0.8;
    }
    95% {
      opacity: 0.8;
    }
    100% {
      transform: translateZ(1000px) translateY(-100vh) translateX(${() => Math.random() * 100 - 50}vw);
      opacity: 0;
    }
  }
`;

const StellarLogo = styled(motion.div)`
  position: relative;
  z-index: 10;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7C3AED, #4C1D95);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 40px rgba(124, 58, 237, 0.6);
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    width: 200%;
    height: 200%;
    background: radial-gradient(ellipse at center, rgba(124, 58, 237, 0.2) 0%, rgba(20, 184, 178, 0.1) 40%, rgba(255,255,255,0) 70%);
    animation: rotate 10s linear infinite;
    
    @keyframes rotate {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  }
`;

const LogoInner = styled.div`
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  
  svg {
    width: 100%;
    height: 100%;
    filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.9));
    animation: pulse 2s ease-in-out infinite alternate;
    
    @keyframes pulse {
      0% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.9)); }
      100% { transform: scale(1.1); filter: drop-shadow(0 0 20px rgba(255, 255, 255, 1)); }
    }
  }
`;

const BrandText = styled(motion.div)`
  position: absolute;
  bottom: 40%;
  font-family: ${theme.typography.fontFamily.primary};
  font-size: 32px;
  font-weight: ${theme.typography.fontWeight.bold};
  color: white;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
  letter-spacing: 2px;
`;

// Main component
const SpaceIntro: React.FC<SpaceIntroProps> = ({ onComplete }) => {
  const [stars, setStars] = useState<React.ReactNode[]>([]);
  
  // Create stars on mount
  useEffect(() => {
    const starElements = [];
    for (let i = 0; i < 150; i++) {
      const size = Math.random() * 3 + 1;
      const delay = Math.random() * 2;
      const speed = Math.random() * 3 + 3;
      const top = Math.random() * 100;
      const left = Math.random() * 100;
      
      starElements.push(
        <Star 
          key={i} 
          size={size} 
          delay={delay} 
          speed={speed} 
          style={{ top: `${top}%`, left: `${left}%` }} 
        />
      );
    }
    setStars(starElements);
    
    // Trigger the onComplete callback after the animation
    // Extended animation time for a better experience
    const timer = setTimeout(() => {
      onComplete();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [onComplete]);
  
  return (
    <AnimatePresence>
      <AnimationContainer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <StarField>{stars}</StarField>
        
        <StellarLogo
          initial={{ scale: 0.2, opacity: 0 }}
          animate={{ 
            scale: [0.2, 1.2, 1],
            opacity: 1,
            z: [0, 100, 0]
          }}
          transition={{ 
            duration: 2,
            times: [0, 0.6, 1],
            ease: "easeOut"
          }}
        >
          <LogoInner>
            <StellarLogoSVG />
          </LogoInner>
        </StellarLogo>
        
        <BrandText
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          MilkyPay
        </BrandText>
      </AnimationContainer>
    </AnimatePresence>
  );
};

export default SpaceIntro;