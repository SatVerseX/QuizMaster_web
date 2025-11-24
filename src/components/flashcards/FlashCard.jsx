import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { FiRefreshCw } from 'react-icons/fi';

const FlashcardCard = ({ card, isFlipped, onFlip }) => {
  const { isDark } = useTheme();

  return (
    <div className="relative w-full h-80 sm:h-96 perspective-1000 group cursor-pointer" onClick={onFlip}>
      <motion.div
        className="w-full h-full relative preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* ================= FRONT (QUESTION) ================= */}
        <div className={`absolute inset-0 backface-hidden rounded-[2rem] p-8 flex flex-col items-center justify-center text-center overflow-hidden border transition-all duration-300 ${
          isDark 
            ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 text-white shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)]' 
            : 'bg-white border-slate-100 text-slate-900 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)]'
        }`}>
          
          {/* Decorative Glow Blob */}
          <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[80px] opacity-40 pointer-events-none transition-colors duration-500 ${
            isDark ? 'bg-indigo-600' : 'bg-indigo-200'
          }`} />

          {/* Content Wrapper */}
          <div className="relative z-10 flex flex-col items-center gap-6 w-full h-full">
            
            {/* 'Q' Badge */}
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm ${
              isDark ? 'bg-gray-700/50 text-indigo-300 ring-1 ring-indigo-500/20' : 'bg-slate-50 text-indigo-600 ring-1 ring-indigo-100'
            }`}>
              <span className="font-serif font-bold italic">Q</span>
            </div>

            <div className="flex-1 flex items-center justify-center">
              <h3 className="text-2xl sm:text-3xl font-bold leading-snug tracking-tight">
                {card.front}
              </h3>
            </div>

            {/* Prompt */}
            <div className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.25em] ${
              isDark ? 'text-gray-600' : 'text-slate-300'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                isDark ? 'bg-indigo-500' : 'bg-indigo-400'
              }`} />
              Tap to Reveal
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                isDark ? 'bg-indigo-500' : 'bg-indigo-400'
              }`} />
            </div>
          </div>
        </div>

        {/* ================= BACK (ANSWER) ================= */}
        <div className={`absolute inset-0 backface-hidden rounded-[2rem] p-8 flex flex-col items-center justify-center text-center overflow-hidden border ${
          isDark 
            ? 'bg-gray-900 border-emerald-900/50 text-white shadow-[0_0_50px_-12px_rgba(16,185,129,0.2)]' 
            : 'bg-[#fafcfb] border-emerald-100 text-slate-900 shadow-inner'
        }`} style={{ transform: 'rotateY(180deg)' }}>

          {/* Dot Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-[0.07] pointer-events-none" 
            style={{ backgroundImage: `radial-gradient(${isDark ? '#34d399' : '#059669'} 1px, transparent 1px)`, backgroundSize: '24px 24px' }}
          />

          <div className="relative z-10 flex flex-col items-center gap-6 w-full h-full">
            
            {/* 'A' Badge */}
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${
              isDark ? 'bg-emerald-900/20 text-emerald-400 ring-1 ring-emerald-500/20' : 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200'
            }`}>
              <span className="font-serif font-bold italic">A</span>
            </div>

            <div className="flex-1 flex items-center justify-center">
              <p className={`text-xl sm:text-2xl font-medium leading-relaxed ${
                isDark ? 'text-emerald-50' : 'text-slate-800'
              }`}>
                {card.back}
              </p>
            </div>

            <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${
              isDark ? 'text-emerald-500' : 'text-emerald-600'
            }`}>
              <FiRefreshCw className="w-3 h-3" /> 
              Concept Answer
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
};

export default FlashcardCard;