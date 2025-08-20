import React, { useState, useEffect } from 'react';
import { 
  doc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  writeBatch,
  addDoc
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { examCategories } from '../../utils/constants/examCategories';
import { 
  FiEdit, 
  FiTrash2, 
  FiSave, 
  FiArrowLeft,
  FiPlus,
  FiEye,
  FiEyeOff,
  FiSettings,
  FiDollarSign,
  FiBookOpen,
  FiClock,
  FiUsers,
  FiToggleLeft,
  FiToggleRight,
  FiMove,
  FiCopy,
  FiDownload,
  FiUpload,
  FiAlertTriangle,
  FiCheck,
  FiX,
  FiRefreshCw,
  FiFilter,
  FiSearch,
  FiMoreVertical,
  FiMenu,
  FiTarget,
  FiTrendingUp,
  FiLayers,
  FiChevronRight,
  FiStar,
  FiZap,
  FiShield,
  FiGlobe,
  FiInfo,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiImage
} from 'react-icons/fi';
import { FaRobot, FaMagic, FaGem, FaCrown } from 'react-icons/fa';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Toast Component
const Toast = ({ toast, onClose }) => {
  const getToastConfig = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: 'from-green-500/15 to-emerald-500/15',
          border: 'border-green-500/40',
          icon: <FiCheckCircle className="w-6 h-6 text-green-400" />,
          iconBg: 'bg-green-500/20',
          textColor: 'text-green-300',
          subTextColor: 'text-green-200'
        };
      case 'error':
        return {
          bg: 'from-red-500/15 to-red-600/15',
          border: 'border-red-500/40',
          icon: <FiXCircle className="w-6 h-6 text-red-400" />,
          iconBg: 'bg-red-500/20',
          textColor: 'text-red-300',
          subTextColor: 'text-red-200'
        };
      case 'warning':
        return {
          bg: 'from-yellow-500/15 to-orange-500/15',
          border: 'border-yellow-500/40',
          icon: <FiAlertCircle className="w-6 h-6 text-yellow-400" />,
          iconBg: 'bg-yellow-500/20',
          textColor: 'text-yellow-300',
          subTextColor: 'text-yellow-200'
        };
      case 'info':
        return {
          bg: 'from-blue-500/15 to-blue-600/15',
          border: 'border-blue-500/40',
          icon: <FiInfo className="w-6 h-6 text-blue-400" />,
          iconBg: 'bg-blue-500/20',
          textColor: 'text-blue-300',
          subTextColor: 'text-blue-200'
        };
      default:
        return {
          bg: 'from-gray-500/15 to-gray-600/15',
          border: 'border-gray-500/40',
          icon: <FiInfo className="w-6 h-6 text-gray-400" />,
          iconBg: 'bg-gray-500/20',
          textColor: 'text-gray-300',
          subTextColor: 'text-gray-200'
        };
    }
  };

  const config = getToastConfig(toast.type);

  return (
    <div 
      className={`relative bg-gradient-to-r ${config.bg} backdrop-blur-xl border ${config.border} rounded-2xl p-6 shadow-2xl transform transition-all duration-500 animate-slideIn`}
      style={{ 
        animationDelay: `${toast.index * 100}ms`,
        marginBottom: toast.index > 0 ? '12px' : '0' 
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 rounded-2xl"></div>
      <div className="relative flex items-center gap-4">
        <div className={`w-12 h-12 ${config.iconBg} rounded-xl flex items-center justify-center shadow-lg`}>
          {config.icon}
        </div>
        <div className="flex-1">
          <p className={`font-bold ${config.textColor} mb-1`}>
            {toast.title}
          </p>
          <p className={`${config.subTextColor} text-sm leading-relaxed`}>
            {toast.message}
          </p>
        </div>
        <button
          onClick={() => onClose(toast.id)}
          className={`p-2 rounded-lg transition-colors hover:scale-110 ${config.iconBg} ${config.textColor}`}
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>
      
      {/* Progress bar */}
      <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${config.bg.replace('/15', '/60')} rounded-b-2xl animate-shrink`}></div>
    </div>
  );
};

// Toast Container Component
const ToastContainer = ({ toasts, onClose }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-50 space-y-3 max-w-md">
      {toasts.map((toast, index) => (
        <Toast 
          key={toast.id} 
          toast={{ ...toast, index }} 
          onClose={onClose} 
        />
      ))}
    </div>
  );
};

// Enhanced Sortable Test Item Component
const SortableTestItem = ({ 
  test, 
  isSelected, 
  onSelect, 
  onEdit, 
  onDelete, 
  onDuplicate 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: test.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'hard': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border border-gray-600/40 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 ${
        isDragging 
          ? 'border-blue-500/50 shadow-blue-500/25 scale-105 z-50' 
          : 'hover:scale-[1.02] hover:border-blue-500/30'
      }`}
    >
      {/* Background Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
        {/* Enhanced Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-2 sm:p-3 bg-gray-700/50 hover:bg-gray-600/50 rounded-xl transition-all duration-300 group-hover:bg-blue-600/30"
        >
          <FiMenu className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-blue-400" />
        </div>

        {/* Enhanced Selection Checkbox */}
        <div className="relative">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(e.target.checked)}
            className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
          />
          {isSelected && (
            <div className="absolute inset-0 bg-blue-500 rounded opacity-20 animate-pulse"></div>
          )}
        </div>

        {/* Enhanced Test Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
            <h4 className="text-lg sm:text-xl font-bold text-white group-hover:text-blue-200 transition-colors truncate">
              {test.title}
            </h4>
            
            {/* Enhanced Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {test.isAIGenerated && (
                <div className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-full border border-purple-500/30 flex items-center gap-1 sm:gap-2">
                  <FaRobot className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-400" />
                  <span className="text-xs font-semibold text-purple-300">AI Generated</span>
                </div>
              )}
              
              <div className={`px-2 sm:px-3 py-1 sm:py-1.5 backdrop-blur-sm rounded-full border text-xs font-semibold ${getDifficultyColor(test.difficulty)}`}>
                {test.difficulty?.toUpperCase() || 'MEDIUM'}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 lg:gap-8 text-xs sm:text-sm text-gray-400">
            <div className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-500/10 rounded-lg">
              <FiBookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
              <span className="text-blue-300 font-medium">{test.questions?.length || 0} questions</span>
            </div>
            <div className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-emerald-500/10 rounded-lg">
              <FiClock className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
              <span className="text-emerald-300 font-medium">{test.timeLimit || 0} min</span>
            </div>
            <div className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-orange-500/10 rounded-lg">
              <FiUsers className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400" />
              <span className="text-orange-300 font-medium">{test.totalAttempts || 0} attempts</span>
            </div>
          </div>
        </div>

        {/* Enhanced Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onEdit(test)}
            className="group/btn p-2 sm:p-3 bg-blue-500/20 hover:bg-blue-500/30 rounded-xl transition-all duration-300 hover:scale-110"
            title="Edit Test"
          >
            <FiEdit className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 group-hover/btn:text-blue-300" />
          </button>
          <button
            onClick={() => onDuplicate(test.id)}
            className="group/btn p-2 sm:p-3 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-xl transition-all duration-300 hover:scale-110"
            title="Duplicate Test"
          >
            <FiCopy className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 group-hover/btn:text-emerald-300" />
          </button>
          <button
            onClick={() => onDelete(test.id)}
            className="group/btn p-2 sm:p-3 bg-red-500/20 hover:bg-red-500/30 rounded-xl transition-all duration-300 hover:scale-110"
            title="Delete Test"
          >
            <FiTrash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 group-hover/btn:text-red-300" />
          </button>
        </div>
      </div>
    </div>
  );
};

const TestSeriesEditor = ({ 
  testSeries, 
  onBack, 
  onCreateManualTest, 
  onCreateAITest,
  onEditTest,
  onSeriesUpdated,
  onSeriesDeleted 
}) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUnpublishConfirm, setShowUnpublishConfirm] = useState(false);
  
  // Toast State
  const [toasts, setToasts] = useState([]);
  
  const [seriesData, setSeriesData] = useState({
    title: testSeries?.title || '',
    description: testSeries?.description || '',
    isPaid: testSeries?.isPaid || false,
    price: testSeries?.price || 0,
    category: testSeries?.category || 'education',
    examCategory: testSeries?.examCategory || '',
    examSubcategory: testSeries?.examSubcategory || '',
    difficulty: testSeries?.difficulty || 'medium',
    estimatedDuration: testSeries?.estimatedDuration || 60,
    tags: testSeries?.tags || [],
    coverImageUrl: testSeries?.coverImageUrl || '',
    isPublished: testSeries?.isPublished || true,
    isActive: testSeries?.isActive || true
  });

  const [tests, setTests] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);

  // Toast Functions
  const addToast = (type, title, message, duration = 5000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, type, title, message };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after duration
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccess = (title, message) => addToast('success', title, message);
  const showError = (title, message) => addToast('error', title, message);
  const showWarning = (title, message) => addToast('warning', title, message);
  const showInfo = (title, message) => addToast('info', title, message);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadTests();
  }, [testSeries]);

  const loadTests = async () => {
    try {
      const q = query(
        collection(db, 'quizzes'),
        where('testSeriesId', '==', testSeries.id)
      );
      const querySnapshot = await getDocs(q);
      const testsData = [];
      querySnapshot.forEach((doc) => {
        testsData.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort by order or creation date
      testsData.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
        return a.createdAt?.toDate() - b.createdAt?.toDate();
      });
      
      setTests(testsData);
    } catch (error) {
      console.error('Error loading tests:', error);
      showError('Loading Failed', 'Failed to load tests. Please refresh the page.');
    }
  };

  const handleSeriesUpdate = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'test-series', testSeries.id), {
        ...seriesData,
        updatedAt: new Date()
      });
      
      onSeriesUpdated({ ...testSeries, ...seriesData });
      showSuccess('Series Updated', 'Test series has been updated successfully!');
    } catch (error) {
      console.error('Error updating series:', error);
      showError('Update Failed', 'Failed to update series. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSeriesDelete = async () => {
    setLoading(true);
    try {
      // Delete all tests in the series first
      const batch = writeBatch(db);
      tests.forEach(test => {
        batch.delete(doc(db, 'quizzes', test.id));
      });
      
      // Delete the series
      batch.delete(doc(db, 'test-series', testSeries.id));
      
      await batch.commit();
      
      showSuccess('Series Deleted', 'Test series and all its tests have been deleted successfully!');
      
      setTimeout(() => {
        onSeriesDeleted();
      }, 2000);
    } catch (error) {
      console.error('Error deleting series:', error);
      showError('Deletion Failed', 'Failed to delete series. Please try again.');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleTestDelete = async (testId) => {
    if (window.confirm('Are you sure you want to delete this test? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'quizzes', testId));
        setTests(prev => prev.filter(test => test.id !== testId));
        
        // Update series test count
        await updateDoc(doc(db, 'test-series', testSeries.id), {
          totalQuizzes: Math.max(0, tests.length - 1),
          updatedAt: new Date()
        });
        
        showSuccess('Test Deleted', 'Test has been deleted successfully!');
      } catch (error) {
        console.error('Error deleting test:', error);
        showError('Deletion Failed', 'Failed to delete test. Please try again.');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTests.length === 0) return;
    
    if (window.confirm(`Delete ${selectedTests.length} selected tests? This action cannot be undone.`)) {
      try {
        const batch = writeBatch(db);
        selectedTests.forEach(testId => {
          batch.delete(doc(db, 'quizzes', testId));
        });
        
        await batch.commit();
        setTests(prev => prev.filter(test => !selectedTests.includes(test.id)));
        setSelectedTests([]);
        
        showSuccess('Tests Deleted', `${selectedTests.length} tests have been deleted successfully!`);
      } catch (error) {
        console.error('Error bulk deleting tests:', error);
        showError('Deletion Failed', 'Failed to delete selected tests. Please try again.');
      }
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = tests.findIndex((item) => item.id === active.id);
      const newIndex = tests.findIndex((item) => item.id === over.id);
      
      const newTests = arrayMove(tests, oldIndex, newIndex);
      setTests(newTests);

      // Update order in database
      try {
        const batch = writeBatch(db);
        newTests.forEach((test, index) => {
          batch.update(doc(db, 'quizzes', test.id), { order: index });
        });
        await batch.commit();
        showInfo('Order Updated', 'Test order has been updated successfully!');
      } catch (error) {
        console.error('Error updating test order:', error);
        showError('Update Failed', 'Failed to update test order.');
      }
    }
  };

  const handleDuplicateTest = async (testId) => {
    try {
      const testToDuplicate = tests.find(t => t.id === testId);
      if (!testToDuplicate) return;

      const duplicatedTest = {
        ...testToDuplicate,
        title: `${testToDuplicate.title} (Copy)`,
        createdAt: new Date(),
        totalAttempts: 0,
        averageScore: 0,
        order: tests.length
      };
      
      delete duplicatedTest.id;

      const docRef = await addDoc(collection(db, 'quizzes'), duplicatedTest);
      setTests(prev => [...prev, { id: docRef.id, ...duplicatedTest }]);
      
      showSuccess('Test Duplicated', 'Test has been duplicated successfully!');
    } catch (error) {
      console.error('Error duplicating test:', error);
      showError('Duplication Failed', 'Failed to duplicate test. Please try again.');
    }
  };

  const exportSeriesData = () => {
    try {
      const exportData = {
        series: seriesData,
        tests: tests.map(({ id, ...test }) => test)
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${seriesData.title.replace(/\s+/g, '_')}_export.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showSuccess('Export Complete', 'Series data has been exported successfully!');
    } catch (error) {
      console.error('Error exporting series:', error);
      showError('Export Failed', 'Failed to export series data.');
    }
  };

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterBy === 'ai') return matchesSearch && test.isAIGenerated;
    if (filterBy === 'manual') return matchesSearch && !test.isAIGenerated;
    if (filterBy === 'draft') return matchesSearch && !test.isPublished;
    
    return matchesSearch;
  });

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    return timestamp.toDate?.().toLocaleDateString('en-IN') || new Date(timestamp).toLocaleDateString('en-IN');
  };

  const renderGeneralTab = () => (
    <div className="space-y-10">
      {/* Enhanced Basic Information */}
      <div className="relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border border-gray-600/40 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl sm:rounded-3xl"></div>
        <div className="relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 sm:mb-8">
            <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl shadow-lg">
              <FiBookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">Basic Information</h3>
              <p className="text-gray-400 text-base sm:text-lg">Configure your test series details</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                <FiTarget className="w-4 h-4 text-blue-400" />
                Series Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={seriesData.title}
                onChange={(e) => setSeriesData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl bg-gray-900/60 backdrop-blur-sm border border-gray-600/40 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 font-medium text-sm sm:text-base"
                placeholder="Enter test series title"
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                <FiImage className="w-4 h-4 text-green-400" />
                Cover Image URL
              </label>
              <input
                type="url"
                placeholder="https://res.cloudinary.com/your-cloud/image/upload/..."
                value={seriesData.coverImageUrl}
                onChange={(e) => setSeriesData(prev => ({ ...prev, coverImageUrl: e.target.value }))}
                className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl bg-gray-900/60 backdrop-blur-sm border border-gray-600/40 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 font-medium text-sm sm:text-base"
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

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                <FiLayers className="w-4 h-4 text-purple-400" />
                General Category
              </label>
              <select
                value={seriesData.category}
                onChange={(e) => setSeriesData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl bg-gray-900/60 backdrop-blur-sm border border-gray-600/40 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none transition-all duration-300 font-medium text-sm sm:text-base"
              >
                <option value="education">📚 Education</option>
                <option value="competitive">🏆 Competitive Exams</option>
                <option value="programming">💻 Programming</option>
                <option value="business">💼 Business</option>
                <option value="science">🔬 Science</option>
                <option value="language">🗣️ Language</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                <FiFilter className="w-4 h-4 text-blue-400" />
                Exam Category
              </label>
              <select
                value={seriesData.examCategory}
                onChange={(e) => {
                  setSeriesData(prev => ({ 
                    ...prev, 
                    examCategory: e.target.value,
                    examSubcategory: '' // Reset subcategory when main category changes
                  }));
                }}
                className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl bg-gray-900/60 backdrop-blur-sm border border-gray-600/40 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-all duration-300 font-medium text-sm sm:text-base"
              >
                <option value="">Select Exam Category</option>
                {examCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                <FiTarget className="w-4 h-4 text-green-400" />
                Specific Exam
              </label>
              <select
                value={seriesData.examSubcategory}
                onChange={(e) => setSeriesData(prev => ({ ...prev, examSubcategory: e.target.value }))}
                disabled={!seriesData.examCategory}
                className={`w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl backdrop-blur-sm border appearance-none transition-all duration-300 font-medium text-sm sm:text-base ${
                  seriesData.examCategory
                    ? 'bg-gray-900/60 border-gray-600/40 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
                    : 'bg-gray-800/40 border-gray-700/40 text-gray-500 cursor-not-allowed'
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
          </div>

          <div className="mt-6 sm:mt-8 space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
              <FiEdit className="w-4 h-4 text-emerald-400" />
              Description
            </label>
            <textarea
              value={seriesData.description}
              onChange={(e) => setSeriesData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl bg-gray-900/60 backdrop-blur-sm border border-gray-600/40 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 font-medium h-24 sm:h-32 resize-none text-sm sm:text-base"
              rows="4"
              placeholder="Describe your test series..."
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mt-6 sm:mt-8">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                <FiTrendingUp className="w-4 h-4 text-orange-400" />
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  { value: 'easy', label: 'Easy', color: 'emerald', emoji: '🟢' },
                  { value: 'medium', label: 'Medium', color: 'yellow', emoji: '🟡' },
                  { value: 'hard', label: 'Hard', color: 'red', emoji: '🔴' }
                ].map(diff => (
                  <button
                    key={diff.value}
                    type="button"
                    onClick={() => setSeriesData(prev => ({ ...prev, difficulty: diff.value }))}
                    className={`p-3 sm:p-4 rounded-xl text-center font-semibold transition-all duration-300 text-sm sm:text-base ${
                      seriesData.difficulty === diff.value
                        ? `bg-gradient-to-r from-${diff.color}-500 to-${diff.color}-600 text-white shadow-lg scale-105`
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:scale-102'
                    }`}
                  >
                    <div className="text-xl sm:text-2xl mb-1">{diff.emoji}</div>
                    {diff.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                <FiClock className="w-4 h-4 text-blue-400" />
                Estimated Duration (minutes)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="30"
                  max="600"
                  value={seriesData.estimatedDuration}
                  onChange={(e) => setSeriesData(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || 60 }))}
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl bg-gray-900/60 backdrop-blur-sm border border-gray-600/40 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 font-medium text-sm sm:text-base"
                />
                <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <FiClock className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Pricing Settings */}
      <div className="relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border border-gray-600/40 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5 rounded-2xl sm:rounded-3xl"></div>
        <div className="relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 sm:mb-8">
            <div className="p-3 sm:p-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl sm:rounded-2xl shadow-lg">
              <FaGem className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">Pricing Settings</h3>
              <p className="text-gray-400 text-base sm:text-lg">Configure monetization options</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
            <button
              onClick={() => setSeriesData(prev => ({ ...prev, isPaid: !prev.isPaid }))}
              className={`group relative flex items-center gap-3 sm:gap-4 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold transition-all duration-500 text-sm sm:text-base ${
                seriesData.isPaid
                  ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-2xl shadow-emerald-500/25'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-green-400/20 rounded-xl sm:rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-2 sm:gap-3">
                {seriesData.isPaid ? (
                  <>
                    <FaCrown className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span className="text-lg sm:text-xl">Premium Series</span>
                  </>
                ) : (
                  <>
                    <FiGlobe className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span className="text-lg sm:text-xl">Free Series</span>
                  </>
                )}
              </div>
            </button>
          </div>

          {seriesData.isPaid && (
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                  <FiDollarSign className="w-4 h-4 text-emerald-400" />
                  Series Price (₹)
                </label>
                <div className="relative max-w-md">
                  <input
                    type="number"
                    min="49"
                    max="9999"
                    value={seriesData.price}
                    onChange={(e) => setSeriesData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl bg-gray-900/60 backdrop-blur-sm border border-gray-600/40 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 font-bold text-lg sm:text-2xl"
                  />
                  <div className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-lg sm:text-2xl text-emerald-400">₹</div>
                </div>
              </div>
              
              <div className="relative bg-gradient-to-r from-emerald-500/10 to-green-500/10 backdrop-blur-sm border border-emerald-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                  <FaMagic className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
                </div>
                <h5 className="font-bold text-emerald-300 text-lg sm:text-xl mb-3">
                  Platform Receives Per Sale:
                </h5>
                <div className="text-3xl sm:text-4xl font-black text-emerald-400 mb-2">
                  ₹{Math.floor(seriesData.price)}
                </div>
                <div className="text-emerald-200 text-xs sm:text-sm">
                  Revenue share removed. 100% goes to platform.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Publishing Controls */}
      <div className="relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border border-gray-600/40 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 rounded-2xl sm:rounded-3xl"></div>
        <div className="relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 sm:mb-8">
            <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl sm:rounded-2xl shadow-lg">
              <FiSettings className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">Publishing Controls</h3>
              <p className="text-gray-400 text-base sm:text-lg">Manage visibility and access</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <div className="relative bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-sm border border-blue-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <FiEye className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                    <div className="font-bold text-white text-lg sm:text-xl">Published Status</div>
                  </div>
                  <div className="text-gray-300 text-sm sm:text-base">
                    {seriesData.isPublished ? 'Visible to all users' : 'Hidden from public view'}
                  </div>
                </div>
                <button
                  onClick={() => setSeriesData(prev => ({ ...prev, isPublished: !prev.isPublished }))}
                  className={`p-3 sm:p-4 rounded-xl transition-all duration-300 hover:scale-110 ${
                    seriesData.isPublished
                      ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                      : 'bg-gray-600/50 text-gray-400 hover:bg-gray-500/50'
                  }`}
                >
                  {seriesData.isPublished ? <FiEye className="w-6 h-6 sm:w-8 sm:h-8" /> : <FiEyeOff className="w-6 h-6 sm:w-8 sm:h-8" />}
                </button>
              </div>
            </div>

            <div className="relative bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 backdrop-blur-sm border border-emerald-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <FiShield className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
                    <div className="font-bold text-white text-lg sm:text-xl">Active Status</div>
                  </div>
                  <div className="text-gray-300 text-sm sm:text-base">
                    {seriesData.isActive ? 'Accepting new subscribers' : 'Closed for subscriptions'}
                  </div>
                </div>
                <button
                  onClick={() => setSeriesData(prev => ({ ...prev, isActive: !prev.isActive }))}
                  className={`p-3 sm:p-4 rounded-xl transition-all duration-300 hover:scale-110 ${
                    seriesData.isActive
                      ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                      : 'bg-gray-600/50 text-gray-400 hover:bg-gray-500/50'
                  }`}
                >
                  {seriesData.isActive ? <FiCheck className="w-6 h-6 sm:w-8 sm:h-8" /> : <FiX className="w-6 h-6 sm:w-8 sm:h-8" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Save Button */}
      <div className="flex justify-center">
        <button
          onClick={handleSeriesUpdate}
          disabled={loading}
          className="group relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl sm:rounded-2xl px-8 sm:px-12 py-4 sm:py-5 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-xl sm:rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative flex items-center gap-3 sm:gap-4">
            {loading ? (
              <>
                <div className="w-5 h-5 sm:w-6 sm:h-6 border-3 sm:border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="text-lg sm:text-xl">Saving Changes...</span>
              </>
            ) : (
              <>
                <FiSave className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-lg sm:text-xl">Save Changes</span>
                <FiChevronRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </div>
        </button>
      </div>
    </div>
  );

  const renderTestsTab = () => (
    <div className="space-y-8">
      {/* Enhanced Test Management Header */}
      <div className="relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border border-gray-600/40 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-xl sm:rounded-2xl"></div>
        <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl shadow-lg">
              <FiBookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Tests Management ({tests.length})
              </h3>
              <p className="text-gray-400 text-base sm:text-lg">
                Create, edit, and organize tests in your series
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <button
              onClick={onCreateManualTest}
              className="group bg-gradient-to-r from-gray-700/80 to-gray-600/80 backdrop-blur-xl border border-gray-600/40 text-gray-300 rounded-xl px-4 sm:px-6 py-3 font-medium hover:from-gray-600/80 hover:to-gray-500/80 transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 shadow-lg hover:shadow-xl hover:scale-105 text-sm sm:text-base"
            >
              <FiEdit className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Manual Test</span>
            </button>
            <button
              onClick={onCreateAITest}
              className="group relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl px-4 sm:px-6 py-3 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-purple-500/25 text-sm sm:text-base"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center gap-2 sm:gap-3">
                <FaRobot className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>AI Generate</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Bulk Actions */}
      {selectedTests.length > 0 && (
        <div className="relative bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <FiCheck className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <span className="font-bold text-blue-300 text-lg">
                  {selectedTests.length} test{selectedTests.length !== 1 ? 's' : ''} selected
                </span>
                <p className="text-blue-200/70 text-sm">Bulk actions available</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleBulkDelete}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center gap-2 font-semibold shadow-lg hover:shadow-red-500/25 hover:scale-105"
              >
                <FiTrash2 className="w-5 h-5" />
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedTests([])}
                className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-300 font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Search and Filter */}
      <div className="relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border border-gray-600/40 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 rounded-xl sm:rounded-2xl"></div>
        <div className="relative flex flex-col sm:flex-row gap-4 sm:gap-6">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
            <input
              type="text"
              placeholder="Search tests by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 sm:pl-14 pr-4 sm:pr-6 py-3 sm:py-4 rounded-xl bg-gray-900/60 backdrop-blur-sm border border-gray-600/40 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 font-medium text-sm sm:text-base"
            />
          </div>
          
          <div className="relative">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-4 sm:px-6 py-3 sm:py-4 rounded-xl bg-gray-900/60 backdrop-blur-sm border border-gray-600/40 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none transition-all duration-300 font-medium min-w-[140px] sm:min-w-[160px] text-sm sm:text-base"
            >
              <option value="all">All Tests</option>
              <option value="manual">Manual Tests</option>
              <option value="ai">AI Generated</option>
              <option value="draft">Draft Tests</option>
            </select>
            <FiFilter className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Enhanced Tests List */}
      <div className="relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border border-gray-600/40 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-2xl sm:rounded-3xl"></div>
        <div className="relative">
          {filteredTests.length > 0 ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={filteredTests.map(test => test.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-4 sm:space-y-6">
                  {filteredTests.map((test) => (
                    <SortableTestItem
                      key={test.id}
                      test={test}
                      isSelected={selectedTests.includes(test.id)}
                      onSelect={(selected) => {
                        if (selected) {
                          setSelectedTests(prev => [...prev, test.id]);
                        } else {
                          setSelectedTests(prev => prev.filter(id => id !== test.id));
                        }
                      }}
                      onEdit={onEditTest}
                      onDelete={handleTestDelete}
                      onDuplicate={handleDuplicateTest}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="text-center py-12 sm:py-20">
              <div className="mb-6 sm:mb-8">
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <FiBookOpen className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
                {searchTerm || filterBy !== 'all' ? 'No matching tests found' : 'No tests created yet'}
              </h3>
              <p className="text-gray-400 text-sm sm:text-lg mb-6 sm:mb-8 max-w-md mx-auto">
                {searchTerm || filterBy !== 'all' 
                  ? 'Try adjusting your search or filter criteria to find tests'
                  : 'Get started by creating your first test for this series'
                }
              </p>
              {(!searchTerm && filterBy === 'all') && (
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <button 
                    onClick={onCreateManualTest} 
                    className="group bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-semibold rounded-xl px-4 sm:px-6 py-3 transition-all duration-300 hover:scale-105 shadow-lg text-sm sm:text-base"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <FiEdit className="w-4 h-4 sm:w-5 sm:h-5" />
                      Create Manual Test
                    </div>
                  </button>
                  <button 
                    onClick={onCreateAITest} 
                    className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl px-4 sm:px-6 py-3 transition-all duration-300 hover:scale-105 shadow-lg text-sm sm:text-base"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <FaRobot className="w-4 h-4 sm:w-5 sm:h-5" />
                      Generate with AI
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderDangerZone = () => (
    <div className="space-y-8">
      <div className="relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border border-red-600/40 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-orange-500/5 rounded-2xl sm:rounded-3xl"></div>
        <div className="relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8 sm:mb-10">
            <div className="p-3 sm:p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-xl sm:rounded-2xl shadow-lg">
              <FiAlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-red-400 mb-2">Danger Zone</h3>
              <p className="text-gray-400 text-base sm:text-lg">Irreversible actions for series management</p>
            </div>
          </div>
          
          <div className="space-y-8">
            {/* Export Data */}
            <div className="relative bg-gradient-to-r from-blue-500/10 to-cyan-500/10 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-8">
              <div className="absolute top-6 right-6">
                <FiDownload className="w-8 h-8 text-blue-400" />
              </div>
              <div className="pr-16">
                <h4 className="font-bold text-white text-xl mb-3">
                  Export Series Data
                </h4>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Download a complete backup of your series including all tests, settings, and configurations in JSON format.
                </p>
                <button
                  onClick={exportSeriesData}
                  className="group bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold rounded-xl px-8 py-4 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-500/25"
                >
                  <div className="flex items-center gap-3">
                    <FiDownload className="w-5 h-5" />
                    <span>Export Data</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Unpublish Series */}
            <div className="relative bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-8">
              <div className="absolute top-6 right-6">
                <FiEyeOff className="w-8 h-8 text-yellow-400" />
              </div>
              <div className="pr-16">
                <h4 className="font-bold text-white text-xl mb-3">
                  Unpublish Series
                </h4>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Hide this series from public view while preserving all data. You can republish it anytime later.
                </p>
                <button
                  onClick={() => setShowUnpublishConfirm(true)}
                  disabled={!seriesData.isPublished}
                  className="group bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold rounded-xl px-8 py-4 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-yellow-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <div className="flex items-center gap-3">
                    <FiEyeOff className="w-5 h-5" />
                    <span>Unpublish Series</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Delete Series */}
            <div className="relative bg-gradient-to-r from-red-500/10 to-pink-500/10 backdrop-blur-sm border border-red-500/30 rounded-2xl p-8">
              <div className="absolute top-6 right-6">
                <FiTrash2 className="w-8 h-8 text-red-400" />
              </div>
              <div className="pr-16">
                <h4 className="font-bold text-red-400 text-xl mb-3">
                  Delete Test Series
                </h4>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Permanently delete this entire series including all {tests.length} tests, user progress, and analytics. This action cannot be undone.
                </p>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="group bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold rounded-xl px-8 py-4 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-red-500/25"
                >
                  <div className="flex items-center gap-3">
                    <FiTrash2 className="w-5 h-5" />
                    <span>Delete Series Forever</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/10 to-purple-900/10">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Toast Container */}
        <ToastContainer toasts={toasts} onClose={removeToast} />

        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
        </div>

        {/* Enhanced Header */}
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-8 sm:mb-12">
          <button
            onClick={onBack}
            className="group bg-gradient-to-r from-gray-800/80 to-gray-700/80 backdrop-blur-xl border border-gray-600/40 text-gray-300 rounded-xl px-4 sm:px-6 py-3 text-sm font-medium hover:from-gray-700/80 hover:to-gray-600/80 transition-all duration-300 flex items-center gap-2 sm:gap-3 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <FiArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:-translate-x-1" />
            <span>Back to Dashboard</span>
          </button>
          
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-purple-200 mb-2 sm:mb-3 leading-tight">
              Edit Test Series
            </h1>
            <p className="text-base sm:text-xl text-gray-400 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              <FiTarget className="w-4 h-4 sm:w-6 sm:h-6 text-blue-400" />
              <span className="text-blue-400 font-semibold px-2 sm:px-3 py-1 bg-blue-500/20 rounded-lg text-sm sm:text-base">
                {testSeries.title}
              </span>
            </p>
          </div>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="relative z-10 flex gap-2 sm:gap-3 mb-8 sm:mb-12 overflow-x-auto pb-2">
          {[
            { id: 'general', label: 'General Settings', icon: FiSettings, color: 'blue' },
            { id: 'tests', label: 'Tests Management', icon: FiBookOpen, color: 'purple' },
            { id: 'danger', label: 'Advanced Settings', icon: FiAlertTriangle, color: 'red' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group relative flex items-center gap-2 sm:gap-3 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold transition-all duration-300 whitespace-nowrap text-sm sm:text-base ${
                activeTab === tab.id
                  ? `bg-gradient-to-r from-${tab.color}-500 to-${tab.color}-600 text-white shadow-2xl shadow-${tab.color}-500/25 scale-105`
                  : 'bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 text-gray-300 hover:bg-gray-700/60 hover:scale-102 shadow-lg'
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-r from-${tab.color}-400/20 to-${tab.color}-500/20 rounded-xl sm:rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              <div className="relative flex items-center gap-2 sm:gap-3">
                <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="relative z-10">
          {activeTab === 'general' && renderGeneralTab()}
          {activeTab === 'tests' && renderTestsTab()}
          {activeTab === 'danger' && renderDangerZone()}
        </div>

        {/* Enhanced Confirmation Modals */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="relative bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl border border-red-600/40 rounded-2xl sm:rounded-3xl p-6 sm:p-10 max-w-lg mx-auto shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-2xl sm:rounded-3xl"></div>
              <div className="relative text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl">
                  <FiAlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
                  Delete Test Series Forever?
                </h3>
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
                  <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                    This will permanently delete <span className="font-bold text-red-400">"{testSeries.title}"</span> and all <span className="font-bold text-red-400">{tests.length} tests</span>. 
                  </p>
                  <p className="text-red-400 font-bold mt-2 text-sm sm:text-base">This action cannot be undone!</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-xl px-4 sm:px-6 py-3 sm:py-4 transition-colors text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSeriesDelete}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-xl px-4 sm:px-6 py-3 sm:py-4 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-red-500/25 text-sm sm:text-base"
                  >
                    {loading ? 'Deleting...' : 'Delete Forever'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showUnpublishConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="relative bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl border border-yellow-600/40 rounded-2xl sm:rounded-3xl p-6 sm:p-10 max-w-lg mx-auto shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-2xl sm:rounded-3xl"></div>
              <div className="relative text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl">
                  <FiEyeOff className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
                  Unpublish Series?
                </h3>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
                  <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                    This will hide <span className="font-bold text-yellow-400">"{testSeries.title}"</span> from public view. You can republish it later anytime.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={() => setShowUnpublishConfirm(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-xl px-4 sm:px-6 py-3 sm:py-4 transition-colors text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await updateDoc(doc(db, 'test-series', testSeries.id), {
                          isPublished: false,
                          updatedAt: new Date()
                        });
                        setSeriesData(prev => ({ ...prev, isPublished: false }));
                        setShowUnpublishConfirm(false);
                        showWarning('Series Unpublished', 'Test series has been hidden from public view.');
                      } catch (error) {
                        showError('Unpublish Failed', 'Failed to unpublish series. Please try again.');
                      }
                    }}
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold rounded-xl px-4 sm:px-6 py-3 sm:py-4 transition-all duration-300 shadow-lg hover:shadow-yellow-500/25 text-sm sm:text-base"
                  >
                    Unpublish
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced CSS Animations */}
        <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }
        
        .animate-shrink {
          animation: shrink 5s linear forwards;
        }
      `}</style>
    </div>
  );
};

export default TestSeriesEditor;
