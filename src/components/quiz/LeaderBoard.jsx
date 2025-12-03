import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { logger } from '../../utils/logger';
import { 
  FiAward, FiUser, FiClock, FiCalendar, FiUsers, FiRefreshCw, FiTarget, FiTrendingUp, FiFilter
} from 'react-icons/fi';
import { FaTrophy, FaCrown, FaMedal } from 'react-icons/fa';

const Leaderboard = ({ quizId, quizTitle, onBack }) => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  
  // --- State ---
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('best');
  const [stats, setStats] = useState({
    totalAttempts: 0,
    averageScore: 0,
    topScore: 0,
    participantCount: 0
  });

  // --- Styles (Centralized) ---
  const styles = {
    page: isDark ? 'bg-gray-900 text-gray-100' : 'bg-slate-50 text-slate-900',
    card: isDark ? 'bg-gray-800/50 border-gray-700 backdrop-blur-sm' : 'bg-white border-slate-200 shadow-sm',
    
    text: {
      primary: isDark ? 'text-white' : 'text-slate-900',
      secondary: isDark ? 'text-gray-400' : 'text-slate-500',
      accent: 'text-yellow-500'
    },

    // Filter Tabs
    tab: (active) => `
      flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all
      ${active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
        : isDark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'}
    `,

    // Stat Boxes
    statBox: (color) => `
      flex flex-col items-center justify-center p-4 rounded-2xl border transition-transform hover:scale-105
      ${isDark 
        ? `bg-gray-800/50 border-${color}-500/20` 
        : `bg-white border-${color}-200 shadow-sm`}
    `,

    // Podium
    podiumBase: isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200 shadow-md',
  };

  // --- Data Fetching ---
  useEffect(() => {
    if (!quizId) {
      setError('Quiz ID is required');
      setLoading(false);
      return;
    }

    setLoading(true);
    
    const q = query(
      collection(db, 'test-attempts'),
      where('testId', '==', quizId),
      orderBy('completedAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const attempts = [];
        const userBestAttempts = new Map(); // Map to store best attempt per user
        let totalScore = 0;
        let maxScore = 0;

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const attempt = { id: doc.id, ...data };
          attempts.push(attempt);
          
          // Stats calculation
          totalScore += attempt.percentage;
          maxScore = Math.max(maxScore, attempt.percentage);

          // Logic for 'Best' vs 'Recent'
          if (!userBestAttempts.has(attempt.userId) || 
              (filter === 'best' && attempt.percentage > userBestAttempts.get(attempt.userId).percentage)) {
            userBestAttempts.set(attempt.userId, attempt);
          }
        });

        // Convert Map to Array and Sort
        let sortedData = Array.from(userBestAttempts.values());
        
        if (filter === 'best') {
          sortedData.sort((a, b) => b.percentage - a.percentage || a.timeSpent - b.timeSpent);
        } else {
          // For recent, we might want all attempts, but usually leaderboard shows unique users
          // Here we sort the unique users by their most recent attempt date
          sortedData.sort((a, b) => {
             const tA = a.completedAt?.toMillis ? a.completedAt.toMillis() : 0;
             const tB = b.completedAt?.toMillis ? b.completedAt.toMillis() : 0;
             return tB - tA;
          });
        }

        setLeaderboard(sortedData);
        
        // Update Stats
        setStats({
          totalAttempts: attempts.length,
          averageScore: attempts.length ? Math.round(totalScore / attempts.length) : 0,
          topScore: maxScore,
          participantCount: userBestAttempts.size
        });

        // Find User Rank
        const rank = sortedData.findIndex(a => a.userId === currentUser?.uid);
        setUserRank(rank !== -1 ? rank + 1 : null);
        
        setLoading(false);
      },
      (err) => {
        logger.error('Leaderboard Error:', err);
        setError('Unable to load leaderboard data.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [quizId, filter, currentUser]);

  // --- Render Helpers ---
  if (loading) return <LoadingState isDark={isDark} />;
  if (error) return <ErrorState error={error} isDark={isDark} retry={() => window.location.reload()} />;

  return (
    <div className={`min-h-screen pb-12 ${styles.page}`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className={`text-3xl font-black mb-2 flex items-center gap-3 ${styles.text.primary}`}>
              <FaTrophy className="text-yellow-500" /> Leaderboard
            </h1>
            <p className={styles.text.secondary}>{quizTitle}</p>
          </div>
          
          {/* User Rank Badge */}
          {userRank && (
            <div className={`px-5 py-2 rounded-xl border flex items-center gap-3 ${
              isDark ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-700'
            }`}>
              <div className="text-xs font-bold uppercase tracking-wider opacity-70">Your Rank</div>
              <div className="text-xl font-black">#{userRank}</div>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatBox icon={FaCrown} label="Top Score" value={`${stats.topScore}%`} color="yellow" isDark={isDark} />
          <StatBox icon={FiUsers} label="Participants" value={stats.participantCount} color="blue" isDark={isDark} />
          <StatBox icon={FiTarget} label="Avg Score" value={`${stats.averageScore}%`} color="purple" isDark={isDark} />
          <StatBox icon={FiTrendingUp} label="Attempts" value={stats.totalAttempts} color="emerald" isDark={isDark} />
        </div>

        {/* Main Content Card */}
        <div className={`rounded-3xl border overflow-hidden ${styles.card}`}>
          
          {/* Toolbar */}
          <div className={`p-4 border-b flex justify-center gap-3 ${isDark ? 'border-gray-700' : 'border-slate-100'}`}>
            <button onClick={() => setFilter('best')} className={styles.tab(filter === 'best')}>
              <FaCrown className="w-4 h-4" /> Hall of Fame
            </button>
          </div>

          <div className="p-6 md:p-8">
            {leaderboard.length === 0 ? (
              <EmptyState isDark={isDark} />
            ) : (
              <>
                {/* Top 3 Podium (Only visible in 'best' filter) */}
                {filter === 'best' && leaderboard.length >= 3 && (
                  <Podium topThree={leaderboard.slice(0, 3)} isDark={isDark} />
                )}

                {/* List View */}
                <div className="space-y-3 mt-8">
                  <div className={`flex justify-between text-xs font-bold uppercase tracking-widest px-4 mb-2 ${styles.text.secondary}`}>
                    <span>Rank & Player</span>
                    <span>Performance</span>
                  </div>
                  
                  {leaderboard.map((attempt, idx) => (
                    <LeaderboardRow 
                      key={attempt.id} 
                      attempt={attempt} 
                      rank={idx + 1} 
                      isCurrentUser={attempt.userId === currentUser?.uid}
                      isDark={isDark}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Sub Components ---

const StatBox = ({ icon: Icon, label, value, color, isDark }) => {
  const colorClasses = {
    yellow: isDark ? 'text-yellow-400' : 'text-yellow-600',
    blue: isDark ? 'text-blue-400' : 'text-blue-600',
    purple: isDark ? 'text-purple-400' : 'text-purple-600',
    emerald: isDark ? 'text-emerald-400' : 'text-emerald-600',
  };

  return (
    <div className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all ${
      isDark ? 'bg-gray-800/40 border-gray-700' : 'bg-white border-slate-200 shadow-sm'
    }`}>
      <Icon className={`w-6 h-6 mb-2 ${colorClasses[color]}`} />
      <div className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{value}</div>
      <div className={`text-xs font-bold uppercase tracking-wide ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>{label}</div>
    </div>
  );
};

const Podium = ({ topThree, isDark }) => {
  const [first, second, third] = topThree;
  
  return (
    <div className="flex justify-center items-end gap-4 md:gap-8 mb-12 pt-8">
      {/* 2nd Place */}
      <PodiumSpot attempt={second} rank={2} color="bg-slate-400" height="h-32 md:h-40" isDark={isDark} />
      
      {/* 1st Place */}
      <PodiumSpot attempt={first} rank={1} color="bg-yellow-400" height="h-40 md:h-52" isDark={isDark} isFirst />
      
      {/* 3rd Place */}
      <PodiumSpot attempt={third} rank={3} color="bg-orange-400" height="h-24 md:h-32" isDark={isDark} />
    </div>
  );
};

const PodiumSpot = ({ attempt, rank, color, height, isDark, isFirst }) => {
  if (!attempt) return null;
  
  return (
    <div className="flex flex-col items-center group">
      {/* Avatar Circle */}
      <div className={`relative mb-3 transition-transform duration-300 group-hover:-translate-y-2`}>
        <div className={`rounded-full flex items-center justify-center border-4 ${
          isFirst ? 'w-20 h-20 border-yellow-400' : 'w-14 h-14 border-slate-300'
        } ${isDark ? 'bg-gray-700 text-gray-200' : 'bg-white text-slate-700'}`}>
          <span className={`font-bold ${isFirst ? 'text-2xl' : 'text-lg'}`}>
            {attempt.userName?.charAt(0) || '?'}
          </span>
        </div>
        {isFirst && <FaCrown className="absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-400 w-8 h-8 drop-shadow-lg" />}
        <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-sm ${color}`}>
          #{rank}
        </div>
      </div>

      {/* Name & Score */}
      <div className="text-center mb-2">
        <div className={`font-bold text-sm truncate max-w-[100px] ${isDark ? 'text-white' : 'text-slate-800'}`}>
          {attempt.userName || 'User'}
        </div>
        <div className={`font-black ${isFirst ? 'text-yellow-500' : 'text-slate-500'}`}>
          {attempt.percentage}%
        </div>
      </div>

      {/* The Bar */}
      <div className={`w-16 md:w-24 rounded-t-lg shadow-inner opacity-80 ${color} ${height}`} />
    </div>
  );
};

const LeaderboardRow = ({ attempt, rank, isCurrentUser, isDark }) => {
  // Format time helper
  const formatTime = (s) => `${Math.floor(s / 60)}m ${s % 60}s`;
  
  // Rank Logic
  const getRankBadge = () => {
    if (rank === 1) return <FaCrown className="text-yellow-500 w-5 h-5" />;
    if (rank === 2) return <FaMedal className="text-slate-400 w-5 h-5" />;
    if (rank === 3) return <FaMedal className="text-orange-400 w-5 h-5" />;
    return <span className={`font-mono font-bold ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>#{rank}</span>;
  };

  return (
    <div className={`
      flex items-center justify-between p-4 rounded-xl border transition-all duration-200
      ${isCurrentUser 
        ? isDark ? 'bg-indigo-900/20 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.1)]' : 'bg-indigo-50 border-indigo-200 shadow-sm' 
        : isDark ? 'bg-gray-800/30 border-gray-700 hover:bg-gray-800' : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-sm'}
    `}>
      <div className="flex items-center gap-4 md:gap-6 overflow-hidden">
        {/* Rank Indicator */}
        <div className="w-8 flex justify-center shrink-0">{getRankBadge()}</div>
        
        {/* User Info */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-bold truncate ${isDark ? 'text-gray-200' : 'text-slate-800'}`}>
              {attempt.userName || 'Anonymous User'}
            </span>
            {isCurrentUser && (
              <span className="text-[10px] font-bold bg-indigo-500 text-white px-1.5 py-0.5 rounded">YOU</span>
            )}
          </div>
          <div className={`flex items-center gap-3 text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
            <span className="flex items-center gap-1"><FiClock className="w-3 h-3" /> {formatTime(attempt.timeSpent)}</span>
            <span className="hidden sm:flex items-center gap-1"><FiCalendar className="w-3 h-3" /> {new Date(attempt.completedAt?.toDate?.() || attempt.completedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Score Section */}
      <div className="text-right shrink-0 pl-4">
        <div className={`text-xl font-black ${
          attempt.percentage >= 80 ? 'text-emerald-500' : 
          attempt.percentage >= 60 ? 'text-indigo-500' : 
          'text-orange-500'
        }`}>
          {attempt.percentage}%
        </div>
        <div className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
          {attempt.score}/{attempt.totalQuestions} pts
        </div>
      </div>
    </div>
  );
};

// --- Utility Components ---

const LoadingState = ({ isDark }) => (
  <div className={`min-h-screen flex flex-col items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-slate-50'}`}>
    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
    <p className={isDark ? 'text-gray-400' : 'text-slate-500'}>Loading Champions...</p>
  </div>
);

const ErrorState = ({ error, isDark, retry }) => (
  <div className={`min-h-screen flex flex-col items-center justify-center p-6 text-center ${isDark ? 'bg-gray-900' : 'bg-slate-50'}`}>
    <div className="bg-red-100 p-4 rounded-full mb-4"><FiRefreshCw className="w-8 h-8 text-red-500" /></div>
    <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Something went wrong</h3>
    <p className={`mb-6 max-w-md ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{error}</p>
    <button onClick={retry} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-colors">
      Try Again
    </button>
  </div>
);

const EmptyState = ({ isDark }) => (
  <div className="text-center py-20">
    <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${isDark ? 'bg-gray-800' : 'bg-slate-100'}`}>
      <FaTrophy className={`w-10 h-10 ${isDark ? 'text-gray-600' : 'text-slate-300'}`} />
    </div>
    <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>No Attempts Yet</h3>
    <p className={isDark ? 'text-gray-400' : 'text-slate-500'}>Be the first to conquer this test!</p>
  </div>
);

export default Leaderboard;