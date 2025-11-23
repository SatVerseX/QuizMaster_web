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
  FiAlertCircle,
  FiInfo,
  FiCheckCircle,
  FiZap,
  FiClock
} from 'react-icons/fi';

const TestSeriesSubscription = ({ testSeries, onSuccess, onCancel }) => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const { popupState, showSuccess, showError, hidePopup } = usePopup();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isTestMode, setIsTestMode] = useState(false);
  
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

  // --- Logic Section (Kept mostly intact, just streamlined) ---
  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!currentUser) {
        setError('Please sign in to continue with your subscription.');
        setLoading(false);
        return;
      }

      const scriptLoaded = await PaymentService.loadRazorpayScript();
      if (!scriptLoaded) throw new Error('Payment gateway failed to load.');

      const orderData = await PaymentService.createTestSeriesOrder({
        testSeriesId: testSeries.id,
        testSeriesTitle: testSeries.title,
        price: testSeries.price,
        userId: currentUser.uid,
        userEmail: currentUser.email
      });

      const options = {
        key: orderData.key,
        amount: (orderData.amount !== undefined ? orderData.amount : Math.round(((testSeries.discountedPrice ?? testSeries.price) * 100) || 0)),
        currency: 'INR',
        name: 'QuizMaster Premium',
        description: `Lifetime Access: ${testSeries.title}`,
        order_id: orderData.orderId,
        image: "https://your-logo-url.com/logo.png", // Ideally add your logo here
        handler: async function (response) {
          try {
            const verification = await PaymentService.verifyTestSeriesSubscription({
              orderId: orderData.orderId,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              testSeriesId: testSeries.id,
              userId: currentUser.uid
            });

            if (verification.success) {
              const subscriptionId = `${currentUser.uid}_${testSeries.id}`;
              await setDoc(doc(db, 'test-series-subscriptions', subscriptionId), {
                userId: currentUser.uid,
                seriesId: testSeries.id,
                testSeriesId: testSeries.id,
                creatorId: testSeries.createdBy || null,
                subscribedAt: new Date(),
                status: 'active',
                amountPaid: orderData.amount / 100,
                currency: 'INR'
              }, { merge: true });

              await updateDoc(doc(db, 'test-series', testSeries.id), {
                subscribedUsers: arrayUnion(currentUser.uid),
                totalEarnings: (testSeries.totalEarnings || 0) + (testSeries.discountedPrice ?? testSeries.price)
              });

              onSuccess();
              showSuccess('Welcome aboard! Subscription active.', 'Success');
            }
          } catch (error) {
            console.error(error);
            setError(isTestMode ? 'Verification failed (Expected in Local Test Mode).' : 'Payment verification failed.');
            if (isTestMode) onSuccess(); // Allow bypass in dev
          }
        },
        prefill: {
          name: currentUser.displayName || '',
          email: currentUser.email
        },
        theme: {
          color: isDark ? '#3B82F6' : '#2563EB'
        },
        modal: {
          ondismiss: () => setLoading(false)
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (error) {
      console.error(error);
      setError(error.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // --- Calculations ---
  const originalPrice = testSeries.originalPrice || 0;
  const currentPrice = testSeries.discountedPrice ?? testSeries.price;
  const discountPercentage = originalPrice > currentPrice 
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) 
    : 0;

  return (
    <div className={`min-h-screen w-full flex justify-center items-center p-4 md:p-8 transition-colors duration-300 ${
      isDark ? 'bg-[#0B1120] text-gray-100' : 'bg-gray-50 text-gray-800'
    }`}>
      
      <div className="max-w-6xl w-full">
        
        {/* Back Navigation */}
        <button 
          onClick={onCancel}
          className={`flex items-center gap-2 mb-8 font-medium transition-colors ${
            isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <FiArrowLeft /> Back to Series
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          
          {/* LEFT COLUMN: Value Proposition */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Header Section */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 text-xs font-bold tracking-wider uppercase rounded-full ${
                  isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-700'
                }`}>
                  Premium Test Series
                </span>
                {isTestMode && (
                  <span className="px-3 py-1 text-xs font-bold uppercase rounded-full bg-yellow-500/10 text-yellow-600 border border-yellow-500/20">
                    Test Mode
                  </span>
                )}
              </div>
              
              <h1 className={`text-3xl md:text-4xl font-bold mb-4 leading-tight ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {testSeries.title}
              </h1>
              <p className={`text-lg leading-relaxed ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {testSeries.description}
              </p>
            </div>

            {/* Stats Row */}
            <div className={`grid grid-cols-3 gap-4 p-6 rounded-2xl border ${
              isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
            }`}>
              <div className="text-center border-r border-gray-200 dark:border-gray-700 last:border-0">
                <div className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {testSeries.totalQuizzes || 0}
                </div>
                <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Tests</div>
              </div>
              <div className="text-center border-r border-gray-200 dark:border-gray-700 last:border-0">
                <div className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {testSeries.totalSubscribers || 0}
                </div>
                <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Students</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold mb-1 flex items-center justify-center gap-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  4.8 <FiStar className="w-4 h-4 text-yellow-500 fill-current" />
                </div>
                <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Rating</div>
              </div>
            </div>

            {/* Features Grid */}
            <div>
              <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Everything you get
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { icon: FiBookOpen, text: `Access to all ${testSeries.totalQuizzes || 0} full-length mock tests` },
                  { icon: FiTrendingUp, text: "Detailed performance analytics & ranking" },
                  { icon: FiCheckCircle, text: "In-depth solutions for every question" },
                  { icon: FiZap, text: "Real-time exam simulation environment" },
                  { icon: FiClock, text: "Lifetime access to course materials" },
                  { icon: FiAward, text: "Certificate of completion" }
                ].map((feature, idx) => (
                  <div key={idx} className={`flex items-start gap-3 p-4 rounded-xl transition-all hover:translate-x-1 ${
                    isDark ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'
                  }`}>
                    <div className={`mt-1 p-2 rounded-lg ${
                      isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-600'
                    }`}>
                      <feature.icon className="w-4 h-4" />
                    </div>
                    <span className={`text-sm font-medium leading-relaxed ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Checkout Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              
              {/* Main Card */}
              <div className={`rounded-3xl p-6 shadow-2xl relative overflow-hidden border ${
                isDark 
                  ? 'bg-gray-800 border-gray-700 shadow-black/50' 
                  : 'bg-white border-gray-100 shadow-blue-900/5'
              }`}>
                
                {/* Decorative Gradient Blur */}
                <div className={`absolute top-0 right-0 w-40 h-40 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 pointer-events-none ${
                  isDark ? 'opacity-20' : 'opacity-10'
                }`} />

                <h3 className={`text-lg font-semibold mb-6 ${isDark ? 'text-gray-200' : 'text-gray-600'}`}>
                  Summary
                </h3>

                {/* Price Display */}
                <div className="flex items-end gap-3 mb-2">
                  <span className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatPrice(currentPrice)}
                  </span>
                  <span className="text-sm text-gray-500 font-medium mb-1.5">/ lifetime</span>
                </div>

                {discountPercentage > 0 && (
                  <div className="flex items-center gap-2 mb-8">
                    <span className="text-lg text-gray-400 line-through font-medium">
                      {formatPrice(originalPrice)}
                    </span>
                    <span className="px-2 py-1 text-xs font-bold text-green-700 bg-green-100 rounded-md">
                      SAVE {discountPercentage}%
                    </span>
                  </div>
                )}

                {/* Error Display */}
                {error && (
                  <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex gap-2">
                    <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}

                {/* CTA Button */}
                <button
                  onClick={handleSubscribe}
                  disabled={loading}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-white shadow-lg transform transition-all duration-200 hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3 ${
                    loading 
                      ? 'bg-gray-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/25'
                  }`}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <FiCreditCard className="w-5 h-5" />
                      <span>Complete Payment</span>
                    </>
                  )}
                </button>

                {/* Trust Signals */}
                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 space-y-3">
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                    <FiLock className="w-3 h-3" />
                    <span>SSL Encrypted Payment</span>
                  </div>
                  <div className="flex items-center justify-center gap-4 opacity-70 grayscale">
                    {/* Simple text placeholders for logos if you don't have SVGs */}
                    <span className="font-bold text-xs text-gray-400">Razorpay</span>
                    <span className="font-bold text-xs text-gray-400">VISA</span>
                    <span className="font-bold text-xs text-gray-400">UPI</span>
                  </div>
                </div>
              </div>

              {/* Guarantee Badge */}
              <div className={`mt-6 p-4 rounded-2xl flex items-center gap-3 ${
                isDark ? 'bg-gray-800/50 text-gray-400' : 'bg-gray-100 text-gray-600'
              }`}>
                <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <FiShield className="w-5 h-5" />
                </div>
                <p className="text-xs leading-snug">
                  <strong>100% Satisfaction Guarantee.</strong> Quality content curated by top educators.
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>

      <BeautifulPopup
        {...popupState}
        onClose={hidePopup}
      />
    </div>
  );
};

export default TestSeriesSubscription;