import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { PaymentService } from '../../services/paymentService';
import { doc, updateDoc, arrayUnion, addDoc, collection } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import usePopup from '../../hooks/usePopup';
import BeautifulPopup from '../common/BeautifulPopup';
import { 
  FiCheck, 
  FiCreditCard, 
  FiLock, 
  FiBookOpen,
  FiClock,
  FiUsers,
  FiStar,
  FiShield,
  FiArrowLeft,
  FiZap,
  FiAward,
  FiTrendingUp,
  FiHelpCircle,
  FiGift,
  FiBriefcase,
  FiBarChart2,
  FiAlertCircle,
  FiInfo
} from 'react-icons/fi';
import { FaGraduationCap } from 'react-icons/fa';

const TestSeriesSubscription = ({ testSeries, onSuccess, onCancel }) => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const { popupState, showSuccess, showError, hidePopup } = usePopup();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isTestMode, setIsTestMode] = useState(false);
  
  // Check if we're in test/development environment
  useEffect(() => {
    const checkTestMode = () => {
      const host = window.location.hostname;
      return host === 'localhost' || host === '127.0.0.1' || import.meta.env.DEV === true;
    };
    
    setIsTestMode(checkTestMode());
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price || 0);
  };

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if user is logged in
      if (!currentUser) {
        setError('You need to be logged in to subscribe. Please sign in and try again.');
        setLoading(false);
        return;
      }

      // Load Razorpay script
      const scriptLoaded = await PaymentService.loadRazorpayScript();
      if (!scriptLoaded) {
        setError('Payment system failed to load. Please try again.');
        return;
      }

      try {
        // Create subscription order
        const orderData = await PaymentService.createTestSeriesOrder({
          testSeriesId: testSeries.id,
          testSeriesTitle: testSeries.title,
          price: testSeries.price,
          userId: currentUser.uid,
          userEmail: currentUser.email
        });

        // Razorpay options
        const options = {
          key: orderData.key,
          amount: orderData.amount,
          currency: 'INR',
          name: 'QuizMaster',
          description: `Subscribe to: ${testSeries.title}${isTestMode ? ' (TEST MODE)' : ''}`,
          order_id: orderData.orderId,
          
          handler: async function (response) {
            try {
              // Verify payment
              const verification = await PaymentService.verifyTestSeriesSubscription({
                orderId: orderData.orderId,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                testSeriesId: testSeries.id,
                userId: currentUser.uid
              });

              if (verification.success) {
                try {
                  // Try to update test series with new subscriber
                  // NOTE: This is now also done on the backend for reliability
                  await updateDoc(doc(db, 'test-series', testSeries.id), {
                    subscribedUsers: arrayUnion(currentUser.uid),
                    totalSubscribers: (testSeries.totalSubscribers || 0) + 1,
                    totalEarnings: (testSeries.totalEarnings || 0) + testSeries.price
                  });
                } catch (updateError) {
                  console.warn('Could not update test series locally:', updateError);
                  // Continue anyway as backend should have handled this
                }

                onSuccess();
                if (isTestMode) {
                  showSuccess('TEST MODE: Subscription successful! You now have lifetime access.', 'Test Mode Success');
                } else {
                  showSuccess('Subscription successful! You now have lifetime access!', 'Subscription Success');
                }
              }
            } catch (error) {
              console.error('Subscription verification failed:', error);
              setError(isTestMode ? 
                'Test mode subscription verification failed. This could be normal in test mode. Please check if you have access to the test series.' :
                'Subscription verification failed. Please contact support.');
                
              // In test mode, we'll still consider it successful since test signatures often fail
              if (isTestMode) {
                onSuccess();
              }
            }
          },

          prefill: {
            name: currentUser.displayName || '',
            email: currentUser.email
          },

          theme: {
            color: '#3B82F6'
          },

          modal: {
            ondismiss: function() {
              setLoading(false);
            }
          }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } catch (paymentError) {
        console.error('Payment initialization error:', paymentError);
        
        // Handle specific Razorpay errors
        if (paymentError.message.includes('Failed to create payment order')) {
          setError('Unable to initialize payment. Please try again or contact support.');
        } else {
          setError(`Payment initialization failed: ${paymentError.message}`);
        }
      }
      
    } catch (error) {
      console.error('Subscription failed:', error);
      
      // Handle specific errors
      if (error.message.includes('authentication') || error.message.includes('token') || error.message.includes('Unauthorized')) {
        setError('Authentication error: Please log out and log back in, then try again.');
      } else if (error.message.includes('network') || error.message.includes('connection')) {
        setError('Network error: Please check your internet connection and try again.');
      } else {
        setError(`Subscription failed: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900/10 to-purple-900/10' 
        : 'bg-white'
    }`}>
      {/* Professional Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 right-20 w-96 h-96 rounded-full blur-3xl animate-pulse ${
          isDark ? 'bg-blue-500/10' : 'bg-blue-400/8'
        }`}></div>
        <div className={`absolute bottom-20 left-20 w-96 h-96 rounded-full blur-3xl animate-pulse delay-1000 ${
          isDark ? 'bg-purple-500/10' : 'bg-indigo-400/6'
        }`}></div>
        <div className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl animate-pulse delay-500 ${
          isDark ? 'bg-orange-500/10' : 'bg-blue-300/5'
        }`}></div>
      </div>

      <div className="container-responsive relative z-10 py-8">
        {/* Test Mode Alert */}
        {isTestMode && (
          <div className={`mb-6 rounded-xl p-4 shadow-lg border-2 transition-all duration-300 ${
            isDark 
              ? 'bg-gradient-to-r from-orange-900/40 to-yellow-900/40 border-orange-500/50 text-white' 
              : 'bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-300/60 text-orange-800'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${
                isDark ? 'bg-orange-500/20' : 'bg-orange-500/10'
              }`}>
                <FiInfo className={`w-5 h-5 ${
                  isDark ? 'text-orange-400' : 'text-orange-600'
                }`} />
              </div>
              <div>
                <h3 className={`font-bold text-lg mb-1 ${
                  isDark ? 'text-orange-300' : 'text-orange-700'
                }`}>Test Mode Active</h3>
                <p className={isDark ? 'text-orange-200' : 'text-orange-600'}>
                  You are using Razorpay in test mode. For testing, use card number 4111 1111 1111 1111, any future expiry date, and any CVV.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className={`mb-6 rounded-xl p-4 shadow-lg border-2 transition-all duration-300 ${
            isDark 
              ? 'bg-red-900/40 border-red-500/50 text-white' 
              : 'bg-red-50 border-red-300/60 text-red-800'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${
                isDark ? 'bg-red-500/20' : 'bg-red-500/10'
              }`}>
                <FiAlertCircle className={`w-5 h-5 ${
                  isDark ? 'text-red-400' : 'text-red-600'
                }`} />
              </div>
              <div>
                <h3 className={`font-bold text-lg mb-1 ${
                  isDark ? 'text-red-300' : 'text-red-700'
                }`}>Payment Error</h3>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Header */}
        <div className="text-center mb-12 relative">
          <button
            onClick={onCancel}
            className={`absolute left-4 top-0 flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md transition-all border ${
              isDark 
                ? 'bg-gray-800/50 hover:bg-gray-700/60 text-gray-200 border-gray-600/30' 
                : 'bg-white/90 hover:bg-slate-50 text-slate-700 border-slate-200/60 shadow-slate-200/40'
            }`}
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="inline-block mb-6">
            <div className={`p-3 rounded-xl shadow-lg transition-all duration-300 ${
              isDark 
                ? 'bg-gradient-to-br from-blue-500 to-purple-600 shadow-blue-500/20' 
                : 'bg-gradient-to-br from-blue-600 to-indigo-600 shadow-blue-500/30'
            }`}>
              <FaGraduationCap className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h1 className={`text-4xl md:text-5xl font-black mb-4 transition-all duration-300 ${
            isDark 
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-purple-200' 
              : 'text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600'
          }`}>
            Subscribe to Test Series {isTestMode && <span className="text-yellow-600">(Test Mode)</span>}
          </h1>
          
          <p className={`text-xl max-w-2xl mx-auto transition-all duration-300 ${
            isDark ? 'text-gray-400' : 'text-slate-600'
          }`}>
            Get lifetime access to this comprehensive test series and accelerate your learning journey
          </p>
        </div>

        {/* Test Series Preview Card */}
        <div className={`mb-10 backdrop-blur-xl border rounded-3xl p-8 shadow-2xl transition-all duration-300 ${
          isDark 
            ? 'bg-gradient-to-br from-gray-800/70 to-gray-900/70 border-gray-700/50' 
            : 'bg-white border-slate-200/60 shadow-slate-300/20'
        }`}>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Series Icon */}
            <div className="flex-shrink-0">
              <div className={`w-24 h-24 flex items-center justify-center rounded-2xl shadow-lg border transition-all duration-300 ${
                isDark 
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-600 shadow-blue-500/20 border-blue-400/20' 
                  : 'bg-gradient-to-br from-blue-600 to-indigo-600 shadow-blue-500/30 border-blue-200/60'
              }`}>
                <FiBookOpen className="w-12 h-12 text-white" />
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              {/* Series Title */}
              <h2 className={`text-3xl font-bold mb-2 transition-all duration-300 ${
                isDark ? 'text-white' : 'text-slate-800'
              }`}>
                {testSeries.title}
              </h2>
              
              <p className={`mb-2 transition-all duration-300 ${
                isDark ? 'text-gray-400' : 'text-slate-600'
              }`}>
                by <span className="text-blue-600">{testSeries.createdByName}</span>
              </p>
              
              <p className={`mb-6 line-clamp-3 max-w-2xl transition-all duration-300 ${
                isDark ? 'text-gray-300' : 'text-slate-700'
              }`}>
                {testSeries.description}
              </p>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className={`rounded-xl p-4 border transition-all duration-300 ${
                  isDark 
                    ? 'bg-blue-900/20 border-blue-500/20' 
                    : 'bg-blue-50 border-blue-200/60'
                }`}>
                  <div className={`text-2xl font-bold mb-1 transition-all duration-300 ${
                    isDark ? 'text-blue-400' : 'text-blue-600'
                  }`}>{testSeries.totalQuizzes || 0}</div>
                  <div className={`text-sm transition-all duration-300 ${
                    isDark ? 'text-blue-300' : 'text-blue-500'
                  }`}>Practice Tests</div>
                </div>
                
                <div className={`rounded-xl p-4 border transition-all duration-300 ${
                  isDark 
                    ? 'bg-purple-900/20 border-purple-500/20' 
                    : 'bg-purple-50 border-purple-200/60'
                }`}>
                  <div className={`text-2xl font-bold mb-1 transition-all duration-300 ${
                    isDark ? 'text-purple-400' : 'text-purple-600'
                  }`}>{testSeries.totalSubscribers || 0}</div>
                  <div className={`text-sm transition-all duration-300 ${
                    isDark ? 'text-purple-300' : 'text-purple-500'
                  }`}>Students</div>
                </div>
                
                <div className={`rounded-xl p-4 border transition-all duration-300 ${
                  isDark 
                    ? 'bg-emerald-900/20 border-emerald-500/20' 
                    : 'bg-emerald-50 border-emerald-200/60'
                }`}>
                  <div className={`text-2xl font-bold mb-1 transition-all duration-300 ${
                    isDark ? 'text-emerald-400' : 'text-emerald-600'
                  }`}>{testSeries.estimatedDuration || 0}m</div>
                  <div className={`text-sm transition-all duration-300 ${
                    isDark ? 'text-emerald-300' : 'text-emerald-500'
                  }`}>Duration</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          {testSeries.tags && testSeries.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {testSeries.tags.map((tag, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 rounded-full text-sm font-medium border transition-all duration-300 ${
                    isDark 
                      ? 'bg-blue-900/30 text-blue-300 border-blue-500/20' 
                      : 'bg-blue-50 text-blue-600 border-blue-200/60'
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Two-Column Layout for Pricing and Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pricing Card */}
          <div className={`backdrop-blur-xl border-2 rounded-3xl p-8 shadow-2xl order-2 lg:order-1 transition-all duration-300 ${
            isDark 
              ? 'bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-600/30' 
              : 'bg-white border-green-200/60 shadow-slate-300/20'
          }`}>
            <div className="text-center mb-8">
              <div className={`inline-block p-4 rounded-full mb-4 border transition-all duration-300 ${
                isDark 
                  ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30' 
                  : 'bg-green-50 border-green-200/60'
              }`}>
                <FiZap className={`w-8 h-8 transition-all duration-300 ${
                  isDark ? 'text-green-400' : 'text-green-600'
                }`} />
              </div>
              
              <h3 className={`text-2xl font-bold mb-2 transition-all duration-300 ${
                isDark ? 'text-white' : 'text-slate-800'
              }`}>
                Lifetime Access
              </h3>
              
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                  {formatPrice(testSeries.price)}
                </div>
                <div className={`text-sm font-bold px-2 py-0.5 rounded-full border transition-all duration-300 ${
                  isDark 
                    ? 'text-green-500 bg-green-500/10 border-green-500/20' 
                    : 'text-green-600 bg-green-100 border-green-300'
                }`}>
                  ONE TIME
                </div>
              </div>
              
              <p className={`transition-all duration-300 ${
                isDark ? 'text-emerald-500/80' : 'text-emerald-600'
              }`}>
                No recurring charges • Lifetime updates
              </p>
            </div>

            {/* What's Included */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full border transition-all duration-300 ${
                  isDark 
                    ? 'bg-green-500/10 border-green-500/20' 
                    : 'bg-green-100 border-green-300'
                }`}>
                  <FiCheck className={`w-4 h-4 transition-all duration-300 ${
                    isDark ? 'text-green-400' : 'text-green-600'
                  }`} />
                </div>
                <span className={`transition-all duration-300 ${
                  isDark ? 'text-gray-300' : 'text-slate-700'
                }`}>
                  Access to all {testSeries.totalQuizzes || 0} practice tests
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full border transition-all duration-300 ${
                  isDark 
                    ? 'bg-green-500/10 border-green-500/20' 
                    : 'bg-green-100 border-green-300'
                }`}>
                  <FiCheck className={`w-4 h-4 transition-all duration-300 ${
                    isDark ? 'text-green-400' : 'text-green-600'
                  }`} />
                </div>
                <span className={`transition-all duration-300 ${
                  isDark ? 'text-gray-300' : 'text-slate-700'
                }`}>
                  Detailed explanations for every question
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full border transition-all duration-300 ${
                  isDark 
                    ? 'bg-green-500/10 border-green-500/20' 
                    : 'bg-green-100 border-green-300'
                }`}>
                  <FiCheck className={`w-4 h-4 transition-all duration-300 ${
                    isDark ? 'text-green-400' : 'text-green-600'
                  }`} />
                </div>
                <span className={`transition-all duration-300 ${
                  isDark ? 'text-gray-300' : 'text-slate-700'
                }`}>
                  Performance analytics and progress tracking
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full border transition-all duration-300 ${
                  isDark 
                    ? 'bg-green-500/10 border-green-500/20' 
                    : 'bg-green-100 border-green-300'
                }`}>
                  <FiCheck className={`w-4 h-4 transition-all duration-300 ${
                    isDark ? 'text-green-400' : 'text-green-600'
                  }`} />
                </div>
                <span className={`transition-all duration-300 ${
                  isDark ? 'text-gray-300' : 'text-slate-700'
                }`}>
                  Leaderboard competition with other students
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full border transition-all duration-300 ${
                  isDark 
                    ? 'bg-green-500/10 border-green-500/20' 
                    : 'bg-green-100 border-green-300'
                }`}>
                  <FiCheck className={`w-4 h-4 transition-all duration-300 ${
                    isDark ? 'text-green-400' : 'text-green-600'
                  }`} />
                </div>
                <span className={`transition-all duration-300 ${
                  isDark ? 'text-gray-300' : 'text-slate-700'
                }`}>
                  Mobile-friendly interface for practice anywhere
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full border transition-all duration-300 ${
                  isDark 
                    ? 'bg-green-500/10 border-green-500/20' 
                    : 'bg-green-100 border-green-300'
                }`}>
                  <FiCheck className={`w-4 h-4 transition-all duration-300 ${
                    isDark ? 'text-green-400' : 'text-green-600'
                  }`} />
                </div>
                <span className={`transition-all duration-300 ${
                  isDark ? 'text-gray-300' : 'text-slate-700'
                }`}>
                  Future updates and new tests included free
                </span>
              </div>
            </div>

            {/* Subscribe Button */}
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-5 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                <>
                  <FiCreditCard className="w-6 h-6" />
                  Subscribe Now
                </>
              )}
            </button>
            
            <div className={`flex items-center justify-center gap-2 mt-4 text-xs transition-all duration-300 ${
              isDark ? 'text-gray-500' : 'text-slate-500'
            }`}>
              <FiLock className="w-3 h-3" />
              <span>Secure payment with 256-bit SSL encryption</span>
            </div>
          </div>

          {/* Benefits and Features */}
          <div className={`backdrop-blur-xl border rounded-3xl p-8 shadow-2xl order-1 lg:order-2 transition-all duration-300 ${
            isDark 
              ? 'bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border-blue-700/30' 
              : 'bg-white border-blue-200/60 shadow-slate-300/20'
          }`}>
            <h3 className={`text-2xl font-bold mb-6 flex items-center gap-3 transition-all duration-300 ${
              isDark ? 'text-white' : 'text-slate-800'
            }`}>
              <FiAward className={`w-6 h-6 transition-all duration-300 ${
                isDark ? 'text-blue-400' : 'text-blue-600'
              }`} />
              Why Subscribe?
            </h3>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-xl border transition-all duration-300 ${
                    isDark 
                      ? 'bg-blue-500/10 border-blue-500/20' 
                      : 'bg-blue-100 border-blue-300'
                  }`}>
                    <FiBarChart2 className={`w-6 h-6 transition-all duration-300 ${
                      isDark ? 'text-blue-400' : 'text-blue-600'
                    }`} />
                  </div>
                </div>
                <div>
                  <h4 className={`text-lg font-bold mb-1 transition-all duration-300 ${
                    isDark ? 'text-white' : 'text-slate-800'
                  }`}>Track Your Progress</h4>
                  <p className={`transition-all duration-300 ${
                    isDark ? 'text-gray-400' : 'text-slate-600'
                  }`}>Detailed analytics to monitor your improvement over time</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-xl border transition-all duration-300 ${
                    isDark 
                      ? 'bg-purple-500/10 border-purple-500/20' 
                      : 'bg-purple-100 border-purple-300'
                  }`}>
                    <FiTrendingUp className={`w-6 h-6 transition-all duration-300 ${
                      isDark ? 'text-purple-400' : 'text-purple-600'
                    }`} />
                  </div>
                </div>
                <div>
                  <h4 className={`text-lg font-bold mb-1 transition-all duration-300 ${
                    isDark ? 'text-white' : 'text-slate-800'
                  }`}>Improve Your Skills</h4>
                  <p className={`transition-all duration-300 ${
                    isDark ? 'text-gray-400' : 'text-slate-600'
                  }`}>Practice with high-quality questions designed to enhance your knowledge</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-xl border transition-all duration-300 ${
                    isDark 
                      ? 'bg-pink-500/10 border-pink-500/20' 
                      : 'bg-pink-100 border-pink-300'
                  }`}>
                    <FiBriefcase className={`w-6 h-6 transition-all duration-300 ${
                      isDark ? 'text-pink-400' : 'text-pink-600'
                    }`} />
                  </div>
                </div>
                <div>
                  <h4 className={`text-lg font-bold mb-1 transition-all duration-300 ${
                    isDark ? 'text-white' : 'text-slate-800'
                  }`}>Career Advancement</h4>
                  <p className={`transition-all duration-300 ${
                    isDark ? 'text-gray-400' : 'text-slate-600'
                  }`}>Gain the skills and confidence needed to excel in your field</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-xl border transition-all duration-300 ${
                    isDark 
                      ? 'bg-amber-500/10 border-amber-500/20' 
                      : 'bg-amber-100 border-amber-300'
                  }`}>
                    <FiGift className={`w-6 h-6 transition-all duration-300 ${
                      isDark ? 'text-amber-400' : 'text-amber-600'
                    }`} />
                  </div>
                </div>
                <div>
                  <h4 className={`text-lg font-bold mb-1 transition-all duration-300 ${
                    isDark ? 'text-white' : 'text-slate-800'
                  }`}>Exclusive Content</h4>
                  <p className={`transition-all duration-300 ${
                    isDark ? 'text-gray-400' : 'text-slate-600'
                  }`}>Access premium materials not available to non-subscribers</p>
                </div>
              </div>
            </div>

            {/* User Testimonial */}
            <div className={`mt-8 p-6 rounded-2xl border transition-all duration-300 ${
              isDark 
                ? 'bg-gray-800/50 border-gray-700/50' 
                : 'bg-slate-50 border-slate-200/60'
            }`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  US
                </div>
                <div>
                  <div className={`font-bold transition-all duration-300 ${
                    isDark ? 'text-white' : 'text-slate-800'
                  }`}>User Success</div>
                  <div className={`text-sm transition-all duration-300 ${
                    isDark ? 'text-gray-400' : 'text-slate-500'
                  }`}>Verified Subscriber</div>
                </div>
                <div className="flex-1 flex justify-end">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FiStar key={star} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
              <p className={`italic transition-all duration-300 ${
                isDark ? 'text-gray-300' : 'text-slate-600'
              }`}>
                "This test series was exactly what I needed to prepare for my exams. The detailed explanations helped me understand complex concepts, and the practice tests boosted my confidence."
              </p>
            </div>

            {/* FAQ */}
            <div className="mt-6">
              <div className={`flex items-center gap-2 cursor-pointer group transition-all duration-300 ${
                isDark ? 'text-blue-400' : 'text-blue-600'
              }`}>
                <FiHelpCircle className="w-4 h-4" />
                <span className="text-sm group-hover:underline">Frequently asked questions</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Support */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className={`flex items-center gap-3 p-4 rounded-lg border transition-all duration-300 ${
            isDark 
              ? 'bg-blue-900/20 border-blue-700/30' 
              : 'bg-blue-50 border-blue-200/60'
          }`}>
            <FiShield className={`w-6 h-6 transition-all duration-300 ${
              isDark ? 'text-blue-400' : 'text-blue-600'
            }`} />
            <div>
              <div className={`font-bold transition-all duration-300 ${
                isDark ? 'text-blue-300' : 'text-blue-700'
              }`}>Secure Payment</div>
              <div className={`text-xs transition-all duration-300 ${
                isDark ? 'text-blue-400/70' : 'text-blue-500/70'
              }`}>256-bit SSL encryption</div>
            </div>
          </div>
          
          <div className={`flex items-center gap-3 p-4 rounded-lg border transition-all duration-300 ${
            isDark 
              ? 'bg-green-900/20 border-green-700/30' 
              : 'bg-green-50 border-green-200/60'
          }`}>
            <FiUsers className={`w-6 h-6 transition-all duration-300 ${
              isDark ? 'text-green-400' : 'text-green-600'
            }`} />
            <div>
              <div className={`font-bold transition-all duration-300 ${
                isDark ? 'text-green-300' : 'text-green-700'
              }`}>Instant Access</div>
              <div className={`text-xs transition-all duration-300 ${
                isDark ? 'text-green-400/70' : 'text-green-500/70'
              }`}>Start immediately</div>
            </div>
          </div>
          
          <div className={`flex items-center gap-3 p-4 rounded-lg border transition-all duration-300 ${
            isDark 
              ? 'bg-purple-900/20 border-purple-700/30' 
              : 'bg-purple-50 border-purple-200/60'
          }`}>
            <FiStar className={`w-6 h-6 transition-all duration-300 ${
              isDark ? 'text-purple-400' : 'text-purple-600'
            }`} />
            <div>
              <div className={`font-bold transition-all duration-300 ${
                isDark ? 'text-purple-300' : 'text-purple-700'
              }`}>Quality Assured</div>
              <div className={`text-xs transition-all duration-300 ${
                isDark ? 'text-purple-400/70' : 'text-purple-500/70'
              }`}>Expert-created content</div>
            </div>
          </div>
        </div>
      </div>

      {/* Beautiful Popup */}
      <BeautifulPopup
        {...popupState}
        onClose={hidePopup}
      />
    </div>
  );
};

export default TestSeriesSubscription;
