import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import usePopup from '../../hooks/usePopup';
import BeautifulPopup from '../common/BeautifulPopup';
import { 
  FiDollarSign,
  FiUsers,
  FiTrendingUp,
  FiEdit,
  FiBookOpen,
  FiArrowLeft,
  FiTarget,
  FiRefreshCw,
  FiTrendingDown,
  FiTrendingUp as FiUp,
  FiAlertCircle,
  FiDatabase,
  FiActivity
} from 'react-icons/fi';
import TestSeriesEditor from './TestSeriesEditor';

// Import new components
import StatCard from '../dashboard/StatCard';
import CreationSection from '../dashboard/CreationSection';
import TabNavigation from '../dashboard/TabNavigation';
import TabContent from '../dashboard/TabContent';

const TestSeriesDashboard = ({ 
  testSeries, 
  onBack, 
  onCreateManualTest, 
  onCreateAITest, 
  onTakeTest,
  onEditSeries 
}) => {
  const navigate = useNavigate();
  const { currentUser, isAdmin } = useAuth();
  const { isDark } = useTheme();
  const { popupState, showSuccess, showError, showConfirm, hidePopup } = usePopup();
  
  // Theme mode function
  const mode = (light, dark) => (isDark ? dark : light);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditor, setShowEditor] = useState(false);
  const [error, setError] = useState(null);
  
  const [dashboardData, setDashboardData] = useState({
    totalEarnings: 0,
    totalSubscribers: 0,
    recentSubscriptions: [],
    quizzes: [],
    monthlyStats: [],
    averageRating: 4.5,
    totalViews: 0,
    recentAttempts: [],
    topPerformers: []
  });

  useEffect(() => {
    if (testSeries) {
      const unsubscribe = loadDashboardData();
      return () => {
        if (unsubscribe && typeof unsubscribe === 'function') {
          unsubscribe();
        }
      };
    }
  }, [testSeries]);

  const loadDashboardData = () => {
    // Guard clause: prevent queries if ID is missing
    if (!testSeries?.id) {
      console.warn("TestSeriesDashboard: testSeries ID is missing, skipping data load.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Subscriptions listener
      const subscriptionsQuery = query(
        collection(db, 'test-series-subscriptions'),
        where('testSeriesId', '==', testSeries.id),
        orderBy('subscribedAt', 'desc')
      );
      
      const unsubscribeSubscriptions = onSnapshot(subscriptionsQuery, (querySnapshot) => {
        const subscriptions = [];
        let totalEarnings = 0;
        querySnapshot.forEach((doc) => {
          const sub = { id: doc.id, ...doc.data() };
          subscriptions.push(sub);
        });
        setDashboardData(prev => ({
          ...prev,
          totalEarnings, 
          totalSubscribers: subscriptions.length,
          recentSubscriptions: subscriptions.slice(0, 10),
        }));
      }, (error) => {
        console.error('Error loading subscriptions:', error);
        setError('Failed to load subscription data');
      });

      // Enhanced quiz loading with proper section-wise integration
      const loadAllQuizzes = async () => {
        try {
          // Load regular quizzes
          const quizzesQuery = query(
            collection(db, 'quizzes'),
            where('testSeriesId', '==', testSeries.id),
            orderBy('createdAt', 'desc')
          );
          
          // Load section-wise quizzes
          const sectionQuizzesQuery = query(
            collection(db, 'section-quizzes'),
            where('testSeriesId', '==', testSeries.id),
            orderBy('createdAt', 'desc')
          );
          
          const [quizzesSnapshot, sectionQuizzesSnapshot] = await Promise.all([
            getDocs(quizzesQuery),
            getDocs(sectionQuizzesQuery)
          ]);
          
          const allQuizzes = [];
          
          // Add regular quizzes with enhanced metadata
          quizzesSnapshot.forEach((doc) => {
            const quizData = doc.data();
            allQuizzes.push({ 
              id: doc.id, 
              ...quizData,
              type: 'regular',
              quizType: 'regular',
              collection: 'quizzes',
              totalAttempts: quizData.totalAttempts || 0,
              difficulty: quizData.difficulty || 'medium',
              timeLimit: quizData.timeLimit || quizData.duration || 0,
              questions: quizData.questions || [],
              isAIGenerated: quizData.isAIGenerated || false
            });
          });
          
          // Add section-wise quizzes with enhanced metadata
          sectionQuizzesSnapshot.forEach((doc) => {
            const quizData = doc.data();
            allQuizzes.push({ 
              id: doc.id, 
              ...quizData,
              type: 'section-wise',
              quizType: 'section-wise',
              collection: 'section-quizzes',
              totalAttempts: quizData.totalAttempts || 0,
              difficulty: quizData.difficulty || 'medium',
              timeLimit: quizData.timeLimit || quizData.duration || 0,
              questions: quizData.questions || [],
              isAIGenerated: quizData.isAIGenerated || false,
              sectionName: quizData.name || quizData.sectionName || 'Section Quiz',
              sectionId: quizData.sectionId || quizData.id
            });
          });
          
          // Sort all quizzes by creation date
          allQuizzes.sort((a, b) => {
            const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
            const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
            return dateB - dateA;
          });
          
          setDashboardData(prev => ({
            ...prev,
            quizzes: allQuizzes,
            totalViews: allQuizzes.reduce((sum, quiz) => sum + (quiz.totalAttempts || 0), 0)
          }));
          setLoading(false);
        } catch (error) {
          console.error('Error loading quizzes:', error);
          setError('Failed to load quiz data');
          setLoading(false);
        }
      };
      
      // Load quizzes initially
      loadAllQuizzes();
      
      // Enhanced real-time listeners
      const quizzesQuery = query(
        collection(db, 'quizzes'),
        where('testSeriesId', '==', testSeries.id),
        orderBy('createdAt', 'desc')
      );
      
      const sectionQuizzesQuery = query(
        collection(db, 'section-quizzes'),
        where('testSeriesId', '==', testSeries.id),
        orderBy('createdAt', 'desc')
      );
      
      const unsubscribeQuizzes = onSnapshot(quizzesQuery, () => {
        loadAllQuizzes();
      }, (error) => {
        console.error('Error loading regular quizzes:', error);
      });
      
      const unsubscribeSectionQuizzes = onSnapshot(sectionQuizzesQuery, () => {
        loadAllQuizzes();
      }, (error) => {
        console.error('Error loading section quizzes:', error);
      });

      // Enhanced attempts loading for both quiz types
      const loadTestAttempts = async () => {
        try {
          // Load regular quiz attempts
          const regularAttemptsQuery = query(
            collection(db, 'test-attempts'),
            where('testSeriesId', '==', testSeries.id),
            orderBy('completedAt', 'desc')
          );
          
          // Load section-wise quiz attempts
          const sectionAttemptsQuery = query(
            collection(db, 'quiz-attempts'),
            where('testSeriesId', '==', testSeries.id),
            orderBy('completedAt', 'desc')
          );
          
          const [regularSnapshot, sectionSnapshot] = await Promise.all([
            getDocs(regularAttemptsQuery),
            getDocs(sectionAttemptsQuery)
          ]);
          
          const allAttempts = [];
          
          // Add regular attempts
          regularSnapshot.forEach((doc) => {
            allAttempts.push({ 
              id: doc.id, 
              ...doc.data(),
              attemptType: 'regular'
            });
          });
          
          // Add section attempts
          sectionSnapshot.forEach((doc) => {
            allAttempts.push({ 
              id: doc.id, 
              ...doc.data(),
              attemptType: 'section-wise'
            });
          });
          
          // Sort by completion date
          allAttempts.sort((a, b) => {
            const dateA = a.completedAt?.toDate?.() || new Date(a.completedAt || 0);
            const dateB = b.completedAt?.toDate?.() || new Date(b.completedAt || 0);
            return dateB - dateA;
          });
          
          // Calculate top performers from all attempts
          const topPerformers = allAttempts
            .filter(attempt => attempt.percentage !== undefined)
            .sort((a, b) => b.percentage - a.percentage)
            .slice(0, 5);
          
          setDashboardData(prev => ({
            ...prev,
            recentAttempts: allAttempts.slice(0, 10),
            topPerformers
          }));
        } catch (error) {
          console.error('Error loading attempts:', error);
        }
      };
      
      // Load attempts initially
      loadTestAttempts();
      
      // Set up real-time listeners for attempts
      const regularAttemptsQuery = query(
        collection(db, 'test-attempts'),
        where('testSeriesId', '==', testSeries.id),
        orderBy('completedAt', 'desc')
      );
      
      const sectionAttemptsQuery = query(
        collection(db, 'quiz-attempts'),
        where('testSeriesId', '==', testSeries.id),
        orderBy('completedAt', 'desc')
      );
      
      const unsubscribeRegularAttempts = onSnapshot(regularAttemptsQuery, () => {
        loadTestAttempts();
      }, (error) => {
        console.error('Error loading regular attempts:', error);
      });
      
      const unsubscribeSectionAttempts = onSnapshot(sectionAttemptsQuery, () => {
        loadTestAttempts();
      }, (error) => {
        console.error('Error loading section attempts:', error);
      });

      return () => {
        unsubscribeSubscriptions();
        unsubscribeQuizzes();
        unsubscribeSectionQuizzes();
        unsubscribeRegularAttempts();
        unsubscribeSectionAttempts();
      };
    } catch (err) {
      console.error('Error setting up listeners:', err);
      setError('Failed to initialize dashboard');
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Enhanced delete function for both quiz types
  const handleDeleteQuiz = async (quiz) => {
    const quizType = quiz.quizType || quiz.type;
    const collection_name = quiz.collection || (quizType === 'section-wise' ? 'section-quizzes' : 'quizzes');
    
    showConfirm(
      `Are you sure you want to delete this ${quizType} test? This action cannot be undone.`,
      'Confirm Deletion',
      async () => {
        try {
          await deleteDoc(doc(db, collection_name, quiz.id));
          
          await updateDoc(doc(db, 'test-series', testSeries.id), {
            totalQuizzes: Math.max(0, (dashboardData.quizzes.length - 1)),
            updatedAt: new Date()
          });
          
          showSuccess(`${quizType === 'section-wise' ? 'Section-wise' : 'Regular'} test deleted successfully!`, 'Test Deleted');
        } catch (error) {
          console.error('Error deleting quiz:', error);
          showError('Failed to delete test. Please try again.', 'Delete Error');
        }
      }
    );
  };

  // Enhanced test taking function
  const handleTakeTestClick = (quiz) => {
    if (onTakeTest) {
      const enhancedQuiz = {
        ...quiz,
        quizType: quiz.quizType || quiz.type,
        collection: quiz.collection || (quiz.quizType === 'section-wise' ? 'section-quizzes' : 'quizzes')
      };
      onTakeTest(enhancedQuiz, testSeries);
    }
  };

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate?.() || new Date(timestamp);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate?.() || new Date(timestamp);
    return date.toLocaleString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (percentage) => {
    if (percentage >= 80) return 'bg-green-900/20 border-green-700/50';
    if (percentage >= 60) return 'bg-yellow-900/20 border-yellow-700/50';
    return 'bg-red-900/20 border-red-700/50';
  };

  const getTestStatusIcon = (quiz) => {
    const attempts = quiz.totalAttempts || 0;
    const questions = quiz.questions?.length || 0;
    
    if (attempts === 0) return { icon: FiDatabase, color: 'text-gray-400', label: 'No attempts yet' };
    if (attempts < 5) return { icon: FiTrendingDown, color: 'text-yellow-400', label: 'Low activity' };
    if (attempts < 20) return { icon: FiActivity, color: 'text-blue-400', label: 'Moderate activity' };
    return { icon: FiUp, color: 'text-green-400', label: 'High activity' };
  };

  // Show editor if requested
  if (showEditor) {
    return (
      <TestSeriesEditor
        testSeries={testSeries}
        onBack={() => setShowEditor(false)}
        onCreateManualTest={onCreateManualTest}
        onCreateAITest={onCreateAITest}
        onEditTest={(test) => console.log('Edit test:', test)}
        onSeriesUpdated={(updatedSeries) => {
          setShowEditor(false);
        }}
        onSeriesDeleted={() => {
          onBack();
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className={mode("max-w-7xl mx-auto p-4 bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/50", "max-w-7xl mx-auto p-4")}>
        <div className="animate-pulse">
          <div className={mode("h-8 bg-slate-300 rounded w-1/3 mb-8", "h-8 bg-gray-700 rounded w-1/3 mb-8")}></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={mode("h-24 bg-slate-300 rounded-xl", "h-24 bg-gray-700 rounded-xl")}></div>
            ))}
          </div>
          <div className={mode("h-56 bg-slate-300 rounded-xl", "h-56 bg-gray-700 rounded-xl")}></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={mode("max-w-7xl mx-auto p-4 bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/50", "max-w-7xl mx-auto p-4")}>
        <div className={mode(
          "bg-red-50 border border-red-200 rounded-xl p-6 text-center shadow-sm",
          "bg-red-900/20 border border-red-700/50 rounded-xl p-6 text-center"
        )}>
          <FiAlertCircle className={mode("w-12 h-12 text-red-500 mx-auto mb-4", "w-12 h-12 text-red-400 mx-auto mb-4")} />
          <h3 className={mode("text-xl font-bold text-red-800 mb-2", "text-xl font-bold text-white mb-2")}>Error Loading Dashboard</h3>
          <p className={mode("text-red-600 mb-4", "text-red-400 mb-4")}>{error}</p>
          <button onClick={handleRefresh} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={mode("container-responsive bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/50", "container-responsive")}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          
          <div>
            <h1 className={mode("text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800", "text-xl sm:text-2xl lg:text-3xl font-bold text-white")}>
              {testSeries.title}
            </h1>
            <p className={mode("text-sm sm:text-base text-slate-600", "text-sm sm:text-base text-gray-400")}>
              Test Series Dashboard • {testSeries.isPaid ? formatPrice(testSeries.price) : 'Free'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          
          
          {isAdmin && (
          <button
            onClick={() => setShowEditor(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 sm:px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2"
          >
            <FiEdit className="w-4 h-4" />
            <span className="sm:hidden sm:inline">Edit Series</span>
            <span className="sm:hidden">Edit</span>
          </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <StatCard 
          icon={FiDollarSign} 
          value={formatPrice(dashboardData.totalEarnings)} 
          label="Total Earnings" 
          color="bg-green-600"
          trend="up"
          trendValue="12%"
          mode={mode}
        />
        <StatCard 
          icon={FiUsers} 
          value={dashboardData.totalSubscribers} 
          label="Total Subscribers" 
          color="bg-blue-600"
          trend="up"
          trendValue="8%"
          mode={mode}
        />
        <StatCard 
          icon={FiBookOpen} 
          value={dashboardData.quizzes.length} 
          label="Total Tests" 
          color="bg-purple-600"
          mode={mode}
        />
        <StatCard 
          icon={FiTarget} 
          value={dashboardData.totalViews} 
          label="Total Attempts" 
          color="bg-amber-600"
          trend="up"
          trendValue="15%"
          mode={mode}
        />
      </div>

      {/* Creation Section */}
      <CreationSection
        onCreateManual={onCreateManualTest}
        onCreateAI={onCreateAITest}
        mode={mode}
        isDark={isDark}
        isAdmin={isAdmin}
      />

      {/* Tab Navigation */}
      <TabNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mode={mode}
      />

      {/* Tab Content */}
      <TabContent
        activeTab={activeTab}
        dashboardData={dashboardData}
        mode={mode}
        formatPrice={formatPrice}
        formatDate={formatDate}
        formatDateTime={formatDateTime}
        getScoreColor={getScoreColor}
        getScoreBg={getScoreBg}
        getStatusIcon={getTestStatusIcon}
        onTake={handleTakeTestClick}
        onEdit={(quiz) => console.log('Edit quiz:', quiz.id, quiz.quizType)}
        onView={(quiz) => console.log('View quiz:', quiz.id, quiz.quizType)}
        onDelete={handleDeleteQuiz}
        onCreateManual={onCreateManualTest}
        onCreateAI={onCreateAITest}
        isAdmin={isAdmin}
        setShowEditor={setShowEditor}
      />

      {/* Beautiful Popup */}
      <BeautifulPopup
        {...popupState}
        onClose={hidePopup}
      />
    </div>
  );
};

export default TestSeriesDashboard;