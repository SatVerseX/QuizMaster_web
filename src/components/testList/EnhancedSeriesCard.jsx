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
        if (series.tests && series.tests.length > 0) {
          onViewTests && onViewTests(series);
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
            ? "group relative backdrop-blur-xl border rounded-3xl overflow-hidden shadow-2xl transition-all duration-500  cursor-pointer h-80 sm:h-80 flex flex-col border-white/10 border-2 sm:hover:border-white"
            : "group relative backdrop-blur-xl border rounded-3xl overflow-hidden shadow-2xl transition-all duration-500  cursor-pointer h-80 sm:h-80 flex flex-col border-white/10 border-2 sm:hover:border-blue-700"
        }`}
      >
        {/* Premium/Free Badge */}
        <div className="absolute top-4 right-4 z-20">
          {series.isPaid ? (
            isSubscribed ? (
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-xl backdrop-blur-sm border border-green-400/30">
                <FaCheck className="w-3 h-3" />
              </div>
            ) : (
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-xl backdrop-blur-sm border border-yellow-400/30">
                <FaCrown className="w-3 h-3" />
              </div>
            )
          ) : (
            <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-3 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-xl backdrop-blur-sm border border-emerald-400/30">
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
          // Fallback gradient background when no image
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
        )}

        {/* Bottom Stats Container */}
        <div className="relative z-10 mt-auto">
          <div className="bg-white/10 backdrop-blur-xl p-2 border border-white/20">
            <div className="grid grid-cols-2 gap-4">
              {/* Total Tests */}
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-400/30">
                  <FiBookOpen className="text-blue-300 w-7 h-7" />
                </div>
                <div>
                  <div className="text-white font-bold text-xs">
                    {series.totalTests || 0}
                  </div>
                  <div className="text-gray-300 text-xs font-medium">Tests</div>
                </div>
              </div>

              {/* Total Students/Views */}
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-purple-500/20 rounded-xl flex items-center justify-center border border-purple-400/30">
                  <FiUsers className="text-purple-300 w-7 h-7" />
                </div>
                <div>
                  <div className="text-white font-bold text-xs">
                    {series.totalSubscribers || 0}
                  </div>
                  <div className="text-gray-300 text-xs font-medium">
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
