import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { 
  FiBookOpen, 
  FiArrowRight, 
  FiCreditCard, 
  FiUser, 
  FiTrendingUp, 
  FiAward,
  FiGrid 
} from "react-icons/fi";
import { FaCrown, FaStar } from "react-icons/fa";

const UserSubscriptions = ({ onViewTests, onSubscribeSeries }) => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [subs, setSubs] = useState([]);
  const [series, setSeries] = useState([]);

  // --- Data Loading Logic (Preserved) ---
  useEffect(() => {
    const load = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const q = query(
          collection(db, "test-series-subscriptions"),
          where("userId", "==", currentUser.uid),
          where("status", "==", "active")
        );
        const snapshot = await getDocs(q);
        const activeSubs = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setSubs(activeSubs);

        const ids = Array.from(
          new Set(
            activeSubs.map((s) => s.testSeriesId || s.seriesId).filter(Boolean)
          )
        );
        
        if (ids.length > 0) {
          const seriesDocs = await Promise.all(
            ids.map((id) => getDoc(doc(db, "test-series", id)))
          );
          const seriesData = seriesDocs
            .filter((s) => s.exists())
            .map((s) => ({ id: s.id, ...s.data() }));

          // Enrich with totalTests count
          const seriesWithCounts = await Promise.all(
            seriesData.map(async (s) => {
              try {
                const [q1, q2] = await Promise.all([
                  getDocs(query(collection(db, "quizzes"), where("testSeriesId", "==", s.id))),
                  getDocs(query(collection(db, "section-quizzes"), where("testSeriesId", "==", s.id))),
                ]);
                return { ...s, totalTests: (q1?.size || 0) + (q2?.size || 0) };
              } catch (e) {
                return { ...s, totalTests: s.totalTests || 0 };
              }
            })
          );
          setSeries(seriesWithCounts);
        } else {
          setSeries([]);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentUser]);

  const activeSeries = useMemo(() => {
    const map = new Map(series.map((s) => [s.id, s]));
    return subs
      .map((s) => map.get(s.testSeriesId || s.seriesId))
      .filter(Boolean);
  }, [subs, series]);

  const handleUpgrade = (s) => {
    if (onSubscribeSeries) {
      onSubscribeSeries({ id: s.id, isPaid: true });
    }
  };

  const isPremiumUser = activeSeries.some((s) => s.isPaid);

  if (loading) {
    return (
      <div className={`min-h-screen p-8 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className={`lg:col-span-1 h-64 rounded-3xl animate-pulse ${isDark ? "bg-gray-800" : "bg-gray-200"}`} />
          <div className="lg:col-span-3 space-y-6">
            <div className={`h-32 rounded-3xl animate-pulse ${isDark ? "bg-gray-800" : "bg-gray-200"}`} />
            <div className={`h-32 rounded-3xl animate-pulse ${isDark ? "bg-gray-800" : "bg-gray-200"}`} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full pb-12 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      
      {/* Header Background Decoration */}
      <div className={`absolute top-0 left-0 right-0 h-64 ${
        isDark ? "bg-gradient-to-b from-blue-900/20 to-transparent" : "bg-gradient-to-b from-blue-100/50 to-transparent"
      }`} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* --- Sidebar: User Profile & Status --- */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className={`sticky top-8 rounded-3xl p-6 border shadow-lg ${
              isDark 
                ? "bg-gray-800/50 border-gray-700 backdrop-blur-xl" 
                : "bg-white border-white shadow-blue-100/50"
            }`}>
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-inner ${
                  isDark ? "bg-gray-700 text-gray-300" : "bg-blue-50 text-blue-600"
                }`}>
                  {currentUser?.photoURL ? (
                    <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    currentUser?.displayName?.charAt(0) || <FiUser />
                  )}
                </div>
                <div>
                  <h2 className={`font-bold text-lg leading-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                    {currentUser?.displayName || "Student"}
                  </h2>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    {currentUser?.email}
                  </p>
                </div>
              </div>

              <div className={`p-4 rounded-2xl mb-6 border ${
                isPremiumUser
                  ? isDark ? "bg-gradient-to-br from-yellow-900/20 to-yellow-900/10 border-yellow-500/30" : "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200"
                  : isDark ? "bg-gray-700/30 border-gray-600" : "bg-gray-50 border-gray-100"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    isPremiumUser 
                      ? isDark ? "text-yellow-400" : "text-yellow-700"
                      : isDark ? "text-gray-400" : "text-gray-500"
                  }`}>
                    Current Plan
                  </span>
                  {isPremiumUser && <FaCrown className="text-yellow-500" />}
                </div>
                <div className={`text-xl font-extrabold ${
                  isPremiumUser 
                    ? isDark ? "text-yellow-200" : "text-yellow-800"
                    : isDark ? "text-white" : "text-gray-900"
                }`}>
                  {isPremiumUser ? "Premium Scholar" : "Free Account"}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className={isDark ? "text-gray-400" : "text-gray-600"}>Active Courses</span>
                  <span className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{activeSeries.length}</span>
                </div>
                <div className={`h-px ${isDark ? "bg-gray-700" : "bg-gray-100"}`} />
                <div className="flex items-center justify-between text-sm">
                  <span className={isDark ? "text-gray-400" : "text-gray-600"}>Member Since</span>
                  <span className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    {new Date(currentUser?.metadata?.creationTime).getFullYear()}
                  </span>
                </div>
              </div>
            </div>
          </aside>

          {/* --- Main Content --- */}
          <main className="flex-1 min-w-0">
            
            {/* Header */}
            <div className="mb-8">
              <h1 className={`text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                My Learning
              </h1>
              <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                Track your progress and access your enrolled test series.
              </p>
            </div>

            {/* Active Subscriptions Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-12">
              {activeSeries.length === 0 ? (
                <div className={`col-span-full p-10 rounded-3xl border-2 border-dashed text-center ${
                  isDark ? "border-gray-700 bg-gray-800/30 text-gray-400" : "border-gray-200 bg-white text-gray-500"
                }`}>
                  <FiBookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No Active Subscriptions</h3>
                  <p className="mb-6 max-w-md mx-auto">You haven't enrolled in any test series yet. Browse our catalog to start learning.</p>
                  <a href="/test-series" className="inline-flex items-center px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors">
                    Browse Catalog
                  </a>
                </div>
              ) : (
                activeSeries.map((s) => (
                  <div 
                    key={s.id}
                    className={`group relative p-5 rounded-3xl border transition-all duration-300 hover:-translate-y-1 ${
                      isDark 
                        ? "bg-gray-800 border-gray-700 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-900/20" 
                        : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-100/50"
                    }`}
                  >
                    <div className="flex items-start gap-5">
                      {/* Thumbnail */}
                      <div className={`w-20 h-20 rounded-2xl flex-shrink-0 overflow-hidden shadow-sm ${
                        isDark ? "bg-gray-700" : "bg-gray-100"
                      }`}>
                        {s.coverImageUrl ? (
                          <img src={s.coverImageUrl} alt={s.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-blue-500">
                            <FiGrid size={24} />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {s.isPaid && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-yellow-100 text-yellow-700 mb-2">
                            <FaCrown size={10} /> Premium
                          </span>
                        )}
                        <h3 className={`font-bold text-lg mb-1 truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                          {s.title}
                        </h3>
                        <div className="flex items-center gap-4 text-xs mb-4">
                          <span className={`flex items-center gap-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            <FiBookOpen /> {s.totalTests || 0} Tests
                          </span>
                          <span className={`flex items-center gap-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            <FiTrendingUp /> Active
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => onViewTests && onViewTests(s)}
                      className={`w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                        isDark 
                          ? "bg-gray-700 hover:bg-gray-600 text-white" 
                          : "bg-blue-50 hover:bg-blue-100 text-blue-700"
                      }`}
                    >
                      Continue Learning <FiArrowRight />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Recommendations Section */}
            <UpgradeSuggestions
              isDark={isDark}
              onSubscribe={handleUpgrade}
              activeIds={new Set(activeSeries.map((s) => s.id))}
            />

          </main>
        </div>
      </div>
    </div>
  );
};

// --- Sub-Component for Upgrades ---
const UpgradeSuggestions = ({ isDark, onSubscribe, activeIds }) => {
  const [loading, setLoading] = useState(true);
  const [paidSeries, setPaidSeries] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, "test-series"), where("isPublished", "==", true));
        const snap = await getDocs(q);
        const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        
        // Filter for paid series not already owned
        const filtered = all.filter((s) => s.isPaid && !activeIds.has(s.id)).slice(0, 2); // Limit to 2
        
        // Enrich with counts
        const enriched = await Promise.all(filtered.map(async (s) => {
          try {
            const q1 = await getDocs(query(collection(db, "quizzes"), where("testSeriesId", "==", s.id)));
            const q2 = await getDocs(query(collection(db, "section-quizzes"), where("testSeriesId", "==", s.id)));
            return { ...s, totalTests: (q1.size + q2.size) };
          } catch { return s; }
        }));
        
        setPaidSeries(enriched);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activeIds]);

  if (loading || paidSeries.length === 0) return null;

  return (
    <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-2 mb-6">
        <FiAward className="text-yellow-500 w-6 h-6" />
        <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
          Recommended Upgrades
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {paidSeries.map((s) => (
          <div
            key={s.id}
            className={`relative overflow-hidden rounded-3xl border p-6 transition-all duration-300 hover:-translate-y-1 ${
              isDark 
                ? "bg-gradient-to-br from-gray-800 to-gray-900 border-yellow-500/30 shadow-lg shadow-black/20" 
                : "bg-gradient-to-br from-yellow-50 to-white border-yellow-200 shadow-xl shadow-yellow-500/10"
            }`}
          >
            {/* Background Decor */}
            <div className="absolute -right-6 -top-6 opacity-5">
              <FaCrown size={120} className={isDark ? "text-yellow-200" : "text-yellow-600"} />
            </div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <FaStar size={10} /> Premium
                </div>
                <div className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                  ₹{(s.discountedPrice ?? s.price ?? 0).toLocaleString()}
                </div>
              </div>

              <h3 className={`text-xl font-bold mb-2 line-clamp-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                {s.title}
              </h3>
              
              <div className={`flex items-center gap-4 text-sm mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                <span>{s.totalTests || 0} Tests</span>
                <span>•</span>
                <span>{s.totalSubscribers || 0} Students</span>
              </div>

              <button
                onClick={() => onSubscribe(s)}
                className="w-full py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white transition-all"
              >
                <FiCreditCard /> Unlock Access
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserSubscriptions;