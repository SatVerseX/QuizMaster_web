import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getAllSubcategories } from '../../utils/constants/examCategories';
import usePopup from '../../hooks/usePopup';
import BeautifulPopup from '../common/BeautifulPopup';

import {
  FiDollarSign,
  FiToggleLeft,
  FiToggleRight,
  FiSave,
  FiArrowLeft,
  FiBookOpen,
  FiCheck,
  FiSettings,
  FiDownload,
  FiPlus,
  FiTrash2,
  FiPackage,
  FiFile
} from 'react-icons/fi';

const TestSeriesCreator = ({ onBack, onSeriesCreated }) => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const { popupState, showError, showSuccess, hidePopup } = usePopup();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Basic Info, 2: Pricing & Payments
  const [showImageAdjustment, setShowImageAdjustment] = useState(false);


  const [seriesData, setSeriesData] = useState({
    title: '',
    description: '',
    category: '',
    examSubcategory: '',
    difficulty: '',
    tags: [],
    isPaid: false,
    price: 0,
    quizzes: [],
    coverImageUrl: '',
    resources: [],
    isCombo: false,
    comboIncludes: ['mock_tests']
  });

  const [newResource, setNewResource] = useState({
    title: '',
    type: 'pdf',
    url: '',
    description: ''
  });

  const resourceTypes = [
    { value: 'pdf', label: '📄 PDF Document', icon: '📄' },
    { value: 'practice_sheet', label: '📝 Practice Sheet', icon: '📝' },
    { value: 'notes', label: '📒 Notes', icon: '📒' },
    { value: 'other', label: '📁 Other', icon: '📁' }
  ];

  const comboOptions = [
    { value: 'mock_tests', label: 'Mock Tests', icon: '📋' },
    { value: 'practice_sheets', label: 'Practice Sheets', icon: '📝' },
    { value: 'study_material', label: 'Study Material', icon: '📚' },
    { value: 'notes', label: 'Notes / Summaries', icon: '📒' }
  ];

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



  const handleInputChange = (field, value) => {
    setSeriesData(prev => ({
      ...prev,
      [field]: value
    }));
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

  const handleAddResource = () => {
    if (!newResource.title.trim() || !newResource.url.trim()) return;
    const resource = {
      id: `res_${Date.now()}`,
      ...newResource,
      addedAt: new Date()
    };
    setSeriesData(prev => ({
      ...prev,
      resources: [...prev.resources, resource]
    }));
    setNewResource({ title: '', type: 'pdf', url: '', description: '' });
  };

  const handleRemoveResource = (resourceId) => {
    setSeriesData(prev => ({
      ...prev,
      resources: prev.resources.filter(r => r.id !== resourceId)
    }));
  };

  const handleComboToggle = (option) => {
    setSeriesData(prev => {
      const includes = prev.comboIncludes.includes(option)
        ? prev.comboIncludes.filter(o => o !== option)
        : [...prev.comboIncludes, option];
      return { ...prev, comboIncludes: includes };
    });
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

        // Combo & Resources
        resources: seriesData.resources || [],
        isCombo: seriesData.isCombo || false,
        comboIncludes: seriesData.isCombo ? seriesData.comboIncludes : [],

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
      showError('Failed to create test series. Please try again.', 'Creation Error');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label className={`block text-sm font-medium mb-2 transition-all duration-300 ${isDark ? 'text-gray-300' : 'text-slate-700'
          }`}>
          Test Series Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g., UPSC Mock Test Series 2024"
          value={seriesData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDark
              ? 'bg-gray-800/70 border-gray-700 text-white placeholder-gray-400'
              : 'bg-white border-slate-300 text-slate-800 placeholder-slate-500'
            }`}
          required
        />
      </div>

      {/* Cover Image Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={`block text-sm font-medium transition-all duration-300 ${isDark ? 'text-gray-300' : 'text-slate-700'
            }`}>
            Cover Image URL (Cloudinary)
          </label>
        </div>

        <div className="space-y-3">
          <input
            type="url"
            placeholder="https://res.cloudinary.com/your-cloud/image/upload/..."
            value={seriesData.coverImageUrl}
            onChange={(e) => handleInputChange('coverImageUrl', e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDark
                ? 'bg-gray-800/70 border-gray-700 text-white placeholder-gray-400'
                : 'bg-white border-slate-300 text-slate-800 placeholder-slate-500'
              }`}
          />

          {seriesData.coverImageUrl && (
            <div className="space-y-3">
              {/* Basic Preview */}
              <div className="relative">
                <img
                  src={seriesData.coverImageUrl}
                  alt="Cover preview"
                  className={`w-full h-32 object-cover rounded-lg border transition-all duration-300 ${isDark ? 'border-gray-600' : 'border-slate-300'
                    }`}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <div className={`hidden w-full h-32 rounded-lg border flex items-center justify-center transition-all duration-300 ${isDark
                    ? 'bg-gray-700 border-gray-600 text-gray-400'
                    : 'bg-slate-100 border-slate-300 text-slate-500'
                  }`}>
                  Invalid image URL
                </div>
              </div>


            </div>
          )}

          <p className={`text-xs transition-all duration-300 ${isDark ? 'text-gray-400' : 'text-slate-500'
            }`}>
            Upload your image to Cloudinary and paste the URL here. Recommended size: 400x300px
          </p>
        </div>
      </div>

      <div>
        <label className={`block text-sm font-medium mb-2 transition-all duration-300 ${isDark ? 'text-gray-300' : 'text-slate-700'
          }`}>
          Description
        </label>
        <textarea
          placeholder="Describe your test series, what students will learn..."
          value={seriesData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDark
              ? 'bg-gray-800/70 border-gray-700 text-white placeholder-gray-400'
              : 'bg-white border-slate-300 text-slate-800 placeholder-slate-500'
            }`}
          rows="4"
        />
      </div>



      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={`block text-sm font-medium mb-2 transition-all duration-300 ${isDark ? 'text-gray-300' : 'text-slate-700'
            }`}>
            Specific Exam
          </label>
          <div className="relative">
            <select
              value={seriesData.examSubcategory}
              onChange={(e) => handleInputChange('examSubcategory', e.target.value)}
              className={`w-full px-4 py-3 pr-10 rounded-lg border appearance-none transition-all duration-300 ${isDark
                  ? 'bg-gray-800/70 border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  : 'bg-white border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                }`}
            >
              <option value="">Select Specific Exam</option>
              {getAllSubcategories().map(sub => (
                <option key={sub.id} value={sub.id}>
                  {sub.icon} {sub.name}
                </option>
              ))}
            </select>
            <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300 ${isDark ? 'text-gray-400' : 'text-slate-500'
              }`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 transition-all duration-300 ${isDark ? 'text-gray-300' : 'text-slate-700'
            }`}>
            Difficulty Level
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleInputChange('difficulty', 'easy')}
              className={`p-2 rounded-lg text-center text-sm font-medium transition-all duration-300 ${seriesData.difficulty === 'easy'
                  ? 'bg-green-600 text-white'
                  : isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                }`}
            >
              Easy
            </button>
            <button
              type="button"
              onClick={() => handleInputChange('difficulty', 'medium')}
              className={`p-2 rounded-lg text-center text-sm font-medium transition-all duration-300 ${seriesData.difficulty === 'medium'
                  ? 'bg-yellow-600 text-white'
                  : isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                }`}
            >
              Medium
            </button>
            <button
              type="button"
              onClick={() => handleInputChange('difficulty', 'hard')}
              className={`p-2 rounded-lg text-center text-sm font-medium transition-all duration-300 ${seriesData.difficulty === 'hard'
                  ? 'bg-red-600 text-white'
                  : isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                }`}
            >
              Hard
            </button>
          </div>
        </div>
      </div>



      <div>
        <label className={`block text-sm font-medium mb-2 transition-all duration-300 ${isDark ? 'text-gray-300' : 'text-slate-700'
          }`}>
          Tags (Press Enter to add)
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {seriesData.tags.map(tag => (
            <span
              key={tag}
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-all duration-300 ${isDark
                  ? 'bg-blue-900/60 text-blue-200'
                  : 'bg-blue-100 text-blue-700 border border-blue-200'
                }`}
            >
              {tag}
              <button
                type="button"
                onClick={() => handleTagRemove(tag)}
                className={`ml-1 transition-all duration-300 ${isDark
                    ? 'text-blue-300 hover:text-white'
                    : 'text-blue-600 hover:text-blue-800'
                  }`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          placeholder="Add tags like 'upsc', 'maths', 'science'..."
          className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDark
              ? 'bg-gray-800/70 border-gray-700 text-white placeholder-gray-400'
              : 'bg-white border-slate-300 text-slate-800 placeholder-slate-500'
            }`}
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
        <h3 className={`text-2xl font-bold mb-2 transition-all duration-300 ${isDark ? 'text-white' : 'text-slate-800'
          }`}>
          💰 Pricing & Payment Settings
        </h3>
        <p className={`transition-all duration-300 ${isDark ? 'text-gray-400' : 'text-slate-600'
          }`}>
          Set your test series pricing and payment receiving method
        </p>
      </div>

      {/* Free/Paid Toggle */}
      <div className={`border rounded-lg p-5 transition-all duration-300 ${isDark
          ? 'bg-gray-800/70 border-gray-700'
          : 'bg-white border-slate-200 shadow-sm'
        }`}>
        <div className="flex items-center justify-between">
          <div>
            <h4 className={`text-lg font-bold transition-all duration-300 ${isDark ? 'text-white' : 'text-slate-800'
              }`}>
              Test Series Type
            </h4>
            <p className={`transition-all duration-300 ${isDark ? 'text-gray-400' : 'text-slate-600'
              }`}>
              {seriesData.isPaid ? 'Paid test series - Students need to subscribe' : 'Free test series - Open for everyone'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleInputChange('isPaid', !seriesData.isPaid)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${seriesData.isPaid
                ? 'bg-green-600 text-white'
                : isDark
                  ? 'bg-gray-700 text-gray-300'
                  : 'bg-slate-100 text-slate-700 border border-slate-300'
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
          <div className={`border rounded-lg p-5 transition-all duration-300 ${isDark
              ? 'bg-gray-800/70 border-gray-700'
              : 'bg-white border-slate-200 shadow-sm'
            }`}>
            <h4 className={`text-xl font-bold mb-6 flex items-center gap-2 transition-all duration-300 ${isDark ? 'text-white' : 'text-slate-800'
              }`}>
              <FiDollarSign className="w-6 h-6 text-green-400" />
              Set Your Price
            </h4>

            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 transition-all duration-300 ${isDark ? 'text-gray-300' : 'text-slate-700'
                }`}>
                Test Series Price (₹)
              </label>
              <input
                type="number"
                min="49"
                max="2999"
                value={seriesData.price}
                onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 299)}
                className={`w-full px-4 py-3 rounded-lg border text-2xl font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDark
                    ? 'bg-gray-800/70 border-gray-700 text-white'
                    : 'bg-white border-slate-300 text-slate-800'
                  }`}
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
                  className={`p-3 rounded-lg text-center font-medium transition-all duration-300 ${seriesData.price === price
                      ? 'bg-blue-600 text-white'
                      : isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                    }`}
                >
                  ₹{price}
                </button>
              ))}
            </div>

            {/* Pricing Info */}
            <div className={`border rounded-lg p-4 transition-all duration-300 ${isDark
                ? 'bg-green-900/30 border-green-800/50'
                : 'bg-green-50 border-green-200'
              }`}>
              <h5 className={`font-bold mb-3 transition-all duration-300 ${isDark ? 'text-green-300' : 'text-green-700'
                }`}>
                Pricing Summary:
              </h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={`transition-all duration-300 ${isDark ? 'text-green-300' : 'text-green-600'
                    }`}>Subscription Price:</span>
                  <span className={`font-bold transition-all duration-300 ${isDark ? 'text-white' : 'text-slate-800'
                    }`}>₹{seriesData.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`transition-all duration-300 ${isDark ? 'text-green-300' : 'text-green-600'
                    }`}>Payouts:</span>
                  <span className={`font-medium transition-all duration-300 ${isDark ? 'text-gray-400' : 'text-slate-600'
                    }`}>Revenue share disabled; funds go to platform</span>
                </div>
              </div>
            </div>
          </div>


        </>
      )}

      {/* Free Series Benefits */}
      {!seriesData.isPaid && (
        <div className={`border rounded-lg p-5 transition-all duration-300 ${isDark
            ? 'bg-gray-800/70 border-gray-700'
            : 'bg-slate-50 border-slate-200 shadow-sm'
          }`}>
          <h4 className={`text-xl font-bold mb-4 flex items-center gap-2 transition-all duration-300 ${isDark ? 'text-white' : 'text-slate-800'
            }`}>
            🎉 Free Test Series Benefits
          </h4>
          <ul className={`space-y-3 transition-all duration-300 ${isDark ? 'text-gray-300' : 'text-slate-600'
            }`}>
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

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className={`text-2xl font-bold mb-2 transition-all duration-300 ${isDark ? 'text-white' : 'text-slate-800'
          }`}>
          📦 Resources & Combo Pack
        </h3>
        <p className={`transition-all duration-300 ${isDark ? 'text-gray-400' : 'text-slate-600'
          }`}>
          Add downloadable study materials and mark this as a combo package
        </p>
      </div>

      {/* Combo Pack Toggle */}
      <div className={`border rounded-lg p-5 transition-all duration-300 ${isDark
          ? 'bg-gray-800/70 border-gray-700'
          : 'bg-white border-slate-200 shadow-sm'
        }`}>
        <div className="flex items-center justify-between">
          <div>
            <h4 className={`text-lg font-bold flex items-center gap-2 transition-all duration-300 ${isDark ? 'text-white' : 'text-slate-800'
              }`}>
              <FiPackage className="w-5 h-5 text-purple-500" />
              Combo Pack
            </h4>
            <p className={`text-sm mt-1 transition-all duration-300 ${isDark ? 'text-gray-400' : 'text-slate-600'
              }`}>
              {seriesData.isCombo ? 'This series is a combo — shows a special badge to students' : 'Enable to market this as a combo package'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleInputChange('isCombo', !seriesData.isCombo)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all duration-300 ${seriesData.isCombo
                ? 'bg-purple-600 text-white'
                : isDark
                  ? 'bg-gray-700 text-gray-300'
                  : 'bg-slate-100 text-slate-700 border border-slate-300'
              }`}
          >
            {seriesData.isCombo ? (
              <><FiToggleRight className="w-6 h-6" /> Combo</>
            ) : (
              <><FiToggleLeft className="w-6 h-6" /> Off</>
            )}
          </button>
        </div>

        {seriesData.isCombo && (
          <div className="mt-5 pt-5 border-t border-dashed" style={{ borderColor: isDark ? '#374151' : '#e2e8f0' }}>
            <p className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-slate-700'
              }`}>What's included in this combo?</p>
            <div className="grid grid-cols-2 gap-2">
              {comboOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleComboToggle(opt.value)}
                  className={`p-3 rounded-lg text-left text-sm font-medium flex items-center gap-2 transition-all duration-300 ${seriesData.comboIncludes.includes(opt.value)
                      ? 'bg-purple-600 text-white'
                      : isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                    }`}
                >
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                  {seriesData.comboIncludes.includes(opt.value) && <FiCheck className="w-4 h-4 ml-auto" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Resources Section */}
      <div className={`border rounded-lg p-5 transition-all duration-300 ${isDark
          ? 'bg-gray-800/70 border-gray-700'
          : 'bg-white border-slate-200 shadow-sm'
        }`}>
        <h4 className={`text-xl font-bold mb-4 flex items-center gap-2 transition-all duration-300 ${isDark ? 'text-white' : 'text-slate-800'
          }`}>
          <FiDownload className="w-5 h-5 text-blue-500" />
          Downloadable Resources
        </h4>
        <p className={`text-sm mb-5 transition-all duration-300 ${isDark ? 'text-gray-400' : 'text-slate-600'
          }`}>
          Add PDFs, practice sheets, or notes. Upload files to Cloudinary and paste the URL here.
        </p>

        {/* Add Resource Form */}
        <div className={`border rounded-lg p-4 mb-4 transition-all duration-300 ${isDark ? 'bg-gray-900/50 border-gray-600' : 'bg-slate-50 border-slate-200'
          }`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              placeholder="Resource title (e.g., 'Chapter 1 Notes')"
              value={newResource.title}
              onChange={(e) => setNewResource(p => ({ ...p, title: e.target.value }))}
              className={`w-full px-4 py-2.5 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${isDark
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                  : 'bg-white border-slate-300 text-slate-800 placeholder-slate-500'
                }`}
            />
            <div className="relative">
              <select
                value={newResource.type}
                onChange={(e) => setNewResource(p => ({ ...p, type: e.target.value }))}
                className={`w-full px-4 py-2.5 pr-10 rounded-lg border appearance-none transition-all duration-300 text-sm ${isDark
                    ? 'bg-gray-800 border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                    : 'bg-white border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  }`}
              >
                {resourceTypes.map(rt => (
                  <option key={rt.value} value={rt.value}>{rt.label}</option>
                ))}
              </select>
              <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-gray-400' : 'text-slate-500'
                }`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          <input
            type="url"
            placeholder="Cloudinary URL (e.g., https://res.cloudinary.com/...)"
            value={newResource.url}
            onChange={(e) => setNewResource(p => ({ ...p, url: e.target.value }))}
            className={`w-full px-4 py-2.5 rounded-lg border mb-3 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${isDark
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                : 'bg-white border-slate-300 text-slate-800 placeholder-slate-500'
              }`}
          />
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Short description (optional)"
              value={newResource.description}
              onChange={(e) => setNewResource(p => ({ ...p, description: e.target.value }))}
              className={`flex-1 px-4 py-2.5 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${isDark
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                  : 'bg-white border-slate-300 text-slate-800 placeholder-slate-500'
                }`}
            />
            <button
              type="button"
              onClick={handleAddResource}
              disabled={!newResource.title.trim() || !newResource.url.trim()}
              className="px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium text-sm flex items-center gap-1.5 hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiPlus className="w-4 h-4" />
              Add
            </button>
          </div>
        </div>

        {/* Resources List */}
        {seriesData.resources.length > 0 ? (
          <div className="space-y-2">
            {seriesData.resources.map((res, idx) => (
              <div
                key={res.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 ${isDark
                    ? 'bg-gray-700/50 border-gray-600'
                    : 'bg-white border-slate-200'
                  }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${isDark ? 'bg-gray-600' : 'bg-slate-100'
                  }`}>
                  {resourceTypes.find(rt => rt.value === res.type)?.icon || '📁'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm truncate ${isDark ? 'text-white' : 'text-slate-800'
                    }`}>{res.title}</p>
                  <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-slate-500'
                    }`}>{res.url}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveResource(res.id)}
                  className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-all duration-300 flex-shrink-0"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-8 rounded-lg border-2 border-dashed transition-all duration-300 ${isDark ? 'border-gray-700 text-gray-500' : 'border-slate-200 text-slate-400'
            }`}>
            <FiFile className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No resources added yet</p>
            <p className="text-xs mt-1">Add PDFs, practice sheets, or notes above</p>
          </div>
        )}
      </div>

      {/* Skip Info */}
      <div className={`text-center text-sm transition-all duration-300 ${isDark ? 'text-gray-500' : 'text-slate-400'
        }`}>
        💡 You can skip this step and add resources later from the editor
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen transition-all duration-500 ${isDark
        ? 'bg-gradient-to-br from-gray-900 via-blue-900/10 to-purple-900/10'
        : 'bg-white'
      }`}>
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className={`font-medium rounded-lg px-4 py-2 flex items-center gap-2 transition-all duration-300 ${isDark
                ? 'bg-gray-800/70 hover:bg-gray-700 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
          >
            <FiArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div>
            <h1 className={`text-3xl font-bold transition-all duration-300 ${isDark ? 'text-white' : 'text-slate-800'
              }`}>
              Create Test Series
            </h1>
            <p className={`transition-all duration-300 ${isDark ? 'text-gray-400' : 'text-slate-600'
              }`}>
              Create a comprehensive test series for your students
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-8">
            {[
              { step: 1, label: 'Basic Info', icon: FiBookOpen },
              { step: 2, label: 'Pricing', icon: FiDollarSign },
              { step: 3, label: 'Resources', icon: FiDownload }
            ].map(({ step: stepNum, label, icon: Icon }, index) => (
              <div key={stepNum} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${step >= stepNum
                      ? isDark
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-600 text-white'
                      : isDark
                        ? 'bg-gray-700 text-gray-400'
                        : 'bg-slate-200 text-slate-500'
                    }`}>
                    {step > stepNum ? (
                      <FiCheck className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>
                  <span className={`mt-2 font-medium transition-all duration-300 ${step >= stepNum
                      ? isDark
                        ? 'text-blue-400'
                        : 'text-blue-600'
                      : isDark
                        ? 'text-gray-500'
                        : 'text-slate-500'
                    }`}>
                    {label}
                  </span>
                </div>

                {index < 2 && (
                  <div className={`w-24 h-1 mx-2 rounded transition-all duration-300 ${step > stepNum
                      ? isDark
                        ? 'bg-blue-600'
                        : 'bg-blue-600'
                      : isDark
                        ? 'bg-gray-700'
                        : 'bg-slate-200'
                    }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className={`backdrop-blur-sm border rounded-xl p-6 mb-8 transition-all duration-300 ${isDark
            ? 'bg-gray-800/70 border-gray-700'
            : 'bg-white border-slate-200 shadow-sm'
          }`}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <div>
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className={`font-medium rounded-lg px-5 py-2.5 transition-all duration-300 ${isDark
                    ? 'bg-gray-800/70 hover:bg-gray-700 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
              >
                Previous
              </button>
            )}
          </div>

          <div>
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!seriesData.title.trim()}
                className={`font-medium rounded-lg px-5 py-2.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${isDark
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleCreateSeries}
                disabled={loading || !seriesData.title.trim()}
                className={`font-medium rounded-lg px-5 py-2.5 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${isDark
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
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

      {/* Beautiful Popup */}
      <BeautifulPopup
        {...popupState}
        onClose={hidePopup}
      />
    </div>
  );
};

export default TestSeriesCreator;
