import React from 'react';
import TestSeriesCard from './TestSeriesCard';

const TestSeriesList = ({ 
  groupedAttempts, 
  expandedSeries, 
  expandedTests, 
  toggleSeries, 
  toggleTest, 
  onViewAttempt 
}) => {
  return (
    <div className="space-y-3">
      {Object.entries(groupedAttempts).map(([seriesTitle, testsInSeries], seriesIndex) => (
        <TestSeriesCard
          key={seriesTitle}
          seriesTitle={seriesTitle}
          testsInSeries={testsInSeries}
          seriesIndex={seriesIndex}
          isExpanded={expandedSeries[seriesTitle]}
          expandedTests={expandedTests}
          onToggleSeries={() => toggleSeries(seriesTitle)}
          onToggleTest={(testTitle) => toggleTest(seriesTitle, testTitle)}
          onViewAttempt={onViewAttempt}
        />
      ))}
    </div>
  );
};

export default TestSeriesList;
