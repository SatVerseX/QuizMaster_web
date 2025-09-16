
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  FiArrowLeft,
  FiBarChart2,
  FiDownload,
  FiActivity
} from 'react-icons/fi';

const TestHistoryHeader = ({ 
  onBack, 
  showStatsDetails, 
  setShowStatsDetails, 
  exportData 
}) => {
  const { isDark } = useTheme();

  return (
    <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
      {/* Back Button and Title */}
      <div className="flex items-center justify-center w-full gap-2 sm:gap-3">
        
      
        <div className='flex flex-col items-center justify-center'>
          <h1 className={`text-xl sm:text-3xl font-black mb-0.5 sm:mb-1 leading-tight transition-all duration-300 justify-center ${
            isDark 
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-purple-200'
              : 'text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600'
          }`}>
            Test Performance
          </h1>
          <p className={`text-sm sm:text-base flex items-center justify-center gap-1.5 transition-all duration-300 ${
            isDark ? 'text-gray-400' : 'text-slate-600'
          }`}>
            <FiActivity className={`w-3 h-3 sm:w-4 sm:h-4 ${
              isDark ? 'text-blue-400' : 'text-blue-600'
            }`} />
            <span className="hidden sm:inline">Track your progress and achievements across assessments</span>
            <span className="sm:hidden">Track your progress</span>
          </p>
        </div>
      </div>

      {/* Mobile Action Buttons */}
      <div className="flex gap-2 sm:hidden ml-auto justify-center">
        <button
          onClick={() => setShowStatsDetails(!showStatsDetails)}
          className={`p-2 rounded-lg transition-all duration-300 justify-center ${
            isDark 
              ? 'bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30'
              : 'bg-white/90 border border-slate-200/60 text-blue-600 hover:bg-white hover:shadow-slate-300/30'
          }`}
        >
          <FiBarChart2 className="w-4 h-4" />
        </button>
        
      </div>
    </div>
  );
};

export default TestHistoryHeader;
