import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { FiStar, FiRefreshCw } from 'react-icons/fi';
import { FaGraduationCap } from 'react-icons/fa';

const TestHistoryEmpty = ({ searchTerm, filter, setSearchTerm, setFilter }) => {
  const { isDark } = useTheme();

  return (
    <div className="text-center py-8">
      <div className="mb-4">
        <div className={`w-16 h-16 rounded flex items-center justify-center mx-auto mb-3 border ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
        }`}>
          <FaGraduationCap className={`w-8 h-8 ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`} />
        </div>
        <div className={`w-5 h-5 rounded flex items-center justify-center mx-auto ${
          isDark ? 'bg-yellow-500' : 'bg-yellow-400'
        }`}>
          <FiStar className="w-3 h-3 text-white" />
        </div>
      </div>

      <h3 className={`text-xl font-medium mb-2 ${
        isDark ? 'text-white' : 'text-gray-900'
      }`}>
        {searchTerm || filter !== 'all' ? 'No Matching Results' : 'Ready to Start Testing?'}
      </h3>
      <p className={`text-sm max-w-lg mx-auto px-4 ${
        isDark ? 'text-gray-400' : 'text-gray-600'
      }`}>
        {searchTerm || filter !== 'all'
          ? 'Try adjusting your search criteria or explore different filters to find your test attempts.'
          : 'Begin taking tests to track your progress and see detailed performance analytics here.'
        }
      </p>

      {(searchTerm || filter !== 'all') && (
        <div className="mt-4">
          <button
            onClick={() => {
              setSearchTerm('');
              setFilter('all');
            }}
            className={`font-medium rounded px-4 py-2 ${
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
