import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  FiChevronDown, 
  FiChevronRight, 
  FiTrash2, 
  FiPlus, 
  FiEdit3,
  FiClock,
  FiStar,
  FiLayers,
  FiX,
  FiCheck,
  FiZap,
  FiUpload,
  FiMinus
} from 'react-icons/fi';
import QuestionCard from './QuestionCard';
import AIGenerator from './AIGenerator';
import JSONUpload from './JSONUpload';

const SectionCard = ({ 
  section, 
  sectionIndex, 
  onUpdate, 
  onRemove, 
  onAddQuestion, 
  onUpdateQuestion, 
  onRemoveQuestion 
}) => {
  const { isDark } = useTheme();
  const mode = (light, dark) => (isDark ? dark : light);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(section.name);
  const [editDescription, setEditDescription] = useState(section.description);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [showJSONUpload, setShowJSONUpload] = useState(false);

  const handleSaveEdit = () => {
    onUpdate({
      name: editName,
      description: editDescription
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(section.name);
    setEditDescription(section.description);
    setIsEditing(false);
  };

  const toggleExpanded = () => {
    onUpdate({ isExpanded: !section.isExpanded });
  };

  const handleAIGeneratedQuestions = (questions) => {
    const newQuestions = questions.map(q => ({
      id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || '',
      image: q.image || null,
      optionImages: ['', '', '', ''], // Option images array
      negativeMarking: {
        enabled: false,
        type: 'fractional',
        value: 0.25
      },
      positiveMarking: {
        enabled: false,
        type: 'fractional',
        value: 1.0
      }
    }));

    onUpdate({
      questions: [...section.questions, ...newQuestions]
    });
    setShowAIGenerator(false);
  };

  const handleJSONUploadedQuestions = (questions) => {
    onUpdate({
      questions: [...section.questions, ...questions]
    });
    setShowJSONUpload(false);
  };

  return (
    <>
      <div className={`backdrop-blur-xl border rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden w-full ${mode('bg-white/95 border-slate-200/60', 'bg-gray-800/80 border-gray-700/60')}`}>
        {/* Section Header */}
        <div className={`p-4 sm:p-6 lg:p-8 border-b ${mode('border-slate-200/60', 'border-gray-700/60')}`}>
          {/* Mobile Header Layout */}
          <div className="sm:hidden">
            <div className="flex items-center justify-between mb-4 min-w-0">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <button
                  onClick={toggleExpanded}
                  className={`p-2 rounded-lg flex-shrink-0 ${mode('hover:bg-slate-200/50', 'hover:bg-gray-700/50')}`}
                >
                  {section.isExpanded ? (
                    <FiChevronDown className={`w-5 h-5 ${mode('text-slate-500', 'text-gray-400')}`} />
                  ) : (
                    <FiChevronRight className={`w-5 h-5 ${mode('text-slate-500', 'text-gray-400')}`} />
                  )}
                </button>
                
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FiLayers className="w-5 h-5 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className={`w-full px-3 py-1 border rounded-lg text-lg font-bold focus:outline-none focus:border-blue-500 ${mode('bg-white border-slate-300 text-slate-700', 'bg-gray-700 border-gray-600 text-white')}`}
                    />
                  ) : (
                    <div className="flex items-center gap-2 min-w-0">
                      <h3 className={`text-lg font-bold truncate ${mode('text-slate-800', 'text-white')}`}>
                        {section.name}
                      </h3>
                      <button
                        onClick={() => setIsEditing(true)}
                        className={`p-1 rounded-lg flex-shrink-0 ${mode('hover:bg-slate-200/50', 'hover:bg-gray-700/50')}`}
                      >
                        <FiEdit3 className={`w-4 h-4 ${mode('text-slate-500', 'text-gray-400')}`} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={handleSaveEdit}
                    className="p-2 bg-green-600 hover:bg-green-700 rounded-lg"
                  >
                    <FiCheck className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className={`p-2 rounded-lg ${mode('bg-slate-600 hover:bg-slate-700', 'bg-gray-600 hover:bg-gray-700')}`}
                  >
                    <FiX className="w-4 h-4 text-white" />
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Description */}
            {isEditing ? (
              <input
                type="text"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Section description"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-blue-500 mb-4 ${mode('bg-white border-slate-300 text-slate-700', 'bg-gray-700 border-gray-600 text-white')}`}
              />
            ) : (
              <p className={`text-sm ${mode('text-slate-600', 'text-gray-400')} mb-4`}>
                {section.description || 'No description'}
              </p>
            )}

            {/* Mobile Stats */}
            <div className="flex items-center gap-3 text-xs mb-4">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${mode('bg-blue-50 text-blue-700', 'bg-blue-900/30 text-blue-400')}`}>
                <FiLayers className="w-3 h-3" />
                <span className="font-medium">{section.questions.length}</span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${mode('bg-purple-50 text-purple-700', 'bg-purple-900/30 text-purple-400')}`}>
                <FiClock className="w-3 h-3" />
                <span className="font-medium">{section.timeLimit}m</span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${mode('bg-yellow-50 text-yellow-700', 'bg-yellow-900/30 text-yellow-400')}`}>
                <FiStar className="w-3 h-3" />
                <span className="font-medium capitalize">{section.difficulty}</span>
              </div>
            </div>

            {/* Mobile Action Buttons */}
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <button
                onClick={() => setShowAIGenerator(true)}
                className="flex-1 p-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-white text-sm font-medium flex items-center justify-center gap-2 min-w-0"
                title="AI Generate"
              >
                <FiZap className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">AI</span>
              </button>
              <button
                onClick={() => setShowJSONUpload(true)}
                className="flex-1 p-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-lg text-white text-sm font-medium flex items-center justify-center gap-2 min-w-0"
                title="Upload JSON"
              >
                <FiUpload className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Upload</span>
              </button>
              <button
                onClick={onAddQuestion}
                className="flex-1 p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium flex items-center justify-center gap-2 min-w-0"
                title="Add Question"
              >
                <FiPlus className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Add</span>
              </button>
              <button
                onClick={onRemove}
                className="p-2 bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                title="Remove"
                disabled={section.questions.length > 0}
              >
                <FiTrash2 className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Desktop Header Layout */}
          <div className="hidden sm:flex items-center justify-between min-w-0">
            <div className="flex items-center gap-4 lg:gap-6 min-w-0 flex-1">
              <button
                onClick={toggleExpanded}
                className={`p-3 rounded-xl hover:scale-110 flex-shrink-0 ${mode('hover:bg-slate-200/50', 'hover:bg-gray-700/50')}`}
              >
                {section.isExpanded ? (
                  <FiChevronDown className={`w-6 h-6 ${mode('text-slate-500', 'text-gray-400')}`} />
                ) : (
                  <FiChevronRight className={`w-6 h-6 ${mode('text-slate-500', 'text-gray-400')}`} />
                )}
              </button>
              
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <FiLayers className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  {isEditing ? (
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className={`px-4 py-2 border-2 rounded-xl text-xl font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 min-w-0 flex-1 ${mode('bg-white border-slate-300 text-slate-700', 'bg-gray-700 border-gray-600 text-white')}`}
                      />
                      <button
                        onClick={handleSaveEdit}
                        className="p-2 bg-green-600 hover:bg-green-700 rounded-xl hover:scale-110 shadow-lg flex-shrink-0"
                      >
                        <FiCheck className="w-5 h-5 text-white" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className={`p-2 rounded-xl hover:scale-110 shadow-lg flex-shrink-0 ${mode('bg-slate-600 hover:bg-slate-700', 'bg-gray-600 hover:bg-gray-700')}`}
                      >
                        <FiX className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  ) : (
                    <h3 className={`text-xl lg:text-2xl font-bold flex items-center gap-3 min-w-0 ${mode('text-slate-800', 'text-white')}`}>
                      <span className="truncate">{section.name}</span>
                      <button
                        onClick={() => setIsEditing(true)}
                        className={`p-2 rounded-xl hover:scale-110 flex-shrink-0 ${mode('hover:bg-slate-200/50', 'hover:bg-gray-700/50')}`}
                      >
                        <FiEdit3 className={`w-5 h-5 ${mode('text-slate-500', 'text-gray-400')}`} />
                      </button>
                    </h3>
                  )}
                  
                  {isEditing ? (
                    <input
                      type="text"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Section description"
                      className={`px-4 py-2 border-2 rounded-xl text-base focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 w-full mt-2 ${mode('bg-white border-slate-300 text-slate-700', 'bg-gray-700 border-gray-600 text-white')}`}
                    />
                  ) : (
                    <p className={`text-base ${mode('text-slate-600', 'text-gray-400')} mt-1 truncate`}>
                      {section.description || 'No description'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 lg:gap-6 flex-shrink-0">
              {/* Desktop Stats */}
              <div className="flex items-center gap-4 lg:gap-6 text-sm flex-wrap">
                <div className={`flex items-center gap-3 px-4 py-2 rounded-xl ${mode('bg-blue-50 text-blue-700', 'bg-blue-900/30 text-blue-400')}`}>
                  <FiLayers className="w-5 h-5 flex-shrink-0" />
                  <span className="font-semibold whitespace-nowrap">{section.questions.length} questions</span>
                </div>
                <div className={`flex items-center gap-3 px-4 py-2 rounded-xl ${mode('bg-purple-50 text-purple-700', 'bg-purple-900/30 text-purple-400')}`}>
                  <FiClock className="w-5 h-5 flex-shrink-0" />
                  <span className="font-semibold whitespace-nowrap">{section.timeLimit} min</span>
                </div>
                <div className={`flex items-center gap-3 px-4 py-2 rounded-xl ${mode('bg-yellow-50 text-yellow-700', 'bg-yellow-900/30 text-yellow-400')}`}>
                  <FiStar className="w-5 h-5 flex-shrink-0" />
                  <span className="font-semibold capitalize whitespace-nowrap">{section.difficulty}</span>
                </div>
              </div>

              {/* Desktop Action Buttons */}
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => setShowAIGenerator(true)}
                  className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl hover:scale-110 shadow-lg flex-shrink-0"
                  title="AI Generate Questions"
                >
                  <FiZap className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={() => setShowJSONUpload(true)}
                  className="p-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-xl hover:scale-110 shadow-lg flex-shrink-0"
                  title="Upload JSON Questions"
                >
                  <FiUpload className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={onAddQuestion}
                  className="p-3 bg-blue-600 hover:bg-blue-700 rounded-xl hover:scale-110 shadow-lg flex-shrink-0"
                  title="Add Manual Question"
                >
                  <FiPlus className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={onRemove}
                  className="p-3 bg-red-600 hover:bg-red-700 rounded-xl hover:scale-110 shadow-lg disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex-shrink-0"
                  title="Remove Section"
                  disabled={section.questions.length > 0}
                >
                  <FiTrash2 className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section Settings */}
        <div className={`p-4 sm:p-6 lg:p-8 border-b ${mode('border-slate-200/60', 'border-gray-700/60')}`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Time Limit */}
            <div className="space-y-2 sm:space-y-3">
              <label className={`block text-sm font-bold flex items-center gap-2 sm:gap-3 ${mode('text-slate-700', 'text-gray-300')}`}>
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <FiClock className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400" />
                </div>
                Time Limit (minutes)
              </label>
              <input
                type="number"
                min="5"
                max="180"
                value={section.timeLimit}
                onChange={(e) => onUpdate({ timeLimit: parseInt(e.target.value) || 30 })}
                className={`w-full px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl border-2 focus:outline-none focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 text-base sm:text-lg font-medium ${mode('bg-white border-slate-300 text-slate-700 hover:border-slate-400', 'bg-gray-900/60 border-gray-700/60 text-white hover:border-gray-600')}`}
              />
            </div>

            {/* Difficulty */}
            <div className="space-y-2 sm:space-y-3">
              <label className={`block text-sm font-bold flex items-center gap-2 sm:gap-3 ${mode('text-slate-700', 'text-gray-300')}`}>
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                  <FiStar className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600 dark:text-yellow-400" />
                </div>
                Difficulty Level
              </label>
              <select
                value={section.difficulty}
                onChange={(e) => onUpdate({ difficulty: e.target.value })}
                className={`w-full px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl border-2 focus:outline-none focus:ring-4 focus:ring-yellow-500/30 focus:border-yellow-500 appearance-none text-base sm:text-lg font-medium ${mode('bg-white border-slate-300 text-slate-700 hover:border-slate-400', 'bg-gray-900/60 border-gray-700/60 text-white hover:border-gray-600')}`}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="expert">Expert</option>
              </select>
            </div>

            {/* Marking Controls */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <div className="flex items-center justify-center gap-4 sm:gap-6">
                {/* Positive Marking Button */}
                <div className="flex flex-col items-center gap-2 sm:gap-3">
                  <label className={`text-xs sm:text-sm font-bold flex items-center gap-2 ${mode('text-slate-700', 'text-gray-300')}`}>
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <FiPlus className="w-2 h-2 sm:w-3 sm:h-3 text-green-600 dark:text-green-400" />
                    </div>
                    Positive Marking
                  </label>
                  <button
                    type="button"
                    onClick={() => onUpdate({
                      positiveMarking: {
                        ...section.positiveMarking,
                        enabled: !section.positiveMarking.enabled
                      }
                    })}
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                      section.positiveMarking?.enabled
                        ? 'bg-green-500 text-white shadow-lg'
                        : mode('bg-green-100 text-green-500 hover:bg-green-200', 'bg-green-500/20 text-green-400 hover:bg-green-500/30')
                    }`}
                  >
                    <FiPlus className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>

                {/* Negative Marking Button */}
                <div className="flex flex-col items-center gap-2 sm:gap-3">
                  <label className={`text-xs sm:text-sm font-bold flex items-center gap-2 ${mode('text-slate-700', 'text-gray-300')}`}>
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                      <FiMinus className="w-2 h-2 sm:w-3 sm:h-3 text-red-600 dark:text-red-400" />
                    </div>
                    Negative Marking
                  </label>
                  <button
                    type="button"
                    onClick={() => onUpdate({
                      negativeMarking: {
                        ...section.negativeMarking,
                        enabled: !section.negativeMarking.enabled
                      }
                    })}
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                      section.negativeMarking.enabled
                        ? 'bg-red-500 text-white shadow-lg'
                        : mode('bg-red-100 text-red-500 hover:bg-red-200', 'bg-red-500/20 text-red-400 hover:bg-red-500/30')
                    }`}
                  >
                    <FiMinus className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
              </div>

              {/* Positive Marking Settings */}
              {section.positiveMarking?.enabled && (
                <div className="space-y-2 sm:space-y-3">
                  <h4 className={`text-sm font-bold ${mode('text-slate-700', 'text-gray-300')}`}>Positive Marking Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {/* Type Selection */}
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${mode('text-slate-600', 'text-gray-400')}`}>Type</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: 'fractional', label: 'Fractional' },
                          { value: 'fixed', label: 'Fixed' }
                        ].map(type => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => onUpdate({
                              positiveMarking: {
                                ...section.positiveMarking,
                                type: type.value
                              }
                            })}
                            className={`p-2 rounded-lg border text-xs ${
                              section.positiveMarking?.type === type.value
                                ? mode('bg-green-100/20 border-green-300 text-green-600', 'bg-green-500/20 border-green-400 text-green-300')
                                : mode('bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200', 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700')
                            }`}
                          >
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Value Input */}
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${mode('text-slate-600', 'text-gray-400')}`}>
                        {section.positiveMarking?.type === 'fractional' ? 'Fraction' : 'Marks'}
                      </label>
                      <input
                        type="number"
                        min="0.1"
                        max="5"
                        step="0.1"
                        value={section.positiveMarking?.value || 1.0}
                        onChange={(e) => onUpdate({
                          positiveMarking: {
                            ...section.positiveMarking,
                            value: parseFloat(e.target.value) || 1.0
                          }
                        })}
                        className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${mode('bg-white border-slate-300 text-slate-700 placeholder-slate-500', 'bg-gray-800 border-gray-600 text-white placeholder-gray-500')}`}
                        placeholder="1.0"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Negative Marking Settings */}
              {section.negativeMarking.enabled && (
                <div className="space-y-2 sm:space-y-3">
                  <h4 className={`text-sm font-bold ${mode('text-slate-700', 'text-gray-300')}`}>Negative Marking Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {/* Type Selection */}
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${mode('text-slate-600', 'text-gray-400')}`}>Type</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: 'fractional', label: 'Fractional' },
                          { value: 'fixed', label: 'Fixed' }
                        ].map(type => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => onUpdate({
                              negativeMarking: {
                                ...section.negativeMarking,
                                type: type.value
                              }
                            })}
                            className={`p-2 rounded-lg border text-xs ${
                              section.negativeMarking.type === type.value
                                ? mode('bg-red-100/20 border-red-300 text-red-600', 'bg-red-500/20 border-red-400 text-red-300')
                                : mode('bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200', 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700')
                            }`}
                          >
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Value Input */}
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${mode('text-slate-600', 'text-gray-400')}`}>
                        {section.negativeMarking.type === 'fractional' ? 'Fraction' : 'Marks'}
                      </label>
                      <input
                        type="number"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={section.negativeMarking.value}
                        onChange={(e) => onUpdate({
                          negativeMarking: {
                            ...section.negativeMarking,
                            value: parseFloat(e.target.value) || 0.25
                          }
                        })}
                        className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${mode('bg-white border-slate-300 text-slate-700 placeholder-slate-500', 'bg-gray-800 border-gray-600 text-white placeholder-gray-500')}`}
                        placeholder="0.25"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Questions List */}
        {section.isExpanded && (
          <div className="p-4 sm:p-6 lg:p-8">
            {section.questions.length === 0 ? (
              <div className={`text-center py-8 sm:py-12 ${mode('text-slate-600', 'text-gray-400')}`}>
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <FiLayers className={`w-8 h-8 sm:w-10 sm:h-10 ${mode('text-blue-600', 'text-blue-400')}`} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">No questions in this section yet</h3>
                <p className="text-sm sm:text-base">Click the + button above to add questions or use AI generation</p>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {section.questions.map((question, questionIndex) => (
                  <div key={question.id} className="transform hover:scale-[1.01] sm:hover:scale-[1.02] transition-all duration-300">
                    <QuestionCard
                      question={question}
                      questionIndex={questionIndex}
                      onUpdate={(updates) => onUpdateQuestion(question.id, updates)}
                      onRemove={() => onRemoveQuestion(question.id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AI Generator Modal */}
        {showAIGenerator && (
          <AIGenerator
            onQuestionsGenerated={handleAIGeneratedQuestions}
            onClose={() => setShowAIGenerator(false)}
          />
        )}

        {/* JSON Upload Modal */}
        {showJSONUpload && (
          <JSONUpload
            onQuestionsUploaded={handleJSONUploadedQuestions}
            onClose={() => setShowJSONUpload(false)}
          />
        )}
      </div>
    </>
  );
};

export default SectionCard;
