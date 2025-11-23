import React from 'react';
import { FaFire, FaCrown } from 'react-icons/fa';
import { FiTrendingUp } from 'react-icons/fi';
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
  if (!series || series.length === 0) return null;

  // Helper for rank styling
  const getRankStyle = (index) => {
    switch (index) {
      case 0: // Gold
        return {
          bg: 'bg-gradient-to-br from-yellow-300 to-yellow-500',
          shadow: 'shadow-yellow-500/50',
          text: 'text-yellow-950',
          label: 'Top 1',
          glow: isDark ? 'bg-yellow-500/10' : 'bg-yellow-500/5'
        };
      case 1: // Silver
        return {
          bg: 'bg-gradient-to-br from-slate-300 to-slate-400',
          shadow: 'shadow-slate-500/50',
          text: 'text-slate-900',
          label: 'Top 2',
          glow: ''
        };
      case 2: // Bronze
        return {
          bg: 'bg-gradient-to-br from-orange-300 to-orange-500',
          shadow: 'shadow-orange-500/50',
          text: 'text-orange-900',
          label: 'Top 3',
          glow: ''
        };
      default:
        return null;
    }
  };

  return (
    <section className="mb-16">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center mb-10">
        <div className={`inline-flex items-center justify-center p-3 rounded-2xl mb-4 ${
          isDark ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-500'
        }`}>
          <FaFire className="text-2xl animate-pulse" />
        </div>
        
        <h2 className={`text-3xl sm:text-4xl font-bold mb-3 tracking-tight ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          Trending Now
        </h2>
        
        <p className={`text-base max-w-xl mx-auto flex items-center justify-center gap-2 ${
          isDark ? 'text-slate-400' : 'text-slate-600'
        }`}>
          <FiTrendingUp className="w-4 h-4" />
          Most popular test series this week
        </p>
      </div>
      
      {/* Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto px-4 sm:px-6">
        {series.map((seriesItem, index) => {
          const rankStyle = getRankStyle(index);
          
          return (
            <div 
              key={seriesItem.id} 
              className="relative group"
            >
              {/* Rank Glow Effect for #1 */}
              {index === 0 && (
                <div className={`absolute -inset-4 rounded-[2rem] blur-2xl transition-opacity opacity-70 group-hover:opacity-100 -z-10 ${rankStyle.glow}`} />
              )}

              {/* Rank Badge (Only for Top 3) */}
              {rankStyle && (
                <div className="absolute -top-3 -left-3 z-20 flex flex-col items-center">
                  <div className={`
                    w-10 h-10 rounded-xl flex items-center justify-center 
                    shadow-lg transform -rotate-6 transition-transform group-hover:rotate-0
                    ${rankStyle.bg} ${rankStyle.shadow}
                  `}>
                    {index === 0 ? (
                      <FaCrown className={`w-5 h-5 ${rankStyle.text}`} />
                    ) : (
                      <span className={`text-lg font-black ${rankStyle.text}`}>
                        {index + 1}
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              {/* Component Wrapper */}
              <div className={`h-full transition-transform duration-300 ${index === 0 ? 'hover:-translate-y-1' : ''}`}>
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
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default TrendingSection;