import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { FiArrowLeft, FiDownload, FiShare2 } from 'react-icons/fi';
import { FaGraduationCap } from 'react-icons/fa';

const TestAttemptHeader = ({ attempt, onBack, onDownload, onShare }) => {
  const { isDark } = useTheme();

  return (
    <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-8">
      <button
        onClick={onBack}
        className={`group backdrop-blur-xl border rounded-xl px-4 sm:px-6 py-2 sm:py-3 font-medium transition-all duration-300 flex items-center gap-2 sm:gap-3 shadow-lg hover:shadow-xl hover:scale-105 ${
          isDark 
            ? 'bg-gradient-to-r from-gray-800/80 to-gray-700/80 border-gray-600/40 text-gray-300 hover:from-gray-700/80 hover:to-gray-600/80' 
            : 'bg-white/90 border-slate-200/60 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-slate-200/40'
        }`}
      >
        <FiArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:-translate-x-1" />
        <span className="hidden sm:inline">Back to History</span>
        <span className="sm:hidden">Back</span>
      </button>
      
      <div className="flex-1">
        <h1 className={`text-2xl sm:text-4xl font-black mb-1 sm:mb-2 leading-tight ${
          isDark 
            ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-purple-200' 
            : 'text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600'
        }`}>
          Test Analysis
        </h1>
        <p className={`text-lg sm:text-xl flex items-center gap-2 ${
          isDark ? 'text-gray-400' : 'text-slate-600'
        }`}>
          <FaGraduationCap className={`w-4 h-4 sm:w-5 sm:h-5 ${
            isDark ? 'text-blue-400' : 'text-blue-600'
          }`} />
          {attempt.testTitle} • {attempt.testSeriesTitle}
        </p>
      </div>

      <div className="flex gap-3">
        <button 
          onClick={onDownload}
          className={`group border px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 flex items-center gap-2 ${
            isDark 
              ? 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 hover:from-green-600/30 hover:to-emerald-600/30 border-green-500/40 text-green-300' 
              : 'bg-gradient-to-r from-green-100/60 to-emerald-100/60 hover:from-green-200/60 hover:to-emerald-200/60 border-green-400/60 text-green-700 hover:text-green-800'
          }`}
        >
          <FiDownload className="w-4 h-4" />
          <span className="hidden sm:inline">Download</span>
        </button>
        
        <button 
          onClick={onShare}
          className={`group border px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 flex items-center gap-2 ${
            isDark 
              ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 border-blue-500/40 text-blue-300' 
              : 'bg-gradient-to-r from-blue-100/60 to-indigo-100/60 hover:from-blue-200/60 hover:to-indigo-200/60 border-blue-400/60 text-blue-700 hover:text-blue-800'
          }`}
        >
          <FiShare2 className="w-4 h-4" />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>
    </div>
  );
};

export default TestAttemptHeader;
