import React, { useState, useEffect } from "react";
import { FiUsers, FiStar, FiPlay, FiEye, FiAward } from "react-icons/fi";
import { FaCrown, FaTrophy, FaMedal, FaCheck } from "react-icons/fa";
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

  // Optimized function to fetch test counts
  const fetchTestCounts = async (seriesData) => {
    const seriesWithCounts = [];

    for (const seriesItem of seriesData) {
      try {
        const quizzesQuery = await getDocs(
          query(
            collection(db, "quizzes"),
            where("testSeriesId", "==", seriesItem.id)
          )
        );
        const sectionQuizzesQuery = await getDocs(
          query(
            collection(db, "section-quizzes"),
            where("testSeriesId", "==", seriesItem.id)
          )
        );

        const totalTests = quizzesQuery.size + sectionQuizzesQuery.size;

        seriesWithCounts.push({
          ...seriesItem,
          totalTests: totalTests,
        });
      } catch (error) {
        console.warn(
          `Error fetching test count for series ${seriesItem.id}:`,
          error
        );
        seriesWithCounts.push({
          ...seriesItem,
          totalTests: seriesItem.totalTests || 0,
        });
      }
    }
    return seriesWithCounts;
  };

  useEffect(() => {
    const loadSeriesWithCounts = async () => {
      const sorted = series
        .filter((s) => s.isPublished !== false)
        .sort((a, b) => {
          const scoreA =
            (a.totalSubscribers || 0) * 0.8 +
            (a.totalViews || 0) * 0.2 +
            (a.rating || 4.5) * 10;
          const scoreB =
            (b.totalSubscribers || 0) * 0.8 +
            (b.totalViews || 0) * 0.2 +
            (b.rating || 4.5) * 10;
          return scoreB - scoreA;
        })
        .slice(0, 6);

      const seriesWithCounts = await fetchTestCounts(sorted);
      setPopularSeries(seriesWithCounts);
    };

    loadSeriesWithCounts();
  }, [series]);

  // Fixed navigation handlers
  const handleMainAction = async (seriesItem) => {
    const isSubscribed = hasUserSubscribed(seriesItem.id);
    const userIsCreator = isCreator(seriesItem);

    try {
      if (!currentUser) {
        // User not logged in - redirect to subscription
        if (onSubscribeSeries) {
          onSubscribeSeries(seriesItem);
        } else {
          navigate(`/series/${seriesItem.id}/subscribe`);
        }
        return;
      }

      if (userIsCreator) {
        // Creator - go to dashboard
        if (onViewSeries) {
          onViewSeries(seriesItem);
        } else {
          navigate(`/series/${seriesItem.id}/dashboard`);
        }
        return;
      }

      if (seriesItem.isPaid && !isSubscribed) {
        // Paid series, not subscribed - go to subscription
        if (onSubscribeSeries) {
          onSubscribeSeries(seriesItem);
        } else {
          navigate(`/series/${seriesItem.id}/subscribe`);
        }
        return;
      }

      // Free series or already subscribed - record view and go to tests
      if (typeof recordFreeView === "function") {
        try {
          await recordFreeView(seriesItem);
        } catch (_) {}
      }

      if (onViewTests) {
        onViewTests(seriesItem);
      } else if (onViewSeries) {
        onViewSeries(seriesItem);
      } else {
        // Fallback navigation
        navigate(`/series/${seriesItem.id}/tests`);
      }
    } catch (error) {
      console.error("Navigation error:", error);
      // Fallback hard navigation to tests
      navigate(`/series/${seriesItem.id}/tests`);
    }
  };

  const handleViewDetails = (seriesItem) => {
    try {
      const subscribed = hasUserSubscribed(seriesItem.id);
      const creator = isCreator(seriesItem);

      // For normal users: prefer tests list for free or already-subscribed series
      if (!creator && (subscribed || !seriesItem.isPaid)) {
        if (onViewTests) {
          onViewTests(seriesItem);
          return;
        }
      }

      // Fallbacks: creator → dashboard; others → dashboard if tests handler not available
      if (onViewSeries) {
        onViewSeries(seriesItem);
      } else {
        navigate(`/series/${seriesItem.id}/dashboard`);
      }
    } catch (error) {
      console.error("Details navigation error:", error);
    }
  };

  const getPopularityBadge = (index) => {
    if (index === 0)
      return {
        text: "👑 #1 Bestseller",
        color: "bg-yellow-500",
        icon: FaTrophy,
      };
    if (index === 1)
      return { text: "🥈 #2 Popular", color: "bg-gray-500", icon: FaMedal };
    if (index === 2)
      return { text: "🥉 #3 Choice", color: "bg-orange-600", icon: FaMedal };
    return { text: "⭐ Popular", color: "bg-blue-500", icon: FaCrown };
  };

  if (popularSeries.length === 0) {
    return null;
  }

  return (
    <section className={`py-12 ${isDark ? "bg-gray-900/20" : "bg-white"}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3  mb-4 border-2 rounded-xl p-4 border-yellow-500">
            <FiAward className="text-yellow-500 text-2xl" />
            <h2
              className={`text-3xl font-bold  ${
                isDark ? "text-white" : "text-slate-800"
              }`}
            >
              Most Popular
            </h2>
          </div>
          <p
            className={`text-base ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}
          >
            The highest-rated and most subscribed test series by our community
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularSeries.map((seriesItem, index) => {
            const isSubscribed = hasUserSubscribed(seriesItem.id);
            const userIsCreator = isCreator(seriesItem);
            const popularityBadge = getPopularityBadge(index);
            const BadgeIcon = popularityBadge.icon;

            return (
              <div
                key={seriesItem.id}
                className={`relative border rounded-2xl overflow-hidden shadow-lg hover:shadow-xl cursor-pointer ${
                  isDark
                    ? "bg-gray-800/50 border-gray-700 hover:border-yellow-400"
                    : "bg-white border-gray-200 hover:border-yellow-300"
                }`}
                onClick={() => handleViewDetails(seriesItem)}
              >
                {/* Popularity Badge */}
                <div className="absolute top-3 left-3 z-10">
                  <div
                    className={`${popularityBadge.color} text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1`}
                  >
                    <BadgeIcon className="w-3 h-3" />
                    <span>{popularityBadge.text}</span>
                  </div>
                </div>

                {/* Premium/Free Badge */}
                <div className="absolute top-3 right-3 z-10">
                  {seriesItem.isPaid ? (
                    isSubscribed ? (
                      <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <FaCheck className="w-2 h-2" />
                      </div>
                    ) : (
                      <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <FaCrown className="w-2 h-2" />
                        Premium
                      </div>
                    )
                  ) : (
                    <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      Free
                    </div>
                  )}
                </div>

                {/* Cover Image */}
                {seriesItem.coverImageUrl ? (
                  <div className="aspect-video relative">
                    <img
                      src={seriesItem.coverImageUrl}
                      alt={seriesItem.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                    <div
                      className={`hidden absolute inset-0 items-center justify-center ${
                        isDark ? "bg-gray-700" : "bg-gray-200"
                      }`}
                    >
                      <div className="text-center">
                        <FaCrown
                          className={`w-10 h-10 mx-auto mb-2 ${
                            isDark ? "text-gray-500" : "text-gray-400"
                          }`}
                        />
                        <p
                          className={`text-sm font-semibold ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {seriesItem.title}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`aspect-video flex items-center justify-center ${
                      isDark ? "bg-yellow-600" : "bg-yellow-400"
                    }`}
                  >
                    <div className="text-center text-white">
                      <FaCrown className="w-10 h-10 mx-auto mb-2" />
                      <p className="text-sm font-semibold">
                        {seriesItem.title}
                      </p>
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="p-5">
                  <h3
                    className={`text-lg font-bold mb-2 line-clamp-2 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {seriesItem.title}
                  </h3>

                  <p
                    className={`text-sm mb-3 line-clamp-2 ${
                      isDark ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {seriesItem.description || ""}
                  </p>

                  {/* Key Stats */}
                  <div className="flex justify-between mb-3">
                    <div className="text-center">
                      <div
                        className={`text-xl font-bold ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {seriesItem.totalSubscribers || 0}
                      </div>
                      <div
                        className={`text-xs ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Students
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className={`text-xl font-bold ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {seriesItem.totalTests || 0}
                      </div>
                      <div
                        className={`text-xs ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Tests
                      </div>
                    </div>
                  </div>

                  {/* Rating and Reviews */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FiStar
                            key={star}
                            className={`w-3 h-3 ${
                              star <= (seriesItem.rating || 0)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span
                        className={`text-sm font-semibold ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {seriesItem.rating || 0}
                      </span>
                      <span
                        className={`text-xs ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        ({seriesItem.reviewCount || 0} reviews)
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMainAction(seriesItem);
                      }}
                      className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm ${
                        isDark
                          ? "bg-yellow-500 text-white hover:bg-yellow-600"
                          : "bg-yellow-500 text-white hover:bg-yellow-600"
                      }`}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <FiPlay className="w-3 h-3" />
                        {userIsCreator
                          ? "Manage"
                          : isSubscribed
                          ? "Continue"
                          : !seriesItem.isPaid
                          ? "Start Free"
                          : "Subscribe"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="text-center mt-10">
          <button
            onClick={() => navigate("/test-series")}
            className={`px-6 py-3 rounded-xl font-semibold text-base ${
              isDark
                ? "bg-yellow-500 text-white shadow-lg hover:bg-yellow-600"
                : "bg-yellow-500 text-white shadow-lg hover:bg-yellow-600"
            }`}
          >
            <span className="flex items-center gap-2">
              <FaCrown className="w-4 h-4" />
              View All Popular Series
              <FiAward className="w-4 h-4" />
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default MostPopularSection;
