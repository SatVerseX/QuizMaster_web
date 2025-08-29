import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import usePopup from '../../hooks/usePopup';
import BeautifulPopup from '../common/BeautifulPopup';
import { 
  FiClock, 
  FiTarget, 
  FiTrendingUp, 
  FiAward,
  FiShare2,
  FiDownload,
  FiRefreshCw,
  FiHome,
  FiBarChart3,
  FiDollarSign,
  FiGift,
  FiStar,
  FiZap,
  FiTrophy,
  FiCheck,
  FiX
} from 'react-icons/fi';
import { 
  FaGraduationCap, 
  FaTrophy, 
  FaMedal, 
  FaCrown,
  FaRocket,
  FaFire,
  FaGem,
  FaRupeeSign,
  FaChartLine,
  FaLightbulb,
  FaSparkles
} from 'react-icons/fa';

const TestResults = ({ 
  attempt, 
  testSeries, 
  onRetakeTest, 
  onViewAnalysis, 
  onBackToSeries 
}) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { popupState, showSuccess, showError, hidePopup } = usePopup();
  const [loading, setLoading] = useState(false);
  const [showEarningAnimation, setShowEarningAnimation] = useState(false);
  const [earnedAmount, setEarnedAmount] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);

  useEffect(() => {
    if (attempt && attempt.percentage) {
      calculateAndAddEarnings();
      
      // Show confetti for good performance
      if (attempt.percentage >= 80) {
        setConfettiActive(true);
        setTimeout(() => setConfettiActive(false), 3000);
      }
    }
  }, [attempt]);

  const calculateAndAddEarnings = async () => {
    try {
      let earningAmount = 0;
      let rewardType = 'completion';
      
      // Calculate earnings based on performance
      if (attempt.percentage >= 95) {
        earningAmount = 200;
        rewardType = 'excellence';
      } else if (attempt.percentage >= 90) {
        earningAmount = 150;
        rewardType = 'outstanding';
      } else if (attempt.percentage >= 80) {
        earningAmount = 100;
        rewardType = 'excellent';
      } else if (attempt.percentage >= 70) {
        earningAmount = 50;
        rewardType = 'good';
      } else if (attempt.percentage >= 60) {
        earningAmount = 25;
        rewardType = 'average';
      } else if (attempt.percentage >= 50) {
        earningAmount = 10;
        rewardType = 'participation';
      }

      // Bonus for perfect score
      if (attempt.percentage === 100) {
        earningAmount += 100; // Perfect score bonus
      }

      // Time bonus (if completed in less than half the time)
      const timeBonus = calculateTimeBonus();
      earningAmount += timeBonus;

      if (earningAmount > 0) {
        await addUserEarning(earningAmount, rewardType);
        setEarnedAmount(earningAmount);
        setTimeout(() => {
          setShowEarningAnimation(true);
        }, 2000); // Show earning animation after 2 seconds
      }
    } catch (error) {
      console.error('Error calculating earnings:', error);
    }
  };

  const calculateTimeBonus = () => {
    if (!attempt.timeSpent || !testSeries?.timeLimit) return 0;
    
    const timeLimit = testSeries.timeLimit * 60; // Convert to seconds
    const halfTime = timeLimit / 2;
    
    if (attempt.timeSpent <= halfTime && attempt.percentage >= 80) {
      return 50; // Speed bonus
    }
    return 0;
  };

  const addUserEarning = async (amount, rewardType) => {
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user-earnings/add-earning`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount,
          testSeriesId: attempt.testId,
          testTitle: attempt.testTitle,
          rewardType,
          performance: {
            score: attempt.score,
            percentage: attempt.percentage,
            timeSpent: attempt.timeSpent,
            totalQuestions: attempt.totalQuestions
          }
        })
      });
      
      const data = await response.json();
      if (!data.success) {
        console.error('Failed to add earning:', data.message);
      }
    } catch (error) {
      console.error('Error adding earning:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPerformanceData = () => {
    const percentage = attempt.percentage;
    
    if (percentage >= 95) {
      return {
        grade: 'A+',
        title: 'Outstanding Performance! 🌟',
        message: 'Exceptional mastery! You\'re in the top 1%',
        color: 'from-yellow-400 to-orange-500',
        bgColor: 'from-yellow-500/20 to-orange-500/20',
        borderColor: 'border-yellow-500/40',
        icon: FaCrown,
        celebration: '🎉🏆✨'
      };
    } else if (percentage >= 90) {
      return {
        grade: 'A',
        title: 'Excellent Work! 🎉',
        message: 'Outstanding achievement! Keep it up!',
        color: 'from-green-400 to-emerald-500',
        bgColor: 'from-green-500/20 to-emerald-500/20',
        borderColor: 'border-green-500/40',
        icon: FaTrophy,
        celebration: '🎊🥇🎯'
      };
    } else if (percentage >= 80) {
      return {
        grade: 'B+',
        title: 'Great Performance! 👏',
        message: 'Well done! You\'re doing great!',
        color: 'from-blue-400 to-blue-600',
        bgColor: 'from-blue-500/20 to-blue-600/20',
        borderColor: 'border-blue-500/40',
        icon: FaMedal,
        celebration: '🎈🌟💪'
      };
    } else if (percentage >= 70) {
      return {
        grade: 'B',
        title: 'Good Job! 📈',
        message: 'Nice work! Room for improvement.',
        color: 'from-purple-400 to-purple-600',
        bgColor: 'from-purple-500/20 to-purple-600/20',
        borderColor: 'border-purple-500/40',
        icon: FaRocket,
        celebration: '💜📚🔥'
      };
    } else if (percentage >= 60) {
      return {
        grade: 'C+',
        title: 'Fair Performance 📊',
        message: 'You\'re on the right track! Keep practicing.',
        color: 'from-yellow-400 to-yellow-600',
        bgColor: 'from-yellow-500/20 to-yellow-600/20',
        borderColor: 'border-yellow-500/40',
        icon: FaChartLine,
        celebration: '📈💪📖'
      };
    } else {
      return {
        grade: 'C',
        title: 'Keep Practicing! 💪',
        message: 'Don\'t give up! Every attempt makes you stronger.',
        color: 'from-orange-400 to-red-500',
        bgColor: 'from-orange-500/20 to-red-500/20',
        borderColor: 'border-orange-500/40',
        icon: FaLightbulb,
        celebration: '💡🎯📚'
      };
    }
  };

  const performance = getPerformanceData();
  const PerformanceIcon = performance.icon;

  const handleShareResults = () => {
    setShowShareModal(true);
  };

  const shareToSocial = (platform) => {
    const shareText = `🎯 Just completed "${attempt.testTitle}" and scored ${attempt.percentage}%! ${performance.title}

📊 My Performance:
✅ ${attempt.score}/${attempt.totalQuestions} correct answers
⏱️ Completed in ${formatTime(attempt.timeSpent)}
🏆 Grade: ${performance.grade}
${earnedAmount > 0 ? `💰 Earned: ₹${earnedAmount}` : ''}

Ready to challenge yourself? Join QuizMaster! 🚀

#QuizMaster #TestSeries #Learning #Achievement`;

    const urls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?summary=${encodeURIComponent(shareText)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(shareText)}`
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
  };

  const copyToClipboard = async () => {
    const shareText = `🎯 Test Results: "${attempt.testTitle}"

📊 Score: ${attempt.percentage}% (${attempt.score}/${attempt.totalQuestions} correct)
⏱️ Time: ${formatTime(attempt.timeSpent)}
🏆 Grade: ${performance.grade}
${earnedAmount > 0 ? `💰 Earned: ₹${earnedAmount}` : ''}

Generated by QuizMaster`;

    try {
      await navigator.clipboard.writeText(shareText);
      showSuccess('Results copied to clipboard!', 'Copied Successfully');
      setShowShareModal(false);
    } catch (error) {
      console.error('Failed to copy:', error);
      showError('Failed to copy to clipboard', 'Copy Error');
    }
  };

  const getRewardMessage = () => {
    if (earnedAmount >= 200) return "🏆 Amazing! You've earned a premium reward!";
    if (earnedAmount >= 100) return "🎉 Excellent! Great reward earned!";
    if (earnedAmount >= 50) return "⭐ Good job! Nice reward!";
    if (earnedAmount >= 25) return "💪 Keep it up! Small reward earned!";
    if (earnedAmount > 0) return "🎯 Well done! Participation reward!";
    return "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 relative overflow-hidden">
      {/* Confetti Effect */}
      {confettiActive && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              {['🎉', '🎊', '⭐', '🏆', '🥇', '💫'][Math.floor(Math.random() * 6)]}
            </div>
          ))}
        </div>
      )}

      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-green-500/5 to-blue-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FaGraduationCap className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400" />
            <h1 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-purple-200">
              Test Results
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-gray-400">
            {attempt.testTitle} • {attempt.testSeriesTitle}
          </p>
        </div>

        {/* Main Results Card */}
        <div className={`bg-gradient-to-br ${performance.bgColor} backdrop-blur-xl border ${performance.borderColor} rounded-3xl p-6 sm:p-8 mb-8 shadow-2xl`}>
          <div className="text-center">
            {/* Performance Icon & Grade */}
            <div className="relative mb-6">
              <div className={`w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-r ${performance.color} rounded-full flex items-center justify-center mx-auto shadow-2xl`}>
                <PerformanceIcon className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white text-gray-900 px-4 py-1 rounded-full font-bold text-sm">
                Grade {performance.grade}
              </div>
            </div>

            {/* Score */}
            <div className={`text-6xl sm:text-8xl font-black mb-4 bg-gradient-to-r ${performance.color} bg-clip-text text-transparent`}>
              {attempt.percentage}%
            </div>

            {/* Performance Message */}
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              {performance.title}
            </h2>
            <p className="text-lg text-gray-300 mb-6">
              {performance.message}
            </p>

            {/* Celebration Emojis */}
            <div className="text-4xl mb-6 animate-bounce">
              {performance.celebration}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold text-white">{attempt.score}</div>
                <div className="text-sm text-gray-300">Correct</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold text-white">{attempt.totalQuestions - attempt.score}</div>
                <div className="text-sm text-gray-300">Incorrect</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold text-white">{formatTime(attempt.timeSpent)}</div>
                <div className="text-sm text-gray-300">Time Taken</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold text-white">{Math.round((attempt.score / attempt.totalQuestions) * 100)}%</div>
                <div className="text-sm text-gray-300">Accuracy</div>
              </div>
            </div>
          </div>
        </div>

        {/* Earnings Card */}
        {earnedAmount > 0 && (
          <div className={`bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-xl border border-green-500/40 rounded-2xl p-6 mb-8 shadow-xl transform transition-all duration-500 ${
            showEarningAnimation ? 'scale-105 shadow-green-500/25' : ''
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                  <FaRupeeSign className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-green-300">
                    ₹{earnedAmount} Earned!
                  </h3>
                  <p className="text-green-200">
                    {getRewardMessage()}
                  </p>
                </div>
              </div>
              <div className="text-4xl animate-pulse">
                💰
              </div>
            </div>
          </div>
        )}

        {/* Detailed Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Performance Breakdown */}
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-gray-600/40 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <FiBarChart3 className="w-6 h-6 text-blue-400" />
              Performance Analysis
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Questions Attempted</span>
                <span className="font-bold text-white">{attempt.totalQuestions}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Correct Answers</span>
                <span className="font-bold text-green-400">{attempt.score}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Incorrect Answers</span>
                <span className="font-bold text-red-400">{attempt.totalQuestions - attempt.score}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Time Efficiency</span>
                <span className="font-bold text-blue-400">
                  {testSeries?.timeLimit ? 
                    `${Math.round((attempt.timeSpent / (testSeries.timeLimit * 60)) * 100)}%` : 
                    'N/A'
                  }
                </span>
              </div>
              
              {attempt.flaggedQuestions?.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Flagged Questions</span>
                  <span className="font-bold text-yellow-400">{attempt.flaggedQuestions.length}</span>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                <span>Overall Progress</span>
                <span>{attempt.percentage}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className={`h-3 bg-gradient-to-r ${performance.color} rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: `${attempt.percentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Achievements & Badges */}
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-gray-600/40 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <FiAward className="w-6 h-6 text-yellow-400" />
              Achievements Unlocked
            </h3>
            
            <div className="space-y-4">
              {/* Performance Achievement */}
              <div className={`flex items-center gap-3 p-3 rounded-lg ${
                attempt.percentage >= 80 ? 'bg-green-500/20 border border-green-500/30' : 'bg-gray-700/30'
              }`}>
                <FiTrophy className={`w-6 h-6 ${attempt.percentage >= 80 ? 'text-yellow-400' : 'text-gray-500'}`} />
                <div>
                  <div className={`font-medium ${attempt.percentage >= 80 ? 'text-green-300' : 'text-gray-400'}`}>
                    High Performer
                  </div>
                  <div className="text-sm text-gray-400">Score 80% or above</div>
                </div>
              </div>

              {/* Speed Achievement */}
              <div className={`flex items-center gap-3 p-3 rounded-lg ${
                calculateTimeBonus() > 0 ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-gray-700/30'
              }`}>
                <FiZap className={`w-6 h-6 ${calculateTimeBonus() > 0 ? 'text-blue-400' : 'text-gray-500'}`} />
                <div>
                  <div className={`font-medium ${calculateTimeBonus() > 0 ? 'text-blue-300' : 'text-gray-400'}`}>
                    Speed Demon
                  </div>
                  <div className="text-sm text-gray-400">Complete in record time</div>
                </div>
              </div>

              {/* Perfect Score Achievement */}
              <div className={`flex items-center gap-3 p-3 rounded-lg ${
                attempt.percentage === 100 ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-gray-700/30'
              }`}>
                <FaCrown className={`w-6 h-6 ${attempt.percentage === 100 ? 'text-purple-400' : 'text-gray-500'}`} />
                <div>
                  <div className={`font-medium ${attempt.percentage === 100 ? 'text-purple-300' : 'text-gray-400'}`}>
                    Perfectionist
                  </div>
                  <div className="text-sm text-gray-400">Score 100%</div>
                </div>
              </div>

              {/* Participation Achievement */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-500/20 border border-orange-500/30">
                <FaSparkles className="w-6 h-6 text-orange-400" />
                <div>
                  <div className="font-medium text-orange-300">Test Completed</div>
                  <div className="text-sm text-gray-400">Finished the test</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button
            onClick={onViewAnalysis}
            className="group bg-gradient-to-r from-blue-600/20 to-blue-700/20 hover:from-blue-600/30 hover:to-blue-700/30 border border-blue-500/40 text-blue-300 font-semibold px-6 py-4 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-3"
          >
            <FiBarChart3 className="w-5 h-5" />
            Detailed Analysis
          </button>
          
          <button
            onClick={handleShareResults}
            className="group bg-gradient-to-r from-green-600/20 to-emerald-700/20 hover:from-green-600/30 hover:to-emerald-700/30 border border-green-500/40 text-green-300 font-semibold px-6 py-4 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-3"
          >
            <FiShare2 className="w-5 h-5" />
            Share Results
          </button>
          
          <button
            onClick={onRetakeTest}
            className="group bg-gradient-to-r from-purple-600/20 to-purple-700/20 hover:from-purple-600/30 hover:to-purple-700/30 border border-purple-500/40 text-purple-300 font-semibold px-6 py-4 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-3"
          >
            <FiRefreshCw className="w-5 h-5" />
            Retake Test
          </button>
          
          <button
            onClick={() => navigate('/earnings')}
            className="group bg-gradient-to-r from-yellow-600/20 to-orange-700/20 hover:from-yellow-600/30 hover:to-orange-700/30 border border-yellow-500/40 text-yellow-300 font-semibold px-6 py-4 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-3"
          >
            <FiDollarSign className="w-5 h-5" />
            My Earnings
          </button>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onBackToSeries}
            className="group bg-gradient-to-r from-gray-700/80 to-gray-600/80 hover:from-gray-600/80 hover:to-gray-500/80 text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 shadow-xl flex items-center justify-center gap-3"
          >
            <FiHome className="w-5 h-5" />
            Back to Test Series
          </button>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="group bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 shadow-xl flex items-center justify-center gap-3"
          >
            <FiTrendingUp className="w-5 h-5" />
            Dashboard
          </button>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl border border-gray-600/40 rounded-3xl p-8 max-w-lg w-full shadow-2xl">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Share Your Achievement!</h3>
              <p className="text-gray-400">Let others know about your amazing performance</p>
            </div>

            {/* Social Media Buttons */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => shareToSocial('whatsapp')}
                className="flex items-center gap-3 p-4 bg-green-600/20 hover:bg-green-600/30 border border-green-500/40 text-green-300 rounded-xl transition-all duration-300 hover:scale-105"
              >
                <div className="w-8 h-8 text-green-400">📱</div>
                <span className="font-semibold">WhatsApp</span>
              </button>

              <button
                onClick={() => shareToSocial('twitter')}
                className="flex items-center gap-3 p-4 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 rounded-xl transition-all duration-300 hover:scale-105"
              >
                <div className="w-8 h-8 text-blue-400">🐦</div>
                <span className="font-semibold">Twitter</span>
              </button>

              <button
                onClick={() => shareToSocial('linkedin')}
                className="flex items-center gap-3 p-4 bg-blue-700/20 hover:bg-blue-700/30 border border-blue-600/40 text-blue-300 rounded-xl transition-all duration-300 hover:scale-105"
              >
                <div className="w-8 h-8 text-blue-400">💼</div>
                <span className="font-semibold">LinkedIn</span>
              </button>

              <button
                onClick={() => shareToSocial('facebook')}
                className="flex items-center gap-3 p-4 bg-blue-800/20 hover:bg-blue-800/30 border border-blue-700/40 text-blue-300 rounded-xl transition-all duration-300 hover:scale-105"
              >
                <div className="w-8 h-8 text-blue-400">👥</div>
                <span className="font-semibold">Facebook</span>
              </button>
            </div>

            {/* Copy to Clipboard */}
            <button
              onClick={copyToClipboard}
              className="w-full flex items-center justify-center gap-3 p-4 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 rounded-xl transition-all duration-300 hover:scale-105 mb-6"
            >
              <div className="w-6 h-6 text-purple-400">📋</div>
              <span className="font-semibold">Copy Results to Clipboard</span>
            </button>

            {/* Close Button */}
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 p-3 rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Earning Animation */}
      {showEarningAnimation && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-r from-green-500/90 to-emerald-500/90 backdrop-blur-xl border border-green-400/50 rounded-3xl p-8 text-center shadow-2xl transform animate-pulse">
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-3xl font-bold text-white mb-2">
              Congratulations!
            </h3>
            <p className="text-xl text-green-100 mb-4">
              You earned ₹{earnedAmount}!
            </p>
            <button
              onClick={() => setShowEarningAnimation(false)}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl transition-colors"
            >
              Awesome! 🎉
            </button>
          </div>
        </div>
      )}

      {/* Beautiful Popup */}
      <BeautifulPopup
        {...popupState}
        onClose={hidePopup}
      />
    </div>
  );
};

export default TestResults;
