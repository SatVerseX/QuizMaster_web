import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { examCategories, getAllSubcategories } from '../../utils/constants/examCategories';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  getDocs,
  doc,
  updateDoc,
  increment
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { 
  FiBookOpen,
  FiUsers,
  FiClock,
  FiPlay,
  FiTrendingUp,
  FiAward,
  FiSearch,
  FiPlus,
  FiStar,
  FiTarget,
  FiSettings,
  FiChevronRight,
  FiChevronDown,
  FiZap,
  FiFilter,
  FiHeart,
  FiEye,
  FiActivity,
  FiTrendingDown,
  FiGrid,
  FiList,
  FiCreditCard,
  FiCheck,
  FiMessageSquare,
  FiLogIn
} from 'react-icons/fi';
import { FaGraduationCap, FaCrown, FaRocket, FaGem, FaMagic, FaBrain, FaUsers } from 'react-icons/fa';

const TestSeriesList = ({ 
  onCreateSeries, 
  onViewSeries, 
  onSubscribeSeries, 
  onTakeTest, 
  onViewTests // NEW: Add this prop
}) => {
  const { currentUser, isAdmin } = useAuth();
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [selectedExamCategory, setSelectedExamCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');

  useEffect(() => {
    loadTestSeries();
    if (currentUser) {
      loadUserSubscriptions();
    }
  }, [currentUser]);

  const loadTestSeries = async () => {
    try {
      const baseRef = collection(db, 'test-series');
      const q = isAdmin
        ? query(baseRef, orderBy('createdAt', 'desc'))
        : query(baseRef, where('isPublished', '==', true), orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const seriesData = [];
        
        for (const doc of querySnapshot.docs) {
          const seriesInfo = { id: doc.id, ...doc.data() };
          
          try {
            const testsQuery = query(
              collection(db, 'quizzes'),
              where('testSeriesId', '==', seriesInfo.id)
            );
            
            const testsSnapshot = await getDocs(testsQuery);
            const tests = [];
            testsSnapshot.forEach(testDoc => {
              tests.push({ id: testDoc.id, ...testDoc.data() });
            });
            
            seriesData.push({
              ...seriesInfo,
              tests: tests,
              totalTests: tests.length,
              totalQuizzes: tests.length
            });
          } catch (error) {
            console.error(`Error loading tests for series ${seriesInfo.id}:`, error);
            seriesData.push({
              ...seriesInfo,
              tests: [],
              totalTests: 0,
              totalQuizzes: 0
            });
          }
        }
        
        setSeries(seriesData);
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error loading series:', error);
      setLoading(false);
    }
  };

  // Load user's subscriptions to check which series they have access to
  const loadUserSubscriptions = async () => {
    try {
      const q = query(
        collection(db, 'test-series-subscriptions'),
        where('userId', '==', currentUser.uid),
        where('status', '==', 'active')
      );
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const subscriptions = querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          testSeriesId: doc.data().testSeriesId
        }));
        setUserSubscriptions(subscriptions);
      });
      
      return unsubscribe;
    } catch (error) {
      console.error('Error loading user subscriptions:', error);
    }
  };

  // Check if user has already subscribed to the test series
  const hasUserSubscribed = (testSeriesId) => {
    return userSubscriptions.some(sub => sub.testSeriesId === testSeriesId);
  };

  const isCreator = (seriesItem) => {
    return currentUser && seriesItem.createdBy === currentUser.uid;
  };

  const filteredSeries = series.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedExamCategory || item.examCategory === selectedExamCategory;
    const matchesSubcategory = !selectedSubcategory || item.examSubcategory === selectedSubcategory;
    
    switch (activeFilter) {
      case 'my-series':
        return matchesSearch && matchesCategory && matchesSubcategory && isCreator(item);
      case 'subscribed':
        return matchesSearch && matchesCategory && matchesSubcategory;
      case 'free':
        return matchesSearch && matchesCategory && matchesSubcategory && !item.isPaid;
      case 'paid':
        return matchesSearch && matchesCategory && matchesSubcategory && item.isPaid;
      default:
        return matchesSearch && matchesCategory && matchesSubcategory;
    }
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'from-green-500 to-emerald-500';
      case 'hard': return 'from-red-500 to-pink-500';
      default: return 'from-yellow-500 to-orange-500';
    }
  };

  // Record a one-time free series view per browser (localStorage)
  const recordFreeView = async (series) => {
    try {
      if (!series || series.isPaid) return;
      const key = `viewed-series-${series.id}`;
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, '1');
      await updateDoc(doc(db, 'test-series', series.id), {
        totalSubscribers: increment(1),
        totalViews: increment(1)
      });
    } catch (e) {
      console.error('Error updating free series view:', e);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'education': return <FaGraduationCap className="w-5 h-5" />;
      case 'competitive': return <FaRocket className="w-5 h-5" />;
      case 'programming': return <FaBrain className="w-5 h-5" />;
      default: return <FiBookOpen className="w-5 h-5" />;
    }
  };

  // Enhanced Series Card
  const EnhancedSeriesCard = ({ series }) => {
    const isSubscribed = hasUserSubscribed(series.id);
    
    return (
      <div className="group relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border border-gray-600/40 rounded-2xl sm:rounded-3xl p-4 sm:p-5 lg:p-6 shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:scale-[1.02] hover:border-blue-500/30 overflow-hidden">
        {/* Background Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Premium/Free Badge */}
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10">
          {series.isPaid ? (
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold flex items-center gap-1 sm:gap-1.5 shadow-lg">
              <FaCrown className="w-3 h-3" />
              <span className="hidden sm:inline">Premium</span>
              <span className="sm:hidden">Pro</span>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold flex items-center gap-1 sm:gap-1.5 shadow-lg">
              <FaGem className="w-3 h-3" />
              Free
            </div>
          )}
          
          {/* Subscribed Badge */}
          {series.isPaid && isSubscribed && (
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold flex items-center gap-1 sm:gap-1.5 shadow-lg mt-2">
              <FiCheck className="w-3 h-3" />
              <span className="hidden sm:inline">Subscribed</span>
              <span className="sm:hidden">Sub</span>
            </div>
          )}
        </div>

        <div className="relative">
          {/* Cover Image */}
          {series.coverImageUrl && (
            <div className="mb-3 sm:mb-4">
              <img
                src={series.coverImageUrl}
                alt={series.title}
                className="w-full h-28 sm:h-32 object-cover rounded-xl sm:rounded-2xl border border-gray-600/40"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Header */}
          <div className="mb-3 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg sm:rounded-xl border border-blue-500/30">
                {getCategoryIcon(series.category)}
              </div>
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1 group-hover:text-blue-200 transition-colors leading-tight">
                  {series.title}
                </h3>
                <div className="text-xs sm:text-sm text-gray-400 capitalize">
                  {series.category || 'General'} • {series.createdByName || 'Anonymous'}
                  {series.examCategory && (
                    <span className="ml-2 text-purple-300">
                      • {examCategories.find(cat => cat.id === series.examCategory)?.icon} {examCategories.find(cat => cat.id === series.examCategory)?.name}
                    </span>
                  )}
                  {series.examSubcategory && (
                    <span className="ml-1 text-blue-300">
                      • {examCategories.find(cat => cat.id === series.examCategory)?.subcategories.find(sub => sub.id === series.examSubcategory)?.icon} {examCategories.find(cat => cat.id === series.examCategory)?.subcategories.find(sub => sub.id === series.examSubcategory)?.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed line-clamp-2">
              {series.description || 'Comprehensive test series to enhance your skills and knowledge.'}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="bg-blue-500/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-4 border border-blue-500/20">
              <div className="flex items-center gap-2 sm:gap-3">
                <FiBookOpen className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-400" />
                <div>
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-300">{series.totalTests || 0}</div>
                  <div className="text-xs sm:text-sm text-blue-200">Tests</div>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-500/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-4 border border-purple-500/20">
              <div className="flex items-center gap-2 sm:gap-3">
                <FiUsers className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-400" />
                <div>
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-300">{series.totalSubscribers || 0}</div>
                  <div className="text-xs sm:text-sm text-purple-200">Students</div>
                </div>
              </div>
            </div>

            <div className="bg-emerald-500/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-4 border border-emerald-500/20">
              <div className="flex items-center gap-2 sm:gap-3">
                <FiClock className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-emerald-400" />
                <div>
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-emerald-300">{series.estimatedDuration || 60}</div>
                  <div className="text-xs sm:text-sm text-emerald-200">Minutes</div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-500/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-4 border border-yellow-500/20">
              <div className="flex items-center gap-2 sm:gap-3">
                <FiStar className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-yellow-400" />
                <div>
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-300">4.8</div>
                  <div className="text-xs sm:text-sm text-yellow-200">Rating</div>
                </div>
              </div>
            </div>
          </div>

          {/* Difficulty Badge */}
          <div className="flex items-center justify-between mb-4">
            <div className={`px-4 py-2 rounded-xl bg-gradient-to-r ${getDifficultyColor(series.difficulty)} text-white font-bold text-sm shadow-lg`}>
              {series.difficulty?.toUpperCase() || 'MEDIUM'} LEVEL
            </div>
            
            {series.isPaid && (
              <div className="text-right">
                <div className="text-3xl font-black text-emerald-400">
                  ₹{series.price}
                </div>
                <div className="text-xs text-gray-400">one-time payment</div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 sm:gap-3">
            {!currentUser ? (
              /* Non-logged-in users - Show Subscribe button */
              <button
                onClick={() => {
                  // This will trigger the login popup in App.jsx
                  if (onSubscribeSeries) onSubscribeSeries(series);
                }}
                className="group/btn relative flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-green-500/25"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-xl sm:rounded-2xl blur-xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center gap-2">
                  <FiCreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">Subscribe</span>
                  <FiChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
              </button>
            ) : isCreator(series) ? (
              <button
                onClick={() => onViewSeries(series)}
                className="group/btn relative flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-blue-500/25"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-blue-500/20 rounded-xl sm:rounded-2xl blur-xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center gap-2">
                  <FiSettings className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">Manage Series</span>
                  <FiChevronRight className="w-3 h-3 sm:w-4 sm:h-4 transition-transform group-hover/btn:translate-x-1" />
                </div>
              </button>
            ) : (
              <>
                {series.isPaid && !isSubscribed ? (
                  /* Paid series and not subscribed - Show only Subscribe button */
                  <button
                    onClick={() => onSubscribeSeries && onSubscribeSeries(series)}
                    className="group/btn relative flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-green-500/25"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-xl sm:rounded-2xl blur-xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center justify-center gap-2">
                      <FiCreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-sm sm:text-base">Subscribe</span>
                      <FiChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </div>
                  </button>
                ) : (
                  /* Free Series or Already Subscribed - Show View Tests Button */
                  <button
                    onClick={async () => {
                      await recordFreeView(series);
                      if (series.tests && series.tests.length > 0) {
                        onViewTests && onViewTests(series);
                      } else {
                        onViewSeries(series);
                      }
                    }}
                    className={`group/btn relative flex-1 bg-gradient-to-r ${
                      isSubscribed 
                        ? 'from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700' 
                        : 'from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700'
                    } text-white font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-emerald-500/25`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${
                      isSubscribed 
                        ? 'from-blue-400/20 to-indigo-400/20' 
                        : 'from-emerald-400/20 to-green-400/20'
                    } rounded-xl sm:rounded-2xl blur-xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300`}></div>
                    <div className="relative flex items-center justify-center gap-2">
                      <FiEye className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-sm sm:text-base">
                        {series.tests && series.tests.length > 0 ? 'View Tests' : 'View Series'}
                      </span>
                      <FiChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </div>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/10 to-purple-900/10">
        <div className="container-responsive">
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-48 sm:w-80 h-48 sm:h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-48 sm:w-80 h-48 sm:h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="relative z-10 animate-pulse space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="h-8 sm:h-10 bg-gray-700/50 rounded-lg w-48 sm:w-64 mb-3 sm:mb-4"></div>
                <div className="h-4 sm:h-6 bg-gray-700/30 rounded w-64 sm:w-96"></div>
              </div>
              <div className="h-10 sm:h-12 bg-gray-700/50 rounded-xl w-40 sm:w-48"></div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="h-10 sm:h-12 bg-gray-700/50 rounded-xl flex-1"></div>
              <div className="flex gap-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-10 sm:h-12 bg-gray-700/50 rounded-xl w-24 sm:w-32"></div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-[400px] sm:h-[500px] bg-gray-700/30 rounded-2xl sm:rounded-3xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/10 to-purple-900/10">
      <div className="container-responsive">
        {/* Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-48 sm:w-80 h-48 sm:h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-48 sm:w-80 h-48 sm:h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
          
          {/* Additional floating elements */}
          <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl animate-pulse delay-2000"></div>
          <div className="absolute bottom-1/4 right-1/3 w-24 h-24 bg-green-500/5 rounded-full blur-2xl animate-pulse delay-1500"></div>
          <div className="absolute top-3/4 left-1/3 w-40 h-40 bg-yellow-500/5 rounded-full blur-2xl animate-pulse delay-3000"></div>
          
          {/* Animated grid pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.3) 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }}></div>
          </div>
        </div>

        {/* Enhanced Header */}
        <div className="relative z-10 mb-8 sm:mb-12">
          <div className="text-center mb-8 sm:mb-12">
            {/* Floating Elements */}
            <div className="absolute top-0 left-1/4 w-4 h-4 bg-blue-400/30 rounded-full animate-bounce delay-100"></div>
            <div className="absolute top-8 right-1/4 w-3 h-3 bg-purple-400/30 rounded-full animate-bounce delay-300"></div>
            <div className="absolute top-16 left-1/3 w-2 h-2 bg-cyan-400/30 rounded-full animate-bounce delay-500"></div>
            
            {/* Main Title Section */}
            <div className="relative mb-6 sm:mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20 blur-3xl rounded-full"></div>
              <div className="relative flex items-center justify-center mb-6">
                <div className="bg-gradient-to-br from-blue-500 via-purple-600 to-cyan-600 p-6 sm:p-8 rounded-3xl mr-6 shadow-2xl animate-pulse animate-glow">
                  <FaGraduationCap className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-white" />
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 via-purple-200 to-cyan-200 leading-tight gradient-text">
                  Test Series Hub
                </h1>
              </div>
            </div>
            
            {/* Subtitle with enhanced styling */}
            <div className="relative mb-8">
              <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 flex items-center justify-center gap-3 mb-4">
                <FiZap className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 animate-pulse" />
                <span className="hidden sm:inline">Comprehensive test series to accelerate your success</span>
                <span className="sm:hidden">Accelerate your success</span>
                <FiZap className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 animate-pulse delay-1000" />
              </p>
              <div className="w-32 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 mx-auto rounded-full shadow-lg"></div>
            </div>



            {/* Enhanced Create Button for Admins */}
            {isAdmin && (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20 blur-2xl rounded-full animate-pulse"></div>
                <button
                  onClick={onCreateSeries}
                  className="group relative bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 text-white font-bold rounded-2xl sm:rounded-3xl px-8 sm:px-10 lg:px-12 py-4 sm:py-5 lg:py-6 transition-all duration-500 transform hover:scale-110 shadow-2xl hover:shadow-blue-500/25 border border-blue-400/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-2xl sm:rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative flex items-center gap-3 sm:gap-4">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <FiPlus className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
                    </div>
                    <span className="text-lg sm:text-xl lg:text-2xl">Create Test Series</span>
                    <FaRocket className="w-5 h-5 sm:w-6 sm:h-6 animate-bounce" />
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Search and Filter */}
        <div className="relative z-10 mb-8 sm:mb-12">
          <div className="bg-gradient-to-r from-gray-800/80 to-gray-700/80 backdrop-blur-xl border border-gray-600/60 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl shadow-blue-500/10">
            {/* Search Bar with enhanced styling */}
            <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 mb-8">
              <div className="relative flex-1">
                <div className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-gray-400">
                  <FiSearch className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
                </div>
                <input
                  type="text"
                  placeholder="Search test series by title, category, or creator..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 sm:pl-16 pr-6 sm:pr-8 py-4 sm:py-5 rounded-2xl sm:rounded-3xl bg-gray-900/80 backdrop-blur-sm border-2 border-gray-600/60 text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 font-medium text-base sm:text-lg lg:text-xl shadow-lg"
                />
                <div className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                </div>
              </div>
              
              {/* View Mode Toggle with enhanced styling */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-110 ${
                    viewMode === 'grid'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-2xl shadow-blue-500/25 border-2 border-blue-400/30'
                      : 'bg-gray-700/60 text-gray-300 hover:bg-gray-600/60 border-2 border-gray-600/40 hover:border-gray-500/60'
                  }`}
                >
                  <FiGrid className="w-6 h-6 sm:w-7 sm:h-7" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-110 ${
                    viewMode === 'list'
                      ? 'bg-gradient-to-r from-purple-500 to-cyan-600 text-white shadow-2xl shadow-purple-500/25 border-2 border-purple-400/30'
                      : 'bg-gray-700/60 text-gray-300 hover:bg-gray-600/60 border-2 border-gray-600/40 hover:border-gray-500/60'
                  }`}
                >
                  <FiList className="w-6 h-6 sm:w-7 sm:h-7" />
                </button>
              </div>
            </div>

            {/* Exam Category Dropdowns */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              {/* Main Category Dropdown */}
              <div className="relative flex-1">
                <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                  <FiFilter className="w-4 h-4 text-purple-400" />
                  Exam Category
                </label>
                <select
                  value={selectedExamCategory}
                  onChange={(e) => {
                    setSelectedExamCategory(e.target.value);
                    setSelectedSubcategory(''); // Reset subcategory when main category changes
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-gray-900/60 backdrop-blur-sm border border-gray-600/40 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none transition-all duration-300 font-medium text-sm"
                >
                  <option value="">All Categories</option>
                  {examCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Subcategory Dropdown */}
              <div className="relative flex-1">
                <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                  <FiFilter className="w-4 h-4 text-blue-400" />
                  Specific Exam
                </label>
                <select
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  disabled={!selectedExamCategory}
                  className={`w-full px-4 py-3 rounded-xl backdrop-blur-sm border appearance-none transition-all duration-300 font-medium text-sm ${
                    selectedExamCategory
                      ? 'bg-gray-900/60 border-gray-600/40 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      : 'bg-gray-800/40 border-gray-700/40 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <option value="">All Exams</option>
                  {selectedExamCategory && examCategories
                    .find(cat => cat.id === selectedExamCategory)
                    ?.subcategories.map(sub => (
                      <option key={sub.id} value={sub.id}>
                        {sub.icon} {sub.name}
                      </option>
                    ))}
                </select>
                <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Clear Filters Button */}
              {(selectedExamCategory || selectedSubcategory) && (
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSelectedExamCategory('');
                      setSelectedSubcategory('');
                    }}
                    className="px-4 py-3 rounded-xl bg-red-600/20 border border-red-500/40 text-red-300 hover:bg-red-600/30 hover:border-red-500/60 transition-all duration-300 font-medium text-sm"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>

            {/* Enhanced Filter Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              {[
                { id: 'all', label: 'All Series', icon: FiBookOpen, color: 'blue', bg: 'from-blue-500 to-blue-600', border: 'border-blue-400/30' },
                { id: 'my-series', label: 'My Series', icon: FiUsers, color: 'purple', bg: 'from-purple-500 to-purple-600', border: 'border-purple-400/30' },
                { id: 'free', label: 'Free Access', icon: FaGem, color: 'emerald', bg: 'from-emerald-500 to-emerald-600', border: 'border-emerald-400/30' },
                { id: 'paid', label: 'Premium', icon: FaCrown, color: 'yellow', bg: 'from-yellow-500 to-yellow-600', border: 'border-yellow-400/30' }
              ].map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`group relative flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold transition-all duration-500 hover:scale-110 ${
                    activeFilter === filter.id
                      ? `bg-gradient-to-r ${filter.bg} text-white shadow-2xl shadow-${filter.color}-500/25 border-2 ${filter.border}`
                      : 'bg-gray-800/80 backdrop-blur-xl border-2 border-gray-600/60 text-gray-300 hover:bg-gray-700/80 hover:border-gray-500/60 shadow-lg hover:shadow-xl'
                  }`}
                >
                  <filter.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${activeFilter === filter.id ? 'animate-pulse' : ''}`} />
                  <span className="text-sm sm:text-base lg:text-lg">{filter.label}</span>
                  {activeFilter === filter.id && (
                    <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Series Grid */}
        <div className="relative z-10">
          {filteredSeries.length > 0 ? (
            <div className={`${
              viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8' 
                : 'space-y-4 sm:space-y-6'
            }`}>
              {filteredSeries.map(seriesItem => (
                <EnhancedSeriesCard key={seriesItem.id} series={seriesItem} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 sm:py-24 lg:py-32">
              {/* Enhanced Text Content */}
              <div className="relative mb-8 sm:mb-12">
                              <h3 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-purple-200 mb-4 sm:mb-6 leading-tight">
                {(() => {
                  if (searchTerm) return 'No Matching Series Found';
                  if (selectedSubcategory && filteredSeries.length === 0) return 'No Test Series in This Subcategory';
                  if (selectedExamCategory && filteredSeries.length === 0) return 'No Test Series in This Category';
                  if (activeFilter === 'my-series') return 'No Subscribed Series';
                  if (activeFilter === 'free') return 'No Free Series Available';
                  if (activeFilter === 'paid') return 'No Premium Series Available';
                  return 'Ready to Begin Your Journey?';
                })()}
              </h3>
              <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed">
                {(() => {
                  if (searchTerm) return 'Try adjusting your search criteria or exploring different categories to find the perfect test series for you.';
                  if (selectedSubcategory && filteredSeries.length === 0) return `No test series currently exist in the "${selectedSubcategory}" subcategory. Try selecting a different subcategory or check back later for new content.`;
                  if (selectedExamCategory && filteredSeries.length === 0) return `No test series currently exist in the "${selectedExamCategory}" category. Try selecting a different category or check back later for new content.`;
                  if (activeFilter === 'my-series') return 'You haven\'t subscribed to any test series yet. Explore our collection and subscribe to start your learning journey!';
                  if (activeFilter === 'free') return 'Currently no free test series are available. Check back later or explore our premium offerings.';
                  if (activeFilter === 'paid') return 'No premium test series are currently available. Browse our free series or check back later for premium content.';
                  return 'Create your first comprehensive test series and start building an engaged learning community today. Transform your knowledge into powerful learning experiences.';
                })()}
              </p>
                
                

                {/* Free Access specific content */}
                {!searchTerm && activeFilter === 'free' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto mb-8">
                    <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 border border-emerald-500/20 rounded-xl p-4 text-center hover-lift">
                      <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FaGem className="w-6 h-6 text-emerald-400" />
                      </div>
                      <h4 className="text-white font-semibold mb-2">Premium Series</h4>
                      <p className="text-sm text-emerald-200">Explore our premium test series</p>
                    </div>
                    <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-4 text-center hover-lift">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FiBookOpen className="w-6 h-6 text-blue-400" />
                      </div>
                      <h4 className="text-white font-semibold mb-2">All Series</h4>
                      <p className="text-sm text-blue-200">Browse all available test series</p>
                    </div>
                  </div>
                )}

                {/* My Series specific content */}
                {!searchTerm && activeFilter === 'my-series' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto mb-8">
                    <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-4 text-center hover-lift">
                      <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FiBookOpen className="w-6 h-6 text-purple-400" />
                      </div>
                      <h4 className="text-white font-semibold mb-2">Explore Series</h4>
                      <p className="text-sm text-purple-200">Browse our collection of test series</p>
                    </div>
                    <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-4 text-center hover-lift">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FiHeart className="w-6 h-6 text-blue-400" />
                      </div>
                      <h4 className="text-white font-semibold mb-2">Subscribe & Learn</h4>
                      <p className="text-sm text-blue-200">Subscribe to start your learning journey</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Enhanced Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
                {isAdmin && (
                  <button
                    onClick={onCreateSeries}
                    className="group relative bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 text-white font-bold rounded-2xl sm:rounded-3xl px-8 sm:px-10 lg:px-12 py-4 sm:py-5 lg:py-6 transition-all duration-500 transform hover:scale-110 shadow-2xl hover:shadow-blue-500/25 border-2 border-blue-400/30"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-2xl sm:rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative flex items-center gap-3 sm:gap-4">
                      <div className="p-2 bg-white/20 rounded-xl">
                        <FiPlus className="w-6 h-6 sm:w-7 sm:h-7" />
                      </div>
                      <span className="text-lg sm:text-xl lg:text-2xl">Create Your First Series</span>
                      <FaRocket className="w-6 h-6 sm:w-7 sm:h-7 animate-bounce" />
                    </div>
                  </button>
                )}
                
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setActiveFilter('all');
                    }}
                    className="px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-gray-700/80 to-gray-600/80 border-2 border-gray-600/60 text-gray-300 hover:text-white hover:bg-gray-600/80 hover:border-gray-500/60 rounded-2xl sm:rounded-3xl transition-all duration-300 flex items-center gap-3 sm:gap-4 text-base sm:text-lg lg:text-xl font-semibold shadow-lg hover:shadow-xl"
                  >
                    <FiTarget className="w-5 h-5 sm:w-6 sm:h-6" />
                    View All Series
                  </button>
                )}



                {/* Free Access specific buttons */}
                {!isAdmin && !searchTerm && activeFilter === 'free' && (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={() => setActiveFilter('paid')}
                      className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-yellow-600/80 to-yellow-700/80 border-2 border-yellow-500/60 text-white rounded-xl sm:rounded-2xl transition-all duration-300 flex items-center gap-3 hover:scale-105 shadow-lg"
                    >
                      <FaCrown className="w-5 h-5" />
                      View Premium Series
                    </button>
                    <button 
                      onClick={() => setActiveFilter('all')}
                      className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600/80 to-blue-700/80 border-2 border-blue-500/60 text-white rounded-xl sm:rounded-2xl transition-all duration-300 flex items-center gap-3 hover:scale-105 shadow-lg"
                    >
                      <FiBookOpen className="w-5 h-5" />
                      Browse All Series
                    </button>
                  </div>
                )}

                {/* My Series specific buttons */}
                {!isAdmin && !searchTerm && activeFilter === 'my-series' && (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={() => setActiveFilter('all')}
                      className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600/80 to-blue-700/80 border-2 border-blue-500/60 text-white rounded-xl sm:rounded-2xl transition-all duration-300 flex items-center gap-3 hover:scale-105 shadow-lg"
                    >
                      <FiBookOpen className="w-5 h-5" />
                      Browse All Series
                    </button>
                  </div>
                )}
              </div>

              {/* Motivational quote */}
              {!searchTerm && (
                <div className="mt-12 sm:mt-16 max-w-2xl mx-auto">
                  <div className="bg-gradient-to-r from-gray-800/60 to-gray-700/60 backdrop-blur-xl border border-gray-600/40 rounded-2xl p-6 sm:p-8 shimmer">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <div className="w-1 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                      <FiMessageSquare className="w-6 h-6 text-blue-400" />
                      <div className="w-1 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"></div>
                    </div>
                    <p className="text-lg sm:text-xl text-gray-300 italic text-center leading-relaxed">
                      "Education is not preparation for life; education is life itself."
                    </p>
                    <p className="text-sm text-gray-400 text-center mt-3">— John Dewey</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(75, 85, 99, 0.3);
            border-radius: 3px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, #3B82F6, #8B5CF6);
            border-radius: 3px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(to bottom, #2563EB, #7C3AED);
          }
          
          .line-clamp-3 {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          /* Enhanced animations */
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }

          @keyframes glow {
            0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
            50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6), 0 0 60px rgba(139, 92, 246, 0.4); }
          }

          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }

          .animate-float {
            animation: float 6s ease-in-out infinite;
          }

          .animate-glow {
            animation: glow 4s ease-in-out infinite;
          }

          .shimmer {
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
            background-size: 200% 100%;
            animation: shimmer 3s infinite;
          }

          /* Enhanced hover effects */
          .hover-lift {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .hover-lift:hover {
            transform: translateY(-8px);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          }

          /* Gradient text animation */
          .gradient-text {
            background: linear-gradient(-45deg, #3B82F6, #8B5CF6, #06B6D4, #3B82F6);
            background-size: 400% 400%;
            animation: gradient 8s ease infinite;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
    </div>
  );
};

export default TestSeriesList;
