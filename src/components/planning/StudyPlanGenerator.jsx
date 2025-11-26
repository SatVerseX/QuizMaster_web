import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { z } from 'zod';
import { 
  Calendar, Clock, Target, Cpu, CheckCircle2, Activity, 
  AlertCircle, Save, RotateCcw, Check, Trash2,
  CloudOff, Wifi, BrainCircuit, Sparkles, ChevronRight, 
  Map, Hourglass, Layout, BookOpen, Zap, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// --- Validation Schema ---
const planSchema = z.object({
  examName: z.string()
    .min(2, "Exam name is too short")
    .max(50, "Exam name is too long")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Special characters are not allowed"),
  daysRemaining: z.number()
    .min(1, "Minimum 1 day required")
    .max(365, "Planning limited to 1 year"),
  dailyHours: z.number()
    .min(0.5, "Minimum 30 mins")
    .max(16, "Maximum 16 hours"),
  weakAreas: z.string().max(500).optional()
});

const StudyPlanGenerator = ({ onClose }) => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  
  // --- State ---
  const [viewState, setViewState] = useState('loading'); 
  const [storageMode, setStorageMode] = useState('cloud');
  const [formData, setFormData] = useState({
    examName: '',
    daysRemaining: 30,
    dailyHours: 2,
    weakAreas: ''
  });
  
  const [activePlan, setActivePlan] = useState(null);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getStorageKey = (uid) => `quizmaster_plan_${uid}`;

  // --- Styles & Theme (Rose/Zinc Palette) ---
  const styles = {
    overlay: isDark ? 'bg-black/60' : 'bg-zinc-900/20',
    glassPanel: isDark 
      ? 'bg-zinc-900/95 backdrop-blur-xl border-zinc-800 shadow-2xl shadow-black/50' 
      : 'bg-white/95 backdrop-blur-xl border-white/40 shadow-2xl shadow-zinc-200/50',
    headerBorder: isDark ? 'border-zinc-800' : 'border-zinc-100',
    bgMain: isDark ? 'bg-zinc-950' : 'bg-zinc-50/50',
    
    // Typography
    textHeading: isDark ? 'text-zinc-100' : 'text-zinc-900',
    textSub: isDark ? 'text-zinc-400' : 'text-zinc-500',
    textAccent: 'text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500',
    
    // Inputs
    inputGroup: isDark ? 'bg-zinc-900 border-zinc-800 focus-within:border-rose-500/50 focus-within:ring-1 focus-within:ring-rose-500/20' : 'bg-white border-zinc-200 focus-within:border-rose-500 focus-within:ring-1 focus-within:ring-rose-500/20',
    inputText: isDark ? 'text-zinc-200 placeholder-zinc-600' : 'text-zinc-800 placeholder-zinc-400',
    
    // Cards & Timeline
    card: isDark ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' : 'bg-white border-zinc-200 hover:border-zinc-300',
    timelineLine: isDark ? 'bg-zinc-800' : 'bg-zinc-200',
    
    // Buttons
    btnPrimary: 'bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white shadow-lg shadow-rose-500/20',
    btnSecondary: isDark 
      ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700' 
      : 'bg-white hover:bg-zinc-50 text-zinc-600 border border-zinc-200 shadow-sm',
  };

  // --- Initialization ---
  useEffect(() => {
    let mounted = true;
    const fetchPlan = async () => {
      if (!currentUser) return;
      setLoading(true);
      try {
        // Cloud fetch
        try {
          const docRef = doc(db, 'user-study-plans', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && mounted) {
            setActivePlan(docSnap.data());
            setViewState('active');
            setStorageMode('cloud');
            setLoading(false);
            return;
          }
        } catch (e) { console.warn("Cloud sync failed", e); }

        // Local fallback
        const localData = localStorage.getItem(getStorageKey(currentUser.uid));
        if (localData && mounted) {
          setActivePlan(JSON.parse(localData));
          setViewState('active');
          setStorageMode('local');
        } else if (mounted) {
          setViewState('form');
        }
      } catch (err) {
        if(mounted) setViewState('form');
      } finally {
        if(mounted) setLoading(false);
      }
    };
    fetchPlan();
    return () => { mounted = false; };
  }, [currentUser]);

  // --- Handlers ---
  const handleGenerate = async () => {
    setError('');
    const validation = planSchema.safeParse(formData);
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    setLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
      const prompt = `
        Act as an elite exam strategist. Create a study roadmap.
        Exam: "${formData.examName}", Days: ${formData.daysRemaining}, Hours/Day: ${formData.dailyHours}, Weakness: "${formData.weakAreas}".
        Output JSON only:
        {
          "strategy": "One sentence strategic summary.",
          "schedule": [
            {
              "day": 1,
              "focus": "Topic Headline",
              "description": "Brief goal",
              "tasks": [{ "text": "Task", "duration": "30m" }]
            }
          ]
        }
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text().replace(/```json|```/g, '').trim();
      const plan = JSON.parse(text);

      // Hydrate IDs
      plan.schedule = plan.schedule.map((day, dIdx) => ({
        ...day,
        id: `day-${dIdx}`,
        tasks: day.tasks.map(t => ({ ...t, id: uuidv4(), completed: false }))
      }));

      setGeneratedPlan(plan);
      setViewState('preview');
    } catch (err) {
      setError("AI Generation failed. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async () => {
    if (!currentUser || !generatedPlan) return;
    setLoading(true);
    
    const planData = {
      ...generatedPlan,
      examName: formData.examName,
      meta: formData,
      progress: 0,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    setActivePlan(planData);
    setViewState('active');

    try {
      await setDoc(doc(db, 'user-study-plans', currentUser.uid), {
        ...planData,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      });
      setStorageMode('cloud');
    } catch (err) {
      localStorage.setItem(getStorageKey(currentUser.uid), JSON.stringify(planData));
      setStorageMode('local');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (dayIndex, taskIndex) => {
    if (!activePlan) return;

    const newSchedule = [...activePlan.schedule];
    const task = newSchedule[dayIndex].tasks[taskIndex];
    task.completed = !task.completed;

    // Recalculate Progress
    let total = 0;
    let complete = 0;
    newSchedule.forEach(day => day.tasks.forEach(t => { total++; if (t.completed) complete++; }));
    const newProgress = total === 0 ? 0 : Math.round((complete / total) * 100);

    const updatedPlan = { ...activePlan, schedule: newSchedule, progress: newProgress, lastUpdated: new Date().toISOString() };
    setActivePlan(updatedPlan);

    // Persist
    if (storageMode === 'cloud') {
      updateDoc(doc(db, 'user-study-plans', currentUser.uid), { schedule: newSchedule, progress: newProgress });
    } else {
      localStorage.setItem(getStorageKey(currentUser.uid), JSON.stringify(updatedPlan));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this study plan?")) return;
    localStorage.removeItem(getStorageKey(currentUser.uid));
    setActivePlan(null);
    setGeneratedPlan(null);
    setViewState('form');
  };

  // --- Components ---

  const LoadingView = () => (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-rose-500 blur-3xl opacity-20 animate-pulse" />
        <div className={`relative w-24 h-24 rounded-3xl flex items-center justify-center border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100 shadow-xl'}`}>
          <BrainCircuit className="w-10 h-10 text-rose-500 animate-pulse" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-ping" />
        </div>
      </div>
      <h3 className={`text-xl font-bold mb-2 ${styles.textHeading}`}>Architecting Roadmap</h3>
      <p className={`text-sm ${styles.textSub}`}>Analyzing constraints & generating strategy...</p>
    </div>
  );

  const ProgressBar = ({ progress }) => (
    <div className="relative h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
      <motion.div 
        className="absolute top-0 left-0 h-full bg-gradient-to-r from-rose-500 to-orange-500"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.8, ease: "circOut" }}
      />
    </div>
  );

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 ${styles.overlay} backdrop-blur-sm`}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`w-full max-w-5xl h-[90vh] flex flex-col rounded-3xl border overflow-hidden ${styles.glassPanel}`}
      >
        
        {/* --- Header --- */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${styles.headerBorder} shrink-0`}>
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner ${isDark ? 'bg-zinc-800 text-rose-500' : 'bg-zinc-100 text-rose-600'}`}>
              <Map className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-lg font-bold tracking-tight ${styles.textHeading}`}>
                {activePlan ? activePlan.examName : 'Study Architect'}
              </h2>
              <div className="flex items-center gap-2">
                {viewState === 'active' && (
                   <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${storageMode === 'cloud' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                     {storageMode === 'cloud' ? <Wifi className="w-3 h-3" /> : <CloudOff className="w-3 h-3" />}
                     {storageMode === 'cloud' ? 'Synced' : 'Local'}
                   </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-500'}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* --- Main Content --- */}
        <div className={`flex-1 overflow-hidden relative ${styles.bgMain}`}>
          {loading ? <LoadingView /> : (
            <div className="h-full overflow-y-auto custom-scrollbar p-6 md:p-8">
              <AnimatePresence mode="wait">
                
                {/* 1. INPUT FORM */}
                {viewState === 'form' && (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-2xl mx-auto pt-8">
                    <div className="text-center mb-12">
                      <h1 className={`text-4xl font-black mb-3 ${styles.textHeading}`}>
                        Build Your <span className={styles.accentText}>Strategy</span>
                      </h1>
                      <p className={styles.textSub}>Let AI structure your exam preparation based on your timeline and constraints.</p>
                    </div>

                    <div className={`p-8 rounded-3xl border space-y-8 shadow-xl ${styles.card}`}>
                      <div className="space-y-6">
                        <div className="space-y-2">
                           <label className={`text-xs font-bold uppercase tracking-wider ${styles.textSub}`}>Target Exam</label>
                           <div className={`flex items-center px-4 py-3 rounded-xl border transition-all ${styles.inputGroup}`}>
                             <Target className="w-5 h-5 text-zinc-400 mr-3" />
                             <input 
                               type="text" 
                               value={formData.examName}
                               onChange={e => setFormData({...formData, examName: e.target.value})}
                               className={`w-full bg-transparent outline-none text-sm font-medium ${styles.inputText}`}
                               placeholder="e.g. GATE CSE 2025"
                             />
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <label className={`text-xs font-bold uppercase tracking-wider ${styles.textSub}`}>Timeline</label>
                             <div className={`flex items-center px-4 py-3 rounded-xl border transition-all ${styles.inputGroup}`}>
                               <Calendar className="w-5 h-5 text-zinc-400 mr-3" />
                               <input 
                                 type="number" 
                                 value={formData.daysRemaining}
                                 onChange={e => setFormData({...formData, daysRemaining: parseInt(e.target.value) || 0})}
                                 className={`w-full bg-transparent outline-none text-sm font-medium ${styles.inputText}`}
                               />
                               <span className="text-xs font-bold text-zinc-500 ml-2">DAYS</span>
                             </div>
                          </div>
                          <div className="space-y-2">
                             <label className={`text-xs font-bold uppercase tracking-wider ${styles.textSub}`}>Daily Effort</label>
                             <div className={`flex items-center px-4 py-3 rounded-xl border transition-all ${styles.inputGroup}`}>
                               <Clock className="w-5 h-5 text-zinc-400 mr-3" />
                               <input 
                                 type="number" 
                                 value={formData.dailyHours}
                                 onChange={e => setFormData({...formData, dailyHours: parseFloat(e.target.value)})}
                                 className={`w-full bg-transparent outline-none text-sm font-medium ${styles.inputText}`}
                               />
                               <span className="text-xs font-bold text-zinc-500 ml-2">HRS</span>
                             </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className={`text-xs font-bold uppercase tracking-wider ${styles.textSub}`}>Weak Areas (Optional)</label>
                          <div className={`p-4 rounded-xl border transition-all ${styles.inputGroup}`}>
                             <textarea 
                                value={formData.weakAreas}
                                onChange={e => setFormData({...formData, weakAreas: e.target.value})}
                                placeholder="Topics requiring extra focus (e.g., Algebra, Organic Chemistry)..."
                                className={`w-full bg-transparent outline-none text-sm font-medium resize-none min-h-[80px] ${styles.inputText}`}
                             />
                          </div>
                        </div>
                      </div>

                      {error && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-3 text-sm">
                          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                        </div>
                      )}

                      <button 
                        onClick={handleGenerate}
                        className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide uppercase flex items-center justify-center gap-2 transition-transform active:scale-[0.98] ${styles.btnPrimary}`}
                      >
                        <Sparkles className="w-4 h-4" /> Generate Roadmap
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* 2. PREVIEW & ACTIVE STATE */}
                {(viewState === 'preview' || viewState === 'active') && (
                  <motion.div key="plan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto pb-20">
                    
                    {/* Strategy Banner */}
                    <div className={`p-8 rounded-3xl border relative overflow-hidden mb-10 ${styles.card}`}>
                      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-rose-500/10 to-orange-500/10 blur-3xl rounded-full pointer-events-none" />
                      
                      <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="p-1.5 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
                               <Zap className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                            </div>
                            <h3 className={`text-sm font-bold uppercase tracking-wider ${styles.textSub}`}>Strategic Approach</h3>
                          </div>
                          <p className={`text-lg md:text-xl font-medium leading-relaxed ${styles.textHeading}`}>
                            {(activePlan || generatedPlan).strategy}
                          </p>
                        </div>
                        
                        {viewState === 'active' && (
                          <div className="flex flex-col items-end gap-2 min-w-[140px]">
                            <div className="text-3xl font-black text-rose-500">{activePlan.progress}%</div>
                            <ProgressBar progress={activePlan.progress} />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Complete</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="relative pl-4 md:pl-8">
                      <div className={`absolute left-[27px] md:left-[43px] top-4 bottom-0 w-0.5 ${styles.timelineLine}`} />

                      {(activePlan || generatedPlan).schedule.map((day, idx) => {
                        const isCompleted = day.tasks.every(t => t.completed);
                        const isPending = day.tasks.some(t => !t.completed);
                        
                        return (
                          <motion.div 
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="relative pl-12 md:pl-16 pb-10 last:pb-0 group"
                          >
                            {/* Node Dot */}
                            <div className={`absolute left-[7px] md:left-[23px] top-1 w-10 h-10 rounded-full border-[3px] flex items-center justify-center z-10 transition-all duration-300 ${
                               isCompleted 
                                ? 'bg-emerald-500 border-zinc-950 text-white scale-110'
                                : isPending
                                  ? 'bg-white border-rose-500 text-rose-600 dark:bg-zinc-900 shadow-[0_0_0_4px_rgba(244,63,94,0.2)]'
                                  : isDark ? 'bg-zinc-900 border-zinc-700 text-zinc-500' : 'bg-white border-zinc-300 text-zinc-400'
                            }`}>
                              {isCompleted ? <Check className="w-5 h-5" strokeWidth={3} /> : <span className="text-xs font-bold">{idx + 1}</span>}
                            </div>

                            {/* Content Card */}
                            <div className={`p-1 rounded-2xl transition-all duration-300 ${styles.card}`}>
                              <div className="p-5 md:p-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
                                  <div>
                                     <span className="text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-1 block">Day {day.day}</span>
                                     <h4 className={`text-lg font-bold ${styles.textHeading}`}>{day.focus}</h4>
                                  </div>
                                  <div className={`text-xs px-3 py-1 rounded-full font-medium w-fit ${isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-600'}`}>
                                     {day.description}
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  {day.tasks.map((task, tIdx) => (
                                    <div 
                                      key={tIdx}
                                      onClick={viewState === 'active' ? () => handleToggleTask(idx, tIdx) : undefined}
                                      className={`
                                        group/task flex items-start gap-3 p-3 rounded-xl transition-all duration-200 border
                                        ${viewState === 'active' ? 'cursor-pointer' : ''}
                                        ${task.completed 
                                          ? (isDark ? 'bg-emerald-950/20 border-emerald-900/30' : 'bg-emerald-50 border-emerald-100')
                                          : (isDark ? 'bg-zinc-800/50 border-transparent hover:bg-zinc-800' : 'bg-zinc-50 border-transparent hover:bg-white hover:border-rose-200 hover:shadow-sm')
                                        }
                                      `}
                                    >
                                      <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                        task.completed 
                                          ? 'bg-emerald-500 border-emerald-500 text-white' 
                                          : (isDark ? 'border-zinc-600 group-hover/task:border-rose-500' : 'border-zinc-300 group-hover/task:border-rose-400 bg-white')
                                      }`}>
                                        {task.completed && <Check className="w-3 h-3" strokeWidth={3} />}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium leading-snug transition-colors ${
                                          task.completed 
                                            ? 'text-emerald-600 dark:text-emerald-400 line-through opacity-70' 
                                            : styles.textHeading
                                        }`}>
                                          {task.text}
                                        </p>
                                      </div>
                                      {task.duration && (
                                        <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${styles.textSub}`}>
                                          <Clock className="w-3 h-3" /> {task.duration}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          )}
        </div>

        {/* --- Footer Actions --- */}
        <div className={`p-6 border-t flex justify-between items-center ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
          {viewState === 'form' && (
            <button onClick={onClose} className={`text-sm font-medium ${styles.textSub} hover:text-zinc-900 dark:hover:text-white transition-colors`}>
               Cancel
            </button>
          )}

          {viewState === 'preview' && (
             <>
                <button onClick={() => setViewState('form')} className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-colors ${styles.btnSecondary}`}>
                  Adjust Params
                </button>
                <button onClick={handleSavePlan} className={`px-8 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-transform active:scale-95 ${styles.btnPrimary}`}>
                  <Save className="w-4 h-4" /> Begin Journey
                </button>
             </>
          )}

          {viewState === 'active' && (
            <div className="flex justify-between w-full items-center">
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                Saved: {new Date(activePlan.lastUpdated).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
              <button onClick={handleDelete} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors`}>
                <Trash2 className="w-4 h-4" /> Reset Plan
              </button>
            </div>
          )}
        </div>

      </motion.div>
    </div>
  );
};

export default StudyPlanGenerator;