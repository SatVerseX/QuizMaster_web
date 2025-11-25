import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom"; // IMPORT THIS FOR PORTAL
import { useTheme } from "../../contexts/ThemeContext";
import {
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiLoader,
  FiCheck,
  FiAlertCircle,
  FiZap,
  FiBookOpen
} from "react-icons/fi";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const SectionQuestionNavigator = ({ section, onClose }) => {
  const { isDark } = useTheme();
  
  // --- State ---
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [explanations, setExplanations] = useState({});
  const navScrollRef = useRef(null);

  const currentQuestion = section.questions[currentQuestionIndex];

  // --- Styles ---
  const styles = {
    overlay: isDark ? "bg-black/80 backdrop-blur-md" : "bg-slate-900/40 backdrop-blur-sm",
    modal: isDark ? "bg-gray-900 border-gray-700" : "bg-white border-transparent",
    header: isDark ? "bg-gray-800/90 border-gray-700" : "bg-white/90 border-slate-200",
    body: isDark ? "bg-gray-900" : "bg-slate-50",
    
    textPrimary: isDark ? "text-gray-100" : "text-slate-900",
    textSecondary: isDark ? "text-gray-400" : "text-slate-500",
    
    card: isDark 
      ? "bg-gray-800 border-gray-700 shadow-xl" 
      : "bg-white border-slate-200 shadow-xl shadow-slate-200/50",
      
    // Option styling
    option: (status) => {
      const base = "p-4 rounded-xl border-2 transition-all duration-200 cursor-default ";
      if (status === 'correct') return base + (isDark ? "bg-emerald-500/10 border-emerald-500/50" : "bg-emerald-50 border-emerald-500");
      if (status === 'wrong') return base + (isDark ? "bg-rose-500/10 border-rose-500/50" : "bg-rose-50 border-rose-500");
      return base + (isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-slate-200");
    },

    navBtn: (isActive, status) => {
      let base = "shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-200 border ";
      if (isActive) return base + "bg-indigo-600 text-white border-indigo-500 scale-110 shadow-lg z-10 ring-2 ring-indigo-200 dark:ring-indigo-900";
      if (status === 'correct') return base + (isDark ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-emerald-50 text-emerald-600 border-emerald-200");
      if (status === 'incorrect') return base + (isDark ? "bg-rose-500/10 text-rose-400 border-rose-500/30" : "bg-rose-50 text-rose-600 border-rose-200");
      return base + (isDark ? "bg-gray-800 text-gray-500 border-gray-700 hover:bg-gray-700" : "bg-white text-slate-400 border-slate-200 hover:bg-gray-50");
    }
  };

  // --- Effects ---
  useEffect(() => {
    // Lock scroll on mount
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "unset");
  }, []);

  useEffect(() => {
    if (navScrollRef.current) {
      const activeBtn = navScrollRef.current.children[currentQuestionIndex];
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentQuestionIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") { showExplanation ? setShowExplanation(false) : onClose(); }
      if (!showExplanation) {
        if (e.key === "ArrowRight") nextQ();
        if (e.key === "ArrowLeft") prevQ();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentQuestionIndex, showExplanation]);

  // --- Logic ---
  const nextQ = () => currentQuestionIndex < section.questions.length - 1 && setCurrentQuestionIndex(p => p + 1);
  const prevQ = () => currentQuestionIndex > 0 && setCurrentQuestionIndex(p => p - 1);

  const handleExplanation = async () => {
    if (showExplanation) { setShowExplanation(false); return; }
    const id = `${section.name}-${currentQuestionIndex}`;
    if (explanations[id]) { setShowExplanation(true); return; }

    setShowExplanation(true);
    setIsLoadingExplanation(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
      const prompt = `Explain concisely:\nQ: "${currentQuestion.question}"\nCorrect: "${currentQuestion.options[currentQuestion.correctAnswer]}"\nWhy is this correct?`;
      const result = await model.generateContent(prompt);
      setExplanations(prev => ({ ...prev, [id]: result.response.text() }));
    } catch (e) {
      setExplanations(prev => ({ ...prev, [id]: "Explanation unavailable." }));
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  if (!section.questions.length) return null;

  // --- THE PORTAL FIX ---
  // Using createPortal pushes this entire div to document.body
  // This ensures z-index works correctly and it covers the full screen.
  return createPortal(
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-0 md:p-4 ${styles.overlay}`}>
      
      {/* Modal Container */}
      <div className={`w-full h-full md:h-[90vh] md:max-w-5xl flex flex-col md:rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200 border ${styles.modal}`}>
        
        {/* 1. Header & Nav Strip */}
        <div className={`shrink-0 z-20 border-b ${styles.header}`}>
          {/* Top Bar */}
          <div className="flex items-center justify-between px-4 py-3 md:px-6">
            <div className="flex items-center gap-3">
              <button onClick={onClose} className={`p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${styles.textSecondary}`}>
                <FiX className="w-5 h-5" />
              </button>
              <div>
                <h2 className={`text-sm md:text-base font-bold leading-tight ${styles.textPrimary}`}>{section.name}</h2>
                <p className={`text-[10px] md:text-xs font-medium uppercase tracking-wider ${styles.textSecondary}`}>Review Mode</p>
              </div>
            </div>
            
            {/* AI Action */}
            <button 
              onClick={handleExplanation}
              className="hidden md:flex items-center gap-2 px-3 py-3 rounded-full bg-black  text-white text-lg font-bold  hover:scale-105 transition-all"
            >
              <FiZap />
            </button>
          </div>

          {/* Number Strip */}
          <div className="px-4 pb-3 md:px-6 overflow-x-auto no-scrollbar" ref={navScrollRef}>
            <div className="flex gap-2 min-w-max px-1 py-1">
              {section.questions.map((q, idx) => (
                <button key={idx} onClick={() => setCurrentQuestionIndex(idx)} className={styles.navBtn(idx === currentQuestionIndex, q.status)}>
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Scrollable Body */}
        <div className={`flex-1 overflow-y-auto p-4 md:p-8 ${styles.body}`}>
          <div className="max-w-3xl mx-auto space-y-6">
            
            {/* Question Card */}
            <div className={`p-6 rounded-2xl border ${styles.card}`}>
               <div className="flex justify-between items-start mb-4">
                 <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
                   Question {currentQuestionIndex + 1}
                 </span>
                 
                 {/* Mobile AI Button */}
                 <button onClick={handleExplanation} className="md:hidden text-indigo-500">
                    <FiZap className="w-5 h-5" />
                 </button>
               </div>

               <div className={`text-lg md:text-xl font-medium leading-relaxed mb-6 ${styles.textPrimary}`}>
                 {currentQuestion.question}
               </div>

               {currentQuestion.image && (
                 <div className="mb-6 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-black/5">
                   <img src={currentQuestion.image} alt="Question Reference" className="w-full h-auto max-h-80 object-contain mx-auto" />
                 </div>
               )}
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 gap-3">
              {currentQuestion.options.map((opt, idx) => {
                const isCorrect = idx === currentQuestion.correctAnswer;
                const isSelected = idx === currentQuestion.userAnswer;
                const status = isCorrect ? 'correct' : (isSelected && !isCorrect) ? 'wrong' : 'neutral';

                return (
                  <div key={idx} className={styles.option(status)}>
                    <div className="flex gap-4">
                      <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold 
                        ${isCorrect ? 'bg-emerald-500 text-white' : (status === 'wrong') ? 'bg-rose-500 text-white' : (isDark ? 'bg-gray-700 text-gray-300' : 'bg-slate-100 text-slate-500')}
                      `}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <div className="flex-1">
                        <div className={`text-base font-medium ${isCorrect ? (isDark ? 'text-emerald-400' : 'text-emerald-700') : (status === 'wrong') ? (isDark ? 'text-rose-400' : 'text-rose-700') : styles.textPrimary}`}>
                          {opt}
                        </div>
                        {currentQuestion.optionImages?.[idx] && (
                          <img src={currentQuestion.optionImages[idx]} alt="Option" className="mt-3 h-24 rounded border object-contain" />
                        )}
                        {(isCorrect || status === 'wrong') && (
                          <div className={`flex items-center gap-1.5 mt-2 text-xs font-bold uppercase ${isCorrect ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {isCorrect ? <FiCheck /> : <FiAlertCircle />}
                            {isCorrect ? "Correct Answer" : "Your Answer"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Standard Explanation */}
            {currentQuestion.explanation && (
              <div className={`p-6 rounded-xl border-l-4 ${isDark ? 'bg-blue-900/10 border-blue-500' : 'bg-blue-50 border-blue-500'}`}>
                <h4 className={`flex items-center gap-2 font-bold text-sm mb-2 ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                  <FiBookOpen /> Explanation
                </h4>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-blue-100' : 'text-blue-900'}`}>
                  {currentQuestion.explanation}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 3. Footer */}
        <div className={`p-4 border-t flex justify-between items-center ${styles.header}`}>
          <button 
            onClick={prevQ} 
            disabled={currentQuestionIndex === 0}
            className={`px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700'}`}
          >
            <FiChevronLeft /> Prev
          </button>
          
          <button 
            onClick={nextQ} 
            disabled={currentQuestionIndex === section.questions.length - 1}
            className="px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50 bg-blue-700 text-white shadow-lg shadow-indigo-500/20"
          >
            Next <FiChevronRight />
          </button>
        </div>

      </div>

      {/* AI Modal Overlay (Nested Portal not needed, handled by absolute) */}
      {showExplanation && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowExplanation(false)}>
          <div className={`relative w-full max-w-2xl max-h-[80vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${styles.modal}`} onClick={e => e.stopPropagation()}>
            <div className="p-4 bg-black text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <FiZap className="w-5 h-5" />
                <h3 className="font-bold">AI Tutor</h3>
              </div>
              <button onClick={() => setShowExplanation(false)} className="p-1 hover:bg-white/20 rounded"><FiX /></button>
            </div>
            <div className={`flex-1 overflow-y-auto p-6 ${styles.textPrimary}`}>
              {isLoadingExplanation ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <FiLoader className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
                  <p>Thinking...</p>
                </div>
              ) : (
                <div className="whitespace-pre-wrap leading-relaxed">{explanations[`${section.name}-${currentQuestionIndex}`]}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body // PORTAL TARGET
  );
};

export default SectionQuestionNavigator;