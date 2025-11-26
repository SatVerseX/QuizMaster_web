import React, { useState, useMemo, useCallback } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import usePopup from '../../hooks/usePopup';
import BeautifulPopup from '../common/BeautifulPopup';
import { 
  FiArrowLeft, FiCheck, FiX, FiClock, FiAward, FiSend, 
  FiAlertCircle, FiChevronRight, FiChevronLeft, FiRefreshCw,
  FiBarChart2
} from 'react-icons/fi';
import { FaTrophy, FaMedal, FaChartPie } from 'react-icons/fa';

const QuizTaker = ({ quiz, onBack, onViewLeaderboard }) => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const { popupState, showError, showSuccess, hidePopup } = usePopup();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [score, setScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [startTime] = useState(Date.now());
  const [endTime, setEndTime] = useState(null);
  const [saving, setSaving] = useState(false);

  // --- DEFENSIVE LOGIC ---
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

  const progressPercentage = useMemo(() =>
    totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0,
    [currentQuestionIndex, totalQuestions]
  );

  // --- HANDLERS ---
  const handleAnswerSelect = useCallback((optionIndex) => {
    setAnswers(prev => {
      const newAnswers = { ...prev };
      if (prev[currentQuestionIndex] === optionIndex) {
        delete newAnswers[currentQuestionIndex];
      } else {
        newAnswers[currentQuestionIndex] = optionIndex;
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
    }
  }, [currentQuestionIndex, totalQuestions]);

  const handlePreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prevIndex => prevIndex - 1);
    }
  }, [currentQuestionIndex]);

  const handleSubmitConfirm = useCallback(() => {
    setShowSubmitConfirm(true);
  }, []);

  const handleCancelSubmit = useCallback(() => {
    setShowSubmitConfirm(false);
  }, []);

  const submitQuiz = useCallback(async () => {
    if (!quiz) return;
    setSaving(true);
    const endTimeNow = Date.now();
    setEndTime(endTimeNow);

    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let totalScore = 0;

    const allQuestions = isSectionWiseQuiz 
      ? quiz.sections.flatMap(s => s.questions)
      : quiz.questions;

    allQuestions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctAnswers++;
        totalScore += 1;
      } else if (answers[index] !== undefined) {
        incorrectAnswers++;
        let negativeMarkingToApply = null;
        if (question.negativeMarking && question.negativeMarking.enabled) {
          negativeMarkingToApply = question.negativeMarking;
        } else if (quiz.negativeMarking && quiz.negativeMarking.enabled) {
          negativeMarkingToApply = quiz.negativeMarking;
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

    totalScore = Math.max(0, totalScore);
    const finalScoreVal = Math.round(totalScore * 100) / 100;
    const timeSpentSeconds = Math.floor((endTimeNow - startTime) / 1000);
    const percentage = Math.round((finalScoreVal / allQuestions.length) * 100);

    setScore(correctAnswers);
    setFinalScore(finalScoreVal);

    try {
      const attemptData = {
        quizId: quiz.id,
        quizTitle: quiz.title,
        testSeriesId: quiz.testSeriesId || null,
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Anonymous',
        userEmail: currentUser.email,
        score: correctAnswers,
        totalScore: finalScoreVal,
        totalQuestions: allQuestions.length,
        percentage: percentage,
        timeSpent: timeSpentSeconds,
        answers: answers,
        negativeMarking: quiz.negativeMarking || null,
        completedAt: new Date(),
        createdAt: new Date()
      };

      await addDoc(collection(db, 'quiz-attempts'), attemptData);
      setShowResults(true);
      setShowSubmitConfirm(false);
      
    } catch (error) {
      console.error('Error saving quiz attempt:', error);
      showError(
        `Score calculated (${correctAnswers}/${allQuestions.length}), but save failed. Permission or Network error.`, 
        'Save Error'
      );
      setShowResults(true);
      setShowSubmitConfirm(false);
    } finally {
      setSaving(false);
    }
  }, [quiz, answers, startTime, currentUser, isSectionWiseQuiz, showError]);

  // --- STYLES & THEME HELPER ---
  const mode = (light, dark) => (isDark ? dark : light);

  // --- LOADING STATE ---
  if (!quiz) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center space-y-4 ${mode('bg-zinc-50', 'bg-zinc-950')}`}>
        <div className="relative">
          <div className="w-16 h-16 border-4 border-rose-200 dark:border-rose-900/30 border-t-rose-600 rounded-full animate-spin"></div>
        </div>
        <p className={`text-sm font-medium animate-pulse ${mode('text-zinc-500', 'text-zinc-400')}`}>Loading Assessment...</p>
      </div>
    );
  }

  // --- EMPTY STATE ---
  if (totalQuestions === 0) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${mode('bg-zinc-50', 'bg-zinc-950')}`}>
        <div className={`max-w-md w-full rounded-3xl p-8 text-center border shadow-xl ${mode('bg-white border-zinc-200', 'bg-zinc-900 border-zinc-800')}`}>
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 ${mode('bg-rose-50 text-rose-600', 'bg-rose-900/20 text-rose-400')}`}>
            <FiAlertCircle className="w-8 h-8" />
          </div>
          <h2 className={`text-2xl font-bold mb-2 ${mode('text-zinc-900', 'text-white')}`}>Empty Quiz</h2>
          <p className={`text-sm mb-8 leading-relaxed ${mode('text-zinc-500', 'text-zinc-400')}`}>
            This quiz currently has no questions. Please contact the administrator or try another quiz.
          </p>
          <button 
            onClick={onBack} 
            className="w-full py-3.5 px-6 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold rounded-xl transition-all transform active:scale-95 flex items-center justify-center gap-2"
          >
            <FiArrowLeft className="w-4 h-4" /> Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // --- RESULTS SCREEN ---
  if (showResults) {
    const percentage = Math.round((score / totalQuestions) * 100);
    let gradeColor = percentage >= 80 ? 'text-emerald-500' : percentage >= 60 ? 'text-amber-500' : 'text-rose-500';

    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${mode('bg-zinc-50', 'bg-zinc-950')}`}>
        <div className={`max-w-2xl w-full rounded-3xl shadow-2xl border overflow-hidden relative ${mode('bg-white border-zinc-200', 'bg-zinc-900 border-zinc-800')}`}>
          
          {/* Confetti Background Effect for High Score */}
          {percentage >= 70 && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className={`absolute -top-24 -left-24 w-64 h-64 rounded-full blur-3xl opacity-20 ${isDark ? 'bg-emerald-500' : 'bg-emerald-300'}`} />
              <div className={`absolute -bottom-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-20 ${isDark ? 'bg-blue-500' : 'bg-blue-300'}`} />
            </div>
          )}

          <div className="relative p-8 sm:p-12 text-center">
            
            {/* Score Circle */}
            <div className="mb-8 relative inline-block">
              <svg className="w-48 h-48 transform -rotate-90">
                <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className={isDark ? "text-zinc-800" : "text-zinc-100"} />
                <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={553} strokeDashoffset={553 - (553 * percentage) / 100} className={`${gradeColor} transition-all duration-1000 ease-out`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-5xl font-black tracking-tighter ${mode('text-zinc-900', 'text-white')}`}>{percentage}%</span>
                <span className={`text-xs font-bold uppercase tracking-widest mt-1 ${mode('text-zinc-400', 'text-zinc-500')}`}>Accuracy</span>
              </div>
              {percentage === 100 && (
                <div className="absolute -right-2 -top-2 bg-yellow-400 text-white p-3 rounded-full shadow-lg animate-bounce">
                  <FaTrophy className="w-5 h-5" />
                </div>
              )}
            </div>

            <h1 className={`text-3xl font-bold mb-2 ${mode('text-zinc-900', 'text-white')}`}>
              {percentage >= 80 ? 'Outstanding!' : percentage >= 60 ? 'Good Job!' : 'Keep Practicing!'}
            </h1>
            <p className={`text-base mb-8 ${mode('text-zinc-500', 'text-zinc-400')}`}>
              You answered <strong className={gradeColor}>{score}</strong> out of <strong>{totalQuestions}</strong> questions correctly.
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-10">
              <div className={`p-4 rounded-2xl ${mode('bg-zinc-50', 'bg-zinc-800/50')}`}>
                <FiCheck className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
                <div className={`text-xl font-bold ${mode('text-zinc-900', 'text-white')}`}>{score}</div>
                <div className={`text-xs font-medium uppercase ${mode('text-zinc-400', 'text-zinc-500')}`}>Correct</div>
              </div>
              <div className={`p-4 rounded-2xl ${mode('bg-zinc-50', 'bg-zinc-800/50')}`}>
                <FiX className="w-6 h-6 mx-auto mb-2 text-rose-500" />
                <div className={`text-xl font-bold ${mode('text-zinc-900', 'text-white')}`}>{totalQuestions - score}</div>
                <div className={`text-xs font-medium uppercase ${mode('text-zinc-400', 'text-zinc-500')}`}>Wrong</div>
              </div>
              <div className={`p-4 rounded-2xl ${mode('bg-zinc-50', 'bg-zinc-800/50')}`}>
                <FiClock className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                <div className={`text-xl font-bold ${mode('text-zinc-900', 'text-white')}`}>
                  {Math.floor((endTime - startTime) / 60000)}<span className="text-sm">m</span>
                </div>
                <div className={`text-xs font-medium uppercase ${mode('text-zinc-400', 'text-zinc-500')}`}>Time</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={onBack} 
                className={`px-8 py-4 rounded-xl font-bold text-sm transition-all border ${mode('bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50', 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800')}`}
              >
                Back to Dashboard
              </button>
              <button 
                onClick={() => onViewLeaderboard && onViewLeaderboard(quiz)} 
                className="px-8 py-4 rounded-xl font-bold text-sm text-white bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-500/25 transition-all transform active:scale-95 flex items-center justify-center gap-2"
              >
                <FaChartPie className="w-4 h-4" /> View Leaderboard
              </button>
            </div>
          </div>
        </div>
        <BeautifulPopup {...popupState} onClose={hidePopup} />
      </div>
    );
  }

  // --- CONFIRM SUBMIT MODAL ---
  if (showSubmitConfirm) {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/60`}>
        <div className={`w-full max-w-sm rounded-3xl p-8 shadow-2xl border transform transition-all scale-100 ${mode('bg-white border-zinc-200', 'bg-zinc-900 border-zinc-800')}`}>
          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6 ${mode('bg-rose-50 text-rose-600', 'bg-rose-900/20 text-rose-500')}`}>
             <FiSend className="w-7 h-7 ml-1" />
          </div>
          <h3 className={`text-2xl font-bold text-center mb-2 ${mode('text-zinc-900', 'text-white')}`}>Submit Assessment?</h3>
          <p className={`text-center text-sm mb-8 ${mode('text-zinc-500', 'text-zinc-400')}`}>
            You have answered <strong className="text-rose-600">{Object.keys(answers).length}</strong> out of <strong className="text-zinc-900 dark:text-white">{totalQuestions}</strong> questions.
          </p>
          <div className="flex gap-4">
            <button onClick={handleCancelSubmit} className={`flex-1 py-3 rounded-xl font-bold ${mode('bg-gray-100 text-gray-700 hover:bg-gray-200', 'bg-slate-800 text-slate-300 hover:bg-slate-700')}`}>
              Cancel
            </button>
            <button onClick={submitQuiz} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg">
              {saving ? 'Submitting...' : 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN QUIZ UI ---
  return (
    <div className={`min-h-screen flex flex-col ${mode('bg-zinc-50', 'bg-zinc-950')}`}>
      
      {/* Top Bar */}
      <header className={`sticky top-0 z-20 border-b backdrop-blur-xl ${mode('bg-white/80 border-zinc-200', 'bg-zinc-900/80 border-zinc-800')}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-4 overflow-hidden">
            <button 
              onClick={onBack} 
              className={`p-2 rounded-full transition-colors ${mode('hover:bg-zinc-100 text-zinc-500', 'hover:bg-zinc-800 text-zinc-400')}`}
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col min-w-0">
              <h1 className={`text-sm font-bold truncate ${mode('text-zinc-900', 'text-white')}`}>
                {quiz.title}
              </h1>
              {currentSectionInfo && (
                <span className={`text-xs ${mode('text-zinc-500', 'text-zinc-500')}`}>
                  {currentSectionInfo.section.name} • Q{currentSectionInfo.questionInSection}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono font-bold ${mode('bg-zinc-100 border-zinc-200 text-zinc-700', 'bg-zinc-800 border-zinc-700 text-zinc-300')}`}>
              <FiClock className="w-3.5 h-3.5" />
              <span>{Math.floor((Date.now() - startTime) / 60000)}:{String(Math.floor((Date.now() - startTime) / 1000) % 60).padStart(2, '0')}</span>
            </div>
            <button 
               onClick={handleSubmitConfirm}
               className="hidden sm:flex items-center gap-2 px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold transition-all shadow-sm active:scale-95"
            >
              Submit
            </button>
          </div>
        </div>

        {/* Progress Line */}
        <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-800">
           <div 
             className="h-full bg-rose-500 transition-all duration-500 ease-out" 
             style={{ width: `${progressPercentage}%` }}
           />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 flex flex-col">
        
        {/* Question Card */}
        <div className={`flex-1 rounded-3xl border shadow-sm overflow-hidden flex flex-col ${mode('bg-white border-zinc-200', 'bg-zinc-900 border-zinc-800')}`}>
           
           {/* Question Header */}
           <div className={`p-6 sm:p-8 border-b ${mode('border-zinc-100 bg-zinc-50/50', 'border-zinc-800 bg-zinc-900/50')}`}>
              <div className="flex justify-between items-start gap-4 mb-4">
                <span className={`inline-flex items-center justify-center h-8 px-3 rounded-lg text-xs font-bold uppercase tracking-wider border ${mode('bg-white border-zinc-200 text-zinc-500', 'bg-zinc-800 border-zinc-700 text-zinc-400')}`}>
                  Question {currentQuestionIndex + 1}
                </span>
                <div className={`text-xs font-medium ${mode('text-zinc-400', 'text-zinc-500')}`}>
                  {Object.keys(answers).length} Answered
                </div>
              </div>
              
              <h2 className={`text-xl sm:text-2xl font-bold leading-snug ${mode('text-zinc-900', 'text-white')}`}>
                 {currentQuestion?.question || "Question content loading..."}
              </h2>
           </div>

           {/* Image (if exists) */}
           {currentQuestion?.image && (
             <div className={`relative h-64 w-full border-b ${mode('bg-zinc-100 border-zinc-200', 'bg-zinc-950 border-zinc-800')}`}>
                <img 
                  src={currentQuestion.image} 
                  alt="Question Reference" 
                  className="w-full h-full object-contain p-4"
                />
             </div>
           )}

           {/* Options List */}
           <div className="p-6 sm:p-8 space-y-3 overflow-y-auto">
              {currentQuestion?.options?.map((option, index) => {
                 const isSelected = answers[currentQuestionIndex] === index;
                 return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      className={`group relative w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200 flex items-start gap-4 outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 ${
                        isSelected 
                          ? mode('border-rose-500 bg-rose-50', 'border-rose-500 bg-rose-500/20') + ' z-10'
                          : mode('border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50', 'border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50')
                      }`}
                    >
                       {/* Keycap/Letter */}
                       <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${
                          isSelected 
                            ? 'bg-rose-600 text-white shadow-sm' 
                            : mode('bg-zinc-100 text-zinc-500 group-hover:bg-white group-hover:shadow-sm', 'bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700')
                       }`}>
                          {String.fromCharCode(65 + index)}
                       </div>
                       
                       <div className="flex-1 pt-1">
                          <span className={`text-base font-medium leading-relaxed ${
                             isSelected 
                               ? mode('text-slate-900 font-bold', 'text-white font-bold') 
                               : mode('text-zinc-700 group-hover:text-zinc-900', 'text-zinc-300 group-hover:text-white')
                          }`}>
                             {option}
                          </span>
                       </div>

                       {/* Check Icon for Selected */}
                       <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                          isSelected 
                            ? 'border-rose-500 bg-rose-500 text-white scale-100 opacity-100' 
                            : 'border-zinc-300 dark:border-zinc-700 bg-transparent scale-90 opacity-0'
                       }`}>
                          <FiCheck className="w-3.5 h-3.5" strokeWidth={3} />
                       </div>
                    </button>
                 );
              })}
           </div>

           {/* Clear Answer Button */}
           {answers[currentQuestionIndex] !== undefined && (
              <div className={`px-8 pb-6 flex justify-end`}>
                 <button 
                   onClick={handleClearAnswer} 
                   className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors ${mode('text-zinc-400 hover:text-rose-600', 'text-zinc-500 hover:text-rose-400')}`}
                 >
                    <FiRefreshCw /> Clear Selection
                 </button>
              </div>
           )}
        </div>
      </main>

      {/* Bottom Navigation Bar */}
      <div className={`sticky bottom-0 z-20 border-t p-4 ${mode('bg-white border-zinc-200', 'bg-zinc-900 border-zinc-800')}`}>
         <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <button
               onClick={handlePreviousQuestion}
               disabled={currentQuestionIndex === 0}
               className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  currentQuestionIndex === 0
                     ? mode('text-zinc-300 bg-zinc-100 cursor-not-allowed', 'text-zinc-600 bg-zinc-800 cursor-not-allowed')
                     : mode('text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300', 'text-zinc-200 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700')
               }`}
            >
               <FiChevronLeft className="w-4 h-4" /> Prev
            </button>

            <div className="hidden sm:block text-xs font-bold uppercase tracking-widest text-zinc-400">
               Question {currentQuestionIndex + 1} of {totalQuestions}
            </div>

            {currentQuestionIndex === totalQuestions - 1 ? (
               <button
                  onClick={handleSubmitConfirm}
                  className="flex-1 sm:flex-none px-8 py-3 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all transform active:scale-95 flex items-center justify-center gap-2"
               >
                  Finish <FiSend className="w-4 h-4" />
               </button>
            ) : (
               <button
                  onClick={handleNextQuestion}
                  className="flex-1 sm:flex-none px-8 py-3 rounded-xl font-bold text-sm text-white bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-500/20 transition-all transform active:scale-95 flex items-center justify-center gap-2"
               >
                  Next <FiChevronRight className="w-4 h-4" />
               </button>
            )}
         </div>
      </div>

      <BeautifulPopup {...popupState} onClose={hidePopup} />
    </div>
  );
};

export default QuizTaker;