import React, { useState, useEffect } from 'react';
import { collection, addDoc, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { examCategories } from '../../utils/constants/examCategories';
import { 
  FiPlus, 
  FiDollarSign, 
  FiToggleLeft, 
  FiToggleRight,
  FiSave,
  FiArrowLeft,
  FiBookOpen,
  FiTag,
  FiClock,
  FiUsers,
  FiCheck,
  FiAlertCircle,
  FiCreditCard,
  FiBriefcase,
  FiRefreshCw,
  FiAlertTriangle,
  FiLock
} from 'react-icons/fi';

const TestSeriesCreator = ({ onBack, onSeriesCreated }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Basic Info, 2: Pricing & Payments
  const [creatorProfile, setCreatorProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [paymentMethodLoaded, setPaymentMethodLoaded] = useState(false);
  
  const [seriesData, setSeriesData] = useState({
    title: '',
    description: '',
    category: 'education',
    examCategory: '',
    examSubcategory: '',
    difficulty: 'medium',
    estimatedDuration: 60,
    tags: [],
    isPaid: false,
    price: 299,
    quizzes: [],
    coverImageUrl: '', // New field for cover image
    paymentMethod: {
      type: 'bank', // 'bank' or 'upi'
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
      syncWithProfile: true
    }
  });

  const categories = [
    { value: 'education', label: '📚 Education' },
    { value: 'competitive', label: '🏆 Competitive Exams' },
    { value: 'programming', label: '💻 Programming' },
    { value: 'business', label: '💼 Business' },
    { value: 'science', label: '🔬 Science' },
    { value: 'language', label: '🗣️ Language' }
  ];

  const difficulties = [
    { value: 'easy', label: 'Easy', color: 'green' },
    { value: 'medium', label: 'Medium', color: 'yellow' },
    { value: 'hard', label: 'Hard', color: 'red' }
  ];
  
  // Load creator profile data
  useEffect(() => {
    const loadCreatorProfile = async () => {
      if (!currentUser) return;
      
      setLoadingProfile(true);
      try {
        const profileRef = doc(db, 'creator-profiles', currentUser.uid);
        const profileSnap = await getDoc(profileRef);
        
        if (profileSnap.exists()) {
          const profileData = profileSnap.data();
          setCreatorProfile(profileData);
          
          // If sync is enabled, update seriesData with profile payment details
          if (seriesData.paymentMethod.syncWithProfile && !paymentMethodLoaded) {
            setSeriesData(prev => ({
              ...prev,
              paymentMethod: {
                ...prev.paymentMethod,
                bankAccount: profileData.paymentDetails?.bankAccount || prev.paymentMethod.bankAccount,
                upi: profileData.paymentDetails?.upi || prev.paymentMethod.upi,
              }
            }));
            setPaymentMethodLoaded(true);
          }
        }
      } catch (error) {
        console.error('Error loading creator profile:', error);
      } finally {
        setLoadingProfile(false);
      }
    };
    
    loadCreatorProfile();
  }, [currentUser, seriesData.paymentMethod.syncWithProfile]);

  const handleInputChange = (field, value) => {
    setSeriesData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handlePaymentMethodChange = (field, value) => {
    setSeriesData(prev => ({
      ...prev,
      paymentMethod: {
        ...prev.paymentMethod,
        [field]: value
      }
    }));
  };
  
  const handleBankDetailsChange = (field, value) => {
    setSeriesData(prev => ({
      ...prev,
      paymentMethod: {
        ...prev.paymentMethod,
        bankAccount: {
          ...prev.paymentMethod.bankAccount,
          [field]: value
        }
      }
    }));
  };
  
  const handleUPIDetailsChange = (field, value) => {
    setSeriesData(prev => ({
      ...prev,
      paymentMethod: {
        ...prev.paymentMethod,
        upi: {
          ...prev.paymentMethod.upi,
          [field]: value
        }
      }
    }));
  };
  
  const handleSyncWithProfileChange = async () => {
    const newSyncValue = !seriesData.paymentMethod.syncWithProfile;
    
    setSeriesData(prev => ({
      ...prev,
      paymentMethod: {
        ...prev.paymentMethod,
        syncWithProfile: newSyncValue
      }
    }));
    
    if (newSyncValue && creatorProfile) {
      // Load from profile
      setSeriesData(prev => ({
        ...prev,
        paymentMethod: {
          ...prev.paymentMethod,
          bankAccount: creatorProfile.paymentDetails?.bankAccount || prev.paymentMethod.bankAccount,
          upi: creatorProfile.paymentDetails?.upi || prev.paymentMethod.upi,
        }
      }));
    }
  };

  const handleTagAdd = (tag) => {
    if (tag && !seriesData.tags.includes(tag)) {
      setSeriesData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setSeriesData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleCreateSeries = async () => {
    setLoading(true);
    try {
      const testSeriesData = {
        ...seriesData,
        createdBy: currentUser.uid,
        createdByName: currentUser.displayName || currentUser.email,
        createdAt: new Date(),
        
        // Initialize subscription data
        subscribedUsers: [],
        totalSubscribers: 0,
        totalEarnings: 0,
        totalQuizzes: 0,
        
        // Settings
        isActive: true,
        isPublished: true,
        currency: 'INR'
      };

      const docRef = await addDoc(collection(db, 'test-series'), testSeriesData);
      
      onSeriesCreated({
        id: docRef.id,
        ...testSeriesData
      });
      
    } catch (error) {
      console.error('Error creating test series:', error);
      alert('Failed to create test series. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Test Series Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g., UPSC Mock Test Series 2024"
          value={seriesData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-gray-800/70 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      {/* Cover Image Section */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Cover Image URL (Cloudinary)
        </label>
        <div className="space-y-3">
          <input
            type="url"
            placeholder="https://res.cloudinary.com/your-cloud/image/upload/..."
            value={seriesData.coverImageUrl}
            onChange={(e) => handleInputChange('coverImageUrl', e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-800/70 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {seriesData.coverImageUrl && (
            <div className="relative">
              <img
                src={seriesData.coverImageUrl}
                alt="Cover preview"
                className="w-full h-32 object-cover rounded-lg border border-gray-600"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div className="hidden w-full h-32 bg-gray-700 rounded-lg border border-gray-600 flex items-center justify-center text-gray-400">
                Invalid image URL
              </div>
            </div>
          )}
          <p className="text-xs text-gray-400">
            Upload your image to Cloudinary and paste the URL here. Recommended size: 400x300px
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Description
        </label>
        <textarea
          placeholder="Describe your test series, what students will learn..."
          value={seriesData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-gray-800/70 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows="4"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            General Category
          </label>
          <select
            value={seriesData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-800/70 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Exam Category
          </label>
          <select
            value={seriesData.examCategory}
            onChange={(e) => {
              handleInputChange('examCategory', e.target.value);
              handleInputChange('examSubcategory', ''); // Reset subcategory when main category changes
            }}
            className="w-full px-4 py-3 rounded-lg bg-gray-800/70 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
          >
            <option value="">Select Exam Category</option>
            {examCategories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Specific Exam
          </label>
          <select
            value={seriesData.examSubcategory}
            onChange={(e) => handleInputChange('examSubcategory', e.target.value)}
            disabled={!seriesData.examCategory}
            className={`w-full px-4 py-3 rounded-lg border appearance-none ${
              seriesData.examCategory
                ? 'bg-gray-800/70 border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                : 'bg-gray-700/50 border-gray-600 text-gray-500 cursor-not-allowed'
            }`}
          >
            <option value="">Select Specific Exam</option>
            {seriesData.examCategory && examCategories
              .find(cat => cat.id === seriesData.examCategory)
              ?.subcategories.map(sub => (
                <option key={sub.id} value={sub.id}>
                  {sub.icon} {sub.name}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Difficulty Level
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleInputChange('difficulty', 'easy')}
              className={`p-2 rounded-lg text-center text-sm font-medium transition-colors ${
                seriesData.difficulty === 'easy'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Easy
            </button>
            <button
              type="button"
              onClick={() => handleInputChange('difficulty', 'medium')}
              className={`p-2 rounded-lg text-center text-sm font-medium transition-colors ${
                seriesData.difficulty === 'medium'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Medium
            </button>
            <button
              type="button"
              onClick={() => handleInputChange('difficulty', 'hard')}
              className={`p-2 rounded-lg text-center text-sm font-medium transition-colors ${
                seriesData.difficulty === 'hard'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Hard
            </button>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Estimated Duration (minutes)
        </label>
        <input
          type="number"
          min="30"
          max="600"
          value={seriesData.estimatedDuration}
          onChange={(e) => handleInputChange('estimatedDuration', parseInt(e.target.value) || 60)}
          className="w-full px-4 py-3 rounded-lg bg-gray-800/70 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Tags (Press Enter to add)
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {seriesData.tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-900/60 text-blue-200 rounded-full text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleTagRemove(tag)}
                className="text-blue-300 hover:text-white ml-1"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          placeholder="Add tags like 'upsc', 'maths', 'science'..."
          className="w-full px-4 py-3 rounded-lg bg-gray-800/70 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleTagAdd(e.target.value.trim());
              e.target.value = '';
            }
          }}
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-2">
          💰 Pricing & Payment Settings
        </h3>
        <p className="text-gray-400">
          Set your test series pricing and payment receiving method
        </p>
      </div>

      {/* Free/Paid Toggle */}
      <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-5">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-bold text-white">
              Test Series Type
            </h4>
            <p className="text-gray-400">
              {seriesData.isPaid ? 'Paid test series - Students need to subscribe' : 'Free test series - Open for everyone'}
            </p>
          </div>
          
          <button
            type="button"
            onClick={() => handleInputChange('isPaid', !seriesData.isPaid)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
              seriesData.isPaid
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            {seriesData.isPaid ? (
              <>
                <FiToggleRight className="w-6 h-6" />
                Paid
              </>
            ) : (
              <>
                <FiToggleLeft className="w-6 h-6" />
                Free
              </>
            )}
          </button>
        </div>
      </div>

      {/* Pricing Section */}
      {seriesData.isPaid && (
        <>
          <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-5">
            <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <FiDollarSign className="w-6 h-6 text-green-400" />
              Set Your Price
            </h4>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Test Series Price (₹)
              </label>
              <input
                type="number"
                min="49"
                max="2999"
                value={seriesData.price}
                onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 299)}
                className="w-full px-4 py-3 rounded-lg bg-gray-800/70 border border-gray-700 text-white text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="299"
              />
            </div>

            {/* Suggested Prices */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {[99, 199, 299, 499, 799, 999, 1499, 1999].map(price => (
                <button
                  key={price}
                  type="button"
                  onClick={() => handleInputChange('price', price)}
                  className={`p-3 rounded-lg text-center font-medium transition-colors ${
                    seriesData.price === price
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  ₹{price}
                </button>
              ))}
            </div>

            {/* Pricing Info */}
            <div className="bg-green-900/30 border border-green-800/50 rounded-lg p-4">
              <h5 className="font-bold text-green-300 mb-3">
                Pricing Summary:
              </h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-300">Subscription Price:</span>
                  <span className="font-bold text-white">₹{seriesData.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-300">Payouts:</span>
                  <span className="font-medium text-gray-400">Revenue share disabled; funds go to platform</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Receiving Methods */}
          <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-5">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xl font-bold text-white flex items-center gap-2">
                <FiCreditCard className="w-6 h-6 text-blue-400" />
                Payment Receiving Method
              </h4>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Sync with profile</span>
                <button 
                  type="button"
                  onClick={handleSyncWithProfileChange}
                  className={`w-12 h-6 rounded-full relative transition-colors ${
                    seriesData.paymentMethod.syncWithProfile ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                  disabled={loadingProfile}
                >
                  <span className={`block w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform transform ${
                    seriesData.paymentMethod.syncWithProfile ? 'translate-x-6' : 'translate-x-0.5'
                  }`}></span>
                </button>
              </div>
            </div>

            {/* Info Alert */}
            <div className="bg-blue-900/30 border border-blue-800/50 rounded-lg p-4 mb-6 flex gap-3">
              <div className="flex-shrink-0 text-blue-400 mt-0.5">
                <FiAlertCircle className="w-5 h-5" />
              </div>
              <div className="text-blue-300 text-sm">
                <p className="font-medium mb-1">Why do we need your payment details?</p>
                <p>We'll use this information to transfer your earnings when students subscribe to your test series.</p>
              </div>
            </div>

            {/* Payment Method Tabs */}
            <div className="mb-6">
              <div className="flex mb-4 border-b border-gray-700">
                <button
                  type="button"
                  onClick={() => handlePaymentMethodChange('type', 'bank')}
                  className={`px-4 py-2 font-medium text-sm -mb-px ${
                    seriesData.paymentMethod.type === 'bank'
                      ? 'text-blue-400 border-b-2 border-blue-400'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Bank Account
                </button>
                <button
                  type="button"
                  onClick={() => handlePaymentMethodChange('type', 'upi')}
                  className={`px-4 py-2 font-medium text-sm -mb-px ${
                    seriesData.paymentMethod.type === 'upi'
                      ? 'text-blue-400 border-b-2 border-blue-400'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  UPI
                </button>
              </div>

              {/* Bank Account Details */}
              {seriesData.paymentMethod.type === 'bank' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Account Holder Name
                      </label>
                      <input
                        type="text"
                        value={seriesData.paymentMethod.bankAccount.accountHolderName}
                        onChange={(e) => handleBankDetailsChange('accountHolderName', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-gray-800/70 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="John Doe"
                        disabled={seriesData.paymentMethod.syncWithProfile && loadingProfile}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        value={seriesData.paymentMethod.bankAccount.bankName}
                        onChange={(e) => handleBankDetailsChange('bankName', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-gray-800/70 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="State Bank of India"
                        disabled={seriesData.paymentMethod.syncWithProfile && loadingProfile}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Account Number
                      </label>
                      <input
                        type="text"
                        value={seriesData.paymentMethod.bankAccount.accountNumber}
                        onChange={(e) => handleBankDetailsChange('accountNumber', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-gray-800/70 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="1234567890"
                        disabled={seriesData.paymentMethod.syncWithProfile && loadingProfile}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        IFSC Code
                      </label>
                      <input
                        type="text"
                        value={seriesData.paymentMethod.bankAccount.ifscCode}
                        onChange={(e) => handleBankDetailsChange('ifscCode', e.target.value.toUpperCase())}
                        className="w-full px-4 py-3 rounded-lg bg-gray-800/70 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="SBIN0000123"
                        disabled={seriesData.paymentMethod.syncWithProfile && loadingProfile}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* UPI Details */}
              {seriesData.paymentMethod.type === 'upi' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    UPI ID
                  </label>
                  <input
                    type="text"
                    value={seriesData.paymentMethod.upi.upiId}
                    onChange={(e) => handleUPIDetailsChange('upiId', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-gray-800/70 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="yourname@bankupi"
                    disabled={seriesData.paymentMethod.syncWithProfile && loadingProfile}
                  />
                  <p className="text-sm text-gray-400 mt-2">
                    Example: yourname@okhdfcbank, yourname@paytm, etc.
                  </p>
                </div>
              )}

              {/* Missing Payment Warning */}
              {seriesData.isPaid && (
                (seriesData.paymentMethod.type === 'bank' && !seriesData.paymentMethod.bankAccount.accountNumber) || 
                (seriesData.paymentMethod.type === 'upi' && !seriesData.paymentMethod.upi.upiId)
              ) && (
                <div className="mt-6 bg-yellow-900/30 border border-yellow-800/50 rounded-lg p-4 flex gap-3">
                  <FiAlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-yellow-400 mb-1">Missing Payment Details</h5>
                    <p className="text-yellow-300 text-sm">
                      You need to add your payment details to receive earnings when students subscribe to your test series.
                    </p>
                    {!creatorProfile?.paymentDetails && (
                      <p className="text-yellow-300 text-sm mt-2">
                        You can add your payment details in your profile settings for faster setup in the future.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Security Note */}
              <div className="mt-4 flex items-center gap-2 text-gray-400 text-xs">
                <FiLock className="w-4 h-4" />
                <span>Your payment details are securely stored and will only be used for processing your earnings</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Free Series Benefits */}
      {!seriesData.isPaid && (
        <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-5">
          <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            🎉 Free Test Series Benefits
          </h4>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-center gap-2">
              <FiCheck className="w-4 h-4 text-green-400" />
              Maximum reach - Open for all students
            </li>
            <li className="flex items-center gap-2">
              <FiCheck className="w-4 h-4 text-green-400" />
              Build your reputation and following
            </li>
            <li className="flex items-center gap-2">
              <FiCheck className="w-4 h-4 text-green-400" />
              Perfect for building trust with students
            </li>
            <li className="flex items-center gap-2">
              <FiCheck className="w-4 h-4 text-green-400" />
              No barriers to entry for learners
            </li>
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="bg-gray-800/70 hover:bg-gray-700 text-white font-medium rounded-lg px-4 py-2 flex items-center gap-2 transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back
        </button>
        
        <div>
          <h1 className="text-3xl font-bold text-white">
            Create Test Series
          </h1>
          <p className="text-gray-400">
            Create a comprehensive test series for your students
          </p>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center gap-8">
          {[
            { step: 1, label: 'Basic Info', icon: FiBookOpen },
            { step: 2, label: 'Pricing & Payments', icon: FiDollarSign }
          ].map(({ step: stepNum, label, icon: Icon }, index) => (
            <div key={stepNum} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                  step >= stepNum
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {step > stepNum ? (
                    <FiCheck className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>
                <span className={`mt-2 font-medium ${
                  step >= stepNum
                    ? 'text-blue-400'
                    : 'text-gray-500'
                }`}>
                  {label}
                </span>
              </div>
              
              {index < 1 && (
                <div className={`w-24 h-1 mx-2 rounded ${
                  step > stepNum
                    ? 'bg-blue-600'
                    : 'bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-gray-800/70 backdrop-blur-sm border border-gray-700 rounded-xl p-6 mb-8">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <div>
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="bg-gray-800/70 hover:bg-gray-700 text-white font-medium rounded-lg px-5 py-2.5 transition-colors"
            >
              Previous
            </button>
          )}
        </div>
        
        <div>
          {step < 2 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!seriesData.title.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-5 py-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleCreateSeries}
              disabled={loading || !seriesData.title.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-5 py-2.5 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <FiSave className="w-5 h-5" />
                  Create Test Series
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestSeriesCreator;
