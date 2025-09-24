import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { addDoc, collection, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import usePopup from '../../hooks/usePopup';
import BeautifulPopup from '../common/BeautifulPopup';
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
import SectionNavigation from '../quiz/SectionNavigation';

const TestAttemptViewer = ({ test, testSeries, onBack, onComplete }) => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const { popupState, showError, showSuccess, hidePopup } = usePopup();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState((test.timeLimit || 30) * 60);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [isTestCompleted, setIsTestCompleted] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [leaveCountdown, setLeaveCountdown] = useState(null);
  const [leaveWarningVisible, setLeaveWarningVisible] = useState(false);

  const storageKey = `${currentUser?.uid || 'anon'}:test-progress:${test.id}`;
  
  // Section-wise quiz detection and logic
  const isSectionWiseQuiz = test.sections && Array.isArray(test.sections) && test.sections.length > 0;
  
  // Get current section info for section-wise quizzes
  const getCurrentSectionInfo = () => {
    if (!isSectionWiseQuiz) return null;
    
    let questionCount = 0;
    for (let i = 0; i < test.sections.length; i++) {
      const section = test.sections[i];
      const sectionQuestionCount = section.questions ? section.questions.length : 0;
      
      if (currentQuestionIndex < questionCount + sectionQuestionCount) {
        return {
          section,
          sectionIndex: i,
          questionInSection: currentQuestionIndex - questionCount + 1,
          totalQuestionsInSection: sectionQuestionCount,
          sectionStartIndex: questionCount
        };
      }
      questionCount += sectionQuestionCount;
    }
    return null;
  };

  const currentSectionInfo = getCurrentSectionInfo();
  
  // Get current question - handle both regular and section-wise quizzes
  const getCurrentQuestion = () => {
    if (isSectionWiseQuiz && currentSectionInfo) {
      return currentSectionInfo.section.questions?.[currentSectionInfo.questionInSection - 1];
    }
    return test.questions?.[currentQuestionIndex];
  };
  
  const currentQuestion = getCurrentQuestion();
  const totalQuestions = test.questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  // Timer effect (drift-proof, mobile-safe)
  useEffect(() => {
    if (!isTestStarted || isTestCompleted) return;

    const limitSeconds = (test.timeLimit || 30) * 60;
    const startedAtMs = startTime ? new Date(startTime).getTime() : Date.now();
    const endAtMs = startedAtMs + limitSeconds * 1000;

    const tick = () => {
      const remainingMs = Math.max(0, endAtMs - Date.now());
      const remainingSeconds = Math.round(remainingMs / 1000);
      setTimeLeft(prev => {
        if (remainingSeconds === 0 && prev !== 0) {
          setTimeout(() => handleSubmitTest(), 0);
        }
        return remainingSeconds;
      });
      if (remainingMs > 0 && !isTestCompleted) {
        timeoutId = window.setTimeout(tick, 250);
      }
    };

    let timeoutId = window.setTimeout(tick, 0);
    return () => window.clearTimeout(timeoutId);
  }, [isTestStarted, isTestCompleted, startTime, test.timeLimit]);

  // Set start time when test begins
  useEffect(() => {
    if (isTestStarted && !startTime) {
      setStartTime(new Date());
    }
  }, [isTestStarted, startTime]);

  // Restore saved progress on mount (if page refreshed)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data && data.testId === test.id && !isTestCompleted) {
        setAnswers(data.answers || {});
        setCurrentQuestionIndex(data.currentQuestionIndex || 0);
        setFlaggedQuestions(new Set(data.flaggedQuestions || []));
        setTimeLeft(typeof data.timeLeft === 'number' ? data.timeLeft : (test.timeLimit || 30) * 60);
        setStartTime(data.startTime ? new Date(data.startTime) : new Date());
        setIsTestStarted(true);
      }
    } catch (e) {
      console.warn('Failed to restore test progress', e);
    }
  }, []);

  // Persist progress whenever key state changes
  useEffect(() => {
    if (!isTestStarted || isTestCompleted) return;
    const payload = {
      testId: test.id,
      currentQuestionIndex,
      answers,
      flaggedQuestions: Array.from(flaggedQuestions),
      timeLeft,
      startTime,
      savedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(storageKey, JSON.stringify(payload));
    } catch {}
  }, [isTestStarted, isTestCompleted, currentQuestionIndex, answers, flaggedQuestions, timeLeft, startTime]);

  // Warn on tab hide/visibility change and auto-submit after countdown
  useEffect(() => {
    if (!isTestStarted || isTestCompleted) return;

    const handleVisibility = () => {
      if (document.hidden) {
        setLeaveCountdown(10);
        setLeaveWarningVisible(true);
      } else {
        try {
          const limitSeconds = (test.timeLimit || 30) * 60;
          const startedAtMs = startTime ? new Date(startTime).getTime() : Date.now();
          const endAtMs = startedAtMs + limitSeconds * 1000;
          const remainingSeconds = Math.max(0, Math.round((endAtMs - Date.now()) / 1000));
          setTimeLeft(remainingSeconds);
        } catch {}
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isTestStarted, isTestCompleted]);

  // Countdown effect for leave warning
  useEffect(() => {
    if (leaveCountdown === null) return;
    if (leaveCountdown <= 0) {
      setLeaveWarningVisible(false);
      setLeaveCountdown(null);
      handleSubmitTest();
      return;
    }
    const t = setTimeout(() => setLeaveCountdown(prev => (prev ?? 0) - 1), 1000);
    return () => clearTimeout(t);
  }, [leaveCountdown]);

  // beforeunload: native browser warning to prevent accidental close
  useEffect(() => {
    if (!isTestStarted || isTestCompleted) return;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isTestStarted, isTestCompleted]);

  // Intercept browser back navigation while test is in progress
  useEffect(() => {
    if (!isTestStarted || isTestCompleted) return;

    const push = () => {
      try { window.history.pushState({ preventLeave: true }, '', window.location.href); } catch {}
    };
    push();

    const onPopState = () => {
      push();
      setLeaveCountdown(10);
      setLeaveWarningVisible(true);
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [isTestStarted, isTestCompleted]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Enhanced answer selection with unmarking feature
  const handleAnswerSelect = (optionIndex) => {
    setAnswers(prev => {
      const newAnswers = { ...prev };
      
      // If the same option is clicked again, unmark it (remove from answers)
      if (prev[currentQuestionIndex] === optionIndex) {
        delete newAnswers[currentQuestionIndex];
      } else {
        // Otherwise, mark the new option
        newAnswers[currentQuestionIndex] = optionIndex;
      }
      
      return newAnswers;
    });
    setShowMobileNav(false);
  };

  // Clear current answer
  const handleClearAnswer = () => {
    setAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[currentQuestionIndex];
      return newAnswers;
    });
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

  // Section switching functionality
  const handleSectionChange = (newSectionIndex) => {
    if (!isSectionWiseQuiz || !test.sections) return;
    
    let questionCount = 0;
    for (let i = 0; i < newSectionIndex; i++) {
      questionCount += test.sections[i].questions ? test.sections[i].questions.length : 0;
    }
    
    setCurrentQuestionIndex(questionCount);
    setShowMobileNav(false);
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
    let incorrect = 0;
    let totalScore = 0;
    
    test.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correct++;
        totalScore += 1;
      } else if (answers[index] !== undefined) {
        incorrect++;
        let negativeMarkingToApply = null;
        
        if (question.negativeMarking && question.negativeMarking.enabled) {
          negativeMarkingToApply = question.negativeMarking;
        } else if (test.negativeMarking && test.negativeMarking.enabled) {
          negativeMarkingToApply = test.negativeMarking;
        }
        
        if (negativeMarkingToApply) {
          if (negativeMarkingToApply.type === 'fractional') {
            totalScore -= negativeMarkingToApply.value;
          } else if (negativeMarkingToApply.type === 'fixed') {
            totalScore -= negativeMarkingToApply.value;
          }
        }
      }
    });
    
    const attempted = correct + incorrect;
    const attemptedMoreWrongThanCorrect = attempted > 0 && incorrect > correct;
    if (!attemptedMoreWrongThanCorrect) {
      totalScore = Math.max(0, totalScore);
    }
    
    return {
      correct,
      incorrect,
      totalScore: Math.round(totalScore * 100) / 100,
      percentage: Math.round((totalScore / totalQuestions) * 100)
    };
  };

  const getEffectiveNegativeMarking = (question) => {
    if (question?.negativeMarking?.enabled) {
      return question.negativeMarking;
    }
    if (test?.negativeMarking?.enabled) {
      return test.negativeMarking;
    }
    return null;
  };

  const handleSubmitTest = async () => {
    setLoading(true);
    try {
      const score = calculateScore();
      const now = new Date();
      
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
        totalScore: score.totalScore,
        totalQuestions,
        percentage: score.percentage,
        timeSpent: timeSpentInSeconds,
        flaggedQuestions: Array.from(flaggedQuestions),
        negativeMarking: test.negativeMarking || null,
        
        startedAt: actualStartTime,
        completedAt: now,
        
        difficulty: test.difficulty || 'medium',
        isAIGenerated: test.isAIGenerated || false
      };

      console.log('Submitting attempt data:', attemptData);

      const docRef = await addDoc(collection(db, 'test-attempts'), attemptData);
      const attemptId = docRef.id;

      try { localStorage.removeItem(storageKey); } catch {}

      try {
        const isSectionWise = Array.isArray(test?.sections);
        const collectionName = isSectionWise ? 'section-quizzes' : 'quizzes';
        if (test?.createdBy && currentUser?.uid === test.createdBy) {
          await updateDoc(doc(db, collectionName, test.id), {
            totalAttempts: increment(1),
            totalScore: increment(score.correct),
          });
        }
      } catch (aggErr) {
        console.warn('Skipped quiz aggregate update (permissions):', aggErr);
      }

      setIsTestCompleted(true);
      onComplete({ ...attemptData, id: attemptId });
      
    } catch (error) {
      console.error('Error submitting test:', error);
      showError('Failed to submit test. Please try again.', 'Submission Error');
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

  React.useEffect(() => {
    if (showConfirmDialog) {
      const { body } = document;
      const previous = body.style.overflow;
      body.style.overflow = 'hidden';
      return () => {
        body.style.overflow = previous;
      };
    }
  }, [showConfirmDialog]);

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
      <div className={`min-h-screen transition-all duration-500 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-blue-900/10 to-purple-900/10' 
          : 'bg-white'
      }`}>
        <div className="max-w-5xl mx-auto p-3 sm:p-6">
          {/* Animated Background Elements */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl animate-pulse ${
              isDark ? 'bg-blue-500/10' : 'bg-blue-400/8'
            }`}></div>
            <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl animate-pulse delay-1000 ${
              isDark ? 'bg-purple-500/10' : 'bg-indigo-400/6'
            }`}></div>
          </div>

          {/* Mobile-Optimized Header */}
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
            
            
            <div className="flex-1">
              <h1 className={`text-xl sm:text-2xl font-black mb-0 sm:mb-1 leading-tight transition-all duration-300 ${
                isDark 
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-purple-200'
                  : 'text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600'
              }`}>
                {test.title}
              </h1>
              <p className={`text-sm sm:text-base flex items-center gap-1 transition-all duration-300 ${
                isDark ? 'text-gray-400' : 'text-slate-600'
              }`}>
                
                {testSeries.title}
              </p>
            </div>
          </div>

          {/* Mobile-Optimized Main Content */}
          <div className="relative z-10 max-w-4xl mx-auto">
            <div className={`backdrop-blur-xl border rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-xl transition-all duration-500 ${
              isDark 
                ? 'bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-gray-600/40'
                : 'bg-white border-slate-200/60 shadow-slate-300/20'
            }`}>
              <div className={`absolute inset-0 rounded-2xl sm:rounded-3xl ${
                isDark 
                  ? 'bg-gradient-to-br from-blue-500/5 to-purple-500/5'
                  : 'bg-gradient-to-br from-blue-400/3 to-indigo-400/3'
              }`}></div>
              
              <div className="relative text-center mb-4 sm:mb-6">
                
                <h2 className={`text-xl sm:text-2xl font-bold mb-2 sm:mb-3 transition-all duration-300 ${
                  isDark ? 'text-white' : 'text-slate-800'
                }`}>
                  Ready to Challenge Yourself?
                </h2>
                <p className={`text-sm sm:text-base leading-relaxed max-w-2xl mx-auto px-2 transition-all duration-300 ${
                  isDark ? 'text-gray-300' : 'text-slate-600'
                }`}>
                  {test.description || 'Test your knowledge with this comprehensive assessment designed to evaluate your understanding.'}
                </p>
              </div>

              {/* Mobile-Optimized Test Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
                <div className={`backdrop-blur-sm border rounded-lg sm:rounded-xl p-3 sm:p-4 text-center transition-all duration-300 ${
                  isDark 
                    ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30'
                    : 'bg-white border-blue-200/60 shadow-sm'
                }`}>
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 transition-all duration-300 ${
                    isDark ? 'bg-blue-500/30' : 'bg-blue-100'
                  }`}>
                    <FiBookOpen className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 ${
                      isDark ? 'text-blue-400' : 'text-blue-600'
                    }`} />
                  </div>
                  <div className={`text-lg sm:text-xl font-black mb-1 transition-all duration-300 ${
                    isDark ? 'text-blue-300' : 'text-blue-700'
                  }`}>
                    {totalQuestions}
                  </div>
                  <div className={`font-semibold text-xs sm:text-sm transition-all duration-300 ${
                    isDark ? 'text-blue-200' : 'text-blue-600'
                  }`}>
                    Questions
                  </div>
                </div>
                
                <div className={`backdrop-blur-sm border rounded-lg sm:rounded-xl p-3 sm:p-4 text-center transition-all duration-300 ${
                  isDark 
                    ? 'bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30'
                    : 'bg-white border-purple-200/60 shadow-sm'
                }`}>
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 transition-all duration-300 ${
                    isDark ? 'bg-purple-500/30' : 'bg-purple-100'
                  }`}>
                    <FiClock className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 ${
                      isDark ? 'text-purple-400' : 'text-purple-600'
                    }`} />
                  </div>
                  <div className={`text-lg sm:text-xl font-black mb-1 transition-all duration-300 ${
                    isDark ? 'text-purple-300' : 'text-purple-700'
                  }`}>
                    {test.timeLimit || 30}
                  </div>
                  <div className={`font-semibold text-xs sm:text-sm transition-all duration-300 ${
                    isDark ? 'text-purple-200' : 'text-purple-600'
                  }`}>
                    Minutes
                  </div>
                </div>
                
                <div className={`backdrop-blur-sm border rounded-lg sm:rounded-xl p-3 sm:p-4 text-center sm:col-span-1 col-span-1 transition-all duration-300 ${
                  isDark 
                    ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border-emerald-500/30'
                    : 'bg-white border-emerald-200/60 shadow-sm'
                }`}>
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 transition-all duration-300 ${
                    isDark ? 'bg-emerald-500/30' : 'bg-emerald-100'
                  }`}>
                    <FiTarget className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 ${
                      isDark ? 'text-emerald-400' : 'text-emerald-600'
                    }`} />
                  </div>
                  <div className={`text-lg sm:text-xl font-black mb-1 capitalize transition-all duration-300 ${
                    isDark ? 'text-emerald-300' : 'text-emerald-700'
                  }`}>
                    {test.difficulty || 'Medium'}
                  </div>
                  <div className={`font-semibold text-xs sm:text-sm transition-all duration-300 ${
                    isDark ? 'text-emerald-200' : 'text-emerald-600'
                  }`}>
                    Difficulty
                  </div>
                </div>
              </div>

              {/* Mobile-Optimized Instructions */}
              <div className={`backdrop-blur-sm border rounded-lg sm:rounded-xl p-3 sm:p-6 mb-4 sm:mb-6 transition-all duration-300 ${
                isDark 
                  ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30'
                  : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300/60'
              }`}>
                <h3 className={`font-bold text-base sm:text-lg mb-2 sm:mb-3 flex items-center gap-2 transition-all duration-300 ${
                  isDark ? 'text-yellow-300' : 'text-yellow-700'
                }`}>
                  <FiAlertCircle className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 ${
                    isDark ? 'text-yellow-400' : 'text-yellow-600'
                  }`} />
                  Test Instructions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <ul className={`space-y-1 sm:space-y-2 text-xs sm:text-sm transition-all duration-300 ${
                    isDark ? 'text-yellow-200' : 'text-yellow-700'
                  }`}>
                    <li className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all duration-300 ${
                        isDark ? 'bg-yellow-400' : 'bg-yellow-600'
                      }`}></div>
                      Choose the best answer for each question
                    </li>
                    <li className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all duration-300 ${
                        isDark ? 'bg-yellow-400' : 'bg-yellow-600'
                      }`}></div>
                      You can flag questions for review
                    </li>
                    <li className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all duration-300 ${
                        isDark ? 'bg-yellow-400' : 'bg-yellow-600'
                      }`}></div>
                      Navigate freely between questions
                    </li>
                  </ul>
                  <ul className={`space-y-1 sm:space-y-2 text-xs sm:text-sm transition-all duration-300 ${
                    isDark ? 'text-yellow-200' : 'text-yellow-700'
                  }`}>
                    <li className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all duration-300 ${
                        isDark ? 'bg-yellow-400' : 'bg-yellow-600'
                      }`}></div>
                      Timer starts as soon as you begin
                    </li>
                    <li className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all duration-300 ${
                        isDark ? 'bg-yellow-400' : 'bg-yellow-600'
                      }`}></div>
                      Auto-submit when time expires
                    </li>
                    <li className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all duration-300 ${
                        isDark ? 'bg-yellow-400' : 'bg-yellow-600'
                      }`}></div>
                      Click same option again to unmark
                    </li>
                  </ul>
                </div>
                
                {/* Negative Marking Warning */}
                {test.negativeMarking && test.negativeMarking.enabled && (
                  <div className={`mt-3 p-3 rounded-lg border transition-all duration-300 ${
                    isDark 
                      ? 'bg-gradient-to-r from-red-500/10 to-pink-500/10 border-red-500/30'
                      : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-300/60'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <FiAlertCircle className={`w-4 h-4 transition-all duration-300 ${
                        isDark ? 'text-red-400' : 'text-red-600'
                      }`} />
                      <span className={`font-semibold text-xs sm:text-sm transition-all duration-300 ${
                        isDark ? 'text-red-300' : 'text-red-700'
                      }`}>
                        ⚠️ Negative Marking Enabled
                      </span>
                    </div>
                    <p className={`text-xs transition-all duration-300 ${
                      isDark ? 'text-red-200' : 'text-red-600'
                    }`}>
                      {test.negativeMarking.type === 'fractional' 
                        ? `For each wrong answer, ${test.negativeMarking.value} marks will be deducted from your total score.`
                        : `For each wrong answer, ${test.negativeMarking.value} marks will be deducted from your total score.`
                      }
                      <br />
                      <span className="text-xs opacity-75 mt-1 block">
                        Note: Some questions may have different negative marking values.
                      </span>
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsTestStarted(true)}
                className={`group relative w-full font-bold rounded-lg sm:rounded-xl px-4 sm:px-6 py-3 sm:py-4 transition-all duration-300 transform hover:scale-105 shadow-lg ${
                  isDark 
                    ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white hover:shadow-blue-500/25'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:shadow-blue-500/30'
                }`}
              >
                <div className={`absolute inset-0 rounded-lg sm:rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                  isDark 
                    ? 'bg-gradient-to-r from-blue-400/20 to-purple-400/20'
                    : 'bg-gradient-to-r from-blue-400/20 to-indigo-400/20'
                }`}></div>
                <div className="relative flex items-center justify-center gap-2 sm:gap-3">
                  <FaRocket className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-base sm:text-lg">Start Test</span>
                  <FiChevronRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" />
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
      <div className={`min-h-screen transition-all duration-500 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-blue-900/10 to-purple-900/10' 
          : 'bg-white'
      }`}>
        <div className="max-w-5xl mx-auto p-3 sm:p-6">
          {/* Animated Background Elements */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl animate-pulse ${
              isDark ? 'bg-emerald-500/10' : 'bg-emerald-400/8'
            }`}></div>
            <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl animate-pulse delay-1000 ${
              isDark ? 'bg-blue-500/10' : 'bg-blue-400/6'
            }`}></div>
          </div>

          <div className="relative z-10 max-w-4xl mx-auto">
            <div className={`backdrop-blur-xl border rounded-2xl sm:rounded-3xl p-6 sm:p-12 shadow-2xl text-center transition-all duration-500 ${
              isDark 
                ? 'bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-gray-600/40'
                : 'bg-white border-slate-200/60 shadow-slate-300/20'
            }`}>
              <div className={`absolute inset-0 rounded-2xl sm:rounded-3xl ${
                isDark 
                  ? 'bg-gradient-to-br from-emerald-500/5 to-green-500/5'
                  : 'bg-gradient-to-br from-emerald-400/3 to-green-400/3'
              }`}></div>
              
              <div className="relative">
                <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-2xl animate-bounce transition-all duration-300 ${
                  isDark 
                    ? 'bg-gradient-to-br from-emerald-500 to-green-600'
                    : 'bg-gradient-to-br from-emerald-600 to-green-600'
                }`}>
                  <FaTrophy className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                </div>
                
                <h2 className={`text-3xl sm:text-5xl font-black mb-4 sm:mb-6 transition-all duration-300 ${
                  isDark 
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-400'
                    : 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700'
                }`}>
                  Test Completed!
                </h2>
                
                <p className={`text-lg sm:text-xl mb-8 sm:mb-12 transition-all duration-300 ${
                  isDark ? 'text-gray-300' : 'text-slate-600'
                }`}>
                  Congratulations! You've successfully completed the test.
                </p>
                
                {/* Mobile-Optimized Score Display */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 mb-8 sm:mb-12">
                  <div className={`backdrop-blur-sm border rounded-xl sm:rounded-2xl p-4 sm:p-8 transition-all duration-300 ${
                    isDark 
                      ? `bg-gradient-to-br ${getScoreColor(score.percentage)}/20 ${getScoreColor(score.percentage).includes('emerald') ? 'border-emerald-500/30' : getScoreColor(score.percentage).includes('yellow') ? 'border-yellow-500/30' : 'border-red-500/30'}`
                      : `bg-white ${getScoreColor(score.percentage).includes('emerald') ? 'border-emerald-200/60' : getScoreColor(score.percentage).includes('yellow') ? 'border-yellow-200/60' : 'border-red-200/60'} shadow-sm`
                  }`}>
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 transition-all duration-300 ${
                      isDark ? 'bg-gradient-to-br from-white/20 to-white/10' : 'bg-gradient-to-br from-emerald-100 to-green-100'
                    }`}>
                      <FiAward className={`w-6 h-6 sm:w-8 sm:h-8 transition-all duration-300 ${
                        isDark ? 'text-white' : 'text-emerald-600'
                      }`} />
                    </div>
                    <div className={`text-3xl sm:text-4xl font-black mb-1 sm:mb-2 transition-all duration-300 ${
                      isDark ? 'text-white' : 'text-emerald-700'
                    }`}>
                      {score.percentage}%
                    </div>
                    <div className={`font-semibold text-sm sm:text-base transition-all duration-300 ${
                      isDark ? 'text-white/80' : 'text-emerald-600'
                    }`}>
                      Overall Score
                    </div>
                  </div>
                  
                  <div className={`backdrop-blur-sm border rounded-xl sm:rounded-2xl p-4 sm:p-8 transition-all duration-300 ${
                    isDark 
                      ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30'
                      : 'bg-white border-blue-200/60 shadow-sm'
                  }`}>
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 transition-all duration-300 ${
                      isDark ? 'bg-blue-500/30' : 'bg-blue-100'
                    }`}>
                      <FiCheck className={`w-6 h-6 sm:w-8 sm:h-8 transition-all duration-300 ${
                        isDark ? 'text-blue-400' : 'text-blue-600'
                      }`} />
                    </div>
                    <div className={`text-3xl sm:text-4xl font-black mb-1 sm:mb-2 transition-all duration-300 ${
                      isDark ? 'text-blue-300' : 'text-blue-700'
                    }`}>
                      {score.correct}/{totalQuestions}
                    </div>
                    <div className={`font-semibold text-sm sm:text-base transition-all duration-300 ${
                      isDark ? 'text-blue-200' : 'text-blue-600'
                    }`}>
                      Correct Answers
                    </div>
                  </div>
                  
                  <div className={`backdrop-blur-sm border rounded-xl sm:rounded-2xl p-4 sm:p-8 sm:col-span-1 col-span-1 transition-all duration-300 ${
                    isDark 
                      ? 'bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30'
                      : 'bg-white border-purple-200/60 shadow-sm'
                  }`}>
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 transition-all duration-300 ${
                      isDark ? 'bg-purple-500/30' : 'bg-purple-100'
                    }`}>
                      <FiClock className={`w-6 h-6 sm:w-8 sm:h-8 transition-all duration-300 ${
                        isDark ? 'text-purple-400' : 'text-purple-600'
                      }`} />
                    </div>
                    <div className={`text-3xl sm:text-4xl font-black mb-1 sm:mb-2 transition-all duration-300 ${
                      isDark ? 'text-purple-300' : 'text-purple-700'
                    }`}>
                      {formatTime((test.timeLimit * 60) - timeLeft)}
                    </div>
                    <div className={`font-semibold text-sm sm:text-base transition-all duration-300 ${
                      isDark ? 'text-purple-200' : 'text-purple-600'
                    }`}>
                      Time Taken
                    </div>
                  </div>
                </div>

                {/* Mobile-Optimized Performance Analysis */}
                <div className={`backdrop-blur-sm border rounded-xl sm:rounded-2xl p-4 sm:p-8 mb-8 sm:mb-12 transition-all duration-300 ${
                  isDark 
                    ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/30'
                    : 'bg-white border-indigo-200/60 shadow-sm'
                }`}>
                  <h3 className={`text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center justify-center gap-2 sm:gap-3 transition-all duration-300 ${
                    isDark ? 'text-white' : 'text-slate-800'
                  }`}>
                    <FiTrendingUp className={`w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300 ${
                      isDark ? 'text-indigo-400' : 'text-indigo-600'
                    }`} />
                    Performance Analysis
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
                    <div className="text-center">
                      <div className={`text-xl sm:text-2xl font-bold transition-all duration-300 ${
                        isDark ? 'text-emerald-400' : 'text-emerald-600'
                      }`}>{score.correct}</div>
                      <div className={`text-xs sm:text-sm transition-all duration-300 ${
                        isDark ? 'text-gray-400' : 'text-slate-500'
                      }`}>Correct</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-xl sm:text-2xl font-bold transition-all duration-300 ${
                        isDark ? 'text-red-400' : 'text-red-600'
                      }`}>{score.incorrect}</div>
                      <div className={`text-xs sm:text-sm transition-all duration-300 ${
                        isDark ? 'text-gray-400' : 'text-slate-500'
                      }`}>Incorrect</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-xl sm:text-2xl font-bold transition-all duration-300 ${
                        isDark ? 'text-yellow-400' : 'text-yellow-600'
                      }`}>{flaggedQuestions.size}</div>
                      <div className={`text-xs sm:text-sm transition-all duration-300 ${
                        isDark ? 'text-gray-400' : 'text-slate-500'
                      }`}>Flagged</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-xl sm:text-2xl font-bold transition-all duration-300 ${
                        isDark ? 'text-blue-400' : 'text-blue-600'
                      }`}>{totalQuestions - getAnsweredQuestionsCount()}</div>
                      <div className={`text-xs sm:text-sm transition-all duration-300 ${
                        isDark ? 'text-gray-400' : 'text-slate-500'
                      }`}>Skipped</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
                  <button
                    onClick={onBack}
                    className={`group backdrop-blur-xl border rounded-xl px-6 sm:px-8 py-3 sm:py-4 font-medium transition-all duration-300 hidden sm:flex items-center justify-center gap-2 sm:gap-3 shadow-lg hover:shadow-xl hover:scale-105 ${
                      isDark 
                        ? 'bg-gradient-to-r from-gray-700/80 to-gray-600/80 border-gray-600/40 text-gray-300 hover:from-gray-600/80 hover:to-gray-500/80'
                        : 'bg-white border-slate-200/60 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-slate-200/40'
                    }`}
                  >
                    <FiArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    Back to Dashboard
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className={`group relative font-bold rounded-xl px-6 sm:px-8 py-3 sm:py-4 transition-all duration-300 transform hover:scale-105 shadow-xl ${
                      isDark 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:shadow-blue-500/25'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:shadow-blue-500/30'
                    }`}
                  >
                    <div className={`absolute inset-0 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                      isDark 
                        ? 'bg-gradient-to-r from-blue-400/20 to-purple-400/20'
                        : 'bg-gradient-to-r from-blue-400/20 to-indigo-400/20'
                    }`}></div>
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
    <div className={`min-h-screen transition-all duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900/10 to-purple-900/10' 
        : 'bg-white'
    }`}>
      <div className="max-w-7xl mx-auto p-2 sm:p-4">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl ${
            isDark ? 'bg-blue-500/5' : 'bg-blue-400/3'
          }`}></div>
          <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl ${
            isDark ? 'bg-purple-500/5' : 'bg-indigo-400/3'
          }`}></div>
        </div>

        {/* Mobile-Optimized Enhanced Header */}
        <div className="relative z-10 mb-1 sm:mb-2">
          <div className={`backdrop-blur-xl border rounded-md sm:rounded-lg p-2 sm:p-3 shadow-lg transition-all duration-500 ${
            isDark 
              ? 'bg-gradient-to-r from-gray-800/80 to-gray-700/80 border-gray-600/40'
              : 'bg-white border-slate-200/60 shadow-slate-300/20'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-4">
               
                <div>
                  <h1 className={`text-sm sm:text-lg font-bold mb-0 leading-tight transition-all duration-300 ${
                    isDark ? 'text-white' : ' text-slate-800'
                  }`}>
                    {test.title}
                  </h1>
                  
                  {/* Section Display for Section-wise Quizzes */}
                  {isSectionWiseQuiz && currentSectionInfo && (
                    <div className="mt-1">
                      <SectionNavigation
                        sections={test.sections}
                        currentSectionIndex={currentSectionInfo.sectionIndex}
                        displayOnly={true}
                        className={isDark?"text-white":"text-slate-500 "}
                      />
                    </div>
                  )}
                  
                  <div className={`flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs transition-all duration-300 ${
                    isDark ? 'text-gray-400' : 'text-slate-500'
                  }`}>
                    <span>Q {currentQuestionIndex + 1}/{totalQuestions}</span>
                    {isSectionWiseQuiz && currentSectionInfo && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <span className={isDark?"hidden sm:inline text-white ":" hidden sm:inline text-slate-500"}>
                          {currentSectionInfo.section.name} ({currentSectionInfo.questionInSection}/{currentSectionInfo.totalQuestionsInSection})
                        </span>
                      </>
                    )}
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline">{getAnsweredQuestionsCount()} answered</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-4">
                {/* Mobile Navigation Toggle */}
                <button
                  onClick={() => setShowMobileNav(!showMobileNav)}
                  className={`sm:hidden p-2 rounded-lg transition-all duration-300 ${
                    isDark 
                      ? 'bg-gray-700/50 text-gray-300'
                      : 'bg-slate-200/60 text-slate-600 hover:bg-slate-300/60'
                  }`}
                >
                  <FiMenu className="w-5 h-5" />
                </button>

                <div className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg backdrop-blur-sm font-mono font-bold text-[11px] sm:text-xs transition-all duration-300 ${
                  timeLeft < 300 
                    ? (isDark 
                        ? 'bg-red-500/20 border border-red-500/40 text-red-300'
                        : 'bg-red-100 border border-red-300/60 text-red-700')
                    : (isDark 
                        ? 'bg-blue-500/20 border border-blue-500/40 text-blue-300'
                        : 'bg-blue-100 border border-blue-300/60 text-blue-700')
                }`}>
                  <FiClock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>{formatTime(timeLeft)}</span>
                </div>
                
                <button
                  onClick={() => setShowConfirmDialog(true)}
                  className={`font-bold py-1 sm:py-1.5 px-2 sm:px-3 rounded-md sm:rounded-lg transition-all duration-300 hover:scale-105 shadow-md text-xs ${
                    isDark 
                      ? 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white'
                      : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white'
                  }`}
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
              <div className={`absolute top-0 left-0 w-72 h-full backdrop-blur-xl border-r p-4 shadow-xl transition-all duration-500 ${
                isDark 
                  ? 'bg-gradient-to-br from-gray-800/95 to-gray-900/95 border-gray-600/40'
                  : 'bg-white border-slate-200/60'
              }`} onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-bold transition-all duration-300 ${
                    isDark ? 'text-white' : 'text-slate-800'
                  }`}>Navigation</h3>
                  <button onClick={() => setShowMobileNav(false)} className={`transition-all duration-300 ${
                    isDark ? 'text-gray-400 hover:text-white' : 'text-slate-500 hover:text-slate-700'
                  }`}>
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="mb-6">
                  <div className={`flex justify-between text-sm mb-2 transition-all duration-300 ${
                    isDark ? 'text-gray-400' : 'text-slate-500'
                  }`}>
                    <span>Progress</span>
                    <span>{getAnsweredQuestionsCount()}/{totalQuestions}</span>
                  </div>
                  <div className={`w-full rounded-full h-2 transition-all duration-300 ${
                    isDark ? 'bg-gray-700/50' : 'bg-slate-200'
                  }`}>
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(getAnsweredQuestionsCount() / totalQuestions) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Section Navigation for Section-wise Quizzes */}
                {isSectionWiseQuiz && test.sections && (
                  <div className="mb-6">
                    <SectionNavigation
                      sections={test.sections}
                      currentSectionIndex={currentSectionInfo?.sectionIndex || 0}
                      onSectionChange={handleSectionChange}
                      isCompact={false}
                    />
                  </div>
                )}
                
                <div className="grid grid-cols-4 gap-1 mb-3">
                  {test.questions.map((_, index) => {
                    const status = getQuestionStatus(index);
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          setCurrentQuestionIndex(index);
                          setShowMobileNav(false);
                        }}
                        className={`w-8 h-8 rounded-md text-[11px] font-bold transition-all duration-300 ${
                          index === currentQuestionIndex
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white scale-110 shadow-lg'
                            : status === 'answered'
                            ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white'
                            : status === 'answered-flagged'
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                            : status === 'flagged'
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                            : (isDark 
                                ? 'bg-gray-700/50 text-gray-400'
                                : 'bg-slate-200 text-slate-600')
                        }`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded"></div>
                    <span className={`transition-all duration-300 ${
                      isDark ? 'text-gray-300' : 'text-slate-600'
                    }`}>Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded"></div>
                    <span className={`transition-all duration-300 ${
                      isDark ? 'text-gray-300' : 'text-slate-600'
                    }`}>Answered & Flagged</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded"></div>
                    <span className={`transition-all duration-300 ${
                      isDark ? 'text-gray-300' : 'text-slate-600'
                    }`}>Flagged</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded transition-all duration-300 ${
                      isDark ? 'bg-gray-600' : 'bg-slate-400'
                    }`}></div>
                    <span className={`transition-all duration-300 ${
                      isDark ? 'text-gray-300' : 'text-slate-600'
                    }`}>Not Answered</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Desktop Question Navigation Panel */}
          <div className="hidden xl:block xl:col-span-1">
            <div className={`backdrop-blur-xl border rounded-lg p-3 shadow-lg sticky top-2 transition-all duration-500 ${
              isDark 
                ? 'bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-gray-600/40'
                : 'bg-white border-slate-200/60 shadow-slate-300/20'
            }`}>
              <div className={`absolute inset-0 rounded-2xl ${
                isDark 
                  ? 'bg-gradient-to-br from-purple-500/5 to-blue-500/5'
                  : 'bg-gradient-to-br from-purple-400/3 to-blue-400/3'
              }`}></div>
              
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <FiActivity className={`w-4 h-4 transition-all duration-300 ${
                    isDark ? 'text-purple-400' : 'text-purple-600'
                  }`} />
                  <h3 className={`font-bold text-xs transition-all duration-300 ${
                    isDark ? 'text-white' : 'text-slate-800'
                  }`}>Progress</h3>
                </div>
                
                <div className="mb-2">
                  <div className={`flex justify-between text-xs mb-1 transition-all duration-300 ${
                    isDark ? 'text-gray-400' : 'text-slate-500'
                  }`}>
                    <span>Answered</span>
                    <span>{getAnsweredQuestionsCount()}/{totalQuestions}</span>
                  </div>
                  <div className={`w-full rounded-full h-2 transition-all duration-300 ${
                    isDark ? 'bg-gray-700/50' : 'bg-slate-200'
                  }`}>
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(getAnsweredQuestionsCount() / totalQuestions) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Section Navigation for Section-wise Quizzes - Desktop */}
                {isSectionWiseQuiz && test.sections && (
                  <div className="mb-3 text-white">
                    <div className="relative">
                      <select
                        value={currentSectionInfo?.sectionIndex || 0}
                        onChange={(e) => handleSectionChange(parseInt(e.target.value))}
                        className={isDark?"w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer":
                          "w-full px-4 py-2 bg-gray-100 border border-white rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"}
                      >
                        {test.sections.map((section, index) => (
                          <option key={section.id || index} value={index} className={isDark?"bg-gray-800 text-white":"bg-gray-800 text-white"}>
                            {section.name || `Section ${index + 1}`} 
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-5 gap-1 mb-2">
                  {test.questions.map((_, index) => {
                    const status = getQuestionStatus(index);
                    return (
                      <button
                        key={index}
                        onClick={() => setCurrentQuestionIndex(index)}
                        className={`w-7 h-7 rounded-md text-[11px] font-bold transition-all duration-300 ${
                          index === currentQuestionIndex
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white scale-110 shadow-lg'
                            : status === 'answered'
                            ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:scale-105'
                            : status === 'answered-flagged'
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:scale-105'
                            : status === 'flagged'
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:scale-105'
                            : (isDark 
                                ? 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50 hover:scale-105'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300 hover:scale-105')
                        }`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-1 text-[11px]">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded"></div>
                    <span className={`transition-all duration-300 ${
                      isDark ? 'text-gray-300' : 'text-slate-600'
                    }`}>Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded"></div>
                    <span className={`transition-all duration-300 ${
                      isDark ? 'text-gray-300' : 'text-slate-600'
                    }`}>Answered & Flagged</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded"></div>
                    <span className={`transition-all duration-300 ${
                      isDark ? 'text-gray-300' : 'text-slate-600'
                    }`}>Flagged</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded transition-all duration-300 ${
                      isDark ? 'bg-gray-600' : 'bg-slate-400'
                    }`}></div>
                    <span className={`transition-all duration-300 ${
                      isDark ? 'text-gray-300' : 'text-slate-600'
                    }`}>Not Answered</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Question Panel - Mobile Optimized */}
          <div className="xl:col-span-3">
            <div className={`backdrop-blur-xl border rounded-lg sm:rounded-xl p-2.5 sm:p-4 shadow-lg transition-all duration-500 ${
              isDark 
                ? 'bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-gray-600/40'
                : 'bg-white border-slate-200/60 shadow-slate-300/20'
            }`}>
              <div className={`absolute inset-0 rounded-xl sm:rounded-2xl ${
                isDark 
                  ? 'bg-gradient-to-br from-blue-500/5 to-purple-500/5'
                  : 'bg-gradient-to-br from-blue-400/3 to-indigo-400/3'
              }`}></div>
              
              <div className="relative">
                {/* Mobile-Optimized Question Header */}
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between mb-2 sm:mb-3 pb-2 sm:pb-2 border-b gap-2 transition-all duration-300 ${
                  isDark ? 'border-gray-600/40' : 'border-slate-200/60'
                }`}>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <h2 className={`text-2xl sm:text-3xl font-bold transition-all duration-300 ${
                      isDark ? 'text-white' : 'text-slate-800'
                    }`}>
                      Question {currentQuestionIndex + 1}
                    </h2>
                    {(() => {
                      const nm = getEffectiveNegativeMarking(currentQuestion);
                      if (!nm) return null;
                      const valueText = `-${nm.value}`;
                      return (
                        <span
                          title={`Negative marking applied for wrong answers (${nm.type === 'fractional' ? 'fractional' : 'fixed'}: ${nm.value})`}
                          className={`ml-2 inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold border ${
                            isDark ? 'bg-gray-700/50 text-slate-300 border-slate-300/60' : 'bg-slate-200 text-slate-700 border-slate-200/60'
                          }`}
                        >
                          Negative: {valueText}
                        </span>
                      );
                    })()}
                  </div>
                  
                  <button
                    onClick={toggleFlag}
                    className={`group flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg font-semibold transition-all duration-300 hover:scale-105 text-xs ${
                      flaggedQuestions.has(currentQuestionIndex)
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                        : (isDark 
                            ? 'bg-gray-700/50 text-gray-300 hover:bg-yellow-500/20 border border-gray-600/40'
                            : 'bg-slate-100 text-slate-700 hover:bg-yellow-100 border border-slate-300/60')
                    }`}
                  >
                    <FiFlag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span className="hidden sm:inline">{flaggedQuestions.has(currentQuestionIndex) ? 'Flagged' : 'Flag Question'}</span>
                    <span className="sm:hidden">Flag</span>
                  </button>
                </div>

                {/* Question Image */}
                {currentQuestion.image && (
                  <div className="mb-4 sm:mb-5 sm:mr-130 sm:ml-1">
                    <div className="relative rounded-xl overflow-hidden  max-w-md mx-auto">
                      <img
                        src={currentQuestion.image}
                        alt="Question illustration"
                        className="w-auto h-auto object-contain bg-gray-50 dark:bg-gray-800"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="hidden w-full h-32 bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl items-center justify-center">
                        <div className="text-center">
                          <div className="w-6 h-6 text-gray-400 mx-auto mb-1">📷</div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Failed to load image</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Question Text */}
                <div className="mb-3 sm:mb-4">
                  <p className={`text-lg sm:text-xl leading-relaxed font-semibold transition-all duration-300 ${
                    isDark ? 'text-white' : 'text-slate-800'
                  }`}>
                    {currentQuestion.question}
                  </p>
                </div>

                

                {/* Mobile-Optimized Enhanced Options with Click-to-Unmark */}
                <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-5">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = answers[currentQuestionIndex] === index;
                    return (
                      <label
                        key={index}
                        onClick={(e) => {
                          e.preventDefault(); // Prevent default radio behavior
                          handleAnswerSelect(index);
                        }}
                        className={`group flex items-start sm:items-center p-3 sm:p-4 rounded-md sm:rounded-lg border-2 cursor-pointer transition-all duration-300  ${
                          isSelected
                            ? 'border-blue-500/60 bg-gradient-to-r from-blue-500/20 to-purple-500/20 shadow-lg shadow-blue-500/25'
                            : (isDark 
                                ? 'border-gray-600/40 bg-gray-800/30 hover:border-blue-500/40 hover:bg-gray-700/40'
                                : 'border-slate-300/60 bg-white hover:border-blue-400/60 hover:bg-slate-50')
                        }`}
                      >
                        <div className="relative mt-0.5 sm:mt-0">
                          <input
                            type="radio"
                            name={`question-${currentQuestionIndex}`}
                            value={index}
                            checked={isSelected}
                            onChange={() => {}} // Empty function since we handle clicks on label
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md flex items-center justify-center font-semibold text-[11px] transition-all duration-300 border ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : (isDark 
                                  ? 'bg-gray-700 text-gray-200 border-gray-600 group-hover:border-blue-400'
                                  : 'bg-gray-100 text-slate-700 border-slate-300 group-hover:border-blue-500')
                          }`}>
                            {String.fromCharCode(65 + index)}
                          </div>
                        </div>
                        
                        <div className="ml-2.5 sm:ml-3 flex-1">
                          <div className="flex items-start sm:items-center justify-between gap-2 sm:gap-2.5">
                            <div className="flex-1">
                              <span className={`text-base sm:text-lg font-medium leading-relaxed transition-all duration-300 ${
                                isSelected 
                                  ? 'text-white' 
                                  : (isDark ? 'text-gray-300' : 'text-slate-700')
                              }`}>
                                {option}
                              </span>
                              
                              {/* Option Image */}
                              {currentQuestion.optionImages && currentQuestion.optionImages[index] && (
                                <div className="mt-3">
                                  <div className="relative w-auto h-auto rounded-lg overflow-hidden  dark:border-gray-600 max-w-sm">
                                    <img
                                      src={currentQuestion.optionImages[index]}
                                      alt={`Option ${String.fromCharCode(65 + index)} illustration`}
                                      className="w-auto h-auto object-contain bg-gray-50 dark:bg-gray-800 "
                                      style={{
                                        maxHeight: '200px',
                                        objectFit: 'contain'
                                      }}
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                      }}
                                    />
                                    <div className="hidden w-full h-24 bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg items-center justify-center">
                                      <div className="text-center">
                                        <div className="w-4 h-4 text-gray-400 mx-auto mb-1">📷</div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Failed to load image</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>

                

                {/* Mobile-Optimized Enhanced Navigation Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0">
                  <button
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className={`group backdrop-blur-xl border rounded-lg px-3 sm:px-6 py-2 sm:py-3 font-medium transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 shadow-md hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none order-2 sm:order-1 text-sm ${
                      isDark 
                        ? 'bg-gradient-to-r from-gray-700/80 to-gray-600/80 border-gray-600/40 text-gray-300 hover:from-gray-600/80 hover:to-gray-500/80'
                        : 'bg-white border-slate-200/60 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-slate-200/40'
                    }`}
                  >
                    <FiChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 transition-transform group-hover:-translate-x-1" />
                    <span>Previous</span>
                  </button>

                  <div className="flex gap-2 sm:gap-3 order-1 sm:order-2">
                    {!isLastQuestion ? (
                      <button
                        onClick={handleNextQuestion}
                        className={`group relative flex-1 sm:flex-none font-bold rounded-lg px-4 sm:px-6 py-2 sm:py-3 transition-all duration-300 transform hover:scale-105 shadow-lg text-sm ${
                          isDark 
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:shadow-blue-500/25'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:shadow-blue-500/30'
                        }`}
                      >
                        <div className={`absolute inset-0 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                          isDark 
                            ? 'bg-gradient-to-r from-blue-400/20 to-purple-400/20'
                            : 'bg-gradient-to-r from-blue-400/20 to-indigo-400/20'
                        }`}></div>
                        <div className="relative flex items-center justify-center gap-1 sm:gap-2">
                          <span>Next</span>
                          <FiChevronRight className="w-3 h-3 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" />
                        </div>
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowConfirmDialog(true)}
                        className={`group relative flex-1 sm:flex-none font-bold rounded-lg px-4 sm:px-6 py-2 sm:py-3 transition-all duration-300 transform hover:scale-105 shadow-lg text-sm ${
                          isDark 
                            ? 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white hover:shadow-emerald-500/25'
                            : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white hover:shadow-emerald-500/30'
                        }`}
                      >
                        <div className={`absolute inset-0 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                          isDark 
                            ? 'bg-gradient-to-r from-emerald-400/20 to-green-400/20'
                            : 'bg-gradient-to-r from-emerald-400/20 to-green-400/20'
                        }`}></div>
                        <div className="relative flex items-center justify-center gap-1 sm:gap-2">
                          <FiCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Submit</span>
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
            <div className={`relative backdrop-blur-xl border rounded-2xl sm:rounded-3xl p-6 sm:p-10 max-w-lg mx-auto shadow-2xl w-full max-h-[90vh] overflow-y-auto transition-all duration-500 ${
              isDark 
                ? 'bg-gradient-to-br from-gray-800/95 to-gray-900/95 border-yellow-600/40'
                : 'bg-white border-yellow-400/60'
            }`}>
              <div className={`absolute inset-0 rounded-2xl sm:rounded-3xl ${
                isDark 
                  ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10'
                  : 'bg-gradient-to-br from-yellow-50 to-orange-50'
              }`}></div>
              
              <div className="relative text-center">
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl transition-all duration-300 ${
                  isDark 
                    ? 'bg-gradient-to-br from-yellow-500 to-orange-500'
                    : 'bg-gradient-to-br from-yellow-500 to-orange-500'
                }`}>
                  <FiAlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                
                <h3 className={`text-xl sm:text-2xl font-bold mb-3 sm:mb-4 transition-all duration-300 ${
                  isDark ? 'text-white' : 'text-slate-800'
                }`}>
                  Submit Test?
                </h3>
                
                <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 transition-all duration-300 ${
                  isDark ? 'bg-gray-800/50' : 'bg-slate-100'
                }`}>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
                    <div className="text-center">
                      <div className={`text-xl sm:text-2xl font-bold transition-all duration-300 ${
                        isDark ? 'text-emerald-400' : 'text-emerald-600'
                      }`}>{getAnsweredQuestionsCount()}</div>
                      <div className={`text-xs sm:text-sm transition-all duration-300 ${
                        isDark ? 'text-gray-400' : 'text-slate-500'
                      }`}>Answered</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-xl sm:text-2xl font-bold transition-all duration-300 ${
                        isDark ? 'text-red-400' : 'text-red-600'
                      }`}>{totalQuestions - getAnsweredQuestionsCount()}</div>
                      <div className={`text-xs sm:text-sm transition-all duration-300 ${
                        isDark ? 'text-gray-400' : 'text-slate-500'
                      }`}>Remaining</div>
                    </div>
                  </div>
                </div>
                
                {getAnsweredQuestionsCount() < totalQuestions && (
                  <div className={`border rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 transition-all duration-300 ${
                    isDark 
                      ? 'bg-yellow-500/10 border-yellow-500/30'
                      : 'bg-yellow-50 border-yellow-300/60'
                  }`}>
                    <p className={`text-sm transition-all duration-300 ${
                      isDark ? 'text-yellow-300' : 'text-yellow-700'
                    }`}>
                      ⚠️ {totalQuestions - getAnsweredQuestionsCount()} questions are still unanswered.
                    </p>
                  </div>
                )}
                
                <p className={`mb-6 sm:mb-8 text-sm sm:text-base transition-all duration-300 ${
                  isDark ? 'text-gray-300' : 'text-slate-600'
                }`}>
                  Once submitted, you cannot modify your answers.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={() => setShowConfirmDialog(false)}
                    className={`flex-1 font-bold rounded-lg sm:rounded-xl px-4 sm:px-6 py-3 sm:py-4 transition-colors text-sm sm:text-base ${
                      isDark 
                        ? 'bg-gray-600 hover:bg-gray-700 text-white'
                        : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                    }`}
                  >
                    Review Answers
                  </button>
                  <button
                    onClick={handleSubmitTest}
                    disabled={loading}
                    className={`flex-1 font-bold rounded-lg sm:rounded-xl px-4 sm:px-6 py-3 sm:py-4 transition-all duration-300 disabled:opacity-50 shadow-lg text-sm sm:text-base ${
                      isDark 
                        ? 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white hover:shadow-emerald-500/25'
                        : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white hover:shadow-emerald-500/30'
                    }`}
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

        {/* Leave/Tab Change Warning Modal */}
        {leaveWarningVisible && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
            <div className={`relative backdrop-blur-xl border rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-md mx-auto shadow-2xl w-full ${
              isDark ? 'bg-gray-900/95 border-yellow-600/40' : 'bg-white border-yellow-400/60'
            }`}>
              <div className="text-center">
                <div className={`w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center ${
                  isDark ? 'bg-yellow-500' : 'bg-yellow-500'
                }`}>
                  <FiAlertCircle className="w-7 h-7 text-white" />
                </div>
                <h3 className={`${isDark ? 'text-white' : 'text-slate-800'} text-xl font-bold mb-2`}>
                  You left the test window
                </h3>
                <p className={`${isDark ? 'text-gray-300' : 'text-slate-600'} mb-4`}>
                  Returning in {leaveCountdown}s or your test will be submitted automatically.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => {
                      setLeaveWarningVisible(false);
                      setLeaveCountdown(null);
                    }}
                    className={`${
                      isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                    } px-5 py-3 rounded-lg font-semibold`}
                  >
                    I'm Back
                  </button>
                  <button
                    onClick={handleSubmitTest}
                    className={`${
                      isDark ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    } px-5 py-3 rounded-lg font-semibold`}
                  >
                    Submit Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Beautiful Popup */}
      <BeautifulPopup
        {...popupState}
        onClose={hidePopup}
      />
    </div>
  );
};

export default TestAttemptViewer;
