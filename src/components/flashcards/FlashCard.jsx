import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { FiRefreshCw } from 'react-icons/fi';

const FlashcardCard = ({ card, isFlipped, onFlip }) => {
  const { isDark } = useTheme();

  return (
    <div className="relative w-full h-80 sm:h-96 perspective-1000 cursor-pointer" onClick={onFlip}>
      <motion.div
        className="w-full h-full relative preserve-3d transition-all duration-500"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* FRONT */}
        <div className={`absolute inset-0 backface-hidden rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-xl border-2 ${
          isDark 
            ? 'bg-gray-800 border-gray-700 text-white' 
            : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div className="flex-1 flex items-center justify-center">
            <h3 className="text-2xl font-bold leading-relaxed">
              {card.front}
            </h3>
          </div>
          <p className={`text-sm font-medium uppercase tracking-widest mt-4 ${
            isDark ? 'text-gray-500' : 'text-slate-400'
          }`}>
            Tap to Reveal
          </p>
        </div>

        {/* BACK */}
        <div className={`absolute inset-0 backface-hidden rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-xl border-2 ${
          isDark 
            ? 'bg-gray-900 border-indigo-500/30 text-white' 
            : 'bg-slate-50 border-indigo-200 text-slate-900'
        }`} style={{ transform: 'rotateY(180deg)' }}>
          <div className="flex-1 flex items-center justify-center">
            <p className={`text-lg font-medium leading-relaxed ${
              isDark ? 'text-indigo-100' : 'text-indigo-900'
            }`}>
              {card.back}
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-indigo-500 font-bold uppercase tracking-widest">
            <FiRefreshCw className="w-3 h-3" /> Concept Answer
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FlashcardCard;