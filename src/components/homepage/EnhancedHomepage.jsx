import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import {
  Activity,
  BookOpen,
  Sparkles,
  ChevronRight,
  Crown,
  Zap
} from "lucide-react";

// Reuse existing components
import LoadingPlaceholder from "../testList/LoadingPlaceholder";

// Import optimized homepage sections
import HeroSection from "./HeroSection";
import FeaturedOffers from "./FeaturedOffers";
import TrendingSection from "./TrendingSection";
import MostPopularSection from "./MostPopularSection";
import RecentActivityCompact from "./RecentActivityCompact";
import SuccessStoriesSection from "./SuccessStoriesSection";

const EnhancedHomepage = ({
  series: propSeries,
  loading: propLoading,
  userSubscriptions: propUserSubscriptions,
  hasUserSubscribed = () => false,
  isCreator = () => false,
  recordFreeView = () => { },
  onCreateSeries = () => { },
  onViewSeries = () => { },
  onSubscribeSeries = () => { },
  onViewTests = () => { },
}) => {
  const { currentUser, isAdmin } = useAuth();
  const { isDark } = useTheme();

  // Local state for data loading
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSubscriptions, setUserSubscriptions] = useState([]);

  // Helper functions
  const hasUserSubscribedFn = useCallback(
    (testSeriesId) => {
      if (propUserSubscriptions && propUserSubscriptions.length > 0) {
        return propUserSubscriptions.some(
          (sub) => sub.testSeriesId === testSeriesId
        );
      }
      return userSubscriptions.some((sub) => sub.testSeriesId === testSeriesId);
    },
    [userSubscriptions, propUserSubscriptions]
  );

  const isCreatorFn = useCallback(
    (seriesItem) => {
      return !!currentUser && seriesItem.createdBy === currentUser.uid;
    },
    [currentUser]
  );

  const fetchTestCounts = async (seriesData) => {
    const seriesWithCounts = [];
    for (const seriesItem of seriesData) {
      try {
        const quizzesQuery = await getDocs(
          query(collection(db, 'quizzes'), where('testSeriesId', '==', seriesItem.id))
        );
        const sectionQuizzesQuery = await getDocs(
          query(collection(db, 'section-quizzes'), where('testSeriesId', '==', seriesItem.id))
        );
        const totalTests = quizzesQuery.size + sectionQuizzesQuery.size;
        seriesWithCounts.push({
          ...seriesItem,
          totalTests: totalTests,
          totalSubscribers: seriesItem.totalSubscribers || 0
        });
      } catch (error) {
        console.warn(`Error fetching test count for series ${seriesItem.id}:`, error);
        seriesWithCounts.push({
          ...seriesItem,
          totalTests: seriesItem.totalTests || 0,
          totalSubscribers: seriesItem.totalSubscribers || 0
        });
      }
    }
    return seriesWithCounts;
  };

  useEffect(() => {
    if (propSeries && propSeries.length > 0) {
      setSeries(propSeries);
      setLoading(propLoading || false);
      setUserSubscriptions(propUserSubscriptions || []);
      return;
    }

    setLoading(true);

    const q = query(
      collection(db, "test-series"),
      where("isPublished", "==", true),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const seriesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const seriesWithCounts = await fetchTestCounts(seriesData);
        setSeries(seriesWithCounts);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading series:", error);
        setLoading(false);
      }
    );

    if (currentUser) {
      const subscriptionsQuery = query(
        collection(db, "test-series-subscriptions"),
        where("userId", "==", currentUser.uid)
      );
      getDocs(subscriptionsQuery)
        .then((snapshot) => {
          const subscriptions = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setUserSubscriptions(subscriptions);
        })
        .catch((error) => {
          console.warn("Could not load user subscriptions:", error.message);
          setUserSubscriptions([]);
        });
    }

    return () => unsubscribe();
  }, [currentUser, propSeries, propLoading, propUserSubscriptions]);

  const featuredOffers = useMemo(() => [], []);

  const trendingSeries = useMemo(
    () =>
      series
        .filter((s) => s.isPublished)
        .sort((a, b) => (b.totalViews || 0) - (a.totalViews || 0))
        .slice(0, 8),
    [series]
  );

  const popularSeries = useMemo(
    () =>
      series
        .filter((s) => s.isPublished)
        .sort((a, b) => (b.totalSubscribers || 0) - (a.totalSubscribers || 0))
        .slice(0, 8),
    [series]
  );

  if (loading) {
    return <LoadingPlaceholder isDark={isDark} />;
  }

  // Component for the top stats header
  const DashboardHeader = () => (
    <div className={`${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} border-b mb-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

          {/* Welcome Text */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={isDark ? "px-2 py-0.5 rounded-full bg-emerald-100  text-emerald-400 text-xs font-bold uppercase tracking-wider" : "px-2 py-0.5 rounded-full  bg-emerald-400/30 text-emerald-700 text-emerald-400 text-xs font-bold uppercase tracking-wider"}>
                Dashboard
              </span>
            </div>
            <h1 className={isDark ? "text-3xl font-bold text-white tracking-tight" : "text-3xl font-bold text-zinc-900  tracking-tight"}>
              Welcome back, <span className="text-emerald-600">{currentUser?.displayName?.split(' ')[0] || 'Student'}</span>
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
              Track your progress and explore new learning opportunities.
            </p>
          </div>

          {/* Stats/Actions */}
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-3 px-5 py-3 rounded-xl border ${isDark ? 'bg-zinc-800 border-zinc-100' : 'bg-zinc-50 border-zinc-100'}`}>
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <BookOpen size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-medium uppercase">Enrolled</p>
                <p className="text-lg font-bold text-zinc-900 dark:text-white leading-none">
                  {userSubscriptions.length} <span className="text-xs font-normal text-zinc-400">Series</span>
                </p>
              </div>
            </div>

            <div className={`flex items-center gap-3 px-5 py-3 rounded-xl border ${isDark ? 'bg-zinc-800 border-zinc-100' : 'bg-zinc-50 border-zinc-100'}`}>
              <div className="p-2 bg-rose-500/10 rounded-lg">
                <Activity size={20} className="text-rose-600" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-medium uppercase">Quizzes</p>
                <p className={isDark ? "text-lg font-bold text-white leading-none" : "text-lg font-bold text-zinc-900  leading-none"}>
                  Active
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen pb-12 ${isDark ? "bg-black" : "bg-zinc-50/50"}`}>

      {/* New Dashboard Header */}
      <DashboardHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* --- LEFT MAIN COLUMN (Content) --- */}
          <div className="lg:col-span-8 space-y-10">

            {/* Featured Offers */}
            {/* We wrap this only to ensure spacing, assuming component handles its own internal layout */}
            <div className="w-full">
              <FeaturedOffers
                offers={featuredOffers}
                isDark={isDark}
                onSubscribeSeries={onSubscribeSeries}
                onViewTests={onViewTests}
                onViewSeries={onViewSeries}
              />
            </div>

            {/* Hero Banner */}
            {/* Removed extra padding/borders - letting the component sit naturally */}
            <div className="w-full">
              <HeroSection
                isDark={isDark}
                currentUser={currentUser}
                onViewAllSeries={() => { /* Navigate */ }}
              />
            </div>

            {/* Trending Section */}
            {/* Important: No wrapper styling here. The component has its own gray card look. */}
            {trendingSeries.length > 0 && (
              <div className="w-full">
                <TrendingSection
                  series={trendingSeries}
                  isDark={isDark}
                  hasUserSubscribed={hasUserSubscribedFn}
                  isCreator={isCreatorFn}
                  currentUser={currentUser}
                  onSubscribeSeries={onSubscribeSeries}
                  onViewSeries={onViewSeries}
                  onViewTests={onViewTests}
                  recordFreeView={recordFreeView}
                />
              </div>
            )}

            {/* Popular Section */}
            {/* Important: No wrapper styling here. */}
            {popularSeries.length > 0 && (
              <div className="w-full">
                <MostPopularSection
                  series={popularSeries}
                  isDark={isDark}
                  hasUserSubscribed={hasUserSubscribedFn}
                  isCreator={isCreatorFn}
                  currentUser={currentUser}
                  onSubscribeSeries={onSubscribeSeries}
                  onViewSeries={onViewSeries}
                  onViewTests={onViewTests}
                />
              </div>
            )}

            {/* Success Stories */}
            <div className="pt-6">
              <SuccessStoriesSection isDark={isDark} />
            </div>
          </div>

          {/* --- RIGHT SIDEBAR (Activity) --- */}
          <div className="lg:col-span-4 lg:sticky lg:top-6 space-y-6">

            {/* Recent Activity Component */}
            {/* Removed the wrapper with the duplicate "Recent Activity" header. 
                The component is now a direct child of the grid column. */}
            <div className="relative">
              <RecentActivityCompact
                isDark={isDark}
                currentUser={currentUser}
                userSubscriptions={userSubscriptions}
                onViewSeries={onViewSeries}
                onTakeTest={onViewTests}
                onViewTests={onViewTests}
                isAdmin={isAdmin}
              />
            </div>

            {/* Supplemental Promo Card */}
            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-emerald-100'} shadow-sm`}>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
                  <Crown size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-white text-sm">Premium Pass</h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                    Unlock all test series and get detailed performance analytics.
                  </p>
                  <button
                    onClick={() => { }} // Add navigation
                    className="mt-3 text-xs font-semibold text-emerald-600 flex items-center hover:underline"
                  >
                    View Plans <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Tip */}
            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100'}`}>
              <div className="flex items-center gap-2 mb-2 text-blue-600">
                <Zap size={16} />
                <h4 className="font-bold text-sm">Study Streak</h4>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Consistency is key. Take one quiz today to maintain your streak!
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedHomepage;