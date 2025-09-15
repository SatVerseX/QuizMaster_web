
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';  
import { 
  FiFilter,
  FiSearch,
  FiChevronDown
} from 'react-icons/fi';

const TestHistoryFilters = ({ 
  filter, 
  setFilter, 
  searchTerm, 
  setSearchTerm, 
  sortBy, 
  setSortBy,
  showMobileFilters,
  setShowMobileFilters
}) => {
  const { isDark } = useTheme();

  return (
    <div className="relative z-10 mb-4 sm:mb-6">
      <div className={`rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg transition-all duration-500 ${
        isDark 
          ? 'bg-gradient-to-r from-gray-800/60 to-gray-700/60 backdrop-blur-xl border border-gray-600/40'
          : 'bg-white/90 backdrop-blur-sm border border-slate-200/60'
      }`}>
        <div className={`absolute inset-0 rounded-xl sm:rounded-2xl ${
          isDark ? 'bg-gradient-to-r from-emerald-500/5 to-blue-500/5' : 'bg-gradient-to-r from-blue-50/30 to-indigo-50/30'
        }`}></div>
        
        {/* Mobile Filter Toggle */}
        <div className="sm:hidden relative mb-3">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className={`w-full flex items-center justify-between p-2 rounded-lg border transition-all duration-300 ${
              isDark 
                ? 'bg-gray-900/60 border-gray-600/40 text-white hover:bg-gray-800/60'
                : 'bg-white/90 border-slate-200/60 text-slate-700 hover:bg-white hover:border-slate-300/80'
            }`}
          >
            <span className="flex items-center gap-2 text-sm">
              <FiFilter className="w-3 h-3" />
              Filters & Search
            </span>
            <FiChevronDown className={`w-3 h-3 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className={`relative ${showMobileFilters ? 'block' : 'hidden'} sm:block`}>
          <div className="flex flex-col lg:flex-row gap-2 sm:gap-3">
            {/* Search Bar */}
            <div className="relative flex-1">
              <div className={`absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 ${
                isDark ? 'text-gray-400' : 'text-slate-500'
              }`}>
                <FiSearch className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <input
                type="text"
                placeholder="Search tests by title or series..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl backdrop-blur-sm border text-sm sm:text-base font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isDark 
                    ? 'bg-gray-900/60 border-gray-600/40 text-white placeholder-gray-500'
                    : 'bg-white/90 border-slate-200/60 text-slate-700 placeholder-slate-500 hover:bg-white hover:border-slate-300/80'
                }`}
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className={`appearance-none px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl backdrop-blur-sm border focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 font-medium pr-8 sm:pr-10 min-w-[140px] sm:min-w-[160px] text-sm ${
                  isDark 
                    ? 'bg-gray-900/60 border-gray-600/40 text-white'
                    : 'bg-white/90 border-slate-200/60 text-slate-700 hover:bg-white hover:border-slate-300/80'
                }`}
              >
                <option value="all">All Tests</option>
                <option value="recent-week">This Week</option>
                <option value="high-score">Excellent (80%+)</option>
                <option value="low-score">Needs Work (&lt;60%)</option>
                <option value="ai">AI Generated</option>
                <option value="manual">Manual Tests</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`appearance-none px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl backdrop-blur-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 font-medium pr-8 sm:pr-10 min-w-[140px] sm:min-w-[160px] text-sm ${
                  isDark 
                    ? 'bg-gray-900/60 border-gray-600/40 text-white'
                    : 'bg-white/90 border-slate-200/60 text-slate-700 hover:bg-white hover:border-slate-300/80'
                }`}
              >
                <option value="recent">Most Recent</option>
                <option value="score-high">Highest Score</option>
                <option value="score-low">Lowest Score</option>
                <option value="duration-short">Shortest Duration</option>
                <option value="duration-long">Longest Duration</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestHistoryFilters;
