import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Globe, 
  Image as ImageIcon, 
  Search, 
  AlertCircle,
  CheckCircle2,
  Loader2,
  ExternalLink
} from 'lucide-react';

// --- Configuration ---
const EXAMINATION_WEBSITES = [
  { value: 'upsc', label: 'UPSC - Union Public Service Commission', url: 'https://upsc.gov.in' },
  { value: 'jee', label: 'JEE - Joint Entrance Examination', url: 'https://jeemain.nta.nic.in' },
  { value: 'neet', label: 'NEET - National Eligibility cum Entrance Test', url: 'https://neet.nta.nic.in' },
  { value: 'cat', label: 'CAT - Common Admission Test', url: 'https://iimcat.ac.in' },
  { value: 'gate', label: 'GATE - Graduate Aptitude Test in Engineering', url: 'https://gate.iitk.ac.in' },
  { value: 'ssc', label: 'SSC - Staff Selection Commission', url: 'https://ssc.nic.in' },
  { value: 'banking', label: 'Banking Examinations (IBPS, SBI)', url: 'https://www.ibps.in' },
  { value: 'teaching', label: 'Teaching Eligibility Tests (CTET, TET)', url: 'https://ctet.nic.in' },
  { value: 'clat', label: 'CLAT - Common Law Admission Test', url: 'https://consortiumofnlus.ac.in' },
  { value: 'custom', label: 'Custom Examination / Other', url: '' }
];

