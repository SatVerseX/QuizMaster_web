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
  FiPlus,
  FiBookOpen,
  FiArrowLeft,
  FiBarChart2,
  FiEye,
  FiAward,
  FiTrash2,
  FiRefreshCw,
  FiSettings,
  FiZap,
  FiClock,
  FiPlay,
  FiStar,
  FiCheck,
  FiGrid,
  FiFileText,
  FiChevronRight,
  FiActivity,
  FiTarget,
  FiTrendingDown,
  FiTrendingUp as FiUp,
  FiAlertCircle,
  FiDatabase,
  FiCreditCard,
  FiSave,
  FiLock,
  FiAlertTriangle,
  FiEyeOff,
  FiUser
} from 'react-icons/fi';
import { FaRobot } from 'react-icons/fa';
import TestSeriesEditor from './TestSeriesEditor';

const TestSeriesDashboard = ({ 
  testSeries, 
  onBack, 
  onCreateManualTest, 
  onCreateAITest, 
  onTakeTest, // NEW: Add test taking functionality
  onEditSeries 
}) => {
  const navigate = useNavigate();
  const { currentUser, isAdmin } = useAuth();
  const { isDark } = useTheme();
  const { popupState, showSuccess, showError, showConfirm, hidePopup } = usePopup();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditor, setShowEditor] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [creatorProfile, setCreatorProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);
  
  const [paymentSettings, setPaymentSettings] = useState({
    type: 'bank', // 'bank' or 'upi'
    bankAccount: {
      accountNumber: '',
      ifscCode: '',
      accountHolderName: '',
      bankName: '',
      verified: false
    },
    upi: {
      upiId: '',
      verified: false
    },
    syncWithProfile: true
  });
  
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
  
  // Creator profile/payouts removed
  useEffect(() => {
    setCreatorProfile(null);
    setLoadingProfile(false);
  }, [currentUser]);
  
  // Load payment settings from test series
  useEffect(() => {
    if (testSeries?.paymentMethod) {
      setPaymentSettings(testSeries.paymentMethod);
    }
  }, [testSeries, creatorProfile]);

  const loadDashboardData = () => {
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
          // platform-only: do not compute creator earnings
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

      // Quizzes listener
      const quizzesQuery = query(
        collection(db, 'quizzes'),
        where('testSeriesId', '==', testSeries.id),
        orderBy('createdAt', 'desc')
      );
      
      const unsubscribeQuizzes = onSnapshot(quizzesQuery, (quizSnapshot) => {
        const quizzes = [];
        quizSnapshot.forEach((doc) => {
          quizzes.push({ id: doc.id, ...doc.data() });
        });
        setDashboardData(prev => ({
          ...prev,
          quizzes,
          totalViews: quizzes.reduce((sum, quiz) => sum + (quiz.totalAttempts || 0), 0)
        }));
        setLoading(false);
      }, (error) => {
        console.error('Error loading quizzes:', error);
        setError('Failed to load quiz data');
        setLoading(false);
      });

      // NEW: Load recent test attempts
      const attemptsQuery = query(
        collection(db, 'test-attempts'),
        where('testSeriesId', '==', testSeries.id),
        orderBy('completedAt', 'desc'),
        // limit(10)
      );
      
      const unsubscribeAttempts = onSnapshot(attemptsQuery, (attemptSnapshot) => {
        const attempts = [];
        attemptSnapshot.forEach((doc) => {
          attempts.push({ id: doc.id, ...doc.data() });
        });
        
        // Calculate top performers
        const topPerformers = attempts
          .sort((a, b) => b.percentage - a.percentage)
          .slice(0, 5);
        
        setDashboardData(prev => ({
          ...prev,
          recentAttempts: attempts.slice(0, 10),
          topPerformers
        }));
      }, (error) => {
        console.error('Error loading attempts:', error);
      });

      return () => {
        unsubscribeSubscriptions();
        unsubscribeQuizzes();
        unsubscribeAttempts();
      };
    } catch (err) {
      console.error('Error setting up listeners:', err);
      setError('Failed to initialize dashboard');
      setLoading(false);
    }
  };
  
  const handlePaymentMethodChange = (field, value) => {
    setPaymentSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleBankDetailsChange = (field, value) => {
    setPaymentSettings(prev => ({
      ...prev,
      bankAccount: {
        ...prev.bankAccount,
        [field]: value
      }
    }));
  };
  
  const handleUPIDetailsChange = (field, value) => {
    setPaymentSettings(prev => ({
      ...prev,
      upi: {
        ...prev.upi,
        [field]: value
      }
    }));
  };
  
  const handleSyncWithProfileChange = async () => {
    const newSyncValue = !paymentSettings.syncWithProfile;
    
    setPaymentSettings(prev => ({
      ...prev,
      syncWithProfile: newSyncValue
    }));
    
    if (newSyncValue && creatorProfile?.paymentDetails) {
      // Load from profile
      setPaymentSettings(prev => ({
        ...prev,
        bankAccount: creatorProfile.paymentDetails.bankAccount || prev.bankAccount,
        upi: creatorProfile.paymentDetails.upi || prev.upi
      }));
    }
  };
  
  const savePaymentSettings = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'test-series', testSeries.id), {
        paymentMethod: paymentSettings,
        updatedAt: new Date()
      });
      
      // If sync with profile is enabled, also update the creator profile
      if (paymentSettings.syncWithProfile && currentUser) {
        const profileRef = doc(db, 'creator-profiles', currentUser.uid);
        const profileSnap = await getDoc(profileRef);
        
        if (profileSnap.exists()) {
          await updateDoc(profileRef, {
            paymentDetails: {
              bankAccount: paymentSettings.bankAccount,
              upi: paymentSettings.upi
            },
            updatedAt: new Date()
          });
        }
      }
      
      showSuccess('Payment settings saved successfully!', 'Settings Saved');
    } catch (error) {
      console.error('Error saving payment settings:', error);
      showError('Failed to save payment settings', 'Save Error');
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleDeleteQuiz = async (quizId) => {
    showConfirm(
      'Are you sure you want to delete this test? This action cannot be undone.',
      'Confirm Deletion',
      async () => {
        try {
          await deleteDoc(doc(db, 'quizzes', quizId));
          
          await updateDoc(doc(db, 'test-series', testSeries.id), {
            totalQuizzes: Math.max(0, (dashboardData.quizzes.length - 1)),
            updatedAt: new Date()
          });
          
          showSuccess('Test deleted successfully!', 'Test Deleted');
        } catch (error) {
          console.error('Error deleting quiz:', error);
          showError('Failed to delete test. Please try again.', 'Delete Error');
        }
      }
    );
  };

  // NEW: Handle test taking
  const handleTakeTestClick = (quiz) => {
    if (onTakeTest) {
      onTakeTest(quiz, testSeries);
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
      <div className="max-w-7xl mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-700 rounded-xl"></div>
            ))}
          </div>
          <div className="h-56 bg-gray-700 rounded-xl"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-6 text-center">
          <FiAlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Error Loading Dashboard</h3>
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={handleRefresh} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, value, label, color, trend, trendValue }) => (
    <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/60 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:bg-gray-800/80 transition-all">
      <div className="flex items-center gap-2 sm:gap-4">
        <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${color}`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{value}</div>
          <div className="text-xs sm:text-sm text-gray-400 flex items-center gap-1 sm:gap-2">
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{label.split(' ')[0]}</span>
            {trend && (
              <span className={`flex items-center gap-1 text-xs ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                {trend === 'up' ? <FiUp className="w-3 h-3" /> : <FiTrendingDown className="w-3 h-3" />}
                <span className="hidden sm:inline">{trendValue}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const TestCreationCard = ({ icon, title, description, features, buttonText, onClick, colorClass }) => (
    <div className={`backdrop-blur-sm border rounded-lg sm:rounded-xl p-4 sm:p-5 flex flex-col h-full transition-all duration-300 ${
      isDark 
        ? 'bg-gray-800/60 border-gray-700/60 hover:bg-gray-800/80' 
        : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
    }`}>
      <div className="flex items-center gap-2 sm:gap-3 mb-3">
        <div className={`p-2 sm:p-3 rounded-lg ${colorClass}`}>
          {icon}
        </div>
        <div>
          <h4 className={`text-base sm:text-lg font-bold transition-all duration-300 ${
            isDark ? 'text-white' : 'text-slate-800'
          }`}>{title}</h4>
          <p className={`text-xs sm:text-sm transition-all duration-300 ${
            isDark ? 'text-gray-400' : 'text-slate-600'
          }`}>{description}</p>
        </div>
      </div>
      
      <ul className={`space-y-1.5 sm:space-y-2 text-xs sm:text-sm mb-4 sm:mb-6 flex-grow transition-all duration-300 ${
        isDark ? 'text-gray-400' : 'text-slate-600'
      }`}>
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2">
            {typeof feature === 'object' ? feature.icon : <FiCheck className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />}
            <span className="hidden sm:inline">{typeof feature === 'object' ? feature.text : feature}</span>
            <span className="sm:hidden">{typeof feature === 'object' ? feature.text.split(' ')[0] : feature.split(' ')[0]}</span>
          </li>
        ))}
      </ul>
      
      <button
        onClick={onClick}
        className={`w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${colorClass} text-white hover:scale-105 text-sm sm:text-base`}
      >
        {typeof buttonText === 'object' ? (
          <>
            {buttonText.icon}
            <span className="hidden sm:inline">{buttonText.text}</span>
            <span className="sm:hidden">{buttonText.text.split(' ')[0]}</span>
          </>
        ) : (
          <span className="hidden sm:inline">{buttonText}</span>
        )}
      </button>
    </div>
  );

  return (
    <div className="container-responsive">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <button
            onClick={onBack}
            className="bg-gray-800/60 border border-gray-700/60 text-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm font-medium hover:bg-gray-700 transition-colors flex items-center gap-2 w-fit"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Series</span>
            <span className="sm:hidden">Back</span>
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
              {testSeries.title}
            </h1>
            <p className="text-sm sm:text-base text-gray-400">
              Test Series Dashboard • {testSeries.isPaid ? formatPrice(testSeries.price) : 'Free'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-gray-800/60 border border-gray-700/60 text-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm font-medium hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          
          {isAdmin && (
          <button
            onClick={() => setShowEditor(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 sm:px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2"
          >
            <FiEdit className="w-4 h-4" />
            <span className="hidden sm:inline">Edit Series</span>
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
        />
        <StatCard 
          icon={FiUsers} 
          value={dashboardData.totalSubscribers} 
          label="Total Subscribers" 
          color="bg-blue-600"
          trend="up"
          trendValue="8%"
        />
        <StatCard 
          icon={FiBookOpen} 
          value={dashboardData.quizzes.length} 
          label="Total Tests" 
          color="bg-purple-600"
        />
        <StatCard 
          icon={FiTarget} 
          value={dashboardData.totalViews} 
          label="Total Attempts" 
          color="bg-amber-600"
          trend="up"
          trendValue="15%"
        />
      </div>

      {/* Add New Test Section (Admins only) */}
      {isAdmin && (
      <div className={`backdrop-blur-sm border rounded-xl p-4 sm:p-5 mb-6 sm:mb-8 transition-all duration-300 ${
        isDark 
          ? 'bg-gray-800/60 border-gray-700/60' 
          : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-3 mb-4 sm:mb-5">
          <div className="p-2 bg-blue-600 rounded-lg">
            <FiPlus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h3 className={`text-lg sm:text-xl font-bold transition-all duration-300 ${
              isDark ? 'text-white' : 'text-slate-800'
            }`}>Add New Test</h3>
            <p className={`text-sm sm:text-base transition-all duration-300 ${
              isDark ? 'text-gray-400' : 'text-slate-600'
            }`}>Create tests for your series using manual editor or AI assistance</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <TestCreationCard
            icon={<FiEdit className="w-6 h-6 text-white" />}
            title="Manual Test Creator"
            description="Create tests with full control"
            features={[
              "Custom question creation",
              "Multiple choice options", 
              "Detailed explanations",
              "Time limit settings"
            ]}
            buttonText={{
              icon: <FiEdit className="w-5 h-5" />,
              text: "Create Manual Test"
            }}
            onClick={onCreateManualTest}
            colorClass="bg-blue-600 hover:bg-blue-700"
          />

          <TestCreationCard
            icon={<FaRobot className="w-6 h-6 text-white" />}
            title="AI Test Generator"
            description="Generate tests instantly with AI"
            features={[
              { icon: <FiZap className="w-4 h-4 text-yellow-400" />, text: "Instant question generation" },
              { icon: <FiZap className="w-4 h-4 text-yellow-400" />, text: "Topic-based content" },
              { icon: <FiZap className="w-4 h-4 text-yellow-400" />, text: "Difficulty customization" },
              { icon: <FiZap className="w-4 h-4 text-yellow-400" />, text: "JSON file upload support" }
            ]}
            buttonText={{
              icon: <FaRobot className="w-5 h-5" />,
              text: "Generate with AI"
            }}
            onClick={onCreateAITest}
            colorClass="bg-purple-600 hover:bg-purple-700"
          />
        </div>
      </div>
      )}

      {/* Tab Navigation (payment removed) */}
      <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: FiBarChart2 },
          { id: 'tests', label: 'Tests Management', icon: FiFileText },
          { id: 'attempts', label: 'Recent Attempts', icon: FiActivity },
          { id: 'subscribers', label: 'Subscribers', icon: FiUsers },
          { id: 'analytics', label: 'Analytics', icon: FiTrendingUp }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-lg font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Series Performance */}
          <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/60 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <FiAward className="w-5 h-5 text-yellow-400" />
              Series Performance
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-900/60 rounded-lg">
                <div>
                  <div className="font-semibold text-white">Conversion Rate</div>
                  <div className="text-sm text-gray-400">Views to Subscribers</div>
                </div>
                <div className="text-2xl font-bold text-blue-400">
                  {dashboardData.totalViews > 0 ? 
                    ((dashboardData.totalSubscribers / dashboardData.totalViews) * 100).toFixed(1) + '%' 
                    : '0%'
                  }
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-900/60 rounded-lg">
                <div>
                  <div className="font-semibold text-white">Average Rating</div>
                  <div className="text-sm text-gray-400">Student feedback</div>
                </div>
                <div className="flex items-center gap-1">
                  <FiStar className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-2xl font-bold text-yellow-400">
                    {dashboardData.averageRating}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-900/60 rounded-lg">
                <div>
                  <div className="font-semibold text-white">Revenue per Subscriber</div>
                  <div className="text-sm text-gray-400">Average earnings</div>
                </div>
                <div className="text-2xl font-bold text-green-400">
                  {dashboardData.totalSubscribers > 0 ? 
                    formatPrice(dashboardData.totalEarnings / dashboardData.totalSubscribers)
                    : formatPrice(0)
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/60 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
            
            <div className="space-y-3">
              <button
                onClick={onCreateManualTest}
                className="w-full flex items-center gap-3 p-4 bg-gray-900/60 hover:bg-gray-700 rounded-lg transition-colors text-left"
              >
                <div className="p-2 bg-blue-600 rounded-lg">
                  <FiEdit className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-white">Create Manual Test</span>
                <FiChevronRight className="w-4 h-4 text-gray-500 ml-auto" />
              </button>

              <button
                onClick={onCreateAITest}
                className="w-full flex items-center gap-3 p-4 bg-gray-900/60 hover:bg-gray-700 rounded-lg transition-colors text-left"
              >
                <div className="p-2 bg-purple-600 rounded-lg">
                  <FaRobot className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-white">Generate AI Test</span>
                <FiChevronRight className="w-4 h-4 text-gray-500 ml-auto" />
              </button>

              {/* Payment Settings quick action removed */}

              {/* Creator profile removed */}

              {isAdmin && (
              <button
                onClick={() => setShowEditor(true)}
                className="w-full flex items-center gap-3 p-4 bg-gray-900/60 hover:bg-gray-700 rounded-lg transition-colors text-left"
              >
                <div className="p-2 bg-gray-600 rounded-lg">
                  <FiSettings className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-white">Edit Series Settings</span>
                <FiChevronRight className="w-4 h-4 text-gray-500 ml-auto" />
              </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tests Management Tab */}
      {activeTab === 'tests' && (
        <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/60 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <FiBookOpen className="w-5 h-5 text-purple-400" />
              Tests in Series ({dashboardData.quizzes.length})
            </h3>
            
            <div className="flex gap-3">
              <button
                onClick={onCreateManualTest}
                className="bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg px-4 py-2 text-sm flex items-center gap-2 transition-colors"
              >
                <FiEdit className="w-4 h-4" />
                Manual
              </button>
              <button
                onClick={onCreateAITest}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg px-4 py-2 text-sm flex items-center gap-2 transition-colors"
              >
                <FaRobot className="w-4 h-4" />
                AI Generate
              </button>
            </div>
          </div>

          {dashboardData.quizzes.length > 0 ? (
            <div className="divide-y divide-gray-700">
              {dashboardData.quizzes.map(quiz => {
                const statusInfo = getTestStatusIcon(quiz);
                return (
                  <div key={quiz.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-4 hover:bg-gray-800/40 px-4 -mx-4 rounded-lg">
                    <div className="flex-1 mb-3 sm:mb-0">
                      <div className="flex items-center gap-3">
                        <h4 className="text-lg font-semibold text-white">
                          {quiz.title}
                        </h4>
                        {quiz.isAIGenerated && (
                          <span className="px-2 py-0.5 bg-purple-900/50 text-purple-300 text-xs font-medium rounded-full flex items-center gap-1">
                            <FaRobot className="w-3 h-3" />
                            AI
                          </span>
                        )}
                        <div className="flex items-center gap-1" title={statusInfo.label}>
                          <statusInfo.icon className={`w-4 h-4 ${statusInfo.color}`} />
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <FiBookOpen className="w-4 h-4" />
                          {quiz.questions?.length || 0} questions
                        </span>
                        <span className="flex items-center gap-1">
                          <FiClock className="w-4 h-4" />
                          {quiz.timeLimit || 0} min
                        </span>
                        <span className="flex items-center gap-1">
                          <FiPlay className="w-4 h-4" />
                          {quiz.totalAttempts || 0} attempts
                        </span>
                        <span className="capitalize text-xs px-2 py-0.5 rounded-full bg-gray-700">
                          {quiz.difficulty || 'medium'}
                        </span>
                        <span className="text-xs text-gray-500">
                          Created: {formatDate(quiz.createdAt)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* NEW: Take Test Button */}
                      <button
                        onClick={() => handleTakeTestClick(quiz)}
                        className="p-2 text-gray-400 hover:text-green-400 hover:bg-gray-700 rounded-lg transition-colors"
                        title="Take Test"
                      >
                        <FiPlay className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => console.log('View quiz:', quiz.id)}
                        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
                        title="View Test"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => console.log('Edit quiz:', quiz.id)}
                        className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-gray-700 rounded-lg transition-colors"
                        title="Edit Test"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuiz(quiz.id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                        title="Delete Test"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-900/40 rounded-xl">
              <FiBookOpen className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No tests created yet
              </h3>
              <p className="text-gray-400 mb-6">
                Start creating tests for your series to help students practice
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={onCreateManualTest}
                  className="bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg px-4 py-2 text-sm flex items-center gap-2 transition-colors"
                >
                  Create Manual Test
                </button>
                <button
                  onClick={onCreateAITest}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg px-4 py-2 text-sm flex items-center gap-2 transition-colors"
                >
                  Generate with AI
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* NEW: Recent Attempts Tab */}
      {activeTab === 'attempts' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Attempts */}
            <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/60 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <FiActivity className="w-5 h-5 text-blue-400" />
                Recent Attempts ({dashboardData.recentAttempts.length})
              </h3>

              {dashboardData.recentAttempts.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.recentAttempts.slice(0, 5).map(attempt => (
                    <div key={attempt.id} className="flex items-center justify-between p-3 bg-gray-900/40 rounded-lg">
                      <div>
                        <div className="font-medium text-white text-sm">
                          {attempt.testTitle}
                        </div>
                        <div className="text-xs text-gray-400">
                          {attempt.userName || attempt.userEmail} • {formatDateTime(attempt.completedAt)}
                        </div>
                      </div>
                      <div className={`text-right px-3 py-1 rounded-lg border ${getScoreBg(attempt.percentage)}`}>
                        <div className={`font-bold ${getScoreColor(attempt.percentage)}`}>
                          {attempt.percentage}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiActivity className="w-8 h-8 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400">No test attempts yet</p>
                </div>
              )}
            </div>

            {/* Top Performers */}
            <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/60 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <FiAward className="w-5 h-5 text-yellow-400" />
                Top Performers
              </h3>

              {dashboardData.topPerformers.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.topPerformers.map((attempt, index) => (
                    <div key={attempt.id} className="flex items-center gap-3 p-3 bg-gray-900/40 rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0 ? 'bg-yellow-600 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-amber-600 text-white' :
                        'bg-gray-600 text-white'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-white text-sm">
                          {attempt.userName || attempt.userEmail}
                        </div>
                        <div className="text-xs text-gray-400">
                          {attempt.testTitle}
                        </div>
                      </div>
                      <div className="text-green-400 font-bold">
                        {attempt.percentage}%
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiAward className="w-8 h-8 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400">No attempts to rank yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Subscribers Tab */}
      {activeTab === 'subscribers' && (
        <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/60 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <FiUsers className="w-5 h-5 text-blue-400" />
            Recent Subscriptions ({dashboardData.totalSubscribers})
          </h3>

          {dashboardData.recentSubscriptions.length > 0 ? (
            <div className="divide-y divide-gray-700">
              {dashboardData.recentSubscriptions.map(subscription => (
                <div key={subscription.id} className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-900/50 rounded-full flex items-center justify-center text-blue-300 font-bold text-lg">
                      {subscription.userEmail?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="font-semibold text-white">
                        {subscription.userEmail || 'Unknown User'}
                      </div>
                      <div className="text-sm text-gray-400">
                        Subscribed on {formatDate(subscription.subscribedAt)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-400">
                      {formatPrice(subscription.creatorEarning || 0)}
                    </div>
                    <div className="text-xs text-gray-500">
                      your earning
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-900/40 rounded-xl">
              <FiUsers className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No subscribers yet
              </h3>
              <p className="text-gray-400">
                Share your test series to attract students
              </p>
            </div>
          )}
        </div>
      )}

      {/* Payment Settings removed */}
      
      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/60 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">
              Performance Metrics
            </h3>
            <div className="text-center py-16 bg-gray-900/40 rounded-xl">
              <FiBarChart2 className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">
                Advanced analytics coming soon!
              </p>
            </div>
          </div>

          <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/60 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">
              Revenue Trends
            </h3>
            <div className="text-center py-16 bg-gray-900/40 rounded-xl">
              <FiTrendingUp className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">
                Revenue charts coming soon!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Beautiful Popup */}
      <BeautifulPopup
        {...popupState}
        onClose={hidePopup}
      />
    </div>
  );
};

export default TestSeriesDashboard;
