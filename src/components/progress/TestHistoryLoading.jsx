
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const TestHistoryLoading = () => {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900/10 to-purple-900/10' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20'
    }`}>
      <div className="max-w-7xl mx-auto p-3 sm:p-6">
        {/* Professional Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-20 right-20 w-96 h-96 rounded-full blur-3xl animate-pulse ${
            isDark ? 'bg-blue-500/10' : 'bg-blue-400/8'
          }`}></div>
          <div className={`absolute bottom-20 left-20 w-96 h-96 rounded-full blur-3xl animate-pulse delay-1000 ${
            isDark ? 'bg-purple-500/10' : 'bg-indigo-400/6'
          }`}></div>
          <div className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl animate-pulse delay-500 ${
            isDark ? 'bg-orange-500/10' : 'bg-blue-300/5'
          }`}></div>
        </div>

        <div className="relative z-10 animate-pulse space-y-6 sm:space-y-8">
          <div className="flex items-center gap-4">
            <div className={`h-10 sm:h-12 rounded-xl w-24 sm:w-32 ${
              isDark ? 'bg-gray-700/50' : 'bg-slate-300/50'
            }`}></div>
            <div>
              <div className={`h-8 sm:h-10 rounded-lg w-60 sm:w-80 mb-2 ${
                isDark ? 'bg-gray-700/50' : 'bg-slate-300/50'
              }`}></div>
              <div className={`h-4 sm:h-6 rounded w-80 sm:w-96 ${
                isDark ? 'bg-gray-700/30' : 'bg-slate-300/30'
              }`}></div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`h-24 sm:h-32 rounded-2xl sm:rounded-3xl ${
                isDark ? 'bg-gray-700/30' : 'bg-slate-300/30'
              }`}></div>
            ))}
          </div>

          <div className={`h-20 sm:h-24 rounded-2xl sm:rounded-3xl ${
            isDark ? 'bg-gray-700/30' : 'bg-slate-300/30'
          }`}></div>
          <div className="space-y-4 sm:space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-32 sm:h-40 rounded-xl sm:rounded-2xl ${
                isDark ? 'bg-gray-700/30' : 'bg-slate-300/30'
              }`}></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestHistoryLoading;
