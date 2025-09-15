import React from 'react';
import { FiPlay, FiEye, FiEdit, FiTrash2, FiBookOpen, FiTarget, FiClock } from 'react-icons/fi';
import { FaRobot } from 'react-icons/fa';

const TestCard = ({ quiz, mode, onDelete, onEdit, onView, onTake, getStatusIcon, formatDate }) => {
  const isSection = quiz.quizType === 'section-wise' ;
  const statusInfo = getStatusIcon(quiz);

  return (
    <div className={mode(
      "flex flex-col sm:flex-row sm:items-center justify-between py-4 hover:bg-slate-50 px-4 -mx-4 rounded-lg",
      "flex flex-col sm:flex-row sm:items-center justify-between py-4 hover:bg-gray-800/40 px-4 -mx-4 rounded-lg"
    )}>
      <div className="flex-1 mb-3 sm:mb-0">
        <div className="flex items-center gap-3 mb-2">
          <h4 className={mode("text-lg font-semibold text-slate-800", "text-lg font-semibold text-white")}>
            {isSection  ? ( quiz.title) : quiz.title}
          </h4>
          
          {/* Quiz type badge */}
          <span className={mode(
            `px-2 py-0.5 text-xs font-medium rounded-full flex items-center gap-1 ${
              isSection
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-green-100 text-green-700'
            }`,
            `px-2 py-0.5 text-xs font-medium rounded-full flex items-center gap-1 ${
              isSection
                ? 'bg-blue-900/50 text-blue-300' 
                : 'bg-green-900/50 text-green-300'
            }`
          )}>
            {isSection ? (
              <>
                <FiBookOpen className="w-3 h-3" />
                Section
              </>
            ) : (
              <>
                <FiTarget className="w-3 h-3" />
                Regular
              </>
            )}
          </span>
          
          {quiz.isAIGenerated && (
            <span className={mode(
              "px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full flex items-center gap-1",
              "px-2 py-0.5 bg-purple-900/50 text-purple-300 text-xs font-medium rounded-full flex items-center gap-1"
            )}>
              <FaRobot className="w-3 h-3" />
              AI
            </span>
          )}
          
          <div className="flex items-center gap-1" title={statusInfo.label}>
            <statusInfo.icon className={`w-4 h-4 ${statusInfo.color}`} />
          </div>
        </div>
        
        <div className={mode("flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-600", "flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-400")}>
          <span className="flex items-center gap-1">
            <FiBookOpen className="w-4 h-4" />
            {quiz.quizType === 'section-wise' ? quiz.sections.map(s => s.questions.length).reduce((sum, s) => sum + s, 0) :quiz.questions?.length || 0} questions
          </span>
          <span className="flex items-center gap-1">
            <FiClock className="w-4 h-4" />
            {quiz.quizType === 'section-wise' ? quiz.sections?.reduce((sum, s) => sum + (s?.timeLimit || 0), 0) : quiz.timeLimit || 0} min               
          </span>
          <span className="flex items-center gap-1">
            <FiPlay className="w-4 h-4" />
            {quiz.quizType === 'section-wise' ? (quiz.totalAttempts || 0) : (quiz.totalAttempts || 0)} attempts
          </span>
          <span className={mode(
            "capitalize text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700",
            "capitalize text-xs px-2 py-0.5 rounded-full bg-gray-700"
          )}>
            {quiz.difficulty || 'medium'}
          </span>
          <span className={mode("text-xs text-slate-500", "text-xs text-gray-500")}>
            Created: {formatDate(quiz.createdAt)}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => onTake(quiz)}
          className={mode(
            "p-2 text-slate-500 hover:text-green-600 hover:bg-slate-100 rounded-lg transition-colors",
            "p-2 text-gray-400 hover:text-green-400 hover:bg-gray-700 rounded-lg transition-colors"
          )}
          title={`Take ${isSection ? 'Section' : 'Regular'} Test`}
        >
          <FiPlay className="w-4 h-4" />
        </button>
        <button
          onClick={() => onView(quiz)}
          className={mode(
            "p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors",
            "p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
          )}
          title="View Test"
        >
          <FiEye className="w-4 h-4" />
        </button>
        <button
          onClick={() => onEdit(quiz)}
          className={mode(
            "p-2 text-slate-500 hover:text-yellow-600 hover:bg-slate-100 rounded-lg transition-colors",
            "p-2 text-gray-400 hover:text-yellow-400 hover:bg-gray-700 rounded-lg transition-colors"
          )}
          title="Edit Test"
        >
          <FiEdit className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(quiz)}
          className={mode(
            "p-2 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors",
            "p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
          )}
          title="Delete Test"
        >
          <FiTrash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default TestCard;
