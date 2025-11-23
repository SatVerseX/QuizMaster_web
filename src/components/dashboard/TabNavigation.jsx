import React from 'react';
import { FiBarChart2, FiFileText, FiActivity, FiUsers, FiTrendingUp } from 'react-icons/fi';

const TabNavigation = ({ activeTab, setActiveTab, mode }) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiBarChart2 },
    { id: 'tests', label: 'Tests', icon: FiFileText },
    { id: 'attempts', label: 'Attempts', icon: FiActivity },
    { id: 'subscribers', label: 'Subscribers', icon: FiUsers },
    { id: 'analytics', label: 'Analytics', icon: FiTrendingUp }
  ];

  return (
    <div className={mode(
      "border-b border-slate-200 mb-8 overflow-x-auto no-scrollbar",
      "border-b border-gray-800 mb-8 overflow-x-auto no-scrollbar"
    )}>
      <div className="flex gap-6 min-w-max px-2">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                group flex items-center gap-2 pb-4 border-b-2 transition-all duration-200 text-sm font-medium
                ${isActive 
                  ? mode('border-blue-600 text-blue-600', 'border-blue-500 text-blue-400') 
                  : mode(
                      'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300', 
                      'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
                    )
                }
              `}
            >
              <tab.icon className={`w-4 h-4 ${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TabNavigation;