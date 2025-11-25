import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { z } from 'zod'; // Input validation
import { 
  FiCalendar, FiClock, FiTarget, FiCpu, FiList, FiCheckCircle, FiAlertCircle, FiSave 
} from 'react-icons/fi';
import { FaRobot } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

// Initialize AI securely
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Validation Schema
const planSchema = z.object({
  examName: z.string().min(2, "Exam name is too short").max(50, "Exam name is too long"),
  daysRemaining: z.number().min(1).max(365),
  dailyHours: z.number().min(1).max(16),
  weakAreas: z.string().max(200).optional()
});

const StudyPlanGenerator = ({ onClose }) => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  
  const [formData, setFormData] = useState({
    examName: '',
    daysRemaining: 30,
    dailyHours: 2,
    weakAreas: ''
  });
  
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const mode = (light, dark) => (isDark ? dark : light);

  // Generate Plan via Gemini
  const handleGenerate = async () => {
    setError('');
    setSuccess(false);

    // 1. Input Validation
    try {
      planSchema.parse(formData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
        return;
      }
    }

    setLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
      
      const prompt = `
        Act as an expert study planner. Create a ${formData.daysRemaining}-day study schedule for the ${formData.examName} exam.
        Available time: ${formData.dailyHours} hours/day.
        Focus areas: ${formData.weakAreas || "General coverage"}.
        
        Return a JSON object with this structure:
        {
          "strategy": "Brief strategy overview (max 2 sentences)",
          "schedule": [
            { "day": 1, "topic": "Topic Name", "activities": ["Read X", "Practice Y"], "focus": "Concept" },
            ... (summarize into weekly blocks if > 7 days)
          ]
        }
        Ensure strict JSON format. No markdown.
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text().replace(/```json|```/g, '').trim();
      const plan = JSON.parse(text);

      setGeneratedPlan(plan);
    } catch (err) {
      console.error("AI Plan Error:", err);
      setError("Failed to generate plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Save Plan to Firestore
  const handleSave = async () => {
    if (!currentUser || !generatedPlan) return;
    
    try {
      const planRef = doc(db, 'user-study-plans', currentUser.uid);
      await setDoc(planRef, {
        ...generatedPlan,
        meta: formData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setSuccess(true);
      setTimeout(() => onClose && onClose(), 2000);
    } catch (err) {
      setError("Failed to save plan to your profile.");
    }
  };

  return (
    <div className={`w-full max-w-4xl mx-auto rounded-3xl overflow-hidden border shadow-2xl ${mode('bg-white border-slate-200', 'bg-zinc-900 border-zinc-800')}`}>
      
      {/* Header */}
      <div className={`p-6 border-b flex items-center justify-between ${mode('bg-slate-50 border-slate-200', 'bg-zinc-950 border-zinc-800')}`}>
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${mode('bg-indigo-100 text-indigo-600', 'bg-indigo-500/20 text-indigo-400')}`}>
            <FaRobot className="w-6 h-6" />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${mode('text-slate-900', 'text-white')}`}>AI Study Planner</h2>
            <p className={`text-sm ${mode('text-slate-500', 'text-zinc-400')}`}>Personalized roadmap to success</p>
          </div>
        </div>
        <button onClick={onClose} className={`p-2 rounded-full transition-colors ${mode('hover:bg-slate-200 text-slate-500', 'hover:bg-zinc-800 text-zinc-400')}`}>
          ✕
        </button>
      </div>

      <div className="grid md:grid-cols-12 min-h-[500px]">
        {/* Input Section */}
        <div className={`md:col-span-4 p-6 border-r space-y-6 ${mode('border-slate-200 bg-white', 'border-zinc-800 bg-zinc-900')}`}>
          
          <div className="space-y-4">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${mode('text-slate-500', 'text-zinc-500')}`}>Target Exam</label>
              <div className="relative">
                <FiTarget className="absolute left-3 top-3 text-zinc-400" />
                <input 
                  type="text" 
                  value={formData.examName}
                  onChange={(e) => setFormData({...formData, examName: e.target.value})}
                  placeholder="e.g. UPSC Prelims"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none transition-all ${mode('bg-slate-50 border-slate-200 focus:border-indigo-500', 'bg-zinc-800 border-zinc-700 focus:border-indigo-500 text-white')}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${mode('text-slate-500', 'text-zinc-500')}`}>Days Left</label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-3 text-zinc-400" />
                  <input 
                    type="number" 
                    value={formData.daysRemaining}
                    onChange={(e) => setFormData({...formData, daysRemaining: parseInt(e.target.value) || 0})}
                    className={`w-full pl-10 pr-2 py-2.5 rounded-xl border outline-none transition-all ${mode('bg-slate-50 border-slate-200 focus:border-indigo-500', 'bg-zinc-800 border-zinc-700 focus:border-indigo-500 text-white')}`}
                  />
                </div>
              </div>
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${mode('text-slate-500', 'text-zinc-500')}`}>Hours/Day</label>
                <div className="relative">
                  <FiClock className="absolute left-3 top-3 text-zinc-400" />
                  <input 
                    type="number" 
                    value={formData.dailyHours}
                    onChange={(e) => setFormData({...formData, dailyHours: parseInt(e.target.value) || 0})}
                    className={`w-full pl-10 pr-2 py-2.5 rounded-xl border outline-none transition-all ${mode('bg-slate-50 border-slate-200 focus:border-indigo-500', 'bg-zinc-800 border-zinc-700 focus:border-indigo-500 text-white')}`}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${mode('text-slate-500', 'text-zinc-500')}`}>Weak Areas</label>
              <textarea 
                value={formData.weakAreas}
                onChange={(e) => setFormData({...formData, weakAreas: e.target.value})}
                placeholder="e.g. Algebra, Ancient History..."
                rows={3}
                className={`w-full p-3 rounded-xl border outline-none transition-all resize-none ${mode('bg-slate-50 border-slate-200 focus:border-indigo-500', 'bg-zinc-800 border-zinc-700 focus:border-indigo-500 text-white')}`}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2">
              <FiAlertCircle /> {error}
            </div>
          )}

          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? <FiCpu className="animate-spin" /> : <FiZap />}
            {loading ? 'Analyzing...' : 'Generate Plan'}
          </button>

        </div>

        {/* Results Section */}
        <div className={`md:col-span-8 p-6 overflow-y-auto max-h-[600px] ${mode('bg-slate-50/50', 'bg-black/20')}`}>
          {!generatedPlan ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
               <FaRobot className={`w-16 h-16 mb-4 ${mode('text-slate-300', 'text-zinc-700')}`} />
               <h3 className={`text-lg font-bold ${mode('text-slate-800', 'text-white')}`}>Ready to Plan</h3>
               <p className={mode('text-slate-500', 'text-zinc-500')}>Fill in your details and let AI craft your path.</p>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Strategy Header */}
              <div className={`p-5 rounded-2xl border ${mode('bg-white border-slate-200 shadow-sm', 'bg-zinc-900 border-zinc-800')}`}>
                <h3 className={`text-sm font-bold uppercase tracking-wider mb-2 ${mode('text-indigo-600', 'text-indigo-400')}`}>Strategy</h3>
                <p className={`text-lg font-medium leading-relaxed ${mode('text-slate-800', 'text-zinc-200')}`}>
                  {generatedPlan.strategy}
                </p>
              </div>

              {/* Timeline */}
              <div className="space-y-3">
                {generatedPlan.schedule.map((day, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`p-4 rounded-xl border flex gap-4 ${mode('bg-white border-slate-200', 'bg-zinc-900 border-zinc-800')}`}
                  >
                    <div className={`shrink-0 w-12 h-12 rounded-lg flex flex-col items-center justify-center font-bold ${mode('bg-slate-100 text-slate-600', 'bg-zinc-800 text-zinc-400')}`}>
                      <span className="text-xs uppercase">Day</span>
                      <span className="text-lg">{day.day}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                         <h4 className={`font-bold ${mode('text-slate-900', 'text-white')}`}>{day.topic}</h4>
                         <span className={`text-xs px-2 py-1 rounded font-medium ${mode('bg-indigo-50 text-indigo-600', 'bg-indigo-900/30 text-indigo-300')}`}>{day.focus}</span>
                      </div>
                      <ul className={`mt-2 text-sm space-y-1 ${mode('text-slate-600', 'text-zinc-400')}`}>
                         {day.activities.map((act, i) => (
                           <li key={i} className="flex items-start gap-2">
                             <span className="mt-1.5 w-1 h-1 rounded-full bg-current shrink-0" />
                             {act}
                           </li>
                         ))}
                      </ul>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Save Action */}
              <div className="flex justify-end pt-4">
                <button 
                  onClick={handleSave}
                  disabled={success}
                  className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
                    success 
                      ? 'bg-green-500 text-white cursor-default'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg'
                  }`}
                >
                   {success ? <FiCheckCircle /> : <FiSave />}
                   {success ? 'Plan Saved!' : 'Save Plan'}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyPlanGenerator;