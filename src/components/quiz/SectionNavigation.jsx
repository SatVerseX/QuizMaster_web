import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { FiChevronLeft, FiChevronRight, FiBookOpen, FiClock, FiTarget } from 'react-icons/fi';

const SectionNavigation = ({ 
  sections = [], 
  currentSectionIndex = 0, 
  onSectionChange, 
  isCompact = false,
  displayOnly = false 
}) => {
  const { isDark } = useTheme();

  if (!sections || sections.length <= 1) return null;

  const currentSection = sections[currentSectionIndex];
  const totalSections = sections.length;

  const handleSectionChange = (newIndex) => {
    if (newIndex >= 0 && newIndex < totalSections && onSectionChange && newIndex !== currentSectionIndex) {
      onSectionChange(newIndex);
    }
  };

  const getSectionStatus = (section, index) => {
    if (index === currentSectionIndex) return 'current';
    // You can add logic here to determine if section is completed, etc.
    return 'pending';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'current':
        return isDark 
          ? 'bg-blue-600 text-white border-blue-500' 
          : 'bg-blue-500 text-white border-blue-400';
      case 'completed':
        return isDark 
          ? 'bg-green-600 text-white border-green-500' 
          : 'bg-green-500 text-white border-green-400';
      case 'pending':
      default:
        return isDark 
          ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' 
          : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200';
    }
  };

  if (displayOnly) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700 text-white">
        
        <span className="text-sm font-medium text-white">
          {currentSection?.name || `Section ${currentSectionIndex + 1}`}
        </span>
        <span className="text-xs text-gray-300">
          {currentSectionIndex + 1}/{totalSections}
        </span>
      </div>
    );
  }

  if (isCompact) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleSectionChange(currentSectionIndex - 1)}
          disabled={currentSectionIndex === 0}
          className={`p-2 rounded-lg transition-all duration-200 ${
            currentSectionIndex === 0
              ? 'opacity-50 cursor-not-allowed'
              : isDark
              ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
              : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
          }`}
        >
          <FiChevronLeft className="w-4 h-4" />
        </button>
        
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800">
          <FiBookOpen className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium">
            {currentSection?.name || `Section ${currentSectionIndex + 1}`}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {currentSectionIndex + 1}/{totalSections}
          </span>
        </div>
        
        <button
          onClick={() => handleSectionChange(currentSectionIndex + 1)}
          disabled={currentSectionIndex === totalSections - 1}
          className={`p-2 rounded-lg transition-all duration-200 ${
            currentSectionIndex === totalSections - 1
              ? 'opacity-50 cursor-not-allowed'
              : isDark
              ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
              : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
          }`}
        >
          <FiChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-xl border ${
      isDark 
        ? 'bg-gray-800/60 border-gray-700/60' 
        : 'bg-white/90 border-slate-200/60'
    }`}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          
          <h3 className={`text-lg font-semibold ${
            isDark ? 'text-white' : 'text-slate-800'
          }`}>
            Sections
          </h3>
        </div>
        <div className={`text-sm px-2 py-1 rounded-full ${
          isDark 
            ? 'bg-blue-900/30 text-blue-300' 
            : 'bg-blue-100 text-blue-700'
        }`}>
          {currentSectionIndex + 1} of {totalSections}
        </div>
      </div>

      {/* Section List */}
      <div className="space-y-2">
        {sections.map((section, index) => {
          const status = getSectionStatus(section, index);
          const isCurrent = index === currentSectionIndex;
          
          return (
            <button
              key={section.id || index}
              onClick={() => handleSectionChange(index)}
              className={`w-full text-left p-3 rounded-lg border transition-all duration-200 hover:scale-[1.02] ${
                getStatusColor(status)
              } ${isCurrent ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isCurrent 
                      ? 'bg-white text-blue-600' 
                      : status === 'completed'
                      ? 'bg-white text-green-600'
                      : isDark
                      ? 'bg-gray-600 text-gray-300'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className={`font-medium ${
                      isCurrent ? 'text-white' : status === 'completed' ? 'text-white' : ''
                    }`}>
                      {section.name || `Section ${index + 1}`}
                    </div>
                    {section.description && (
                      <div className={`text-xs ${
                        isCurrent ? 'text-blue-100' : status === 'completed' ? 'text-green-100' : ''
                      }`}>
                        {section.description}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {section.questions && (
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      isCurrent 
                        ? 'bg-white/20 text-white' 
                        : status === 'completed'
                        ? 'bg-white/20 text-white'
                        : isDark
                        ? 'bg-gray-600 text-gray-300'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {section.questions.length} Q
                    </div>
                  )}
                  
                  {section.timeLimit && (
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      isCurrent 
                        ? 'bg-white/20 text-white' 
                        : status === 'completed'
                        ? 'bg-white/20 text-white'
                        : isDark
                        ? 'bg-gray-600 text-gray-300'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      <FiClock className="w-3 h-3 inline mr-1" />
                      {section.timeLimit}m
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SectionNavigation;
