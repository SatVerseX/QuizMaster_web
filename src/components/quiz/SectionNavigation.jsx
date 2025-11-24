import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  Layers, 
  Clock, 
  Hash, 
  CheckCircle2, 
  Circle
} from 'lucide-react';

const SectionNavigation = ({ 
  sections = [], 
  currentSectionIndex = 0, 
  onSectionChange, 
  isCompact = false,
  displayOnly = false 
}) => {
  const { isDark } = useTheme();

  // Guard clause for empty state
  if (!sections || sections.length <= 0) return null;

  const currentSection = sections[currentSectionIndex] || {};
  const totalSections = sections.length;

  // Helper for conditional classes
  const cn = (...classes) => classes.filter(Boolean).join(' ');

  const handleSectionChange = (newIndex) => {
    if (newIndex >= 0 && newIndex < totalSections && onSectionChange && newIndex !== currentSectionIndex) {
      onSectionChange(newIndex);
    }
  };

  // --- Display Only Mode (Badge) ---
  if (displayOnly) {
    return (
      <div className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm text-xs font-medium",
        isDark 
          ? "bg-zinc-900 border-zinc-700 text-zinc-300" 
          : "bg-white border-zinc-200 text-zinc-700"
      )}>
        <Layers className="w-3.5 h-3.5 text-rose-500" />
        <span className="truncate max-w-[150px]">
          {currentSection?.name || `Section ${currentSectionIndex + 1}`}
        </span>
        <span className={cn("ml-1 pl-2 border-l", isDark ? "border-zinc-700 text-zinc-500" : "border-zinc-200 text-zinc-400")}>
          {currentSectionIndex + 1}/{totalSections}
        </span>
      </div>
    );
  }

  // --- Compact Mode (Toolbar) ---
  if (isCompact) {
    return (
      <div className={cn(
        "flex items-center p-1 rounded-lg border shadow-sm",
        isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
      )}>
        <button
          onClick={() => handleSectionChange(currentSectionIndex - 1)}
          disabled={currentSectionIndex === 0}
          className={cn(
            "p-1.5 rounded-md transition-all",
            currentSectionIndex === 0
              ? "opacity-30 cursor-not-allowed"
              : isDark 
                ? "hover:bg-zinc-800 text-zinc-400 hover:text-white" 
                : "hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900"
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        <div className="flex flex-col items-center px-4 min-w-[140px]">
          <span className={cn("text-xs font-bold uppercase tracking-wider", isDark ? "text-zinc-500" : "text-zinc-400")}>
            Section {currentSectionIndex + 1}
          </span>
          <span className={cn("text-xs font-medium truncate max-w-[120px]", isDark ? "text-zinc-200" : "text-zinc-800")}>
            {currentSection?.name || 'Untitled'}
          </span>
        </div>
        
        <button
          onClick={() => handleSectionChange(currentSectionIndex + 1)}
          disabled={currentSectionIndex === totalSections - 1}
          className={cn(
            "p-1.5 rounded-md transition-all",
            currentSectionIndex === totalSections - 1
              ? "opacity-30 cursor-not-allowed"
              : isDark 
                ? "hover:bg-zinc-800 text-zinc-400 hover:text-white" 
                : "hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900"
          )}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // --- Full Mode (Sidebar List) ---
  return (
    <div className={cn(
      "w-full rounded-xl border flex flex-col overflow-hidden",
      isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
    )}>
      {/* Header */}
      <div className={cn(
        "px-4 py-3 border-b flex items-center justify-between",
        isDark ? "border-zinc-800 bg-zinc-900" : "border-zinc-100 bg-zinc-50/50"
      )}>
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-zinc-400" />
          <h3 className={cn("text-xs font-bold uppercase tracking-wider", isDark ? "text-zinc-400" : "text-zinc-500")}>
            Table of Contents
          </h3>
        </div>
        <div className={cn("text-xs font-medium px-2 py-0.5 rounded-full", isDark ? "bg-zinc-800 text-zinc-400" : "bg-zinc-200 text-zinc-600")}>
          {totalSections}
        </div>
      </div>

      {/* List */}
      <div className="flex flex-col p-2 space-y-1">
        {sections.map((section, index) => {
          const isCurrent = index === currentSectionIndex;
          const isCompleted = false; // Logic can be expanded here based on user progress
          
          return (
            <button
              key={section.id || index}
              onClick={() => handleSectionChange(index)}
              className={cn(
                "group relative w-full text-left p-3 rounded-lg border transition-all duration-200",
                isCurrent
                  ? (isDark 
                      ? "bg-rose-900/10 border-rose-900/50 ring-1 ring-rose-900/50" 
                      : "bg-rose-50 border-rose-200 ring-1 ring-rose-100 shadow-sm")
                  : "border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
              )}
            >
              <div className="flex items-start gap-3">
                {/* Indicator Icon */}
                <div className={cn(
                  "mt-0.5 w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold transition-colors",
                  isCurrent
                    ? "bg-rose-600 text-white"
                    : isCompleted
                    ? "bg-emerald-500 text-white"
                    : (isDark ? "bg-zinc-800 text-zinc-500 group-hover:bg-zinc-700" : "bg-zinc-200 text-zinc-600 group-hover:bg-zinc-300")
                )}>
                  {isCompleted ? <CheckCircle2 className="w-3 h-3" /> : (index + 1)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn(
                      "text-sm font-medium truncate",
                      isCurrent 
                        ? (isDark ? "text-rose-100" : "text-rose-900") 
                        : (isDark ? "text-zinc-300" : "text-zinc-700")
                    )}>
                      {section.name || `Section ${index + 1}`}
                    </span>
                    {isCurrent && (
                      <span className="flex h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                    )}
                  </div>
                  
                  {/* Meta Details */}
                  <div className="mt-1.5 flex items-center flex-wrap gap-2">
                    {section.questions && (
                      <div className={cn(
                        "flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border",
                        isCurrent
                          ? (isDark ? "bg-rose-900/30 border-rose-800 text-rose-200" : "bg-white border-rose-200 text-rose-700")
                          : (isDark ? "bg-zinc-800 border-zinc-700 text-zinc-500" : "bg-zinc-100 border-zinc-200 text-zinc-500")
                      )}>
                        <Hash className="w-3 h-3" />
                        <span>{section.questions.length}</span>
                      </div>
                    )}
                    
                    {section.timeLimit && (
                      <div className={cn(
                        "flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border",
                        isCurrent
                          ? (isDark ? "bg-rose-900/30 border-rose-800 text-rose-200" : "bg-white border-rose-200 text-rose-700")
                          : (isDark ? "bg-zinc-800 border-zinc-700 text-zinc-500" : "bg-zinc-100 border-zinc-200 text-zinc-500")
                      )}>
                        <Clock className="w-3 h-3" />
                        <span>{section.timeLimit}m</span>
                      </div>
                    )}
                  </div>
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