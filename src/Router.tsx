import React from 'react';
import { BrowserRouter, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import App from './App';
import ClaimPage from './components/ClaimPage';
import TestSMSPage from './components/TestSMSPage';

// Main router component
const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/claim/:claimId" element={<ClaimWrapper />} />
        <Route path="/test-sms" element={<TestSMSPage />} />
      </Routes>
    </BrowserRouter>
  );
};

// Wrapper for the claim route to handle parameters
const ClaimWrapper: React.FC = () => {
  const { claimId } = useParams<{ claimId: string }>();
  const navigate = useNavigate();
  
  // Handle claim completion
  const handleClaimComplete = () => {
    navigate('/');
  };
  
  return (
    <ClaimPage 
      claimId={claimId || ''} 
      onComplete={handleClaimComplete} 
    />
  );
};

export default Router;