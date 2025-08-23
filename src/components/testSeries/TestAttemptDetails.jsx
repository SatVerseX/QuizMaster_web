import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { FiArrowLeft, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import TestAttemptHeader from './TestAttemptHeader';
import PerformanceOverview from './PerformanceOverview';
import QuestionNavigator from './QuestionNavigator';
import DownloadModal from './DownloadModal';
import ShareModal from './ShareModal';

const TestAttemptDetails = ({ attempt, onBack, testSeriesId, testSeries: propTestSeries }) => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const [testDetails, setTestDetails] = useState(null);
  const [testSeries, setTestSeries] = useState(propTestSeries);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRecommendations, setShowRecommendations] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  // Early validation
  useEffect(() => {
    if (!attempt) {
      setError('No attempt data provided');
      setLoading(false);
      return;
    }
    
    if (!attempt.id && !attempt.testId) {
      setError('Invalid attempt data - missing required IDs');
      setLoading(false);
      return;
    }

    loadTestDetails();
  }, [attempt]);

  // Update testSeries when prop changes
  useEffect(() => {
    if (propTestSeries) {
      setTestSeries(propTestSeries);
    }
  }, [propTestSeries]);

  const loadTestDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate attempt object
      if (!attempt) {
        throw new Error('Attempt data is not available');
      }

      // Try to load test details if testId is available
      if (attempt.testId) {
        try {
          const testDoc = await getDoc(doc(db, 'quizzes', attempt.testId));
          if (testDoc.exists()) {
            setTestDetails(testDoc.data());
          } else {
            console.warn('Test document not found:', attempt.testId);
            // Continue without test details
          }
        } catch (testError) {
          console.warn('Error loading test details:', testError);
          // Continue without test details - don't fail the whole component
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Error in loadTestDetails:', error);
      setError(error.message || 'Failed to load test details');
      setLoading(false);
    }
  };

  const getQuestionAnalysis = () => {
    // Provide fallback if testDetails is not available
    if (!testDetails || !testDetails.questions) {
      // Try to use questions from attempt if available
      if (attempt?.questions) {
        return attempt.questions.map((question, index) => {
          const userAnswer = attempt.answers?.[index];
          const isCorrect = userAnswer === question.correctAnswer;
          const isFlagged = attempt.flaggedQuestions?.includes(index);
          const isAnswered = userAnswer !== undefined;
          
          return {
            ...question,
            index,
            userAnswer,
            isCorrect,
            isFlagged,
            isAnswered,
            status: isCorrect ? 'correct' : isAnswered ? 'incorrect' : 'skipped'
          };
        });
      }
      return [];
    }
    
    return testDetails.questions.map((question, index) => {
      const userAnswer = attempt.answers?.[index];
      const isCorrect = userAnswer === question.correctAnswer;
      const isFlagged = attempt.flaggedQuestions?.includes(index);
      const isAnswered = userAnswer !== undefined;
      
      return {
        ...question,
        index,
        userAnswer,
        isCorrect,
        isFlagged,
        isAnswered,
        status: isCorrect ? 'correct' : isAnswered ? 'incorrect' : 'skipped'
      };
    });
  };

  // Error state
  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-all duration-500 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20' 
          : 'bg-white'
      }`}>
        <div className="max-w-md mx-auto text-center p-8">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiAlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h3 className={`text-2xl font-bold mb-4 ${
            isDark ? 'text-white' : 'text-slate-800'
          }`}>Unable to Load Details</h3>
          <p className={`mb-6 ${
            isDark ? 'text-gray-400' : 'text-slate-600'
          }`}>{error}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onBack}
              className={`font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 ${
                isDark 
                  ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                  : 'bg-slate-600 hover:bg-slate-700 text-white'
              }`}
            >
              <FiArrowLeft className="w-5 h-5" />
              Back to History
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <FiRefreshCw className="w-5 h-5" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-all duration-500 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20' 
          : 'bg-white'
      }`}>
        <div className="text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse ${
            isDark ? 'bg-blue-500/20' : 'bg-blue-100/60'
          }`}>
            <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className={`text-xl font-bold mb-2 ${
            isDark ? 'text-white' : 'text-slate-800'
          }`}>Loading Analysis</h3>
          <p className={isDark ? 'text-gray-400' : 'text-slate-600'}>Preparing your detailed performance report...</p>
        </div>
      </div>
    );
  }

  // Create safe attempt object with defaults
  const safeAttempt = {
    id: 'unknown',
    testTitle: 'Unknown Test',
    testId: null,
    score: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    timeSpent: 0,
    submittedAt: new Date(),
    answers: [],
    flaggedQuestions: [],
    ...attempt // Override with actual attempt data if available
  };

  const questionAnalysis = getQuestionAnalysis();

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20' 
        : 'bg-white'
    } relative overflow-hidden`}>
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl animate-pulse ${
          isDark ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10' : 'bg-gradient-to-r from-blue-400/8 to-indigo-400/6'
        }`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl animate-pulse delay-1000 ${
          isDark ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10' : 'bg-gradient-to-r from-indigo-400/6 to-purple-400/5'
        }`}></div>
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl animate-pulse delay-500 ${
          isDark ? 'bg-gradient-to-r from-green-500/5 to-blue-500/5' : 'bg-gradient-to-r from-blue-300/5 to-indigo-300/4'
        }`}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header with Error Boundary */}
        <ErrorBoundary fallback={<HeaderFallback onBack={onBack} />}>
          <TestAttemptHeader 
            attempt={safeAttempt}
            testSeries={testSeries || {}}
            onBack={onBack}
            onDownload={() => setShowDownloadModal(true)}
            onShare={() => setShowShareModal(true)}
          />
        </ErrorBoundary>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mt-8">
          {/* Performance Overview with Error Boundary */}
          <ErrorBoundary fallback={<ComponentFallback title="Performance Overview" />}>
            <PerformanceOverview 
              attempt={safeAttempt}
              questionAnalysis={questionAnalysis}
              showRecommendations={showRecommendations}
              setShowRecommendations={setShowRecommendations}
            />
          </ErrorBoundary>

          {/* Question Navigator with Error Boundary */}
          <ErrorBoundary fallback={<ComponentFallback title="Question Navigator" />}>
            <QuestionNavigator 
              questionAnalysis={questionAnalysis}
              attempt={safeAttempt}
            />
          </ErrorBoundary>
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={onBack}
            className={`group backdrop-blur-xl border rounded-xl px-6 sm:px-8 py-3 sm:py-4 font-medium transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:scale-105 w-full sm:w-auto ${
              isDark 
                ? 'bg-gradient-to-r from-gray-700/80 to-gray-600/80 border-gray-600/40 text-gray-300 hover:from-gray-600/80 hover:to-gray-500/80'
                : 'bg-white/90 border-slate-200/60 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-slate-200/40'
            }`}
          >
            <FiArrowLeft className="w-5 h-5" />
            <span>Back to Test History</span>
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl px-6 sm:px-8 py-3 sm:py-4 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-blue-500/25 w-full sm:w-auto"
          >
            <div className="relative flex items-center justify-center gap-3">
              
              <span>Retake Test</span>
            </div>
          </button>
        </div>

        {/* Modals with Error Boundaries */}
        {showDownloadModal && (
          <ErrorBoundary fallback={<ModalFallback onClose={() => setShowDownloadModal(false)} />}>
            <DownloadModal 
              attempt={safeAttempt}
              questionAnalysis={questionAnalysis}
              onClose={() => setShowDownloadModal(false)}
              loading={downloadLoading}
              setLoading={setDownloadLoading}
            />
          </ErrorBoundary>
        )}

        {showShareModal && (
          <ErrorBoundary fallback={<ModalFallback onClose={() => setShowShareModal(false)} />}>
            <ShareModal 
              attempt={safeAttempt}
              onClose={() => setShowShareModal(false)}
            />
          </ErrorBoundary>
        )}
      </div>
    </div>
  );
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Component Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <ComponentFallback title="Component" />;
    }

    return this.props.children;
  }
}

// Fallback Components
const HeaderFallback = ({ onBack }) => {
  const { isDark } = useTheme();
  return (
    <div className={`relative z-10 backdrop-blur-xl border rounded-2xl p-6 mb-8 shadow-2xl ${
      isDark 
        ? 'bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-gray-600/40' 
        : 'bg-white/90 border-slate-200/60 shadow-slate-200/40'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className={`p-3 rounded-xl transition-colors ${
              isDark 
                ? 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800'
            }`}
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className={`text-2xl font-bold ${
              isDark ? 'text-white' : 'text-slate-800'
            }`}>Test Results</h1>
            <p className={isDark ? 'text-gray-400' : 'text-slate-500'}>Unable to load test details</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ComponentFallback = ({ title }) => {
  const { isDark } = useTheme();
  return (
    <div className={`backdrop-blur-xl border rounded-2xl p-6 shadow-2xl ${
      isDark 
        ? 'bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-gray-600/40' 
        : 'bg-white/90 border-slate-200/60 shadow-slate-200/40'
    }`}>
      <div className="text-center">
        <FiAlertCircle className={`w-12 h-12 mx-auto mb-4 ${
          isDark ? 'text-gray-400' : 'text-slate-400'
        }`} />
        <h3 className={`text-lg font-bold mb-2 ${
          isDark ? 'text-white' : 'text-slate-800'
        }`}>{title} Unavailable</h3>
        <p className={isDark ? 'text-gray-400 text-sm' : 'text-slate-500 text-sm'}>Unable to load this component</p>
      </div>
    </div>
  );
};

const ModalFallback = ({ onClose }) => {
  const { isDark } = useTheme();
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`rounded-2xl p-6 max-w-md w-full ${
        isDark ? 'bg-gray-800' : 'bg-white border border-slate-200'
      }`}>
        <div className="text-center">
          <FiAlertCircle className={`w-12 h-12 mx-auto mb-4 ${
            isDark ? 'text-gray-400' : 'text-slate-400'
          }`} />
          <h3 className={`text-lg font-bold mb-2 ${
            isDark ? 'text-white' : 'text-slate-800'
          }`}>Modal Error</h3>
          <p className={`text-sm mb-6 ${
            isDark ? 'text-gray-400' : 'text-slate-500'
          }`}>Unable to load modal content</p>
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestAttemptDetails;
