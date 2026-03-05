import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { collection, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import usePopup from '../../hooks/usePopup';
import BeautifulPopup from '../common/BeautifulPopup';
import {
  FiArrowLeft, FiCheck, FiX, FiClock, FiSend,
  FiAlertCircle, FiChevronRight, FiChevronLeft, FiRefreshCw,
  FiCheckCircle, FiHelpCircle
} from 'react-icons/fi';
import { FaTrophy, FaChartPie } from 'react-icons/fa';
import Confetti from 'react-confetti';
import * as z from 'zod'; // Importing zod for validation

// --- SCHEMA VALIDATION ---
const QuizSchema = z.object({
  id: z.string(),
  title: z.string(),
  questions: z.array(z.object({
    question: z.string(),
    options: z.array(z.string()),
    correctAnswer: z.number().optional(), // Optional for client-side security if needed
    image: z.string().nullable().optional()
  })).optional(),
  sections: z.array(z.any()).optional()
});

const QuizTaker = ({ quiz, onBack, onViewLeaderboard }) => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const { popupState, showError, hidePopup } = usePopup();

  // --- STATE ---
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [score, setScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);

  // Timer State
  const [startTime] = useState(Date.now());
  const [now, setNow] = useState(Date.now()); // Current timestamp for smooth ticker
  const [endTime, setEndTime] = useState(null);

  const [saving, setSaving] = useState(false);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Scroll ref for main content
  const mainContentRef = useRef(null);

  // --- TIMER EFFECT ---
  useEffect(() => {
    let interval;
    if (isTestStarted && !showResults) {
      interval = setInterval(() => {
        setNow(Date.now());
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTestStarted, showResults]);

  // --- MEMOIZED HELPERS ---
  const isSectionWiseQuiz = useMemo(() => {
    return quiz?.sections && Array.isArray(quiz.sections) && quiz.sections.length > 0;
  }, [quiz]);

  const totalQuestions = useMemo(() => {
    if (!quiz) return 0;
    if (isSectionWiseQuiz) {
      return quiz.sections.reduce((total, section) => total + (section.questions?.length || 0), 0);
    }
    return quiz.questions?.length || 0;
  }, [isSectionWiseQuiz, quiz]);

  const getCurrentSectionInfo = useCallback(() => {
    if (!isSectionWiseQuiz || !quiz) return null;
    let questionCount = 0;
    for (let i = 0; i < quiz.sections.length; i++) {
      const section = quiz.sections[i];
      const sectionQuestionCount = section.questions ? section.questions.length : 0;
      if (currentQuestionIndex < questionCount + sectionQuestionCount) {
        return {
          section,
          sectionIndex: i,
          questionInSection: currentQuestionIndex - questionCount + 1,
          totalQuestionsInSection: sectionQuestionCount
        };
      }
      questionCount += sectionQuestionCount;
    }
    return null;
  }, [isSectionWiseQuiz, quiz, currentQuestionIndex]);

  const currentSectionInfo = getCurrentSectionInfo();

  const getCurrentQuestion = useCallback(() => {
    if (!quiz) return null;
    if (isSectionWiseQuiz && currentSectionInfo) {
      return currentSectionInfo.section.questions?.[currentSectionInfo.questionInSection - 1];
    }
    return quiz.questions?.[currentQuestionIndex];
  }, [isSectionWiseQuiz, currentSectionInfo, quiz, currentQuestionIndex]);

  const currentQuestion = getCurrentQuestion();

  // Defensive check for rendering
  const safeCurrentQuestion = currentQuestion || { question: "Loading...", options: [] };

  const progressPercentage = useMemo(() =>
    totalQuestions > 0 ? ((Object.keys(answers).length) / totalQuestions) * 100 : 0,
    [answers, totalQuestions]
  );

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // --- HANDLERS ---
  const handleAnswerSelect = useCallback((optionIndex) => {
    const qType = (currentQuestion?.type || 'mcq');

    if (qType === 'msq') {
      // Multi-select: toggle the option in an array
      setAnswers(prev => {
        const newAnswers = { ...prev };
        const current = Array.isArray(prev[currentQuestionIndex]) ? [...prev[currentQuestionIndex]] : [];
        const idx = current.indexOf(optionIndex);
        if (idx !== -1) {
          current.splice(idx, 1);
        } else {
          current.push(optionIndex);
        }
        if (current.length === 0) {
          delete newAnswers[currentQuestionIndex];
        } else {
          newAnswers[currentQuestionIndex] = current;
        }
        return newAnswers;
      });
    } else {
      // MCQ: single toggle
      setAnswers(prev => {
        const newAnswers = { ...prev };
        if (prev[currentQuestionIndex] === optionIndex) {
          delete newAnswers[currentQuestionIndex];
        } else {
          newAnswers[currentQuestionIndex] = optionIndex;
        }
        return newAnswers;
      });
    }
  }, [currentQuestionIndex, currentQuestion]);

  // Numerical answer handler
  const handleNumericalAnswer = useCallback((value) => {
    setAnswers(prev => {
      const newAnswers = { ...prev };
      if (value === '' || value === null || value === undefined) {
        delete newAnswers[currentQuestionIndex];
      } else {
        newAnswers[currentQuestionIndex] = value;
      }
      return newAnswers;
    });
  }, [currentQuestionIndex]);

  const handleClearAnswer = useCallback(() => {
    setAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[currentQuestionIndex];
      return newAnswers;
    });
  }, [currentQuestionIndex]);

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      // Scroll to top of content on change
      if (mainContentRef.current) mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentQuestionIndex, totalQuestions]);

  const handlePreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prevIndex => prevIndex - 1);
      if (mainContentRef.current) mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentQuestionIndex]);

  const submitQuiz = useCallback(async () => {
    if (!quiz) return;
    setSaving(true);
    const endTimeNow = Date.now();
    setEndTime(endTimeNow);

    let correctAnswers = 0;
    let totalScore = 0;

    const allQuestions = isSectionWiseQuiz
      ? quiz.sections.flatMap(s => s.questions)
      : quiz.questions;

    allQuestions.forEach((question, index) => {
      const positiveMarks = question.positiveMarking?.enabled && question.positiveMarking.value
        ? parseFloat(question.positiveMarking.value)
        : 1;
      const qType = question.type || 'mcq';
      const userAnswer = answers[index];

      if (qType === 'numerical') {
        // --- Numerical scoring ---
        if (userAnswer !== undefined && userAnswer !== '' && userAnswer !== null) {
          const userNum = parseFloat(userAnswer);
          const correctNum = parseFloat(question.correctAnswer);
          const tolerance = parseFloat(question.tolerance) || 0;
          if (!isNaN(userNum) && !isNaN(correctNum) && Math.abs(userNum - correctNum) <= tolerance) {
            correctAnswers++;
            totalScore += positiveMarks;
          } else {
            // Apply negative marking for wrong numerical answer
            let negativeMarkingToApply = null;
            if (question.negativeMarking?.enabled) negativeMarkingToApply = question.negativeMarking;
            else if (quiz.negativeMarking?.enabled) negativeMarkingToApply = quiz.negativeMarking;
            if (negativeMarkingToApply) {
              totalScore -= negativeMarkingToApply.type === 'fractional'
                ? positiveMarks * negativeMarkingToApply.value
                : negativeMarkingToApply.value;
            }
          }
        }
      } else if (qType === 'msq') {
        // --- MSQ scoring ---
        const correctArr = Array.isArray(question.correctAnswer) ? question.correctAnswer : [];
        const userArr = Array.isArray(userAnswer) ? userAnswer : [];
        if (userArr.length > 0) {
          const correctSelected = userArr.filter(a => correctArr.includes(a)).length;
          const wrongSelected = userArr.filter(a => !correctArr.includes(a)).length;

          if (correctSelected === correctArr.length && wrongSelected === 0) {
            // All correct, none wrong — full marks
            correctAnswers++;
            totalScore += positiveMarks;
          } else if (question.partialMarking && wrongSelected === 0 && correctSelected > 0) {
            // Partial marking: credit per correct option, no wrong ones
            totalScore += positiveMarks * (correctSelected / correctArr.length);
          } else if (wrongSelected > 0) {
            // Has wrong selections — apply negative marking
            let negativeMarkingToApply = null;
            if (question.negativeMarking?.enabled) negativeMarkingToApply = question.negativeMarking;
            else if (quiz.negativeMarking?.enabled) negativeMarkingToApply = quiz.negativeMarking;
            if (negativeMarkingToApply) {
              totalScore -= negativeMarkingToApply.type === 'fractional'
                ? positiveMarks * negativeMarkingToApply.value
                : negativeMarkingToApply.value;
            }
          }
        }
      } else {
        // --- MCQ scoring (original) ---
        if (userAnswer === question.correctAnswer) {
          correctAnswers++;
          totalScore += positiveMarks;
        } else if (userAnswer !== undefined) {
          let negativeMarkingToApply = null;
          if (question.negativeMarking?.enabled) {
            negativeMarkingToApply = question.negativeMarking;
          } else if (quiz.negativeMarking?.enabled) {
            negativeMarkingToApply = quiz.negativeMarking;
          }
          if (negativeMarkingToApply) {
            if (negativeMarkingToApply.type === 'fractional') {
              totalScore -= (positiveMarks * negativeMarkingToApply.value);
            } else if (negativeMarkingToApply.type === 'fixed') {
              totalScore -= negativeMarkingToApply.value;
            }
          }
        }
      }
    });

    totalScore = Math.max(0, totalScore);
    const finalScoreVal = Math.round(totalScore * 100) / 100;
    const timeSpentSeconds = Math.floor((endTimeNow - startTime) / 1000);

    // Max Score Calculation
    const maxPossibleScore = allQuestions.reduce((acc, q) => {
      return acc + (q.positiveMarking?.enabled ? parseFloat(q.positiveMarking.value) : 1);
    }, 0);

    const percentage = maxPossibleScore > 0 ? Math.round((finalScoreVal / maxPossibleScore) * 100) : 0;
    const passingThreshold = quiz.passingScore !== undefined && quiz.passingScore !== null
      ? parseFloat(quiz.passingScore)
      : (maxPossibleScore * 0.4);

    const isPassed = finalScoreVal >= passingThreshold;

    setScore(correctAnswers);
    setFinalScore(finalScoreVal);

    try {
      const attemptData = {
        quizId: quiz.id,
        quizTitle: quiz.title,
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Anonymous',
        userEmail: currentUser.email,
        score: correctAnswers,
        totalScore: finalScoreVal,
        maxScore: maxPossibleScore,
        totalQuestions: allQuestions.length,
        percentage: percentage,
        isPassed: isPassed,
        passingScore: passingThreshold,
        timeSpent: timeSpentSeconds,
        answers: answers,
        completedAt: new Date(),
        createdAt: new Date()
      };

      await addDoc(collection(db, 'quiz-attempts'), attemptData);

      try {
        const collectionName = isSectionWiseQuiz ? 'section-quizzes' : 'quizzes';
        await updateDoc(doc(db, collectionName, quiz.id), {
          totalAttempts: increment(1)
        });
      } catch (e) { console.warn('Failed to update stats'); }

      if (isPassed) setShowConfetti(true);

      setShowResults(true);
      setShowSubmitConfirm(false);

    } catch (error) {
      console.error('Error saving quiz attempt:', error);
      showError('Save failed due to network or permission issues.', 'Save Error');
      setShowResults(true);
      setShowSubmitConfirm(false);
    } finally {
      setSaving(false);
    }
  }, [quiz, answers, startTime, currentUser, isSectionWiseQuiz, showError]);

  // --- STYLES HELPER ---
  const mode = (light, dark) => (isDark ? dark : light);

  // --- LOADING / START SCREEN ---
  if (!quiz) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!isTestStarted && !showResults) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${mode('bg-slate-50', 'bg-zinc-950')}`}>
        <div className={`w-full max-w-xl rounded-3xl p-8 sm:p-10 shadow-xl border relative overflow-hidden text-center ${mode('bg-white border-slate-200', 'bg-zinc-900 border-zinc-800')}`}>
          <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 ${mode('bg-rose-50 text-rose-600', 'bg-rose-900/20 text-rose-400')}`}>
            <FiHelpCircle className="w-8 h-8" />
          </div>
          <h1 className={`text-2xl font-bold mb-2 ${mode('text-slate-900', 'text-white')}`}>{quiz.title}</h1>
          <p className={`text-sm mb-8 ${mode('text-slate-500', 'text-zinc-400')}`}>{quiz.description || "You are about to start the assessment."}</p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className={`p-4 rounded-xl border ${mode('bg-slate-50', 'bg-zinc-800/50 border-zinc-700')}`}>
              <div className="text-xl font-bold">{totalQuestions}</div>
              <div className="text-xs text-zinc-500 uppercase font-bold">Questions</div>
            </div>
            <div className={`p-4 rounded-xl border ${mode('bg-slate-50', 'bg-zinc-800/50 border-zinc-700')}`}>
              {/* Fallback to 1 min per question if not set */}
              <div className="text-xl font-bold">{quiz.timeLimit || totalQuestions}m</div>
              <div className="text-xs text-zinc-500 uppercase font-bold">Duration</div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={onBack} className={`flex-1 py-3 rounded-xl font-bold text-sm ${mode('bg-slate-100 hover:bg-slate-200 text-slate-700', 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300')}`}>Cancel</button>
            <button onClick={() => setIsTestStarted(true)} className="flex-1 py-3 rounded-xl font-bold text-sm bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-500/20">Start Quiz</button>
          </div>
        </div>
      </div>
    );
  }

  // --- RESULTS SCREEN ---
  if (showResults) {
    const percentage = Math.round((finalScore / (totalQuestions * 1)) * 100); // Simplified for display
    const isPassed = finalScore >= (quiz.passingScore || 0);

    return (
      <div className={`min-h-screen flex items-center justify-center p-4 overflow-y-auto ${mode('bg-zinc-50', 'bg-zinc-950')}`}>
        {showConfetti && <Confetti recycle={false} numberOfPieces={400} />}
        <div className={`max-w-xl w-full rounded-3xl shadow-2xl border overflow-hidden ${mode('bg-white border-zinc-200', 'bg-zinc-900 border-zinc-800')}`}>
          <div className={`p-8 text-center`}>
            <div className="inline-block p-4 rounded-full bg-zinc-50 dark:bg-zinc-800 mb-6">
              <FaTrophy className={`w-12 h-12 ${isPassed ? 'text-yellow-500' : 'text-zinc-400'}`} />
            </div>
            <h2 className={`text-3xl font-bold mb-2 ${mode('text-zinc-900', 'text-white')}`}>{isPassed ? 'Great Job!' : 'Assessment Complete'}</h2>
            <p className={`text-zinc-500 mb-8`}>You scored {finalScore} points</p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className={`p-4 rounded-2xl ${mode('bg-emerald-50 text-emerald-900', 'bg-emerald-900/20 text-emerald-200')}`}>
                <div className="text-2xl font-bold">{score}</div>
                <div className="text-xs uppercase opacity-70 font-bold">Correct</div>
              </div>
              <div className={`p-4 rounded-2xl ${mode('bg-rose-50 text-rose-900', 'bg-rose-900/20 text-rose-200')}`}>
                <div className="text-2xl font-bold">{totalQuestions - score}</div>
                <div className="text-xs uppercase opacity-70 font-bold">Incorrect</div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button onClick={onBack} className={`w-full py-3 rounded-xl font-bold border ${mode('bg-white border-zinc-200 text-zinc-700', 'bg-zinc-900 border-zinc-700 text-zinc-300')}`}>
                Return to Dashboard
              </button>
              <button onClick={() => onViewLeaderboard && onViewLeaderboard(quiz)} className="w-full py-3 rounded-xl font-bold bg-zinc-900 text-white dark:bg-white dark:text-black flex items-center justify-center gap-2">
                <FaChartPie /> View Leaderboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- SUBMIT CONFIRMATION MODAL ---
  if (showSubmitConfirm) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className={`w-full max-w-sm rounded-2xl p-6 shadow-2xl border ${mode('bg-white border-zinc-200', 'bg-zinc-900 border-zinc-800')}`}>
          <h3 className={`text-lg font-bold mb-2 ${mode('text-zinc-900', 'text-white')}`}>Submit Assessment?</h3>
          <p className={`text-sm mb-6 ${mode('text-zinc-500', 'text-zinc-400')}`}>
            You have answered <span className="font-bold text-rose-600">{Object.keys(answers).length}</span> out of {totalQuestions} questions.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setShowSubmitConfirm(false)} className={`flex-1 py-2.5 rounded-lg font-medium text-sm ${mode('bg-zinc-100 text-zinc-600', 'bg-zinc-800 text-zinc-400')}`}>Cancel</button>
            <button onClick={submitQuiz} className="flex-1 py-2.5 rounded-lg font-medium text-sm bg-rose-600 text-white hover:bg-rose-700">Submit</button>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN QUIZ UI ---
  return (
    <div className={`flex flex-col h-screen ${mode('bg-zinc-50', 'bg-zinc-950')}`}>

      {/* 1. Header (Fixed) */}
      <header className={`shrink-0 h-16 border-b flex items-center justify-between px-4 sm:px-6 z-20 ${mode('bg-white border-zinc-200', 'bg-zinc-900 border-zinc-800')}`}>
        <div className="flex items-center gap-3 w-1/3">
          <button onClick={onBack} className={`p-2 rounded-lg transition-colors ${mode('hover:bg-zinc-100 text-zinc-500', 'hover:bg-zinc-800 text-zinc-400')}`}>
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div className="hidden sm:block">
            <h1 className={`text-sm font-bold truncate max-w-[200px] ${mode('text-zinc-900', 'text-white')}`}>{quiz.title}</h1>
          </div>
        </div>

        <div className="flex items-center justify-center w-1/3">
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border shadow-sm ${mode('bg-zinc-50 border-zinc-200 text-zinc-700', 'bg-zinc-800 border-zinc-700 text-zinc-200')}`}>
            <FiClock className={`w-4 h-4 ${mode('text-rose-500', 'text-rose-400')}`} />
            <span className="font-mono font-bold text-sm tracking-wide">
              {formatTime(now - startTime)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 w-1/3">
          <button
            onClick={() => setShowSubmitConfirm(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-lg transition-all shadow-sm active:scale-95"
          >
            Finish
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="h-1 w-full bg-zinc-200 dark:bg-zinc-800 shrink-0">
        <div className="h-full bg-rose-500 transition-all duration-300 ease-out" style={{ width: `${progressPercentage}%` }} />
      </div>

      {/* 2. Scrollable Content Area */}
      <div
        ref={mainContentRef}
        className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6"
      >
        <div className="max-w-3xl mx-auto w-full space-y-6 pb-20">

          {/* Section Info (Optional) */}
          {currentSectionInfo && (
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
              <span className="bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded text-[10px]">Section {currentSectionInfo.sectionIndex + 1}</span>
              {currentSectionInfo.section.name}
            </div>
          )}

          {/* Question Card */}
          <div className={`rounded-2xl border shadow-sm overflow-hidden ${mode('bg-white border-zinc-200', 'bg-zinc-900 border-zinc-800')}`}>

            {/* Question Header */}
            <div className={`p-6 sm:p-8 border-b ${mode('border-zinc-100', 'border-zinc-800')}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide border ${mode('bg-zinc-50 border-zinc-200 text-zinc-500', 'bg-zinc-800 border-zinc-700 text-zinc-400')}`}>
                    Question {currentQuestionIndex + 1} of {totalQuestions}
                  </span>
                  {/* Question type badge */}
                  {(() => {
                    const qType = safeCurrentQuestion.type || 'mcq';
                    if (qType === 'numerical') return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-700">Numerical</span>;
                    if (qType === 'msq') return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-700">Multi-Select</span>;
                    return null;
                  })()}
                </div>
                {answers[currentQuestionIndex] !== undefined && (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                    <FiCheckCircle className="w-3.5 h-3.5" /> Answered
                  </span>
                )}
              </div>

              <h2 className={`text-lg sm:text-xl font-bold leading-relaxed ${mode('text-zinc-900', 'text-white')}`}>
                {safeCurrentQuestion.question}
              </h2>
            </div>

            {/* Optional Image */}
            {safeCurrentQuestion.image && (
              <div className="w-full bg-zinc-100 dark:bg-black p-4 flex justify-center border-b border-zinc-200 dark:border-zinc-800">
                <img src={safeCurrentQuestion.image} alt="Reference" className="max-h-64 object-contain rounded-lg" />
              </div>
            )}

            {/* Answer Area - Type Aware */}
            <div className="p-6 sm:p-8 space-y-3">
              {(() => {
                const qType = safeCurrentQuestion.type || 'mcq';

                if (qType === 'numerical') {
                  // --- Numerical Input ---
                  return (
                    <div className="space-y-4">
                      <label className={`block text-xs font-bold uppercase tracking-wider ${mode('text-zinc-500', 'text-zinc-400')}`}>
                        Enter your numerical answer
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={answers[currentQuestionIndex] ?? ''}
                        onChange={(e) => handleNumericalAnswer(e.target.value)}
                        placeholder="Type your answer..."
                        className={`w-full px-5 py-4 rounded-xl border-2 text-lg font-mono font-bold focus:outline-none transition-all duration-200 ${answers[currentQuestionIndex] !== undefined && answers[currentQuestionIndex] !== ''
                            ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-900/10'
                            : mode('border-zinc-200 bg-white focus:border-rose-400', 'border-zinc-700 bg-zinc-800 focus:border-rose-500')
                          } ${mode('text-zinc-900 placeholder-zinc-400', 'text-white placeholder-zinc-500')}`}
                      />
                      {safeCurrentQuestion.tolerance > 0 && (
                        <p className={`text-xs ${mode('text-zinc-400', 'text-zinc-500')}`}>
                          Tolerance: ±{safeCurrentQuestion.tolerance}
                        </p>
                      )}
                    </div>
                  );
                }

                // --- MCQ or MSQ Options ---
                const isMSQ = qType === 'msq';
                const selectedArr = isMSQ && Array.isArray(answers[currentQuestionIndex]) ? answers[currentQuestionIndex] : [];

                return (safeCurrentQuestion.options || []).map((option, idx) => {
                  const isSelected = isMSQ ? selectedArr.includes(idx) : answers[currentQuestionIndex] === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswerSelect(idx)}
                      className={`relative w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-start gap-4 group ${isSelected
                          ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-900/10 z-10'
                          : mode('border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50', 'border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50')
                        }`}
                    >
                      <div className={`shrink-0 w-7 h-7 ${isMSQ ? 'rounded-md' : 'rounded-lg'} flex items-center justify-center text-sm font-bold transition-colors mt-0.5 ${isSelected
                          ? 'bg-rose-500 text-white shadow-sm'
                          : mode('bg-zinc-100 text-zinc-500 group-hover:bg-white', 'bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700')
                        }`}>
                        {isSelected && isMSQ ? <FiCheck className="w-4 h-4" /> : String.fromCharCode(65 + idx)}
                      </div>

                      <div className={`flex-1 text-sm sm:text-base font-medium leading-relaxed ${isSelected ? mode('text-rose-900', 'text-rose-100') : mode('text-zinc-700', 'text-zinc-300')
                        }`}>
                        {option}
                      </div>

                      {isSelected && (
                        <div className="absolute top-4 right-4 text-rose-500 animate-in fade-in zoom-in duration-200">
                          <FiCheckCircle className="w-5 h-5 fill-rose-500 text-white" />
                        </div>
                      )}
                    </button>
                  );
                });
              })()}

              {/* MSQ hint */}
              {(safeCurrentQuestion.type || 'mcq') === 'msq' && (
                <p className={`text-xs font-medium pt-1 ${mode('text-zinc-400', 'text-zinc-500')}`}>
                  Select all correct answers
                </p>
              )}
            </div>

            {/* Reset Selection */}
            {answers[currentQuestionIndex] !== undefined && (
              <div className="px-6 pb-6 flex justify-end">
                <button
                  onClick={handleClearAnswer}
                  className="text-xs font-bold text-zinc-400 hover:text-rose-500 flex items-center gap-1.5 transition-colors"
                >
                  <FiRefreshCw className="w-3 h-3" /> Clear Selection
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 3. Footer (Fixed) */}
      <footer className={`shrink-0 border-t p-4 z-20 ${mode('bg-white border-zinc-200', 'bg-zinc-900 border-zinc-800')}`}>
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className={`px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${currentQuestionIndex === 0
                ? 'opacity-50 cursor-not-allowed text-zinc-400'
                : mode('hover:bg-zinc-100 text-zinc-700', 'hover:bg-zinc-800 text-zinc-300')
              }`}
          >
            <FiChevronLeft className="w-4 h-4" /> Previous
          </button>

          <div className="hidden sm:block text-xs font-bold text-zinc-400 uppercase tracking-widest">
            {Object.keys(answers).length} of {totalQuestions} answered
          </div>

          {currentQuestionIndex === totalQuestions - 1 ? (
            <button
              onClick={() => setShowSubmitConfirm(true)}
              className="px-6 py-2.5 rounded-lg font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
            >
              Review & Submit <FiSend className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="px-6 py-2.5 rounded-lg font-bold text-sm text-white bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/20 transition-all flex items-center gap-2"
            >
              Next Question <FiChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </footer>

      <BeautifulPopup {...popupState} onClose={hidePopup} />
    </div>
  );
};

export default QuizTaker;