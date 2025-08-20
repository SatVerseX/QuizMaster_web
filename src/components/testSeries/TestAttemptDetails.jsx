import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { FiArrowLeft, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import TestAttemptHeader from './TestAttemptHeader';
import PerformanceOverview from './PerformanceOverview';
import QuestionNavigator from './QuestionNavigator';
import DownloadModal from './DownloadModal';
import ShareModal from './ShareModal';

const TestAttemptDetails = ({ attempt, onBack, testSeriesId }) => {
  const { currentUser } = useAuth();
  const [testDetails, setTestDetails] = useState(null);
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiAlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Unable to Load Details</h3>
          <p className="text-gray-400 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onBack}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Loading Analysis</h3>
          <p className="text-gray-400">Preparing your detailed performance report...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20">
      <div className="max-w-7xl mx-auto p-3 sm:p-6">
        {/* Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Header with Error Boundary */}
        <ErrorBoundary fallback={<HeaderFallback onBack={onBack} />}>
          <TestAttemptHeader 
            attempt={safeAttempt}
            onBack={onBack}
            onDownload={() => setShowDownloadModal(true)}
            onShare={() => setShowShareModal(true)}
          />
        </ErrorBoundary>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
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
            className="group bg-gradient-to-r from-gray-700/80 to-gray-600/80 backdrop-blur-xl border border-gray-600/40 text-gray-300 rounded-xl px-6 sm:px-8 py-3 sm:py-4 font-medium hover:from-gray-600/80 hover:to-gray-500/80 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:scale-105 w-full sm:w-auto"
          >
            <FiArrowLeft className="w-5 h-5" />
            <span>Back to Test History</span>
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl px-6 sm:px-8 py-3 sm:py-4 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-blue-500/25 w-full sm:w-auto"
          >
            <div className="relative flex items-center justify-center gap-3">
              <FiRefreshCw className="w-5 h-5" />
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
const HeaderFallback = ({ onBack }) => (
  <div className="relative z-10 bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border border-gray-600/40 rounded-2xl p-6 mb-8 shadow-2xl">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="bg-gray-700/50 hover:bg-gray-600/50 p-3 rounded-xl text-gray-300 hover:text-white transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Test Results</h1>
          <p className="text-gray-400">Unable to load test details</p>
        </div>
      </div>
    </div>
  </div>
);

const ComponentFallback = ({ title }) => (
  <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border border-gray-600/40 rounded-2xl p-6 shadow-2xl">
    <div className="text-center">
      <FiAlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-bold text-white mb-2">{title} Unavailable</h3>
      <p className="text-gray-400 text-sm">Unable to load this component</p>
    </div>
  </div>
);

const ModalFallback = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full">
      <div className="text-center">
        <FiAlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Modal Error</h3>
        <p className="text-gray-400 text-sm mb-6">Unable to load modal content</p>
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

export default TestAttemptDetails;
