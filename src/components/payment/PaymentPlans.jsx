import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { PaymentService } from '../../services/paymentService';
import usePopup from '../../hooks/usePopup';
import BeautifulPopup from '../common/BeautifulPopup';
import { 
  FiCheck, 
  FiStar, 
  FiZap, 
  FiCreditCard, 
  FiSmartphone,
  FiDollarSign,
  FiShield,
  FiClock
} from 'react-icons/fi';

const PaymentPlans = ({ onSuccess, onCancel, requiredPlan = null }) => {
  const { currentUser } = useAuth();
  const { subscription, updateSubscription } = useSubscription();
  const { popupState, showError, showSuccess, hidePopup } = usePopup();
  const [plans, setPlans] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await PaymentService.getPlans();
      setPlans(response.plans);
    } catch (error) {
      console.error('Error loading plans:', error);
    }
  };

  const handleRazorpayPayment = async (planType) => {
    setLoading(true);
    setSelectedPlan(planType);
    
    try {
      // Load Razorpay script
      const scriptLoaded = await PaymentService.loadRazorpayScript();
      if (!scriptLoaded) {
        showError('Razorpay SDK failed to load. Please check your internet connection.', 'Connection Error');
        return;
      }

      // Create order
      const orderData = await PaymentService.createRazorpayOrder(
        planType,
        currentUser.email,
        currentUser.displayName || currentUser.email
      );

      // Razorpay options
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'QuizMaster',
        description: `${orderData.plan.name} Subscription`,
        image: '/logo192.png', // Your app logo
        order_id: orderData.orderId,
        
        // Payment success handler
        handler: async function (response) {
          try {
            const verificationResult = await PaymentService.verifyRazorpayPayment({
              orderId: orderData.orderId,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              planType,
              userEmail: currentUser.email,
              userId: currentUser.uid
            });

            if (verificationResult.success) {
              await updateSubscription(verificationResult.subscription);
              onSuccess && onSuccess(verificationResult.subscription);
              
              // Show success message
              showSuccess(`Welcome to ${orderData.plan.name}!`, 'Payment Successful');
            } else {
              showError('Payment verification failed. Please contact support.', 'Verification Failed');
            }
          } catch (error) {
            console.error('Payment verification failed:', error);
            showError('Payment verification failed. Please contact support.', 'Verification Failed');
          }
        },

        // Payment method options
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
          emi: true
        },

        // Prefill user data
        prefill: {
          name: currentUser.displayName || '',
          email: currentUser.email,
          contact: currentUser.phoneNumber || ''
        },

        // Notes for reference
        notes: {
          address: 'QuizMaster Subscription',
          merchant_order_id: orderData.orderId
        },

        // Theme customization
        theme: {
          color: '#3B82F6',
          backdrop_color: 'rgba(0,0,0,0.7)'
        },

        // Payment modal options
        modal: {
          ondismiss: function() {
            setLoading(false);
            setSelectedPlan(null);
          },
          // Escape key handling
          escape: true,
          // Animation
          animation: true
        },

        // Remember customer
        remember_customer: true
      };

      const razorpay = new window.Razorpay(options);
      
      // Open payment modal
      razorpay.open();
      
    } catch (error) {
      console.error('Payment error:', error);
      showError('Payment failed. Please try again.', 'Payment Error');
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  const PlanCard = ({ planKey, plan, isPopular = false, isRequired = false }) => {
    const isCurrentPlan = subscription?.planType === planKey;
    const isProcessing = loading && selectedPlan === planKey;

    return (
      <div className={`relative p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
        isPopular 
          ? 'border-blue-500 bg-gradient-to-br from-white to-white dark:from-blue-900/20 dark:to-indigo-900/20 shadow-xl' 
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-600'
      }`}>
        
        {/* Popular Badge */}
        {isPopular && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
              <FiStar className="w-4 h-4" />
              Most Popular
            </div>
          </div>
        )}

        {/* Required Badge */}
        {isRequired && (
          <div className="absolute -top-4 right-4">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              Required
            </div>
          </div>
        )}

        {/* Plan Header */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {plan.name}
          </h3>
          <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1 flex items-center justify-center gap-1">
            <FiDollarSign className="w-8 h-8" />
            ₹{plan.price}
          </div>
          <p className="text-gray-500 dark:text-gray-400">per month</p>
        </div>

        {/* Features */}
        <div className="space-y-4 mb-8">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <FiCheck className="w-3 h-3 text-white" />
              </div>
              <span className="text-gray-700 dark:text-gray-300">{feature}</span>
            </div>
          ))}
        </div>

        {/* Payment Button */}
        {isCurrentPlan ? (
          <div className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 py-4 px-4 rounded-xl text-center font-bold border-2 border-green-300 dark:border-green-700">
            <FiCheck className="w-5 h-5 inline mr-2" />
            Current Plan
          </div>
        ) : (
          <button
            onClick={() => handleRazorpayPayment(planKey)}
            disabled={loading}
            className={`w-full py-4 px-6 rounded-xl font-bold text-white transition-all duration-300 relative overflow-hidden ${
              isPopular
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg'
                : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800'
            } ${
              loading 
                ? 'opacity-75 cursor-not-allowed' 
                : 'hover:scale-105 shadow-lg hover:shadow-xl transform'
            }`}
          >
            {/* Loading Spinner */}
            {isProcessing && (
              <div className="absolute inset-0 bg-white bg-opacity-20 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
              </div>
            )}
            
            {/* Button Content */}
            <div className="flex items-center justify-center gap-2">
              <FiCreditCard className="w-5 h-5" />
              {isProcessing ? 'Processing...' : 'Pay with Razorpay'}
            </div>
          </button>
        )}

        {/* Payment Methods Info */}
        {!isCurrentPlan && (
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Supports all payment methods:
            </p>
            <div className="flex justify-center items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <FiCreditCard className="w-3 h-3" />
                Cards
              </span>
              <span className="flex items-center gap-1">
                <FiSmartphone className="w-3 h-3" />
                UPI
              </span>
              <span>NetBanking</span>
              <span>Wallets</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
          Choose Your Plan
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {requiredPlan 
            ? `Unlock ${requiredPlan} features to continue creating amazing quizzes`
            : 'Unlock advanced features and create unlimited quizzes with AI assistance'
          }
        </p>
      </div>

      {/* Payment Security Info */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-center gap-8 text-center">
          <div className="flex items-center gap-2">
            <FiShield className="w-6 h-6 text-green-600" />
            <span className="font-medium text-green-800 dark:text-green-200">
              Secure Payment
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FiClock className="w-6 h-6 text-green-600" />
            <span className="font-medium text-green-800 dark:text-green-200">
              Instant Activation
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FiCheck className="w-6 h-6 text-green-600" />
            <span className="font-medium text-green-800 dark:text-green-200">
              30-Day Guarantee
            </span>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {Object.entries(plans).map(([planKey, plan]) => (
          <PlanCard
            key={planKey}
            planKey={planKey}
            plan={plan}
            isPopular={planKey === 'premium'}
            isRequired={requiredPlan === planKey}
          />
        ))}
      </div>

      {/* Payment Methods Showcase */}
      <div className="text-center mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Supported Payment Methods
        </h3>
        <div className="flex justify-center items-center gap-8 flex-wrap">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <FiCreditCard className="w-8 h-8" />
            <span>Credit/Debit Cards</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <FiSmartphone className="w-8 h-8" />
            <span>UPI (PhonePe, Google Pay, Paytm)</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <FiDollarSign className="w-8 h-8" />
            <span>Net Banking</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <FiZap className="w-8 h-8" />
            <span>Digital Wallets</span>
          </div>
        </div>
      </div>

      {/* Money-back Guarantee */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 px-8 py-4 rounded-full shadow-lg">
          <FiShield className="w-6 h-6" />
          <span className="font-bold text-lg">30-day money-back guarantee</span>
        </div>
      </div>

      {/* Cancel Button */}
      {onCancel && (
        <div className="text-center mt-8">
          <button
            onClick={onCancel}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium text-lg px-6 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
          >
            Continue with Free Plan
          </button>
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

export default PaymentPlans;
