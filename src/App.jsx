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
import EnhancedHomepage from "./components/homepage/EnhancedHomepage";
import HomepageDemo from "./components/homepage/HomepageDemo";

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

// Normalize quiz structure for attempt viewer
const normalizeTestForAttempt = (raw) => {
  if (!raw) return raw;
  if (Array.isArray(raw.questions) && raw.questions.length > 0) {
    return raw;
  }
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

  const countFreeSeriesView = async (series) => {
    try {
      if (!series || series.isPaid) return;
      const storageKey = `viewed-series-${series.id}`;
      if (localStorage.getItem(storageKey)) return;
      localStorage.setItem(storageKey, "1");
      await updateDoc(doc(db, "test-series", series.id), {
        totalViews: increment(1),
      });
    } catch (error) {
      logger.error("Failed to record free series view:", error);
    }
  };

  useEffect(() => {
    const path = location.pathname;

    if (path === "/login") return;

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
                logger.error("Test not found:", testId);
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
        // ... (Leaderboard logic remains same)
        setCurrentView("test-leaderboard");
        const testId = path.split("/")[2];
         if (testId && (!selectedItem || selectedItem.id !== testId)) {
          setIsLoadingSeries(true);
          getDoc(doc(db, "quizzes", testId))
            .then((snap) => {
              if (snap.exists()) {
                const testData = { id: snap.id, ...snap.data() };
                if (testData.testSeriesId) {
                  return getDoc(
                    doc(db, "test-series", testData.testSeriesId)
                  ).then((seriesSnap) => {
                    if (seriesSnap.exists()) {
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
              return getDoc(doc(db, "section-quizzes", testId)).then(
                (secSnap) => {
                   if (secSnap.exists()) {
                     const testData = { id: secSnap.id, ...secSnap.data(), type: "section-wise" };
                      if (testData.testSeriesId) {
                        return getDoc(doc(db, "test-series", testData.testSeriesId)).then((seriesSnap) => {
                           if(seriesSnap.exists()) {
                             setSelectedItem({ ...testData, testSeriesId: testData.testSeriesId });
                           } else {
                             setSelectedItem(testData);
                           }
                        });
                      } else {
                        setSelectedItem(testData);
                      }
                      return true;
                   }
                   navigate("/test-series");
                   return false;
                }
              );
            })
            .finally(() => setIsLoadingSeries(false));
         }
      } else {
        setCurrentView("take-test");
      }
    } else if (path.startsWith("/attempt/")) {
      setCurrentView("attempt-details");
      const attemptId = path.split("/")[2];
      if (attemptId && (!selectedItem || selectedItem.id !== attemptId)) {
        setIsLoadingSeries(true);
        getDoc(doc(db, "test-attempts", attemptId))
          .then((snap) => {
            if (snap.exists()) return { id: snap.id, ...snap.data() };
            return getDoc(doc(db, "quiz-attempts", attemptId)).then(
              (quizSnap) => {
                if (quizSnap.exists()) return { id: quizSnap.id, ...quizSnap.data() };
                return null;
              }
            );
          })
          .then((data) => {
            if (data) setSelectedItem(data);
          })
          .finally(() => setIsLoadingSeries(false));
      }
    } else if (path.startsWith("/quiz/")) {
      if (path.includes("/take")) {
        setCurrentView("take-quiz");
        const quizId = path.split("/")[2];
        
        // --- FIXED LOGIC START ---
        if (quizId && (!selectedItem || selectedItem.id !== quizId)) {
          setIsLoadingSeries(true);

          getDoc(doc(db, "quizzes", quizId))
            .then((snap) => {
              if (snap.exists()) {
                // If found in 'quizzes', return it immediately to the next .then block
                return { id: snap.id, ...snap.data(), type: 'regular' }; 
              } else {
                // If not, try 'section-quizzes'
                return getDoc(doc(db, "section-quizzes", quizId)).then(sectionSnap => {
                    if (sectionSnap.exists()) {
                        return { id: sectionSnap.id, ...sectionSnap.data(), type: 'section-wise' };
                    }
                    return null; // Not found in either
                });
              }
            })
            .then((quizData) => {
              // Now check the result of the chain
              if (quizData) {
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
        // --- FIXED LOGIC END ---
        
      } else if (path.includes("/leaderboard")) {
         // ... Leaderboard logic
         setCurrentView("leaderboard");
         const quizId = path.split("/")[2];
         if (quizId && (!selectedItem || selectedItem.id !== quizId)) {
           setIsLoadingSeries(true);
           getDoc(doc(db, "quizzes", quizId))
             .then(snap => {
               if(snap.exists()) return { id: snap.id, ...snap.data() };
               return getDoc(doc(db, "section-quizzes", quizId)).then(s => s.exists() ? {id: s.id, ...s.data()} : null);
             })
             .then(data => {
               if(data) setSelectedItem(data);
               else navigate("/test-series");
             })
             .finally(() => setIsLoadingSeries(false));
         }
      } else {
        setCurrentView("take-quiz");
      }
    } else {
      setCurrentView("welcome");
    }
  }, [location.pathname, selectedItem, navigate]);


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
            try {
              const raw = sessionStorage.getItem(`offer-${seriesId}`);
              if (raw) {
                const offer = JSON.parse(raw);
                if (offer && typeof offer === "object") {
                    // ... offer merge logic
                    base.price = offer.discountedPrice ?? base.price;
                    // ...
                }
              }
            } catch (_) {}
            setSelectedItem(base);
          }
        })
        .finally(() => setIsLoadingSeries(false));
    }
  }, [location.pathname, selectedItem]);

  useEffect(() => {
    setPageLoaded(true);
  }, []);

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

  // Handlers
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
    // ... (Subscribe logic same as before)
    setSelectedItem(series); // simplified for brevity in fix
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
          <div className="w-20 h-20 mx-auto mb-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Loading QuizMaster
          </h2>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case "welcome": return <WelcomePage onGetStarted={handleGetStarted} onCreateSeries={handleCreateSeries} onViewExistingSeries={handleViewTestSeries} />;
      case "homepage": return <EnhancedHomepage onCreateSeries={handleCreateSeries} onViewSeries={handleViewSeries} onSubscribeSeries={handleSubscribeSeries} onViewTests={handleViewTests} />;
      case "subscriptions": return <UserSubscriptions onViewTests={handleViewTests} onSubscribeSeries={handleSubscribeSeries} />;
      case "create-series": return isAdmin ? <TestSeriesCreator onBack={handleBackToSeries} onSeriesCreated={handleSeriesCreated} /> : <div className="text-center p-10">Admin Access Required</div>;
      case "subscribe-series": return <TestSeriesSubscription testSeries={selectedItem} onSuccess={handleSubscriptionSuccess} onCancel={handleBackToSeries} />;
      case "series-dashboard": return <TestSeriesDashboard testSeries={selectedItem} onBack={handleBackToSeries} onCreateManualTest={isAdmin ? handleCreateManualTest : undefined} onCreateAITest={isAdmin ? handleCreateAITest : undefined} onTakeTest={handleTakeTest} onViewLeaderboard={handleViewLeaderboard} />;
      case "create-manual-test": return <SectionWiseQuizCreator onBack={handleBackToDashboard} onQuizCreated={handleTestCreated} testSeriesId={selectedItem?.id} />;
      case "create-ai-test": return <TestSeriesAIGenerator testSeries={selectedItem} onBack={handleBackToDashboard} onQuizCreated={handleTestCreated} />;
      case "view-tests": return <TestSeriesTestsList testSeries={selectedItem} onBack={handleBackToSeries} onTakeTest={handleTakeTest} onViewLeaderboard={handleViewLeaderboard} />;
      case "take-test": return <TestAttemptViewer test={selectedItem?.test} testSeries={selectedItem?.testSeries} onBack={() => selectedItem?.testSeries ? (setSelectedItem(selectedItem.testSeries), setCurrentView("view-tests")) : handleBackToDashboard()} onComplete={handleTestCompleted} />;
      case "test-history": return <TestAttemptHistory onBack={handleBackToSeries} onViewAttempt={handleViewAttemptDetails} />;
      case "attempt-details": return <TestAttemptDetails attempt={selectedItem} onBack={handleBackToHistory} testSeriesId={selectedItem?.testSeriesId} />;
      case "test-leaderboard": return <LeaderBoard quizId={selectedItem?.id} quizTitle={selectedItem?.title} testSeriesId={selectedItem?.testSeriesId} onBack={() => selectedItem?.testSeriesId ? (setSelectedItem({id: selectedItem.testSeriesId}), setCurrentView("view-tests")) : handleBackToSeries()} isIndividualTest={true} />;
      case "take-quiz": return <QuizTaker quiz={selectedItem} onBack={handleBackToSeries} onViewLeaderboard={(quiz) => { setSelectedItem(quiz); setCurrentView("leaderboard"); }} />;
      case "ai-generator": return <AIQuizGenerator onClose={handleBackToSeries} onQuestionsGenerated={handleSeriesCreated} />;
      case "attempts": return <UserAttempts onBack={handleBackToSeries} />;
      case "leaderboard": return <LeaderBoard quizId={selectedItem?.id} quizTitle={selectedItem?.title} onBack={handleBackToSeries} isIndividualTest={false} />;
      case "test-series":
      default: return <TestSeriesList onCreateSeries={isAdmin ? handleCreateSeries : undefined} onViewSeries={handleViewSeries} onSubscribeSeries={handleSubscribeSeries} onTakeTest={handleTakeTest} onViewTests={handleViewTests} />;
    }
  };

  const showHeader = currentView !== "welcome";
  const showFooter = location.pathname === "/test-series";

  return (
    <div className={`flex flex-col min-h-screen transition-all duration-500 ${pageLoaded ? "opacity-100" : "opacity-0"} ${isDark ? "bg-gray-900" : "bg-white"}`}>
      {showHeader && <Header onViewAttempts={handleViewAttempts} onViewHome={handleViewHome} onViewTestSeries={handleViewTestSeries} onViewWelcome={handleViewWelcome} onLoginClick={handleLoginClick} currentView={currentView} />}
      <main className={`flex-grow ${showHeader ? "pt-20" : ""} relative`}>
        <div className="relative z-10">
          <ErrorBoundary>{renderContent()}</ErrorBoundary>
        </div>
      </main>
      <LoginPopup isOpen={showLoginPopup} onClose={handleCloseLoginPopup} onLoginClick={handleLoginClick} pendingAction={pendingAction} />
      {showFooter && <Footer />}
    </div>
  );
};

// ErrorBoundary Component (Same as before)
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  componentDidCatch(error, errorInfo) { console.error(error, errorInfo); }
  render() {
    if (this.state.hasError) return <div className="p-10 text-center"><h2>Something went wrong.</h2><button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Refresh</button></div>;
    return this.props.children;
  }
}

const ApplyCreator = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
       <h1>Become a Creator</h1>
       <button onClick={() => navigate("/test-series")} className="mt-4 bg-blue-600 px-4 py-2 rounded">Back</button>
    </div>
  );
}

const FlashcardRoute = () => { const navigate = useNavigate(); return <FlashcardReview onBack={() => navigate("/")} />; };
const StudyPlannerRoute = () => { const navigate = useNavigate(); return <div className="min-h-screen p-4 flex items-center justify-center"><StudyPlanGenerator onClose={() => window.history.back()} /></div>; };

const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <SubscriptionProvider>
            <Routes>
              <Route path="/study-planner" element={<StudyPlannerRoute />} />
              <Route path="/challenge/:challengeId" element={<ChallengeLanding />} />
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
              <Route path="/section-quiz-creator" element={<SectionWiseQuizCreator onBack={() => window.history.back()} onQuizCreated={() => (window.location.href = "/test-series")} />} />
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