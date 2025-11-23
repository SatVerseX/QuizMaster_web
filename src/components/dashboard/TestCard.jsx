import React from 'react';
import { FiPlay, FiEye, FiEdit, FiTrash2, FiBookOpen, FiTarget, FiClock, FiBarChart } from 'react-icons/fi';
import { FaRobot } from 'react-icons/fa';

const TestCard = ({ quiz, mode, onDelete, onEdit, onView, onTake, getStatusIcon, formatDate }) => {
  const isSection = quiz.quizType === 'section-wise';
  const statusInfo = getStatusIcon(quiz);
  
  // Helper for cleaner badge styles
  const Badge = ({ icon: Icon, label, colorClass, baseClass }) => (
    <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border flex items-center gap-1.5 ${baseClass} ${colorClass}`}>
      {Icon && <Icon className="w-3 h-3" />}
      {label}
    </span>
  );

  return (
    <div className={mode(
      "group relative flex flex-col sm:flex-row gap-4 p-5 rounded-xl border border-slate-100 bg-white hover:border-blue-200 hover:shadow-md transition-all duration-200",
      "group relative flex flex-col sm:flex-row gap-4 p-5 rounded-xl border border-gray-800 bg-gray-900/20 hover:bg-gray-800/40 hover:border-gray-700 transition-all duration-200"
    )}>
      
      {/* Left Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <h4 className={mode(
            "text-base sm:text-lg font-bold text-slate-800 truncate pr-4", 
            "text-base sm:text-lg font-bold text-gray-100 truncate pr-4"
          )}>
            {quiz.title}
          </h4>
          
          <div className="flex items-center gap-2">
            <Badge 
              icon={isSection ? FiBookOpen : FiTarget}
              label={isSection ? 'Section' : 'Regular'}
              baseClass={mode("bg-white", "bg-transparent")}
              colorClass={isSection 
                ? mode("text-blue-600 border-blue-100 bg-blue-50/50", "text-blue-400 border-blue-900/30 bg-blue-900/10")
                : mode("text-emerald-600 border-emerald-100 bg-emerald-50/50", "text-emerald-400 border-emerald-900/30 bg-emerald-900/10")
              }
            />
            {quiz.isAIGenerated && (
              <Badge 
                icon={FaRobot}
                label="AI"
                baseClass={mode("bg-white", "bg-transparent")}
                colorClass={mode("text-purple-600 border-purple-100 bg-purple-50/50", "text-purple-400 border-purple-900/30 bg-purple-900/10")}
              />
            )}
          </div>
        </div>
        
        {/* Meta Info Row */}
        <div className={mode("flex items-center gap-4 text-xs sm:text-sm text-slate-500", "flex items-center gap-4 text-xs sm:text-sm text-gray-400")}>
          <div className="flex items-center gap-1.5">
            <FiBarChart className="w-3.5 h-3.5" />
            <span>{quiz.quizType === 'section-wise' ? quiz.sections.map(s => s.questions.length).reduce((a,b)=>a+b,0) : quiz.questions?.length} Qs</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-current opacity-30"></div>
          <div className="flex items-center gap-1.5">
            <FiClock className="w-3.5 h-3.5" />
            <span>{quiz.quizType === 'section-wise' ? quiz.sections?.reduce((sum, s) => sum + (s?.timeLimit || 0), 0) : quiz.timeLimit}m</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-current opacity-30"></div>
          <span className={mode(
            `px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
              quiz.difficulty === 'hard' ? 'bg-red-50 text-red-600' : 
              quiz.difficulty === 'medium' ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'
            }`,
            `px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
              quiz.difficulty === 'hard' ? 'bg-red-900/20 text-red-400' : 
              quiz.difficulty === 'medium' ? 'bg-yellow-900/20 text-yellow-400' : 'bg-green-900/20 text-green-400'
            }`
          )}>
            {quiz.difficulty || 'medium'}
          </span>
          <div className="hidden sm:block text-xs opacity-60 ml-auto">
            Updated {formatDate(quiz.createdAt)}
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l sm:pl-4 pt-3 sm:pt-0 border-dashed border-gray-200 dark:border-gray-700">
        <button
          onClick={() => onTake(quiz)}
          className={mode(
            "p-2 rounded-lg bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:shadow transition-all active:scale-95",
            "p-2 rounded-lg bg-blue-600 text-white shadow-sm hover:bg-blue-500 hover:shadow transition-all active:scale-95"
          )}
          title="Take Test"
        >
          <FiPlay className="w-4 h-4 fill-current" />
        </button>
        
        <div className="flex items-center gap-1 bg-gray-50  p-1 rounded-lg">
          <button
            onClick={() => onView(quiz)}
            className={mode(
              "p-1.5 text-slate-500 hover:text-blue-600 hover:bg-white rounded-md transition-all",
              "p-1.5 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-md transition-all"
            )}
            title="Preview"
          >
            <FiEye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(quiz)}
            className={mode(
              "p-1.5 text-slate-500 hover:text-orange-600 hover:bg-white rounded-md transition-all",
              "p-1.5 text-gray-400 hover:text-orange-400 hover:bg-gray-700 rounded-md transition-all"
            )}
            title="Edit"
          >
            <FiEdit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(quiz)}
            className={mode(
              "p-1.5 text-slate-500 hover:text-red-600 hover:bg-white rounded-md transition-all",
              "p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-md transition-all"
            )}
            title="Delete"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestCard;