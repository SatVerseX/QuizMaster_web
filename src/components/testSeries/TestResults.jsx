import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import usePopup from '../../hooks/usePopup';
import BeautifulPopup from '../common/BeautifulPopup';
import TestSeriesVoiceExplainer from './voice/TestSeriesVoiceExplainer';
import EnhancedIndianVoiceExplainer from './voice/EnhancedIndianVoiceExplainer';
import { FiMic } from 'react-icons/fi';
import {
  FiClock,
  FiCheck,
  FiX,
  FiBarChart2,
  FiHome,
  FiRefreshCw,
  FiShare2,
  FiCheckCircle,
  FiAlertTriangle
} from 'react-icons/fi';
import {
  FaTrophy,
  FaMedal,
  FaChartLine,
} from 'react-icons/fa';

const TestResults = ({
  attempt,
  testSeries,
  onRetakeTest,
  onViewAnalysis,
  onBackToSeries
}) => {
  const { isDark } = useTheme(); // Assuming useTheme is imported
  const [confettiActive, setConfettiActive] = useState(false);
  
  // --- Derived State ---
  // Use the explicit isPassed flag from the attempt if available
  // Fallback to percentage logic only if isPassed is undefined (backward compatibility)
  const isPassed = attempt.isPassed !== undefined 
    ? attempt.isPassed 
    : attempt.percentage >= 40; // Default fallback

  useEffect(() => {
    if (isPassed) {
      setConfettiActive(true);
      // Stop confetti after 5 seconds
      const timer = setTimeout(() => setConfettiActive(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isPassed]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // --- Styles based on Result ---
  const resultStyles = isPassed 
    ? {
        bg: 'from-emerald-900 to-teal-900',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        icon: FaTrophy,
        iconColor: 'text-yellow-400',
        title: 'Congratulations!',
        sub: 'You have passed the test.',
        badge: 'bg-emerald-500'
      }
    : {
        bg: 'from-red-900 to-orange-900',
        text: 'text-red-400',
        border: 'border-red-500/30',
        icon: FiAlertTriangle,
        iconColor: 'text-red-500',
        title: 'Keep Practicing',
        sub: 'You did not meet the passing score.',
        badge: 'bg-red-500'
      };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white relative overflow-x-hidden">
      
      {/* Confetti for Pass */}
      {/* (Ensure React Confetti is imported or use CSS animation) */}
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        
        {/* Header */}
        <div className="text-center mb-12">
           <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-full text-sm font-bold uppercase tracking-widest mb-6 ${isPassed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
              {isPassed ? 'Passed' : 'Failed'}
           </div>
           <h1 className="text-4xl md:text-5xl font-black mb-2">{resultStyles.title}</h1>
           <p className="text-slate-400">{resultStyles.sub}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           
           {/* Score Card */}
           <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${resultStyles.bg} p-1`}>
              <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
              <div className="relative h-full bg-slate-900/80 rounded-[22px] p-8 flex flex-col items-center justify-center text-center">
                  <resultStyles.icon className={`w-20 h-20 mb-6 ${resultStyles.iconColor}`} />
                  
                  <div className="text-6xl font-black text-white mb-2">
                    {attempt.percentage}%
                  </div>
                  
                  <div className="text-sm text-slate-400 mb-8">
                     Score: {attempt.totalScore} / {attempt.maxScore || (attempt.totalQuestions * 1)}
                     {attempt.passingScore && <span className="block mt-1 text-xs opacity-70">(Passing Score: {attempt.passingScore})</span>}
                  </div>

                  <div className="w-full grid grid-cols-2 gap-4 mb-8">
                     <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
                        <div className="text-emerald-400 font-bold text-xl">{attempt.score}</div>
                        <div className="text-xs text-slate-500 uppercase font-bold">Correct</div>
                     </div>
                     <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
                        <div className="text-red-400 font-bold text-xl">{attempt.totalQuestions - attempt.score}</div>
                        <div className="text-xs text-slate-500 uppercase font-bold">Incorrect</div>
                     </div>
                  </div>

                  <button 
                    onClick={onViewAnalysis}
                    className="w-full py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <FiBarChart2 /> Detailed Analysis
                  </button>
              </div>
           </div>

           {/* Stats & Actions */}
           <div className="flex flex-col gap-6">
              
              {/* Time & Accuracy */}
              <div className="grid grid-cols-2 gap-6">
                 <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-3xl">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                       <FiClock className="w-5 h-5" />
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{formatTime(attempt.timeSpent)}</div>
                    <div className="text-xs text-slate-500 uppercase font-bold">Time Taken</div>
                 </div>
                 <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-3xl">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
                       <FiTarget className="w-5 h-5" />
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{attempt.totalQuestions}</div>
                    <div className="text-xs text-slate-500 uppercase font-bold">Total Questions</div>
                 </div>
              </div>

              {/* Actions */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-3xl p-6 flex flex-col gap-4 flex-1 justify-center">
                 <button onClick={onRetakeTest} className="w-full py-3.5 rounded-xl border border-slate-600 text-slate-300 font-semibold hover:bg-slate-700 hover:text-white transition-all flex items-center justify-center gap-2">
                    <FiRefreshCw /> Retake Test
                 </button>
                 <button onClick={onBackToSeries} className="w-full py-3.5 rounded-xl border border-slate-600 text-slate-300 font-semibold hover:bg-slate-700 hover:text-white transition-all flex items-center justify-center gap-2">
                    <FiHome /> Back to Dashboard
                 </button>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
};

import { useTheme } from '../../contexts/ThemeContext'; // Delayed import helper
export default TestResults;