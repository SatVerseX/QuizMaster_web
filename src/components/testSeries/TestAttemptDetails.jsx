import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import usePopup from "../../hooks/usePopup";
import BeautifulPopup from "../common/BeautifulPopup";
import { 
  FiRefreshCw, 
  FiAlertCircle, 
  FiShare2, 
  FiDownload, 
  FiAward,
  FiChevronRight,
  FiActivity,
  FiLayers
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import FlashcardGenerator from "../flashcards/FlashcardGenerator";
import TestAttemptHeader from "./TestAttemptHeader";
import PerformanceOverview from "../test-analysis/PerformanceOverview";
import SectionWiseAnalysis from "../test-analysis/SectionWiseAnalysis";
import QuestionNavigator from "./QuestionNavigator";
import DownloadModal from "./DownloadModal";
import ShareModal from "./ShareModal";

// --- Helper for Gamified Badges ---
const getPerformanceBadge = (percentage) => {
  if (percentage >= 90) return { label: "Elite", color: "text-emerald-500", bg: "bg-emerald-500/10", icon: "👑" };
  if (percentage >= 75) return { label: "Pro", color: "text-blue-500", bg: "bg-blue-500/10", icon: "🏆" };
  if (percentage >= 50) return { label: "Apprentice", color: "text-amber-500", bg: "bg-amber-500/10", icon: "⭐" };
  return { label: "Rookie", color: "text-slate-500", bg: "bg-slate-500/10", icon: "🌱" };
};

const TestAttemptDetails = ({
  attempt,
  onBack,
  testSeriesId,
  testSeries: propTestSeries,
}) => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const { popupState, showError, showSuccess, hidePopup } = usePopup();
  
  // State
  const [showFlashcardGen, setShowFlashcardGen] = useState(false);
  const [testDetails, setTestDetails] = useState(null);
  const [testSeries, setTestSeries] = useState(propTestSeries);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState("overview");
  const [showConfetti, setShowConfetti] = useState(false);

  // Early validation & Setup
  useEffect(() => {
    if (!attempt) {
      setError("No attempt data provided");
      setLoading(false);
      return;
    }
    if (!attempt.id && !attempt.testId) {
      setError("Invalid attempt data - missing required IDs");
      setLoading(false);
      return;
    }
    loadTestDetails();
  }, [attempt?.id, attempt?.testId]);

  useEffect(() => {
    if (propTestSeries) setTestSeries(propTestSeries);
  }, [propTestSeries]);

  // Gamification: Trigger confetti on high scores
  useEffect(() => {
    if (!loading && attempt) {
      const percentage = (attempt.score / (attempt.totalQuestions * (attempt.marksPerQuestion || 1))) * 100; // Approximate
      // Or simple correct/total ratio
      const simplePercentage = (attempt.correctAnswers / attempt.totalQuestions) * 100;
      
      if (simplePercentage > 80) {
        setShowConfetti(true);
        const timer = setTimeout(() => setShowConfetti(false), 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [loading, attempt]);

  // --- Data Extraction Logic (Kept identical to original for logic safety) ---
  const extractQuestionsFromSections = (sections) => {
    if (!sections || !Array.isArray(sections)) return [];
    const allQuestions = [];
    sections.forEach((section, sectionIndex) => {
      if (section.questions && Array.isArray(section.questions)) {
        section.questions.forEach((question, questionIndex) => {
          allQuestions.push({
            ...question,
            sectionId: section.id || `section_${sectionIndex}`,
            sectionName: section.name || `Section ${sectionIndex + 1}`,
            sectionIndex,
            questionIndex,
            globalIndex: allQuestions.length,
            difficulty: question.difficulty || section.difficulty || "medium",
          });
        });
      }
    });
    return allQuestions;
  };

  const loadTestDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!attempt || !attempt.testId) throw new Error("Attempt data is not available");

      let testDoc = await getDoc(doc(db, "quizzes", attempt.testId));
      if (!testDoc.exists()) {
        testDoc = await getDoc(doc(db, "section-quizzes", attempt.testId));
      }

      if (testDoc.exists()) {
        const testData = { id: testDoc.id, ...testDoc.data() };
        if (testData.sections && Array.isArray(testData.sections)) {
          const extractedQuestions = extractQuestionsFromSections(testData.sections);
          if (extractedQuestions.length > 0) testData.allQuestions = extractedQuestions;
        }
        setTestDetails(testData);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error in loadTestDetails:", error);
      setError(error.message || "Failed to load test details");
      setLoading(false);
    }
  };

  // --- Analysis Logic ---
  const getQuestionAnalysis = () => {
    let questionsToAnalyze = [];
    if (testDetails?.allQuestions?.length > 0) {
      questionsToAnalyze = testDetails.allQuestions;
    } else if (attempt?.questions?.length > 0) {
      questionsToAnalyze = attempt.questions.map((q, index) => ({ ...q, globalIndex: index }));
    } else if (testDetails?.questions?.length > 0) {
      questionsToAnalyze = testDetails.questions.map((q, index) => ({ ...q, globalIndex: index }));
    } else if (testDetails?.sections && Array.isArray(testDetails.sections)) {
      questionsToAnalyze = extractQuestionsFromSections(testDetails.sections);
    }

    if (questionsToAnalyze.length === 0) return [];

    return questionsToAnalyze.map((question, index) => {
      const questionIndex = question.globalIndex !== undefined ? question.globalIndex : index;
      const userAnswer = attempt.answers?.[questionIndex];
      const isCorrect = userAnswer !== undefined && userAnswer !== null && userAnswer === question.correctAnswer;
      const isFlagged = attempt.flaggedQuestions?.includes(questionIndex);
      const isAnswered = userAnswer !== undefined && userAnswer !== null;

      return {
        ...question,
        index: questionIndex,
        userAnswer,
        isCorrect,
        isFlagged,
        isAnswered,
        status: isCorrect ? "correct" : isAnswered ? "incorrect" : "skipped",
      };
    });
  };

  // Handle Retake
  const handleRetakeTest = async () => {
    if (safeAttempt.testId) {
      try {
        // Simple redirect logic for robustness
        window.location.href = `/test/${safeAttempt.testId}/take`;
      } catch (error) {
        showError("Failed to load test. Please try again.", "Load Error");
      }
    } else {
      showError("Unable to retake test.", "Retake Error");
    }
  };

  // --- Safe Data Prep ---
  const safeAttempt = {
    id: "unknown",
    testTitle: "Unknown Test",
    testId: null,
    score: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    timeSpent: 0,
    submittedAt: new Date(),
    answers: [],
    flaggedQuestions: [],
    ...attempt,
  };

  const questionAnalysis = getQuestionAnalysis();
  const incorrectQuestions = questionAnalysis.filter(q => q.status === 'incorrect');
  const isSectionWise = questionAnalysis.some((q) => q.sectionId);
  
  // Calculate simple stats for badge
  const scorePercent = safeAttempt.totalQuestions > 0 
    ? (safeAttempt.correctAnswers / safeAttempt.totalQuestions) * 100 
    : 0;
  const badge = getPerformanceBadge(scorePercent);

  // --- Render Logic ---
  {incorrectQuestions.length > 0 && (
   <button onClick={() => setShowFlashcardGen(true)}>
      Review Mistakes with Flashcards
   </button>
)}

{showFlashcardGen && (
   <FlashcardGenerator 
      userId={currentUser.uid}
      mistakes={incorrectQuestions}
      testTitle={attempt.testTitle}
      onClose={() => setShowFlashcardGen(false)}
   />
)}

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-slate-950" : "bg-slate-50"}`}>
        <div className="max-w-md mx-auto text-center p-8">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${isDark ? "bg-red-500/10" : "bg-red-100"}`}>
            <FiAlertCircle className={`w-12 h-12 ${isDark ? "text-red-400" : "text-red-600"}`} />
          </div>
          <h3 className={`text-2xl font-bold mb-4 ${isDark ? "text-slate-100" : "text-slate-800"}`}>Unable to Load</h3>
          <p className={`mb-8 ${isDark ? "text-slate-400" : "text-slate-600"}`}>{error}</p>
          <button
            onClick={() => { setError(null); loadTestDetails(); }}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 mx-auto"
          >
            <FiRefreshCw className="w-5 h-5" /> Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-slate-950" : "bg-slate-50"}`}>
        <div className="text-center space-y-4">
           {/* Custom Skeleton Loader Animation */}
          <div className="flex gap-2 justify-center">
            {[0, 1, 2].map(i => (
               <motion.div 
                 key={i}
                 animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                 transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                 className="w-4 h-4 rounded-full bg-blue-600"
               />
            ))}
          </div>
          <p className={`font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}>Crunching your numbers...</p>
        </div>
      </div>
    );
  }
  

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      {showConfetti && <Confetti recycle={false} numberOfPieces={400} />}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Breadcrumb / Back Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <button onClick={onBack} className={`flex items-center gap-2 text-sm font-medium transition-colors ${isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-800"}`}>
            <div className={`p-2 rounded-lg ${isDark ? "bg-slate-800" : "bg-white shadow-sm"}`}>
              <FiChevronRight className="w-4 h-4 rotate-180" />
            </div>
            <span>Back to Dashboard</span>
          </button>

          {/* Badge Display (Gamification) */}
          <div className={`flex items-center gap-3 px-4 py-2 rounded-full border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
             <span className="text-xl">{badge.icon}</span>
             <div className="flex flex-col leading-none">
               <span className={`text-xs font-bold uppercase tracking-wider ${badge.color}`}>{badge.label} Rank</span>
             </div>
          </div>
        </motion.div>

        {/* Main Header Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <TestAttemptHeader
            attempt={safeAttempt}
            testSeries={testSeries || {}}
            onBack={null} // Handled above
            // Pass empty handlers here to hide default buttons if we want custom ones, 
            // or keep them and style the header component internally.
            // Assuming we keep them:
            onDownload={() => setShowDownloadModal(true)}
            onShare={() => setShowShareModal(true)}
          />
        </motion.div>

        {/* Custom Action Bar (Floating/Sticky or Standard) */}
        <div className="flex flex-wrap gap-3 mb-8">
          {incorrectQuestions.length > 0 && (
             <button
               onClick={() => setShowFlashcardGen(true)}
               className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all transform hover:-translate-y-0.5 ${
                 isDark 
                   ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/20' 
                   : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
               }`}
             >
               <FiLayers className="w-4 h-4" /> 
               Turn Mistakes to Flashcards ({incorrectQuestions.length})
             </button>
           )}
           
           <div className="flex-grow hidden sm:block"></div>
           <button
            onClick={handleRetakeTest}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all transform hover:-translate-y-0.5"
          >
            <FiRefreshCw className="w-4 h-4" /> Retake Challenge
          </button>
        </div>

        {/* Mobile Tab Switcher (Segmented Control Style) */}
        <div className="lg:hidden mb-8">
          <div className={`p-1.5 rounded-xl flex ${isDark ? "bg-slate-900" : "bg-slate-100"}`}>
            {["overview", isSectionWise ? "sections" : null, !isSectionWise ? "questions" : null].filter(Boolean).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveMobileTab(tab)}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all relative ${
                  activeMobileTab === tab 
                    ? isDark ? "text-white" : "text-slate-900"
                    : isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {activeMobileTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className={`absolute inset-0 rounded-lg shadow-sm ${isDark ? "bg-slate-700" : "bg-white"}`}
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <span className="relative z-10 capitalize">
                  {tab === "questions" ? `Questions (${questionAnalysis.length})` : tab}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Performance (Sticky on Desktop) */}
          <div className={`lg:col-span-4 lg:block ${activeMobileTab === "overview" ? "block" : "hidden"}`}>
             <div className="lg:sticky lg:top-6 space-y-6">
                <div className={`rounded-2xl border overflow-hidden ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                  <div className={`p-4 border-b flex items-center gap-2 ${isDark ? "border-slate-800 bg-slate-800/50" : "border-slate-100 bg-slate-50/50"}`}>
                    <FiActivity className="text-blue-500" />
                    <h3 className="font-semibold text-sm uppercase tracking-wide opacity-80">Performance Metrics</h3>
                  </div>
                  <PerformanceOverview
                    attempt={safeAttempt}
                    questionAnalysis={questionAnalysis}
                  />
                </div>
             </div>
          </div>

          {/* Right Column: Detailed Analysis */}
          <div className={`lg:col-span-8 space-y-6 ${activeMobileTab !== "overview" ? "block" : "hidden lg:block"}`}>
            
            {/* Section Analysis */}
            {isSectionWise && (activeMobileTab === "sections" || activeMobileTab === "overview") && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`rounded-2xl border overflow-hidden ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}
              >
                <div className={`p-5 border-b ${isDark ? "border-slate-800" : "border-slate-100"}`}>
                  <h3 className="font-bold text-lg">Section Breakdown</h3>
                  <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Detailed performance by topic area</p>
                </div>
                <div className="p-1">
                  <SectionWiseAnalysis
                    questionAnalysis={questionAnalysis}
                    attempt={safeAttempt}
                  />
                </div>
              </motion.div>
            )}

            {/* Question Navigator */}
            {!isSectionWise && (activeMobileTab === "questions" || activeMobileTab === "overview") && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl border overflow-hidden ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}
              >
                 <div className={`p-5 border-b flex justify-between items-center ${isDark ? "border-slate-800" : "border-slate-100"}`}>
                    <div>
                      <h3 className="font-bold text-lg">Question Review</h3>
                      <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Review your answers and solutions</p>
                    </div>
                    <div className={`text-xs font-mono px-2 py-1 rounded ${isDark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-600"}`}>
                      {questionAnalysis.length} Items
                    </div>
                </div>
                {questionAnalysis.length > 0 ? (
                  <QuestionNavigator
                    questionAnalysis={questionAnalysis}
                    attempt={safeAttempt}
                  />
                ) : (
                  <div className="p-12 text-center">
                    <FiAlertCircle className={`w-12 h-12 mx-auto mb-3 ${isDark ? "text-slate-700" : "text-slate-200"}`} />
                    <p className={isDark ? "text-slate-500" : "text-slate-400"}>Analysis data unavailable</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Modals (Z-Index handling usually in component) */}
        <AnimatePresence>
          {showDownloadModal && (
            <DownloadModal
              attempt={safeAttempt}
              questionAnalysis={questionAnalysis}
              onClose={() => setShowDownloadModal(false)}
              loading={downloadLoading}
              setLoading={setDownloadLoading}
            />
          )}
          {showShareModal && (
            <ShareModal
              attempt={safeAttempt}
              onClose={() => setShowShareModal(false)}
            />
          )}
          {showFlashcardGen && (
            <FlashcardGenerator 
              userId={currentUser.uid}
              mistakes={incorrectQuestions}
              testTitle={safeAttempt.testTitle || "Test Mistakes"}
              onClose={() => setShowFlashcardGen(false)}
            />
          )}
        </AnimatePresence>

        <BeautifulPopup {...popupState} onClose={hidePopup} />
      </div>
    </div>
  );
};

export default TestAttemptDetails;