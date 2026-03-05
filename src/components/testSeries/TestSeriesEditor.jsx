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
import { useTheme } from '../../contexts/ThemeContext';
import { examCategories } from '../../utils/constants/examCategories';
import ImageAdjustment from '../common/ImageAdjustment';
import {
  FiEdit, FiTrash2, FiSave, FiArrowLeft, FiPlus, FiEye, FiEyeOff,
  FiSettings, FiDollarSign, FiBookOpen, FiClock, FiUsers, FiCopy,
  FiDownload, FiUpload, FiAlertTriangle, FiCheck, FiX, FiFilter,
  FiSearch, FiMenu, FiTarget, FiTrendingUp, FiChevronRight,
  FiShield, FiGlobe, FiInfo, FiCheckCircle, FiXCircle, FiAlertCircle, FiImage,
  FiPackage, FiFile, FiToggleLeft, FiToggleRight
} from 'react-icons/fi';
import { FaRobot, FaMagic, FaGem, FaCrown } from 'react-icons/fa';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';

// --- UI COMPONENTS ---

const GlassCard = ({ children, className = "", gradient = "blue" }) => {
  const { isDark } = useTheme();

  const gradients = {
    blue: isDark ? "from-blue-500/10 to-purple-500/10" : "from-blue-50 to-purple-50",
    red: isDark ? "from-red-500/10 to-orange-500/10" : "from-red-50 to-orange-50",
    green: isDark ? "from-emerald-500/10 to-teal-500/10" : "from-emerald-50 to-teal-50",
    none: ""
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-3xl border transition-all duration-300 ${isDark
        ? "bg-gray-900/60 border-white/10 shadow-2xl shadow-black/50"
        : "bg-white/80 border-slate-200 shadow-xl shadow-slate-200/50"
        } backdrop-blur-xl ${className}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradients[gradient]} opacity-50 pointer-events-none`} />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};

const SectionHeader = ({ icon: Icon, title, subtitle, color = "text-blue-500" }) => {
  const { isDark } = useTheme();
  return (
    <div className="flex items-center gap-5 mb-8 border-b border-gray-200/10 pb-6">
      <div className={`p-4 rounded-2xl bg-gradient-to-br ${color.replace('text-', 'from-')}/20 to-transparent border border-white/5 shadow-inner`}>
        <Icon className={`w-8 h-8 ${color}`} />
      </div>
      <div>
        <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {title}
        </h3>
        <p className={`${isDark ? 'text-gray-400' : 'text-slate-500'} text-sm mt-1 font-medium`}>{subtitle}</p>
      </div>
    </div>
  );
};

const StyledInput = ({ label, icon: Icon, ...props }) => {
  const { isDark } = useTheme();
  return (
    <div className="space-y-2 group">
      {label && (
        <label className={`text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 ${isDark ? 'text-gray-400 group-focus-within:text-blue-400' : 'text-slate-500 group-focus-within:text-blue-600'
          }`}>
          {Icon && <Icon />} {label}
        </label>
      )}
      <div className="relative">
        <input
          {...props}
          className={`w-full px-5 py-4 rounded-xl border-2 outline-none transition-all duration-300 font-medium ${isDark
            ? "bg-gray-800/50 border-gray-700 text-white focus:border-blue-500 focus:bg-gray-800 placeholder-gray-500"
            : "bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:bg-white placeholder-slate-400"
            }`}
        />
      </div>
    </div>
  );
};

// --- TOAST SYSTEM ---

const Toast = ({ toast, onClose }) => {
  const { isDark } = useTheme();

  const variants = {
    initial: { opacity: 0, x: 50, scale: 0.9 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
  };

  const types = {
    success: { icon: FiCheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    error: { icon: FiXCircle, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
    warning: { icon: FiAlertCircle, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    info: { icon: FiInfo, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" }
  };

  const style = types[toast.type] || types.info;
  const Icon = style.icon;

  return (
    <motion.div
      layout
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`relative flex items-center gap-4 p-4 pr-12 rounded-2xl border backdrop-blur-xl shadow-2xl mb-3 overflow-hidden ${style.bg} ${style.border}`}
    >
      <div className={`p-2 rounded-xl bg-white/10 ${style.color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h4 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{toast.title}</h4>
        <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>{toast.message}</p>
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="absolute top-2 right-2 p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors opacity-50 hover:opacity-100"
      >
        <FiX className="w-4 h-4" />
      </button>
      <motion.div
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: 5, ease: "linear" }}
        className={`absolute bottom-0 left-0 h-1 ${style.color.replace('text', 'bg')} opacity-50`}
      />
    </motion.div>
  );
};

