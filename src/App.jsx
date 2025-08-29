import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
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
import { logger } from './utils/logger';

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
  const { isDark } = useTheme();

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
      logger.error('Failed to record free series view:', error);
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
        // Load test data from URL
        const testId = path.split('/')[2];
        if (testId && (!selectedItem || selectedItem.test?.id !== testId)) {
          setIsLoadingSeries(true);
          getDoc(doc(db, 'quizzes', testId))
            .then((snap) => {
              if (snap.exists()) {
                const testData = { id: snap.id, ...snap.data() };
                // Also try to load the test series if available
                if (testData.testSeriesId) {
                  return getDoc(doc(db, 'test-series', testData.testSeriesId))
                    .then((seriesSnap) => {
                      if (seriesSnap.exists()) {
                        const seriesData = { id: seriesSnap.id, ...seriesSnap.data() };
                        setSelectedItem({ test: testData, testSeries: seriesData });
                      } else {
                        setSelectedItem({ test: testData });
                      }
                    });
                } else {
                  setSelectedItem({ test: testData });
                }
              } else {
                logger.error('Test not found:', testId);
                navigate('/test-series');
              }
            })
            .catch((err) => {
              logger.error('Failed to load test:', err);
              navigate('/test-series');
            })
            .finally(() => setIsLoadingSeries(false));
        }
      } else if (path.includes('/leaderboard')) {
        logger.log('App: Loading test leaderboard for path:', path);
        setCurrentView('test-leaderboard');
        // Load test data from URL for leaderboard
        const testId = path.split('/')[2];
        logger.log('App: Extracted testId:', testId);
        if (testId && (!selectedItem || selectedItem.id !== testId)) {
          logger.log('App: Loading test data from Firestore for testId:', testId);
          setIsLoadingSeries(true);
          getDoc(doc(db, 'quizzes', testId))
            .then((snap) => {
              if (snap.exists()) {
                const testData = { id: snap.id, ...snap.data() };
                logger.log('App: Test data loaded:', testData);
                // Also try to load the test series if available
                if (testData.testSeriesId) {
                  return getDoc(doc(db, 'test-series', testData.testSeriesId))
                    .then((seriesSnap) => {
                      if (seriesSnap.exists()) {
                        const seriesData = { id: seriesSnap.id, ...seriesSnap.data() };
                        logger.log('App: Series data loaded:', seriesData);
                        setSelectedItem({ ...testData, testSeriesId: testData.testSeriesId });
                      } else {
                        setSelectedItem(testData);
                      }
                    });
                } else {
                  setSelectedItem(testData);
                }
              } else {
                logger.error('Test not found:', testId);
                navigate('/test-series');
              }
            })
            .catch((err) => {
              logger.error('Failed to load test:', err);
              navigate('/test-series');
            })
            .finally(() => setIsLoadingSeries(false));
        } else {
          logger.log('App: Test data already loaded or no testId:', { testId, selectedItemId: selectedItem?.id });
        }
      } else {
        // Default to take-test for test routes
        setCurrentView('take-test');
      }
    } else if (path.startsWith('/attempt/')) {
      setCurrentView('attempt-details');
      // Load attempt data from URL
      const attemptId = path.split('/')[2];
      if (attemptId && (!selectedItem || selectedItem.id !== attemptId)) {
        setIsLoadingSeries(true);
        getDoc(doc(db, 'test-attempts', attemptId))
          .then((snap) => {
            if (snap.exists()) {
              setSelectedItem({ id: snap.id, ...snap.data() });
            } else {
              logger.error('Attempt not found:', attemptId);
              // Redirect to test history if attempt not found
              navigate('/test-history');
            }
          })
          .catch((err) => {
            logger.error('Failed to load attempt:', err);
            // Redirect to test history on error
            navigate('/test-history');
          })
          .finally(() => setIsLoadingSeries(false));
      }
    } else if (path.startsWith('/quiz/')) {
      if (path.includes('/take')) {
        setCurrentView('take-quiz');
        // Load quiz data from URL
        const quizId = path.split('/')[2];
        if (quizId && (!selectedItem || selectedItem.id !== quizId)) {
          setIsLoadingSeries(true);
          getDoc(doc(db, 'quizzes', quizId))
            .then((snap) => {
              if (snap.exists()) {
                const quizData = { id: snap.id, ...snap.data() };
                setSelectedItem(quizData);
              } else {
                console.error('Quiz not found:', quizId);
                navigate('/test-series');
              }
            })
            .catch((err) => {
              console.error('Failed to load quiz:', err);
              navigate('/test-series');
            })
            .finally(() => setIsLoadingSeries(false));
        }
      } else if (path.includes('/leaderboard')) {
        logger.log('App: Loading quiz leaderboard for path:', path);
        setCurrentView('leaderboard');
        // Load quiz data from URL for leaderboard
        const quizId = path.split('/')[2];
        logger.log('App: Extracted quizId:', quizId);
        if (quizId && (!selectedItem || selectedItem.id !== quizId)) {
          logger.log('App: Loading quiz data from Firestore for quizId:', quizId);
          setIsLoadingSeries(true);
          getDoc(doc(db, 'quizzes', quizId))
            .then((snap) => {
              if (snap.exists()) {
                const quizData = { id: snap.id, ...snap.data() };
                logger.log('App: Quiz data loaded:', quizData);
                setSelectedItem(quizData);
              } else {
                logger.error('Quiz not found:', quizId);
                navigate('/test-series');
            }
            })
            .catch((err) => {
              logger.error('Failed to load quiz:', err);
              navigate('/test-series');
            })
            .finally(() => setIsLoadingSeries(false));
        } else {
          logger.log('App: Quiz data already loaded or no quizId:', { quizId, selectedItemId: selectedItem?.id });
        }
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
          logger.error('Failed to load test series:', err);
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
    logger.log('Test completed successfully:', attemptData);
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white to-white dark:from-gray-900 dark:to-gray-800">
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
        if (isLoadingSeries || !selectedItem?.test) {
          return (
            <div className="animate-fade-in">
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-lg text-gray-600 dark:text-gray-300">Loading test data...</p>
                </div>
              </div>
            </div>
          );
        }
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
        if (isLoadingSeries) {
          return (
            <div className="animate-fade-in">
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-lg text-gray-600 dark:text-gray-300">Loading quiz data...</p>
                </div>
              </div>
            </div>
          );
        }
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
        if (isLoadingSeries) {
          return (
            <div className="animate-fade-in">
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-lg text-gray-600 dark:text-gray-300">Loading quiz data...</p>
                </div>
              </div>
            </div>
          );
        }
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
        if (isLoadingSeries) {
          return (
            <div className="animate-fade-in">
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-lg text-gray-600 dark:text-gray-300">Loading quiz data...</p>
                </div>
              </div>
            </div>
          );
        }
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
    <div className={`flex flex-col min-h-screen transition-all duration-500 ${pageLoaded ? 'opacity-100' : 'opacity-0'} ${
      isDark ? 'bg-gray-900' : 'bg-white'
    }`}>
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
          <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl animate-pulse transition-all duration-500 ${
            isDark ? 'bg-blue-400/5' : 'bg-blue-400/10'
          }`}></div>
          <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl animate-pulse delay-1000 transition-all duration-500 ${
            isDark ? 'bg-green-400/5' : 'bg-green-400/10'
          }`}></div>
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
        pendingAction={pendingAction}
      />
      
      {/* Professional Footer - only shown when not on welcome page */}
      {showHeader && (
        <Footer />
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
