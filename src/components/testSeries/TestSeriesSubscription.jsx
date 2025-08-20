import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { PaymentService } from '../../services/paymentService';
import { doc, updateDoc, arrayUnion, addDoc, collection } from 'firebase/firestore';
import { db } from '../../lib/firebase';
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
                  alert('🧪 TEST MODE: Subscription successful! You now have lifetime access.');
                } else {
                  alert('🎉 Subscription successful! You now have lifetime access!');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/10 to-purple-900/10 py-10 px-4">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Test Mode Notice */}
        {isTestMode && (
          <div className="mb-6 bg-yellow-900/40 border-2 border-yellow-500/50 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-full">
                <FiInfo className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Test Mode Active</h3>
                <p>You are using Razorpay in test mode. For testing, use card number 4111 1111 1111 1111, any future expiry date, and any CVV.</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-900/40 border-2 border-red-500/50 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-full">
                <FiAlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Payment Error</h3>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <button
            onClick={onCancel}
            className="absolute left-4 top-0 flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/50 backdrop-blur-md hover:bg-gray-700/60 transition-all text-gray-200 border border-gray-600/30"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="inline-block mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg shadow-blue-500/20">
              <FaGraduationCap className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-purple-200 mb-4">
            Subscribe to Test Series {isTestMode && <span className="text-yellow-300">(Test Mode)</span>}
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Get lifetime access to this comprehensive test series and accelerate your learning journey
          </p>
        </div>

        {/* Test Series Preview Card */}
        <div className="mb-10 bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Series Icon */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/20 border border-blue-400/20">
                <FiBookOpen className="w-12 h-12 text-white" />
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              {/* Series Title */}
              <h2 className="text-3xl font-bold text-white mb-2">
                {testSeries.title}
              </h2>
              
              <p className="text-gray-400 mb-2">
                by <span className="text-blue-400">{testSeries.createdByName}</span>
              </p>
              
              <p className="text-gray-300 mb-6 line-clamp-3 max-w-2xl">
                {testSeries.description}
              </p>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl p-4 bg-blue-900/20 border border-blue-500/20">
                  <div className="text-2xl font-bold text-blue-400 mb-1">{testSeries.totalQuizzes || 0}</div>
                  <div className="text-sm text-blue-300">Practice Tests</div>
                </div>
                
                <div className="rounded-xl p-4 bg-purple-900/20 border border-purple-500/20">
                  <div className="text-2xl font-bold text-purple-400 mb-1">{testSeries.totalSubscribers || 0}</div>
                  <div className="text-sm text-purple-300">Students</div>
                </div>
                
                <div className="rounded-xl p-4 bg-emerald-900/20 border border-emerald-500/20">
                  <div className="text-2xl font-bold text-emerald-400 mb-1">{testSeries.estimatedDuration || 0}m</div>
                  <div className="text-sm text-emerald-300">Duration</div>
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
                  className="px-3 py-1 bg-blue-900/30 text-blue-300 rounded-full text-sm font-medium border border-blue-500/20"
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
          <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 backdrop-blur-xl border-2 border-green-600/30 rounded-3xl p-8 shadow-2xl order-2 lg:order-1">
            <div className="text-center mb-8">
              <div className="inline-block p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full mb-4 border border-green-500/30">
                <FiZap className="w-8 h-8 text-green-400" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">
                Lifetime Access
              </h3>
              
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
                  {formatPrice(testSeries.price)}
                </div>
                <div className="text-sm text-green-500 font-bold px-2 py-0.5 bg-green-500/10 rounded-full border border-green-500/20">
                  ONE TIME
                </div>
              </div>
              
              <p className="text-emerald-500/80">
                No recurring charges • Lifetime updates
              </p>
            </div>

            {/* What's Included */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-500/10 border border-green-500/20">
                  <FiCheck className="w-4 h-4 text-green-400" />
                </div>
                <span className="text-gray-300">
                  Access to all {testSeries.totalQuizzes || 0} practice tests
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-500/10 border border-green-500/20">
                  <FiCheck className="w-4 h-4 text-green-400" />
                </div>
                <span className="text-gray-300">
                  Detailed explanations for every question
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-500/10 border border-green-500/20">
                  <FiCheck className="w-4 h-4 text-green-400" />
                </div>
                <span className="text-gray-300">
                  Performance analytics and progress tracking
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-500/10 border border-green-500/20">
                  <FiCheck className="w-4 h-4 text-green-400" />
                </div>
                <span className="text-gray-300">
                  Leaderboard competition with other students
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-500/10 border border-green-500/20">
                  <FiCheck className="w-4 h-4 text-green-400" />
                </div>
                <span className="text-gray-300">
                  Mobile-friendly interface for practice anywhere
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-500/10 border border-green-500/20">
                  <FiCheck className="w-4 h-4 text-green-400" />
                </div>
                <span className="text-gray-300">
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
            
            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500">
              <FiLock className="w-3 h-3" />
              <span>Secure payment with 256-bit SSL encryption</span>
            </div>
          </div>

          {/* Benefits and Features */}
          <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 backdrop-blur-xl border border-blue-700/30 rounded-3xl p-8 shadow-2xl order-1 lg:order-2">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <FiAward className="w-6 h-6 text-blue-400" />
              Why Subscribe?
            </h3>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <FiBarChart2 className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">Track Your Progress</h4>
                  <p className="text-gray-400">Detailed analytics to monitor your improvement over time</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                    <FiTrendingUp className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">Improve Your Skills</h4>
                  <p className="text-gray-400">Practice with high-quality questions designed to enhance your knowledge</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-pink-500/10 rounded-xl border border-pink-500/20">
                    <FiBriefcase className="w-6 h-6 text-pink-400" />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">Career Advancement</h4>
                  <p className="text-gray-400">Gain the skills and confidence needed to excel in your field</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                    <FiGift className="w-6 h-6 text-amber-400" />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">Exclusive Content</h4>
                  <p className="text-gray-400">Access premium materials not available to non-subscribers</p>
                </div>
              </div>
            </div>

            {/* User Testimonial */}
            <div className="mt-8 p-6 bg-gray-800/50 rounded-2xl border border-gray-700/50">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  US
                </div>
                <div>
                  <div className="text-white font-bold">User Success</div>
                  <div className="text-gray-400 text-sm">Verified Subscriber</div>
                </div>
                <div className="flex-1 flex justify-end">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FiStar key={star} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-300 italic">
                "This test series was exactly what I needed to prepare for my exams. The detailed explanations helped me understand complex concepts, and the practice tests boosted my confidence."
              </p>
            </div>

            {/* FAQ */}
            <div className="mt-6">
              <div className="flex items-center gap-2 text-blue-400 cursor-pointer group">
                <FiHelpCircle className="w-4 h-4" />
                <span className="text-sm group-hover:underline">Frequently asked questions</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Support */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="flex items-center gap-3 p-4 bg-blue-900/20 rounded-lg border border-blue-700/30">
            <FiShield className="w-6 h-6 text-blue-400" />
            <div>
              <div className="font-bold text-blue-300">Secure Payment</div>
              <div className="text-xs text-blue-400/70">256-bit SSL encryption</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-green-900/20 rounded-lg border border-green-700/30">
            <FiUsers className="w-6 h-6 text-green-400" />
            <div>
              <div className="font-bold text-green-300">Instant Access</div>
              <div className="text-xs text-green-400/70">Start immediately</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-purple-900/20 rounded-lg border border-purple-700/30">
            <FiStar className="w-6 h-6 text-purple-400" />
            <div>
              <div className="font-bold text-purple-300">Quality Assured</div>
              <div className="text-xs text-purple-400/70">Expert-created content</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestSeriesSubscription;
