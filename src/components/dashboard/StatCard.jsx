import React from 'react';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const StatCard = ({ icon: Icon, value, label, color, trend, trendValue, mode }) => {
  // Extract base color name (e.g., 'blue') from the passed color class if possible, 
  // or default to a standard mapping. Assuming 'color' prop might be 'bg-blue-600'
  
  return (
    <div className={mode(
      "bg-white border border-slate-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300",
      "bg-gray-800/40 border border-gray-700/50 rounded-xl p-5 hover:bg-gray-800/60 transition-all duration-300"
    )}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className={mode("text-sm font-medium text-slate-500", "text-sm font-medium text-gray-400")}>
            {label}
          </p>
          <h3 className={mode("text-2xl font-bold text-slate-900 mt-1", "text-2xl font-bold text-white mt-1")}>
            {value}
          </h3>
        </div>
        <div className={mode(
          `p-2.5 rounded-lg opacity-90 ${color.replace('bg-', 'text-').replace('600', '600')} bg-opacity-10`, 
          `p-2.5 rounded-lg bg-gray-700/50 text-white`
        )}>
          {/* Note: This assumes 'color' passes a bg class. For cleaner SaaS, we usually pass a color string like 'blue' */}
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      {trend && (
        <div className="flex items-center gap-2 text-xs font-medium">
          <span className={`
            flex items-center gap-1 px-1.5 py-0.5 rounded-md
            ${trend === 'up' 
              ? (mode('text-emerald-700 bg-emerald-50', 'text-emerald-400 bg-emerald-900/20')) 
              : (mode('text-rose-700 bg-rose-50', 'text-rose-400 bg-rose-900/20'))
            }
          `}>
            {trend === 'up' ? <FiTrendingUp className="w-3 h-3" /> : <FiTrendingDown className="w-3 h-3" />}
            {trendValue}
          </span>
          <span className={mode("text-slate-400", "text-gray-500")}>vs last month</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;