const ExaminationLogosManager = () => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme(); // Assuming this returns boolean
  
  // State
  const [logos, setLogos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    imageUrl: '',
    customLabel: '' // Added to handle custom names better
  });

  // --- Helpers ---
  const mode = (light, dark) => (isDark ? dark : light);

  // --- Effects ---
  useEffect(() => {
    fetchLogos();
  }, []);

  const fetchLogos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'examinationLogos'));
      const logosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLogos(logosData);
    } catch (error) {
      console.error('Error fetching logos:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.imageUrl) return;
    
    setIsSubmitting(true);
    try {
      const selectedExam = EXAMINATION_WEBSITES.find(exam => exam.value === formData.name);
      
      const logoData = {
        name: selectedExam?.value === 'custom' ? formData.customLabel : (selectedExam?.label || formData.name),
        imageUrl: formData.imageUrl,
        websiteUrl: selectedExam?.url || '',
        examCode: formData.name,
        updatedAt: new Date()
      };

      if (editingId) {
        await updateDoc(doc(db, 'examinationLogos', editingId), logoData);
        setLogos(prev => prev.map(item => item.id === editingId ? { ...item, ...logoData } : item));
        setEditingId(null);
      } else {
        const docRef = await addDoc(collection(db, 'examinationLogos'), {
          ...logoData,
          createdAt: new Date(),
          createdBy: currentUser.uid
        });
        setLogos(prev => [...prev, { id: docRef.id, ...logoData }]);
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving logo:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (logo) => {
    setEditingId(logo.id);
    setFormData({
      name: logo.examCode || 'custom',
      imageUrl: logo.imageUrl,
      customLabel: logo.name
    });
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this examination entry?')) {
      try {
        await deleteDoc(doc(db, 'examinationLogos', id));
        setLogos(prev => prev.filter(logo => logo.id !== id));
      } catch (error) {
        console.error('Error deleting:', error);
      }
    }
  };

  const resetForm = () => {
    setShowAddForm(false);
    setEditingId(null);
    setFormData({ name: '', imageUrl: '', customLabel: '' });
  };

  // Filter logos based on search
  const filteredLogos = logos.filter(logo => 
    logo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- Components ---

  // 1. Skeleton Loader
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className={`h-64 rounded-xl animate-pulse ${mode("bg-slate-200", "bg-zinc-800")}`} />
      ))}
    </div>
  );

  // 2. Checkered Pattern for Transparency
  const TransparencyGrid = () => (
    <div className="absolute inset-0 opacity-20" 
         style={{ 
           backgroundImage: `conic-gradient(${isDark ? '#3f3f46' : '#cbd5e1'} 90deg, transparent 90deg)`, 
           backgroundSize: '16px 16px' 
         }} 
    />
  );

  if (loading) {
    return (
      <div className={`min-h-screen p-8 flex items-center justify-center ${mode("bg-slate-50", "bg-zinc-950")}`}>
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full font-sans selection:bg-emerald-500/20 ${mode("bg-slate-50 text-slate-900", "bg-zinc-950 text-zinc-100")}`}>
      
      {/* Top Gradient Line */}
      <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-rose-500" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              Examination Assets
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${mode(
                "bg-emerald-50 text-emerald-700 border-emerald-200",
                "bg-emerald-950/30 text-emerald-400 border-emerald-900"
              )}`}>
                {logos.length} Active
              </span>
            </h1>
            <p className={`mt-2 text-sm ${mode("text-slate-500", "text-zinc-400")}`}>
              Manage logos and identities for examination portals.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${mode("text-slate-400", "text-zinc-500")}`} />
              <input 
                type="text" 
                placeholder="Search logos..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none border transition-all w-full md:w-64 ${mode(
                  "bg-white border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10",
                  "bg-zinc-900 border-zinc-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-900/20"
                )}`}
              />
            </div>

            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                if (!showAddForm) setEditingId(null);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all active:scale-95 shadow-sm ${
                showAddForm 
                  ? mode("bg-slate-200 text-slate-700 hover:bg-slate-300", "bg-zinc-800 text-zinc-300 hover:bg-zinc-700")
                  : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-500/20 shadow-lg"
              }`}
            >
              {showAddForm ? <X className="w-4 h-4"/> : <Plus className="w-4 h-4" />}
              {showAddForm ? 'Close' : 'Add Asset'}
            </button>
          </div>
        </div>

        {/* Form Section */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-10"
            >
              <div className={`p-6 md:p-8 rounded-2xl border border-dashed ${mode(
                "bg-white border-slate-300 shadow-sm",
                "bg-zinc-900/50 border-zinc-700"
              )}`}>
                <div className="flex items-center gap-2 mb-6">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${mode("bg-emerald-100 text-emerald-600", "bg-emerald-900/30 text-emerald-400")}`}>
                    {editingId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                  <h3 className="text-lg font-semibold">
                    {editingId ? 'Edit Configuration' : 'New Entry'}
                  </h3>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Inputs */}
                  <div className="lg:col-span-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider opacity-70">Examination</label>
                        <div className="relative">
                          <Globe className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${mode("text-slate-400", "text-zinc-500")}`} />
                          <select
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={`w-full pl-10 pr-4 py-3 rounded-lg text-sm outline-none border transition-all appearance-none ${mode(
                              "bg-slate-50 border-slate-200 focus:border-emerald-500 focus:bg-white",
                              "bg-zinc-800 border-zinc-700 focus:border-emerald-500 focus:bg-zinc-900"
                            )}`}
                            required
                          >
                            <option value="" disabled>Select Authority</option>
                            {EXAMINATION_WEBSITES.map(exam => (
                              <option key={exam.value} value={exam.value}>{exam.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider opacity-70">Asset URL</label>
                        <div className="relative">
                          <ImageIcon className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${mode("text-slate-400", "text-zinc-500")}`} />
                          <input
                            type="url"
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                            placeholder="https://cloudinary..."
                            className={`w-full pl-10 pr-4 py-3 rounded-lg text-sm outline-none border transition-all ${mode(
                              "bg-slate-50 border-slate-200 focus:border-emerald-500 focus:bg-white",
                              "bg-zinc-800 border-zinc-700 focus:border-emerald-500 focus:bg-zinc-900"
                            )}`}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {formData.name === 'custom' && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-2"
                      >
                        <label className="text-xs font-semibold uppercase tracking-wider opacity-70 text-rose-500">Custom Display Name</label>
                        <input
                          type="text"
                          value={formData.customLabel}
                          onChange={(e) => setFormData({ ...formData, customLabel: e.target.value })}
                          placeholder="e.g., State Board Exam"
                          className={`w-full px-4 py-3 rounded-lg text-sm outline-none border transition-all ${mode(
                            "bg-rose-50/50 border-rose-200 focus:border-rose-500",
                            "bg-rose-950/10 border-rose-900/50 focus:border-rose-500"
                          )}`}
                          required
                        />
                      </motion.div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                      >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {editingId ? 'Update Asset' : 'Create Asset'}
                      </button>
                      <button
                        type="button"
                        onClick={resetForm}
                        className={`px-6 py-3 rounded-lg font-medium text-sm transition-colors ${mode("hover:bg-slate-100 text-slate-600", "hover:bg-zinc-800 text-zinc-400")}`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>

                  {/* Live Preview */}
                  <div className="lg:col-span-4">
                    <div className={`h-full rounded-xl border p-6 flex flex-col items-center justify-center text-center relative overflow-hidden ${mode(
                      "bg-slate-50 border-slate-200",
                      "bg-black/20 border-zinc-800"
                    )}`}>
                      <span className="absolute top-4 left-4 text-[10px] font-mono uppercase tracking-widest opacity-50">Live Preview</span>
                      {formData.imageUrl ? (
                        <>
                          <div className="relative w-32 h-32 mb-4 group">
                            <div className={`absolute inset-0 rounded-xl ${mode("bg-white shadow-sm", "bg-zinc-800 shadow-inner")}`} />
                            <TransparencyGrid />
                            <img 
                              src={formData.imageUrl} 
                              alt="Preview" 
                              className="relative z-10 w-full h-full object-contain p-4"
                              onError={(e) => e.target.src = 'https://placehold.co/200x200?text=Error'}
                            />
                          </div>
                          <h4 className="font-bold text-sm">{formData.name === 'custom' ? (formData.customLabel || 'Custom Name') : (EXAMINATION_WEBSITES.find(e => e.value === formData.name)?.label || 'Select Exam')}</h4>
                          <span className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Ready to deploy
                          </span>
                        </>
                      ) : (
                        <div className="opacity-30 flex flex-col items-center">
                          <ImageIcon className="w-12 h-12 mb-2" />
                          <p className="text-sm">Enter URL to preview</p>
                        </div>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid */}
        {logos.length === 0 ? (
          <div className={`text-center py-24 rounded-2xl border border-dashed ${mode("border-slate-300 bg-slate-50", "border-zinc-800 bg-zinc-900/50")}`}>
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold">No Assets Found</h3>
            <p className={`max-w-sm mx-auto mt-2 text-sm ${mode("text-slate-500", "text-zinc-400")}`}>
              Get started by adding your first examination logo to the database.
            </p>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            <AnimatePresence mode='popLayout'>
              {filteredLogos.map((logo) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={logo.id}
                  className={`group relative flex flex-col rounded-xl border transition-all duration-200 overflow-hidden ${mode(
                    "bg-white border-zinc-200 hover:shadow-xl hover:shadow-zinc-200/50 hover:-translate-y-1",
                    "bg-zinc-900/40 border-zinc-800 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-black/50 hover:-translate-y-1"
                  )}`}
                >
                  {/* Image Area */}
                  <div className={`relative h-40 w-full flex items-center justify-center p-6 border-b ${mode("bg-slate-50 border-zinc-100", "bg-black/40 border-zinc-800")}`}>
                    <TransparencyGrid />
                    <img
                      src={logo.imageUrl}
                      alt={logo.name}
                      className="relative z-10 w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  {/* Content Area */}
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-sm line-clamp-2 leading-tight pr-2" title={logo.name}>
                        {logo.name}
                      </h3>
                      {logo.websiteUrl && (
                        <a 
                          href={logo.websiteUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className={`p-1 rounded-md hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors ${mode("text-slate-400", "text-zinc-600")}`}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                    
                    <p className={`text-xs font-mono mt-auto pt-4 border-t border-dashed ${mode("text-slate-400 border-slate-200", "text-zinc-600 border-zinc-800")}`}>
                      ID: {logo.examCode || 'Custom'}
                    </p>
                  </div>

                  {/* Action Overlay (Visible on hover/focus) */}
                  <div className={`absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
                     <button
                      onClick={() => handleEdit(logo)}
                      className={`p-2 rounded-lg backdrop-blur-md shadow-sm transition-all ${mode(
                        "bg-white/90 text-slate-700 hover:text-emerald-600 hover:bg-emerald-50",
                        "bg-zinc-800/90 text-zinc-300 hover:text-emerald-400 hover:bg-emerald-900/30"
                      )}`}
                      aria-label="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(logo.id)}
                      className={`p-2 rounded-lg backdrop-blur-md shadow-sm transition-all ${mode(
                        "bg-white/90 text-rose-600 hover:bg-rose-50",
                        "bg-zinc-800/90 text-rose-400 hover:bg-rose-900/30"
                      )}`}
                      aria-label="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ExaminationLogosManager;