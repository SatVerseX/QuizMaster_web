import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight, FiCheck, FiX, FiFlag, FiEye, FiBookOpen } from 'react-icons/fi';
import { FaBrain} from 'react-icons/fa';


const QuestionNavigator = ({ questionAnalysis, attempt }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
     
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentQuestionIndex]);

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'correct': return 'from-emerald-500 to-green-500';
      case 'incorrect': return 'from-red-500 to-pink-500';
      case 'skipped': return 'from-gray-500 to-slate-500';
      default: return 'from-blue-500 to-indigo-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'correct': return <FiCheck className="w-6 h-6" />;
      case 'incorrect': return <FiX className="w-6 h-6" />;
      case 'skipped': return <FiEye className="w-6 h-6" />;
      default: return <FiBookOpen className="w-6 h-6" />;
    }
  };

  if (!questionAnalysis.length) {
    return (
      <div className="lg:col-span-2 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-gray-600/40 rounded-2xl sm:rounded-3xl p-8 text-center">
        <FiBookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">
          Question Details Not Available
        </h3>
        <p className="text-gray-400">
          Unable to load detailed question analysis for this test.
        </p>
      </div>
    );
  }

  const currentQuestion = questionAnalysis[currentQuestionIndex];

  return (
    <div className="lg:col-span-2">
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-gray-600/40 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
        {/* Header with Progress */}
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-b border-gray-600/40 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-xl">
                <FaBrain className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Interactive Question Analysis</h3>
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-bold text-white">
                {currentQuestionIndex + 1}/{questionAnalysis.length}
              </div>
              <div className="text-sm text-gray-400">Question Progress</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden mb-4">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
              style={{ width: `${((currentQuestionIndex + 1) / questionAnalysis.length) * 100}%` }}
            ></div>
          </div>

          {/* Question Navigation Dots */}
          <div className="flex flex-wrap gap-2 justify-center">
            {questionAnalysis.map((q, index) => (
              <button
                key={index}
                onClick={() => jumpToQuestion(index)}
                className={`w-8 h-8 rounded-full text-xs font-bold transition-all duration-300 hover:scale-110 ${
                  index === currentQuestionIndex
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white scale-110 shadow-lg'
                    : q.isCorrect
                    ? 'bg-green-500/20 border border-green-500/40 text-green-300 hover:bg-green-500/30'
                    : q.status === 'incorrect'
                    ? 'bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30'
                    : 'bg-gray-500/20 border border-gray-500/40 text-gray-300 hover:bg-gray-500/30'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {/* Question Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 bg-gradient-to-r ${getStatusColor(currentQuestion.status)} rounded-2xl flex items-center justify-center text-white shadow-xl`}>
                {getStatusIcon(currentQuestion.status)}
              </div>
              <div>
                <h4 className="text-2xl font-bold text-white">
                  Question {currentQuestionIndex + 1}
                </h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    currentQuestion.isCorrect
                      ? 'bg-green-500/20 text-green-300'
                      : currentQuestion.status === 'incorrect'
                      ? 'bg-red-500/20 text-red-300'
                      : 'bg-gray-500/20 text-gray-300'
                  }`}>
                    {currentQuestion.isCorrect ? '✅ Correct' : currentQuestion.status === 'incorrect' ? '❌ Incorrect' : '⏭️ Skipped'}
                  </span>
                  {currentQuestion.isFlagged && (
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm font-bold flex items-center gap-1">
                      <FiFlag className="w-3 h-3" />
                      Flagged
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Question Text */}
          <div className="mb-8 p-6 bg-gray-800/40 rounded-2xl border border-gray-600/30">
            <p className="text-xl text-white leading-relaxed font-medium">
              {currentQuestion.question}
            </p>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 gap-4 mb-8">
            {currentQuestion.options.map((option, optionIndex) => (
              <div
                key={optionIndex}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                  optionIndex === currentQuestion.correctAnswer
                    ? 'border-green-500/60 bg-green-500/20 shadow-lg shadow-green-500/20'
                    : optionIndex === currentQuestion.userAnswer && currentQuestion.userAnswer !== currentQuestion.correctAnswer
                    ? 'border-red-500/60 bg-red-500/20 shadow-lg shadow-red-500/20'
                    : 'border-gray-600/40 bg-gray-800/30 hover:border-gray-500/60'
                }`}
              >
                <div className="flex items-start gap-4">
                  <span className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                    optionIndex === currentQuestion.correctAnswer
                      ? 'bg-green-500 text-white'
                      : optionIndex === currentQuestion.userAnswer && currentQuestion.userAnswer !== currentQuestion.correctAnswer
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-600 text-gray-300'
                  }`}>
                    {String.fromCharCode(65 + optionIndex)}
                  </span>
                  <div className="flex-1">
                    <span className="text-lg text-gray-200 leading-relaxed">
                      {option}
                    </span>
                    {optionIndex === currentQuestion.correctAnswer && (
                      <div className="mt-3 flex items-center gap-2 text-green-300 font-semibold">
                        <FiCheck className="w-4 h-4" />
                        Correct Answer
                      </div>
                    )}
                    {optionIndex === currentQuestion.userAnswer && currentQuestion.userAnswer !== currentQuestion.correctAnswer && (
                      <div className="mt-3 flex items-center gap-2 text-red-300 font-semibold">
                        <FiX className="w-4 h-4" />
                        Your Answer
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Your Answer Summary */}
          <div className="mb-8 p-6 bg-blue-500/10 border border-blue-500/30 rounded-2xl">
            <h5 className="font-bold text-blue-300 mb-3 flex items-center gap-2">
              <FiEye className="w-5 h-5" />
              Your Response
            </h5>
            <p className="text-blue-200">
              <strong>You answered:</strong> {currentQuestion.userAnswer !== undefined ? currentQuestion.options[currentQuestion.userAnswer] : 'Question not attempted'}
            </p>
            {currentQuestion.userAnswer !== undefined && (
              <p className="text-blue-200 mt-2">
                <strong>Result:</strong> {currentQuestion.isCorrect ? '✅ Correct!' : '❌ Incorrect'}
              </p>
            )}
          </div>

          {/* Standard Explanation */}
          {currentQuestion.explanation && (
            <div className="mb-8 p-6 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl">
              <h5 className="font-bold text-indigo-300 mb-3 flex items-center gap-2">
                <div className="w-5 h-5">💡</div>
                Standard Explanation
              </h5>
              <p className="text-indigo-200 leading-relaxed">
                {currentQuestion.explanation}
              </p>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="group bg-gradient-to-r from-gray-700/80 to-gray-600/80 hover:from-gray-600/80 hover:to-gray-500/80 disabled:from-gray-800/50 disabled:to-gray-700/50 text-white px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center gap-3 shadow-lg"
            >
              <FiChevronLeft className="w-6 h-6 transition-transform group-hover:-translate-x-1" />
              <span className="font-semibold">Previous</span>
            </button>

            <div className="text-center">
              <div className="text-lg font-bold text-white mb-1">
                Question {currentQuestionIndex + 1} of {questionAnalysis.length}
              </div>
              <div className="text-sm text-gray-400">
                Use arrows to navigate
              </div>
            </div>

            <button
              onClick={handleNext}
              disabled={currentQuestionIndex === questionAnalysis.length - 1}
              className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-800/50 disabled:to-gray-700/50 text-white px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center gap-3 shadow-lg"
            >
              <span className="font-semibold">Next</span>
              <FiChevronRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Keyboard Shortcuts Hint */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              💡 Use <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">←</kbd> and <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">→</kbd> arrow keys to navigate
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionNavigator;
