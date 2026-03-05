import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useSubscription } from "../../contexts/SubscriptionContext";
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
  BookOpen, 
  ArrowRight, 
  CreditCard, 
  User, 
  TrendingUp, 
  Award, 
  LayoutGrid, 
  Calendar, 
  CheckCircle2, 
  Crown,
  Star,
  Rocket,
  Shield,
  Clock,
  Sparkles
} from "lucide-react";
import { getUserAvatar } from "../../utils/userUtils";
import PaymentPlans from "../payment/PaymentPlans";

const UserSubscriptions = ({ onViewTests, onSubscribeSeries }) => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  
  const { 
    subscription: globalPlan, 
    loading: planLoading, 
    isFreePlan 
  } = useSubscription();

  const [loading, setLoading] = useState(true);
  const [subs, setSubs] = useState([]);
  const [series, setSeries] = useState([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const userAvatar = useMemo(() => getUserAvatar(currentUser), [currentUser]);

  // --- Styles Helper ---
  const styles = {
    pageBg: isDark ? "bg-zinc-950" : "bg-slate-50",
    cardBg: isDark ? "bg-zinc-900" : "bg-white",
    cardBorder: isDark ? "border-zinc-800" : "border-zinc-200",
    textPrimary: isDark ? "text-zinc-100" : "text-zinc-900",
    textSecondary: isDark ? "text-zinc-400" : "text-zinc-500",
    iconBg: isDark ? "bg-zinc-800" : "bg-zinc-100",
    divider: isDark ? "border-zinc-800" : "border-zinc-100",
    
    // High Contrast Badge Styles
    badgePremium: isDark 
      ? "bg-amber-900/40 text-amber-300 border-amber-700/50" 
      : "bg-amber-100 text-amber-800 border-amber-300",
      
    badgeFree: isDark
      ? "bg-zinc-800 text-zinc-300 border-zinc-700"
      : "bg-zinc-100 text-zinc-700 border-zinc-300",
      
    badgeSuccess: isDark
      ? "bg-emerald-900/40 text-emerald-400 border-emerald-700/50"
      : "bg-emerald-100 text-emerald-800 border-emerald-300"
  };

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

  const handleUpgradeSeries = (s) => {
    if (onSubscribeSeries) {
      onSubscribeSeries({ id: s.id, isPaid: true });
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateDaysRemaining = (expiryDate) => {
    if (!expiryDate) return 0;
    const end = expiryDate.toDate ? expiryDate.toDate() : new Date(expiryDate);
    const now = new Date();
    const diff = end - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (loading || planLoading) {
    return (
      <div className={`min-h-screen p-6 sm:p-8 ${styles.pageBg}`}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className={`lg:col-span-4 h-80 rounded-2xl animate-pulse ${isDark ? "bg-zinc-900" : "bg-zinc-200"}`} />
          <div className="lg:col-span-8 space-y-6">
            <div className={`h-40 rounded-2xl animate-pulse ${isDark ? "bg-zinc-900" : "bg-zinc-200"}`} />
            <div className={`h-40 rounded-2xl animate-pulse ${isDark ? "bg-zinc-900" : "bg-zinc-200"}`} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full ${styles.pageBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold tracking-tight ${styles.textPrimary}`}>Subscription & Learning</h1>
          <p className={`mt-1 text-sm ${styles.textSecondary}`}>Manage your plan and enrolled courses.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- LEFT SIDEBAR (Profile & Plan) --- */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* User Profile Card */}
            <div className={`rounded-xl border p-6 ${styles.cardBg} ${styles.cardBorder}`}>
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 rounded-full overflow-hidden border-2 ${isDark ? "border-zinc-700" : "border-white shadow-sm"}`}>
                  {userAvatar ? (
                    <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${isDark ? "bg-zinc-800" : "bg-zinc-100"}`}>
                      <User className="w-8 h-8 text-zinc-400" />
                    </div>
                  )}
                </div>
                <div>
                  <h2 className={`font-semibold text-lg ${styles.textPrimary}`}>
                    {currentUser?.displayName || "Student"}
                  </h2>
                  <p className={`text-sm ${styles.textSecondary} truncate max-w-[180px]`}>
                    {currentUser?.email}
                  </p>
                  
                  {/* Pro Member Badge */}
                  {!isFreePlan && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold border ${styles.badgePremium}`}>
                        <Crown className="w-3 h-3 fill-current" />
                        Pro Member
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className={`border-t pt-4 space-y-3 ${styles.divider}`}>
                <div className="flex justify-between items-center text-sm">
                  <span className={styles.textSecondary}>Active Courses</span>
                  <span className={`font-medium ${styles.textPrimary}`}>{activeSeries.length}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className={styles.textSecondary}>Joined</span>
                  <span className={`font-medium ${styles.textPrimary}`}>
                    {new Date(currentUser?.metadata?.creationTime).getFullYear()}
                  </span>
                </div>
              </div>
            </div>

            {/* Current Plan Card */}
            <div className={`rounded-xl border p-6 relative overflow-hidden ${styles.cardBg} ${styles.cardBorder}`}>
              {/* Background gradient hint */}
              {!isFreePlan && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
              )}
              
              <div className="relative">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Current Plan</p>
                    <h3 className={`text-xl font-bold mt-1 ${styles.textPrimary}`}>
                      {globalPlan?.name || "Free Plan"}
                    </h3>
                  </div>
                  {!isFreePlan && <Crown className="w-6 h-6 text-amber-500 fill-current" />}
                </div>

                {!isFreePlan && globalPlan ? (
                  <div className="space-y-4">
                    <div className={`flex items-center gap-2 text-sm font-bold ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Active Subscription</span>
                    </div>
                    
                    <div className={`p-3 rounded-lg border ${isDark ? "bg-zinc-800/50 border-zinc-700" : "bg-zinc-50 border-zinc-200"}`}>
                      <div className="flex justify-between items-center text-sm mb-1">
                        <span className={styles.textSecondary}>Renews</span>
                        <span className={`font-medium ${styles.textPrimary}`}>{formatDate(globalPlan.expiresAt)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className={styles.textSecondary}>Remaining</span>
                        <span className={`font-medium ${calculateDaysRemaining(globalPlan.expiresAt) < 5 ? "text-rose-500" : "text-emerald-600"}`}>
                          {calculateDaysRemaining(globalPlan.expiresAt)} Days
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={() => setShowUpgradeModal(true)}
                      className={`w-full py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                        isDark 
                          ? "border-zinc-700 hover:bg-zinc-800 text-zinc-300" 
                          : "border-zinc-200 hover:bg-zinc-50 text-zinc-700"
                      }`}
                    >
                      Manage Plan
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className={`text-sm ${styles.textSecondary}`}>
                      Upgrade to unlock unlimited AI quizzes, detailed analytics, and premium support.
                    </p>
                    <button 
                      onClick={() => setShowUpgradeModal(true)}
                      className="w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all hover:shadow-md flex items-center justify-center gap-2"
                    >
                      <Rocket className="w-4 h-4" /> Upgrade to Pro
                    </button>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* --- RIGHT CONTENT (Enrolled Courses) --- */}
          <main className="lg:col-span-8 space-y-8">
            
            {/* Header for List */}
            <div className="flex items-center justify-between">
              <h2 className={`text-lg font-bold flex items-center gap-2 ${styles.textPrimary}`}>
                <BookOpen className="w-5 h-5 text-indigo-500" /> 
                Enrolled Series
                <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${isDark ? "bg-zinc-800 text-zinc-400" : "bg-zinc-100 text-zinc-600"}`}>
                  {activeSeries.length}
                </span>
              </h2>
            </div>

            {/* List */}
            {activeSeries.length === 0 ? (
              <div className={`flex flex-col items-center justify-center p-12 rounded-xl border-2 border-dashed text-center ${isDark ? "border-zinc-800 bg-zinc-900/30" : "border-zinc-200 bg-zinc-50/50"}`}>
                <div className={`p-4 rounded-full mb-4 ${isDark ? "bg-zinc-800" : "bg-white shadow-sm"}`}>
                  <LayoutGrid className={`w-8 h-8 ${styles.textSecondary}`} />
                </div>
                <h3 className={`text-lg font-semibold mb-1 ${styles.textPrimary}`}>No Enrollments Yet</h3>
                <p className={`text-sm max-w-sm mb-6 ${styles.textSecondary}`}>
                  You haven't enrolled in any test series yet. Browse our catalog to start your learning journey.
                </p>
                <a 
                  href="/test-series" 
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Browse Catalog
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {activeSeries.map((s) => (
                  <div 
                    key={s.id}
                    className={`group relative flex flex-col rounded-xl border transition-all duration-200 hover:shadow-md ${
                      isDark 
                        ? "bg-zinc-900 border-zinc-800 hover:border-zinc-700" 
                        : "bg-white border-zinc-200 hover:border-zinc-300"
                    }`}
                  >
                    <div className="p-5 flex gap-4">
                      {/* Thumbnail */}
                      <div className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border ${isDark ? "border-zinc-700 bg-zinc-800" : "border-zinc-100 bg-zinc-50"}`}>
                        {s.coverImageUrl ? (
                          <img src={s.coverImageUrl} alt={s.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-indigo-500">
                            <LayoutGrid size={24} />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className={`font-semibold text-base truncate ${styles.textPrimary}`}>
                            {s.title}
                          </h3>
                          {s.isPaid && (
                            <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border flex items-center gap-1 ${styles.badgePremium}`}>
                              <Crown size={10} className="fill-current" /> Premium
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                          <span className="flex items-center gap-1">
                            <BookOpen size={12} /> {s.totalTests || 0} Tests
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp size={12} /> Active
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Action */}
                    <div className={`mt-auto px-5 pb-5 pt-0`}>
                      <button
                        onClick={() => onViewTests && onViewTests(s)}
                        className={`w-full py-2.5 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                          isDark 
                            ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200" 
                            : "bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200"
                        }`}
                      >
                        Continue Learning <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Recommendations */}
            <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className={`text-lg font-bold ${styles.textPrimary}`}>Recommended Upgrades</h3>
              </div>
              <UpgradeSuggestions
                isDark={isDark}
                onSubscribe={handleUpgradeSeries}
                activeIds={new Set(activeSeries.map((s) => s.id))}
                badgeStyle={styles.badgePremium}
              />
            </div>

          </main>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
           <div className={`relative w-full max-w-5xl my-8 rounded-2xl shadow-2xl overflow-hidden ${isDark ? "bg-zinc-900 border border-zinc-700" : "bg-white"}`}>
              <button 
                onClick={() => setShowUpgradeModal(false)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 transition-colors"
              >
                 <ArrowRight className="rotate-45 w-5 h-5 text-zinc-500 dark:text-zinc-300" />
              </button>
              <div className="max-h-[85vh] overflow-y-auto custom-scrollbar">
                 <PaymentPlans 
                    onSuccess={() => { setShowUpgradeModal(false); window.location.reload(); }} 
                    onCancel={() => setShowUpgradeModal(false)}
                 />
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

// --- Sub-Component for Upgrades ---
// Defined *outside* to avoid re-creation on render
const UpgradeSuggestions = ({ isDark, onSubscribe, activeIds, badgeStyle }) => {
  const [loading, setLoading] = useState(true);
  const [paidSeries, setPaidSeries] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // Find paid series that are published
        const q = query(collection(db, "test-series"), where("isPublished", "==", true));
        const snap = await getDocs(q);
        const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        
        // Filter for paid series not already owned
        const filtered = all.filter((s) => s.isPaid && !activeIds.has(s.id)).slice(0, 2); 
        
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

  if (loading) return <div className="h-40 animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded-xl" />;
  if (paidSeries.length === 0) return <p className="text-sm text-zinc-500">You're all caught up! No upgrades available.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {paidSeries.map((s) => (
        <div
          key={s.id}
          className={`relative overflow-hidden rounded-xl border p-5 transition-all hover:shadow-lg ${
            isDark 
              ? "bg-gradient-to-br from-zinc-800 to-zinc-900 border-amber-500/20" 
              : "bg-gradient-to-br from-amber-50/50 to-white border-amber-200"
          }`}
        >
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-3">
              <div className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1 border ${badgeStyle}`}>
                <Star size={10} fill="currentColor" /> Recommended
              </div>
              <div className={`text-xl font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>
                ₹{(s.discountedPrice ?? s.price ?? 0).toLocaleString()}
              </div>
            </div>

            <h3 className={`font-bold text-lg mb-1 line-clamp-1 ${isDark ? "text-white" : "text-zinc-900"}`}>
              {s.title}
            </h3>
            
            <p className={`text-sm mb-4 line-clamp-1 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
               {s.description || "Unlock premium features for this series."}
            </p>

            <button
              onClick={() => onSubscribe(s)}
              className="w-full py-2.5 rounded-lg font-semibold shadow-sm flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white transition-all active:scale-[0.98]"
            >
              <CreditCard className="w-4 h-4" /> Unlock Access
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserSubscriptions;