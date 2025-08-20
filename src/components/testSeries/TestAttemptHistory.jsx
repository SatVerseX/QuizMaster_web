import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  limit 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { 
  FiClock, 
  FiTarget, 
  FiTrendingUp,
  FiCalendar,
  FiBookOpen,
  FiAward,
  FiBarChart2,
  FiSearch,
  FiArrowLeft,
  FiEye,
  FiFilter,
  FiChevronDown,
  FiActivity,
  FiStar,
  FiZap,
  FiTrendingDown,
  FiRefreshCw,
  FiDownload,
  FiShare2,
  FiMoreVertical,
  FiX,
  FiMenu
} from 'react-icons/fi';
import { 
  FaRobot, 
  FaChartLine, 
  FaGraduationCap, 
  FaTrophy, 
  FaBrain, 
  FaMedal,
  FaFire,
  FaGem,
  FaCrown 
} from 'react-icons/fa';

const TestAttemptHistory = ({ onBack, onViewAttempt }) => {
  const { currentUser } = useAuth();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [showStatsDetails, setShowStatsDetails] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'test-attempts'),
      where('userId', '==', currentUser.uid),
      orderBy('completedAt', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const attemptsData = [];
      querySnapshot.forEach((doc) => {
        attemptsData.push({ id: doc.id, ...doc.data() });
      });
      setAttempts(attemptsData);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  const filteredAttempts = attempts
    .filter(attempt => {
      const matchesSearch = attempt.testTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           attempt.testSeriesTitle?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filter === 'ai') return matchesSearch && attempt.isAIGenerated;
      if (filter === 'manual') return matchesSearch && !attempt.isAIGenerated;
      if (filter === 'high-score') return matchesSearch && attempt.percentage >= 80;
      if (filter === 'low-score') return matchesSearch && attempt.percentage < 60;
      if (filter === 'recent-week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return matchesSearch && attempt.completedAt?.toDate() >= weekAgo;
      }
      
      return matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'score-high':
          return b.percentage - a.percentage;
        case 'score-low':
          return a.percentage - b.percentage;
        case 'duration-short':
          return a.timeSpent - b.timeSpent;
        case 'duration-long':
          return b.timeSpent - a.timeSpent;
        case 'recent':
        default:
          return b.completedAt?.toDate() - a.completedAt?.toDate();
      }
    });

  const getScoreColor = (percentage) => {
    if (percentage >= 90) return 'from-emerald-500 to-green-500';
    if (percentage >= 80) return 'from-blue-500 to-cyan-500';
    if (percentage >= 70) return 'from-purple-500 to-violet-500';
    if (percentage >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const getScoreTextColor = (percentage) => {
    if (percentage >= 90) return 'text-emerald-300';
    if (percentage >= 80) return 'text-blue-300';
    if (percentage >= 70) return 'text-purple-300';
    if (percentage >= 60) return 'text-yellow-300';
    return 'text-red-300';
  };

  const getScoreBg = (percentage) => {
    if (percentage >= 90) return 'bg-emerald-500/20 border-emerald-500/30';
    if (percentage >= 80) return 'bg-blue-500/20 border-blue-500/30';
    if (percentage >= 70) return 'bg-purple-500/20 border-purple-500/30';
    if (percentage >= 60) return 'bg-yellow-500/20 border-yellow-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  const getPerformanceIcon = (percentage) => {
    if (percentage >= 90) return <FaCrown className="w-5 h-5 text-yellow-400" />;
    if (percentage >= 80) return <FaTrophy className="w-5 h-5 text-blue-400" />;
    if (percentage >= 70) return <FaMedal className="w-5 h-5 text-purple-400" />;
    if (percentage >= 60) return <FaGem className="w-5 h-5 text-yellow-400" />;
    return <FaFire className="w-5 h-5 text-orange-400" />;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate();
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getStats = () => {
    if (attempts.length === 0) return { 
      avgScore: 0, 
      totalTests: 0, 
      bestScore: 0, 
      recentTrend: 0,
      totalTime: 0,
      streak: 0,
      improvement: 0
    };
    
    const totalScore = attempts.reduce((sum, attempt) => sum + attempt.percentage, 0);
    const avgScore = Math.round(totalScore / attempts.length);
    const bestScore = Math.max(...attempts.map(attempt => attempt.percentage));
    const totalTime = attempts.reduce((sum, attempt) => sum + (attempt.timeSpent || 0), 0);
    
    // Calculate recent trend (last 5 vs previous 5)
    const recent5 = attempts.slice(0, 5);
    const previous5 = attempts.slice(5, 10);
    const recentAvg = recent5.length > 0 ? recent5.reduce((sum, a) => sum + a.percentage, 0) / recent5.length : 0;
    const previousAvg = previous5.length > 0 ? previous5.reduce((sum, a) => sum + a.percentage, 0) / previous5.length : 0;
    const recentTrend = recentAvg - previousAvg;
    
    // Calculate current streak (consecutive days with tests)
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < attempts.length; i++) {
      const attemptDate = attempts[i].completedAt?.toDate();
      if (attemptDate) {
        attemptDate.setHours(0, 0, 0, 0);
        const daysDiff = Math.floor((today - attemptDate) / (1000 * 60 * 60 * 24));
        if (daysDiff === streak) {
          streak++;
        } else {
          break;
        }
      }
    }
    
    return {
      avgScore,
      totalTests: attempts.length,
      bestScore,
      recentTrend: Math.round(recentTrend),
      totalTime: Math.round(totalTime / 60), // in minutes
      streak,
      improvement: recentTrend
    };
  };

  const stats = getStats();

  const exportData = () => {
    const dataStr = JSON.stringify(filteredAttempts, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `test-history-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/10 to-purple-900/10">
        <div className="max-w-7xl mx-auto p-3 sm:p-6">
          {/* Animated Background Elements */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="relative z-10 animate-pulse space-y-6 sm:space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-10 sm:h-12 bg-gray-700/50 rounded-xl w-24 sm:w-32"></div>
              <div>
                <div className="h-8 sm:h-10 bg-gray-700/50 rounded-lg w-60 sm:w-80 mb-2"></div>
                <div className="h-4 sm:h-6 bg-gray-700/30 rounded w-80 sm:w-96"></div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 sm:h-32 bg-gray-700/30 rounded-2xl sm:rounded-3xl"></div>
              ))}
            </div>

            <div className="h-20 sm:h-24 bg-gray-700/30 rounded-2xl sm:rounded-3xl"></div>
            <div className="space-y-4 sm:space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 sm:h-40 bg-gray-700/30 rounded-xl sm:rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/10 to-purple-900/10">
      <div className="max-w-7xl mx-auto p-3 sm:p-6">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
        </div>

        {/* Mobile-Optimized Enhanced Header */}
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-8 sm:mb-12">
          <button
            onClick={onBack}
            className="group bg-gradient-to-r from-gray-800/80 to-gray-700/80 backdrop-blur-xl border border-gray-600/40 text-gray-300 rounded-xl px-4 sm:px-6 py-2 sm:py-3 text-sm font-medium hover:from-gray-700/80 hover:to-gray-600/80 transition-all duration-300 flex items-center gap-2 sm:gap-3 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <FiArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:-translate-x-1" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </button>
          
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl">
              <FaChartLine className="w-6 h-6 sm:w-10 sm:h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-purple-200 mb-1 sm:mb-2 leading-tight">
                Test Performance
              </h1>
              <p className="text-lg sm:text-xl text-gray-400 flex items-center gap-2">
                <FiActivity className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                <span className="hidden sm:inline">Track your progress and achievements across all assessments</span>
                <span className="sm:hidden">Track your progress</span>
              </p>
            </div>
          </div>

          {/* Mobile Action Buttons */}
          <div className="flex gap-2 sm:hidden ml-auto">
            <button
              onClick={() => setShowStatsDetails(!showStatsDetails)}
              className="p-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg"
            >
              <FiBarChart2 className="w-4 h-4" />
            </button>
            <button
              onClick={exportData}
              className="p-2 bg-green-500/20 border border-green-500/30 text-green-300 rounded-lg"
            >
              <FiDownload className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile-Optimized Enhanced Stats Cards */}
        <div className={`relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-8 mb-8 sm:mb-12 ${showStatsDetails ? 'block' : 'hidden sm:grid'}`}>
          <div className="group relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border border-gray-600/40 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xl sm:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:scale-105 hover:border-blue-500/30">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/5 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl sm:shadow-2xl">
                <FiBookOpen className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="text-center sm:text-left">
                <div className="text-2xl sm:text-3xl font-black text-blue-300 mb-0 sm:mb-1">
                  {stats.totalTests}
                </div>
                <div className="text-blue-200 font-semibold text-xs sm:text-base">
                  Total Tests
                </div>
              </div>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border border-gray-600/40 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xl sm:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 hover:scale-105 hover:border-emerald-500/30">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl sm:shadow-2xl">
                <FiTarget className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="text-center sm:text-left">
                <div className="text-2xl sm:text-3xl font-black text-emerald-300 mb-0 sm:mb-1">
                  {stats.avgScore}%
                </div>
                <div className="text-emerald-200 font-semibold text-xs sm:text-base">
                  Average Score
                </div>
              </div>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border border-gray-600/40 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xl sm:shadow-2xl hover:shadow-yellow-500/10 transition-all duration-500 hover:scale-105 hover:border-yellow-500/30">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl sm:shadow-2xl">
                <FaTrophy className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="text-center sm:text-left">
                <div className="text-2xl sm:text-3xl font-black text-yellow-300 mb-0 sm:mb-1">
                  {stats.bestScore}%
                </div>
                <div className="text-yellow-200 font-semibold text-xs sm:text-base">
                  Best Score
                </div>
              </div>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border border-gray-600/40 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xl sm:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 hover:scale-105 hover:border-purple-500/30">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-violet-500/5 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl sm:shadow-2xl">
                {stats.recentTrend >= 0 ? (
                  <FiTrendingUp className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
                ) : (
                  <FiTrendingDown className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
                )}
              </div>
              <div className="text-center sm:text-left">
                <div className={`text-2xl sm:text-3xl font-black mb-0 sm:mb-1 ${stats.recentTrend >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                  {stats.recentTrend > 0 ? '+' : ''}{stats.recentTrend}%
                </div>
                <div className="text-purple-200 font-semibold text-xs sm:text-base">
                  Recent Trend
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-Optimized Enhanced Filters and Search */}
        <div className="relative z-10 mb-8 sm:mb-12">
          <div className="bg-gradient-to-r from-gray-800/60 to-gray-700/60 backdrop-blur-xl border border-gray-600/40 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xl sm:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-blue-500/5 rounded-2xl sm:rounded-3xl"></div>
            
            {/* Mobile Filter Toggle */}
            <div className="sm:hidden relative mb-4">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="w-full flex items-center justify-between p-3 bg-gray-900/60 rounded-xl border border-gray-600/40 text-white"
              >
                <span className="flex items-center gap-2">
                  <FiFilter className="w-4 h-4" />
                  Filters & Search
                </span>
                <FiChevronDown className={`w-4 h-4 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            <div className={`relative ${showMobileFilters ? 'block' : 'hidden'} sm:block`}>
              <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <FiSearch className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search tests by title or series..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 sm:pl-14 pr-4 sm:pr-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-gray-900/60 backdrop-blur-sm border border-gray-600/40 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 font-medium text-base sm:text-lg"
                  />
                </div>

                {/* Filter Dropdown */}
                <div className="relative">
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="appearance-none px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-gray-900/60 backdrop-blur-sm border border-gray-600/40 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 font-medium pr-10 sm:pr-12 min-w-[160px] sm:min-w-[200px] text-sm sm:text-base"
                  >
                    <option value="all">All Tests</option>
                    <option value="recent-week">This Week</option>
                    <option value="high-score">Excellent (80%+)</option>
                    <option value="low-score">Needs Work (&lt;60%)</option>
                    <option value="ai">AI Generated</option>
                    <option value="manual">Manual Tests</option>
                  </select>
                  <FiFilter className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-gray-900/60 backdrop-blur-sm border border-gray-600/40 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 font-medium pr-10 sm:pr-12 min-w-[140px] sm:min-w-[180px] text-sm sm:text-base"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="score-high">Highest Score</option>
                    <option value="score-low">Lowest Score</option>
                    <option value="duration-short">Fastest</option>
                    <option value="duration-long">Longest</option>
                  </select>
                  <FiChevronDown className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-Optimized Enhanced Attempts List */}
        <div className="relative z-10">
          <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border border-gray-600/40 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xl sm:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-2xl sm:rounded-3xl"></div>
            
            <div className="relative">
              {filteredAttempts.length > 0 ? (
                <div className="space-y-4 sm:space-y-6">
                  {filteredAttempts.map((attempt, index) => (
                    <div 
                      key={attempt.id} 
                      className="group relative bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl border border-gray-600/30 rounded-xl sm:rounded-2xl p-4 sm:p-8 hover:shadow-xl sm:hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:scale-[1.02] hover:border-blue-500/30"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="relative">
                        {/* Mobile Layout */}
                        <div className="sm:hidden">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                                  <FaBrain className="w-4 h-4 text-blue-400" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-lg font-bold text-white leading-tight">
                                    {attempt.testTitle}
                                  </h3>
                                  <p className="text-sm text-gray-400">
                                    {attempt.testSeriesTitle}
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <div className={`px-3 py-1 rounded-lg backdrop-blur-sm border ${getScoreBg(attempt.percentage)}`}>
                                <div className={`text-lg font-bold ${getScoreTextColor(attempt.percentage)}`}>
                                  {attempt.percentage}%
                                </div>
                              </div>
                              {getPerformanceIcon(attempt.percentage)}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="text-center p-2 bg-blue-500/10 rounded-lg">
                              <div className="text-sm font-semibold text-blue-300">
                                {formatDate(attempt.completedAt)}
                              </div>
                              <div className="text-xs text-blue-200">Date</div>
                            </div>
                            <div className="text-center p-2 bg-emerald-500/10 rounded-lg">
                              <div className="text-sm font-semibold text-emerald-300">
                                {formatDuration(attempt.timeSpent)}
                              </div>
                              <div className="text-xs text-emerald-200">Duration</div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-gray-300">
                                {attempt.score}/{attempt.totalQuestions} correct
                              </span>
                              {attempt.isAIGenerated && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 rounded-full">
                                  <FaRobot className="w-3 h-3 text-purple-400" />
                                  <span className="text-xs text-purple-300">AI</span>
                                </div>
                              )}
                            </div>
                            
                            <button
                              onClick={() => onViewAttempt && onViewAttempt(attempt)}
                              className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors border border-blue-500/30"
                            >
                              <FiEye className="w-4 h-4 text-blue-400" />
                            </button>
                          </div>
                        </div>

                        {/* Desktop Layout */}
                        <div className="hidden sm:block">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-blue-500/30">
                                  <FaBrain className="w-6 h-6 text-blue-400" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-xl font-bold text-white group-hover:text-blue-200 transition-colors">
                                      {attempt.testTitle}
                                    </h3>
                                    {attempt.isAIGenerated && (
                                      <div className="px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-full border border-purple-500/30 flex items-center gap-2">
                                        <FaRobot className="w-3 h-3 text-purple-400" />
                                        <span className="text-xs font-semibold text-purple-300">AI Generated</span>
                                      </div>
                                    )}
                                  </div>
                                  <p className="text-gray-400 font-medium">
                                    {attempt.testSeriesTitle}
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="flex items-center gap-3 px-4 py-3 bg-blue-500/10 rounded-xl">
                                  <FiCalendar className="w-5 h-5 text-blue-400" />
                                  <div>
                                    <div className="text-sm font-semibold text-blue-300">
                                      {formatDate(attempt.completedAt)}
                                    </div>
                                    <div className="text-xs text-blue-200">Date Taken</div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 px-4 py-3 bg-emerald-500/10 rounded-xl">
                                  <FiClock className="w-5 h-5 text-emerald-400" />
                                  <div>
                                    <div className="text-sm font-semibold text-emerald-300">
                                      {formatDuration(attempt.timeSpent)}
                                    </div>
                                    <div className="text-xs text-emerald-200">Duration</div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 px-4 py-3 bg-purple-500/10 rounded-xl">
                                  <FiBookOpen className="w-5 h-5 text-purple-400" />
                                  <div>
                                    <div className="text-sm font-semibold text-purple-300">
                                      {attempt.score}/{attempt.totalQuestions}
                                    </div>
                                    <div className="text-xs text-purple-200">Correct</div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 px-4 py-3 bg-orange-500/10 rounded-xl">
                                  <FiZap className="w-5 h-5 text-orange-400" />
                                  <div>
                                    <div className="text-sm font-semibold text-orange-300 capitalize">
                                      {attempt.difficulty || 'Medium'}
                                    </div>
                                    <div className="text-xs text-orange-200">Level</div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-6">
                              {/* Enhanced Score Display */}
                              <div className={`relative text-center px-8 py-6 rounded-2xl backdrop-blur-sm border ${getScoreBg(attempt.percentage)} shadow-lg`}>
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-2xl"></div>
                                <div className="relative">
                                  <div className={`text-4xl font-black ${getScoreTextColor(attempt.percentage)} mb-2`}>
                                    {attempt.percentage}%
                                  </div>
                                  <div className="text-sm text-gray-300 font-semibold">
                                    Overall Score
                                  </div>
                                  <div className="mt-2">
                                    {getPerformanceIcon(attempt.percentage)}
                                  </div>
                                </div>
                              </div>

                              {/* View Details Button */}
                              <button
                                onClick={() => onViewAttempt && onViewAttempt(attempt)}
                                className="group/btn p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 rounded-2xl transition-all duration-300 hover:scale-110 border border-blue-500/30 shadow-lg"
                                title="View Detailed Results"
                              >
                                <FiEye className="w-6 h-6 text-blue-400 group-hover/btn:text-blue-300" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 sm:py-20">
                  <div className="relative mb-6 sm:mb-8">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-gray-600/20 to-gray-700/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 backdrop-blur-xl border border-gray-600/30">
                      <FaGraduationCap className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
                    </div>
                    <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
                      <FiStar className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
                    {searchTerm || filter !== 'all' ? 'No Matching Results' : 'Ready to Start Testing?'}
                  </h3>
                  <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed px-4">
                    {searchTerm || filter !== 'all'
                      ? 'Try adjusting your search criteria or explore different filters to find your test attempts.'
                      : 'Begin taking tests to track your progress and see detailed performance analytics here.'
                    }
                  </p>

                  {(searchTerm || filter !== 'all') && (
                    <div className="mt-6 sm:mt-8">
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setFilter('all');
                        }}
                        className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl sm:rounded-2xl px-6 sm:px-8 py-3 sm:py-4 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-blue-500/25"
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <FiRefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span>Show All Attempts</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestAttemptHistory;
