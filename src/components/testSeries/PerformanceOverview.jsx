import React from 'react';
import { FiClock, FiCalendar, FiTarget, FiPercent, FiPieChart, FiX } from 'react-icons/fi';
import { FaCrown, FaTrophy, FaMedal, FaChartLine, FaLightbulb, FaThumbsUp, FaRocket, FaBrain, FaGem } from 'react-icons/fa';

const PerformanceOverview = ({ attempt, questionAnalysis, showRecommendations, setShowRecommendations }) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 90) return 'from-green-500 to-emerald-500';
    if (percentage >= 80) return 'from-blue-500 to-blue-600';
    if (percentage >= 70) return 'from-purple-500 to-purple-600';
    if (percentage >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const getScoreMessage = (percentage) => {
    if (percentage >= 90) return { 
      text: 'Outstanding Performance! 🌟', 
      color: 'text-green-400', 
      icon: FaCrown,
      description: 'You have demonstrated exceptional mastery of the subject!'
    };
    if (percentage >= 80) return { 
      text: 'Excellent Work! 🎉', 
      color: 'text-blue-400', 
      icon: FaTrophy,
      description: 'Great job! You have a strong understanding of the concepts.'
    };
    if (percentage >= 70) return { 
      text: 'Good Performance! 👏', 
      color: 'text-purple-400', 
      icon: FaMedal,
      description: 'Well done! You\'re on the right track with room for improvement.'
    };
    if (percentage >= 60) return { 
      text: 'Fair Performance 📈', 
      color: 'text-yellow-400', 
      icon: FaChartLine,
      description: 'You\'re making progress! Focus on areas that need improvement.'
    };
    return { 
      text: 'Keep Practicing! 💪', 
      color: 'text-orange-400', 
      icon: FaLightbulb,
      description: 'Don\'t give up! More practice will help you improve significantly.'
    };
  };

  const correctAnswers = questionAnalysis.filter(q => q.isCorrect).length;
  const incorrectAnswers = questionAnalysis.filter(q => q.status === 'incorrect').length;
  const skippedAnswers = questionAnalysis.filter(q => q.status === 'skipped').length;
  const scoreMessage = getScoreMessage(attempt.percentage);

  return (
    <div className="lg:col-span-1 space-y-4 sm:space-y-6">
      {/* Score Card */}
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-gray-600/40 rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl">
        <div className="text-center mb-4 sm:mb-6">
          <div className="relative mb-4 sm:mb-6">
            <div className={`w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-gradient-to-br ${getScoreColor(attempt.percentage)} rounded-full flex items-center justify-center mx-auto shadow-2xl`}>
              <scoreMessage.icon className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-white" />
            </div>
            <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse"></div>
          </div>
          
          <div className={`text-4xl sm:text-5xl lg:text-6xl font-black mb-2 sm:mb-3 bg-gradient-to-r ${getScoreColor(attempt.percentage)} bg-clip-text text-transparent`}>
            {attempt.percentage}%
          </div>
          
          <h3 className={`text-lg sm:text-xl lg:text-2xl font-bold mb-2 ${scoreMessage.color}`}>
            {scoreMessage.text}
          </h3>
          
          <p className="text-gray-400 leading-relaxed text-sm sm:text-base">
            {scoreMessage.description}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="text-center p-3 sm:p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
            <div className="text-xl sm:text-2xl font-bold text-green-400">{attempt.score}</div>
            <div className="text-xs sm:text-sm text-green-300">Correct</div>
          </div>
          <div className="text-center p-3 sm:p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <div className="text-xl sm:text-2xl font-bold text-red-400">{attempt.totalQuestions - attempt.score}</div>
            <div className="text-xs sm:text-sm text-red-300">Incorrect</div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-2 sm:gap-3">
              <FiClock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              <span className="text-gray-300 text-sm sm:text-base">Time Taken</span>
            </div>
            <span className="font-bold text-white text-sm sm:text-base">{formatTime(attempt.timeSpent)}</span>
          </div>
          
          <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-2 sm:gap-3">
              <FiCalendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
              <span className="text-gray-300 text-sm sm:text-base">Completed</span>
            </div>
            <span className="font-bold text-white text-xs sm:text-sm">{formatDate(attempt.completedAt)}</span>
          </div>
          
          <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-2 sm:gap-3">
              <FiTarget className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              <span className="text-gray-300 text-sm sm:text-base">Difficulty</span>
            </div>
            <span className="font-bold text-white capitalize text-sm sm:text-base">{attempt.difficulty}</span>
          </div>
          
          <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-2 sm:gap-3">
              <FiPercent className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
              <span className="text-gray-300 text-sm sm:text-base">Accuracy</span>
            </div>
            <span className="font-bold text-white text-sm sm:text-base">
              {Math.round((attempt.score / attempt.totalQuestions) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Performance Breakdown */}
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-gray-600/40 rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
          <FiPieChart className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
          Answer Breakdown
        </h3>
        
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full"></div>
              <span className="text-gray-300 text-sm sm:text-base">Correct</span>
            </div>
            <span className="font-bold text-green-400 text-sm sm:text-base">{correctAnswers}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full"></div>
              <span className="text-gray-300 text-sm sm:text-base">Incorrect</span>
            </div>
            <span className="font-bold text-red-400 text-sm sm:text-base">{incorrectAnswers}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-500 rounded-full"></div>
              <span className="text-gray-300 text-sm sm:text-base">Skipped</span>
            </div>
            <span className="font-bold text-gray-400 text-sm sm:text-base">{skippedAnswers}</span>
          </div>
          
          {attempt.flaggedQuestions?.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-300 text-sm sm:text-base">Flagged</span>
              </div>
              <span className="font-bold text-yellow-400 text-sm sm:text-base">{attempt.flaggedQuestions.length}</span>
            </div>
          )}
        </div>

        {/* Visual Progress Bar */}
        <div className="mt-4 sm:mt-6">
          <div className="w-full bg-gray-700 rounded-full h-3 sm:h-4 overflow-hidden">
            <div className="h-full flex">
              <div 
                className="bg-green-500 h-full"
                style={{ width: `${(correctAnswers / attempt.totalQuestions) * 100}%` }}
              ></div>
              <div 
                className="bg-red-500 h-full"
                style={{ width: `${(incorrectAnswers / attempt.totalQuestions) * 100}%` }}
              ></div>
              <div 
                className="bg-gray-500 h-full"
                style={{ width: `${(skippedAnswers / attempt.totalQuestions) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {showRecommendations && (
        <div className="bg-gradient-to-br from-purple-800/40 to-blue-800/40 backdrop-blur-xl border border-purple-500/40 rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 sm:gap-3">
              <FaLightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
              Recommendations
            </h3>
            <button 
              onClick={() => setShowRecommendations(false)}
              className="text-gray-400 hover:text-white"
            >
              <FiX className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
          
          <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm">
            {attempt.percentage >= 80 ? (
              <>
                <div className="flex items-start gap-2 sm:gap-3">
                  <FaThumbsUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-green-300 font-medium">Excellent Work!</p>
                    <p className="text-gray-300">You have strong command over this topic. Consider taking advanced tests.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <FaRocket className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-blue-300 font-medium">Next Steps</p>
                    <p className="text-gray-300">Try more challenging tests or explore related topics to expand your knowledge.</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-2 sm:gap-3">
                  <FaBrain className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 mt-0.5" />
                  <div>
                    <p className="text-purple-300 font-medium">Study Focus</p>
                    <p className="text-gray-300">Review the incorrect answers and understand the concepts better.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <FaGem className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 mt-0.5" />
                  <div>
                    <p className="text-yellow-300 font-medium">Practice More</p>
                    <p className="text-gray-300">Take similar tests to improve your understanding and speed.</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceOverview;
