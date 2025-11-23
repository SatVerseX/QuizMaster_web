import React, { useState, useEffect } from 'react';
import { 
  FiPlay, 
  FiClock, 
  FiTrendingUp, 
  FiTarget, 
  FiAward, 
  FiBookOpen, 
  FiRefreshCw, 
  FiLock,
  FiChevronRight,
  FiActivity
} from 'react-icons/fi';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { generatePersonalizedRecommendations, updateUserRecommendations } from '../../services/userAnalyticsService';

const RecentActivityCompact = ({ 
  isDark, 
  currentUser, 
  onViewSeries, 
  onViewTests,
  isAdmin = false
}) => {
  const [recentActivity, setRecentActivity] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);

  // -- Data Fetching Logic (Kept same as original) --
  useEffect(() => {
    if (!currentUser) return;

    const loadRecentActivity = async () => {
      try {
        setLoading(true);
        const attemptsQuery = query(
          collection(db, 'test-attempts'),
          where('userId', '==', currentUser.uid),
          orderBy('completedAt', 'desc'),
          limit(5)
        );
        const attemptsSnapshot = await getDocs(attemptsQuery);
        const attempts = attemptsSnapshot.docs.map(doc => ({
          id: doc.id,
          type: 'test_completed',
          title: doc.data().testTitle,
          seriesName: doc.data().testSeriesTitle,
          score: doc.data().percentage,
          completedAt: doc.data().completedAt?.toDate?.() || new Date(doc.data().completedAt),
          timeSpent: Math.round((doc.data().timeSpent || 0) / 60),
          status: 'completed'
        }));

        const quizQuery = query(
          collection(db, 'quiz-attempts'),
          where('userId', '==', currentUser.uid),
          orderBy('completedAt', 'desc'),
          limit(3)
        );
        const quizSnapshot = await getDocs(quizQuery);
        const quizAttempts = quizSnapshot.docs.map(doc => ({
          id: doc.id,
          type: 'test_completed',
          title: doc.data().quizTitle,
          seriesName: 'Quiz',
          score: doc.data().percentage,
          completedAt: doc.data().completedAt?.toDate?.() || new Date(doc.data().completedAt),
          timeSpent: Math.round((doc.data().timeSpent || 0) / 60),
          status: 'completed'
        }));

        const allActivity = [...attempts, ...quizAttempts]
          .sort((a, b) => b.completedAt - a.completedAt)
          .slice(0, 5);

        setRecentActivity(allActivity);
      } catch (error) {
        console.error('Error loading recent activity:', error);
        setRecentActivity([]);
      } finally {
        setLoading(false);
      }
    };
    loadRecentActivity();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const loadRecommendations = async () => {
      try {
        setRecommendationsLoading(true);
        const result = await generatePersonalizedRecommendations(currentUser.uid);
        if (result.success) {
          setRecommendations(result.data || []);
        }
      } catch (error) {
        console.error('Error loading recommendations:', error);
      } finally {
        setRecommendationsLoading(false);
      }
    };
    loadRecommendations();
  }, [currentUser]);

  // -- Helper Functions --

  const formatTimeAgo = (date) => {
    if (!date) return '';
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getActivityStyle = (type) => {
    switch (type) {
      case 'test_completed':
        return { icon: FiTarget, color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
      case 'test_started':
        return { icon: FiPlay, color: 'text-blue-500', bg: 'bg-blue-500/10' };
      case 'series_subscribed':
        return { icon: FiBookOpen, color: 'text-violet-500', bg: 'bg-violet-500/10' };
      default:
        return { icon: FiClock, color: 'text-slate-500', bg: 'bg-slate-500/10' };
    }
  };

  const handleRecommendationClick = async (recommendation) => {
    try {
      await updateUserRecommendations(currentUser.uid, recommendation.id, 'clicked');
      const seriesData = { id: recommendation.id, title: recommendation.title };
      if (isAdmin && onViewSeries) onViewSeries(seriesData);
      else if (!isAdmin && onViewTests) onViewTests(seriesData);
      else if (onViewSeries) onViewSeries(seriesData);
    } catch (error) {
      console.error('Error handling recommendation click:', error);
    }
  };

  const refreshRecommendations = async () => {
    if (!currentUser) return;
    try {
      setRecommendationsLoading(true);
      const result = await generatePersonalizedRecommendations(currentUser.uid);
      if (result.success) setRecommendations(result.data || []);
    } catch (error) {
      console.error('Error refreshing recommendations:', error);
    } finally {
      setRecommendationsLoading(false);
    }
  };

  // -- Render States --

  if (!currentUser) {
    return (
      <div className={`w-full h-full min-h-[400px] flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className={`p-4 rounded-full mb-4 ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
          <FiLock className="w-8 h-8" />
        </div>
        <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Authentication Required</h3>
        <p className={`text-sm text-center max-w-[250px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Please sign in to access your recent activity and personalized insights.
        </p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${isDark ? 'bg-slate-900/50' : 'bg-white'} rounded-2xl p-5 shadow-sm`}>
      
      {/* Section 1: Recent Activity */}
      <div className="flex-1 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
              <FiClock className="w-4 h-4" />
            </div>
            <h3 className={`text-sm font-bold tracking-wide uppercase ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              Recent Activity
            </h3>
          </div>
        </div>

        <div className="space-y-3">
          {loading ? (
             // Loading Skeleton
             [1, 2, 3].map(i => (
              <div key={i} className={`flex items-center gap-4 p-3 rounded-xl animate-pulse ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                <div className={`w-10 h-10 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
                <div className="flex-1 space-y-2">
                  <div className={`h-3 w-3/4 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
                  <div className={`h-2 w-1/2 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
                </div>
              </div>
            ))
          ) : recentActivity.length > 0 ? (
            recentActivity.map((activity) => {
              const style = getActivityStyle(activity.type);
              const Icon = style.icon;
              
              return (
                <div
                  key={activity.id}
                  className={`group relative flex items-center gap-3 p-3 rounded-xl transition-all duration-200 border border-transparent hover:border-slate-200/50 ${
                    isDark ? 'bg-slate-800/40 hover:bg-slate-800' : 'bg-slate-50/80 hover:bg-white hover:shadow-md'
                  }`}
                >
                  {/* Icon Box */}
                  <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg ${style.bg} ${style.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-sm font-medium truncate pr-2 ${isDark ? 'text-slate-200 group-hover:text-white' : 'text-slate-700 group-hover:text-slate-900'}`}>
                        {activity.title}
                      </h4>
                      <span className={`text-[10px] font-medium whitespace-nowrap ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {formatTimeAgo(activity.completedAt)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <p className={`text-xs truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {activity.seriesName}
                      </p>
                      
                      {/* Status Badge */}
                      {activity.status === 'completed' && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          activity.score >= 70 
                            ? (isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700')
                            : (isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700')
                        }`}>
                          {activity.score}% Score
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className={`flex flex-col items-center justify-center py-8 text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              <FiActivity className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-xs font-medium">No recent activity yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Section 2: AI Recommendations */}
      <div className={`pt-5 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FiTrendingUp className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Recommended for You
            </h4>
          </div>
          <button
            onClick={refreshRecommendations}
            disabled={recommendationsLoading}
            className={`p-1.5 rounded-md transition-colors ${
              isDark 
                ? 'text-slate-400 hover:text-white hover:bg-slate-700' 
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
            title="Refresh Recommendations"
          >
            <FiRefreshCw className={`w-3.5 h-3.5 ${recommendationsLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="space-y-2.5">
          {recommendationsLoading ? (
            [1, 2].map(i => (
              <div key={i} className={`h-16 rounded-lg animate-pulse ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`} />
            ))
          ) : recommendations.length > 0 ? (
            recommendations.slice(0, 2).map((rec) => (
              <div
                key={rec.id}
                onClick={() => handleRecommendationClick(rec)}
                className={`group cursor-pointer p-3 rounded-lg border transition-all duration-200 ${
                  isDark 
                    ? 'bg-slate-800/30 border-slate-700/50 hover:border-emerald-500/50 hover:bg-slate-800' 
                    : 'bg-white border-slate-200 hover:border-emerald-500/50 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {rec.difficulty && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold ${
                          rec.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                          rec.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                          'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'
                        }`}>
                          {rec.difficulty}
                        </span>
                      )}
                    </div>
                    <h5 className={`text-xs font-semibold leading-tight mb-1 ${isDark ? 'text-slate-200 group-hover:text-white' : 'text-slate-800 group-hover:text-black'}`}>
                      {rec.title}
                    </h5>
                    {rec.confidence && (
                      <div className="flex items-center gap-1.5">
                        <div className={`h-1 w-12 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                          <div 
                            className="h-full bg-emerald-500 rounded-full" 
                            style={{ width: `${rec.confidence}%` }}
                          />
                        </div>
                        <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {rec.confidence}% Match
                        </span>
                      </div>
                    )}
                  </div>
                  <FiChevronRight className={`w-4 h-4 mt-1 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                </div>
              </div>
            ))
          ) : (
            <div className={`text-center py-6 rounded-lg border border-dashed ${isDark ? 'border-slate-700 bg-slate-800/20' : 'border-slate-200 bg-slate-50/50'}`}>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Complete more tests to unlock<br />personalized insights.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentActivityCompact;