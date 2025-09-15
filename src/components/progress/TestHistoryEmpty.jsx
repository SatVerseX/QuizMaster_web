import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { FiStar, FiRefreshCw } from 'react-icons/fi';
import { FaGraduationCap } from 'react-icons/fa';

const TestHistoryEmpty = ({ searchTerm, filter, setSearchTerm, setFilter }) => {
  const { isDark } = useTheme();

  return (
    <div className="text-center py-12 sm:py-16">
      <div className="relative mb-6">
        <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-4 border ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-300'
        }`}>
          <FaGraduationCap className={`w-10 h-10 sm:w-12 sm:h-12 ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`} />
        </div>
        <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ${
          isDark ? 'bg-yellow-500' : 'bg-yellow-400'
        }`}>
          <FiStar className="w-3 h-3 text-white" />
        </div>
      </div>

      <h3 className={`text-2xl font-bold mb-3 ${
        isDark ? 'text-white' : 'text-gray-900'
      }`}>
        {searchTerm || filter !== 'all' ? 'No Matching Results' : 'Ready to Start Testing?'}
      </h3>
      <p className={`text-base max-w-2xl mx-auto px-4 ${
        isDark ? 'text-gray-400' : 'text-gray-600'
      }`}>
        {searchTerm || filter !== 'all'
          ? 'Try adjusting your search criteria or explore different filters to find your test attempts.'
          : 'Begin taking tests to track your progress and see detailed performance analytics here.'
        }
      </p>

      {(searchTerm || filter !== 'all') && (
        <div className="mt-6">
          <button
            onClick={() => {
              setSearchTerm('');
              setFilter('all');
            }}
            className={`font-bold rounded-lg px-6 py-3 ${
              isDark 
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <FiRefreshCw className="w-4 h-4" />
              <span>Show All Attempts</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default TestHistoryEmpty;
