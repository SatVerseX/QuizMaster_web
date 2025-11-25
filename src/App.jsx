import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import AuthForm from "./components/auth/AuthForm";
import LoginPopup from "./components/auth/LoginPopup";
import WelcomePage from "./components/layout/WelcomePage";
import FlashcardReview from "./components/flashcards/FlashCardReview";
import ChallengeLanding from "./components/gamification/ChallengeLanding";
// Homepage components - Remove unused direct imports since they're used within EnhancedHomepage
import EnhancedHomepage from "./components/homepage/EnhancedHomepage";
import HomepageDemo from "./components/homepage/HomepageDemo";
// Remove these unused direct imports:
// import HeroSection from './components/homepage/HeroSection';
// import FeaturedOffers from './components/homepage/FeaturedOffers';
// import TrendingSection from './components/homepage/TrendingSection';
// import MostPopularSection from './components/homepage/MostPopularSection';
// import CategoriesSection from './components/homepage/CategoriesSection';
// import RecentActivitySection from './components/homepage/RecentActivitySection';
// import SuccessStoriesSection from './components/homepage/SuccessStoriesSection';
// import QuickStatsSection from './components/homepage/QuickStatsSection';

// Test Series Components
import TestSeriesList from "./components/testSeries/TestSeriesList";
import TestSeriesCreator from "./components/testSeries/TestSeriesCreator";
import TestSeriesSubscription from "./components/testSeries/TestSeriesSubscription";
import TestSeriesDashboard from "./components/testSeries/TestSeriesDashboard";
import TestSeriesQuizCreator from "./components/testSeries/TestSeriesQuizCreator";
import TestSeriesAIGenerator from "./components/testSeries/TestSeriesAIGenerator";
import TestAttemptViewer from "./components/testSeries/TestAttemptViewer";
import TestAttemptHistory from "./components/testSeries/TestAttemptHistory";
import TestSeriesTestsList from "./components/testSeries/TestSeriesTestsList";
import UserSubscriptions from "./components/testSeries/UserSubscriptions";
import TestAttemptDetails from "./components/testSeries/TestAttemptDetails";

// Quiz Components
import QuizTaker from "./components/quiz/QuizTaker";
import AIQuizGenerator from "./components/quiz/AIQuizGenerator";
import SectionWiseQuizCreator from "./components/quiz/SectionWiseQuizCreator";
import UserAttempts from "./components/quiz/UserAttempts";
import LeaderBoard from "./components/quiz/LeaderBoard";
import AdminDashboard from "./components/admin/AdminDashboard";
import PrivacyPolicy from "./components/legal/PrivacyPolicy";
import TermsAndConditions from "./components/legal/TermsAndConditions";
import RefundPolicy from "./components/legal/RefundPolicy";
import ContactUs from "./components/legal/ContactUs";
import { db } from "./lib/firebase";
import { doc, updateDoc, increment, getDoc } from "firebase/firestore";
import { logger } from "./utils/logger";
import StudyPlanGenerator from "./components/planning/StudyPlanGenerator";
// Normalize quiz structure for attempt viewer, including section-wise quizzes
const normalizeTestForAttempt = (raw) => {
  if (!raw) return raw;
  // If it already has flat questions, keep as is
  if (Array.isArray(raw.questions) && raw.questions.length > 0) {
    return raw;
  }
  // If it's a section-wise quiz, flatten sections -> questions
  if (Array.isArray(raw.sections)) {
    const flatQuestions = raw.sections.flatMap((section) =>
      (section?.questions || []).map((q) => ({
        ...q,
      }))
    );
    const totalTime = raw.sections.reduce(
      (sum, s) => sum + (s?.timeLimit || 0),
      0
    );
    return {
      ...raw,
      questions: flatQuestions,
      timeLimit: raw.timeLimit || totalTime || 30,
    };
  }
  return raw;
};

