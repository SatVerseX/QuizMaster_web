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
    <div className={`rounded p-3 border ${bgClass}`}>
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded flex items-center justify-center ${colorClass}`}>
          {icon}
        </div>
        <div>
          <div className={`text-lg font-medium ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}>
            {value}
          </div>
          <div className={`text-xs ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {label}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 ${showStatsDetails ? 'block' : 'hidden sm:grid'}`}>
      <StatCard
        icon={<FiBookOpen className="w-4 h-4 text-white" />}
        value={stats.totalTests}
        label="Total Tests"
        colorClass="bg-blue-600"
        bgClass={isDark 
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200'
        }
      />

      <StatCard
        icon={<FiTarget className="w-4 h-4 text-white" />}
        value={`${stats.avgScore}%`}
        label="Average Score"
        colorClass="bg-green-600"
        bgClass={isDark 
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200'
        }
      />

      <StatCard
        icon={<FaTrophy className="w-4 h-4 text-white" />}
        value={`${stats.bestScore}%`}
        label="Best Score"
        colorClass="bg-yellow-500"
        bgClass={isDark 
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200'
        }
      />

      <StatCard
        icon={stats.recentTrend >= 0 ? (
          <FiTrendingUp className="w-4 h-4 text-white" />
        ) : (
          <FiTrendingDown className="w-4 h-4 text-white" />
        )}
        value={`${stats.recentTrend > 0 ? '+' : ''}${stats.recentTrend}%`}
        label="Recent Trend"
        colorClass="bg-purple-600"
        bgClass={isDark 
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200'
        }
      />
    </div>
  );
};

export default TestHistoryStats;
