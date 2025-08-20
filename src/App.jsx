import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/layout/Header';
import AuthForm from './components/auth/AuthForm';
import LoginPopup from './components/auth/LoginPopup';
// import CreatorRoutes from './routes/CreatorRoutes'; // disabled: creator feature removed
import WelcomePage from './components/layout/WelcomePage';

// Test Series Components
import TestSeriesList from './components/testSeries/TestSeriesList';
import TestSeriesCreator from './components/testSeries/TestSeriesCreator';
import TestSeriesSubscription from './components/testSeries/TestSeriesSubscription';
import TestSeriesDashboard from './components/testSeries/TestSeriesDashboard';
import TestSeriesQuizCreator from './components/testSeries/TestSeriesQuizCreator';
import TestSeriesAIGenerator from './components/testSeries/TestSeriesAIGenerator';
import TestAttemptViewer from './components/testSeries/TestAttemptViewer';
import TestAttemptHistory from './components/testSeries/TestAttemptHistory';
import TestSeriesTestsList from './components/testSeries/TestSeriesTestsList';
import TestAttemptDetails from './components/testSeries/TestAttemptDetails'; // FIXED: Added proper import

// Quiz Components (simplified)
import QuizTaker from './components/quiz/QuizTaker';
import AIQuizGenerator from './components/quiz/AIQuizGenerator';
import UserAttempts from './components/quiz/UserAttempts';
import LeaderBoard from './components/quiz/LeaderBoard';    // FIXED: Correct import
import AdminDashboard from './components/admin/AdminDashboard';
import PrivacyPolicy from './components/legal/PrivacyPolicy';
import TermsAndConditions from './components/legal/TermsAndConditions';
import RefundPolicy from './components/legal/RefundPolicy';
import ContactUs from './components/legal/ContactUs';
import { db } from './lib/firebase';
import { doc, updateDoc, increment, getDoc } from 'firebase/firestore';

