
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { FaBrain, FaRobot } from 'react-icons/fa';
import { FiChevronRight } from 'react-icons/fi';
import AttemptItem from './AttemptItem';
import { getScoreBg, getScoreTextColor } from '../../utils/scoreUtils';

const TestCard = ({ 
  testTitle, 
  testAttempts, 
  testIndex, 
  seriesTitle, 
  isExpanded, 
  onToggleTest, 
  onViewAttempt 
}) => {
  const { isDark } = useTheme();
  const latestAttempt = testAttempts[testAttempts.length - 1];

  const handleClick = () => {
    if (testAttempts.length > 1) {
      onToggleTest();
    } else {
      onViewAttempt && onViewAttempt(testAttempts[0]);
    }
  };

  return (
    <div className="space-y-2">
      {/* Test Header */}
      <div 
        className={`cursor-pointer p-3 rounded-lg transition-all duration-300 ${
          isDark 
            ? 'bg-gray-800/40 border border-gray-600/30 hover:bg-gray-700/50'
            : 'bg-slate-50/80 border border-slate-200/40 hover:bg-slate-100'
        }`}
        onClick={handleClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FaBrain className={`w-4 h-4 ${
              isDark ? 'text-purple-400' : 'text-purple-600'
            }`} />
            <div>
              <h3 className={`font-bold ${
                isDark ? 'text-white' : 'text-slate-800'
              }`}>
                {testTitle}
              </h3>
              <div className="flex items-center gap-4 text-xs">
                <span className={`${
                  isDark ? 'text-gray-400' : 'text-slate-600'
                }`}>
                  {testAttempts.length} attempt{testAttempts.length !== 1 ? 's' : ''}
                </span>
                {latestAttempt.isAIGenerated && (
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${
                    isDark ? 'bg-purple-500/20' : 'bg-purple-50/80'
                  }`}>
                    <FaRobot className="w-2.5 h-2.5 text-purple-400" />
                    <span className={`${
                      isDark ? 'text-purple-300' : 'text-purple-600'
                    }`}>AI</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Latest Score */}
            <div className={`px-3 py-1 rounded-lg border ${getScoreBg(latestAttempt.percentage)}`}>
              <span className={`text-sm font-bold ${getScoreTextColor(latestAttempt.percentage)}`}>
                {latestAttempt.percentage}%
              </span>
            </div>
            {testAttempts.length > 1 && (
              <FiChevronRight className={`w-4 h-4 transition-transform duration-300 ${
                isExpanded ? 'rotate-90' : ''
              } ${isDark ? 'text-gray-400' : 'text-slate-600'}`} />
            )}
          </div>
        </div>
      </div>

      {/* Multiple Attempts */}
      {testAttempts.length > 1 && isExpanded && (
        <div className="ml-6 space-y-2">
          {testAttempts.map((attempt, attemptIndex) => (
            <AttemptItem
              key={attempt.id}
              attempt={attempt}
              attemptIndex={attemptIndex}
              isLatest={attemptIndex === testAttempts.length - 1}
              onViewAttempt={() => onViewAttempt && onViewAttempt(attempt)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TestCard;
