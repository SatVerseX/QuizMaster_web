import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FiPlay, 
  FiClock, 
  FiUser, 
  FiPlus, 
  FiTarget, 
  FiEdit, 
  FiBarChart2,
  FiAward,
  FiStar,
  FiTrendingUp,
  FiUsers,
  FiFilter,
  FiSearch,
  FiChevronRight,
  FiHelpCircle,
  FiCheckCircle,
  FiBookOpen,
  FiCpu,
  FiZap,
  FiUpload,
  FiRefreshCw,
  FiCalendar
} from 'react-icons/fi';
import { FaTrophy, FaRobot } from 'react-icons/fa';

const QuizList = ({ onTakeQuiz, onCreateQuiz, onViewAttempts, onViewLeaderboard, onAIGenerator }) => {
  const { currentUser } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [userStats, setUserStats] = useState({
    totalAttempts: 0,
    averageScore: 0,
    bestScore: 0
  });

  useEffect(() => {
    const q = filter === 'mine' 
      ? query(collection(db, 'quizzes'), where('createdBy', '==', currentUser.uid), orderBy('createdAt', 'desc'))
      : query(collection(db, 'quizzes'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const quizData = [];
      querySnapshot.forEach((doc) => {
        quizData.push({ id: doc.id, ...doc.data() });
      });
      setQuizzes(quizData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser.uid, filter]);

  // Load user statistics
  useEffect(() => {
    if (!currentUser) return;

    const statsQuery = query(
      collection(db, 'quiz-attempts'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(statsQuery, (querySnapshot) => {
      const attempts = [];
      querySnapshot.forEach((doc) => {
        attempts.push(doc.data());
      });

      if (attempts.length > 0) {
        // Sort attempts in JavaScript to avoid index requirement
        attempts.sort((a, b) => b.completedAt?.toDate() - a.completedAt?.toDate());
        
        const totalScore = attempts.reduce((sum, attempt) => sum + attempt.percentage, 0);
        const averageScore = Math.round(totalScore / attempts.length);
        const bestScore = Math.max(...attempts.map(attempt => attempt.percentage));

        setUserStats({
          totalAttempts: attempts.length,
          averageScore,
          bestScore
        });
      }
    }, (error) => {
      console.error('Error loading user stats:', error);
      setUserStats({
        totalAttempts: 0,
        averageScore: 0,
        bestScore: 0
      });
    });

    return () => unsubscribe();
  }, [currentUser]);

  const formatDate = useCallback((timestamp) => {
    if (!timestamp) return 'Unknown date';
    return timestamp.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, []);
  
  // Filter and sort quizzes
  const filteredAndSortedQuizzes = useMemo(() => {
    const term = searchTerm.toLowerCase();
    const filtered = quizzes.filter(quiz =>
      (quiz.title || '').toLowerCase().includes(term) ||
      (quiz.description || '').toLowerCase().includes(term)
    );
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0);
        case 'oldest':
          return (a.createdAt?.toDate?.() || 0) - (b.createdAt?.toDate?.() || 0);
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        case 'questions':
          return (b.totalQuestions || 0) - (a.totalQuestions || 0);
        default:
          return 0;
      }
    });
  }, [quizzes, searchTerm, sortBy]);

  const refreshQuizzes = () => {
    setLoading(true);
    // The real-time listener will automatically refresh
    setTimeout(() => setLoading(false), 1000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
            <div className="absolute inset-3 rounded-full border-4 border-blue-300 border-t-transparent animate-spin animate-reverse"></div>
            <div className="absolute inset-6 rounded-full border-2 border-blue-200 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">
            Loading your amazing quizzes...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Hero Section with Enhanced Glass Effect */}
      <div className="relative mb-12 overflow-hidden rounded-3xl">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20 p-8 sm:p-12">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                  <FiBookOpen className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl lg:text-6xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Quiz Library
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-xl max-w-3xl leading-relaxed">
                🚀 Discover amazing quizzes, test your knowledge with AI-generated content, 
                and challenge yourself to reach the top of the leaderboard.
              </p>
              
              {/* Quick Stats */}
              <div className="flex flex-wrap gap-6 mt-6">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">{quizzes.length} Total Quizzes</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">{userStats.totalAttempts} Your Attempts</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">{userStats.bestScore}% Best Score</span>
                </div>
              </div>
            </div>
            
            {/* Enhanced Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch gap-4">
              {currentUser && (
                <button
                  onClick={onViewAttempts}
                  className="group flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1"
                >
                  <FiTarget className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  My Progress
                </button>
              )}
              
              {/* AI Generator Button - Enhanced */}
              <button
                onClick={onAIGenerator}
                className="group flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <FaRobot className="w-5 h-5 group-hover:scale-110 transition-transform relative z-10" />
                <span className="relative z-10">AI Generator</span>
                <FiZap className="w-4 h-4 text-yellow-300 group-hover:scale-125 transition-transform relative z-10" />
              </button>
              
              <button
                onClick={onCreateQuiz}
                className="group flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-green-500 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1"
              >
                <FiPlus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                Create Quiz
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          {
            icon: FiBarChart2,
            label: "Total Quizzes",
            value: quizzes.length,
            color: "blue",
            gradient: "from-blue-500 to-blue-600"
          },
          {
            icon: FiBookOpen,
            label: "Created by You",
            value: quizzes.filter(q => q.createdBy === currentUser.uid).length,
            color: "green",
            gradient: "from-green-500 to-green-600"
          },
          {
            icon: FiCheckCircle,
            label: "Your Attempts",
            value: userStats.totalAttempts,
            color: "purple",
            gradient: "from-purple-500 to-purple-600"
          },
          {
            icon: FiStar,
            label: "Best Score",
            value: `${userStats.bestScore}%`,
            color: "yellow",
            gradient: "from-yellow-500 to-yellow-600"
          }
        ].map((stat, index) => (
          <div key={index} className="group p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:scale-105">
            <div className="flex items-center gap-4">
              <div className={`p-3 bg-gradient-to-br ${stat.gradient} rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className={`text-2xl font-bold text-${stat.color}-600 dark:text-${stat.color}-400`}>
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {stat.label}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
          {/* Search Bar with Enhanced Design */}
          <div className="relative flex-grow max-w-md">
            <input
              type="text"
              placeholder="Search quizzes by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-700 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
            <FiSearch className="absolute left-4 top-4.5 w-5 h-5 text-gray-400" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3.5 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <FiX className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Buttons */}
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'All Quizzes', icon: FiUsers, count: quizzes.length },
                { key: 'mine', label: 'My Quizzes', icon: FiUser, count: quizzes.filter(q => q.createdBy === currentUser.uid).length }
              ].map(filterOption => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key)}
                  className={`px-5 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                    filter === filterOption.key
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-105'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <filterOption.icon className="w-4 h-4" />
                  {filterOption.label}
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    filter === filterOption.key 
                      ? 'bg-white/20' 
                      : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  }`}>
                    {filterOption.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:outline-none focus:border-blue-500 transition-all duration-300"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">By Title</option>
              <option value="questions">By Questions Count</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={refreshQuizzes}
              className="p-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              title="Refresh Quizzes"
            >
              <FiRefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing <span className="font-semibold text-blue-600 dark:text-blue-400">{filteredAndSortedQuizzes.length}</span> quiz{filteredAndSortedQuizzes.length !== 1 ? 'es' : ''} 
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
          
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              Clear search
            </button>
          )}
        </div>
      </div>

      {/* Quiz Grid or Empty State */}
      {filteredAndSortedQuizzes.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="mx-auto w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mb-8 shadow-inner">
            {searchTerm ? (
              <FiSearch className="w-16 h-16 text-gray-400" />
            ) : (
              <FiHelpCircle className="w-16 h-16 text-gray-400" />
            )}
          </div>
          
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {searchTerm ? 'No matching quizzes found' : 
             filter === 'mine' ? 'No quizzes created yet' : 
             'No quizzes available'}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-xl max-w-md mx-auto leading-relaxed">
            {searchTerm ? 'Try a different search term or explore all available quizzes' : 
             filter === 'mine' ? 'Create your first quiz using our manual editor or AI generator!' : 
             'Be the pioneer! Create the first quiz and start the learning journey.'}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onAIGenerator}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <FaRobot className="w-6 h-6" />
              Generate with AI
            </button>
            
            <button
              onClick={onCreateQuiz}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white font-bold text-lg rounded-xl hover:from-blue-700 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <FiPlus className="w-6 h-6" />
              Create Manually
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAndSortedQuizzes.map(quiz => (
            <div 
              key={quiz.id} 
              className="group bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700 overflow-hidden transform hover:-translate-y-2 hover:border-blue-300 dark:hover:border-blue-500 flex flex-col h-[420px]"
              onClick={() => onTakeQuiz(quiz)}
            >
              {/* Colorful top gradient bar based on category or AI generation */}
              <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-teal-500"></div>
              
              <div className="relative p-6 flex-1 flex flex-col">
                {/* Decorative patterns */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 dark:bg-blue-400/10 rounded-full -mt-12 -mr-12 opacity-70"></div>
                <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-purple-500/5 dark:bg-purple-400/10 rounded-full opacity-70"></div>
                
                <div className="relative flex flex-col h-full">
                  {/* Header with title and badges */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {quiz.createdBy === currentUser.uid && (
                          <div className="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                            <FiUser className="w-3 h-3" />
                            Your Quiz
                          </div>
                        )}
                        {quiz.isAIGenerated && (
                          <div className="bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                            <FaRobot className="w-3 h-3" />
                            AI Generated
                          </div>
                        )}
                        <div className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                          <FiClock className="w-3 h-3" />
                          ~{Math.ceil((quiz.questions?.length || 0) * 1.5)} min
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-extrabold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight">
                        {quiz.title}
                      </h3>
                    </div>
                    
                    {quiz.createdBy === currentUser.uid && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Edit quiz:', quiz.id);
                        }}
                        className="p-2 rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-300"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  {/* Quiz description */}
                  <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-2 text-sm">
                    {quiz.description || "Take this quiz to test your knowledge and challenge yourself!"}
                  </p>
                  
                  {/* Enhanced Quiz Meta */}
                  <div className="flex flex-wrap items-center justify-between gap-y-3 mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                        <FiBookOpen className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {quiz.questions?.length || 0} questions
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                        <FiUser className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {quiz.createdByName || "Anonymous"}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 w-full mt-1">
                      <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        <FiCalendar className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Created {formatDate(quiz.createdAt)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Spacer to push buttons to bottom */}
                  <div className="flex-grow"></div>
                  
                  {/* Enhanced Action Buttons - Now at bottom */}
                  <div className="grid grid-cols-2 gap-3 mt-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTakeQuiz(quiz);
                      }}
                      className="group flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      <FiPlay className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      <span>Take Quiz</span>
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewLeaderboard(quiz);
                      }}
                      className="group flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-yellow-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      <FaTrophy className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span>Leaderboard</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Call to Action Section */}
      {filteredAndSortedQuizzes.length > 0 && (
        <div className="text-center mt-16">
          <div className="bg-gradient-to-br from-white via-white to-white dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-3xl p-12 border-2 border-blue-200/50 dark:border-blue-700/50 shadow-2xl backdrop-blur-sm">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                  <FiZap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-4xl font-bold text-gray-900 dark:text-white">
                  Ready to Create Something Amazing?
                </h3>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 text-xl mb-10 leading-relaxed">
                🤖 Use our AI-powered generator for instant quiz creation, or craft your own with our intuitive manual editor. 
                Share your expertise and build a community of learners!
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <button
                  onClick={onAIGenerator}
                  className="group inline-flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xl rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1"
                >
                  <FaRobot className="w-7 h-7 group-hover:scale-110 transition-transform" />
                  AI Quiz Generator
                  <FiZap className="w-5 h-5 text-yellow-300" />
                </button>
                
                <button
                  onClick={onCreateQuiz}
                  className="group inline-flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-blue-600 to-green-600 text-white font-bold text-xl rounded-2xl hover:from-blue-700 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1"
                >
                  <FiEdit className="w-7 h-7 group-hover:scale-110 transition-transform" />
                  Manual Creator
                </button>
                
                <button
                  onClick={onViewAttempts}
                  className="inline-flex items-center gap-4 px-10 py-5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xl rounded-2xl border-2 border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <FiBarChart2 className="w-7 h-7" />
                  View Progress
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizList;
