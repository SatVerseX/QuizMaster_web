import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { FiBookOpen, FiChevronRight } from 'react-icons/fi';
import TestCard from './TestCard';

const TestSeriesCard = ({ 
  seriesTitle, 
  testsInSeries, 
  seriesIndex, 
  isExpanded, 
  expandedTests, 
  onToggleSeries, 
  onToggleTest, 
  onViewAttempt 
}) => {
  const { isDark } = useTheme();

  return (
    <div 
      className={`rounded-lg p-4 sm:p-5 border hover:shadow-lg ${
        isDark 
          ? 'bg-gray-800 border-gray-700 hover:border-blue-600'
          : 'bg-white border-gray-200 hover:border-blue-300'
      }`}
    >
      {/* Series Header */}
      <div 
        className="cursor-pointer"
        onClick={onToggleSeries}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isDark ? 'bg-blue-600/20' : 'bg-blue-100'
            }`}>
              <FiBookOpen className={`w-5 h-5 ${
                isDark ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
            <div>
              <h2 className={`text-lg sm:text-xl font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {seriesTitle}
              </h2>
              <p className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {Object.keys(testsInSeries).length} test{Object.keys(testsInSeries).length !== 1 ? 's' : ''} attempted
              </p>
            </div>
          </div>
          <FiChevronRight className={`w-5 h-5 transition-transform ${
            isExpanded ? 'rotate-90' : ''
          } ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
        </div>
      </div>

      {/* Tests within Series */}
      {isExpanded && (
        <div className="ml-6 space-y-3">
          {Object.entries(testsInSeries).map(([testTitle, testAttempts], testIndex) => (
            <TestCard
              key={testTitle}
              testTitle={testTitle}
              testAttempts={testAttempts}
              testIndex={testIndex}
              seriesTitle={seriesTitle}
              isExpanded={expandedTests[`${seriesTitle}-${testTitle}`]}
              onToggleTest={() => onToggleTest(testTitle)}
              onViewAttempt={onViewAttempt}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TestSeriesCard;
