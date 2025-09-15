import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { FiTarget, FiCheckCircle, FiXCircle, FiMinus, FiChevronRight } from 'react-icons/fi';

const SectionPerformanceCard = ({ section, onClick, isSelected }) => {
  const { isDark } = useTheme();
  
  const getAccuracyColor = (accuracy) => {
    if (isDark) {
      if (accuracy >= 80) return 'text-green-400';
      if (accuracy >= 60) return 'text-yellow-300'; // Slightly lighter for dark theme
      return 'text-red-400';
    } else {
      if (accuracy >= 80) return 'text-green-600';
      if (accuracy >= 60) return 'text-yellow-600';
      return 'text-red-600';
    }
  };
  
  const getAccuracyBg = (accuracy) => {
    if (isDark) {
      if (accuracy >= 80) return 'bg-green-500/15 border-green-500/30';
      if (accuracy >= 60) return 'bg-yellow-500/15 border-yellow-500/30';
      return 'bg-red-500/15 border-red-500/30';
    } else {
      if (accuracy >= 80) return 'bg-green-50 border-green-200';
      if (accuracy >= 60) return 'bg-yellow-50 border-yellow-200';
      return 'bg-red-50 border-red-200';
    }
  };
  
  const getProgressBarColor = (accuracy) => {
    if (accuracy >= 80) return 'bg-green-500';
    if (accuracy >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  return (
    <div 
      onClick={onClick}
      className={`cursor-pointer transition-all duration-200 rounded-xl p-4 border-2 group ${
        isSelected 
          ? isDark
            ? 'border-blue-500/60 bg-blue-500/10 shadow-lg'
            : 'border-blue-500 bg-blue-50 shadow-lg'
          : isDark
          ? 'border-gray-700 bg-gray-800/30 hover:bg-gray-800/50 hover:border-gray-600'
          : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 hover:shadow-md'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className={`font-semibold text-base mb-1 ${
            isDark ? 'text-gray-100' : 'text-gray-800'
          }`}>
            {section.name}
          </h4>
          <p className={`text-sm ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {section.stats.total} questions • {section.stats.correct + section.stats.incorrect} attempted
          </p>
        </div>
        
        {/* Accuracy Badge */}
        <div className={`px-3 py-1.5 rounded-lg border ${getAccuracyBg(section.stats.accuracy)}`}>
          <div className="flex items-center gap-1">
            <FiTarget className={`w-3 h-3 ${getAccuracyColor(section.stats.accuracy)}`} />
            <span className={`text-sm font-bold ${getAccuracyColor(section.stats.accuracy)}`}>
              {section.stats.accuracy.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-4">
        <div className={`w-full h-2 rounded-full overflow-hidden ${
          isDark ? 'bg-gray-700' : 'bg-gray-200'
        }`}>
          <div 
            className={`h-2 transition-all duration-300 ${getProgressBarColor(section.stats.accuracy)}`}
            style={{ width: `${section.stats.accuracy}%` }}
          />
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {/* Correct */}
        <div className={`text-center p-2 rounded-lg ${
          isDark ? 'bg-green-500/10' : 'bg-green-50'
        }`}>
          <div className="flex items-center justify-center gap-1 mb-1">
            <FiCheckCircle className={`w-4 h-4 ${
              isDark ? 'text-green-400' : 'text-green-600'
            }`} />
            <span className={`text-lg font-bold ${
              isDark ? 'text-green-400' : 'text-green-600'
            }`}>
              {section.stats.correct}
            </span>
          </div>
          <p className={`text-xs font-medium ${
            isDark ? 'text-green-300' : 'text-green-700'
          }`}>
            Correct
          </p>
        </div>
        
        {/* Incorrect */}
        <div className={`text-center p-2 rounded-lg ${
          isDark ? 'bg-red-500/10' : 'bg-red-50'
        }`}>
          <div className="flex items-center justify-center gap-1 mb-1">
            <FiXCircle className={`w-4 h-4 ${
              isDark ? 'text-red-400' : 'text-red-600'
            }`} />
            <span className={`text-lg font-bold ${
              isDark ? 'text-red-400' : 'text-red-600'
            }`}>
              {section.stats.incorrect}
            </span>
          </div>
          <p className={`text-xs font-medium ${
            isDark ? 'text-red-300' : 'text-red-700'
          }`}>
            Incorrect
          </p>
        </div>
        
        {/* Skipped */}
        <div className={`text-center p-2 rounded-lg ${
          isDark ? 'bg-gray-700/50' : 'bg-gray-100'
        }`}>
          <div className="flex items-center justify-center gap-1 mb-1">
            <FiMinus className={`w-4 h-4 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <span className={`text-lg font-bold ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {section.stats.skipped}
            </span>
          </div>
          <p className={`text-xs font-medium ${
            isDark ? 'text-gray-500' : 'text-gray-600'
          }`}>
            Skipped
          </p>
        </div>
      </div>
      
      {/* Action Footer */}
      <div className={`flex items-center justify-between pt-3 border-t ${
        isDark ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <span className={`text-sm font-medium ${
          isDark ? 'text-gray-300' : 'text-gray-600'
        }`}>
          View Questions
        </span>
        <FiChevronRight className={`w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 ${
          isDark ? 'text-gray-400' : 'text-gray-500'
        }`} />
      </div>
      
      {/* Performance Indicator */}
      {section.stats.accuracy >= 80 && (
        <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
          isDark ? 'bg-green-500 text-white' : 'bg-green-600 text-white'
        }`}>
          ★
        </div>
      )}
    </div>
  );
};

export default SectionPerformanceCard;
