import axios from 'axios';
import { auth } from '../lib/firebase';

// Normalize API base URL to avoid double slashes and ensure '/api' prefix exists
function normalizeApiBase(rawBase) {
  try {
    const defaultBase = 'https://backend-quiz-glw23gnc5-satish-pals-projects.vercel.app';
    let base = (rawBase || defaultBase).trim();
    // Remove trailing slashes
    base = base.replace(/\/+$/, '');
    // Ensure '/api' prefix present
    if (!/\/api$/i.test(base)) {
      // If base already contains '/api/' somewhere at the end, leave it
      if (!/\/api$/i.test(base) && !/\/api$/i.test(base.split('/').slice(-1)[0])) {
        base = `${base}/api`;
      }
    }
    return base;
  } catch (_e) {
    return 'https://backend-quiz-glw23gnc5-satish-pals-projects.vercel.app/api';
  }
}

const API_BASE = normalizeApiBase(import.meta.env.VITE_BACKEND_URL);

export class PaymentService {
  
  // ==================== UTILITY METHODS ====================
  
  static async getAuthToken() {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      const token = await currentUser.getIdToken();
      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      throw new Error('Authentication failed');
    }
  }
  
  static loadRazorpayScript() {
    return new Promise((resolve) => {
      // Check if already loaded
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  static handleApiError(error) {
    console.error('PaymentService Error:', error);
    
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || 'Server error occurred';
      throw new Error(message);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network error. Please check your connection.');
    } else {
      // Something else happened
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }

  // ==================== TEST SERIES SUBSCRIPTION METHODS ====================
  
  static async createTestSeriesOrder(data) {
    try {
      const {
        testSeriesId,
        testSeriesTitle,
        price,
        creatorId,
        creatorName,
        userId,
        userEmail
      } = data;

      const token = await this.getAuthToken();

      const response = await axios.post(`${API_BASE}/payment/create-series-order`, {
        testSeriesId,
        testSeriesTitle,
        price,
        userId,
        userEmail
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  static async verifyTestSeriesSubscription(paymentData) {
    try {
      const {
        orderId,
        paymentId,
        signature,
        testSeriesId,
        userId
      } = paymentData;

      const token = await this.getAuthToken();

      const response = await axios.post(`${API_BASE}/payment/verify-series-subscription`, {
        orderId,
        paymentId,
        signature,
        testSeriesId,
        userId
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  // ==================== LEGACY SUBSCRIPTION METHODS (if needed) ====================
  
  static async getPlans() {
    try {
      const response = await axios.get(`${API_BASE}/payment/plans`);
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  static async createRazorpayOrder(planType, userEmail, userName) {
    try {
      const token = await this.getAuthToken();
      
      const response = await axios.post(`${API_BASE}/payment/create-order`, {
        planType,
        userEmail,
        userName
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  static async verifyRazorpayPayment(paymentData) {
    try {
      const token = await this.getAuthToken();
      
      const response = await axios.post(`${API_BASE}/payment/verify-payment`, paymentData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  // ==================== TEST SERIES MANAGEMENT METHODS ====================
  
  static async getTestSeriesAnalytics(seriesId) {
    try {
      const token = await this.getAuthToken();
      
      const response = await axios.get(`${API_BASE}/payment/series-analytics/${seriesId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  static async getCreatorEarnings() {
    // Deprecated
    return { success: false, message: 'Creator earnings feature has been removed.' };
  }

  static async requestPayout() {
    // Deprecated
    return { success: false, message: 'Payout feature has been removed.' };
  }

  // ==================== SUBSCRIPTION STATUS METHODS ====================
  
  static async getUserSubscriptions(userId) {
    try {
      const token = await this.getAuthToken();
      
      const response = await axios.get(`${API_BASE}/payment/user-subscriptions/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  static async checkSeriesAccess(userId, seriesId) {
    try {
      const token = await this.getAuthToken();
      
      const response = await axios.get(`${API_BASE}/payment/check-access/${userId}/${seriesId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  // ==================== PRICING VALIDATION METHODS ====================
  
  static async validateSeriesPrice(price) {
    try {
      const token = await this.getAuthToken();
      
      const response = await axios.post(`${API_BASE}/payment/validate-series-price`, {
        price
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  static calculateEarningsBreakdown(price) {
    const creatorPercentage = 70;
    const platformPercentage = 30;
    
    const creatorEarning = Math.floor(price * (creatorPercentage / 100));
    const platformFee = price - creatorEarning;
    
    return {
      totalPrice: price,
      creatorEarning,
      platformFee,
      creatorPercentage,
      platformPercentage
    };
  }

  // ==================== REFUND METHODS ====================
  
  static async requestRefund(refundData) {
    try {
      const {
        paymentId,
        orderId,
        amount,
        reason,
        userId
      } = refundData;

      const token = await this.getAuthToken();
      
      const response = await axios.post(`${API_BASE}/payment/request-refund`, {
        paymentId,
        orderId,
        amount,
        reason,
        userId
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  static async getRefundStatus(refundId) {
    try {
      const token = await this.getAuthToken();
      
      const response = await axios.get(`${API_BASE}/payment/refund-status/${refundId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  // ==================== ANALYTICS METHODS ====================
  
  static async getPlatformAnalytics(dateRange = null) {
    try {
      const params = dateRange ? { dateRange } : {};
      const token = await this.getAuthToken();
      
      const response = await axios.get(`${API_BASE}/payment/platform-analytics`, { 
        params,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  static async getSeriesPerformance(seriesId, dateRange = null) {
    try {
      const params = dateRange ? { dateRange } : {};
      const token = await this.getAuthToken();
      
      const response = await axios.get(`${API_BASE}/payment/series-performance/${seriesId}`, { 
        params,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  // ==================== WEBHOOKS & NOTIFICATIONS ====================
  
  static async registerWebhook(webhookData) {
    try {
      const token = await this.getAuthToken();
      
      const response = await axios.post(`${API_BASE}/payment/register-webhook`, webhookData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  // ==================== PAYMENT HISTORY METHODS ====================
  
  static async getUserPaymentHistory(userId, limit = 10, offset = 0) {
    try {
      const token = await this.getAuthToken();
      
      const response = await axios.get(`${API_BASE}/payment/user-history/${userId}`, {
        params: { limit, offset },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  static async getCreatorPaymentHistory(creatorId, limit = 10, offset = 0) {
    // Deprecated
    return { success: false, message: 'Creator history feature has been removed.' };
  }

  // ==================== DISCOUNT & COUPON METHODS ====================
  
  static async validateCoupon(couponCode, seriesId) {
    try {
      const token = await this.getAuthToken();
      
      const response = await axios.post(`${API_BASE}/payment/validate-coupon`, {
        couponCode,
        seriesId
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  static async applyCoupon(couponCode, seriesId, userId) {
    try {
      const token = await this.getAuthToken();
      
      const response = await axios.post(`${API_BASE}/payment/apply-coupon`, {
        couponCode,
        seriesId,
        userId
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  // ==================== BULK OPERATIONS ====================
  
  static async bulkSubscribe(subscriptionData) {
    try {
      const token = await this.getAuthToken();
      
      const response = await axios.post(`${API_BASE}/payment/bulk-subscribe`, subscriptionData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  // ==================== HEALTH CHECK ====================
  
  static async healthCheck() {
    try {
      const response = await axios.get(`${API_BASE}/payment/health`);
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  // ==================== CONFIGURATION METHODS ====================
  
  static async getPaymentConfig() {
    try {
      const token = await this.getAuthToken();
      
      const response = await axios.get(`${API_BASE}/payment/config`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  // ==================== UTILITY HELPERS ====================
  
  static formatCurrency(amount, currency = 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount || 0);
  }

  static validatePaymentData(data) {
    const required = ['orderId', 'paymentId', 'signature'];
    const missing = required.filter(field => !data[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required payment data: ${missing.join(', ')}`);
    }
    
    return true;
  }

  static generateReceiptId(prefix = 'receipt') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}_${timestamp}_${random}`;
  }

  // ==================== RETRY MECHANISM ====================
  
  static async withRetry(operation, maxRetries = 3, delay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        
        console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }

  // ==================== PAYMENT METHOD HELPERS ====================
  
  static getAvailablePaymentMethods() {
    return [
      {
        id: 'card',
        name: 'Credit/Debit Card',
        icon: '💳',
        description: 'Visa, Mastercard, Rupay'
      },
      {
        id: 'upi',
        name: 'UPI',
        icon: '📱',
        description: 'PhonePe, Google Pay, Paytm'
      },
      {
        id: 'netbanking',
        name: 'Net Banking',
        icon: '🏦',
        description: 'All major banks'
      },
      {
        id: 'wallet',
        name: 'Digital Wallets',
        icon: '💰',
        description: 'Paytm, Mobikwik, etc.'
      }
    ];
  }

  // ==================== ERROR HANDLING HELPERS ====================
  
  static getErrorMessage(error) {
    const errorMessages = {
      'PAYMENT_FAILED': 'Payment failed. Please try again.',
      'INVALID_AMOUNT': 'Invalid payment amount.',
      'NETWORK_ERROR': 'Network error. Please check your connection.',
      'TIMEOUT': 'Payment timeout. Please try again.',
      'CANCELLED': 'Payment was cancelled by user.',
      'INSUFFICIENT_FUNDS': 'Insufficient funds in account.',
      'CARD_DECLINED': 'Card declined by bank.',
      'INVALID_CARD': 'Invalid card details.',
      'EXPIRED_CARD': 'Card has expired.',
      'LIMIT_EXCEEDED': 'Transaction limit exceeded.'
    };

    return errorMessages[error.code] || error.message || 'An unexpected error occurred';
  }

  // ==================== LOGGING HELPERS ====================
  
  static logPaymentEvent(event, data) {
    if (import.meta.env.DEV) {
      console.log(`[PaymentService] ${event}:`, data);
    }
    
    // In production, you might want to send this to an analytics service
    // analytics.track(event, data);
  }
}

// ==================== PAYMENT CONSTANTS ====================
export const PAYMENT_CONSTANTS = {
  MIN_SERIES_PRICE: 49,
  MAX_SERIES_PRICE: 9999,
  CREATOR_SHARE_PERCENTAGE: 70,
  PLATFORM_FEE_PERCENTAGE: 30,
  CURRENCIES: {
    INR: 'Indian Rupee',
    USD: 'US Dollar'
  },
  PAYMENT_METHODS: {
    CARD: 'card',
    UPI: 'upi',
    NETBANKING: 'netbanking',
    WALLET: 'wallet'
  },
  PAYMENT_STATUS: {
    PENDING: 'pending',
    SUCCESS: 'success',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded'
  }
};

// ==================== PAYMENT UTILITIES ====================
export const PaymentUtils = {
  calculateGST: (amount, rate = 18) => {
    const gst = Math.floor(amount * (rate / 100));
    return {
      amount,
      gst,
      total: amount + gst
    };
  },

  validateIndianMobile: (mobile) => {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(mobile);
  },

  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  generateOrderId: () => {
    return `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  },

  formatDate: (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

// Default export
export default PaymentService;
