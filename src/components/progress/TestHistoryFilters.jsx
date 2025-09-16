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
    <div className="mb-4">
      <div className={`rounded p-3 border ${
        isDark 
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200'
      }`}>
        
        {/* Mobile Filter Toggle */}
        <div className="sm:hidden mb-3">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className={`w-full flex items-center justify-between p-2 rounded border ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-650'
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="flex items-center gap-2 text-sm">
              <FiFilter className="w-3 h-3" />
              Filters & Search
            </span>
            <FiChevronDown className={`w-3 h-3 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className={`${showMobileFilters ? 'block' : 'hidden'} sm:block`}>
          <div className="flex flex-col lg:flex-row gap-2">
            {/* Search Bar */}
            <div className="relative flex-1">
              <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <FiSearch className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search tests by title or series..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-3 py-2 rounded border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-700 placeholder-gray-500'
                }`}
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className={`appearance-none px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8 min-w-[140px] text-sm ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-700'
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

            
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestHistoryFilters;
