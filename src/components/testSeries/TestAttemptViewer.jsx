import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { addDoc, collection, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { 
  FiClock, 
  FiArrowLeft, 
  FiCheck, 
  FiX,
  FiPlay,
  FiPause,
  FiSkipForward,
  FiFlag,
  FiAlertCircle,
  FiBookOpen,
  FiTarget,
  FiChevronRight,
  FiChevronLeft,
  FiZap,
  FiAward,
  FiTrendingUp,
  FiActivity,
  FiStar,
  FiEye,
  FiRefreshCw,
  FiMenu
} from 'react-icons/fi';
import { FaGraduationCap, FaBrain, FaRocket, FaTrophy, FaMagic } from 'react-icons/fa';

const TestAttemptViewer = ({ test, testSeries, onBack, onComplete }) => {
  const { currentUser } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState((test.timeLimit || 30) * 60);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [isTestCompleted, setIsTestCompleted] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState(null); // NEW: Track actual start time
  const [showMobileNav, setShowMobileNav] = useState(false); // NEW: Mobile navigation toggle

  const currentQuestion = test.questions[currentQuestionIndex];
  const totalQuestions = test.questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  // Timer effect
  useEffect(() => {
    if (!isTestStarted || isTestCompleted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTestStarted, isTestCompleted, timeLeft]);

  // Set start time when test begins
  useEffect(() => {
    if (isTestStarted && !startTime) {
      setStartTime(new Date());
    }
  }, [isTestStarted, startTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optionIndex
    }));
    // Auto-hide mobile nav after selection
    setShowMobileNav(false);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowMobileNav(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowMobileNav(false);
    }
  };

  const toggleFlag = () => {
    const newFlagged = new Set(flaggedQuestions);
    if (newFlagged.has(currentQuestionIndex)) {
      newFlagged.delete(currentQuestionIndex);
    } else {
      newFlagged.add(currentQuestionIndex);
    }
    setFlaggedQuestions(newFlagged);
  };

  const calculateScore = () => {
    let correct = 0;
    test.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correct++;
      }
    });
    return {
      correct,
      incorrect: totalQuestions - correct,
      percentage: Math.round((correct / totalQuestions) * 100)
    };
  };

  const handleSubmitTest = async () => {
    setLoading(true);
    try {
      const score = calculateScore();
      const now = new Date();
      
      // FIXED: Better date handling
      const timeSpentInSeconds = startTime ? Math.floor((now - startTime) / 1000) : ((test.timeLimit * 60) - timeLeft);
      const actualStartTime = startTime || new Date(now.getTime() - (timeSpentInSeconds * 1000));

      const attemptData = {
        testId: test.id,
        testTitle: test.title,
        testSeriesId: testSeries.id,
        testSeriesTitle: testSeries.title,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: currentUser.displayName || currentUser.email,
        
        answers,
        score: score.correct,
        totalQuestions,
        percentage: score.percentage,
        timeSpent: timeSpentInSeconds,
        flaggedQuestions: Array.from(flaggedQuestions),
        
        // FIXED: Safe date creation
        startedAt: actualStartTime,
        completedAt: now,
        
        difficulty: test.difficulty || 'medium',
        isAIGenerated: test.isAIGenerated || false
      };

      console.log('Submitting attempt data:', attemptData); // Debug log

      await addDoc(collection(db, 'test-attempts'), attemptData);

      await updateDoc(doc(db, 'quizzes', test.id), {
        totalAttempts: increment(1),
        totalScore: increment(score.correct),
      });

      setIsTestCompleted(true);
      onComplete(attemptData);
      
    } catch (error) {
      console.error('Error submitting test:', error);
      alert('Failed to submit test. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getAnsweredQuestionsCount = () => {
    return Object.keys(answers).length;
  };

  const getQuestionStatus = (index) => {
    if (answers.hasOwnProperty(index)) {
      return flaggedQuestions.has(index) ? 'answered-flagged' : 'answered';
    }
    return flaggedQuestions.has(index) ? 'flagged' : 'unanswered';
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'from-emerald-500 to-green-500';
      case 'hard': return 'from-red-500 to-pink-500';
      default: return 'from-yellow-500 to-orange-500';
    }
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'from-emerald-500 to-green-500';
    if (percentage >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  // Enhanced Test Start Screen - Mobile Optimized
  if (!isTestStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/10 to-purple-900/10">
        <div className="max-w-5xl mx-auto p-3 sm:p-6">
          {/* Animated Background Elements */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          {/* Mobile-Optimized Header */}
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-8 sm:mb-12">
            <button
              onClick={onBack}
              className="group bg-gradient-to-r from-gray-800/80 to-gray-700/80 backdrop-blur-xl border border-gray-600/40 text-gray-300 rounded-xl px-4 sm:px-6 py-2 sm:py-3 text-sm font-medium hover:from-gray-700/80 hover:to-gray-600/80 transition-all duration-300 flex items-center gap-2 sm:gap-3 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <FiArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:-translate-x-1" />
              <span className="hidden sm:inline">Back to Series</span>
              <span className="sm:hidden">Back</span>
            </button>
            
            <div className="flex-1">
              <h1 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-purple-200 mb-1 sm:mb-2 leading-tight">
                {test.title}
              </h1>
              <p className="text-lg sm:text-xl text-gray-400 flex items-center gap-2">
                <FaGraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                {testSeries.title}
              </p>
            </div>
          </div>

          {/* Mobile-Optimized Main Content */}
          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border border-gray-600/40 rounded-2xl sm:rounded-3xl p-6 sm:p-12 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl sm:rounded-3xl"></div>
              
              <div className="relative text-center mb-8 sm:mb-12">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-2xl">
                  <FaBrain className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                </div>
                <h2 className="text-2xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">
                  Ready to Challenge Yourself?
                </h2>
                <p className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto px-2">
                  {test.description || 'Test your knowledge with this comprehensive assessment designed to evaluate your understanding.'}
                </p>
              </div>

              {/* Mobile-Optimized Test Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 mb-8 sm:mb-12">
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm border border-blue-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-8 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-500/30 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <FiBookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-blue-300 mb-1 sm:mb-2">
                    {totalQuestions}
                  </div>
                  <div className="text-blue-200 font-semibold text-sm sm:text-base">
                    Questions
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm border border-purple-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-8 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-500/30 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <FiClock className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-purple-300 mb-1 sm:mb-2">
                    {test.timeLimit || 30}
                  </div>
                  <div className="text-purple-200 font-semibold text-sm sm:text-base">
                    Minutes
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 backdrop-blur-sm border border-emerald-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-8 text-center sm:col-span-1 col-span-1">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-500/30 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <FiTarget className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-300 mb-1 sm:mb-2 capitalize">
                    {test.difficulty || 'Medium'}
                  </div>
                  <div className="text-emerald-200 font-semibold text-sm sm:text-base">
                    Difficulty
                  </div>
                </div>
              </div>

              {/* Mobile-Optimized Instructions */}
              <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-sm border border-yellow-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-8 mb-8 sm:mb-12">
                <h3 className="font-bold text-yellow-300 text-lg sm:text-xl mb-4 sm:mb-6 flex items-center gap-3">
                  <FiAlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                  Test Instructions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <ul className="space-y-2 sm:space-y-3 text-yellow-200 text-sm sm:text-base">
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0"></div>
                      Choose the best answer for each question
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0"></div>
                      You can flag questions for review
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0"></div>
                      Navigate freely between questions
                    </li>
                  </ul>
                  <ul className="space-y-2 sm:space-y-3 text-yellow-200 text-sm sm:text-base">
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0"></div>
                      Timer starts as soon as you begin
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0"></div>
                      Auto-submit when time expires
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0"></div>
                      Review your answers before submitting
                    </li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => setIsTestStarted(true)}
                className="group relative w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl sm:rounded-2xl px-6 sm:px-8 py-4 sm:py-6 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/25"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-xl sm:rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center gap-3 sm:gap-4">
                  <FaRocket className="w-6 h-6 sm:w-8 sm:h-8" />
                  <span className="text-xl sm:text-2xl">Start Test</span>
                  <FiChevronRight className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced Test Completed Screen - Mobile Optimized
  if (isTestCompleted) {
    const score = calculateScore();
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/10 to-purple-900/10">
        <div className="max-w-5xl mx-auto p-3 sm:p-6">
          {/* Animated Background Elements */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border border-gray-600/40 rounded-2xl sm:rounded-3xl p-6 sm:p-12 shadow-2xl text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5 rounded-2xl sm:rounded-3xl"></div>
              
              <div className="relative">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-2xl animate-bounce">
                  <FaTrophy className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                </div>
                
                <h2 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-400 mb-4 sm:mb-6">
                  Test Completed!
                </h2>
                
                <p className="text-lg sm:text-xl text-gray-300 mb-8 sm:mb-12">
                  Congratulations! You've successfully completed the test.
                </p>
                
                {/* Mobile-Optimized Score Display */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 mb-8 sm:mb-12">
                  <div className={`bg-gradient-to-br ${getScoreColor(score.percentage)}/20 backdrop-blur-sm border ${getScoreColor(score.percentage).includes('emerald') ? 'border-emerald-500/30' : getScoreColor(score.percentage).includes('yellow') ? 'border-yellow-500/30' : 'border-red-500/30'} rounded-xl sm:rounded-2xl p-4 sm:p-8`}>
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-white/20 to-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <FiAward className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <div className="text-3xl sm:text-4xl font-black text-white mb-1 sm:mb-2">
                      {score.percentage}%
                    </div>
                    <div className="text-white/80 font-semibold text-sm sm:text-base">
                      Overall Score
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm border border-blue-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-8">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-500/30 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <FiCheck className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
                    </div>
                    <div className="text-3xl sm:text-4xl font-black text-blue-300 mb-1 sm:mb-2">
                      {score.correct}/{totalQuestions}
                    </div>
                    <div className="text-blue-200 font-semibold text-sm sm:text-base">
                      Correct Answers
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm border border-purple-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-8 sm:col-span-1 col-span-1">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-500/30 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <FiClock className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
                    </div>
                    <div className="text-3xl sm:text-4xl font-black text-purple-300 mb-1 sm:mb-2">
                      {formatTime((test.timeLimit * 60) - timeLeft)}
                    </div>
                    <div className="text-purple-200 font-semibold text-sm sm:text-base">
                      Time Taken
                    </div>
                  </div>
                </div>

                {/* Mobile-Optimized Performance Analysis */}
                <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-sm border border-indigo-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-8 mb-8 sm:mb-12">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center justify-center gap-2 sm:gap-3">
                    <FiTrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
                    Performance Analysis
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-emerald-400">{score.correct}</div>
                      <div className="text-xs sm:text-sm text-gray-400">Correct</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-red-400">{score.incorrect}</div>
                      <div className="text-xs sm:text-sm text-gray-400">Incorrect</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-yellow-400">{flaggedQuestions.size}</div>
                      <div className="text-xs sm:text-sm text-gray-400">Flagged</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-blue-400">{totalQuestions - getAnsweredQuestionsCount()}</div>
                      <div className="text-xs sm:text-sm text-gray-400">Skipped</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
                  <button
                    onClick={onBack}
                    className="group bg-gradient-to-r from-gray-700/80 to-gray-600/80 backdrop-blur-xl border border-gray-600/40 text-gray-300 rounded-xl px-6 sm:px-8 py-3 sm:py-4 font-medium hover:from-gray-600/80 hover:to-gray-500/80 transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <FiArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    Back to Dashboard
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl px-6 sm:px-8 py-3 sm:py-4 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-blue-500/25"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center gap-2 sm:gap-3">
                      <FiRefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                      Retake Test
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced Test Taking Interface - Mobile Optimized
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/10 to-purple-900/10">
      <div className="max-w-7xl mx-auto p-3 sm:p-6">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"></div>
        </div>

        {/* Mobile-Optimized Enhanced Header */}
        <div className="relative z-10 mb-4 sm:mb-8">
          <div className="bg-gradient-to-r from-gray-800/80 to-gray-700/80 backdrop-blur-xl border border-gray-600/40 rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-6">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg sm:rounded-xl border border-blue-500/30">
                  <FaBrain className="w-5 h-5 sm:w-8 sm:h-8 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold text-white mb-0 sm:mb-1 leading-tight">
                    {test.title}
                  </h1>
                  <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400">
                    <span>Q {currentQuestionIndex + 1}/{totalQuestions}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline">{getAnsweredQuestionsCount()} answered</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-4">
                {/* Mobile Navigation Toggle */}
                <button
                  onClick={() => setShowMobileNav(!showMobileNav)}
                  className="sm:hidden p-2 bg-gray-700/50 text-gray-300 rounded-lg"
                >
                  <FiMenu className="w-5 h-5" />
                </button>

                <div className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl backdrop-blur-sm font-mono font-bold text-sm sm:text-lg ${
                  timeLeft < 300 
                    ? 'bg-red-500/20 border border-red-500/40 text-red-300' 
                    : 'bg-blue-500/20 border border-blue-500/40 text-blue-300'
                }`}>
                  <FiClock className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>{formatTime(timeLeft)}</span>
                </div>
                
                <button
                  onClick={() => setShowConfirmDialog(true)}
                  className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-bold py-2 sm:py-3 px-3 sm:px-6 rounded-lg sm:rounded-xl transition-all duration-300 hover:scale-105 shadow-lg text-sm sm:text-base"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-8">
          {/* Mobile Navigation Panel */}
          {showMobileNav && (
            <div className="xl:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setShowMobileNav(false)}>
              <div className="absolute top-0 left-0 w-80 h-full bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl border-r border-gray-600/40 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-white">Navigation</h3>
                  <button onClick={() => setShowMobileNav(false)} className="text-gray-400 hover:text-white">
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Progress</span>
                    <span>{getAnsweredQuestionsCount()}/{totalQuestions}</span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(getAnsweredQuestionsCount() / totalQuestions) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-2 mb-6">
                  {test.questions.map((_, index) => {
                    const status = getQuestionStatus(index);
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          setCurrentQuestionIndex(index);
                          setShowMobileNav(false);
                        }}
                        className={`w-12 h-12 rounded-xl text-sm font-bold transition-all duration-300 ${
                          index === currentQuestionIndex
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white scale-110 shadow-lg'
                            : status === 'answered'
                            ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white'
                            : status === 'answered-flagged'
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                            : status === 'flagged'
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                            : 'bg-gray-700/50 text-gray-400'
                        }`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-gradient-to-r from-emerald-500 to-green-500 rounded"></div>
                    <span className="text-gray-300">Answered</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-gradient-to-r from-orange-500 to-red-500 rounded"></div>
                    <span className="text-gray-300">Answered & Flagged</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded"></div>
                    <span className="text-gray-300">Flagged</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-gray-600 rounded"></div>
                    <span className="text-gray-300">Not Answered</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Desktop Question Navigation Panel */}
          <div className="hidden xl:block xl:col-span-1">
            <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border border-gray-600/40 rounded-2xl p-6 shadow-2xl sticky top-6">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-2xl"></div>
              
              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <FiActivity className="w-5 h-5 text-purple-400" />
                  <h3 className="font-bold text-white">Progress</h3>
                </div>
                
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Answered</span>
                    <span>{getAnsweredQuestionsCount()}/{totalQuestions}</span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(getAnsweredQuestionsCount() / totalQuestions) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-5 gap-2 mb-6">
                  {test.questions.map((_, index) => {
                    const status = getQuestionStatus(index);
                    return (
                      <button
                        key={index}
                        onClick={() => setCurrentQuestionIndex(index)}
                        className={`w-10 h-10 rounded-xl text-sm font-bold transition-all duration-300 ${
                          index === currentQuestionIndex
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white scale-110 shadow-lg'
                            : status === 'answered'
                            ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:scale-105'
                            : status === 'answered-flagged'
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:scale-105'
                            : status === 'flagged'
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:scale-105'
                            : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50 hover:scale-105'
                        }`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-gradient-to-r from-emerald-500 to-green-500 rounded"></div>
                    <span className="text-gray-300">Answered</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-gradient-to-r from-orange-500 to-red-500 rounded"></div>
                    <span className="text-gray-300">Answered & Flagged</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded"></div>
                    <span className="text-gray-300">Flagged</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-gray-600 rounded"></div>
                    <span className="text-gray-300">Not Answered</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Question Panel - Mobile Optimized */}
          <div className="xl:col-span-3">
            <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border border-gray-600/40 rounded-2xl sm:rounded-3xl p-4 sm:p-10 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl sm:rounded-3xl"></div>
              
              <div className="relative">
                {/* Mobile-Optimized Question Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-gray-600/40 gap-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center font-bold text-white text-lg shadow-lg">
                      {currentQuestionIndex + 1}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">
                      Question {currentQuestionIndex + 1}
                    </h2>
                  </div>
                  
                  <button
                    onClick={toggleFlag}
                    className={`group flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 hover:scale-105 text-sm sm:text-base ${
                      flaggedQuestions.has(currentQuestionIndex)
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                        : 'bg-gray-700/50 text-gray-300 hover:bg-yellow-500/20 border border-gray-600/40'
                    }`}
                  >
                    <FiFlag className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">{flaggedQuestions.has(currentQuestionIndex) ? 'Flagged' : 'Flag Question'}</span>
                    <span className="sm:hidden">Flag</span>
                  </button>
                </div>

                {/* Question Text */}
                <div className="mb-6 sm:mb-10">
                  <p className="text-lg sm:text-xl text-white leading-relaxed font-medium">
                    {currentQuestion.question}
                  </p>
                </div>

                {/* Mobile-Optimized Enhanced Options */}
                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-10">
                  {currentQuestion.options.map((option, index) => (
                    <label
                      key={index}
                      className={`group flex items-start sm:items-center p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                        answers[currentQuestionIndex] === index
                          ? 'border-blue-500/60 bg-gradient-to-r from-blue-500/20 to-purple-500/20 shadow-lg shadow-blue-500/25'
                          : 'border-gray-600/40 bg-gray-800/30 hover:border-blue-500/40 hover:bg-gray-700/40'
                      }`}
                    >
                      <div className="relative mt-1 sm:mt-0">
                        <input
                          type="radio"
                          name={`question-${currentQuestionIndex}`}
                          value={index}
                          checked={answers[currentQuestionIndex] === index}
                          onChange={() => handleAnswerSelect(index)}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                          answers[currentQuestionIndex] === index
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-500 group-hover:border-blue-400'
                        }`}>
                          {answers[currentQuestionIndex] === index && (
                            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full"></div>
                          )}
                        </div>
                      </div>
                      
                      <div className="ml-4 sm:ml-6 flex-1">
                        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                          <span className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0 mt-0.5 sm:mt-0 ${
                            answers[currentQuestionIndex] === index
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-600 text-gray-300 group-hover:bg-blue-500/20'
                          }`}>
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span className={`text-base sm:text-lg font-medium leading-relaxed ${
                            answers[currentQuestionIndex] === index ? 'text-white' : 'text-gray-300'
                          }`}>
                            {option}
                          </span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Mobile-Optimized Enhanced Navigation Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0">
                  <button
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="group bg-gradient-to-r from-gray-700/80 to-gray-600/80 backdrop-blur-xl border border-gray-600/40 text-gray-300 rounded-xl px-4 sm:px-8 py-3 sm:py-4 font-medium hover:from-gray-600/80 hover:to-gray-500/80 transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none order-2 sm:order-1"
                  >
                    <FiChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:-translate-x-1" />
                    <span>Previous</span>
                  </button>

                  <div className="flex gap-3 sm:gap-4 order-1 sm:order-2">
                    {!isLastQuestion ? (
                      <button
                        onClick={handleNextQuestion}
                        className="group relative flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl px-6 sm:px-8 py-3 sm:py-4 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-blue-500/25"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex items-center justify-center gap-2 sm:gap-3">
                          <span>Next Question</span>
                          <FiChevronRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" />
                        </div>
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowConfirmDialog(true)}
                        className="group relative flex-1 sm:flex-none bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-bold rounded-xl px-6 sm:px-8 py-3 sm:py-4 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-emerald-500/25"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-green-400/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex items-center justify-center gap-2 sm:gap-3">
                          <FiCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span>Submit Test</span>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-Optimized Enhanced Submit Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="relative bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl border border-yellow-600/40 rounded-2xl sm:rounded-3xl p-6 sm:p-10 max-w-lg mx-auto shadow-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-2xl sm:rounded-3xl"></div>
              
              <div className="relative text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl">
                  <FiAlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
                  Submit Test?
                </h3>
                
                <div className="bg-gray-800/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-emerald-400">{getAnsweredQuestionsCount()}</div>
                      <div className="text-gray-400 text-xs sm:text-sm">Answered</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-red-400">{totalQuestions - getAnsweredQuestionsCount()}</div>
                      <div className="text-gray-400 text-xs sm:text-sm">Remaining</div>
                    </div>
                  </div>
                </div>
                
                {getAnsweredQuestionsCount() < totalQuestions && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                    <p className="text-yellow-300 text-sm">
                      ⚠️ {totalQuestions - getAnsweredQuestionsCount()} questions are still unanswered.
                    </p>
                  </div>
                )}
                
                <p className="text-gray-300 mb-6 sm:mb-8 text-sm sm:text-base">
                  Once submitted, you cannot modify your answers.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={() => setShowConfirmDialog(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg sm:rounded-xl px-4 sm:px-6 py-3 sm:py-4 transition-colors text-sm sm:text-base"
                  >
                    Review Answers
                  </button>
                  <button
                    onClick={handleSubmitTest}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-bold rounded-lg sm:rounded-xl px-4 sm:px-6 py-3 sm:py-4 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-emerald-500/25 text-sm sm:text-base"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Submitting...</span>
                      </div>
                    ) : (
                      'Submit Test'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestAttemptViewer;
