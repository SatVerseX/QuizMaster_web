import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

const SubscriptionContext = createContext();

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Free plan limits
  const FREE_LIMITS = {
    planType: 'free',
    name: 'Free Plan',
    maxQuestions: 5,
    aiQuestions: 2,
    canMonetize: false,
    features: [
      'Up to 5 questions per quiz', 
      'Basic quiz creation',
      'Limited AI assistance'
    ]
  };

  // Load user subscription data
  useEffect(() => {
    if (currentUser) {
      loadUserSubscription();
    } else {
      setSubscription(FREE_LIMITS);
      setLoading(false);
    }
  }, [currentUser]);

  const loadUserSubscription = () => {
    const unsubscribe = onSnapshot(
      doc(db, 'subscriptions', currentUser.uid),
      (docSnap) => {
        try {
          if (docSnap.exists()) {
            const subData = docSnap.data();
            
            // Check if subscription is still active
            if (subData.expiresAt?.toDate() > new Date() && subData.status === 'active') {
              setSubscription({
                ...subData,
                isActive: true,
                daysRemaining: Math.ceil((subData.expiresAt.toDate() - new Date()) / (1000 * 60 * 60 * 24))
              });
            } else {
              // Subscription expired or inactive
              setSubscription({
                ...FREE_LIMITS,
                expired: true,
                lastPlan: subData.planType
              });
            }
          } else {
            // No subscription found, set to free
            setSubscription(FREE_LIMITS);
          }
          setLoading(false);
          setError(null);
        } catch (err) {
          console.error('Error loading subscription:', err);
          setError('Failed to load subscription data');
          setSubscription(FREE_LIMITS);
          setLoading(false);
        }
      },
      (err) => {
        console.error('Subscription listener error:', err);
        setError('Connection error');
        setSubscription(FREE_LIMITS);
        setLoading(false);
      }
    );

    return unsubscribe;
  };

  const updateSubscription = async (subscriptionData) => {
    try {
      const docRef = doc(db, 'subscriptions', currentUser.uid);
      await setDoc(docRef, {
        ...subscriptionData,
        updatedAt: new Date(),
        userId: currentUser.uid
      }, { merge: true });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating subscription:', error);
      setError('Failed to update subscription');
      return { success: false, error: error.message };
    }
  };

  // Check if user can create quiz with given question count
  const canCreateQuiz = (questionCount) => {
    if (!subscription) return false;
    
    if (subscription.planType === 'free') {
      return questionCount <= FREE_LIMITS.maxQuestions;
    }
    
    const maxQuestions = subscription.plan?.maxQuestions || subscription.maxQuestions || 0;
    return maxQuestions === -1 || questionCount <= maxQuestions;
  };

  // Check if user can use AI features
  const canUseAI = (aiQuestionCount = 1) => {
    if (!subscription) return false;
    
    if (subscription.planType === 'free') {
      return aiQuestionCount <= FREE_LIMITS.aiQuestions;
    }
    
    const maxAI = subscription.plan?.aiQuestions || subscription.aiQuestions || 0;
    return maxAI === -1 || aiQuestionCount <= maxAI;
  };

  // Check if user can monetize quizzes
  const canMonetize = () => {
    if (!subscription) return false;
    return subscription.planType !== 'free' && (subscription.canMonetize || subscription.plan?.canMonetize);
  };

  // Get plan benefits for upgrade prompts
  const getPlanBenefits = (planType) => {
    const plans = {
      basic: {
        name: 'Basic Plan',
        price: 99,
        maxQuestions: 10,
        aiQuestions: 5,
        canMonetize: true,
        features: [
          'Up to 10 questions per quiz',
          'Basic analytics',
          'Quiz monetization',
          'Standard support'
        ]
      },
      premium: {
        name: 'Premium Plan',
        price: 299,
        maxQuestions: 50,
        aiQuestions: -1,
        canMonetize: true,
        features: [
          'Up to 50 questions per quiz',
          'Unlimited AI assistance',
          'Advanced analytics',
          'Advanced monetization',
          'Priority support'
        ]
      },
      pro: {
        name: 'Pro Plan',
        price: 599,
        maxQuestions: -1,
        aiQuestions: -1,
        canMonetize: true,
        features: [
          'Unlimited questions',
          'Unlimited AI assistance',
          'White-label solution',
          'API access',
          'Premium support'
        ]
      }
    };
    
    return plans[planType] || null;
  };

  // Get upgrade suggestions based on usage
  const getUpgradeSuggestion = (requiredQuestions, requiredAI = 0) => {
    if (canCreateQuiz(requiredQuestions) && canUseAI(requiredAI)) {
      return null; // No upgrade needed
    }

    if (requiredQuestions <= 10 && requiredAI <= 5) {
      return 'basic';
    } else if (requiredQuestions <= 50) {
      return 'premium';
    } else {
      return 'pro';
    }
  };

  const value = {
    // Subscription data
    subscription,
    loading,
    error,
    
    // Status checks
    isFreePlan: !subscription || subscription.planType === 'free',
    isPremium: subscription?.planType === 'premium' || subscription?.planType === 'pro',
    isActive: subscription?.isActive || false,
    isExpired: subscription?.expired || false,
    
    // Permission checks
    canCreateQuiz,
    canUseAI,
    canMonetize,
    
    // Actions
    updateSubscription,
    
    // Utilities
    getPlanBenefits,
    getUpgradeSuggestion,
    
    // Limits
    freeLimits: FREE_LIMITS
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

