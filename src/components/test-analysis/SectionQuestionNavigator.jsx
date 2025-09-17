import React, { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import {
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiLoader,
  FiCheck,
} from "react-icons/fi";
import { Sparkle } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const SectionQuestionNavigator = ({ section, onClose }) => {
  const { isDark } = useTheme();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [explanations, setExplanations] = useState({});

  const currentQuestion = section.questions[currentQuestionIndex];

  // Lock body scroll when popup is open
  useEffect(() => {
    document.body.style.overflow = showExplanation ? "hidden" : "unset";
    return () => (document.body.style.overflow = "unset");
  }, [showExplanation]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (showExplanation) return;
      if (e.key === "ArrowLeft") prevQuestion();
      if (e.key === "ArrowRight") nextQuestion();
      if (e.key === "Escape") setShowExplanation(false);
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentQuestionIndex, showExplanation]);

  const nextQuestion = () => {
    if (currentQuestionIndex < section.questions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
      setShowExplanation(false);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((i) => i - 1);
      setShowExplanation(false);
    }
  };

  const jumpToQuestion = (index) => {
    setCurrentQuestionIndex(index);
    setShowExplanation(false);
  };

  // Optimized: Simpler data structure for API call
  const generateQuestionData = () => {
    const userAns = currentQuestion.userAnswer;
    const correctAns = currentQuestion.correctAnswer;
    
    return {
      q: currentQuestion.question,
      opts: currentQuestion.options || [],
      user: userAns !== undefined ? userAns : -1,
      correct: correctAns,
      isRight: userAns === correctAns,
      exp: currentQuestion.explanation || ""
    };
  };

  // Optimized: Much shorter, focused prompt
  const getGeminiExplanation = async (data) => {
    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash", // Using lighter model for faster response
        generationConfig: {
          maxOutputTokens: 300, // Limit response length
          temperature: 0.1, // More focused responses
        }
      });

      // Optimized: Concise prompt
      const prompt = `Question: ${data.q}

Options: ${data.opts.map((opt, i) => `${String.fromCharCode(65 + i)}) ${opt}`).join(' | ')}

Student chose: ${data.user >= 0 ? String.fromCharCode(65 + data.user) : 'No answer'}
Correct: ${String.fromCharCode(65 + data.correct)}
Result: ${data.isRight ? 'Correct ✅' : 'Wrong ❌'}

Provide brief explanation (150 words max):
📚 Why correct answer is right
❌ Why wrong options fail  
🔑 Key concept to remember`;

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error("API Error:", error);
      throw new Error("AI explanation failed");
    }
  };

  const handleExplanation = async () => {
    if (showExplanation) {
      setShowExplanation(false);
      return;
    }

    const questionId = `${section.name}-${currentQuestionIndex}`;
    
    // Check cache first
    if (explanations[questionId]) {
      setShowExplanation(true);
      return;
    }

    setShowExplanation(true);
    setIsLoadingExplanation(true);

    try {
      const questionData = generateQuestionData();
      
      // Add timeout for faster failure
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 10000)
      );
      
      const explanationPromise = getGeminiExplanation(questionData);
      
      const aiExplanation = await Promise.race([explanationPromise, timeoutPromise]);
      
      // Cache the result
      setExplanations(prev => ({
        ...prev,
        [questionId]: aiExplanation
      }));
      
    } catch (error) {
      const fallback = `Quick Review:
📚 Correct Answer: ${String.fromCharCode(65 + currentQuestion.correctAnswer)}
❌ Your Answer: ${currentQuestion.userAnswer !== undefined ? String.fromCharCode(65 + currentQuestion.userAnswer) : 'Not answered'}

${currentQuestion.explanation || 'Review the standard explanation and key concepts for this topic.'}

🔑 Practice similar questions to strengthen understanding.`;
      
      setExplanations(prev => ({
        ...prev,
        [questionId]: fallback
      }));
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  if (!section.questions.length) {
    return (
      <div
        className={`border rounded-xl p-8 text-center max-w-md mx-auto ${
          isDark
            ? "bg-gray-900 text-gray-100 border-gray-700"
            : "bg-white text-gray-800 border-gray-200"
        }`}
      >
        <div className="text-2xl mb-2">🧠</div>
        <h3 className={`text-lg font-semibold mb-1 ${
          isDark ? "text-gray-100" : "text-gray-800"
        }`}>
          No Questions Available
        </h3>
        <p className={isDark ? "text-gray-400" : "text-gray-500"}>
          Unable to load questions for this section.
        </p>
      </div>
    );
  }

  const questionId = `${section.name}-${currentQuestionIndex}`;

  return (
    <>
      {/* Main card - keeping all existing UI exactly the same */}
      <div className="transition-all duration-200">
        <div
          className={`border rounded-xl shadow-sm overflow-hidden max-w-2xl mx-auto ${
            isDark
              ? "bg-gray-900 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          {/* Header */}
          <div
            className={`border-b p-3 ${
              isDark 
                ? "border-gray-700 bg-gray-800/50" 
                : "border-gray-200 bg-gray-50/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className={`text-base font-semibold ${
                isDark ? "text-gray-100" : "text-gray-800"
              }`}>
                {section.name}
              </h3>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className={`text-base font-bold ${
                    isDark ? "text-gray-100" : "text-gray-800"
                  }`}>
                    {currentQuestionIndex + 1}/{section.questions.length}
                  </div>
                  <div className={`text-[11px] ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}>
                    Progress
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className={`p-2 rounded-lg border transition-colors ${
                    isDark
                      ? "border-gray-600 hover:bg-gray-700 text-gray-300 hover:text-gray-100"
                      : "border-gray-300 hover:bg-gray-100 text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div
              className={`w-full h-1.5 rounded-full mt-3 ${
                isDark ? "bg-gray-700" : "bg-gray-200"
              }`}
            >
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  isDark 
                    ? "bg-gradient-to-r from-blue-500 to-purple-500" 
                    : "bg-gradient-to-r from-blue-600 to-indigo-600"
                }`}
                style={{
                  width: `${
                    ((currentQuestionIndex + 1) / section.questions.length) * 100
                  }%`,
                }}
              />
            </div>

            {/* Navigation dots */}
            <div className="flex flex-wrap gap-2 justify-center mt-3">
              {section.questions.map((q, index) => {
                const isActive = index === currentQuestionIndex;
                const isCorrect = q.isCorrect;
                const isWrong = q.status === "incorrect";
                
                return (
                  <button
                    key={index}
                    onClick={() => jumpToQuestion(index)}
                    className={[
                      "w-7 h-7 rounded-full text-[11px] font-semibold border-2 transition-all duration-200 hover:scale-105",
                      isActive
                        ? isDark
                          ? "bg-blue-600 text-white border-blue-600 shadow-lg"
                          : "bg-indigo-600 text-white border-indigo-600 shadow-lg"
                        : isCorrect
                        ? isDark
                          ? "text-green-400 border-green-500 bg-green-500/10 hover:bg-green-500/20"
                          : "text-green-700 border-green-500 bg-green-50 hover:bg-green-100"
                        : isWrong
                        ? isDark
                          ? "text-red-400 border-red-500 bg-red-500/10 hover:bg-red-500/20"
                          : "text-red-700 border-red-500 bg-red-50 hover:bg-red-100"
                        : isDark
                        ? "text-gray-400 border-gray-600 bg-gray-800 hover:bg-gray-700"
                        : "text-gray-600 border-gray-300 bg-gray-50 hover:bg-gray-100",
                    ].join(" ")}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Body - keeping all existing UI exactly the same */}
          <div className="p-4">
            {/* Question */}
            <div
              className={`mb-4 p-4 rounded-xl border ${
                isDark 
                  ? "border-gray-700 bg-gray-800/30" 
                  : "border-gray-200 bg-gray-50/50"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3 flex-1">
                  <span
                    className={[
                      "px-3 py-1 font-semibold text-sm rounded-lg",
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
                        : "text-gray-600 bg-gray-100 border border-gray-300",
                    ].join(" ")}
                  >
                    Q{currentQuestionIndex + 1}
                  </span>
                  <div className="flex-1">
                    <span className={`text-base leading-relaxed block ${
                      isDark ? "text-gray-100" : "text-gray-800"
                    }`}>
                      {currentQuestion.question}
                    </span>

                    {currentQuestion.image && (
                      <div className="mt-4">
                        <img
                          src={currentQuestion.image}
                          alt="Question"
                          className={`max-w-full h-auto rounded-lg border ${
                            isDark ? "border-gray-600" : "border-gray-200"
                          }`}
                          style={{ maxHeight: "220px", objectFit: "contain" }}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* AI button */}
                <button
                  onClick={handleExplanation}
                  disabled={isLoadingExplanation}
                  className={`p-2.5 rounded-lg border transition-all duration-200 hover:scale-105 ${
                    isDark
                      ? "border-gray-600 hover:bg-gray-700 text-gray-300 hover:text-gray-100"
                      : "border-gray-300 hover:bg-gray-100 text-gray-600 hover:text-gray-800"
                  }`}
                  title="AI Explanation"
                >
                  <Sparkle
                    size={18}
                    color={isDark ? "#D1D5DB" : "#374151"}
                    className={isLoadingExplanation ? "animate-pulse" : ""}
                  />
                </button>
              </div>
            </div>

            {/* Options - keeping all existing UI exactly the same */}
            <div className="grid grid-cols-1 gap-3 mb-5">
              {currentQuestion.options?.map((option, optionIndex) => {
                const isCorrect = optionIndex === currentQuestion.correctAnswer;
                const isUserWrong =
                  optionIndex === currentQuestion.userAnswer &&
                  currentQuestion.userAnswer !== currentQuestion.correctAnswer;

                return (
                  <div
                    key={optionIndex}
                    className={[
                      "p-3 rounded-xl border-2 transition-all duration-200",
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
                        : "border-gray-200 bg-white hover:bg-gray-50",
                    ].join(" ")}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={[
                          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                          isCorrect
                            ? "bg-green-600 text-white"
                            : isUserWrong
                            ? "bg-red-600 text-white"
                            : isDark
                            ? "bg-gray-700 text-gray-300"
                            : "bg-gray-200 text-gray-700",
                        ].join(" ")}
                      >
                        {String.fromCharCode(65 + optionIndex)}
                      </span>
                      <div className="flex-1">
                        <span className={`text-sm leading-relaxed ${
                          isDark ? "text-gray-100" : "text-gray-800"
                        }`}>
                          {option}
                        </span>

                        {currentQuestion.optionImages &&
                          currentQuestion.optionImages[optionIndex] && (
                            <div className="mt-3">
                              <img
                                src={currentQuestion.optionImages[optionIndex]}
                                alt={`Option ${String.fromCharCode(65 + optionIndex)}`}
                                className={`max-w-full h-auto rounded-lg border ${
                                  isDark ? "border-gray-600" : "border-gray-200"
                                }`}
                                style={{ maxHeight: "120px", objectFit: "contain" }}
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            </div>
                          )}

                        {isCorrect && (
                          <div className="mt-2 flex items-center gap-2 text-green-600 font-semibold text-xs">
                            <FiCheck className="w-4 h-4" />
                            Correct Answer
                          </div>
                        )}
                        {isUserWrong && (
                          <div className="mt-2 flex items-center gap-2 text-red-600 font-semibold text-xs">
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
                className={`mb-4 p-4 rounded-xl border ${
                  isDark 
                    ? "border-blue-500/30 bg-blue-500/10" 
                    : "border-blue-200 bg-blue-50"
                }`}
              >
                <h5 className={`font-semibold mb-2 text-sm flex items-center gap-2 ${
                  isDark ? "text-blue-400" : "text-blue-700"
                }`}>
                  💡 Standard Explanation
                </h5>
                <p className={`leading-relaxed text-sm ${
                  isDark ? "text-blue-200" : "text-blue-800"
                }`}>
                  {currentQuestion.explanation}
                </p>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-between">
              <button
                onClick={prevQuestion}
                disabled={currentQuestionIndex === 0}
                className={`disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105 flex items-center gap-2 ${
                  isDark
                    ? "bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800"
                    : "bg-gray-700 hover:bg-gray-800 disabled:bg-gray-400"
                }`}
              >
                <FiChevronLeft className="w-5 h-5" />
                <span className="font-semibold">Previous</span>
              </button>

              <div className={`text-xs font-semibold ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}>
                Question {currentQuestionIndex + 1} of {section.questions.length}
              </div>

              <button
                onClick={nextQuestion}
                disabled={currentQuestionIndex === section.questions.length - 1}
                className={`disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105 flex items-center gap-2 ${
                  isDark
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-800"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500"
                }`}
              >
                <span className="font-semibold text-sm">Next</span>
                <FiChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Explanation Modal - keeping all existing UI exactly the same */}
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
                <div>
                  <h6 className={`font-bold text-lg ${
                    isDark ? "text-gray-100" : "text-gray-800"
                  }`}>
                    AI Explanation
                  </h6>
                  <p className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}>
                    {section.name} — Question {currentQuestionIndex + 1}
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
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(75vh-140px)]">
              {isLoadingExplanation ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <FiLoader className={`w-10 h-10 animate-spin ${
                    isDark ? "text-blue-400" : "text-blue-600"
                  }`} />
                  <p className={`mt-4 text-base font-medium ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}>
                    Generating explanation...
                  </p>
                  <p className={`mt-2 text-sm ${
                    isDark ? "text-gray-500" : "text-gray-500"
                  }`}>
                    This should be quick!
                  </p>
                </div>
              ) : (
                <div className={`text-base leading-relaxed whitespace-pre-wrap ${
                  isDark ? "text-gray-200" : "text-gray-800"
                }`}>
                  {explanations[questionId]}
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
              <div className={`flex items-center gap-3 text-sm ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isDark 
                      ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white" 
                      : "bg-gradient-to-br from-blue-600 to-indigo-600 text-white"
                  }`}
                >
                  <span className="font-bold text-xs">AI</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SectionQuestionNavigator;
