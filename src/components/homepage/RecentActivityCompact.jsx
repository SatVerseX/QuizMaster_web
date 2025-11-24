import React, { useState, useEffect } from 'react';
import { 
  FiPlay, 
  FiClock, 
  FiTrendingUp, 
  FiTarget, 
  FiBookOpen, 
  FiRefreshCw, 
  FiLock,
  FiChevronRight,
  FiActivity,
  FiBarChart2,
  FiZap
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

  // -- Data Fetching Logic --
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
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getActivityStyle = (type, score) => {
    if (score >= 80) return { icon: FiTarget, color: 'text-emerald-600', bg: isDark ? 'bg-emerald-500/10' : 'bg-emerald-100', border: isDark?'border-emerald-500/20':'border-emerald-200' };
    if (score >= 50) return { icon: FiBarChart2, color: 'text-amber-600', bg: isDark?'bg-amber-500/10':'bg-amber-100 ', border: isDark?'border-amber-500/20':'border-amber-200' };
    return { icon: FiActivity, color: 'text-slate-600', bg: isDark?'bg-slate-800':'bg-slate-100', border: isDark?'border-slate-200 ':'border-slate-200' };
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
      <div className={`w-full flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed text-center ${isDark ? 'bg-zinc-900/30 border-zinc-800' : 'bg-white border-zinc-200'}`}>
        <div className={`p-3 rounded-full mb-3 ${isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-400'}`}>
          <FiLock className="w-6 h-6" />
        </div>
        <h3 className={`text-sm font-bold mb-1 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Sign in to view activity</h3>
        <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
          Track your progress and get insights.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-6">
      
      {/* Section 1: Recent Activity */}
      <div className={`rounded-2xl p-1 ${isDark ? 'bg-transparent' : 'bg-transparent'}`}>
        
        {/* Header removed as it's usually handled by parent container, but we keep a minimal label if needed 
            In this context, we assume the parent card provides the main header. 
            We'll add a subtle sub-header just in case. */}
        
        <div className="space-y-4 relative">
          {/* Timeline Vertical Line */}
          <div className={`absolute left-[19px] top-4 bottom-4 w-[2px] ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'} rounded-full`} />

          {loading ? (
             // Modern Skeleton
             [1, 2, 3].map(i => (
              <div key={i} className="flex items-start gap-3 relative z-10">
                <div className={`w-10 h-10 rounded-full flex-shrink-0 ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'} animate-pulse`} />
                <div className="flex-1 pt-1 space-y-2">
                  <div className={`h-3 w-3/4 rounded ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'} animate-pulse`} />
                  <div className={`h-2 w-1/2 rounded ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'} animate-pulse`} />
                </div>
              </div>
            ))
          ) : recentActivity.length > 0 ? (
            recentActivity.map((activity) => {
              const style = getActivityStyle(activity.type, activity.score);
              const Icon = style.icon;
              
              return (
                <div key={activity.id} className="group relative flex items-start gap-3 z-10">
                  
                  {/* Icon Circle */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    isDark ? 'bg-zinc-900 border-zinc-800 group-hover:border-zinc-600' : 'bg-white border-zinc-100 group-hover:border-zinc-300'
                  }`}>
                    <Icon className={`w-4 h-4 ${style.color}`} />
                  </div>
                  
                  {/* Content Card */}
                  <div className={`flex-1 min-w-0 p-3 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 cursor-default ${
                    isDark 
                      ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' 
                      : 'bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-sm'
                  }`}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className={`text-xs font-semibold truncate leading-tight ${isDark ? 'text-zinc-200' : 'text-zinc-900'}`}>
                        {activity.title}
                      </h4>
                      <span className={`text-[10px] font-medium whitespace-nowrap flex-shrink-0 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                        {formatTimeAgo(activity.completedAt)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-[10px] font-medium truncate max-w-[120px] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                        {activity.seriesName}
                      </span>
                      
                      {/* Score Badge */}
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${style.bg} ${style.color} ${style.border}`}>
                        <span>{activity.score}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className={`flex flex-col items-center justify-center py-12 text-center ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
              <div className={`p-3 rounded-full mb-2 ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
                <FiClock className="w-5 h-5 opacity-50" />
              </div>
              <p className="text-xs font-medium">No recent activity</p>
              <p className="text-[10px] opacity-70">Your test history will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Section 2: AI Recommendations */}
      <div className={`rounded-2xl p-4 border ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-gradient-to-br from-emerald-50/50 to-blue-50/50 border-emerald-100'}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-1 rounded bg-emerald-500 text-white`}>
              <FiZap className="w-3 h-3" />
            </div>
            <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              Recommended
            </h4>
          </div>
          <button
            onClick={refreshRecommendations}
            disabled={recommendationsLoading}
            className={`p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}
          >
            <FiRefreshCw className={`w-3 h-3 ${recommendationsLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="space-y-2">
          {recommendationsLoading ? (
            [1, 2].map(i => (
              <div key={i} className={`h-14 rounded-lg animate-pulse ${isDark ? 'bg-zinc-800' : 'bg-white'}`} />
            ))
          ) : recommendations.length > 0 ? (
            recommendations.slice(0, 2).map((rec) => (
              <div
                key={rec.id}
                onClick={() => handleRecommendationClick(rec)}
                className={`group cursor-pointer p-3 rounded-lg border transition-all duration-200 relative overflow-hidden ${
                  isDark 
                    ? 'bg-zinc-800 border-zinc-700 hover:border-emerald-500/50' 
                    : 'bg-white border-zinc-200 hover:border-emerald-400 hover:shadow-md'
                }`}
              >
                {/* Hover Highlight */}
                <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/[0.02] transition-colors pointer-events-none" />

                <div className="flex items-center justify-between gap-3 relative z-10">
                  <div className="flex-1 min-w-0">
                    <h5 className={`text-xs font-bold leading-tight mb-1.5 truncate ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                      {rec.title}
                    </h5>
                    
                    <div className="flex items-center gap-3">
                      {/* Difficulty Dot */}
                      <div className="flex items-center gap-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          rec.difficulty === 'Easy' ? 'bg-emerald-500' :
                          rec.difficulty === 'Medium' ? 'bg-amber-500' :
                          'bg-rose-500'
                        }`} />
                        <span className={`text-[10px] font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                          {rec.difficulty || 'Medium'}
                        </span>
                      </div>

                      {/* Match Score */}
                      {rec.confidence && (
                        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                           <FiTrendingUp className="w-3 h-3" />
                           <span className="text-[10px] font-bold">{rec.confidence}% Match</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <FiChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isDark ? 'text-zinc-600 group-hover:text-zinc-300' : 'text-zinc-300 group-hover:text-emerald-500'}`} />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <p className={`text-xs italic ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                Keep practicing to generate insights
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentActivityCompact;