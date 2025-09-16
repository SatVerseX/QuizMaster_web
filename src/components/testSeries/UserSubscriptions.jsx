import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { collection, query, where, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { FiBookOpen, FiArrowRight, FiCreditCard } from 'react-icons/fi';
import { FaCrown } from 'react-icons/fa';

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
          collection(db, 'test-series-subscriptions'),
          where('userId', '==', currentUser.uid),
          where('status', '==', 'active')
        );
        const snapshot = await getDocs(q);
        const activeSubs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setSubs(activeSubs);

        const ids = Array.from(new Set(activeSubs.map(s => s.testSeriesId || s.seriesId).filter(Boolean)));
        const seriesDocs = await Promise.all(ids.map(id => getDoc(doc(db, 'test-series', id))));
        const seriesData = seriesDocs.filter(s => s.exists()).map(s => ({ id: s.id, ...s.data() }));
        setSeries(seriesData);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentUser]);

  const activeSeries = useMemo(() => {
    const map = new Map(series.map(s => [s.id, s]));
    return subs
      .map(s => map.get(s.testSeriesId || s.seriesId))
      .filter(Boolean);
  }, [subs, series]);

  const handleUpgrade = (s) => {
    if (onSubscribeSeries) {
      onSubscribeSeries({ id: s.id, isPaid: true });
    }
  };

  if (loading) {
    return (
      <div className={`min-h-[300px] flex items-center justify-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading your subscriptions...</div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Your Subscriptions</h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>View active access and upgrade to more series.</p>
        </div>

        {/* Active subscriptions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {activeSeries.length === 0 ? (
            <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-700'}`}>
              You have no active subscriptions yet.
            </div>
          ) : (
            activeSeries.map(s => (
              <div key={s.id} className={`p-5 rounded-xl border flex items-center justify-between gap-4 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isDark ? 'bg-blue-600' : 'bg-blue-500'} text-white`}>
                    <FiBookOpen />
                  </div>
                  <div>
                    <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{s.title}</div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{s.totalTests || 0} tests • {s.totalSubscribers || 0} students</div>
                  </div>
                </div>
                <button
                  className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${isDark ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                  onClick={() => onViewTests && onViewTests(s)}
                >
                  Continue <FiArrowRight />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Upgrade suggestions: show paid series not subscribed */}
        <UpgradeSuggestions isDark={isDark} onSubscribe={handleUpgrade} activeIds={new Set(activeSeries.map(s => s.id))} />
      </div>
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
        const q = query(collection(db, 'test-series'), where('isPublished', '==', true));
        const snap = await getDocs(q);
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setPaidSeries(all.filter(s => s.isPaid && !activeIds.has(s.id)));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activeIds]);

  if (loading) return null;
  if (paidSeries.length === 0) {
    return (
      <div className={`mt-2 p-6 rounded-xl border text-center ${isDark ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-700'}`}>
        <div className="font-semibold mb-1">No upgrade options available</div>
        <div className="text-sm mb-4">Explore all premium series to find more to subscribe.</div>
        <a
          href="/test-series"
          className={`${isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'} inline-block px-4 py-2 rounded-lg font-semibold`}
        >
          Browse Test Series
        </a>
      </div>
    );
  }

  return (
    <div>
      <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Upgrade your plan</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paidSeries.map(s => (
          <div key={s.id} className={`p-5 rounded-xl border flex flex-col gap-3 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-start justify-between">
              <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{s.title}</div>
              <div className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${isDark ? 'bg-yellow-500/20 text-yellow-300' : 'bg-yellow-100 text-yellow-700'}`}>
                <FaCrown /> Premium
              </div>
            </div>
            <div className={`text-2xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>₹{(s.discountedPrice ?? s.price ?? 0).toLocaleString()}</div>
            {typeof s.originalPrice === 'number' && (s.originalPrice > (s.discountedPrice ?? s.price ?? 0)) && (
              <div className={`${isDark ? 'text-gray-400' : 'text-gray-500'} line-through -mt-2`}>₹{(s.originalPrice).toLocaleString()}</div>
            )}
            <button
              className={`mt-auto px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
              onClick={() => onSubscribe(s)}
            >
              <FiCreditCard /> Upgrade
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserSubscriptions;



