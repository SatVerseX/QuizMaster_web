import React, { useState, useEffect } from 'react';
import { FiPlay, FiClock, FiTrendingUp, FiTarget, FiAward, FiBookOpen, FiRefreshCw } from 'react-icons/fi';
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
  onTakeTest,
  onViewTests,
  isAdmin = false,
  userAttempts = [],
  userSubscriptions = []
}) => {
  const [recentActivity, setRecentActivity] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);

  // Load recent activity from Firebase
  useEffect(() => {
    if (!currentUser) return;

    const loadRecentActivity = async () => {
      try {
        setLoading(true);
        
        // Load test attempts
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
          timeSpent: Math.round((doc.data().timeSpent || 0) / 60), // Convert to minutes
          status: 'completed'
        }));

        // Load quiz attempts
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

        // Combine and sort by date
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

  // Load AI-powered recommendations
  useEffect(() => {
    if (!currentUser) return;

    const loadRecommendations = async () => {
      try {
        setRecommendationsLoading(true);
        const result = await generatePersonalizedRecommendations(currentUser.uid);
        
        if (result.success) {
          setRecommendations(result.data || []);
        } else {
          console.error('Failed to load recommendations:', result.error);
          setRecommendations([]);
        }
      } catch (error) {
        console.error('Error loading recommendations:', error);
        setRecommendations([]);
      } finally {
        setRecommendationsLoading(false);
      }
    };

    loadRecommendations();
  }, [currentUser]);

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'test_completed':
        return <FiTarget className="w-3 h-3 text-green-500" />;
      case 'test_started':
        return <FiPlay className="w-3 h-3 text-blue-500" />;
      case 'series_subscribed':
        return <FiBookOpen className="w-3 h-3 text-purple-500" />;
      default:
        return <FiClock className="w-3 h-3 text-gray-500" />;
    }
  };

  const getActivityStatus = (activity) => {
    switch (activity.status) {
      case 'completed':
        return (
          <span className="text-green-500 text-xs font-medium">
            {activity.score}%
          </span>
        );
      case 'in_progress':
        return (
          <span className="text-blue-500 text-xs font-medium">
            {activity.timeSpent}m
          </span>
        );
      case 'subscribed':
        return (
          <span className="text-purple-500 text-xs font-medium">
            New
          </span>
        );
      default:
        return null;
    }
  };

  const handleRecommendationClick = async (recommendation) => {
    try {
      // Track user interaction
      await updateUserRecommendations(currentUser.uid, recommendation.id, 'clicked');
      
      // Create series data object
      const seriesData = { 
        id: recommendation.id, 
        title: recommendation.title,
        // Add other required properties if needed
      };
      
      // For admin users, navigate to dashboard
      // For non-admin users, navigate to tests page
      if (isAdmin && onViewSeries) {
        onViewSeries(seriesData);
      } else if (!isAdmin && onViewTests) {
        onViewTests(seriesData);
      } else if (onViewSeries) {
        // Fallback to onViewSeries if onViewTests is not available
        onViewSeries(seriesData);
      }
    } catch (error) {
      console.error('Error handling recommendation click:', error);
    }
  };

  const refreshRecommendations = async () => {
    if (!currentUser) return;
    
    try {
      setRecommendationsLoading(true);
      const result = await generatePersonalizedRecommendations(currentUser.uid);
      
      if (result.success) {
        setRecommendations(result.data || []);
        
        // Show a brief message if using cached recommendations
        if (result.cached) {
          // You could show a toast notification here if you have a toast system
          console.log('Using cached recommendations from today');
        }
      }
    } catch (error) {
      console.error('Error refreshing recommendations:', error);
    } finally {
      setRecommendationsLoading(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className={`w-full h-full ${isDark ? 'bg-gray-900/40' : 'bg-white'} rounded-xl   p-4`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FiClock className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Recent Activity
          </h3>
        </div>
        
      </div>

      {/* Activity List */}
      <div className="space-y-2 mb-4">
        {recentActivity.slice(0, 3).map((activity) => (
          <div
            key={activity.id}
            className={`p-3 rounded-lg cursor-pointer ${
              isDark ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {activity.title}
                  </h4>
                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {formatTimeAgo(activity.completedAt || activity.startedAt || activity.subscribedAt)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <p className={`text-xs truncate ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {activity.seriesName}
                  </p>
                  {getActivityStatus(activity)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI-Powered Recommendations */}
      <div className="border-t border-gray-200/30 pt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FiTrendingUp className={`w-3 h-3 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
            <h4 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Recommended
            </h4>
            {recommendationsLoading && (
              <FiRefreshCw className={`w-3 h-3 animate-spin ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            )}
          </div>
          <button
            onClick={refreshRecommendations}
            disabled={recommendationsLoading}
            className={`text-xs px-2 py-1 rounded ${
              isDark 
                ? 'text-green-400 hover:bg-gray-700 disabled:text-gray-500' 
                : 'text-green-600 hover:bg-gray-100 disabled:text-gray-400'
            }`}
          >
            Refresh
          </button>
        </div>

        {recommendationsLoading ? (
          <div className="space-y-2">
            {[1, 2].map(i => (
              <div key={i} className={`p-2 rounded animate-pulse ${
                isDark ? 'bg-gray-700/50' : 'bg-gray-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className={`h-3 rounded w-3/4 mb-1 ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
                    <div className={`h-2 rounded w-1/2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                  </div>
                  <div className={`h-5 w-12 rounded ml-2 ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}></div>
                </div>
              </div>
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="space-y-2">
            {recommendations.slice(0, 2).map((rec) => (
              <div
                key={rec.id}
                onClick={() => handleRecommendationClick(rec)}
                className={`p-4 rounded-lg cursor-pointer ${
                  isDark ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h5 className={`text-xs font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {rec.title}
                    </h5>
                    
                    {rec.priority && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className={`text-xs px-1 py-0.5 rounded ${
                          rec.priority === 'High' ? 'bg-red-100 text-red-700' :
                          rec.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {rec.priority}
                        </span>
                        {rec.confidence && (
                          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {rec.confidence}% match
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-2 rounded-lg ml-2 ${
                    rec.difficulty === 'Easy' ? 'bg-green-100 text-green-600' :
                    rec.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {rec.difficulty}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <p className="text-xs">Complete some tests to get recommendations</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivityCompact;
