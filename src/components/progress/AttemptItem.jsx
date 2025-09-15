
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { getScoreBg, getScoreTextColor, getPerformanceIcon, formatDate, formatDuration } from '../../utils/scoreUtils';

const AttemptItem = ({ attempt, attemptIndex, isLatest, onViewAttempt }) => {
  const { isDark } = useTheme();

  return (
    <div 
      className={`p-3 rounded-lg border cursor-pointer transition-all duration-300 hover:scale-[1.01] ${
        isDark 
          ? 'bg-gray-900/40 border-gray-600/30 hover:bg-gray-800/50'
          : 'bg-white/80 border-slate-200/40 hover:bg-white hover:border-slate-300/60'
      }`}
      onClick={onViewAttempt}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Attempt Number */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            isLatest 
              ? (isDark ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-blue-100 text-blue-700 border border-blue-200')
              : (isDark ? 'bg-gray-600/30 text-gray-400 border border-gray-500/30' : 'bg-slate-100 text-slate-600 border border-slate-200')
          }`}>
            {attemptIndex + 1}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-sm font-semibold ${
                isDark ? 'text-gray-300' : 'text-slate-700'
              }`}>
                Attempt {attemptIndex + 1}
              </span>
              {isLatest && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  isDark ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700'
                }`}>
                  Latest
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className={`${
                isDark ? 'text-gray-400' : 'text-slate-600'
              }`}>
                {formatDate(attempt.completedAt)}
              </span>
              <span className={`${
                isDark ? 'text-gray-400' : 'text-slate-600'
              }`}>
                {formatDuration(attempt.timeSpent)}
              </span>
              <span className={`${
                isDark ? 'text-gray-400' : 'text-slate-600'
              }`}>
                {attempt.score}/{attempt.totalQuestions} correct
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1 rounded-lg border ${getScoreBg(attempt.percentage)}`}>
            <span className={`text-sm font-bold ${getScoreTextColor(attempt.percentage)}`}>
              {attempt.percentage}%
            </span>
          </div>
          <div className="scale-75">
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
