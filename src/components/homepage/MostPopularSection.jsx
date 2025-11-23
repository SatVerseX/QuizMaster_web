import React, { useState, useEffect } from "react";
import { FiUsers, FiStar, FiPlay, FiEye, FiAward, FiBookOpen, FiCheck } from "react-icons/fi";
import { FaCrown, FaTrophy, FaMedal } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";

const MostPopularSection = ({
  isDark,
  series = [],
  onViewSeries,
  onSubscribeSeries,
  onViewTests,
  hasUserSubscribed,
  isCreator,
  currentUser,
  recordFreeView,
}) => {
  const [popularSeries, setPopularSeries] = useState([]);
  const navigate = useNavigate();

  // -- Data Fetching Logic (Preserved) --
  const fetchTestCounts = async (seriesData) => {
    const seriesWithCounts = [];
    for (const seriesItem of seriesData) {
      try {
        const quizzesQuery = await getDocs(query(collection(db, "quizzes"), where("testSeriesId", "==", seriesItem.id)));
        const sectionQuizzesQuery = await getDocs(query(collection(db, "section-quizzes"), where("testSeriesId", "==", seriesItem.id)));
        const totalTests = quizzesQuery.size + sectionQuizzesQuery.size;
        seriesWithCounts.push({ ...seriesItem, totalTests: totalTests });
      } catch (error) {
        seriesWithCounts.push({ ...seriesItem, totalTests: seriesItem.totalTests || 0 });
      }
    }
    return seriesWithCounts;
  };

  useEffect(() => {
    const loadSeriesWithCounts = async () => {
      const sorted = series
        .filter((s) => s.isPublished !== false)
        .sort((a, b) => {
          const scoreA = (a.totalSubscribers || 0) * 0.8 + (a.totalViews || 0) * 0.2 + (a.rating || 4.5) * 10;
          const scoreB = (b.totalSubscribers || 0) * 0.8 + (b.totalViews || 0) * 0.2 + (b.rating || 4.5) * 10;
          return scoreB - scoreA;
        })
        .slice(0, 6);
      const seriesWithCounts = await fetchTestCounts(sorted);
      setPopularSeries(seriesWithCounts);
    };
    loadSeriesWithCounts();
  }, [series]);

  // -- Navigation Handler (Preserved) --
  const handleMainAction = async (seriesItem) => {
    const isSubscribed = hasUserSubscribed(seriesItem.id);
    const userIsCreator = isCreator(seriesItem);
    try {
      if (!currentUser) {
        onSubscribeSeries ? onSubscribeSeries(seriesItem) : navigate(`/series/${seriesItem.id}/subscribe`);
        return;
      }
      if (userIsCreator) {
        onViewSeries ? onViewSeries(seriesItem) : navigate(`/series/${seriesItem.id}/dashboard`);
        return;
      }
      if (seriesItem.isPaid && !isSubscribed) {
        onSubscribeSeries ? onSubscribeSeries(seriesItem) : navigate(`/series/${seriesItem.id}/subscribe`);
        return;
      }
      if (typeof recordFreeView === "function") {
        try { await recordFreeView(seriesItem); } catch (_) {}
      }
      if (onViewTests) onViewTests(seriesItem);
      else if (onViewSeries) onViewSeries(seriesItem);
      else navigate(`/series/${seriesItem.id}/tests`);
    } catch (error) {
      navigate(`/series/${seriesItem.id}/tests`);
    }
  };

  const handleViewDetails = (seriesItem) => {
      const subscribed = hasUserSubscribed(seriesItem.id);
      const creator = isCreator(seriesItem);
      if (!creator && (subscribed || !seriesItem.isPaid)) {
        if (onViewTests) { onViewTests(seriesItem); return; }
      }
      if (onViewSeries) onViewSeries(seriesItem);
      else navigate(`/series/${seriesItem.id}/dashboard`);
  };

  // -- Styling Helpers --
  const getRankStyle = (index) => {
    switch(index) {
      case 0: return { 
        gradient: 'from-yellow-400 to-yellow-600', 
        shadow: 'shadow-yellow-500/40',
        border: 'border-yellow-500/50',
        icon: FaTrophy,
        label: 'Best Seller'
      };
      case 1: return { 
        gradient: 'from-slate-300 to-slate-500', 
        shadow: 'shadow-slate-500/40',
        border: 'border-slate-400/50',
        icon: FaMedal,
        label: 'Top Rated'
      };
      case 2: return { 
        gradient: 'from-orange-400 to-orange-600', 
        shadow: 'shadow-orange-500/40',
        border: 'border-orange-500/50',
        icon: FaMedal,
        label: 'Student Choice'
      };
      default: return null;
    }
  };

  if (popularSeries.length === 0) return null;

  return (
    <section className={`py-16 relative ${isDark ? "bg-gray-900/20" : "bg-white"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-4 ${
            isDark ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-yellow-50 text-yellow-600 border border-yellow-200'
          }`}>
            <FaCrown className="w-3.5 h-3.5" />
            <span>Market Leaders</span>
          </div>
          
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 tracking-tight ${
            isDark ? "text-white" : "text-slate-900"
          }`}>
            Most Popular Series
          </h2>
          <p className={`text-base max-w-2xl mx-auto ${
            isDark ? "text-slate-400" : "text-slate-600"
          }`}>
            The highest-rated and most subscribed content, curated by our community.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {popularSeries.map((seriesItem, index) => {
            const isSubscribed = hasUserSubscribed(seriesItem.id);
            const userIsCreator = isCreator(seriesItem);
            const rankStyle = getRankStyle(index);
            const RankIcon = rankStyle?.icon;

            return (
              <div
                key={seriesItem.id}
                onClick={() => handleViewDetails(seriesItem)}
                className={`group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer border ${
                  isDark 
                    ? `bg-slate-800/40 hover:bg-slate-800 ${rankStyle ? rankStyle.border : 'border-slate-700 hover:border-slate-600'}`
                    : `bg-white shadow-sm hover:shadow-xl ${rankStyle ? rankStyle.border : 'border-slate-100 hover:border-slate-200'}`
                }`}
              >
                {/* Glow Effect for Top 3 */}
                {rankStyle && (
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${rankStyle.gradient}`} />
                )}

                {/* Cover Image Area */}
                <div className="aspect-video relative overflow-hidden bg-gray-900">
                  {/* Rank Badge (Top Left) */}
                  {rankStyle && (
                    <div className={`absolute top-3 left-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-lg shadow-lg bg-gradient-to-r ${rankStyle.gradient} text-white text-xs font-bold`}>
                      <RankIcon className="w-3 h-3" />
                      {rankStyle.label}
                    </div>
                  )}

                  {/* Status Badge (Top Right) */}
                  <div className="absolute top-3 right-3 z-20">
                    {seriesItem.isPaid ? (
                      isSubscribed ? (
                        <span className="flex items-center gap-1 bg-emerald-500/90 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-lg">
                          <FiCheck className="w-3 h-3" /> Purchased
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 bg-white/90 backdrop-blur-sm text-slate-900 text-xs font-bold px-2.5 py-1 rounded-md shadow-lg">
                          <FaCrown className="w-3 h-3 text-yellow-500" /> Premium
                        </span>
                      )
                    ) : (
                      <span className="bg-emerald-500/90 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-lg">
                        Free
                      </span>
                    )}
                  </div>

                  {/* Image */}
                  {seriesItem.coverImageUrl ? (
                    <img
                      src={seriesItem.coverImageUrl}
                      alt={seriesItem.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  
                  {/* Fallback Image Pattern */}
                  <div className={`absolute inset-0 items-center justify-center flex-col p-4 ${seriesItem.coverImageUrl ? 'hidden' : 'flex'} ${
                    isDark ? 'bg-slate-800' : 'bg-slate-100'
                  }`}>
                    <div className={`w-full h-full absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-400 via-gray-900 to-black`} />
                    <FaCrown className={`w-12 h-12 mb-3 relative z-10 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                    <span className={`text-xs font-medium relative z-10 uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {seriesItem.title}
                    </span>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </div>

                {/* Content Body */}
                <div className="flex-1 p-5 flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className={`text-lg font-bold line-clamp-2 leading-tight ${
                      isDark ? "text-white group-hover:text-yellow-400" : "text-slate-900 group-hover:text-blue-600"
                    } transition-colors`}>
                      {seriesItem.title}
                    </h3>
                  </div>

                  {/* Metadata Row */}
                  <div className={`flex items-center gap-4 text-xs mb-4 pb-4 border-b ${
                    isDark ? 'text-slate-400 border-slate-700' : 'text-slate-500 border-slate-100'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      <FiStar className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                      <span className={isDark ? "text-slate-200" : "text-slate-700"}>
                        {seriesItem.rating || 0}
                      </span>
                      <span className="opacity-60">({seriesItem.reviewCount || 0})</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-current opacity-30" />
                    <div className="flex items-center gap-1.5">
                      <FiUsers className="w-3.5 h-3.5" />
                      <span>{seriesItem.totalSubscribers || 0}</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-current opacity-30" />
                    <div className="flex items-center gap-1.5">
                      <FiBookOpen className="w-3.5 h-3.5" />
                      <span>{seriesItem.totalTests || 0} Tests</span>
                    </div>
                  </div>

                  <p className={`text-sm line-clamp-2 mb-5 flex-1 ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}>
                    {seriesItem.description || "No description available for this series."}
                  </p>

                  {/* Action Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMainAction(seriesItem);
                    }}
                    className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                      userIsCreator
                        ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-500/25 shadow-lg"
                        : isSubscribed
                        ? "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-emerald-500/25 shadow-lg"
                        : !seriesItem.isPaid
                        ? "bg-slate-800 text-white hover:bg-black dark:bg-slate-700 dark:hover:bg-slate-600"
                        : isDark
                          ? "bg-yellow-500 text-slate-900 hover:bg-yellow-400 shadow-lg shadow-yellow-900/20"
                          : "bg-yellow-500 text-white hover:bg-yellow-600 shadow-lg shadow-yellow-500/20"
                    }`}
                  >
                    <FiPlay className="w-4 h-4" />
                    {userIsCreator ? "Manage Series" : 
                     isSubscribed ? "Continue Learning" : 
                     !seriesItem.isPaid ? "Start for Free" : 
                     "Subscribe Now"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Action */}
        <div className="mt-12 text-center">
          <button
            onClick={() => navigate("/test-series")}
            className={`group inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
              isDark
                ? "text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 hover:bg-slate-800"
                : "text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 hover:bg-white shadow-sm"
            }`}
          >
            <span>View Full Catalog</span>
            <FiAward className="w-4 h-4 transition-transform group-hover:scale-110" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default MostPopularSection;