import React from 'react';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const StatCard = ({ icon: Icon, value, label, color, trend, trendValue, mode }) => (
  <div className={mode(
    "bg-white backdrop-blur-sm border border-slate-200 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:bg-slate-50 transition-all shadow-sm",
    "bg-gray-800/60 backdrop-blur-sm border border-gray-700/60 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:bg-gray-800/80 transition-all"
  )}>
    <div className="flex items-center gap-2 sm:gap-4">
      <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${color}`}>
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
      </div>
      <div className="flex-1">
        <div className={mode("text-lg sm:text-xl lg:text-2xl font-bold text-slate-800", "text-lg sm:text-xl lg:text-2xl font-bold text-white")}>{value}</div>
        <div className={mode("text-xs sm:text-sm text-slate-600 flex items-center gap-1 sm:gap-2", "text-xs sm:text-sm text-gray-400 flex items-center gap-1 sm:gap-2")}>
          <span className="hidden sm:inline">{label}</span>
          <span className="sm:hidden">{label.split(' ')[0]}</span>
          {trend && (
            <span className={`flex items-center gap-1 text-xs ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? <FiTrendingUp className="w-3 h-3" /> : <FiTrendingDown className="w-3 h-3" />}
              <span className="hidden sm:inline">{trendValue}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default StatCard;
