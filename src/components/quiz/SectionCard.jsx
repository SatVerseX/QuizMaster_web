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
  FiMinus,
  FiSettings,
  FiAlertCircle
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
  
  // -- Local State --
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(section.name);
  const [editDescription, setEditDescription] = useState(section.description);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [showJSONUpload, setShowJSONUpload] = useState(false);
  const [showSettings, setShowSettings] = useState(false); // Toggle for settings panel

  // -- Helpers --
  const mode = (light, dark) => (isDark ? dark : light);
  
  const handleSaveEdit = () => {
    onUpdate({ name: editName, description: editDescription });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(section.name);
    setEditDescription(section.description);
    setIsEditing(false);
  };

  const handleAIGeneratedQuestions = (questions) => {
    const newQuestions = questions.map(q => ({
      id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || '',
      image: q.image || null,
      optionImages: ['', '', '', ''],
      negativeMarking: section.negativeMarking || { enabled: false, type: 'fractional', value: 0.25 },
      positiveMarking: section.positiveMarking || { enabled: true, type: 'fixed', value: 1.0 }
    }));
    onUpdate({ questions: [...section.questions, ...newQuestions] });
    setShowAIGenerator(false);
    // Auto-expand section on addition
    if(!section.isExpanded) onUpdate({ isExpanded: true });
  };

  const handleJSONUploadedQuestions = (questions) => {
    onUpdate({ questions: [...section.questions, ...questions] });
    setShowJSONUpload(false);
    if(!section.isExpanded) onUpdate({ isExpanded: true });
  };

  // -- Render Components --

  // 1. Badge Component
  const MetricBadge = ({ icon: Icon, value, label, colorClass, darkColorClass }) => (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${mode(`${colorClass} border-transparent`, `${darkColorClass} border-white/5`)}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{value}</span>
      {label && <span className="hidden sm:inline opacity-70 ml-1">{label}</span>}
    </div>
  );

  return (
    <div className={`group relative transition-all duration-300 border rounded-2xl overflow-hidden shadow-sm hover:shadow-md ${mode('bg-white border-zinc-200', 'bg-zinc-900 border-zinc-800')}`}>
      
      {/* --- HEADER SECTION --- */}
      <div className={`relative p-4 sm:p-5 flex flex-col gap-4 ${mode('bg-white', 'bg-zinc-900')}`}>
        
        {/* Top Row: Title & Controls */}
        <div className="flex items-start justify-between gap-4">
          
          {/* Left: Icon & Title */}
          <div className="flex items-start gap-4 flex-1 min-w-0">
            {/* Section Number / Icon */}
            <div 
              onClick={() => onUpdate({ isExpanded: !section.isExpanded })}
              className={`hidden sm:flex shrink-0 w-12 h-12 rounded-xl items-center justify-center cursor-pointer transition-transform active:scale-95 bg-gradient-to-br from-rose-500 to-orange-500 shadow-md`}
            >
              <span className="text-white font-bold text-lg">{sectionIndex + 1}</span>
            </div>

            <div className="flex-1 min-w-0 pt-1">
              {isEditing ? (
                <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className={`w-full text-lg font-bold bg-transparent border-b-2 focus:outline-none focus:border-rose-500 px-1 pb-1 ${mode('border-zinc-200 text-zinc-900', 'border-zinc-700 text-white')}`}
                    placeholder="Section Name"
                    autoFocus
                  />
                  <input
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className={`w-full text-sm bg-transparent border-b focus:outline-none focus:border-zinc-400 px-1 pb-1 ${mode('border-zinc-100 text-zinc-600', 'border-zinc-800 text-zinc-400')}`}
                    placeholder="Brief description (optional)"
                  />
                  <div className="flex gap-2 mt-2">
                    <button onClick={handleSaveEdit} className="text-xs bg-emerald-500 text-white px-3 py-1.5 rounded-md font-medium hover:bg-emerald-600">Save Changes</button>
                    <button onClick={handleCancelEdit} className={`text-xs px-3 py-1.5 rounded-md font-medium border ${mode('bg-zinc-100 text-zinc-600 border-zinc-200', 'bg-zinc-800 text-zinc-400 border-zinc-700')}`}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 group/title">
                    <h3 
                      onClick={() => onUpdate({ isExpanded: !section.isExpanded })}
                      className={`text-lg font-bold truncate cursor-pointer select-none ${mode('text-zinc-900 hover:text-rose-600', 'text-zinc-100 hover:text-rose-400')}`}
                    >
                      {section.name}
                    </h3>
                    <button 
                      onClick={() => setIsEditing(true)}
                      className={`opacity-0 group-hover/title:opacity-100 transition-opacity p-1.5 rounded-md ${mode('hover:bg-zinc-100 text-zinc-400', 'hover:bg-zinc-800 text-zinc-500')}`}
                    >
                      <FiEdit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {section.description && (
                    <p className={`text-sm mt-0.5 truncate max-w-lg ${mode('text-zinc-500', 'text-zinc-400')}`}>
                      {section.description}
                    </p>
                  )}
                  
                  {/* Metadata Badges (Mobile & Desktop) */}
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                     <MetricBadge 
                        icon={FiLayers} 
                        value={section.questions.length} 
                        label="Questions"
                        colorClass="bg-blue-50 text-blue-700" 
                        darkColorClass="bg-blue-500/10 text-blue-400"
                     />
                     <MetricBadge 
                        icon={FiClock} 
                        value={`${section.timeLimit}m`} 
                        colorClass="bg-purple-50 text-purple-700" 
                        darkColorClass="bg-purple-500/10 text-purple-400"
                     />
                     <MetricBadge 
                        icon={FiStar} 
                        value={section.difficulty} 
                        colorClass="bg-amber-50 text-amber-700 capitalize" 
                        darkColorClass="bg-amber-500/10 text-amber-400 capitalize"
                     />
                     <div className={`w-px h-4 mx-1 ${mode('bg-zinc-200', 'bg-zinc-700')}`}></div>
                     {section.positiveMarking?.enabled && (
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                           <FiPlus className="w-3 h-3"/>{section.positiveMarking.value}
                        </span>
                     )}
                     {section.negativeMarking?.enabled && (
                        <span className="text-[10px] font-mono text-rose-600 dark:text-rose-400 flex items-center gap-1">
                           <FiMinus className="w-3 h-3"/>{section.negativeMarking.value}
                        </span>
                     )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
               onClick={() => setShowSettings(!showSettings)}
               className={`p-2 rounded-lg border transition-all ${showSettings 
                  ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-400' 
                  : mode('bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50', 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700')}`}
               title="Section Settings"
            >
               <FiSettings className="w-4 h-4" />
            </button>
            <button
               onClick={onRemove}
               disabled={section.questions.length > 0}
               className="p-2 rounded-lg border border-transparent text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
               title={section.questions.length > 0 ? "Remove all questions first" : "Delete Section"}
            >
               <FiTrash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onUpdate({ isExpanded: !section.isExpanded })}
              className={`p-2 rounded-lg transition-colors ${mode('text-zinc-400 hover:bg-zinc-100', 'text-zinc-500 hover:bg-zinc-800')}`}
            >
              {section.isExpanded ? <FiChevronDown className="w-5 h-5" /> : <FiChevronRight className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* --- SETTINGS DRAWER (Collapsible) --- */}
        {showSettings && (
          <div className={`mt-2 p-4 rounded-xl border animate-in slide-in-from-top-2 duration-200 ${mode('bg-zinc-50 border-zinc-200', 'bg-zinc-900/50 border-zinc-800')}`}>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* 1. Time & Difficulty */}
                <div className="space-y-4">
                   <div>
                      <label className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-1.5 block">Time Limit (Min)</label>
                      <div className="relative">
                         <FiClock className="absolute left-3 top-2.5 text-zinc-400 w-4 h-4" />
                         <input 
                           type="number" 
                           value={section.timeLimit}
                           onChange={(e) => onUpdate({ timeLimit: parseInt(e.target.value) || 0 })}
                           className={`w-full pl-9 pr-3 py-2 rounded-lg border text-sm font-medium focus:ring-2 focus:ring-rose-500 outline-none transition-all ${mode('bg-white border-zinc-200', 'bg-zinc-800 border-zinc-700')}`} 
                        />
                      </div>
                   </div>
                   <div>
                      <label className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-1.5 block">Difficulty</label>
                      <select 
                        value={section.difficulty}
                        onChange={(e) => onUpdate({ difficulty: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border text-sm font-medium focus:ring-2 focus:ring-rose-500 outline-none ${mode('bg-white border-zinc-200', 'bg-zinc-800 border-zinc-700')}`}
                      >
                         <option value="easy">Easy</option>
                         <option value="medium">Medium</option>
                         <option value="hard">Hard</option>
                         <option value="expert">Expert</option>
                      </select>
                   </div>
                </div>

                {/* 2. Positive Marking Card */}
                <div className={`p-3 rounded-lg border ${section.positiveMarking?.enabled ? mode('bg-emerald-50/50 border-emerald-200', 'bg-emerald-900/10 border-emerald-800') : mode('bg-white border-zinc-200 opacity-60', 'bg-zinc-800 border-zinc-700 opacity-60')}`}>
                   <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                         <div className={`p-1.5 rounded-md ${mode('bg-emerald-100 text-emerald-600', 'bg-emerald-900 text-emerald-400')}`}><FiPlus className="w-3.5 h-3.5"/></div>
                         <span className={`text-xs font-bold ${mode('text-zinc-700', 'text-zinc-200')}`}>Positive</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={section.positiveMarking?.enabled}
                        onChange={() => onUpdate({ positiveMarking: { ...section.positiveMarking, enabled: !section.positiveMarking?.enabled }})}
                        className="accent-emerald-500 w-4 h-4 cursor-pointer"
                      />
                   </div>
                   {section.positiveMarking?.enabled && (
                      <div className="grid grid-cols-2 gap-2">
                         <input 
                           type="number" step="0.5" 
                           value={section.positiveMarking?.value}
                           onChange={(e) => onUpdate({ positiveMarking: { ...section.positiveMarking, value: parseFloat(e.target.value) }})}
                           className={`w-full px-2 py-1.5 text-xs rounded border ${mode('bg-white border-emerald-200', 'bg-zinc-900 border-emerald-900')}`}
                        />
                         <select 
                           value={section.positiveMarking?.type}
                           onChange={(e) => onUpdate({ positiveMarking: { ...section.positiveMarking, type: e.target.value }})}
                           className={`w-full px-2 py-1.5 text-xs rounded border ${mode('bg-white border-emerald-200', 'bg-zinc-900 border-emerald-900')}`}
                        >
                           <option value="fixed">Fixed</option>
                           <option value="fractional">Fraction</option>
                        </select>
                      </div>
                   )}
                </div>

                {/* 3. Negative Marking Card */}
                <div className={`p-3 rounded-lg border ${section.negativeMarking?.enabled ? mode('bg-rose-50/50 border-rose-200', 'bg-rose-900/10 border-rose-800') : mode('bg-white border-zinc-200 opacity-60', 'bg-zinc-800 border-zinc-700 opacity-60')}`}>
                   <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                         <div className={`p-1.5 rounded-md ${mode('bg-rose-100 text-rose-600', 'bg-rose-900 text-rose-400')}`}><FiMinus className="w-3.5 h-3.5"/></div>
                         <span className={`text-xs font-bold ${mode('text-zinc-700', 'text-zinc-200')}`}>Negative</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={section.negativeMarking?.enabled}
                        onChange={() => onUpdate({ negativeMarking: { ...section.negativeMarking, enabled: !section.negativeMarking?.enabled }})}
                        className="accent-rose-500 w-4 h-4 cursor-pointer"
                      />
                   </div>
                   {section.negativeMarking?.enabled && (
                      <div className="grid grid-cols-2 gap-2">
                         <input 
                           type="number" step="0.25" 
                           value={section.negativeMarking?.value}
                           onChange={(e) => onUpdate({ negativeMarking: { ...section.negativeMarking, value: parseFloat(e.target.value) }})}
                           className={`w-full px-2 py-1.5 text-xs rounded border ${mode('bg-white border-rose-200', 'bg-zinc-900 border-rose-900')}`}
                        />
                         <select 
                           value={section.negativeMarking?.type}
                           onChange={(e) => onUpdate({ negativeMarking: { ...section.negativeMarking, type: e.target.value }})}
                           className={`w-full px-2 py-1.5 text-xs rounded border ${mode('bg-white border-rose-200', 'bg-zinc-900 border-rose-900')}`}
                        >
                           <option value="fixed">Fixed</option>
                           <option value="fractional">Fraction</option>
                        </select>
                      </div>
                   )}
                </div>
             </div>
          </div>
        )}

        {/* --- ACTION BAR (Only when expanded or always visible on desktop) --- */}
        {section.isExpanded && (
          <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
             <button 
               onClick={() => setShowAIGenerator(true)}
               className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border shadow-sm transition-all whitespace-nowrap ${mode('bg-white border-zinc-200 text-zinc-700 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700', 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-purple-700 hover:bg-purple-900/20 hover:text-purple-300')}`}
             >
                <FiZap className="w-4 h-4" /> AI Generator
             </button>
             <button 
               onClick={() => setShowJSONUpload(true)}
               className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border shadow-sm transition-all whitespace-nowrap ${mode('bg-white border-zinc-200 text-zinc-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700', 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-emerald-700 hover:bg-emerald-900/20 hover:text-emerald-300')}`}
             >
                <FiUpload className="w-4 h-4" /> Import JSON
             </button>
             <button 
               onClick={onAddQuestion}
               className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm hover:opacity-90 transition-all whitespace-nowrap ml-auto"
             >
                <FiPlus className="w-4 h-4" /> Add Question
             </button>
          </div>
        )}
      </div>

      {/* --- CONTENT AREA --- */}
      {section.isExpanded && (
        <div className={`border-t ${mode('border-zinc-200 bg-zinc-50/50', 'border-zinc-800 bg-zinc-900/30')}`}>
          {section.questions.length === 0 ? (
             <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                <div className={`w-16 h-16 mb-4 rounded-full flex items-center justify-center ${mode('bg-zinc-100', 'bg-zinc-800')}`}>
                   <FiLayers className={`w-6 h-6 ${mode('text-zinc-400', 'text-zinc-500')}`} />
                </div>
                <h4 className={`text-base font-semibold ${mode('text-zinc-900', 'text-white')}`}>No questions yet</h4>
                <p className={`text-sm mt-1 mb-6 max-w-sm ${mode('text-zinc-500', 'text-zinc-400')}`}>
                   Get started by adding a question manually, or let AI generate a quiz for you.
                </p>
                <div className="flex gap-3">
                   <button onClick={() => setShowAIGenerator(true)} className="text-sm text-rose-600 font-medium hover:underline">Use AI Generator</button>
                   <span className="text-zinc-300">|</span>
                   <button onClick={onAddQuestion} className="text-sm text-zinc-600 dark:text-zinc-400 font-medium hover:underline">Add Manually</button>
                </div>
             </div>
          ) : (
            <div className="p-4 sm:p-5 space-y-4">
               {section.questions.map((question, qIndex) => (
                  <div key={question.id || qIndex} className="relative group/question">
                     <span className={`absolute left-0 top-6 -translate-x-full pr-3 text-xs font-mono hidden xl:block ${mode('text-zinc-400', 'text-zinc-600')}`}>
                        Q{(qIndex + 1).toString().padStart(2, '0')}
                     </span>
                     <QuestionCard
                        question={question}
                        questionIndex={qIndex}
                        onUpdate={(updates) => onUpdateQuestion(question.id, updates)}
                        onRemove={() => onRemoveQuestion(question.id)}
                     />
                  </div>
               ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showAIGenerator && <AIGenerator onQuestionsGenerated={handleAIGeneratedQuestions} onClose={() => setShowAIGenerator(false)} />}
      {showJSONUpload && <JSONUpload onQuestionsUploaded={handleJSONUploadedQuestions} onClose={() => setShowJSONUpload(false)} />}
      
    </div>
  );
};

export default SectionCard;