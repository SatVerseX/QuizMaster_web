// src/components/quiz/QuestionNavigator.jsx
import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import {
  FiChevronLeft,
  FiChevronRight,
  FiCheck,
  FiX,
  FiBookOpen,
} from "react-icons/fi";
import { Sparkle } from "lucide-react";
import QuestionDiscussion from "../discussion/QuestionDiscussion";
// IMPORT THE NEW MODAL COMPONENT
import AIExplanationModal from "../modals/AIExplanationModal"; 

const QuestionNavigator = ({ questionAnalysis, attempt }) => {
  const { isDark } = useTheme();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // State for the new AI Modal
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [questionForAI, setQuestionForAI] = useState(null);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Disable keyboard nav if modal is open
      if (isAIModalOpen) return;
      
      if (e.key === "ArrowLeft") handlePrevious();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentQuestionIndex, isAIModalOpen]);

  const handleNext = () => {
    if (currentQuestionIndex < questionAnalysis.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const jumpToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  // Prepare data for the AI Modal
  const openAIExplanation = () => {
    const currentQ = questionAnalysis[currentQuestionIndex];
    
    // SAFE MAPPING: Convert indices to text strings for the AI
    // Defensive check: ensure options exist and indices are valid
    const safeOptions = currentQ.options || [];
    const correctText = safeOptions[currentQ.correctAnswer] || "Correct Answer";
    
    let userText = "Skipped";
    if (currentQ.userAnswer !== undefined && currentQ.userAnswer !== null && currentQ.userAnswer !== -1) {
        userText = safeOptions[currentQ.userAnswer] || "Unknown Answer";
    }

    setQuestionForAI({
      question: currentQ.question,
      options: safeOptions,
      correctAnswer: correctText,
      userAnswer: userText
    });

    setIsAIModalOpen(true);
  };

  // Question Details Not Available Fallback
  if (!questionAnalysis || !questionAnalysis.length) {
    return (
      <div
        className={`border rounded-xl p-8 text-center ${
          isDark
            ? "bg-gray-900 border-gray-700"
            : "bg-white border-gray-200 shadow-sm"
        }`}
      >
        <FiBookOpen
          className={`w-16 h-16 mx-auto mb-4 ${
            isDark ? "text-gray-500" : "text-gray-400"
          }`}
        />
        <h3
          className={`text-xl font-semibold mb-2 ${
            isDark ? "text-gray-100" : "text-gray-800"
          }`}
        >
          Question Details Not Available
        </h3>
        <p className={isDark ? "text-gray-400" : "text-gray-500"}>
          Unable to load detailed question analysis for this test.
        </p>
      </div>
    );
  }

  const currentQuestion = questionAnalysis[currentQuestionIndex];
  const discussionThreadId = attempt ? `${attempt.testId}_q${currentQuestionIndex}` : `q_${currentQuestionIndex}`;

  return (
    <>
      {/* Main Content */}
      <div className="transition-all duration-200 opacity-100">
        <div
          className={`border rounded-xl shadow-sm overflow-hidden ${
            isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          {/* Header */}
          <div
            className={`border-b p-5 ${
              isDark
                ? "border-gray-700 bg-gray-800/50"
                : "border-gray-200 bg-gray-50/50"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                className={`text-xl font-bold ${
                  isDark ? "text-gray-100" : "text-gray-800"
                }`}
              >
                Question Analysis
              </h3>
              <div className="text-right">
                <div
                  className={`text-2xl font-bold ${
                    isDark ? "text-gray-100" : "text-gray-800"
                  }`}
                >
                  {currentQuestionIndex + 1}/{questionAnalysis.length}
                </div>
                <div
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Progress
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div
              className={`w-full rounded-full h-2 overflow-hidden mb-4 ${
                isDark ? "bg-gray-700" : "bg-gray-200"
              }`}
            >
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  isDark
                    ? "bg-gradient-to-r from-blue-500 to-purple-500"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600"
                }`}
                style={{
                  width: `${
                    ((currentQuestionIndex + 1) / questionAnalysis.length) * 100
                  }%`,
                }}
              />
            </div>

            {/* Question Navigation Dots */}
            <div className="flex flex-wrap gap-2 justify-center">
              {questionAnalysis.map((q, index) => (
                <button
                  key={index}
                  onClick={() => jumpToQuestion(index)}
                  className={`w-8 h-8 rounded-full text-xs font-semibold border-2 transition-all duration-200 hover:scale-105 ${
                    index === currentQuestionIndex
                      ? isDark
                        ? "bg-blue-600 text-white border-blue-600 shadow-lg"
                        : "bg-indigo-600 text-white border-indigo-600 shadow-lg"
                      : q.isCorrect
                      ? isDark
                        ? "text-green-400 border-green-500 bg-green-500/10 hover:bg-green-500/20"
                        : "text-green-700 border-green-500 bg-green-50 hover:bg-green-100"
                      : q.status === "incorrect"
                      ? isDark
                        ? "text-red-400 border-red-500 bg-red-500/10 hover:bg-red-500/20"
                        : "text-red-700 border-red-500 bg-red-50 hover:bg-red-100"
                      : isDark
                      ? "text-gray-400 border-gray-600 bg-gray-800 hover:bg-gray-700"
                      : "text-gray-600 border-gray-300 bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="p-5">
            {/* Question with AI Button */}
            <div
              className={`mb-6 p-5 rounded-xl border ${
                isDark
                  ? "border-gray-700 bg-gray-800/30"
                  : "border-gray-200 bg-gray-50/50"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3 flex-1">
                  <span
                    className={`px-3 py-1 font-semibold text-sm rounded-lg ${
                      currentQuestion.isCorrect
                        ? isDark
                          ? "text-green-400 bg-green-500/20 border border-green-500/40"
                          : "text-green-700 bg-green-100 border border-green-300"
                        : currentQuestion.status === "incorrect"
                        ? isDark
                          ? "text-red-400 bg-red-500/20 border border-red-500/40"
                          : "text-red-700 bg-red-100 border border-red-300"
                        : isDark
                        ? "text-gray-300 bg-gray-700 border border-gray-600"
                        : "text-gray-600 bg-gray-100 border border-gray-300"
                    }`}
                  >
                    Q{currentQuestionIndex + 1}
                  </span>
                  <span
                    className={`text-lg leading-relaxed flex-1 ${
                      isDark ? "text-gray-100" : "text-gray-800"
                    }`}
                  >
                    {currentQuestion.question}
                  </span>
                </div>

                {/* AI Explanation Trigger Button */}
                <div className="relative">
                  <button
                    onClick={openAIExplanation}
                    className={`p-3 rounded-lg border transition-all duration-200 hover:scale-105 ${
                      isDark
                        ? "border-gray-600 hover:bg-gray-700 text-gray-300 hover:text-gray-100"
                        : "border-gray-300 hover:bg-gray-100 text-gray-600 hover:text-gray-800"
                    }`}
                    title="Get AI Explanation"
                  >
                    <Sparkle
                      size={20}
                      className={isDark ? "text-rose-400" : "text-rose-600"}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Question Image */}
            {currentQuestion.image && (
              <div className="mb-6">
                <div
                  className={`relative rounded-xl overflow-hidden border max-w-md mx-auto ${
                    isDark ? "border-gray-600" : "border-gray-200"
                  }`}
                >
                  <img
                    src={currentQuestion.image}
                    alt="Question illustration"
                    className={`w-full h-auto object-contain ${
                      isDark ? "bg-gray-800" : "bg-gray-50"
                    }`}
                    style={{ maxHeight: "300px" }}
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                  <div
                    className={`hidden w-full h-32 border-2 border-dashed rounded-xl items-center justify-center ${
                      isDark
                        ? "bg-gray-800 border-gray-600"
                        : "bg-gray-100 border-gray-300"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">📷</div>
                      <p
                        className={`text-xs ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Failed to load image
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Options */}
            <div className="grid grid-cols-1 gap-4 mb-6">
              {currentQuestion.options.map((option, optionIndex) => {
                const isCorrect = optionIndex === currentQuestion.correctAnswer;
                const isUserWrong =
                  optionIndex === currentQuestion.userAnswer &&
                  currentQuestion.userAnswer !== currentQuestion.correctAnswer;

                return (
                  <div
                    key={optionIndex}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      isCorrect
                        ? isDark
                          ? "border-green-500/60 bg-green-500/10"
                          : "border-green-400 bg-green-50"
                        : isUserWrong
                        ? isDark
                          ? "border-red-500/60 bg-red-500/10"
                          : "border-red-400 bg-red-50"
                        : isDark
                        ? "border-gray-700 bg-gray-800/20 hover:bg-gray-800/40"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                          isCorrect
                            ? "bg-green-600 text-white"
                            : isUserWrong
                            ? "bg-red-600 text-white"
                            : isDark
                            ? "bg-gray-700 text-gray-300"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {String.fromCharCode(65 + optionIndex)}
                      </span>
                      <div className="flex-1">
                        <span
                          className={`text-base leading-relaxed ${
                            isDark ? "text-gray-100" : "text-gray-800"
                          }`}
                        >
                          {option}
                        </span>
                        {isCorrect && (
                          <div className="mt-3 flex items-center gap-2 text-green-600 font-semibold text-sm">
                            <FiCheck className="w-4 h-4" />
                            Correct Answer
                          </div>
                        )}
                        {isUserWrong && (
                          <div className="mt-3 flex items-center gap-2 text-red-600 font-semibold text-sm">
                            <FiX className="w-4 h-4" />
                            Your Answer
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Standard Explanation */}
            {currentQuestion.explanation && (
              <div
                className={`mb-6 p-5 rounded-xl border ${
                  isDark
                    ? "border-blue-500/30 bg-blue-500/10"
                    : "border-blue-200 bg-blue-50"
                }`}
              >
                <h5
                  className={`font-semibold mb-3 text-base flex items-center gap-2 ${
                    isDark ? "text-blue-400" : "text-blue-700"
                  }`}
                >
                  💡 Standard Explanation
                </h5>
                <p
                  className={`leading-relaxed ${
                    isDark ? "text-blue-200" : "text-blue-800"
                  }`}
                >
                  {currentQuestion.explanation}
                </p>
              </div>
            )}

            {attempt && attempt.testId && (
              <div className="mb-8">
                <QuestionDiscussion
                  questionId={discussionThreadId}
                  questionTitle={`Discussion: Question ${
                    currentQuestionIndex + 1
                  }`}
                />
              </div>
            )}

            {/* Navigation Controls */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className={`disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105 flex items-center gap-3 ${
                  isDark
                    ? "bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800"
                    : "bg-gray-700 hover:bg-gray-800 disabled:bg-gray-400"
                }`}
              >
                <FiChevronLeft className="w-5 h-5" />
                <span className="font-semibold">Previous</span>
              </button>

              <div className="text-center">
                <div
                  className={`text-sm font-semibold ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Question {currentQuestionIndex + 1} of{" "}
                  {questionAnalysis.length}
                </div>
              </div>

              <button
                onClick={handleNext}
                disabled={currentQuestionIndex === questionAnalysis.length - 1}
                className={`disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105 flex items-center gap-3 ${
                  isDark
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-800"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500"
                }`}
              >
                <span className="font-semibold">Next</span>
                <FiChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RENDER THE SEPARATE MODAL COMPONENT */}
      <AIExplanationModal 
        isOpen={isAIModalOpen} 
        onClose={() => setIsAIModalOpen(false)} 
        questionData={questionForAI} 
      />
    </>
  );
};

export default QuestionNavigator;