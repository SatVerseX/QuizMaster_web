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
        className={`cursor-pointer p-2 rounded border transition-colors ${
          isDark 
            ? 'bg-gray-800 border-gray-700 hover:bg-gray-750'
            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
        }`}
        onClick={handleClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaBrain className={`w-4 h-4 ${
              isDark ? 'text-purple-400' : 'text-purple-600'
            }`} />
            <div>
              <h3 className={`font-medium ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>
                {testTitle}
              </h3>
              <div className="flex items-center gap-3 text-xs">
                <span className={`${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {testAttempts.length} attempt{testAttempts.length !== 1 ? 's' : ''}
                </span>
                {latestAttempt.isAIGenerated && (
                  <div className={`flex items-center gap-1 px-1 py-0.5 rounded ${
                    isDark ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700'
                  }`}>
                    <FaRobot className="w-2.5 h-2.5" />
                    <span>AI</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Latest Score */}
            <div className={`px-2 py-1 rounded ${getScoreBg(latestAttempt.percentage)}`}>
              <span className={`text-sm font-medium ${getScoreTextColor(latestAttempt.percentage)}`}>
                {latestAttempt.percentage}%
              </span>
            </div>
            {testAttempts.length > 1 && (
              <FiChevronRight className={`w-4 h-4 transition-transform ${
                isExpanded ? 'rotate-90' : ''
              } ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            )}
          </div>
        </div>
      </div>

      {/* Multiple Attempts */}
      {testAttempts.length > 1 && isExpanded && (
        <div className="ml-4 space-y-2">
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
