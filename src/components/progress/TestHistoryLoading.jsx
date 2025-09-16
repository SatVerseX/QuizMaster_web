import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const TestHistoryLoading = () => {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-6xl mx-auto p-3">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center gap-3">
            <div className={`h-8 rounded w-20 ${
              isDark ? 'bg-gray-700' : 'bg-gray-300'
            }`}></div>
            <div>
              <div className={`h-6 rounded w-60 mb-2 ${
                isDark ? 'bg-gray-700' : 'bg-gray-300'
              }`}></div>
              <div className={`h-4 rounded w-80 ${
                isDark ? 'bg-gray-600' : 'bg-gray-200'
              }`}></div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`h-20 rounded ${
                isDark ? 'bg-gray-700' : 'bg-gray-300'
              }`}></div>
            ))}
          </div>

          <div className={`h-16 rounded ${
            isDark ? 'bg-gray-700' : 'bg-gray-300'
          }`}></div>
          
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-24 rounded ${
                isDark ? 'bg-gray-700' : 'bg-gray-300'
              }`}></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestHistoryLoading;
