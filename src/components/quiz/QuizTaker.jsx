import React, { useState, useMemo, useCallback } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { FiArrowLeft, FiCheck, FiX, FiClock, FiAward, FiSend, FiAlertCircle, FiChevronRight, FiChevronLeft, FiRefreshCw } from 'react-icons/fi';
import { FaTrophy } from 'react-icons/fa';

const QuizTaker = ({ quiz, onBack, onViewLeaderboard }) => {
  const { currentUser } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [score, setScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [startTime] = useState(Date.now());
  const [endTime, setEndTime] = useState(null);
  const [saving, setSaving] = useState(false);

  // Check if this is a section-wise quiz
  const isSectionWiseQuiz = useMemo(() => {
    return quiz.sections && Array.isArray(quiz.sections) && quiz.sections.length > 0;
  }, [quiz.sections]);
  
  // Calculate total questions
  const totalQuestions = useMemo(() => {
    if (isSectionWiseQuiz) {
      return quiz.sections.reduce((total, section) => total + (section.questions?.length || 0), 0);
    }
    return quiz.questions?.length || 0;
  }, [isSectionWiseQuiz, quiz.sections, quiz.questions]);

  // Get current section info for section-wise quizzes
  const getCurrentSectionInfo = useCallback(() => {
    if (!isSectionWiseQuiz) return null;
    
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
  }, [isSectionWiseQuiz, quiz.sections, currentQuestionIndex]);

  const currentSectionInfo = getCurrentSectionInfo();

  // Get current question - handle both regular and section-wise quizzes
  const getCurrentQuestion = useCallback(() => {
    if (isSectionWiseQuiz && currentSectionInfo) {
      return currentSectionInfo.section.questions?.[currentSectionInfo.questionInSection - 1];
    }
    return quiz?.questions?.[currentQuestionIndex];
  }, [isSectionWiseQuiz, currentSectionInfo, quiz?.questions, currentQuestionIndex]);
  
  const currentQuestion = getCurrentQuestion();

  // Progress percentage
  const progressPercentage = useMemo(() => 
    ((currentQuestionIndex + 1) / totalQuestions) * 100, 
    [currentQuestionIndex, totalQuestions]
  );

  // Enhanced answer selection with unmarking feature
  const handleAnswerSelect = useCallback((optionIndex) => {
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
  }, [currentQuestionIndex]);

  // Clear current answer
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
    setSaving(true);
    const endTimeNow = Date.now();
    setEndTime(endTimeNow);

    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let totalScore = 0;
    
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctAnswers++;
        totalScore += 1; // +1 mark for correct answer
      } else if (answers[index] !== undefined) {
        incorrectAnswers++;
        // Apply negative marking - check question-specific first, then global
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
    
    const finalScore = Math.round(totalScore * 100) / 100;
    const timeSpentSeconds = Math.floor((endTimeNow - startTime) / 1000);
    const percentage = Math.round((finalScore / quiz.questions.length) * 100);
    
    setScore(correctAnswers);
    setFinalScore(finalScore);

    try {
      const attemptData = {
        quizId: quiz.id,
        quizTitle: quiz.title,
        testSeriesId: quiz.testSeriesId || null,
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Anonymous',
        userEmail: currentUser.email,
        score: correctAnswers,
        totalScore: finalScore,
        totalQuestions: quiz.questions.length,
        percentage: percentage,
        timeSpent: timeSpentSeconds,
        answers: answers,
        negativeMarking: quiz.negativeMarking || null,
        completedAt: new Date(),
        createdAt: new Date()
      };

      await addDoc(collection(db, 'quiz-attempts'), attemptData);
      console.log('Quiz attempt saved successfully');
    } catch (error) {
      console.error('Error saving quiz attempt:', error);
    } finally {
      setSaving(false);
      setShowResults(true);
      setShowSubmitConfirm(false);
    }
  }, [quiz, answers, startTime, currentUser]);

  // Check if quiz data is missing or invalid
  if (!quiz || totalQuestions === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-2xl p-10 text-center border border-gray-200 shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
              <div className="absolute -left-10 -top-10 w-40 h-40 bg-red-100 rounded-full blur-3xl"></div>
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-red-100 rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 text-red-500 mb-6">
                <FiAlertCircle className="w-10 h-10" />
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Quiz Not Found</h2>
              <p className="text-lg text-gray-600 mb-10 max-w-md mx-auto">
                This quiz has no questions or might have been deleted. Please try another quiz.
              </p>
              
              <button
                onClick={onBack}
                className="px-8 py-4 bg-blue-600 text-white font-medium rounded-xl flex items-center gap-2 justify-center mx-auto hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <FiArrowLeft className="w-5 h-5" /> Back to Quiz List
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            {/* Confetti background for high scores */}
            {percentage >= 70 && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-green-500/20 rounded-full blur-3xl"></div>
              </div>
            )}
            
            <div className="relative px-6 pt-10 pb-12 md:px-10">
              {/* Results Header with animated score */}
              <div className="text-center mb-10">
                <div className="mb-8 relative">
                  <div className="inline-flex items-center justify-center w-28 h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-r shadow-lg relative animate-scale-in">
                    {/* Background circular progress */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="45" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="8" 
                        className="text-gray-200" 
                      />
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="45" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="8" 
                        strokeDasharray="283"
                        strokeDashoffset={283 - (283 * percentage) / 100}
                        className={`transform -rotate-90 origin-center transition-all duration-1000 ease-out ${
                          percentage >= 80 ? 'text-green-500' :
                          percentage >= 60 ? 'text-blue-500' :
                          percentage >= 40 ? 'text-yellow-500' :
                          'text-red-500'
                        }`}
                      />
                    </svg>
                    <span className="text-3xl md:text-4xl font-extrabold text-gray-900 animate-fade-in">
                      {percentage}%
                    </span>
                  </div>
                  
                  {/* Badge for perfect score */}
                  {percentage === 100 && (
                    <div className="absolute -right-2 -top-2 bg-yellow-500 rounded-full p-1.5 shadow-lg animate-bounce-in">
                      <FiAward className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 animate-fade-up">
                  Quiz Complete!
                </h1>
                <p className="text-xl text-gray-600 mb-4 animate-fade-up" style={{animationDelay: '100ms'}}>
                  You scored <span className="font-semibold text-blue-600">{score}</span> out of <span className="font-semibold text-blue-600">{quiz.questions.length}</span> questions correctly
                  {quiz.negativeMarking && quiz.negativeMarking.enabled && (
                    <span className="block text-sm text-red-600 mt-1">
                      Final Score: <span className="font-semibold">{finalScore.toFixed(2)}</span> (with negative marking applied)
                    </span>
                  )}
                </p>
                
                {saving && (
                  <div className="flex items-center justify-center gap-2 text-blue-600 animate-fade-in">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                    <span>Saving your attempt...</span>
                  </div>
                )}
              </div>

              {/* Result Details */}
              <div className="mb-10 max-w-md mx-auto">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl mb-4">
                  <div className="flex items-center gap-3">
                    <FiClock className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-700">Time Spent:</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {Math.floor((endTime - startTime) / 60000)}m {Math.floor(((endTime - startTime) % 60000) / 1000)}s
                  </span>
                </div>
                
                {/* Result message based on score */}
                <div className="p-4 rounded-xl border border-gray-200 bg-white">
                  <p className="text-center text-gray-800 text-lg">
                    {percentage === 100 ? (
                      <span>Perfect score! Impressive knowledge! 🎉</span>
                    ) : percentage >= 80 ? (
                      <span>Great job! You've mastered this topic! 👏</span>
                    ) : percentage >= 60 ? (
                      <span>Good work! You're on the right track! 👍</span>
                    ) : percentage >= 40 ? (
                      <span>Not bad! Keep practicing to improve! 📚</span>
                    ) : (
                      <span>Keep studying and try again soon! 💪</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{animationDelay: '200ms'}}>
                <button
                  onClick={onBack}
                  className="px-6 py-3.5 bg-blue-600 text-white font-medium rounded-xl flex items-center gap-2 justify-center hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <FiArrowLeft className="w-5 h-5" />
                  Back to Quizzes
                </button>
                
                <button
                  onClick={() => onViewLeaderboard && onViewLeaderboard(quiz)}
                  className="px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-xl flex items-center gap-2 justify-center hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                  <FaTrophy className="w-5 h-5" />
                  View Leaderboard
                </button>
              </div>
            </div>
            
            {/* Custom footer */}
            <div className="bg-gray-50 py-4 px-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Quiz: {quiz.title}
                </span>
                <span className="text-sm text-gray-500">
                  Completed on {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          
          {/* Add the following CSS to the component for animations */}
          <style>{`
            @keyframes scaleIn {
              from { transform: scale(0.8); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
            
            @keyframes fadeUp {
              from { transform: translateY(20px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
            
            @keyframes bounceIn {
              0% { transform: scale(0); }
              50% { transform: scale(1.2); }
              100% { transform: scale(1); }
            }
            
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            
            .animate-scale-in {
              animation: scaleIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
            }
            
            .animate-fade-up {
              animation: fadeUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
            }
            
            .animate-bounce-in {
              animation: bounceIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
            }
            
            .animate-fade-in {
              animation: fadeIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
            }
          `}</style>
        </div>
      </div>
    );
  }

  // Confirmation Modal
  if (showSubmitConfirm) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto p-6 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-3xl"></div>
          <div className="relative bg-white rounded-2xl shadow-xl p-6 border border-gray-200 overflow-hidden">
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="p-2.5 rounded-full bg-blue-100 text-blue-600">
                <FiSend className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Ready to Submit?
              </h3>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-100">
              <p className="text-gray-700 mb-2 text-center">
                You've answered <span className="font-semibold text-blue-700">{Object.keys(answers).length}</span> of <span className="font-semibold text-blue-700">{quiz.questions.length}</span> questions. 
              </p>
              
              {Object.keys(answers).length < quiz.questions.length && (
                <div className="flex items-center gap-3 justify-center mt-3 py-2 px-4 bg-amber-50 rounded-lg border border-amber-100">
                  <FiAlertCircle className="text-amber-500 flex-shrink-0 w-5 h-5" />
                  <p className="text-amber-700 text-sm">
                    {quiz.questions.length - Object.keys(answers).length} question{quiz.questions.length - Object.keys(answers).length !== 1 ? 's' : ''} remain unanswered and will be marked incorrect.
                  </p>
                </div>
              )}
            </div>
            
            <div className="mb-2">
              <div className="flex items-center gap-2 mb-1">
                <FiClock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Time spent:</span>
                <span className="font-medium text-gray-900">
                  {Math.floor((Date.now() - startTime) / 60000)}m {Math.floor((Date.now() - startTime) / 1000) % 60}s
                </span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <button
                onClick={handleCancelSubmit}
                className="px-6 py-3 bg-white text-gray-700 font-medium rounded-xl flex items-center gap-2 justify-center hover:bg-gray-100 transition-all duration-300 border border-gray-200"
              >
                <FiX className="w-5 h-5" />
                Continue Quiz
              </button>
              
              <button
                onClick={submitQuiz}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl flex items-center gap-2 justify-center hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <FiCheck className="w-5 h-5" />
                Submit Answers
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Quiz UI
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* Quiz Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={onBack}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1"
            title="Back to Quiz List"
          >
            <FiArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline text-sm font-medium">Exit Quiz</span>
          </button>
          
          <div className="text-center flex-1 mx-4">
            <h1 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 truncate">
              {quiz.title}
            </h1>
            {isSectionWiseQuiz && currentSectionInfo && (
              <div className="text-sm sm:text-base text-gray-600 mt-1 font-medium">
                {currentSectionInfo.section.name}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
            <FiClock className="w-4 h-4" />
            <span>{Object.keys(answers).length}/{totalQuestions}</span>
          </div>
        </div>

        {/* Progress Bar with gradient */}
        <div className="h-2 w-full bg-gray-200 rounded-full mb-8 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500 ease-out shadow-sm"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        {/* Question Card with enhanced styling */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-8 transform transition-all duration-300 hover:shadow-xl">
          {/* Question Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <span className="font-medium text-sm px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                {isSectionWiseQuiz && currentSectionInfo 
                  ? `Q ${currentSectionInfo.questionInSection}/${currentSectionInfo.totalQuestionsInSection}`
                  : `Question ${currentQuestionIndex + 1} of ${quiz.questions.length}`
                }
              </span>
              <span className="text-sm text-gray-500">
                {Math.floor((Date.now() - startTime) / 60000)}:{String(Math.floor((Date.now() - startTime) / 1000) % 60).padStart(2, '0')}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mt-3">
              {currentQuestion?.question || "No question found"}
            </h3>
          </div>

          {/* Question Image */}
          {currentQuestion?.image && (
            <div className="p-5 border-b border-gray-200">
              <div className="relative rounded-xl overflow-hidden border-2 border-gray-200 max-w-md mx-auto">
                <img
                  src={currentQuestion.image}
                  alt="Question illustration"
                  className="w-full h-auto object-contain bg-gray-50"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden w-full h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl items-center justify-center">
                  <div className="text-center">
                    <div className="w-6 h-6 text-gray-400 mx-auto mb-1">📷</div>
                    <p className="text-xs text-gray-500">Failed to load image</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Answer Options */}
          <div className="p-5">
            <div className="space-y-3">
              {currentQuestion?.options?.map((option, index) => {
                const isSelected = answers[currentQuestionIndex] === index;
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full text-left p-4 rounded-xl border-2 flex items-start transition-all duration-300 group ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500 shadow-md'
                        : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 mr-3 rounded-lg flex items-center justify-center border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-gray-100 text-gray-800 border-gray-300 group-hover:bg-blue-100 group-hover:border-blue-400'
                    }`}>
                      <span className="text-sm font-bold">{String.fromCharCode(65 + index)}</span>
                    </div>
                    <span className={`text-md ${
                      isSelected
                        ? 'text-blue-900 font-medium'
                        : 'text-gray-800'
                    }`}>
                      {option}
                    </span>
                    {isSelected && (
                      <span className="ml-auto text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-md">
                        Click to unmark
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Clear Answer Button */}
            {answers[currentQuestionIndex] !== undefined && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={handleClearAnswer}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all duration-300 border border-red-200 hover:border-red-300"
                >
                  <FiRefreshCw className="w-4 h-4" />
                  Clear Answer
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Controls with improved styling */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-300 ${
              currentQuestionIndex === 0
                ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                : 'text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            <FiChevronLeft className="w-5 h-5" /> Previous
          </button>

          {currentQuestionIndex === totalQuestions - 1 ? (
            <button
              onClick={handleSubmitConfirm}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <FiSend className="w-5 h-5" /> 
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Next <FiChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {/* Quiz footer */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap justify-between items-center text-sm text-gray-500">
            <p>Quiz: {quiz.title}</p>
            <p>
              {answers[currentQuestionIndex] !== undefined ? (
                <span className="text-green-600 font-medium">✓ Answered</span>
              ) : (
                <span>Not answered yet</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizTaker;
