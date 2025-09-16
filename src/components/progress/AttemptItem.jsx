import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { getScoreBg, getScoreTextColor, getPerformanceIcon, formatDate, formatDuration } from '../../utils/scoreUtils';

const AttemptItem = ({ attempt, attemptIndex, isLatest, onViewAttempt }) => {
  const { isDark } = useTheme();

  return (
    <div 
      className={`p-2 rounded border cursor-pointer transition-colors ${
        isDark 
          ? 'bg-gray-800 border-gray-700 hover:bg-gray-750'
          : 'bg-white border-gray-200 hover:bg-gray-50'
      }`}
      onClick={onViewAttempt}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Attempt Number */}
          <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-medium ${
            isLatest 
              ? (isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white')
              : (isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600')
          }`}>
            {attemptIndex + 1}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-sm font-medium ${
                isDark ? 'text-gray-200' : 'text-gray-800'
              }`}>
                Attempt {attemptIndex + 1}
              </span>
              {isLatest && (
                <span className={`text-xs px-1 py-0.5 rounded ${
                  isDark ? 'bg-green-600 text-white' : 'bg-green-500 text-white'
                }`}>
                  Latest
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className={`${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {formatDate(attempt.completedAt)}
              </span>
              <span className={`${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {formatDuration(attempt.timeSpent)}
              </span>
              <span className={`${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {attempt.score}/{attempt.totalQuestions} correct
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`px-2 py-1 rounded ${getScoreBg(attempt.percentage)}`}>
            <span className={`text-sm font-medium ${getScoreTextColor(attempt.percentage)}`}>
              {attempt.percentage}%
            </span>
          </div>
          <div className="text-sm">
            {(() => {
              const { Icon, className } = getPerformanceIcon(attempt.percentage);
              return <Icon className={className} />;
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttemptItem;
