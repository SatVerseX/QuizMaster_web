import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';

const LegalLayout = ({ children }) => {
  const navigate = useNavigate();

  const handleHome = () => navigate('/');
  const handleAttempts = () => navigate('/test-history');
  const handleAIGenerator = () => navigate('/ai-generator');

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header
        onViewAttempts={handleAttempts}
        onViewHome={handleHome}
        onAIGenerator={handleAIGenerator}
        currentView="legal"
      />
      <main className="flex-grow pt-20">
        {children}
      </main>
    </div>
  );
};

export default LegalLayout;