const AppContent = () => {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentView, setCurrentView] = useState("welcome");
  const [selectedItem, setSelectedItem] = useState(null);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [isLoadingSeries, setIsLoadingSeries] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const { isDark } = useTheme();

  // Count a free series view once per browser (localStorage guard)
  const countFreeSeriesView = async (series) => {
    try {
      if (!series || series.isPaid) return;
      const storageKey = `viewed-series-${series.id}`;
      if (localStorage.getItem(storageKey)) return;
      localStorage.setItem(storageKey, "1");
      await updateDoc(doc(db, "test-series", series.id), {
        // Only increment totalViews for free series views, not totalSubscribers
        totalViews: increment(1),
      });
    } catch (error) {
      logger.error("Failed to record free series view:", error);
    }
  };

  // Sync URL with currentView state
  useEffect(() => {
    const path = location.pathname;

    // Don't sync if we're on login page
    if (path === "/login") {
      return;
    }

    // Map URL paths to currentView states
    if (path === "/welcome" || path === "/") {
      setCurrentView("welcome");
    } else if (path === "/test-series") {
      setCurrentView("test-series");
    } else if (path === "/create-series") {
      setCurrentView("create-series");
    } else if (path === "/ai-generator") {
      setCurrentView("ai-generator");
    } else if (path === "/test-history") {
      setCurrentView("test-history");
    } else if (path === "/subscriptions") {
      setCurrentView("subscriptions");
    } else if (path === "/homepage") {
      setCurrentView("homepage");
    } else if (path.startsWith("/series/")) {
      // Handle series-specific routes
      const seriesId = path.split("/")[2];
      if (path.includes("/dashboard")) {
        setCurrentView("series-dashboard");
      } else if (path.includes("/tests")) {
        setCurrentView("view-tests");
      } else if (path.includes("/subscribe")) {
        setCurrentView("subscribe-series");
      } else if (path.includes("/create-manual-test")) {
        setCurrentView("create-manual-test");
      } else if (path.includes("/create-section-quiz")) {
        setCurrentView("create-manual-test");
      } else if (path.includes("/create-ai-test")) {
        setCurrentView("create-ai-test");
      } else {
        setCurrentView("series-dashboard");
      }
    } else if (path.startsWith("/test/")) {
      // Handle test-specific routes
      if (path.includes("/take")) {
        setCurrentView("take-test");
        const testId = path.split("/")[2];
        if (testId && (!selectedItem || selectedItem.test?.id !== testId)) {
          setIsLoadingSeries(true);
          getDoc(doc(db, "quizzes", testId))
            .then((snap) => {
              if (snap.exists()) {
                return { id: snap.id, ...snap.data() };
              }
              return getDoc(doc(db, "section-quizzes", testId)).then(
                (secSnap) => {
                  if (secSnap.exists()) {
                    return {
                      id: secSnap.id,
                      ...secSnap.data(),
                      type: "section-wise",
                    };
                  }
                  return null;
                }
              );
            })
            .then((testData) => {
              if (!testData) {
                logger.error("Test not found in either collection:", testId);
                navigate("/test-series");
                return;
              }
              const normalized = normalizeTestForAttempt(testData);
              if (testData.testSeriesId) {
                return getDoc(
                  doc(db, "test-series", testData.testSeriesId)
                ).then((seriesSnap) => {
                  if (seriesSnap.exists()) {
                    const seriesData = {
                      id: seriesSnap.id,
                      ...seriesSnap.data(),
                    };
                    setSelectedItem({
                      test: normalized,
                      testSeries: seriesData,
                    });
                  } else {
                    setSelectedItem({ test: normalized });
                  }
                });
              } else {
                setSelectedItem({ test: normalized });
              }
            })
            .catch((err) => {
              logger.error("Failed to load test:", err);
              navigate("/test-series");
            })
            .finally(() => setIsLoadingSeries(false));
        }
      } else if (path.includes("/leaderboard")) {
        logger.log("App: Loading test leaderboard for path:", path);
        setCurrentView("test-leaderboard");
        const testId = path.split("/")[2];
        logger.log("App: Extracted testId:", testId);
        if (testId && (!selectedItem || selectedItem.id !== testId)) {
          logger.log(
            "App: Loading test data from Firestore for testId:",
            testId
          );
          setIsLoadingSeries(true);
          getDoc(doc(db, "quizzes", testId))
            .then((snap) => {
              if (snap.exists()) {
                const testData = { id: snap.id, ...snap.data() };
                logger.log("App: Test data loaded:", testData);
                if (testData.testSeriesId) {
                  return getDoc(
                    doc(db, "test-series", testData.testSeriesId)
                  ).then((seriesSnap) => {
                    if (seriesSnap.exists()) {
                      const seriesData = {
                        id: seriesSnap.id,
                        ...seriesSnap.data(),
                      };
                      logger.log("App: Series data loaded:", seriesData);
                      setSelectedItem({
                        ...testData,
                        testSeriesId: testData.testSeriesId,
                      });
                    } else {
                      setSelectedItem(testData);
                    }
                  });
                } else {
                  setSelectedItem(testData);
                }
                return true; // indicate handled
              }
              // Fallback: try section-quizzes
              return getDoc(doc(db, "section-quizzes", testId)).then(
                (secSnap) => {
                  if (secSnap.exists()) {
                    const testData = {
                      id: secSnap.id,
                      ...secSnap.data(),
                      type: "section-wise",
                    };
                    logger.log(
                      "App: Test data loaded from section-quizzes:",
                      testData
                    );
                    if (testData.testSeriesId) {
                      return getDoc(
                        doc(db, "test-series", testData.testSeriesId)
                      ).then((seriesSnap) => {
                        if (seriesSnap.exists()) {
                          const seriesData = {
                            id: seriesSnap.id,
                            ...seriesSnap.data(),
                          };
                          logger.log("App: Series data loaded:", seriesData);
                          setSelectedItem({
                            ...testData,
                            testSeriesId: testData.testSeriesId,
                          });
                        } else {
                          setSelectedItem(testData);
                        }
                      });
                    } else {
                      setSelectedItem(testData);
                    }
                    return true;
                  }
                  // Not found in either collection
                  logger.error(
                    "Test not found in quizzes or section-quizzes:",
                    testId
                  );
                  navigate("/test-series");
                  return false;
                }
              );
            })
            .catch((err) => {
              logger.error("Failed to load test:", err);
              navigate("/test-series");
            })
            .finally(() => setIsLoadingSeries(false));
        } else {
          logger.log("App: Test data already loaded or no testId:", {
            testId,
            selectedItemId: selectedItem?.id,
          });
        }
      } else {
        setCurrentView("take-test");
      }
    } else if (path.startsWith("/attempt/")) {
      setCurrentView("attempt-details");
      const attemptId = path.split("/")[2];

      // Check if we need to load data (if ID exists but no selectedItem or ID doesn't match)
      if (attemptId && (!selectedItem || selectedItem.id !== attemptId)) {
        setIsLoadingSeries(true);

        // Try fetching from 'test-attempts' first
        getDoc(doc(db, "test-attempts", attemptId))
          .then((snap) => {
            if (snap.exists()) {
              return { id: snap.id, ...snap.data() };
            }
            // Fallback: Try 'quiz-attempts' if not found in test-attempts
            return getDoc(doc(db, "quiz-attempts", attemptId)).then(
              (quizSnap) => {
                if (quizSnap.exists()) {
                  return { id: quizSnap.id, ...quizSnap.data() };
                }
                return null;
              }
            );
          })
          .then((data) => {
            if (data) {
              setSelectedItem(data);
            } else {
              logger.error("Attempt not found in any collection:", attemptId);
              // Optional: Don't redirect immediately, let the UI show a "Not Found" state
              // navigate('/test-history');
            }
          })
          .catch((err) => {
            logger.error("Failed to load attempt:", err);
          })
          .finally(() => setIsLoadingSeries(false));
      }
    } else if (path.startsWith("/quiz/")) {
      if (path.includes("/take")) {
        setCurrentView("take-quiz");
        const quizId = path.split("/")[2];
        if (quizId && (!selectedItem || selectedItem.id !== quizId)) {
          setIsLoadingSeries(true);

          getDoc(doc(db, "quizzes", quizId))
            .then((snap) => {
              if (snap.exists()) {
                const quizData = { id: snap.id, ...snap.data() };
                setSelectedItem(quizData);
                setIsLoadingSeries(false);
              } else {
                return getDoc(doc(db, "section-quizzes", quizId));
              }
            })
            .then((snap) => {
              if (snap && snap.exists()) {
                const quizData = { id: snap.id, ...snap.data() };
                setSelectedItem(quizData);
              } else {
                logger.error("Quiz not found in either collection:", quizId);
                navigate("/test-series");
              }
            })
            .catch((err) => {
              logger.error("Failed to load quiz:", err);
              navigate("/test-series");
            })
            .finally(() => setIsLoadingSeries(false));
        }
      } else if (path.includes("/leaderboard")) {
        logger.log("App: Loading quiz leaderboard for path:", path);
        setCurrentView("leaderboard");
        const quizId = path.split("/")[2];
        logger.log("App: Extracted quizId:", quizId);
        if (quizId && (!selectedItem || selectedItem.id !== quizId)) {
          logger.log(
            "App: Loading quiz data from Firestore for quizId:",
            quizId
          );
          setIsLoadingSeries(true);

          getDoc(doc(db, "quizzes", quizId))
            .then((snap) => {
              if (snap.exists()) {
                const quizData = { id: snap.id, ...snap.data() };
                logger.log("App: Quiz data loaded from quizzes:", quizData);
                setSelectedItem(quizData);
                setIsLoadingSeries(false);
              } else {
                return getDoc(doc(db, "section-quizzes", quizId));
              }
            })
            .then((snap) => {
              if (snap && snap.exists()) {
                const quizData = { id: snap.id, ...snap.data() };
                logger.log(
                  "App: Quiz data loaded from section-quizzes:",
                  quizData
                );
                setSelectedItem(quizData);
              } else {
                logger.error("Quiz not found in either collection:", quizId);
                navigate("/test-series");
              }
            })
            .catch((err) => {
              logger.error("Failed to load quiz:", err);
              navigate("/test-series");
            })
            .finally(() => setIsLoadingSeries(false));
        } else {
          logger.log("App: Quiz data already loaded or no quizId:", {
            quizId,
            selectedItemId: selectedItem?.id,
          });
        }
      } else {
        setCurrentView("take-quiz");
      }
    } else {
      setCurrentView("welcome");
    }
  }, [location.pathname, selectedItem, navigate]); // Added missing dependencies

  // Ensure selected test series is loaded when deep-linking to series routes
  useEffect(() => {
    const path = location.pathname;
    if (!path.startsWith("/series/")) return;

    const seriesId = path.split("/")[2];
    if (!seriesId) return;

    if (!selectedItem || selectedItem.id !== seriesId) {
      setIsLoadingSeries(true);
      getDoc(doc(db, "test-series", seriesId))
        .then((snap) => {
          if (snap.exists()) {
            const base = { id: snap.id, ...snap.data() };
            // Merge any persisted offer override from sessionStorage
            try {
              const raw = sessionStorage.getItem(`offer-${seriesId}`);
              if (raw) {
                const offer = JSON.parse(raw);
                if (offer && typeof offer === "object") {
                  const effective =
                    offer.discountedPrice ?? base.discountedPrice ?? base.price;
                  const orig =
                    offer.originalPrice ??
                    base.originalPrice ??
                    base.price ??
                    effective;
                  base.price = effective;
                  base.discountedPrice = effective;
                  base.originalPrice = orig;
                  base.discountPercentage =
                    offer.discountPercentage ??
                    (orig
                      ? Math.max(
                          0,
                          Math.round(((orig - effective) / orig) * 100)
                        )
                      : base.discountPercentage);
                  base.appliedOfferId =
                    offer.appliedOfferId ?? base.appliedOfferId;
                  base.isFromOffer = true;
                }
              }
            } catch (_) {}
            setSelectedItem(base);
          }
        })
        .catch((err) => {
          logger.error("Failed to load test series:", err);
        })
        .finally(() => setIsLoadingSeries(false));
    }
  }, [location.pathname, selectedItem]);

  useEffect(() => {
    setPageLoaded(true);
  }, []);

  // Helper functions to check if user needs to be logged in for an action
  const requireLogin = (action) => {
    if (!currentUser) {
      setPendingAction(action);
      setShowLoginPopup(true);
      return false;
    }
    return true;
  };

  const requireLoginForTestSeries = (action) => {
    if (!currentUser) {
      setPendingAction(action);
      setShowLoginPopup(true);
      return false;
    }
    return true;
  };

  // Navigation handlers with URL updates
  const handleCreateSeries = () => {
    if (!requireLogin("create-series")) return;
    if (!isAdmin) return;
    setCurrentView("create-series");
    setSelectedItem(null);
    navigate("/create-series");
  };

  const handleViewSeries = (series) => {
    if (!requireLoginForTestSeries("view-series")) return;
    countFreeSeriesView(series);
    setSelectedItem(series);
    setCurrentView("series-dashboard");
    navigate(`/series/${series.id}/dashboard`);
  };

  const handleSubscribeSeries = (series) => {
    if (!requireLoginForTestSeries("subscribe-series")) return;

    // If we only have a minimal object (e.g., from FeaturedOffers) fetch full data first
    const hasEssentialFields =
      series &&
      typeof series === "object" &&
      Boolean(series.title) &&
      series.price !== undefined &&
      series.price !== null;

    if (!hasEssentialFields) {
      setIsLoadingSeries(true);
      const seriesId = series?.id;
      if (!seriesId) {
        // Fallback: go to listing
        navigate("/test-series");
        return;
      }

      getDoc(doc(db, "test-series", seriesId))
        .then((snap) => {
          if (snap.exists()) {
            const full = { id: snap.id, ...snap.data() };
            // If price override comes from an offer, merge it in without mutating source
            if (
              series &&
              (series.priceOverride !== undefined ||
                series.discountedPrice !== undefined)
            ) {
              const effectiveDiscounted =
                series.priceOverride ?? series.discountedPrice;
              const original =
                series.originalPrice ??
                full.price ??
                full.originalPrice ??
                effectiveDiscounted;
              full.price = effectiveDiscounted; // display and charge this price
              full.originalPrice = original;
              full.discountedPrice = effectiveDiscounted;
              full.discountPercentage =
                series.discountPercentage ??
                (original
                  ? Math.max(
                      0,
                      Math.round(
                        ((original - effectiveDiscounted) / original) * 100
                      )
                    )
                  : undefined);
              full.appliedOfferId =
                series.appliedOfferId ?? full.appliedOfferId;
              full.isFromOffer = true;
            }
            setSelectedItem(full);
          } else {
            // If not found, keep minimal to avoid breaking UI
            setSelectedItem(series);
          }
        })
        .catch(() => {
          setSelectedItem(series);
        })
        .finally(() => {
          setIsLoadingSeries(false);
          setCurrentView("subscribe-series");
          navigate(`/series/${seriesId}/subscribe`);
        });
      return;
    }

    // If we already have a rich object but an offer override is present, apply it here too
    const selected = { ...series };
    if (
      series &&
      (series.priceOverride !== undefined ||
        series.discountedPrice !== undefined)
    ) {
      const effectiveDiscounted =
        series.priceOverride ?? series.discountedPrice;
      const original =
        series.originalPrice ?? series.price ?? effectiveDiscounted;
      selected.price = effectiveDiscounted;
      selected.originalPrice = original;
      selected.discountedPrice = effectiveDiscounted;
      selected.discountPercentage =
        series.discountPercentage ??
        (original
          ? Math.max(
              0,
              Math.round(((original - effectiveDiscounted) / original) * 100)
            )
          : undefined);
      selected.appliedOfferId =
        series.appliedOfferId ?? selected.appliedOfferId;
      selected.isFromOffer = true;
    }
    setSelectedItem(selected);
    setCurrentView("subscribe-series");
    navigate(`/series/${series.id}/subscribe`);
  };

  const handleTakeQuiz = (quiz) => {
    if (!requireLogin("take-quiz")) return;
    setSelectedItem(quiz);
    setCurrentView("take-quiz");
    navigate(`/quiz/${quiz.id}/take`);
  };

  const handleViewTests = (testSeries) => {
    if (!requireLoginForTestSeries("view-tests")) return;
    countFreeSeriesView(testSeries);
    setSelectedItem(testSeries);
    setCurrentView("view-tests");
    navigate(`/series/${testSeries.id}/tests`);
  };

  const handleViewLeaderboard = (test) => {
    if (!requireLogin("view-leaderboard")) return;
    setSelectedItem(test);
    setCurrentView("test-leaderboard");
    navigate(`/test/${test.id}/leaderboard`);
  };

  const handleTakeTest = (test, testSeries) => {
    if (!requireLogin("take-test")) return;
    const normalized = normalizeTestForAttempt(test);
    setSelectedItem({ test: normalized, testSeries });
    setCurrentView("take-test");
    navigate(`/test/${test.id}/take`);
  };

  const handleViewTestHistory = () => {
    if (!requireLogin("view-test-history")) return;
    setCurrentView("test-history");
    setSelectedItem(null);
    navigate("/test-history");
  };

  const handleTestCompleted = (attemptData) => {
    logger.log("Test completed successfully:", attemptData);
    setSelectedItem(attemptData);
    setCurrentView("attempt-details");
    navigate(`/attempt/${attemptData.id}`);
  };

  const handleViewAttemptDetails = (attempt) => {
    setSelectedItem(attempt);
    setCurrentView("attempt-details");
    navigate(`/attempt/${attempt.id}`);
  };

  const handleBackToSeries = () => {
    setCurrentView("test-series");
    setSelectedItem(null);
    navigate("/test-series");
  };

  const handleBackToDashboard = () => {
    setCurrentView("series-dashboard");
    if (selectedItem && selectedItem.id) {
      navigate(`/series/${selectedItem.id}/dashboard`);
    }
  };

  const handleBackToHistory = () => {
    setCurrentView("test-history");
    setSelectedItem(null);
    navigate("/test-history");
  };

  const handleBackToTestsList = () => {
    setCurrentView("view-tests");
    if (selectedItem && selectedItem.id) {
      navigate(`/series/${selectedItem.id}/tests`);
    }
  };

  const handleSeriesCreated = () => {
    setCurrentView("test-series");
    setSelectedItem(null);
    navigate("/test-series");
  };

  const handleSubscriptionSuccess = () => {
    setCurrentView("test-series");
    setSelectedItem(null);
    navigate("/test-series");
  };

  const handleCreateManualTest = () => {
    if (!isAdmin) return;
    setCurrentView("create-manual-test");
    if (selectedItem && selectedItem.id) {
      navigate(`/series/${selectedItem.id}/create-section-quiz`);
    }
  };

  const handleCreateAITest = () => {
    if (!isAdmin) return;
    setCurrentView("create-ai-test");
    if (selectedItem && selectedItem.id) {
      navigate(`/series/${selectedItem.id}/create-ai-test`);
    }
  };

  const handleTestCreated = (newTest) => {
    setCurrentView("series-dashboard");
    logger.log("Test created successfully:", newTest);
    if (selectedItem && selectedItem.id) {
      navigate(`/series/${selectedItem.id}/dashboard`);
    }
  };

  const handleViewAttempts = () => {
    if (!requireLogin("view-attempts")) return;
    setCurrentView("test-history");
    setSelectedItem(null);
    navigate("/test-history");
  };

  const handleViewHome = () => {
    setCurrentView("homepage");
    setSelectedItem(null);
    navigate("/homepage");
  };

  const handleViewTestSeries = () => {
    setCurrentView("test-series");
    setSelectedItem(null);
    navigate("/test-series");
  };

  const handleViewSubscriptions = () => {
    setCurrentView("subscriptions");
    setSelectedItem(null);
    navigate("/subscriptions");
  };

  const handleGetStarted = () => {
    setCurrentView("homepage");
    setSelectedItem(null);
    navigate("/homepage");
  };

  const handleAIGenerator = () => {
    if (!requireLogin("ai-generator")) return;
    if (!isAdmin) return;
    if (selectedItem && selectedItem.id) {
      setCurrentView("create-ai-test");
      navigate(`/series/${selectedItem.id}/create-ai-test`);
    } else {
      setCurrentView("ai-generator");
      navigate("/ai-generator");
    }
  };

  const handleViewWelcome = () => {
    setCurrentView("welcome");
    setSelectedItem(null);
    navigate("/welcome");
  };

  // Handle login popup actions
  const handleLoginClick = () => {
    setShowLoginPopup(false);
    navigate("/login");
  };

  const handleCloseLoginPopup = () => {
    setShowLoginPopup(false);
    setPendingAction(null);
  };

  if (currentUser === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white to-white dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
            <div className="absolute inset-3 rounded-full border-4 border-blue-300 border-t-transparent animate-spin animate-reverse"></div>
            <div className="absolute inset-6 rounded-full border-2 border-blue-200 border-t-transparent animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Loading QuizMaster
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Preparing your test series platform...
          </p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case "welcome":
        return (
          <div className="animate-fade-in">
            <WelcomePage
              onGetStarted={handleGetStarted}
              onCreateSeries={handleCreateSeries}
              onViewExistingSeries={handleViewTestSeries}
            />
          </div>
        );
      case "homepage":
        return (
          <div className="animate-fade-in">
            <EnhancedHomepage
              onCreateSeries={handleCreateSeries}
              onViewSeries={handleViewSeries}
              onSubscribeSeries={handleSubscribeSeries}
              onViewTests={handleViewTests}
            />
          </div>
        );
      case "subscriptions":
        return (
          <div className="animate-fade-in">
            <UserSubscriptions
              onViewTests={handleViewTests}
              onSubscribeSeries={handleSubscribeSeries}
            />
          </div>
        );

      case "create-series":
        return (
          <div className="animate-fade-in">
            {isAdmin ? (
              <TestSeriesCreator
                onBack={handleBackToSeries}
                onSeriesCreated={handleSeriesCreated}
              />
            ) : (
              <div className="text-center text-red-400 font-semibold p-6">
                Access denied: Admins only
              </div>
            )}
          </div>
        );

      case "subscribe-series":
        if (isLoadingSeries || !selectedItem) {
          return (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center text-gray-400">Loading series...</div>
            </div>
          );
        }
        return (
          <div className="animate-fade-in">
            <TestSeriesSubscription
              testSeries={selectedItem}
              onSuccess={handleSubscriptionSuccess}
              onCancel={handleBackToSeries}
            />
          </div>
        );

      case "series-dashboard":
        if (isLoadingSeries || !selectedItem) {
          return (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center text-gray-400">Loading series...</div>
            </div>
          );
        }
        return (
          <div className="animate-fade-in">
            <TestSeriesDashboard
              testSeries={selectedItem}
              onBack={handleBackToSeries}
              onCreateManualTest={isAdmin ? handleCreateManualTest : undefined}
              onCreateAITest={isAdmin ? handleCreateAITest : undefined}
              onTakeTest={handleTakeTest}
              onViewLeaderboard={handleViewLeaderboard}
              onEditSeries={() => logger.log("Edit series:", selectedItem?.id)}
            />
          </div>
        );

      case "create-manual-test":
        if (isLoadingSeries || !selectedItem) {
          return (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center text-gray-400">Loading series...</div>
            </div>
          );
        }
        return (
          <div className="animate-fade-in">
            {isAdmin ? (
              <SectionWiseQuizCreator
                onBack={handleBackToDashboard}
                onQuizCreated={handleTestCreated}
                testSeriesId={selectedItem.id}
              />
            ) : (
              <div className="text-center text-red-400 font-semibold p-6">
                Access denied: Admins only
              </div>
            )}
          </div>
        );

      case "create-ai-test":
        if (isLoadingSeries || !selectedItem) {
          return (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center text-gray-400">Loading series...</div>
            </div>
          );
        }
        return (
          <div className="animate-fade-in">
            {isAdmin ? (
              <TestSeriesAIGenerator
                testSeries={selectedItem}
                onBack={handleBackToDashboard}
                onQuizCreated={handleTestCreated}
              />
            ) : (
              <div className="text-center text-red-400 font-semibold p-6">
                Access denied: Admins only
              </div>
            )}
          </div>
        );

      case "view-tests":
        if (isLoadingSeries || !selectedItem) {
          return (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center text-gray-400">Loading series...</div>
            </div>
          );
        }
        return (
          <div className="animate-fade-in">
            <TestSeriesTestsList
              testSeries={selectedItem}
              onBack={handleBackToSeries}
              onTakeTest={handleTakeTest}
              onViewLeaderboard={handleViewLeaderboard}
            />
          </div>
        );

      case "take-test":
        if (isLoadingSeries || !selectedItem?.test) {
          return (
            <div className="animate-fade-in">
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    Loading test data...
                  </p>
                </div>
              </div>
            </div>
          );
        }
        return (
          <div className="animate-fade-in">
            <TestAttemptViewer
              test={selectedItem.test}
              testSeries={selectedItem.testSeries}
              onBack={() => {
                if (selectedItem.testSeries) {
                  setSelectedItem(selectedItem.testSeries);
                  setCurrentView("view-tests");
                } else {
                  handleBackToDashboard();
                }
              }}
              onComplete={handleTestCompleted}
            />
          </div>
        );

      case "test-history":
        return (
          <div className="animate-fade-in">
            <TestAttemptHistory
              onBack={handleBackToSeries}
              onViewAttempt={handleViewAttemptDetails}
            />
          </div>
        );

      case "attempt-details":
        // Add Loading Guard here to prevent the error screen
        if (isLoadingSeries || !selectedItem) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  Loading results...
                </p>
              </div>
            </div>
          );
        }
        return (
          <div className="animate-fade-in">
            <TestAttemptDetails
              attempt={selectedItem}
              onBack={handleBackToHistory}
              testSeriesId={selectedItem?.testSeriesId}
            />
          </div>
        );

      case "test-leaderboard":
        if (isLoadingSeries) {
          return (
            <div className="animate-fade-in">
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    Loading quiz data...
                  </p>
                </div>
              </div>
            </div>
          );
        }
        return (
          <div className="animate-fade-in">
            <LeaderBoard
              quizId={selectedItem?.id}
              quizTitle={selectedItem?.title}
              testSeriesId={selectedItem?.testSeriesId}
              onBack={() => {
                if (selectedItem?.testSeriesId) {
                  const seriesData = { id: selectedItem.testSeriesId };
                  setSelectedItem(seriesData);
                  setCurrentView("view-tests");
                } else {
                  handleBackToSeries();
                }
              }}
              isIndividualTest={true}
            />
          </div>
        );

      case "take-quiz":
        if (isLoadingSeries) {
          return (
            <div className="animate-fade-in">
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    Loading quiz data...
                  </p>
                </div>
              </div>
            </div>
          );
        }
        return (
          <div className="animate-fade-in">
            <QuizTaker
              quiz={selectedItem}
              onBack={handleBackToSeries}
              onViewLeaderboard={(quiz) => {
                setSelectedItem(quiz);
                setCurrentView("leaderboard");
              }}
            />
          </div>
        );

      case "ai-generator":
        return (
          <div className="animate-fade-in">
            <AIQuizGenerator
              onClose={handleBackToSeries}
              onQuestionsGenerated={handleSeriesCreated}
            />
          </div>
        );

      case "attempts":
        return (
          <div className="animate-fade-in">
            <UserAttempts onBack={handleBackToSeries} />
          </div>
        );

      case "leaderboard":
        if (isLoadingSeries) {
          return (
            <div className="animate-fade-in">
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    Loading quiz data...
                  </p>
                </div>
              </div>
            </div>
          );
        }
        return (
          <div className="animate-fade-in">
            <LeaderBoard
              quizId={selectedItem?.id}
              quizTitle={selectedItem?.title}
              onBack={handleBackToSeries}
              isIndividualTest={false}
            />
          </div>
        );

      case "test-series":
        return (
          <div className="animate-fade-in">
            <TestSeriesList
              onCreateSeries={isAdmin ? handleCreateSeries : undefined}
              onViewSeries={handleViewSeries}
              onSubscribeSeries={handleSubscribeSeries}
              onTakeTest={handleTakeTest}
              onViewTests={handleViewTests}
            />
          </div>
        );

      default:
        return (
          <div className="animate-fade-in">
            <TestSeriesList
              onCreateSeries={isAdmin ? handleCreateSeries : undefined}
              onViewSeries={handleViewSeries}
              onSubscribeSeries={handleSubscribeSeries}
              onTakeTest={handleTakeTest}
              onViewTests={handleViewTests}
            />
          </div>
        );
    }
  };

  const showHeader = currentView !== "welcome";
  const showFooter = location.pathname === "/test-series";

  return (
    <div
      className={`flex flex-col min-h-screen transition-all duration-500 ${
        pageLoaded ? "opacity-100" : "opacity-0"
      } ${isDark ? "bg-gray-900" : "bg-white"}`}
    >
      {showHeader && (
        <Header
          onViewAttempts={handleViewAttempts}
          onViewHome={handleViewHome}
          onViewTestSeries={handleViewTestSeries}
          onViewWelcome={handleViewWelcome}
          onLoginClick={handleLoginClick}
          currentView={currentView}
        />
      )}

      <main className={`flex-grow ${showHeader ? "pt-20" : ""} relative`}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl animate-pulse transition-all duration-500 ${
              isDark ? "bg-blue-400/5" : "bg-blue-400/10"
            }`}
          ></div>
          <div
            className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl animate-pulse delay-1000 transition-all duration-500 ${
              isDark ? "bg-green-400/5" : "bg-green-400/10"
            }`}
          ></div>
        </div>

        <div className="relative z-10">
          <ErrorBoundary>{renderContent()}</ErrorBoundary>
        </div>
      </main>

      <LoginPopup
        isOpen={showLoginPopup}
        onClose={handleCloseLoginPopup}
        onLoginClick={handleLoginClick}
        pendingAction={pendingAction}
      />

      {showFooter && <Footer />}
    </div>
  );
};

