import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import {
  FiBookOpen,
  FiClock,
  FiPlay,
  FiTrendingUp,
  FiArrowLeft,
  FiTarget,
  FiUsers,
  FiStar,
  FiActivity,
  FiCalendar,
  FiZap,
  FiAlertCircle,
} from "react-icons/fi";
import { FaRobot, FaGraduationCap, FaStar } from "react-icons/fa";
import { submitRating, canUserRate, getUserRating } from "../../services/ratingService";

const TestSeriesTestsList = ({
  testSeries,
  onBack,
  onTakeTest,
  onViewLeaderboard,
}) => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canRate, setCanRate] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [savingRating, setSavingRating] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [ratingError, setRatingError] = useState(null);
  const [ratingSuccess, setRatingSuccess] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  // Dev-only logger to avoid noisy logs in production
  const debugLog = (...args) => {
    if (
      import.meta?.env?.DEV ||
      import.meta?.env?.VITE_DEBUG_LOGGING === "true"
    ) {
      try {
        console.log(...args);
      } catch {}
    }
  };

  useEffect(() => {
    if (!testSeries?.id) {
      setError("Test series ID is missing");
      setLoading(false);
      return;
    }

    loadTests();
    // Check rating eligibility
    (async () => {
      try {
        if (currentUser?.uid) {
          const allowed = await canUserRate(testSeries.id, currentUser.uid);
          setCanRate(!!allowed);
          const existing = await getUserRating({ seriesId: testSeries.id, userId: currentUser.uid });
          if (existing && typeof existing.value === 'number') {
            setUserRating(existing.value);
            setHasRated(true);
          } else {
            setHasRated(false);
            setUserRating(0);
          }
        } else {
          setCanRate(false);
          setHasRated(false);
          setUserRating(0);
        }
      } catch (err) {
        debugLog('Error checking rating eligibility:', err);
        setCanRate(false);
        setHasRated(false);
        setUserRating(0);
      }
    })();
    return () => {};
  }, [testSeries?.id, currentUser?.uid]);

  const loadTests = async () => {
    debugLog("Loading tests for series:", testSeries.id);

    try {
      // Load from both collections
      const [quizzesSnapshot, sectionQuizzesSnapshot] = await Promise.all([
        getDocs(
          query(
            collection(db, "quizzes"),
            where("testSeriesId", "==", testSeries.id)
          )
        ),
        getDocs(
          query(
            collection(db, "section-quizzes"),
            where("testSeriesId", "==", testSeries.id)
          )
        ),
      ]);

      const testsData = [];

      // Add regular quizzes
      quizzesSnapshot.forEach((doc) => {
        const data = doc.data();
        const derivedTotalQuestions =
          data.totalQuestions != null
            ? data.totalQuestions
            : Array.isArray(data.questions)
            ? data.questions.length
            : 0;
        const derivedTimeLimit = data.timeLimit || 0;
        const testData = {
          id: doc.id,
          ...data,
          type: "regular",
          totalQuestions: derivedTotalQuestions,
          timeLimit: derivedTimeLimit,
        };
        debugLog("Regular test found:", testData.title);
        testsData.push(testData);
      });

      // Add section-wise quizzes (derive totals for display)
      sectionQuizzesSnapshot.forEach((doc) => {
        const data = doc.data();
        const sections = Array.isArray(data.sections) ? data.sections : [];
        const derivedTotalQuestions =
          data.totalQuestions != null
            ? data.totalQuestions
            : sections.reduce(
                (sum, s) =>
                  sum + (Array.isArray(s.questions) ? s.questions.length : 0),
                0
              );
        const derivedTimeLimit = sections.reduce(
          (sum, s) => sum + (s?.timeLimit || 0),
          0
        );
        const testData = {
          id: doc.id,
          ...data,
          type: "section-wise",
          totalQuestions: derivedTotalQuestions,
          timeLimit: derivedTimeLimit,
        };
        debugLog("Section-wise test found:", testData.title);
        testsData.push(testData);
      });

      // Sort by order field if it exists, otherwise by creation date
      testsData.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        if (a.createdAt && b.createdAt) {
          const dateA = a.createdAt.toDate
            ? a.createdAt.toDate()
            : new Date(a.createdAt);
          const dateB = b.createdAt.toDate
            ? b.createdAt.toDate()
            : new Date(b.createdAt);
          return dateB - dateA; // Newest first
        }
        return 0;
      });

      // Enrich attempts count per test from attempts collections
      const withAttempts = await Promise.all(testsData.map(async (t) => {
        try {
          const [testAttemptsSnap, quizAttemptsSnap] = await Promise.all([
            getDocs(query(collection(db, 'test-attempts'), where('testId', '==', t.id))),
            getDocs(query(collection(db, 'quiz-attempts'), where('quizId', '==', t.id)))
          ]);
          const totalAttempts = (testAttemptsSnap?.size || 0) + (quizAttemptsSnap?.size || 0);
          return { ...t, totalAttempts };
        } catch (e) {
          console.warn('Attempt count load failed for test', t.id, e);
          return { ...t, totalAttempts: t.totalAttempts || 0 };
        }
      }));

      debugLog("Final tests array:", withAttempts.length);
      setTests(withAttempts);
      setLoading(false);
      setError(null);

      return null;
    } catch (err) {
      console.error("Error loading tests:", err);
      setError(`Failed to load tests: ${err.message}`);
      setLoading(false);
      return null;
    }
  };

  const memoTests = useMemo(() => tests, [tests]);
  const handleTakeTest = useCallback(
    (test) => onTakeTest && onTakeTest(test, testSeries),
    [onTakeTest, testSeries]
  );
  const handleLeaderboard = useCallback(
    (test) => onViewLeaderboard && onViewLeaderboard(test),
    [onViewLeaderboard]
  );

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "bg-green-500";
      case "hard":
        return "bg-red-500";
      default:
        return "bg-yellow-500";
    }
  };

  const handleRate = async (value) => {
    if (!currentUser?.uid || !canRate || savingRating) return;
    
    try {
      setSavingRating(true);
      setRatingError(null);
      setRatingSuccess(false);
      
      const result = await submitRating({ 
        seriesId: testSeries.id, 
        userId: currentUser.uid, 
        value 
      });
      
      if (result.success) {
        setUserRating(value);
        setHasRated(true);
        setRatingSuccess(true);
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => setRatingSuccess(false), 3000);
      }
    } catch (error) {
      debugLog('Rating submission error:', error);
      setRatingError(error.message || 'Failed to submit rating');
      
      // Auto-hide error message after 5 seconds
      setTimeout(() => setRatingError(null), 5000);
    } finally {
      setSavingRating(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown";
    try {
      return timestamp.toDate().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (err) {
      return "Invalid Date";
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-white"}`}>
        <div className="max-w-6xl mx-auto p-6">
          <div className="animate-pulse space-y-6">
            <div
              className={`h-8 rounded w-64 ${
                isDark ? "bg-gray-700" : "bg-gray-300"
              }`}
            ></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-32 rounded-xl ${
                    isDark ? "bg-gray-700" : "bg-gray-200"
                  }`}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-white"}`}>
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div>
              <h1
                className={`text-xl sm:text-2xl font-bold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {testSeries.title}
              </h1>
              <p
                className={`text-sm ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                All Available Tests • {tests.length} Tests
              </p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6">
            <div
              className={`rounded-xl p-4 border ${
                isDark
                  ? "bg-red-900/20 border-red-700"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <FiAlertCircle className="w-5 h-5 text-red-500" />
                <h3
                  className={`text-lg font-bold ${
                    isDark ? "text-red-300" : "text-red-700"
                  }`}
                >
                  Error Loading Tests
                </h3>
              </div>
              <p className={`mb-3 ${isDark ? "text-red-200" : "text-red-600"}`}>
                {error}
              </p>
              <button
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  loadTests();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Series Stats */}
        <div className="mb-6">
          <div
            className={`border rounded-xl p-4 ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex justify-between items-center gap-4">
              {/* Total Tests */}
              <div className="text-center">
                <div
                  className={`text-xl font-bold ${
                    isDark ? "text-blue-400" : "text-blue-600"
                  }`}
                >
                  {tests.length}
                </div>
                <div
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Total Tests
                </div>
              </div>

              {/* Students */}
              <div className="text-center">
                <div
                  className={`text-xl font-bold ${
                    isDark ? "text-purple-400" : "text-purple-600"
                  }`}
                >
                  {testSeries.totalSubscribers || 0}
                </div>
                <div
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Students
                </div>
              </div>

              {/* Average Rating */}
              <div className="text-center">
                <div
                  className={`text-xl font-bold ${
                    isDark ? "text-green-400" : "text-green-600"
                  }`}
                >
                  {(
                    Number(testSeries.averageRating || 0).toFixed
                      ? Number(testSeries.averageRating || 0).toFixed(1)
                      : (testSeries.averageRating || 0)
                  )}
                </div>
                <div
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Average Rating
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Rating Section */}
        {canRate && (
        <div className="mb-6">
          <div
            className={`border rounded-xl p-4 ${
              isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className={`text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-800"}`}>
                  {hasRated ? "Your Rating" : "Rate This Series"}
                </div>
                {hasRated && (
                  <div className={`text-xs ${isDark ? "text-gray-500" : "text-gray-600"}`}>
                    Click to update your rating
                  </div>
                )}
              </div>
              
              <div className="flex flex-col items-end gap-2">
                {/* Star Rating */}
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map((starValue) => (
                    <button
                      key={starValue}
                      onClick={() => handleRate(starValue)}
                      onMouseEnter={() => setHoverRating(starValue)}
                      onMouseLeave={() => setHoverRating(0)}
                      disabled={savingRating}
                      className={`p-1 rounded transition-all duration-150 ${
                        savingRating ? 'cursor-wait' : 'cursor-pointer hover:scale-110'
                      }`}
                      title={`Rate ${starValue} star${starValue !== 1 ? 's' : ''}`}
                    >
                      <FaStar 
                        className={`w-5 h-5 transition-colors duration-150 ${
                          (hoverRating || userRating) >= starValue 
                            ? 'text-yellow-400' 
                            : isDark ? 'text-gray-600' : 'text-gray-300'
                        } ${savingRating ? 'opacity-50' : ''}`} 
                      />
                    </button>
                  ))}
                  {savingRating && (
                    <div className="ml-2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>

                {/* Rating Info */}
                <div className="text-right">
                  {hasRated && userRating > 0 && (
                    <div className={`text-xs ${isDark ? "text-green-400" : "text-green-600"}`}>
                      You rated: {userRating} star{userRating !== 1 ? 's' : ''}
                    </div>
                  )}
                  <div className={`text-xs ${isDark ? "text-gray-500" : "text-gray-600"}`}>
                    Series avg: {Number(testSeries.averageRating || 0).toFixed(1)} 
                    ({testSeries.ratingsCount || 0} rating{testSeries.ratingsCount !== 1 ? 's' : ''})
                  </div>
                </div>
              </div>
            </div>

            {/* Success Message */}
            {ratingSuccess && (
              <div className={`mt-3 p-2 rounded-lg ${
                isDark ? "bg-green-900/30 text-green-400" : "bg-green-50 text-green-700"
              }`}>
                <div className="flex items-center gap-2 text-sm">
                  <FiStar className="w-4 h-4" />
                  {hasRated ? "Rating updated successfully!" : "Thanks for rating!"}
                </div>
              </div>
            )}

            {/* Error Message */}
            {ratingError && (
              <div className={`mt-3 p-2 rounded-lg ${
                isDark ? "bg-red-900/30 text-red-400" : "bg-red-50 text-red-700"
              }`}>
                <div className="flex items-center gap-2 text-sm">
                  <FiAlertCircle className="w-4 h-4" />
                  {ratingError}
                </div>
              </div>
            )}
          </div>
        </div>
        )}

        {/* Not Eligible Message */}
        {currentUser && !canRate && (
          <div className="mb-6">
            <div
              className={`border rounded-xl p-4 ${
                isDark ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <FiAlertCircle className={`w-5 h-5 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                <div>
                  <div className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    Complete a test to rate this series
                  </div>
                  <div className={`text-xs ${isDark ? "text-gray-500" : "text-gray-600"}`}>
                    Take any test from this series to unlock rating
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tests List */}
        <div>
          {tests.length > 0 ? (
            <div className="space-y-4">
              {tests.map((test, index) => (
                <div
                  key={test.id}
                  className={`border rounded-xl p-4  ${
                    isDark
                      ? "bg-gray-800 border-gray-700 "
                      : "bg-white border-gray-200 "
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    {/* Test Number */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                        <span className="text-lg font-bold text-white">
                          {index + 1}
                        </span>
                      </div>
                    </div>

                    {/* Test Info */}
                    <div className="flex-1 w-full">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3
                              className={`text-lg font-bold ${
                                isDark ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {test.title}
                            </h3>
                            {test.isAIGenerated && (
                              <span
                                className={`px-2 py-1 text-xs font-bold rounded-full flex items-center gap-1 ${
                                  isDark
                                    ? "bg-purple-600/20 text-purple-400"
                                    : "bg-purple-100 text-purple-600"
                                }`}
                              >
                                <FaRobot className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-sm mb-2 ${
                              isDark ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {test.description ||
                              "Comprehensive test to evaluate your knowledge and skills."}
                          </p>
                        </div>

                        {/* Difficulty Badge */}
                        <div
                          className={`px-3 py-1 rounded-lg ${getDifficultyColor(
                            test.difficulty
                          )} text-white font-bold text-xs flex-shrink-0`}
                        >
                          {test.difficulty?.toUpperCase() || "MEDIUM"}
                        </div>
                      </div>

                      {/* Test Stats */}
                      <div className="flex flex-wrap gap-4 mb-3">
                        <div
                          className={`flex items-center gap-1 ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          <FiTarget className="w-4 h-4 text-blue-500" />
                          <span className="text-sm">
                            <strong
                              className={
                                isDark ? "text-white" : "text-gray-900"
                              }
                            >
                              {test.totalQuestions != null
                                ? test.totalQuestions
                                : test.questions?.length || 0}
                            </strong>{" "}
                            Questions
                          </span>
                        </div>

                        <div
                          className={`flex items-center gap-1 ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          <FiClock className="w-4 h-4 text-green-500" />
                          <span className="text-sm">
                            <strong
                              className={
                                isDark ? "text-white" : "text-gray-900"
                              }
                            >
                              {test.timeLimit ||
                                (Array.isArray(test.sections)
                                  ? test.sections.reduce(
                                      (sum, s) => sum + (s?.timeLimit || 0),
                                      0
                                    )
                                  : 0)}
                            </strong>{" "}
                            Minutes
                          </span>
                        </div>

                        <div
                          className={`flex items-center gap-1 ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          <FiActivity className="w-4 h-4 text-purple-500" />
                          <span className="text-sm">
                            <strong
                              className={
                                isDark ? "text-white" : "text-gray-900"
                              }
                            >
                              {test.totalAttempts || 0}
                            </strong>{" "}
                            Attempts
                          </span>
                        </div>

                        <div
                          className={`flex items-center gap-1 ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          <FiCalendar className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm">
                            <strong
                              className={
                                isDark ? "text-white" : "text-gray-900"
                              }
                            >
                              {formatDate(test.createdAt)}
                            </strong>
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() =>
                            onTakeTest && onTakeTest(test, testSeries)
                          }
                          className="flex-1 bg-green-600 hover:cursor-pointer text-white font-bold py-2 px-4 rounded-lg"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <FiPlay className="w-4 h-4" />
                            <span>Take Test Now</span>
                          </div>
                        </button>
                        <button
                          onClick={() =>
                            onViewLeaderboard && onViewLeaderboard(test)
                          }
                          className={`px-4 py-2  rounded-lg font-bold flex items-center justify-center gap-2 ${
                            isDark
                              ? "bg-gradient-to-r from-orange-600 to-pink-600 text-white hover:cursor-pointer"
                              : "bg-gradient-to-r from-orange-600 to-pink-600 text-white hover:cursor-pointer"
                          }`}
                        >
                          <FiTrendingUp className="w-4 h-4" />
                          <span>Leaderboard</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  isDark ? "bg-gray-800" : "bg-gray-100"
                }`}
              >
                <FiBookOpen className="w-12 h-12 text-blue-500" />
              </div>
              <h3
                className={`text-2xl font-bold mb-2 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                No Tests Available
              </h3>
              <p
                className={`text-lg ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                This test series doesn't have any tests yet. Check back later!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestSeriesTestsList;
