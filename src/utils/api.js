// utils/api.js
import { auth } from './firebase'; // your Firebase config

const getAuthToken = async () => {
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  throw new Error('User not authenticated');
};

const apiCall = async (url, options = {}) => {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Usage examples
export const createSubscriptionOrder = async (planId) => {
  return apiCall('/api/payment/create-subscription-order', {
    method: 'POST',
    body: JSON.stringify({ planId }),
  });
};

export const getUserProfile = async () => {
  return apiCall('/api/payment/profile');
};

export const getPurchaseHistory = async () => {
  return apiCall('/api/payment/purchase-history');
};
