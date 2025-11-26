import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { FiRefreshCw } from 'react-icons/fi';

const FlashcardCard = ({ card, isFlipped, onFlip }) => {
  const { isDark } = useTheme();

  return (
    <div 
      className="relative w-full h-80 sm:h-96 perspective-1000 group cursor-pointer" 
      onClick={onFlip}
      style={{ perspective: '1000px' }} // Ensure perspective is applied
    >
      <motion.div
        className="w-full h-full relative"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* ================= FRONT (QUESTION) ================= */}
        <div 
          className={`absolute inset-0 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center overflow-hidden border transition-all duration-300 backface-hidden ${
            isDark 
              ? 'bg-gradient-to-br from-zinc-800 to-zinc-900 border-zinc-700 text-white shadow-2xl' 
              : 'bg-white border-slate-200 text-slate-900 shadow-xl'
          }`}
          style={{ backfaceVisibility: 'hidden' }} // Explicit inline style for Safari support
        >
          
          {/* Decorative Elements */}
          <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none ${isDark ? 'bg-indigo-500' : 'bg-indigo-400'}`} />
          <div className={`absolute bottom-0 left-0 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none ${isDark ? 'bg-purple-500' : 'bg-purple-400'}`} />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center gap-6 w-full">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
              isDark ? 'bg-zinc-700 text-zinc-300' : 'bg-slate-100 text-slate-600'
            }`}>
              Q
            </div>

            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold leading-snug max-h-[60%] overflow-y-auto custom-scrollbar">
              {card.front}
            </h3>

            <div className={`text-[10px] font-bold uppercase tracking-widest mt-auto ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
              Tap to Flip
            </div>
          </div>
        </div>

        {/* ================= BACK (ANSWER) ================= */}
        <div 
          className={`absolute inset-0 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center overflow-hidden border backface-hidden ${
            isDark 
              ? 'bg-zinc-900 border-emerald-900/50 text-white shadow-2xl' 
              : 'bg-emerald-50/30 border-emerald-100 text-slate-900 shadow-xl'
          }`} 
          style={{ 
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden' 
          }}
        >
          {/* Subtle Grid Pattern */}
          <div className={`absolute inset-0 opacity-5 pointer-events-none`} style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

          <div className="relative z-10 flex flex-col items-center gap-6 w-full">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
              isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
            }`}>
              A
            </div>

            <p className={`text-lg sm:text-xl font-medium leading-relaxed max-h-[60%] overflow-y-auto custom-scrollbar ${
              isDark ? 'text-emerald-50' : 'text-slate-800'
            }`}>
              {card.back}
            </p>

            <div className={`mt-auto flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${
              isDark ? 'text-emerald-500' : 'text-emerald-600'
            }`}>
              <FiRefreshCw className="w-3 h-3" /> 
              Review
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
};

export default FlashcardCard;