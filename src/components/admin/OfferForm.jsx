import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaImage, FaCalendar, FaTag, FaDollarSign, FaChevronDown } from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';
import { addDoc, updateDoc, doc, collection, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const OfferForm = ({ 
  isOpen, 
  onClose, 
  offer, 
  onSave, 
  isDark 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    testSeriesId: '',
    originalPrice: 0,
    discountedPrice: 0,
    discountPercentage: 0,
    badge: 'Special Offer',
    startDate: '',
    endDate: '',
    isActive: true,
    imageUrl: ''
  });

  const [testSeries, setTestSeries] = useState([]);
  const [filteredTestSeries, setFilteredTestSeries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const mode = (light, dark) => (isDark ? dark : light);

  // Fetch test series from Firebase
  const fetchTestSeries = async () => {
    try {
      setLoading(true);
      const testSeriesRef = collection(db, 'test-series');
      const snapshot = await getDocs(testSeriesRef);
      const seriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTestSeries(seriesData);
      setFilteredTestSeries(seriesData);
    } catch (error) {
      console.error('Error fetching test series:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTestSeries();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    if (offer) {
      setFormData({
        title: offer.title || '',
        description: offer.description || '',
        testSeriesId: offer.testSeriesId || '',
        originalPrice: offer.originalPrice || 0,
        discountedPrice: offer.discountedPrice || 0,
        discountPercentage: offer.discountPercentage || 0,
        badge: offer.badge || 'Special Offer',
        startDate: offer.startDate ? (offer.startDate.toDate ? offer.startDate.toDate().toISOString().split('T')[0] : new Date(offer.startDate).toISOString().split('T')[0]) : '',
        endDate: offer.endDate ? (offer.endDate.toDate ? offer.endDate.toDate().toISOString().split('T')[0] : new Date(offer.endDate).toISOString().split('T')[0]) : '',
        isActive: offer.isActive !== undefined ? offer.isActive : true,
        imageUrl: offer.imageUrl || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        testSeriesId: '',
        originalPrice: 0,
        discountedPrice: 0,
        discountPercentage: 0,
        badge: 'Special Offer',
        startDate: '',
        endDate: '',
        isActive: true,
        imageUrl: ''
      });
    }
  }, [offer]);

  useEffect(() => {
    const filtered = testSeries.filter(ts => 
      ts.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ts.examCategory && ts.examCategory.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredTestSeries(filtered);
  }, [searchTerm, testSeries]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleTestSeriesSelect = (series) => {
    // Check if this is a free series
    const isFreeSeries = !series.isPaid || series.price === 0;
    
    setFormData(prev => ({
      ...prev,
      testSeriesId: series.id,
      originalPrice: isFreeSeries ? 0 : (series.price || 0),
      discountedPrice: isFreeSeries ? 0 : (series.price || 0),
      discountPercentage: isFreeSeries ? 100 : 0,
      imageUrl: series.coverImageUrl || series.imageUrl || ''
    }));
    setSearchTerm(series.title);
    setIsDropdownOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Auto-calculate discount percentage
    if (name === 'originalPrice' || name === 'discountedPrice') {
      const original = name === 'originalPrice' ? parseFloat(value) : formData.originalPrice;
      const discounted = name === 'discountedPrice' ? parseFloat(value) : formData.discountedPrice;
      
      // Handle free series (both prices are 0)
      if (original === 0 && discounted === 0) {
        setFormData(prev => ({
          ...prev,
          discountPercentage: 100
        }));
      } else if (original > 0 && discounted >= 0) {
        const discount = Math.round(((original - discounted) / original) * 100);
        setFormData(prev => ({
          ...prev,
          discountPercentage: discount
        }));
      }
    }
  };


  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.testSeriesId) newErrors.testSeriesId = 'Please select a test series';
    
    // Check if this is a free series (both prices are 0)
    const isFreeSeries = formData.originalPrice === 0 && formData.discountedPrice === 0;
    
    if (!isFreeSeries) {
      if (formData.originalPrice <= 0) newErrors.originalPrice = 'Original price must be greater than 0';
      if (formData.discountedPrice <= 0) newErrors.discountedPrice = 'Discounted price must be greater than 0';
      if (formData.discountedPrice >= formData.originalPrice) newErrors.discountedPrice = 'Discounted price must be less than original price';
    }
    
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (new Date(formData.startDate) >= new Date(formData.endDate)) newErrors.endDate = 'End date must be after start date';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const offerData = {
        ...formData,
        originalPrice: parseFloat(formData.originalPrice),
        discountedPrice: parseFloat(formData.discountedPrice),
        discountPercentage: parseFloat(formData.discountPercentage),
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        updatedAt: serverTimestamp(),
        createdBy: 'admin'
      };

      if (offer) {
        // Do not send undefined fields to updateDoc
        await updateDoc(doc(db, 'offers', offer.id), offerData);
      } else {
        // Only set createdAt when creating
        await addDoc(collection(db, 'offers'), { ...offerData, createdAt: serverTimestamp() });
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving offer:', error);
      setErrors({ submit: 'Failed to save offer. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border-2 ${mode(
        'bg-white border-slate-200',
        'bg-slate-800 border-slate-700'
      )}`}>
        {/* Header */}
        <div className={`p-6 border-b-2 ${mode('border-slate-200', 'border-slate-700')}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-2xl flex items-center justify-center">
                <FaTag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${mode('text-slate-800', 'text-white')}`}>
                  {offer ? 'Edit Offer' : 'Create New Offer'}
                </h2>
                <p className={`text-sm ${mode('text-slate-600', 'text-slate-300')}`}>
                  {offer ? 'Update offer details' : 'Create a promotional offer for test series'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${mode(
                'hover:bg-slate-100 text-slate-600',
                'hover:bg-slate-700 text-slate-300'
              )}`}
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Test Series Selection */}
          <div>
            <label className={`block text-sm font-semibold mb-3 ${mode('text-slate-700', 'text-slate-300')}`}>
              Select Test Series *
            </label>
            <div className="relative dropdown-container">
              <div
                onClick={toggleDropdown}
                className={`w-full px-4 py-3 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all duration-300 ${mode(
                  'bg-white border-slate-300 text-slate-800 hover:border-blue-500',
                  'bg-slate-700 border-slate-600 text-white hover:border-blue-500'
                )} ${errors.testSeriesId ? 'border-red-500' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <FiSearch className={`${mode('text-slate-400', 'text-slate-500')}`} />
                  <span className={searchTerm ? mode('text-slate-800', 'text-white') : mode('text-slate-400', 'text-slate-500')}>
                    {searchTerm || 'Search and select test series...'}
                  </span>
                </div>
                <FaChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
              
              {isDropdownOpen && (
                <div className={`absolute top-full left-0 right-0 mt-2 max-h-48 overflow-y-auto rounded-xl border-2 z-10 ${mode('bg-white border-slate-200', 'bg-slate-700 border-slate-600')}`}>
                  <div className="p-3 border-b border-slate-200">
                    <input
                      type="text"
                      placeholder="Search test series..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${mode(
                        'bg-white border-slate-300 text-slate-800',
                        'bg-slate-600 border-slate-500 text-white'
                      )}`}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="max-h-32 overflow-y-auto">
                    {loading ? (
                      <div className="p-4 text-center text-slate-500">Loading test series...</div>
                    ) : filteredTestSeries.length > 0 ? (
                      filteredTestSeries.map(series => (
                        <button
                          key={series.id}
                          type="button"
                          onClick={() => handleTestSeriesSelect(series)}
                          className={`w-full p-3 text-left hover:bg-slate-100 transition-colors duration-200 ${mode(
                            'hover:bg-slate-100',
                            'hover:bg-slate-600'
                          )}`}
                        >
                          <div className="flex items-center gap-3">
                            {series.coverImageUrl && (
                              <img
                                src={series.coverImageUrl}
                                alt={series.title}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className={`font-semibold truncate ${mode('text-slate-800', 'text-white')}`}>
                                {series.title}
                              </h4>
                              <p className={`text-sm truncate ${mode('text-slate-600', 'text-slate-300')}`}>
                                {series.examCategory} • ₹{series.price?.toLocaleString() || '0'}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-slate-500">No test series found</div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {formData.testSeriesId && (
              <div className={`mt-3 p-3 rounded-lg ${mode('bg-green-50 border border-green-200', 'bg-green-900/20 border border-green-700')}`}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className={`text-sm font-medium ${mode('text-green-800', 'text-green-300')}`}>
                    Selected: {testSeries.find(ts => ts.id === formData.testSeriesId)?.title}
                  </span>
                </div>
              </div>
            )}
            
            {errors.testSeriesId && (
              <p className="text-red-500 text-sm mt-2">{errors.testSeriesId}</p>
            )}
          </div>

          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-semibold mb-2 ${mode('text-slate-700', 'text-slate-300')}`}>
                Offer Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 ${mode(
                  'bg-white border-slate-300 text-slate-800 focus:border-blue-500',
                  'bg-slate-700 border-slate-600 text-white focus:border-blue-500'
                )} ${errors.title ? 'border-red-500' : ''}`}
                placeholder="Enter offer title"
              />
              {errors.title && <p className="text-red-500 text-sm mt-2">{errors.title}</p>}
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${mode('text-slate-700', 'text-slate-300')}`}>
                Badge Text
              </label>
              <select
                name="badge"
                value={formData.badge}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 ${mode(
                  'bg-white border-slate-300 text-slate-800 focus:border-blue-500',
                  'bg-slate-700 border-slate-600 text-white focus:border-blue-500'
                )}`}
              >
                <option value="Special Offer">Special Offer</option>
                <option value="Hot Deal">Hot Deal</option>
                <option value="Best Seller">Best Seller</option>
                <option value="Limited Time">Limited Time</option>
                <option value="Flash Sale">Flash Sale</option>
                <option value="New Launch">New Launch</option>
              </select>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-2 ${mode('text-slate-700', 'text-slate-300')}`}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 ${mode(
                'bg-white border-slate-300 text-slate-800 focus:border-blue-500',
                'bg-slate-700 border-slate-600 text-white focus:border-blue-500'
              )}`}
              placeholder="Enter offer description"
            />
          </div>

          {/* Pricing */}
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className={`block text-sm font-semibold mb-2 ${mode('text-slate-700', 'text-slate-300')}`}>
                Original Price (₹) *
              </label>
              <div className="relative">
                <FaDollarSign className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${mode('text-slate-400', 'text-slate-500')}`} />
                <input
                  type="number"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 ${mode(
                    'bg-white border-slate-300 text-slate-800 focus:border-blue-500',
                    'bg-slate-700 border-slate-600 text-white focus:border-blue-500'
                  )} ${errors.originalPrice ? 'border-red-500' : ''}`}
                  placeholder="0"
                />
              </div>
              {errors.originalPrice && <p className="text-red-500 text-sm mt-2">{errors.originalPrice}</p>}
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${mode('text-slate-700', 'text-slate-300')}`}>
                Discounted Price (₹) *
              </label>
              <div className="relative">
                <FaDollarSign className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${mode('text-slate-400', 'text-slate-500')}`} />
                <input
                  type="number"
                  name="discountedPrice"
                  value={formData.discountedPrice}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 ${mode(
                    'bg-white border-slate-300 text-slate-800 focus:border-blue-500',
                    'bg-slate-700 border-slate-600 text-white focus:border-blue-500'
                  )} ${errors.discountedPrice ? 'border-red-500' : ''}`}
                  placeholder="0"
                />
              </div>
              {errors.discountedPrice && <p className="text-red-500 text-sm mt-2">{errors.discountedPrice}</p>}
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${mode('text-slate-700', 'text-slate-300')}`}>
                Discount Percentage
              </label>
              <div className={`px-4 py-3 rounded-xl border-2 ${mode('bg-slate-50 border-slate-300 text-slate-600', 'bg-slate-600 border-slate-500 text-slate-300')}`}>
                {formData.discountPercentage}% OFF
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-semibold mb-2 ${mode('text-slate-700', 'text-slate-300')}`}>
                Start Date *
              </label>
              <div className="relative">
                <FaCalendar className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${mode('text-slate-400', 'text-slate-500')}`} />
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 ${mode(
                    'bg-white border-slate-300 text-slate-800 focus:border-blue-500',
                    'bg-slate-700 border-slate-600 text-white focus:border-blue-500'
                  )} ${errors.startDate ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.startDate && <p className="text-red-500 text-sm mt-2">{errors.startDate}</p>}
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${mode('text-slate-700', 'text-slate-300')}`}>
                End Date *
              </label>
              <div className="relative">
                <FaCalendar className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${mode('text-slate-400', 'text-slate-500')}`} />
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 ${mode(
                    'bg-white border-slate-300 text-slate-800 focus:border-blue-500',
                    'bg-slate-700 border-slate-600 text-white focus:border-blue-500'
                  )} ${errors.endDate ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.endDate && <p className="text-red-500 text-sm mt-2">{errors.endDate}</p>}
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${mode('text-slate-700', 'text-slate-300')}`}>
              Image URL
            </label>
            <div className="relative">
              <FaImage className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${mode('text-slate-400', 'text-slate-500')}`} />
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 ${mode(
                  'bg-white border-slate-300 text-slate-800 focus:border-blue-500',
                  'bg-slate-700 border-slate-600 text-white focus:border-blue-500'
                )}`}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            {formData.imageUrl && (
              <div className="mt-3">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-32 h-20 object-cover rounded-lg border-2 border-slate-300"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Active Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="w-5 h-5 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500"
            />
            <label className={`text-sm font-semibold ${mode('text-slate-700', 'text-slate-300')}`}>
              Activate this offer immediately
            </label>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t-2 border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${mode(
                'bg-slate-100 text-slate-700 hover:bg-slate-200',
                'bg-slate-700 text-slate-300 hover:bg-slate-600'
              )}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <FaSave className="w-4 h-4" />
              )}
              {loading ? 'Saving...' : (offer ? 'Update Offer' : 'Create Offer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OfferForm;