const ToastContainer = ({ toasts, onClose }) => (
  <div className="fixed top-24 right-6 z-50 w-full max-w-sm flex flex-col items-end pointer-events-none">
    <div className="pointer-events-auto w-full">
      <AnimatePresence mode='popLayout'>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  </div>
);

// --- SORTABLE LIST ITEM ---

const SortableTestItem = ({ test, isSelected, onSelect, onEdit, onDelete, onDuplicate }) => {
  const { isDark } = useTheme();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: test.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={`relative group mb-3 touch-none`}>
      <div
        className={`
          flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300
          ${isDragging
            ? 'scale-105 shadow-2xl ring-2 ring-blue-500 bg-blue-900/20 border-blue-500/50'
            : isDark
              ? 'bg-gray-800/40 border-gray-700/50 hover:bg-gray-800 hover:border-gray-600'
              : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-lg'
          }
        `}
      >
        {/* Drag Handle */}
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 rounded-lg hover:bg-gray-500/20 text-gray-400">
          <FiMenu className="w-5 h-5" />
        </div>

        {/* Checkbox */}
        <div className="relative flex items-center justify-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(e.target.checked)}
            className="w-5 h-5 rounded-md border-gray-500 text-blue-600 focus:ring-blue-500 bg-transparent cursor-pointer"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h4 className={`text-lg font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {test.title}
            </h4>
            {test.isAIGenerated && (
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-500 text-xs font-bold flex items-center gap-1">
                <FaRobot className="w-3 h-3" /> AI
              </span>
            )}
            {!test.isPublished && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-500 text-xs font-bold">
                Draft
              </span>
            )}
          </div>

          <div className={`flex items-center gap-4 text-xs font-medium ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
            <span className="flex items-center gap-1"><FiBookOpen /> {test.questions?.length || 0} Qs</span>
            <span className="flex items-center gap-1"><FiClock /> {test.timeLimit || 0}m</span>
            <span className="flex items-center gap-1"><FiUsers /> {test.totalAttempts || 0}</span>
          </div>
        </div>

        {/* Actions - Visible on Hover */}
        <div className={`flex items-center gap-1 transition-opacity duration-200 ${isDragging ? 'opacity-0' : 'opacity-100 sm:opacity-0 sm:group-hover:opacity-100'}`}>
          <button onClick={() => onEdit(test)} className="p-2 rounded-lg hover:bg-blue-500/20 text-gray-400 hover:text-blue-500 transition-colors" title="Edit">
            <FiEdit />
          </button>
          <button onClick={() => onDuplicate(test.id)} className="p-2 rounded-lg hover:bg-emerald-500/20 text-gray-400 hover:text-emerald-500 transition-colors" title="Duplicate">
            <FiCopy />
          </button>
          <button onClick={() => onDelete(test.id)} className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
            <FiTrash2 />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

const TestSeriesEditor = ({
  testSeries,
  onBack,
  onCreateManualTest,
  onCreateAITest,
  onEditTest,
  onSeriesUpdated,
  onSeriesDeleted
}) => {
  const { isDark } = useTheme();

  // State Management
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showImageAdjustment, setShowImageAdjustment] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [tests, setTests] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);

  const [seriesData, setSeriesData] = useState({
    title: testSeries?.title || '',
    description: testSeries?.description || '',
    isPaid: testSeries?.isPaid || false,
    price: testSeries?.price || 0,
    category: testSeries?.category || 'education',
    examCategory: testSeries?.examCategory || '',
    examSubcategory: testSeries?.examSubcategory || '',
    difficulty: testSeries?.difficulty || 'medium',
    coverImageUrl: testSeries?.coverImageUrl || '',
    isPublished: testSeries?.isPublished ?? true,
    isActive: testSeries?.isActive ?? true,
    negativeMarking: testSeries?.negativeMarking || {
      enabled: false,
      type: 'fractional',
      value: 0.25
    },
    resources: testSeries?.resources || [],
    isCombo: testSeries?.isCombo || false,
    comboIncludes: testSeries?.comboIncludes || ['mock_tests']
  });

  const [newResource, setNewResource] = useState({
    title: '', type: 'pdf', url: '', description: ''
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

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // --- LOGIC FUNCTIONS (Preserved) ---

  const addToast = (type, title, message) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  };

  const handleAddResource = () => {
    if (!newResource.title.trim() || !newResource.url.trim()) return;
    const resource = { id: `res_${Date.now()}`, ...newResource, addedAt: new Date() };
    setSeriesData(prev => ({ ...prev, resources: [...prev.resources, resource] }));
    setNewResource({ title: '', type: 'pdf', url: '', description: '' });
  };

  const handleRemoveResource = (resourceId) => {
    setSeriesData(prev => ({ ...prev, resources: prev.resources.filter(r => r.id !== resourceId) }));
  };

  const handleComboToggle = (option) => {
    setSeriesData(prev => {
      const includes = prev.comboIncludes.includes(option)
        ? prev.comboIncludes.filter(o => o !== option)
        : [...prev.comboIncludes, option];
      return { ...prev, comboIncludes: includes };
    });
  };

  useEffect(() => { loadTests(); }, [testSeries]);

  const loadTests = async () => {
    try {
      const q = query(collection(db, 'quizzes'), where('testSeriesId', '==', testSeries.id));
      const querySnapshot = await getDocs(q);
      const testsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      testsData.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.createdAt?.toDate() - b.createdAt?.toDate());
      setTests(testsData);
    } catch (error) {
      addToast('error', 'Loading Failed', 'Failed to load tests.');
    }
  };

  const handleSeriesUpdate = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'test-series', testSeries.id), { ...seriesData, updatedAt: new Date() });
      onSeriesUpdated({ ...testSeries, ...seriesData });
      addToast('success', 'Series Updated', 'Changes saved successfully!');
    } catch (error) {
      addToast('error', 'Update Failed', 'Failed to update series.');
    } finally {
      setLoading(false);
    }
  };

  const handleSeriesDelete = async () => {
    setLoading(true);
    try {
      const batch = writeBatch(db);
      tests.forEach(test => batch.delete(doc(db, 'quizzes', test.id)));
      batch.delete(doc(db, 'test-series', testSeries.id));
      await batch.commit();
      addToast('success', 'Series Deleted', 'Series deleted successfully!');
      setTimeout(() => onSeriesDeleted(), 1500);
    } catch (error) {
      addToast('error', 'Deletion Failed', 'Failed to delete series.');
      setLoading(false);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = tests.findIndex((item) => item.id === active.id);
      const newIndex = tests.findIndex((item) => item.id === over.id);
      const newTests = arrayMove(tests, oldIndex, newIndex);
      setTests(newTests);

      // Optimistic UI update, then sync
      try {
        const batch = writeBatch(db);
        newTests.forEach((test, index) => batch.update(doc(db, 'quizzes', test.id), { order: index }));
        await batch.commit();
      } catch (error) {
        addToast('error', 'Reorder Failed', 'Could not save new order.');
      }
    }
  };

  const handleTestDelete = async (testId) => {
    if (!window.confirm("Delete this test?")) return;
    try {
      await deleteDoc(doc(db, 'quizzes', testId));
      setTests(prev => prev.filter(t => t.id !== testId));
      addToast('success', 'Deleted', 'Test removed.');
    } catch (e) { console.error(e); }
  }

  const handleDuplicateTest = async (testId) => {
    const t = tests.find(x => x.id === testId);
    if (!t) return;
    try {
      const newT = { ...t, title: `${t.title} (Copy)`, id: undefined, createdAt: new Date() };
      delete newT.id;
      const ref = await addDoc(collection(db, 'quizzes'), newT);
      setTests(prev => [...prev, { id: ref.id, ...newT }]);
      addToast('success', 'Duplicated', 'Test copied.');
    } catch (e) { console.error(e); }
  }

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterBy === 'ai') return matchesSearch && test.isAIGenerated;
    if (filterBy === 'manual') return matchesSearch && !test.isAIGenerated;
    if (filterBy === 'draft') return matchesSearch && !test.isPublished;
    return matchesSearch;
  });

  // --- RENDER HELPERS ---

  const renderTabs = () => (
    <div className="sticky top-0 z-30 pt-4 pb-4 backdrop-blur-md bg-transparent">
      <div className={`p-1.5 rounded-2xl inline-flex gap-1 ${isDark ? 'bg-gray-900/80 border border-white/10' : 'bg-white border border-gray-200'} shadow-lg`}>
        {[
          { id: 'general', label: 'General', icon: FiSettings },
          { id: 'tests', label: 'Tests', icon: FiBookOpen },
          { id: 'resources', label: 'Resources', icon: FiDownload },
          { id: 'danger', label: 'Advanced', icon: FiShield }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === tab.id
              ? isDark ? 'text-white' : 'text-slate-900'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className={`absolute inset-0 rounded-xl ${isDark ? 'bg-blue-600' : 'bg-gray-100'}`}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <tab.icon className={activeTab === tab.id ? 'animate-pulse' : ''} />
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0a] text-white' : 'bg-gray-50 text-slate-900'} font-sans selection:bg-blue-500/30`}>
      {/* Background Noise/Gradient */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className={`absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-20 ${isDark ? 'bg-blue-600' : 'bg-blue-300'}`} />
        <div className={`absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-20 ${isDark ? 'bg-purple-600' : 'bg-purple-300'}`} />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      <ToastContainer toasts={toasts} onClose={(id) => setToasts(p => p.filter(t => t.id !== id))} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className={`p-3 rounded-full border transition-all hover:scale-105 ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                  Edit Series
                </span>
              </h1>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                <span className={`px-2 py-0.5 rounded border ${isDark ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
                  {testSeries.title}
                </span>
                <span>•</span>
                <span>{tests.length} Tests</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSeriesUpdate}
            disabled={loading}
            className="group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 rounded-2xl bg-white/20 blur opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center gap-2">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSave className="w-5 h-5" />}
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </div>
          </button>
        </header>

        {renderTabs()}

        <AnimatePresence mode="wait">
          {activeTab === 'general' && (
            <motion.div
              key="general"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Left Column: Main Info */}
              <div className="lg:col-span-2 space-y-8">
                <GlassCard className="p-8">
                  <SectionHeader icon={FiTarget} title="Basic Details" subtitle="Core information about your test series" />

                  <div className="space-y-6">
                    <StyledInput
                      label="Series Title"
                      value={seriesData.title}
                      onChange={(e) => setSeriesData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g. UPSC Prelims 2024 Ultimate Series"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Target Exam</label>
                        <div className="relative">
                          <select
                            value={seriesData.examSubcategory}
                            onChange={(e) => setSeriesData(prev => ({ ...prev, examSubcategory: e.target.value }))}
                            className={`w-full px-5 py-4 rounded-xl border-2 outline-none appearance-none font-medium ${isDark ? "bg-gray-800/50 border-gray-700 text-white" : "bg-white border-slate-200 text-slate-900"}`}
                          >
                            <option value="">Select Exam</option>
                            {examCategories.flatMap(cat => cat.subcategories).map(sub => (
                              <option key={sub.id} value={sub.id}>{sub.name}</option>
                            ))}
                          </select>
                          <FiChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Difficulty</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['easy', 'medium', 'hard'].map(d => (
                            <button
                              key={d}
                              onClick={() => setSeriesData(p => ({ ...p, difficulty: d }))}
                              className={`py-3 rounded-xl text-sm font-bold capitalize transition-all ${seriesData.difficulty === d
                                ? d === 'easy' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                  : d === 'medium' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                                    : 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                                : isDark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-slate-600 hover:bg-gray-200'
                                }`}
                            >
                              {d}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Description</label>
                      <textarea
                        value={seriesData.description}
                        onChange={(e) => setSeriesData(prev => ({ ...prev, description: e.target.value }))}
                        rows={4}
                        className={`w-full px-5 py-4 rounded-xl border-2 outline-none transition-all duration-300 font-medium ${isDark
                          ? "bg-gray-800/50 border-gray-700 text-white focus:border-blue-500"
                          : "bg-white border-slate-200 text-slate-900 focus:border-blue-500"
                          }`}
                      />
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="p-8" gradient="red">
                  <SectionHeader icon={FiAlertCircle} title="Negative Marking" subtitle="Configure penalty rules" color="text-red-500" />

                  <div className="flex items-center justify-between mb-6 p-4 rounded-xl border border-dashed border-gray-500/30">
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Enable Negative Marking</span>
                    <button
                      onClick={() => setSeriesData(p => ({ ...p, negativeMarking: { ...p.negativeMarking, enabled: !p.negativeMarking.enabled } }))}
                      className={`w-14 h-8 rounded-full p-1 transition-colors ${seriesData.negativeMarking.enabled ? 'bg-red-500' : 'bg-gray-600'}`}
                    >
                      <div className={`w-6 h-6 rounded-full bg-white transition-transform ${seriesData.negativeMarking.enabled ? 'translate-x-6' : ''}`} />
                    </button>
                  </div>

                  {seriesData.negativeMarking.enabled && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className={`text-xs font-bold ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Type</label>
                        <div className="flex p-1 rounded-xl bg-gray-500/10">
                          {['fractional', 'fixed'].map(t => (
                            <button
                              key={t}
                              onClick={() => setSeriesData(p => ({ ...p, negativeMarking: { ...p.negativeMarking, type: t } }))}
                              className={`flex-1 py-2 text-sm font-bold rounded-lg capitalize ${seriesData.negativeMarking.type === t ? 'bg-white text-black shadow-md' : 'text-gray-500'}`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                      <StyledInput
                        label="Value (e.g., 0.25)"
                        type="number"
                        step="0.01"
                        value={seriesData.negativeMarking.value}
                        onChange={(e) => setSeriesData(p => ({ ...p, negativeMarking: { ...p.negativeMarking, value: parseFloat(e.target.value) } }))}
                      />
                    </motion.div>
                  )}
                </GlassCard>
              </div>

              {/* Right Column: Settings & Media */}
              <div className="space-y-8">
                <GlassCard className="p-6">
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-800 mb-4 group">
                    {seriesData.coverImageUrl ? (
                      <img src={seriesData.coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                        <FiImage className="w-8 h-8 mb-2" />
                        <span className="text-xs">No Cover Image</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button onClick={() => setShowImageAdjustment(true)} className="px-4 py-2 bg-white text-black rounded-lg text-sm font-bold">Change</button>
                    </div>
                  </div>
                  <StyledInput
                    placeholder="Image URL..."
                    value={seriesData.coverImageUrl}
                    onChange={(e) => setSeriesData(p => ({ ...p, coverImageUrl: e.target.value }))}
                  />
                  {showImageAdjustment && (
                    <div className="mt-4 p-4 rounded-xl border border-dashed border-gray-500/30">
                      <ImageAdjustment
                        imageUrl={seriesData.coverImageUrl}
                        onUrlChange={(newUrl) => setSeriesData(prev => ({ ...prev, coverImageUrl: newUrl }))}
                        showPreview={false}
                      />
                    </div>
                  )}
                </GlassCard>

                <GlassCard className="p-6" gradient="green">
                  <SectionHeader icon={FiDollarSign} title="Pricing" subtitle="Monetization" color="text-emerald-500" />
                  <button
                    onClick={() => setSeriesData(p => ({ ...p, isPaid: !p.isPaid }))}
                    className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 mb-4 transition-all ${seriesData.isPaid
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                      }`}
                  >
                    {seriesData.isPaid ? <FaCrown /> : <FiGlobe />}
                    {seriesData.isPaid ? 'Premium Series' : 'Free Series'}
                  </button>
                  {seriesData.isPaid && (
                    <div className="relative">
                      <StyledInput
                        type="number"
                        value={seriesData.price}
                        onChange={(e) => setSeriesData(p => ({ ...p, price: parseInt(e.target.value) || 0 }))}
                        className="pl-8"
                      />
                      <span className="absolute left-4 top-[38px] text-gray-500 font-bold">₹</span>
                    </div>
                  )}
                </GlassCard>

                <GlassCard className="p-6">
                  <h4 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Visibility</h4>
                  <div className="space-y-3">
                    <button
                      onClick={() => setSeriesData(p => ({ ...p, isPublished: !p.isPublished }))}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${seriesData.isPublished
                        ? 'bg-blue-500/10 border-blue-500/50 text-blue-600 dark:text-blue-400'
                        : isDark ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white border-slate-200 text-slate-500'
                        }`}
                    >
                      <span className="font-bold flex items-center gap-2"><FiEye /> Published</span>
                      <div className={`w-3 h-3 rounded-full ${seriesData.isPublished ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-gray-500'}`} />
                    </button>
                    <button
                      onClick={() => setSeriesData(p => ({ ...p, isActive: !p.isActive }))}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${seriesData.isActive
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-600 dark:text-emerald-400'
                        : isDark ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white border-slate-200 text-slate-500'
                        }`}
                    >
                      <span className="font-bold flex items-center gap-2"><FiCheckCircle /> Active Status</span>
                      <div className={`w-3 h-3 rounded-full ${seriesData.isActive ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-gray-500'}`} />
                    </button>
                  </div>
                </GlassCard>
              </div>
            </motion.div>
          )}

          {activeTab === 'tests' && (
            <motion.div
              key="tests"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Tests Toolbar */}
              <GlassCard className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between sticky top-24 z-20">
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className={`relative flex-1 md:w-64 flex items-center px-4 py-3 rounded-xl border transition-all ${isDark ? 'bg-gray-900 border-gray-700 focus-within:border-blue-500' : 'bg-white border-slate-200 focus-within:border-blue-500'}`}>
                    <FiSearch className="text-gray-400 mr-2" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className={`bg-transparent outline-none w-full text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <select
                      value={filterBy}
                      onChange={(e) => setFilterBy(e.target.value)}
                      className={`h-full px-4 py-3 rounded-xl border appearance-none outline-none text-sm font-bold cursor-pointer ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                    >
                      <option value="all">All</option>
                      <option value="manual">Manual</option>
                      <option value="ai">AI</option>
                      <option value="draft">Drafts</option>
                    </select>
                    <FiFilter className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                  </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                  <button
                    onClick={onCreateManualTest}
                    className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all border ${isDark ? 'bg-gray-800 hover:bg-gray-700 text-white border-gray-700' : 'bg-white hover:bg-gray-50 text-slate-900 border-slate-200'}`}
                  >
                    <FiEdit /> <span className="hidden sm:inline">Manual</span>
                  </button>
                  <button
                    onClick={onCreateAITest}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold transition-all shadow-lg shadow-purple-500/25"
                  >
                    <FaRobot /> <span className="hidden sm:inline">AI Generate</span>
                  </button>
                </div>
              </GlassCard>

              {/* List */}
              <div className="min-h-[400px]">
                {filteredTests.length > 0 ? (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={filteredTests.map(t => t.id)} strategy={verticalListSortingStrategy}>
                      {filteredTests.map((test) => (
                        <SortableTestItem
                          key={test.id}
                          test={test}
                          isSelected={selectedTests.includes(test.id)}
                          onSelect={(val) => val ? setSelectedTests(p => [...p, test.id]) : setSelectedTests(p => p.filter(id => id !== test.id))}
                          onEdit={onEditTest}
                          onDelete={handleTestDelete}
                          onDuplicate={handleDuplicateTest}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 opacity-50">
                    <FiBookOpen className="w-16 h-16 mb-4 text-gray-500" />
                    <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>No Tests Found</h3>
                    <p className="text-gray-500">Create a new test to get started.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'resources' && (
            <motion.div
              key="resources"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              {/* Combo Pack Toggle */}
              <GlassCard className="p-8">
                <SectionHeader icon={FiPackage} title="Combo Pack" subtitle="Market this as a complete package" color="text-purple-500" />
                <div className="flex items-center justify-between mb-6 p-4 rounded-xl border border-dashed border-gray-500/30">
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Enable Combo Pack Badge</span>
                  <button
                    onClick={() => setSeriesData(p => ({ ...p, isCombo: !p.isCombo }))}
                    className={`w-14 h-8 rounded-full p-1 transition-colors ${seriesData.isCombo ? 'bg-purple-500' : 'bg-gray-600'}`}
                  >
                    <div className={`w-6 h-6 rounded-full bg-white transition-transform ${seriesData.isCombo ? 'translate-x-6' : ''}`} />
                  </button>
                </div>

                {seriesData.isCombo && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <p className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>What's included in this combo?</p>
                    <div className="grid grid-cols-2 gap-2">
                      {comboOptions.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => handleComboToggle(opt.value)}
                          className={`p-3 rounded-xl text-left text-sm font-bold flex items-center gap-2 transition-all ${seriesData.comboIncludes.includes(opt.value)
                              ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                              : isDark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-slate-600 hover:bg-gray-200'
                            }`}
                        >
                          <span>{opt.icon}</span>
                          <span>{opt.label}</span>
                          {seriesData.comboIncludes.includes(opt.value) && <FiCheck className="w-4 h-4 ml-auto" />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </GlassCard>

              {/* Downloadable Resources */}
              <GlassCard className="p-8" gradient="green">
                <SectionHeader icon={FiDownload} title="Downloadable Resources" subtitle="Add PDFs, practice sheets, and study material" color="text-blue-500" />

                {/* Add Resource Form */}
                <div className={`border-2 border-dashed rounded-2xl p-5 mb-6 ${isDark ? 'border-gray-700 bg-gray-900/50' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <input
                      type="text"
                      placeholder="Resource title"
                      value={newResource.title}
                      onChange={(e) => setNewResource(p => ({ ...p, title: e.target.value }))}
                      className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all text-sm font-medium ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500 placeholder-gray-500' : 'bg-white border-slate-200 text-slate-900 focus:border-blue-500 placeholder-slate-400'
                        }`}
                    />
                    <div className="relative">
                      <select
                        value={newResource.type}
                        onChange={(e) => setNewResource(p => ({ ...p, type: e.target.value }))}
                        className={`w-full px-4 py-3 pr-10 rounded-xl border-2 outline-none appearance-none transition-all text-sm font-medium ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500' : 'bg-white border-slate-200 text-slate-900 focus:border-blue-500'
                          }`}
                      >
                        {resourceTypes.map(rt => (
                          <option key={rt.value} value={rt.value}>{rt.label}</option>
                        ))}
                      </select>
                      <FiChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <input
                    type="url"
                    placeholder="Cloudinary URL (https://res.cloudinary.com/...)"
                    value={newResource.url}
                    onChange={(e) => setNewResource(p => ({ ...p, url: e.target.value }))}
                    className={`w-full px-4 py-3 rounded-xl border-2 outline-none mb-3 transition-all text-sm font-medium ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500 placeholder-gray-500' : 'bg-white border-slate-200 text-slate-900 focus:border-blue-500 placeholder-slate-400'
                      }`}
                  />
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Description (optional)"
                      value={newResource.description}
                      onChange={(e) => setNewResource(p => ({ ...p, description: e.target.value }))}
                      className={`flex-1 px-4 py-3 rounded-xl border-2 outline-none transition-all text-sm font-medium ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500 placeholder-gray-500' : 'bg-white border-slate-200 text-slate-900 focus:border-blue-500 placeholder-slate-400'
                        }`}
                    />
                    <button
                      onClick={handleAddResource}
                      disabled={!newResource.title.trim() || !newResource.url.trim()}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-sm flex items-center gap-2 hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiPlus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                </div>

                {/* Resources List */}
                {seriesData.resources.length > 0 ? (
                  <div className="space-y-3">
                    {seriesData.resources.map((res) => (
                      <div
                        key={res.id}
                        className={`flex items-center gap-4 p-4 rounded-2xl border transition-all group ${isDark ? 'bg-gray-800/40 border-gray-700/50 hover:border-gray-600' : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-lg'
                          }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${isDark ? 'bg-gray-700' : 'bg-slate-100'
                          }`}>
                          {resourceTypes.find(rt => rt.value === res.type)?.icon || '📁'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold text-sm truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{res.title}</p>
                          <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                            {res.description || res.url}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveResource(res.id)}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 opacity-50">
                    <FiFile className="w-12 h-12 mb-3 text-gray-500" />
                    <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>No Resources Yet</h3>
                    <p className="text-gray-500 text-sm">Add PDFs, practice sheets, or notes above.</p>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          )}

          {activeTab === 'danger' && (
            <motion.div
              key="danger"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-2xl mx-auto space-y-8"
            >
              <GlassCard className="p-8 border-red-500/20" gradient="red">
                <SectionHeader icon={FiAlertTriangle} title="Danger Zone" subtitle="Irreversible actions" color="text-red-500" />

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                    <div>
                      <h4 className="font-bold text-red-500">Unpublish Series</h4>
                      <p className="text-xs text-red-400/70">Hide from all users immediately.</p>
                    </div>
                    <button onClick={() => setSeriesData(p => ({ ...p, isPublished: false }))} className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-lg text-sm font-bold transition-colors">
                      Unpublish
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                    <div>
                      <h4 className="font-bold text-red-500">Delete Series</h4>
                      <p className="text-xs text-red-400/70">Permanently remove series and all tests.</p>
                    </div>
                    <button onClick={() => setShowDeleteConfirm(true)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition-colors shadow-lg shadow-red-600/20">
                      Delete Forever
                    </button>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-6 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500"><FiDownload className="w-6 h-6" /></div>
                  <div>
                    <h4 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Export Data</h4>
                    <p className="text-xs text-gray-500">Download JSON backup.</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-gray-900 border border-red-500/30 p-8 rounded-3xl max-w-md w-full shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent pointer-events-none" />
              <FiAlertTriangle className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Are you sure?</h3>
              <p className="text-gray-400 mb-8">This action cannot be undone. All tests and student data associated with <span className="text-white font-bold">{testSeries.title}</span> will be lost.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 rounded-xl bg-gray-800 text-white font-bold hover:bg-gray-700 transition-colors">Cancel</button>
                <button onClick={handleSeriesDelete} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-500 transition-colors shadow-lg shadow-red-600/30">Delete</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default TestSeriesEditor;