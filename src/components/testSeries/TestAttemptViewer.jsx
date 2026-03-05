import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
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
  FiFlag,
  FiAlertCircle,
  FiBookOpen,
  FiTarget,
  FiChevronRight,
  FiChevronLeft,
  FiMenu,
  FiGrid,
  FiCheckCircle,
  FiHelpCircle,
  FiActivity,
  FiAward,
  FiBarChart2,
  FiArrowRight,
  FiRefreshCw,
  FiSend
} from 'react-icons/fi';
import { FaTrophy, FaRobot } from 'react-icons/fa';
import SectionNavigation from '../quiz/SectionNavigation';
import Confetti from 'react-confetti';
import TestResults from './TestResults';

const TestAttemptViewer = ({ test, testSeries, onBack, onComplete }) => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const { popupState, showError, showSuccess, hidePopup } = usePopup();

  // --- Safe Initialization ---
  const initialTime = (test?.timeLimit || 30) * 60;

  // --- State ---
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [isTestCompleted, setIsTestCompleted] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [leaveCountdown, setLeaveCountdown] = useState(null);
  const [leaveWarningVisible, setLeaveWarningVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [completedAttempt, setCompletedAttempt] = useState(null);

  // Safe key generation
  const storageKey = `${currentUser?.uid || 'anon'}:test-progress:${test?.id || 'unknown'}`;
  const location = useLocation();

  // --- Return Loading if Test is Missing ---
  if (!test) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center space-y-4 ${isDark ? 'bg-zinc-950' : 'bg-zinc-50'}`}>
        <div className="relative">
          <div className="w-16 h-16 border-4 border-emerald-200 dark:border-emerald-900/30 border-t-emerald-600 rounded-full animate-spin"></div>
        </div>
        <p className={`text-sm font-medium animate-pulse ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          Loading Assessment Data...
        </p>
      </div>
    );
  }

  // --- Logic Helpers ---

  const isSectionWiseQuiz = useMemo(() =>
    test.sections && Array.isArray(test.sections) && test.sections.length > 0
    , [test.sections]);

  const getCurrentSectionInfo = useCallback(() => {
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
  }, [isSectionWiseQuiz, test.sections, currentQuestionIndex]);

  const currentSectionInfo = getCurrentSectionInfo();

  const getCurrentQuestion = useCallback(() => {
    if (isSectionWiseQuiz && currentSectionInfo) {
      return currentSectionInfo.section.questions?.[currentSectionInfo.questionInSection - 1];
    }
    return test.questions?.[currentQuestionIndex];
  }, [isSectionWiseQuiz, currentSectionInfo, test.questions, currentQuestionIndex]);

  const currentQuestion = getCurrentQuestion();
  const totalQuestions = useMemo(() => {
    if (isSectionWiseQuiz) {
      return test.sections.reduce((acc, s) => acc + (s.questions?.length || 0), 0);
    }
    return test.questions?.length || 0;
  }, [isSectionWiseQuiz, test]);

  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  const progressPercentage = useMemo(() =>
    totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0,
    [currentQuestionIndex, totalQuestions]);

  // --- Effects ---

  // Timer Logic
  useEffect(() => {
    if (!isTestStarted || isTestCompleted) return;
    const limitSeconds = (test.timeLimit || 30) * 60;
    const startedAtMs = startTime ? new Date(startTime).getTime() : Date.now();
    const endAtMs = startedAtMs + limitSeconds * 1000;

    let timeoutId;
    const tick = () => {
      const remainingMs = Math.max(0, endAtMs - Date.now());
      const remainingSeconds = Math.round(remainingMs / 1000);
      setTimeLeft(prev => {
        if (remainingSeconds === 0 && prev !== 0) {
          // Auto-submit when time runs out
          setTimeout(() => handleSubmitTest(), 0);
        }
        return remainingSeconds;
      });
      if (remainingMs > 0 && !isTestCompleted) {
        timeoutId = window.setTimeout(tick, 250);
      }
    };
    timeoutId = window.setTimeout(tick, 0);
    return () => window.clearTimeout(timeoutId);
  }, [isTestStarted, isTestCompleted, startTime, test.timeLimit]);

  // Initialize Start Time
  useEffect(() => {
    if (isTestStarted && !startTime) setStartTime(new Date());
  }, [isTestStarted, startTime]);

  // Restore Progress from LocalStorage
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

  // Save Progress to LocalStorage
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
    try { localStorage.setItem(storageKey, JSON.stringify(payload)); } catch { }
  }, [isTestStarted, isTestCompleted, currentQuestionIndex, answers, flaggedQuestions, timeLeft, startTime]);

  // Anti-Cheat: Visibility Change Detection
  useEffect(() => {
    if (!isTestStarted || isTestCompleted) return;
    const handleVisibility = () => {
      if (document.hidden) {
        setLeaveCountdown(10);
        setLeaveWarningVisible(true);
      } else {
        // Recalculate time left based on start time to prevent pausing timer by leaving tab
        try {
          const limitSeconds = (test.timeLimit || 30) * 60;
          const startedAtMs = startTime ? new Date(startTime).getTime() : Date.now();
          const endAtMs = startedAtMs + limitSeconds * 1000;
          const remainingSeconds = Math.max(0, Math.round((endAtMs - Date.now()) / 1000));
          setTimeLeft(remainingSeconds);
        } catch { }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isTestStarted, isTestCompleted, startTime, test.timeLimit]);

  // Anti-Cheat: Countdown when user leaves
  useEffect(() => {
    if (leaveCountdown === null) return;
    if (leaveCountdown <= 0) {
      setLeaveWarningVisible(false);
      setLeaveCountdown(null);
      handleSubmitTest(); // Auto-submit if they don't return in time
      return;
    }
    const t = setTimeout(() => setLeaveCountdown(prev => (prev ?? 0) - 1), 1000);
    return () => clearTimeout(t);
  }, [leaveCountdown]);

  // Prevent Back Button
  useEffect(() => {
    if (!isTestStarted || isTestCompleted) return;
    const push = () => { try { window.history.pushState({ preventLeave: true }, '', window.location.href); } catch { } };
    push();
    const onPopState = () => { push(); setLeaveCountdown(10); setLeaveWarningVisible(true); };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [isTestStarted, isTestCompleted]);

  // --- Handlers ---

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (optionIndex) => {
    const qType = currentQuestion?.type || 'mcq';
    if (qType === 'msq') {
      setAnswers(prev => {
        const newAnswers = { ...prev };
        const current = Array.isArray(prev[currentQuestionIndex]) ? [...prev[currentQuestionIndex]] : [];
        const idx = current.indexOf(optionIndex);
        if (idx !== -1) current.splice(idx, 1);
        else current.push(optionIndex);
        if (current.length === 0) delete newAnswers[currentQuestionIndex];
        else newAnswers[currentQuestionIndex] = current;
        return newAnswers;
      });
    } else {
      setAnswers(prev => {
        const newAnswers = { ...prev };
        if (prev[currentQuestionIndex] === optionIndex) delete newAnswers[currentQuestionIndex];
        else newAnswers[currentQuestionIndex] = optionIndex;
        return newAnswers;
      });
    }
  };

  const handleNumericalAnswer = (value) => {
    setAnswers(prev => {
      const newAnswers = { ...prev };
      if (value === '' || value === null || value === undefined) delete newAnswers[currentQuestionIndex];
      else newAnswers[currentQuestionIndex] = value;
      return newAnswers;
    });
  };

  const handleClearAnswer = () => {
    setAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[currentQuestionIndex];
      return newAnswers;
    });
  };

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
    if (newFlagged.has(currentQuestionIndex)) newFlagged.delete(currentQuestionIndex);
    else newFlagged.add(currentQuestionIndex);
    setFlaggedQuestions(newFlagged);
  };

  const calculateScore = () => {
    let correct = 0;
    let incorrect = 0;
    let totalScore = 0;
    let maxPossibleScore = 0;

    const allQuestions = isSectionWiseQuiz
      ? test.sections.flatMap(s => s.questions)
      : test.questions;

    allQuestions.forEach((question, index) => {
      const positiveMarks = question.positiveMarking?.enabled && question.positiveMarking.value
        ? parseFloat(question.positiveMarking.value)
        : 1;
      maxPossibleScore += positiveMarks;
      const qType = question.type || 'mcq';
      const userAnswer = answers[index];

      if (qType === 'numerical') {
        if (userAnswer !== undefined && userAnswer !== '' && userAnswer !== null) {
          const userNum = parseFloat(userAnswer);
          const correctNum = parseFloat(question.correctAnswer);
          const tolerance = parseFloat(question.tolerance) || 0;
          if (!isNaN(userNum) && !isNaN(correctNum) && Math.abs(userNum - correctNum) <= tolerance) {
            correct++;
            totalScore += positiveMarks;
          } else {
            incorrect++;
            let neg = question.negativeMarking?.enabled ? question.negativeMarking : (test.negativeMarking?.enabled ? test.negativeMarking : null);
            if (neg) totalScore -= neg.type === 'fractional' ? positiveMarks * neg.value : neg.value;
          }
        }
      } else if (qType === 'msq') {
        const correctArr = Array.isArray(question.correctAnswer) ? question.correctAnswer : [];
        const userArr = Array.isArray(userAnswer) ? userAnswer : [];
        if (userArr.length > 0) {
          const correctSelected = userArr.filter(a => correctArr.includes(a)).length;
          const wrongSelected = userArr.filter(a => !correctArr.includes(a)).length;
          if (correctSelected === correctArr.length && wrongSelected === 0) {
            correct++;
            totalScore += positiveMarks;
          } else if (question.partialMarking && wrongSelected === 0 && correctSelected > 0) {
            totalScore += positiveMarks * (correctSelected / correctArr.length);
          } else if (wrongSelected > 0) {
            incorrect++;
            let neg = question.negativeMarking?.enabled ? question.negativeMarking : (test.negativeMarking?.enabled ? test.negativeMarking : null);
            if (neg) totalScore -= neg.type === 'fractional' ? positiveMarks * neg.value : neg.value;
          }
        }
      } else {
        if (userAnswer === question.correctAnswer) {
          correct++;
          totalScore += positiveMarks;
        } else if (userAnswer !== undefined) {
          incorrect++;
          let neg = question.negativeMarking?.enabled ? question.negativeMarking : (test.negativeMarking?.enabled ? test.negativeMarking : null);
          if (neg) {
            if (neg.type === 'fractional') totalScore -= positiveMarks * neg.value;
            else if (neg.type === 'fixed') totalScore -= neg.value;
          }
        }
      }
    });

    totalScore = Math.max(0, totalScore);
    const finalScoreVal = Math.round(totalScore * 100) / 100;
    const percentage = maxPossibleScore > 0 ? Math.round((finalScoreVal / maxPossibleScore) * 100) : 0;

    return { correct, incorrect, totalScore: finalScoreVal, maxPossibleScore, percentage };
  };

  const handleSubmitTest = async () => {
    setLoading(true);
    try {
      const scoreData = calculateScore();
      const now = new Date();
      const timeSpentInSeconds = startTime ? Math.floor((now - startTime) / 1000) : ((test.timeLimit * 60) - timeLeft);
      const actualStartTime = startTime || new Date(now.getTime() - (timeSpentInSeconds * 1000));

      // --- PASS/FAIL LOGIC ---
      // Check if a specific passing score is set in the test metadata
      const passingThreshold = test.passingScore !== undefined && test.passingScore !== null && test.passingScore > 0
        ? parseFloat(test.passingScore)
        : (scoreData.maxPossibleScore * 0.4); // Fallback to 40% if not set

      const isPassed = scoreData.totalScore >= passingThreshold;

      const attemptData = {
        testId: test.id,
        testTitle: test.title,
        testSeriesId: testSeries?.id || null,
        testSeriesTitle: testSeries?.title || null,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: currentUser.displayName || currentUser.email,
        answers,
        score: scoreData.correct,
        totalScore: scoreData.totalScore,
        maxScore: scoreData.maxPossibleScore,
        totalQuestions,
        percentage: scoreData.percentage,
        isPassed: isPassed,          // Saving status
        passingScore: passingThreshold, // Saving threshold used
        timeSpent: timeSpentInSeconds,
        flaggedQuestions: Array.from(flaggedQuestions),
        startedAt: actualStartTime,
        completedAt: now,
        difficulty: test.difficulty || 'medium',
        isAIGenerated: test.isAIGenerated || false
      };

      const docRef = await addDoc(collection(db, 'test-attempts'), attemptData);
      try { localStorage.removeItem(storageKey); } catch { }

      try {
        const collectionName = isSectionWiseQuiz ? 'section-quizzes' : 'quizzes';
        await updateDoc(doc(db, collectionName, test.id), {
          totalAttempts: increment(1)
        });
      } catch (e) { console.warn("Could not update aggregate stats", e); }

      setIsTestCompleted(true);
      if (isPassed) setShowConfetti(true);
      setCompletedAttempt({ ...attemptData, id: docRef.id });
      if (onComplete) onComplete({ ...attemptData, id: docRef.id });
    } catch (error) {
      console.error('Submission Error:', error);
      showError('Failed to submit test. Please try again.', 'Submission Error');
    } finally {
      setLoading(false);
    }
  };

  const getQuestionStatus = (index) => {
    if (answers.hasOwnProperty(index)) return flaggedQuestions.has(index) ? 'answered-flagged' : 'answered';
    return flaggedQuestions.has(index) ? 'flagged' : 'unanswered';
  };

  const mode = (light, dark) => (isDark ? dark : light);

  const getNavButtonClass = (index) => {
    const status = getQuestionStatus(index);
    const isCurrent = index === currentQuestionIndex;

    let baseClass = "w-9 h-9 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center border cursor-pointer ";

    if (isCurrent) return baseClass + "bg-emerald-600 border-emerald-600 text-white shadow-md scale-110 ring-2 ring-emerald-200 dark:ring-emerald-900 z-10";

    switch (status) {
      case 'answered': return baseClass + (isDark ? "bg-emerald-900/30 border-emerald-800 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-700");
      case 'answered-flagged': return baseClass + (isDark ? "bg-amber-900/30 border-amber-800 text-amber-400" : "bg-amber-50 border-amber-200 text-amber-700");
      case 'flagged': return baseClass + (isDark ? "bg-red-900/30 border-red-800 text-red-400" : "bg-red-50 border-red-200 text-red-700");
      default: return baseClass + (isDark ? "bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700" : "bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50");
    }
  };

  // --- Views ---

  // 1. Start Screen
  if (!isTestStarted) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 transition-colors duration-300 ${mode('bg-slate-50', 'bg-zinc-950')}`}>

        <div className={`w-full max-w-3xl rounded-[2rem] p-8 sm:p-12 shadow-2xl border relative overflow-hidden transition-all ${mode('bg-white/80 border-slate-200/60 shadow-slate-200/50', 'bg-zinc-900/80 border-zinc-800/60 shadow-black/50')} backdrop-blur-xl`}>

          <div className="relative z-10 text-center space-y-10">
            <div className="space-y-6">
              <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-widest border shadow-sm ${mode('bg-white border-emerald-100 text-emerald-600', 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400')}`}>
                <FiTarget className="w-4 h-4" /> {totalQuestions} Questions Included
              </span>

              <div className="space-y-4">
                <h1 className={`text-4xl sm:text-5xl font-black tracking-tighter leading-tight ${mode('text-slate-900', 'text-white')}`}>
                  {test.title}
                </h1>
                <p className={`text-lg leading-relaxed max-w-2xl mx-auto font-medium ${mode('text-slate-500', 'text-zinc-400')}`}>
                  {test.description || "Ready to test your knowledge? This assessment is timed and will evaluate your proficiency."}
                </p>
              </div>
            </div>

            {/* Stats Grid with Passing Score */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {[
                { icon: FiClock, label: "Time Limit", value: `${test.timeLimit || 30}m` },
                { icon: FiAward, label: "Difficulty", value: test.difficulty || 'Medium' },
                { icon: FiCheckCircle, label: "Passing Score", value: test.passingScore ? `${test.passingScore}` : "40%" }
              ].map((item, i) => (
                <div key={i} className={`p-5 rounded-2xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${mode('bg-white/50 border-slate-100 shadow-sm hover:shadow-slate-200/40', 'bg-zinc-800/40 border-zinc-700/50 hover:shadow-black/40 hover:bg-zinc-800/60')}`}>
                  <item.icon className={`w-6 h-6 mx-auto mb-3 ${mode('text-emerald-500', 'text-emerald-400')}`} />
                  <div className={`font-bold text-xl tracking-tight ${mode('text-slate-800', 'text-zinc-100')}`}>{item.value}</div>
                  <div className={`text-[10px] uppercase tracking-widest font-bold mt-1 ${mode('text-slate-400', 'text-zinc-500')}`}>{item.label}</div>
                </div>
              ))}
            </div>

            <div className={`p-6 rounded-2xl border-l-4 text-left text-sm space-y-3 ${mode('bg-amber-50/50 border-amber-200 border-l-amber-500 text-amber-900', 'bg-amber-900/10 border-amber-800/30 border-l-amber-500 text-amber-200')}`}>
              <p className="font-bold flex items-center gap-2 text-base"><FiAlertCircle className="w-5 h-5" /> Important Instructions</p>
              <ul className="list-disc list-inside opacity-90 space-y-1.5 ml-1">
                <li>Do not refresh the page during the test.</li>
                <li>Flagged questions can be reviewed before submission.</li>
                {test.negativeMarking?.enabled && <li><strong>Negative Marking is Enabled</strong> for incorrect answers.</li>}
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <button onClick={onBack} className={`px-8 py-4 rounded-xl font-bold transition-all duration-200 ${mode('bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700', 'bg-transparent text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300')}`}>
                Cancel
              </button>
              <button onClick={() => setIsTestStarted(true)} className="group px-10 py-4 rounded-xl font-bold bg-emerald-600 text-white shadow-xl shadow-emerald-600/20 hover:shadow-emerald-600/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                Start Assessment <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Completion Screen
  if (isTestCompleted) {
    if (completedAttempt) {
      return (
        <TestResults
          attempt={completedAttempt}
          testSeries={testSeries}
          onRetakeTest={() => window.location.reload()}
          onViewAnalysis={() => onComplete(completedAttempt)}
          onBackToSeries={onBack}
        />
      );
    } else {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      );
    }
  }

  // 3. Main Test Interface
  return (
    <div className={`min-h-screen flex flex-col h-screen overflow-hidden ${mode('bg-slate-50', 'bg-zinc-950')}`}>
      {showConfetti && <Confetti recycle={false} numberOfPieces={400} />}

      {/* Top Bar */}
      <header className={`flex-none h-16 px-4 sm:px-6 border-b flex items-center justify-between z-20 ${mode('bg-white border-slate-200', 'bg-zinc-900 border-zinc-800')}`}>
        <div className="flex items-center gap-4">
          <h1 className={`font-bold truncate max-w-[200px] sm:max-w-md ${mode('text-slate-900', 'text-white')}`}>{test.title}</h1>
          {isSectionWiseQuiz && currentSectionInfo && (
            <span className={`hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${mode('bg-slate-100 border-slate-200 text-slate-600', 'bg-zinc-800 border-zinc-700 text-zinc-400')}`}>
              {currentSectionInfo.section.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono font-bold text-sm ${timeLeft < 300
            ? 'bg-rose-100 text-rose-700 animate-pulse'
            : mode('bg-slate-100 text-slate-700', 'bg-zinc-800 text-zinc-300')
            }`}>
            <FiClock />
            {formatTime(timeLeft)}
          </div>
          <button
            onClick={() => setShowConfirmDialog(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm transition-colors"
          >
            Submit
          </button>
          <button
            onClick={() => setShowMobileNav(!showMobileNav)}
            className={`lg:hidden p-2 rounded-lg ${mode('hover:bg-slate-100', 'hover:bg-zinc-800')}`}
          >
            <FiGrid className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* Question Navigator Sidebar (Desktop) */}
        <aside className={`hidden lg:flex w-80 flex-col border-r z-10 ${mode('bg-white border-slate-200', 'bg-zinc-900 border-zinc-800')}`}>
          <div className="p-4 border-b border-inherit">
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-1 ${mode('text-slate-500', 'text-zinc-500')}`}>Question Navigator</h3>
            <div className="flex justify-between text-sm">
              <span className="text-emerald-600 font-medium">{Object.keys(answers).length} Answered</span>
              <span className="opacity-50">{flaggedQuestions.size} Flagged</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: totalQuestions }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={getNavButtonClass(idx)}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {isSectionWiseQuiz && test.sections && (
            <div className="p-4 border-t border-inherit">
              <SectionNavigation
                sections={test.sections}
                currentSectionIndex={currentSectionInfo?.sectionIndex || 0}
                onSectionChange={handleSectionChange}
                isCompact
              />
            </div>
          )}
        </aside>

        {/* Question Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 scroll-smooth relative">
          <div className="max-w-3xl mx-auto pb-20">

            {/* Mobile Question Nav Drawer */}
            {showMobileNav && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowMobileNav(false)} />
                <div className={`absolute right-0 top-0 bottom-0 w-80 p-6 shadow-2xl flex flex-col ${mode('bg-white', 'bg-zinc-900')}`}>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg">Questions</h3>
                    <button onClick={() => setShowMobileNav(false)}><FiX className="w-6 h-6" /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto grid grid-cols-5 gap-3 content-start">
                    {Array.from({ length: totalQuestions }).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => { setCurrentQuestionIndex(idx); setShowMobileNav(false); }}
                        className={getNavButtonClass(idx)}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Question Card */}
            <div className={`rounded-2xl shadow-sm border mb-6 overflow-hidden ${mode('bg-white border-slate-200', 'bg-zinc-900 border-zinc-800')}`}>

              <div className={`p-6 border-b ${mode('bg-slate-50/50 border-slate-100', 'bg-zinc-900 border-zinc-800')}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${mode('bg-slate-100 text-slate-600 border border-slate-200', 'bg-zinc-800 text-zinc-400 border border-zinc-700')}`}>
                      Question {currentQuestionIndex + 1}
                    </span>
                    {(() => {
                      const qType = currentQuestion?.type || 'mcq';
                      if (qType === 'numerical') return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-700">Numerical</span>;
                      if (qType === 'msq') return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-700">Multi-Select</span>;
                      return null;
                    })()}
                  </div>
                  <button
                    onClick={toggleFlag}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${flaggedQuestions.has(currentQuestionIndex) ? 'text-amber-500' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <FiFlag className={flaggedQuestions.has(currentQuestionIndex) ? 'fill-current' : ''} />
                    {flaggedQuestions.has(currentQuestionIndex) ? 'Flagged' : 'Flag'}
                  </button>
                </div>

                <h2 className={`text-xl sm:text-2xl font-semibold leading-relaxed ${mode('text-slate-900', 'text-zinc-100')}`}>
                  {currentQuestion?.question}
                </h2>
              </div>

              {currentQuestion?.image && (
                <div className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 p-4 flex justify-center">
                  <img src={currentQuestion.image} alt="Question" className="max-h-64 object-contain rounded-lg" />
                </div>
              )}

              <div className="p-6 space-y-3">
                {(() => {
                  const qType = currentQuestion?.type || 'mcq';

                  if (qType === 'numerical') {
                    return (
                      <div className="space-y-4">
                        <label className={`block text-xs font-bold uppercase tracking-wider ${mode('text-slate-500', 'text-zinc-400')}`}>
                          Enter your numerical answer
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={answers[currentQuestionIndex] ?? ''}
                          onChange={(e) => handleNumericalAnswer(e.target.value)}
                          placeholder="Type your answer..."
                          className={`w-full px-5 py-4 rounded-xl border-2 text-lg font-mono font-bold focus:outline-none transition-all duration-200 ${answers[currentQuestionIndex] !== undefined && answers[currentQuestionIndex] !== ''
                              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                              : mode('border-slate-200 bg-white focus:border-emerald-400', 'border-zinc-700 bg-zinc-800 focus:border-emerald-500')
                            } ${mode('text-slate-900 placeholder-slate-400', 'text-white placeholder-zinc-500')}`}
                        />
                        {currentQuestion?.tolerance > 0 && (
                          <p className={`text-xs ${mode('text-slate-400', 'text-zinc-500')}`}>
                            Tolerance: ±{currentQuestion.tolerance}
                          </p>
                        )}
                      </div>
                    );
                  }

                  const isMSQ = qType === 'msq';
                  const selectedArr = isMSQ && Array.isArray(answers[currentQuestionIndex]) ? answers[currentQuestionIndex] : [];

                  return (
                    <>
                      {(currentQuestion?.options || []).map((option, idx) => {
                        const isSelected = isMSQ ? selectedArr.includes(idx) : answers[currentQuestionIndex] === idx;
                        return (
                          <button
                            key={idx}
                            onClick={() => handleAnswerSelect(idx)}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-start gap-4 group ${isSelected
                              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-500'
                              : mode('border-slate-100 hover:border-emerald-200 hover:bg-slate-50', 'border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50')
                              }`}
                          >
                            <div className={`w-8 h-8 ${isMSQ ? 'rounded-md' : 'rounded-lg'} flex items-center justify-center text-sm font-bold transition-colors shrink-0 ${isSelected
                              ? 'bg-emerald-500 text-white shadow-sm'
                              : mode('bg-slate-100 text-slate-500 group-hover:bg-white group-hover:shadow-sm', 'bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700')
                              }`}>
                              {isSelected && isMSQ ? <FiCheck className="w-4 h-4" /> : String.fromCharCode(65 + idx)}
                            </div>
                            <div className="flex-1 pt-1">
                              <span className={`text-base font-medium leading-relaxed ${isSelected
                                  ? mode('text-slate-900 font-bold', 'text-white font-bold')
                                  : mode('text-zinc-700 group-hover:text-zinc-900', 'text-zinc-300 group-hover:text-white')
                                }`}>
                                {option}
                              </span>
                            </div>
                            {isSelected && (
                              <div className="ml-auto">
                                <FiCheckCircle className="w-5 h-5 text-emerald-500" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                      {isMSQ && (
                        <p className={`text-xs font-medium pt-1 ${mode('text-slate-400', 'text-zinc-500')}`}>
                          Select all correct answers
                        </p>
                      )}
                    </>
                  );
                })()}
              </div>

              {answers[currentQuestionIndex] !== undefined && (
                <div className={`px-8 pb-6 flex justify-end`}>
                  <button
                    onClick={handleClearAnswer}
                    className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors ${mode('text-zinc-400 hover:text-emerald-600', 'text-zinc-500 hover:text-emerald-400')}`}
                  >
                    <FiRefreshCw /> Clear Selection
                  </button>
                </div>
              )}
            </div>

            {/* Navigation Footer */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => setCurrentQuestionIndex(p => Math.max(0, p - 1))}
                disabled={currentQuestionIndex === 0}
                className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${mode('bg-white text-slate-700 border border-slate-200 hover:bg-slate-50', 'bg-zinc-900 text-zinc-300 border border-zinc-800 hover:bg-zinc-800')} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <FiChevronLeft /> Previous
              </button>

              <button
                onClick={() => {
                  if (isLastQuestion) setShowSubmitConfirm(true);
                  else setCurrentQuestionIndex(p => Math.min(totalQuestions - 1, p + 1));
                }}
                className={`px-8 py-3 rounded-xl font-bold text-white flex items-center gap-2 shadow-lg transition-transform hover:-translate-y-0.5 ${isLastQuestion ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
              >
                {isLastQuestion ? 'Submit Test' : 'Next'} <FiChevronRight className={isLastQuestion ? 'hidden' : ''} />
              </button>
            </div>

          </div>
        </main>

      </div>

      {/* Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl ${mode('bg-white', 'bg-zinc-900 border border-zinc-800')}`}>
            <h3 className={`text-xl font-bold mb-2 ${mode('text-slate-900', 'text-white')}`}>Ready to submit?</h3>
            <p className={`mb-6 ${mode('text-slate-600', 'text-zinc-400')}`}>
              You have answered <span className="font-bold text-emerald-500">{Object.keys(answers).length}</span> out of <span className="font-bold">{totalQuestions}</span> questions.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowSubmitConfirm(false)} className={`flex-1 py-3 rounded-xl font-bold ${mode('bg-slate-100 text-slate-700 hover:bg-slate-200', 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700')}`}>Review</button>
              <button onClick={handleSubmitTest} disabled={loading} className="flex-1 py-3 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg flex items-center justify-center gap-2">
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSend />}
                {loading ? 'Submitting...' : 'Confirm Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {leaveWarningVisible && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-rose-900/80 backdrop-blur-md">
          <div className="bg-white rounded-2xl p-8 text-center max-w-sm shadow-2xl animate-bounce-in">
            <FiAlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-slate-900 mb-2">Warning!</h2>
            <p className="text-slate-600 mb-6">You left the test window. Returning in <span className="font-bold text-rose-600">{leaveCountdown}s</span> or test will auto-submit.</p>
            <button onClick={() => { setLeaveWarningVisible(false); setLeaveCountdown(null); }} className="w-full py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700">
              I'm Back
            </button>
          </div>
        </div>
      )}

      <BeautifulPopup {...popupState} onClose={hidePopup} />
    </div>
  );
};

export default TestAttemptViewer;