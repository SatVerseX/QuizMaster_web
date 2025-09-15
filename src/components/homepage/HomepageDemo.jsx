import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import TestSeriesList from '../testSeries/TestSeriesList';

/**
 * Demo component showing how to use the enhanced homepage
 * 
 * Usage:
 * 1. Set useEnhancedHomepage={true} to use the new comprehensive homepage
 * 2. Set useEnhancedHomepage={false} to use the original TestSeriesList
 * 
 * The enhanced homepage includes:
 * - Hero section with search and CTAs
 * - Featured offers carousel
 * - Trending test series
 * - Most popular series
 * - Categories exploration
 * - Recent activity (for logged-in users)
 * - Success stories
 * - Platform statistics
 * - Interactive elements (FAB, chat, notifications)
 */
const HomepageDemo = () => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();

  // Mock handlers - replace with your actual implementations
  const handleCreateSeries = (series) => {
    console.log('Create series:', series);
    // Navigate to series creation page
  };

  const handleViewSeries = (series) => {
    console.log('View series:', series);
    // Navigate to series details page
  };

  const handleSubscribeSeries = (series) => {
    console.log('Subscribe to series:', series);
    // Handle subscription logic
  };

  const handleTakeTest = (test) => {
    console.log('Take test:', test);
    // Navigate to test taking page
  };

  const handleViewTests = (series) => {
    console.log('View tests for series:', series);
    // Navigate to tests list for the series
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Toggle between enhanced and original homepage */}
      <div className="p-4 text-center">
        <h1 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          QuizMaster Homepage Demo
        </h1>
        <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {currentUser ? `Welcome back, ${currentUser.displayName || 'Student'}!` : 'Welcome to QuizMaster!'}
        </p>
      </div>

      {/* Enhanced Homepage */}
      <TestSeriesList
        onCreateSeries={handleCreateSeries}
        onViewSeries={handleViewSeries}
        onSubscribeSeries={handleSubscribeSeries}
        onTakeTest={handleTakeTest}
        onViewTests={handleViewTests}
        useEnhancedHomepage={true} // Set to true for enhanced homepage
      />
    </div>
  );
};

export default HomepageDemo;
