import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { 
  FiCreditCard, 
  FiSave, 
  FiShield, 
  FiEye, 
  FiEyeOff,
  FiCheck,
  FiAlertTriangle,
  FiDollarSign,
  FiBank
} from 'react-icons/fi';
import { FaRupeeSign, FaPhoneAlt, FaUniversity } from 'react-icons/fa';

const UserPaymentSettings = ({ onClose, showModal = false }) => {
  const { currentUser } = useAuth();
  const [paymentData, setPaymentData] = useState({
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
    personalDetails: {
      panNumber: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        pincode: ''
      }
    },
    preferences: {
      preferredMethod: 'bank', // bank or upi
      autoWithdraw: false,
      minimumThreshold: 500
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSensitive, setShowSensitive] = useState(false);
  const [activeTab, setActiveTab] = useState('bank');
  const [editMode, setEditMode] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadPaymentSettings();
    setEditMode(false);
    setSuccessMsg('');
  }, [currentUser]);

  const loadPaymentSettings = async () => {
    try {
      if (!currentUser) return;

      const docRef = doc(db, 'user-payments', currentUser.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setPaymentData(prev => ({ ...prev, ...docSnap.data() }));
      }
    } catch (error) {
      console.error('Error loading payment settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg('');
    try {
      // Validate required fields
      if (activeTab === 'bank') {
        if (!paymentData.bankAccount.accountNumber || !paymentData.bankAccount.ifscCode) {
          alert('Please fill all bank account details');
          return;
        }
        
        // Validate IFSC format
        const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
        if (!ifscRegex.test(paymentData.bankAccount.ifscCode)) {
          alert('Please enter a valid IFSC code');
          return;
        }
      }

      if (activeTab === 'upi' && !paymentData.upi.upiId) {
        alert('Please enter UPI ID');
        return;
      }

      const docRef = doc(db, 'user-payments', currentUser.uid);
      await setDoc(docRef, {
        ...paymentData,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        updatedAt: new Date(),
        status: 'pending_verification'
      }, { merge: true });
      setSuccessMsg('✅ Payment settings saved successfully!');
      setEditMode(false);
      if (onClose) onClose();
    } catch (error) {
      console.error('Error saving payment settings:', error);
      alert('❌ Failed to save payment settings');
    } finally {
      setSaving(false);
    }
  };

  const validateIFSC = (ifsc) => {
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return ifscRegex.test(ifsc);
  };

  const validateUPI = (upiId) => {
    const upiRegex = /^[a-zA-Z0-9.-]{2,256}@[a-zA-Z][a-zA-Z]{2,64}$/;
    return upiRegex.test(upiId);
  };

  // UI rendering
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading payment settings...</p>
        </div>
      </div>
    );
  }

  const isVerified = paymentData.bankAccount.verified || paymentData.upi.verified;

  return (
    <div className="max-w-lg mx-auto bg-white/90 rounded-2xl shadow-xl p-6 mt-8 border border-blue-100">
      <h2 className="text-2xl font-bold mb-4 text-blue-800">Payment Details</h2>
      {successMsg && <div className="mb-4 text-green-600 font-semibold text-center">{successMsg}</div>}
      {isVerified && !editMode && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-center font-semibold">
          Your payment details are verified and saved.
        </div>
      )}
      {!editMode && (
        <div className="space-y-4">
          <div>
            <div className="font-semibold text-blue-900 mb-1">Bank Account</div>
            <div className="text-gray-700">Account Number: {paymentData.bankAccount.accountNumber || <span className="text-gray-400">Not set</span>}</div>
            <div className="text-gray-700">IFSC: {paymentData.bankAccount.ifscCode || <span className="text-gray-400">Not set</span>}</div>
            <div className="text-gray-700">Holder Name: {paymentData.bankAccount.accountHolderName || <span className="text-gray-400">Not set</span>}</div>
            <div className="text-gray-700">Bank Name: {paymentData.bankAccount.bankName || <span className="text-gray-400">Not set</span>}</div>
          </div>
          <div>
            <div className="font-semibold text-blue-900 mb-1">UPI</div>
            <div className="text-gray-700">UPI ID: {paymentData.upi.upiId || <span className="text-gray-400">Not set</span>}</div>
          </div>
          <div>
            <div className="font-semibold text-blue-900 mb-1">Personal Details</div>
            <div className="text-gray-700">PAN: {paymentData.personalDetails.panNumber || <span className="text-gray-400">Not set</span>}</div>
            <div className="text-gray-700">Phone: {paymentData.personalDetails.phone || <span className="text-gray-400">Not set</span>}</div>
            <div className="text-gray-700">Address: {paymentData.personalDetails.address.street}, {paymentData.personalDetails.address.city}, {paymentData.personalDetails.address.state}, {paymentData.personalDetails.address.pincode}</div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition-all"
              onClick={() => setEditMode(true)}
            >
              Edit Details
            </button>
          </div>
        </div>
      )}
      {editMode && (
        <div className="space-y-4">
          {/* Bank Account Fields */}
          <div>
            <div className="font-semibold text-blue-900 mb-1">Bank Account</div>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 mb-2"
              placeholder="Account Number"
              value={paymentData.bankAccount.accountNumber}
              onChange={e => setPaymentData({ ...paymentData, bankAccount: { ...paymentData.bankAccount, accountNumber: e.target.value } })}
            />
            <input
              type="text"
              className="w-full border rounded px-3 py-2 mb-2"
              placeholder="IFSC Code"
              value={paymentData.bankAccount.ifscCode}
              onChange={e => setPaymentData({ ...paymentData, bankAccount: { ...paymentData.bankAccount, ifscCode: e.target.value } })}
            />
            <input
              type="text"
              className="w-full border rounded px-3 py-2 mb-2"
              placeholder="Account Holder Name"
              value={paymentData.bankAccount.accountHolderName}
              onChange={e => setPaymentData({ ...paymentData, bankAccount: { ...paymentData.bankAccount, accountHolderName: e.target.value } })}
            />
            <input
              type="text"
              className="w-full border rounded px-3 py-2 mb-2"
              placeholder="Bank Name"
              value={paymentData.bankAccount.bankName}
              onChange={e => setPaymentData({ ...paymentData, bankAccount: { ...paymentData.bankAccount, bankName: e.target.value } })}
            />
          </div>
          {/* UPI Fields */}
          <div>
            <div className="font-semibold text-blue-900 mb-1">UPI</div>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 mb-2"
              placeholder="UPI ID"
              value={paymentData.upi.upiId}
              onChange={e => setPaymentData({ ...paymentData, upi: { ...paymentData.upi, upiId: e.target.value } })}
            />
          </div>
          {/* Personal Details Fields */}
          <div>
            <div className="font-semibold text-blue-900 mb-1">Personal Details</div>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 mb-2"
              placeholder="PAN Number"
              value={paymentData.personalDetails.panNumber}
              onChange={e => setPaymentData({ ...paymentData, personalDetails: { ...paymentData.personalDetails, panNumber: e.target.value } })}
            />
            <input
              type="text"
              className="w-full border rounded px-3 py-2 mb-2"
              placeholder="Phone"
              value={paymentData.personalDetails.phone}
              onChange={e => setPaymentData({ ...paymentData, personalDetails: { ...paymentData.personalDetails, phone: e.target.value } })}
            />
            <input
              type="text"
              className="w-full border rounded px-3 py-2 mb-2"
              placeholder="Street"
              value={paymentData.personalDetails.address.street}
              onChange={e => setPaymentData({ ...paymentData, personalDetails: { ...paymentData.personalDetails, address: { ...paymentData.personalDetails.address, street: e.target.value } } })}
            />
            <input
              type="text"
              className="w-full border rounded px-3 py-2 mb-2"
              placeholder="City"
              value={paymentData.personalDetails.address.city}
              onChange={e => setPaymentData({ ...paymentData, personalDetails: { ...paymentData.personalDetails, address: { ...paymentData.personalDetails.address, city: e.target.value } } })}
            />
            <input
              type="text"
              className="w-full border rounded px-3 py-2 mb-2"
              placeholder="State"
              value={paymentData.personalDetails.address.state}
              onChange={e => setPaymentData({ ...paymentData, personalDetails: { ...paymentData.personalDetails, address: { ...paymentData.personalDetails.address, state: e.target.value } } })}
            />
            <input
              type="text"
              className="w-full border rounded px-3 py-2 mb-2"
              placeholder="Pincode"
              value={paymentData.personalDetails.address.pincode}
              onChange={e => setPaymentData({ ...paymentData, personalDetails: { ...paymentData.personalDetails, address: { ...paymentData.personalDetails.address, pincode: e.target.value } } })}
            />
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button
              className="bg-gray-300 text-gray-700 px-5 py-2 rounded-lg font-semibold shadow hover:bg-gray-400 transition-all"
              onClick={() => { setEditMode(false); setSuccessMsg(''); }}
              type="button"
            >
              Cancel
            </button>
            <button
              className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition-all"
              onClick={handleSave}
              disabled={saving}
              type="button"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  if (showModal) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-gray-600/40 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default UserPaymentSettings;
