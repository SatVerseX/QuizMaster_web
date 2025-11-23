import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { collection, query, where, getDocs, doc, updateDoc, increment, arrayUnion, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import {
  FiBookOpen,
  FiClock,
  FiPlay,
  FiBarChart2,
  FiTarget,
  FiActivity,
  FiCalendar,
  FiAlertCircle,
} from "react-icons/fi";
import { FaRobot, FaStar, FaRegStar } from "react-icons/fa";
import { submitRating, canUserRate, getUserRating } from "../../services/ratingService";

const TestSeriesTestsList = ({
  testSeries,
  onTakeTest,
  onViewLeaderboard,
}) => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Rating State
  const [canRate, setCanRate] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [savingRating, setSavingRating] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [ratingError, setRatingError] = useState(null);
  const [ratingSuccess, setRatingSuccess] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  // Real-time Data State
  const [subscriberCount, setSubscriberCount] = useState(testSeries?.totalSubscribers || 0);
  const [averageRating, setAverageRating] = useState(testSeries?.averageRating || 0);
  const [ratingsCount, setRatingsCount] = useState(testSeries?.ratingsCount || 0);

  // --- Effects & Logic ---
  useEffect(() => {
    if (testSeries?.id && currentUser?.uid) {
      const incrementView = async () => {
        try {
          const alreadySubscribed = Array.isArray(testSeries.subscribedUsers) 
            ? testSeries.subscribedUsers.includes(currentUser.uid) 
            : false;
            
          if (!alreadySubscribed) {
            await updateDoc(doc(db, "test-series", testSeries.id), {
              totalSubscribers: increment(1),
              subscribedUsers: arrayUnion(currentUser.uid),
            });
          }
        } catch (e) {
          console.warn("Failed to increment view:", e);
        }
      };
      incrementView();
    }
  }, [testSeries?.id, currentUser?.uid]);

  useEffect(() => {
    if (!testSeries?.id) return;
    const unsubscribe = onSnapshot(doc(db, 'test-series', testSeries.id), (snap) => {
      const data = snap.data();
      if (data) {
        if (typeof data.totalSubscribers === 'number') setSubscriberCount(data.totalSubscribers);
        if (typeof data.averageRating === 'number') setAverageRating(data.averageRating);
        if (typeof data.ratingsCount === 'number') setRatingsCount(data.ratingsCount);
      }
    });
    return unsubscribe;
  }, [testSeries?.id]);

  useEffect(() => {
    if (!testSeries?.id) {
      setError("Test series ID is missing");
      setLoading(false);
      return;
    }

    const initData = async () => {
      try {
        if (currentUser?.uid) {
          const [allowed, existing] = await Promise.all([
            canUserRate(testSeries.id, currentUser.uid),
            getUserRating({ seriesId: testSeries.id, userId: currentUser.uid })
          ]);
          setCanRate(!!allowed);
          if (existing?.value) {
            setUserRating(existing.value);
            setHasRated(true);
          }
        }

        const [quizzesSnap, sectionSnap] = await Promise.all([
          getDocs(query(collection(db, "quizzes"), where("testSeriesId", "==", testSeries.id))),
          getDocs(query(collection(db, "section-quizzes"), where("testSeriesId", "==", testSeries.id)))
        ]);

        let allTests = [];

        quizzesSnap.forEach(doc => {
          const data = doc.data();
          allTests.push({
            id: doc.id,
            ...data,
            type: "regular",
            totalQuestions: data.totalQuestions || data.questions?.length || 0,
            timeLimit: data.timeLimit || 0
          });
        });

        sectionSnap.forEach(doc => {
          const data = doc.data();
          const sections = data.sections || [];
          allTests.push({
            id: doc.id,
            ...data,
            type: "section-wise",
            totalQuestions: data.totalQuestions || sections.reduce((acc, s) => acc + (s.questions?.length || 0), 0),
            timeLimit: sections.reduce((acc, s) => acc + (s.timeLimit || 0), 0)
          });
        });

        allTests.sort((a, b) => {
          if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
          return dateB - dateA;
        });

        const enrichedTests = await Promise.all(allTests.map(async (t) => {
          try {
            const q1 = query(collection(db, 'test-attempts'), where('testId', '==', t.id));
            const q2 = query(collection(db, 'quiz-attempts'), where('quizId', '==', t.id));
            const [s1, s2] = await Promise.all([getDocs(q1), getDocs(q2)]);
            return { ...t, totalAttempts: (s1.size || 0) + (s2.size || 0) };
          } catch {
            return { ...t, totalAttempts: 0 };
          }
        }));

        setTests(enrichedTests);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load test data.");
        setLoading(false);
      }
    };

    initData();
  }, [testSeries?.id, currentUser?.uid]);

  const handleRate = async (value) => {
    if (!currentUser?.uid || !canRate || savingRating) return;
    setSavingRating(true);
    setRatingError(null);
    try {
      const result = await submitRating({ seriesId: testSeries.id, userId: currentUser.uid, value });
      if (result.success) {
        setUserRating(value);
        setHasRated(true);
        setRatingSuccess(true);
        setTimeout(() => setRatingSuccess(false), 3000);
      }
    } catch (err) {
      setRatingError(err.message || "Failed to rate");
      setTimeout(() => setRatingError(null), 3000);
    } finally {
      setSavingRating(false);
    }
  };

  const getDifficultyColor = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'hard': return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900';
      case 'easy': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900';
      default: return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
  };

  if (loading) {
    return (
      <div className={`min-h-screen p-4 ${isDark ? "bg-gray-900" : "bg-slate-50"}`}>
        <div className="max-w-5xl mx-auto space-y-6">
          <div className={`h-48 rounded-2xl animate-pulse ${isDark ? "bg-gray-800" : "bg-gray-200"}`} />
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-32 rounded-xl animate-pulse ${isDark ? "bg-gray-800" : "bg-white"}`} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full overflow-hidden pb-12 ${isDark ? "bg-gray-900" : "bg-slate-50"}`}>
      <div className="max-w-6xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6">
        
        {/* --- Hero Section --- */}
        <div className="relative mb-6 sm:mb-8">
           <div className={`p-4 sm:p-6 rounded-3xl overflow-hidden border w-full ${
             isDark 
               ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700" 
               : "bg-white border-slate-200 shadow-sm"
           }`}>
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 w-full">
               <div className="w-full">
                 <div className="flex items-center gap-2 mb-2 flex-wrap">
                   <span className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wide ${
                     isDark ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-700"
                   }`}>
                     Test Series
                   </span>
                   <span className={`text-xs sm:text-sm whitespace-nowrap ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                     • {tests.length} Tests
                   </span>
                 </div>
                 <h1 className={`text-xl sm:text-3xl font-bold mb-2 break-words ${isDark ? "text-white" : "text-slate-900"}`}>
                   {testSeries.title}
                 </h1>
                 <p className={`max-w-2xl text-sm md:text-base ${isDark ? "text-gray-400" : "text-slate-600"}`}>
                   {testSeries.description || "Comprehensive evaluation series designed to test your knowledge and improve your skills."}
                 </p>
                 
                 {/* Responsive Stats Box */}
                 <div className={`mt-6 w-full md:w-auto grid grid-cols-3 md:flex items-center md:gap-8 px-2 sm:px-6 py-3 sm:py-4 rounded-2xl backdrop-blur-md ${
                    isDark ? "bg-white/5 border border-white/10" : "bg-slate-50 border border-slate-100"
                  }`}>
                    <div className="text-center md:text-left border-r md:border-r-0 border-gray-200 dark:border-gray-700 px-1">
                      <div className={`text-lg sm:text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                        {tests.length}
                      </div>
                      <div className={`text-[10px] sm:text-xs font-medium uppercase tracking-wider ${isDark ? "text-gray-500" : "text-slate-500"}`}>
                        Tests
                      </div>
                    </div>
                    <div className={`hidden md:block w-px h-8 ${isDark ? "bg-gray-700" : "bg-slate-200"}`} />
                    <div className="text-center md:text-left border-r md:border-r-0 border-gray-200 dark:border-gray-700 px-1">
                      <div className={`text-lg sm:text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                        {subscriberCount}
                      </div>
                      <div className={`text-[10px] sm:text-xs font-medium uppercase tracking-wider ${isDark ? "text-gray-500" : "text-slate-500"}`}>
                        Students
                      </div>
                    </div>
                    <div className={`hidden md:block w-px h-8 ${isDark ? "bg-gray-700" : "bg-slate-200"}`} />
                    <div className="text-center md:text-left px-1">
                      <div className="flex items-center justify-center md:justify-start gap-1">
                        <span className={`text-lg sm:text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                          {Number(averageRating).toFixed(1)}
                        </span>
                        <FaStar className="text-yellow-400 w-3 h-3 sm:w-4 sm:h-4" />
                      </div>
                      <div className={`text-[10px] sm:text-xs font-medium uppercase tracking-wider ${isDark ? "text-gray-500" : "text-slate-500"}`}>
                        Rating
                      </div>
                    </div>
                 </div>
               </div>
             </div>
           </div>
        </div>

        {/* --- Rating Section --- */}
        {canRate && (
          <div className={`mb-8 p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 w-full ${
            isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-slate-200"
          }`}>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start text-center sm:text-left">
               <div className={`p-3 rounded-full flex-shrink-0 ${isDark ? "bg-yellow-500/20" : "bg-yellow-50"}`}>
                 <FaStar className="text-yellow-500 w-5 h-5" />
               </div>
               <div>
                 <h3 className={`font-semibold text-sm sm:text-base ${isDark ? "text-white" : "text-slate-900"}`}>
                   {hasRated ? "You've rated this series" : "Rate this Series"}
                 </h3>
                 <p className={`text-xs ${isDark ? "text-gray-400" : "text-slate-500"}`}>
                   {hasRated ? "Click stars to update" : "Share your experience"}
                 </p>
               </div>
            </div>
            <div className="flex flex-col items-center sm:items-end w-full sm:w-auto">
              <div className="flex gap-2 sm:gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    disabled={savingRating}
                    onClick={() => handleRate(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className={`p-1 transition-transform hover:scale-110 disabled:opacity-50`}
                  >
                    {star <= (hoverRating || userRating) ? (
                      <FaStar className="w-6 h-6 sm:w-6 sm:h-6 text-yellow-400 drop-shadow-sm" />
                    ) : (
                      <FaRegStar className={`w-6 h-6 sm:w-6 sm:h-6 ${isDark ? "text-gray-600" : "text-gray-300"}`} />
                    )}
                  </button>
                ))}
              </div>
              {ratingSuccess && <span className="text-xs text-green-500 font-medium mt-1">Submitted!</span>}
              {ratingError && <span className="text-xs text-red-500 font-medium mt-1">{ratingError}</span>}
            </div>
          </div>
        )}

        {/* --- Tests List --- */}
        {error ? (
          <div className={`p-6 rounded-xl border text-center ${isDark ? "bg-red-900/10 border-red-800" : "bg-red-50 border-red-200"}`}>
            <FiAlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-500 font-medium">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-2 text-sm underline text-red-500">Retry</button>
          </div>
        ) : tests.length > 0 ? (
          <div className="grid gap-4 w-full">
            {tests.map((test, index) => (
              <div
                key={test.id}
                className={`group relative p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-1 w-full ${
                  isDark 
                    ? "bg-gray-800 border-gray-700 hover:border-blue-500/50 hover:shadow-lg" 
                    : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-xl"
                }`}
              >
                {/* Responsive Layout: Column on mobile, Row on Desktop */}
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center w-full">
                  
                  {/* Info Section: Takes full width minus buttons on desktop */}
                  <div className="flex-1 min-w-0 flex gap-3 w-full">
                    
                    {/* Index Number */}
                    <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-sm sm:text-lg font-bold shadow-sm ${
                      isDark ? "bg-gray-700 text-gray-300" : "bg-slate-100 text-slate-600"
                    }`}>
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    
                    {/* Title & Meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className={`text-sm sm:text-lg font-bold truncate max-w-full leading-tight ${isDark ? "text-white" : "text-slate-800"}`}>
                          {test.title}
                        </h3>
                        {/* Difficulty/AI Tags - Only wrap if needed */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {test.isAIGenerated && (
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 ${
                              isDark ? "bg-purple-500/20 text-purple-300" : "bg-purple-100 text-purple-700"
                            }`}>
                              <FaRobot className="w-3 h-3" />
                            </span>
                          )}
                          <span className={`px-1.5 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wide ${getDifficultyColor(test.difficulty)}`}>
                            {test.difficulty || 'Med'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Metadata Row - Wraps nicely on mobile */}
                      <div className={`flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs sm:text-sm ${isDark ? "text-gray-400" : "text-slate-500"}`}>
                        <div className="flex items-center gap-1">
                           <FiTarget className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                           <span>{test.totalQuestions} Qs</span>
                        </div>
                        <div className="flex items-center gap-1">
                           <FiClock className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                           <span>{test.timeLimit}m</span>
                        </div>
                        {test.totalAttempts > 0 && (
                          <div className="flex items-center gap-1">
                             <FiActivity className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                             <span>{test.totalAttempts} Runs</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 hidden sm:flex">
                           <FiCalendar className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                           <span>{formatDate(test.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons - Grid 2 cols on mobile for perfect fit */}
                  <div className="grid grid-cols-2 gap-2 w-full lg:w-auto mt-1 lg:mt-0">
                    {onViewLeaderboard && (
                      <button
                        onClick={() => onViewLeaderboard(test)}
                        className={`px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors border whitespace-nowrap ${
                          isDark 
                            ? "border-gray-600 text-gray-300 hover:bg-gray-700" 
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <FiBarChart2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>Rank</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => onTakeTest && onTakeTest(test, testSeries)}
                      className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 whitespace-nowrap truncate ${
                        !onViewLeaderboard ? 'col-span-2' : ''
                      }`}
                    >
                      <FiPlay className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current flex-shrink-0" />
                      <span>Start</span>
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-16 rounded-3xl border-2 border-dashed ${
            isDark ? "border-gray-800 bg-gray-900/50" : "border-slate-200 bg-slate-50/50"
          }`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              isDark ? "bg-gray-800 text-gray-600" : "bg-white text-slate-400 shadow-sm"
            }`}>
              <FiBookOpen className="w-8 h-8" />
            </div>
            <h3 className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
              No Tests Added Yet
            </h3>
            <p className={`text-sm ${isDark ? "text-gray-500" : "text-slate-500"}`}>
              Check back later or contact the instructor for updates.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestSeriesTestsList;