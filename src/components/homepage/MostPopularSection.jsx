import React, { useState, useEffect } from "react";
import { FiUsers, FiStar, FiPlay, FiEye, FiAward, FiBookOpen, FiCheck, FiArrowRight } from "react-icons/fi";
import { FaCrown, FaTrophy, FaMedal, FaFire } from "react-icons/fa";
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

  // -- Visual Helpers --
  const getRankConfig = (index) => {
    switch(index) {
      case 0: return { 
        color: 'text-amber-500', 
        bg: 'bg-amber-500',
        lightBg: 'bg-amber-50',
        darkBg: 'bg-amber-500/10',
        border: 'border-amber-200',
        icon: FaTrophy,
        label: '1st Place'
      };
      case 1: return { 
        color: 'text-slate-400', 
        bg: 'bg-slate-400',
        lightBg: 'bg-slate-100',
        darkBg: 'bg-slate-400/10',
        border: 'border-slate-200',
        icon: FaMedal,
        label: '2nd Place'
      };
      case 2: return { 
        color: 'text-orange-400', 
        bg: 'bg-orange-400',
        lightBg: 'bg-orange-50',
        darkBg: 'bg-orange-400/10',
        border: 'border-orange-200',
        icon: FaMedal,
        label: '3rd Place'
      };
      default: return null;
    }
  };

  if (popularSeries.length === 0) return null;

  return (
    <section className={`py-12 ${isDark ? "bg-transparent" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto">
        <h2 className={`text-center text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
          Most Popular
        </h2>
        <p className={`text-center text-sm mb-10 mt-2 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
          Explore the most popular series on our platform.
        </p>
        {/* Section Header */}
        {/* Note: The parent typically handles headers, but we include a clean one just in case */}
        {/* <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 px-1">
          <div>
            <div className="flex items-center gap-2 text-amber-500 mb-2">
              <FaCrown size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Market Leaders</span>
            </div>
            <h2 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              Most Popular Series
            </h2>
          </div>
          <button onClick={() => navigate("/test-series")} className={`hidden md:flex items-center gap-2 text-sm font-medium ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'}`}>
            View Leaderboard <FiArrowRight />
          </button>
        </div> */}

        {/* Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {popularSeries.map((seriesItem, index) => {
            const isSubscribed = hasUserSubscribed(seriesItem.id);
            const userIsCreator = isCreator(seriesItem);
            const rankConfig = getRankConfig(index);
            const RankIcon = rankConfig?.icon;

            return (
              <div
                key={seriesItem.id}
                onClick={() => handleViewDetails(seriesItem)}
                className={`group relative flex flex-col rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer overflow-hidden ${
                  isDark 
                    ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' 
                    : 'bg-white border-zinc-200 hover:border-emerald-200 shadow-sm'
                }`}
              >
                {/* 1. Image Section */}
                <div className="aspect-[16/9] relative overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  {seriesItem.coverImageUrl ? (
                    <img
                      src={seriesItem.coverImageUrl}
                      alt={seriesItem.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center flex-col opacity-50">
                      <FaCrown className={`w-12 h-12 mb-2 ${isDark ? 'text-zinc-700' : 'text-zinc-300'}`} />
                    </div>
                  )}
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 via-transparent to-transparent opacity-60" />

                  {/* Rank Badge (Top Left - Specialized) */}
                  {rankConfig && (
                    <div className="absolute top-0 left-4">
                      <div className={`w-10 h-12 ${rankConfig.bg} text-white flex flex-col items-center justify-center rounded-b-lg shadow-lg`}>
                        <RankIcon className="w-4 h-4 mb-0.5" />
                        <span className="text-sm font-bold leading-none">{index + 1}</span>
                      </div>
                    </div>
                  )}

                  {/* Status Badge (Top Right - Minimal) */}
                  <div className="absolute top-3 right-3">
                    {isSubscribed ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold shadow-sm backdrop-blur-md">
                        <FiCheck size={12} /> Purchased
                      </span>
                    ) : seriesItem.isPaid ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 text-zinc-900 text-xs font-bold shadow-sm backdrop-blur-md">
                        <FaCrown size={10} className="text-amber-500" /> Premium
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold shadow-sm backdrop-blur-md">
                        Free
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. Content Section */}
                <div className="flex-1 p-5 flex flex-col">
                  
                  {/* Title & Rating */}
                  <div className="mb-4">
                    <h3 className={`text-lg font-bold leading-snug line-clamp-2 mb-2 group-hover:text-emerald-600 transition-colors ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
                      {seriesItem.title}
                    </h3>
                    
                    <div className="flex items-center gap-4 text-xs font-medium">
                      <div className="flex items-center gap-1 text-amber-400">
                        <FiStar className="fill-current" />
                        <span className={isDark ? 'text-zinc-300' : 'text-zinc-700'}>{seriesItem.rating || 4.5}</span>
                      </div>
                      <div className={`flex items-center gap-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                        <div className="w-1 h-1 rounded-full bg-current" />
                        <span>{seriesItem.reviewCount || 12} reviews</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className={`grid grid-cols-2 gap-2 mb-5 pb-5 border-b border-dashed ${isDark ? 'border-zinc-800' : 'border-zinc-100'}`}>
                    <div className={`flex items-center gap-2 p-2 rounded-lg ${isDark ? 'bg-zinc-800/50' : 'bg-zinc-50'}`}>
                      <FiUsers className={`w-4 h-4 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`} />
                      <div className="flex flex-col">
                        <span className={`text-xs font-bold ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                          {seriesItem.totalSubscribers || 0}
                        </span>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Students</span>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 p-2 rounded-lg ${isDark ? 'bg-zinc-800/50' : 'bg-zinc-50'}`}>
                      <FiBookOpen className={`w-4 h-4 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`} />
                      <div className="flex flex-col">
                        <span className={`text-xs font-bold ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                          {seriesItem.totalTests || 0}
                        </span>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Tests</span>
                      </div>
                    </div>
                  </div>

                  {/* Description (Hidden on mobile to save space, visible on desktop) */}
                  <p className={`text-sm line-clamp-2 mb-4 flex-1 hidden sm:block ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {seriesItem.description || "Comprehensive test series designed to boost your exam preparation."}
                  </p>

                  {/* 3. Action Footer */}
                  <div className="mt-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMainAction(seriesItem);
                      }}
                      className={`w-full py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                        userIsCreator
                          ?isDark ? " bg-zinc-800 text-white hover:bg-zinc-700" : "bg-zinc-800 text-white hover:bg-zinc-700"
                          : isSubscribed
                          ? isDark ? "bg-emerald-900/20 text-emerald-400 hover:bg-emerald-900/30" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 "
                          : seriesItem.isPaid
                          ? isDark ? " bg-white text-zinc-900 hover:bg-zinc-100 shadow-sm" : "bg-zinc-900 text-white hover:bg-zinc-800  shadow-sm"
                          : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-500/20"
                      }`}
                    >
                      {userIsCreator ? (
                         <>Manage Series</>
                      ) : isSubscribed ? (
                         <><FiPlay className="w-4 h-4" /> Continue</>
                      ) : (
                         <>{seriesItem.isPaid ? 'Subscribe Now' : 'Start Free'}</>
                      )}
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile View All */}
        <div className="mt-8 text-center md:hidden">
          <button onClick={() => navigate("/test-series")} className="text-sm font-medium text-emerald-600">
            View All Series
          </button>
        </div>

      </div>
    </section>
  );
};

export default MostPopularSection;