// Enhanced Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    logger.error("App Error:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[500px] p-8">
          <div className="text-center max-w-lg mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/20 dark:to-red-800/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-red-500 text-3xl">⚠️</span>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Oops! Something went wrong
            </h2>

            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              We encountered an unexpected error. Don't worry, your data is
              safe. Please try refreshing the page or go back to the home page.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
              >
                🔄 Refresh Page
              </button>

              <button
                onClick={() => (window.location.href = "/test-series")}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
              >
                🏠 Go Home
              </button>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 mb-2">
                  Show Error Details (Development)
                </summary>
                <pre className="mt-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs overflow-auto max-h-40">
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const ApplyCreator = () => {
  const navigate = useNavigate();

  const handleApply = () => {
    navigate("/test-series");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 p-8">
      <div className="max-w-2xl mx-auto bg-gray-800/80 backdrop-blur-xl border border-gray-700/60 rounded-xl p-8">
        <h1 className="text-3xl font-bold text-white mb-4">Become a Creator</h1>
        <p className="text-gray-300 mb-6">
          Join our platform as a creator to publish your own quizzes and test
          series.
        </p>

        <button
          onClick={handleApply}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Apply Now
        </button>
      </div>
    </div>
  );
};

const FlashcardRoute = () => {
  const navigate = useNavigate();
  return <FlashcardReview onBack={() => navigate("/")} />;
};

