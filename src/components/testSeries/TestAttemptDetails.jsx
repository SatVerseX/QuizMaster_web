import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import usePopup from "../../hooks/usePopup";
import BeautifulPopup from "../common/BeautifulPopup";
import { FiArrowLeft, FiRefreshCw, FiAlertCircle } from "react-icons/fi";
import TestAttemptHeader from "./TestAttemptHeader";
import PerformanceOverview from "../test-analysis/PerformanceOverview";
import SectionWiseAnalysis from "../test-analysis/SectionWiseAnalysis";
import QuestionNavigator from "./QuestionNavigator";
import DownloadModal from "./DownloadModal";
import ShareModal from "./ShareModal";

const TestAttemptDetails = ({
  attempt,
  onBack,
  testSeriesId,
  testSeries: propTestSeries,
}) => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const { popupState, showError, showSuccess, hidePopup } = usePopup();
  const [testDetails, setTestDetails] = useState(null);
  const [testSeries, setTestSeries] = useState(propTestSeries);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState("overview");

  // Early validation
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

  // Update testSeries when prop changes
  useEffect(() => {
    if (propTestSeries) {
      setTestSeries(propTestSeries);
    }
  }, [propTestSeries]);

  // Extract questions from embedded sections structure
  const extractQuestionsFromSections = (sections) => {
    if (!sections || !Array.isArray(sections)) {
      return [];
    }

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

  // Load test details
  const loadTestDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!attempt || !attempt.testId) {
        throw new Error("Attempt data is not available");
      }

      // Try to load from both collections
      let testDoc = await getDoc(doc(db, "quizzes", attempt.testId));
      let collectionType = "quizzes";

      if (!testDoc.exists()) {
        testDoc = await getDoc(doc(db, "section-quizzes", attempt.testId));
        collectionType = "section-quizzes";
      }

      if (testDoc.exists()) {
        const testData = { id: testDoc.id, ...testDoc.data() };

        // Extract questions from sections if available
        if (testData.sections && Array.isArray(testData.sections)) {
          const extractedQuestions = extractQuestionsFromSections(
            testData.sections
          );
          if (extractedQuestions.length > 0) {
            testData.allQuestions = extractedQuestions;
          }
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

  // Get question analysis
  const getQuestionAnalysis = () => {
    let questionsToAnalyze = [];

    // Priority-based question loading
    if (testDetails?.allQuestions && testDetails.allQuestions.length > 0) {
      questionsToAnalyze = testDetails.allQuestions;
    } else if (attempt?.questions && attempt.questions.length > 0) {
      questionsToAnalyze = attempt.questions.map((q, index) => ({
        ...q,
        globalIndex: index,
      }));
    } else if (testDetails?.questions && testDetails.questions.length > 0) {
      questionsToAnalyze = testDetails.questions.map((q, index) => ({
        ...q,
        globalIndex: index,
      }));
    } else if (testDetails?.sections && Array.isArray(testDetails.sections)) {
      questionsToAnalyze = extractQuestionsFromSections(testDetails.sections);
    }

    if (questionsToAnalyze.length === 0) {
      return [];
    }

    // Analyze each question
    return questionsToAnalyze.map((question, index) => {
      const questionIndex =
        question.globalIndex !== undefined ? question.globalIndex : index;
      const userAnswer = attempt.answers?.[questionIndex];
      const isCorrect =
        userAnswer !== undefined &&
        userAnswer !== null &&
        userAnswer === question.correctAnswer;
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

  // Handle retake test
  const handleRetakeTest = async () => {
    if (safeAttempt.testId) {
      try {
        let testDoc = await getDoc(doc(db, "quizzes", safeAttempt.testId));
        let collectionType = "quizzes";

        if (!testDoc.exists()) {
          testDoc = await getDoc(
            doc(db, "section-quizzes", safeAttempt.testId)
          );
          collectionType = "section-quizzes";
        }

        if (testDoc.exists()) {
          // Use unified route. App.jsx resolves whether it's section-wise by probing both collections.
          window.location.href = `/test/${safeAttempt.testId}/take`;
        } else {
          showError(
            "Test not found. It may have been deleted.",
            "Test Not Found"
          );
        }
      } catch (error) {
        console.error("Error loading test:", error);
        showError("Failed to load test. Please try again.", "Load Error");
      }
    } else {
      showError(
        "Unable to retake test. Test information not available.",
        "Retake Error"
      );
    }
  };

  // Error state
  if (error) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="max-w-md mx-auto text-center p-8">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
            isDark ? "bg-red-500/20" : "bg-red-100"
          }`}>
            <FiAlertCircle className={`w-10 h-10 ${
              isDark ? "text-red-400" : "text-red-600"
            }`} />
          </div>
          <h3
            className={`text-2xl font-bold mb-4 ${
              isDark ? "text-gray-100" : "text-gray-800"
            }`}
          >
            Unable to Load Details
          </h3>
          <p className={`mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            {error}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onBack} 
              className={`px-6 py-3 rounded-lg border transition-colors flex items-center gap-2 ${
                isDark
                  ? "border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <FiArrowLeft className="w-5 h-5" />
              Back to History
            </button>
            <button
              onClick={() => {
                setError(null);
                loadTestDetails();
              }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <FiRefreshCw className="w-5 h-5" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="text-center">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
              isDark ? "bg-blue-500/20" : "bg-blue-100"
            }`}
          >
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3
            className={`text-xl font-bold mb-2 ${
              isDark ? "text-gray-100" : "text-gray-800"
            }`}
          >
            Loading Analysis
          </h3>
          <p className={isDark ? "text-gray-400" : "text-gray-600"}>
            Preparing your detailed performance report...
          </p>
        </div>
      </div>
    );
  }

  // Create safe attempt object
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
  const isSectionWise = questionAnalysis.some((q) => q.sectionId);

  return (
    <div
      className={`min-h-screen ${
        isDark ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <TestAttemptHeader
          attempt={safeAttempt}
          testSeries={testSeries || {}}
          onBack={onBack}
          onDownload={() => setShowDownloadModal(true)}
          onShare={() => setShowShareModal(true)}
        />

        {/* Mobile Tabs */}
        <div className="lg:hidden mt-6 mb-4">
          <div className={`flex rounded-xl p-1 ${
            isDark ? "bg-gray-800" : "bg-gray-200"
          }`}>
            <button
              onClick={() => setActiveMobileTab("overview")}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeMobileTab === "overview"
                  ? "bg-blue-600 text-white shadow-md"
                  : isDark
                  ? "text-gray-300 hover:text-gray-100"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Overview
            </button>
            {isSectionWise && (
              <button
                onClick={() => setActiveMobileTab("sections")}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeMobileTab === "sections"
                    ? "bg-blue-600 text-white shadow-md"
                    : isDark
                    ? "text-gray-300 hover:text-gray-100"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Sections
              </button>
            )}
            {!isSectionWise && (
              <button
                onClick={() => setActiveMobileTab("questions")}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeMobileTab === "questions"
                    ? "bg-blue-600 text-white shadow-md"
                    : isDark
                    ? "text-gray-300 hover:text-gray-100"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Questions ({questionAnalysis.length})
              </button>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Performance Overview */}
          <div
            className={`lg:block lg:col-span-1 ${
              activeMobileTab === "overview" ? "" : "hidden"
            }`}
          >
            <PerformanceOverview
              attempt={safeAttempt}
              questionAnalysis={questionAnalysis}
            />
          </div>

          {/* Section-wise Analysis (only for section-wise quizzes) */}
          {isSectionWise && (
            <div
              className={`lg:block lg:col-span-2 ${
                activeMobileTab === "sections" ? "" : "hidden"
              }`}
            >
              <SectionWiseAnalysis
                questionAnalysis={questionAnalysis}
                attempt={safeAttempt}
              />
            </div>
          )}

          {/* Question navigator only in non section wise quizzes */}
          {!isSectionWise && (
            <div
              className={`lg:block lg:col-span-2 ${
                activeMobileTab === "questions" ? "" : "hidden"
              }`}
            >
              {questionAnalysis.length > 0 ? (
                <QuestionNavigator
                  questionAnalysis={questionAnalysis}
                  attempt={safeAttempt}
                />
              ) : (
                <div
                  className={`border rounded-xl p-8 text-center ${
                    isDark
                      ? "bg-gray-900 border-gray-700"
                      : "bg-white border-gray-200 shadow-sm"
                  }`}
                >
                  <FiAlertCircle
                    className={`w-16 h-16 mx-auto mb-4 ${
                      isDark ? "text-gray-500" : "text-gray-400"
                    }`}
                  />
                  <h3
                    className={`text-xl font-bold mb-2 ${
                      isDark ? "text-gray-100" : "text-gray-800"
                    }`}
                  >
                    Question Details Not Available
                  </h3>
                  <p
                    className={`mb-4 ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Unable to load detailed question analysis for this test.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={onBack}
            className={`group border rounded-xl px-6 py-3 font-semibold transition-all duration-200 flex items-center gap-3 hover:scale-105 w-full sm:w-auto ${
              isDark
                ? "border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:border-gray-500"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-sm hover:shadow-md"
            }`}
          >
            <FiArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            <span>Back to Test History</span>
          </button>

          <button
            onClick={handleRetakeTest}
            className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl px-6 py-3 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl w-full sm:w-auto"
          >
            <div className="flex items-center justify-center gap-3">
              <FiRefreshCw className="w-5 h-5 transition-transform group-hover:rotate-180" />
              <span>Retake Test</span>
            </div>
          </button>
        </div>

        {/* Modals */}
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

        <BeautifulPopup {...popupState} onClose={hidePopup} />
      </div>
    </div>
  );
};

export default TestAttemptDetails;
