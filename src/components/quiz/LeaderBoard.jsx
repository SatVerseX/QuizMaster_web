import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { logger } from '../../utils/logger';
import { 
  FiAward, 
  FiUser, 
  FiClock, 
  FiArrowLeft, 
  FiTrendingUp,
  FiTarget,
  FiZap,
  FiCalendar,
  FiUsers,
  FiRefreshCw
} from 'react-icons/fi';
import { 
  FaTrophy, 
  FaCrown, 
  FaMedal, 
  FaChartLine, 
  FaHistory,
  FaStar
} from 'react-icons/fa';

const Leaderboard = ({ quizId, quizTitle, testSeriesId, onBack, isIndividualTest = false }) => {
  logger.log('LeaderBoard component rendered with props:', { quizId, quizTitle, testSeriesId, isIndividualTest });
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('best');
  const [showFilters, setShowFilters] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [stats, setStats] = useState({
    totalAttempts: 0,
    averageScore: 0,
    topScore: 0,
    participantCount: 0
  });

  useEffect(() => {
    logger.log('LeaderBoard useEffect - quizId:', quizId, 'currentUser:', currentUser?.uid, 'filter:', filter);
    
    if (!quizId) {
      logger.warn('LeaderBoard: No quizId provided');
      setError('Quiz ID is required');
      setLoading(false);
      return;
    }

    logger.log('LeaderBoard: Loading leaderboard for quizId:', quizId);
    loadLeaderboard();
  }, [quizId, currentUser, filter]);

  // Show loading state while quizId is being loaded
  if (!quizId) {
    return (
      <div className={`min-h-screen ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                isDark ? 'bg-blue-500/20' : 'bg-blue-100'
              }`}>
                <FiRefreshCw className="w-10 h-10 text-blue-500 animate-spin" />
              </div>
              <h3 className={`text-xl font-bold mb-2 ${
                isDark ? 'text-white' : 'text-blue-700'
              }`}>Loading Quiz Data...</h3>
              <p className={isDark ? 'text-blue-400' : 'text-blue-600'}>Please wait while we fetch the quiz information</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const loadLeaderboard = () => {
    setLoading(true);
    setError(null);
    setRetryCount(0);

    try {
      const q = query(
        collection(db, 'test-attempts'),
        where('testId', '==', quizId),
        orderBy('completedAt', 'asc')
      );

      const unsubscribe = onSnapshot(q, 
        (querySnapshot) => {
          const attempts = [];
          const firstAttemptsByUser = new Map();
          let totalScore = 0;
          let maxScore = 0;

          querySnapshot.forEach((doc) => {
            const attempt = { id: doc.id, ...doc.data() };
            attempts.push(attempt);
            totalScore += attempt.percentage;
            maxScore = Math.max(maxScore, attempt.percentage);

            if (!firstAttemptsByUser.has(attempt.userId)) {
              firstAttemptsByUser.set(attempt.userId, attempt);
            }
          });

          let leaderboardData;
          const firstAttempts = Array.from(firstAttemptsByUser.values());
          if (filter === 'best') {
            leaderboardData = firstAttempts
              .sort((a, b) => {
                if (a.percentage !== b.percentage) {
                  return b.percentage - a.percentage;
                }
                return a.timeSpent - b.timeSpent;
              })
              .slice(0, 10);
          } else {
            leaderboardData = firstAttempts
              .sort((a, b) => {
                const aTime = a.completedAt?.toMillis ? a.completedAt.toMillis() : new Date(a.completedAt).getTime();
                const bTime = b.completedAt?.toMillis ? b.completedAt.toMillis() : new Date(b.completedAt).getTime();
                return bTime - aTime;
              })
              .slice(0, 10);
          }

          setLeaderboard(leaderboardData);

          setStats({
            totalAttempts: attempts.length,
            averageScore: attempts.length > 0 ? Math.round(totalScore / attempts.length) : 0,
            topScore: maxScore,
            participantCount: firstAttemptsByUser.size
          });

          const userRankIndex = leaderboardData.findIndex(
            attempt => attempt.userId === currentUser?.uid
          );
          setUserRank(userRankIndex >= 0 ? userRankIndex + 1 : null);

          setLoading(false);
        },
        (err) => {
          logger.error('Error loading leaderboard:', err);
          let errorMessage = 'Failed to load leaderboard data';
          
          if (err.code === 'permission-denied') {
            errorMessage = 'Access denied. You may not have permission to view this leaderboard.';
          } else if (err.code === 'unavailable') {
            errorMessage = 'Service temporarily unavailable. Please try again later.';
          } else if (err.code === 'not-found') {
            errorMessage = 'Quiz not found. It may have been deleted or moved.';
          }
          
          setError(errorMessage);
          setLoading(false);
          
          if (err.code === 'unavailable' && retryCount < 3) {
            const delay = Math.pow(2, retryCount) * 1000;
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
              loadLeaderboard();
            }, delay);
          }
        }
      );

      return unsubscribe;
    } catch (err) {
      logger.error('Error setting up leaderboard query:', err);
      setError('Failed to initialize leaderboard');
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return (
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-yellow-500 text-white shadow-lg">
            <FaCrown className="w-7 h-7" />
          </div>
        );
      case 2:
        return (
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gray-500 text-white shadow-lg">
            <FaMedal className="w-7 h-7" />
          </div>
        );
      case 3:
        return (
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-orange-500 text-white shadow-lg">
            <FiAward className="w-7 h-7" />
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-600 border-2 border-gray-500 text-white font-bold text-lg shadow">
            {rank}
          </div>
        );
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-IN', { 
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return '';
    }
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 90) return 'text-green-500';
    if (percentage >= 80) return 'text-blue-500';
    if (percentage >= 70) return 'text-purple-500';
    if (percentage >= 60) return 'text-yellow-500';
    return 'text-orange-500';
  };

  const getScoreBg = (percentage) => {
    if (percentage >= 90) return 'bg-green-50 border-green-200';
    if (percentage >= 80) return 'bg-blue-50 border-blue-200';
    if (percentage >= 70) return 'bg-purple-50 border-purple-200';
    if (percentage >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-orange-50 border-orange-200';
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
              <h3 className={`text-xl font-bold mb-2 ${
                isDark ? 'text-white' : 'text-slate-800'
              }`}>Loading Leaderboard</h3>
              <p className={isDark ? 'text-gray-400' : 'text-slate-600'}>Fetching top performers...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                isDark ? 'bg-red-500/20' : 'bg-red-100'
              }`}>
                <FiZap className="w-10 h-10 text-red-400" />
              </div>
              <h3 className={`text-xl font-bold mb-2 ${
                isDark ? 'text-white' : 'text-red-700'
              }`}>Error Loading Leaderboard</h3>
              <p className={isDark ? 'text-red-400' : 'text-red-600'}>{error}</p>
              {error === 'Quiz ID is required' && (
                <div className="text-sm mt-2 space-y-2">
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    This usually happens when the quiz data hasn't loaded yet. Please wait a moment or refresh the page.
                  </p>
                  <p className={`${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    If the problem persists, try going back and selecting the quiz again.
                  </p>
                </div>
              )}
              <button
                onClick={loadLeaderboard}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition-colors flex items-center gap-2 mx-auto"
              >
                <FiRefreshCw className="w-4 h-4" />
                Try Again
                {retryCount > 0 && (
                  <span className="text-xs bg-red-700 px-2 py-1 rounded-full">
                    {retryCount}/3
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:p-6 text-xs sm:text-sm md:text-base">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 md:mb-8">
          
          
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-yellow-500">
              Leaderboard
            </h1>
            <p className={`text-sm md:text-base ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>{quizTitle}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className={`border rounded-xl p-6 text-center ${
            isDark 
              ? 'bg-gray-800 border-yellow-500/30'
              : 'bg-white border-yellow-200'
          }`}>
            <FaTrophy className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
            <div className={`text-xl md:text-2xl font-bold ${
              isDark ? 'text-yellow-400' : 'text-yellow-600'
            }`}>{stats.topScore}%</div>
            <div className={`text-sm ${
              isDark ? 'text-yellow-300' : 'text-yellow-500'
            }`}>Top Score</div>
          </div>
          
          <div className={`border rounded-xl p-6 text-center ${
            isDark 
              ? 'bg-gray-800 border-blue-500/30'
              : 'bg-white border-blue-200'
          }`}>
            <FiUsers className="w-8 h-8 text-blue-500 mx-auto mb-3" />
            <div className={`text-xl md:text-2xl font-bold ${
              isDark ? 'text-blue-400' : 'text-blue-600'
            }`}>{stats.participantCount}</div>
            <div className={`text-sm ${
              isDark ? 'text-blue-300' : 'text-blue-500'
            }`}>Participants</div>
          </div>
          
          <div className={`border rounded-xl p-6 text-center ${
            isDark 
              ? 'bg-gray-800 border-purple-500/30'
              : 'bg-white border-purple-200'
          }`}>
            <FiTarget className="w-8 h-8 text-purple-500 mx-auto mb-3" />
            <div className={`text-xl md:text-2xl font-bold ${
              isDark ? 'text-purple-400' : 'text-purple-600'
            }`}>{stats.averageScore}%</div>
            <div className={`text-sm ${
              isDark ? 'text-purple-300' : 'text-purple-500'
            }`}>Average Score</div>
          </div>
          
          <div className={`border rounded-xl p-6 text-center ${
            isDark 
              ? 'bg-gray-800 border-green-500/30'
              : 'bg-white border-green-200'
          }`}>
            <FiTrendingUp className="w-8 h-8 text-green-500 mx-auto mb-3" />
            <div className={`text-xl md:text-2xl font-bold ${
              isDark ? 'text-green-400' : 'text-green-600'
            }`}>{stats.totalAttempts}</div>
            <div className={`text-sm ${
              isDark ? 'text-green-300' : 'text-green-500'
            }`}>Total Attempts</div>
          </div>
        </div>

        {/* Main Leaderboard Card */}
        <div className={`border rounded-2xl shadow-lg overflow-hidden ${
          isDark 
            ? 'bg-gray-800 border-gray-600'
            : 'bg-white border-gray-200'
        }`}>
          {/* Header */}
          <div className={`border-b p-5 md:p-8 ${
            isDark 
              ? 'bg-yellow-500/10 border-gray-600'
              : 'bg-yellow-50 border-gray-200'
          }`}>
            <div className="text-center">
              <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto shadow-lg mb-6">
                <FaTrophy className="w-10 h-10 text-white" />
              </div>
              
              <h2 className={`text-xl md:text-2xl font-bold mb-3 md:mb-4 ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>Hall of Fame</h2>
              
              {userRank && (
                <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full ${
                  isDark 
                    ? 'bg-blue-500/20 border border-blue-500/30'
                    : 'bg-blue-100 border border-blue-200'
                }`}>
                  <FiUser className="w-5 h-5 text-blue-500" />
                  <span className={`font-bold ${
                    isDark ? 'text-white' : 'text-blue-700'
                  }`}>Your Rank: #{userRank}</span>
                </div>
              )}
            </div>
            
            {/* Filter Buttons */}
            <div className="mt-6 md:mt-8 flex flex-wrap justify-center gap-3 md:gap-4">
              <button
                onClick={() => setFilter('best')}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold transition-colors ${
                  filter === 'best' 
                    ? 'bg-yellow-500 text-white shadow-lg'
                    : isDark 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                <FaChartLine className="w-5 h-5" />
                Best Scores
              </button>
              
              <button
                onClick={() => setFilter('recent')}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold transition-colors ${
                  filter === 'recent' 
                    ? 'bg-yellow-500 text-white shadow-lg'
                    : isDark 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                <FaHistory className="w-5 h-5" />
                Recent Attempts
              </button>
            </div>
          </div>

          {/* Leaderboard Content */}
          <div className="p-4 md:p-8">
            {leaderboard.length === 0 ? (
              <div className="text-center py-16">
                <div className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 ${
                  isDark ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <FaTrophy className="w-16 h-16 text-gray-500" />
                </div>
                <h3 className={`text-2xl font-bold mb-4 ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>No Attempts Yet</h3>
                <p className={`text-lg ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Be the first to take this test and claim the crown! 👑
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Top 3 Podium */}
                {leaderboard.length >= 3 && filter === 'best' && (
                  <div className="grid grid-cols-3 gap-3 md:gap-4 mt-3 md:mt-4 mb-8 md:mb-12">
                    {/* 2nd Place */}
                    <div className="text-center">
                      <div className="relative mb-4">
                        <div className="w-14 h-14 md:w-20 md:h-20 bg-gray-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                          <span className="text-lg md:text-2xl font-bold text-white">2</span>
                        </div>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                          {leaderboard[1]?.percentage}%
                        </div>
                      </div>
                      <h4
                        className={`font-bold text-sm sm:text-base truncate max-w-[140px] sm:max-w-[200px] mx-auto ${
                          isDark ? 'text-white' : 'text-gray-800'
                        }`}
                        title={leaderboard[1]?.userName || 'Anonymous'}
                      >
                        {leaderboard[1]?.userName || 'Anonymous'}
                      </h4>
                    </div>

                    {/* 1st Place */}
                    <div className="text-center">
                      <div className="relative mb-4">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                          <FaCrown className="text-lg md:text-2xl text-white" />
                        </div>
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                          <FaStar className="text-yellow-400" />
                        </div>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                          {leaderboard[0]?.percentage}%
                        </div>
                      </div>
                      <h4
                        className="text-yellow-400 font-bold text-base sm:text-lg truncate max-w-[160px] sm:max-w-[220px] mx-auto"
                        title={leaderboard[0]?.userName || 'Anonymous'}
                      >
                        {leaderboard[0]?.userName || 'Anonymous'}
                      </h4>
                      <p className="text-yellow-300 text-sm">👑 Champion</p>
                    </div>

                    {/* 3rd Place */}
                    <div className="text-center">
                      <div className="relative mb-4">
                        <div className="w-14 h-14 md:w-20 md:h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                          <span className="text-lg md:text-2xl font-bold text-white">3</span>
                        </div>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                          {leaderboard[2]?.percentage}%
                        </div>
                      </div>
                      <h4
                        className={`font-bold text-sm sm:text-base truncate max-w-[140px] sm:max-w-[200px] mx-auto ${
                          isDark ? 'text-white' : 'text-gray-800'
                        }`}
                        title={leaderboard[2]?.userName || 'Anonymous'}
                      >
                        {leaderboard[2]?.userName || 'Anonymous'}
                      </h4>
                    </div>
                  </div>
                )}

                {/* Full Leaderboard List */}
                <div className="space-y-3">
                  {leaderboard.map((attempt, index) => {
                    const rank = index + 1;
                    const isCurrentUser = attempt.userId === currentUser?.uid;
                    
                    return (
                      <div
                        key={attempt.id}
                        className={`rounded-xl border transition-all duration-200 hover:scale-[1.01] ${
                          isCurrentUser 
                            ? isDark
                              ? 'bg-blue-500/20 border-blue-500'
                              : 'bg-blue-50 border-blue-300'
                            : rank <= 3
                              ? `${getScoreBg(attempt.percentage)} border`
                              : isDark
                                ? 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="p-3 md:p-6">
                          <div className="flex items-center gap-6">
                            {/* Rank */}
                            <div className="flex-shrink-0">
                              <div className="md:block hidden">{getRankIcon(rank)}</div>
                              <div className="md:hidden block">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-600 border-2 border-gray-500 text-white font-bold text-base">
                                  {rank}
                                </div>
                              </div>
                            </div>
                            
                            {/* Player Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <h3
                                  className={`text-lg md:text-xl font-bold truncate max-w-[160px] sm:max-w-[220px] md:max-w-none ${
                                  isCurrentUser 
                                    ? isDark ? 'text-blue-400' : 'text-blue-700'
                                    : isDark ? 'text-white' : 'text-gray-800'
                                  }`}
                                  title={attempt.userName || 'Anonymous'}
                                >
                                  {attempt.userName || 'Anonymous'}
                                </h3>
                                {isCurrentUser && (
                                  <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-bold">
                                    YOU
                                  </span>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <FiTarget className="w-4 h-4 text-gray-400" />
                                  <span className={`font-bold ${getScoreColor(attempt.percentage)}`}>
                                    {attempt.percentage}%
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <FiClock className="w-4 h-4 text-gray-400" />
                                  <span className={`font-mono ${
                                    isDark ? 'text-gray-300' : 'text-gray-600'
                                  }`}>
                                    {formatTime(attempt.timeSpent)}
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <FiAward className="w-4 h-4 text-gray-400" />
                                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                                    {attempt.score}/{attempt.totalQuestions}
                                  </span>
                                </div>
                                
                                {filter === 'recent' && attempt.completedAt && (
                                  <div className="flex items-center gap-2">
                                    <FiCalendar className="w-4 h-4 text-gray-400" />
                                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                                      {formatDate(attempt.completedAt)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Score Badge */}
                            <div className={`flex-shrink-0 px-4 py-2 rounded-xl border ${getScoreBg(attempt.percentage)}`}>
                              <div className={`text-xl md:text-2xl font-bold ${getScoreColor(attempt.percentage)}`}>
                                {attempt.percentage}%
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
