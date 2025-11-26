import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { z } from 'zod';
import { 
  Calendar, Clock, Target, Cpu, CheckCircle2, Activity, 
  AlertCircle, Save, RotateCcw, Check, Trash2,
  CloudOff, Wifi, BrainCircuit, Sparkles, ChevronRight, Layout
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';


const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);


const planSchema = z.object({
  examName: z.string()
    .min(2, "Exam name must be at least 2 characters")
    .max(50, "Exam name limited to 50 characters to prevent UI overflow")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Special characters are not allowed"),
  daysRemaining: z.number()
    .min(1, "Minimum 1 day required")
    .max(365, "Planning limited to 1 year for performance"),
  dailyHours: z.number()
    .min(0.5, "Minimum 30 mins")
    .max(16, "Maximum 16 hours (health safety limit)"),
  weakAreas: z.string()
    .max(500, "Weak areas description too long")
    .optional()
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


  const theme = {
    bg: isDark ? 'bg-zinc-950' : 'bg-slate-50',
    card: isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200',
    text: isDark ? 'text-zinc-100' : 'text-zinc-900',
    subText: isDark ? 'text-zinc-400' : 'text-zinc-500',
    input: isDark 
      ? 'bg-zinc-950/50 border-zinc-800 focus:border-indigo-500 focus:ring-indigo-500/20 text-white' 
      : 'bg-white border-zinc-200 focus:border-indigo-500 focus:ring-indigo-500/20 text-zinc-900',
    primaryBtn: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/30',
    secondaryBtn: isDark 
      ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700' 
      : 'bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 shadow-sm',
  };

  const getStorageKey = (uid) => `quizmaster_plan_${uid}`;

  // --- Effects ---
  useEffect(() => {
    let mounted = true;

    const fetchPlan = async () => {
      if (!currentUser) return;
      setLoading(true);
      
      try {
        // Strategy: Cloud First -> Local Fallback
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
        } catch (cloudErr) {
          console.warn("[Security] Cloud access denied or failed, falling back to local storage.", cloudErr);
          if(mounted) setStorageMode('local');
        }

        const localData = localStorage.getItem(getStorageKey(currentUser.uid));
        if (localData && mounted) {
          setActivePlan(JSON.parse(localData));
          setViewState('active');
          setStorageMode('local');
        } else if (mounted) {
          setViewState('form');
        }
      } catch (err) {
        console.error("Initialization error:", err);
        if(mounted) setViewState('form');
      } finally {
        if(mounted) setLoading(false);
      }
    };
    
    fetchPlan();
    return () => { mounted = false; };
  }, [currentUser]);

  // --- Actions ---

  const handleGenerate = async () => {
    setError('');
    
    // 1. Validation Layer
    const validation = planSchema.safeParse(formData);
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    setLoading(true);

    try {
      // 2. AI Interaction
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
      
      const prompt = `
        Role: Senior Exam Strategist.
        Task: Create a structured study plan.
        Context:
        - Exam: "${formData.examName}"
        - Duration: ${formData.daysRemaining} days
        - Intensity: ${formData.dailyHours} hours/day
        - Weaknesses: "${formData.weakAreas || 'None specified'}"

        Requirements:
        - Output STRICT JSON only.
        - No markdown formatting (no \`\`\`json blocks).
        - Structure:
          {
            "strategy": "Concise, high-impact strategy statement.",
            "schedule": [
              {
                "day": 1,
                "focus": "Topic Headline",
                "tasks": [
                  { "text": "Actionable task", "duration": "45m" }
                ]
              }
            ]
          }
        - If duration > 14 days, group by weeks (e.g., "Week 1") instead of individual days to keep payload small.
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      // 3. Sanitization & Parsing
      // Remove any potential markdown wrappers the AI might hallucinate
      const cleanJson = responseText.replace(/```json|```/g, '').trim();
      const plan = JSON.parse(cleanJson);

      // Hydrate with local IDs (never trust IDs from external generation)
      plan.schedule = plan.schedule.map((day, dIdx) => ({
        ...day,
        id: `day-${dIdx}`,
        tasks: day.tasks.map((t, tIdx) => ({ 
          ...t, 
          id: uuidv4(), 
          completed: false 
        }))
      }));

      setGeneratedPlan(plan);
      setViewState('preview');
    } catch (err) {
      console.error("Generation failed:", err);
      setError("Unable to generate plan. Please try simpler parameters.");
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

    // Optimistic UI Update
    setActivePlan(planData);
    setViewState('active');

    try {
      await setDoc(doc(db, 'user-study-plans', currentUser.uid), {
        ...planData,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      });
      setStorageMode('cloud');
    } catch (cloudErr) {
      // Fail Safe: Local Storage
      console.warn("Saving to local storage due to cloud error.");
      localStorage.setItem(getStorageKey(currentUser.uid), JSON.stringify(planData));
      setStorageMode('local');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (dayIndex, taskIndex) => {
    if (!activePlan) return;

    // Deep clone to prevent mutation bugs
    const newSchedule = activePlan.schedule.map(d => ({
      ...d,
      tasks: d.tasks.map(t => ({ ...t }))
    }));

    const task = newSchedule[dayIndex].tasks[taskIndex];
    task.completed = !task.completed;

    // Recalculate Progress
    let total = 0;
    let complete = 0;
    newSchedule.forEach(day => {
      day.tasks.forEach(t => {
        total++;
        if (t.completed) complete++;
      });
    });

    const newProgress = total === 0 ? 0 : Math.round((complete / total) * 100);

    const updatedPlan = {
      ...activePlan,
      schedule: newSchedule,
      progress: newProgress,
      lastUpdated: new Date().toISOString()
    };

    setActivePlan(updatedPlan);

    // Debounced Persistence Logic (Simplified here)
    if (storageMode === 'cloud') {
      try {
        await updateDoc(doc(db, 'user-study-plans', currentUser.uid), {
          schedule: newSchedule,
          progress: newProgress,
          lastUpdated: serverTimestamp()
        });
      } catch (err) {
        setStorageMode('local');
        localStorage.setItem(getStorageKey(currentUser.uid), JSON.stringify(updatedPlan));
      }
    } else {
      localStorage.setItem(getStorageKey(currentUser.uid), JSON.stringify(updatedPlan));
    }
  };

  const handleDeletePlan = async () => {
    if (!window.confirm("Are you sure? This action is irreversible.")) return;
    setLoading(true);
    
    localStorage.removeItem(getStorageKey(currentUser.uid));
    
    // We don't delete from cloud to preserve data integrity/history if needed, 
    // or we could use deleteDoc here. For safety, just resetting state.
    setActivePlan(null);
    setGeneratedPlan(null);
    setViewState('form');
    setFormData({ examName: '', daysRemaining: 30, dailyHours: 2, weakAreas: '' });
    setLoading(false);
  };

  // --- Sub-Components ---

  const LoadingView = () => (
    <div className="flex flex-col items-center justify-center py-20 space-y-6">
      <div className="relative">
        <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 animate-pulse" />
        <div className="relative w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
      <div className="text-center space-y-2">
        <h3 className={`text-lg font-medium ${theme.text}`}>Synthesizing Strategy</h3>
        <p className={`text-sm ${theme.subText}`}>Analyzing parameters and structuring timeline...</p>
      </div>
    </div>
  );

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 backdrop-blur-sm bg-black/40`}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`relative w-full max-w-5xl h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border ${theme.card}`}
      >
        {/* --- Header --- */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-zinc-800' : 'border-zinc-200'} bg-opacity-50 backdrop-blur-md z-10`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-sm font-semibold tracking-tight ${theme.text}`}>
                {viewState === 'active' ? activePlan.examName : 'AI Study Architect'}
              </h2>
              {viewState === 'active' && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  {storageMode === 'cloud' 
                    ? <Wifi className="w-3 h-3 text-emerald-500" />
                    : <CloudOff className="w-3 h-3 text-amber-500" />
                  }
                  <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                    {storageMode === 'cloud' ? 'Synced' : 'Local Only'}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {viewState === 'active' && (
              <button 
                onClick={handleDeletePlan}
                className={`p-2 rounded-md transition-colors ${isDark ? 'hover:bg-red-900/20 text-zinc-400 hover:text-red-400' : 'hover:bg-red-50 text-zinc-500 hover:text-red-600'}`}
                title="Destroy Plan"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button 
              onClick={onClose}
              className={`p-2 rounded-md transition-colors ${isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-500'}`}
            >
              <span className="sr-only">Close</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* --- Content Area --- */}
        <div className={`flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 ${theme.bg}`}>
          
          {loading ? (
            <LoadingView />
          ) : (
            <AnimatePresence mode="wait">
              
              {/* --- FORM STATE --- */}
              {viewState === 'form' && (
                <motion.div 
                  key="form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-xl mx-auto space-y-8"
                >
                  <div className="space-y-2 text-center mb-8">
                    <h1 className={`text-2xl font-bold tracking-tight ${theme.text}`}>Design Your Curriculum</h1>
                    <p className={theme.subText}>AI will analyze your parameters to build an optimized roadmap.</p>
                  </div>

                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className={`text-xs font-semibold uppercase tracking-wider ${theme.subText}`}>Target Exam</label>
                        <div className="relative">
                          <Target className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                          <input 
                            type="text"
                            value={formData.examName}
                            onChange={(e) => setFormData({...formData, examName: e.target.value})}
                            placeholder="e.g. AWS Solutions Architect"
                            className={`w-full pl-9 pr-3 py-2 rounded-lg text-sm font-medium outline-none transition-all ring-1 ring-transparent ${theme.input}`}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className={`text-xs font-semibold uppercase tracking-wider ${theme.subText}`}>Timeline</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                          <input 
                            type="number"
                            value={formData.daysRemaining}
                            onChange={(e) => setFormData({...formData, daysRemaining: parseInt(e.target.value) || 0})}
                            className={`w-full pl-9 pr-12 py-2 rounded-lg text-sm font-medium outline-none transition-all ring-1 ring-transparent ${theme.input}`}
                          />
                          <span className="absolute right-3 top-2.5 text-xs font-medium text-zinc-500">DAYS</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className={`text-xs font-semibold uppercase tracking-wider ${theme.subText}`}>Daily Capacity</label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                        <input 
                          type="range"
                          min="1"
                          max="12"
                          step="0.5"
                          value={formData.dailyHours}
                          onChange={(e) => setFormData({...formData, dailyHours: parseFloat(e.target.value)})}
                          className="absolute w-full opacity-0 cursor-pointer z-10"
                        />
                        <div className={`w-full pl-9 pr-3 py-2 rounded-lg text-sm font-medium border flex items-center justify-between ${theme.input}`}>
                          <span>{formData.dailyHours} Hours</span>
                          <div className="flex gap-1 h-1.5">
                            {[...Array(12)].map((_, i) => (
                              <div key={i} className={`w-2 rounded-full ${i < formData.dailyHours ? 'bg-indigo-500' : 'bg-zinc-700/20'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className={`text-xs font-semibold uppercase tracking-wider ${theme.subText}`}>Weak Areas (Optional)</label>
                      <textarea 
                        value={formData.weakAreas}
                        onChange={(e) => setFormData({...formData, weakAreas: e.target.value})}
                        placeholder="Topics requiring extra focus..."
                        className={`w-full px-3 py-2 rounded-lg text-sm font-medium outline-none transition-all ring-1 ring-transparent resize-none min-h-[100px] ${theme.input}`}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-sm text-red-500">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  <button 
                    onClick={handleGenerate}
                    className={`w-full py-3 rounded-lg font-medium text-sm transition-all active:scale-[0.99] flex items-center justify-center gap-2 ${theme.primaryBtn}`}
                  >
                    <Sparkles className="w-4 h-4" />
                    Generate Strategy
                  </button>
                </motion.div>
              )}

              {/* --- PREVIEW STATE --- */}
              {viewState === 'preview' && generatedPlan && (
                <motion.div 
                  key="preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="max-w-3xl mx-auto flex flex-col h-full"
                >
                  <div className={`p-6 rounded-xl border mb-6 ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                    <h3 className={`text-lg font-semibold mb-2 ${theme.text}`}>Strategy Brief</h3>
                    <p className={`text-sm italic leading-relaxed ${theme.subText}`}>"{generatedPlan.strategy}"</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-8">
                    {generatedPlan.schedule.slice(0, 4).map((day, i) => (
                      <div key={i} className={`p-4 rounded-lg border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">
                            {typeof day.day === 'number' ? `Day ${day.day}` : day.day}
                          </span>
                        </div>
                        <h4 className={`text-sm font-semibold mb-2 ${theme.text}`}>{day.focus}</h4>
                        <div className="space-y-2">
                          {day.tasks.slice(0, 2).map((t, idx) => (
                            <div key={idx} className={`text-xs flex items-start gap-2 ${theme.subText}`}>
                              <div className="mt-1 w-1 h-1 rounded-full bg-zinc-400 shrink-0" />
                              {t.text}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    {generatedPlan.schedule.length > 4 && (
                      <div className={`flex items-center justify-center p-4 text-sm ${theme.subText}`}>
                        + {generatedPlan.schedule.length - 4} more sessions...
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 mt-auto pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <button 
                      onClick={() => setViewState('form')}
                      className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-colors ${theme.secondaryBtn}`}
                    >
                      Refine Parameters
                    </button>
                    <button 
                      onClick={handleSavePlan}
                      className={`flex-[2] py-2.5 rounded-lg font-medium text-sm transition-all shadow-md flex items-center justify-center gap-2 ${theme.primaryBtn}`}
                    >
                      <Save className="w-4 h-4" />
                      Accept & Save Plan
                    </button>
                  </div>
                </motion.div>
              )}

              {/* --- ACTIVE STATE --- */}
              {viewState === 'active' && activePlan && (
                <motion.div 
                  key="active"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="max-w-4xl mx-auto space-y-8"
                >
                  {/* Progress Header */}
                  <div className={`p-6 rounded-xl border relative overflow-hidden ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-1">Overall Progress</div>
                        <div className={`text-3xl font-bold tracking-tight ${theme.text}`}>{activePlan.progress}%</div>
                      </div>
                      <div className="flex-1 md:max-w-md">
                        <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-indigo-600 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${activePlan.progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="relative space-y-0">
                    {/* Vertical Connecting Line */}
                    <div className={`absolute left-3.5 top-2 bottom-4 w-px ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`} />

                    {activePlan.schedule.map((day, dIdx) => {
                      const isCompleted = day.tasks.every(t => t.completed);
                      const isPending = day.tasks.some(t => !t.completed);
                      
                      return (
                        <div key={dIdx} className="relative pl-10 pb-8 last:pb-0 group">
                          {/* Node Dot */}
                          <div className={`absolute left-0 top-1 w-7 h-7 rounded-full border-4 flex items-center justify-center transition-colors z-10 ${
                            isCompleted 
                              ? 'bg-emerald-500 border-emerald-500' 
                              : isPending 
                                ? 'bg-indigo-600 border-indigo-200 dark:border-indigo-900'
                                : isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-zinc-300'
                          }`}>
                            {isCompleted && <Check className="w-3 h-3 text-white" />}
                            {!isCompleted && isPending && <Activity className="w-3 h-3 text-white" />}
                          </div>

                          {/* Day Header */}
                          <div className="mb-4">
                            <h3 className={`text-base font-bold ${theme.text}`}>
                              {typeof day.day === 'number' ? `Day ${day.day}` : day.day}
                            </h3>
                            <p className={`text-sm ${theme.subText}`}>{day.focus}</p>
                          </div>

                          {/* Tasks */}
                          <div className="grid gap-3">
                            {day.tasks.map((task, tIdx) => (
                              <div 
                                key={tIdx}
                                onClick={() => handleToggleTask(dIdx, tIdx)}
                                className={`
                                  relative p-3 rounded-lg border cursor-pointer transition-all duration-200 flex items-start gap-3
                                  ${task.completed 
                                    ? (isDark ? 'bg-emerald-950/20 border-emerald-900/30' : 'bg-emerald-50 border-emerald-100')
                                    : (isDark ? 'bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800' : 'bg-white border-zinc-200 hover:border-indigo-300 shadow-sm')
                                  }
                                `}
                              >
                                <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                  task.completed 
                                    ? 'bg-emerald-500 border-emerald-500' 
                                    : (isDark ? 'border-zinc-600' : 'border-zinc-300')
                                }`}>
                                  {task.completed && <Check className="w-2.5 h-2.5 text-white" />}
                                </div>
                                <div className="flex-1">
                                  <p className={`text-sm font-medium ${
                                    task.completed 
                                      ? 'text-emerald-600 dark:text-emerald-400 line-through' 
                                      : theme.text
                                  }`}>
                                    {task.text}
                                  </p>
                                  {task.duration && (
                                    <span className={`text-[10px] font-mono mt-1 block opacity-70 ${theme.subText}`}>
                                      {task.duration}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Reset Actions */}
                  <div className="pt-8 flex justify-center pb-8">
                    <button 
                      onClick={() => {
                        if(confirm("Create a new plan? This will archive the current plan locally.")) {
                          setViewState('form');
                          setGeneratedPlan(null);
                          setActivePlan(null);
                        }
                      }}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'}`}
                    >
                      <RotateCcw className="w-4 h-4" />
                      Generate New Plan
                    </button>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default StudyPlanGenerator;