const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <SubscriptionProvider>
            <Routes>
              <Route
                path="/study-planner"
                element={
                  <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
                    <StudyPlanGenerator
                      onClose={() => navigate("/dashboard")}
                    />
                  </div>
                }
              />
              <Route
                path="/challenge/:challengeId"
                element={<ChallengeLanding />}
              />
              <Route path="/flashcards" element={<FlashcardRoute />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/apply-creator" element={<ApplyCreator />} />
              <Route path="/login" element={<AuthForm />} />
              <Route path="/" element={<AppContent />} />
              <Route path="/welcome" element={<AppContent />} />
              <Route path="/homepage" element={<AppContent />} />
              <Route path="/subscriptions" element={<AppContent />} />
              <Route path="/test-series" element={<AppContent />} />
              <Route path="/create-series" element={<AppContent />} />
              <Route path="/ai-generator" element={<AppContent />} />
              <Route
                path="/section-quiz-creator"
                element={
                  <SectionWiseQuizCreator
                    onBack={() => window.history.back()}
                    onQuizCreated={() =>
                      (window.location.href = "/test-series")
                    }
                  />
                }
              />
              <Route path="/test-history" element={<AppContent />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsAndConditions />} />
              <Route path="/refunds" element={<RefundPolicy />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/series/:seriesId/*" element={<AppContent />} />
              <Route path="/test/:testId/*" element={<AppContent />} />
              <Route path="/attempt/:attemptId" element={<AppContent />} />
              <Route path="/quiz/:quizId/*" element={<AppContent />} />
              <Route path="*" element={<AppContent />} />
            </Routes>
          </SubscriptionProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