const AppContent = () => {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentView, setCurrentView] = useState('welcome');
  const [selectedItem, setSelectedItem] = useState(null);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [isLoadingSeries, setIsLoadingSeries] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Count a free series view once per browser (localStorage guard)
  const countFreeSeriesView = async (series) => {
    try {
      if (!series || series.isPaid) return;
      const storageKey = `viewed-series-${series.id}`;
      if (localStorage.getItem(storageKey)) return;
      localStorage.setItem(storageKey, '1');
      await updateDoc(doc(db, 'test-series', series.id), {
        totalSubscribers: increment(1),
        totalViews: increment(1)
      });
    } catch (error) {
      console.error('Failed to record free series view:', error);
    }
  };

  // Sync URL with currentView state
  useEffect(() => {
    const path = location.pathname;
    
    // Don't sync if we're on login page
    if (path === '/login') {
      return;
    }
    
    // Map URL paths to currentView states
    if (path === '/welcome' || path === '/') {
      setCurrentView('welcome');
    } else if (path === '/test-series') {
      setCurrentView('test-series');
    } else if (path === '/create-series') {
      setCurrentView('create-series');
    } else if (path === '/ai-generator') {
      setCurrentView('ai-generator');
    } else if (path === '/test-history') {
      setCurrentView('test-history');
    } else if (path.startsWith('/series/')) {
      // Handle series-specific routes
      const seriesId = path.split('/')[2];
      if (path.includes('/dashboard')) {
        setCurrentView('series-dashboard');
        // You might want to load the series data here
      } else if (path.includes('/tests')) {
        setCurrentView('view-tests');
      } else if (path.includes('/subscribe')) {
        setCurrentView('subscribe-series');
      } else if (path.includes('/create-manual-test')) {
        setCurrentView('create-manual-test');
      } else if (path.includes('/create-ai-test')) {
        setCurrentView('create-ai-test');
      } else {
        // Default to dashboard for series routes
        setCurrentView('series-dashboard');
      }
    } else if (path.startsWith('/test/')) {
      // Handle test-specific routes
      if (path.includes('/take')) {
        setCurrentView('take-test');
      } else if (path.includes('/leaderboard')) {
        setCurrentView('test-leaderboard');
      } else {
        // Default to take-test for test routes
        setCurrentView('take-test');
      }
    } else if (path.startsWith('/attempt/')) {
      setCurrentView('attempt-details');
    } else if (path.startsWith('/quiz/')) {
      if (path.includes('/take')) {
        setCurrentView('take-quiz');
      } else if (path.includes('/leaderboard')) {
        setCurrentView('leaderboard');
      } else {
        // Default to take-quiz for quiz routes
        setCurrentView('take-quiz');
      }
    } else {
      // Fallback: if URL doesn't match any known route, go to welcome page
      setCurrentView('welcome');
    }
  }, [location.pathname]);

  // Ensure selected test series is loaded when deep-linking to series routes
  useEffect(() => {
    const path = location.pathname;
    if (!path.startsWith('/series/')) return;

    const seriesId = path.split('/')[2];
    if (!seriesId) return;

    if (!selectedItem || selectedItem.id !== seriesId) {
      setIsLoadingSeries(true);
      getDoc(doc(db, 'test-series', seriesId))
        .then((snap) => {
          if (snap.exists()) {
            setSelectedItem({ id: snap.id, ...snap.data() });
          }
        })
        .catch((err) => {
          console.error('Failed to load test series:', err);
        })
        .finally(() => setIsLoadingSeries(false));
    }
  }, [location.pathname]);

  useEffect(() => {
    setPageLoaded(true);
  }, []);

  // Navigation handlers with URL updates
  const handleCreateSeries = () => {
    if (!requireLogin('create-series')) return;
    if (!isAdmin) return;
    setCurrentView('create-series');
    setSelectedItem(null);
    navigate('/create-series');
  };

  const handleViewSeries = (series) => {
    if (!requireLoginForTestSeries('view-series')) return;
    countFreeSeriesView(series);
    setSelectedItem(series);
    setCurrentView('series-dashboard');
    navigate(`/series/${series.id}/dashboard`);
  };

  const handleSubscribeSeries = (series) => {
    if (!requireLoginForTestSeries('subscribe-series')) return;
    setSelectedItem(series);
    setCurrentView('subscribe-series');
    navigate(`/series/${series.id}/subscribe`);
  };

  const handleTakeQuiz = (quiz) => {
    if (!requireLogin('take-quiz')) return;
    setSelectedItem(quiz);
    setCurrentView('take-quiz');
    navigate(`/quiz/${quiz.id}/take`);
  };

  // View Tests handler
  const handleViewTests = (testSeries) => {
    if (!requireLoginForTestSeries('view-tests')) return;
    countFreeSeriesView(testSeries);
    setSelectedItem(testSeries);
    setCurrentView('view-tests');
    navigate(`/series/${testSeries.id}/tests`);
  };

  // Individual test leaderboard handler
  const handleViewLeaderboard = (test) => {
    if (!requireLogin('view-leaderboard')) return;
    setSelectedItem(test);
    setCurrentView('test-leaderboard');
    navigate(`/test/${test.id}/leaderboard`);
  };

  // Test attempt handlers
  const handleTakeTest = (test, testSeries) => {
    if (!requireLogin('take-test')) return;
    setSelectedItem({ test, testSeries });
    setCurrentView('take-test');
    navigate(`/test/${test.id}/take`);
  };

  const handleViewTestHistory = () => {
    if (!requireLogin('view-test-history')) return;
    setCurrentView('test-history');
    setSelectedItem(null);
    navigate('/test-history');
  };

  // ENHANCED: Better test completion handling
  const handleTestCompleted = (attemptData) => {
    console.log('Test completed successfully:', attemptData);
    // Navigate to attempt details immediately after test completion
    setSelectedItem(attemptData);
    setCurrentView('attempt-details');
    navigate(`/attempt/${attemptData.id}`);
  };

  const handleViewAttemptDetails = (attempt) => {
    setSelectedItem(attempt);
    setCurrentView('attempt-details');
    navigate(`/attempt/${attempt.id}`);
  };

  const handleBackToSeries = () => {
    setCurrentView('test-series');
    setSelectedItem(null);
    navigate('/test-series');
  };

  const handleBackToDashboard = () => {
    setCurrentView('series-dashboard');
    // Keep selectedItem as it contains the test series data
    if (selectedItem && selectedItem.id) {
      navigate(`/series/${selectedItem.id}/dashboard`);
    }
  };

  // FIXED: Better back navigation for attempt details
  const handleBackToHistory = () => {
    setCurrentView('test-history');
    setSelectedItem(null);
    navigate('/test-history');
  };

  // Back to tests list handler
  const handleBackToTestsList = () => {
    setCurrentView('view-tests');
    // Keep selectedItem as it contains the test series data
    if (selectedItem && selectedItem.id) {
      navigate(`/series/${selectedItem.id}/tests`);
    }
  };

  const handleSeriesCreated = () => {
    setCurrentView('test-series');
    setSelectedItem(null);
    navigate('/test-series');
  };

  const handleSubscriptionSuccess = () => {
    setCurrentView('test-series');
    setSelectedItem(null);
    navigate('/test-series');
  };

  // Test creation handlers
  const handleCreateManualTest = () => {
    if (!isAdmin) return;
    setCurrentView('create-manual-test');
    if (selectedItem && selectedItem.id) {
      navigate(`/series/${selectedItem.id}/create-manual-test`);
    }
  };

  const handleCreateAITest = () => {
    if (!isAdmin) return;
    setCurrentView('create-ai-test');
    if (selectedItem && selectedItem.id) {
      navigate(`/series/${selectedItem.id}/create-ai-test`);
    }
  };

  const handleTestCreated = (newTest) => {
    // Go back to dashboard after creating test
    setCurrentView('series-dashboard');
    console.log('Test created successfully:', newTest);
    if (selectedItem && selectedItem.id) {
      navigate(`/series/${selectedItem.id}/dashboard`);
    }
  };

  // Header navigation handlers
  const handleViewAttempts = () => {
    if (!requireLogin('view-attempts')) return;
    setCurrentView('test-history');
    setSelectedItem(null); // Clear selected item when going to history
    navigate('/test-history');
  };

  const handleViewHome = () => {
    setCurrentView('test-series');
    setSelectedItem(null);
    navigate('/test-series');
  };

  const handleViewTestSeries = () => {
    setCurrentView('test-series');
    setSelectedItem(null);
    navigate('/test-series');
  };

  const handleGetStarted = () => {
    setCurrentView('test-series');
    setSelectedItem(null);
    navigate('/test-series');
  };

  const handleAIGenerator = () => {
    if (!requireLogin('ai-generator')) return;
    if (!isAdmin) return;
    if (selectedItem && selectedItem.id) {
      // If we have a selected test series, create AI test for it
      setCurrentView('create-ai-test');
      navigate(`/series/${selectedItem.id}/create-ai-test`);
    } else {
      // Otherwise, go to standalone AI generator
      setCurrentView('ai-generator');
      navigate('/ai-generator');
    }
  };

  const handleViewWelcome = () => {
    setCurrentView('welcome');
    setSelectedItem(null);
    navigate('/welcome');
  };

  if (currentUser === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
            <div className="absolute inset-3 rounded-full border-4 border-blue-300 border-t-transparent animate-spin animate-reverse"></div>
            <div className="absolute inset-6 rounded-full border-2 border-blue-200 border-t-transparent animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Loading QuizMaster
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Preparing your test series platform...
          </p>
        </div>
      </div>
    );
  }

  // Helper function to check if user needs to be logged in for an action
  const requireLogin = (action) => {
    if (!currentUser) {
      setPendingAction(action);
      setShowLoginPopup(true);
      return false;
    }
    return true;
  };

  // Helper function to check if user needs to be logged in for test series actions
  const requireLoginForTestSeries = (action) => {
    if (!currentUser) {
      setPendingAction(action);
      setShowLoginPopup(true);
      return false;
    }
    return true;
  };

  // Handle login popup actions
  const handleLoginClick = () => {
    setShowLoginPopup(false);
    // Navigate to login page
    navigate('/login');
  };

  const handleCloseLoginPopup = () => {
    setShowLoginPopup(false);
    setPendingAction(null);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'welcome':
        return (
          <div className="animate-fade-in">
            <WelcomePage
              onGetStarted={handleGetStarted}
              onCreateSeries={handleCreateSeries}
              onViewExistingSeries={handleViewTestSeries}
            />
          </div>
        );

      case 'create-series':
        return (
          <div className="animate-fade-in">
            {isAdmin ? (
              <TestSeriesCreator
                onBack={handleBackToSeries}
                onSeriesCreated={handleSeriesCreated}
              />
            ) : (
              <div className="text-center text-red-400 font-semibold p-6">Access denied: Admins only</div>
            )}
          </div>
        );

      case 'subscribe-series':
        if (isLoadingSeries || !selectedItem) {
          return (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center text-gray-400">Loading series...</div>
            </div>
          );
        }
        return (
          <div className="animate-fade-in">
            <TestSeriesSubscription
              testSeries={selectedItem}
              onSuccess={handleSubscriptionSuccess}
              onCancel={handleBackToSeries}
            />
          </div>
        );

      case 'series-dashboard':
        if (isLoadingSeries || !selectedItem) {
          return (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center text-gray-400">Loading series...</div>
            </div>
          );
        }
        return (
          <div className="animate-fade-in">
            <TestSeriesDashboard
              testSeries={selectedItem}
              onBack={handleBackToSeries}
              onCreateManualTest={isAdmin ? handleCreateManualTest : undefined}
              onCreateAITest={isAdmin ? handleCreateAITest : undefined}
              onTakeTest={handleTakeTest}
              onViewLeaderboard={handleViewLeaderboard}
              onEditSeries={() => console.log('Edit series:', selectedItem?.id)}
            />
          </div>
        );

      case 'create-manual-test':
        return (
          <div className="animate-fade-in">
            {isAdmin ? (
              <TestSeriesQuizCreator
                testSeries={selectedItem}
                onBack={handleBackToDashboard}
                onQuizCreated={handleTestCreated}
              />
            ) : (
              <div className="text-center text-red-400 font-semibold p-6">Access denied: Admins only</div>
            )}
          </div>
        );

      case 'create-ai-test':
        return (
          <div className="animate-fade-in">
            {isAdmin ? (
              <TestSeriesAIGenerator
                testSeries={selectedItem}
                onBack={handleBackToDashboard}
                onQuizCreated={handleTestCreated}
              />
            ) : (
              <div className="text-center text-red-400 font-semibold p-6">Access denied: Admins only</div>
            )}
          </div>
        );

      // View Tests Page
      case 'view-tests':
        if (isLoadingSeries || !selectedItem) {
          return (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center text-gray-400">Loading series...</div>
            </div>
          );
        }
        return (
          <div className="animate-fade-in">
            <TestSeriesTestsList
              testSeries={selectedItem}
              onBack={handleBackToSeries}
              onTakeTest={handleTakeTest}
              onViewLeaderboard={handleViewLeaderboard}
            />
          </div>
        );

      // Test attempt views
      case 'take-test':
        return (
          <div className="animate-fade-in">
            <TestAttemptViewer
              test={selectedItem.test}
              testSeries={selectedItem.testSeries}
              onBack={() => {
                // Smart back navigation
                if (selectedItem.testSeries) {
                  setSelectedItem(selectedItem.testSeries);
                  setCurrentView('view-tests');
                } else {
                  handleBackToDashboard();
                }
              }}
              onComplete={handleTestCompleted} // Direct navigation to attempt details
            />
          </div>
        );

      case 'test-history':
        return (
          <div className="animate-fade-in">
            <TestAttemptHistory
              onBack={handleBackToSeries}
              onViewAttempt={handleViewAttemptDetails}
            />
          </div>
        );

      // ENHANCED: Test Attempt Details with proper component
      case 'attempt-details':
        return (
          <div className="animate-fade-in">
            <TestAttemptDetails
              attempt={selectedItem}
              onBack={handleBackToHistory} // Better back navigation
              testSeriesId={selectedItem?.testSeriesId}
            />
          </div>
        );

      // Individual test leaderboard
      case 'test-leaderboard':
        return (
          <div className="animate-fade-in">
            <LeaderBoard
              quizId={selectedItem?.id}
              quizTitle={selectedItem?.title}
              testSeriesId={selectedItem?.testSeriesId}
              onBack={() => {
                // Fixed navigation logic
                if (selectedItem?.testSeriesId) {
                  // If we have a testSeriesId, we need to go back to the tests list
                  // First, retrieve the test series data
                  const seriesData = { id: selectedItem.testSeriesId };
                  setSelectedItem(seriesData);
                  setCurrentView('view-tests');
                } else {
                  // Otherwise go back to the main series list
                  handleBackToSeries();
                }
              }}
              isIndividualTest={true}
            />
          </div>
        );

      case 'take-quiz':
        return (
          <div className="animate-fade-in">
            <QuizTaker
              quiz={selectedItem}
              onBack={handleBackToSeries}
              onViewLeaderboard={(quiz) => {
                setSelectedItem(quiz);
                setCurrentView('leaderboard');
              }}
            />
          </div>
        );

      case 'ai-generator':
        return (
          <div className="animate-fade-in">
            <AIQuizGenerator
              onBack={handleBackToSeries}
              onQuizCreated={handleSeriesCreated}
              testSeriesId={selectedItem?.id}
            />
          </div>
        );

      case 'attempts':
        return (
          <div className="animate-fade-in">
            <UserAttempts
              onBack={handleBackToSeries}
            />
          </div>
        );

      // General quiz leaderboard (different from test leaderboard)
      case 'leaderboard':
        return (
          <div className="animate-fade-in">
            <LeaderBoard
              quizId={selectedItem?.id}
              quizTitle={selectedItem?.title}
              onBack={handleBackToSeries}
              isIndividualTest={false}
            />
          </div>
        );

      case 'test-series':
        return (
          <div className="animate-fade-in">
            <TestSeriesList
              onCreateSeries={isAdmin ? handleCreateSeries : undefined}
              onViewSeries={handleViewSeries}
              onSubscribeSeries={handleSubscribeSeries}
              onTakeTest={handleTakeTest}
              onViewTests={handleViewTests}
            />
          </div>
        );

      default:
        return (
          <div className="animate-fade-in">
            <TestSeriesList
              onCreateSeries={isAdmin ? handleCreateSeries : undefined}
              onViewSeries={handleViewSeries}
              onSubscribeSeries={handleSubscribeSeries}
              onTakeTest={handleTakeTest}
              onViewTests={handleViewTests}
            />
          </div>
        );
    }
  };

  // Don't show header on welcome page
  const showHeader = currentView !== 'welcome';

  return (
    <div className={`flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-500 ${pageLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Header - only shown when not on welcome page */}
      {showHeader && (
        <Header 
          onViewAttempts={handleViewAttempts}
          onViewHome={handleViewHome}
          onViewWelcome={handleViewWelcome}
          onAIGenerator={handleAIGenerator}
          onLoginClick={handleLoginClick}
          currentView={currentView}
        />
      )}
      
      {/* Main Content */}
      <main className={`flex-grow ${showHeader ? 'pt-20' : ''} relative`}>
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/5 to-purple-400/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-green-400/5 to-blue-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          <ErrorBoundary>
            {renderContent()}
          </ErrorBoundary>
        </div>
      </main>

      {/* Login Popup */}
      <LoginPopup 
        isOpen={showLoginPopup}
        onClose={handleCloseLoginPopup}
        onLoginClick={handleLoginClick}
      />
      
      {/* Professional Footer - only shown when not on welcome page */}
      {showHeader && (
        <footer className="w-full bg-gradient-to-br from-gray-900 via-blue-900/90 to-gray-900 border-t border-blue-800/30 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.02%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
          
          <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
            {/* Main Footer Content */}
            <div className="w-full flex flex-col items-center justify-center mb-12">
              <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8">
              
              
              {/* Quick Links */}
                  <div>
                <h4 className="text-lg font-semibold text-white mb-6">Quick Links</h4>
                <ul className="space-y-3">
                  <li>
                    <button 
                      onClick={handleViewTestSeries}
                      className="text-gray-400 hover:text-blue-400 transition-colors duration-200 text-sm flex items-center gap-2 group"
                    >
                      <span className="w-1 h-1 bg-blue-400 rounded-full group-hover:scale-150 transition-transform"></span>
                      Test Series
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={handleViewAttempts}
                      className="text-gray-400 hover:text-purple-400 transition-colors duration-200 text-sm flex items-center gap-2 group"
                    >
                      <span className="w-1 h-1 bg-purple-400 rounded-full group-hover:scale-150 transition-transform"></span>
                      My Attempts
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={handleAIGenerator}
                      className="text-gray-400 hover:text-green-400 transition-colors duration-200 text-sm flex items-center gap-2 group"
                    >
                      <span className="w-1 h-1 bg-green-400 rounded-full group-hover:scale-150 transition-transform"></span>
                      AI Generator
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={handleViewHome}
                      className="text-gray-400 hover:text-yellow-400 transition-colors duration-200 text-sm flex items-center gap-2 group"
                    >
                      <span className="w-1 h-1 bg-yellow-400 rounded-full group-hover:scale-150 transition-transform"></span>
                      Dashboard
                    </button>
                  </li>
                </ul>
                </div>
                
              {/* Features */}
                  <div>
                <h4 className="text-lg font-semibold text-white mb-6">Features</h4>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-gray-400">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    AI-Powered Test Generation
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-400">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Comprehensive Analytics
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Progress Tracking
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-400">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    Performance Insights
                  </li>
                </ul>
                  </div>
              
              {/* Contact & Support */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-6">Support</h4>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-gray-400">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    support@quizmaster.com
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-400">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    24/7 Available
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-400">
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Secure & Reliable
                  </li>
                </ul>
              </div>
            </div>
            </div>

            {/* Bottom Section */}
            <div className="pt-8 border-t border-gray-700/50">
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="text-sm text-gray-400 text-center">
                  © {new Date().getFullYear()} QuizMaster. All rights reserved. | 
                  <a href="#" className="hover:text-blue-400 transition-colors duration-200 ml-1">Privacy Policy</a> | 
                  <a href="#" className="hover:text-blue-400 transition-colors duration-200 ml-1">Terms of Service</a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

// Enhanced Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[500px] p-8">
          <div className="text-center max-w-lg mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/20 dark:to-red-800/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-red-500 text-3xl">⚠️</span>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Oops! Something went wrong
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              We encountered an unexpected error. Don't worry, your data is safe. 
              Please try refreshing the page or go back to the home page.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
              >
                🔄 Refresh Page
              </button>
              
              <button
                onClick={() => window.location.href = '/test-series'}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
              >
                🏠 Go Home
              </button>
            </div>

            {/* Error Details for Development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 mb-2">
                  Show Error Details (Development)
                </summary>
                <pre className="mt-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs overflow-auto max-h-40">
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const ApplyCreator = () => {
  const navigate = useNavigate();

  const handleApply = () => {
    // Creator features removed; redirect to home
    navigate('/test-series');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 p-8">
      <div className="max-w-2xl mx-auto bg-gray-800/80 backdrop-blur-xl border border-gray-700/60 rounded-xl p-8">
        <h1 className="text-3xl font-bold text-white mb-4">Become a Creator</h1>
        <p className="text-gray-300 mb-6">
          Join our platform as a creator to publish your own quizzes and test series.
        </p>
        
        <button 
          onClick={handleApply}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Apply Now
        </button>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            {/* Creator routes removed */}
            <Route path="/apply-creator" element={<ApplyCreator />} />
            <Route path="/login" element={<AuthForm />} />
            <Route path="/" element={<AppContent />} />
            <Route path="/welcome" element={<AppContent />} />
            <Route path="/test-series" element={<AppContent />} />
            <Route path="/create-series" element={<AppContent />} />
            <Route path="/ai-generator" element={<AppContent />} />
            <Route path="/test-history" element={<AppContent />} />
            {/* Legal pages */}
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/refunds" element={<RefundPolicy />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/series/:seriesId/*" element={<AppContent />} />
            <Route path="/test/:testId/*" element={<AppContent />} />
            <Route path="/attempt/:attemptId" element={<AppContent />} />
            <Route path="/quiz/:quizId/*" element={<AppContent />} />
            <Route path="*" element={<AppContent />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
