import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  collection, query, where, orderBy, onSnapshot, limit 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { 
  FiClock, FiCalendar, FiChevronDown, FiChevronRight, 
  FiSearch, FiFilter, FiDownload, FiArrowLeft, FiActivity,
  FiTrendingUp, FiTarget, FiLayers, FiCheckCircle, FiXCircle
} from 'react-icons/fi';

const TestAttemptHistory = ({ onBack, onViewAttempt }) => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  
  // Logic State
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  
  // UI State
  const [expandedSeries, setExpandedSeries] = useState({});
  const [expandedTests, setExpandedTests] = useState({});

  // --- Data Fetching ---
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

  // --- Helpers ---
  const getCompletedDate = (attempt) => {
    const value = attempt?.completedAt;
    if (!value) return null;
    if (typeof value.toDate === 'function') return value.toDate();
    return new Date(value);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  // --- Data Processing ---
  const getStats = () => {
    if (attempts.length === 0) return { avg: 0, total: 0, best: 0, time: 0 };
    const totalScore = attempts.reduce((sum, a) => sum + (a.percentage || 0), 0);
    const totalTime = attempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0);
    return {
      avg: Math.round(totalScore / attempts.length),
      total: attempts.length,
      best: Math.max(...attempts.map(a => a.percentage || 0)),
      time: Math.round(totalTime / 60) // in minutes
    };
  };

  const processGroupedData = () => {
    // 1. Filter
    const filtered = attempts.filter(attempt => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = (attempt.testTitle || '').toLowerCase().includes(searchLower) ||
                            (attempt.testSeriesTitle || '').toLowerCase().includes(searchLower);
      
      if (filter === 'ai') return matchesSearch && attempt.isAIGenerated;
      if (filter === 'manual') return matchesSearch && !attempt.isAIGenerated;
      if (filter === 'high') return matchesSearch && attempt.percentage >= 80;
      return matchesSearch;
    });

    // 2. Group
    const seriesMap = {};
    filtered.forEach(attempt => {
      const seriesTitle = attempt.testSeriesTitle || 'Individual Tests';
      if (!seriesMap[seriesTitle]) seriesMap[seriesTitle] = {};
      
      const testTitle = attempt.testTitle || 'Untitled Test';
      if (!seriesMap[seriesTitle][testTitle]) seriesMap[seriesTitle][testTitle] = [];
      
      seriesMap[seriesTitle][testTitle].push(attempt);
    });

    return seriesMap;
  };

  const groupedData = processGroupedData();
  const stats = getStats();

  // --- Interactions ---
  const toggleSeries = (title) => setExpandedSeries(prev => ({...prev, [title]: !prev[title]}));
  const toggleTest = (sTitle, tTitle) => {
    const key = `${sTitle}-${tTitle}`;
    setExpandedTests(prev => ({...prev, [key]: !prev[key]}));
  };

  // --- Components ---
  
  // 1. Stats Card Component
  const StatCard = ({ icon: Icon, label, value, subtext, color }) => (
    <div className={`p-4 rounded-xl border transition-all duration-200 ${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } shadow-sm hover:shadow-md`}>
      <div className="flex items-center justify-between mb-3">
        <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</span>
        <div className={`p-2 rounded-lg ${
          isDark ? `bg-opacity-20 bg-${color}-500 text-${color}-400` : `bg-${color}-50 text-${color}-600`
        }`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</h3>
        {subtext && <span className="text-xs text-gray-400">{subtext}</span>}
      </div>
    </div>
  );

  // 2. Score Badge Component
  const ScoreBadge = ({ score }) => {
    let colorClass = '';
    if (score >= 80) colorClass = isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200';
    else if (score >= 60) colorClass = isDark ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-yellow-50 text-yellow-700 border-yellow-200';
    else colorClass = isDark ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-700 border-red-200';

    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${colorClass}`}>
        {score}%
      </span>
    );
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-gray-500">Loading history...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* --- Top Navigation Bar --- */}
      <div className={`sticky top-0 z-30 border-b backdrop-blur-md ${isDark ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
            >
              <FiArrowLeft size={20} />
            </button>
            <h1 className="text-lg font-bold tracking-tight">Attempt History</h1>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* --- Stats Overview Grid --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FiLayers} label="Total Attempts" value={stats.total} color="blue" />
          <StatCard icon={FiActivity} label="Avg. Score" value={`${stats.avg}%`} color="indigo" />
          <StatCard icon={FiTarget} label="Best Score" value={`${stats.best}%`} color="emerald" />
          <StatCard icon={FiClock} label="Time Invested" value={`${stats.time}m`} color="amber" />
        </div>

        {/* --- Controls Bar --- */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          {/* Search Input */}
          <div className="relative w-full sm:w-96 group">
            <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              <FiSearch />
            </div>
            <input
              type="text"
              placeholder="Search tests or series..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`block w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none ${
                isDark 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 shadow-sm'
              }`}
            />
          </div>

          {/* Filters */}
          <div className={`flex p-1 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            {['all', 'ai', 'manual', 'high'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 text-xs sm:text-sm font-medium rounded-lg capitalize transition-all ${
                  filter === f
                    ? isDark 
                      ? 'bg-gray-700 text-white shadow-sm' 
                      : 'bg-gray-100 text-gray-900 shadow-sm'
                    : isDark 
                      ? 'text-gray-400 hover:text-white' 
                      : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {f === 'high' ? 'High Score' : f}
              </button>
            ))}
          </div>
        </div>

        {/* --- Main Content List --- */}
        <div className="space-y-4">
          {Object.keys(groupedData).length === 0 ? (
            <div className={`text-center py-20 rounded-2xl border-2 border-dashed ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
              <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <FiSearch className="text-gray-400 text-2xl" />
              </div>
              <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>No attempts found</h3>
              <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            Object.keys(groupedData).map((seriesTitle) => (
              <div 
                key={seriesTitle} 
                className={`rounded-2xl border overflow-hidden transition-all duration-200 ${
                  isDark ? 'bg-gray-800/40 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
                }`}
              >
                {/* Series Header */}
                <button
                  onClick={() => toggleSeries(seriesTitle)}
                  className={`w-full flex items-center justify-between p-4 ${
                    isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                  } transition-colors`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                      <FiLayers size={18} />
                    </div>
                    <div className="text-left">
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{seriesTitle}</h3>
                      <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {Object.keys(groupedData[seriesTitle]).length} Tests Taken
                      </p>
                    </div>
                  </div>
                  <div className={`transform transition-transform duration-200 ${expandedSeries[seriesTitle] ? 'rotate-180' : ''}`}>
                    <FiChevronDown className="text-gray-400" />
                  </div>
                </button>

                {/* Tests List (Expanded) */}
                {expandedSeries[seriesTitle] && (
                  <div className={`border-t ${isDark ? 'border-gray-700 bg-gray-900/50' : 'border-gray-100 bg-gray-50/50'}`}>
                    {Object.keys(groupedData[seriesTitle]).map((testTitle) => (
                      <div key={testTitle} className="border-b last:border-0 border-gray-100 dark:border-gray-800">
                        {/* Test Header */}
                        <button
                          onClick={() => toggleTest(seriesTitle, testTitle)}
                          className="w-full flex items-center gap-3 px-4 py-3 pl-6 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        >
                          <div className={`transform transition-transform duration-200 ${expandedTests[`${seriesTitle}-${testTitle}`] ? 'rotate-90' : ''}`}>
                            <FiChevronRight size={14} className="text-gray-400" />
                          </div>
                          <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                            {testTitle}
                          </span>
                          <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-600'}`}>
                            {groupedData[seriesTitle][testTitle].length} attempts
                          </span>
                        </button>

                        {/* Attempts Table (Expanded) */}
                        {expandedTests[`${seriesTitle}-${testTitle}`] && (
                          <div className="px-4 pb-4 pl-12">
                            <div className={`rounded-lg overflow-hidden border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                              <table className="w-full text-sm">
                                <thead className={isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'}>
                                  <tr>
                                    <th className="px-4 py-2 text-left font-medium">Date</th>
                                    <th className="px-4 py-2 text-left font-medium">Score</th>
                                    <th className="px-4 py-2 text-left font-medium hidden sm:table-cell">Duration</th>
                                    <th className="px-4 py-2 text-right font-medium">Action</th>
                                  </tr>
                                </thead>
                                <tbody className={`divide-y ${isDark ? 'divide-gray-700 bg-gray-900' : 'divide-gray-100 bg-white'}`}>
                                  {groupedData[seriesTitle][testTitle].map((attempt) => (
                                    <tr key={attempt.id} className="group hover:bg-blue-50/5 dark:hover:bg-blue-900/10 transition-colors">
                                      <td className={`px-4 py-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        <div className="flex items-center gap-2">
                                          <FiCalendar size={14} className="text-gray-400" />
                                          {formatDate(getCompletedDate(attempt))}
                                        </div>
                                      </td>
                                      <td className="px-4 py-3">
                                        <ScoreBadge score={attempt.percentage} />
                                      </td>
                                      <td className={`px-4 py-3 hidden sm:table-cell ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {formatTime(attempt.timeSpent)}
                                      </td>
                                      <td className="px-4 py-3 text-right">
                                        <button 
                                          onClick={() => onViewAttempt(attempt)}
                                          className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                                        >
                                          View Analysis
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TestAttemptHistory;