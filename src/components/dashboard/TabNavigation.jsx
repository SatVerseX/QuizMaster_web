import React from 'react';
import { FiBarChart2, FiFileText, FiActivity, FiUsers, FiTrendingUp } from 'react-icons/fi';

const TabNavigation = ({ activeTab, setActiveTab, mode }) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiBarChart2 },
    { id: 'tests', label: 'Tests Management', icon: FiFileText },
    { id: 'attempts', label: 'Recent Attempts', icon: FiActivity },
    { id: 'subscribers', label: 'Subscribers', icon: FiUsers },
    { id: 'analytics', label: 'Analytics', icon: FiTrendingUp }
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center gap-2 px-5 py-3 rounded-lg font-medium transition-all ${
            activeTab === tab.id
              ? 'bg-blue-600 text-white'
              : mode(
                  'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 shadow-sm',
                  'bg-gray-800/60 text-gray-300 hover:bg-gray-700'
                )
          }`}
        >
          <tab.icon className="w-5 h-5" />
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;
