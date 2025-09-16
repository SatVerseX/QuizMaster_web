import React, { memo } from "react";
import { FiBookOpen, FiUsers } from "react-icons/fi";
import { FaCrown, FaGem, FaCheck } from "react-icons/fa";

const EnhancedSeriesCard = memo(
  ({
    series,
    isDark,
    hasUserSubscribed,
    isCreator,
    currentUser,
    onSubscribeSeries,
    onViewSeries,
    onViewTests,
    recordFreeView,
  }) => {
    const isSubscribed = hasUserSubscribed(series.id);

    const handleCardClick = async () => {
      if (!currentUser) {
        if (onSubscribeSeries) onSubscribeSeries(series);
      } else if (isCreator(series)) {
        onViewSeries(series);
      } else if (series.isPaid && !isSubscribed) {
        onSubscribeSeries && onSubscribeSeries(series);
      } else {
        await recordFreeView(series);
        // Always send normal users to the tests list; the page can handle empty lists.
        if (onViewTests) {
          onViewTests(series);
        } else {
          onViewSeries(series);
        }
      }
    };

    return (
      <div
        onClick={handleCardClick}
        className={`${
          isDark
            ? "group relative border-2 border-gray-700 rounded-3xl overflow-hidden shadow-lg transition-all duration-300 cursor-pointer h-80 sm:h-80 flex flex-col hover:border-white"
            : "group relative border-2 border-gray-200 rounded-3xl overflow-hidden shadow-lg transition-all duration-300 cursor-pointer h-80 sm:h-80 flex flex-col hover:border-blue-400"
        }`}
      >
        {/* Premium/Free Badge */}
        <div className="absolute top-4 right-4 z-20">
          {series.isPaid ? (
            isSubscribed ? (
              <div className="bg-green-500 text-white px-3 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-md">
                <FaCheck className="w-3 h-3" />
              </div>
            ) : (
              <div className="bg-orange-500 text-white px-3 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-md">
                <FaCrown className="w-3 h-3" />
              </div>
            )
          ) : (
            <div className="bg-green-500 text-white px-3 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-md">
              <span>Free</span>
            </div>
          )}
        </div>

        {/* Cover Image - Full Card Background */}
        {series.coverImageUrl ? (
          <div className="absolute inset-0 z-0">
            <img
              src={series.coverImageUrl}
              alt={series.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            
          </div>
        ) : (
          // Simple gradient background instead of complex multi-stop gradient
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-500 to-purple-600">
            <div className="absolute inset-0 bg-black opacity-40"></div>
          </div>
        )}

        {/* Bottom Stats Container */}
        <div className="relative z-10 mt-auto">
          {/* Simplified background with basic transparency */}
          <div className={`p-4 border-t ${
            isDark 
              ? "bg-black bg-opacity-60 border-gray-600" 
              : "bg-white bg-opacity-80 border-gray-300"
          }`}>
            <div className="grid grid-cols-2 gap-4">
              {/* Total Tests */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                  <FiBookOpen className="text-white w-4 h-4" />
                </div>
                <div>
                  <div className={`${isDark?"text-gray-300 font-bold text-xs":"text-gray-800 font-bold text-xs"}`}>
                    {series.totalTests || 0}
                  </div>
                  <div className={`${isDark?"text-gray-300 text-xs":"text-gray-800 text-xs"}`}>Tests</div>
                </div>
              </div>

              {/* Total Students/Views */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                  <FiUsers className="text-white w-4 h-4" />
                </div>
                <div>
                  <div className={`${isDark?"text-gray-300 font-bold text-xs":"text-gray-800 font-bold text-xs"}`}>
                    {series.totalSubscribers || 0}
                  </div>
                  <div className={`${isDark?"text-gray-300 text-xs":"text-gray-800 text-xs"}`}>
                    Students
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default EnhancedSeriesCard;
