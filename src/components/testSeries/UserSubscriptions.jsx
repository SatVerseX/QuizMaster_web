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
import { FiBookOpen, FiArrowRight, FiCreditCard } from "react-icons/fi";
import { FaCrown } from "react-icons/fa";

const UserSubscriptions = ({ onViewTests, onSubscribeSeries }) => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [subs, setSubs] = useState([]);
  const [series, setSeries] = useState([]);

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
        const seriesDocs = await Promise.all(
          ids.map((id) => getDoc(doc(db, "test-series", id)))
        );
        const seriesData = seriesDocs
          .filter((s) => s.exists())
          .map((s) => ({ id: s.id, ...s.data() }));

        // Enrich with totalTests like EnhancedSeriesCard/TestSeriesList
        const seriesWithCounts = await Promise.all(
          seriesData.map(async (s) => {
            try {
              const [q1, q2] = await Promise.all([
                getDocs(
                  query(
                    collection(db, "quizzes"),
                    where("testSeriesId", "==", s.id)
                  )
                ),
                getDocs(
                  query(
                    collection(db, "section-quizzes"),
                    where("testSeriesId", "==", s.id)
                  )
                ),
              ]);
              return { ...s, totalTests: (q1?.size || 0) + (q2?.size || 0) };
            } catch (e) {
              console.error("Error counting tests for series", s.id, e);
              return { ...s, totalTests: s.totalTests || 0 };
            }
          })
        );

        setSeries(seriesWithCounts);
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

  if (loading) {
    return (
      <div
        className={`min-h-[300px] flex items-center justify-center bg-gradient-to-br from-blue-100 via-gray-50 to-blue-50 ${
          isDark ? "text-gray-300" : "text-gray-700"
        }`}
      >
        Loading your subscriptions...
      </div>
    );
  }

  // Main Dashboard Layout
  return (
    <div
      className={`min-h-screen w-full scroll-smooth overscroll-y-contain ${
        isDark
          ? "bg-gradient-to-br from-blue-950 via-blue-900 to-gray-900"
          : "bg-gradient-to-r from-blue-100 via-gray-50 to-blue-50"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-12 touch-pan-y">
        {/* Sidebar/Profile */}
        <aside
          className={`md:w-72 mb-10 md:mb-0 bg-gradient-to-b from-blue-500 to-blue-700 px-8 py-10 rounded-3xl sm:shadow-2xl md:sticky top-10 text-white`}
        >
          <div className="font-extrabold text-2xl mb-4 flex items-center gap-3">
            Premium Student
            <FaCrown size={26} className="text-yellow-300" />
          </div>
          <div className="text-lg font-semibold mb-2">
            {currentUser?.displayName || "Your Name"}
          </div>
          <div className="text-xs mb-4">
            {currentUser?.email || "your-email@example.com"}
          </div>
        </aside>

        {/* Main content area */}
        <main className="flex-1">
          <div className="mb-8">
            <h1
              className={`text-4xl font-extrabold tracking-tight ${
                isDark ? "text-white" : "text-blue-900"
              }`}
            >
              Your Subscriptions
            </h1>
            <p
              className={`${
                isDark ? "text-gray-400" : "text-gray-600"
              } mt-2 text-lg`}
            >
              View active access and upgrade to premium test series!
            </p>
          </div>

          {/* Subscriptions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {activeSeries.length === 0 ? (
              <div
                className={`p-12 rounded-3xl border-4 border-blue-200 text-center  ${
                  isDark
                    ? "bg-gray-800 border-gray-600 text-gray-300"
                    : "bg-white border-blue-200 text-gray-700"
                }`}
              >
                <span className="text-xl font-semibold">
                  You have no active subscriptions yet.
                </span>
              </div>
            ) : (
              activeSeries.map((s) => (
                <div
                  key={s.id}
                  className={`relative p-8 rounded-3xl bg-white  border-4 border-blue-400 flex flex-col md:flex-row md:items-center gap-4 md:gap-8`}
                >
                  <div className="absolute -top-5 left-5 px-6 py-2 bg-blue-400 text-white font-bold rounded-xl  z-10 text-base">
                    ACTIVE SERIES
                  </div>
                    <div className="flex items-center gap-4 md:gap-8 flex-1 min-w-0">
                      <div className={`w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center bg-blue-500/10`}>
                        {s.coverImageUrl ? (
                          <img
                            src={s.coverImageUrl}
                            alt={s.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <FiBookOpen size={36} className="text-blue-600" />
                        )}
                      </div>
                    <div>
                      <div className="font-extrabold text-2xl text-blue-900 mb-1">
                        {s.title}
                      </div>
                      <div className="text-base text-gray-500 mb-2">
                        {s.totalTests || 0} tests • {s.totalSubscribers || 0}{" "}
                        students
                      </div>
                    </div>
                  </div>
                  <button
                    className={`hover:cursor-pointer md:ml-auto mt-4 md:mt-0 w-full md:w-auto px-4 py-2 rounded-full font-extrabold flex items-center justify-center md:justify-start gap-4 bg-green-600 hover:bg-green-700 text-white  text-lg shrink-0`}
                    onClick={() => onViewTests && onViewTests(s)}
                  >
                    <FiArrowRight size={22} />
                  </button>
                </div>
              ))
            )}
          </div>
          {/* Premium Upgrade Suggestions */}
          <UpgradeSuggestions
            isDark={isDark}
            onSubscribe={handleUpgrade}
            activeIds={new Set(activeSeries.map((s) => s.id))}
          />
        </main>
      </div>

      {/* Mobile momentum scroll and smoother touch behavior */}
      <style>
        {`
          @media (max-width: 768px) {
            html, body { overscroll-behavior-y: contain; }
            .touch-pan-y { touch-action: pan-y; }
          }
        `}
      </style>
    </div>
  );
};

const UpgradeSuggestions = ({ isDark, onSubscribe, activeIds }) => {
  const [loading, setLoading] = useState(true);
  const [paidSeries, setPaidSeries] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, "test-series"),
          where("isPublished", "==", true)
        );
        const snap = await getDocs(q);
        const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setPaidSeries(all.filter((s) => s.isPaid && !activeIds.has(s.id)));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activeIds]);

  if (loading) return null;
  if (paidSeries.length === 0) {
    return (
      <div
        className={`mt-2 p-12 rounded-3xl border-4 border-yellow-200 text-center  ${
          isDark
            ? "bg-gray-800 border-gray-700 text-gray-300"
            : "bg-white border-yellow-100 text-gray-700"
        }`}
      >
        <div className="font-extrabold mb-2 text-2xl">
          No upgrade options available
        </div>
        <div className="text-lg mb-6">
          Explore all premium series to find more to subscribe.
        </div>
        <a
          href="/test-series"
          className={`inline-block px-8 py-4 rounded-full font-extrabold bg-blue-600 hover:bg-blue-700 text-white  text-lg`}
        >
          Browse Test Series
        </a>
      </div>
    );
  }

  return (
    <div>
      <h2
        className={`text-3xl font-extrabold mb-8 ${
          isDark ? "text-yellow-200" : "text-yellow-700"
        }`}
      >
        Upgrade your plan
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {paidSeries.map((s) => (
          <div
            key={s.id}
            className={`relative rounded-3xl  border-4 border-yellow-400 bg-white pb-10 pt-12 px-10`}
          >
            <div className="absolute -top-6 left-10 bg-yellow-300 text-yellow-900 px-6 py-3 font-bold rounded-xl text-lg shadow-lg flex items-center gap-2 z-10">
              <FaCrown size={28} /> Premium Series
            </div>
            <div className="flex items-center gap-8 mb-8">
              <div className="bg-blue-500 rounded-full w-20 h-20 flex items-center justify-center text-white shadow-xl">
                <FiBookOpen size={36} />
              </div>
              <div>
                <div className="font-extrabold text-2xl text-blue-900 mb-1">
                  {s.title}
                </div>
                <div className="text-base text-gray-500">
                  {s.totalTests || 0} tests • {s.totalSubscribers || 0} students
                </div>
              </div>
            </div>
            <div className="bg-green-200 text-green-800 px-8 py-3 rounded-xl font-bold text-2xl mb-2  inline-block">
              ₹{(s.discountedPrice ?? s.price ?? 0).toLocaleString()}
            </div>
            {typeof s.originalPrice === "number" &&
              s.originalPrice > (s.discountedPrice ?? s.price ?? 0) && (
                <div className="text-gray-400 line-through text-lg mb-4">
                  ₹{s.originalPrice.toLocaleString()}
                </div>
              )}
            <button
              className="absolute bottom-8 left-10 right-10 py-4 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-full text-lg w-full"
              onClick={() => onSubscribe(s)}
            >
              <FiCreditCard className="mr-2" size={22} /> Upgrade Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserSubscriptions;
