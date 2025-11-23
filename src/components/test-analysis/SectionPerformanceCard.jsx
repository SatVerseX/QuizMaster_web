import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  FiTarget, FiCheckCircle, FiXCircle, FiMinus, 
  FiChevronRight, FiTrendingUp, FiAward 
} from 'react-icons/fi';

const SectionPerformanceCard = ({ section, onClick, isSelected }) => {
  const { isDark } = useTheme();

  // 1. Color Theme Logic (Extracting complexity)
  const getPerformanceTheme = (accuracy) => {
    if (accuracy >= 80) return {
      color: 'emerald',
      text: isDark ? 'text-emerald-400' : 'text-emerald-700',
      bg: isDark ? 'bg-emerald-500/10' : 'bg-emerald-50',
      border: isDark ? 'border-emerald-500/20' : 'border-emerald-100',
      bar: 'from-emerald-500 to-teal-400',
      badge: isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-800'
    };
    if (accuracy >= 60) return {
      color: 'amber',
      text: isDark ? 'text-amber-400' : 'text-amber-700',
      bg: isDark ? 'bg-amber-500/10' : 'bg-amber-50',
      border: isDark ? 'border-amber-500/20' : 'border-amber-100',
      bar: 'from-amber-500 to-orange-400',
      badge: isDark ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-800'
    };
    return {
      color: 'rose',
      text: isDark ? 'text-rose-400' : 'text-rose-700',
      bg: isDark ? 'bg-rose-500/10' : 'bg-rose-50',
      border: isDark ? 'border-rose-500/20' : 'border-rose-100',
      bar: 'from-rose-500 to-red-400',
      badge: isDark ? 'bg-rose-500/20 text-rose-300' : 'bg-rose-100 text-rose-800'
    };
  };

  const theme = getPerformanceTheme(section.stats.accuracy);

  // 2. Structural Styles
  const styles = {
    card: isSelected
      ? (isDark ? 'border-blue-500/50 bg-blue-900/10 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'border-blue-500 bg-blue-50/50 shadow-md ring-1 ring-blue-500/20')
      : (isDark ? 'border-gray-800 bg-gray-900/40 hover:bg-gray-800/60 hover:border-gray-700' : 'border-slate-100 bg-white hover:border-slate-300 hover:shadow-lg'),
    
    divider: isDark ? 'border-gray-800' : 'border-slate-100',
    textPrimary: isDark ? 'text-gray-100' : 'text-slate-800',
    textSecondary: isDark ? 'text-gray-400' : 'text-slate-500',
    trackBg: isDark ? 'bg-gray-700' : 'bg-slate-100',
    
    // Micro-card styles for the grid
    statCard: isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-slate-50 border-slate-100'
  };

  return (
    <div 
      onClick={onClick}
      className={`
        relative group cursor-pointer transition-all duration-300 ease-out 
        rounded-2xl border p-5 backdrop-blur-sm
        ${styles.card}
      `}
    >
      {/* Top Row: Title & Badge */}
      <div className="flex justify-between items-start mb-5 gap-4">
        <div>
          <h4 className={`font-bold text-lg leading-tight mb-1 flex items-center gap-2 ${styles.textPrimary}`}>
            {section.name}
            {section.stats.accuracy >= 90 && (
               <FiAward className="w-4 h-4 text-yellow-500" title="Top Performer" />
            )}
          </h4>
          <p className={`text-xs font-medium uppercase tracking-wider ${styles.textSecondary}`}>
            {section.stats.total} Questions
          </p>
        </div>
        
        {/* Percentage Badge */}
        <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-sm ${theme.badge} ${theme.border}`}>
          <FiTarget className="w-3.5 h-3.5" />
          <span>{section.stats.accuracy.toFixed(0)}%</span>
        </div>
      </div>

      {/* Progress Bar Section */}
      <div className="mb-6">
        <div className="flex justify-between text-xs font-semibold mb-1.5">
          <span className={styles.textSecondary}>Accuracy</span>
          <span className={theme.text}>{section.stats.accuracy.toFixed(1)}%</span>
        </div>
        <div className={`h-2.5 w-full rounded-full overflow-hidden ${styles.trackBg}`}>
          <div 
            className={`h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out shadow-sm ${theme.bar}`}
            style={{ width: `${section.stats.accuracy}%` }}
          />
        </div>
      </div>

      {/* Stats Grid - "Micro Cards" */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <StatItem 
          icon={FiCheckCircle} 
          label="Correct" 
          value={section.stats.correct} 
          colorClass={isDark ? 'text-emerald-400' : 'text-emerald-600'}
          bgClass={styles.statCard}
          isDark={isDark}
        />
        <StatItem 
          icon={FiXCircle} 
          label="Wrong" 
          value={section.stats.incorrect} 
          colorClass={isDark ? 'text-rose-400' : 'text-rose-600'}
          bgClass={styles.statCard}
          isDark={isDark}
        />
        <StatItem 
          icon={FiMinus} 
          label="Skipped" 
          value={section.stats.skipped} 
          colorClass={isDark ? 'text-gray-400' : 'text-slate-500'}
          bgClass={styles.statCard}
          isDark={isDark}
        />
      </div>

      {/* Footer Action */}
      <div className={`pt-4 border-t flex items-center justify-between  transition-all ${styles.divider}`}>
        <div className="flex items-center gap-2">
           <div className={`p-1.5 rounded-full ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-slate-100 text-slate-500'}`}>
              <FiTrendingUp className="w-3 h-3" />
           </div>
           <span className={`text-xs font-bold ${styles.textSecondary}`}>
              View Analysis
           </span>
        </div>
        <div className={`
          w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
          ${isDark ? 'bg-gray-800 text-gray-300 group-hover:bg-blue-600 group-hover:text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-500 group-hover:text-white'}
        `}>
          <FiChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

// --- Sub Component for Cleaner Code ---

const StatItem = ({ icon: Icon, label, value, colorClass, bgClass, isDark }) => (
  <div className={`flex flex-col items-center justify-center py-2.5 rounded-xl border ${bgClass}`}>
    <span className={`text-lg font-bold tabular-nums mb-0.5 ${isDark ? 'text-white' : 'text-slate-800'}`}>
      {value}
    </span>
    <div className="flex items-center gap-1.5">
      <Icon className={`w-3 h-3 ${colorClass}`} />
      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
        {label}
      </span>
    </div>
  </div>
);

export default SectionPerformanceCard;