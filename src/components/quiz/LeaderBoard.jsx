import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FiAward, 
  FiUser, 
  FiClock, 
  FiArrowLeft, 
  FiFilter, 
  FiChevronDown,
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
  FaFire,
  FaGem,
  FaRocket,
  FaStar
} from 'react-icons/fa';

const Leaderboard = ({ quizId, quizTitle, testSeriesId, onBack, isIndividualTest = false }) => {
  const { currentUser } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('best');
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    totalAttempts: 0,
    averageScore: 0,
    topScore: 0,
    participantCount: 0
  });

  useEffect(() => {
    if (!quizId) {
      setError('Quiz ID is required');
      setLoading(false);
      return;
    }

    loadLeaderboard();
  }, [quizId, currentUser, filter]);

  const loadLeaderboard = () => {
    setLoading(true);
    setError(null);

    try {
      // Updated to use 'test-attempts' collection for consistency
      let q;
      if (filter === 'best') {
        q = query(
          collection(db, 'test-attempts'),
          where('testId', '==', quizId),
          orderBy('percentage', 'desc'),
          orderBy('timeSpent', 'asc'),
          limit(100)
        );
      } else {
        q = query(
          collection(db, 'test-attempts'),
          where('testId', '==', quizId),
          orderBy('completedAt', 'desc'),
          limit(100)
        );
      }

      const unsubscribe = onSnapshot(q, 
        (querySnapshot) => {
          const attempts = [];
          const userAttempts = new Map();
          let totalScore = 0;
          let maxScore = 0;

          querySnapshot.forEach((doc) => {
            const attempt = { id: doc.id, ...doc.data() };
            attempts.push(attempt);
            totalScore += attempt.percentage;
            maxScore = Math.max(maxScore, attempt.percentage);

            // Track best attempt per user for 'best' filter
            if (filter === 'best') {
              const existing = userAttempts.get(attempt.userId);
              if (!existing || 
                  attempt.percentage > existing.percentage || 
                  (attempt.percentage === existing.percentage && attempt.timeSpent < existing.timeSpent)) {
                userAttempts.set(attempt.userId, attempt);
              }
            }
          });

          // Prepare leaderboard data
          let leaderboardData;
          if (filter === 'best') {
            leaderboardData = Array.from(userAttempts.values()).sort((a, b) => {
              if (a.percentage !== b.percentage) {
                return b.percentage - a.percentage;
              }
              return a.timeSpent - b.timeSpent;
            });
          } else {
            leaderboardData = attempts;
          }

          setLeaderboard(leaderboardData);

          // Calculate stats
          setStats({
            totalAttempts: attempts.length,
            averageScore: attempts.length > 0 ? Math.round(totalScore / attempts.length) : 0,
            topScore: maxScore,
            participantCount: new Set(attempts.map(a => a.userId)).size
          });

          // Find user rank
          const userRankIndex = leaderboardData.findIndex(
            attempt => attempt.userId === currentUser?.uid
          );
          setUserRank(userRankIndex >= 0 ? userRankIndex + 1 : null);

          setLoading(false);
        },
        (err) => {
          console.error('Error loading leaderboard:', err);
          setError('Failed to load leaderboard data');
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (err) {
      console.error('Error setting up leaderboard query:', err);
      setError('Failed to initialize leaderboard');
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return (
          <div className="relative">
            <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 opacity-30 blur-lg animate-pulse"></div>
            <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 text-white shadow-2xl shadow-yellow-500/40">
              <FaCrown className="w-7 h-7" />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="relative">
            <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 opacity-30 blur-lg"></div>
            <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 text-white shadow-2xl shadow-gray-500/40">
              <FaMedal className="w-7 h-7" />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="relative">
            <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 opacity-30 blur-lg"></div>
            <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 text-white shadow-2xl shadow-orange-500/40">
              <FiAward className="w-7 h-7" />
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 border-2 border-gray-500 text-white font-bold text-lg shadow-lg">
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
    if (percentage >= 90) return 'from-green-500/10 to-emerald-500/10 border-green-500/20';
    if (percentage >= 80) return 'from-blue-500/10 to-blue-600/10 border-blue-500/20';
    if (percentage >= 70) return 'from-purple-500/10 to-purple-600/10 border-purple-500/20';
    if (percentage >= 60) return 'from-yellow-500/10 to-yellow-600/10 border-yellow-500/20';
    return 'from-orange-500/10 to-orange-600/10 border-orange-500/20';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-yellow-500 border-t-transparent animate-spin"></div>
                <div className="absolute inset-3 rounded-full border-4 border-yellow-300 border-t-transparent animate-spin animate-reverse"></div>
                <div className="absolute inset-6 rounded-full border-2 border-yellow-200 border-t-transparent animate-spin"></div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Loading Leaderboard</h3>
              <p className="text-gray-400">Fetching top performers...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiZap className="w-10 h-10 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Error Loading Leaderboard</h3>
              <p className="text-red-400 mb-6">{error}</p>
              <button
                onClick={loadLeaderboard}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition-colors flex items-center gap-2 mx-auto"
              >
                <FiRefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20">
      <div className="max-w-6xl mx-auto p-6">
        {/* Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Header */}
        <div className="relative z-10 flex items-center gap-4 mb-8">
          {onBack && (
            <button 
              onClick={onBack}
              className="group bg-gray-800/60 hover:bg-gray-700/60 border border-gray-600/40 text-gray-300 hover:text-white rounded-2xl px-4 py-3 transition-all duration-300 flex items-center gap-2"
            >
              <FiArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              Back
            </button>
          )}
          
          <div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600">
              Leaderboard
            </h1>
            <p className="text-gray-400 text-lg">{quizTitle}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 backdrop-blur-xl border border-yellow-500/30 rounded-2xl p-6 text-center">
            <FaTrophy className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-yellow-300">{stats.topScore}%</div>
            <div className="text-yellow-200 text-sm">Top Score</div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6 text-center">
            <FiUsers className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-blue-300">{stats.participantCount}</div>
            <div className="text-blue-200 text-sm">Participants</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 text-center">
            <FiTarget className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-purple-300">{stats.averageScore}%</div>
            <div className="text-purple-200 text-sm">Average Score</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6 text-center">
            <FiTrendingUp className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-green-300">{stats.totalAttempts}</div>
            <div className="text-green-200 text-sm">Total Attempts</div>
          </div>
        </div>

        {/* Main Leaderboard Card */}
        <div className="relative z-10 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-gray-600/40 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-yellow-500/20 border-b border-gray-600/40 p-8">
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-yellow-500/30">
                  <FaTrophy className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full blur-xl animate-pulse"></div>
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-4">Hall of Fame</h2>
              
              {userRank && (
                <div className="inline-flex items-center gap-3 bg-blue-500/20 border border-blue-500/30 backdrop-blur-sm px-6 py-3 rounded-full">
                  <FiUser className="w-5 h-5 text-blue-400" />
                  <span className="text-white font-bold">Your Rank: #{userRank}</span>
                </div>
              )}
            </div>
            
            {/* Filter Buttons */}
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button
                onClick={() => setFilter('best')}
                className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-bold transition-all duration-300 ${
                  filter === 'best' 
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/30'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                }`}
              >
                <FaChartLine className="w-5 h-5" />
                Best Scores
              </button>
              
              <button
                onClick={() => setFilter('recent')}
                className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-bold transition-all duration-300 ${
                  filter === 'recent' 
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/30'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                }`}
              >
                <FaHistory className="w-5 h-5" />
                Recent Attempts
              </button>
            </div>
          </div>

          {/* Leaderboard Content */}
          <div className="p-8">
            {leaderboard.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-32 h-32 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaTrophy className="w-16 h-16 text-gray-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">No Attempts Yet</h3>
                <p className="text-gray-400 text-lg">
                  Be the first to take this test and claim the crown! 👑
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Top 3 Podium */}
                {leaderboard.length >= 3 && filter === 'best' && (
                  <div className="grid grid-cols-3 gap-4 mb-12">
                    {/* 2nd Place */}
                    <div className="text-center">
                      <div className="relative mb-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center mx-auto shadow-xl">
                          <span className="text-2xl font-bold text-white">2</span>
                        </div>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                          {leaderboard[1]?.percentage}%
                        </div>
                      </div>
                      <h4 className="text-white font-bold">{leaderboard[1]?.userName || 'Anonymous'}</h4>
                    </div>

                    {/* 1st Place */}
                    <div className="text-center -mt-8">
                      <div className="relative mb-4">
                        <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-yellow-500/50">
                          <FaCrown className="text-3xl text-white" />
                        </div>
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                          <FaStar className="text-yellow-300 animate-pulse" />
                        </div>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                          {leaderboard[0]?.percentage}%
                        </div>
                      </div>
                      <h4 className="text-yellow-300 font-bold text-lg">{leaderboard[0]?.userName || 'Anonymous'}</h4>
                      <p className="text-yellow-200 text-sm">👑 Champion</p>
                    </div>

                    {/* 3rd Place */}
                    <div className="text-center">
                      <div className="relative mb-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto shadow-xl">
                          <span className="text-2xl font-bold text-white">3</span>
                        </div>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                          {leaderboard[2]?.percentage}%
                        </div>
                      </div>
                      <h4 className="text-white font-bold">{leaderboard[2]?.userName || 'Anonymous'}</h4>
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
                        className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:scale-[1.02] ${
                          isCurrentUser 
                            ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 border-blue-500/40 shadow-lg shadow-blue-500/20' 
                            : rank <= 3
                              ? `bg-gradient-to-r ${getScoreBg(attempt.percentage)} border`
                              : 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-800/70'
                        }`}
                      >
                        <div className="p-6">
                          <div className="flex items-center gap-6">
                            {/* Rank */}
                            <div className="flex-shrink-0">
                              {getRankIcon(rank)}
                            </div>
                            
                            {/* Player Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className={`text-xl font-bold truncate ${
                                  isCurrentUser ? 'text-blue-300' : 'text-white'
                                }`}>
                                  {attempt.userName || 'Anonymous'}
                                </h3>
                                {isCurrentUser && (
                                  <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-sm">
                                    YOU
                                  </span>
                                )}
                                {rank <= 3 && (
                                  <div className="flex gap-1">
                                    {[...Array(4 - rank)].map((_, i) => (
                                      <FaStar key={i} className="w-4 h-4 text-yellow-400" />
                                    ))}
                                  </div>
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
                                  <span className="text-gray-300 font-mono">
                                    {formatTime(attempt.timeSpent)}
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <FiAward className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-300">
                                    {attempt.score}/{attempt.totalQuestions}
                                  </span>
                                </div>
                                
                                {filter === 'recent' && attempt.completedAt && (
                                  <div className="flex items-center gap-2">
                                    <FiCalendar className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-300">
                                      {formatDate(attempt.completedAt)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Score Badge */}
                            <div className={`flex-shrink-0 px-4 py-2 rounded-xl border ${getScoreBg(attempt.percentage)}`}>
                              <div className={`text-2xl font-bold ${getScoreColor(attempt.percentage)}`}>
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
