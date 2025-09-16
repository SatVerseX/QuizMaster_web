import React from 'react';
import { FaFire } from 'react-icons/fa';
import EnhancedSeriesCard from '../testList/EnhancedSeriesCard';

const TrendingSection = ({
  series,
  isDark,
  hasUserSubscribed,
  isCreator,
  currentUser,
  onSubscribeSeries,
  onViewSeries,
  onViewTests,
  recordFreeView
}) => {
  if (series.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="text-center mb-6">
        <h2 className={` p-2 sm:p-4 rounded-lg sm:text-3xl font-bold mb-3 flex items-center justify-center gap-2 ${
          isDark ? 'text-white' : 'text-red-600 bg-red-100'
        }`}>
          <FaFire className="text-red-600 text-2xl" />
          Trending Now
        </h2>
        <p className={`text-base max-w-2xl mx-auto ${
          isDark ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Most popular test series this week
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
        {series.map((seriesItem, index) => (
          <div key={seriesItem.id} className="relative">
            {/* Simplified trending badge for top 3 */}
            {index < 3 && (
              <div className="absolute -top-1 -left-1 z-10">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  index === 0 ? 'bg-yellow-500' :
                  index === 1 ? 'bg-gray-500' :
                  'bg-orange-500'
                }`}>
                  #{index + 1}
                </div>
              </div>
            )}
            
            {/* Reuse existing card component */}
            <EnhancedSeriesCard 
              series={seriesItem}
              isDark={isDark}
              hasUserSubscribed={hasUserSubscribed}
              isCreator={isCreator}
              currentUser={currentUser}
              onSubscribeSeries={onSubscribeSeries}
              onViewSeries={onViewSeries}
              onViewTests={onViewTests}
              recordFreeView={recordFreeView}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingSection;
