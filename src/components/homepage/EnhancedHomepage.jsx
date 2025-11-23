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
  recordFreeView = () => {},
  onCreateSeries = () => {},
  onViewSeries = () => {},
  onSubscribeSeries = () => {},
  onViewTests = () => {},
}) => {
  const { currentUser, isAdmin } = useAuth();
  const { isDark } = useTheme();

  // Local state for data loading
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSubscriptions, setUserSubscriptions] = useState([]);

  // Helper functions - use props if available, otherwise use local implementations
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

  // Optimized function to fetch test counts
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
          // Ensure totalSubscribers is preserved
          totalSubscribers: seriesItem.totalSubscribers || 0
        });
      } catch (error) {
        console.warn(`Error fetching test count for series ${seriesItem.id}:`, error);
        seriesWithCounts.push({
          ...seriesItem,
          totalTests: seriesItem.totalTests || 0,
          // Ensure totalSubscribers is preserved even on error
          totalSubscribers: seriesItem.totalSubscribers || 0
        });
      }
    }
    return seriesWithCounts;
  };

  // Load test series data
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

  return (
    <div className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-white"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Featured Offers and Recent Activity Section - ORIGINAL PLACEMENT */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
          {/* Featured Offers - Takes 2/3 width on xl screens */}
          <div className="xl:col-span-2">
            <FeaturedOffers
              offers={featuredOffers}
              isDark={isDark}
              onSubscribeSeries={onSubscribeSeries}
              onViewTests={onViewTests}
              onViewSeries={onViewSeries}
            />
          </div>

          {/* Recent Activity - Takes 1/3 width on xl screens */}
          <div className="xl:col-span-1 md:mt-28">
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
        </div>

        {/* Hero Section - ORIGINAL PLACEMENT */}
        <HeroSection
          isDark={isDark}
          currentUser={currentUser}
          onViewAllSeries={() => {
            /* Navigate to test series list */
          }}
        />

        {/* Trending Section */}
        {trendingSeries.length > 0 && (
          <div className="mb-12">
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

        {/* Most Popular Section */}
        {popularSeries.length > 0 && (
          <div className="mb-12">
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

        {/* Success Stories Section */}
        <SuccessStoriesSection isDark={isDark} />
        
      </div>
    </div>
  );
};

export default EnhancedHomepage;
