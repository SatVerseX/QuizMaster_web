import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import {
  FiChevronLeft,
  FiChevronRight,
  FiCheck,
  FiX,
  FiBookOpen,
  FiLoader,
} from "react-icons/fi";
import { Sparkle, X } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const QuestionNavigator = ({ questionAnalysis, attempt }) => {
  const { isDark } = useTheme();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanations, setExplanations] = useState("");
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const sparkleRef = useRef(null);

  // Lock body scroll when popup is open
  useEffect(() => {
    document.body.style.overflow = showExplanation ? "hidden" : "unset";
    return () => (document.body.style.overflow = "unset");
  }, [showExplanation]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (showExplanation) return;
      if (e.key === "ArrowLeft") handlePrevious();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape") setShowExplanation(false);
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentQuestionIndex, showExplanation]);

  // Close explanation popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sparkleRef.current && !sparkleRef.current.contains(event.target)) {
        setShowExplanation(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNext = () => {
    if (currentQuestionIndex < questionAnalysis.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowExplanation(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowExplanation(false);
    }
  };

  const jumpToQuestion = (index) => {
    setCurrentQuestionIndex(index);
    setShowExplanation(false);
  };

  // Generate detailed explanation for current question
  const generateQuestionAnalysis = () => {
    const currentQ = questionAnalysis[currentQuestionIndex];
    return {
      questionNumber: currentQuestionIndex + 1,
      question: currentQ.question,
      isCorrect: currentQ.isCorrect,
      userAnswer: currentQ.userAnswer,
      correctAnswer: currentQ.correctAnswer,
      explanation: currentQ.explanation,
      topic: currentQ.topic || "General Knowledge",
      options: currentQ.options,
    };
  };

  // Call Gemini 2.5 Flash API for detailed explanation with optimizations
  const getGeminiExplanation = async (questionData) => {
    try {
      // Check for cached explanation first
      const cacheKey = `ai-explanation-${questionData.question.substring(0, 50)}-${questionData.correctAnswer}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const cachedData = JSON.parse(cached);
        // Cache valid for 24 hours
        if (Date.now() - cachedData.timestamp < 24 * 60 * 60 * 1000) {
          return cachedData.explanation;
        }
      }

      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: {
          temperature: 0.3, // Lower temperature for more consistent, faster responses
          maxOutputTokens: 300, // Limit response length for faster generation
          topP: 0.8,
          topK: 20
        }
      });

      // Optimized, concise prompt
      const prompt = `Explain this question concisely:

Q: ${questionData.question}
Correct: ${String.fromCharCode(65 + questionData.correctAnswer)}
Student: ${questionData.userAnswer !== undefined ? String.fromCharCode(65 + questionData.userAnswer) : "Not answered"}

Options:
${questionData.options.map((opt, i) => `${String.fromCharCode(65 + i)}) ${opt}`).join('\n')}

Provide:
1. Why correct answer is right
2. Why others are wrong  
3. Key concept to remember

Keep under 150 words.`;

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 15000)
      );

      const result = await Promise.race([
        model.generateContent(prompt),
        timeoutPromise
      ]);

      const response = await result.response;
      const explanation = response.text();

      // Cache the explanation
      try {
        localStorage.setItem(cacheKey, JSON.stringify({
          explanation,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.warn('Failed to cache explanation:', e);
      }

      return explanation;
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error("Failed to get AI explanation. Please try again.");
    }
  };

  // Handle Explanation
  const handleExplanation = async () => {
    if (showExplanation) {
      setShowExplanation(false);
      return;
    }

    setShowExplanation(true);
    setIsLoadingExplanation(true);

    try {
      const questionData = generateQuestionAnalysis();
      const geminiExplanation = await getGeminiExplanation(questionData);
      setExplanations(geminiExplanation);
    } catch (error) {
      console.error("Error fetching explanation:", error);
      setExplanations(`Unable to fetch AI explanation right now.

Quick Review:
• The correct answer is Option ${String.fromCharCode(
        65 + questionAnalysis[currentQuestionIndex].correctAnswer
      )}
• Review the standard explanation below
• Try to understand the key concepts involved
• Practice similar questions on this topic

What to do next:
• Take notes on this question
• Research the topic further
• Practice similar problems

Please try again in a moment!`);
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  // Question Details Not Available
  if (!questionAnalysis.length) {
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

  return (
    <>
      {/* Main Content */}
      <div
        className={`transition-all duration-200 ${
          showExplanation ? "opacity-100" : "opacity-100"
        }`}
      >
        <div
          className={`border rounded-xl shadow-sm overflow-hidden ${
            isDark
              ? "bg-gray-900 border-gray-700"
              : "bg-white border-gray-200"
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

                {/* AI Explanation Button */}
                <div className="relative" ref={sparkleRef}>
                  <button
                    onClick={handleExplanation}
                    disabled={isLoadingExplanation}
                    className={`p-3 rounded-lg border transition-all duration-200 hover:scale-105 ${
                      isDark
                        ? "border-gray-600 hover:bg-gray-700 text-gray-300 hover:text-gray-100"
                        : "border-gray-300 hover:bg-gray-100 text-gray-600 hover:text-gray-800"
                    }`}
                    title="AI Explanation"
                  >
                    <Sparkle
                      size={20}
                      color={isDark ? "#D1D5DB" : "#374151"}
                      className={isLoadingExplanation ? "animate-pulse" : ""}
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
                  Question {currentQuestionIndex + 1} of {questionAnalysis.length}
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

      {/* AI Explanation Modal */}
      {showExplanation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowExplanation(false)}
          />
          <div
            className={`relative w-full max-w-3xl max-h-[75vh] rounded-2xl border shadow-2xl ${
              isDark
                ? "bg-gray-900 text-gray-100 border-gray-700"
                : "bg-white text-gray-800 border-gray-200"
            } overflow-hidden`}
          >
            {/* Header */}
            <div
              className={`flex items-center justify-between p-5 border-b ${
                isDark
                  ? "border-gray-700 bg-gray-800/50"
                  : "border-gray-200 bg-gray-50/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-xl ${
                    isDark
                      ? "bg-gradient-to-br from-blue-600 to-purple-600"
                      : "bg-gradient-to-br from-blue-600 to-indigo-600"
                  }`}
                >
                  <Sparkle size={20} color="#FFFFFF" />
                </div>
                <div>
                  <h6
                    className={`font-bold text-lg ${
                      isDark ? "text-gray-100" : "text-gray-800"
                    }`}
                  >
                    AI Explanation
                  </h6>
                  <p
                    className={`text-sm ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Question {currentQuestionIndex + 1} Analysis
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowExplanation(false)}
                className={`p-2 rounded-lg border transition-colors ${
                  isDark
                    ? "border-gray-600 hover:bg-gray-700 text-gray-300 hover:text-gray-100"
                    : "border-gray-300 hover:bg-gray-100 text-gray-600 hover:text-gray-800"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(75vh-140px)]">
              {isLoadingExplanation ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <FiLoader
                    className={`w-10 h-10 animate-spin ${
                      isDark ? "text-blue-400" : "text-blue-600"
                    }`}
                  />
                  <p
                    className={`mt-4 text-base font-medium ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Generating detailed explanation...
                  </p>
                  <p
                    className={`mt-2 text-sm ${
                      isDark ? "text-gray-500" : "text-gray-500"
                    }`}
                  >
                    Please wait while AI analyzes the question
                  </p>
                </div>
              ) : (
                <div
                  className={`text-base leading-relaxed whitespace-pre-wrap ${
                    isDark ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  {explanations}
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className={`p-4 border-t ${
                isDark
                  ? "border-gray-700 bg-gray-800/30"
                  : "border-gray-200 bg-gray-50/50"
              }`}
            >
              <div
                className={`flex items-center gap-3 text-sm ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isDark
                      ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white"
                      : "bg-gradient-to-br from-blue-600 to-indigo-600 text-white"
                  }`}
                >
                  <span className="font-bold text-xs">AI</span>
                </div>
                <span>Generated by Gemini 2.5 Flash</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuestionNavigator;
