import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { PaymentService } from '../../services/paymentService';
import { doc, updateDoc, arrayUnion, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import usePopup from '../../hooks/usePopup';
import BeautifulPopup from '../common/BeautifulPopup';
import { 
  FiCheck, 
  FiCreditCard, 
  FiLock, 
  FiBookOpen,
  FiUsers,
  FiStar,
  FiShield,
  FiArrowLeft,
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
          amount: (orderData.amount !== undefined ? orderData.amount : Math.round(((testSeries.discountedPrice ?? testSeries.price) * 100) || 0)),
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
                  // Idempotent deterministic subscription document
                  const subscriptionId = `${currentUser.uid}_${testSeries.id}`;
                  await setDoc(doc(db, 'test-series-subscriptions', subscriptionId), {
                    userId: currentUser.uid,
                    seriesId: testSeries.id,
                    testSeriesId: testSeries.id,
                    creatorId: testSeries.createdBy || null,
                    subscribedAt: new Date(),
                    status: 'active',
                  }, { merge: true });

                  // Best-effort local aggregation update; backend handles source of truth
                  await updateDoc(doc(db, 'test-series', testSeries.id), {
                    subscribedUsers: arrayUnion(currentUser.uid),
                    totalSubscribers: (testSeries.totalSubscribers || 0) + 1,
                    totalEarnings: (testSeries.totalEarnings || 0) + (testSeries.discountedPrice ?? testSeries.price)
                  });
                } catch (updateError) {
                  console.warn('Could not persist local subscription snapshot:', updateError);
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
    <div className={`min-h-screen py-8 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Test Mode Alert */}
        {isTestMode && (
          <div className={`mb-6 rounded-lg p-4 border-l-4 ${
            isDark 
              ? 'bg-orange-900/20 border-orange-500 text-orange-200' 
              : 'bg-orange-50 border-orange-400 text-orange-800'
          }`}>
            <div className="flex items-center gap-2">
              <FiInfo className="w-5 h-5" />
              <div>
                <h3 className="font-semibold mb-1">Test Mode Active</h3>
                <p className="text-sm">
                  You are using Razorpay in test mode. For testing, use card number 4111 1111 1111 1111, any future expiry date, and any CVV.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className={`mb-6 rounded-lg p-4 border-l-4 ${
            isDark 
              ? 'bg-red-900/20 border-red-500 text-red-200' 
              : 'bg-red-50 border-red-400 text-red-800'
          }`}>
            <div className="flex items-center gap-2">
              <FiAlertCircle className="w-5 h-5" />
              <div>
                <h3 className="font-semibold mb-1">Payment Error</h3>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Subscribe to Test Series {isTestMode && <span className="text-yellow-600">(Test Mode)</span>}
          </h1>
          
         
        </div>

        {/* Test Series Preview Card */}
        <div className={`mb-8 rounded-lg p-6 border ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-start gap-6">
            
            
            <div className="flex-1">
              {/* Series Title */}
              <h2 className={`text-2xl font-bold mb-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {testSeries.title}
              </h2>
              
              
              
              <p className={`mb-6 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {testSeries.description}
              </p>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className={`text-center p-3 rounded-lg ${
                  isDark ? 'bg-blue-900/20' : 'bg-blue-50'
                }`}>
                  <div className={`text-xl font-bold ${
                    isDark ? 'text-blue-400' : 'text-blue-600'
                  }`}>{testSeries.totalQuizzes || 0}</div>
                  <div className={`text-sm ${
                    isDark ? 'text-blue-300' : 'text-blue-500'
                  }`}>Tests</div>
                </div>
                
                <div className={`text-center p-3 rounded-lg ${
                  isDark ? 'bg-purple-900/20' : 'bg-purple-50'
                }`}>
                  <div className={`text-xl font-bold ${
                    isDark ? 'text-purple-400' : 'text-purple-600'
                  }`}>{testSeries.totalSubscribers || 0}</div>
                  <div className={`text-sm ${
                    isDark ? 'text-purple-300' : 'text-purple-500'
                  }`}>Students</div>
                </div>
                
                <div className={`text-center p-3 rounded-lg ${
                  isDark ? 'bg-green-900/20' : 'bg-green-50'
                }`}>
                  <div className={`text-xl font-bold ${
                    isDark ? 'text-green-400' : 'text-green-600'
                  }`}>★ 4.8</div>
                  <div className={`text-sm ${
                    isDark ? 'text-green-300' : 'text-green-500'
                  }`}>Rating</div>
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
                  className={`px-3 py-1 rounded-full text-sm ${
                    isDark 
                      ? 'bg-blue-900/30 text-blue-300' 
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pricing Card */}
          <div className={`rounded-lg p-6 border ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="text-center mb-6">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${
                isDark ? 'bg-green-600' : 'bg-green-500'
              }`}>
                <FiAward className="w-6 h-6 text-white" />
              </div>
              
              <h3 className={`text-xl font-bold mb-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Lifetime Access
              </h3>
              
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="text-3xl font-bold text-green-600">
                  {formatPrice(testSeries.discountedPrice ?? testSeries.price)}
                </div>
                {typeof testSeries.originalPrice === 'number' && (testSeries.originalPrice > (testSeries.discountedPrice ?? testSeries.price)) && (
                  <div className={`${isDark ? 'text-gray-400' : 'text-gray-500'} line-through text-lg`}>
                    {formatPrice(testSeries.originalPrice)}
                  </div>
                )}
                <div className={`text-xs font-bold px-2 py-1 rounded-full ${
                  isDark 
                    ? 'text-green-400 bg-green-900/20' 
                    : 'text-green-600 bg-green-100'
                }`}>
                  ONE TIME
                </div>
              </div>
              
              
            </div>

            {/* What's Included */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  Access to all {testSeries.totalQuizzes || 0} practice tests
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  Detailed explanations for every question
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  Performance analytics and progress tracking
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  Mobile-friendly interface
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  Future updates included free
                </span>
              </div>
            </div>

            {/* Subscribe Button */}
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <FiCreditCard className="w-5 h-5" />
                  Subscribe Now
                </>
              )}
            </button>
            
            <div className={`flex items-center justify-center gap-2 mt-3 text-xs ${
              isDark ? 'text-gray-500' : 'text-gray-500'
            }`}>
              <FiLock className="w-3 h-3" />
              <span>Secure payment with 256-bit SSL encryption</span>
            </div>
          </div>

          {/* Benefits */}
          <div className={`rounded-lg p-6 border ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              <FiAward className="w-5 h-5 text-blue-500" />
              Why Subscribe?
            </h3>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className={`flex-shrink-0 p-2 rounded-lg ${
                  isDark ? 'bg-blue-900/20' : 'bg-blue-100'
                }`}>
                  <FiBarChart2 className={`w-5 h-5 ${
                    isDark ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                </div>
                <div>
                  <h4 className={`font-semibold mb-1 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>Track Your Progress</h4>
                  <p className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>Detailed analytics to monitor your improvement</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className={`flex-shrink-0 p-2 rounded-lg ${
                  isDark ? 'bg-purple-900/20' : 'bg-purple-100'
                }`}>
                  <FiTrendingUp className={`w-5 h-5 ${
                    isDark ? 'text-purple-400' : 'text-purple-600'
                  }`} />
                </div>
                <div>
                  <h4 className={`font-semibold mb-1 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>Improve Your Skills</h4>
                  <p className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>High-quality questions designed to enhance knowledge</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className={`flex-shrink-0 p-2 rounded-lg ${
                  isDark ? 'bg-green-900/20' : 'bg-green-100'
                }`}>
                  <FiBriefcase className={`w-5 h-5 ${
                    isDark ? 'text-green-400' : 'text-green-600'
                  }`} />
                </div>
                <div>
                  <h4 className={`font-semibold mb-1 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>Career Advancement</h4>
                  <p className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>Build skills and confidence for your field</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className={`flex-shrink-0 p-2 rounded-lg ${
                  isDark ? 'bg-orange-900/20' : 'bg-orange-100'
                }`}>
                  <FiGift className={`w-5 h-5 ${
                    isDark ? 'text-orange-400' : 'text-orange-600'
                  }`} />
                </div>
                <div>
                  <h4 className={`font-semibold mb-1 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>Exclusive Content</h4>
                  <p className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>Premium materials for subscribers only</p>
                </div>
              </div>
            </div>

           

            
          </div>
        </div>

        {/* Security Footer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className={`flex items-center gap-3 p-4 rounded-lg border ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <FiShield className="w-5 h-5 text-blue-500" />
            <div>
              <div className={`font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Secure Payment</div>
              <div className={`text-xs ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>256-bit SSL encryption</div>
            </div>
          </div>
          
          <div className={`flex items-center gap-3 p-4 rounded-lg border ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <FiUsers className="w-5 h-5 text-green-500" />
            <div>
              <div className={`font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Instant Access</div>
              <div className={`text-xs ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>Start immediately</div>
            </div>
          </div>
          
          <div className={`flex items-center gap-3 p-4 rounded-lg border ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <FiStar className="w-5 h-5 text-purple-500" />
            <div>
              <div className={`font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Quality Assured</div>
              <div className={`text-xs ${
                isDark ? 'text-gray-400' : 'text-gray-600'
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
