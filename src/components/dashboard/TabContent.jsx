import React from 'react';
import StatCard from './StatCard';
import TestCard from './TestCard';
import { 
  FiDollarSign, FiUsers, FiBookOpen, FiTarget, FiAward, FiStar,
  FiActivity, FiBarChart2, FiTrendingUp, FiPlus
} from 'react-icons/fi';

// Helper for Overview List Items to keep code clean
const MetricRow = ({ label, subLabel, value, icon: Icon, colorClass, mode }) => (
  <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
    <div className="flex items-center gap-4">
      <div className={`p-2.5 rounded-lg ${colorClass} bg-opacity-10`}>
        <Icon className={`w-5 h-5 ${colorClass.replace('bg-', 'text-')}`} />
      </div>
      <div>
        <div className={mode("font-semibold text-slate-800", "font-semibold text-gray-200")}>{label}</div>
        <div className={mode("text-sm text-slate-500", "text-sm text-gray-400")}>{subLabel}</div>
      </div>
    </div>
    <div className={mode("text-lg font-bold text-slate-800", "text-lg font-bold text-white")}>
      {value}
    </div>
  </div>
);

const OverviewTab = ({ dashboardData, mode, formatPrice, onCreateManual, onCreateAI, isAdmin, setShowEditor }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
    
    {/* Series Performance - Spans 2 cols */}
    <div className={mode(
      "lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm",
      "lg:col-span-2 bg-gray-900/30 rounded-2xl p-6 border border-gray-800"
    )}>
      <div className="flex items-center justify-between mb-6">
        <h3 className={mode("text-lg font-bold text-slate-800", "text-lg font-bold text-white")}>Performance Insights</h3>
      </div>
      
      <div className={mode("divide-y divide-slate-100", "divide-y divide-gray-800")}>
        <MetricRow 
          mode={mode}
          label="Conversion Rate" 
          subLabel="Visitor to Subscriber ratio"
          value={dashboardData.totalViews > 0 ? ((dashboardData.totalSubscribers / dashboardData.totalViews) * 100).toFixed(1) + '%' : '0%'}
          icon={FiTrendingUp}
          colorClass="bg-blue-600 text-blue-600"
        />
        <MetricRow 
          mode={mode}
          label="Student Satisfaction" 
          subLabel="Average rating from feedback"
          value={
            <div className="flex items-center gap-1">
               <span className="text-yellow-500">{dashboardData.averageRating}</span>
               <FiStar className="w-4 h-4 text-yellow-500 fill-current" />
            </div>
          }
          icon={FiStar}
          colorClass="bg-yellow-500 text-yellow-500"
        />
        <MetricRow 
          mode={mode}
          label="Revenue / Sub" 
          subLabel="Average revenue per user"
          value={dashboardData.totalSubscribers > 0 ? formatPrice(dashboardData.totalEarnings / dashboardData.totalSubscribers) : formatPrice(0)}
          icon={FiDollarSign}
          colorClass="bg-emerald-600 text-emerald-600"
        />
      </div>
    </div>

    {/* Quick Actions - Spans 1 col */}
    <div className="space-y-6">
       <div className={mode(
        "bg-white rounded-2xl p-6 border border-slate-100 shadow-sm h-full",
        "bg-gray-900/30 rounded-2xl p-6 border border-gray-800 h-full"
      )}>
        <h3 className={mode("text-lg font-bold text-slate-800 mb-4", "text-lg font-bold text-white mb-4")}>Quick Actions</h3>
        
        <div className="space-y-3">
          <button onClick={onCreateManual} className={mode(
            "w-full group flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all",
            "w-full group flex items-center gap-3 p-3 rounded-xl border border-gray-700 hover:border-blue-700 hover:bg-blue-900/20 transition-all"
          )}>
            <div className="p-2 bg-blue-100  rounded-lg text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <FiBookOpen className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className={mode("font-semibold text-slate-700 group-hover:text-blue-700", "font-semibold text-gray-200 group-hover:text-blue-400")}>Manual Test</div>
              <div className="text-xs text-slate-500 dark:text-gray-500">Create from scratch</div>
            </div>
          </button>

          <button onClick={onCreateAI} className={mode(
            "w-full group flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-all",
            "w-full group flex items-center gap-3 p-3 rounded-xl border border-gray-700 hover:border-purple-700 hover:bg-purple-900/20 transition-all"
          )}>
             <div className="p-2 bg-purple-100  rounded-lg text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
              <FiTarget className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className={mode("font-semibold text-slate-700 group-hover:text-purple-700", "font-semibold text-gray-200 group-hover:text-purple-400")}>AI Generator</div>
              <div className="text-xs text-slate-500 dark:text-gray-500">Auto-generate questions</div>
            </div>
          </button>

          {isAdmin && (
            <button onClick={() => setShowEditor(true)} className={mode(
              "w-full group flex items-center gap-3 p-3 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all",
              "w-full group flex items-center gap-3 p-3 rounded-xl border border-dashed border-gray-600 hover:border-gray-500 hover:bg-gray-800 transition-all"
            )}>
               <div className="p-2 bg-slate-100  rounded-lg text-slate-600 dark:text-gray-400">
                <FiAward className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className={mode("font-semibold text-slate-700", "font-semibold text-gray-300")}>Series Settings</div>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
);

const TestsTab = ({ dashboardData, mode, onTake, onEdit, onView, onDelete, getStatusIcon, formatDate, onCreateManual, onCreateAI }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
       <h3 className={mode("text-xl font-bold text-slate-900", "text-xl font-bold text-white")}>
         All Tests <span className="ml-2 text-sm font-normal text-slate-500 dark:text-gray-400">({dashboardData.quizzes.length})</span>
       </h3>
       <div className="flex gap-2">
         {/* Optional Filter buttons could go here */}
       </div>
    </div>
    
    {dashboardData.quizzes.length > 0 ? (
      <div className="grid grid-cols-1 gap-4">
        {dashboardData.quizzes.map(quiz => (
          <TestCard
            key={quiz.id}
            quiz={quiz}
            mode={mode}
            onTake={onTake}
            onEdit={onEdit}
            onView={onView}
            onDelete={onDelete}
            getStatusIcon={getStatusIcon}
            formatDate={formatDate}
          />
        ))}
      </div>
    ) : (
      <div className={mode(
        "flex flex-col items-center justify-center py-20 px-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50",
        "flex flex-col items-center justify-center py-20 px-4 rounded-2xl border-2 border-dashed border-gray-700 bg-gray-900/20"
      )}>
        <div className={mode("p-4 rounded-full bg-white shadow-sm mb-4", "p-4 rounded-full bg-gray-800 shadow-sm mb-4")}>
           <FiBookOpen className={mode("w-8 h-8 text-blue-500", "w-8 h-8 text-blue-400")} />
        </div>
        <h3 className={mode("text-lg font-bold text-slate-900 mb-1", "text-lg font-bold text-white mb-1")}>
          No tests available yet
        </h3>
        <p className={mode("text-slate-500 mb-6 max-w-sm text-center", "text-gray-400 mb-6 max-w-sm text-center")}>
          Get started by creating your first manual test or let our AI generate one for you.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCreateManual}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <FiPlus className="w-4 h-4" /> Create Manual
          </button>
          <button
            onClick={onCreateAI}
            className={mode(
               "flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg font-medium transition-colors",
               "flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 text-gray-200 hover:bg-gray-700 rounded-lg font-medium transition-colors"
            )}
          >
            <FaRobot className="w-4 h-4" /> AI Generate
          </button>
        </div>
      </div>
    )}
  </div>
);

// Main Export remains mostly the same, just passing props down
const TabContent = ({ 
  activeTab, 
  dashboardData, 
  mode, 
  formatPrice, 
  formatDate, 
  formatDateTime,
  getScoreColor,
  getScoreBg,
  getStatusIcon,
  onTake, 
  onEdit, 
  onView, 
  onDelete,
  onCreateManual,
  onCreateAI,
  isAdmin,
  setShowEditor
}) => {
  switch(activeTab) {
    case 'overview':
      return <OverviewTab {...{ dashboardData, mode, formatPrice, onCreateManual, onCreateAI, isAdmin, setShowEditor }} />;
    case 'tests':
      return <TestsTab {...{ dashboardData, mode, onTake, onEdit, onView, onDelete, getStatusIcon, formatDate, onCreateManual, onCreateAI }} />;
    case 'attempts':
    case 'subscribers':
    case 'analytics':
      // You can apply similar "Card" + "List with Dividers" patterns to these tabs as well
      // for consistency, but focusing on the requested components for now.
      return (
         <div className={mode(
          "bg-white rounded-xl p-8 border border-slate-200 text-center shadow-sm",
          "bg-gray-800/40 rounded-xl p-8 border border-gray-700 text-center"
        )}>
          <p className={mode("text-slate-500", "text-gray-400")}>Content for {activeTab} (Apply similar patterns here)</p>
        </div>
      );
    default:
      return <div>Tab content not available</div>;
  }
};

export default TabContent;