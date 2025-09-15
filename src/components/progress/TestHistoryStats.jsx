
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  FiBookOpen,
  FiTarget,
  FiTrendingUp,
  FiTrendingDown
} from 'react-icons/fi';
import { FaTrophy } from 'react-icons/fa';

const TestHistoryStats = ({ stats, showStatsDetails }) => {
  const { isDark } = useTheme();

  const StatCard = ({ icon, value, label, colorClass, bgClass }) => (
    <div className={`group relative rounded-xl sm:rounded-2xl p-2 sm:p-4 shadow-lg transition-all duration-500 hover:scale-105 ${bgClass}`}>
      <div className={`absolute inset-0 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
        isDark ? 'bg-gradient-to-br from-blue-500/5 to-blue-600/5' : 'bg-gradient-to-br from-blue-50/50 to-blue-100/50'
      }`}></div>
      <div className="relative flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg ${colorClass}`}>
          {icon}
        </div>
        <div className="text-center sm:text-left">
          <div className={`text-lg sm:text-xl font-black mb-0 ${
            isDark ? 'text-blue-300' : 'text-blue-700'
          }`}>
            {value}
          </div>
          <div className={`font-semibold text-xs ${
            isDark ? 'text-blue-200' : 'text-blue-600'
          }`}>
            {label}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6 ${showStatsDetails ? 'block' : 'hidden sm:grid'}`}>
      <StatCard
        icon={<FiBookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
        value={stats.totalTests}
        label="Total Tests"
        colorClass={isDark ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-blue-600 to-indigo-600'}
        bgClass={isDark 
          ? 'bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border border-gray-600/40 hover:shadow-blue-500/10 hover:border-blue-500/30'
          : 'bg-white/90 backdrop-blur-sm border border-slate-200/60 hover:shadow-blue-500/20 hover:border-blue-300/60'
        }
      />

      <StatCard
        icon={<FiTarget className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
        value={`${stats.avgScore}%`}
        label="Average Score"
        colorClass={isDark ? 'bg-gradient-to-br from-emerald-500 to-green-600' : 'bg-gradient-to-br from-emerald-600 to-green-700'}
        bgClass={isDark 
          ? 'bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border border-gray-600/40 hover:shadow-emerald-500/10 hover:border-emerald-500/30'
          : 'bg-white/90 backdrop-blur-sm border border-slate-200/60 hover:shadow-emerald-500/20 hover:border-emerald-300/60'
        }
      />

      <StatCard
        icon={<FaTrophy className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
        value={`${stats.bestScore}%`}
        label="Best Score"
        colorClass={isDark ? 'bg-gradient-to-br from-yellow-500 to-orange-600' : 'bg-gradient-to-br from-yellow-500 to-orange-600'}
        bgClass={isDark 
          ? 'bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border border-gray-600/40 hover:shadow-yellow-500/10 hover:border-yellow-500/30'
          : 'bg-white/90 backdrop-blur-sm border border-slate-200/60 hover:shadow-yellow-500/20 hover:border-yellow-300/60'
        }
      />

      <StatCard
        icon={stats.recentTrend >= 0 ? (
          <FiTrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        ) : (
          <FiTrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        )}
        value={`${stats.recentTrend > 0 ? '+' : ''}${stats.recentTrend}%`}
        label="Recent Trend"
        colorClass={isDark ? 'bg-gradient-to-br from-purple-500 to-violet-600' : 'bg-gradient-to-br from-purple-600 to-violet-700'}
        bgClass={isDark 
          ? 'bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border border-gray-600/40 hover:shadow-purple-500/10 hover:border-purple-500/30'
          : 'bg-white/90 backdrop-blur-sm border border-slate-200/60 hover:shadow-purple-500/20 hover:border-purple-300/60'
        }
      />
    </div>
  );
};

export default TestHistoryStats;
