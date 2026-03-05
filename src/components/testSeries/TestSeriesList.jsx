import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { examCategories, getAllSubcategories, getSubcategoryById } from '../../utils/constants/examCategories';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  doc,
  updateDoc,
  increment
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

import HeaderSubtitle from '../testList/HeaderSubtitle';
import SearchFilterControls from '../testList/SearchFilterControls';
import MobileFiltersSheet from '../testList/MobileFiltersSheet';
import EnhancedSeriesCard from '../testList/EnhancedSeriesCard';
import LoadingPlaceholder from '../testList/LoadingPlaceholder';
import EmptyState from '../testList/EmptyState';

const TestSeriesList = ({
  onCreateSeries,
  onViewSeries,
  onSubscribeSeries,
  onTakeTest,
  onViewTests,
  useEnhancedHomepage = false,
  examGoal,
  onChangeGoal,
  isGoalModalOpen
}) => {
  const { currentUser, isAdmin } = useAuth();
  const { isActive, isFreePlan } = useSubscription();
  const { isDark } = useTheme();
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Lock background scroll when mobile filters are open (preserve position)
  useEffect(() => {
    if (!showMobileFilters) {
      // restore if previously locked
      const storedScroll = document.body.getAttribute('data-scroll-lock-position');
      if (storedScroll) {
        const scrollY = parseInt(storedScroll, 10) || 0;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        document.body.removeAttribute('data-scroll-lock-position');
        window.scrollTo(0, -scrollY);
      }
      return;
    }

    const scrollY = -window.scrollY;
    document.body.setAttribute('data-scroll-lock-position', String(scrollY));
    document.body.style.position = 'fixed';
    document.body.style.top = `${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    return () => {
      const stored = document.body.getAttribute('data-scroll-lock-position');
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (stored) {
        const y = parseInt(stored, 10) || 0;
        document.body.removeAttribute('data-scroll-lock-position');
        window.scrollTo(0, -y);
      }
    };
  }, [showMobileFilters]);

  // Sync examGoal to selectedSubcategory on mount / goal change
  useEffect(() => {
    if (examGoal) {
      setSelectedSubcategory(examGoal);
    }
  }, [examGoal]);

  useEffect(() => {
    loadTestSeries();
    if (currentUser) {
      loadUserSubscriptions();
    }
  }, [currentUser]);

  const loadTestSeries = async () => {
    try {
      const baseRef = collection(db, 'test-series');
      const q = isAdmin
        ? query(baseRef, orderBy('createdAt', 'desc'))
        : query(baseRef, where('isPublished', '==', true), orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const seriesData = [];

        for (const doc of querySnapshot.docs) {
          const seriesInfo = { id: doc.id, ...doc.data() };

          try {
            // Load from both quizzes and section-quizzes collections
            const [quizzesQuery, sectionQuizzesQuery] = await Promise.all([
              getDocs(query(collection(db, 'quizzes'), where('testSeriesId', '==', seriesInfo.id))),
              getDocs(query(collection(db, 'section-quizzes'), where('testSeriesId', '==', seriesInfo.id)))
            ]);

            const tests = [];

            // Add regular quizzes
            quizzesQuery.forEach(testDoc => {
              tests.push({ id: testDoc.id, ...testDoc.data(), type: 'regular' });
            });

            // Add section-wise quizzes
            sectionQuizzesQuery.forEach(testDoc => {
              tests.push({ id: testDoc.id, ...testDoc.data(), type: 'section-wise' });
            });

            seriesData.push({
              ...seriesInfo,
              tests: tests,
              totalTests: tests.length,
              totalQuizzes: tests.length,
              // Ensure totalSubscribers is preserved and properly handled
              totalSubscribers: seriesInfo.totalSubscribers || 0
            });
          } catch (error) {
            console.error(`Error loading tests for series ${seriesInfo.id}:`, error);
            seriesData.push({
              ...seriesInfo,
              tests: [],
              totalTests: 0,
              totalQuizzes: 0,
              // Ensure totalSubscribers is preserved even on error
              totalSubscribers: seriesInfo.totalSubscribers || 0
            });
          }
        }

        setSeries(seriesData);
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error loading series:', error);
      setLoading(false);
    }
  };

  const loadUserSubscriptions = async () => {
    try {
      const q = query(
        collection(db, 'test-series-subscriptions'),
        where('userId', '==', currentUser.uid),
        where('status', '==', 'active')
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const subscriptions = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          testSeriesId: doc.data().testSeriesId
        }));
        setUserSubscriptions(subscriptions);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error loading user subscriptions:', error);
    }
  };

  const hasUserSubscribed = useCallback((testSeriesId) => {
    // Global plan (any active non-free) unlocks all series
    if (isActive && !isFreePlan) return true;
    return userSubscriptions.some(sub => sub.testSeriesId === testSeriesId);
  }, [userSubscriptions, isActive, isFreePlan]);

  const isCreator = useCallback((seriesItem) => {
    return !!currentUser && seriesItem.createdBy === currentUser.uid;
  }, [currentUser]);

  const filteredSeries = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return series.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(term);
      const matchesSubcategory = !selectedSubcategory || item.examSubcategory === selectedSubcategory;

      switch (activeFilter) {
        case 'my-series': {
          const subscribed = hasUserSubscribed(item.id);
          const userCreator = isCreator(item);
          return matchesSearch && matchesSubcategory && (userCreator || subscribed);
        }
        case 'subscribed':
          return matchesSearch && matchesSubcategory && hasUserSubscribed(item.id);
        case 'free':
          return matchesSearch && matchesSubcategory && !item.isPaid;
        case 'paid':
          return matchesSearch && matchesSubcategory && item.isPaid;
        default:
          return matchesSearch && matchesSubcategory;
      }
    });
  }, [series, searchTerm, selectedSubcategory, activeFilter, hasUserSubscribed, isCreator]);

  const recordFreeView = async (series) => {
    try {
      if (!series || series.isPaid) return;
      const key = `viewed-series-${series.id}`;
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, '1');
      await updateDoc(doc(db, 'test-series', series.id), {
        // Only count a view locally; subscribers are incremented by backend upon payment
        totalViews: increment(1)
      });
    } catch (e) {
      console.error('Error updating free series view:', e);
    }
  };

  const subcategoryOptions = [
    { value: '', label: 'All Exams' },
    ...getAllSubcategories().map(sub => ({ value: sub.id, label: `${sub.name}` }))
  ];

  const filterOptions = [
    { value: 'all', label: 'All Series' },
    { value: 'my-series', label: 'My Series' },
    { value: 'free', label: 'Free' },
    { value: 'paid', label: 'Premium' }
  ];

  if (loading) {
    return <LoadingPlaceholder isDark={isDark} />;
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <HeaderSubtitle isDark={isDark} />

        {/* Exam Goal Banner removed */}

        {!isGoalModalOpen && (
          <>
            <SearchFilterControls
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedSubcategory={selectedSubcategory}
              setSelectedSubcategory={setSelectedSubcategory}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              showMobileFilters={showMobileFilters}
              setShowMobileFilters={setShowMobileFilters}
              subcategoryOptions={subcategoryOptions}
              filterOptions={filterOptions}
              isDark={isDark}
            />

            <MobileFiltersSheet
              showMobileFilters={showMobileFilters}
              setShowMobileFilters={setShowMobileFilters}
              selectedSubcategory={selectedSubcategory}
              setSelectedSubcategory={setSelectedSubcategory}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              subcategoryOptions={subcategoryOptions}
              filterOptions={filterOptions}
              isDark={isDark}
            />
          </>
        )}

        {/* Series Grid */}
        <div className="mt-6">
          {filteredSeries.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredSeries.map(seriesItem => (
                <EnhancedSeriesCard
                  key={seriesItem.id}
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
              ))}
            </div>
          ) : (
            <EmptyState
              searchTerm={searchTerm}
              selectedSubcategory={selectedSubcategory}
              activeFilter={activeFilter}
              filteredSeries={filteredSeries}
              isAdmin={isAdmin}
              isDark={isDark}
              onCreateSeries={onCreateSeries}
              setSearchTerm={setSearchTerm}
              setActiveFilter={setActiveFilter}
            />
          )}
        </div>
      </div>

      {/* Simplified Custom Styles */}
      <style>
        {`
          /* Hide scrollbars for dropdown */
          .professional-dropdown::-webkit-scrollbar {
            display: none;
          }
          
          .professional-dropdown {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          
          /* Simple scrollbar styles */
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(75, 85, 99, 0.2);
            border-radius: 3px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #3B82F6;
            border-radius: 3px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #2563EB;
          }
          
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `}
      </style>
    </div>
  );
};

export default TestSeriesList;
